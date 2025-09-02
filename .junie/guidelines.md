# Libra AI Development Guidelines

*Generated on 2025-07-26 22:35, reviewed and updated on 2025-07-26 22:43, final review completed on 2025-07-26 22:46*

## Overview

Libra AI is a modern open-source AI-driven development platform built on **Turborepo Monorepo** architecture. This document provides essential development guidelines for advanced developers working on this project.

## Build/Configuration Instructions

### Prerequisites
- **Node.js**: >=24
- **npm**: >=11  
- **Package Manager**: Bun 1.2.19 (required)
- **Database**: PostgreSQL (for testing and development)

### Initial Setup
```bash
# Install dependencies
bun install

# Fix Biome permissions (macOS/Linux)
bun run fix-biome-permissions

# Set up environment variables
cp .env.example .env.local
# Configure your environment variables
```

### Development Commands
```bash
# Start development servers (all apps in parallel)
bun run dev

# Start web app only (excludes Stripe service)
bun run dev:web

# Build all packages and apps
bun run build

# Type checking across all workspaces
bun run typecheck

# Format code (check only)
bun run format

# Format and fix code
bun run format:fix

# Lint code (check only)
bun run lint

# Lint and auto-fix issues
bun run lint:fix
```

### Build System Architecture
- **Turborepo**: Orchestrates builds with dependency-aware task execution
- **Workspaces**: `apps/*`, `packages/*`, `tooling/*`, `scripts`
- **Build Outputs**: `.next/**`, `dist/**`, `build/**`, `paraglide/**`
- **Caching**: Remote caching enabled with signature verification
- **Concurrency**: Builds run at 100% concurrency for optimal performance

### Database Operations
```bash
# Generate database migrations
bun run migration:generate

# Run migrations locally
bun run migration:local

# Open database studio
bun run studio:dev
```

### Deployment
```bash
# Preview build (Cloudflare)
bun run preview

# Deploy to production (Cloudflare)
bun run deploy

# Deploy cache worker
bun run deploy:cache
```

## Testing Information

### Testing Framework
- **Framework**: Vitest v3.2.4
- **Environment**: Node.js with globals enabled
- **Database**: PostgreSQL test database
- **Coverage**: V8 provider with text, JSON, and HTML reports

### Running Tests

#### Global Test Commands
```bash
# Run all tests across workspaces
turbo test

# Run tests with coverage
turbo test --coverage
```

#### Individual Package Tests
```bash
# Run tests in specific package
cd packages/auth
bun test

# Run tests in web app
cd apps/web
bun run test

# Run tests in watch mode
bun run test:watch
```

### Test Configuration
Each package has its own `vitest.config.ts` with:
- **Test Isolation**: Uses 'forks' pool for proper isolation
- **Setup Files**: Package-specific setup files in `__tests__/setup.ts`
- **Environment Variables**: Configured for test database connections
- **Path Aliases**: Configured for `@libra/*` package imports
- **Coverage Exclusions**: node_modules, dist, build, *.d.ts, *.config.*

### Test Organization
```
packages/[package-name]/
├── utils/
│   └── __tests__/
│       ├── setup.ts           # Test setup and configuration
│       ├── feature.test.ts    # Feature-specific tests
│       └── integration.test.ts # Integration tests
└── vitest.config.ts           # Vitest configuration
```

### Writing Tests
Follow these patterns when creating tests:

```typescript
/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * feature.test.ts
 * Copyright (C) 2025 Nextify Limited
 */

import { describe, it, expect } from 'vitest'
import type { YourType } from '../your-module'

describe('Feature Name', () => {
  it('should describe what the test does', () => {
    // Test implementation
    expect(result).toBe(expected)
  })
})
```

### Test Example
The testing framework has been verified to work correctly. You can run tests using:

```bash
# Run tests in a specific package
cd packages/auth
bun test

# Run all tests across workspaces
turbo test
```

## Code Style and Development Practices

### Code Formatting
- **Tool**: Biome v^2.2.2 (replaces ESLint + Prettier)
- **Line Width**: 100 characters
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for JS/JSX
- **Semicolons**: As needed (ASI-safe)
- **Trailing Commas**: ES5 style

