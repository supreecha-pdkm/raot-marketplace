# Coding Standard — Patterns Reference

> Rules source: .ai/project-context.md
> This file shows HOW rules look in code — not what the rules are

## 1. Component Structure Order

// ✅ Correct
"use client" // only when needed

import { useState } from "react"
import { Button } from "antd"

import { cn } from "@/shared/utils"
import { UserCard } from "@/features/users"

type UserListProps = {
userId: string
className?: string
}

export function UserList({ userId, className }: UserListProps) {}

// ❌ Wrong — default export, wrong import order, missing type
export default function UserList({ userId }) {}

---

## 2. cn() for Conditional Classes

// ✅ Correct

<div className={cn(
  "rounded-xl p-4 shadow-sm",
  isActive && "bg-primary-50 border-primary-200",
  className
)} />

// ❌ Wrong — string concatenation, inline style

<div 
  className={"rounded-xl p-4" + (isActive ? " bg-primary-50" : "")}
  style={{ padding: 16 }}
/>

---

## 3. AntD vs Tailwind Separation

// ✅ Correct — AntD for component, Tailwind for layout

<div className="flex flex-col gap-4 p-6">
  <Button type="primary" size="large" block>
    Submit
  </Button>
</div>

// ❌ Wrong — Tailwind overriding AntD internals
<Button
type="primary"
className="!bg-primary-500 !rounded-xl !h-13"

> Submit
> </Button>

---

## 4. Feature Barrel Exports

// ✅ Correct — import from barrel only
import { LoginView } from "@/features/auth"

// ❌ Wrong — direct internal import
import { LoginView } from "@/features/auth/components/login-view"

// features/auth/index.ts
export { LoginView } from "./components/login-view"
export type { User } from "./types"

---

## 5. State Rules

// ✅ Correct — right tool for each state type
const [open, setOpen] = useState(false) // local UI only
const { data } = useUserList() // server state → React Query
const filters = useFiltersStore() // global UI → Zustand
const [search, setSearch] = useQueryState("q") // URL state → nuqs
const { data: session } = useAuth() // auth → Auth.js

// ❌ Wrong — useState for everything
const [users, setUsers] = useState([]) // should be React Query
const [role, setRole] = useState("buyer") // should be Auth.js/CASL

---

## 6. Zod Schema + Type Pattern

// ✅ Correct — schema first, type derived
const LoginSchema = z.object({
username: z.string().min(1, "Required"),
password: z.string().min(8, "Min 8 characters"),
})

type LoginInput = z.infer<typeof LoginSchema>

// ❌ Wrong — type defined separately from schema
type LoginInput = {
username: string
password: string
}
const LoginSchema = z.object({
username: z.string(),
password: z.string(),
})

---

## 7. React Query Hook Structure

// ✅ Correct
// features/users/api/use-user-list.ts
export function useUserList(filters: UserFilters) {
return useQuery({
queryKey: ["users", "list", filters],
queryFn: () => getUsers(filters),
})
}

// features/users/services/user-service.ts
export async function getUsers(filters: UserFilters) {
const { data } = await axios.get("/users", { params: filters })
return data
}

// ❌ Wrong — axios inside hook, wrong query key format
export function useUserList() {
return useQuery({
queryKey: "users",
queryFn: () => axios.get("/users")
})
}
