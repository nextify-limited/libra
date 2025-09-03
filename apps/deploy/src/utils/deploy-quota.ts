/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * deploy-quota.ts
 * Copyright (C) 2025 Nextify Limited
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 */

import { getDbForHono } from '@libra/db'
import { subscriptionLimit } from '@libra/db/schema/project-schema'
import { and, eq, sql } from 'drizzle-orm'
import { tryCatch } from '@libra/common'
import { createLogger } from './logger'
import type { Bindings } from '../types'
import { checkRefreshAndDeductQuota } from '@libra/auth/utils/subscription-limits/annual-quota-refresh'

// Plan types for quota management
const PLAN_TYPES = {
  FREE: 'FREE',
} as const

type SubscriptionLimitRecord = {
  id: string
  organizationId: string
  stripeCustomerId: string | null
  planName: string
  planId: string
  aiNums: number
  enhanceNums: number
  uploadLimit: number
  seats: number
  projectNums: number
  deployLimit: number
  isActive: boolean
  periodStart: string
  periodEnd: string
  createdAt: string | null
  updatedAt: string | null
}

/**
 * Check and update deploy usage for workflow (queue-based)
 * Migrated from original deploy service
 */
export async function checkAndUpdateDeployUsageForWorkflow(
  organizationId: string,
  env: Bindings
): Promise<boolean> {
  const logger = createLogger(env)
  let db: any = null

  try {
    logger.info('Deploy quota deduction started', {
      organizationId,
      operation: 'deploy_quota_deduction'
    })

    // PRIORITY: Try annual subscription quota refresh and deduction first
    try {
      const annualResult = await checkRefreshAndDeductQuota(organizationId, 'deployLimit', 1)
      if (annualResult.success) {
        logger.info('Deploy quota deducted from annual subscription', {
          organizationId,
          remaining: annualResult.remaining,
          operation: 'deploy_quota_deduction'
        })
        return true
      }
    } catch (error) {
      logger.warn('Annual quota refresh check failed, falling back to regular logic', {
        organizationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'deploy_quota_deduction'
      })
    }

    db = await getDbForHono({ env })

    // Get current time from database to ensure UTC consistency across all operations
    const { rows } = await db.execute(sql`SELECT NOW() as "dbNow"`)
    const [{ dbNow }] = rows as [{ dbNow: string | Date }]
    const now = typeof dbNow === 'string' ? new Date(dbNow) : dbNow

    // SECONDARY PATH: Try FREE plan deduction
    // Users should consume their free quota before paid quota
    const freeDeductionResult = await handleFreePlanDeployDeduction(db, organizationId, now)
    if (freeDeductionResult) {
      logger.info('Deploy quota deducted from FREE plan', {
        organizationId,
        operation: 'deploy_quota_deduction'
      })
      return true
    }

    // FALLBACK PATH: Try paid plan deduction only if FREE plan exhausted
    // This ensures paid users can continue deploying after free quota is used
    const paidDeductionResult = await attemptPaidPlanDeployDeduction(db, organizationId, now)
    if (paidDeductionResult.success) {
      logger.info('Deploy quota deducted from paid plan', {
        organizationId,
        planName: paidDeductionResult.planName,
        remaining: paidDeductionResult.remaining,
        operation: 'deploy_quota_deduction'
      })
      return true
    }

    // No quota available in either FREE or paid plans
    logger.warn('Deploy quota exhausted in all plans', {
      organizationId,
      operation: 'deploy_quota_deduction'
    })
    return false

  } catch (error) {
    logger.error('Deploy quota deduction failed', {
      organizationId,
      error: error instanceof Error ? error.message : String(error),
      operation: 'deploy_quota_deduction'
    })
    return false
  } finally {
    // Clean up database connection
    if (db?.$client) {
      try {
        await db.$client.end()
      } catch (cleanupError) {
        logger.error('Database cleanup failed', {
          organizationId,
          error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError)
        })
      }
    }
  }
}

/**
 * Attempt FREE plan deploy deduction with atomic operation
 * Migrated from original deploy service
 */
