/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * customer-handlers.ts
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
  PLAN_TYPES,
  createOrUpdateSubscriptionLimit,
} from '../../utils/subscription-limits'
import { getActiveOrganization } from '../../utils/organization-utils'
import { sendWelcomeEmail } from '../../utils/email-service'

export const onCustomerCreate = async ({ customer, stripeCustomer, user }: any, request: any) => {
  // Do something with the newly created customer

  // Create FREE subscription limit for user's default organization
  try {
    // Get user's default organization from session or membership
    const organization = await getActiveOrganization(user.id)

    if (organization?.id) {
      const now = new Date()
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

      // Create FREE subscription limit for the default organization
      await createOrUpdateSubscriptionLimit(
        organization.id,
        stripeCustomer.id,
        PLAN_TYPES.FREE,
        now,
        periodEnd,
        undefined, // no custom limits for FREE plan
        'month' // FREE plans are always monthly
      )
      // @ts-ignore
      user.stripeCustomerId = stripeCustomer.id
    } else {
      console.warn(`No organization found for user ${user.id} during customer creation`)
    }
    if (stripeCustomer.id) {
      await sendWelcomeEmail(stripeCustomer.id, PLAN_TYPES.FREE.toLocaleUpperCase())
    }
  } catch (error) {
    console.error(`Failed to create FREE subscription limit for user ${user.id}:`, error)
    // Don't throw error to prevent breaking the user creation flow
  }
}
