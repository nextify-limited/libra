/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * project-schema.ts
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

import { createId } from '@paralleldrive/cuid2'
import { sql } from 'drizzle-orm'
import { boolean, integer, jsonb, pgTable, text, timestamp, varchar, uniqueIndex } from 'drizzle-orm/pg-core'

export const project = pgTable('project', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey()
    .unique(),
  name: text('name').notNull(),
  templateType: text('template_type').notNull(),
  url: text('url'),
  gitUrl: text('git_url'),
  gitBranch: text('git_branch'),
  previewImageUrl: text('preview_image_url'),
  productionDeployUrl: text('production_deploy_url'),
  workflowId: text('workflow_id'),
  deploymentStatus: varchar('deployment_status', {
    enum: ['idle', 'preparing', 'deploying', 'deployed', 'failed']
  }).default('idle'),
  customDomain: text('custom_domain'),
  customDomainStatus: varchar('custom_domain_status', {
    enum: ['pending', 'verified', 'active', 'failed']
  }),
  customDomainVerifiedAt: timestamp('custom_domain_verified_at', {
    withTimezone: true,
    mode: 'string'
  }),
  customHostnameId: text('custom_hostname_id'),
  ownershipVerification: text('ownership_verification'),
  sslStatus: varchar('ssl_status', {
    enum: ['pending', 'pending_validation', 'active', 'failed']
  }),
  visibility: varchar('visibility', { enum: ['public', 'private'] }),
  isActive: boolean('is_active').notNull().default(true),
  userId: text('user_id').notNull(),
  organizationId: text('organization_id').notNull(),
  containerId: text('container_id'),
  initialMessage: text('initial_message'),
  knowledge: text('knowledge'),
  messageHistory: text('message_history').notNull().default('[]'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string'
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
})

// Project AI Message Usage Limit Table
export const projectAIUsage = pgTable('project_ai_usage', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').notNull(),
  totalAIMessageCount: integer('total_ai_message_count').notNull().default(0),
  lastUsedAt: timestamp('last_used_at', {
    withTimezone: true,
    mode: 'string'
  }).default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string'
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
})

// Subscription Resource Limit Table
export const subscriptionLimit = pgTable('subscription_limit', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  organizationId: text('organization_id').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  planName: text('plan_name').notNull(),
  planId: text('plan_id').notNull(),
  aiNums: integer('ai_nums').notNull(),
  enhanceNums: integer('enhance_nums').notNull(),
  uploadLimit: integer('upload_limit').notNull(),
  deployLimit: integer('deploy_limit').notNull(),
  seats: integer('seats').notNull().default(1),
  projectNums: integer('project_nums').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  periodStart: timestamp('period_start', {
    withTimezone: true,
    mode: 'string'
  }).notNull(),
  periodEnd: timestamp('period_end', {
    withTimezone: true,
    mode: 'string'
  }).notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string'
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
  // Track last quota refresh time for annual subscriptions
  lastQuotaRefresh: timestamp('last_quota_refresh', {
    withTimezone: true,
    mode: 'string'
  }),
  // Track billing interval: 'month' or 'year'
  billingInterval: text('billing_interval').default('month'),
}, (table) => ({
  // Partial unique constraint: only active plans must be unique per organization
  // Allows multiple inactive (historical) records for the same org+plan combination
  uniqueOrgPlanActive: uniqueIndex('subscription_limit_org_plan_active_idx')
    .on(table.organizationId, table.planName)
    .where(sql`${table.isActive} = true`)
}))

// Project Asset Table - tracks attachment files associated with projects
export const projectAsset = pgTable('project_asset', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  organizationId: text('organization_id').notNull(),
  projectId: text('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  planId: text('plan_id').notNull(),
  attachmentKey: text('attachment_key').notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string'
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
})