async function handleFreePlanDeployDeduction(
  db: any,
  organizationId: string,
  now: Date
): Promise<boolean> {
  const [result, error] = await tryCatch(async () => {
    // First, get the FREE plan limit to check availability
    const freeLimits = await db.select().from(subscriptionLimit)
      .where(
        and(
          eq(subscriptionLimit.organizationId, organizationId),
          eq(subscriptionLimit.planName, PLAN_TYPES.FREE),
          eq(subscriptionLimit.isActive, true)
        )
      )
      .limit(1)

    if (freeLimits.length === 0) {
      return false
    }

    const freeLimit = freeLimits[0] as SubscriptionLimitRecord

    return await db.transaction(async (tx: any) => {
      // Check if plan has expired
      const periodEnd = new Date(freeLimit.periodEnd)
      const nowTimestamp = now.getTime()
      const periodEndTimestamp = periodEnd.getTime()

      if (nowTimestamp > periodEndTimestamp) {
        // Plan expired - this is expected behavior, not an error
        return false
      }

      // Check if there's available quota
      if (freeLimit.deployLimit <= 0) {
        // No quota available - this is expected behavior, not an error
        return false
      }

      // Perform atomic deduction within transaction
      const updated = await tx
        .update(subscriptionLimit)
        .set({
          deployLimit: freeLimit.deployLimit - 1,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(subscriptionLimit.id, freeLimit.id))
        .returning({ remaining: subscriptionLimit.deployLimit })

      return updated.length > 0
    })
  })

  if (error) {
    const logger = createLogger({ LOG_LEVEL: 'error' } as any)
    logger.error('FREE plan deploy deduction failed', {
      organizationId,
      error: error.message,
      operation: 'deploy_quota_deduction'
    })
    return false
  }

  return result || false
}

/**
 * Attempt paid plan deploy deduction with atomic operation
 * Fast path that tries to deduct from any active paid plan
 * Migrated from original deploy service
 */
async function attemptPaidPlanDeployDeduction(
  db: any,
  organizationId: string,
  now: Date
): Promise<{ success: boolean; planName?: string; remaining?: number }> {
  const [result, error] = await tryCatch(async () => {
    // Atomic deduction: decrement deployLimit by 1 where conditions are met
    const paidUpdated = (await db
      .update(subscriptionLimit)
      .set({
        deployLimit: sql`${subscriptionLimit.deployLimit} - 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(subscriptionLimit.organizationId, organizationId),
          sql`${subscriptionLimit.planName} != ${PLAN_TYPES.FREE}`,
          eq(subscriptionLimit.isActive, true),
          sql`(${subscriptionLimit.deployLimit}) > 0`,
          sql`${subscriptionLimit.periodEnd} >= ${new Date(now).toISOString()}` // Ensure plan hasn't expired
        )
      )
      .returning({
        remaining: subscriptionLimit.deployLimit,
        planName: subscriptionLimit.planName,
      })) as { remaining: number; planName: string }[]

    if (paidUpdated.length > 0) {
      const result = paidUpdated[0]
      return {
        success: true,
        planName: result?.planName || 'unknown',
        remaining: result?.remaining || 0,
      }
    }

    return { success: false }
  })

  if (error) {
    const logger = createLogger({ LOG_LEVEL: 'error' } as any)
    logger.error('Paid plan deploy deduction failed', {
      organizationId,
      error: error.message,
      operation: 'deploy_quota_deduction'
    })
    return { success: false }
  }

  return result || { success: false }
}

/**
 * Get current deploy quota for organization
 */
export async function getDeployQuota(
  organizationId: string,
  env: Bindings
): Promise<{
  total: number
  used: number
  remaining: number
  planName: string
  resetDate: string
} | null> {
  const logger = createLogger(env)
  
  try {
    const db = await getDbForHono({ env })
    const now = new Date()

    // Get active subscription limits
    const limits = await db.select().from(subscriptionLimit)
      .where(
        and(
          eq(subscriptionLimit.organizationId, organizationId),
          eq(subscriptionLimit.isActive, true),
          sql`${subscriptionLimit.periodEnd} > ${now.toISOString()}`
        )
      )
      .orderBy(sql`CASE WHEN ${subscriptionLimit.planName} = ${PLAN_TYPES.FREE} THEN 1 ELSE 0 END`)

    if (limits.length === 0) {
      return null
    }

    const limit = limits[0] as SubscriptionLimitRecord
    
    // For simplicity, we'll calculate used based on remaining
    // In a real implementation, you might track usage separately
    const totalQuota = limit.deployLimit
    const remaining = Math.max(0, limit.deployLimit)
    const used = Math.max(0, totalQuota - remaining)

    return {
      total: totalQuota,
      used,
      remaining,
      planName: limit.planName,
      resetDate: limit.periodEnd
    }

  } catch (error) {
    logger.error('Failed to get deploy quota', {
      organizationId,
      error: error instanceof Error ? error.message : String(error)
    })
    return null
  }
}
