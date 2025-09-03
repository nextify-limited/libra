/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * core.ts
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

import { getAuthDb } from '@libra/auth/db'
import { getDbAsync } from '@libra/db'
import { subscriptionLimit } from '@libra/db/schema/project-schema'
import { addMonths } from 'date-fns'
import { and, eq, sql } from 'drizzle-orm'
import { getPlanLimits } from './constants'
import { log, tryCatch, withDatabaseErrorHandling } from '@libra/common'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { checkRefreshAndDeductQuota, checkAndRefreshAnnualQuota } from './annual-quota-refresh'

import {
  PLAN_TYPES,
  type PlanDetails,
  type PlanType,
  type SubscriptionLimitRecord,
  type SubscriptionUsage,
} from './types'
import { createPlanDetails, fetchPlanLimitsWithCache, getLatestActiveLimit } from './utils'

/**
 * Create the default usage return value
 */
function createDefaultUsage(
  freeDetails: PlanDetails | null = null,
  paidDetails: PlanDetails | null = null
): SubscriptionUsage {
  return {
    aiNums: 0,
    aiNumsLimit: 0,
    seats: 0,
    seatsLimit: 0,
    projectNums: 0,
    projectNumsLimit: 0,
    plan: PLAN_TYPES.FREE,
    planDetails: {
      free: freeDetails,
      paid: paidDetails,
    },
  }
}

/**
 * Create or update subscription limits for an organization
 * Uses unique constraints with ON CONFLICT to prevent race conditions
 */
