/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * quota-management.ts
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

import {addMonths} from 'date-fns'
import {and, eq, sql} from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'

import {getActiveOrganization} from '@libra/auth/utils/organization-utils'
import {getPlanLimitsForHono} from '@libra/auth/utils/subscription-limits/constants'
import {PLAN_TYPES, type PlanType} from '@libra/auth/utils/subscription-limits/types'
import {checkRefreshAndDeductQuota} from '@libra/auth/utils/subscription-limits/annual-quota-refresh'
import {log, tryCatch} from '@libra/common'
import {subscriptionLimit} from '@libra/db/schema/project-schema'
import type * as schema from '@libra/db/schema/project-schema'

import {getAuthDb} from '../db';
import {getPostgresDb} from '../db-postgres'
import type { AppContext } from '../types';

/**
 * Get organization ID from user session with fallback to database lookup
 */
async function getOrganizationId(c: AppContext): Promise<string | null> {
    const userSession = c.get('userSession')
    if (!userSession) {
        log.cdn('error', 'No user session found in context', {operation: 'quota_management'})
        return null
    }


    const organizationId = userSession.session?.activeOrganizationId
    if (!organizationId) {
        log.cdn('warn', 'No active organization ID found in session, trying fallback', {
            operation: 'quota_management',
            userId: userSession.user?.id,
            sessionId: userSession.session?.id,
            sessionStructure: userSession.session ? Object.keys(userSession.session) : 'no session'
        })

        // Fallback: Get organization from user's membership
        try {
            const userId = userSession.user?.id
            if (!userId) {
                log.cdn('error', 'No user ID available for fallback organization lookup', {operation: 'quota_management'})
                return null
            }

            const organization = await getActiveOrganization(userId)
            if (organization?.id) {
                log.cdn('info', 'Organization ID retrieved via fallback', {
                    operation: 'quota_management',
                    organizationId: organization.id,
                    userId
                })
                return organization.id
            }
        } catch (error) {
            log.cdn('error', 'Failed to get organization via fallback', {
                operation: 'quota_management',
                userId: userSession.user?.id,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        }

        return null
    }

    log.cdn('info', 'Organization ID retrieved successfully from session', {
        operation: 'quota_management',
        organizationId,
        userId: userSession.user.id
    })

    return organizationId
}

/**
 * Attempt to deduct upload quota from paid plan using atomic operation
 * Fast path for most common scenario
 */
async function attemptPaidPlanUploadDeduction(
    db: NodePgDatabase<typeof schema>,
    organizationId: string,
    now: Date
): Promise<{ success: boolean; planName?: string; remaining?: number }> {
    const [result, error] = await tryCatch(async () => {
        const paidUpdated = (await db
            .update(subscriptionLimit)
            .set({
                uploadLimit: sql<number>`(${subscriptionLimit.uploadLimit}) - 1`,
                updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(
                and(
                    eq(subscriptionLimit.organizationId, organizationId),
                    sql`${subscriptionLimit.planName} != ${PLAN_TYPES.FREE}`,
                    eq(subscriptionLimit.isActive, true),
                    sql`(${subscriptionLimit.uploadLimit}) > 0`,
                    sql`${subscriptionLimit.periodEnd} >= ${new Date(now).toISOString()}` // Ensure plan hasn't expired
                )
            )
            .returning({
                remaining: subscriptionLimit.uploadLimit,
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

        return {success: false}
    })

    if (error) {
        log.cdn('error', 'Error in paid plan upload deduction', {
            organizationId,
            operation: 'upload_quota_deduction'
        }, error as Error)
        return {success: false}
    }

    return result
}

/**
 * Handle FREE plan upload deduction with transaction for data consistency
 * Includes period refresh logic similar to AI and enhance quota management
 */
async function handleFreePlanUploadDeduction(
    db: NodePgDatabase<typeof schema>,
    organizationId: string,
    now: Date,
    c: AppContext
): Promise<boolean> {
    const authDb = await getAuthDb(c)
    const [result, error] = await tryCatch(async () => {
        return await db.transaction(async (tx: NodePgDatabase<typeof schema>) => {
            log.cdn('info', 'Starting FREE plan upload deduction transaction', {
                organizationId,
                operation: 'upload_quota_deduction'
            })

            // Get FREE plan limits for this organization
            const freeLimitRows = await tx
                .select()
                .from(subscriptionLimit)
                .where(
                    and(
                        eq(subscriptionLimit.organizationId, organizationId),
                        eq(subscriptionLimit.planName, PLAN_TYPES.FREE),
                        eq(subscriptionLimit.isActive, true)
                    )
                )
                .for('update') // Lock to prevent race conditions
                .limit(1)

            const freeLimit = freeLimitRows[0]

            if (!freeLimit) {
                log.cdn('warn', 'No active FREE plan found', {
                    organizationId,
                    operation: 'upload_quota_deduction'
                })
                return false
            }

            // Check if FREE plan needs refresh (only on period expiry, not quota exhaustion)
            const periodEndDate = new Date(freeLimit.periodEnd)

            // Ensure we have proper Date objects for comparison
            const nowDate = new Date(now)
            const nowTimestamp = nowDate.getTime()
            const periodEndTimestamp = periodEndDate.getTime()

            if (nowTimestamp > periodEndTimestamp) {
                log.cdn('info', 'FREE plan expired, refreshing', {
                    organizationId,
                    periodEnd: freeLimit.periodEnd,
                    operation: 'upload_quota_deduction'
                })

                const {limits: freePlanLimits} = await getPlanLimitsForHono(PLAN_TYPES.FREE,authDb)

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

                log.cdn('info', 'FREE plan period calculation', {
                    organizationId,
                    originalStart: freeLimit.periodStart,
                    newStart: newPeriodStart.toISOString(),
                    newEnd: nextPeriodEnd.toISOString(),
                    operation: 'upload_quota_deduction'
                })

                // Refresh the FREE plan with new quota and immediately deduct 1 for this request
                // This ensures the refresh operation is immediately successful
                // Note: projectNums is preserved to maintain user's actual project count
                await tx
                    .update(subscriptionLimit)
                    .set({
                        aiNums: freePlanLimits.aiNums,
                        enhanceNums: freePlanLimits.aiNums,
                        uploadLimit: freePlanLimits.aiNums - 1, // Refresh and deduct in one operation
                        deployLimit: freePlanLimits.aiNums * 2,
                        seats: freePlanLimits.seats,
                        // projectNums: keep existing value, don't reset
                        periodStart: newPeriodStart.toISOString(),
                        periodEnd: nextPeriodEnd.toISOString(),
                        updatedAt: sql`CURRENT_TIMESTAMP`,
                    })
                    .where(eq(subscriptionLimit.id, freeLimit.id))

                log.cdn('info', 'FREE plan refreshed and upload quota deducted', {
                    organizationId,
                    remaining: freePlanLimits.aiNums - 1,
                    operation: 'upload_quota_deduction'
                })
                return true // Refresh and deduction completed successfully
            }

            // If we reach here, the period hasn't expired yet, check current quota
            const currentQuota = freeLimit.uploadLimit
            if (currentQuota <= 0) {
                log.cdn('warn', 'FREE plan upload quota exhausted', {
                    organizationId,
                    currentQuota,
                    operation: 'upload_quota_deduction'
                })
                return false
            }

            // Perform atomic deduction within the transaction
            const freeUpdated = (await tx
                .update(subscriptionLimit)
                .set({
                    uploadLimit: sql<number>`(${subscriptionLimit.uploadLimit}) - 1`,
                    updatedAt: sql`CURRENT_TIMESTAMP`,
                })
                .where(
                    and(
                        eq(subscriptionLimit.id, freeLimit.id),
                        eq(subscriptionLimit.isActive, true),
                        sql`(${subscriptionLimit.uploadLimit}) > 0` // Double-check quota availability
                    )
                )
                .returning({remaining: subscriptionLimit.uploadLimit})) as { remaining: number }[]

            if (freeUpdated.length > 0) {
                const remaining = freeUpdated[0]?.remaining || 0
                log.cdn('info', 'Upload quota deducted from FREE plan', {
                    organizationId,
                    remaining,
                    operation: 'upload_quota_deduction'
                })
                return true
            }

            // This should rarely happen due to our checks above
            log.cdn('warn', 'FREE plan upload deduction failed - quota may have been consumed by concurrent request', {
                organizationId,
                operation: 'upload_quota_deduction'
            })
            return false
        })
    })

    if (error) {
        log.cdn('error', 'Error in FREE plan upload deduction', {
            organizationId,
            operation: 'upload_quota_deduction'
        }, error as Error)
        return false
    }

    return result
}

/**
 * Deduct upload quota for an organization
 * Priority: FREE plan first, then paid plan
 * Follows the same pattern as checkAndUpdateAIMessageUsage and checkAndUpdateEnhanceUsage
 *
 * @param c Hono context containing organization information
 * @returns Promise<boolean> - true if deduction successful, false if no quota available
 */
export async function checkAndUpdateUploadUsage(c: AppContext): Promise<boolean> {
    const [result, error] = await tryCatch(async () => {
        const organizationId = await getOrganizationId(c)
        if (!organizationId) {
            log.cdn('error', 'No organization ID found for upload quota deduction', {operation: 'upload_quota_deduction'})
            return false
        }

        log.cdn('info', 'Getting PostgreSQL database connection', {
            organizationId,
            operation: 'upload_quota_deduction'
        })

        const db = await getPostgresDb(c)

        try {
            log.cdn('info', 'Upload quota deduction started', {
                organizationId,
                operation: 'upload_quota_deduction'
            })

            // PRIORITY: Try annual subscription quota refresh and deduction first
            try {
                const annualResult = await checkRefreshAndDeductQuota(organizationId, 'uploadLimit', 1)
                if (annualResult.success) {
                    log.cdn('info', 'Upload quota deducted from annual subscription', {
                        organizationId,
                        remaining: annualResult.remaining,
                        operation: 'upload_quota_deduction'
                    })
                    return true
                }
            } catch (error) {
                log.cdn('warn', 'Annual quota refresh check failed, falling back to regular logic', {
                    organizationId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    operation: 'upload_quota_deduction'
                })
            }

            // Get current time from database to ensure UTC consistency across all operations
            const {rows} = await db.execute(sql`SELECT NOW() as "dbNow"`)
            const [{dbNow}] = rows as [{ dbNow: string | Date }]
            const now = typeof dbNow === 'string' ? new Date(dbNow) : dbNow

            log.cdn('info', 'Database time retrieved successfully', {
                organizationId,
                dbNow: now.toISOString(),
                dbNowType: typeof dbNow,
                operation: 'upload_quota_deduction'
            })

            // SECONDARY PATH: Try FREE plan deduction
            // Users should consume their free quota before paid quota
            const freeDeductionResult = await handleFreePlanUploadDeduction(db, organizationId, now, c)
            if (freeDeductionResult) {
                log.cdn('info', 'Upload quota deducted from FREE plan', {
                    organizationId,
                    operation: 'upload_quota_deduction'
                })
                return true
            }

            // FALLBACK PATH: Try paid plan deduction only if FREE plan exhausted
            // This ensures paid users can continue uploading after free quota is used
            const paidDeductionResult = await attemptPaidPlanUploadDeduction(db, organizationId, now)
            if (paidDeductionResult.success) {
                log.cdn('info', 'Upload quota deducted from paid plan', {
                    organizationId,
                    planName: paidDeductionResult.planName,
                    remaining: paidDeductionResult.remaining,
                    operation: 'upload_quota_deduction'
                })
                return true
            }

            // No quota available in either FREE or paid plans
            log.cdn('warn', 'Upload quota exhausted in all plans', {
                organizationId,
                operation: 'upload_quota_deduction'
            })

            return false
        } finally {
            // Clean up database connection
            c.executionCtx.waitUntil(db.$client.end())
        }
    })

    if (error) {
        log.cdn('error', 'Upload quota deduction failed with error', {
            operation: 'upload_quota_deduction',
            error: error.message,
            stack: error.stack
        })
        return false
    }

    return result
}

/**
 * Restore upload quota when a file is deleted
 * Prioritizes FREE plan restoration over PAID plan restoration for optimal quota utilization
 * Uses database transactions to ensure atomicity and prevent race conditions
 * Follows the same pattern as restoreProjectQuotaOnDeletion
 *
 * @param c Hono context containing organization information
 * @returns Promise<{ success: boolean; restoredTo?: 'PAID' | 'FREE'; planName?: string; error?: string }>
 */
export async function restoreUploadQuotaOnDeletion(c: AppContext): Promise<{
    success: boolean
    restoredTo?: 'PAID' | 'FREE'
    planName?: string
    error?: string
}> {
    const organizationId = await getOrganizationId(c)
    if (!organizationId) {
        const error = 'Organization ID is required for quota restoration'
        log.cdn('error', 'Upload quota restoration error', {
            operation: 'restore_upload_quota',
            error: error
        })
        return {success: false, error}
    }

    log.cdn('info', 'Starting upload quota restoration', {
        organizationId,
        operation: 'restore_upload_quota'
    })

    const db = await getPostgresDb(c)
    const authDb = await getAuthDb(c)

    try {
        const [result, error] = await tryCatch(async () => {
        return await db.transaction(async (tx: NodePgDatabase<typeof schema>) => {
            log.cdn('info', 'Starting upload quota restoration transaction', {
                organizationId,
                operation: 'restore_upload_quota'
            })

            // Step 1: Try to restore to FREE plan first (prioritized for optimal quota utilization)
            const freeLimitsRows = await tx
                .select()
                .from(subscriptionLimit)
                .where(
                    and(
                        eq(subscriptionLimit.organizationId, organizationId),
                        eq(subscriptionLimit.planName, PLAN_TYPES.FREE),
                        eq(subscriptionLimit.isActive, true)
                    )
                )
                .for('update') // Lock to prevent race conditions
                .limit(1)

            const freeLimits = freeLimitsRows[0]

            if (freeLimits) {
                log.cdn('info', 'Found active FREE plan for upload quota restoration', {
                    organizationId,
                    operation: 'restore_upload_quota'
                })
                // Get plan limits for validation
                const {limits: planLimits} = await getPlanLimitsForHono(freeLimits.planName as PlanType, authDb)
                const newFreeUploadLimit = freeLimits.uploadLimit + 1

                if (newFreeUploadLimit <= planLimits.aiNums) { // uploadLimit uses same limit as aiNums from plan definition
                    // Safe to restore to FREE plan
                    const freeUpdated = await tx
                        .update(subscriptionLimit)
                        .set({
                            uploadLimit: sql<number>`(${subscriptionLimit.uploadLimit}) + 1`,
                            updatedAt: sql`CURRENT_TIMESTAMP`,
                        })
                        .where(
                            and(
                                eq(subscriptionLimit.id, freeLimits.id),
                                eq(subscriptionLimit.isActive, true),
                                sql`(${subscriptionLimit.uploadLimit}) < ${planLimits.aiNums}` // Double-check against plan limit
                            )
                        )
                        .returning({uploadLimit: subscriptionLimit.uploadLimit})

                    if (freeUpdated.length > 0) {
                        const result = freeUpdated[0]
                        log.cdn('info', 'Successfully restored upload quota to FREE plan', {
                            organizationId,
                            newQuota: result?.uploadLimit,
                            maxQuota: planLimits.aiNums,
                            operation: 'restore_upload_quota'
                        })
                        return {
                            success: true,
                            restoredTo: 'FREE' as const,
                            planName: PLAN_TYPES.FREE,
                        }
                    }

                    log.cdn('warn', 'FREE plan upload quota restoration failed (concurrent update detected), falling back to PAID plan', {
                        organizationId,
                        operation: 'restore_upload_quota'
                    })
                } else {
                    log.cdn('warn', 'FREE plan upload quota restoration would exceed limit, falling back to PAID plan', {
                        organizationId,
                        newQuota: newFreeUploadLimit,
                        maxQuota: planLimits.aiNums,
                        currentQuota: freeLimits.uploadLimit,
                        operation: 'restore_upload_quota'
                    })
                }
            } else {
                log.cdn('info', 'No active FREE plan found, checking PAID plan', {
                    organizationId,
                    operation: 'restore_upload_quota'
                })
            }

            // Step 2: Fallback to PAID plan restoration
            const paidLimitsRows = await tx
                .select()
                .from(subscriptionLimit)
                .where(
                    and(
                        eq(subscriptionLimit.organizationId, organizationId),
                        sql`${subscriptionLimit.planName} != ${PLAN_TYPES.FREE}`,
                        eq(subscriptionLimit.isActive, true)
                    )
                )
                .for('update') // Lock to prevent race conditions
                .limit(1)

            const paidLimits = paidLimitsRows[0]

            if (!paidLimits) {
                const error = freeLimits
                    ? `Upload quota restoration failed: FREE plan is at maximum capacity and no PAID plan available for organization: ${organizationId}`
                    : `No active subscription plan found for organization: ${organizationId}`
                log.cdn('error', 'Upload quota restoration error', {
                    organizationId,
                    operation: 'restore_upload_quota',
                    error: error,
                    hasFreePlan: !!freeLimits,
                    hasPaidPlan: false
                })
                return {success: false, error}
            }

            // Get plan limits for validation
            const {limits: planLimits} = await getPlanLimitsForHono(paidLimits.planName as PlanType, authDb)
            const newUploadLimit = paidLimits.uploadLimit + 1

            if (newUploadLimit <= planLimits.aiNums) { // uploadLimit uses same limit as aiNums from plan definition
                // Safe to restore to PAID plan
                const paidUpdated = await tx
                    .update(subscriptionLimit)
                    .set({
                        uploadLimit: sql<number>`(${subscriptionLimit.uploadLimit}) + 1`,
                        updatedAt: sql`CURRENT_TIMESTAMP`,
                    })
                    .where(
                        and(
                            eq(subscriptionLimit.id, paidLimits.id),
                            eq(subscriptionLimit.isActive, true),
                            sql`(${subscriptionLimit.uploadLimit}) < ${planLimits.aiNums}` // Double-check against plan limit
                        )
                    )
                    .returning({
                        uploadLimit: subscriptionLimit.uploadLimit,
                        planName: subscriptionLimit.planName,
                    })

                if (paidUpdated.length > 0) {
                    const result = paidUpdated[0]
                    log.cdn('info', 'Successfully restored upload quota to PAID plan', {
                        organizationId,
                        planName: result?.planName,
                        newQuota: result?.uploadLimit,
                        maxQuota: planLimits.aiNums,
                        operation: 'restore_upload_quota'
                    })
                    return {
                        success: true,
                        restoredTo: 'PAID' as const,
                        planName: result?.planName,
                    }
                }

                log.cdn('warn', 'PAID plan upload quota restoration failed (concurrent update detected)', {
                    organizationId,
                    operation: 'restore_upload_quota'
                })
            } else {
                const error = `PAID plan upload quota restoration would exceed limit: ${newUploadLimit}/${planLimits.aiNums} for organization: ${organizationId}`
                log.cdn('error', 'Upload quota restoration error', {
                    organizationId,
                    operation: 'restore_upload_quota',
                    error: error
                })
                return {success: false, error}
            }

            return {success: false, error: 'All restoration attempts failed'}
        })
        })

        if (error) {
            log.cdn('error', 'Error in upload quota restoration transaction', {
                organizationId,
                operation: 'restore_upload_quota'
            }, error as Error)
            return {success: false, error: error instanceof Error ? error.message : 'Unknown error'}
        }

        return result
    } finally {
        // Clean up PostgreSQL database connection
        // Note: authDb is D1 database and doesn't need explicit cleanup
        c.executionCtx.waitUntil(db.$client.end())
    }
}
