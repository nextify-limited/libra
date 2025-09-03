/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * annual-quota-refresh.ts
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

import { addMonths } from 'date-fns'
import { and, eq, sql } from 'drizzle-orm'
import { log } from '@libra/common'
import { getDbAsync } from '@libra/db'
import { subscriptionLimit } from '@libra/db/schema/project-schema'
import { getPlanLimits } from './constants'
import { PLAN_TYPES, type PlanType } from './types'

// Type-safe column mapping for quota types
const quotaColumnMap = {
  aiNums: subscriptionLimit.aiNums,
  enhanceNums: subscriptionLimit.enhanceNums,
  uploadLimit: subscriptionLimit.uploadLimit,
  deployLimit: subscriptionLimit.deployLimit,
  projectNums: subscriptionLimit.projectNums,
} as const

/**
 * Resolve quota limit with fallback rules
 * Centralizes business logic for quota limit calculation
 */
function resolveQuotaLimit(
  limits: any,
  quotaType: keyof typeof quotaColumnMap,
  fallbackValue?: number
): number {
  switch (quotaType) {
    case 'aiNums':
      return limits.aiNums || 0
    case 'enhanceNums':
      return limits.enhanceNums ?? limits.aiNums ?? 0
    case 'uploadLimit':
      return limits.uploadLimit ?? limits.aiNums ?? 0
    case 'deployLimit':
      return limits.deployLimit ?? (limits.aiNums ? limits.aiNums * 2 : 0)
    case 'projectNums':
      return limits.projectNums ?? fallbackValue ?? 0
    default:
      return 0
  }
}

/**
 * Check if annual subscription quota needs monthly refresh
 * @param organizationId Organization ID
 * @returns Promise<boolean> Whether quota was refreshed
 */
export async function checkAndRefreshAnnualQuota(organizationId: string): Promise<boolean> {
  if (!organizationId?.trim()) {
    return false
  }

  try {
    const db = await getDbAsync()

    // Get current time from database to ensure consistency across instances
    const { rows } = await db.execute(sql`SELECT NOW() as "dbNow"`)
    const [{ dbNow }] = rows as [{ dbNow: string | Date }]
    const now = typeof dbNow === 'string' ? new Date(dbNow) : dbNow

    // Find active annual subscription that hasn't expired
    const annualSubscription = await db.query.subscriptionLimit.findFirst({
      where: and(
        eq(subscriptionLimit.organizationId, organizationId),
        eq(subscriptionLimit.isActive, true),
        eq(subscriptionLimit.billingInterval, 'year'),
        sql`${subscriptionLimit.planName} != ${PLAN_TYPES.FREE}`,
        sql`${subscriptionLimit.periodEnd} >= ${now}` // Not expired
      )
    })

    if (!annualSubscription) {
      // No annual subscription found
      return false
    }

    // Check if quota refresh is needed
    const needsRefresh = shouldRefreshQuota(annualSubscription, now)
    
    if (!needsRefresh) {
      return false
    }

    log.subscription('info', 'Annual subscription quota refresh needed', {
      organizationId,
      planName: annualSubscription.planName,
      lastQuotaRefresh: annualSubscription.lastQuotaRefresh,
      operation: 'annual_quota_refresh'
    })

    // Perform quota refresh
    await refreshAnnualSubscriptionQuota(annualSubscription, now)
    
    return true
  } catch (error) {
    log.subscription('error', 'Failed to check/refresh annual quota', {
      organizationId,
      error: error instanceof Error ? error.message : 'Unknown error',
      operation: 'annual_quota_refresh'
    })
    return false
  }
}

/**
 * Determine if quota refresh is needed for annual subscription
 * Uses addMonths for more accurate "one month later" semantics
 */
function shouldRefreshQuota(subscription: any, now: Date): boolean {
  // If no lastQuotaRefresh, this is a new subscription - refresh needed
  if (!subscription.lastQuotaRefresh) {
    return true
  }

  const lastRefresh = new Date(subscription.lastQuotaRefresh)
  const nextRefreshTime = addMonths(lastRefresh, 1)

  // Refresh if current time is at or after the next refresh time
  return now >= nextRefreshTime
}

/**
 * Refresh quota for annual subscription
 */
