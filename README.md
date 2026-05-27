# vibe-code-next

A production-ready Next.js 16 starter with App Router, built for scalable feature-first development.

---

## Tech Stack

| Layer             | Library               | Version |
| ----------------- | --------------------- | ------- |
| Framework         | Next.js (App Router)  | 16      |
| UI Runtime        | React                 | 19      |
| Language          | TypeScript            | 5       |
| Styling           | Tailwind CSS          | 4       |
| Component Library | Ant Design            | 6       |
| Server State      | TanStack React Query  | 5       |
| Client State      | Zustand               | 5       |
| Forms             | React Hook Form + Zod | 7 / 4   |
| HTTP Client       | Axios                 | 1       |
| URL State         | nuqs                  | 2       |
| Date Utility      | date-fns              | 4       |

---

## Getting Started

**Prerequisites:** Node.js 20+, pnpm 9+

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create `.env.local` from the example below. Never commit secrets.

```env
# API
NEXT_PUBLIC_API_URL=https://api.example.com

```

> **Note:** `.env.example` should be committed to the repo. Add all new variables there with placeholder values.

---

## Available Scripts

| Command      | Description               |
| ------------ | ------------------------- |
| `pnpm dev`   | Start dev server with HMR |
| `pnpm build` | Production build          |
| `pnpm start` | Start production server   |
| `pnpm lint`  | Run ESLint                |

---

## Folder Structure

```
├── app/                        # Next.js App Router (routes + layouts)
│   ├── (auth)/                 # Route group — unauthenticated pages
│   ├── (dashboard)/            # Route group — authenticated pages
│   ├── globals.css             # Global styles (Tailwind entry point)
│   └── layout.tsx              # Root layout (providers, metadata)
│
├── features/                   # Feature-scoped modules (see Architecture Notes)
│   └── [feature-name]/
│       ├── api/                # React Query hooks & API calls
│       ├── components/         # Feature-specific components
│       ├── hooks/              # Feature-specific hooks
│       ├── services/           # API call functions
│       ├── store/              # Zustand slices
│       ├── types/              # Feature TypeScript types
│       ├── utils/
│       │   └── validations/    # Zod schemas
│       └── index.ts            # Public API of the feature
│
├── shared/                     # Cross-cutting, reusable code
│   ├── components/             # Generic UI components & providers
│   └── utils/                  # Pure utility functions (cn, formatters, etc.)
│
├── lib/                        # Infrastructure singletons
│   ├── axios/                  # Axios instance, auth helpers, interceptors
│   ├── react-query.ts          # QueryClient factory
│   └── theme.ts                # Ant Design theme config (colorPrimary, tokens)
│
└── public/                     # Static assets
```

---

## Architecture Notes

### Layer Responsibilities

| Layer       | Purpose                           | Rule                        |
| ----------- | --------------------------------- | --------------------------- |
| `app/`      | Routing, layouts, pages           | Thin — delegate to features |
| `features/` | All business logic                | Self-contained per domain   |
| `shared/`   | Generic, reusable across features | No feature-specific logic   |
| `lib/`      | Infrastructure singletons         | No React, no business logic |

### Route Groups

Use `(group-name)` folders in `app/` to share layouts without affecting the URL:

```
app/
  (auth)/login/page.tsx         → /login
  (dashboard)/users/page.tsx    → /users
```

### Feature Boundary Rule

A feature **must not** import from another feature directly. Share data via URL state (nuqs), Zustand, or lifting to a parent layout. If two features share a component, move it to `shared/`.

---

## Coding Conventions

### Naming

**All files and folders use kebab-case.** The folder name carries the responsibility — no dot-suffix needed. Identifiers (exports) follow their own convention inside the file.

