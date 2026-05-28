# Component Patterns — Composition Reference

> Coding rules: .ai/coding-standard.md
> This file shows HOW components are structured and composed

## 1. Basic Component Pattern

// Simple presentational component
type StatusBadgeProps = {
status: "approved" | "pending" | "rejected"
className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
return (
<span className={cn(
"rounded-full px-2 py-0.5 text-xs font-medium",
status === "approved" && "bg-success-light text-success",
status === "pending" && "bg-warning-light text-warning",
status === "rejected" && "bg-error-light text-error",
className
)}>
{STATUS_LABEL[status]}
</span>
)
}

const STATUS_LABEL = {
approved: "อนุมัติ",
pending: "รอดำเนินการ",
rejected: "ปฏิเสธ",
}

---

## 2. Component with AntD + Tailwind

// AntD handles component behavior
// Tailwind handles layout and spacing around it

// ✅ Correct
export function FilterBar({ onSearch }: FilterBarProps) {
return (

<div className="flex items-center gap-3 p-4">
<Input.Search
placeholder="ค้นหา..."
size="large"
onSearch={onSearch}
/>
<Button icon={<FunnelIcon size={16} />}>
กรอง
</Button>
</div>
)
}

// ❌ Wrong — Tailwind fighting AntD internals
export function FilterBar({ onSearch }: FilterBarProps) {
return (
<Input.Search
className="!rounded-xl !border-primary-500"
style={{ padding: "12px" }}
/>
)
}

---

## 3. Feature Component with Data

// Data lives in hook, component stays presentational

// features/users/api/use-user-list.ts
export function useUserList(filters: UserFilters) {
return useQuery({
queryKey: ["users", "list", filters],
queryFn: () => getUsers(filters),
})
}

// features/users/components/user-list.tsx
export function UserList({ filters }: UserListProps) {
const { data, isLoading, isError } = useUserList(filters)

if (isLoading) return <UserListSkeleton />
if (isError) return <ErrorState />
if (!data?.length) return <EmptyState />

return (

<div className="flex flex-col gap-3">
{data.map((user) => (
<UserCard key={user.id} user={user} />
))}
</div>
)
}

---

## 4. Form Pattern

// features/auth/components/login-form.tsx
export function LoginForm() {
const form = useForm<LoginInput>({
resolver: zodResolver(LoginSchema),
defaultValues: { username: "", password: "" }
})

return (

<form onSubmit={form.handleSubmit(onSubmit)}>
<Controller
control={form.control}
name="username"
render={({ field, fieldState }) => (
<div className="flex flex-col gap-1.5">
<label htmlFor="username" className="text-sm font-medium text-neutral-700">
ชื่อผู้ใช้
</label>
<Input
{...field}
id="username"
size="large"
status={fieldState.error ? "error" : undefined}
/>
{fieldState.error && (
<p className="text-sm text-error">{fieldState.error.message}</p>
)}
</div>
)}
/>
<Button type="primary" htmlType="submit" block size="large">
เข้าสู่ระบบ
</Button>
</form>
)
}

---

## 5. Permission-Gated Component

import { Can } from "@/shared/hooks/use-ability"

export function AuctionActions({ auctionId }: AuctionActionsProps) {
return (

<div className="flex gap-2">
<Can I="read" a="Auction">
<Button>ดูรายละเอียด</Button>
</Can>
<Can I="create" a="Bid">
<Button type="primary">เสนอราคา</Button>
</Can>
</div>
)
}

---

## 6. Page Component Pattern

// app/(dashboard)/buyer/users/page.tsx
// app/(dashboard)/seller/users/page.tsx
// Role pages live under (dashboard) route group, separated by role segment

import { UserList } from "@/features/users"

export default function UsersPage() {
return (

<div className="flex flex-col gap-6">
<header className="flex items-center justify-between">
<h1 className="text-2xl font-bold text-neutral-900">
ผู้ใช้งาน
</h1>
</header>
<UserList />
</div>
)
}

---

## 7. Shared Component Pattern

// shared/components/empty-state.tsx
// Generic enough to use anywhere — no feature-specific logic

type EmptyStateProps = {
title: string
description?: string
action?: React.ReactNode
className?: string
}

export function EmptyState({
title,
description,
action,
className
}: EmptyStateProps) {
return (

<div className={cn(
"flex flex-col items-center justify-center gap-3 py-12 text-center",
className
)}>
<p className="text-base font-medium text-neutral-700">{title}</p>
{description && (
<p className="text-sm text-neutral-500">{description}</p>
)}
{action}
</div>
)
}

