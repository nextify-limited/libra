/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * subscription-updates.ts
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

import { eq } from 'drizzle-orm'
import { getAuthDb, plan } from '../../db'
import { createOrUpdateSubscriptionLimit } from '../../utils/subscription-limits'

export const onSubscriptionUpdate = async ({ event, subscription }: any) => {
  const db = await getAuthDb() // Get database instance
  // Called when a subscription is updated

  // Get Stripe subscription data from the event
  const stripeSubscription = event?.data?.object

  console.log('onSubscriptionUpdate called', {
    subscriptionId: subscription.id,
    status: subscription.status,
    stripeCancelAtPeriodEnd: stripeSubscription?.cancel_at_period_end,
    hasPeriodStart: !!subscription.periodStart,
    hasPeriodEnd: !!subscription.periodEnd
  });

  // If this is a cancellation event (cancel_at_period_end = true), don't update subscription limits
  // The cancellation should be handled by onSubscriptionCancel, not onSubscriptionUpdate
  if (stripeSubscription?.cancel_at_period_end) {
    console.log('Skipping subscription limit update - this is a cancellation event');
    return;
  }

  // Only update limits if subscription is active and has period info
  if (
    subscription.status === 'active' &&
    subscription.periodStart &&
    subscription.periodEnd
  ) {
    // Query the plan to get custom limit info
    const planDetails = await db.query.plan.findFirst({
      where: eq(plan.name, subscription.plan),
    })

    // Get custom limits from the plan
    let customLimits = undefined

    if (planDetails?.limits) {
      // Force convert limits to Record type for safe access
      let limitsObj: Record<string, any>

      // If limits is a string, try to parse
      if (typeof planDetails.limits === 'string') {
        try {
          limitsObj = JSON.parse(planDetails.limits)
        } catch (error) {
          console.error('Failed to parse plan limits:', error)
          limitsObj = {}
        }
      } else {
        // If not a string, it may already be an object
        limitsObj = planDetails.limits as Record<string, any>
      }

      // Extract custom limits
      const aiNums = limitsObj['ai_nums']
        ? Number.parseInt(String(limitsObj['ai_nums']), 10)
        : undefined
      const seats = limitsObj['seats']
        ? Number.parseInt(String(limitsObj['seats']), 10)
        : undefined
      const projectNums = limitsObj['project_nums']
        ? Number.parseInt(String(limitsObj['project_nums']), 10)
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

    // Determine billing interval from period duration
    const periodStart = new Date(subscription.periodStart)
    const periodEnd = new Date(subscription.periodEnd)
    const periodDurationMs = periodEnd.getTime() - periodStart.getTime()
    const monthsInPeriod = Math.floor(periodDurationMs / (1000 * 60 * 60 * 24 * 30.44)) // Average days per month
    const billingInterval = monthsInPeriod >= 11 ? 'year' : 'month' // 11+ months considered annual

    // Always update limits, whether renewal or not
    await createOrUpdateSubscriptionLimit(
      subscription.referenceId,
      subscription.stripeCustomerId || null,
      subscription.plan,
      subscription.periodStart,
      subscription.periodEnd,
      customLimits,
      billingInterval
    )

  } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
    // Handle payment failure
    console.error(
      `Subscription ${subscription.id} payment failed, status: ${subscription.status}`
    )
  }
}
