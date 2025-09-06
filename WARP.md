# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Essential Development Commands

### Initial Setup
```bash
# Clone and install dependencies
git clone https://github.com/nextify-limited/libra.git
cd libra
bun install

# Generate i18n files for main web app (optional but recommended)
cd apps/web && bun run prebuild && cd ../..

# Configure environment
cp .env.example .env
# Edit .env with required API keys and database URLs
```

### Database Setup
```bash
# PostgreSQL (business data) - run from project root
cd packages/db
bun db:generate  # Generate migrations
bun db:migrate   # Apply migrations

# D1/SQLite (authentication data) - test connection first
cd apps/web && bun wrangler d1 execute libra --local --command='SELECT 1'

# Then run auth migrations
cd packages/auth
bun db:generate
bun db:migrate
```

### Development
```bash
# Start all services (from root)
bun dev

# Start only web app (most common for development)
bun dev:web

# Start specific app
cd apps/[app-name] && bun dev
```

### Testing
```bash
# Run tests in specific packages (no root-level test script)
cd apps/web && bun test
cd packages/auth && bun test

# Watch mode for tests
bun test:watch  # In specific packages that support it
```

### Code Quality
```bash
# Lint and format code (using Biome)
bun lint         # Check for issues
bun lint:fix     # Auto-fix issues
bun format       # Check formatting
bun format:fix   # Auto-format code

# Type checking
bun typecheck    # Check TypeScript across monorepo
```

### Building & Deployment
```bash
# Build all packages
bun build

# Preview deployment (from root)
bun preview

# Deploy to Cloudflare
bun deploy

# Deploy cache service
bun deploy:cache
```

## Architecture Overview

### Monorepo Structure
This is a Turborepo monorepo with applications in `apps/` and shared packages in `packages/`. Key services:

- **apps/web**: Main Next.js 15 application (React 19) - the primary user interface
- **apps/builder**: Vite build service for compiling user projects
- **apps/cdn**: Hono-based CDN service for static assets and file management
- **apps/deploy**: Deployment service V2 using Cloudflare Queues for async deployment
- **apps/dispatcher**: Request routing service using Workers for Platforms
- **apps/auth-studio**: Database management console for authentication data
- **apps/screenshot**: Screenshot generation service using Cloudflare Queues

### Core Technology Stack
- **Runtime**: Bun 1.2.19+ for package management and runtime
- **Frontend**: Next.js 15.3.5 with React 19, Tailwind CSS v4, shadcn/ui
- **Backend**: Hono web framework for Cloudflare Workers
- **Database**: Dual setup - PostgreSQL (Neon + Hyperdrive) for business data, Cloudflare D1 for auth
- **API**: tRPC 11.4.3+ for type-safe APIs
- **Auth**: better-auth 1.3.3 with Cloudflare and Stripe plugins
- **AI**: AI SDK 4.3.19 supporting Claude, OpenAI, Gemini, DeepSeek

### Database Architecture
The project uses a **dual database** architecture:

1. **PostgreSQL** (via Neon + Hyperdrive): Business data (projects, organizations, etc.)
   - Schema in `packages/db/src/schema/`
   - Migrations in `packages/db/migrations/`
   - Connection via Hyperdrive for pooling

2. **Cloudflare D1** (SQLite): Authentication data
   - Schema in `packages/auth/src/schema.ts`
   - Migrations in `packages/auth/migrations/`
   - Local testing with Wrangler D1

### API Layer (tRPC)
API routes are in `packages/api/src/router/`:
- Type-safe from database to client
- Zod validation for inputs
- Organized by feature (auth, projects, organization, etc.)

### Authentication System
Uses better-auth with:
- GitHub OAuth and email/magic code authentication
- Organization and permission management
- Stripe integration for subscriptions
- Session management with D1 storage

### AI Integration
Multi-model support through AI SDK:
- Providers: Claude, OpenAI, Azure AI, Gemini, DeepSeek, xAI, OpenRouter
- Sandbox execution via E2B and Daytona
- Quota management and billing integration
- Context-aware code generation

### Deployment Architecture
All services deploy to Cloudflare Workers:
- **Workers for Platforms**: Multi-tenant project deployment
- **Deployment Service V2** (`apps/deploy`): Queue-based async deployment
- **Dispatcher** (`apps/dispatcher`): Routes requests to user Worker instances
- **Custom Domains**: Via Cloudflare SaaS for Platforms

## Key Configuration Files

