# Libra AI

<div align="center">

<img src="/logo.svg" alt="Libra logo" style="width: 250px; height: auto; max-width: 100%;" />

**开源的 V0/Lovable 替代方案**

**Libra AI：语言即应用**，一句话启动、迭代和部署您的下一个 Web 应用。

[![由 CLERK 赞助](https://img.shields.io/badge/SPONSORED%20BY-CLERK-6C47FF?style=for-the-badge)](https://clerk.com?utm_source=libra.dev)
[![由 E2B FOR STARTUPS 赞助](https://img.shields.io/badge/SPONSORED%20BY-E2B%20FOR%20STARTUPS-ff8800?style=for-the-badge)](https://e2b.dev/startups?utm_source=libra.dev)
[![由 POSTHOG FOR STARTUPS 赞助](https://img.shields.io/badge/SPONSORED%20BY-POSTHOG%20FOR%20STARTUPS-1D4AFF?style=for-the-badge)](https://posthog.com/startups?utm_source=libra.dev)
[![由 DAYTONA STARTUP GRID 赞助](https://img.shields.io/badge/SPONSORED%20BY-DAYTONA%20STARTUP%20GRID-2ECC71?style=for-the-badge)](https://daytona.io/startups?utm_source=libra.dev)
[![由 CLOUDFLARE FOR STARTUPS 赞助](https://img.shields.io/badge/SPONSORED%20BY-CLOUDFLARE%20FOR%20STARTUPS-F38020?style=for-the-badge)](https://www.cloudflare.com/forstartups/?utm_source=libra.dev)

[![开源许可](https://img.shields.io/badge/License-AGPL-green.svg)](https://github.com/nextify-limited/libra/blob/main/LICENSE) [![由 Nextify2024 打造](https://img.shields.io/badge/made_by-nextify2024-blue?color=FF782B&link=https://x.com/nextify2024)](https://x.com/nextify2024)

[🌐 **立即体验**](https://libra.dev) • [📖 **开发文档**](https://docs.libra.dev/) • [💬 **加入社区**](https://forum.libra.dev) • [⚡ **查看源码**](https://github.com/nextify-limited/libra)

</div>

- [Libra AI](#libra-ai)
  - [🚀 什么是 Libra AI？](#-什么是-libra-ai)
    - [✨ 核心功能](#-核心功能)
      - [🤖 AI 智能编码](#-ai-智能编码)
      - [🛠️ 集成开发体验](#️-集成开发体验)
      - [🔗 全栈集成方案](#-全栈集成方案)
      - [🌐 生产环境部署](#-生产环境部署)
    - [为何开源？](#为何开源)
  - [🏗️ 技术架构](#️-技术架构)
    - [计算与运行时](#计算与运行时)
    - [数据存储](#数据存储)
    - [网络与安全](#网络与安全)
    - [开发工具与服务](#开发工具与服务)
    - [应用服务详解](#应用服务详解)
    - [🛠️ 核心技术栈](#️-核心技术栈)
      - [前端技术架构](#前端技术架构)
      - [后端与 API 架构](#后端与-api-架构)
      - [AI 与机器学习](#ai-与机器学习)
      - [数据存储架构](#数据存储架构)
      - [部署与基础设施](#部署与基础设施)
      - [开发工具链](#开发工具链)
  - [⚡ 快速上手](#-快速上手)
    - [🎯 选择适合您的使用方式](#-选择适合您的使用方式)
      - [🌐 云端托管服务（推荐）](#-云端托管服务推荐)
      - [💻 本地开发部署（开发者）](#-本地开发部署开发者)
    - [📦 环境要求](#-环境要求)
    - [🚀 本地环境搭建](#-本地环境搭建)
      - [第一步：获取源码](#第一步获取源码)
      - [第二步：配置环境变量](#第二步配置环境变量)
      - [第三步：初始化数据库](#第三步初始化数据库)
      - [第四步：启动开发服务](#第四步启动开发服务)
      - [第五步：配置 Stripe 支付（必须）](#第五步配置-stripe-支付必须)
    - [🌐 本地服务地址](#-本地服务地址)
  - [🚀 部署方案](#-部署方案)
    - [🌐 云端托管服务（推荐）](#-云端托管服务推荐-1)
    - [🏠 自托管部署](#-自托管部署)
  - [🎯 托管平台 vs 开源版本](#-托管平台-vs-开源版本)
    - [📊 功能对比](#-功能对比)
    - [🤔 如何选择适合您的版本？](#-如何选择适合您的版本)
      - [选择云端托管，如果您](#选择云端托管如果您)
      - [选择开源部署，如果您](#选择开源部署如果您)
  - [❓ 常见问题](#-常见问题)
    - [🆚 产品版本](#-产品版本)
    - [🛠️ 技术问题](#️-技术问题)
    - [💼 商业使用](#-商业使用)
    - [🔧 开发部署](#-开发部署)
    - [🤝 参与社区贡献](#-参与社区贡献)
      - [🌟 使用与推广](#-使用与推广)
      - [🔧 代码贡献](#-代码贡献)
      - [📝 其他贡献方式](#-其他贡献方式)
      - [🎯 贡献指南](#-贡献指南)
  - [📄 开源许可](#-开源许可)
    - [📜 AGPL-3.0 开源许可](#-agpl-30-开源许可)
      - [✅ 您的权利](#-您的权利)
      - [📋 您的义务](#-您的义务)
      - [💼 商业许可](#-商业许可)
    - [💬 参与路线图讨论](#-参与路线图讨论)
    - [🙏 鸣谢](#-鸣谢)

---

## 🚀 什么是 Libra AI？

**Libra AI** 是一个面向生产环境的 AI 原生开发平台，通过自然语言交互实现 Web 应用的全生命周期管理。采用现代化技术架构，覆盖从快速原型设计到企业级生产部署的完整工程化流程。

正如 V0 深度集成 Vercel 生态，Libra 专为 Cloudflare Workers 架构设计，提供原生的 AI 开发体验。

### ✨ 核心功能

#### 🤖 AI 智能编码

- 多模型集成：Claude、OpenAI、Gemini、DeepSeek 等等
- 自然语言驱动的生产级代码生成
- 智能上下文感知与最佳实践遵循
- 多沙箱提供商支持（E2B、Daytona）

#### 🛠️ 集成开发体验

- 云端 IDE：语法高亮、智能缩进、自定义插件
- 热模块替换（HMR）实时预览
- 智能依赖分析与自动安装

#### 🔗 全栈集成方案

- GitHub 无缝集成与单向同步
- Cloudflare 边缘计算部署
- 企业级身份认证（OAuth 2.0）
- Stripe 商业化订阅管理

#### 🌐 生产环境部署

- Cloudflare Workers 边缘计算网络
- Serverless 架构与弹性伸缩
- TLS/SSL 证书自动化管理
- Git 版本控制与一键回滚

### 为何开源？

- 📂 **技术自主**：避免供应商锁定风险
- 🔧 **架构灵活**：支持深度定制与扩展
- 💝 **社区生态**：开源社区协作共建

## 🏗️ 技术架构

Libra 完全构建于 Cloudflare 上。你需要对以下产品熟悉：

### 计算与运行时

| 产品名称 | 功能描述 | 在 Libra 中的应用 |
|---------|---------|------------------|
| [Workers](https://developers.cloudflare.com/workers/?utm_source=libra.dev) | 无服务器计算平台 | 核心应用运行环境，承载所有服务逻辑 |
| [Durable Objects](https://developers.cloudflare.com/durable-objects/?utm_source=libra.dev) | 强一致性存储 | 实时状态管理和会话持久化 |
| [Browser Rendering](https://developers.cloudflare.com/browser-rendering/?utm_source=libra.dev) | 浏览器渲染服务 | 网页截图生成和预览功能 |
| [Workers for Platforms](https://developers.cloudflare.com/cloudflare-for-platforms/?utm_source=libra.dev) | 多租户平台 | 用户项目隔离部署和路由管理 |

### 数据存储

| 产品名称 | 功能描述 | 在 Libra 中的应用 |
|---------|---------|------------------|
| [KV](https://developers.cloudflare.com/kv/?utm_source=libra.dev) | 全局键值存储 | 配置缓存和临时数据存储 |
| [D1](https://developers.cloudflare.com/d1/?utm_source=libra.dev) | 无服务器 SQLite 数据库 | 认证数据和轻量级业务数据 |
| [Hyperdrive](https://developers.cloudflare.com/hyperdrive/?utm_source=libra.dev) | 数据库连接加速 | PostgreSQL 连接池和查询优化 |
| [R2](https://developers.cloudflare.com/r2/?utm_source=libra.dev) | 对象存储服务 | 文件上传、静态资源和构建产物存储 |

### 网络与安全

| 产品名称 | 功能描述 | 在 Libra 中的应用 |
|---------|---------|------------------|
| [Turnstile](https://developers.cloudflare.com/turnstile/?utm_source=libra.dev) | 智能验证码 | 用户注册和敏感操作的安全验证 |
| [Cloudflare for SaaS](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/?utm_source=libra.dev) | 自定义域名管理 | 用户项目的自定义域名绑定和 SSL 证书 |

### 开发工具与服务

| 产品名称 | 功能描述 | 在 Libra 中的应用 |
|---------|---------|------------------|
| [Workflows](https://developers.cloudflare.com/workflows/?utm_source=libra.dev) | 工作流编排 | 复杂部署流程的步骤化管理 |
| [Queues](https://developers.cloudflare.com/queues/?utm_source=libra.dev) | 消息队列服务 | 异步任务处理和批量部署管理 |
| [AI Gateway](https://developers.cloudflare.com/ai-gateway/?utm_source=libra.dev) | AI 模型网关 | 监控和控制你的 AI 应用|
| [Images](https://developers.cloudflare.com/images/?utm_source=libra.dev) | 图像处理优化 | 动态图像变换和 CDN 分发 |

Libra 采用 **Turborepo** Monorepo 架构设计：

```text
libra/
├── apps/                    # 核心应用服务
│   ├── auth-studio/         # 认证管理控制台 (D1 + drizzle-kit)
│   ├── builder/             # Vite 构建服务 - 代码编译与部署
│   ├── cdn/                 # Hono CDN 服务 - 静态资源管理
│   ├── deploy/              # 部署服务 V2 - Cloudflare Queues
│   ├── deploy-workflow/     # 部署服务 V1 - Cloudflare Workflows（已弃用）
│   ├── dispatcher/          # 请求路由分发器 (Workers for Platforms)
│   ├── docs/                # 技术文档站点 (Next.js + FumaDocs)
│   ├── email/               # 邮件服务预览器 (React Email)
│   ├── opennext-cache/      # OpenNext 缓存服务 (Cloudflare)
│   ├── screenshot/          # 截图服务 - Cloudflare Queues
│   ├── vite-shadcn-template/# 项目模板引擎 (Vite + shadcn/ui)
│   └── web/                 # Next.js 15 主应用 (React 19)
├── packages/                # 共享包模块
│   ├── api/                 # API 层 (tRPC + 类型安全)
│   ├── auth/                # 认证服务 (better-auth)
│   ├── better-auth-cloudflare/ # Cloudflare 认证适配器
│   ├── better-auth-stripe/  # Stripe 支付集成
│   ├── common/              # 公共工具库与类型定义
│   ├── db/                  # 主数据库架构与操作 (PostgreSQL)
│   ├── email/               # 邮件服务组件
│   ├── middleware/          # 中间件服务与工具
│   ├── sandbox/             # 统一沙箱抽象层 (E2B + Daytona)
│   ├── shikicode/           # 代码编辑器 (Shiki 语法高亮)
│   ├── templates/           # 项目脚手架模板
│   └── ui/                  # 设计系统 (shadcn/ui + Tailwind CSS v4)
├── tooling/                 # 开发工具和配置
│   └── typescript-config/   # 共享 TypeScript 配置
└── scripts/                 # Github 环境变量管理
```

### 应用服务详解

**🔒 认证管理中心 (`apps/auth-studio`)**

- 用户、组织、权限及订阅生命周期管理
- 主数据库使用 PostgreSQL（通过 Neon + Hyperdrive），认证数据使用 D1（SQLite）
- OAuth 2.0 多 provider 认证体系
- Stripe 商业化支付网关集成

**🔨 构建编译服务 (`apps/builder`)**

- Vite 高性能构建引擎，毫秒级热启动
- 代码自动编译与生产环境无缝部署
- 多技术栈项目模板快速实例化

**📺 内容分发服务 (`apps/cdn`)**

- Hono 框架驱动的文件管理系统
- 智能图像处理与压缩优化
- 全球 CDN 边缘缓存加速
- Cloudflare Workers 边缘部署

**🚀 部署服务 V2 (`apps/deploy`)**

- 基于 Cloudflare Queues 的现代部署架构
- 批量处理与并发控制
- D1 数据库状态管理
- 死信队列处理失败部署
- 综合错误处理与重试逻辑

**⚡ 部署服务 V1 (`apps/deploy-workflow`，已弃用)**

- 基于 Cloudflare Workflows 的部署编排
- 步骤化部署流程与状态管理
- 内置重试机制与错误恢复
- 支持复杂部署场景与依赖管理

**🔀 请求路由服务 (`apps/dispatcher`)**

- Workers for Platforms 核心路由组件
- 将用户域名请求路由到对应的 Worker 实例
- 动态 Worker 调度与生命周期管理
- 自定义域名绑定与 SSL 证书处理
- 统一的认证与访问控制层
- Cloudflare SaaS for Platforms 集成

**📖 技术文档站点 (`apps/docs`)**

- FumaDocs 现代化文档解决方案
- Cloudflare Workers 全球分发

**📧 邮件通知服务 (`apps/email`)**

- React Email 组件化邮件开发
- 多场景邮件模板引擎

**🔄 OpenNext 缓存服务 (`apps/opennext-cache`)**

- Next.js Cloudflare 部署缓存优化
- OpenNext 框架与 Cloudflare Workers 集成
- 与主 Web 应用部署的无缝集成

**📸 截图服务 (`apps/screenshot`)**

- 基于 Cloudflare Queues 的截图生成
- 异步队列处理网页截图请求
- 自动化网站预览图生成
- R2 存储截图文件
- 批量处理与错误重试

**🔨 项目脚手架服务 (`apps/vite-shadcn-template`)**

- Vite 高性能构建工具链
- 快速编译与生产环境部署
- shadcn/ui + Tailwind CSS v4 预配置
- 可视化模板选择与预览

**🌐 核心 Web 应用 (`apps/web`)**

- Next.js 15 App Router + React 19 技术栈
- 平台主界面与用户交互层
- AI 驱动的智能对话与项目管理
- 实时代码编辑、预览、部署及版本控制
- Cloudflare Workers 无服务器部署

### 🛠️ 核心技术栈

#### 前端技术架构

| 技术框架                                   | 应用场景                       | 版本   |
|-------------------------------------------|-------------------------------|--------|
| [Next.js](https://nextjs.org?utm_source=libra.dev)            | React 全栈开发框架（App Router） | 15.3.5 |
| [React](https://react.dev?utm_source=libra.dev)               | 用户界面库（服务器端组件）       | 19.1.1 |
| [TypeScript](https://typescriptlang.org?utm_source=libra.dev) | 静态类型 JavaScript 超集      | 5.8.3+ |
| [Tailwind CSS](https://tailwindcss.com?utm_source=libra.dev)  | 工具优先的 CSS 框架                | 4.1.11 |
| [shadcn/ui](https://ui.shadcn.com?utm_source=libra.dev)       | 组件库与设计系统            | 基于 Radix UI |
| [Radix UI](https://radix-ui.com?utm_source=libra.dev)         | 无样式可访问 UI 原语库  | 1.2.x-1.3.x |
| [Motion](https://motion.dev?utm_source=libra.dev)             | 现代动画引擎                 | 12.23.11 |
| [Lucide React](https://lucide.dev?utm_source=libra.dev)       | 矢量图标库               | 0.486.0 |

#### 后端与 API 架构

| 技术框架                                  | 应用场景                      | 版本   |
|------------------------------------------|------------------------------|--------|
| [tRPC](https://trpc.io?utm_source=libra.dev)                 | 端到端类型安全 API 开发       | 11.4.3+ |
| [Hono](https://hono.dev?utm_source=libra.dev)                | 边缘计算 Web 框架       | 4.8.10+ |
| [Zod](https://zod.dev?utm_source=libra.dev)                  | TypeScript 数据验证库     | 4.0.14 |
| [Drizzle ORM](https://orm.drizzle.team?utm_source=libra.dev) | 类型安全 TypeScript ORM     | 0.44.4 |
| [better-auth](https://better-auth.com?utm_source=libra.dev)  | 现代身份认证解决方案        | 1.3.4 |

#### AI 与机器学习

| AI 平台                           | 功能特点               | API 版本     |
|----------------------------------|----------------------|--------------|
| [AI SDK](https://sdk.vercel.ai?utm_source=libra.dev) | 多提供商 AI 模型集成   | 4.3.19       |
| [E2B](https://e2b.dev?utm_source=libra.dev)          | 安全代码执行沙箱       | 1.2.0-beta.5 |
| [Daytona](https://daytona.io?utm_source=libra.dev)   | 开发环境沙箱提供商      | 最新版本       |
| **集成 AI 模型**               |                       |              |
| Anthropic Claude                | 高级推理及代码生成 | API v1       |
| Azure OpenAI                    | 企业级 AI 模型服务     | API v1       |
| Google Gemini                   | 多模态 AI 能力     | API v1       |
| DeepSeek                        | 高性价比代码生成   | API v1       |

#### 数据存储架构

| 数据库技术                                              | 应用场景             | 版本   |
|--------------------------------------------------------|---------------------|--------|
| [Neon](https://neon.com?utm_source=libra.dev)                   | 主数据库（PostgreSQL）     | 17+    |
| [Cloudflare Hyperdrive](https://developers.cloudflare.com/hyperdrive?utm_source=libra.dev) | 数据库连接池与加速 | 最新版本 |
| [Cloudflare D1](https://developers.cloudflare.com/d1?utm_source=libra.dev)  | 边缘数据库（SQLite）   | 最新版本 |
| [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview?utm_source=libra.dev) | 数据库迁移工具 | 0.31.4+ |

#### 部署与基础设施

| 平台技术                                              | 应用场景                      | 版本     |
|------------------------------------------------------|------------------------------|--------|
| [Cloudflare Workers](https://workers.cloudflare.com?utm_source=libra.dev) | Serverless 边缘计算平台          | 最新版本   |
| [OpenNext](https://opennext.js.org/cloudflare?utm_source=libra.dev)       | Next.js Cloudflare 部署适配器 | 1.6.2  |
| [Turborepo](https://turbo.build?utm_source=libra.dev)                     | 高性能 Monorepo 构建系统     | 2.5.5  |
| [Bun](https://bun.sh?utm_source=libra.dev)                                | JavaScript 运行时及包管理器 | 1.2.19 |

#### 开发工具链

| 工具                                                                     | 用途                 | 版本   |
|-------------------------------------------------------------------------|---------------------|--------|
| [Biome](https://biomejs.dev?utm_source=libra.dev)                                            | 代码格式化及质量检查 | ^2.2.2  |
| [Vitest](https://vitest.dev?utm_source=libra.dev)                                            | 单元测试框架     | 3.2.4  |
| [Paraglide.js](https://inlang.com/m/gerre34r/library-inlang-paraglideJs?utm_source=libra.dev) | 国际化 i18n 解决方案    | 2.2.0  |

---

## ⚡ 快速上手

### 🎯 选择适合您的使用方式

#### 🌐 云端托管服务（推荐）

- 访问 [libra.dev](https://libra.dev) 即可使用
- GitHub OAuth 或邮箱快速注册
- 几分钟构建生产级应用

#### 💻 本地开发部署（开发者）

- 完整源码访问与控制权
- 深度定制开发与扩展
- 私有化/企业级部署

### 📦 环境要求

```bash
# 系统依赖要求
git --version   # >= 2.30.0
node --version  # >= 20.0.0 (推荐 24)
bun --version   # >= 1.0.0
```

### 🚀 本地环境搭建

#### 第一步：获取源码

```bash
git clone https://github.com/nextify-limited/libra.git
cd libra
bun install
# （可选）仅限 apps/web 生成多语言文件
cd apps/web && bun run prebuild && cd ../..
```

#### 第二步：配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的环境变量。

#### 第三步：初始化数据库

主数据库 (PostgreSQL) 初始化：

```bash
# 生成并运行业务数据库迁移
cd packages/db
bun db:generate
bun db:migrate
```

认证数据库 (D1/SQLite) 初始化：

```bash
# 测试 D1 数据库连接（本地环境）
cd apps/web && bun wrangler d1 execute libra --local --command='SELECT 1'

# 生成并运行认证数据库迁移
cd packages/auth
bun db:generate
bun db:migrate
```

#### 第四步：启动开发服务

```bash
# 启动所有服务
bun dev

# 或者单独启动主应用
cd apps/web && bun dev
```

#### 第五步：配置 Stripe 支付（必须）

需要配置对应的产品:

```bash
stripe listen --forward-to localhost:3000/api/auth/stripe/webhook
```

### 🌐 本地服务地址

搭建完成后，您可以通过以下地址访问各个服务：

- **核心应用 (web)**：<http://localhost:3000>
- **邮件预览 (email)**：<http://localhost:3001>
- **认证管理 (auth-studio)**：<http://localhost:3002>
- **技术文档 (docs)**：<http://localhost:3003>
- **CDN 服务 (cdn)**：<http://localhost:3004>
- **构建服务 (builder)**：<http://localhost:5173> (Vite 默认端口)
- **模板服务 (vite-shadcn-template)**：<http://localhost:5173> (Vite 默认端口，可能与 builder 冲突)
- **路由服务 (dispatcher)**：<http://localhost:3007>
- **部署服务 V2 (deploy)**：<http://localhost:3008>
- **截图服务 (screenshot)**：<http://localhost:3009>
- **部署服务 V1 (deploy-workflow，已弃用)**：<http://localhost:3008> （与部署服务 V2 共享端口）

## 🚀 部署方案

### 🌐 云端托管服务（推荐）

即开即用的云端开发体验：

1. 访问 [libra.dev](https://libra.dev) 官方平台
2. GitHub OAuth 或邮箱快速注册
3. AI 驱动应用快速构建
4. 一键部署至自定义域名

**云端服务优势：**
- 零配置开箱即用
- 弹性伸缩与自动更新
- AI 模型内置集成
- 企业级技术支持

### 🏠 自托管部署

**一、部署 Libra 平台本身**

Libra 平台的所有服务都部署在 Cloudflare Workers 上：

```bash
# 克隆代码并安装依赖
git clone https://github.com/nextify-limited/libra.git
cd libra
bun install

# 配置环境变量
cp .env.example .env

# 部署各个服务到 Cloudflare Workers
# 参考以下 workflow 文件了解完整部署流程：
# - .github/workflows/web.yml - 主应用部署
# - .github/workflows/cdn.yml - CDN 服务部署
# - .github/workflows/deploy.yml - 部署服务部署
# - .github/workflows/dispatcher.yml - 路由服务部署
# - .github/workflows/screenshot.yml - 截图服务部署
# - .github/workflows/docs.yml - 文档站点部署
```

**二、作为 PaaS 平台部署用户项目**

Libra 使用 **Workers for Platforms** 技术为用户提供项目部署能力，提供两种部署服务架构：

1. **Workers for Platforms 架构**：
    - 每个用户项目部署为独立的 Worker
    - 通过 `dispatcher` 服务进行智能路由
    - 支持自定义域名绑定
    - 完全隔离的运行环境（通过 Workers for Platforms 实现进程级隔离）

2. **部署服务架构选择**：

   **V2 队列架构** (`apps/deploy`)：
    - **Cloudflare Queues**：异步队列处理部署任务
    - **批量处理**：支持并发控制和批量部署
    - **死信队列**：处理失败部署的重试机制
    - **适用场景**：高并发、大规模部署需求

   **V1 工作流架构** (`apps/deploy-workflow`，已弃用)：
    - **Cloudflare Workflows**：步骤化部署编排
    - **状态持久化**：内置状态管理和恢复机制
    - **复杂流程**：支持复杂的部署依赖和条件逻辑
    - **适用场景**：复杂部署流程、需要精确控制的场景

3. **通用部署流程**：
    - 验证用户权限和项目配额
    - 创建沙箱环境进行安全构建（支持 E2B 或 Daytona）
    - 同步项目文件
    - 执行构建命令（`bun install` & `bun build`）
    - 使用 Wrangler API 部署到用户的 Worker 实例
    - 更新路由配置，清理临时环境

4. **技术特点**：
    - **沙箱环境**：安全隔离的构建环境（支持 E2B 或 Daytona）
    - **全球分发**：利用 Cloudflare 边缘计算网络
    - **灵活架构**：根据需求选择合适的部署服务

## 🎯 托管平台 vs 开源版本

### 📊 功能对比

| 功能特性            | 托管平台        | 开源版本               | 备注说明                       |
|--------------------|----------------|----------------------|------------------------------|
| **🤖 AI 代码生成**  | ✅ 开箱即用     | ❌ 需配置 API 密钥    | 多 AI 提供商集成             |
| **🔧 开发环境**     | ✅ 零配置即用   | ❌ 需配置沙箱环境     | 云端 IDE 与实时预览    |
| **📂 GitHub 集成**  | ✅ 一键连接     | ❌ 需配置 OAuth 授权  | 仓库自动创建与同步         |
| **🌐 部署服务**   | ✅ 内置支持     | ❌ 需配置部署环境     | Cloudflare 原生集成   |
| **🎨 编辑器**   | ✅ 完整功能     | ❌ 基础可视化编辑        | 可视化编辑与预览             |
| **🔒 数据控制**     | 🔒 云端托管     | ✅ 完全私有控制        | 自托管数据完全掌控         |
| **🛠️ 定制开发**   | ⚠️ 平台限制 | ✅ 无限制定制      | 源码级修改与扩展             |
| **📞 技术支持**     | ✅ 专业服务     | 🤝 社区支持        | 官方服务 vs 开源社区   |
| **💰 成本结构**     | 💰 按量付费     | 🆓 基础设施成本      | SaaS 订阅 vs 自运维   |

### 🤔 如何选择适合您的版本？

#### 选择云端托管，如果您

- **🚀 快速上线**：无需复杂配置，立即开始应用开发
- **💼 业务优先**：专注产品开发，而非基础设施运维
- **👥 团队协作**：需要企业级团队管理功能
- **📞 专业服务**：期望官方技术支持与 SLA 保障
- **🔄 自动运维**：希望平台自动化更新与维护

#### 选择开源部署，如果您

- **🏠 数据自主**：对数据存储与处理拥有完全控制权
- **🔧 深度定制**：需修改核心功能或集成专有业务逻辑
- **💰 成本控制**：拥有技术团队，需优化长期运营成本
- **🌍 特殊部署**：特定区域/私有网络/离线环境部署
- **📚 技术学习**：深入理解完整技术架构设计

## ❓ 常见问题

### 🆚 产品版本

**问：托管平台和开源版本的核心区别是什么？**

答：**云端托管** 是官方提供的 SaaS 服务，注册即用，包含完整 AI 能力和企业级功能。**开源版本** 提供核心源码，支持自部署和深度定制，但需自配置 AI API 及运维环境。

**问：开源版本的功能完整度如何？**

答：开源版本包含平台的核心功能架构，我们遵循 "99% 的功能开源，1% 的商业服务" 原则，确保开发者能够获得完整的技术能力。

### 🛠️ 技术问题

**问：使用 Libra 需要具备什么技术基础？**

答：根据使用方式不同：

- **托管平台用户**：无需技术背景，会使用浏览器即可
- **本地开发者**：需要基础的 Web 开发知识和 Node.js 经验
- **自托管部署**：需要服务器和 DevOps 实践经验

**问：AI 生成的代码质量怎么样？**

答：我们始终追求生产级代码质量：

- 完整的 TypeScript 类型安全保障
- 遵循现代 React 开发模式和业界最佳实践
- 基于 Tailwind CSS 的响应式设计实现
- 集成 Radix UI 的无障碍访问组件
- 清晰可维护的代码结构和注释

**问：可以自定义 AI 的行为和提示词吗？**

答：在开源版本中支持完全自定义：

- 自定义 AI 提示词工程
- 灵活配置模型选择逻辑
- 修改代码生成模板
- 集成第三方 AI 服务

### 💼 商业使用

**问：可以将 Libra 用于商业项目吗？**

答：完全可以。我们提供多种商用方案：

- **托管平台**：商业友好的按需付费模式
- **开源版本**：遵循 AGPL-3.0 开源许可，要求衍生项目同样开源
- **商业授权**：为需要闭源部署的企业提供商业开源许可

**问：数据安全和隐私保护怎么样？**

答：我们提供不同级别的数据保护方案：

- **托管平台**：数据在我们的安全基础设施中处理，符合国际安全标准
- **自托管部署**：您完全控制数据的存储、处理和访问权限
- **企业定制**：可根据特殊安全要求和合规需求提供定制方案

**问：是否提供企业级技术支持？**

答：是的。我们的企业服务包括：

- 私有云环境部署
- 定制功能开发服务
- 专属技术支持团队
- 服务等级协议（SLA）保障
- 安全审计和合规性支持

如需了解企业服务，请联系：[contact@libra.dev](mailto:contact@libra.dev)

### 🔧 开发部署

**问：支持哪些部署平台？**

答: 现在只支持部署在 Cloudflare 上

**问：如何参与开源项目贡献？**

答：我们非常欢迎社区贡献。具体方式请参考下方的[社区贡献指南](#-参与社区贡献)。

### 🤝 参与社区贡献

我们热烈欢迎来自全球开发者的贡献！以下是您可以参与的方式：

#### 🌟 使用与推广

- 体验 [Libra 平台](https://libra.dev) 并分享您的使用感受
- 创建精彩的应用项目并在社区展示
- 撰写技术博客文章或制作教程视频
- 在社交媒体平台分享和推荐 Libra

#### 🔧 代码贡献

```bash
# 1. 在 GitHub 上 Fork 我们的仓库
# 2. 将您的 Fork 克隆到本地
git clone https://github.com/your-username/libra.git
cd libra

# 3. 创建功能开发分支
git checkout -b feature/your-amazing-feature

# 4. 进行开发并充分测试
bun install
bun dev

# 5. 提交代码并写清楚提交信息
git commit -m "feat: add incredible new feature"

# 6. 推送分支并创建 Pull Request
git push origin feature/your-amazing-feature
```

#### 📝 其他贡献方式

- **文档完善**：改进使用指南、增加示例代码、修正文档错误
- **问题反馈**：帮助我们发现和定位系统问题
- **功能建议**：提出改进想法和新功能需求
- **多语言支持**：帮助将 Libra 翻译成更多语言
  - 项目使用 Paraglide.js 进行国际化
  - 翻译文件位置：`apps/web/messages/[locale].json`
  - 添加新语言：在 `apps/web/project.inlang/settings.json` 中添加语言代码

[//]: # (  - 使用 `bun machine-translate` 命令进行机器翻译初始化)
- **社区互助**：在[论坛](https://forum.libra.dev) 和 GitHub 讨论中帮助其他用户


#### 🎯 贡献指南

- 请遵守我们的[社区行为准则](https://github.com/nextify-limited/libra/blob/main/code_of_conduct_zh.md)
- 阅读并遵循[贡献指南](https://github.com/nextify-limited/libra/blob/main/TECHNICAL_GUIDELINES_ZH.md)
- 使用规范的提交信息格式（Conventional Commits）
- 为新功能提供相应的测试用例
- 及时更新相关文档说明

## 📄 开源许可

### 📜 AGPL-3.0 开源许可

Libra 基于 [GNU Affero General Public License v3.0](https://github.com/nextify-limited/libra/blob/main/LICENSE) 开源许可发布。

#### ✅ 您的权利

- **🆓 自由使用**：个人、教育和商业项目均可免费使用
- **🔧 修改定制**：可以自由修改和扩展代码功能
- **📤 分发共享**：可以在相同协议下与他人分享
- **🏢 商业部署**：允许用于商业目的的部署

#### 📋 您的义务

- **📄 保留版权信息**：必须保留原始的版权声明
- **🔓 开源衍生作品**：对任何修改都必须提供源代码
- **📧 网络服务开源**：通过网络提供服务时也需要开源
- **🔗 使用相同协议**：衍生作品必须使用 AGPL-3.0 协议

#### 💼 商业许可

如果您需要更多的灵活性，我们提供商业许可，适用于：

- 闭源的专有修改
- 不开源的产品分发
- 定制化的授权条款

商业授权咨询：[contact@libra.dev](mailto:contact@libra.dev)

### 💬 参与路线图讨论

我们欢迎社区参与路线图规划：

- 📝 [功能请求](https://github.com/nextify-limited/libra/issues/new?template=feature_request.md)
- 💬 [路线图讨论](https://github.com/nextify-limited/libra/discussions)
- 📧 [企业需求](mailto:contact@libra.dev)

### 🙏 鸣谢

感谢以下优秀的赞助商为 Libra 项目提供的宝贵支持，让我们能够专注于为开发者构建更好的 AI 开发体验：

**[Clerk](https://clerk.com?utm_source=libra.dev)** - 最全面的用户管理平台

**[E2B](https://e2b.dev/startups?utm_source=libra.dev)** - E2B 是一个开源的运行时环境，用于在安全的云沙盒中执行 AI 生成的代码,适用于智能代理和 AI 应用场景。

**[PostHog](https://posthog.com/startups?utm_source=libra.dev)** - 分析、测试、观察和部署新功能的单一平台

**[Daytona](https://daytona.io/startups?utm_source=libra.dev)** - Daytona 是一个用于运行 AI 生成代码的安全且具有弹性的基础设施

**[Cloudflare](https://www.cloudflare.com/forstartups/?utm_source=libra.dev)** - 全球领先的边缘计算和网络基础设施提供商

---