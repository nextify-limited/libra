# Libra AI Technology Stack

## Build System & Package Management

- **Package Manager**: Bun 1.2.21 (primary), npm/yarn as fallback
- **Monorepo**: Turborepo 2.5.6 with workspace management
- **Build Tool**: Turbo build system with parallel execution and intelligent caching

## Core Technology Stack

### Frontend
- **Framework**: Next.js 15.5.2 with App Router and React 19.1.1
- **Language**: TypeScript 5.9.2+ with strict mode
- **Styling**: Tailwind CSS v4.1.12 + shadcn/ui components
- **UI Library**: Radix UI primitives with custom design system
- **State Management**: Zustand 5.0.8 + TanStack Query 5.85.6
- **Animation**: Motion 12.23.12 (Framer Motion successor)

### Backend & API
- **API Layer**: tRPC 11.4.3+ for end-to-end type safety
- **Edge Runtime**: Hono 4.8.10+ for Cloudflare Workers
- **Validation**: Zod 4.1.5 for schema validation
- **Authentication**: better-auth 1.3.7 with Cloudflare D1 adapter

### Database
- **Primary DB**: PostgreSQL via Neon with Cloudflare Hyperdrive
- **Auth DB**: Cloudflare D1 (SQLite) for authentication data
- **ORM**: Drizzle ORM 0.44.5 with migrations via drizzle-kit
- **Connection**: Hyperdrive for PostgreSQL connection pooling

### AI & Sandbox
- **AI SDK**: Vercel AI SDK 5.0.29 with multi-provider support
- **AI Models**: Anthropic Claude, Azure OpenAI, Google Gemini, DeepSeek, xAI
- **Sandboxes**: E2B 1.2.0-beta.5 and Daytona for secure code execution
- **Code Highlighting**: Shiki 3.12.1 with custom transformers

### Infrastructure
- **Deployment**: Cloudflare Workers with OpenNext.js 1.7.0
- **CDN**: Cloudflare R2 for static assets
- **Email**: React Email with template system
- **Payments**: Stripe integration with better-auth-stripe
- **Analytics**: PostHog for user analytics

## Development Tools

### Code Quality
- **Linting/Formatting**: Biome ^2.2.2 (replaces ESLint + Prettier)
- **Testing**: Vitest 3.2.4 with React Testing Library
- **Type Checking**: TypeScript with strict configuration
- **Code Standards**: Single quotes, 2-space indentation, 100 char line width, semicolons as needed

### Internationalization
- **i18n**: Paraglide.js 2.2.0 for type-safe translations
- **Languages**: English (primary), Chinese (secondary)

## Common Commands

### Development
```bash
# Install dependencies
bun install

# Start all services in development
bun dev

# Start specific app
cd apps/web && bun dev

# Start main web app only (excludes Stripe)
bun dev:web
```

### Building & Testing
```bash
# Build all packages
bun build

# Type checking
bun typecheck

# Run tests
bun test

# Format code
bun format:fix

# Lint and fix
bun lint:fix
```

### Database Operations
```bash
# Generate migrations
bun migration:generate

# Run migrations locally
bun migration:local

# Database studio (auth data)
cd apps/auth-studio && bun dev
```

### Deployment
```bash
# Deploy to Cloudflare Workers
bun deploy

# Deploy with cache optimization
bun deploy:cache

# Preview deployment
bun preview
```

### Environment Management
```bash
# Copy environment template
cp .env.example .env

# Run with environment variables
bun with-env <command>
```

## Architecture Patterns

- **Monorepo Structure**: Apps and packages separation with shared dependencies
- **Type Safety**: End-to-end TypeScript with tRPC for API contracts
- **Server Components**: React 19 Server Components for data fetching
- **Edge-First**: Cloudflare Workers for global distribution
- **Dual Database**: PostgreSQL for business data, D1 for auth data
- **Streaming**: AI responses and UI updates via streaming patterns