- **turbo.json**: Turborepo build configuration and task orchestration
- **biome.json**: Code formatting and linting (replaces ESLint/Prettier)
- **wrangler.jsonc**: Cloudflare Workers configuration (per app)
- **.env**: Environment variables (copy from .env.example)
- **drizzle.config.ts**: Database configuration for migrations

## Environment Variables

Critical environment variables (see .env.example for full list):
- `NEXT_PUBLIC_APP_URL`: Main application URL
- `POSTGRES_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Authentication secret
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account for deployments
- `CLOUDFLARE_API_TOKEN`: Cloudflare API access
- AI provider keys: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, etc.
- `E2B_API_KEY` or `DAYTONA_API_KEY`: Sandbox execution

## Local Development Ports

When running `bun dev`, services are available at:
- Main App: http://localhost:3000
- Email Preview: http://localhost:3001
- Auth Studio: http://localhost:3002
- Documentation: http://localhost:3003
- CDN Service: http://localhost:3004
- Build Service: http://localhost:5173
- Dispatcher: http://localhost:3007
- Deploy Service: http://localhost:3008
- Screenshot Service: http://localhost:3009

## Working with Cloudflare Services

The project heavily uses Cloudflare services:
- **Workers**: Serverless compute for all services
- **D1**: SQLite database for authentication
- **KV**: Key-value storage for caching
- **R2**: Object storage for files and builds
- **Queues**: Async task processing for deployments
- **Durable Objects**: State management and sessions
- **Hyperdrive**: PostgreSQL connection pooling

### Testing Cloudflare Services Locally
```bash
# Test D1 database
cd apps/web && bun wrangler d1 execute libra --local --command='SELECT 1'

# Run with Cloudflare environment
cd apps/[service] && wrangler dev
```

## Common Development Tasks

### Adding a New API Endpoint
1. Add route in `packages/api/src/router/[feature].ts`
2. Define Zod schema for input validation
3. Implement business logic with proper error handling
4. Use in frontend with tRPC client hooks

### Modifying Database Schema
```bash
# For PostgreSQL (business data)
cd packages/db
# Edit schema in src/schema/
bun db:generate  # Generate migration
bun db:migrate   # Apply locally

# For D1 (auth data)
cd packages/auth
# Edit src/schema.ts
bun db:generate
bun db:migrate
```

### Working with AI Features
- AI providers configured in `apps/web/lib/models/`
- Streaming responses handled via AI SDK
- Sandbox execution through `packages/sandbox/`
- Context management in conversation handlers

### Debugging Tips
- Use browser DevTools for frontend debugging
- Check Cloudflare Workers logs: `wrangler tail` or dashboard
- Database studio: `bun studio:dev` in auth package
- tRPC errors show in Network tab with full stack traces
- React Query DevTools available in development

## CI/CD and Deployment

GitHub Actions workflows in `.github/workflows/`:
- **web.yml**: Deploy main application
- **cdn.yml**: Deploy CDN service
- **deploy.yml**: Deploy deployment service
- **dispatcher.yml**: Deploy routing service
- **screenshot.yml**: Deploy screenshot service
- **docs.yml**: Deploy documentation

### Manual Deployment
```bash
# Deploy main app to Cloudflare
cd apps/web
bun run deploy

# Deploy other services
cd apps/[service]
wrangler deploy
```

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check POSTGRES_URL and HYPERDRIVE_ID in .env
2. **D1 migration failures**: Ensure D1 database exists: `wrangler d1 create libra`
3. **Build failures**: Clear cache with `bun clean:workspaces` and reinstall
4. **Type errors**: Run `bun typecheck` to identify issues
5. **Cloudflare deployment errors**: Verify CLOUDFLARE_ACCOUNT_ID and API token permissions
6. **AI features not working**: Check API keys for AI providers in .env

### Resetting Development Environment
```bash
# Clean all build artifacts and caches
bun clean:workspaces
rm -rf node_modules
bun install

# Reset databases
cd packages/db && bun db:migrate
cd packages/auth && bun db:migrate
```

## Important Patterns

### Error Handling
- Use custom error classes in `packages/common/src/errors/`
- Consistent error responses via tRPC error handling
- Frontend error boundaries for graceful failures

### State Management
- Server state: React Query with tRPC
- Client state: Zustand stores in `apps/web/stores/`
- Form state: React Hook Form with Zod validation

### Component Development
- Use components from `packages/ui/` design system
- Follow shadcn/ui patterns with Radix UI primitives
- Styling with Tailwind CSS v4 and CSS variables

### Testing Strategy
- Unit tests with Vitest
- Component testing with React Testing Library
- No E2E tests currently configured
- Run tests in specific packages, not from root
