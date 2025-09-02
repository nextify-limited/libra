---
description: Libra AI Project Technical Development Guidelines - Complete Technical Guide Based on Actual Code Implementation (Latest Update July 2025)
globs:
  - "**/*"
alwaysApply: true
lastUpdated: 2025-07-30
version: "1.0"
---

# Libra AI Technical Development Guidelines

## Table of Contents

- [Libra AI Technical Development Guidelines](#libra-ai-technical-development-guidelines)
  - [Table of Contents](#table-of-contents)
  - [1. Project Overview](#1-project-overview)
    - [1.1 Core Features](#11-core-features)
    - [1.2 Technical Highlights](#12-technical-highlights)
    - [1.3 Architecture Principles](#13-architecture-principles)
  - [2. Architecture Design](#2-architecture-design)
    - [2.1 Monorepo Organization Structure](#21-monorepo-organization-structure)
    - [2.2 Application Architecture](#22-application-architecture)
      - [apps/web - Main Web Application](#appsweb---main-web-application)
      - [apps/builder - Vite Build Tool](#appsbuilder---vite-build-tool)
      - [apps/cdn - CDN Service](#appscdn---cdn-service)
      - [apps/dispatcher - Request Router](#appsdispatcher---request-router)
      - [apps/auth-studio - Database Management](#appsauth-studio---database-management)
      - [apps/docs - Documentation Site](#appsdocs---documentation-site)
      - [apps/email - Email Template Development](#appsemail---email-template-development)
      - [apps/vite-shadcn-template - Project Template](#appsvite-shadcn-template---project-template)
      - [apps/deploy - Deployment Service](#appsdeploy---deployment-service)
      - [apps/deploy-workflow - Deployment Workflow](#appsdeploy-workflow---deployment-workflow)
      - [apps/screenshot - Screenshot Service](#appsscreenshot---screenshot-service)
    - [2.3 Shared Package Architecture](#23-shared-package-architecture)
      - [@libra/ui - Design System](#libraui---design-system)
      - [@libra/api - tRPC API Layer](#libraapi---trpc-api-layer)
      - [@libra/db - Database Layer](#libradb---database-layer)
  - [3. Core Technology Stack](#3-core-technology-stack)
    - [3.1 Frontend Technology Stack](#31-frontend-technology-stack)
      - [Core Frameworks](#core-frameworks)
      - [User Interface Frameworks](#user-interface-frameworks)
      - [State Management](#state-management)
      - [Development Tools](#development-tools)
    - [3.2 Backend Technology Stack](#32-backend-technology-stack)
      - [API Layer](#api-layer)
      - [Database](#database)
      - [Authentication \& Payment](#authentication--payment)
      - [File Storage](#file-storage)
    - [3.3 AI Integration Technology](#33-ai-integration-technology)
      - [AI Providers](#ai-providers)
      - [AI Tools](#ai-tools)
      - [Generation Features](#generation-features)
    - [3.4 Deployment \& Infrastructure](#34-deployment--infrastructure)
      - [Cloud Service Providers](#cloud-service-providers)
      - [Deployment Tools](#deployment-tools)
      - [DevOps](#devops)
      - [Monitoring \& Analytics](#monitoring--analytics)
  - [4. Design System \& UI Components](#4-design-system--ui-components)
    - [4.1 Design System Architecture](#41-design-system-architecture)
    - [4.2 Component Development Patterns](#42-component-development-patterns)
    - [4.3 Style System Specifications](#43-style-system-specifications)
      - [Tailwind CSS v4 Configuration](#tailwind-css-v4-configuration)
      - [CSS Variables Usage Guidelines](#css-variables-usage-guidelines)
      - [Tailwind Utility Class Guidelines](#tailwind-utility-class-guidelines)
      - [Custom Utility Classes](#custom-utility-classes)
    - [4.4 Theme System Implementation](#44-theme-system-implementation)
  - [5. API Development Guidelines](#5-api-development-guidelines)
    - [5.1 tRPC Implementation Patterns](#51-trpc-implementation-patterns)
      - [Router Implementation Examples](#router-implementation-examples)
    - [5.2 Data Validation \& Type Safety](#52-data-validation--type-safety)
      - [Client-side Type Inference](#client-side-type-inference)
    - [5.3 Error Handling Patterns](#53-error-handling-patterns)
      - [Error Handling Usage Examples](#error-handling-usage-examples)
    - [5.4 Logging Guidelines](#54-logging-guidelines)
      - [Log Context Structure](#log-context-structure)
  - [6. Database Design \& Operations](#6-database-design--operations)
    - [6.1 Dual Database Architecture](#61-dual-database-architecture)
      - [Business Database - PostgreSQL (Hyperdrive)](#business-database---postgresql-hyperdrive)
      - [Authentication Database - SQLite (Cloudflare D1)](#authentication-database---sqlite-cloudflare-d1)
      - [Database Selection Guide](#database-selection-guide)
    - [6.2 PostgreSQL Connection Configuration (Hyperdrive)](#62-postgresql-connection-configuration-hyperdrive)
    - [6.3 Schema Design Guidelines](#63-schema-design-guidelines)
    - [6.4 Query Patterns](#64-query-patterns)
      - [Basic Query Operations](#basic-query-operations)
      - [Transaction Processing](#transaction-processing)
    - [6.5 Data Integrity](#65-data-integrity)
      - [Foreign Key Constraints and Cascade Deletion](#foreign-key-constraints-and-cascade-deletion)
  - [7. Authentication \& Permission System](#7-authentication--permission-system)
    - [7.1 better-auth Integration](#71-better-auth-integration)
    - [7.2 Organization Permission Patterns](#72-organization-permission-patterns)
  - [8. AI Feature Development](#8-ai-feature-development)
    - [8.1 AI Model Management](#81-ai-model-management)
    - [8.2 Quota \& Billing System](#82-quota--billing-system)
  - [9. State Management Patterns](#9-state-management-patterns)
    - [9.1 Client-side State Management](#91-client-side-state-management)
    - [9.2 Server-side State Management](#92-server-side-state-management)
    - [9.3 Caching Strategies](#93-caching-strategies)
      - [Smart Cache Invalidation](#smart-cache-invalidation)
  - [10. Email System](#10-email-system)
    - [10.1 React Email Integration](#101-react-email-integration)
    - [10.2 Email Template System](#102-email-template-system)
  - [11. Error Handling \& Logging](#11-error-handling--logging)
    - [11.1 Unified Error Handling](#111-unified-error-handling)
    - [11.2 Structured Logging](#112-structured-logging)
    - [11.3 Error Monitoring](#113-error-monitoring)
      - [Frontend Error Boundaries](#frontend-error-boundaries)
  - [12. Internationalization Implementation](#12-internationalization-implementation)
    - [12.1 Paraglide.js Integration](#121-paraglidejs-integration)
      - [Paraglide Configuration](#paraglide-configuration)
      - [Language Switching Implementation](#language-switching-implementation)
      - [Next.js Middleware Configuration](#nextjs-middleware-configuration)
    - [12.2 Multi-language Content Management](#122-multi-language-content-management)
    - [12.3 Localization Best Practices](#123-localization-best-practices)
      - [Using Internationalization in Components](#using-internationalization-in-components)
  - [13. GitHub Integration](#13-github-integration)
    - [13.1 GitHub App Configuration](#131-github-app-configuration)
    - [13.2 Dual Authentication Architecture](#132-dual-authentication-architecture)
      - [GitHub App Installation Authentication](#github-app-installation-authentication)
      - [OAuth User Authentication](#oauth-user-authentication)
  - [14. Development Tools \& Workflow](#14-development-tools--workflow)
    - [14.1 Bun Package Manager Usage Guidelines](#141-bun-package-manager-usage-guidelines)
      - [Bun Advantages](#bun-advantages)
      - [Installing Bun](#installing-bun)
      - [Common Commands](#common-commands)
      - [Bun Configuration Files](#bun-configuration-files)
    - [14.2 Development Environment Configuration](#142-development-environment-configuration)
      - [Environment Variable Management](#environment-variable-management)
    - [14.3 Code Quality Tools](#143-code-quality-tools)
      - [Biome Configuration](#biome-configuration)
    - [14.4 Build \& Deployment](#144-build--deployment)
      - [Turborepo Configuration](#turborepo-configuration)
      - [Deployment Scripts](#deployment-scripts)
  - [15. Performance Optimization Guide](#15-performance-optimization-guide)
    - [15.1 Frontend Performance Optimization](#151-frontend-performance-optimization)
      - [React Server Components Optimization](#react-server-components-optimization)
      - [Streaming Rendering Optimization](#streaming-rendering-optimization)
      - [Performance Monitoring Configuration](#performance-monitoring-configuration)
    - [15.2 Database Performance Optimization](#152-database-performance-optimization)
      - [Query Optimization](#query-optimization)
    - [15.3 AI Performance Optimization](#153-ai-performance-optimization)
      - [Streaming Response Optimization](#streaming-response-optimization)
  - [Conclusion](#conclusion)

## 1. Project Overview

**Libra AI** is a modern open-source AI-driven development platform that provides intelligent code generation and project building capabilities similar to V0/Lovable. The project is built on a **Turborepo Monorepo** architecture using the latest web technology stack, offering developers a powerful AI-assisted development experience.

### 1.1 Core Features

- **🎯 AI Code Generation**: Intelligent code generation based on multiple AI providers (Anthropic, Azure AI, OpenRouter, xAI)
- **🏗️ Project Building**: Support for project templates with mainstream frameworks like Vite and React
- **🎨 Visual Editing**: IDE-level code editing (based on shikicode) and real-time preview functionality
- **👥 Team Collaboration**: Support for organization management, project sharing, and team collaboration features
- **🔗 Ecosystem Integration**: Deep integration with GitHub, Cloudflare, E2B, Daytona sandbox platforms
- **🚀 Instant Deployment**: One-click deployment to Cloudflare Workers with custom domain support

### 1.2 Technical Highlights

- **🔒 End-to-End Type Safety**: Complete TypeScript type coverage from database to frontend
- **🎨 Modern Design System**: Component system based on Tailwind CSS v4 + Radix UI
- **⚡ High-Performance Architecture**: React Server Components + streaming rendering + React 19 optimization
- **🛡️ Enterprise-Grade Security**: better-auth + Cloudflare plugin authentication system with Stripe billing integration
- **🌍 Internationalization Support**: Type-safe multi-language system based on Paraglide.js
- **☁️ Cloud-Native Deployment**: Complete Cloudflare Workers deployment solution with OpenNext.js support

### 1.3 Architecture Principles

- **📦 Monorepo First**: Unified code management, dependency sharing, and toolchain consistency using Turborepo
- **🔄 Separation of Concerns**: Clear separation between application layer, business logic layer, and data layer
- **🏗️ Type Safety First**: End-to-end TypeScript type coverage with Zod validation
- **🎯 Developer Experience First**: Bun package manager, Biome code formatting, hot reload support
- **📈 Observability-Driven**: Structured logging, Posthog analytics, performance tracking
- **🔧 Standardized Toolchain**: Unified Biome linting/formatting, Vitest testing configuration

## 2. Architecture Design

### 2.1 Monorepo Organization Structure

The project adopts a **Turborepo**-built Monorepo architecture with clear separation between applications and shared packages:

```text
libra/
├── apps/                    # Applications
│   ├── auth-studio/         # better-auth management interface
│   ├── builder/             # Vite build tool (independent build environment)
│   ├── cdn/                 # Hono CDN service (file upload/image processing)
│   ├── proxy/               # Proxy & container (WIP)
│   ├── deploy/              # Deployment service (Cloudflare Workers)
│   ├── deploy-workflow/     # Deployment workflow service (deprecated)
│   ├── dispatcher/          # Request routing service (authentication middleware)
│   ├── docs/                # Documentation site (Next.js + FumaDocs)
│   ├── email/               # React Email development environment
│   ├── opennext-cache/      # OpenNext cache service
│   ├── screenshot/          # Screenshot generation service
│   ├── vite-shadcn-template/# Vite project template
│   └── web/                 # Next.js 15 main application (React 19)
├── packages/                # Shared packages
│   ├── api/                 # tRPC API layer (type-safe)
│   ├── auth/                # better-auth authentication system, using Cloudflare D1
│   ├── better-auth-cloudflare/ # Cloudflare adapter
│   ├── better-auth-stripe/  # Stripe integration
│   ├── common/              # Common utilities and types
│   ├── email/               # React Email templates
│   ├── middleware/          # Cloudflare Workers middleware
│   ├── sandbox/             # E2B sandbox integration
│   ├── shikicode/           # Code highlighting components
│   ├── templates/           # Project scaffolding templates
│   ├── db/                  # Business database layer (Drizzle ORM + Neon/Hyperdrive)
│   └── ui/                  # Design system (based on Radix UI + Tailwind CSS v4)
├── scripts/                 # Build scripts and tools
├── tooling/                 # Development tool configuration
│   └── typescript-config/   # Shared TypeScript configuration
├── biome.json               # Biome configuration
├── bun.lock                 # Bun lock file
├── package.json             # Root-level dependency management (Bun workspace)
└── turbo.json               # Turborepo build configuration
```

**Core Principles:**

- **Single Responsibility**: Each package is responsible for a specific functional domain
- **Dependency Management**: Shared packages avoid duplication and reduce bundle size
- **Type Sharing**: Unified management of type definitions across packages
- **Build Optimization**: Turborepo parallel builds and intelligent caching

### 2.2 Application Architecture

#### apps/web - Main Web Application

Main application based on **Next.js 15** using App Router architecture:

```text
apps/web/
├── app/                     # Next.js App Router
│   ├── (frontend)/          # Frontend route group
│   │   ├── (dashboard)/     # Dashboard pages
│   │   │   ├── dashboard/   # User dashboard
│   │   │   └── project/     # Project management
│   │   └── (marketing)/     # Marketing pages
│   └── api/                 # API routes
│       ├── ai/              # AI-related APIs
│       ├── auth/            # Authentication APIs
│       ├── trpc/            # tRPC endpoints
│       └── webhooks/        # Webhook handling
├── components/              # UI components
│   ├── ide/                 # IDE editor components
│   ├── dashboard/           # Dashboard components
│   ├── marketing/           # Marketing components
│   └── ui/                  # Basic UI components
├── ai/                      # AI functionality modules
│   ├── models.ts            # Model management
│   ├── generate.ts          # Generation logic
│   └── prompts/             # Prompt templates
├── lib/                     # Utility functions
├── trpc/                    # tRPC client
└── env.mjs                  # Environment variables
```

#### apps/builder - Vite Build Tool

Independent **Vite + React** application for project building:

```text
apps/builder/
├── src/
│   ├── components/          # Build tool UI
│   ├── lib/                 # Build logic
│   └── utils/               # Utility functions
├── vite.config.ts           # Vite configuration
└── wrangler.jsonc           # Cloudflare Workers configuration
```

#### apps/cdn - CDN Service

Content distribution service based on **Hono**:

```text
apps/cdn/
├── src/
│   ├── routes/              # API routes
│   ├── middleware/          # Middleware
│   └── utils/               # Utility functions
├── wrangler.jsonc           # Workers configuration
└── package.json
```

#### apps/dispatcher - Request Router

Request distribution service based on **Hono**:

```text
apps/dispatcher/
├── src/
│   ├── middleware/          # Authentication middleware
│   ├── routes/              # Routing logic
│   └── utils/               # Utility functions
├── wrangler.jsonc           # Cloudflare Workers configuration
└── package.json
```

#### apps/auth-studio - Database Management

Database management interface based on **Drizzle Studio**:

```text
apps/auth-studio/
├── package.json             # Startup script configuration
├── DEV.md                   # Development documentation
└── DEV_ZH.md               # Chinese development documentation
```

**Features:**

- Provides visual management interface for authentication database
- Supports CRUD operations on data tables
- Integrates Drizzle ORM Studio tools
- Runs on port 3002

#### apps/docs - Documentation Site

Documentation system based on **Fumadocs + Next.js**:

```text
apps/docs/
├── app/                     # Next.js App Router
│   ├── [lang]/             # Multi-language routing
│   ├── layout.tsx          # Layout component
│   └── page.tsx            # Homepage
├── components/              # Documentation components
│   ├── language-switcher.tsx # Language switcher
│   ├── heading.tsx         # Heading component
│   └── scroller.tsx        # Scroll component
├── content/                 # Documentation content
│   ├── meta.json           # English metadata
│   ├── meta.zh.json        # Chinese metadata
│   ├── opensource/         # Open source documentation
│   └── platform/           # Platform documentation
├── lib/                     # Utility functions
│   ├── i18n.ts             # Internationalization configuration
│   └── translations.ts     # Translation management
├── source.config.ts         # Fumadocs configuration
└── wrangler.jsonc          # Cloudflare Workers configuration
```

**Technical Features:**

- Modern documentation framework based on Fumadocs
- Supports MDX format documentation writing
- Built-in multi-language support (Chinese and English)
- Integrated GitHub Stars display
- Deployed to Cloudflare Workers

#### apps/email - Email Template Development

Email template development environment based on **React Email**:

```text
apps/email/
├── emails/                  # Email templates
│   ├── welcomeEmail.tsx    # Welcome email
│   ├── emailVerification.tsx # Email verification
│   ├── organizationInvitation.tsx # Organization invitation
│   ├── signIn.tsx          # Sign-in email
│   └── cancellationEmail.tsx # Cancellation email
├── package.json            # Dependency configuration
└── tsconfig.json           # TypeScript configuration
```

**Features:**

- Provides real-time preview environment for email templates
- Supports React component-based email development
- Integrates @libra/email package templates

#### apps/vite-shadcn-template - Project Template

Project scaffolding based on **Vite + React + TypeScript**:

```text
apps/vite-shadcn-template/
├── src/                     # Source code
│   ├── components/         # UI components
│   ├── lib/                # Utility functions
│   └── utils/              # Helper utilities
├── public/                 # Static assets
├── components.json         # Component configuration
├── e2b.Dockerfile         # E2B container configuration
├── e2b.toml               # E2B template configuration
├── vite.config.ts         # Vite configuration
├── wrangler.jsonc         # Cloudflare Workers configuration
└── fileStructure.ts       # File structure definition
```

**Technical Features:**

- Pre-configured Vite + React + TypeScript environment
- Integrated custom UI component library
- Supports E2B, Daytona sandbox environment deployment
- Provides complete project scaffolding template
- Can be deployed to Cloudflare Workers

#### apps/deploy - Deployment Service

Cloudflare Workers deployment service based on **Hono**:

```text
apps/deploy/
├── src/
│   ├── index.ts            # Main entry point
│   ├── handlers/           # Request handlers
│   └── utils/              # Utility functions
└── wrangler.jsonc          # Workers configuration
```

**Features:**

- Handles automated project deployment
- Manages Cloudflare Pages deployment
- Handles build artifact uploads
- Integrates GitHub deployment status updates

#### apps/deploy-workflow - Deployment Workflow

Asynchronous deployment processing service based on **Cloudflare Workflows**:

```text
apps/deploy-workflow/
├── src/
│   ├── index.ts            # Workflow entry point
│   ├── steps/              # Workflow steps
│   └── types/              # Type definitions
└── wrangler.jsonc          # Workers configuration
```

**Features:**

- Asynchronously processes long-running deployment tasks
- Supports multi-step deployment processes
- Integrates E2B sandbox environment
- Real-time deployment status updates

#### apps/screenshot - Screenshot Service

Web page screenshot generation service based on **Playwright**:

```text
apps/screenshot/
├── src/
│   ├── index.ts            # Service entry point
│   ├── browser/            # Browser control
│   └── utils/              # Utility functions
└── wrangler.jsonc          # Workers configuration
```

**Features:**

- Generates project preview screenshots
- Supports different device sizes
- Automatically waits for page loading
- Cache optimization to reduce duplicate screenshots

### 2.3 Shared Package Architecture

#### @libra/ui - Design System

Custom component library based on **Radix UI and CVA**:

```typescript
// packages/ui/src/components/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background hover:bg-accent',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? SlotPrimitive.Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
```

#### @libra/api - tRPC API Layer

Type-safe API layer:

```typescript
// packages/api/src/router/project.ts
export const projectRouter = {
  create: organizationProcedure
    .input(projectSchema)
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId } = await requireOrgAndUser(ctx)
      const db = await getDbAsync()

      // Quota validation
      const quotaDeducted = await checkAndUpdateProjectUsage(orgId)
      if (!quotaDeducted) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Project quota exceeded'
        })
      }

      // Create project
      const [newProject] = await db.insert(project).values({
        name: input.name ?? 'My First Project',
        templateType: input.templateType ?? 'default',
        userId,
        organizationId: orgId,
      }).returning()

      return newProject
    }),
} satisfies TRPCRouterRecord
```

#### @libra/db - Database Layer

Database layer based on **Drizzle ORM** providing complete project management, AI functionality statistics, and subscription management:

```typescript
// packages/db/schema/project-schema.ts
import { createId } from '@paralleldrive/cuid2'
import { sql } from 'drizzle-orm'
import { boolean, integer, pgTable, text, timestamp, varchar, uniqueIndex } from 'drizzle-orm/pg-core'

// Project main table - Core project information management
export const project = pgTable('project', {
  // Primary key identifier
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey()
    .unique(),

  // Basic project information
  name: text('name').notNull(),                    // Project name
  templateType: text('template_type').notNull(),  // Template type
  url: text('url'),                               // Project access URL

  // Git integration fields
  gitUrl: text('git_url'),                        // Git repository URL
  gitBranch: text('git_branch'),                  // Git branch

  // Deployment and preview
  previewImageUrl: text('preview_image_url'),     // Preview image URL
  productionDeployUrl: text('production_deploy_url'), // Production deployment URL
  workflowId: text('workflow_id'),                // Cloudflare Workflow ID deprecated
  deploymentStatus: varchar('deployment_status', {
    enum: ['idle', 'preparing', 'deploying', 'deployed', 'failed']
  }),                                             // Deployment status

  // Custom domain management
  customDomain: text('custom_domain'),            // Custom domain
  customDomainStatus: varchar('custom_domain_status', {
    enum: ['pending', 'verified', 'active', 'failed']
  }),                                             // Domain status
  customDomainVerifiedAt: timestamp('custom_domain_verified_at', {
    withTimezone: true,
    mode: 'string'
  }),                                             // Domain verification time
  customHostnameId: text('custom_hostname_id'),   // Cloudflare hostname ID
  ownershipVerification: text('ownership_verification'), // Ownership verification

  // SSL certificate management
  sslStatus: varchar('ssl_status', {
    enum: ['pending', 'pending_validation', 'active', 'failed']
  }),                                             // SSL status

  // Project settings
  visibility: varchar('visibility', { enum: ['public', 'private'] }), // Visibility
  isActive: boolean('is_active').notNull().default(true), // Is active

  // Relationships
  userId: text('user_id').notNull(),              // User ID
  organizationId: text('organization_id').notNull(), // Organization ID
  containerId: text('container_id'),              // Container ID

  // AI functionality fields
  initialMessage: text('initial_message'),        // Initial message
  knowledge: text('knowledge'),                   // Knowledge base content
  messageHistory: text('message_history').notNull().default('[]'), // Message history

  // Timestamps
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

// Project AI usage statistics table
export const projectAIUsage = pgTable('project_ai_usage', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }), // Foreign key relationship
  organizationId: text('organization_id').notNull(),
  totalAIMessageCount: integer('total_ai_message_count').notNull().default(0), // Total AI messages
  lastUsedAt: timestamp('last_used_at', {
    withTimezone: true,
    mode: 'string'
  }).default(sql`CURRENT_TIMESTAMP`),              // Last used time
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

// Subscription resource limits table
export const subscriptionLimit = pgTable('subscription_limit', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  organizationId: text('organization_id').notNull(),
  stripeCustomerId: text('stripe_customer_id'),   // Stripe customer ID
  planName: text('plan_name').notNull(),          // Plan name
  planId: text('plan_id').notNull(),              // Plan ID
  aiNums: integer('ai_nums').notNull(),           // AI usage limit
  enhanceNums: integer('enhance_nums').notNull(), // Enhancement feature limit
  seats: integer('seats').notNull().default(1),   // Number of seats
  projectNums: integer('project_nums').notNull().default(1), // Project limit
  isActive: boolean('is_active').notNull().default(true), // Is active
  periodStart: timestamp('period_start', {
    withTimezone: true,
    mode: 'string'
  }).notNull(),                                   // Billing period start
  periodEnd: timestamp('period_end', {
    withTimezone: true,
    mode: 'string'
  }).notNull(),                                   // Billing period end
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
}, (table) => ({
  // Unique constraint: Each organization can only have one active plan
  uniqueOrgPlanActive: uniqueIndex('subscription_limit_org_plan_active_idx')
    .on(table.organizationId, table.planName)
    .where(sql`${table.isActive} = true`)
}))

// TypeScript type inference
type Project = typeof project.$inferSelect
type InsertProject = typeof project.$inferInsert
type ProjectAIUsage = typeof projectAIUsage.$inferSelect
type SubscriptionLimit = typeof subscriptionLimit.$inferSelect
```

## 3. Core Technology Stack

### 3.1 Frontend Technology Stack

#### Core Frameworks

- **Next.js 15.3.5**: App Router architecture, React Server Components, experimental React compiler
- **React 19.1.1**: Latest React version with Server/Client Components separation
- **TypeScript 5.8.3**: Strict mode with complete type coverage

#### User Interface Frameworks

- **Tailwind CSS 4.1.11**: Atomic CSS with CSS-in-CSS new syntax and CSS variables support
- **Radix UI**: Unstyled accessible primitive components (accordion, dialog, tooltip, etc.)
- **Class Variance Authority (CVA) 0.7.1**: Component variant management
- **Based on shadcn/ui design patterns**: Custom component implementation following shadcn/ui methodology
- **Lucide React 0.486.0**: Icon library
- **next-themes 0.4.6**: Theme switching support

#### State Management

- **Zustand 5.0.6**: Lightweight client-side state management
- **TanStack Query (React Query) 5.83.0**: Server-side state and cache management
- **React Hook Form 7.61.1**: High-performance form state management

#### Development Tools

- **Vite**: Fast development server (builder, template applications)
- **Turborepo 2.5.5**: Monorepo build tool
- **Biome ^2.2.2**: Code formatting and linting tool (replaces ESLint + Prettier)

### 3.2 Backend Technology Stack

#### API Layer

- **tRPC 11.4.3**: End-to-end type-safe API
- **Zod 4.0.14**: Runtime data validation and type inference
- **Hono 4.8.10**: Lightweight web framework (CDN/dispatcher services)

#### Database

- **PostgreSQL**: Main business database (via Neon + Hyperdrive)
- **SQLite**: Authentication database (Cloudflare D1)
- **Drizzle ORM 0.44.4**: Type-safe database ORM
- **Hyperdrive**: Cloudflare database connection pooling service

#### Authentication & Payment

- **better-auth 1.3.4**: Modern authentication solution
- **Stripe**: Payment and subscription management
- **GitHub OAuth**: Social login (Octokit 22.0.0)
- **Resend**: Email sending service

#### File Storage

- **Cloudflare R2**: Object storage
- **Cloudflare KV**: Key-value storage
- **E2B 1.2.0-beta.5**: Sandbox code execution environment

### 3.3 AI Integration Technology

#### AI Providers

- **Anthropic Claude**: Claude 4.0 Sonnet, integrated via @ai-sdk/anthropic
- **Azure OpenAI**: GPT-4.1, GPT-4.1 Mini, integrated via @ai-sdk/azure
- **Google Gemini**: Gemini 2.5 Pro, integrated via AI SDK
- **xAI Grok**: Integrated via @ai-sdk/xai

#### AI Tools

- **Vercel AI SDK 4.3.19**: Streaming responses and unified API
- **E2B 1.2.0-beta.5**: Sandbox code execution environment (Docker containers)
- **Shiki 3.8.1**: Code syntax highlighting

#### Generation Features

```typescript
// apps/web/ai/models.ts
export const selectModel = (
  userPlan: string,
  selectedModelId?: string,
  isFileEdit = false
): string => {
  let modelToUse = selectedModelId

  if (isFileEdit) {
    modelToUse = DEFAULT_MODELS.FILE_EDIT
  } else if (!modelToUse) {
    const defaultModel = getDefaultModelForPlan(userPlan)
    modelToUse = defaultModel.id
  } else {
    // Strict access control for non-file-edit operations
    if (!canAccessModel(userPlan, modelToUse)) {
      const requestedModel = findModelById(modelToUse)
      throw new Error(`Access denied: ${requestedModel.name} requires ${requestedModel.requiredPlan} subscription. Current plan: ${userPlan}`)
    }
  }

  return MODEL_MAPPING[modelToUse] || (isFileEdit ? DEFAULT_MODELS.FILE_EDIT_FALLBACK : DEFAULT_MODELS.FALLBACK)
}
```

### 3.4 Deployment & Infrastructure

#### Cloud Service Providers

- **Cloudflare**: Complete cloud-native deployment
  - **Workers**: Serverless computing
  - **D1**: Edge SQLite database
  - **KV**: Edge key-value storage
  - **R2**: Object storage
  - **Hyperdrive**: Database connection pooling service
  - **Workers For Platform**: Edge computing platform
  - **Cloudflare for SaaS**: Custom domain, SSL, WAF, DDoS protection
  - **Cloudflare AI Gateway**: AI request proxy

#### Deployment Tools

- **@opennextjs/cloudflare 1.6.2**: Next.js to Cloudflare adapter
- **Wrangler**: Cloudflare Workers deployment tool
- **Bun 1.2.19**: JavaScript runtime and package manager (preferred)

#### DevOps

```json
// package.json scripts
{
  "dev": "turbo dev --parallel",
  "build": "turbo build --concurrency=100%",
  "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
  "lint": "turbo lint --continue --",
  "typecheck": "turbo typecheck"
}
```

#### Monitoring & Analytics

- **Posthog**: Product analytics and user behavior tracking
- **Structured Logging**: Custom logging system (component-level categorization)
- **Error Tracking**: Integrated error monitoring and boundary handling
- **OpenTelemetry**: Observability data collection

## 4. Design System & UI Components

### 4.1 Design System Architecture

The project adopts a modern design system based on **OKLCH color space** combined with **Tailwind CSS v4**'s CSS-in-CSS new features:

```css
/* packages/ui/src/styles/variables.css */
:root {
  /* Brand colors - OKLCH format */
  --brand: oklch(66.5% 0.1804 47.04);
  --brand-foreground: oklch(75.77% 0.159 55.91);

  /* Base colors */
  --background: oklch(98% 0.01 95.1);
  --foreground: oklch(34% 0.03 95.72);
  --background-landing: oklch(100% 0.01 97.5);
  --foreground-landing: oklch(32% 0.03 95.72);

  /* Component colors */
  --card: oklch(98% 0.01 95.1);
  --card-foreground: oklch(19% 0 106.59);
  --popover: oklch(100% 0 0);
  --popover-foreground: oklch(27% 0.02 98.94);
  --primary: oklch(62% 0.14 39.04);
  --primary-foreground: oklch(100% 0 0);
  --secondary: oklch(92% 0.01 92.99);
  --secondary-foreground: oklch(43% 0.02 98.6);
  --muted: oklch(93% 0.02 90.24);
  --muted-foreground: oklch(61% 0.01 97.42);
  --accent: oklch(92% 0.01 92.99);
  --accent-foreground: oklch(27% 0.02 98.94);
  --destructive: oklch(19% 0 106.59);
  --destructive-foreground: oklch(100% 0 0);
  --border: oklch(88% 0.01 97.36);
  --input: oklch(76% 0.02 98.35);
  --ring: oklch(87% 0.0671 252);

  /* Chart colors */
  --chart-1: oklch(56% 0.13 43);
  --chart-2: oklch(69% 0.16 290.41);
  --chart-3: oklch(88% 0.03 93.13);
  --chart-4: oklch(88% 0.04 298.18);
  --chart-5: oklch(56% 0.13 42.06);

  /* Font system */
  --font-sans: Inter, sans-serif;
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: Mona_Sans, monospace;

  /* Layout variables */
  --radius: 0.625rem;
  --layout-nav-height: 3.5rem; /* 56px */
}
```

### 4.2 Component Development Patterns

All UI components follow **shadcn/ui design patterns** combined with **radix-ui** primitive components:

```typescript
// packages/ui/src/components/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot as SlotPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../lib/utils'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? SlotPrimitive : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

**Component Development Principles:**

- **CVA Variant Management**: Use class-variance-authority for unified component variant management
- **asChild Pattern**: Support component composition through Radix UI Slot
- **forwardRef**: Properly forward refs to support imperative operations
- **Type Safety**: Complete TypeScript type definitions with automatic inference

### 4.3 Style System Specifications

#### Tailwind CSS v4 Configuration

The project uses **Tailwind CSS v4**'s CSS-in-CSS new features:

```css
/* packages/ui/src/styles/globals.css */
@import "tailwindcss";
@import "./deployment-tokens.css";
@import "./utils.css";
@import "./theme.css";
@import "./variables.css";
@import "./quota.css";
@import "tw-animate-css";
@plugin 'tailwind-scrollbar';
@source "../../../../packages/ui/src/**/*.{js,ts,jsx,tsx}";

@custom-variant dark (&:where(.dark, .dark *));

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**PostCSS Configuration:**

```js
// packages/ui/postcss.config.mjs
const config = {
  plugins: ['@tailwindcss/postcss'],
}

export default config
```

#### CSS Variables Usage Guidelines

- **Must use** CSS variables for color definitions, prohibit hardcoded color values
- **Semantic naming**: Use semantic names like primary, secondary, accent
- **Theme support**: All color variables support light/dark mode switching

```css
/* ✅ Correct: Use semantic CSS variables */
.card {
  background-color: var(--card);
  border: 1px solid var(--border);
  color: var(--card-foreground);
}

/* ❌ Wrong: Hardcoded color values */
.card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #1e293b;
}
```

#### Tailwind Utility Class Guidelines

- **Prioritize** semantic utility classes (bg-primary, text-muted-foreground)
- **Avoid** arbitrary values (bg-[#fff], mt-[12px])
- **Combine** cn() utility function for conditional class names

```typescript
// ✅ Recommended: Semantic class names + conditional handling
<button className={cn(
  'bg-primary text-primary-foreground',
  'hover:bg-primary/90 transition-colors',
  disabled && 'opacity-50 cursor-not-allowed',
  className
)}>
  {children}
</button>

// ❌ Avoid: Arbitrary values and hardcoding
<button className="bg-[#3b82f6] text-white hover:bg-[#2563eb] disabled:opacity-50">
  {children}
</button>
```

#### Custom Utility Classes

The project defines multiple custom utility classes:

```css
/* packages/ui/src/styles/utils.css */
@utility glass-1 {
  backdrop-filter: blur(64px) saturate(200%);
  background-color: rgb(0 0 0 / 1%);
}

@utility glass-2 {
  backdrop-filter: blur(128px) saturate(100%);
  background-color: rgb(255 255 255 / 2%);
}

@utility fade-x {
  @apply relative overflow-hidden;
  &::before,
  &::after {
    @apply pointer-events-none absolute z-10 h-full w-8 content-[''];
  }
  &::before {
    @apply left-0 bg-gradient-to-r from-background to-transparent;
  }
  &::after {
    @apply right-0 bg-gradient-to-l from-background to-transparent;
  }
}
```

### 4.4 Theme System Implementation

The project uses **next-themes** to implement theme switching with system theme detection support:

```typescript
// apps/web/app/(frontend)/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(inter.className, 'antialiased')}>
        <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

Theme toggle component implementation:

```typescript
// components/theme-toggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { Button } from '@libra/ui'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

## 5. API Development Guidelines

### 5.1 tRPC Implementation Patterns

The project uses **tRPC** to implement end-to-end type-safe APIs with complete authentication, permission validation, and error handling mechanisms:

```typescript
// packages/api/src/trpc.ts
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const auth = await initAuth()
  const session = await auth.api.getSession({ headers: opts.headers })
  const db = await getAuthDb()
  return { db, session, ...opts }
}

// Base procedure definitions
export const publicProcedure = t.procedure

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const organizationProcedure = protectedProcedure
  .input(orgSchema)
  .use(({ ctx, next }) => {
    const activeOrganizationId = ctx.session?.session?.activeOrganizationId
    if (!activeOrganizationId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Organization ID is required',
      })
    }
    return next({
      ctx: { ...ctx, orgId: activeOrganizationId, session: ctx.session },
    })
  })
```

#### Router Implementation Examples

```typescript
// packages/api/src/router/project/basic-operations.ts
export const basicOperations = {
  create: organizationProcedure.input(projectSchema).mutation(async ({ ctx, input }) => {
    const { orgId, userId } = await requireOrgAndUser(ctx)
    const { name, initialMessage, visibility, templateType } = input

    // Quota validation
    const quotaDeducted = await checkAndUpdateProjectUsage(orgId)
    if (!quotaDeducted) {
      log.project('warn', 'Project creation failed - quota exceeded', {
        orgId,
        userId,
        operation: 'create',
      })
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Project quota exceeded' })
    }

    // Use modular project creation utilities
    return await withDbCleanup(async (db) => {
      return await createProjectWithHistory(db, {
        orgId,
        userId,
        operation: 'create',
      }, {
        name,
        templateType,
        visibility,
        initialMessage,
        templateType: templateType ?? 'default',
        visibility: (visibility as 'public' | 'private') ?? 'private',
        initialMessage,
        userId,
        organizationId: orgId,
      }).returning()

      if (!newProject) {
        log.project('error', 'Database operation failed - project creation', {
          orgId, userId, operation: 'create', projectName: name,
        })
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create project'
        })
      }

      log.project('info', 'Project created successfully', {
        orgId, userId, projectId: newProject.id, operation: 'create',
      })

      return newProject
    }),

  list: organizationProcedure.query(async ({ ctx }) => {
    const { orgId } = await requireOrgAndUser(ctx)
    const db = await getDbAsync()

    return await db.query.project.findMany({
      where: eq(project.organizationId, orgId),
      orderBy: [desc(project.updatedAt)],
    })
  }),
} satisfies TRPCRouterRecord
```

### 5.2 Data Validation & Type Safety

All API inputs use **Zod** for validation to ensure runtime type safety:

```typescript
// packages/api/src/schemas/project-schema.ts
export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').optional(),
  initialMessage: z.string().optional(),
  visibility: z.enum(['public', 'private']).optional(),
  templateType: z.string().optional(),
  attachment: z.object({
    name: z.string(),
    type: z.string(),
    content: z.string(),
  }).optional(),
  planId: z.string().optional(),
})

export const updateProjectSchema = z.object({
  projectId: z.string().cuid2('Invalid project ID'),
  name: z.string().min(1).optional(),
  visibility: z.enum(['public', 'private']).optional(),
})

export type ProjectInput = z.infer<typeof projectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
```

#### Client-side Type Inference

```typescript
// apps/web/trpc/client.ts
import { type AppRouter } from '@libra/api'
import { createTRPCReact } from '@trpc/react-query'

export const api = createTRPCReact<AppRouter>()

// Usage example - Fully type-safe
export function ProjectList() {
  const { data: projects, isLoading, error } = api.project.list.useQuery()

  const createProject = api.project.create.useMutation({
    onSuccess: (data) => {
      // data type is automatically inferred as Project
      console.log('Created project:', data.id)
    },
  })

  const utils = api.useUtils()

  const handleCreateProject = () => {
    createProject.mutate({
      name: 'New Project',
      templateType: 'nextjs',
      visibility: 'private',
      initialMessage: 'Create a todo app',
    })
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {projects?.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  )
}
```

### 5.3 Error Handling Patterns

The project uses unified error handling patterns including **tryCatch** utility functions and structured error responses:

```typescript
// packages/common/src/error.ts
type Success<T> = readonly [T, null]
type Failure<E> = readonly [null, E]
type ResultSync<T, E> = Success<T> | Failure<E>
type ResultAsync<T, E> = Promise<ResultSync<T, E>>
type Operation<T> = Promise<T> | (() => T) | (() => Promise<T>)

export async function tryCatch<T, E = Error>(
  operation: Operation<T>
): ResultAsync<T, E> {
  try {
    const result = typeof operation === 'function' ? await operation() : await operation
    return [result, null] as const
  } catch (error) {
    return [null, error as E] as const
  }
}

// Usage in tRPC procedures
export async function safeProjectOperation(projectId: string) {
  const [result, error] = await tryCatch(async () => {
    const db = await getDbAsync()
    return await db
      .select()
      .from(project)
      .where(eq(project.id, projectId))
  })

  if (error) {
    log.project('error', 'Database operation failed', {
      projectId,
      error: error.message,
    })
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Database operation failed',
    })
  }

  return result
}
```

#### Error Handling Usage Examples

```typescript
// Client-side error handling
export function ProjectList() {
  const createProject = api.project.create.useMutation({
    onError: (error) => {
      // Type-safe error handling
      console.error('Creation failed:', error.message)
      if (error.data?.code === 'FORBIDDEN') {
        alert('Project quota exhausted, please upgrade plan')
      }
    },
  })

  return (
    <Button
      onClick={() => createProject.mutate({ name: 'New Project' })}
      disabled={createProject.isPending}
    >
      {createProject.isPending ? 'Creating...' : 'Create Project'}
    </Button>
  )
}
```

### 5.4 Logging Guidelines

The project uses structured logging with component-level categorization:

```typescript
// packages/common/src/logger.ts
interface LogContext {
  userId?: string
  orgId?: string
  projectId?: string
  operation?: string
  [key: string]: any
}

export const log = {
  project: (level: 'info' | 'warn' | 'error', message: string, context?: LogContext) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      component: 'project',
      message,
      ...context,
    }))
  },
  auth: (level: 'info' | 'warn' | 'error', message: string, context?: LogContext) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      component: 'auth',
      message,
      ...context,
    }))
  },
}
```

#### Log Context Structure

```typescript
// Standard log context structure
log.project('info', 'Project operation completed', {
  userId: 'user_123',
  orgId: 'org_456',
  projectId: 'proj_789',
  operation: 'create',
  duration: 1250,
  metadata: {
    templateType: 'nextjs',
    hasInitialMessage: true,
  }
})
```

## 6. Database Design & Operations

### 6.1 Dual Database Architecture

The project adopts a dual database architecture to optimize performance and functionality:

#### Business Database - PostgreSQL (Hyperdrive)

- **Purpose**: Store core business data (projects, organizations, subscriptions)
- **Technology**: PostgreSQL + Neon + Cloudflare Hyperdrive
- **Features**: ACID transactions, complex queries, relational data integrity
- **Connection**: Via Hyperdrive connection pooling for optimal performance

#### Authentication Database - SQLite (Cloudflare D1)

- **Purpose**: Store authentication data (users, sessions, accounts)
- **Technology**: SQLite + Cloudflare D1
- **Features**: Edge distribution, low latency, simple queries
- **Integration**: better-auth native support

#### Database Selection Guide

```typescript
// Database selection logic
const getDatabase = (operation: 'auth' | 'business') => {
  switch (operation) {
    case 'auth':
      return getAuthDb() // Cloudflare D1 (SQLite)
    case 'business':
      return getDbAsync() // PostgreSQL (Hyperdrive)
    default:
      throw new Error('Invalid database operation')
  }
}
```

### 6.2 PostgreSQL Connection Configuration (Hyperdrive)

```typescript
// apps/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.HYPERDRIVE_DATABASE_URL || process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('Database connection string is required')
}

// Create connection with Hyperdrive optimization
const client = postgres(connectionString, {
  prepare: false, // Hyperdrive doesn't support prepared statements
  max: 1, // Hyperdrive handles connection pooling
})

export const db = drizzle(client, {
  schema: {
    ...projectSchema,
    ...subscriptionSchema,
    ...organizationSchema,
  },
})

// Async database getter with connection validation
export async function getDbAsync() {
  try {
    // Test connection
    await client`SELECT 1`
    return db
  } catch (error) {
    console.error('Database connection failed:', error)
    throw new Error('Database unavailable')
  }
}
```

### 6.3 Schema Design Guidelines

**Naming Conventions:**

- Table names: snake_case (e.g., `project_ai_usage`)
- Column names: snake_case (e.g., `created_at`)
- Primary keys: Always use `id` with CUID2
- Foreign keys: `{table}_id` format (e.g., `project_id`)

**Data Types:**

- IDs: `text` with CUID2 generation
- Timestamps: `timestamp` with timezone
- Enums: `varchar` with enum constraints
- JSON data: `text` with JSON validation

**Constraints:**

- All tables must have `created_at` and `updated_at`
- Foreign keys with appropriate cascade rules
- Unique constraints for business logic enforcement

### 6.4 Query Patterns

#### Basic Query Operations

```typescript
// Select with relations
const projectWithUsage = await db
  .select({
    project: project,
    aiUsage: projectAIUsage,
  })
  .from(project)
  .leftJoin(projectAIUsage, eq(project.id, projectAIUsage.projectId))
  .where(eq(project.id, projectId))

// Insert with returning
const [newProject] = await db
  .insert(project)
  .values({
    name: 'New Project',
    userId: 'user_123',
    organizationId: 'org_456',
  })
  .returning()

// Update with conditions
await db
  .update(project)
  .set({ name: 'Updated Name' })
  .where(and(
    eq(project.id, projectId),
    eq(project.organizationId, orgId)
  ))

// Delete with cascade
await db
  .delete(project)
  .where(eq(project.id, projectId))
```

#### Transaction Processing

```typescript
// Complex transaction example
const result = await db.transaction(async (tx) => {
  // Create project
  const [newProject] = await tx
    .insert(project)
    .values(projectData)
    .returning()

  // Initialize AI usage tracking
  await tx.insert(projectAIUsage).values({
    projectId: newProject.id,
    organizationId: orgId,
    totalAIMessageCount: 0,
  })

  // Update quota usage
  await tx
    .update(subscriptionLimit)
    .set({ projectNums: sql`${subscriptionLimit.projectNums} - 1` })
    .where(eq(subscriptionLimit.organizationId, orgId))

  return newProject
})
```

### 6.5 Data Integrity

#### Foreign Key Constraints and Cascade Deletion

```typescript
// Foreign key with cascade deletion
export const projectAIUsage = pgTable('project_ai_usage', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }), // Cascade delete
  // ... other fields
})

// Unique constraints for business logic
export const subscriptionLimit = pgTable('subscription_limit', {
  // ... fields
}, (table) => ({
  uniqueOrgPlanActive: uniqueIndex('subscription_limit_org_plan_active_idx')
    .on(table.organizationId, table.planName)
    .where(sql`${table.isActive} = true`)
}))
```

## 7. Authentication & Permission System

### 7.1 better-auth Integration

The project uses **better-auth** as the authentication solution with Cloudflare D1 integration:

```typescript
// packages/auth/auth-server.ts
import { withCloudflare } from '@libra/better-auth-cloudflare'
import { stripe } from '@libra/better-auth-stripe'
import { betterAuth, type Session } from 'better-auth'
import { admin, bearer, emailOTP, organization } from 'better-auth/plugins'
import { emailHarmony } from 'better-auth-harmony'

async function authBuilder() {
  const dbInstance = await getAuthDb()
  const { env } = await getCloudflareContext({ async: true })
  
  return betterAuth(
    withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: true,
        d1: {
          db: dbInstance,
          options: {
            // usePlural: true,
            // debugLogs: true,
          },
        },
        kv: env.KV,
      },
      {
        databaseHooks: {
          session: {
            create: {
              before: async (session: Session) => {
                try {
                  const organization = await getActiveOrganization(session.userId)
                  return {
                    data: {
                      ...session,
                      activeOrganizationId: organization.id,
                    },
                  }
                } catch (error) {
                  // Error handling and logging
                  throw new Error('Failed to create session')
                }
              },
            },
          },
        },
        socialProviders: {
          github: {
            clientId: envs.BETTER_GITHUB_CLIENT_ID,
            clientSecret: envs.BETTER_GITHUB_CLIENT_SECRET,
          },
        },
        plugins: [
          organization(),
          admin(),
          bearer(),
          emailOTP(),
          stripe(),
          emailHarmony(),
        ],
      }
    )
  )
}
```

### 7.2 Organization Permission Patterns

```typescript
// Permission validation middleware
export const requireOrgAndUser = async (ctx: TRPCContext) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const activeOrganizationId = ctx.session.session?.activeOrganizationId
  if (!activeOrganizationId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Organization context required'
    })
  }

  return {
    userId: ctx.session.user.id,
    orgId: activeOrganizationId,
  }
}

// Resource access validation
export const ensureOrgAccess = (
  resource: { organizationId: string },
  orgId: string,
  operation: 'read' | 'write' | 'delete'
) => {
  if (resource.organizationId !== orgId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Insufficient permissions for ${operation} operation`
    })
  }
}
```

## 8. AI Feature Development

### 8.1 AI Model Management

```typescript
// AI model configuration and access control
export const AI_MODELS = {
  'claude-3-5-sonnet': {
    provider: 'anthropic',
    requiredPlan: 'FREE',
    maxTokens: 8192,
  },
  'claude-3-opus': {
    provider: 'anthropic',
    requiredPlan: 'PRO',
    maxTokens: 4096,
  },
  'gpt-4o': {
    provider: 'openrouter',
    requiredPlan: 'PRO',
    maxTokens: 8192,
  },
} as const

export const selectModel = (
  userPlan: string,
  selectedModelId?: string,
  isFileEdit = false
): string => {
  if (isFileEdit) {
    return 'claude-3-5-sonnet' // Default for file editing
  }

  const model = AI_MODELS[selectedModelId as keyof typeof AI_MODELS]
  if (!model || !canAccessModel(userPlan, model.requiredPlan)) {
    throw new Error(`Access denied: requires ${model?.requiredPlan} subscription`)
  }

  return selectedModelId!
}
```

### 8.2 Quota & Billing System

```typescript
// Quota management with atomic operations
export async function checkAndUpdateAIMessageUsage(orgId: string): Promise<boolean> {
  const db = await getDbAsync()

  return await db.transaction(async (tx) => {
    // Get current subscription with row-level locking
    const [subscription] = await tx
      .select()
      .from(subscriptionLimit)
      .where(and(
        eq(subscriptionLimit.organizationId, orgId),
        eq(subscriptionLimit.isActive, true)
      ))
      .for('update') // Row-level lock

    if (!subscription) {
      throw new Error('No active subscription found')
    }

    // Check quota availability
    if (subscription.aiNums <= 0) {
      return false // Quota exhausted
    }

    // Atomic decrement
    await tx
      .update(subscriptionLimit)
      .set({
        aiNums: sql`${subscriptionLimit.aiNums} - 1`,
        updatedAt: sql`now()`
      })
      .where(eq(subscriptionLimit.id, subscription.id))

    return true
  })
}
```

---

**Note**: This is a comprehensive technical guidelines document covering the core architecture, technology stack, and development patterns of the Libra AI project. The document provides detailed implementation examples and best practices for developers working on the project.

## 9. State Management Patterns

### 9.1 Client-side State Management

The project uses **Zustand** for lightweight client-side state management:

```typescript
// stores/project-store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface ProjectState {
  currentProject: Project | null
  projects: Project[]
  isLoading: boolean
  setCurrentProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
  setLoading: (loading: boolean) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set, get) => ({
      currentProject: null,
      projects: [],
      isLoading: false,

      setCurrentProject: (project) => set({ currentProject: project }),
      setProjects: (projects) => set({ projects }),
      setLoading: (loading) => set({ isLoading: loading }),

      addProject: (project) => set((state) => ({
        projects: [...state.projects, project]
      })),

      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p =>
          p.id === id ? { ...p, ...updates } : p
        ),
        currentProject: state.currentProject?.id === id
          ? { ...state.currentProject, ...updates }
          : state.currentProject
      })),

      removeProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id
          ? null
          : state.currentProject
      })),
    }),
    { name: 'project-store' }
  )
)
```

### 9.2 Server-side State Management

Using **TanStack Query** for server state management with tRPC integration:

```typescript
// hooks/use-projects.ts
import { api } from '@/trpc/client'
import { useProjectStore } from '@/stores/project-store'

export function useProjects() {
  const { setProjects, setLoading } = useProjectStore()

  const {
    data: projects,
    isLoading,
    error,
    refetch
  } = api.project.list.useQuery(undefined, {
    onSuccess: (data) => {
      setProjects(data)
    },
    onSettled: () => {
      setLoading(false)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })

  const createProject = api.project.create.useMutation({
    onSuccess: (newProject) => {
      // Optimistic update
      useProjectStore.getState().addProject(newProject)

      // Invalidate and refetch
      api.useUtils().project.list.invalidate()
    },
    onError: (error) => {
      console.error('Failed to create project:', error.message)
    },
  })

  return {
    projects,
    isLoading,
    error,
    refetch,
    createProject,
  }
}
```

### 9.3 Caching Strategies

#### Smart Cache Invalidation

```typescript
// utils/cache-invalidation.ts
export const cacheInvalidationStrategies = {
  // Project-related invalidations
  onProjectCreate: (utils: any) => {
    utils.project.list.invalidate()
    utils.organization.usage.invalidate()
  },

  onProjectUpdate: (utils: any, projectId: string) => {
    utils.project.getById.invalidate({ projectId })
    utils.project.list.invalidate()
  },

  onProjectDelete: (utils: any, projectId: string) => {
    utils.project.getById.remove({ projectId })
    utils.project.list.invalidate()
    utils.organization.usage.invalidate()
  },

  // AI usage invalidations
  onAIMessageSent: (utils: any, projectId: string) => {
    utils.project.getById.invalidate({ projectId })
    utils.organization.usage.invalidate()
    utils.ai.usage.invalidate()
  },
}
```

## 10. Email System

### 10.1 React Email Integration

The project uses **React Email** for email template development:

```typescript
// packages/email/src/templates/welcome-email.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface WelcomeEmailProps {
  username: string
  loginUrl: string
}

export const WelcomeEmail = ({ username, loginUrl }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Libra AI - Start building with AI</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://libra.dev/logo.png"
          width="170"
          height="50"
          alt="Libra AI"
          style={logo}
        />
        <Heading style={h1}>Welcome to Libra AI, {username}!</Heading>
        <Text style={text}>
          Thank you for joining Libra AI. You can now start building amazing projects with AI assistance.
        </Text>
        <Link href={loginUrl} style={button}>
          Get Started
        </Link>
        <Text style={footer}>
          If you have any questions, feel free to reach out to our support team.
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const logo = {
  margin: '0 auto',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
}

const button = {
  backgroundColor: '#000',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
  margin: '20px 0',
}

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
}
```

### 10.2 Email Template System

```typescript
// packages/email/src/index.ts
export { WelcomeEmail } from './templates/welcome-email'
export { EmailVerification } from './templates/email-verification'
export { OrganizationInvitation } from './templates/organization-invitation'
export { SignInEmail } from './templates/sign-in-email'
export { CancellationEmail } from './templates/cancellation-email'

// Email sending utility
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  template,
}: {
  to: string
  subject: string
  template: React.ReactElement
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Libra AI <noreply@libra.dev>',
      to,
      subject,
      react: template,
    })

    if (error) {
      console.error('Email sending failed:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error }
  }
}
```

## 11. Error Handling & Logging

### 11.1 Unified Error Handling

The project implements comprehensive error handling across all layers:

```typescript
// packages/common/src/error-boundary.tsx
'use client'

import React from 'react'
import { Button } from '@libra/ui/components/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)

    // Log to external service
    if (typeof window !== 'undefined') {
      // Send to error tracking service
      this.logErrorToService(error, errorInfo)
    }
  }

  private logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // Integration with error tracking service
    console.error('Logging error to service:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-lg font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 11.2 Structured Logging

```typescript
// packages/common/src/logger.ts
export interface LogContext {
  userId?: string
  orgId?: string
  projectId?: string
  operation?: string
  duration?: number
  metadata?: Record<string, any>
  [key: string]: any
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private component: string

  constructor(component: string) {
    this.component = component
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      component: this.component,
      message,
      ...context,
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(logEntry, null, 2))
    } else {
      console.log(JSON.stringify(logEntry))
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(logEntry)
    }
  }

  private async sendToLoggingService(logEntry: any) {
    try {
      // Integration with logging service (e.g., Cloudflare Analytics, PostHog)
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      })
    } catch (error) {
      console.error('Failed to send log to service:', error)
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context)
  }
}

// Component-specific loggers
export const log = {
  project: new Logger('project'),
  auth: new Logger('auth'),
  ai: new Logger('ai'),
  deployment: new Logger('deployment'),
  billing: new Logger('billing'),
}
```

### 11.3 Error Monitoring

#### Frontend Error Boundaries

```typescript
// app/error.tsx - Next.js Error Boundary
'use client'

import { useEffect } from 'react'
import { Button } from '@libra/ui/components/button'
import { log } from '@libra/common'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error
    log.project.error('Application error occurred', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      url: window.location.href,
      userAgent: navigator.userAgent,
    })
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Something went wrong!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
        <Button onClick={reset} className="mt-4">
          Try again
        </Button>
      </div>
    </div>
  )
}
```

## 12. Internationalization Implementation

### 12.1 Paraglide.js Integration

The project uses **Paraglide.js** for type-safe internationalization:

#### Paraglide Configuration

```typescript
// paraglide.config.js
import { paraglide } from '@inlang/paraglide-js/config'

export default paraglide({
  project: './project.inlang',
  outdir: './src/paraglide',
  runtime: 'nextjs',
})
```

```json
// project.inlang/settings.json
{
  "sourceLanguageTag": "en",
  "languageTags": ["en", "zh"],
  "modules": [
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-empty-pattern@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-missing-translation@latest/dist/index.js"
  ],
  "plugin.inlang.messageFormat": {
    "pathPattern": "./messages/{languageTag}.json"
  }
}
```

#### Language Switching Implementation

```typescript
// components/language-switcher.tsx
'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@libra/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@libra/ui/components/dropdown-menu'
import { Languages } from 'lucide-react'
import { availableLanguageTags, languageTag } from '@/paraglide/runtime'

const languageNames = {
  en: 'English',
  zh: '中文',
} as const

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (newLang: string) => {
    const segments = pathname.split('/')
    segments[1] = newLang
    const newPath = segments.join('/')
    router.push(newPath)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguageTags.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => switchLanguage(lang)}
            className={lang === languageTag() ? 'bg-accent' : ''}
          >
            {languageNames[lang as keyof typeof languageNames]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

#### Next.js Middleware Configuration

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { availableLanguageTags } from './src/paraglide/runtime'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if pathname already includes a language
  const pathnameHasLocale = availableLanguageTags.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    // Get preferred language from headers
    const acceptLanguage = request.headers.get('accept-language')
    const preferredLanguage = getPreferredLanguage(acceptLanguage)

    // Redirect to localized path
    return NextResponse.redirect(
      new URL(`/${preferredLanguage}${pathname}`, request.url)
    )
  }

  return NextResponse.next()
}

function getPreferredLanguage(acceptLanguage: string | null): string {
  if (!acceptLanguage) return 'en'

  // Simple language detection
  if (acceptLanguage.includes('zh')) return 'zh'
  return 'en'
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
```

### 12.2 Multi-language Content Management

```typescript
// messages/en.json
{
  "welcome": "Welcome to Libra AI",
  "project": {
    "create": "Create Project",
    "name": "Project Name",
    "description": "Project Description",
    "created": "Project created successfully"
  },
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "signUp": "Sign Up"
  }
}

// messages/zh.json
{
  "welcome": "欢迎使用 Libra AI",
  "project": {
    "create": "创建项目",
    "name": "项目名称",
    "description": "项目描述",
    "created": "项目创建成功"
  },
  "auth": {
    "signIn": "登录",
    "signOut": "退出",
    "signUp": "注册"
  }
}
```

### 12.3 Localization Best Practices

#### Using Internationalization in Components

```typescript
// components/project-form.tsx
'use client'

import { useState } from 'react'
import { Button } from '@libra/ui/components/button'
import { Input } from '@libra/ui/components/input'
import { Label } from '@libra/ui/components/label'
import * as m from '@/paraglide/messages'

export function ProjectForm() {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create project logic
      console.log(m.project_created())
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">{m.project_name()}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={m.project_name()}
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '...' : m.project_create()}
      </Button>
    </form>
  )
}
```

## 13. GitHub Integration

### 13.1 GitHub App Configuration

The project integrates with GitHub through a dual authentication approach:

```typescript
// packages/auth/src/github.ts
import { Octokit } from '@octokit/rest'

export interface GitHubConfig {
  appId: string
  privateKey: string
  clientId: string
  clientSecret: string
  webhookSecret: string
}

export class GitHubService {
  private config: GitHubConfig
  private octokit: Octokit

  constructor(config: GitHubConfig) {
    this.config = config
    this.octokit = new Octokit({
      auth: config.clientSecret,
    })
  }

  // Get installation access token
  async getInstallationToken(installationId: number): Promise<string> {
    const jwt = this.generateJWT()

    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )

    const data = await response.json()
    return data.token
  }

  // Generate JWT for GitHub App authentication
  private generateJWT(): string {
    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iat: now - 60,
      exp: now + 600,
      iss: this.config.appId,
    }

    // Sign JWT with private key
    return this.signJWT(payload, this.config.privateKey)
  }

  private signJWT(payload: any, privateKey: string): string {
    // JWT signing implementation
    // In production, use a proper JWT library
    return 'signed-jwt-token'
  }
}
```

### 13.2 Dual Authentication Architecture

#### GitHub App Installation Authentication

```typescript
// For repository operations requiring installation permissions
export async function createRepository(
  installationId: number,
  repoData: {
    name: string
    description?: string
    private?: boolean
  }
) {
  const github = new GitHubService(githubConfig)
  const token = await github.getInstallationToken(installationId)

  const octokit = new Octokit({ auth: token })

  return await octokit.repos.createForAuthenticatedUser({
    name: repoData.name,
    description: repoData.description,
    private: repoData.private ?? true,
  })
}
```

#### OAuth User Authentication

```typescript
// For user-specific operations
export async function getUserRepositories(userToken: string) {
  const octokit = new Octokit({ auth: userToken })

  return await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 100,
  })
}
```

## 14. Development Tools & Workflow

### 14.1 Bun Package Manager Usage Guidelines

#### Bun Advantages

- **Performance**: 2-4x faster than npm/yarn for most operations
- **Built-in bundler**: No need for separate build tools in many cases
- **TypeScript support**: Native TypeScript execution
- **Node.js compatibility**: Drop-in replacement for Node.js

#### Installing Bun

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version
```

#### Common Commands

```bash
# Install dependencies
bun install

# Run scripts
bun run dev
bun run build
bun run test

# Add dependencies
bun add react
bun add -d typescript

# Remove dependencies
bun remove lodash

# Update dependencies
bun update

# Run TypeScript files directly
bun run src/index.ts
```

#### Bun Configuration Files

```json
// bunfig.toml
[install]
# Configure registry
registry = "https://registry.npmjs.org/"

# Configure cache
cache = true

# Configure lockfile
lockfile = true

[install.scopes]
# Scoped packages
"@company" = "https://npm.company.com/"
```

#### Workspace Configuration

```json
// package.json
{
  "name": "libra",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*",
    "tooling/*",
    "scripts"
  ],
  "scripts": {
    "dev": "turbo dev --parallel",
    "build": "turbo build",
    "test": "turbo test"
  }
}
```

#### Bun-specific Features

```typescript
// Using Bun's built-in APIs
import { file, write } from 'bun'

// File operations
const content = await file('./package.json').text()
await write('./output.txt', 'Hello from Bun!')

// Environment variables
const apiKey = Bun.env.API_KEY
```

#### Migration Guide

```bash
# Migrating from npm/yarn
1. Remove node_modules and lock files
   rm -rf node_modules package-lock.json yarn.lock

2. Install with Bun
   bun install

3. Update CI/CD configuration
   - uses: oven-sh/setup-bun@v1
     with:
       bun-version: latest
```

### 14.2 Development Environment Configuration

#### Environment Variables & Secrets

```typescript
// env.mjs - Environment variable validation
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    // Database
    DATABASE_URL: z.string().url(),
    HYPERDRIVE_DATABASE_URL: z.string().url(),
    AUTH_DB: z.any(), // Cloudflare D1 binding

    // Authentication
    BETTER_AUTH_SECRET: z.string().min(32),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),

    // AI Providers
    ANTHROPIC_API_KEY: z.string(),
    AZURE_AI_API_KEY: z.string(),
    OPENROUTER_API_KEY: z.string(),

    // Services
    RESEND_API_KEY: z.string(),
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),

    // Cloudflare
    CLOUDFLARE_API_TOKEN: z.string(),
    CLOUDFLARE_ACCOUNT_ID: z.string(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
  },
  runtimeEnv: {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    HYPERDRIVE_DATABASE_URL: process.env.HYPERDRIVE_DATABASE_URL,
    AUTH_DB: process.env.AUTH_DB,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    AZURE_AI_API_KEY: process.env.AZURE_AI_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,

    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  },
})
```

### 14.3 Code Quality Tools

#### Biome Configuration

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "*.generated.*"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noExtraBooleanCast": "error",
        "noMultipleSpacesInRegularExpressionLiterals": "error",
        "noUselessCatch": "error",
        "noUselessTypeConstraint": "error"
      },
      "correctness": {
        "noConstAssign": "error",
        "noConstantCondition": "error",
        "noEmptyCharacterClassInRegex": "error",
        "noEmptyPattern": "error",
        "noGlobalObjectCalls": "error",
        "noInvalidConstructorSuper": "error",
        "noInvalidNewBuiltin": "error",
        "noNonoctalDecimalEscape": "error",
        "noPrecisionLoss": "error",
        "noSelfAssign": "error",
        "noSetterReturn": "error",
        "noSwitchDeclarations": "error",
        "noUndeclaredVariables": "error",
        "noUnreachable": "error",
        "noUnreachableSuper": "error",
        "noUnsafeFinally": "error",
        "noUnsafeOptionalChaining": "error",
        "noUnusedLabels": "error",
        "noUnusedVariables": "error",
        "useIsNan": "error",
        "useValidForDirection": "error",
        "useYield": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "quoteProperties": "asNeeded",
      "trailingCommas": "es5",
      "semicolons": "asNeeded",
      "arrowParentheses": "always",
      "bracketSpacing": true,
      "bracketSameLine": false
    }
  },
  "json": {
    "formatter": {
      "trailingCommas": "none"
    }
  }
}
```

### 14.4 Build & Deployment

#### Turborepo Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

#### Deployment Scripts

```json
// package.json scripts
{
  "scripts": {
    "dev": "turbo dev --parallel",
    "build": "turbo build",
    "build:web": "turbo build --filter=web",
    "build:docs": "turbo build --filter=docs",
    "deploy": "turbo build && turbo deploy",
    "deploy:web": "turbo build --filter=web && cd apps/web && bun run deploy",
    "deploy:docs": "turbo build --filter=docs && cd apps/docs && bun run deploy",
    "lint": "turbo lint",
    "lint:fix": "turbo lint -- --fix",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "clean": "turbo clean && rm -rf node_modules",
    "db:generate": "cd packages/db && bun run generate",
    "db:migrate": "cd packages/db && bun run migrate",
    "db:studio": "cd packages/db && bun run studio"
  }
}
```

## 15. Performance Optimization Guide

### 15.1 Frontend Performance Optimization

#### React Server Components Optimization

```typescript
// app/dashboard/page.tsx - Server Component
import { Suspense } from 'react'
import { ProjectList } from '@/components/project-list'
import { ProjectListSkeleton } from '@/components/project-list-skeleton'
import { api } from '@/trpc/server'

export default async function DashboardPage() {
  // Server-side data fetching
  const projects = await api.project.list()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <Suspense fallback={<ProjectListSkeleton />}>
        <ProjectList initialData={projects} />
      </Suspense>
    </div>
  )
}

// components/project-list.tsx - Client Component
'use client'

import { api } from '@/trpc/client'
import type { Project } from '@libra/db'

interface ProjectListProps {
  initialData: Project[]
}

export function ProjectList({ initialData }: ProjectListProps) {
  // Client-side hydration with initial data
  const { data: projects } = api.project.list.useQuery(undefined, {
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

#### Streaming Rendering Optimization

```typescript
// app/project/[id]/loading.tsx
export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}

// app/project/[id]/page.tsx
import { Suspense } from 'react'
import { ProjectEditor } from '@/components/project-editor'
import { ProjectPreview } from '@/components/project-preview'
import { ProjectEditorSkeleton } from '@/components/project-editor-skeleton'

export default async function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Suspense fallback={<ProjectEditorSkeleton />}>
          <ProjectEditor projectId={params.id} />
        </Suspense>

        <Suspense fallback={<div className="animate-pulse h-96 bg-gray-200 rounded" />}>
          <ProjectPreview projectId={params.id} />
        </Suspense>
      </div>
    </div>
  )
}
```

#### Performance Monitoring Configuration

```typescript
// lib/performance.ts
export function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const start = performance.now()

    try {
      const result = await fn()
      const end = performance.now()
      const duration = end - start

      // Log performance metrics
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`)

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // Send to PostHog or other analytics service
        analytics.track('Performance Metric', {
          operation: name,
          duration,
          timestamp: new Date().toISOString(),
        })
      }

      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}

// Usage example
export async function createProjectWithMetrics(data: ProjectInput) {
  return measurePerformance('create-project', async () => {
    return await api.project.create.mutate(data)
  })
}
```

### 15.2 Database Performance Optimization

#### Query Optimization

```typescript
// Optimized queries with proper indexing and joins
export async function getProjectsWithUsage(orgId: string) {
  const db = await getDbAsync()

  // Single query with join instead of N+1 queries
  return await db
    .select({
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      totalAIMessages: projectAIUsage.totalAIMessageCount,
      lastUsedAt: projectAIUsage.lastUsedAt,
    })
    .from(project)
    .leftJoin(projectAIUsage, eq(project.id, projectAIUsage.projectId))
    .where(and(
      eq(project.organizationId, orgId),
      eq(project.isActive, true)
    ))
    .orderBy(desc(project.updatedAt))
    .limit(50) // Pagination
}

// Batch operations for better performance
export async function batchUpdateProjects(
  updates: Array<{ id: string; updates: Partial<Project> }>
) {
  const db = await getDbAsync()

  return await db.transaction(async (tx) => {
    const results = []

    for (const { id, updates } of updates) {
      const [updated] = await tx
        .update(project)
        .set(updates)
        .where(eq(project.id, id))
        .returning()

      results.push(updated)
    }

    return results
  })
}

// Advanced query optimization patterns
export const projectQueries = {
  // Paginated queries with optimization
  getProjectsPaginated: async (orgId: string, page = 1, limit = 20) => {
    const offset = (page - 1) * limit

    return await db.query.project.findMany({
      where: and(
        eq(project.organizationId, orgId),
        eq(project.isActive, true)
      ),
      orderBy: [desc(project.updatedAt)], // Use indexed sorting
      limit,
      offset,
      with: {
        owner: {
          columns: { id: true, name: true, email: true },
        },
      },
    })
  },

  // Batch queries optimization
  getProjectsByIds: async (projectIds: string[]) => {
    return await db.query.project.findMany({
      where: inArray(project.id, projectIds),
      with: {
        files: {
          orderBy: [desc(files.updatedAt)],
          limit: 10, // Limit associated data
        },
      },
    })
  },

  // Optimized search with full-text search
  searchProjects: async (orgId: string, query: string) => {
    return await db
      .select()
      .from(project)
      .where(and(
        eq(project.organizationId, orgId),
        or(
          ilike(project.name, `%${query}%`),
          ilike(project.description, `%${query}%`)
        )
      ))
      .orderBy(desc(project.updatedAt))
      .limit(50)
  },
}
```

### 15.3 AI Performance Optimization

#### Streaming Response Optimization

```typescript
// Optimized streaming AI responses
export async function generateWithStreaming(
  prompt: string,
  model: string,
  onChunk: (chunk: string) => void
) {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model, stream: true }),
  })

  if (!response.body) {
    throw new Error('No response body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') return

          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              onChunk(parsed.content)
            }
          } catch (error) {
            console.error('Failed to parse streaming data:', error)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

// Optimized AI response streaming
export async function optimizedStreamGeneration(
  prompt: string,
  context: GenerationContext
) {
  // 1. Preprocess prompt to reduce token usage
  const optimizedPrompt = compressPrompt(prompt, context)

  // 2. Select appropriate model
  const model = selectOptimalModel(context.complexity, context.userPlan)

  // 3. Set appropriate streaming parameters
  const stream = await streamText({
    model,
    messages: [{ role: 'user', content: optimizedPrompt }],
    temperature: 0.1, // Lower temperature for consistency
    maxTokens: calculateOptimalMaxTokens(context),
    stream: true,
  })

  // 4. Stream processing and caching
  return stream.textStream.pipe(
    new TransformStream({
      transform(chunk, controller) {
        // Real-time processing and validation
        const processedChunk = processChunk(chunk)
        controller.enqueue(processedChunk)
      }
    })
  )
}

// Helper functions for AI optimization
function compressPrompt(prompt: string, context: GenerationContext): string {
  // Remove redundant information
  let compressed = prompt.trim()

  // Apply context-specific compression
  if (context.type === 'code_generation') {
    compressed = removeCodeComments(compressed)
  }

  return compressed
}

function selectOptimalModel(complexity: 'low' | 'medium' | 'high', userPlan: string): string {
  const modelMap = {
    low: 'claude-3-haiku',
    medium: 'claude-3-5-sonnet',
    high: 'claude-3-opus',
  }

  const selectedModel = modelMap[complexity]

  // Check if user has access to the model
  if (!canAccessModel(userPlan, selectedModel)) {
    return 'claude-3-5-sonnet' // Fallback
  }

  return selectedModel
}

function calculateOptimalMaxTokens(context: GenerationContext): number {
  const baseTokens = {
    code_generation: 4096,
    text_generation: 2048,
    file_edit: 8192,
  }

  return baseTokens[context.type] || 2048
}

function processChunk(chunk: string): string {
  // Validate and sanitize chunk
  if (!chunk || typeof chunk !== 'string') {
    return ''
  }

  // Apply any necessary transformations
  return chunk.replace(/\r\n/g, '\n')
}
```

## 8. Stripe Payment Integration

### 8.1 Stripe Plugin Configuration

The project uses a custom `@libra/better-auth-stripe` plugin to integrate Stripe payment functionality:

```typescript
// packages/auth/plugins/stripe-plugin.ts
import { stripe } from '@libra/better-auth-stripe'
import { env } from '../env.mjs'
import { stripeClient } from '../utils/stripe-config'

export const stripePlugin = stripeClient
  ? [
      stripe({
        stripeClient,
        stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET || '',
        createCustomerOnSignUp: true,
        subscription: {
          enabled: true,
          getCheckoutSessionParams,
          plans: getPlans,
          authorizeReference,
          onSubscriptionComplete,
          onSubscriptionUpdate,
          onSubscriptionCancel,
          onSubscriptionDeleted,
        },
        onEvent,
        onCustomerCreate,
      })
    ]
  : []
```

### 8.2 Subscription Plan Management

```typescript
// packages/auth/utils/subscription-limits/types.ts
export const PLAN_TYPES = {
  FREE: 'libra free',
  PRO: 'libra pro',
  MAX: 'libra max'
} as const

export interface PlanLimits {
  aiNums: number
  seats: number
  projectNums: number
  uploadLimit?: number
  deployLimit?: number
  enhanceNums?: number
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  [PLAN_TYPES.FREE]: {
    aiNums: 50,
    seats: 1,
    projectNums: 3,
    uploadLimit: 10,
    deployLimit: 6,
    enhanceNums: 10,
  },
  [PLAN_TYPES.PRO]: {
    aiNums: 1000,
    seats: 5,
    projectNums: 20,
    uploadLimit: 100,
    deployLimit: 40,
    enhanceNums: 100,
  },
  [PLAN_TYPES.MAX]: {
    aiNums: 5000,
    seats: 20,
    projectNums: 100,
    uploadLimit: 500,
    deployLimit: 200,
    enhanceNums: 500,
  },
}

// Plan validation and access control
export function validatePlanAccess(
  userPlan: string,
  requiredPlan: string
): boolean {
  const planHierarchy = [PLAN_TYPES.FREE, PLAN_TYPES.PRO, PLAN_TYPES.MAX]
  const userPlanIndex = planHierarchy.indexOf(userPlan as any)
  const requiredPlanIndex = planHierarchy.indexOf(requiredPlan as any)

  return userPlanIndex >= requiredPlanIndex
}
```

### 8.3 Webhook Processing

```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { log } from '@libra/common'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    log.billing.info('Stripe webhook received', {
      eventType: event.type,
      eventId: event.id,
    })

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      default:
        log.billing.warn('Unhandled webhook event', { eventType: event.type })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    log.billing.error('Webhook processing failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 })
  }
}

async function handleSubscriptionCreated(subscription: any) {
  // Update user subscription status
  const db = await getDbAsync()

  await db.insert(subscriptionLimit).values({
    organizationId: subscription.metadata.organizationId,
    stripeCustomerId: subscription.customer,
    planName: subscription.items.data[0].price.nickname,
    planId: subscription.items.data[0].price.id,
    aiNums: PLAN_LIMITS[subscription.items.data[0].price.nickname]?.aiNums || 50,
    enhanceNums: PLAN_LIMITS[subscription.items.data[0].price.nickname]?.enhanceNums || 10,
    seats: PLAN_LIMITS[subscription.items.data[0].price.nickname]?.seats || 1,
    projectNums: PLAN_LIMITS[subscription.items.data[0].price.nickname]?.projectNums || 3,
    isActive: true,
    periodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    periodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
  })
}
```

### 9.5 Sandbox Execution Environment

The project integrates **E2B** to provide secure code execution environments, supporting user code execution in Docker containers:

#### Container Configuration

```typescript
// packages/sandbox/src/config/index.ts
import { SandboxConfig } from '../types'

export const DEFAULT_SANDBOX_CONFIGS: Record<string, Partial<SandboxConfig>> = {
  'vite-shadcn-template-libra': {
    template: 'vite-shadcn-template-libra',
    timeoutMs: 300000, // 5 minutes
    resources: {
      memory: 1024, // MB
      cpu: 2,
      disk: 2048, // MB
    },
    network: {
      enabled: true,
      allowedDomains: ['*.npmjs.org', '*.unpkg.com', '*.jsdelivr.net'],
      blockedPorts: [22, 3306, 5432],
    },
  },
  'vite-shadcn-template-builder-libra': {
    template: 'vite-shadcn-template-builder-libra',
    timeoutMs: 300000, // 5 minutes
    resources: {
      memory: 2048, // MB
      cpu: 2,
      disk: 4096, // MB
    },
    network: {
      enabled: true,
      allowedDomains: ['*.npmjs.org', '*.unpkg.com', '*.jsdelivr.net', '*.cloudflare.com'],
      blockedPorts: [22, 3306, 5432],
    },
  },
}

// Create sandbox instance
export async function createSandbox(config: SandboxConfig) {
  const factory = getSandboxFactory()
  return factory.createSandbox(config)
}
```

#### Docker Template Configuration

```dockerfile
# e2b/Dockerfile.vite
FROM oven/bun:slim

WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy project files
COPY . .

# Expose port
EXPOSE 5173

# Start command
CMD ["bun", "run", "dev", "--host"]
```

#### Configuration File (e2b.toml)

```toml
# apps/web/e2b.toml
[template]
id = "vite-react-template"
title = "Vite React Template"
description = "React + TypeScript + Vite development environment"

[template.dockerfile]
path = "./Dockerfile.vite"

[template.resources]
memory = 512
cpus = 1
disk = 1024 # MB
```

#### Sandbox Operations API

```typescript
// lib/e2b/operations.ts
export class SandboxOperations {
  private sandbox: E2B.Sandbox

  constructor(sandbox: E2B.Sandbox) {
    this.sandbox = sandbox
  }

  // Execute command
  async exec(command: string) {
    try {
      const result = await this.sandbox.process.start({
        cmd: command,
        timeout: 30000, // 30 seconds
      })

      return {
        success: true,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Write file
  async writeFile(path: string, content: string) {
    try {
      await this.sandbox.files.write(path, content)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to write file',
      }
    }
  }

  // Read file
  async readFile(path: string) {
    try {
      const content = await this.sandbox.files.read(path)
      return { success: true, content }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read file',
      }
    }
  }

  // Install packages
  async installPackages(packages: string[]) {
    const command = `bun add ${packages.join(' ')}`
    return await this.exec(command)
  }

  // Start development server
  async startDevServer() {
    try {
      const process = await this.sandbox.process.start({
        cmd: 'bun run dev',
        background: true,
      })

      // Wait for server to be ready
      await this.waitForPort(5173, 30000)

      return {
        success: true,
        processId: process.pid,
        url: `https://${this.sandbox.getHostname()}:5173`,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start dev server',
      }
    }
  }

  // Wait for port to be available
  private async waitForPort(port: number, timeout: number) {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      try {
        const result = await this.exec(`curl -f http://localhost:${port}`)
        if (result.success) {
          return true
        }
      } catch {
        // Port not ready yet
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    throw new Error(`Port ${port} not available after ${timeout}ms`)
  }
}
```

#### Security Best Practices

```typescript
// Security configuration for sandbox environments
export const SANDBOX_SECURITY_CONFIG = {
  // Network restrictions
  network: {
    allowedDomains: [
      '*.npmjs.org',
      '*.unpkg.com',
      '*.jsdelivr.net',
      '*.cloudflare.com',
      'api.github.com',
    ],
    blockedPorts: [22, 23, 25, 53, 80, 443, 993, 995, 3306, 5432, 6379, 27017],
    maxConnections: 10,
  },

  // Resource limits
  resources: {
    maxMemory: 2048, // MB
    maxCpu: 2,
    maxDisk: 4096, // MB
    maxProcesses: 50,
  },

  // Time limits
  timeouts: {
    execution: 300000, // 5 minutes
    idle: 600000, // 10 minutes
    total: 1800000, // 30 minutes
  },

  // File system restrictions
  filesystem: {
    readOnlyPaths: ['/etc', '/usr', '/bin', '/sbin'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedExtensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.css', '.html'],
  },
}

// Validate sandbox operations
export function validateSandboxOperation(operation: string, params: any): boolean {
  // Prevent dangerous operations
  const dangerousCommands = ['rm -rf', 'sudo', 'chmod 777', 'wget', 'curl']

  if (dangerousCommands.some(cmd => operation.includes(cmd))) {
    return false
  }

  // Validate file paths
  if (params.path && (params.path.includes('..') || params.path.startsWith('/'))) {
    return false
  }

  return true
}
```

### 14.5 Cloudflare Deployment Configuration

#### OpenNext Configuration

```typescript
// apps/web/open-next.config.ts
import type { OpenNextConfig } from '@opennextjs/cloudflare'

const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: 'cloudflare-node',
      converter: 'edge',
      incrementalCache: 'cloudflare-kv',
      tagCache: 'cloudflare-kv',
      queue: 'cloudflare-queue',
    },
  },
  functions: {
    'app/api/trpc/[trpc]/route': {
      runtime: 'edge',
    },
    'app/api/ai/*/route': {
      runtime: 'edge',
    },
    'app/api/webhooks/*/route': {
      runtime: 'edge',
    },
  },
  imageOptimization: {
    loader: 'custom',
  },
}

export default config
```

#### Wrangler Configuration

```json
// apps/web/wrangler.jsonc
{
  "name": "libra-web",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": ".vercel/output/static",
  "kv_namespaces": [
    {
      "binding": "CACHE_KV",
      "id": "your-kv-namespace-id",
      "preview_id": "your-preview-kv-namespace-id"
    }
  ],
  "d1_databases": [
    {
      "binding": "AUTH_DB",
      "database_name": "libra-auth",
      "database_id": "your-d1-database-id"
    }
  ],
  "hyperdrive": [
    {
      "binding": "HYPERDRIVE",
      "id": "your-hyperdrive-id"
    }
  ],
  "r2_buckets": [
    {
      "binding": "ASSETS_BUCKET",
      "bucket_name": "libra-assets"
    }
  ],
  "queues": [
    {
      "binding": "AI_QUEUE",
      "queue_name": "ai-processing"
    }
  ],
  "vars": {
    "NODE_ENV": "production",
    "NEXT_PUBLIC_APP_URL": "https://libra.dev"
  },
  "secrets": [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "GITHUB_CLIENT_SECRET",
    "ANTHROPIC_API_KEY",
    "STRIPE_SECRET_KEY",
    "RESEND_API_KEY"
  ]
}
```

#### Deployment Process

```bash
# Build and deploy script
#!/bin/bash

# Build the application
echo "Building application..."
bun run build

# Generate OpenNext build
echo "Generating OpenNext build..."
bunx @opennextjs/cloudflare@latest

# Deploy to Cloudflare Pages
echo "Deploying to Cloudflare Pages..."
bunx wrangler pages deploy .vercel/output/static --project-name=libra-web

# Deploy functions
echo "Deploying Cloudflare Workers..."
bunx wrangler deploy

echo "Deployment completed successfully!"
```

#### CI/CD Configuration

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run tests
        run: bun run test

      - name: Build application
        run: bun run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}

      - name: Generate OpenNext build
        run: bunx @opennextjs/cloudflare@latest

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy .vercel/output/static --project-name=libra-web
```

#### Custom Domain Configuration

```typescript
// lib/custom-domain.ts
export async function setupCustomDomain(domain: string) {
  // Create Cloudflare Workers route
  const route = {
    pattern: `${domain}/*`,
    zone_name: domain,
    script_name: 'libra-web',
  }

  // Set DNS records
  const dnsRecords = [
    {
      type: 'A',
      name: '@',
      content: '192.0.2.1', // Cloudflare proxy IP
      proxied: true,
    },
    {
      type: 'AAAA',
      name: '@',
      content: '100::', // Cloudflare proxy IPv6
      proxied: true,
    },
  ]

  return { route, dnsRecords }
}

// Custom domain management API
export const customDomainRouter = {
  setup: organizationProcedure
    .input(z.object({
      projectId: z.string(),
      domain: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = await requireOrgAndUser(ctx)
      const db = await getDbAsync()

      // Validate domain ownership
      const isValid = await validateDomainOwnership(input.domain)
      if (!isValid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Domain ownership validation failed'
        })
      }

      // Setup Cloudflare configuration
      const config = await setupCustomDomain(input.domain)

      // Update project with custom domain
      await db
        .update(project)
        .set({
          customDomain: input.domain,
          customDomainStatus: 'pending',
        })
        .where(and(
          eq(project.id, input.projectId),
          eq(project.organizationId, orgId)
        ))

      return { success: true, config }
    }),
}
```

#### Performance Optimization Configuration

```typescript
// apps/web/next.config.mjs
import { paraglideWebpackPlugin } from "@inlang/paraglide-js";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Enable Cloudflare development environment support
initOpenNextCloudflareForDev();

// Bundle Analyzer configuration
const withBundleAnalyzer = (await import('@next/bundle-analyzer')).default({
    enabled: process.env.ANALYZE === 'true',
    openAnalyzer: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Package transpilation configuration
    transpilePackages: [
        "@libra/ui",
        "@libra/auth",
        "@libra/db",
        "@libra/api",
        "@libra/common",
        "@libra/better-auth-cloudflare",
        "@libra/email",
        "@libra/better-auth-stripe",
        "@libra/shikicode",
        "@libra/sandbox",
        "@libra/templates",
        "@libra/middleware",
    ],

    // Webpack configuration
    webpack: (config, { isServer }) => {
        // Paraglide.js plugin
        config.plugins.push(
            paraglideWebpackPlugin({
                project: "./project.inlang",
                outdir: "./src/paraglide",
            })
        );

        // Optimize bundle size
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }

        return config;
    },

    // Image optimization
    images: {
        loader: 'custom',
        loaderFile: './imageLoader.ts',
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.cloudflare.com',
            },
            {
                protocol: 'https',
                hostname: '*.githubusercontent.com',
            },
        ],
    },

    // Experimental features
    experimental: {
        reactCompiler: true,  // React compiler optimization
        useCache: true,       // Enable caching
        serverComponentsExternalPackages: ['@libra/db'],
    },

    // Headers for security and performance
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                ],
            },
        ];
    },
};

export default withBundleAnalyzer(nextConfig);
```

#### Environment Variable Management

```typescript
// scripts/deploy-env.ts
import { execSync } from 'child_process'

const REQUIRED_SECRETS = [
  'DATABASE_URL',
  'HYPERDRIVE_DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'GITHUB_CLIENT_SECRET',
  'ANTHROPIC_API_KEY',
  'AZURE_AI_API_KEY',
  'OPENROUTER_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'CLOUDFLARE_API_TOKEN',
]

const REQUIRED_VARS = [
  'NODE_ENV=production',
  'NEXT_PUBLIC_APP_URL=https://libra.dev',
  'NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key',
]

// Set secrets
REQUIRED_SECRETS.forEach(secret => {
  const value = process.env[secret]
  if (!value) {
    console.error(`Missing required secret: ${secret}`)
    process.exit(1)
  }

  try {
    execSync(`wrangler secret put ${secret}`, {
      input: value,
      stdio: ['pipe', 'inherit', 'inherit'],
    })
    console.log(`✓ Set secret: ${secret}`)
  } catch (error) {
    console.error(`✗ Failed to set secret: ${secret}`)
  }
})

// Set variables
REQUIRED_VARS.forEach(varDef => {
  const [key, value] = varDef.split('=')
  try {
    execSync(`wrangler pages secret put ${key}`, {
      input: value,
      stdio: ['pipe', 'inherit', 'inherit'],
    })
    console.log(`✓ Set variable: ${key}`)
  } catch (error) {
    console.error(`✗ Failed to set variable: ${key}`)
  }
})
```

### 14.6 GitHub API Integration

#### GitHub Client Configuration

```typescript
// lib/github/client.ts
import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'

export class GitHubClient {
  private octokit: Octokit
  private appOctokit: Octokit

  constructor(config: {
    appId: string
    privateKey: string
    clientId: string
    clientSecret: string
  }) {
    // User OAuth client
    this.octokit = new Octokit({
      auth: config.clientSecret,
    })

    // GitHub App client
    this.appOctokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: config.appId,
        privateKey: config.privateKey,
      },
    })
  }

  // Get installation access token
  async getInstallationToken(installationId: number): Promise<string> {
    const { data } = await this.appOctokit.apps.createInstallationAccessToken({
      installation_id: installationId,
    })
    return data.token
  }

  // Create repository with installation token
  async createRepository(
    installationId: number,
    repoData: {
      name: string
      description?: string
      private?: boolean
      template_owner?: string
      template_repo?: string
    }
  ) {
    const token = await this.getInstallationToken(installationId)
    const client = new Octokit({ auth: token })

    if (repoData.template_owner && repoData.template_repo) {
      // Create from template
      return await client.repos.createUsingTemplate({
        template_owner: repoData.template_owner,
        template_repo: repoData.template_repo,
        name: repoData.name,
        description: repoData.description,
        private: repoData.private ?? true,
      })
    } else {
      // Create empty repository
      return await client.repos.createForAuthenticatedUser({
        name: repoData.name,
        description: repoData.description,
        private: repoData.private ?? true,
      })
    }
  }

  // Get user repositories
  async getUserRepositories(userToken: string) {
    const client = new Octokit({ auth: userToken })
    return await client.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    })
  }

  // Create or update file
  async createOrUpdateFile(
    installationId: number,
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string
  ) {
    const token = await this.getInstallationToken(installationId)
    const client = new Octokit({ auth: token })

    const encodedContent = Buffer.from(content).toString('base64')

    return await client.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: encodedContent,
      sha,
    })
  }

  // Get repository content
  async getRepositoryContent(
    installationId: number,
    owner: string,
    repo: string,
    path: string
  ) {
    const token = await this.getInstallationToken(installationId)
    const client = new Octokit({ auth: token })

    return await client.repos.getContent({
      owner,
      repo,
      path,
    })
  }
}
```

#### Authentication Flow Integration

```typescript
// lib/github/oauth.ts
export class GitHubOAuth {
  private clientId: string
  private clientSecret: string
  private redirectUri: string

  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID!
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET!
    this.redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`
  }

  // Generate authorization URL
  getAuthorizationUrl(state: string, scopes: string[] = ['repo', 'user']) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      state,
    })

    return `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  // Exchange code for access token
  async exchangeCode(code: string) {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
      }),
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error_description}`)
    }

    return data.access_token
  }

  // Get user information
  async getUserInfo(accessToken: string) {
    const octokit = new Octokit({ auth: accessToken })
    const { data: user } = await octokit.users.getAuthenticated()

    return {
      id: user.id,
      login: user.login,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
    }
  }
}

// Integration with better-auth
export const githubAuthRouter = {
  authorize: publicProcedure
    .input(z.object({
      redirectTo: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const oauth = new GitHubOAuth()
      const state = crypto.randomUUID()

      // Store state for validation
      await redis.setex(`github_oauth_state:${state}`, 600, JSON.stringify({
        redirectTo: input.redirectTo,
        timestamp: Date.now(),
      }))

      const authUrl = oauth.getAuthorizationUrl(state)
      return { authUrl }
    }),

  callback: publicProcedure
    .input(z.object({
      code: z.string(),
      state: z.string(),
    }))
    .mutation(async ({ input }) => {
      const oauth = new GitHubOAuth()

      // Validate state
      const stateData = await redis.get(`github_oauth_state:${input.state}`)
      if (!stateData) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired state parameter'
        })
      }

      // Exchange code for token
      const accessToken = await oauth.exchangeCode(input.code)
      const userInfo = await oauth.getUserInfo(accessToken)

      // Create or update user account
      const auth = await initAuth()
      const account = await auth.api.linkSocialAccount({
        provider: 'github',
        providerAccountId: userInfo.id.toString(),
        accessToken,
        userInfo,
      })

      return { success: true, user: account.user }
    }),
}
```

#### Project Synchronization Features

```typescript
// lib/github/sync.ts
export class ProjectSyncService {
  private github: GitHubClient

  constructor(github: GitHubClient) {
    this.github = github
  }

  // Sync project files to GitHub repository
  async syncProjectToGitHub(
    projectId: string,
    installationId: number,
    repoOwner: string,
    repoName: string
  ) {
    try {
      const db = await getDbAsync()

      // Get project data
      const [project] = await db
        .select()
        .from(projectTable)
        .where(eq(projectTable.id, projectId))

      if (!project) {
        throw new Error('Project not found')
      }

      // Get project files from sandbox or storage
      const files = await this.getProjectFiles(projectId)

      // Sync each file to GitHub
      const syncResults = []
      for (const file of files) {
        try {
          const result = await this.github.createOrUpdateFile(
            installationId,
            repoOwner,
            repoName,
            file.path,
            file.content,
            `Update ${file.path} via Libra AI`,
            file.sha
          )

          syncResults.push({
            path: file.path,
            success: true,
            sha: result.data.content?.sha,
          })
        } catch (error) {
          syncResults.push({
            path: file.path,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      // Update project with sync status
      await db
        .update(projectTable)
        .set({
          gitUrl: `https://github.com/${repoOwner}/${repoName}`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(projectTable.id, projectId))

      log.project.info('Project synced to GitHub', {
        projectId,
        repoOwner,
        repoName,
        filesCount: files.length,
        successCount: syncResults.filter(r => r.success).length,
      })

      return {
        success: true,
        syncResults,
        repositoryUrl: `https://github.com/${repoOwner}/${repoName}`,
      }
    } catch (error) {
      log.project.error('Project sync failed', {
        projectId,
        repoOwner,
        repoName,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }
    }
  }

  // Get project files from various sources
  private async getProjectFiles(projectId: string): Promise<Array<{
    path: string
    content: string
    sha?: string
  }>> {
    // Implementation depends on where project files are stored
    // This could be from E2B sandbox, R2 storage, or database

    const files = []

    // Example: Get files from sandbox
    const sandbox = await this.getSandboxForProject(projectId)
    if (sandbox) {
      const fileList = await sandbox.files.list('/')

      for (const filePath of fileList) {
        if (this.shouldSyncFile(filePath)) {
          const content = await sandbox.files.read(filePath)
          files.push({
            path: filePath,
            content,
          })
        }
      }
    }

    return files
  }

  // Determine if file should be synced
  private shouldSyncFile(filePath: string): boolean {
    const excludePatterns = [
      'node_modules/',
      '.next/',
      'dist/',
      '.git/',
      '.env',
      '.env.local',
      'bun.lock',
      'package-lock.json',
      'yarn.lock',
    ]

    return !excludePatterns.some(pattern => filePath.includes(pattern))
  }

  // Get sandbox instance for project
  private async getSandboxForProject(projectId: string): Promise<any> {
    // Implementation to get sandbox instance
    // This would integrate with your sandbox management system
    return null
  }
}
```

---

## Conclusion

This comprehensive technical guidelines document provides a complete reference for developing with the Libra AI platform. It covers:

### 🏗️ Architecture & Design

- **Modern Monorepo Structure**: Turborepo-based organization with clear separation of concerns
- **Type-Safe Development**: End-to-end TypeScript coverage with runtime validation using Zod
- **Component-Driven Design**: Radix UI + Tailwind CSS v4 design system with CVA variants

### 🚀 Performance & Scalability

- **React Server Components**: Optimized rendering with streaming and suspense
- **Edge Computing**: Complete Cloudflare Workers deployment with global distribution
- **Database Optimization**: Dual database architecture with PostgreSQL + SQLite for optimal performance

### 🤖 AI Integration

- **Multi-Provider Support**: Anthropic Claude, Azure AI, OpenRouter, and xAI integration
- **Secure Execution**: E2B sandbox environments with Docker containerization
- **Streaming Responses**: Real-time AI interactions with optimized token streaming

### 🔐 Security & Authentication

- **Modern Auth Stack**: better-auth with Cloudflare D1 and GitHub OAuth
- **Payment Processing**: Stripe integration with subscription management
- **Sandbox Security**: Comprehensive security controls for code execution environments

### 🌍 Developer Experience

- **Modern Tooling**: Bun package manager, Biome formatting, and Turborepo builds
- **Type Safety**: Complete type coverage from database to frontend with automatic inference
- **Internationalization**: Paraglide.js integration with type-safe translations
- **Error Handling**: Comprehensive error boundaries and structured logging

### 📊 Key Technical Metrics

- **15+ Core Technology Domains**: Comprehensive coverage of modern web development
- **50+ Code Examples**: Production-ready implementation patterns
- **3,900+ Lines**: Detailed technical specifications and best practices
- **End-to-End Coverage**: From database schema to deployment configuration

### 🎯 Best Practices Covered

- **API Development**: tRPC with end-to-end type safety and validation
- **State Management**: Zustand + TanStack Query for optimal data flow
- **Database Design**: Drizzle ORM with proper indexing and transaction patterns
- **Deployment**: OpenNext.js + Cloudflare Workers with CI/CD automation
- **Testing**: Comprehensive testing strategies and quality assurance

This document serves as both a learning resource for new developers and a reference guide for experienced team members, ensuring consistency and quality across the entire Libra AI codebase.

### 📚 Additional Resources

For the most up-to-date information and additional implementation details:

- **GitHub Repository**: [libra-ai/libra](https://github.com/libra-ai/libra)
- **Documentation Site**: [docs.libra.dev](https://docs.libra.dev)
- **API Reference**: [api.libra.dev](https://api.libra.dev)
- **Community Discord**: [discord.gg/libra-ai](https://discord.gg/libra-ai)

---

Last updated: July 2025 | Version 1.0
