# Architecture — System Design Reference

> Stack details: .ai/project-context.md
> This file explains how layers connect and data flows

## 1. Layer Responsibilities

app/ → Routing, layouts, providers only. Zero logic.
features/[name]/ → All feature logic, UI, state, validation
shared/ → Cross-feature reusable code only
lib/ → Infrastructure singletons. No React, no business logic.

## 2. Request Lifecycle

Client Component
→ React Query hook (features/[name]/api/)
→ Service function (features/[name]/services/)
→ Axios instance (@/lib/axios)
→ Interceptor attaches Bearer token (reads session via Auth.js)
→ API response
→ React Query caches result

Never:

- Call axios directly in components
- Fetch in useEffect
- Put service logic inside hooks

## 3. Auth Flow

Login form (UI only)
→ features/auth/services/ calls Auth.js signIn()
→ Auth.js stores accessToken + refreshToken in encrypted session
→ middleware.ts protects routes via Auth.js session check
→ Client reads session via useAuth() → useSession() wrapper
→ Server reads session via auth() from auth.ts

Token refresh:
→ Axios interceptor detects 401
→ Calls refresh endpoint
→ Updates session
→ Retries original request
→ On refresh failure → signOut()

Never:

- Store tokens in localStorage
- Read tokens outside Auth.js session
- Check roles ad-hoc — always go through CASL

## 4. Authorization Flow

Role sourced from session.user.role (set by Auth.js callback)
→ AbilityProvider reads role at app root
→ Builds CASL ability instance
→ Client: useAbility() or <Can> component
→ Server: getServerAbility() from @/lib/casl/server

Never:

- Import @/lib/casl/server in client components
- Re-derive role checks with if(role === "buyer")
- Duplicate permission logic across features

## 5. State Ownership Map

Who owns what:

Server data → React Query (fetched, cached, synced)
Auth session → Auth.js (single source of truth)
Permissions → CASL (derived from session role)
URL/filters → nuqs (shareable, bookmarkable)
Global UI → Zustand (modals, sidebar, preferences)
Form data → React Hook Form + Zod
Local UI → useState (last resort, non-shareable)

## 6. Data Flow Rules

- Server components fetch via auth() + direct service calls
- Client components fetch via React Query hooks only
- Never pass server-fetched data as props more than 2 levels
- Zustand stores UI state only — never server response data
- nuqs for any state that should survive page refresh

## 7. Provider Order

app/layout.tsx wraps in this order:
SessionProvider → AbilityProvider → ReactQueryProvider

Why this order:

- AbilityProvider needs session to build CASL rules
- ReactQueryProvider needs to be innermost for component access
- Never reorder without understanding the dependency chain
