# Libra AI Project Structure

## Monorepo Organization

Libra follows a **Turborepo monorepo** architecture with clear separation between applications and shared packages:

```
libra/
├── apps/                    # Application services
├── packages/                # Shared packages
├── tooling/                 # Development tools
├── scripts/                 # Build and utility scripts
└── [config files]           # Root configuration
```

## Applications (`apps/`)

### Core Applications
- **`web/`** - Next.js 15 main application (React 19, port 3000)
- **`builder/`** - Vite build service for project compilation (port 5173)
- **`cdn/`** - Hono CDN service for static assets (port 3004)
- **`dispatcher/`** - Request routing service with Workers for Platforms (port 3007)

### Deployment Services
- **`deploy/`** - Modern deployment service using Cloudflare Queues (port 3008)
- **`deploy-workflow/`** - Legacy deployment service using Workflows (deprecated)
- **`screenshot/`** - Screenshot generation service (port 3009)

### Development Tools
- **`auth-studio/`** - Database management interface (port 3002)
- **`docs/`** - Technical documentation site (port 3003)
- **`email/`** - React Email template development (port 3001)

### Templates & Cache
- **`vite-shadcn-template/`** - Project scaffolding template
- **`opennext-cache/`** - OpenNext cache optimization service
- **`proxy/`** - Proxy service (work in progress)

## Shared Packages (`packages/`)

### Core Infrastructure
- **`api/`** - tRPC API layer with type-safe endpoints
- **`db/`** - Database schemas and operations (Drizzle ORM + PostgreSQL)
- **`auth/`** - Authentication system (better-auth + Cloudflare D1)
- **`middleware/`** - Cloudflare Workers middleware

### UI & Components
- **`ui/`** - Design system (shadcn/ui + Tailwind CSS v4 + Radix UI)
- **`shikicode/`** - Code editor with syntax highlighting
- **`email/`** - React Email templates

### Integrations
- **`better-auth-cloudflare/`** - Cloudflare adapter for better-auth
- **`better-auth-stripe/`** - Stripe payment integration
- **`sandbox/`** - E2B and Daytona sandbox abstraction
- **`templates/`** - Project scaffolding templates

### Utilities
- **`common/`** - Shared utilities, types, and constants

## Key Configuration Files

### Root Level
- **`package.json`** - Workspace configuration and scripts
- **`turbo.json`** - Turborepo build configuration
- **`biome.json`** - Code formatting and linting rules
- **`bun.lock`** - Dependency lock file
- **`.env`** - Environment variables (copy from `.env.example`)

### Application Specific
- **`wrangler.jsonc`** - Cloudflare Workers configuration (in worker apps)
- **`next.config.js`** - Next.js configuration (in web app)
- **`vite.config.ts`** - Vite configuration (in Vite apps)
- **`drizzle.config.ts`** - Database configuration (in db package)

## Directory Conventions

### Application Structure (`apps/[app-name]/`)
```
src/                         # Source code
├── components/              # React components
├── lib/                     # Utility functions
├── routes/                  # API routes (for Hono apps)
├── utils/                   # Helper utilities
└── index.ts                 # Entry point

public/                      # Static assets (if applicable)
package.json                 # App-specific dependencies
wrangler.jsonc              # Cloudflare Workers config (if applicable)
```

### Package Structure (`packages/[package-name]/`)
```
src/                         # Source code
├── components/              # React components (UI packages)
├── lib/                     # Core functionality
├── types/                   # TypeScript type definitions
└── index.ts                 # Package entry point

package.json                 # Package configuration with exports
```

### Next.js App Structure (`apps/web/`)
```
app/                         # Next.js App Router
├── (frontend)/              # Route groups
│   ├── (dashboard)/         # Dashboard pages
│   └── (marketing)/         # Marketing pages
├── api/                     # API routes
│   ├── auth/                # Authentication endpoints
│   ├── trpc/                # tRPC endpoints
│   └── webhooks/            # Webhook handlers
└── globals.css              # Global styles

components/                  # React components
├── ui/                      # Basic UI components
├── dashboard/               # Dashboard-specific components
├── ide/                     # IDE editor components
└── marketing/               # Marketing components

lib/                         # Utility functions
trpc/                        # tRPC client configuration
ai/                          # AI functionality
paraglide/                   # Generated i18n files
```

## Import Conventions

### Package Imports
```typescript
// Internal package imports
import { Button } from '@libra/ui/components/button'
import { api } from '@libra/api'
import { db } from '@libra/db'

// Relative imports within same package
import { utils } from '../lib/utils'
import { Component } from './component'
```

### Path Aliases (configured in tsconfig.json)
```typescript
// Common aliases in apps
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { api } from '@/trpc/client'
```

## File Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Pages**: kebab-case (`user-settings/page.tsx`)
- **API Routes**: kebab-case (`api/user-profile/route.ts`)
- **Types**: PascalCase with `.types.ts` suffix (`User.types.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

## Environment Variables

- **Root `.env`** - Shared environment variables
- **App-specific `.env`** - Application-specific variables
- **`.env.example`** - Template for required variables
- **`.dev.vars`** - Cloudflare Workers local development variables

## Development Workflow

1. **Install dependencies**: `bun install` (root level)
2. **Start development**: `bun dev` (all services) or `bun dev:web` (web only)
3. **Build**: `bun build` (all packages)
4. **Test**: `bun test` (run tests)
5. **Format**: `bun format:fix` (format code)
6. **Deploy**: `bun deploy` (to Cloudflare Workers)