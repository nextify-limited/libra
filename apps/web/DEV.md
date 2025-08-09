# apps/web Development Documentation

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg)](https://www.typescriptlang.org/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)

> **Libra AI-Powered Web Application - AI-Native Development Experience**

Libra Web application is a modern AI-native development experience platform built on Next.js 15 and React 19, providing IDE-like interface and experience, integrating AI assistants, GitHub integration, team collaboration, and other features to create the core application of the Libra ecosystem.

## Table of Contents

- [apps/web Development Documentation](#appsweb-development-documentation)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
    - [Core Capabilities](#core-capabilities)
    - [Technical Highlights](#technical-highlights)
  - [Architecture Design](#architecture-design)
    - [Project Structure](#project-structure)
    - [Core Architecture Patterns](#core-architecture-patterns)
      - [1. Route Organization Structure](#1-route-organization-structure)
      - [2. Online IDE Component](#2-online-ide-component)
      - [3. AI Code Generation Flow](#3-ai-code-generation-flow)
  - [Technology Stack](#technology-stack)
    - [Frontend Framework](#frontend-framework)
    - [State Management](#state-management)
    - [AI Integration](#ai-integration)
    - [Development Tools](#development-tools)
  - [Core Features](#core-features)
    - [1. User Authentication System](#1-user-authentication-system)
      - [Email Login Form](#email-login-form)
      - [Permission Management](#permission-management)
    - [2. AI Native Integration](#2-ai-native-integration)
      - [Model Providers](#model-providers)
  - [Local Development](#local-development)
    - [Environment Setup](#environment-setup)
      - [1. Basic Configuration](#1-basic-configuration)
      - [2. Start Development Server](#2-start-development-server)
      - [3. Development Tools Configuration](#3-development-tools-configuration)
    - [Development Standards](#development-standards)
      - [Component Development Standards](#component-development-standards)
      - [Hook Development Standards](#hook-development-standards)
      - [API Route Standards](#api-route-standards)
    - [Testing Strategy](#testing-strategy)
      - [1. Unit Testing](#1-unit-testing)
      - [2. Component Testing](#2-component-testing)
  - [Performance Optimization](#performance-optimization)
    - [1. Code Splitting and Lazy Loading](#1-code-splitting-and-lazy-loading)
      - [Dynamic Imports](#dynamic-imports)
      - [Bundle Analysis](#bundle-analysis)
    - [2. Caching Strategy](#2-caching-strategy)
      - [React Cache](#react-cache)
      - [Client-side Cache](#client-side-cache)
    - [3. React 19 Feature Optimization](#3-react-19-feature-optimization)
      - [Server Components Optimization](#server-components-optimization)
      - [Concurrent Features](#concurrent-features)
  - [Security Measures](#security-measures)
    - [1. Error Handling](#1-error-handling)
      - [Global Error Boundary](#global-error-boundary)
  - [Deployment Configuration](#deployment-configuration)
    - [Cloudflare Workers Deployment](#cloudflare-workers-deployment)
      - [1. Configuration Files](#1-configuration-files)
      - [2. OpenNext Configuration](#2-opennext-configuration)
      - [3. Deployment Script](#3-deployment-script)
    - [Environment Variable Management](#environment-variable-management)
      - [Production Environment Configuration](#production-environment-configuration)
      - [Development Environment Configuration](#development-environment-configuration)
  - [API Documentation](#api-documentation)
    - [tRPC Route Structure](#trpc-route-structure)
      - [1. Client Configuration](#1-client-configuration)
      - [2. Server-side Calls](#2-server-side-calls)
  - [Summary](#summary)
    - [Core Advantages](#core-advantages)
    - [Technical Features](#technical-features)
    - [Development Standards](#development-standards-1)

## Features

### Core Capabilities

- **Multi-Model AI Native Support**: Integrated AI models (Anthropic Claude, Azure OpenAI, XAI) providing intelligent assistance
- **Modern Online IDE**: IDE-like development experience and interface interaction
- **Serverless Deployment**: Serverless architecture deployed to Cloudflare Workers
- **Complete Team Collaboration**: Organization management, permission control, member management
- **Deep GitHub Integration**: Bidirectional integration (OAuth + App) for code synchronization
- **Flexible Subscription Billing**: Stripe-based subscription and billing system
- **Internationalization**: Multi-language support based on Paraglide.js

### Technical Highlights

- **Modern Architecture**: Based on Next.js 15 App Router and React 19 Server Components
- **Type Safety**: End-to-end TypeScript type safety and tRPC type-safe communication
- **Component Design**: Design system and reusable components based on @libra/ui
- **Performance Optimization**: Cloudflare Workers deployment and CDN acceleration
- **Developer Experience**: Turbo-based monorepo development toolchain

## Architecture Design

### Project Structure

```
apps/web/
├── app/                         # Next.js 15 App Router
│   ├── (frontend)/              # Frontend route group
│   │   ├── (dashboard)/         # Dashboard routes
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   │   ├── admin/       # Admin panel
│   │   │   │   ├── billing/     # Billing pages
│   │   │   │   ├── integrations/ # Integration management
│   │   │   │   ├── teams/       # Team management
│   │   │   │   └── session/     # Session management
│   │   │   └── project/[id]/    # Project IDE page
│   │   └── (marketing)/         # Marketing page group
│   │       ├── (auth)/          # Authentication pages
│   │       ├── contact/         # Contact page
│   │       ├── privacy/         # Privacy policy
│   │       └── terms/           # Terms of service
│   ├── accept-invitation/       # Invitation acceptance page
│   ├── github-error/            # GitHub error page
│   ├── github-success/          # GitHub success page
│   └── api/                     # API route group
│       ├── ai/                  # AI-related endpoints
│       ├── auth/                # Authentication API
│       ├── github/              # GitHub integration API
│       └── trpc/                # tRPC API routes
├── components/                  # React components
│   ├── admin/                   # Admin components
│   ├── auth/                    # Authentication components
│   ├── common/                  # Common components
│   ├── dashboard/               # Dashboard components
│   ├── ide/                     # IDE-related components
│   ├── marketing/               # Marketing page components
│   ├── teams/                   # Team management components
│   └── ui/                      # UI components
├── ai/                          # AI core functionality
│   ├── context.ts               # Context building
│   ├── files.ts                 # File processing
│   ├── generate.ts              # Code generation
│   ├── models.ts                # Model configuration
│   ├── providers.ts             # AI providers
│   └── prompts/                 # Prompt templates
├── configs/                     # Configuration files
├── hooks/                       # Custom Hooks
├── lib/                         # Utility functions
├── messages/                    # Internationalization messages
├── trpc/                        # tRPC client configuration
└── types/                       # TypeScript type definitions
```

### Core Architecture Patterns

#### 1. Route Organization Structure

```typescript
// app/(frontend)/layout.tsx - Frontend layout root component
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Internationalization handling
  const headersList = await headers()
  const localeFromHeader = headersList.get('x-paraglide-locale') as Locale
  const locale = localeFromHeader || baseLocale

  return (
    <html lang={locale} suppressHydrationWarning>
      <Body>
        <ClientProviders>
          <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </ThemeProvider>
        </ClientProviders>
      </Body>
    </html>
  )
}
```

#### 2. Online IDE Component

```typescript
// components/ide/libra/index.tsx - Main IDE component
export default function LibraIDE() {
  return (
    <div className="flex h-screen">
      {/* File tree panel */}
      <ResizablePanel defaultSize={20} minSize={15}>
        <FileExplorer projectId={projectId} />
      </ResizablePanel>

      {/* Code editor */}
      <ResizablePanel defaultSize={50}>
        <CodeEditor />
      </ResizablePanel>

      {/* Preview panel */}
      <ResizablePanel defaultSize={30}>
        <BrowserPreview projectId={projectId} />
        <ChatPanel projectId={projectId} />
      </ResizablePanel>
    </div>
  )
}
```

#### 3. AI Code Generation Flow

```typescript
// ai/generate.ts - AI code generation
export async function generateCodeWithAI({
  prompt,
  projectId,
  files,
  modelId = 'claude-3.5-sonnet'
}: GenerateCodeParams): Promise<GenerateCodeResponse> {

  // 1. Build context
  const context = await buildGenerationContext(projectData, config)

  // 2. Get AI model provider
  const provider = getAIProvider(modelId)

  // 3. Build system prompt
  const systemPrompt = buildSystemPrompt(context.userPlan, context.xmlFiles)

  // 4. Call AI generation
  const result = await generateText({
    model: provider.languageModel(modelId),
    system: systemPrompt,
    prompt: prompt,
    providerOptions: {
      anthropic: { max_tokens: 8192 },
      azure: { reasoning_effort: 'medium' }
    }
  })

  // 5. Parse result
  return parseAIResponse(result)
}
```

## Technology Stack

### Frontend Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.3.5 | React framework and App Router |
| **React** | 19.1.0 | Core application and Server Components |
| **TypeScript** | 5.0+ | Type-safe JavaScript |
| **@libra/ui** | * | Design system and component library |
| **Tailwind CSS** | v4 | Atomic CSS framework |
| **Motion** | 12.23.6 | Animation and interaction effects |

### State Management

| Technology | Version | Purpose |
|------------|---------|---------|
| **Zustand** | 5.0.6 | Client-side state management |
| **TanStack Query** | 5.81.5 | Server-side state management |
| **React Hook Form** | 7.59.0 | Form state management |

### AI Integration

| Technology | Version | Purpose |
|------------|---------|---------|
| **AI SDK** | 4.3.19 | Unified AI interface |
| **@ai-sdk/anthropic** | * | Claude model integration |
| **@ai-sdk/azure** | * | Azure OpenAI integration |
| **@ai-sdk/xai** | * | xAI model integration |

### Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **Paraglide.js** | 2.2.0 | Internationalization framework |
| **React Resizable Panels** | 3.0.3 | Resizable panel layout |
| **Shiki** | 3.8.1 | Code syntax highlighting |
| **PostHog** | 1.257.0 | User behavior analytics |

## Core Features

### 1. User Authentication System

#### Email Login Form

```typescript
// components/auth/LoginForm.tsx
export function LoginForm() {
  return (
    <div className="space-y-6">
      {/* Email login */}
      <EmailForm />

      {/* OAuth login */}
      <OAuthProviderButtons providers={['github']} />

      {/* Feature showcase */}
      <FeatureShowcase />
    </div>
  )
}

// components/auth/components/email-form.tsx
export function EmailForm() {
  const { sendEmailOTP, isLoading } = useAuthForm()

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        placeholder={m.auth_email_form_email_placeholder()}
        required
      />
      <TurnstileWidget /> {/* Cloudflare verification */}
      <LoadingButton loading={isLoading}>
        {m.auth_email_form_send_link()}
      </LoadingButton>
    </form>
  )
}
```

#### Permission Management

```typescript
// hooks/use-admin-permissions.ts
export function useAdminPermissions() {
  const { data: session } = useSession()

  const isAdmin = useMemo(() =>
    session?.user?.role === 'admin' ||
    session?.user?.role === 'superadmin'
  , [session])

  const isSuperAdmin = useMemo(() =>
    session?.user?.role === 'superadmin'
  , [session])

  return { isAdmin, isSuperAdmin }
}
```

### 2. AI Native Integration

#### Model Providers

```typescript
// ai/providers.ts
export const myProvider = customProvider({
  languageModels: {
    // Azure OpenAI models
    'chat-model-reasoning-azure': azure(DEFAULT_AZURE_DEPLOYMENT),
    'chat-model-reasoning-azure-mini': azure('gpt-5-mini'),
    'chat-model-reasoning-azure-nano': azure('gpt-5-nano'),

    // Databricks Claude models
    'chat-model-databricks-claude': databricksClaude('databricks-claude-3-7-sonnet'),
    'chat-model-reasoning-anthropic': openrouterProvider('anthropic/claude-sonnet-4'),
    'chat-model-reasoning-google': openrouterProvider('google/gemini-2.5-pro-preview'),

    // XAI models (kept for compatibility)
    'chat-model-reasoning-xai': xai('grok-3-fast-beta'),
  },
  imageModels: {
    'small-model-xai': xai.image('grok-2-image'),
  },
})
```

## Local Development

### Environment Setup

#### 1. Basic Configuration

```bash
# 1. Clone repository
git clone https://github.com/nextify-limited/libra.git
cd libra

# 2. Install dependencies (Bun recommended)
bun install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Configure environment variables
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# GitHub OAuth (for better-auth social login)
BETTER_GITHUB_CLIENT_ID=your_github_client_id
BETTER_GITHUB_CLIENT_SECRET=your_github_client_secret

# GitHub OAuth App (for repository access)
GITHUB_OAUTH_CLIENT_ID=your_github_oauth_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_oauth_client_secret

# AI providers
ANTHROPIC_API_KEY=your_anthropic_key
AZURE_OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=your_azure_endpoint

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/libra_dev

# Stripe (optional, for billing features)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 2. Start Development Server

```bash
# Start entire monorepo
bun dev

# Or start Web app separately
cd apps/web
bun dev
```

#### 3. Development Tools Configuration

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Development Standards

#### Component Development Standards

```typescript
// Standard component structure example
import { useState, useEffect } from 'react'
import { Button } from '@libra/ui'
import { cn } from '@libra/ui/lib/utils'
import { api } from '@/trpc/client'

interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onDelete?: (projectId: string) => void
  className?: string
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  className
}: ProjectCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  // API calls
  const { mutate: deleteProject } = api.project.delete.useMutation({
    onSuccess: () => onDelete?.(project.id),
    onError: (error) => console.error('Delete failed:', error)
  })

  // Event handling
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return

    setIsLoading(true)
    try {
      await deleteProject({ projectId: project.id })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {new Date(project.createdAt).toLocaleDateString()}
          </span>

          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(project)}
            >
              Edit
            </Button>

            <Button
              variant="destructive"
              size="sm"
              loading={isLoading}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### Hook Development Standards

```typescript
// hooks/use-project-management.ts
export function useProjectManagement() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // API Hooks
  const { data: projects, isLoading } = api.project.list.useQuery()
  const { mutate: createProject } = api.project.create.useMutation()
  const { mutate: updateProject } = api.project.update.useMutation()
  const { mutate: deleteProject } = api.project.delete.useMutation()

  // Create project
  const handleCreateProject = useCallback(async (data: CreateProjectInput) => {
    try {
      const newProject = await createProject(data)
      setSelectedProject(newProject)
      return newProject
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }, [createProject])

  // Update project
  const handleUpdateProject = useCallback(async (
    projectId: string,
    data: UpdateProjectInput
  ) => {
    try {
      const updatedProject = await updateProject({ projectId, ...data })
      setSelectedProject(updatedProject)
      return updatedProject
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    }
  }, [updateProject])

  // Delete project
  const handleDeleteProject = useCallback(async (projectId: string) => {
    try {
      await deleteProject({ projectId })
      if (selectedProject?.id === projectId) {
        setSelectedProject(null)
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    }
  }, [deleteProject, selectedProject])

  return {
    // State
    projects,
    selectedProject,
    isLoading,

    // Actions
    setSelectedProject,
    createProject: handleCreateProject,
    updateProject: handleUpdateProject,
    deleteProject: handleDeleteProject
  }
}
```

#### API Route Standards

```typescript
// app/api/ai/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateCodeWithAI } from '@/ai/generate'
import { validateQuota } from '@/ai/context'
import { initAuth } from '@libra/auth'

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const auth = await initAuth()
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse request data
    const { prompt, projectId, modelId } = await request.json()

    if (!prompt || !projectId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 3. Validate quota
    const organizationId = session.session.activeOrganizationId
    await validateQuota(organizationId, 'ai')

    // 4. Generate code
    const result = await generateCodeWithAI({
      prompt,
      projectId,
      modelId: modelId || 'claude-3.5-sonnet',
      userId: session.user.id,
      organizationId
    })

    // 5. Return result
    return NextResponse.json(result)

  } catch (error) {
    console.error('AI generation error:', error)

    // Specific error handling
    if (error.message.includes('quota exceeded')) {
      return NextResponse.json(
        { error: 'AI quota exceeded' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Testing Strategy

#### 1. Unit Testing

```typescript
// ai/__tests__/generate.test.ts
import { describe, it, expect, vi } from 'vitest'
import { generateCodeWithAI } from '../generate'

// Mock dependencies
vi.mock('@/ai/context', () => ({
  buildGenerationContext: vi.fn(),
  validateQuota: vi.fn()
}))

describe('AI Code Generation', () => {
  it('should generate code normally', async () => {
    // Prepare test data
    const mockContext = {
      projectData: { id: 'test-project' },
      userPlan: 'pro',
      xmlFiles: '<files></files>'
    }

    vi.mocked(buildGenerationContext).mockResolvedValue(mockContext)

    // Execute test
    const result = await generateCodeWithAI({
      prompt: 'Create a login form',
      projectId: 'test-project',
      modelId: 'claude-3.5-sonnet'
    })

    // Verify result
    expect(result).toBeDefined()
    expect(result.files).toBeInstanceOf(Array)
    expect(result.files.length).toBeGreaterThan(0)
  })

  it('should handle quota exceeded error', async () => {
    // Mock quota exceeded error
    vi.mocked(validateQuota).mockRejectedValue(
      new Error('AI quota exceeded')
    )

    // Execute test and verify error
    await expect(generateCodeWithAI({
      prompt: 'Test prompt',
      projectId: 'test-project'
    })).rejects.toThrow('AI quota exceeded')
  })
})
```

#### 2. Component Testing

```typescript
// components/ide/__tests__/libra-ide.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import LibraIDE from '../libra'

// Mock child components
vi.mock('../libra/filetree/file-explorer', () => ({
  FileExplorer: () => <div data-testid="file-explorer">File Explorer</div>
}))

vi.mock('../libra/browser-preview', () => ({
  BrowserPreview: () => <div data-testid="browser-preview">Browser Preview</div>
}))

describe('LibraIDE Component', () => {
  it('should render all main panels', () => {
    render(<LibraIDE projectId="test-project" />)

    expect(screen.getByTestId('file-explorer')).toBeInTheDocument()
    expect(screen.getByTestId('browser-preview')).toBeInTheDocument()
  })

  it('should support panel resizing', async () => {
    render(<LibraIDE projectId="test-project" />)

    const resizeHandle = screen.getByRole('separator')

    // Simulate drag resize
    fireEvent.mouseDown(resizeHandle)
    fireEvent.mouseMove(resizeHandle, { clientX: 300 })
    fireEvent.mouseUp(resizeHandle)

    // Verify panel size change
    await waitFor(() => {
      // Verify panel size based on specific implementation
    })
  })
})
```

## Performance Optimization

### 1. Code Splitting and Lazy Loading

#### Dynamic Imports

```typescript
// Admin panel lazy loading
const AdminPanel = dynamic(() => import('@/components/admin'), {
  loading: () => <AdminSkeleton />
})

// Integration component lazy loading
const GitHubIntegration = dynamic(
  () => import('@/components/dashboard/integrations/github-integration-card'),
  { ssr: false }
)

// Chat panel lazy loading
const ChatPanel = dynamic(
  () => import('@/components/ide/libra/chat-panel'),
  {
    loading: () => <div className="h-96 animate-pulse bg-muted rounded" />,
    ssr: false
  }
)
```

#### Bundle Analysis

```javascript
// next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

export default withBundleAnalyzer({
  // Package optimization configuration
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      '@libra/ui',
      'lucide-react',
      'react-icons'
    ]
  },

  // Compilation optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400
  }
})
```

### 2. Caching Strategy

#### React Cache

```typescript
// lib/cache.ts
import { cache } from 'react'
import { unstable_cache } from 'next/cache'

// React Cache - request-level caching
export const getProjectWithCache = cache(async (projectId: string) => {
  return await api.project.get({ projectId })
})

// Next.js Cache - persistent caching
export const getStaticProjectData = unstable_cache(
  async (projectId: string) => {
    return await api.project.get({ projectId })
  },
  ['project-data'],
  {
    revalidate: 60 * 5, // Revalidate every 5 minutes
    tags: ['project']
  }
)

// Cache invalidation
import { revalidateTag } from 'next/cache'

export async function invalidateProjectCache(projectId: string) {
  revalidateTag('project')
  revalidateTag(`project-${projectId}`)
}
```

#### Client-side Cache

```typescript
// trpc/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
      cacheTime: 15 * 60 * 1000, // Cache for 15 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry auth errors
        if (error.data?.code === 'UNAUTHORIZED') return false
        return failureCount < 3
      }
    },
    mutations: {
      onSuccess: () => {
        // Invalidate related queries after successful mutation
        queryClient.invalidateQueries()
      }
    }
  }
})
```

### 3. React 19 Feature Optimization

#### Server Components Optimization

```typescript
// app/(frontend)/(dashboard)/dashboard/page.tsx
import { api } from '@/trpc/server'
import { ProjectGrid } from '@/components/dashboard/project-grid'
import { Suspense } from 'react'

// Server component data fetching
export default async function DashboardPage() {
  // Parallel data fetching
  const projects = await api.project.list()
  const usage = await api.subscription.getUsage()

  return (
    <div className="space-y-6">
      {/* Usage cards */}
      <UsageCards usage={usage} />

      {/* Project grid */}
      <Suspense fallback={<ProjectGridSkeleton />}>
        <ProjectGrid initialProjects={projects} />
      </Suspense>
    </div>
  )
}

// Client component handles interaction
'use client'
function ProjectGrid({ initialProjects }: { initialProjects: Project[] }) {
  // Use data as initial value
  const { data: projects = initialProjects } = api.project.list.useQuery(
    undefined,
    { initialData: initialProjects }
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

#### Concurrent Features

```typescript
// hooks/use-concurrent-state.ts
import { useTransition, useDeferredValue } from 'react'

export function useSearchProjects() {
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState('')

  // Defer search term updates
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const { data: projects } = api.project.search.useQuery(
    { query: deferredSearchTerm },
    { enabled: deferredSearchTerm.length > 0 }
  )

  const handleSearch = (term: string) => {
    startTransition(() => {
      setSearchTerm(term)
    })
  }

  return {
    projects,
    searchTerm,
    isPending,
    handleSearch
  }
}
```

## Security Measures

### 1. Error Handling

#### Global Error Boundary

```typescript
// components/error-boundary.tsx
'use client'

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { Button } from '@libra/ui'
import { RefreshCw } from 'lucide-react'

function ErrorFallback({
  error,
  resetErrorBoundary
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 p-6">
      <div className="text-center space-y-4">
        <h2 className="text-lg font-semibold">An error occurred</h2>
        <p className="text-muted-foreground max-w-md">
          {error.message || 'The application encountered an unexpected error, please try again'}
        </p>

        <div className="space-x-2">
          <Button onClick={resetErrorBoundary}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Send to monitoring service
        console.error('Error caught by boundary:', error, errorInfo)
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
```

## Deployment Configuration

### Cloudflare Workers Deployment

#### 1. Configuration Files

```typescript
// next.config.mjs
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@libra/ui", "@libra/auth", "@libra/db", "@libra/api", "@libra/common",
    "@libra/better-auth-cloudflare", "@libra/email", "@libra/better-auth-stripe", "@libra/shikicode",
    "@libra/sandbox"],
  pageExtensions: ['ts', 'tsx'],
  experimental: {
    reactCompiler: true,
    useCache: true,
  },
  images: {
    loader: 'custom',
    loaderFile: './imageLoader.ts',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3004',
        pathname: '/image/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.libra.dev',
        pathname: '/image/**',
      }
    ],
  },
}

export default nextConfig
```

#### 2. OpenNext Configuration

```typescript
// open-next.config.ts
import type { OpenNextConfig } from 'open-next/types'

const config: OpenNextConfig = {
  default: {
    // Cloudflare Workers runtime
    runtime: 'edge',

    // Environment variable mapping
    env: {
      DATABASE_URL: 'DATABASE_URL',
      STRIPE_SECRET_KEY: 'STRIPE_SECRET_KEY'
    },

    // Route configuration
    patterns: [
      {
        regex: '^/api/ai',
        destination: 'ai-handler'
      },
      {
        regex: '^/api/auth',
        destination: 'auth-handler'
      }
    ]
  },

  // AI handler function configuration
  functions: {
    'ai-handler': {
      runtime: 'edge',
      memory: 256,
      timeout: 30
    }
  }
}

export default config
```

#### 3. Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "Starting Libra Web application deployment to Cloudflare Workers"

# 1. Build internationalization
echo "Building internationalization..."
bun run prebuild

# 2. Build application
echo "Building application..."
bun run build

# 3. Convert to Cloudflare format using OpenNext
echo "Converting to Cloudflare format..."
npx opennextjs-cloudflare build

# 4. Deploy to Cloudflare
echo "Deploying to Cloudflare Workers..."
npx opennextjs-cloudflare deploy

echo "Deployment complete"
```

### Environment Variable Management

#### Production Environment Configuration

```bash
# Cloudflare Workers secret configuration
wrangler secret put DATABASE_URL
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put AZURE_OPENAI_API_KEY

# Public environment variables (wrangler.toml)
[vars]
NEXT_PUBLIC_APP_URL = "https://libra.dev"
NEXT_PUBLIC_AUTH_URL = "https://libra.dev"
NODE_ENV = "production"
```

#### Development Environment Configuration

```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/libra_dev

# AI providers
ANTHROPIC_API_KEY=sk-ant-...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://....openai.azure.com/

# GitHub
BETTER_GITHUB_CLIENT_ID=...
BETTER_GITHUB_CLIENT_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Verification
TURNSTILE_SECRET_KEY=...
```

## API Documentation

### tRPC Route Structure

#### 1. Client Configuration

```typescript
// trpc/client.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { useState } from 'react'
import superjson from 'superjson'
import type { AppRouter } from '@libra/api'

export const api = createTRPCReact<AppRouter>()

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }))

  const [trpcClient] = useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: '/api/trpc',
          headers() {
            return {
              'content-type': 'application/json',
            }
          },
        }),
      ],
    })
  )

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </api.Provider>
  )
}
```

#### 2. Server-side Calls

```typescript
// trpc/server.tsx
import { headers } from 'next/headers'
import { cache } from 'react'
import { createCaller, type AppRouter } from '@libra/api'
import { createTRPCContext } from '@libra/api'

const createContext = cache(() => {
  const heads = new Headers(headers())
  heads.set('x-trpc-source', 'rsc')

  return createTRPCContext({
    headers: heads,
  })
})

export const api = createCaller(createContext)
```

## Summary

Libra Web application is a modern AI-native development platform with the following characteristics:

### Core Advantages

1. **AI-Native Experience**: Deep integration with multiple AI models, providing intelligent code generation and assistance
2. **Modern Architecture**: Based on the latest features of Next.js 15 and React 19
3. **Type Safety**: End-to-end TypeScript and tRPC type safety
4. **High Performance**: Cloudflare Workers deployment and optimization strategies
5. **Developer Experience**: Complete development toolchain and standards

### Technical Features

- **Server Components**: Leveraging React 19 server components for performance optimization
- **Concurrent Features**: Using useTransition and useDeferredValue to optimize user experience
- **Intelligent Caching**: Multi-layer caching strategy to improve response speed
- **Security Protection**: Comprehensive security measures and error handling
- **Internationalization**: Multi-language support based on Paraglide.js

### Development Standards

- Component design and reusability
- Type-safe API communication
- Comprehensive testing strategy
- Performance monitoring and optimization
- Security best practices

This documentation provides comprehensive guidance for the development, maintenance, and expansion of the Libra Web application, helping development teams get started quickly and collaborate efficiently.