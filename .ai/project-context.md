# Project Context

## Stack

- Next.js 16, App Router, React 19, TypeScript strict
- Tailwind CSS 4 + clsx + tailwind-merge via cn()
- Ant Design 6 (complex UI components) — themed via lib/theme.ts
- TanStack React Query 5 (server state)
- Zustand 5 (global client UI state)
- React Hook Form + Zod 4 (forms)
- Axios (HTTP, instance at @/lib/axios)
- Auth.js v5 (next-auth@5.0.0-beta.31) — JWT session, encrypted accessToken + refreshToken, role on session.user
- CASL 6 (@casl/ability + @casl/react) — role-based permissions (buyer | seller), role sourced from session
- nuqs 2 (URL state)
- date-fns 4 (dates)
- Sarabun via next/font/google (latin + thai, 300–700, variable: --font-sarabun)
- @phosphor-icons/react (icons)
- pnpm, Node 20+

## Icons

- @phosphor-icons/react
- Usage: `weight="duotone"` for UI icons, `weight="bold"` for emphasis
- Size convention: 16 for inline, 20 for standalone, 24 for decorative

## Folder Structure

```
auth.config.ts    → Auth.js edge-safe config (providers, callbacks)
auth.ts           → Auth.js instance (handlers, signIn, signOut, auth)
proxy.ts          → Auth.js proxy (route protection, Next.js 16 rename of middleware.ts)
next-auth.d.ts    → Session/JWT type augmentation (includes role: Role)
app/              → routing + layouts only (thin)
  globals.css     → :root design tokens + @theme inline → Tailwind v4 namespaces
  layout.tsx      → next/font/google (Sarabun) + SessionProvider > AbilityProvider > ReactQueryProvider > AntdConfigProvider > TextScaleProvider on <html>
  api/auth/[...nextauth]/route.ts → Auth.js route handlers
features/[name]/
  api/            → React Query hooks (use[Entity][Action])
  components/     → feature components
  hooks/          → feature hooks
  services/       → API functions
  store/          → Zustand slices
  types/          → TypeScript types
  utils/validations/ → Zod schemas
  index.ts        → public API
features/auth/
  api/            → client.ts, login.ts, register.ts, refresh.ts
  hooks/          → use-auth.ts
  services/       → session-tokens.ts (isomorphic session/token reader)
  types/          → index.ts (User includes role: Role)
  utils/validations/ → login.ts, register.ts
  index.ts        → public API
shared/components/ → generic reusable UI
  providers/      → client providers (session-provider.tsx, ability-provider.tsx, react-query-provider.tsx, antd-config-provider.tsx, text-scale-provider.tsx)
shared/hooks/      → cross-feature hooks (use-ability.ts, …)
shared/utils/      → pure utilities (cn, formatters)
lib/              → infrastructure singletons (no React, no business logic)
  axios/          → HTTP instance + interceptors (session reader + signOut on 401)
  casl/           → ability factory, rules, types (server.ts for getServerAbility via auth())
  theme.ts        → AntD 6 ThemeConfig (literal hex, defaultAlgorithm)
```

## Naming Conventions

- Files/folders: kebab-case
- Components: PascalCase export, kebab-case file
- Hooks: use-[name].ts → camelCase export
- Stores: use-[name]-store.ts → use[Name]Store export
- Types/Schemas: PascalCase
- Constants: UPPER_SNAKE_CASE
- Path alias: @/\* (always use, never relative ../../)

## State Rules

- Server/async data → React Query only
- URL/shareable state → nuqs only
- Global UI state → Zustand only
- Form state → React Hook Form + Zod only
- Auth/session state → Auth.js (`auth()` server / `useAuth()` client wrapping `useSession()`) only
- Authorization/permissions → CASL (`useAbility()` / `<Can>` client, `getServerAbility()` server) — never re-derive role checks ad-hoc
- Local UI state → useState (last resort)
- Persistent UI preferences (language, text scale) → cookie (server-readable, survives reload)

## Component Structure Order

1. "use client" (only when needed)
2. External imports
3. Internal imports (@/\*)
4. Types (type over interface)
5. Named export (default only for pages/layouts)

## Theming & Tokens

- Design tokens defined on `:root` in app/globals.css
- `@theme inline` maps tokens to Tailwind v4 namespaces: `--color-*`, `--text-*`, `--font-*`, `--font-weight-*`, `--leading-*`, `--radius-*`, `--shadow-*`
- Body base rule sets font/bg/color from tokens
- Bare `rounded` / `shadow` aliased to the base step; `font-normal` aliased to `--font-weight-regular`
- Z-index and layout dims stay only on `:root` for `var()` consumption (not exposed to Tailwind)
- Font bridge: `--font-sarabun` (from next/font) → `--font-family-base` in `:root`
- AntD theming via lib/theme.ts: literal hex values, `algorithm: theme.defaultAlgorithm`, Button hover/active pinned to primary-600/-700, plus Layout/Menu/Modal/Card overrides for radii and surfaces

## Hard Rules

- `docs/` is read-only reference — never check, update, or validate against it unless the user explicitly asks
- No `any` type
- No relative ../../ imports
- No cross-feature imports (share via Zustand, nuqs, or shared/)
- No custom CSS unless absolutely necessary
- No inline styles — Tailwind only
- No raw hex in components — consume tokens via Tailwind classes or `var(--…)`
- No tokens in `localStorage` — session is the source of truth, read via Auth.js
- No ad-hoc role checks — go through CASL (`useAbility()` / `getServerAbility()`)
- `@/lib/casl/server` is server-only — never import into client components (use `@/lib/casl` for shared types/factories)
- Ant Design → complex component UI
- Tailwind → layout, spacing, utilities only
- Zod schemas → derive types with z.infer<>
- cn() for all conditional class logic

