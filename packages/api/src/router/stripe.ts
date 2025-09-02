/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * stripe.ts
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

import { initAuth } from '@libra/auth/auth-server'
import { getAuthDb, plan, price } from '@libra/auth/db'
import { subscription, user } from '@libra/auth/db/schema/auth-schema'
import { env } from '@libra/auth/env.mjs'
import { getActiveOrganization } from '@libra/auth/plugins'
import { getDbAsync } from '@libra/db'
import { withDbCleanup } from '../utils/project'
import { subscriptionLimit } from '@libra/db/schema/project-schema'
import type { TRPCRouterRecord } from '@trpc/server'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { z } from 'zod/v4'
import { organizationProcedure, protectedProcedure, publicProcedure } from '../trpc'
import { DEFAULT_FREE_LIMITS, getURL, mapToPlans } from '../utils/stripe-utils'

// Initialize Stripe client
const stripe = new Stripe(env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
  httpClient: Stripe.createFetchHttpClient(),
})

export const stripeRouter = {
  getUserPlans: publicProcedure.query(async ({ ctx }) => {
    const db = await getAuthDb()
    const auth = await initAuth()
    const headersList = await headers()
    const sessionData = await auth.api.getSession({
      headers: headersList,
    })
    const user = sessionData?.user

    const planPrices = await db
      .select({
        plan: {
          id: plan.id,
          name: plan.name,
          group: plan.group,
          limits: plan.limits,
          marketing_features: plan.marketingFeatures,
          isActive: plan.isActive,
          description: plan.description,
        },
        price: {
          id: price.id,
          priceId: price.priceId,
          planId: price.planId,
          unitAmount: price.unitAmount,
          currency: price.currency,
          pricingPlanInterval: price.pricingPlanInterval,
        },
      })
      .from(plan)
      .leftJoin(price, eq(plan.id, price.planId || ''))
      .where(eq(plan.isActive, true))

    // Get the user's current plan information
    let currentUserPlans: string[] = []
    let primaryPlan: string | null = null

    if (user) {
      try {
        // Get the user's active organization
        const activeOrg = await getActiveOrganization(user.id)

        if (activeOrg?.id) {
          // Get current organization's plan information from the subscriptionLimit table
          const currentLimits = await withDbCleanup(async (projectDb) => {
            return await projectDb
              .select({
                planName: subscriptionLimit.planName,
              })
              .from(subscriptionLimit)
              .where(
                and(
                  eq(subscriptionLimit.organizationId, activeOrg.id),
                  eq(subscriptionLimit.isActive, true)
                )
              )
          })

          // Check if there are active paid subscriptions
          const activeSubscriptions = await db
            .select({
              plan: subscription.plan,
            })
            .from(subscription)
            .where(
              and(eq(subscription.referenceId, activeOrg.id), eq(subscription.status, 'active'))
            )

          // Collect all plans
          const allPlans = new Set<string>()

          // Add plans from subscription limits
          for (const limit of currentLimits) {
            if (limit.planName) {
              allPlans.add(limit.planName)
            }
          }

          // Add plans from active subscriptions
          for (const sub of activeSubscriptions) {
            if (sub.plan) {
              allPlans.add(sub.plan)
            }
          }

          // If there are no plans, add the free plan
          if (allPlans.size === 0) {
            allPlans.add('FREE')
          }

          currentUserPlans = Array.from(allPlans)

          // Determine primary plan: prioritize paid plans, if no paid plans then choose free plan
          const paidPlans = currentUserPlans.filter((plan) => !plan.toLowerCase().includes('free'))

          if (paidPlans.length > 0) {
            // If there are multiple paid plans, prioritize PRO, then MAX
            const proPlan = paidPlans.find((plan) => plan.toLowerCase().includes('pro'))
            const maxPlan = paidPlans.find((plan) => plan.toLowerCase().includes('max'))

            primaryPlan = proPlan || maxPlan || paidPlans[0] || null
          } else {
            // Only free plans
            primaryPlan =
              currentUserPlans.find((plan) => plan.toLowerCase().includes('free')) || 'FREE'
          }
        } else {
          // If there's no organization ID, default to free plan
          currentUserPlans = ['FREE']
          primaryPlan = 'FREE'
        }
      } catch (error) {
        currentUserPlans = ['FREE']
        primaryPlan = 'FREE'
      }
    }

    // Check if the user has any paid subscriptions
    const hasPaidSubscription = currentUserPlans.some(
      (plan) => !plan.toLowerCase().includes('free')
    )

    return {
      code: 'SUCCESS',
      data: mapToPlans(planPrices, primaryPlan),
      currentUserPlan: primaryPlan,
      currentUserPlans,
      hasPaidSubscription,
    }
  }),

  isPaid: organizationProcedure.query(async (opts) => {
    const { db } = opts.ctx
    const { orgId } = opts.input

    if (!orgId) {
      return {
        code: 'SUCCESS',
        data: { isPaid: false, subscription: null },
      }
    }

    const activeSubscription = await db
      .select()
      .from(subscription)
      .where(and(eq(subscription.referenceId, orgId), eq(subscription.status, 'active')))
      .then((rows) => rows[0])

    return {
      code: 'SUCCESS',
      data: {
        isPaid: !!activeSubscription,
        subscription: activeSubscription || null,
      },
    }
  }),

  createPortalSession: organizationProcedure.mutation(async (opts) => {
    const { session, db } = opts.ctx
    const userId = session.user.id

    const [userData] = await db.select().from(user).where(eq(user.id, userId))

    if (!userData?.stripeCustomerId) {
      throw new Error('User does not have a valid payment customer ID')
    }

    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: userData.stripeCustomerId,
        return_url: getURL('dashboard'),
      })

      return {
        code: 'SUCCESS',
        data: { url: portalSession.url },
      }
    } catch (err) {
      console.log(err)
      throw new Error('Unable to create billing portal session')
    }
  }),

  getPriceByPriceId: organizationProcedure
    .input(z.object({ priceId: z.string() }))
    .mutation(async (opts) => {
      const { priceId } = opts.input
      const { db } = opts.ctx

      const [priceInfo] = await db.select().from(price).where(eq(price.priceId, priceId))

      if (!priceInfo) {
        return {
          code: 'ERROR',
          msg: 'Price information not found',
        }
      }

      return {
        code: 'SUCCESS',
        data: priceInfo,
      }
    }),

  getSubscriptionUsage: organizationProcedure.query(async (opts) => {
    const { db } = opts.ctx
    const { orgId } = opts.input

    if (!orgId) {
      return {
        code: 'SUCCESS',
        data: DEFAULT_FREE_LIMITS,
      }
    }

    const [limit] = await db
      .select()
      .from(subscriptionLimit)
      .where(and(eq(subscriptionLimit.organizationId, orgId), eq(subscriptionLimit.isActive, true)))

    if (!limit) {
      return {
        code: 'SUCCESS',
        data: DEFAULT_FREE_LIMITS,
      }
    }

    return {
      code: 'SUCCESS',
      data: {
        aiNums: limit.aiNums,
        aiNumsLimit: limit.aiNums,
        seats: limit.seats,
        seatsLimit: limit.seats,
        projectNums: limit.projectNums,
        projectNumsLimit: limit.projectNums,
        plan: limit.planName,
        isActive: limit.isActive,
        periodEnd: limit.periodEnd,
      },
    }
  }),

  getAvailablePlans: publicProcedure.query(async (opts) => {
    const { db } = opts.ctx
    const plans = await db.select().from(plan).where(eq(plan.isActive, true))

    return {
      code: 'SUCCESS',
      data: plans,
    }
  }),
} satisfies TRPCRouterRecord