async function refreshAnnualSubscriptionQuota(subscription: any, now: Date): Promise<void> {
  const db = await getDbAsync()
  
  // Get plan limits
  const { limits } = await getPlanLimits(subscription.planName as any)
  
  await db.transaction(async (tx: any) => {
    // Refresh quota while preserving projectNums (existing projects)
    await tx
      .update(subscriptionLimit)
      .set({
        aiNums: limits.aiNums,
        enhanceNums: limits.aiNums,
        uploadLimit: limits.aiNums,
        deployLimit: limits.aiNums * 2,
        seats: limits.seats,
        // Keep existing projectNums - don't reset user's project count
        lastQuotaRefresh: now.toISOString(),
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(subscriptionLimit.id, subscription.id))

    log.subscription('info', 'Annual subscription quota refreshed', {
      organizationId: subscription.organizationId,
      planName: subscription.planName,
      refreshedQuota: {
        aiNums: limits.aiNums,
        enhanceNums: limits.aiNums,
        uploadLimit: limits.aiNums,
        deployLimit: limits.aiNums * 2,
        seats: limits.seats
      },
      lastQuotaRefresh: now.toISOString(),
      operation: 'annual_quota_refresh'
    })
  })
}

/**
 * Check and refresh quota with deduction for immediate use
 * This is used when a quota operation needs to happen immediately after refresh
 * Uses optimistic locking to prevent race conditions in concurrent refresh scenarios
 */
export async function checkRefreshAndDeductQuota(
  organizationId: string,
  quotaType: 'aiNums' | 'enhanceNums' | 'uploadLimit' | 'deployLimit' | 'projectNums',
  deductAmount = 1,
  maxRetries = 3
): Promise<{ success: boolean; remaining?: number; reason?: 'insufficient' | 'concurrency' | 'not_found' | 'expired' | 'invalid' }> {
  if (!organizationId?.trim()) {
    return { success: false, reason: 'invalid' }
  }

  if (deductAmount <= 0 || !Number.isSafeInteger(deductAmount)) {
    log.subscription('warn', 'Invalid deduct amount for annual quota', {
      organizationId,
      quotaType,
      deductAmount,
      operation: 'annual_quota_refresh_deduct'
    })
    return { success: false, reason: 'invalid' }
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const db = await getDbAsync()

      // Get current time from database to ensure consistency across instances
      const { rows } = await db.execute(sql`SELECT NOW() as "dbNow"`)
      const [{ dbNow }] = rows as [{ dbNow: string | Date }]
      const now = typeof dbNow === 'string' ? new Date(dbNow) : dbNow

      // Find active annual subscription with current values that hasn't expired
      const annualSubscription = await db.query.subscriptionLimit.findFirst({
        where: and(
          eq(subscriptionLimit.organizationId, organizationId),
          eq(subscriptionLimit.isActive, true),
          eq(subscriptionLimit.billingInterval, 'year'),
          sql`${subscriptionLimit.planName} != ${PLAN_TYPES.FREE}`,
          sql`${subscriptionLimit.periodEnd} >= ${now}` // Not expired
        )
      })

      if (!annualSubscription) {
        return { success: false, reason: 'not_found' }
      }

      // Check if quota refresh is needed
      const needsRefresh = shouldRefreshQuota(annualSubscription, now)
      const lastRefreshSnapshot = annualSubscription.lastQuotaRefresh

      // Get plan limits outside transaction to reduce lock time
      const planLimitsResult = needsRefresh ? await getPlanLimits(annualSubscription.planName as PlanType) : null
      const limits = planLimitsResult?.limits

      // Fast fail if refresh is needed but limits are unavailable
      if (needsRefresh && !limits) {
        log.subscription('error', 'Plan limits unavailable for annual quota refresh', {
          organizationId,
          planName: annualSubscription.planName,
          quotaType,
          operation: 'annual_quota_refresh_deduct'
        })
        return { success: false, reason: 'not_found' }
      }

      // Define consistency guard for both refresh and non-refresh paths
      const consistencyGuard = lastRefreshSnapshot
        ? eq(subscriptionLimit.lastQuotaRefresh, lastRefreshSnapshot)
        : sql`${subscriptionLimit.lastQuotaRefresh} IS NULL`

      return await db.transaction(async (tx) => {
        if (needsRefresh && limits) {
          // Use optimistic locking: only refresh if lastQuotaRefresh hasn't changed
          // IMPORTANT: Refresh will reset all quota types to plan limits, potentially
          // overwriting concurrent deductions that happened before this refresh.
          // This is semantically acceptable as refresh represents a new billing period.

          // Simplified refresh: since we already determined refresh is needed, just do it
          // No complex CASE logic - directly reset to plan limits and deduct
          // Use centralized quota limit resolution
          const refreshUpdate: any = {
            aiNums: quotaType === 'aiNums'
              ? Math.max(0, resolveQuotaLimit(limits, 'aiNums') - deductAmount)
              : resolveQuotaLimit(limits, 'aiNums'),
            enhanceNums: quotaType === 'enhanceNums'
              ? Math.max(0, resolveQuotaLimit(limits, 'enhanceNums') - deductAmount)
              : resolveQuotaLimit(limits, 'enhanceNums'),
            uploadLimit: quotaType === 'uploadLimit'
              ? Math.max(0, resolveQuotaLimit(limits, 'uploadLimit') - deductAmount)
              : resolveQuotaLimit(limits, 'uploadLimit'),
            deployLimit: quotaType === 'deployLimit'
              ? Math.max(0, resolveQuotaLimit(limits, 'deployLimit') - deductAmount)
              : resolveQuotaLimit(limits, 'deployLimit'),
            seats: limits.seats,
            lastQuotaRefresh: now,
            updatedAt: now,
          }

          // Handle projectNums specially - don't reset, only deduct if sufficient
          if (quotaType === 'projectNums') {
            refreshUpdate.projectNums = sql`GREATEST(0, COALESCE(${quotaColumnMap.projectNums}, 0) - ${deductAmount})`
          }
          // For other quota types, keep existing projectNums unchanged

          // Build WHERE conditions for refresh path
          const refreshWhereConditions = [
            eq(subscriptionLimit.id, annualSubscription.id),
            eq(subscriptionLimit.isActive, true),
            eq(subscriptionLimit.planName, annualSubscription.planName),
            eq(subscriptionLimit.billingInterval, 'year'),
            sql`${subscriptionLimit.periodEnd} >= ${now}`,
            consistencyGuard
          ]

          // Add projectNums protection if needed
          if (quotaType === 'projectNums') {
            refreshWhereConditions.push(sql`COALESCE(${subscriptionLimit.projectNums}, 0) >= ${deductAmount}`)
          }

          const result = await tx
            .update(subscriptionLimit)
            .set(refreshUpdate)
            .where(and(...refreshWhereConditions))
            .returning()

          if (result.length === 0) {
            // Check if it's optimistic lock failure or quota insufficient
            const check = await tx.query.subscriptionLimit.findFirst({
              where: eq(subscriptionLimit.id, annualSubscription.id),
            })

            if (!check) {
              return { success: false, reason: 'not_found' }
            }

            const currentRefresh = check.lastQuotaRefresh?.toString()
            const snapshotRefresh = lastRefreshSnapshot?.toString()

            if (currentRefresh !== snapshotRefresh) {
              // Optimistic lock failed, retry
              log.subscription('warn', 'Annual quota refresh optimistic lock failed, retrying', {
                organizationId,
                quotaType,
                attempt: attempt + 1,
                operation: 'annual_quota_refresh_deduct'
              })
              throw new Error('Optimistic lock failed')
            }

            // Check if it's projectNums quota insufficient
            if (quotaType === 'projectNums') {
              const currentProjectNums = check.projectNums || 0
              if (currentProjectNums < deductAmount) {
                log.subscription('info', 'Annual quota refresh failed: insufficient projectNums', {
                  organizationId,
                  quotaType,
                  currentProjectNums,
                  deductAmount,
                  operation: 'annual_quota_refresh_deduct'
                })
                return { success: false, reason: 'insufficient' }
              }
            }

            // Check specific reasons for 0 rows update
            const currentSnapshot = {
              planName: check.planName,
              isActive: check.isActive,
              billingInterval: check.billingInterval,
              periodEnd: check.periodEnd
            }

            log.subscription('warn', 'Annual quota refresh failed: subscription state changed', {
              organizationId,
              quotaType,
              originalSnapshot: {
                planName: annualSubscription.planName,
                isActive: annualSubscription.isActive,
                billingInterval: annualSubscription.billingInterval,
                periodEnd: annualSubscription.periodEnd
              },
              currentSnapshot,
              operation: 'annual_quota_refresh_deduct'
            })

            // Determine specific reason
            if (!currentSnapshot.isActive) {
              return { success: false, reason: 'expired' }
            }
            if (currentSnapshot.planName !== annualSubscription.planName) {
              return { success: false, reason: 'not_found' }
            }
            if (currentSnapshot.billingInterval !== 'year') {
              return { success: false, reason: 'not_found' }
            }
            if (new Date(currentSnapshot.periodEnd) < now) {
              return { success: false, reason: 'expired' }
            }

            // Unknown reason
            return { success: false, reason: 'expired' }
          }

          // Since we simplified the refresh logic, if we reach here and needsRefresh was true,
          // and the update succeeded, then refresh definitely happened
          const wasRefreshed = true

          // Get the remaining quota from the updated record
          const updatedRecord = result[0]
          const remaining = updatedRecord ? updatedRecord[quotaType] : 0

          log.subscription('info', 'Annual quota processed with race condition protection', {
            organizationId,
            planName: annualSubscription.planName,
            quotaType,
            deductAmount,
            remaining,
            wasRefreshed,
            attempt: attempt + 1,
            operation: 'annual_quota_refresh_deduct'
          })

          return {
            success: true,
            remaining
          }
        }

        // Just deduct from existing quota with atomic database operation
        const result = await tx
          .update(subscriptionLimit)
          .set({
            [quotaType]: sql`GREATEST(0, COALESCE(${quotaColumnMap[quotaType]}, 0) - ${deductAmount})` as any,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(and(
            eq(subscriptionLimit.id, annualSubscription.id),
            eq(subscriptionLimit.isActive, true),
            eq(subscriptionLimit.planName, annualSubscription.planName),
            eq(subscriptionLimit.billingInterval, 'year'),
            sql`${subscriptionLimit.periodEnd} >= ${now}`,
            consistencyGuard,
            sql`COALESCE(${quotaColumnMap[quotaType]}, 0) >= ${deductAmount}` // Ensure quota still available
          ))
          .returning()

        if (result.length === 0) {
          // Check if it's optimistic lock failure or quota insufficient
          const check = await tx.query.subscriptionLimit.findFirst({
            where: eq(subscriptionLimit.id, annualSubscription.id),
          })

          if (!check) {
            return { success: false, reason: 'not_found' }
          }

          const currentRefresh = check.lastQuotaRefresh?.toString()
          const snapshotRefresh = lastRefreshSnapshot?.toString()

          if (currentRefresh !== snapshotRefresh) {
            // Optimistic lock failed, retry
            log.subscription('warn', 'Annual quota deduction optimistic lock failed, retrying', {
              organizationId,
              quotaType,
              attempt: attempt + 1,
              operation: 'annual_quota_refresh_deduct'
            })
            throw new Error('Optimistic lock failed')
          }

          // Quota insufficient
          log.subscription('info', 'Annual quota deduction failed: insufficient quota', {
            organizationId,
            quotaType,
            currentQuota: check[quotaType] || 0,
            deductAmount,
            operation: 'annual_quota_refresh_deduct'
          })
          return { success: false, reason: 'insufficient' }
        }

        // Get the remaining quota from the updated record
        const updatedRecord = result[0]
        const remaining = updatedRecord ? updatedRecord[quotaType] : 0

        return {
          success: true,
          remaining
        }
      })
    } catch (error) {
      if (attempt === maxRetries - 1) {
        log.subscription('error', 'Failed to refresh and deduct annual quota after retries', {
          organizationId,
          quotaType,
          deductAmount,
          attempts: maxRetries,
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'annual_quota_refresh_deduct'
        })
        return { success: false, reason: 'concurrency' }
      }

      // Exponential backoff with jitter to reduce contention
      const baseDelay = 50
      const backoffDelay = baseDelay * (2 ** attempt)
      const jitter = Math.random() * baseDelay
      await new Promise(resolve => setTimeout(resolve, backoffDelay + jitter))
    }
  }

  return { success: false, reason: 'concurrency' }
}

/**
 * Unified quota deduction entry point for all services
 * This function should be used by all services that need to deduct quota
 * It handles annual subscription refresh automatically
 */
export async function deductQuotaUnified(
  organizationId: string,
  quotaType: 'aiNums' | 'enhanceNums' | 'uploadLimit' | 'deployLimit' | 'projectNums',
  deductAmount = 1
): Promise<{ success: boolean; remaining?: number; source?: 'annual' | 'fallback' }> {
  if (!organizationId?.trim()) {
    return { success: false }
  }

  // First try annual subscription quota refresh and deduction
  try {
    const annualResult = await checkRefreshAndDeductQuota(organizationId, quotaType, deductAmount)
    if (annualResult.success) {
      log.subscription('info', 'Quota deducted from annual subscription via unified entry', {
        organizationId,
        quotaType,
        deductAmount,
        remaining: annualResult.remaining,
        operation: 'unified_quota_deduction'
      })
      return {
        success: true,
        remaining: annualResult.remaining,
        source: 'annual'
      }
    }
  } catch (error) {
    log.subscription('warn', 'Annual quota deduction failed in unified entry, will use fallback', {
      organizationId,
      quotaType,
      deductAmount,
      error: error instanceof Error ? error.message : 'Unknown error',
      operation: 'unified_quota_deduction'
    })
  }

  // Return indication that fallback logic should be used
  return {
    success: false,
    source: 'fallback'
  }
}
