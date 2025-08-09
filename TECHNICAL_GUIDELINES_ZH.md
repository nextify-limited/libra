---
description: Libra AI 项目技术开发规范 - 基于实际代码实现的完整技术指南 (最新更新 2025年7月)
globs:
  - "**/*"
alwaysApply: true
lastUpdated: 2025-07-30
version: "1.0"
---

# Libra AI 技术开发规范

## 目录

- [Libra AI 技术开发规范](#libra-ai-技术开发规范)
  - [目录](#目录)
  - [1. 项目概述](#1-项目概述)
    - [1.1 核心功能](#11-核心功能)
    - [1.2 技术特色](#12-技术特色)
    - [1.3 架构原则](#13-架构原则)
  - [2. 架构设计](#2-架构设计)
    - [2.1 Monorepo 组织结构](#21-monorepo-组织结构)
    - [2.2 应用程序架构](#22-应用程序架构)
      - [apps/web - 主 Web 应用](#appsweb---主-web-应用)
      - [apps/builder - Vite 构建工具](#appsbuilder---vite-构建工具)
      - [apps/cdn - CDN 服务](#appscdn---cdn-服务)
      - [apps/dispatcher - 请求路由](#appsdispatcher---请求路由)
      - [apps/auth-studio - 数据库管理](#appsauth-studio---数据库管理)
      - [apps/docs - 文档站点](#appsdocs---文档站点)
      - [apps/email - 邮件模板开发](#appsemail---邮件模板开发)
      - [apps/vite-shadcn-template - 项目模板](#appsvite-shadcn-template---项目模板)
      - [apps/deploy - 部署服务](#appsdeploy---部署服务)
      - [apps/deploy-workflow - 部署工作流](#appsdeploy-workflow---部署工作流)
      - [apps/screenshot - 截图服务](#appsscreenshot---截图服务)
    - [2.3 共享包架构](#23-共享包架构)
      - [@libra/ui - 设计系统](#libraui---设计系统)
      - [@libra/api - tRPC API 层](#libraapi---trpc-api-层)
      - [@libra/db - 数据库层](#libradb---数据库层)
  - [3. 核心技术栈](#3-核心技术栈)
    - [3.1 前端技术栈](#31-前端技术栈)
      - [核心框架](#核心框架)
      - [用户界面框架](#用户界面框架)
      - [状态管理](#状态管理)
      - [开发工具](#开发工具)
    - [3.2 后端技术栈](#32-后端技术栈)
      - [接口层](#接口层)
      - [数据库](#数据库)
      - [认证与支付](#认证与支付)
      - [文件存储](#文件存储)
    - [3.3 AI 集成技术](#33-ai-集成技术)
      - [人工智能提供商](#人工智能提供商)
      - [人工智能工具](#人工智能工具)
      - [生成功能](#生成功能)
    - [3.4 部署与基础设施](#34-部署与基础设施)
      - [云服务提供商](#云服务提供商)
      - [部署工具](#部署工具)
      - [开发运维](#开发运维)
      - [监控与分析](#监控与分析)
  - [4. 设计系统与 UI 组件](#4-设计系统与-ui-组件)
    - [4.1 设计系统架构](#41-设计系统架构)
    - [4.2 组件开发模式](#42-组件开发模式)
    - [4.3 样式系统规范](#43-样式系统规范)
      - [Tailwind CSS v4 配置](#tailwind-css-v4-配置)
      - [CSS 变量使用规范](#css-变量使用规范)
      - [Tailwind 工具类规范](#tailwind-工具类规范)
      - [自定义工具类](#自定义工具类)
    - [4.4 主题系统实现](#44-主题系统实现)
  - [5. API 开发规范](#5-api-开发规范)
    - [5.1 tRPC 实现模式](#51-trpc-实现模式)
      - [路由实现示例](#路由实现示例)
    - [5.2 数据验证与类型安全](#52-数据验证与类型安全)
      - [客户端类型推导](#客户端类型推导)
    - [5.3 错误处理模式](#53-错误处理模式)
      - [错误处理使用示例](#错误处理使用示例)
    - [5.4 日志记录规范](#54-日志记录规范)
      - [日志上下文结构](#日志上下文结构)
  - [6. 数据库设计与操作](#6-数据库设计与操作)
    - [6.1 双数据库架构](#61-双数据库架构)
      - [业务数据库 - PostgreSQL (Hyperdrive)](#业务数据库---postgresql-hyperdrive)
      - [认证数据库 - SQLite (Cloudflare D1)](#认证数据库---sqlite-cloudflare-d1)
      - [数据库选择指南](#数据库选择指南)
    - [6.2 PostgreSQL 连接配置（Hyperdrive）](#62-postgresql-连接配置hyperdrive)
    - [6.3 Schema 设计规范](#63-schema-设计规范)
    - [6.4 查询模式](#64-查询模式)
      - [基础查询操作](#基础查询操作)
      - [事务处理](#事务处理)
    - [6.5 数据完整性](#65-数据完整性)
      - [外键约束和级联删除](#外键约束和级联删除)
  - [7. 认证与权限系统](#7-认证与权限系统)
    - [7.1 better-auth 集成](#71-better-auth-集成)
    - [7.2 组织权限模式](#72-组织权限模式)
    - [7.3 API 权限验证](#73-api-权限验证)
  - [8. Stripe 支付集成](#8-stripe-支付集成)
    - [8.1 Stripe 插件配置](#81-stripe-插件配置)
    - [8.2 订阅计划管理](#82-订阅计划管理)
    - [8.3 Webhook 处理](#83-webhook-处理)
  - [9. AI 功能开发](#9-ai-功能开发)
    - [9.1 AI 模型管理](#91-ai-模型管理)
    - [9.2 配额与计费系统](#92-配额与计费系统)
    - [9.3 生成与流式响应](#93-生成与流式响应)
    - [9.4 提示词工程](#94-提示词工程)
    - [9.5 沙盒执行环境](#95-沙盒执行环境)
      - [容器配置](#容器配置)
      - [Docker 模板配置](#docker-模板配置)
      - [配置文件 (e2b.toml)](#配置文件-e2btoml)
      - [沙盒操作 API](#沙盒操作-api)
      - [安全最佳实践](#安全最佳实践)
  - [9. 状态管理模式](#9-状态管理模式)
    - [9.1 客户端状态管理](#91-客户端状态管理)
    - [9.2 服务端状态管理](#92-服务端状态管理)
    - [9.3 缓存策略](#93-缓存策略)
      - [智能缓存失效](#智能缓存失效)
  - [10. 邮件系统](#10-邮件系统)
    - [10.1 React Email 集成](#101-react-email-集成)
    - [10.2 邮件模板系统](#102-邮件模板系统)
    - [10.3 邮件发送工具](#103-邮件发送工具)
  - [11. 错误处理与日志](#11-错误处理与日志)
    - [11.1 统一错误处理](#111-统一错误处理)
    - [11.2 结构化日志记录](#112-结构化日志记录)
    - [11.3 错误监控](#113-错误监控)
      - [前端错误边界](#前端错误边界)
  - [12. 国际化实现](#12-国际化实现)
    - [12.1 Paraglide.js 集成](#121-paraglidejs-集成)
      - [Paraglide 配置](#paraglide-配置)
      - [语言切换实现](#语言切换实现)
      - [Next.js 中间件配置](#nextjs-中间件配置)
    - [12.2 多语言内容管理](#122-多语言内容管理)
    - [12.3 本地化最佳实践](#123-本地化最佳实践)
      - [组件中使用国际化](#组件中使用国际化)
      - [动态内容处理](#动态内容处理)
      - [开发工作流](#开发工作流)
  - [13. GitHub 集成](#13-github-集成)
    - [13.1 GitHub App 配置](#131-github-app-配置)
    - [13.2 双重认证架构](#132-双重认证架构)
      - [GitHub App 安装认证](#github-app-安装认证)
      - [OAuth 用户认证](#oauth-用户认证)
    - [13.3 仓库管理功能](#133-仓库管理功能)
  - [14. 开发工具与工作流](#14-开发工具与工作流)
    - [13.1 Bun 包管理器使用规范](#131-bun-包管理器使用规范)
      - [Bun 优势](#bun-优势)
      - [安装 Bun](#安装-bun)
      - [常用命令](#常用命令)
      - [Bun 配置文件](#bun-配置文件)
      - [工作区配置](#工作区配置)
      - [Bun 特有功能](#bun-特有功能)
      - [迁移指南](#迁移指南)
    - [13.2 开发环境配置](#132-开发环境配置)
      - [环境变量与 Secrets 管理](#环境变量与-secrets-管理)
    - [13.3 代码质量工具](#133-代码质量工具)
      - [Biome 配置](#biome-配置)
    - [13.4 构建与部署](#134-构建与部署)
      - [Turborepo 配置](#turborepo-配置)
      - [部署脚本](#部署脚本)
    - [13.5 Cloudflare 部署配置](#135-cloudflare-部署配置)
      - [OpenNext 配置](#opennext-配置)
      - [Wrangler 配置](#wrangler-配置)
      - [部署流程](#部署流程)
      - [CI/CD 配置](#cicd-配置)
      - [环境变量与 Secrets 管理](#环境变量与-secrets-管理)
      - [自定义域名配置](#自定义域名配置)
      - [性能优化配置](#性能优化配置)
    - [13.6 GitHub API 集成](#136-github-api-集成)
      - [GitHub 客户端配置](#github-客户端配置)
      - [仓库操作](#仓库操作)
      - [认证流程集成](#认证流程集成)
      - [项目同步功能](#项目同步功能)
  - [13. 性能优化指南](#13-性能优化指南)
    - [13.1 前端性能优化](#131-前端性能优化)
      - [React Server Components 优化](#react-server-components-优化)
      - [流式渲染优化](#流式渲染优化)
      - [性能监控配置](#性能监控配置)
    - [13.2 数据库性能优化](#132-数据库性能优化)
      - [查询优化](#查询优化)
    - [13.3 AI 性能优化](#133-ai-性能优化)
      - [流式响应优化](#流式响应优化)

## 1. 项目概述

**Libra AI** 是一个现代化的开源 AI 驱动开发平台，提供类似 V0/Lovable 的智能代码生成和项目构建能力。该项目基于 **Turborepo Monorepo** 架构构建，采用最新的 Web 技术栈，为开发者提供强大的 AI 辅助开发体验。

### 1.1 核心功能

- **🎯 AI 代码生成**：基于多 AI 提供商（Anthropic、Azure AI、OpenRouter、xAI）的智能代码生成
- **🏗️ 项目构建**：支持 Vite、React 等主流框架的项目模板
- **🎨 可视化编辑**：提供 IDE 级别的代码编辑（基于 shikicode）和实时预览功能
- **👥 团队协作**：支持组织管理、项目分享和团队协作功能
- **🔗 集成生态**：与 GitHub、Cloudflare、E2B、Daytona 沙盒等平台深度集成
- **🚀 即时部署**：一键部署到 Cloudflare Workers，支持自定义域名

### 1.2 技术特色

- **🔒 端到端类型安全**：从数据库到前端的完整 TypeScript 类型覆盖
- **🎨 现代化设计系统**：基于 Tailwind CSS v4 + Radix UI 的组件系统
- **⚡ 高性能架构**：React Server Components + 流式渲染 + React 19 优化
- **🛡️ 企业级安全**：better-auth + Cloudflare 插件的认证系统，集成 Stripe 计费
- **🌍 国际化支持**：基于 Paraglide.js 的类型安全多语言系统
- **☁️ 云原生部署**：完整的 Cloudflare Workers 部署方案，支持 OpenNext.js

### 1.3 架构原则

- **📦 Monorepo 优先**：使用 Turborepo 统一代码管理、依赖共享、工具链一致性
- **🔄 关注点分离**：应用层、业务逻辑层、数据层明确分离
- **🏗️ 类型安全优先**：端到端 TypeScript 类型覆盖，使用 Zod 验证
- **🎯 开发体验优先**：Bun 包管理器、Biome 代码格式化、热重载支持
- **📈 可观测性驱动**：结构化日志、Posthog 分析、性能追踪
- **🔧 工具链标准化**：统一的 Biome linting/formatting、Vitest 测试配置

## 2. 架构设计

### 2.1 Monorepo 组织结构

项目采用 **Turborepo** 构建的 Monorepo 架构，清晰分离应用和共享包：

```text
libra/
├── apps/                    # 应用程序
│   ├── auth-studio/         # better-auth 管理界面
│   ├── builder/             # Vite 构建工具 (独立构建环境)
│   ├── cdn/                 # Hono CDN 服务 (文件上传/图片处理)
│   ├── deploy/              # 部署服务 (Cloudflare Workers)
│   ├── deploy-workflow/     # 部署工作流服务  (deprecated)
│   ├── dispatcher/          # 请求路由服务 (认证中间件)
│   ├── docs/                # 文档站点 (Next.js + FumaDocs)
│   ├── email/               # React Email 开发环境
│   ├── opennext-cache/      # OpenNext 缓存服务
│   ├── proxy/               # 代理与容器 (WIP)
│   ├── screenshot/          # 截图生成服务
│   ├── vite-shadcn-template/# Vite 项目模板
│   └── web/                 # Next.js 15 主应用 (React 19)
├── packages/                # 共享包
│   ├── api/                 # tRPC API 层 (类型安全)
│   ├── auth/                # better-auth 认证系统，使用 Cloudflare D1
│   ├── better-auth-cloudflare/ # Cloudflare 适配器
│   ├── better-auth-stripe/  # Stripe 集成
│   ├── common/              # 通用工具和类型
│   ├── db/                  # 业务数据库层 (Drizzle ORM + Neon/Hyperdrive)
│   ├── email/               # React Email 模板
│   ├── middleware/          # Cloudflare Workers 中间件
│   ├── sandbox/             # E2B 沙盒集成
│   ├── shikicode/           # 代码高亮组件
│   ├── templates/           # 项目脚手架模板
│   └── ui/                  # 设计系统 (基于 Radix UI + Tailwind CSS v4)
├── scripts/                 # 构建脚本和工具
├── tooling/                 # 开发工具配置
│   └── typescript-config/   # 共享 TypeScript 配置
├── biome.json               # Biome 配置
├── bun.lock                 # Bun 锁定文件
├── package.json             # 根级依赖管理 (Bun workspace)
└── turbo.json               # Turborepo 构建配置
```

**核心原则：**

- **单一职责**：每个包负责特定功能领域
- **依赖管理**：共享包避免重复，减少 bundle 大小
- **类型共享**：跨包的类型定义统一管理
- **构建优化**：Turborepo 并行构建和智能缓存

### 2.2 应用程序架构

#### apps/web - 主 Web 应用

基于 **Next.js 15** 的主应用，采用 App Router 架构：

```text
apps/web/
├── app/                     # Next.js App Router
│   ├── (frontend)/          # 前端路由组
│   │   ├── (dashboard)/     # 控制台页面
│   │   │   ├── dashboard/   # 用户仪表板
│   │   │   └── project/     # 项目管理
│   │   └── (marketing)/     # 营销页面
│   └── api/                 # API 路由
│       ├── ai/              # AI 相关 API
│       ├── auth/            # 认证 API
│       ├── trpc/            # tRPC 端点
│       └── webhooks/        # Webhook 处理
├── components/              # UI 组件
│   ├── ide/                 # IDE 编辑器组件
│   ├── dashboard/           # 控制台组件
│   ├── marketing/           # 营销组件
│   └── ui/                  # 基础 UI 组件
├── ai/                      # AI 功能模块
│   ├── models.ts            # 模型管理
│   ├── generate.ts          # 生成逻辑
│   └── prompts/             # 提示词模板
├── lib/                     # 工具函数
├── trpc/                    # tRPC 客户端
└── env.mjs                  # 环境变量
```

#### apps/builder - Vite 构建工具

独立的 **Vite + React** 应用，用于项目构建：

```text
apps/builder/
├── src/
│   ├── components/          # 构建工具 UI
│   ├── lib/                 # 构建逻辑
│   └── utils/               # 工具函数
├── vite.config.ts           # Vite 配置
└── wrangler.jsonc           # Cloudflare Workers 配置
```

#### apps/cdn - CDN 服务

基于 **Hono** 的内容分发服务：

```text
apps/cdn/
├── src/
│   ├── routes/              # API 路由
│   ├── middleware/          # 中间件
│   └── utils/               # 工具函数
├── wrangler.jsonc           # Workers 配置
└── package.json
```

#### apps/dispatcher - 请求路由

基于 **Hono** 的请求分发服务：

```text
apps/dispatcher/
├── src/
│   ├── middleware/          # 认证中间件
│   ├── routes/              # 路由逻辑
│   └── utils/               # 工具函数
├── wrangler.jsonc           # Cloudflare Workers 配置
└── package.json
```

#### apps/auth-studio - 数据库管理

基于 **Drizzle Studio** 的数据库管理界面：

```text
apps/auth-studio/
├── package.json             # 启动脚本配置
├── DEV.md                   # 开发文档
└── DEV_ZH.md               # 中文开发文档
```

**功能特点：**

- 提供认证数据库的可视化管理界面
- 支持数据表的 CRUD 操作
- 集成 Drizzle ORM 的 Studio 工具
- 运行在端口 3002

#### apps/docs - 文档站点

基于 **Fumadocs + Next.js** 的文档系统：

```text
apps/docs/
├── app/                     # Next.js App Router
│   ├── [lang]/             # 多语言路由
│   ├── layout.tsx          # 布局组件
│   └── page.tsx            # 首页
├── components/              # 文档组件
│   ├── language-switcher.tsx # 语言切换器
│   ├── heading.tsx         # 标题组件
│   └── scroller.tsx        # 滚动组件
├── content/                 # 文档内容
│   ├── meta.json           # 英文元数据
│   ├── meta.zh.json        # 中文元数据
│   ├── opensource/         # 开源相关文档
│   └── platform/           # 平台相关文档
├── lib/                     # 工具函数
│   ├── i18n.ts             # 国际化配置
│   └── translations.ts     # 翻译管理
├── source.config.ts         # Fumadocs 配置
└── wrangler.jsonc          # Cloudflare Workers 配置
```

**技术特点：**

- 基于 Fumadocs 的现代文档框架
- 支持 MDX 格式的文档编写
- 内置多语言支持（中英文）
- 集成 GitHub Stars 显示
- 部署到 Cloudflare Workers

#### apps/email - 邮件模板开发

基于 **React Email** 的邮件模板开发环境：

```text
apps/email/
├── emails/                  # 邮件模板
│   ├── welcomeEmail.tsx    # 欢迎邮件
│   ├── emailVerification.tsx # 邮箱验证
│   ├── organizationInvitation.tsx # 组织邀请
│   ├── signIn.tsx          # 登录邮件
│   └── cancellationEmail.tsx # 取消订阅
├── package.json            # 依赖配置
└── tsconfig.json           # TypeScript 配置
```

**功能特点：**

- 提供邮件模板的实时预览环境
- 支持 React 组件化的邮件开发
- 集成 @libra/email 包的模板

#### apps/vite-shadcn-template - 项目模板

基于 **Vite + React + TypeScript** 的项目脚手架：

```text
apps/vite-shadcn-template/
├── src/                     # 源代码
│   ├── components/         # UI 组件
│   ├── lib/                # 工具函数
│   └── utils/              # 辅助工具
├── public/                 # 静态资源
├── components.json         # 组件配置
├── e2b.Dockerfile         # E2B 容器配置
├── e2b.toml               # E2B 模板配置
├── vite.config.ts         # Vite 配置
├── wrangler.jsonc         # Cloudflare Workers 配置
└── fileStructure.ts       # 文件结构定义
```

**技术特点：**

- 预配置的 Vite + React + TypeScript 环境
- 集成自定义 UI 组件库
- 支持 E2B、Daytona 沙盒环境部署
- 提供完整的项目脚手架模板
- 可部署到 Cloudflare Workers

#### apps/deploy - 部署服务

基于 **Hono** 的 Cloudflare Workers 部署服务：

```text
apps/deploy/
├── src/
│   ├── index.ts            # 主入口
│   ├── handlers/           # 请求处理器
│   └── utils/              # 工具函数
└── wrangler.jsonc          # Workers 配置
```

**功能特点：**

- 处理项目的自动化部署
- 管理 Cloudflare Pages 部署
- 处理构建产物上传
- 集成 GitHub 部署状态更新

#### apps/deploy-workflow - 部署工作流

基于 **Cloudflare Workflows** 的异步部署处理服务：

```text
apps/deploy-workflow/
├── src/
│   ├── index.ts            # 工作流入口
│   ├── steps/              # 工作流步骤
│   └── types/              # 类型定义
└── wrangler.jsonc          # Workers 配置
```

**功能特点：**

- 异步处理长时间部署任务
- 支持多步骤部署流程
- 集成 E2B 沙盒环境
- 部署状态实时更新

#### apps/screenshot - 截图服务

基于 **Playwright** 的网页截图生成服务：

```text
apps/screenshot/
├── src/
│   ├── index.ts            # 服务入口
│   ├── browser/            # 浏览器控制
│   └── utils/              # 工具函数
└── wrangler.jsonc          # Workers 配置
```

**功能特点：**

- 生成项目预览截图
- 支持不同设备尺寸
- 自动等待页面加载
- 缓存优化减少重复截图

### 2.3 共享包架构

#### @libra/ui - 设计系统

基于 **Radix UI 和 CVA** 的自定义组件库：

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

#### @libra/api - tRPC API 层

类型安全的 API 层：

```typescript
// packages/api/src/router/project.ts
export const projectRouter = {
  create: organizationProcedure
    .input(projectSchema)
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId } = await requireOrgAndUser(ctx)
      const db = await getDbAsync()

      // 配额验证
      const quotaDeducted = await checkAndUpdateProjectUsage(orgId)
      if (!quotaDeducted) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Project quota exceeded'
        })
      }

      // 创建项目
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

#### @libra/db - 数据库层

基于 **Drizzle ORM** 的数据库层，提供完整的项目管理、AI 功能统计和订阅管理功能：

```typescript
// packages/db/schema/project-schema.ts
import { createId } from '@paralleldrive/cuid2'
import { sql } from 'drizzle-orm'
import { boolean, integer, pgTable, text, timestamp, varchar, uniqueIndex } from 'drizzle-orm/pg-core'

// 项目主表 - 核心项目信息管理
export const project = pgTable('project', {
  // 主键标识
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey()
    .unique(),

  // 基础项目信息
  name: text('name').notNull(),                    // 项目名称
  templateType: text('template_type').notNull(),  // 模板类型
  url: text('url'),                               // 项目访问 URL

  // Git 集成字段
  gitUrl: text('git_url'),                        // Git 仓库地址
  gitBranch: text('git_branch'),                  // Git 分支

  // 部署和预览
  previewImageUrl: text('preview_image_url'),     // 预览图片 URL
  productionDeployUrl: text('production_deploy_url'), // 生产部署 URL
  workflowId: text('workflow_id'),                // Cloudflare Workflow ID deprecated
  deploymentStatus: varchar('deployment_status', {
    enum: ['idle', 'preparing', 'deploying', 'deployed', 'failed']
  }),                                             // 部署状态

  // 自定义域名管理
  customDomain: text('custom_domain'),            // 自定义域名
  customDomainStatus: varchar('custom_domain_status', {
    enum: ['pending', 'verified', 'active', 'failed']
  }),                                             // 域名状态
  customDomainVerifiedAt: timestamp('custom_domain_verified_at', {
    withTimezone: true,
    mode: 'string'
  }),                                             // 域名验证时间
  customHostnameId: text('custom_hostname_id'),   // Cloudflare 主机名 ID
  ownershipVerification: text('ownership_verification'), // 所有权验证

  // SSL 证书管理
  sslStatus: varchar('ssl_status', {
    enum: ['pending', 'pending_validation', 'active', 'failed']
  }),                                             // SSL 状态

  // 项目设置
  visibility: varchar('visibility', { enum: ['public', 'private'] }), // 可见性
  isActive: boolean('is_active').notNull().default(true), // 是否活跃

  // 关联关系
  userId: text('user_id').notNull(),              // 用户 ID
  organizationId: text('organization_id').notNull(), // 组织 ID
  containerId: text('container_id'),              // 容器 ID

  // AI 功能字段
  initialMessage: text('initial_message'),        // 初始消息
  knowledge: text('knowledge'),                   // 知识库内容
  messageHistory: text('message_history').notNull().default('[]'), // 消息历史

  // 时间戳
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

// 项目 AI 使用统计表
export const projectAIUsage = pgTable('project_ai_usage', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }), // 外键关联
  organizationId: text('organization_id').notNull(),
  totalAIMessageCount: integer('total_ai_message_count').notNull().default(0), // AI 消息总数
  lastUsedAt: timestamp('last_used_at', {
    withTimezone: true,
    mode: 'string'
  }).default(sql`CURRENT_TIMESTAMP`),              // 最后使用时间
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

// 订阅资源限制表
export const subscriptionLimit = pgTable('subscription_limit', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  organizationId: text('organization_id').notNull(),
  stripeCustomerId: text('stripe_customer_id'),   // Stripe 客户 ID
  planName: text('plan_name').notNull(),          // 计划名称
  planId: text('plan_id').notNull(),              // 计划 ID
  aiNums: integer('ai_nums').notNull(),           // AI 使用次数限制
  enhanceNums: integer('enhance_nums').notNull(), // 增强功能次数限制
  seats: integer('seats').notNull().default(1),   // 席位数
  projectNums: integer('project_nums').notNull().default(1), // 项目数限制
  isActive: boolean('is_active').notNull().default(true), // 是否活跃
  periodStart: timestamp('period_start', {
    withTimezone: true,
    mode: 'string'
  }).notNull(),                                   // 计费周期开始
  periodEnd: timestamp('period_end', {
    withTimezone: true,
    mode: 'string'
  }).notNull(),                                   // 计费周期结束
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
  // 唯一约束：每个组织只能有一个活跃的计划
  uniqueOrgPlanActive: uniqueIndex('subscription_limit_org_plan_active_idx')
    .on(table.organizationId, table.planName)
    .where(sql`${table.isActive} = true`)
}))

// 项目资产表 - 管理项目相关的附件文件
export const projectAsset = pgTable('project_asset', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  organizationId: text('organization_id').notNull(),
  projectId: text('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }), // 级联删除
  planId: text('plan_id').notNull(),              // 关联计划 ID
  attachmentKey: text('attachment_key').notNull(), // 附件存储键
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

// TypeScript 类型推断
type Project = typeof project.$inferSelect
type InsertProject = typeof project.$inferInsert
type ProjectAIUsage = typeof projectAIUsage.$inferSelect
type SubscriptionLimit = typeof subscriptionLimit.$inferSelect
type ProjectAsset = typeof projectAsset.$inferSelect
```

**tRPC 集成使用示例：**

```typescript
// packages/api/src/router/project.ts - tRPC Query 示例
export const projectRouter = {
  // 查询组织下的所有项目
  list: organizationProcedure.query(async ({ ctx }) => {
    const { orgId } = await requireOrgAndUser(ctx)
    const db = await getDbAsync()

    return await db
      .select({
        id: project.id,
        name: project.name,
        templateType: project.templateType,
        url: project.url,
        visibility: project.visibility,
        isActive: project.isActive,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })
      .from(project)
      .where(and(
        eq(project.organizationId, orgId),
        eq(project.isActive, true)
      ))
      .orderBy(desc(project.createdAt))
  }),

  // 查询单个项目详情（包含 AI 使用统计）
  getById: organizationProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = await requireOrgAndUser(ctx)
      const db = await getDbAsync()
      const { projectId } = input

      const projectData = await fetchProject(db, projectId)
      ensureOrgAccess(projectData, orgId, 'read')

      // 联表查询项目和 AI 使用统计
      const [result] = await db
        .select({
          project: project,
          aiUsage: projectAIUsage,
        })
        .from(project)
        .leftJoin(projectAIUsage, eq(project.id, projectAIUsage.projectId))
        .where(eq(project.id, projectId))

      return result
    }),

  // tRPC Mutation 示例 - 创建项目
  create: organizationProcedure
    .input(projectSchema)
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId } = await requireOrgAndUser(ctx)
      const db = await getDbAsync()
      const { name, initialMessage, visibility, templateType } = input

      log.project('info', 'Project creation started', {
        orgId,
        userId,
        projectName: name,
        templateType,
        visibility,
      })

      // 配额检查和扣减
      const quotaDeducted = await checkAndUpdateProjectUsage(orgId)
      if (!quotaDeducted) {
        log.project('warn', 'Project creation failed - quota exceeded', {
          orgId,
          userId,
        })
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Project quota exceeded'
        })
      }

      // 事务处理：创建项目并初始化相关记录
      const result = await db.transaction(async (tx) => {
        // 创建项目
        const [newProject] = await tx
          .insert(project)
          .values({
            name: name ?? 'My First Project',
            templateType: templateType ?? 'default',
            visibility: (visibility as 'public' | 'private') ?? 'private',
            initialMessage,
            messageHistory: initialMessage
              ? JSON.stringify([{
                  type: 'user',
                  message: initialMessage,
                  planId: 'initial'
                }])
              : '[]',
            userId,
            organizationId: orgId,
          })
          .returning()

        if (!newProject) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create project'
          })
        }

        // 初始化 AI 使用统计记录
        await tx.insert(projectAIUsage).values({
          projectId: newProject.id,
          organizationId: orgId,
          totalAIMessageCount: 0,
        })

        log.project('info', 'Project created successfully', {
          orgId,
          userId,
          projectId: newProject.id,
          projectName: newProject.name,
        })

        return newProject
      })

      return result
    }),

  // 更新项目配置
  updateConfig: organizationProcedure
    .input(updateProjectConfigSchema)
    .mutation(async ({ ctx, input }) => {
      const { projectId, name, knowledge } = input
      const { orgId } = await requireOrgAndUser(ctx)
      const db = await getDbAsync()

      const projectData = await fetchProject(db, projectId)
      ensureOrgAccess(projectData, orgId, 'update')

      const updates: Partial<typeof project.$inferInsert> = {}
      if (name !== undefined) updates.name = name
      if (knowledge !== undefined) updates.knowledge = knowledge

      if (Object.keys(updates).length === 0) {
        return projectData
      }

      const [updatedProject] = await db
        .update(project)
        .set(updates)
        .where(eq(project.id, projectId))
        .returning()

      if (!updatedProject) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update project'
        })
      }

      return updatedProject
    }),

  // 删除项目（软删除）
  delete: organizationProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { projectId } = input
      const { orgId } = await requireOrgAndUser(ctx)
      const db = await getDbAsync()

      const projectData = await fetchProject(db, projectId)
      ensureOrgAccess(projectData, orgId, 'delete')

      // 事务处理：软删除项目并恢复配额
      await db.transaction(async (tx) => {
        // 软删除项目
        await tx
          .update(project)
          .set({ isActive: false })
          .where(eq(project.id, projectId))

        // 恢复项目配额
        await restoreProjectQuotaOnDeletion(orgId)
      })

      log.project('info', 'Project deleted successfully', {
        orgId,
        projectId,
      })

      return { success: true }
    }),
} satisfies TRPCRouterRecord

// 错误处理和类型安全实践
import { tryCatch } from '@libra/common'

// 使用 tryCatch 进行安全的数据库操作
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

**tRPC 客户端使用示例：**

```typescript
// apps/web/trpc/client.tsx - 客户端配置
'use client'

import { createTRPCReact } from '@trpc/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { useState } from 'react'
import superjson from 'superjson'

import type { AppRouter } from '@libra/api'

// 创建 tRPC React 客户端
export const api = createTRPCReact<AppRouter>()

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30 * 1000, // 30秒
          retry: (failureCount, error) => {
            // 对于认证错误不重试
            if (error?.data?.code === 'UNAUTHORIZED') return false
            return failureCount < 3
          },
        },
      },
    })
  )

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === 'development' ||
            (op.direction === 'down' && op.result instanceof Error),
        }),
        httpBatchLink({
          transformer: superjson,
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            const headers = new Map<string, string>()
            headers.set('x-trpc-source', 'nextjs-react')
            return Object.fromEntries(headers)
          },
        }),
      ],
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  )
}

// apps/web/app/layout.tsx - 应用级集成
import { TRPCReactProvider } from '@/trpc/client'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  )
}

// 组件中的查询使用示例
'use client'

import { api } from '@/trpc/client'
import { Button } from '@libra/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@libra/ui/components/card'
import { Loader2, Plus } from 'lucide-react'

export function ProjectList() {
  // 查询数据 - 自动类型推导
  const {
    data: projects,
    isLoading,
    error,
    refetch
  } = api.project.list.useQuery()

  // 创建项目的变更操作
  const createProject = api.project.create.useMutation({
    onSuccess: (newProject) => {
      // 自动类型推导：newProject 类型为 Project
      console.log('项目创建成功:', newProject.id)

      // 手动使缓存失效，触发重新获取
      utils.project.list.invalidate()
    },
    onError: (error) => {
      // 类型安全的错误处理
      console.error('创建失败:', error.message)
      if (error.data?.code === 'FORBIDDEN') {
        alert('项目配额已用完，请升级套餐')
      }
    },
  })

  // 获取 tRPC utils 用于缓存操作
  const utils = api.useUtils()

  const handleCreateProject = () => {
    createProject.mutate({
      name: '新项目',
      templateType: 'nextjs',
      visibility: 'private',
      initialMessage: '创建一个待办事项应用',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">加载项目中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>加载失败: {error.message}</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-2">
          重试
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">我的项目</h2>
        <Button
          onClick={handleCreateProject}
          disabled={createProject.isPending}
        >
          {createProject.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          创建项目
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}


```

## 3. 核心技术栈

### 3.1 前端技术栈

#### 核心框架

- **Next.js 15.3.5**：App Router 架构，React Server Components，实验性 React 编译器
- **React 19.1.1**：最新 React 版本，支持 Server/Client Components 分离
- **TypeScript 5.8.3**：严格模式，完整类型覆盖

#### 用户界面框架

- **Tailwind CSS 4.1.11**：原子化 CSS，CSS-in-CSS 新语法，CSS 变量支持
- **Radix UI**：无样式的可访问性原语组件（accordion、dialog、tooltip 等）
- **Class Variance Authority (CVA) 0.7.1**：组件变体管理
- **基于 shadcn/ui 设计模式**：自定义组件实现，遵循 shadcn/ui 方法论
- **Lucide React 0.486.0**：图标库
- **next-themes 0.4.6**：主题切换支持

#### 状态管理

- **Zustand 5.0.6**：轻量级客户端状态管理
- **TanStack Query (React Query) 5.83.0**：服务端状态和缓存管理
- **React Hook Form 7.61.1**：高性能表单状态管理

#### 开发工具

- **Vite**：快速开发服务器（builder、template 应用）
- **Turborepo 2.5.5**：Monorepo 构建工具
- **Biome 2.0.6**：代码格式化和 Lint 工具（替代 ESLint + Prettier）

### 3.2 后端技术栈

#### 接口层

- **tRPC 11.4.3**：端到端类型安全 API
- **Zod 4.0.14**：运行时数据验证和类型推导
- **Hono 4.8.10**：轻量级 Web 框架（CDN/dispatcher 服务）

#### 数据库

- **PostgreSQL**：主业务数据库（通过 Neon + Hyperdrive）
- **SQLite**：认证数据库（Cloudflare D1）
- **Drizzle ORM 0.44.4**：类型安全的数据库 ORM
- **Hyperdrive**：Cloudflare 数据库连接池服务

#### 认证与支付

- **better-auth 1.3.4**：现代认证解决方案
- **Stripe**：支付和订阅管理
- **GitHub OAuth**：社交登录（Octokit 22.0.0）
- **Resend**：邮件发送服务

#### 文件存储

- **Cloudflare R2**：对象存储
- **Cloudflare KV**：键值存储
- **E2B 1.2.0-beta.5**：沙盒代码执行环境

### 3.3 AI 集成技术

#### 人工智能提供商

- **Anthropic Claude**：Claude 4.0 Sonnet，通过 @ai-sdk/anthropic 集成
- **Azure OpenAI**：GPT-5、GPT-5 Mini，通过 @ai-sdk/azure 集成
- **Google Gemini**：Gemini 2.5 Pro，通过 AI SDK 集成
- **xAI Grok**：通过 @ai-sdk/xai 集成

#### 人工智能工具

- **Vercel AI SDK 4.3.19**：流式响应和统一 API
- **E2B 1.2.0-beta.5**：沙盒代码执行环境（Docker 容器）
- **Shiki 3.8.1**：代码语法高亮

#### 生成功能

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
    // 严格的访问控制
    if (!canAccessModel(userPlan, modelToUse)) {
      const requestedModel = findModelById(modelToUse)
      throw new Error(`Access denied: ${requestedModel.name} requires ${requestedModel.requiredPlan} subscription. Current plan: ${userPlan}`)
    }
  }

  return MODEL_MAPPING[modelToUse] || (isFileEdit ? DEFAULT_MODELS.FILE_EDIT_FALLBACK : DEFAULT_MODELS.FALLBACK)
}
```

### 3.4 部署与基础设施

#### 云服务提供商

- **Cloudflare**：完整的云原生部署
  - **Workers**：无服务器计算
  - **D1**：边缘 SQLite 数据库
  - **KV**：边缘键值存储
  - **R2**：对象存储
  - **Hyperdrive**：数据库连接池服务
  - **Workers For Platform**：边缘计算平台
  - **Cloudflare for SaaS**：Custom domain, SSL, WAF, DDoS 保护
  - **Cloudflare AI Gateway**：AI 请求代理

#### 部署工具

- **@opennextjs/cloudflare 1.6.2**：Next.js 到 Cloudflare 的适配器
- **Wrangler**：Cloudflare Workers 部署工具
- **Bun 1.2.19**：JavaScript 运行时和包管理器（首选）

#### 开发运维

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

#### 监控与分析

- **Posthog**：产品分析和用户行为追踪
- **结构化日志**：自定义日志系统（组件级别分类）
- **错误跟踪**：集成错误监控和边界处理
- **OpenTelemetry**：可观测性数据收集

## 4. 设计系统与 UI 组件

### 4.1 设计系统架构

项目采用基于 **OKLCH 色彩空间** 的现代设计系统，结合 **Tailwind CSS v4** 的 CSS-in-CSS 新特性：

```css
/* packages/ui/src/styles/variables.css */
:root {
  /* 品牌色彩 - OKLCH 格式 */
  --brand: oklch(66.5% 0.1804 47.04);
  --brand-foreground: oklch(75.77% 0.159 55.91);

  /* 基础色彩 */
  --background: oklch(98% 0.01 95.1);
  --foreground: oklch(34% 0.03 95.72);
  --background-landing: oklch(100% 0.01 97.5);
  --foreground-landing: oklch(32% 0.03 95.72);

  /* 组件色彩 */
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

  /* 图表色彩 */
  --chart-1: oklch(56% 0.13 43);
  --chart-2: oklch(69% 0.16 290.41);
  --chart-3: oklch(88% 0.03 93.13);
  --chart-4: oklch(88% 0.04 298.18);
  --chart-5: oklch(56% 0.13 42.06);

  /* 侧边栏色彩 */
  --sidebar: oklch(97% 0.01 98.88);
  --sidebar-foreground: oklch(36% 0.01 106.65);
  --sidebar-primary: oklch(62% 0.14 39.04);
  --sidebar-primary-foreground: oklch(99% 0 0);
  --sidebar-accent: oklch(92% 0.01 92.99);
  --sidebar-accent-foreground: oklch(33% 0 0);
  --sidebar-border: oklch(94% 0 0);
  --sidebar-ring: oklch(77% 0 0);

  /* 字体系统 */
  --font-sans: Inter, sans-serif;
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: Mona_Sans, monospace;

  /* 布局变量 */
  --radius: 0.625rem;
  --layout-nav-height: 3.5rem; /* 56px */

  /* 阴影系统 */
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 5%);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 5%);
  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 10%), 0 1px 2px -1px hsl(0 0% 0% / 10%);
  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 10%), 0 1px 2px -1px hsl(0 0% 0% / 10%);
  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 10%), 0 2px 4px -1px hsl(0 0% 0% / 10%);
  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 10%), 0 4px 6px -1px hsl(0 0% 0% / 10%);
  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 10%), 0 8px 10px -1px hsl(0 0% 0% / 10%);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 25%);

  /* 插图色彩 */
  --light: var(--brand);
  --light-foreground: var(--brand-foreground);
  --color-1: hsl(0 100% 63%);
  --color-2: hsl(270 100% 63%);
  --color-3: hsl(210 100% 63%);
  --color-4: hsl(195 100% 63%);
  --color-5: hsl(90 100% 63%);
}

.dark {
  /* 品牌色彩 */
  --brand: oklch(83.6% 0.1177 66.87);
  --brand-foreground: oklch(75.77% 0.159 55.91);

  /* 特殊背景 */
  --background-hero: oklch(14.1% 0.005 285.823);
  --foreground-hero: oklch(98.5% 0 0);

  /* 基础色彩 */
  --background: oklch(27% 0 106.64);
  --foreground: oklch(81% 0.01 93.01);
  --background-landing: oklch(18% 0.01 260);
  --foreground-landing: oklch(85% 0.01 95.01);

  /* 组件色彩 */
  --card: oklch(27% 0 106.64);
  --card-foreground: oklch(98% 0.01 95.1);
  --popover: oklch(31% 0 106.6);
  --popover-foreground: oklch(92% 0 106.48);
  --primary: oklch(67% 0.13 38.76);
  --primary-foreground: oklch(100% 0 0);
  --secondary: oklch(98% 0.01 95.1);
  --secondary-foreground: oklch(31% 0 106.6);
  --muted: oklch(22% 0 106.71);
  --muted-foreground: oklch(77% 0.02 99.07);
  --accent: oklch(21% 0.01 95.42);
  --accent-foreground: oklch(97% 0.01 98.88);
  --destructive: oklch(64% 0.21 25.33);
  --destructive-foreground: oklch(100% 0 0);
  --border: oklch(36% 0.01 106.89);
  --input: oklch(43% 0.01 100.22);
  --ring: oklch(36% 0.0728 251.11);

  /* 图表色彩 */
  --chart-1: oklch(56% 0.13 43);
  --chart-2: oklch(69% 0.16 290.41);
  --chart-3: oklch(21% 0.01 95.42);
  --chart-4: oklch(31% 0.05 289.32);
  --chart-5: oklch(56% 0.13 42.06);

  /* 侧边栏色彩 */
  --sidebar: oklch(24% 0 67.71);
  --sidebar-foreground: oklch(81% 0.01 93.01);
  --sidebar-primary: oklch(33% 0 0);
  --sidebar-primary-foreground: oklch(99% 0 0);
  --sidebar-accent: oklch(17% 0 106.62);
  --sidebar-accent-foreground: oklch(81% 0.01 93.01);
  --sidebar-border: oklch(94% 0 0);
  --sidebar-ring: oklch(77% 0 0);

  /* 插图色彩 */
  --light: var(--foreground);
  --light-foreground: var(--foreground);
}
```

### 4.2 组件开发模式

所有 UI 组件遵循 **shadcn/ui 设计模式**，结合 **radix-ui** 原语组件：

```typescript
// packages/ui/src/components/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot as SlotPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../lib/utils'

const buttonVariants = cva(
  // 基础样式
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

**组件开发原则：**

- **CVA 变体管理**：使用 class-variance-authority 统一管理组件变体
- **asChild 模式**：通过 Radix UI Slot 支持组件组合
- **forwardRef**：正确转发 ref 以支持命令式操作
- **类型安全**：完整 TypeScript 类型定义，支持自动推导
- **类型安全**：完整的 TypeScript 类型定义和推导

### 4.3 样式系统规范

#### Tailwind CSS v4 配置

项目使用 **Tailwind CSS v4** 的 CSS-in-CSS 新特性：

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

**PostCSS 配置**：

```js
// packages/ui/postcss.config.mjs
const config = {
  plugins: ['@tailwindcss/postcss'],
}

export default config
```

#### CSS 变量使用规范

- **必须使用** CSS 变量进行颜色定义，禁止硬编码颜色值
- **语义化命名**：使用 primary、secondary、accent 等语义名称
- **主题支持**：所有颜色变量支持亮色/暗色模式切换

```css
/* ✅ 正确：使用语义化 CSS 变量 */
.card {
  background-color: var(--card);
  border: 1px solid var(--border);
  color: var(--card-foreground);
}

/* ❌ 错误：硬编码颜色值 */
.card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #1e293b;
}
```

#### Tailwind 工具类规范

- **优先使用** 语义化工具类（bg-primary、text-muted-foreground）
- **避免使用** 任意值（bg-[#fff]、mt-[12px]）
- **组合使用** cn() 工具函数处理条件类名

```typescript
// ✅ 推荐：语义化类名 + 条件处理
<button className={cn(
  'bg-primary text-primary-foreground',
  'hover:bg-primary/90 transition-colors',
  disabled && 'opacity-50 cursor-not-allowed',
  className
)}>
  {children}
</button>

// ❌ 避免：任意值和硬编码
<button className="bg-[#3b82f6] text-white hover:bg-[#2563eb] disabled:opacity-50">
  {children}
</button>
```

#### 自定义工具类

项目定义了多个自定义工具类：

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

### 4.4 主题系统实现

项目使用 **next-themes** 实现主题切换，支持系统主题检测：

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

主题切换组件实现：

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
      <span className="sr-only">切换主题</span>
    </Button>
  )
}
```

## 5. API 开发规范

### 5.1 tRPC 实现模式

项目使用 **tRPC** 实现端到端类型安全的 API，包含完整的认证、权限验证和错误处理机制：

```typescript
// packages/api/src/trpc.ts
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const auth = await initAuth()
  const session = await auth.api.getSession({ headers: opts.headers })
  const db = await getAuthDb()
  return { db, session, ...opts }
}

// 基础过程定义
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

#### 路由实现示例

```typescript
// packages/api/src/router/project/basic-operations.ts
export const basicOperations = {
  create: organizationProcedure.input(projectSchema).mutation(async ({ ctx, input }) => {
    const { orgId, userId } = await requireOrgAndUser(ctx)
    const { name, initialMessage, visibility, templateType } = input

    // 配额验证
    const quotaDeducted = await checkAndUpdateProjectUsage(orgId)
    if (!quotaDeducted) {
      log.project('warn', 'Project creation failed - quota exceeded', {
        orgId,
        userId,
        operation: 'create',
      })
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Project quota exceeded' })
    }

    // 使用模块化的项目创建工具
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

### 5.2 数据验证与类型安全

所有 API 输入使用 **Zod** 进行验证，确保运行时类型安全：

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

#### 客户端类型推导

```typescript
// apps/web/trpc/client.ts
import { type AppRouter } from '@libra/api'
import { createTRPCReact } from '@trpc/react-query'

export const api = createTRPCReact<AppRouter>()

// 使用示例 - 完全类型安全
export function ProjectList() {
  const { data: projects, isLoading, error } = api.project.list.useQuery()

  const createProject = api.project.create.useMutation({
    onSuccess: (data) => {
      // data 的类型自动推导为 Project
      console.log('Created project:', data.id)
    },
  })

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

### 5.3 错误处理模式

项目使用统一的错误处理模式，包含 **tryCatch** 工具函数和结构化错误响应：

```typescript
// packages/common/src/error.ts
type Success<T> = readonly [T, null]
type Failure<E> = readonly [null, E]
type ResultSync<T, E> = Success<T> | Failure<E>
type ResultAsync<T, E> = Promise<ResultSync<T, E>>
type Operation<T> = Promise<T> | (() => T) | (() => Promise<T>)

export function tryCatch<T, E = Error>(operation: Promise<T>): ResultAsync<T, E>
export function tryCatch<T, E = Error>(operation: () => Promise<T>): ResultAsync<T, E>
export function tryCatch<T, E = Error>(operation: () => T): ResultSync<T, E>
export function tryCatch<T, E = Error>(
  operation: Operation<T>
): ResultSync<T, E> | ResultAsync<T, E> {
  if (operation instanceof Promise) {
    return operation
      .then((data: T) => [data, null] as const)
      .catch((error: E) => [null, error as E] as const)
  }

  try {
    const result = operation()
    if (result instanceof Promise) {
      return result
        .then((data: T) => [data, null] as const)
        .catch((error: E) => [null, error as E] as const)
    }
    return [result, null] as const
  } catch (error) {
    return [null, error as E] as const
  }
}
```

#### 错误处理使用示例

```typescript
// API 路由中的错误处理
export const aiRouter = {
  generate: protectedProcedure
    .input(generateSchema)
    .mutation(async ({ ctx, input }) => {
      const [result, error] = await tryCatch(async () => {
        // 验证配额
        await validateAIQuota(ctx.session.user.id)

        // 生成内容
        return await generateAIResponse(input)
      })

      if (error) {
        log.ai('error', 'AI generation failed', {
          userId: ctx.session.user.id,
          error: error instanceof Error ? error.message : String(error),
        })

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate AI response',
          cause: error,
        })
      }

      return result
    }),
}
```

### 5.4 日志记录规范

项目实现结构化日志系统，支持组件级别的日志分类和上下文传递：

```typescript
// packages/common/src/logger.ts
export const log = {
  // 组件特定的日志记录器
  auth: (level: LogLevel, message: string, context?: LogContext, error?: Error) =>
    logger.auth(level, message, context, error),

  project: (level: LogLevel, message: string, context?: LogContext, error?: Error) =>
    logger.project(level, message, context, error),

  ai: (level: LogLevel, message: string, context?: LogContext, error?: Error) =>
    logger.ai(level, message, context, error),

  billing: (level: LogLevel, message: string, context?: LogContext, error?: Error) =>
    logger.billing(level, message, context, error),
}

// 使用示例
log.project('info', 'Project creation started', {
  orgId, userId, projectName: name, templateType,
})

log.ai('error', 'Model selection failed', {
  userId, requestedModel, userPlan,
  error: error instanceof Error ? error.message : String(error),
})
```

#### 日志上下文结构

```typescript
interface LogContext {
  // 用户相关
  userId?: string
  orgId?: string

  // 操作相关
  operation?: string
  resource?: string
  resourceId?: string

  // 业务相关
  projectId?: string
  modelId?: string
  quotaType?: string

  // 技术相关
  duration?: number
  error?: string

  // 其他业务特定字段
  [key: string]: unknown
}
```

## 6. 数据库设计与操作

### 6.1 双数据库架构

项目采用 **双数据库架构** 来优化性能和功能分离：

#### 业务数据库 - PostgreSQL (Hyperdrive)

- **用途**：存储核心业务数据（项目、文件、AI 对话等）
- **连接方式**：通过 Cloudflare Hyperdrive 连接池
- **优势**：高性能、复杂查询支持、事务完整性
- **访问函数**：`getDbAsync()`, `getDbForHono()`

#### 认证数据库 - SQLite (Cloudflare D1)

- **用途**：存储用户认证、会话、组织权限数据
- **连接方式**：直接连接 Cloudflare D1
- **优势**：低延迟、边缘计算友好、better-auth 原生支持
- **访问函数**：`getAuthDb()`

#### 数据库选择指南

```typescript
// 业务数据操作 - 使用 PostgreSQL
const db = await getDbAsync()
const projects = await db.query.project.findMany()

// 认证相关操作 - 使用 SQLite D1
const authDb = await getAuthDb()
const user = await authDb.query.user.findFirst()
```

### 6.2 PostgreSQL 连接配置（Hyperdrive）

项目使用 **Cloudflare Hyperdrive** 进行 PostgreSQL 连接池管理，优化连接性能：

```typescript
// packages/db/index.ts
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { cache } from 'react'

// 用于 React Server Components 的异步数据库连接
export const getDbAsync = async () => {
  let connectionString: string | undefined
  if ((process.env['NODE_ENV'] as string) === 'development') {
    connectionString = env.POSTGRES_URL
  } else {
    const { env: cfEnv } = await getCloudflareContext({ async: true })
    // Type assertion for HYPERDRIVE property
    const hyperdrive = (cfEnv as any).HYPERDRIVE
    connectionString = hyperdrive?.connectionString
  }
  if (!connectionString) {
    throw new Error('Database connection string not found for async.')
  }
  const pool = new pg.Pool({
    connectionString: connectionString,
    maxUses: 1,  // 适配无服务器环境，每个连接只使用一次
  })
  return drizzleNode({ client: pool, schema: schema })
}

// 用于 Hono 应用（Cloudflare Workers）的数据库连接
export async function getDbForHono(c: HonoDbContext) {
  let connectionString: string | undefined
  const nodeEnv: string = c.env.NODE_ENV || 'production'

  // 开发环境：使用直连 PostgreSQL
  if (nodeEnv === 'development') {
    connectionString = c.env?.POSTGRES_URL
  } else {
    // 生产环境：使用 HYPERDRIVE 连接池
    const hyperdrive = c.env?.HYPERDRIVE
    connectionString = hyperdrive?.connectionString
  }

  if (!connectionString) {
    throw new Error(`No database connection string available. Environment: ${nodeEnv}`)
  }

  const pool = new pg.Pool({ connectionString, maxUses: 1 })
  return drizzleNode({ client: pool, schema })
}
```

**Hyperdrive 配置优势：**

- **连接池管理**：自动管理数据库连接池，减少连接开销
- **全球分布**：在 Cloudflare 边缘网络中缓存连接
- **自动重试**：内置连接失败重试机制
- **性能优化**：减少 TCP 握手延迟

### 6.3 Schema 设计规范

项目使用 **Drizzle ORM** 与 PostgreSQL/SQLite 数据库，遵循严格的 Schema 设计规范：

```typescript
// packages/db/schema/project-schema.ts
import { createId } from '@paralleldrive/cuid2'
import { sql } from 'drizzle-orm'
import { boolean, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const project = pgTable('project', {
  // 主键：使用 CUID2 生成唯一标识符
  id: text('id').$defaultFn(() => createId()).primaryKey().unique(),

  // 基础字段
  name: text('name').notNull(),
  templateType: text('template_type').notNull(),
  url: text('url'),
  gitUrl: text('git_url'),
  previewImageUrl: text('preview_image_url'),

  // 枚举字段：使用 varchar 约束
  visibility: varchar('visibility', { enum: ['public', 'private'] }),

  // 布尔字段：提供默认值
  isActive: boolean('is_active').notNull().default(true),

  // 外键关联
  userId: text('user_id').notNull(),
  organizationId: text('organization_id').notNull(),
  containerId: text('container_id'),

  // JSON 字段
  initialMessage: text('initial_message'),
  messageHistory: text('message_history').notNull().default('[]'),

  // 审计字段：自动管理创建和更新时间
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string'
  }).default(sql`CURRENT_TIMESTAMP`),

  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow().notNull().$onUpdate(() => sql`now()`),
})

// 类型导出
export type Project = typeof project.$inferSelect
export type NewProject = typeof project.$inferInsert
```

**Schema 设计原则：**

- **CUID2 主键**：所有表使用 CUID2 作为主键，保证全局唯一性
- **审计字段**：每个表包含 createdAt 和 updatedAt 字段
- **枚举约束**：使用 varchar enum 限制字段值
- **非空约束**：合理使用 notNull() 约束
- **默认值**：为布尔字段和状态字段提供默认值
- **时区支持**：时间戳字段启用时区支持

### 6.4 查询模式

#### 基础查询操作

```typescript
// packages/api/src/router/project.ts
import { db } from '@libra/db'
import { project } from '@libra/db/schema'
import { eq, desc, and, isNotNull } from 'drizzle-orm'

// 查询用户的活跃项目
export async function getUserActiveProjects(userId: string, orgId: string) {
  return await db.query.project.findMany({
    where: and(
      eq(project.userId, userId),
      eq(project.organizationId, orgId),
      eq(project.isActive, true)
    ),
    orderBy: [desc(project.updatedAt)],
    limit: 20,
  })
}

// 关联查询示例
export async function getProjectWithFiles(projectId: string) {
  return await db.query.project.findFirst({
    where: eq(project.id, projectId),
    with: {
      files: {
        orderBy: [desc(files.updatedAt)],
      },
      owner: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}
```

#### 事务处理

```typescript
// 复杂操作使用事务确保数据一致性
export async function createProjectWithFiles(
  projectData: NewProject,
  initialFiles: NewFile[]
) {
  return await db.transaction(async (tx) => {
    // 创建项目
    const [newProject] = await tx
      .insert(project)
      .values(projectData)
      .returning()

    if (!newProject) {
      throw new Error('Failed to create project')
    }

    // 创建初始文件
    if (initialFiles.length > 0) {
      await tx.insert(files).values(
        initialFiles.map(file => ({
          ...file,
          projectId: newProject.id,
        }))
      )
    }

    return newProject
  })
}
```

### 6.5 数据完整性

#### 外键约束和级联删除

```typescript
// 定义关系和约束
export const projectRelations = relations(project, ({ one, many }) => ({
  owner: one(user, {
    fields: [project.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [project.organizationId],
    references: [organization.id],
  }),
  files: many(files),
  aiUsage: many(aiUsage),
}))

// 软删除模式
export async function softDeleteProject(projectId: string) {
  const [deletedProject] = await db
    .update(project)
    .set({
      isActive: false,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(project.id, projectId))
    .returning()

  return deletedProject
}
```

## 7. 认证与权限系统

### 7.1 better-auth 集成

项目使用 **better-auth** 实现现代化认证系统，支持多种认证方式和 Cloudflare 集成：

```typescript
// packages/auth/auth-server.ts
import { betterAuth } from 'better-auth'
import { organization, emailOTP, admin, bearer } from 'better-auth/plugins'
import { stripe } from '@libra/better-auth-stripe'
import { withCloudflare } from '@libra/better-auth-cloudflare'
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
                  // 错误处理和日志记录
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
        admin({
          defaultRole: 'user',
          adminRoles: ['admin', 'superadmin'],
        }),
        organization(),
        emailOTP(),
        stripe(),
        emailHarmony(),
        bearer()
      ]
    })
  )
}
```

### 7.2 组织权限模式

项目实现多租户组织架构，支持层级权限管理：

```typescript
// packages/auth/organization.ts
export interface OrganizationMember {
  id: string
  userId: string
  organizationId: string
  role: 'owner' | 'admin' | 'member'
  permissions: Permission[]
  invitedAt: Date
  joinedAt?: Date
}

export const organizationPermissions = {
  'project:create': 'Create new projects',
  'project:read': 'View projects',
  'project:update': 'Edit projects',
  'project:delete': 'Delete projects',
  'member:invite': 'Invite new members',
  'member:manage': 'Manage member roles',
  'billing:view': 'View billing information',
  'billing:manage': 'Manage subscriptions',
} as const

export async function checkPermission(
  userId: string,
  orgId: string,
  permission: keyof typeof organizationPermissions
): Promise<boolean> {
  const member = await getOrganizationMember(userId, orgId)
  if (!member) return false

  // 所有者拥有所有权限
  if (member.role === 'owner') return true

  // 检查特定权限
  return member.permissions.includes(permission)
}
```

### 7.3 API 权限验证

```typescript
// packages/api/src/auth-utils.ts
export async function requireOrgAndUser(ctx: Context) {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const activeOrganizationId = ctx.session.session?.activeOrganizationId
  if (!activeOrganizationId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'No active organization'
    })
  }

  return {
    userId: ctx.session.user.id,
    orgId: activeOrganizationId,
  }
}

export async function requirePermission(
  ctx: Context,
  permission: Permission
) {
  const { userId, orgId } = await requireOrgAndUser(ctx)

  const hasPermission = await checkPermission(userId, orgId, permission)
  if (!hasPermission) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Missing permission: ${permission}`
    })
  }

  return { userId, orgId }
}
```

## 8. Stripe 支付集成

### 8.1 Stripe 插件配置

项目使用自定义的 `@libra/better-auth-stripe` 插件集成 Stripe 支付功能：

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

### 8.2 订阅计划管理

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
}

// 创建或更新订阅限制
export async function createOrUpdateSubscriptionLimit(
  organizationId: string,
  stripeCustomerId: string | null,
  plan: string,
  periodStart: Date,
  periodEnd: Date,
  customLimits?: { aiNums?: number; seats?: number; projectNums?: number }
) {
  // 实现订阅限制的创建和更新逻辑
}
```

### 8.3 Webhook 处理

```typescript
// packages/auth/webhooks/stripe-handler.ts
export async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription

  // 更新组织的订阅状态
  await updateOrganizationSubscription(subscription)

  // 发送确认邮件
  await sendSubscriptionUpdateEmail(subscription)
}

export async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription

  // 降级到免费计划
  await downgradeToFreePlan(subscription.metadata.organizationId)
}
```

## 9. AI 功能开发

### 9.1 AI 模型管理

项目支持多个 AI 提供商，实现基于用户计划的模型访问控制：

```typescript
// apps/web/configs/ai-models.ts
export const PLAN_TYPES = {
  FREE: 'libra free',
  PRO: 'libra pro',
  MAX: 'libra max',
} as const

export type AIModel = {
  id: string
  name: string
  icon: string
  provider: 'anthropic' | 'openai' | 'google'
  requiredPlan: PlanType
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-5',
    name: 'GPT 5',
    icon: '/openai.svg',
    provider: 'openai',
    requiredPlan: PLAN_TYPES.FREE,
  },
  {
    id: 'claude-4-0-sonnet',
    name: 'Claude 4.0 Sonnet',
    icon: '/anthropic.svg',
    provider: 'anthropic',
    requiredPlan: PLAN_TYPES.PRO,
  },
  {
    id: 'gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    icon: '/google.svg',
    provider: 'google',
    requiredPlan: PLAN_TYPES.PRO,
  },
]

// 文件编辑操作使用优化的小模型
const DEFAULT_MODELS = {
  FILE_EDIT: 'gpt-5-mini',
  FALLBACK: 'chat-model-reasoning-azure',
  FILE_EDIT_FALLBACK: 'chat-model-reasoning-azure-mini',
} as const

export const selectModel = (
  userPlan: string,
  selectedModelId?: string,
  isFileEdit = false
): string => {
  let modelToUse = selectedModelId

  // 文件编辑操作使用优化的小模型
  if (isFileEdit) {
    modelToUse = DEFAULT_MODELS.FILE_EDIT
  } else if (!modelToUse) {
    const defaultModel = getDefaultModelForPlan(userPlan)
    modelToUse = defaultModel.id
  } else {
    // 严格的访问控制
    if (!canAccessModel(userPlan, modelToUse)) {
      const requestedModel = MODELS[modelToUse]
      throw new Error(
        `Access denied: ${requestedModel.name} requires ${requestedModel.requiredPlan} subscription`
      )
    }
  }

  return MODEL_MAPPING[modelToUse] || DEFAULT_MODELS.FALLBACK
}

export function canAccessModel(userPlan: string, modelId: string): boolean {
  const model = MODELS[modelId]
  if (!model) return false

  const planHierarchy = ['free', 'basic', 'pro', 'enterprise']
  const userPlanIndex = planHierarchy.indexOf(userPlan)
  const requiredPlanIndex = planHierarchy.indexOf(model.requiredPlan)

  return userPlanIndex >= requiredPlanIndex
}
```

### 9.2 配额与计费系统

实现基于用户计划的 AI 使用配额管理：

```typescript
// packages/api/src/utils/quota.ts
export async function validateAIQuota(
  organizationId: string,
  quotaType: 'ai' | 'reasoning' = 'ai'
): Promise<void> {
  const [quotaInfo, error] = await tryCatch(async () => {
    return await getCombinedProjectQuota(organizationId)
  })

  if (error || !quotaInfo) {
    log.ai('error', 'AI quota validation failed', {
      organizationId, quotaType,
      error: error instanceof Error ? error.message : String(error),
    })
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to validate AI quota',
    })
  }

  const { current, limit } = quotaInfo[quotaType]

  if (current >= limit) {
    log.ai('warn', 'AI quota exceeded', {
      organizationId, quotaType, current, limit,
    })
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `${quotaType} quota exceeded. Current: ${current}, Limit: ${limit}`,
    })
  }

  log.ai('info', 'AI quota validated', {
    organizationId, quotaType, current, limit, remaining: limit - current,
  })
}

export async function updateAIUsage(
  organizationId: string,
  usage: {
    quotaType: 'ai' | 'reasoning'
    tokensUsed: number
    modelId: string
    cost?: number
  }
): Promise<void> {
  const db = await getDbAsync()

  await db.insert(aiUsage).values({
    organizationId,
    quotaType: usage.quotaType,
    tokensUsed: usage.tokensUsed,
    modelId: usage.modelId,
    cost: usage.cost,
    createdAt: new Date().toISOString(),
  })
}
```

### 9.3 生成与流式响应

实现 AI 内容生成的完整流程，包括上下文构建、模型选择和流式响应：

```typescript
// apps/web/ai/generate.ts
export const generateStreamResponse = async (
  prompt: string,
  projectId: string,
  selectedItems: SelectedItem[] = [],
  imageData?: ImageData | null,
  abortSignal?: AbortSignal,
  config: GenerationConfig = { isFileEdit: false, quotaType: 'ai' }
) => {
  const [result, error] = await tryCatch(async () => {
    validateAbortSignal(abortSignal)

    // 获取项目数据和用户信息
    const projectData = await fetchProjectData(projectId)

    // 验证配额
    await validateQuota(projectData.organizationId, config.quotaType)

    // 构建生成上下文
    const context = await buildGenerationContext(projectData, config)

    // 选择模型
    const selectedModel = selectModel(
      context.userPlan,
      config.modelId,
      config.isFileEdit
    )

    // 构建消息历史
    const messages = await buildMessageHistory(
      prompt,
      selectedItems,
      imageData,
      context
    )

    // 生成响应
    const streamResult = streamText({
      model: myProvider.languageModel(selectedModel),
      system: systemPromptText,
      messages,
      abortSignal,
      providerOptions: buildProviderOptions(config),
    })

    return streamResult.textStream
  })

  if (error) {
    const operation = config.isFileEdit ? 'streamGenerateAppForFileEdit' : 'streamGenerateApp'
    console.error(`Error in ${operation}:`, error)
    throw error
  }

  return result
}
```

### 9.4 提示词工程

实现结构化的提示词管理系统：

```typescript
// apps/web/ai/prompts/system-prompt.ts
export const buildSystemPrompt = (context: GenerationContext): string => {
  const {
    projectFiles,
    selectedItems,
    projectName,
    templateType,
    hasReasoningEnabled,
    capabilities,
  } = context

  return `
<libra_info>
你是 Libra，一个专业的全栈开发 AI 助手。你可以查看、创建和编辑文件，在浏览器中运行代码，并为用户构建完整的 Web 应用程序。

<capabilities>
${capabilities.map(cap => `- ${cap}`).join('\n')}
</capabilities>

<project_context>
项目名称: ${projectName}
模板类型: ${templateType}
推理模式: ${hasReasoningEnabled ? '启用' : '禁用'}
</project_context>

${projectFiles ? `
<current_files>
${Object.entries(projectFiles)
  .map(([path, content]) => `
<file path="${path}">
${content}
</file>
`).join('')}
</current_files>
` : ''}

${selectedItems.length > 0 ? `
<selected_context>
用户选择了以下内容进行重点关注:
${selectedItems.map(item => `
<selected_item type="${item.type}" file="${item.file}">
${item.content}
</selected_item>
`).join('')}
</selected_context>
` : ''}
</libra_info>

请根据用户的请求提供准确、实用的帮助。当创建或修改文件时，请确保代码质量和最佳实践。
`
}
```

### 9.5 沙盒执行环境

项目集成 **E2B** 提供安全的代码执行环境，支持在 Docker 容器中运行用户代码：

#### 容器配置

```typescript
// packages/sandbox/src/config/index.ts
import { SandboxConfig } from '../types'

export const DEFAULT_SANDBOX_CONFIGS: Record<string, Partial<SandboxConfig>> = {
  'vite-shadcn-template-libra': {
    template: 'vite-shadcn-template-libra',
    timeoutMs: 300000, // 5 分钟
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
    timeoutMs: 300000, // 5 分钟
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

// 创建沙盒实例
export async function createSandbox(config: SandboxConfig) {
  const factory = getSandboxFactory()
  return factory.createSandbox(config)
}
```

#### Docker 模板配置

```dockerfile
# e2b/Dockerfile.vite
FROM oven/bun:slim

WORKDIR /app

# 安装依赖
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 5173

# 启动命令
CMD ["bun", "run", "dev", "--host"]
```

#### 配置文件 (e2b.toml)

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

#### 沙盒操作 API

```typescript
// lib/e2b/operations.ts
export class SandboxOperations {
  private sandbox: E2B.Sandbox

  constructor(sandbox: E2B.Sandbox) {
    this.sandbox = sandbox
  }

  // 执行命令
  async exec(command: string) {
    const result = await this.sandbox.exec(command)
    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    }
  }

  // 写入文件
  async writeFile(path: string, content: string) {
    await this.sandbox.filesystem.write(path, content)
  }

  // 读取文件
  async readFile(path: string): Promise<string> {
    return await this.sandbox.filesystem.read(path)
  }

  // 获取预览 URL
  async getPreviewUrl(): Promise<string> {
    const ports = await this.sandbox.ports.list()
    const previewPort = ports.find(p => p.port === 5173 || p.port === 3000)

    if (!previewPort) {
      throw new Error('No preview port found')
    }

    return `https://${this.sandbox.id}-${previewPort.port}.e2b.dev`
  }

  // 清理资源
  async cleanup() {
    await this.sandbox.close()
  }
}
```

#### 安全最佳实践

```typescript
// lib/e2b/security.ts
export const sandboxSecurityConfig = {
  // 禁止的命令
  blockedCommands: [
    'rm -rf /',
    'dd if=/dev/zero',
    'fork bomb',
    ':(){ :|:& };:',
  ],

  // 文件系统限制
  fsLimits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1000,
    allowedExtensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.html', '.json'],
  },

  // 网络限制
  networkPolicy: {
    allowedDomains: ['*.npmjs.org', '*.unpkg.com', '*.jsdelivr.net'],
    blockedPorts: [22, 3306, 5432],
  },
}

// 命令验证
export function validateCommand(command: string): boolean {
  return !sandboxSecurityConfig.blockedCommands.some(blocked =>
    command.includes(blocked)
  )
}
```

## 9. 状态管理模式

### 9.1 客户端状态管理

项目使用 **Zustand** 管理客户端状态，提供轻量级、类型安全的状态管理：

```typescript
// lib/stores/project-store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface ProjectState {
  // 当前项目状态
  currentProject: Project | null
  selectedFiles: string[]
  isPreviewOpen: boolean
  isSidebarCollapsed: boolean

  // Actions
  setCurrentProject: (project: Project | null) => void
  toggleFile: (filePath: string) => void
  togglePreview: () => void
  toggleSidebar: () => void

  // Computed values
  hasSelectedFiles: () => boolean
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentProject: null,
      selectedFiles: [],
      isPreviewOpen: false,
      isSidebarCollapsed: false,

      // Actions
      setCurrentProject: (project) =>
        set({ currentProject: project }, false, 'setCurrentProject'),

      toggleFile: (filePath) =>
        set((state) => ({
          selectedFiles: state.selectedFiles.includes(filePath)
            ? state.selectedFiles.filter(f => f !== filePath)
            : [...state.selectedFiles, filePath]
        }), false, 'toggleFile'),

      togglePreview: () =>
        set((state) => ({ isPreviewOpen: !state.isPreviewOpen }), false, 'togglePreview'),

      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }), false, 'toggleSidebar'),

      // Computed values
      hasSelectedFiles: () => get().selectedFiles.length > 0,
    }),
    { name: 'project-store' }
  )
)
```

### 9.2 服务端状态管理

使用 **TanStack Query** (React Query) 管理服务端状态和缓存：

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 分钟
      gcTime: 1000 * 60 * 30,   // 30 分钟
      retry: (failureCount, error) => {
        // 不重试认证错误
        if (error?.message?.includes('UNAUTHORIZED')) return false
        return failureCount < 3
      },
    },
    mutations: {
      retry: false,
      onError: (error) => {
        // 全局错误处理
        console.error('Mutation error:', error)
      },
    },
  },
})

// hooks/use-projects.ts
export function useProjects() {
  return api.project.list.useQuery(undefined, {
    select: (data) => data.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ),
  })
}

export function useCreateProject() {
  const utils = api.useUtils()

  return api.project.create.useMutation({
    onSuccess: (newProject) => {
      // 更新项目列表缓存
      utils.project.list.setData(undefined, (old) =>
        old ? [newProject, ...old] : [newProject]
      )

      // 预取新项目详情
      utils.project.getById.setData({ id: newProject.id }, newProject)
    },
    onError: (error) => {
      console.error('Failed to create project:', error)
    },
  })
}
```

### 9.3 缓存策略

#### 智能缓存失效

```typescript
// utils/cache.ts
export function invalidateProjectCache(projectId: string) {
  const utils = api.useUtils()

  // 失效相关查询
  utils.project.getById.invalidate({ id: projectId })
  utils.project.list.invalidate()
  utils.file.getProjectFiles.invalidate({ projectId })
}

export function updateProjectCache(projectId: string, updates: Partial<Project>) {
  const utils = api.useUtils()

  // 乐观更新
  utils.project.getById.setData({ id: projectId }, (old) =>
    old ? { ...old, ...updates } : undefined
  )

  utils.project.list.setData(undefined, (old) =>
    old?.map(p => p.id === projectId ? { ...p, ...updates } : p)
  )
}
```

## 10. 邮件系统

### 10.1 React Email 集成

项目使用 **React Email** 和 **Resend** 构建现代化邮件系统：

```typescript
// packages/email/index.ts
import { Resend } from 'resend';
import {env} from "./env.mjs";

export const resend = new Resend(env.RESEND_API_KEY);

export * from './utils/email'

// packages/email/env.mjs
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    RESEND_FROM: z.string().min(1).email(),
    RESEND_API_KEY: z.string().min(1),
  },
  runtimeEnv: {
    RESEND_FROM: process.env['RESEND_FROM'],
    RESEND_API_KEY: process.env['RESEND_API_KEY'],
  },
})
```

### 10.2 邮件模板系统

项目提供完整的邮件模板库，使用 React 组件构建，支持 Tailwind CSS 样式：

```typescript
// packages/email/templates/emails/index.tsx
// Export all email templates for easier imports
export { CancellationEmailTemplate } from './cancellation-email'
export { ContactTemplate } from './contact'
export { EmailVerificationTemplate } from './email-verification'
export { OrganizationInvitationTemplate } from './organization-invitation'
export { SignInTemplate } from './sign-in'
export { WelcomeEmailTemplate } from './welcomeEmail'

// Template subject mapping
export const emailSubjects = {
  'sign-in': 'Libra - Sign-in Verification Code',
  'email-verification': 'Libra - Email Verification Code',
  welcome: 'Welcome to Libra!',
  cancellation: 'Libra Subscription Cancelled',
  'organization-invitation': 'Invitation to join a team on Libra',
}
```

**邮件模板组件示例**：

```typescript
// packages/email/templates/emails/welcomeEmail.tsx
import {
  Heading,
  Text,
  Section,
  Link,
} from '@react-email/components';
import type * as React from 'react';
import {
  Button,
  ContentSection,
  EmailContainer,
  InfoBox
} from '../../components';

interface WelcomeEmailTemplateProps {
  planName: string;
}

export const WelcomeEmailTemplate: React.FC<WelcomeEmailTemplateProps> = ({
  planName
}) => {
  return (
    <EmailContainer
      title={`Welcome to the ${planName} Plan`}
      previewText={`Welcome to the ${planName} Plan!`}
    >
      <ContentSection>
        <Heading as="h2" className="mt-0 text-gray-800 text-xl font-semibold">
          Welcome to the {planName} Plan!
        </Heading>

        <Text className="mb-6 text-gray-600 leading-relaxed">
          Thank you for subscribing to the {planName} Plan! We're excited to have you on board and can't wait to see what you'll accomplish with Libra.
        </Text>

        {/* Plan Benefits */}
        <InfoBox title={`Your ${planName} Plan Benefits`} variant="info">
          <ul className="text-gray-600 m-0 list-disc pl-5">
            <li className="mb-2">Access to all premium features</li>
            <li className="mb-2">Priority customer support</li>
            <li className="mb-2">Advanced analytics and reporting</li>
            <li className="m-0">Unlimited team members</li>
          </ul>
        </InfoBox>

        <Text className="text-gray-600 mb-6 leading-relaxed">
          Your subscription is now active. Here's how to get started:
        </Text>

        {/* Call to Action Button */}
        <Section className="text-center mb-7">
          <Button href="#" variant="primary">
            Start Using Libra Now
          </Button>
        </Section>

        {/* Help Center */}
        <Text className="text-gray-600 mb-2 leading-relaxed">
          Need help? Check out our {" "}
          <Link href="#" className="text-brand no-underline hover:underline">
            Help Center
          </Link>{" "}
          or contact our support team.
        </Text>
      </ContentSection>
    </EmailContainer>
  );
};
```

**登录验证邮件示例**：

```typescript
// packages/email/templates/emails/sign-in.tsx
import {
  Heading,
  Text,
  Section,
} from '@react-email/components';
import type * as React from 'react';
import {
  Button,
  ContentSection,
  EmailContainer,
  OtpCode
} from '../../components';

interface SignInTemplateProps {
  otp: string;
}

export const SignInTemplate: React.FC<SignInTemplateProps> = ({ otp }) => {
  return (
    <EmailContainer
      title="Libra Sign-in Verification"
      previewText={`Libra verification code: ${otp}`}
    >
      <ContentSection>
        <Heading as="h2" className="mt-0 text-gray-800 text-xl font-semibold">
          Verify Your Sign-in
        </Heading>

        <Text className="mb-6 text-gray-600 leading-relaxed">
          Hello! We received a request to sign in to your Libra account. Please use the following verification code to complete the sign-in process:
        </Text>

        {/* 使用 OtpCode 组件显示验证码 */}
        <OtpCode code={otp} />

        <Text className="text-gray-600 mb-2 leading-relaxed">
          This verification code will expire in <strong>10 minutes</strong>.
        </Text>

        <Section className="text-center mb-7">
          <Button href="#" variant="primary">
            Visit Libra
          </Button>
        </Section>

        <Section className="border-t border-gray-200 pt-5 mt-2">
          <Text className="text-sm text-gray-500 mb-0 leading-relaxed">
            <strong>Security Tip:</strong> Libra will never ask for your password or financial information via email.
          </Text>
        </Section>
      </ContentSection>
    </EmailContainer>
  );
};
```

### 10.3 邮件发送工具

```typescript
// packages/email/utils/email.ts
export async function sendWelcomeEmail(userEmail: string, planName: string) {
  try {
    await resend.emails.send({
      from: env.RESEND_FROM,
      to: [userEmail],
      subject: `Welcome to the Libra ${planName} Plan`,
      react: React.createElement(WelcomeEmailTemplate, { planName }) as any,
    })
  } catch (error) {
    throw error
  }
}

export async function sendOrganizationInvitation(options: {
  email: string
  invitedByUsername: string
  teamName: string
  inviteLink: string
}) {
  const { email, invitedByUsername, teamName, inviteLink } = options

  await resend.emails.send({
    from: env.RESEND_FROM,
    to: [email],
    subject: 'Invitation to join a team on Libra',
    react: React.createElement(OrganizationInvitationTemplate, {
      invitedByUsername,
      teamName,
      inviteLink
    }) as any,
  })
}
```

## 11. 错误处理与日志

### 11.1 统一错误处理

项目实现了完整的错误处理体系，包含 **tryCatch** 模式和结构化错误响应：

```typescript
// packages/common/src/error.ts
type Success<T> = readonly [T, null]
type Failure<E> = readonly [null, E]
type ResultSync<T, E> = Success<T> | Failure<E>
type ResultAsync<T, E> = Promise<ResultSync<T, E>>
type Operation<T> = Promise<T> | (() => T) | (() => Promise<T>)

export function tryCatch<T, E = Error>(operation: Promise<T>): ResultAsync<T, E>
export function tryCatch<T, E = Error>(operation: () => Promise<T>): ResultAsync<T, E>
export function tryCatch<T, E = Error>(operation: () => T): ResultSync<T, E>
export function tryCatch<T, E = Error>(
  operation: Operation<T>
): ResultSync<T, E> | ResultAsync<T, E> {
  if (operation instanceof Promise) {
    return operation
      .then((data: T) => [data, null] as const)
      .catch((error: E) => [null, error as E] as const)
  }

  try {
    const result = operation()

    if (result instanceof Promise) {
      return result
        .then((data: T) => [data, null] as const)
        .catch((error: E) => [null, error as E] as const)
    }

    return [result, null] as const
  } catch (error) {
    return [null, error as E] as const
  }
}

// 使用示例
const [data, error] = await tryCatch(async () => {
  return await fetchUserData(userId)
})

if (error) {
  log.auth('error', 'Failed to fetch user data', { userId })
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
}

return data
```

### 11.2 结构化日志记录

实现组件级别的结构化日志系统：

```typescript
// packages/common/src/logger.ts
interface LogContext {
  // 用户上下文
  userId?: string
  orgId?: string
  sessionId?: string

  // 业务上下文
  projectId?: string
  operation?: string
  resource?: string

  // 技术上下文
  duration?: number
  requestId?: string
  userAgent?: string

  // 错误上下文
  error?: string
  stackTrace?: string

  [key: string]: unknown
}

export const log = {
  auth: (level: 'info' | 'warn' | 'error', message: string, context?: LogContext) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      component: 'auth',
      message,
      ...context,
    }))
  },

  project: (level: 'info' | 'warn' | 'error', message: string, context?: LogContext) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      component: 'project',
      message,
      ...context,
    }))
  },

  ai: (level: 'info' | 'warn' | 'error', message: string, context?: LogContext) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      component: 'ai',
      message,
      ...context,
    }))
  },
}
```

### 11.3 错误监控

#### 前端错误边界

```typescript
// components/error-boundary.tsx
'use client'

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { Button } from '@libra/ui'

function ErrorFallback({ error, resetErrorBoundary }: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <h2 className="text-2xl font-bold text-destructive mb-4">出现错误</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        抱歉，应用程序遇到了意外错误。请尝试刷新页面或联系支持团队。
      </p>
      <div className="flex gap-4">
        <Button onClick={resetErrorBoundary}>重试</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          刷新页面
        </Button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8 w-full max-w-2xl">
          <summary className="cursor-pointer text-sm font-medium">
            错误详情 (开发模式)
          </summary>
          <pre className="mt-4 p-4 bg-muted rounded text-xs overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  )
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // 发送错误到监控服务
        console.error('Error caught by boundary:', error, errorInfo)
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
```

## 12. 国际化实现

### 12.1 Paraglide.js 集成

项目使用 **Paraglide.js** 实现类型安全的国际化：

#### Paraglide 配置

```json
// apps/web/project.inlang/settings.json
{
  "$schema": "https://inlang.com/schema/project-settings",
  "baseLocale": "en",
  "locales": [
    "en",
    "zh"
  ],
  "modules": [
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-message-format@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-m-function-matcher@latest/dist/index.js"
  ],
  "plugin.inlang.messageFormat": {
    "pathPattern": "./messages/{locale}.json"
  }
}
```

#### 语言切换实现

```typescript
// apps/web/components/language-switcher.tsx
"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { Button } from "@libra/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@libra/ui/components/dropdown-menu";
import { getLocale, setLocale, type Locale } from "../paraglide/runtime";
import * as m from "@/paraglide/messages";

const getLanguages = (isHydrated: boolean) => [
  { code: "en" as Locale, name: isHydrated ? m["common.languages.english"]() : "English" },
  { code: "zh" as Locale, name: isHydrated ? m["common.languages.chinese"]() : "中文" },
];

export function LanguageSwitcher() {
  const [isHydrated, setIsHydrated] = useState(false);
  const currentLocale = getLocale();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleLanguageChange = (locale: Locale) => {
    setLocale(locale);
  };

  const languages = getLanguages(isHydrated);
  const currentLanguage = languages.find(lang => lang.code === currentLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span>{currentLanguage?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={currentLocale === language.code ? "bg-accent" : ""}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### Next.js 中间件配置

```typescript
// apps/web/middleware.ts
import { paraglideMiddleware } from '@/paraglide/server'
import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  return paraglideMiddleware(request, ({ request, locale }) => {
    request.headers.set('x-paraglide-locale', locale)
    request.headers.set('x-paraglide-request-url', request.url)
    return NextResponse.rewrite(request.url, request)
  })
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|monitoring|_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.json$|sentry-example-page).*)',
  ],
}
```

### 12.2 多语言内容管理

消息文件组织和管理：

```typescript
// messages/en.json
{
  "auth": {
    "login": "Sign In",
    "logout": "Sign Out",
    "email": "Email address",
    "password": "Password",
    "forgotPassword": "Forgot password?",
    "createAccount": "Create an account"
  },
  "project": {
    "create": "Create Project",
    "name": "Project Name",
    "description": "Description",
    "visibility": {
      "public": "Public",
      "private": "Private"
    }
  },
  "ai": {
    "generating": "Generating...",
    "modelSelect": "Select Model",
    "quotaExceeded": "AI quota exceeded",
    "reasoning": "Reasoning Mode"
  }
}

// messages/zh.json
{
  "auth": {
    "login": "登录",
    "logout": "退出登录",
    "email": "邮箱地址",
    "password": "密码",
    "forgotPassword": "忘记密码？",
    "createAccount": "创建账户"
  },
  "project": {
    "create": "创建项目",
    "name": "项目名称",
    "description": "描述",
    "visibility": {
      "public": "公开",
      "private": "私有"
    }
  },
  "ai": {
    "generating": "生成中...",
    "modelSelect": "选择模型",
    "quotaExceeded": "AI 配额已用尽",
    "reasoning": "推理模式"
  }
}
```

### 12.3 本地化最佳实践

#### 组件中使用国际化

```typescript
// components/project/create-project-dialog.tsx
import * as m from '@/paraglide/messages'
import { Link } from '@/lib/i18n'

export function CreateProjectDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{m.project_create()}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.project_create()}</DialogTitle>
        </DialogHeader>
        <form>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{m.project_name()}</Label>
              <Input id="name" placeholder={m.project_name()} />
            </div>
            <div>
              <Label htmlFor="description">{m.project_description()}</Label>
              <Textarea id="description" placeholder={m.project_description()} />
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// 语言切换组件
export function LanguageSwitcher() {
  const pathname = usePathname()
  const currentLocale = getCurrentLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {availableLanguageTags.map(locale => (
          <DropdownMenuItem key={locale} asChild>
            <Link
              href={pathname}
              locale={locale}
              className={cn(
                "w-full",
                currentLocale === locale && "font-semibold"
              )}
            >
              {locale === 'en' ? 'English' : '中文'}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

#### 动态内容处理

```typescript
// 带参数的消息
// messages/en.json
{
  "welcome": "Welcome {name}!",
  "items_count": "{count, plural, =0 {no items} one {# item} other {# items}}"
}

// 使用
const welcomeMessage = m.welcome({ name: user.name })
const itemsMessage = m.items_count({ count: items.length })
```

#### 开发工作流

```bash
# 添加新的翻译字符串
1. 编辑 messages/en.json 添加新键
2. 运行 paraglide-js compile 生成类型
3. 使用机器翻译初始化其他语言
bun run translate

# 检查翻译完整性
bun run paraglide-js validate
```

## 13. GitHub 集成

### 13.1 GitHub App 配置

项目使用 **GitHub App** 模式实现与 GitHub 的深度集成：

```typescript
// apps/web/app/api/github/setup/route.ts
import { App } from '@octokit/app'

const app = new App({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n'),
})

// 获取安装详情
const installation = await app.octokit.request('GET /app/installations/{installation_id}', {
  installation_id: Number.parseInt(installationId, 10),
})
```

### 13.2 双重认证架构

项目支持两种 GitHub 认证方式：

#### GitHub App 安装认证

- **用途**：组织级别的仓库管理
- **权限**：读写仓库、管理 Issues、Webhooks
- **令牌类型**：Installation Access Token（1小时有效期）

#### OAuth 用户认证

- **用途**：个人账户的仓库创建
- **权限**：用户授权的个人仓库访问
- **令牌类型**：User Access Token（可刷新）

```typescript
// packages/api/src/utils/github-auth.ts
export async function getGitHubAuthToken(db: any, organizationId: string) {
  const installation = await db.query.githubInstallation.findFirst({
    where: eq(githubInstallation.organizationId, organizationId),
  })

  if (installation) {
    if (installation.githubAccountType === 'User') {
      // 使用用户令牌
      const userToken = await db.query.githubUserToken.findFirst({
        where: eq(githubUserToken.organizationId, organizationId),
      })
      return { token: userToken.accessToken, type: 'user' }
    }
    // 使用安装令牌
    const installationToken = await generateInstallationToken(installation.installationId)
    return { token: installationToken, type: 'installation' }
  }
}
```

### 13.3 仓库管理功能

```typescript
// packages/api/src/router/github.ts
export const githubRouter = {
  // 创建项目仓库
  createProjectRepository: organizationProcedure
    .input(z.object({
      projectId: z.string().min(1),
      description: z.string().optional(),
      private: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const authResult = await getGitHubAuthToken(ctx.db, ctx.orgId)

      // 生成唯一仓库名
      const now = new Date()
      const dateString = now.toISOString().slice(0, 10).replace(/-/g, '')
      const repoName = `${baseRepoName}-${dateString}`

      // 创建仓库
      const createRepoResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authResult.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          name: repoName,
          description: input.description,
          private: input.private,
          auto_init: true,
          gitignore_template: 'Node',
          license_template: 'mit',
        }),
      })
    }),
}
```

## 14. 开发工具与工作流

### 13.1 Bun 包管理器使用规范

项目使用 **Bun v1.2.19** 作为包管理器和 JavaScript 运行时：

#### Bun 优势

- **极速安装**：
- **内置 TypeScript**：无需额外配置直接运行 TS 文件
- **原生 ESM 支持**：完全支持 ES 模块
- **工作区支持**：Monorepo 的完美支持
- **内置工具**：集成了测试、打包等工具

#### 安装 Bun

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (WSL)
curl -fsSL https://bun.sh/install | bash

# 验证安装
bun --version
```

#### 常用命令

```bash
# 安装依赖
bun install         # 等同于 npm install
bun i              # 简写

# 添加依赖
bun add react      # 等同于 npm install react
bun add -d vitest  # 开发依赖

# 移除依赖
bun remove react   # 等同于 npm uninstall

# 运行脚本
bun run dev        # 等同于 npm run dev
bun dev            # 简写（如果没有同名文件）

# 执行文件
bun run index.ts   # 直接运行 TypeScript

# 工作区命令
bun --filter @libra/api dev  # 运行特定工作区
```

#### Bun 配置文件

```toml
# bunfig.toml
[install]
# 使用硬链接加速
strategy = "hardlink"

# 自动安装 peer dependencies
auto = "auto"

# 禁用遗留模式
legacy = false

[install.scopes]
# 自定义注册表
"@company" = { token = "$npm_token", url = "https://registry.company.com/" }

[test]
# 测试配置
preload = ["./test/setup.ts"]
coverage = true
```

#### 工作区配置

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

#### Bun 特有功能

```typescript
// 使用 Bun 内置 API
import { $ } from 'bun'

// Shell 命令执行
const result = await $`ls -la`.text()

// 文件操作
const file = Bun.file('./config.json')
const content = await file.json()

// HTTP 服务器
Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response('Hello from Bun!')
  },
})

// 环境变量
const apiKey = Bun.env.API_KEY
```

#### 迁移指南

```bash
# 从 npm/yarn 迁移
1. 删除 node_modules 和 lock 文件
   rm -rf node_modules package-lock.json yarn.lock

2. 使用 Bun 安装
   bun install

3. 更新 CI/CD 配置
   - uses: oven-sh/setup-bun@v1
     with:
       bun-version: latest
```

### 13.2 开发环境配置

#### 环境变量与 Secrets 管理

```typescript
// apps/web/env.mjs - 使用 @t3-oss/env-nextjs 进行类型安全的环境变量验证
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    // 数据库（必需）
    POSTGRES_URL: z.string().min(1),

    // AI 提供商（可选）
    ANTHROPIC_API_KEY: z.string().optional(),
    AZURE_OPENAI_API_KEY: z.string().optional(),
    XAI_API_KEY: z.string().optional(),
    OPENROUTER_API_KEY: z.string().optional(),

    // 认证（必需）
    BETTER_GITHUB_CLIENT_ID: z.string().optional(),
    BETTER_GITHUB_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    // 支付（必需）
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),

    // Cloudflare（必需）
    CLOUDFLARE_API_TOKEN: z.string().min(1),
    DATABASE_ID: z.string().min(1),

    // 功能标志（布尔值）
    ENHANCED_PROMPT: z.boolean().optional(),
    REASONING_ENABLED: z.boolean().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  },
  runtimeEnv: {
    // 服务端变量
    POSTGRES_URL: process.env.POSTGRES_URL,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    // 布尔值需要特殊处理
    ENHANCED_PROMPT: process.env['ENHANCED_PROMPT'] === 'TRUE',
    REASONING_ENABLED: process.env['REASONING_ENABLED'] === 'TRUE',
    // ... 其他变量根据实际需要映射

    // 客户端变量
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
})

// 模块化的环境变量验证
// packages/auth/env.mjs - 认证相关
// packages/db/env.mjs - 数据库相关
```

### 13.3 代码质量工具

#### Biome 配置

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  },
  "files": {
    "include": ["**/*.{js,jsx,ts,tsx,json,jsonc}"],
    "ignore": [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "coverage/**"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineEnding": "lf",
    "lineWidth": 100
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "a11y": {
        "recommended": true
      },
      "complexity": {
        "recommended": true,
        "noExcessiveCognitiveComplexity": "error"
      },
      "correctness": {
        "recommended": true,
        "noUnusedVariables": "error"
      },
      "suspicious": {
        "recommended": true,
        "noExplicitAny": "warn",
        "noConsole": "warn"
      },
      "style": {
        "recommended": true,
        "useImportType": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "es5"
    }
  },
  "typescript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "es5"
    }
  }
}
```

### 13.4 构建与部署

#### Turborepo 配置

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": [
        "$TURBO_DEFAULT$",
        ".env",
        ".env.local",
        ".env.production"
      ],
      "outputs": [
        ".next/**",
        "!.next/cache/**",
        "dist/**"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^topo"],
      "inputs": [
        "$TURBO_DEFAULT$",
        ".eslintrc*",
        "biome.json"
      ]
    },
    "typecheck": {
      "dependsOn": ["^topo"],
      "inputs": [
        "$TURBO_DEFAULT$",
        "tsconfig*.json"
      ],
      "outputs": [
        "node_modules/.cache/tsbuildinfo.json"
      ]
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": [
        "$TURBO_DEFAULT$",
        "vitest.config.*"
      ],
      "outputs": [
        "coverage/**"
      ]
    }
  }
}
```

#### 部署脚本

```json
// package.json
{
  "scripts": {
    "dev": "turbo dev --parallel",
    "dev:web": "turbo dev --parallel --filter !stripe",
    "build": "turbo build --concurrency=100%",
    "lint": "turbo lint --continue --",
    "lint:fix": "turbo lint --continue -- --apply",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "clean": "turbo clean && rm -rf node_modules/.cache",
    "clean:workspaces": "turbo clean",
    "deploy": "cd apps/web && opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "migration:generate": "cd packages/db && drizzle-kit generate",
    "migration:local": "cd packages/db && drizzle-kit migrate"
  }
}
```

### 13.5 Cloudflare 部署配置

项目使用 **@opennextjs/cloudflare** 实现 Next.js 到 Cloudflare 的完整部署：

#### OpenNext 配置

```typescript
// apps/web/open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import doShardedTagCache from "@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "short-lived" }),
  queue: doQueue,
  // This is only required if you use On-demand revalidation
  tagCache: doShardedTagCache({ baseShardSize: 12 }),
  // Disable this if you want to use PPR
  enableCacheInterception: true,
});
```

#### Wrangler 配置

```jsonc
// wrangler.jsonc
{
  "name": "libra",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-07-17",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "minify": true,

  // 静态资源配置
  "assets": {
    "binding": "ASSETS",
    "directory": ".open-next/assets"
  },

  // 自定义域名路由
  "routes": [
    {
      "pattern": "libra.dev",
      "custom_domain": true
    }
  ],

  // 智能部署（自动选择最佳边缘位置）
  "placement": { "mode": "smart" },

  // D1 数据库
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "libra-auth",
      "database_id": "your-d1-database-id"
    }
  ],

  // Hyperdrive 配置
  "hyperdrive": {
    "binding": "HYPERDRIVE",
    "id": "your-hyperdrive-config-id"
  },

  // 环境变量
  "vars": {
    "ENVIRONMENT": "production"
  },

  // 机密管理
  "secrets": [
    "DATABASE_URL",
    "ANTHROPIC_API_KEY",
    "STRIPE_SECRET_KEY"
  ]
}
```

#### 部署流程

```bash
# 1. 构建应用
bun run build

# 2. 使用 OpenNext 构建
cd apps/web
bun run deploy

```

#### CI/CD 配置

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]
  workflow_dispatch:

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

      - name: Build application
        run: bun run build

      - name: Deploy to Cloudflare
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          cd apps/web
          bunx @opennextjs/cloudflare@latest deploy
```

#### 环境变量管理

```bash
# 设置机密
wrangler secret put DATABASE_URL
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put STRIPE_SECRET_KEY

# 查看机密列表
wrangler secret list

# 删除机密
wrangler secret delete API_KEY
```

#### 自定义域名配置

```typescript
// lib/custom-domain.ts
export async function setupCustomDomain(domain: string) {
  // 创建 Cloudflare Workers 路由
  const route = {
    pattern: `${domain}/*`,
    zone_name: domain,
    script_name: 'libra-web',
  }

  // 设置 DNS 记录
  const dnsRecords = [
    {
      type: 'A',
      name: '@',
      content: '192.0.2.1', // Cloudflare 代理 IP
      proxied: true,
    },
    {
      type: 'AAAA',
      name: '@',
      content: '100::', // Cloudflare 代理 IPv6
      proxied: true,
    },
  ]

  return { route, dnsRecords }
}
```

#### 性能优化配置

```typescript
// apps/web/next.config.mjs
import { paraglideWebpackPlugin } from "@inlang/paraglide-js";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// 启用 Cloudflare 开发环境支持
initOpenNextCloudflareForDev();

// Bundle Analyzer 配置
const withBundleAnalyzer = (await import('@next/bundle-analyzer')).default({
    enabled: process.env.ANALYZE === 'true',
    openAnalyzer: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // 包转译配置
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
        "@libra/sandbox"
    ],

    pageExtensions: ['ts', 'tsx'],

    // 实验性功能
    experimental: {
        reactCompiler: true,
        useCache: true,
        // ppr: true, // 可选启用 PPR
    },

    // 图像配置 - 使用自定义 loader
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

    // Webpack 配置
    webpack: (config) => {
        config.plugins.push(
            paraglideWebpackPlugin({
                outdir: "./paraglide",
                project: "./project.inlang",
                strategy: ["cookie", "baseLocale"],
                experimentalMiddlewareLocaleSplitting: false,
                // Cookie 域名配置
                cookieDomain: process.env.NODE_ENV === 'production' ? '.libra.dev' : 'localhost'
            })
        );
        return config;
    },

    // 服务端外部包
    serverExternalPackages: [
        "@prisma/client",
        ".prisma/client",
        "postgres",
        "@libsql/isomorphic-ws",
        "jose"
    ],
}

export default withBundleAnalyzer(nextConfig)
```

### 13.6 GitHub API 集成

项目使用 **Octokit** 实现 GitHub API 集成，支持代码提交、仓库管理和 OAuth 认证：

#### GitHub 客户端配置

```typescript
// lib/github/client.ts
import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'

export function createGitHubClient(accessToken: string) {
  return new Octokit({
    auth: accessToken,
    // 使用 GitHub API v3
    baseUrl: 'https://api.github.com',
    // 请求超时设置
    request: {
      timeout: 30000,
    },
  })
}

// GitHub App 认证
export function createGitHubAppClient() {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.GITHUB_APP_ID,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
      installationId: process.env.GITHUB_APP_INSTALLATION_ID,
    },
  })
}
```

#### 仓库操作

```typescript
// lib/github/repository.ts
export class GitHubRepository {
  private octokit: Octokit
  private owner: string
  private repo: string

  constructor(octokit: Octokit, owner: string, repo: string) {
    this.octokit = octokit
    this.owner = owner
    this.repo = repo
  }

  // 创建仓库
  async create(options: {
    name: string
    description?: string
    private?: boolean
    autoInit?: boolean
  }) {
    const { data } = await this.octokit.repos.createForAuthenticatedUser({
      name: options.name,
      description: options.description,
      private: options.private ?? true,
      auto_init: options.autoInit ?? true,
      default_branch: 'main',
    })

    return data
  }

  // 提交文件
  async commitFiles(files: Array<{ path: string; content: string }>, message: string) {
    // 获取当前分支
    const { data: ref } = await this.octokit.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: 'heads/main',
    })

    const currentCommitSha = ref.object.sha

    // 获取当前树
    const { data: currentCommit } = await this.octokit.git.getCommit({
      owner: this.owner,
      repo: this.repo,
      commit_sha: currentCommitSha,
    })

    // 创建 blobs
    const blobs = await Promise.all(
      files.map(async (file) => {
        const { data } = await this.octokit.git.createBlob({
          owner: this.owner,
          repo: this.repo,
          content: Buffer.from(file.content).toString('base64'),
          encoding: 'base64',
        })
        return { path: file.path, sha: data.sha }
      })
    )

    // 创建新树
    const { data: newTree } = await this.octokit.git.createTree({
      owner: this.owner,
      repo: this.repo,
      base_tree: currentCommit.tree.sha,
      tree: blobs.map(blob => ({
        path: blob.path,
        mode: '100644',
        type: 'blob',
        sha: blob.sha,
      })),
    })

    // 创建新提交
    const { data: newCommit } = await this.octokit.git.createCommit({
      owner: this.owner,
      repo: this.repo,
      message,
      tree: newTree.sha,
      parents: [currentCommitSha],
    })

    // 更新引用
    await this.octokit.git.updateRef({
      owner: this.owner,
      repo: this.repo,
      ref: 'heads/main',
      sha: newCommit.sha,
    })

    return newCommit
  }

  // 创建拉取请求
  async createPullRequest(options: {
    title: string
    body: string
    head: string
    base?: string
  }) {
    const { data } = await this.octokit.pulls.create({
      owner: this.owner,
      repo: this.repo,
      title: options.title,
      body: options.body,
      head: options.head,
      base: options.base ?? 'main',
    })

    return data
  }
}
```

#### 认证流程集成

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

  // 生成授权 URL
  getAuthorizationUrl(state: string, scopes: string[] = ['repo', 'user']) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      state,
    })

    return `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  // 交换访问令牌
  async exchangeCode(code: string) {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for access token')
    }

    const data = await response.json()
    return data.access_token
  }
}
```

#### 项目同步功能

```typescript
// lib/github/sync.ts
export async function syncProjectToGitHub(
  projectId: string,
  githubToken: string
) {
  const project = await api.project.getById({ id: projectId })
  const files = await api.file.getProjectFiles({ projectId })

  const octokit = createGitHubClient(githubToken)
  const repo = new GitHubRepository(
    octokit,
    project.githubOwner,
    project.githubRepo
  )

  // 准备文件内容
  const filesToCommit = files.map(file => ({
    path: file.path,
    content: file.content,
  }))

  // 添加 README
  filesToCommit.push({
    path: 'README.md',
    content: `# ${project.name}\n\n${project.description || ''}【\n\nCreated with [Libra AI](https://libra.dev)`,
  })

  // 提交到 GitHub
  const commit = await repo.commitFiles(
    filesToCommit,
    `Update project: ${project.name}`
  )

  // 更新项目状态
  await api.project.update({
    id: projectId,
    gitUrl: `https://github.com/${project.githubOwner}/${project.githubRepo}`,
    lastSyncedAt: new Date().toISOString(),
  })

  return commit
}
```

## 13. 性能优化指南

### 13.1 前端性能优化

#### React Server Components 优化

```typescript
// 默认情况下，app 目录中的组件都是服务端组件
// 仅在需要客户端功能时添加 'use client' 指令

// app/(frontend)/layout.tsx - 服务端组件示例
export default function Layout({ children }: { children: React.ReactNode }) {
  // 服务端组件可以直接访问数据库和执行异步操作
  return (
    <div className="min-h-screen">
      <Suspense fallback={<div>加载中...</div>}>
        {children}
      </Suspense>
    </div>
  )
}
```

#### 流式渲染优化

```typescript
// app/api/ai/route.ts - AI 响应流式传输
import { streamText } from 'ai'

export async function POST(req: Request) {
  const { messages } = await req.json()

  // 使用流式响应提供实时反馈
  const result = streamText({
    model: openai('gpt-4'),
    messages,
  })

  return result.toDataStreamResponse()
}
```

#### 性能监控配置

```typescript
// next.config.mjs - 启用的性能优化
export default {
  reactCompiler: true,  // React 编译器优化
  useCache: true,       // 启用缓存
  bundleAnalyzer: {     // Bundle 分析工具
    enabled: process.env.ANALYZE === 'true',
  },
  images: {
    loader: 'custom',   // 自定义图片加载器
    loaderFile: './imageLoader.ts',
  },
}
```

### 13.2 数据库性能优化

#### 查询优化

```typescript
// 使用索引优化查询
export const projectQueries = {
  // 分页查询优化
  getProjectsPaginated: async (orgId: string, page = 1, limit = 20) => {
    const offset = (page - 1) * limit

    return await db.query.project.findMany({
      where: and(
        eq(project.organizationId, orgId),
        eq(project.isActive, true)
      ),
      orderBy: [desc(project.updatedAt)], // 使用索引排序
      limit,
      offset,
      with: {
        owner: {
          columns: { id: true, name: true, email: true },
        },
      },
    })
  },

  // 批量查询优化
  getProjectsByIds: async (projectIds: string[]) => {
    return await db.query.project.findMany({
      where: inArray(project.id, projectIds),
      with: {
        files: {
          orderBy: [desc(files.updatedAt)],
          limit: 10, // 限制关联数据量
        },
      },
    })
  },
}
```

### 13.3 AI 性能优化

#### 流式响应优化

```typescript
// 优化 AI 响应流
export async function optimizedStreamGeneration(
  prompt: string,
  context: GenerationContext
) {
  // 1. 预处理提示词以减少 token 使用
  const optimizedPrompt = compressPrompt(prompt, context)

  // 2. 使用适合的模型
  const model = selectOptimalModel(context.complexity, context.userPlan)

  // 3. 设置合适的流参数
  const stream = await streamText({
    model,
    messages: [{ role: 'user', content: optimizedPrompt }],
    temperature: 0.1, // 较低温度提高一致性
    maxTokens: calculateOptimalMaxTokens(context),
    stream: true,
  })

  // 4. 流式处理和缓存
  return stream.textStream.pipe(
    new TransformStream({
      transform(chunk, controller) {
        // 实时处理和验证
        const processedChunk = processChunk(chunk)
        controller.enqueue(processedChunk)
      }
    })
  )
}