export async function createOrUpdateSubscriptionLimit(
  organizationId: string ,
  stripeCustomerId: string | null,
  plan: string,
  periodStart: Date,
  periodEnd: Date,
  customLimits?: { aiNums?: number; seats?: number; projectNums?: number },
  billingInterval?: 'month' | 'year'
) {
  log.subscription('info', 'Creating/updating subscription limit', {
    organizationId,
    planName: plan,
    stripeCustomerId,
    customLimits,
    operation: 'create_or_update_subscription_limit'
  });

  // Basic parameter validation
  if (!organizationId?.trim()) {
    throw new Error('Organization ID is required')
  }
  if (!plan?.trim()) {
    throw new Error('Plan name is required')
  }
  if (periodEnd <= periodStart) {
    throw new Error('Period end must be after period start')
  }

  const db = await getDbAsync()
  const planType = plan as PlanType
  
  // Validate plan type
  if (!Object.values(PLAN_TYPES).includes(planType)) {
    throw new Error(`Invalid plan type: ${plan}`)
  }

  // Ensure period times are properly handled as UTC
  // This ensures consistency with checkAndUpdateAIMessageUsage time handling
  const utcPeriodStart = new Date(periodStart.getTime())
  const utcPeriodEnd = new Date(periodEnd.getTime())

  const { limits: defaultLimits } = await getPlanLimits(planType)

  const limits = {
    aiNums: customLimits?.aiNums ?? defaultLimits.aiNums,
    seats: customLimits?.seats ?? defaultLimits.seats,
    projectNums: customLimits?.projectNums ?? defaultLimits.projectNums,
  }

  const normalizedPlan = plan

  if (normalizedPlan === PLAN_TYPES.FREE) {
    // For FREE plan: check if active record exists, then update or insert
    // Partial unique index prevents duplicate active records
    const existingActiveRecord = await db
      .select({ id: subscriptionLimit.id })
      .from(subscriptionLimit)
      .where(
        and(
          eq(subscriptionLimit.organizationId, organizationId),
          eq(subscriptionLimit.planName, PLAN_TYPES.FREE),
          eq(subscriptionLimit.isActive, true)
        )
      )
      .limit(1)
      .then((rows) => rows[0])

    if (existingActiveRecord) {
      // Update existing active FREE plan - reset quotas to default values
      // This ensures users get fresh quota when their FREE plan is refreshed
      // Note: projectNums is NOT reset as it represents existing user projects
      await db
        .update(subscriptionLimit)
        .set({
          aiNums: limits.aiNums,
          enhanceNums: limits.aiNums,
          uploadLimit: limits.aiNums,
          deployLimit: limits.aiNums * 2,
          seats: limits.seats,
          periodStart: utcPeriodStart.toISOString(),
          periodEnd: utcPeriodEnd.toISOString(),
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(subscriptionLimit.id, existingActiveRecord.id))

      log.subscription('info', 'Updated FREE plan with quota reset', {
        organizationId,
        planName: PLAN_TYPES.FREE,
        aiNums: limits.aiNums,
        seats: limits.seats,
        operation: 'create_or_update_subscription_limit'
      });
    } else {
      // Insert new FREE plan - partial unique index prevents duplicates
      await db.insert(subscriptionLimit).values({
        organizationId: organizationId,
        stripeCustomerId: stripeCustomerId,
        planName: normalizedPlan,
        planId: `plan_${normalizedPlan.toLowerCase()}`,
        aiNums: limits.aiNums,
        enhanceNums: limits.aiNums,
        uploadLimit: limits.aiNums,
        deployLimit: limits.aiNums * 2,
        seats: limits.seats,
        projectNums: limits.projectNums,
        isActive: true,
        periodStart: utcPeriodStart.toISOString(),
        periodEnd: utcPeriodEnd.toISOString(),
        billingInterval: 'month', // FREE plans are always monthly
        lastQuotaRefresh: null, // FREE plans don't need quota refresh tracking
      })

      log.subscription('info', 'Created new FREE plan', {
        organizationId,
        planName: PLAN_TYPES.FREE,
        operation: 'create_or_update_subscription_limit'
      });
    }
  } else {
    // For paid plans: wrap deactivate + insert in transaction to prevent race conditions
    await db.transaction(async (tx) => {
      // First deactivate existing paid plans
      await tx
        .update(subscriptionLimit)
        .set({ isActive: false, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(
          and(
            eq(subscriptionLimit.organizationId, organizationId),
            eq(subscriptionLimit.isActive, true),
            sql`plan_name != ${PLAN_TYPES.FREE}`
          )
        )

      // Insert new paid plan - unique constraint prevents duplicates
      await tx.insert(subscriptionLimit).values({
        organizationId: organizationId,
        stripeCustomerId: stripeCustomerId,
        planName: normalizedPlan,
        planId: `plan_${normalizedPlan.toLowerCase()}`,
        aiNums: limits.aiNums,
        enhanceNums: limits.aiNums,
        uploadLimit: limits.aiNums,
        deployLimit: limits.aiNums * 2,
        seats: limits.seats,
        projectNums: limits.projectNums,
        isActive: true,
        periodStart: utcPeriodStart.toISOString(),
        periodEnd: utcPeriodEnd.toISOString(),
        billingInterval: billingInterval || 'month',
        lastQuotaRefresh: billingInterval === 'year' ? utcPeriodStart.toISOString() : null,
      })
      // Note: No onConflict needed here because we deactivated existing plans first
      // Partial unique index will prevent duplicate active records
    })

    log.subscription('info', 'Created/updated paid plan', {
      organizationId,
      planName: normalizedPlan,
      operation: 'create_or_update_subscription_limit'
    });
  }

  log.subscription('info', 'Successfully updated subscription limits', {
    organizationId,
    planName: plan,
    aiNums: limits.aiNums,
    seats: limits.seats,
    projectNums: limits.projectNums,
    operation: 'create_or_update_subscription_limit'
  });
}

/**
 * Deduct AI message quota for an organization
 * Priority: FREE plan first, then paid plan
 *
 * @param organizationId - The organization ID to deduct quota from
 * @returns Promise<boolean> - true if deduction successful, false if no quota available
 */
export async function checkAndUpdateAIMessageUsage(organizationId: string): Promise<boolean> {
  const db = await getDbAsync()
  log.subscription('info', 'AI message deduction started', {
    organizationId,
    operation: 'ai_message_deduction'
  });

  // Get current time from database to ensure UTC consistency across all operations
  const { rows } = await db.execute(sql`SELECT NOW() as "dbNow"`)
  const [{ dbNow }] = rows as [{ dbNow: string | Date }]
  const now = typeof dbNow === 'string' ? new Date(dbNow) : dbNow

  // PRIORITY PATH: Try FREE plan deduction first
  // Users should consume their free quota before paid quota
  const freeDeductionResult = await handleFreePlanDeduction(db, organizationId, now)
  if (freeDeductionResult) {
    log.subscription('info', 'AI message deducted from FREE plan', {
      organizationId,
      operation: 'ai_message_deduction'
    });
    return true
  }

  // ANNUAL SUBSCRIPTION CHECK: Check and refresh annual subscription quota if needed
  // This must happen before attempting paid plan deduction
  try {
    const annualRefreshResult = await checkRefreshAndDeductQuota(organizationId, 'aiNums', 1)
    if (annualRefreshResult.success) {
      log.subscription('info', 'AI message deducted from annual subscription (with refresh check)', {
        organizationId,
        remaining: annualRefreshResult.remaining,
        operation: 'ai_message_deduction'
      });
      return true
    }
  } catch (error) {
    log.subscription('warn', 'Annual quota refresh check failed, falling back to regular paid plan', {
      organizationId,
      error: error instanceof Error ? error.message : 'Unknown error',
      operation: 'ai_message_deduction'
    });
  }

  // FALLBACK PATH: Try paid plan deduction only if FREE plan exhausted and annual check failed
  // This ensures paid users can continue using AI after free quota is used
  const paidDeductionResult = await attemptPaidPlanDeduction(db, organizationId, now)
  if (paidDeductionResult.success) {
    log.subscription('info', 'AI message deducted from paid plan', {
      organizationId,
      planName: paidDeductionResult.planName,
      remaining: paidDeductionResult.remaining,
      operation: 'ai_message_deduction'
    });
    return true
  }

  // No quota available in either FREE or paid plans
  log.subscription('warn', 'AI message quota exhausted in all plans', {
    organizationId,
    operation: 'ai_message_deduction'
  });
  return false
}

/**
 * Attempt to deduct from paid plan using atomic operation
 * Fast path for most common scenario
 */
async function attemptPaidPlanDeduction(
  db: any,
  organizationId: string,
  now: Date
): Promise<{ success: boolean; planName?: string; remaining?: number }> {
  const [result, error] = await tryCatch(async () => {
    const paidUpdated = (await db
      .update(subscriptionLimit)
      .set({
        aiNums: sql<number>`(${subscriptionLimit.aiNums}) - 1`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(
        and(
          eq(subscriptionLimit.organizationId, organizationId),
          sql`${subscriptionLimit.planName} != ${PLAN_TYPES.FREE}`,
          eq(subscriptionLimit.isActive, true),
          sql`(${subscriptionLimit.aiNums}) > 0`,
          sql`${subscriptionLimit.periodEnd} >= ${new Date(now).toISOString()}` // Ensure plan hasn't expired
        )
      )
      .returning({
        remaining: subscriptionLimit.aiNums,
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
    log.subscription('error', 'Error in paid plan AI deduction', {
      organizationId,
      operation: 'ai_message_deduction'
    }, error as Error);
    return { success: false }
  }

  return result
}

/**
 * Attempt to deduct enhance quota from paid plan using atomic operation
 * Fast path for most common scenario
 */
async function attemptPaidPlanEnhanceDeduction(
  db: any,
  organizationId: string,
  now: Date
): Promise<{ success: boolean; planName?: string; remaining?: number }> {
  const [result, error] = await tryCatch(async () => {
    const paidUpdated = (await db
      .update(subscriptionLimit)
      .set({
        enhanceNums: sql<number>`(${subscriptionLimit.enhanceNums}) - 1`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(
        and(
          eq(subscriptionLimit.organizationId, organizationId),
          sql`${subscriptionLimit.planName} != ${PLAN_TYPES.FREE}`,
          eq(subscriptionLimit.isActive, true),
          sql`(${subscriptionLimit.enhanceNums}) > 0`,
          sql`${subscriptionLimit.periodEnd} >= ${new Date(now).toISOString()}` // Ensure plan hasn't expired
        )
      )
      .returning({
        remaining: subscriptionLimit.enhanceNums,
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
    log.subscription('error', 'Error in paid plan enhance deduction', {
      organizationId,
      operation: 'enhance_deduction'
    }, error as Error);
    return { success: false }
  }

  return result
}

/**
 * Deduct enhance quota for an organization
 * Priority: FREE plan first, then paid plan
 *
 * @param organizationId - The organization ID to deduct quota from
 * @returns Promise<boolean> - true if deduction successful, false if no quota available
 */
export async function checkAndUpdateEnhanceUsage(organizationId: string): Promise<boolean> {
  const db = await getDbAsync()
  log.subscription('info', 'Enhance deduction started', {
    organizationId,
    operation: 'enhance_deduction'
  });

  // Get current time from database to ensure UTC consistency across all operations
  const { rows } = await db.execute(sql`SELECT NOW() as "dbNow"`)
  const [{ dbNow }] = rows as [{ dbNow: string | Date }]
  const now = typeof dbNow === 'string' ? new Date(dbNow) : dbNow

  // PRIORITY PATH: Try FREE plan deduction first
  // Users should consume their free quota before paid quota
  const freeDeductionResult = await handleFreePlanEnhanceDeduction(db, organizationId, now)
  if (freeDeductionResult) {
    log.subscription('info', 'Enhance deducted from FREE plan', {
      organizationId,
      operation: 'enhance_deduction'
    });
    return true
  }

  // ANNUAL SUBSCRIPTION CHECK: Check and refresh annual subscription quota if needed
  // This must happen before attempting paid plan deduction
  try {
    const annualRefreshResult = await checkRefreshAndDeductQuota(organizationId, 'enhanceNums', 1)
    if (annualRefreshResult.success) {
      log.subscription('info', 'Enhance deducted from annual subscription (with refresh check)', {
        organizationId,
        remaining: annualRefreshResult.remaining,
        operation: 'enhance_deduction'
      });
      return true
    }
  } catch (error) {
    log.subscription('warn', 'Annual quota refresh check failed, falling back to regular paid plan', {
      organizationId,
      error: error instanceof Error ? error.message : 'Unknown error',
      operation: 'enhance_deduction'
    });
  }

  // FALLBACK PATH: Try paid plan deduction only if FREE plan exhausted and annual check failed
  // This ensures paid users can continue using enhance features after free quota is used
  const paidDeductionResult = await attemptPaidPlanEnhanceDeduction(db, organizationId, now)
  if (paidDeductionResult.success) {
    log.subscription('info', 'Enhance deducted from paid plan', {
      organizationId,
      planName: paidDeductionResult.planName,
      remaining: paidDeductionResult.remaining,
      operation: 'enhance_deduction'
    });
    return true
  }

  // No quota available in either FREE or paid plans
  log.subscription('warn', 'Enhance quota exhausted in all plans', {
    organizationId,
    operation: 'enhance_deduction'
  });
  return false
}

/**
 * Handle FREE plan deduction with transaction for data consistency
 * Slow path that ensures atomic refresh + deduction
 */
async function handleFreePlanDeduction(
  db: any,
  organizationId: string,
  now: Date
): Promise<boolean> {
  const [result, error] = await tryCatch(async () => {
    // Fetch the FREE plan record outside transaction
    const freeLimit = (await db
      .select()
      .from(subscriptionLimit)
      .where(
        and(
          eq(subscriptionLimit.organizationId, organizationId),
          eq(subscriptionLimit.planName, PLAN_TYPES.FREE),
          eq(subscriptionLimit.isActive, true)
        )
      )
      .limit(1)
      .then((rows: any[]) => rows[0])) as SubscriptionLimitRecord | undefined

    if (!freeLimit) {
      log.subscription('error', 'No FREE plan found for AI deduction', {
        organizationId,
        operation: 'ai_message_deduction'
      });
      return false
    }

    return await db.transaction(async (tx: any) => {

      // Check if FREE plan needs refresh (only on period expiry, not quota exhaustion)
      const periodEndDate = new Date(freeLimit.periodEnd)

      // Ensure we have proper Date objects for comparison
      const nowDate = new Date(now)
      const nowTimestamp = nowDate.getTime()
      const periodEndTimestamp = periodEndDate.getTime()

      log.subscription('info', 'FREE plan period expiry check', {
        organizationId,
        operation: 'ai_message_deduction',
        now: nowDate.toISOString(),
        nowTimestamp,
        periodEnd: freeLimit.periodEnd,
        periodEndTimestamp,
        isExpired: nowTimestamp > periodEndTimestamp
      })

      if (nowTimestamp > periodEndTimestamp) {
        log.subscription('info', 'FREE plan expired, refreshing', {
          organizationId,
          periodEnd: freeLimit.periodEnd,
          operation: 'ai_message_deduction'
        });

        const { limits: freePlanLimits } = await getPlanLimits(PLAN_TYPES.FREE)

        // Use loop-based approach to ensure new period covers current time
        // This handles month boundary edge cases more reliably than differenceInMonths
        let newPeriodStart = new Date(freeLimit.periodStart)
        while (addMonths(newPeriodStart, 1).getTime() <= nowTimestamp) {
          newPeriodStart = addMonths(newPeriodStart, 1)
        }

        // Align to UTC midnight to prevent time drift across billing cycles
        newPeriodStart = new Date(
          Date.UTC(
            newPeriodStart.getUTCFullYear(),
            newPeriodStart.getUTCMonth(),
            newPeriodStart.getUTCDate(),
            0,
            0,
            0,
            0
          )
        )

        const nextPeriodEnd = addMonths(newPeriodStart, 1)

        log.subscription('info', 'FREE plan period calculation', {
          organizationId,
          originalStart: freeLimit.periodStart,
          newStart: newPeriodStart.toISOString(),
          newEnd: nextPeriodEnd.toISOString(),
          operation: 'ai_message_deduction'
        });

        // Refresh the FREE plan with new quota and immediately deduct 1 for this request
        // This ensures the refresh operation is immediately successful
        // Note: projectNums is preserved to maintain user's actual project count
        await tx
          .update(subscriptionLimit)
          .set({
            aiNums: freePlanLimits.aiNums - 1, // Refresh and deduct in one operation
            enhanceNums: freePlanLimits.aiNums,
            uploadLimit: freePlanLimits.aiNums,
            deployLimit: freePlanLimits.aiNums * 2,
            seats: freePlanLimits.seats,
            // projectNums: keep existing value, don't reset
            periodStart: newPeriodStart.toISOString(),
            periodEnd: nextPeriodEnd.toISOString(),
          })
          .where(eq(subscriptionLimit.id, freeLimit.id))

        log.subscription('info', 'FREE plan refreshed and AI deducted', {
          organizationId,
          remaining: freePlanLimits.aiNums - 1,
          operation: 'ai_message_deduction'
        });
        return true // Refresh and deduction completed successfully
      }

      // If we reach here, the period hasn't expired yet, check current quota
      const currentQuota = freeLimit.aiNums
      if (currentQuota <= 0) {
        log.subscription('warn', 'FREE plan AI quota exhausted', {
          organizationId,
          currentQuota,
          operation: 'ai_message_deduction'
        });
        return false
      }

      // Perform atomic deduction within the transaction
      const freeUpdated = (await tx
        .update(subscriptionLimit)
        .set({
          aiNums: sql<number>`(${subscriptionLimit.aiNums}) - 1`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(
          and(
            eq(subscriptionLimit.id, freeLimit.id),
            eq(subscriptionLimit.isActive, true),
            sql`(${subscriptionLimit.aiNums}) > 0` // Double-check quota availability
          )
        )
        .returning({ remaining: subscriptionLimit.aiNums })) as { remaining: number }[]

      if (freeUpdated.length > 0) {
        const remaining = freeUpdated[0]?.remaining || 0
        log.subscription('info', 'AI deducted from FREE plan', {
          organizationId,
          remaining,
          operation: 'ai_message_deduction'
        });
        return true
      }

      // This should rarely happen due to our checks above
      log.subscription('warn', 'FREE plan AI deduction failed - concurrent request', {
        organizationId,
        operation: 'ai_message_deduction'
      });
      return false
    })
  })

  if (error) {
    log.subscription('error', 'Error in FREE plan AI deduction', {
      organizationId,
      operation: 'ai_message_deduction'
    }, error as Error);
    return false
  }

  return result
}

/**
 * Cancel paid subscription limits for an organization
 * This function only cancels paid plans and preserves the FREE plan
 * to ensure users retain basic access after subscription cancellation
 */
export async function cancelSubscriptionLimits(organizationId: string) {
  console.log(`Cancelling paid subscription limits for organization ${organizationId}`)

  const db = await getDbAsync()
  await db
    .update(subscriptionLimit)
    .set({ isActive: false })
    .where(
      and(
        eq(subscriptionLimit.organizationId, organizationId),
        eq(subscriptionLimit.isActive, true),
        sql`${subscriptionLimit.planName} != ${PLAN_TYPES.FREE}`
      )
    )

  console.log(
    `Successfully cancelled paid subscription limits for org ${organizationId}, FREE plan preserved`
  )
}

/**
 * Get current resource usage for an organization
 */
export async function getSubscriptionUsage(organizationId: string): Promise<SubscriptionUsage> {
  return await withDatabaseErrorHandling(async () => {
    const db = await getDbAsync()

    try {
      // PRIORITY: Check and refresh annual subscription quota if needed
      // This ensures quota is up-to-date when users view their dashboard
      try {
        await checkAndRefreshAnnualQuota(organizationId)
      } catch (error) {
        log.subscription('warn', 'Annual quota refresh check failed during usage query', {
          organizationId,
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'getSubscriptionUsage'
        })
      }

      const limits = (await db
        .select()
        .from(subscriptionLimit)
        .where(
          and(
            eq(subscriptionLimit.organizationId, organizationId),
            eq(subscriptionLimit.isActive, true)
          )
        )) as SubscriptionLimitRecord[]

      if (limits.length === 0) {
        return createDefaultUsage()
      }

  const authDb = await getAuthDb()

  // Get current time for expiry check
  const { rows } = await db.execute(sql`SELECT NOW() as "dbNow"`)
  const [{ dbNow }] = rows as [{ dbNow: string | Date }]
  const now = typeof dbNow === 'string' ? new Date(dbNow) : dbNow

  let freeLimit = getLatestActiveLimit(limits, 'free')
  const paidLimit = getLatestActiveLimit(limits, 'paid')

  // Check if FREE plan has expired and needs refresh
  if (freeLimit) {
    const periodEnd = new Date(freeLimit.periodEnd)
    const nowTimestamp = now.getTime()
    const periodEndTimestamp = periodEnd.getTime()
    
    if (nowTimestamp > periodEndTimestamp) {
      log.subscription('info', 'FREE plan expired during usage query, refreshing', {
        organizationId,
        periodEnd: freeLimit.periodEnd,
        operation: 'getSubscriptionUsage'
      });

      // Get FREE plan default limits
      const { limits: freePlanLimits } = await getPlanLimits(PLAN_TYPES.FREE)

      // Calculate new period
      let newPeriodStart = new Date(freeLimit.periodStart)
      while (addMonths(newPeriodStart, 1).getTime() <= nowTimestamp) {
        newPeriodStart = addMonths(newPeriodStart, 1)
      }

      // Align to UTC midnight
      newPeriodStart = new Date(
        Date.UTC(
          newPeriodStart.getUTCFullYear(),
          newPeriodStart.getUTCMonth(),
          newPeriodStart.getUTCDate(),
          0,
          0,
          0,
          0
        )
      )

      const nextPeriodEnd = addMonths(newPeriodStart, 1)

      // Refresh the FREE plan quota
      // Note: updatedAt will be automatically updated by Drizzle's .$onUpdate() mechanism
      await db
        .update(subscriptionLimit)
        .set({
          aiNums: freePlanLimits.aiNums,
          enhanceNums: freePlanLimits.aiNums,
          uploadLimit: freePlanLimits.aiNums,
          deployLimit: freePlanLimits.aiNums * 2,
          seats: freePlanLimits.seats,
          // projectNums: keep existing value, don't reset
          periodStart: newPeriodStart.toISOString(),
          periodEnd: nextPeriodEnd.toISOString(),
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(subscriptionLimit.id, freeLimit.id))

      // Update the local freeLimit object with refreshed values
      freeLimit = {
        ...freeLimit,
        aiNums: freePlanLimits.aiNums,
        enhanceNums: freePlanLimits.aiNums,
        uploadLimit: freePlanLimits.aiNums,
        deployLimit: freePlanLimits.aiNums * 2,
        seats: freePlanLimits.seats,
        periodStart: newPeriodStart.toISOString(),
        periodEnd: nextPeriodEnd.toISOString(),
      }

      log.subscription('info', 'FREE plan refreshed during usage query', {
        organizationId,
        newAiNums: freePlanLimits.aiNums,
        newPeriodEnd: nextPeriodEnd.toISOString(),
        operation: 'getSubscriptionUsage'
      });
    }
  }

  const planNamesToQuery = new Set<string>()
  if (freeLimit) planNamesToQuery.add(PLAN_TYPES.FREE)
  if (paidLimit) planNamesToQuery.add(paidLimit.planName)

  const planLimitPromises = Array.from(planNamesToQuery).map(async (planName) => {
    const result = await fetchPlanLimitsWithCache(planName, authDb)
    return [planName, result] as const
  })

  const planLimitResults = await Promise.all(planLimitPromises)
  const planLimitMap = new Map(planLimitResults)

  let freeDetails: PlanDetails | null = null
  if (freeLimit) {
    const freePlanResult = planLimitMap.get(PLAN_TYPES.FREE)
    if (!freePlanResult) {
      throw new Error(`Failed to get plan limits for ${PLAN_TYPES.FREE}`)
    }
    freeDetails = createPlanDetails(freeLimit, freePlanResult.limits, freePlanResult.source)
  }

  let paidDetails: PlanDetails | null = null
  if (paidLimit) {
    const paidPlanName = paidLimit.planName
    const paidPlanResult = planLimitMap.get(paidPlanName)
    if (!paidPlanResult) {
      throw new Error(`Failed to get plan limits for ${paidPlanName}`)
    }
    paidDetails = createPlanDetails(paidLimit, paidPlanResult.limits, paidPlanResult.source)
  }

  const primaryLimit = paidLimit || freeLimit

  if (!primaryLimit) {
    console.error(
      `Unexpected: no primary limit found for organization ${organizationId} despite having ${limits.length} active limits`
    )
    return createDefaultUsage(freeDetails, paidDetails)
  }

  const primaryPlanName = paidLimit ? paidLimit.planName : PLAN_TYPES.FREE

  const primaryPlanResult = planLimitMap.get(primaryPlanName)
  if (!primaryPlanResult) {
    throw new Error(`Failed to get primary plan limits for ${primaryPlanName}`)
  }

      return {
        aiNums: primaryLimit.aiNums,
        aiNumsLimit: primaryPlanResult.limits.aiNums,
        seats: primaryLimit.seats,
        seatsLimit: primaryPlanResult.limits.seats,
        projectNums: primaryLimit.projectNums,
        projectNumsLimit: primaryPlanResult.limits.projectNums,
        plan: primaryLimit.planName,
        periodEnd: primaryLimit.periodEnd,
        planDetails: {
          free: freeDetails,
          paid: paidDetails,
        },
      }
    } finally {
      // Clean up database connection
      const [cloudflareContext, contextError] = await tryCatch(async () =>
        getCloudflareContext({ async: true })
      )
      if (!contextError && cloudflareContext?.ctx) {
        cloudflareContext.ctx.waitUntil(db.$client.end())
      }
    }
  }, 'getSubscriptionUsage')
}

/**
 * Handle FREE plan enhance deduction with transaction for data consistency
 * Slow path that ensures atomic refresh + deduction
 */
async function handleFreePlanEnhanceDeduction(
  db: any,
  organizationId: string,
  now: Date
): Promise<boolean> {
  const [result, error] = await tryCatch(async () => {
    // Fetch the FREE plan record outside transaction
    const freeLimit = (await db
      .select()
      .from(subscriptionLimit)
      .where(
        and(
          eq(subscriptionLimit.organizationId, organizationId),
          eq(subscriptionLimit.planName, PLAN_TYPES.FREE),
          eq(subscriptionLimit.isActive, true)
        )
      )
      .limit(1)
      .then((rows: any[]) => rows[0])) as SubscriptionLimitRecord | undefined

    if (!freeLimit) {
      log.subscription('error', 'No FREE plan found for enhance deduction', {
        organizationId,
        operation: 'enhance_deduction'
      });
      return false
    }

    return await db.transaction(async (tx: any) => {

      // Check if FREE plan needs refresh (only on period expiry, not quota exhaustion)
      const periodEndDate = new Date(freeLimit.periodEnd)

      // Ensure we have proper Date objects for comparison
      const nowDate = new Date(now)
      const nowTimestamp = nowDate.getTime()
      const periodEndTimestamp = periodEndDate.getTime()

      log.subscription('info', 'FREE plan period expiry check', {
        organizationId,
        operation: 'enhance_usage_deduction',
        now: nowDate.toISOString(),
        nowTimestamp,
        periodEnd: freeLimit.periodEnd,
        periodEndTimestamp,
        isExpired: nowTimestamp > periodEndTimestamp
      })

      if (nowTimestamp > periodEndTimestamp) {
        log.subscription('info', 'FREE plan expired, refreshing', {
          organizationId,
          periodEnd: freeLimit.periodEnd,
          operation: 'enhance_usage_deduction'
        })

        const { limits: freePlanLimits } = await getPlanLimits(PLAN_TYPES.FREE)

        // Use loop-based approach to ensure new period covers current time
        // This handles month boundary edge cases more reliably than differenceInMonths
        let newPeriodStart = new Date(freeLimit.periodStart)
        while (addMonths(newPeriodStart, 1).getTime() <= nowTimestamp) {
          newPeriodStart = addMonths(newPeriodStart, 1)
        }

        // Align to UTC midnight to prevent time drift across billing cycles
        newPeriodStart = new Date(
          Date.UTC(
            newPeriodStart.getUTCFullYear(),
            newPeriodStart.getUTCMonth(),
            newPeriodStart.getUTCDate(),
            0,
            0,
            0,
            0
          )
        )

        const nextPeriodEnd = addMonths(newPeriodStart, 1)

        log.subscription('info', 'FREE plan period calculation', {
          organizationId,
          originalStart: freeLimit.periodStart,
          newStart: newPeriodStart.toISOString(),
          newEnd: nextPeriodEnd.toISOString(),
          operation: 'enhance_usage_deduction'
        })

        // Refresh the FREE plan with new quota and immediately deduct 1 for this request
        // This ensures the refresh operation is immediately successful
        // Note: projectNums is preserved to maintain user's actual project count
        await tx
          .update(subscriptionLimit)
          .set({
            aiNums: freePlanLimits.aiNums,
            enhanceNums: freePlanLimits.aiNums - 1, // Refresh and deduct in one operation
            uploadLimit: freePlanLimits.aiNums,
            deployLimit: freePlanLimits.aiNums * 2,
            seats: freePlanLimits.seats,
            // projectNums: keep existing value, don't reset
            periodStart: newPeriodStart.toISOString(),
            periodEnd: nextPeriodEnd.toISOString(),
          })
          .where(eq(subscriptionLimit.id, freeLimit.id))

        log.subscription('info', 'FREE plan refreshed and enhance deducted', {
          organizationId,
          remaining: freePlanLimits.aiNums - 1,
          operation: 'enhance_usage_deduction'
        })
        return true // Refresh and deduction completed successfully
      }

      // If we reach here, the period hasn't expired yet, check current quota
      const currentQuota = freeLimit.enhanceNums
      if (currentQuota <= 0) {
        console.warn(
          `FREE plan enhance quota exhausted for ${organizationId}, must wait for next period`
        )
        return false
      }

      // Perform atomic deduction within the transaction
      const freeUpdated = (await tx
        .update(subscriptionLimit)
        .set({
          enhanceNums: sql<number>`(${subscriptionLimit.enhanceNums}) - 1`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(
          and(
            eq(subscriptionLimit.id, freeLimit.id),
            eq(subscriptionLimit.isActive, true),
            sql`(${subscriptionLimit.enhanceNums}) > 0` // Double-check quota availability
          )
        )
        .returning({ remaining: subscriptionLimit.enhanceNums })) as { remaining: number }[]

      if (freeUpdated.length > 0) {
        const remaining = freeUpdated[0]?.remaining || 0
        log.subscription('info', 'Enhance deducted from FREE plan', {
          organizationId,
          remaining,
          operation: 'enhance_usage_deduction'
        })
        return true
      }

      // This should rarely happen due to our checks above
      console.warn(
        `FREE plan enhance deduction failed for ${organizationId} - quota may have been consumed by concurrent request`
      )
      return false
    })
  })

  if (error) {
    console.error(`Error in FREE plan enhance deduction for ${organizationId}:`, error)
    return false
  }

  return result
}

/**
 * Attempt to deduct project quota from paid plan using atomic operation
 * Fast path for most common scenario
 */
async function attemptPaidPlanProjectDeduction(
  db: any,
  organizationId: string,
  now: Date
): Promise<{ success: boolean; planName?: string; remaining?: number }> {
  const [result, error] = await tryCatch(async () => {
    const paidUpdated = (await db
      .update(subscriptionLimit)
      .set({
        projectNums: sql<number>`(${subscriptionLimit.projectNums}) - 1`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(
        and(
          eq(subscriptionLimit.organizationId, organizationId),
          sql`${subscriptionLimit.planName} != ${PLAN_TYPES.FREE}`,
          eq(subscriptionLimit.isActive, true),
          sql`(${subscriptionLimit.projectNums}) > 0`,
          sql`${subscriptionLimit.periodEnd} >= ${new Date(now).toISOString()}` // Ensure plan hasn't expired
        )
      )
      .returning({
        remaining: subscriptionLimit.projectNums,
        planName: subscriptionLimit.planName,
      })) as {
      remaining: number
      planName: string
    }[]

    if (paidUpdated.length > 0) {
      const result = paidUpdated[0]
      if (result) {
        const { remaining, planName } = result
        return { success: true, planName, remaining }
      }
    }

    return { success: false }
  })

  if (error) {
    console.error(`Error in paid plan project deduction for ${organizationId}:`, error)
    return { success: false }
  }

  return result
}

/**
 * Handle FREE plan project deduction with transaction for data consistency
 * Slow path that ensures atomic refresh + deduction
 */
async function handleFreePlanProjectDeduction(
  db: any,
  organizationId: string,
  now: Date
): Promise<boolean> {
  const [result, error] = await tryCatch(async () => {
    // Fetch the FREE plan record outside transaction
    const freeLimit = (await db
      .select()
      .from(subscriptionLimit)
      .where(
        and(
          eq(subscriptionLimit.organizationId, organizationId),
          eq(subscriptionLimit.planName, PLAN_TYPES.FREE),
          eq(subscriptionLimit.isActive, true)
        )
      )
      .limit(1)
      .then((rows: any[]) => rows[0])) as SubscriptionLimitRecord | undefined

    if (!freeLimit) {
      log.subscription('error', 'No FREE plan found for project deduction', {
        organizationId,
        operation: 'project_deduction'
      });
      return false
    }

    return await db.transaction(async (tx: any) => {

      // Check if FREE plan needs refresh (only on period expiry, not quota exhaustion)
      const periodEndDate = new Date(freeLimit.periodEnd)

      // Ensure we have proper Date objects for comparison
      const nowDate = new Date(now)
      const nowTimestamp = nowDate.getTime()
      const periodEndTimestamp = periodEndDate.getTime()

      log.subscription('info', 'FREE plan period expiry check', {
        organizationId,
        operation: 'project_usage_deduction',
        now: nowDate.toISOString(),
        nowTimestamp,
        periodEnd: freeLimit.periodEnd,
        periodEndTimestamp,
        isExpired: nowTimestamp > periodEndTimestamp
      })

      if (nowTimestamp > periodEndTimestamp) {
        log.subscription('info', 'FREE plan expired, refreshing', {
          organizationId,
          periodEnd: freeLimit.periodEnd,
          operation: 'project_usage_deduction'
        })

        const { limits: freePlanLimits } = await getPlanLimits(PLAN_TYPES.FREE)

        // Use loop-based approach to ensure new period covers current time
        // This handles month boundary edge cases more reliably than differenceInMonths
        let newPeriodStart = new Date(freeLimit.periodStart)
        while (addMonths(newPeriodStart, 1).getTime() <= nowTimestamp) {
          newPeriodStart = addMonths(newPeriodStart, 1)
        }

        // Align to UTC midnight to prevent time drift across billing cycles
        newPeriodStart = new Date(
          Date.UTC(
            newPeriodStart.getUTCFullYear(),
            newPeriodStart.getUTCMonth(),
            newPeriodStart.getUTCDate(),
            0,
            0,
            0,
            0
          )
        )

        const nextPeriodEnd = addMonths(newPeriodStart, 1)

        log.subscription('info', 'FREE plan period calculation', {
          organizationId,
          originalStart: freeLimit.periodStart,
          newStart: newPeriodStart.toISOString(),
          newEnd: nextPeriodEnd.toISOString(),
          operation: 'project_usage_deduction'
        })

        // Refresh the FREE plan with new quota and immediately deduct 1 for this request
        // This ensures the refresh operation is immediately successful
        // Note: projectNums represents remaining quota, so we refresh to default then deduct 1
        await tx
          .update(subscriptionLimit)
          .set({
            aiNums: freePlanLimits.aiNums,
            enhanceNums: freePlanLimits.aiNums,
            uploadLimit: freePlanLimits.aiNums,
            deployLimit: freePlanLimits.aiNums * 2,
            seats: freePlanLimits.seats,
            projectNums: freePlanLimits.projectNums - 1, // Refresh quota and deduct 1 for current project creation
            periodStart: newPeriodStart.toISOString(),
            periodEnd: nextPeriodEnd.toISOString(),
          })
          .where(eq(subscriptionLimit.id, freeLimit.id))

        log.subscription('info', 'FREE plan refreshed and project deducted', {
          organizationId,
          newProjectNums: freePlanLimits.projectNums - 1,
          operation: 'project_usage_deduction'
        })
        return true // Refresh and deduction completed successfully
      }

      // If we reach here, the period hasn't expired yet, check current quota
      const currentQuota = freeLimit.projectNums
      if (currentQuota <= 0) {
        console.warn(
          `FREE plan project quota exhausted for ${organizationId}, must wait for next period`
        )
        return false
      }

      // Perform atomic deduction within the transaction
      const freeUpdated = (await tx
        .update(subscriptionLimit)
        .set({
          projectNums: sql<number>`(${subscriptionLimit.projectNums}) - 1`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(
          and(
            eq(subscriptionLimit.id, freeLimit.id),
            eq(subscriptionLimit.isActive, true),
            sql`(${subscriptionLimit.projectNums}) > 0` // Double-check quota availability
          )
        )
        .returning({ remaining: subscriptionLimit.projectNums })) as { remaining: number }[]

      if (freeUpdated.length > 0) {
        const remaining = freeUpdated[0]?.remaining || 0
        log.subscription('info', 'Project deducted from FREE plan', {
          organizationId,
          remaining,
          operation: 'project_usage_deduction'
        })
        return true
      }

      // This should rarely happen due to our checks above
      console.warn(
        `FREE plan project deduction failed for ${organizationId} - quota may have been consumed by concurrent request`
      )
      return false
    })
  })
  
  if (error) {
    console.error(`Error in FREE plan project deduction for ${organizationId}:`, error)
    return false
  }
  
  return result
}

/**
 * Get combined project quota from both FREE and PAID plans
 * Provides total available quota across all active plans
 *
 * @param organizationId - The organization ID to get quota for
 * @returns Promise<CombinedProjectQuota> - Combined quota information
 */
export async function getCombinedProjectQuota(organizationId: string): Promise<{
  projectNums: number
  projectNumsLimit: number
  plan: string
  periodEnd?: string
  planDetails: {
    free: { projectNums: number; projectNumsLimit: number; plan: string; periodEnd: string } | null
    paid: { projectNums: number; projectNumsLimit: number; plan: string; periodEnd: string } | null
  }
}> {
  log.subscription('info', 'Getting combined project quota', {
    organizationId,
    operation: 'get_combined_quota'
  });

  const [usage, error] = await tryCatch(async () => {
    // Get subscription usage which includes both FREE and PAID plan details
    return await getSubscriptionUsage(organizationId)
  })
  
  if (error) {
    console.error(
      `[Combined Quota] Failed to get combined quota for organization ${organizationId}:`,
      error
    )
    throw error
  }
  
  const freeDetails = usage.planDetails.free
  const paidDetails = usage.planDetails.paid

  // Calculate combined quota from both plans
  const combinedProjectNums = (freeDetails?.projectNums || 0) + (paidDetails?.projectNums || 0)
  const combinedProjectNumsLimit =
    (freeDetails?.projectNumsLimit || 0) + (paidDetails?.projectNumsLimit || 0)

    // Determine primary plan for display (paid plan takes precedence)
    const primaryPlan = paidDetails?.plan || freeDetails?.plan || PLAN_TYPES.FREE
    const primaryPeriodEnd = paidDetails?.periodEnd || freeDetails?.periodEnd

    console.log(
      `[Combined Quota] Organization ${organizationId}: Combined quota ${combinedProjectNums}/${combinedProjectNumsLimit} ` +
        `(FREE: ${freeDetails?.projectNums || 0}/${freeDetails?.projectNumsLimit || 0}, ` +
        `PAID: ${paidDetails?.projectNums || 0}/${paidDetails?.projectNumsLimit || 0})`
    )

    return {
      projectNums: combinedProjectNums,
      projectNumsLimit: combinedProjectNumsLimit,
      plan: primaryPlan,
      ...(primaryPeriodEnd ? { periodEnd: primaryPeriodEnd } : {}),
      planDetails: {
        free: freeDetails
          ? {
              projectNums: freeDetails.projectNums,
              projectNumsLimit: freeDetails.projectNumsLimit,
              plan: freeDetails.plan,
              periodEnd: freeDetails.periodEnd,
            }
          : null,
        paid: paidDetails
          ? {
              projectNums: paidDetails.projectNums,
              projectNumsLimit: paidDetails.projectNumsLimit,
              plan: paidDetails.plan,
              periodEnd: paidDetails.periodEnd,
            }
          : null,
      },
    }
}

/**
 * Restore project quota when a project is deleted
 * Prioritizes FREE plan restoration over PAID plan restoration for optimal quota utilization
 * Uses database transactions to ensure atomicity and prevent race conditions
 *
 * Rationale for FREE-first approach:
 * - FREE plans typically have lower limits (1 project), so restoration is more likely to succeed
 * - If FREE restoration fails due to limits, the user likely has multiple projects and should use PAID quota
 * - This approach maximizes quota utilization efficiency and reduces unnecessary PAID quota consumption
 *
 * @param organizationId - The organization ID to restore quota for
 * @returns Promise<{ success: boolean; restoredTo?: 'PAID' | 'FREE'; planName?: string; error?: string }>
 */
export async function restoreProjectQuotaOnDeletion(organizationId: string): Promise<{
  success: boolean
  restoredTo?: 'PAID' | 'FREE'
  planName?: string
  error?: string
}> {
  log.subscription('info', 'Starting project quota restoration', {
    organizationId,
    operation: 'restore_project_quota'
  });

  if (!organizationId?.trim()) {
    const error = 'Organization ID is required for quota restoration'
    log.subscription('error', 'Quota restoration error', {
      organizationId,
      operation: 'restore_project_quota',
      error: error
    });
    return { success: false, error }
  }

  const db = await getDbAsync()
  if (!db) {
    const error = 'Database connection is not available'
    log.subscription('error', 'Quota restoration error', {
      organizationId,
      operation: 'restore_project_quota',
      error: error
    });
    return { success: false, error }
  }

  const [result, error] = await tryCatch(async () => {
    return await db.transaction(async (tx: any) => {
      console.log(`[Quota Restoration] Starting transaction for organization: ${organizationId}`)

      // Step 1: Try to restore to FREE plan first (prioritized for optimal quota utilization)
      const freeLimits = (await tx
        .select()
        .from(subscriptionLimit)
        .where(
          and(
            eq(subscriptionLimit.organizationId, organizationId),
            eq(subscriptionLimit.planName, PLAN_TYPES.FREE),
            eq(subscriptionLimit.isActive, true)
          )
        )
        .limit(1)
        .then((rows: any[]) => rows[0])) as SubscriptionLimitRecord | undefined

      if (freeLimits) {
        console.log(
          `[Quota Restoration] Found active FREE plan for organization: ${organizationId}`
        )

        // Get FREE plan limits to validate restoration
        const { limits: freePlanLimits } = await getPlanLimits(PLAN_TYPES.FREE)
        const newFreeProjectNums = freeLimits.projectNums + 1

        if (newFreeProjectNums <= freePlanLimits.projectNums) {
          // Safe to restore to FREE plan
          const freeUpdated = await tx
            .update(subscriptionLimit)
            .set({
              projectNums: sql<number>`(${subscriptionLimit.projectNums}) + 1`,
            })
            .where(
              and(
                eq(subscriptionLimit.id, freeLimits.id),
                eq(subscriptionLimit.isActive, true),
                sql`(${subscriptionLimit.projectNums}) < ${freePlanLimits.projectNums}` // Double-check limit
              )
            )
            .returning({ projectNums: subscriptionLimit.projectNums })

          if (freeUpdated.length > 0) {
            const result = freeUpdated[0]
            console.log(
              `[Quota Restoration] Successfully restored quota to FREE plan: new quota: ${result?.projectNums}/${freePlanLimits.projectNums} for organization: ${organizationId}`
            )
            return {
              success: true,
              restoredTo: 'FREE' as const,
              planName: PLAN_TYPES.FREE,
            }
          }

          console.warn(
            `[Quota Restoration] FREE plan restoration failed (concurrent update detected), falling back to PAID plan for organization: ${organizationId}`
          )
        } else {
          console.warn(
            `[Quota Restoration] FREE plan restoration would exceed limit: ${newFreeProjectNums}/${freePlanLimits.projectNums} for organization: ${organizationId}, falling back to PAID plan`
          )
        }
      } else {
        console.log(
          `[Quota Restoration] No active FREE plan found for organization: ${organizationId}, checking PAID plan`
        )
      }

      // Step 2: Fallback to PAID plan restoration
      const paidLimits = (await tx
        .select()
        .from(subscriptionLimit)
        .where(
          and(
            eq(subscriptionLimit.organizationId, organizationId),
            sql`${subscriptionLimit.planName} != ${PLAN_TYPES.FREE}`,
            eq(subscriptionLimit.isActive, true)
          )
        )
        .limit(1)
        .then((rows: any[]) => rows[0])) as SubscriptionLimitRecord | undefined

      if (!paidLimits) {
        const error = `No active PAID plan found for organization: ${organizationId}`
        log.subscription('error', 'Quota restoration error', {
      organizationId,
      operation: 'restore_project_quota',
      error: error
    });
        return { success: false, error }
      }

      console.log(
        `[Quota Restoration] Found active PAID plan: ${paidLimits.planName} for organization: ${organizationId}`
      )

      // Get plan limits to validate restoration won't exceed limit
      const { limits: planLimits } = await getPlanLimits(paidLimits.planName as PlanType)
      const newProjectNums = paidLimits.projectNums + 1

      if (newProjectNums <= planLimits.projectNums) {
        // Safe to restore to PAID plan
        const paidUpdated = await tx
          .update(subscriptionLimit)
          .set({
            projectNums: sql<number>`(${subscriptionLimit.projectNums}) + 1`,
          })
          .where(
            and(
              eq(subscriptionLimit.id, paidLimits.id),
              eq(subscriptionLimit.isActive, true),
              sql`(${subscriptionLimit.projectNums}) < ${planLimits.projectNums}` // Double-check limit
            )
          )
          .returning({
            projectNums: subscriptionLimit.projectNums,
            planName: subscriptionLimit.planName,
          })

        if (paidUpdated.length > 0) {
          const result = paidUpdated[0]
          console.log(
            `[Quota Restoration] Successfully restored quota to PAID plan: ${result?.planName}, new quota: ${result?.projectNums}/${planLimits.projectNums} for organization: ${organizationId}`
          )
          return {
            success: true,
            restoredTo: 'PAID' as const,
            planName: result?.planName,
          }
        }

        console.warn(
          `[Quota Restoration] PAID plan restoration failed (concurrent update detected) for organization: ${organizationId}`
        )
      } else {
        const error = `PAID plan restoration would exceed limit: ${newProjectNums}/${planLimits.projectNums} for organization: ${organizationId}`
        log.subscription('error', 'Quota restoration error', {
      organizationId,
      operation: 'restore_project_quota',
      error: error
    });
        return { success: false, error }
      }

      // If we reach here, restoration failed for unknown reasons
      const error = `Quota restoration failed for unknown reasons for organization: ${organizationId}`
      log.subscription('error', 'Quota restoration error', {
      organizationId,
      operation: 'restore_project_quota',
      error: error
    });
      return { success: false, error }
    })
  })
  
  if (error) {
    const errorMessage = `Transaction failed during quota restoration for organization ${organizationId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error(`[Quota Restoration] ${errorMessage}`, error)
    return { success: false, error: errorMessage }
  }
  
  return result
}

/**
 * Deduct project quota for an organization
 * Priority: FREE plan first, then paid plan
 *
 * @param organizationId - The organization ID to deduct quota from
 * @returns Promise<boolean> - true if deduction successful, false if no quota available
 */
export async function checkAndUpdateProjectUsage(organizationId: string): Promise<boolean> {
  const db = await getDbAsync()
  log.subscription('info', 'Project deduction started', {
    organizationId,
    operation: 'project_usage_deduction'
  })

  // Get current time from database to ensure UTC consistency across all operations
  const { rows } = await db.execute(sql`SELECT NOW() as "dbNow"`)
  const [{ dbNow }] = rows as [{ dbNow: string | Date }]
  const now = typeof dbNow === 'string' ? new Date(dbNow) : dbNow

  // PRIORITY PATH: Try FREE plan deduction first
  // Users should consume their free quota before paid quota
  const freeDeductionResult = await handleFreePlanProjectDeduction(db, organizationId, now)
  if (freeDeductionResult) {
    log.subscription('info', 'Project deducted from FREE plan', {
      organizationId,
      operation: 'project_usage_deduction'
    })
    return true
  }

  // ANNUAL SUBSCRIPTION CHECK: Check and refresh annual subscription quota if needed
  // This must happen before attempting paid plan deduction
  try {
    const annualRefreshResult = await checkRefreshAndDeductQuota(organizationId, 'projectNums', 1)
    if (annualRefreshResult.success) {
      log.subscription('info', 'Project deducted from annual subscription (with refresh check)', {
        organizationId,
        remaining: annualRefreshResult.remaining,
        operation: 'project_usage_deduction'
      })
      return true
    }
  } catch (error) {
    log.subscription('warn', 'Annual quota refresh check failed, falling back to regular paid plan', {
      organizationId,
      error: error instanceof Error ? error.message : 'Unknown error',
      operation: 'project_usage_deduction'
    })
  }

  // FALLBACK PATH: Try paid plan deduction only if FREE plan exhausted and annual check failed
  // This ensures paid users can continue creating projects after free quota is used
  const paidDeductionResult = await attemptPaidPlanProjectDeduction(db, organizationId, now)
  if (paidDeductionResult.success) {
    log.subscription('info', 'Project deducted from paid plan', {
      organizationId,
      planName: paidDeductionResult.planName,
      remaining: paidDeductionResult.remaining,
      operation: 'project_usage_deduction'
    })
    return true
  }

  // No quota available in either FREE or paid plans
  log.subscription('warn', 'Project quota exhausted in all plans', {
    organizationId,
    operation: 'project_usage_deduction'
  })
  return false
}

/**
 * Deduct deploy quota for an organization
 * Priority: FREE plan first, then paid plan
 *
 * @param organizationId - The organization ID to deduct quota from
 * @returns Promise<boolean> - true if deduction successful, false if no quota available
 */
export async function checkAndUpdateDeployUsage(organizationId: string): Promise<boolean> {
  const db = await getDbAsync()
  log.subscription('info', 'Deploy quota deduction started', {
    organizationId,
    operation: 'deploy_quota_deduction'
  });

  // Get current time from database to ensure UTC consistency across all operations
  const { rows } = await db.execute(sql`SELECT NOW() as "dbNow"`)
  const [{ dbNow }] = rows as [{ dbNow: string | Date }]
  const now = typeof dbNow === 'string' ? new Date(dbNow) : dbNow

  // PRIORITY PATH: Try FREE plan deduction first
  // Users should consume their free quota before paid quota
  const freeDeductionResult = await handleFreePlanDeployDeduction(db, organizationId, now)
  if (freeDeductionResult) {
    log.subscription('info', 'Deploy quota deducted from FREE plan', {
      organizationId,
      operation: 'deploy_quota_deduction'
    });
    return true
  }

  // FALLBACK PATH: Try paid plan deduction only if FREE plan exhausted
  // This ensures paid users can continue deploying after free quota is used
  const paidDeductionResult = await attemptPaidPlanDeployDeduction(db, organizationId, now)
  if (paidDeductionResult.success) {
    log.subscription('info', 'Deploy quota deducted from paid plan', {
      organizationId,
      planName: paidDeductionResult.planName,
      remaining: paidDeductionResult.remaining,
      operation: 'deploy_quota_deduction'
    });
    return true
  }

  // No quota available in either FREE or paid plans
  log.subscription('warn', 'Deploy quota exhausted in all plans', {
    organizationId,
    operation: 'deploy_quota_deduction'
  });
  return false
}

/**
 * Attempt to deduct deploy quota from paid plan using atomic operation
 * Fast path for most common scenario
 */
async function attemptPaidPlanDeployDeduction(
  db: any,
  organizationId: string,
  now: Date
): Promise<{ success: boolean; planName?: string; remaining?: number }> {
  const [result, error] = await tryCatch(async () => {
    const paidUpdated = (await db
      .update(subscriptionLimit)
      .set({
        deployLimit: sql<number>`(${subscriptionLimit.deployLimit}) - 1`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
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
    log.subscription('error', 'Error in paid plan deploy deduction', {
      organizationId,
      operation: 'deploy_quota_deduction'
    }, error as Error);
    return { success: false }
  }

  return result
}

/**
 * Handle FREE plan deploy deduction with transaction for data consistency
 * Slow path that ensures atomic deduction
 */
async function handleFreePlanDeployDeduction(
  db: any,
  organizationId: string,
  now: Date
): Promise<boolean> {
  const [result, error] = await tryCatch(async () => {
    // Fetch the FREE plan record outside transaction
    const freeLimit = (await db
      .select()
      .from(subscriptionLimit)
      .where(
        and(
          eq(subscriptionLimit.organizationId, organizationId),
          eq(subscriptionLimit.planName, PLAN_TYPES.FREE),
          eq(subscriptionLimit.isActive, true)
        )
      )
      .limit(1)
      .then((rows: any[]) => rows[0])) as SubscriptionLimitRecord | undefined

    if (!freeLimit) {
      log.subscription('warn', 'No active FREE plan found for deploy deduction', {
        organizationId,
        operation: 'deploy_quota_deduction'
      });
      return false
    }

    return await db.transaction(async (tx: any) => {

      // Check if plan has expired
      const periodEnd = new Date(freeLimit.periodEnd)
      const nowTimestamp = now.getTime()
      const periodEndTimestamp = periodEnd.getTime()

      if (nowTimestamp > periodEndTimestamp) {
        log.subscription('warn', 'FREE plan expired, cannot deduct deploy quota', {
          organizationId,
          periodEnd: freeLimit.periodEnd,
          now: now.toISOString(),
          operation: 'deploy_quota_deduction'
        });
        return false
      }

      // Check if there's available quota
      if (freeLimit.deployLimit <= 0) {
        log.subscription('warn', 'No deploy quota available in FREE plan', {
          organizationId,
          remaining: freeLimit.deployLimit,
          operation: 'deploy_quota_deduction'
        });
        return false
      }

      // Perform atomic deduction within the transaction
      const freeUpdated = (await tx
        .update(subscriptionLimit)
        .set({
          deployLimit: sql<number>`(${subscriptionLimit.deployLimit}) - 1`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(
          and(
            eq(subscriptionLimit.id, freeLimit.id),
            eq(subscriptionLimit.isActive, true),
            sql`(${subscriptionLimit.deployLimit}) > 0` // Double-check quota availability
          )
        )
        .returning({ remaining: subscriptionLimit.deployLimit })) as { remaining: number }[]

      if (freeUpdated.length > 0) {
        const remaining = freeUpdated[0]?.remaining || 0
        log.subscription('info', 'Deploy quota deducted from FREE plan', {
          organizationId,
          remaining,
          operation: 'deploy_quota_deduction'
        });
        return true
      }

      log.subscription('warn', 'Failed to deduct deploy quota from FREE plan', {
        organizationId,
        operation: 'deploy_quota_deduction'
      });
      return false
    })
  })

  if (error) {
    log.subscription('error', 'Error in FREE plan deploy deduction', {
      organizationId,
      operation: 'deploy_quota_deduction'
    }, error as Error);
    return false
  }

  return result || false
}
