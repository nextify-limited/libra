# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed by Turborepo. Workspaces live in `apps/*`, `packages/*`, `tooling/*`, and `scripts/*`.
- Apps: web and workers in `apps/` (e.g., `apps/web`, `apps/opennext-cache`).
- Libraries: reusable code in `packages/` (e.g., `packages/api`, `packages/db`, `packages/ui`).
- Tests sit next to code or in `__tests__/` within each workspace.
- Env: copy `.env.example` to `.env.local` and adapt per app/package.

## Build, Test, and Development Commands
- Install deps: `bun install` (Node >= 24, Bun 1.2+).
- Dev: `bun run dev` (all) or `bun run dev:web` (web only).
- Build: `bun run build`; Types: `bun run typecheck`.
- Format: `bun run format` / `bun run format:fix`.
- Lint: `bun run lint` / `bun run lint:fix`.
- Tests: `turbo test` (all) or `bun test` in a workspace.
- DB: `bun run migration:generate`, `bun run migration:local`, `bun run studio:dev`.
- Cloudflare: `bun run preview`, `bun run deploy`.

## Coding Style & Naming Conventions
- Formatter/Linter: Biome (`biome.json`). Use 2-space indent, 100-char width, single quotes, semicolons as needed, ES5 trailing commas.
- TypeScript-first with strict types and meaningful names; prefer feature-oriented folders.
- Zod v4 only: `import { z } from 'zod/v4'`.

## Testing Guidelines
- Framework: Vitest. Name files `*.test.ts` and keep tests isolated.
- Location: beside source or in `__tests__/`.
- Run all tests via `turbo test`; per workspace use `bun test`.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`). Optional scope, e.g., `feat(web): ...`.
- PRs: clear description, linked issues (e.g., `#123`), screenshots for UI changes, and passing build, typecheck, lint, and tests.
- Scope changes narrowly; update docs and `.env.example` when config changes.

## Security & Configuration Tips
- Do not commit secrets; keep local-only config in `.env.local`.
- Validate env at runtime (see `@t3-oss/env-nextjs`).
- For DB changes, always generate migrations and run them locally before opening a PR.

