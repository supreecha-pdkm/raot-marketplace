# CASL Role Updates — Future Maintenance Checklist

Step-by-step checklists for every kind of future change involving roles, permissions, or subjects. The steps differ a lot depending on what's actually changing — pick the matching scenario below.

---

## A) Adding a brand-new role (e.g. `admin`)

- [ ] **Add the role string to the `Role` union** — [lib/casl/types.ts](../../lib/casl/types.ts)

  ```ts
  export type Role = "buyer" | "seller" | "admin";
  ```

  Everything downstream (`Session.user.role`, `JWT.user.role`, `LoginResponse.user.role`) picks this up via TypeScript — **no edits needed** in `next-auth.d.ts`, `auth.ts`, or `features/auth/types/index.ts`.

- [ ] **Add a rule block for the new role** — [lib/casl/rules.ts](../../lib/casl/rules.ts)

  ```ts
  if (user.role === "admin") {
    can("manage", "all");
  }
  ```

- [ ] **Confirm backend `/auth/login` returns the new role string** — without this, login silently fails type assertion at runtime. Coordinate with backend before shipping.

- [ ] **Check middleware route protection** — [middleware.ts](../../middleware.ts). If the new role gets a dedicated route segment (e.g. `/admin/*`), add the matcher or `authorized()` rule.

- [ ] **Check post-login redirect** — wherever you route users after `signIn()` succeeds. If admins land somewhere different, branch on `session.user.role`.

- [ ] **Add navigation entries** — see [casl-permissions.md §1](./casl-permissions.md). Guard new links with `ability.can(...)`.

- [ ] **Add route guards** — see [casl-permissions.md §2](./casl-permissions.md). For admin-only segments, use a layout-level `getServerAbility()` check.

- [ ] **Run** `npx tsc --noEmit` and `pnpm lint`.

- [ ] **Manual smoke test** — log in as a user of the new role, confirm `useAbility().rules` matches expectations and protected routes/buttons behave correctly.

---

## B) Changing permissions for an existing role

- [ ] **Edit `defineRulesFor` only** — [lib/casl/rules.ts](../../lib/casl/rules.ts). Add/remove `can(...)` / `cannot(...)` calls.

- [ ] **If a new subject is involved**, follow checklist C below before adding the rule.

- [ ] **Audit existing UI** — `<Can>` blocks and `ability.can()` calls in components don't need code changes, but verify expected screens still render. Grep for the affected subject name to find call sites:

  ```
  Grep: "\"Product\"" / "\"Order\""
  ```

- [ ] **Audit server gates** — same grep across `app/**/route.ts`, server actions, and RSC pages. Tightening permissions can break server endpoints silently if you don't re-test.

- [ ] **Run** `npx tsc --noEmit` and `pnpm lint`.

- [ ] **Manual smoke test** for the affected role.

---

## C) Adding a new subject / entity (e.g. `Invoice`)

- [ ] **Add it to the `Subjects` union** — [lib/casl/types.ts](../../lib/casl/types.ts).

  ```ts
  export type Subjects = "Product" | "Order" | "Invoice" | "all" | ...;
  ```

- [ ] **If you need condition matching** (e.g. "only invoices for this seller"), add a typed shape alongside it:

  ```ts
  export type InvoiceSubject = {
    type: "Invoice";
    sellerId: string;
    buyerId: string;
  };
  // and include in the Subjects union
  ```

- [ ] **Define rules for each role on the new subject** — [lib/casl/rules.ts](../../lib/casl/rules.ts).

- [ ] When checking conditions in components, **pass the object form**, not the bare string:

  ```ts
  ability.can("read", { type: "Invoice", sellerId, buyerId });
  ```

- [ ] **Run** `npx tsc --noEmit` and `pnpm lint`.

---

## D) Renaming a role

- [ ] **Rename in `Role` union** — [lib/casl/types.ts](../../lib/casl/types.ts).

- [ ] **Rename in `defineRulesFor`** — [lib/casl/rules.ts](../../lib/casl/rules.ts).

- [ ] **Coordinate backend migration** — existing sessions/JWTs will still carry the old role string until they expire or users re-login. Decide: force re-login, or temporarily accept both.

- [ ] **Run** `npx tsc --noEmit` — TypeScript will flag every stale string literal across the codebase, including in `<Can>` blocks. Fix all.

- [ ] **Grep for the old role string** in case any check used it outside CASL:

  ```
  Grep: "'buyer'" / "\"buyer\""
  ```

- [ ] **Manual smoke test** for the renamed role.

---

## E) Changing a single user's role (admin promoting/demoting)

This is a backend/data concern, not a CASL code change.

- [ ] **Backend updates the user's role in DB** — no frontend code edit needed.

- [ ] **Force the session to refresh** so the new role flows in. Two options:

  - Have the user log out + log back in (simplest), **or**
  - Call `update()` from `useSession()` after the role change to refetch the JWT. Wire that into the admin UI that performs the change.

- [ ] **Verify the JWT callback in [auth.ts](../../auth.ts) carries the new role** — currently it only reads role on initial login (`if (user)` branch). If you want server-driven role updates without re-login, extend the `jwt` callback to refetch user data when `trigger === "update"`.

---

## Cross-cutting reminders

- Auth.js types ([next-auth.d.ts](../../next-auth.d.ts)), [auth.ts](../../auth.ts), and [features/auth/types/index.ts](../../features/auth/types/index.ts) all reference `Role` from `@/lib/casl` — **they auto-update with the union**. Don't duplicate role literals there.

- The `Can` component and `useAbility()` hook are typed against `AppAbility`, so adding/removing actions or subjects will surface TypeScript errors at every call site — let `tsc` do the heavy lifting.

- After **any** role/rule/subject change: re-read [casl-permissions.md](./casl-permissions.md) to make sure the situation map still reflects reality, and update it if not.

---

## Reference

- Role/Subject/Action types: [lib/casl/types.ts](../../lib/casl/types.ts)
- Rule definitions: [lib/casl/rules.ts](../../lib/casl/rules.ts)
- Ability factory: [lib/casl/ability.ts](../../lib/casl/ability.ts)
- Auth callbacks (role propagation): [auth.ts](../../auth.ts)
- Session/JWT type augmentation: [next-auth.d.ts](../../next-auth.d.ts)
- Usage examples: [casl-permissions.md](./casl-permissions.md)
