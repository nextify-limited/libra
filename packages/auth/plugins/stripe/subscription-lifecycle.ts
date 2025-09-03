/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * subscription-lifecycle.ts
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

import {
  sendCancellationEmail,
  sendWelcomeEmail,
} from '../../utils/email-service'
import {
  cancelSubscriptionLimits,
  createOrUpdateSubscriptionLimit,
} from '../../utils/subscription-limits'
import { getPlanLimits } from '../../utils/subscription-limits/constants'
import { PLAN_TYPES } from '../../utils/subscription-limits'
import { getDbAsync } from '@libra/db'
import { project } from '@libra/db/schema/project-schema'
import { and, eq, desc, sql, inArray } from 'drizzle-orm'
import { getAuthDb, member } from '../../db'
import { log } from '@libra/common'

/**
 * Get the user ID of the organization owner for sending emails
 * @param organizationId - The organization ID (referenceId from subscription)
 * @returns Promise<string | null> - The userId of the organization owner, or null if not found
 */
async function getOrganizationOwnerUserId(organizationId: string): Promise<string | null> {
  try {
    log.auth('info', 'Getting organization owner', {
      organizationId,
      operation: 'get_organization_owner'
    });
    
    const db = await getAuthDb()

    // First, try to find an owner
    const ownerMember = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, organizationId),
        eq(member.role, 'owner')
      ),
    })

    if (ownerMember) {
      log.auth('info', 'Found organization owner', {
        organizationId,
        userId: ownerMember.userId,
        operation: 'get_organization_owner'
      });
      return ownerMember.userId
    }

    // If no owner found, get the first member
    const firstMember = await db.query.member.findFirst({
      where: eq(member.organizationId, organizationId),
    })

    if (firstMember) {
      log.auth('warn', 'No owner found, using first member', {
        organizationId,
        userId: firstMember.userId,
        operation: 'get_organization_owner'
      });
      return firstMember.userId
    }

    log.auth('warn', 'No members found for organization', {
      organizationId,
      operation: 'get_organization_owner'
    });
    return null
  } catch (error) {
    log.auth('error', 'Failed to get organization owner', {
      organizationId,
      operation: 'get_organization_owner'
    }, error as Error);
    return null
  }
}

export const onSubscriptionCancel = async ({
  event,
  subscription,
  stripeSubscription,
  cancellationDetails,
}: any) => {
  // Called when a subscription is canceled
  log.subscription('info', 'Subscription cancellation started', {
    subscriptionId: subscription.id,
    organizationId: subscription.referenceId,
    planName: subscription.plan,
    operation: 'subscription_cancel'
  });

  // Send cancellation email - find the organization owner first
  try {
    const userId = await getOrganizationOwnerUserId(subscription.referenceId)
    if (userId) {
      await sendCancellationEmail(userId)
      log.subscription('info', 'Cancellation email sent successfully', {
        subscriptionId: subscription.id,
        organizationId: subscription.referenceId,
        userId,
        operation: 'subscription_cancel'
      });
    } else {
      log.subscription('warn', 'Could not find user for organization, skipping cancellation email', {
        subscriptionId: subscription.id,
        organizationId: subscription.referenceId,
        operation: 'subscription_cancel'
      });
    }
  } catch (error) {
    log.subscription('error', 'Failed to send cancellation email', {
      subscriptionId: subscription.id,
      organizationId: subscription.referenceId,
      operation: 'subscription_cancel'
    }, error as Error);
    // Don't throw here to avoid breaking the subscription cancellation process
  }

  // We do not immediately cancel limits, allowing users to continue using until the end of the current period
  // If you need to cancel limits immediately, uncomment the line below
  // await cancelSubscriptionLimits(subscription.referenceId)
  
  log.subscription('info', 'Subscription cancellation completed', {
    subscriptionId: subscription.id,
    organizationId: subscription.referenceId,
    operation: 'subscription_cancel'
  });
}

/**
 * Enforce FREE plan project limits for an organization
 * When a paid user's subscription expires, this method ensures they only have
 * the allowed number of active projects (1 for FREE plan)
 *
 * @param organizationId - The organization ID to enforce limits for
 * @returns Promise with deactivation results
 */
