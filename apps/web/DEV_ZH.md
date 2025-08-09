# apps/web 开发文档

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg)](https://www.typescriptlang.org/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)

> **Libra AI 驱动的 Web 应用 - AI 原生的开发体验**

Libra Web 应用基于 Next.js 15 和 React 19 构建的现代 AI 原生开发体验平台，提供类似 IDE 的界面和体验，集成 AI 助手、GitHub 集成、团队协作等功能，打造 Libra 生态系统的核心应用。

## 目录导航

- [功能特性](#功能特性)
- [架构设计](#架构设计)
- [技术栈](#技术栈)
- [核心功能](#核心功能)
- [本地开发](#本地开发)
- [部署配置](#部署配置)
- [API 文档](#api-文档)
- [性能优化](#性能优化)
- [安全措施](#安全措施)

## 功能特性

### 核心能力

- **多模型 AI 原生支持**: 集成 AI 模型 (Anthropic Claude、Azure OpenAI、XAI) 提供智能辅助
- **现代化在线 IDE**: 类似本地 IDE 的开发体验和界面交互
- **无服务器部署**: 部署到 Cloudflare Workers 的无服务器架构
- **完整的团队协作**: 组织管理、权限控制、成员管理
- **深度 GitHub 集成**: 双向集成 (OAuth + App) 的代码同步
- **灵活的订阅计费**: 基于 Stripe 的订阅和计费系统
- **国际化多语言**: 基于 Paraglide.js 的国际化支持

### 技术亮点

- **现代化架构**: 基于 Next.js 15 App Router 和 React 19 Server Components
- **类型安全**: 端到端 TypeScript 类型安全和 tRPC 的类型安全通信
- **组件化设计**: 基于 @libra/ui 的设计系统和可复用组件
- **性能优化**: Cloudflare Workers 部署和 CDN 加速
- **开发体验**: 基于 Turbo 的 monorepo 开发工具链

## 架构设计

### 项目结构

```
apps/web/
├── app/                         # Next.js 15 App Router
│   ├── (frontend)/              # 前端路由组
│   │   ├── (dashboard)/         # 仪表板路由
│   │   │   ├── dashboard/       # 主仪表板
│   │   │   │   ├── admin/       # 管理面板
│   │   │   │   ├── billing/     # 计费页面
│   │   │   │   ├── integrations/ # 集成管理
│   │   │   │   ├── teams/       # 团队管理
│   │   │   │   └── session/     # 会话管理
│   │   │   └── project/[id]/    # 项目 IDE 页面
│   │   └── (marketing)/         # 营销页面组
│   │       ├── (auth)/          # 认证页面
│   │       ├── contact/         # 联系页面
│   │       ├── privacy/         # 隐私政策
│   │       └── terms/           # 服务条款
│   ├── accept-invitation/       # 邀请接受页面
│   ├── github-error/            # GitHub 错误页面
│   ├── github-success/          # GitHub 成功页面
│   └── api/                     # API 路由组
│       ├── ai/                  # AI 相关接口
│       ├── auth/                # 认证 API
│       ├── github/              # GitHub 集成 API
│       └── trpc/                # tRPC API 路由
├── components/                  # React 组件
│   ├── admin/                   # 管理组件
│   ├── auth/                    # 认证相关组件
│   ├── common/                  # 通用组件
│   ├── dashboard/               # 仪表板组件
│   ├── ide/                     # IDE 相关组件
│   ├── marketing/               # 营销页面组件
│   ├── teams/                   # 团队管理组件
│   └── ui/                      # UI 组件
├── ai/                          # AI 核心功能
│   ├── context.ts               # 上下文构建
│   ├── files.ts                 # 文件处理
│   ├── generate.ts              # 代码生成
│   ├── models.ts                # 模型配置
│   ├── providers.ts             # AI 提供商
│   └── prompts/                 # 提示词模板
├── configs/                     # 配置文件
├── hooks/                       # 自定义 Hooks
├── lib/                         # 工具库函数
├── messages/                    # 国际化消息
├── trpc/                        # tRPC 客户端配置
└── types/                       # TypeScript 类型定义
```

### 核心架构模式

#### 1. 路由组织结构

```typescript
// app/(frontend)/layout.tsx - 前端布局根组件
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 国际化处理
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

#### 2. 在线 IDE 组件

```typescript
// components/ide/libra/index.tsx - 主 IDE 组件
export default function LibraIDE() {
  return (
    <div className="flex h-screen">
      {/* 文件树面板 */}
      <ResizablePanel defaultSize={20} minSize={15}>
        <FileExplorer projectId={projectId} />
      </ResizablePanel>
      
      {/* 代码编辑器 */}
      <ResizablePanel defaultSize={50}>
        <CodeEditor />
      </ResizablePanel>
      
      {/* 预览面板 */}
      <ResizablePanel defaultSize={30}>
        <BrowserPreview projectId={projectId} />
        <ChatPanel projectId={projectId} />
      </ResizablePanel>
    </div>
  )
}
```

#### 3. AI 代码生成流程

```typescript
// ai/generate.ts - AI 代码生成
export async function generateCodeWithAI({
  prompt,
  projectId,
  files,
  modelId = 'claude-3.5-sonnet'
}: GenerateCodeParams): Promise<GenerateCodeResponse> {
  
  // 1. 构建上下文
  const context = await buildGenerationContext(projectData, config)
  
  // 2. 获取 AI 模型提供商
  const provider = getAIProvider(modelId)
  
  // 3. 构建系统提示词
  const systemPrompt = buildSystemPrompt(context.userPlan, context.xmlFiles)
  
  // 4. 调用 AI 生成
  const result = await generateText({
    model: provider.languageModel(modelId),
    system: systemPrompt,
    prompt: prompt,
    providerOptions: {
      anthropic: { max_tokens: 8192 },
      azure: { reasoning_effort: 'medium' }
    }
  })
  
  // 5. 解析结果
  return parseAIResponse(result)
}
```

## 技术栈

### 前端框架

| 技术栈 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 15.3.5 | React 框架和 App Router |
| **React** | 19.1.0 | 核心应用和 Server Components |
| **TypeScript** | 5.0+ | 类型安全的 JavaScript |
| **@libra/ui** | * | 设计系统和组件库 |
| **Tailwind CSS** | v4 | 原子化 CSS 框架 |
| **Motion** | 12.23.6 | 动画和交互效果 |

### 状态管理

| 技术栈 | 版本 | 用途 |
|------|------|------|
| **Zustand** | 5.0.6 | 客户端状态管理 |
| **TanStack Query** | 5.81.5 | 服务端状态管理 |
| **React Hook Form** | 7.59.0 | 表单状态管理 |

### AI 集成

| 技术栈 | 版本 | 用途 |
|------|------|------|
| **AI SDK** | 4.3.19 | 统一 AI 接口 |
| **@ai-sdk/anthropic** | * | Claude 模型集成 |
| **@ai-sdk/azure** | * | Azure OpenAI 集成 |
| **@ai-sdk/xai** | * | xAI 模型集成 |

### 开发工具

| 技术栈 | 版本 | 用途 |
|------|------|------|
| **Paraglide.js** | 2.2.0 | 国际化框架 |
| **React Resizable Panels** | 3.0.3 | 可调整面板布局 |
| **Shiki** | 3.8.1 | 代码语法高亮 |
| **PostHog** | 1.257.0 | 用户行为分析 |

## 核心功能

### 1. 用户认证系统

#### 邮箱登录表单

```typescript
// components/auth/LoginForm.tsx
export function LoginForm() {
  return (
    <div className="space-y-6">
      {/* 邮箱登录 */}
      <EmailForm />
      
      {/* OAuth 登录 */}
      <OAuthProviderButtons providers={['github']} />
      
      {/* 功能展示 */}
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
      <TurnstileWidget /> {/* Cloudflare 验证 */}
      <LoadingButton loading={isLoading}>
        {m.auth_email_form_send_link()}
      </LoadingButton>
    </form>
  )
}
```

#### 权限管理

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

### 2. AI 原生集成

#### 模型提供商

```typescript
// ai/providers.ts
export const myProvider = customProvider({
  languageModels: {
    // Azure OpenAI 模型
    'chat-model-reasoning-azure': azure(DEFAULT_AZURE_DEPLOYMENT),
    'chat-model-reasoning-azure-mini': azure('gpt-5-mini'),
    'chat-model-reasoning-azure-nano': azure('gpt-5-nano'),

    // Databricks Claude 模型
    'chat-model-databricks-claude': databricksClaude('databricks-claude-3-7-sonnet'),
    'chat-model-reasoning-anthropic': openrouterProvider('anthropic/claude-sonnet-4'),
    'chat-model-reasoning-google': openrouterProvider('google/gemini-2.5-pro-preview'),

    // XAI 模型（保持兼容性）
    'chat-model-reasoning-xai': xai('grok-3-fast-beta'),
  },
  imageModels: {
    'small-model-xai': xai.image('grok-2-image'),
  },
})
```

## 本地开发

### 环境搭建

#### 1. 基础配置

```bash
# 1. 克隆代码库
git clone https://github.com/nextify-limited/libra.git
cd libra

# 2. 安装依赖（推荐使用 Bun）
bun install

# 3. 复制环境变量
cp .env.example .env.local

# 4. 配置环境变量
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# GitHub OAuth
BETTER_GITHUB_CLIENT_ID=your_github_client_id
BETTER_GITHUB_CLIENT_SECRET=your_github_client_secret

# AI 提供商
ANTHROPIC_API_KEY=your_anthropic_key
AZURE_OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=your_azure_endpoint

# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/libra_dev

# Stripe（可选，用于计费功能）
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 2. 启动开发服务器

```bash
# 启动整个 monorepo
bun dev

# 或单独启动 Web 应用
cd apps/web
bun dev
```

#### 3. 开发工具配置

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

### 开发规范

#### 组件开发规范

```typescript
// 标准组件结构示例
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

  // API 调用
  const { mutate: deleteProject } = api.project.delete.useMutation({
    onSuccess: () => onDelete?.(project.id),
    onError: (error) => console.error('删除失败:', error)
  })

  // 事件处理
  const handleDelete = async () => {
    if (!confirm('确定要删除这个项目吗？')) return

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
              编辑
            </Button>

            <Button
              variant="destructive"
              size="sm"
              loading={isLoading}
              onClick={handleDelete}
            >
              删除
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### Hook 开发规范

```typescript
// hooks/use-project-management.ts
export function useProjectManagement() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // API Hooks
  const { data: projects, isLoading } = api.project.list.useQuery()
  const { mutate: createProject } = api.project.create.useMutation()
  const { mutate: updateProject } = api.project.update.useMutation()
  const { mutate: deleteProject } = api.project.delete.useMutation()

  // 创建项目
  const handleCreateProject = useCallback(async (data: CreateProjectInput) => {
    try {
      const newProject = await createProject(data)
      setSelectedProject(newProject)
      return newProject
    } catch (error) {
      console.error('创建项目失败:', error)
      throw error
    }
  }, [createProject])

  // 更新项目
  const handleUpdateProject = useCallback(async (
    projectId: string,
    data: UpdateProjectInput
  ) => {
    try {
      const updatedProject = await updateProject({ projectId, ...data })
      setSelectedProject(updatedProject)
      return updatedProject
    } catch (error) {
      console.error('更新项目失败:', error)
      throw error
    }
  }, [updateProject])

  // 删除项目
  const handleDeleteProject = useCallback(async (projectId: string) => {
    try {
      await deleteProject({ projectId })
      if (selectedProject?.id === projectId) {
        setSelectedProject(null)
      }
    } catch (error) {
      console.error('删除项目失败:', error)
      throw error
    }
  }, [deleteProject, selectedProject])

  return {
    // 状态
    projects,
    selectedProject,
    isLoading,

    // 操作
    setSelectedProject,
    createProject: handleCreateProject,
    updateProject: handleUpdateProject,
    deleteProject: handleDeleteProject
  }
}
```

#### API 路由规范

```typescript
// app/api/ai/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateCodeWithAI } from '@/ai/generate'
import { validateQuota } from '@/ai/context'
import { initAuth } from '@libra/auth'

export async function POST(request: NextRequest) {
  try {
    // 1. 身份验证
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

    // 2. 解析请求数据
    const { prompt, projectId, modelId } = await request.json()

    if (!prompt || !projectId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 3. 验证配额
    const organizationId = session.session.activeOrganizationId
    await validateQuota(organizationId, 'ai')

    // 4. 生成代码
    const result = await generateCodeWithAI({
      prompt,
      projectId,
      modelId: modelId || 'claude-3.5-sonnet',
      userId: session.user.id,
      organizationId
    })

    // 5. 返回结果
    return NextResponse.json(result)

  } catch (error) {
    console.error('AI 生成错误:', error)

    // 特定错误处理
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

### 测试策略

#### 1. 单元测试

```typescript
// ai/__tests__/generate.test.ts
import { describe, it, expect, vi } from 'vitest'
import { generateCodeWithAI } from '../generate'

// Mock 依赖
vi.mock('@/ai/context', () => ({
  buildGenerationContext: vi.fn(),
  validateQuota: vi.fn()
}))

describe('AI 代码生成', () => {
  it('应该正常生成代码', async () => {
    // 准备测试数据
    const mockContext = {
      projectData: { id: 'test-project' },
      userPlan: 'pro',
      xmlFiles: '<files></files>'
    }

    vi.mocked(buildGenerationContext).mockResolvedValue(mockContext)

    // 执行测试
    const result = await generateCodeWithAI({
      prompt: '创建一个登录表单',
      projectId: 'test-project',
      modelId: 'claude-3.5-sonnet'
    })

    // 验证结果
    expect(result).toBeDefined()
    expect(result.files).toBeInstanceOf(Array)
    expect(result.files.length).toBeGreaterThan(0)
  })

  it('应该处理配额超限错误', async () => {
    // Mock 配额超限错误
    vi.mocked(validateQuota).mockRejectedValue(
      new Error('AI quota exceeded')
    )

    // 执行测试并验证错误
    await expect(generateCodeWithAI({
      prompt: '测试提示',
      projectId: 'test-project'
    })).rejects.toThrow('AI quota exceeded')
  })
})
```

#### 2. 组件测试

```typescript
// components/ide/__tests__/libra-ide.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import LibraIDE from '../libra'

// Mock 子组件
vi.mock('../libra/filetree/file-explorer', () => ({
  FileExplorer: () => <div data-testid="file-explorer">File Explorer</div>
}))

vi.mock('../libra/browser-preview', () => ({
  BrowserPreview: () => <div data-testid="browser-preview">Browser Preview</div>
}))

describe('LibraIDE 组件', () => {
  it('应该渲染所有主要面板', () => {
    render(<LibraIDE projectId="test-project" />)

    expect(screen.getByTestId('file-explorer')).toBeInTheDocument()
    expect(screen.getByTestId('browser-preview')).toBeInTheDocument()
  })

  it('应该支持面板调整大小', async () => {
    render(<LibraIDE projectId="test-project" />)

    const resizeHandle = screen.getByRole('separator')

    // 模拟拖拽调整大小
    fireEvent.mouseDown(resizeHandle)
    fireEvent.mouseMove(resizeHandle, { clientX: 300 })
    fireEvent.mouseUp(resizeHandle)

    // 验证面板大小变化
    await waitFor(() => {
      // 这里需要根据具体实现验证面板大小
    })
  })
})
```

## 性能优化

### 1. 代码分割和懒加载

#### 动态导入

```typescript
// 管理员面板懒加载
const AdminPanel = dynamic(() => import('@/components/admin'), {
  loading: () => <AdminSkeleton />
})

// 集成组件懒加载
const GitHubIntegration = dynamic(
  () => import('@/components/dashboard/integrations/github-integration-card'),
  { ssr: false }
)

// 聊天面板懒加载
const ChatPanel = dynamic(
  () => import('@/components/ide/libra/chat-panel'),
  {
    loading: () => <div className="h-96 animate-pulse bg-muted rounded" />,
    ssr: false
  }
)
```

#### Bundle 分析

```javascript
// next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

export default withBundleAnalyzer({
  // 包优化配置
  experimental: {
    // 优化包导入
    optimizePackageImports: [
      '@libra/ui',
      'lucide-react',
      'react-icons'
    ]
  },

  // 编译优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },

  // 图片优化
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400
  }
})
```

### 2. 缓存策略

#### React 缓存

```typescript
// lib/cache.ts
import { cache } from 'react'
import { unstable_cache } from 'next/cache'

// React Cache - 请求级缓存
export const getProjectWithCache = cache(async (projectId: string) => {
  return await api.project.get({ projectId })
})

// Next.js Cache - 持久化缓存
export const getStaticProjectData = unstable_cache(
  async (projectId: string) => {
    return await api.project.get({ projectId })
  },
  ['project-data'],
  {
    revalidate: 60 * 5, // 5 分钟重新验证
    tags: ['project']
  }
)

// 缓存失效
import { revalidateTag } from 'next/cache'

export async function invalidateProjectCache(projectId: string) {
  revalidateTag('project')
  revalidateTag(`project-${projectId}`)
}
```

#### 客户端缓存

```typescript
// trpc/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 数据保鲜 5 分钟
      cacheTime: 15 * 60 * 1000, // 缓存 15 分钟
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // 认证错误不重试
        if (error.data?.code === 'UNAUTHORIZED') return false
        return failureCount < 3
      }
    },
    mutations: {
      onSuccess: () => {
        // 变更成功后失效相关查询
        queryClient.invalidateQueries()
      }
    }
  }
})
```

### 3. React 19 特性优化

#### Server Components 优化

```typescript
// app/(frontend)/(dashboard)/dashboard/page.tsx
import { api } from '@/trpc/server'
import { ProjectGrid } from '@/components/dashboard/project-grid'
import { Suspense } from 'react'

// 服务端组件获取数据
export default async function DashboardPage() {
  // 并行获取数据
  const projects = await api.project.list()
  const usage = await api.subscription.getUsage()

  return (
    <div className="space-y-6">
      {/* 使用情况卡片 */}
      <UsageCards usage={usage} />

      {/* 项目网格 */}
      <Suspense fallback={<ProjectGridSkeleton />}>
        <ProjectGrid initialProjects={projects} />
      </Suspense>
    </div>
  )
}

// 客户端组件处理交互
'use client'
function ProjectGrid({ initialProjects }: { initialProjects: Project[] }) {
  // 使用数据作为初始值
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

#### 并发特性

```typescript
// hooks/use-concurrent-state.ts
import { useTransition, useDeferredValue } from 'react'

export function useSearchProjects() {
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState('')

  // 延迟搜索词更新
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

## 安全措施

### 1. 错误处理

#### 全局错误边界

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
        <h2 className="text-lg font-semibold">出现了错误</h2>
        <p className="text-muted-foreground max-w-md">
          {error.message || '应用遇到了意外错误，请重试'}
        </p>

        <div className="space-x-2">
          <Button onClick={resetErrorBoundary}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重试
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            刷新页面
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
        // 发送到监控服务
        console.error('Error caught by boundary:', error, errorInfo)
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
```

#### API 错误处理

```typescript
// lib/error-handler.ts
import { TRPCError } from '@trpc/server'
import { toast } from '@libra/ui/components/sonner'

export function handleTRPCError(error: unknown) {
  if (error instanceof TRPCError) {
    switch (error.code) {
      case 'UNAUTHORIZED':
        toast.error('未授权访问')
        // 重定向到登录页
        window.location.href = '/login'
        break

      case 'FORBIDDEN':
        toast.error('权限不足')
        break

      case 'TOO_MANY_REQUESTS':
        toast.error('请求过于频繁，请稍后重试')
        break

      case 'INTERNAL_SERVER_ERROR':
        toast.error('服务器内部错误')
        break

      default:
        toast.error(error.message || '未知错误')
    }
  } else {
    toast.error('网络错误，请检查网络连接')
  }
}

// 使用示例
export function useProjectMutations() {
  const { mutate: createProject } = api.project.create.useMutation({
    onError: handleTRPCError,
    onSuccess: () => {
      toast.success('项目创建成功')
    }
  })

  return { createProject }
}
```

### 2. 安全防护

#### XSS 防护

```typescript
// lib/sanitize.ts
import DOMPurify from 'dompurify'

export function sanitizeHTML(dirty: string): string {
  if (typeof window === 'undefined') {
    // 服务端环境没有 DOM 对象
    return dirty
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false
  })
}

// 安全的 HTML 渲染组件
export function SafeHTML({ html }: { html: string }) {
  const cleanHTML = sanitizeHTML(html)

  return (
    <div
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  )
}
```

#### CSRF 防护

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // 安全响应头
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  // CSRF 保护
  if (request.method === 'POST') {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')

    if (origin && !origin.includes(host!)) {
      return new Response('Forbidden', { status: 403 })
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
```

### 3. 性能监控

#### Web Vitals 监控

```typescript
// lib/monitoring.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function initWebVitals() {
  getCLS(console.log)
  getFID(console.log)
  getFCP(console.log)
  getLCP(console.log)
  getTTFB(console.log)
}

// 自定义性能测量
export function measurePerformance(name: string, fn: () => Promise<void>) {
  return async () => {
    const start = performance.now()

    try {
      await fn()
    } finally {
      const duration = performance.now() - start

      // 发送到分析服务
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'timing_complete', {
          name,
          value: Math.round(duration)
        })
      }

      console.log(`${name} took ${duration.toFixed(2)}ms`)
    }
  }
}
```

#### 组件性能监控

```typescript
// hooks/use-performance-monitor.ts
import { useEffect, useRef } from 'react'

export function usePerformanceMonitor(componentName: string) {
  const renderTimeRef = useRef<number>()

  useEffect(() => {
    renderTimeRef.current = performance.now()
  })

  useEffect(() => {
    if (renderTimeRef.current) {
      const renderTime = performance.now() - renderTimeRef.current

      if (renderTime > 16) { // 超过一帧时间
        console.warn(
          `${componentName} render took ${renderTime.toFixed(2)}ms`
        )
      }
    }
  })
}

// 使用示例
export function ExpensiveComponent() {
  usePerformanceMonitor('ExpensiveComponent')

  // 组件逻辑...
}
```

## 部署配置

### Cloudflare Workers 部署

#### 1. 配置文件

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

#### 2. OpenNext 配置

```typescript
// open-next.config.ts
import type { OpenNextConfig } from 'open-next/types'

const config: OpenNextConfig = {
  default: {
    // Cloudflare Workers 运行时
    runtime: 'edge',

    // 环境变量映射
    env: {
      DATABASE_URL: 'DATABASE_URL',
      STRIPE_SECRET_KEY: 'STRIPE_SECRET_KEY'
    },

    // 路由配置
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

  // AI 处理函数配置
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

#### 3. 部署脚本

```bash
#!/bin/bash
# deploy.sh

set -e

echo "开始部署 Libra Web 应用到 Cloudflare Workers"

# 1. 构建国际化
echo "构建国际化..."
bun run prebuild

# 2. 构建应用
echo "构建应用..."
bun run build

# 3. 使用 OpenNext 转换为 Cloudflare 格式
echo "转换为 Cloudflare 格式..."
npx opennextjs-cloudflare build

# 4. 部署到 Cloudflare
echo "部署到 Cloudflare Workers..."
npx opennextjs-cloudflare deploy

echo "部署完成"
```

### 环境变量管理

#### 生产环境配置

```bash
# Cloudflare Workers 密钥配置
wrangler secret put DATABASE_URL
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put AZURE_OPENAI_API_KEY

# 公开环境变量 (wrangler.toml)
[vars]
NEXT_PUBLIC_APP_URL = "https://libra.dev"
NEXT_PUBLIC_AUTH_URL = "https://libra.dev"
NODE_ENV = "production"
```

#### 开发环境配置

```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/libra_dev

# AI 提供商
ANTHROPIC_API_KEY=sk-ant-...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://....openai.azure.com/

# GitHub
BETTER_GITHUB_CLIENT_ID=...
BETTER_GITHUB_CLIENT_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 验证码
TURNSTILE_SECRET_KEY=...
```

## API 文档

### tRPC 路由结构

#### 1. 客户端配置

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
        staleTime: 5 * 60 * 1000, // 5 分钟
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

#### 2. 服务端调用

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

## 总结

Libra Web 应用是一个现代化的 AI 原生开发平台，具备以下特点：

### 核心优势

1. **AI 原生体验**: 深度集成多个 AI 模型，提供智能代码生成和辅助功能
2. **现代化架构**: 基于 Next.js 15 和 React 19 的最新特性
3. **类型安全**: 端到端 TypeScript 和 tRPC 类型安全
4. **高性能**: Cloudflare Workers 部署和优化策略
5. **开发体验**: 完整的开发工具链和规范

### 技术特色

- **Server Components**: 利用 React 19 服务端组件优化性能
- **并发特性**: 使用 useTransition 和 useDeferredValue 优化用户体验
- **智能缓存**: 多层缓存策略提升响应速度
- **安全防护**: 全面的安全措施和错误处理
- **国际化**: 基于 Paraglide.js 的多语言支持

### 开发规范

- 组件化设计和可复用性
- 类型安全的 API 通信
- 完善的测试策略
- 性能监控和优化
- 安全最佳实践

这个文档为 Libra Web 应用的开发、维护和扩展提供了全面的指导，帮助开发团队快速上手和高效协作。
