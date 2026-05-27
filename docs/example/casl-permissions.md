# CASL Permissions — Usage Examples

Practical patterns for the CASL setup. All examples assume the rules defined in [lib/casl/rules.ts](../../lib/casl/rules.ts):

- **buyer** — read `Product`, create `Order`, read own `Order` (`buyerId` match)
- **seller** — manage own `Product` (`sellerId` match), read own `Order` (`sellerId` match)

Role is sourced from the Auth.js session populated at login.

---

## 1. Navigation link visible per role

### Client sidebar / menu

Use `useAbility()` to filter items based on the current session role.

```tsx
// shared/components/app-nav.tsx
"use client";

import Link from "next/link";

import { useAbility } from "@/shared/hooks/use-ability";

export function AppNav() {
  const ability = useAbility();

  return (
    <nav>
      {ability.can("read", "Product") && (
        <Link href="/products">Products</Link>
      )}
      {ability.can("create", "Order") && (
        <Link href="/orders/new">Place Order</Link>
      )}
      {ability.can("manage", "Product") && (
        <Link href="/my-listings">My Listings</Link>
      )}
    </nav>
  );
}
```

Result:

- **buyer** sees: Products, Place Order
- **seller** sees: Products, My Listings

### Server layout (RSC nav)

Same idea on the server, using `getServerAbility()`.

```tsx
// app/(dashboard)/layout.tsx
import Link from "next/link";

import { getServerAbility } from "@/lib/casl/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ability = await getServerAbility();

  return (
    <div>
      <aside>
        {ability.can("manage", "Product") && (
          <Link href="/seller/products">My Products</Link>
        )}
        {ability.can("create", "Order") && (
          <Link href="/buyer/checkout">Checkout</Link>
        )}
      </aside>
      <main>{children}</main>
    </div>
  );
}
```

---

## 2. Page route guard per role

### Server-side guard (preferred — runs before render)

```tsx
// app/(dashboard)/seller/products/page.tsx
import { redirect } from "next/navigation";

import { getServerAbility } from "@/lib/casl/server";

export default async function SellerProductsPage() {
  const ability = await getServerAbility();
  if (ability.cannot("manage", "Product")) redirect("/403");

  return <SellerProductsView />;
}
```

### Group-level guard via layout

Covers every page under the segment in one place.

```tsx
// app/(dashboard)/seller/layout.tsx
import { redirect } from "next/navigation";

import { getServerAbility } from "@/lib/casl/server";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ability = await getServerAbility();
  if (ability.cannot("manage", "Product")) redirect("/403");
  return <>{children}</>;
}
```

### Client-side guard

For pages that are already `"use client"`.

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAbility } from "@/shared/hooks/use-ability";

export function BuyerOnly({ children }: { children: React.ReactNode }) {
  const ability = useAbility();
  const router = useRouter();

  useEffect(() => {
    if (ability.cannot("create", "Order")) router.replace("/403");
  }, [ability, router]);

  if (ability.cannot("create", "Order")) return null;
  return <>{children}</>;
}
```

---

## 3. Action button visible per role

Use `<Can>` for declarative reads, `useAbility()` when you need the boolean in logic (e.g. `disabled` props).

```tsx
"use client";

import { Can } from "@/shared/components/providers/ability-provider";
import { useAbility } from "@/shared/hooks/use-ability";

export function ProductActions({
  product,
}: {
  product: { id: string; sellerId: string };
}) {
  const ability = useAbility();

  return (
    <div>
      <Can I="create" a="Order">
        <button>Buy Now</button>
      </Can>

      {/* Resource-level: only the owning seller sees Edit */}
      <Can I="update" this={{ type: "Product", sellerId: product.sellerId }}>
        <button>Edit Listing</button>
      </Can>

      {/* Same logic via hook — useful when you also need disabled/loading state */}
      <button
        disabled={ability.cannot("delete", {
          type: "Product",
          sellerId: product.sellerId,
        })}
        onClick={() => deleteProduct(product.id)}
      >
        Delete
      </button>
    </div>
  );
}
```

Result:

- **buyer** sees Buy Now only
- **seller** sees Buy Now hidden; Edit/Delete shown **only on their own products**

---

## When to reach for CASL — situation map

| Situation                                                            | Use                                                                                       |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Show/hide nav links, tabs, menu items                                | `useAbility()` / `getServerAbility()`                                                     |
| Hide/disable action buttons (Buy, Edit, Delete, Approve)             | `<Can>` or `ability.can()`                                                                |
| Redirect unauthorized users away from a route                        | `getServerAbility()` in `page.tsx` or `layout.tsx`                                        |
| Block server actions / route handlers                                | `await getServerAbility()` at the top — throw 403 on `cannot`                             |
| Filter table rows (only actionable rows get the actions column)      | `rows.filter(r => ability.can("update", { type: "Product", sellerId: r.sellerId }))`      |
| Conditional form fields (seller sees pricing, buyer doesn't)         | `ability.can("update", "Product") && <PriceField />`                                      |
| Resource ownership checks (edit own product, view own order)         | Pass the instance: `ability.can("update", { type: "Product", sellerId })`                 |
| Different default redirect after login (buyer → / seller → /)        | Read `session.user.role` directly in the post-login redirect, or derive from ability      |
| API call gating (don't fire the mutation if the user can't)          | Wrap the trigger in `ability.can()` before calling the React Query mutation               |
| Empty-state messaging ("Become a seller to list products")           | Inverse check: `ability.cannot("manage", "Product")`                                      |
| Feature flags by role (beta features for sellers first)              | Add a new rule + subject, check `ability.can("read", "BetaDashboard")`                    |

---

## Important: server-authoritative

UI checks are **convenience**, not security. Always re-check the ability on the **server** (route handler, server action, RSC) before performing the mutation. A hidden button is not a security boundary.

```ts
// app/api/products/route.ts
import { NextResponse } from "next/server";

import { getServerAbility } from "@/lib/casl/server";

export async function POST(req: Request) {
  const ability = await getServerAbility();
  if (ability.cannot("create", "Product")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // …proceed
}
```

---

## Reference

- Ability factory: [lib/casl/ability.ts](../../lib/casl/ability.ts)
- Rules: [lib/casl/rules.ts](../../lib/casl/rules.ts)
- Types (Role, Actions, Subjects, AppAbility): [lib/casl/types.ts](../../lib/casl/types.ts)
- Client provider + `<Can>`: [shared/components/providers/ability-provider.tsx](../../shared/components/providers/ability-provider.tsx)
- Client hook: [shared/hooks/use-ability.ts](../../shared/hooks/use-ability.ts)
- Server reader: [lib/casl/server.ts](../../lib/casl/server.ts)