export const enforceFreePlanProjectLimits = async (
  organizationId: string
): Promise<{ deactivatedCount: number; activeProjectId: string | null }> => {

  // Parameter validation
  if (!organizationId?.trim()) {
    throw new Error('Organization ID is required')
  }

  const db = await getDbAsync()
  if (!db) {
    throw new Error('Database connection is not available')
  }

  const FREE_PROJECT_LIMIT = 1

  try {
    return await db.transaction(async (tx: any) => {
      // Lock and fetch all active projects for the organization
      // Order by updatedAt DESC to keep the most recently updated project
      const activeProjects = await tx
        .select({
          id: project.id,
          name: project.name,
          updatedAt: project.updatedAt,
        })
        .from(project)
        .where(
          and(
            eq(project.organizationId, organizationId),
            eq(project.isActive, true)
          )
        )
        .orderBy(desc(project.updatedAt))
        .for('update') // Lock rows to prevent concurrent modifications

      // If within limits, no action needed
      if (activeProjects.length <= FREE_PROJECT_LIMIT) {
        return {
          deactivatedCount: 0,
          activeProjectId: activeProjects[0]?.id || null,
        }
      }

      // Keep the most recently updated project (first in DESC order)
      const projectToKeep = activeProjects[0]
      const projectsToDeactivate = activeProjects.slice(FREE_PROJECT_LIMIT)

      // Batch deactivate excess projects
      if (projectsToDeactivate.length > 0) {
        const projectIdsToDeactivate = projectsToDeactivate.map((p: any) => p.id)

        await tx
          .update(project)
          .set({
            isActive: false,
          })
          .where(
            and(
              eq(project.organizationId, organizationId),
              inArray(project.id, projectIdsToDeactivate)
            )
          )
      }

      return {
        deactivatedCount: projectsToDeactivate.length,
        activeProjectId: projectToKeep.id,
      }
    })
  } catch (error) {
    console.error(`Failed to enforce FREE plan project limits for organization ${organizationId}:`, error)
    throw new Error(`Failed to enforce project limits: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const onSubscriptionDeleted = async ({ event, subscription, stripeSubscription }: any) => {
  // Called when a subscription is deleted
  log.subscription('info', 'Subscription deletion started', {
    subscriptionId: subscription.id,
    organizationId: subscription.referenceId,
    planName: subscription.plan,
    operation: 'subscription_delete'
  });

  // Immediately cancel limits
  try {
    await cancelSubscriptionLimits(subscription.referenceId)
    log.subscription('info', 'Subscription limits cancelled', {
      subscriptionId: subscription.id,
      organizationId: subscription.referenceId,
      operation: 'subscription_delete'
    });
  } catch (error) {
    log.subscription('error', 'Failed to cancel subscription limits', {
      subscriptionId: subscription.id,
      organizationId: subscription.referenceId,
      operation: 'subscription_delete'
    }, error as Error);
  }

  // Enforce FREE plan project limits when subscription is deleted
  try {
    const result = await enforceFreePlanProjectLimits(subscription.referenceId)
    log.subscription('info', 'FREE plan project limits enforced', {
      subscriptionId: subscription.id,
      organizationId: subscription.referenceId,
      deactivatedCount: result.deactivatedCount,
      activeProjectId: result.activeProjectId,
      operation: 'subscription_delete'
    });
  } catch (error) {
    log.subscription('error', 'Failed to enforce project limits', {
      subscriptionId: subscription.id,
      organizationId: subscription.referenceId,
      operation: 'subscription_delete'
    }, error as Error);
    // Don't throw here to avoid breaking the subscription deletion process
    // The subscription cancellation should still proceed even if project limit enforcement fails
  }
  
  // Send cancellation email - find the organization owner first
  try {
    const userId = await getOrganizationOwnerUserId(subscription.referenceId)
    if (userId) {
      await sendCancellationEmail(userId)
      log.subscription('info', 'Final cancellation email sent', {
        subscriptionId: subscription.id,
        organizationId: subscription.referenceId,
        userId,
        operation: 'subscription_delete'
      });
    } else {
      log.subscription('warn', 'Could not find user for final cancellation email', {
        subscriptionId: subscription.id,
        organizationId: subscription.referenceId,
        operation: 'subscription_delete'
      });
    }
  } catch (error) {
    log.subscription('error', 'Failed to send final cancellation email', {
      subscriptionId: subscription.id,
      organizationId: subscription.referenceId,
      operation: 'subscription_delete'
    }, error as Error);
    // Don't throw here to avoid breaking the subscription deletion process
  }

  log.subscription('info', 'Subscription deletion completed', {
    subscriptionId: subscription.id,
    organizationId: subscription.referenceId,
    operation: 'subscription_delete'
  });
}

/**
 * Activate projects for subscription upgrade
 * When a user upgrades to a paid plan, this method activates inactive projects
 * up to the new plan's project limit
 *
 * @param organizationId - The organization ID to activate projects for
 * @param newProjectLimit - The new plan's project limit
 * @returns Promise with activation results
 */
export const activateProjectsForUpgrade = async (
  organizationId: string,
  newProjectLimit: number
): Promise<{ activatedCount: number; activatedProjectIds: string[] }> => {

  // Parameter validation
  if (!organizationId?.trim()) {
    throw new Error('Organization ID is required')
  }
  if (newProjectLimit < 0) {
    throw new Error('Project limit must be non-negative')
  }

  const db = await getDbAsync()
  if (!db) {
    throw new Error('Database connection is not available')
  }

  try {
    return await db.transaction(async (tx: any) => {
      // Get current active projects count
      const activeProjectsCount = await tx
        .select({ count: sql<number>`count(*)` })
        .from(project)
        .where(
          and(
            eq(project.organizationId, organizationId),
            eq(project.isActive, true)
          )
        )
        .then((rows: any[]) => rows[0]?.count || 0)

      // If already at or above the new limit, no activation needed
      if (activeProjectsCount >= newProjectLimit) {
        return {
          activatedCount: 0,
          activatedProjectIds: [],
        }
      }

      // Calculate how many projects we can activate
      const projectsToActivate = newProjectLimit - activeProjectsCount

      // Get inactive projects ordered by updatedAt DESC (most recently updated first)
      const inactiveProjects = await tx
        .select({
          id: project.id,
          name: project.name,
          updatedAt: project.updatedAt,
        })
        .from(project)
        .where(
          and(
            eq(project.organizationId, organizationId),
            eq(project.isActive, false)
          )
        )
        .orderBy(desc(project.updatedAt))
        .limit(projectsToActivate)

      // If no inactive projects to activate
      if (inactiveProjects.length === 0) {
        return {
          activatedCount: 0,
          activatedProjectIds: [],
        }
      }

      // Activate the selected projects
      const projectIdsToActivate = inactiveProjects.map((p: any) => p.id)

      await tx
        .update(project)
        .set({
          isActive: true,
        })
        .where(
          and(
            eq(project.organizationId, organizationId),
            inArray(project.id, projectIdsToActivate)
          )
        )

      return {
        activatedCount: projectIdsToActivate.length,
        activatedProjectIds: projectIdsToActivate,
      }
    })
  } catch (error) {
    console.error(`Failed to activate projects for organization ${organizationId}:`, error)
    throw new Error(`Failed to activate projects: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const parseCustomLimits = (plan: any) => {
  let customLimits = undefined

  if (plan.limits) {
    // Convert limits to Record type for safe access
    const limitsObj = plan.limits as Record<string, any>

    // Extract custom limits
    const aiNums = limitsObj['ai_nums']
      ? Number.parseInt(String(limitsObj['ai_nums']), 5)
      : undefined
    const seats = limitsObj['seats']
      ? Number.parseInt(String(limitsObj['seats']), 1)
      : undefined
    const projectNums = limitsObj['project_nums']
      ? Number.parseInt(String(limitsObj['project_nums']), 1)
      : undefined

    // Only set custom limits if successfully parsed
    if (aiNums !== undefined || seats !== undefined || projectNums !== undefined) {
      customLimits = {} as { aiNums?: number; seats?: number; projectNums?: number }
      if (aiNums !== undefined && !Number.isNaN(aiNums)) {
        customLimits.aiNums = aiNums
      }
      if (seats !== undefined && !Number.isNaN(seats)) {
        customLimits.seats = seats
      }
      if (projectNums !== undefined && !Number.isNaN(projectNums)) {
        customLimits.projectNums = projectNums
      }
    }
  }

  return customLimits
}

export const onSubscriptionComplete = async ({ event, subscription, stripeSubscription, plan }: any) => {
  // Called when a subscription is successfully created
  log.subscription('info', 'Subscription completion started', {
    subscriptionId: subscription.id,
    organizationId: subscription.referenceId,
    planName: subscription.plan,
    stripeCustomerId: subscription.stripeCustomerId,
    operation: 'subscription_complete'
  });

  // Get custom limits from the plan
  const customLimits = parseCustomLimits(plan)
  
  if (customLimits) {
    log.subscription('info', 'Custom limits parsed', {
      subscriptionId: subscription.id,
      organizationId: subscription.referenceId,
      customLimits,
      operation: 'subscription_complete'
    });
  }

  // Create new subscription limit record
  if (subscription.periodStart && subscription.periodEnd) {
    try {
      // Determine billing interval from period duration
      const periodStart = new Date(subscription.periodStart)
      const periodEnd = new Date(subscription.periodEnd)
      const periodDurationMs = periodEnd.getTime() - periodStart.getTime()
      const monthsInPeriod = Math.floor(periodDurationMs / (1000 * 60 * 60 * 24 * 30.44)) // Average days per month
      const billingInterval = monthsInPeriod >= 11 ? 'year' : 'month' // 11+ months considered annual

      await createOrUpdateSubscriptionLimit(
        subscription.referenceId,
        subscription.stripeCustomerId || null,
        subscription.plan,
        subscription.periodStart,
        subscription.periodEnd,
        customLimits,
        billingInterval
      )
      
      log.subscription('info', 'Subscription limits created/updated', {
        subscriptionId: subscription.id,
        organizationId: subscription.referenceId,
        planName: subscription.plan,
        operation: 'subscription_complete'
      });
    } catch (error) {
      log.subscription('error', 'Failed to create/update subscription limits', {
        subscriptionId: subscription.id,
        organizationId: subscription.referenceId,
        planName: subscription.plan,
        operation: 'subscription_complete'
      }, error as Error);
      throw error; // This is critical, should fail the subscription
    }

    // Activate projects for subscription upgrade
    try {
      // Determine the project limit for the new plan
      let newProjectLimit = 1 // Default FREE plan limit

      if (customLimits?.projectNums !== undefined) {
        // Use custom limit if available
        newProjectLimit = customLimits.projectNums
      } else {
        // Get default limit from plan type
        const planType = subscription.plan
        if (Object.values(PLAN_TYPES).includes(planType)) {
          const { limits } = await getPlanLimits(planType)
          newProjectLimit = limits.projectNums
        }
      }

      const activationResult = await activateProjectsForUpgrade(
        subscription.referenceId,
        newProjectLimit
      )
      
      log.subscription('info', 'Projects activated for upgrade', {
        subscriptionId: subscription.id,
        organizationId: subscription.referenceId,
        newProjectLimit,
        activatedCount: activationResult.activatedCount,
        activatedProjectIds: activationResult.activatedProjectIds,
        operation: 'subscription_complete'
      });
    } catch (error) {
      log.subscription('error', 'Failed to activate projects for upgrade', {
        subscriptionId: subscription.id,
        organizationId: subscription.referenceId,
        operation: 'subscription_complete'
      }, error as Error);
      // Don't throw here to avoid breaking the subscription completion process
      // The subscription should still be considered successful even if project activation fails
    }
  }

  // Send a welcome email
  if (subscription.stripeCustomerId) {
    try {
      await sendWelcomeEmail(
        subscription.stripeCustomerId,
        plan?.name?.toLocaleUpperCase()
      )
      
      log.subscription('info', 'Welcome email sent', {
        subscriptionId: subscription.id,
        organizationId: subscription.referenceId,
        stripeCustomerId: subscription.stripeCustomerId,
        planName: plan?.name,
        operation: 'subscription_complete'
      });
    } catch (error) {
      log.subscription('error', 'Failed to send welcome email', {
        subscriptionId: subscription.id,
        organizationId: subscription.referenceId,
        stripeCustomerId: subscription.stripeCustomerId,
        operation: 'subscription_complete'
      }, error as Error);
      // Don't throw here - email failure shouldn't break subscription completion
    }
  }
  
  log.subscription('info', 'Subscription completion finished', {
    subscriptionId: subscription.id,
    organizationId: subscription.referenceId,
    planName: subscription.plan,
    operation: 'subscription_complete'
  });
}