### TypeScript Configuration
- **Shared Config**: `@libra/typescript-config/base.json`
- **Path Mapping**: Configured with `@/*` and `@libra/*` aliases
- **Strict Mode**: Enabled across all packages
- **Next.js Integration**: Configured for App Router

### Linting Rules (Biome)
**Enabled (Error Level)**:
- `useAsConstAssertion` - Prefer const assertions
- `useDefaultParameterLast` - Default parameters at end
- `useEnumInitializers` - Initialize enum values
- `useSelfClosingElements` - Self-closing JSX elements
- `useNumberNamespace` - Use Number namespace methods
- `noInferrableTypes` - Avoid redundant type annotations

**Disabled for Project Needs**:
- `noEmptyInterface` - Allow empty interfaces
- `noExplicitAny` - Allow explicit any types
- `noDangerouslySetInnerHtml` - Allow dangerouslySetInnerHTML (React)
- `noSvgWithoutTitle` - Allow SVGs without titles

### File Organization
```
apps/web/
├── ai/                    # AI integration and providers
├── app/                   # Next.js App Router
│   ├── (frontend)/        # Frontend route groups
│   └── api/               # API routes
├── components/            # React components (by feature)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── trpc/                  # tRPC client configuration
└── env.mjs               # Environment variables
```

### Import Conventions
```typescript
// External dependencies first
import { z } from 'zod/v4'  // Always use zod/v4, never 'zod'
import { NextRequest } from 'next/server'

// Internal imports with path aliases
import { Button } from '@libra/ui/button'
import { api } from '@/trpc/server'

// Type imports separately
import type { User } from '@libra/auth'
```

### Zod v4 Guidelines
**Critical**: Always import from `'zod/v4'`, never `'zod'`

```typescript
import { z } from 'zod/v4'

// Type inference pattern (required)
export type User = z.infer<typeof User>
export const User = z.object({
  email: z.email(),        // Use z.email(), not z.string().email()
  age: z.int().min(18),    // Use z.int(), not z.number().int()
})
```

### License Headers
All source files must include SPDX license headers:

```typescript
/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * filename.ts
 * Copyright (C) 2025 Nextify Limited
 */
```

### Environment Management
- **Development**: `.env.local` for local overrides
- **Production**: Environment variables via deployment platform
- **Testing**: Configured in vitest.config.ts files
- **Validation**: Uses `@t3-oss/env-nextjs` for type-safe env vars

### Database Schema Management
- **ORM**: Drizzle ORM v0.44.3
- **Migrations**: Generated with `drizzle-kit generate`
- **Studio**: Access via `bun run studio:dev`
- **Seeding**: Uses `drizzle-seed` for test data

### Performance Considerations
- **Bundle Analysis**: Use `bun run build` to check bundle sizes
- **Code Splitting**: Leverage Next.js automatic code splitting
- **Image Optimization**: Use Next.js Image component
- **Caching**: Turborepo handles build caching automatically

### Debugging Tips
- **TypeScript Errors**: Run `bun run typecheck` for detailed type errors
- **Build Issues**: Check `turbo.json` task dependencies
- **Test Failures**: Use `--reporter=verbose` for detailed test output
- **Database Issues**: Verify connection strings in test environment

### Monorepo Best Practices
- **Package Dependencies**: Use workspace protocol (`workspace:*`)
- **Shared Code**: Place in `packages/common` for cross-package utilities
- **Build Order**: Turborepo handles dependency-aware builds automatically
- **Version Management**: Use changesets for coordinated releases

### Development Workflow
1. **Feature Development**: Create feature branch from main
2. **Code Quality**: Run `bun run format:fix && bun run lint:fix`
3. **Type Safety**: Ensure `bun run typecheck` passes
4. **Testing**: Write and run tests for new functionality
5. **Build Verification**: Ensure `bun run build` succeeds
6. **Documentation**: Update relevant documentation

This document provides the essential information for advanced developers to effectively work with the Libra AI codebase. For additional details, refer to the comprehensive cursor rules in `.cursor/rules/` and individual package documentation.