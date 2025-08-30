# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router pages, layouts, and route handlers.
- `components/` and `components/ui/`: Reusable React components (kebab-case filenames, PascalCase exports).
- `lib/`: API clients, services, and utilities (e.g., `client-api.ts`, `revision-service.ts`).
- `hooks/`: Reusable React/TS hooks.
- `styles/`, `public/`: Global styles and static assets.
- `types/`: Shared TypeScript types.
- Config: `next.config.mjs`, `tsconfig.json`, `.env.local` (local secrets), `middleware.ts` (auth via Clerk).

## Build, Test, and Development Commands
- `npm run dev`: Start the local dev server.
- `npm run build`: Production build with Next.js.
- `npm run start`: Run the built app locally.
- `npm run lint`: Lint using Next.js’ ESLint config.
- `npm run deploy`: Build and manage the app with `pm2` (server usage).

Examples:
- Local: `npm run dev`
- Prod build: `npm run build && npm run start`

## Coding Style & Naming Conventions
- Language: TypeScript (strict mode). Path alias: `@/*`.
- Components: PascalCase exports; files in `components/` use kebab-case (e.g., `post-form.tsx`).
- Hooks: `use-*` naming (e.g., `use-auto-save.ts`).
- Indentation: 2 spaces; prefer named exports.
- Linting: Fix issues surfaced by `npm run lint` before PR.
- Styling: Tailwind CSS v4; keep utility classes readable and grouped logically.

## Testing Guidelines
- Current state: No test runner configured.
- Recommendation: Add Vitest + React Testing Library for unit/component tests and Playwright for e2e.
- Naming (suggested): `*.test.ts(x)` colocated next to source or under `__tests__/`.
- Coverage: Aim for critical paths in `lib/` and key components in `components/`.

## Commit & Pull Request Guidelines
- Commits: Prefer Conventional Commits (`feat:`, `fix:`, `refactor:`). Keep messages scoped and imperative.
- PRs: Include clear description, linked issues, screenshots/GIFs for UI changes, and steps to validate.
- CI readiness: Ensure `build` and `lint` pass locally; include any migration or env changes in the PR body.

## Security & Configuration Tips
- Never commit secrets. Use `.env.local`; see NOTION_INTEGRATION.md for Notion setup and Clerk docs for required keys.
- Example variables: `NEXT_PUBLIC_*` for client-safe, server-only keys without the prefix.