| Item           | File name             | Exported identifier      | Example file        |
| -------------- | --------------------- | ------------------------ | ------------------- |
| Components     | kebab-case            | PascalCase               | `user-card.tsx`     |
| Hooks          | `use-[name].ts`       | camelCase (`use` prefix) | `use-user-list.ts`  |
| Utilities      | kebab-case            | camelCase                | `format-date.ts`    |
| Constants      | kebab-case            | UPPER_SNAKE_CASE         | `user.ts`           |
| Types          | kebab-case            | PascalCase               | `user.ts`           |
| Zod Schemas    | kebab-case            | PascalCase               | `user.ts`           |
| Services       | kebab-case            | camelCase                | `user.ts`           |
| Zustand stores | `use-[name]-store.ts` | camelCase (`use` prefix) | `use-auth-store.ts` |
| Folders        | kebab-case            | —                        | `user-profile/`     |

### Component Structure

```tsx
// 1. "use client" directive (only when needed)
"use client";

// 2. External imports
import { useState } from "react";
import { Button } from "antd";

// 3. Internal imports
import { cn } from "@/shared/utils";

// 4. Types
type Props = {
  label: string;
  onClick?: () => void;
};

// 5. Component (default export for pages/layouts, named for everything else)
export function MyButton({ label, onClick }: Props) {
  return (
    <Button className={cn("rounded-md")} onClick={onClick}>
      {label}
    </Button>
  );
}
```

### TypeScript

- Strict mode is enabled — no `any`, no type assertions without justification.
- Use `type` over `interface` for object shapes. Use `interface` only for extensible public APIs.
- Zod schemas live in `features/[name]/utils/validations/`. Derive TypeScript types from them with `z.infer<typeof Schema>` and co-locate the type in `features/[name]/types/`.
- Path alias `@/*` maps to the project root. Always use it over relative `../../` imports.

### Styling

- Use `cn()` (`clsx` + `tailwind-merge`) for all conditional class logic.
- Tailwind classes are auto-sorted by `prettier-plugin-tailwindcss` on save.
- Ant Design handles complex component UI; Tailwind handles layout and spacing.
- Avoid writing custom CSS unless absolutely necessary.

---

## State Management & API Strategy

### When to use what

| Concern                | Solution              |
| ---------------------- | --------------------- |
| Server / async data    | TanStack React Query  |
| URL / shareable state  | nuqs                  |
| Global client UI state | Zustand               |
| Form state             | React Hook Form + Zod |

### React Query

The `QueryClient` is instantiated once per client session via `makeQueryClient()` in `lib/react-query.ts`.

```ts
// Default config
staleTime: 60_000; // 1 minute — data is fresh
gcTime: 600_000; // 10 minutes — cache retention
retry: 1;
refetchOnWindowFocus: false;
```

Place all query/mutation hooks inside `features/[name]/api/`. Name them `use[Entity][Action]`:

```ts
// features/users/api/useUsers.ts
export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: fetchUsers });
}
```

### Axios

The configured instance lives in `lib/axios/client.ts`. It reads `NEXT_PUBLIC_API_URL` and automatically attaches `Bearer` tokens via request interceptors. A 401 response triggers a token refresh via the `/api/refresh` route handler before retrying the original request.

Import the instance from `@/lib/axios`:

```ts
import { api } from "@/lib/axios";
```

### Zustand

Create one store file per domain slice in `features/[name]/store/`. Export a single `use[Name]Store` hook:

```ts
// features/auth/store/use-auth-store.ts
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

---

## Build & Deployment

```bash
# Production build
pnpm build

# Run production server locally
pnpm start
```

### Environment checklist before deploy

- [ ] `NEXT_PUBLIC_API_URL` points to the correct environment
- [ ] `AUTH_SECRET` is set and rotated per environment
- [ ] No `console.log` or debug code committed
- [ ] `pnpm lint` passes with zero errors

### Recommended: Vercel

This project is optimized for [Vercel](https://vercel.com). Connect the repository, set environment variables in the project dashboard, and deployments are automatic on every push to `main`.

For self-hosted deployments, run `pnpm build && pnpm start` behind a reverse proxy (nginx, Caddy) with Node.js 20+ on the server.

---

> **Missing from this scaffold:** `.env.example` file, test setup (Vitest recommended), and CI pipeline. Add these before going to production.
