# Design System — Quick Reference

> Full reference: docs/design-tokens.md
> Source of truth: app/globals.css + lib/theme.ts

## Colors

### Primary

- Main brand: `bg-primary-500` / `text-primary-500` (#2e7d32)
- Hover: `bg-primary-600`
- Pressed: `bg-primary-700`
- Tinted bg: `bg-primary-50 border-primary-200 text-primary-700`
- Dark: `bg-primary-900`

### Semantic

- Success: `text-success` / `bg-success-light`
- Warning: `text-warning` / `bg-warning-light`
- Error: `text-error` / `bg-error-light`
- Info: `text-info` / `bg-info-light`
- Never use raw green/yellow/red for status states

### Neutral Text Scale

- Title: `text-neutral-900`
- Heading: `text-neutral-800`
- Label: `text-neutral-700`
- Body: `text-neutral-600`
- Secondary: `text-neutral-500`
- Placeholder/disabled: `text-neutral-400`

### Surface

- Page background: `bg-background`
- Card/input: `bg-surface`
- Hover: `bg-neutral-100`
- Border: `border-neutral-200`

---

## Typography Combinations

| Role            | Classes                                               |
| --------------- | ----------------------------------------------------- |
| Page title      | `text-2xl font-bold text-neutral-900 leading-tight`   |
| Section heading | `text-lg font-semibold text-neutral-800`              |
| Card title      | `text-base font-semibold text-neutral-900`            |
| Body            | `text-sm font-normal text-neutral-700 leading-normal` |
| Meta/supporting | `text-xs text-neutral-500`                            |
| Label           | `text-sm font-medium text-neutral-700`                |
| Error message   | `text-sm text-error`                                  |

---

## Components

### Border Radius

| Component         | Class                |
| ----------------- | -------------------- |
| Button, Input     | `rounded` (8px)      |
| Card              | `rounded-xl` (16px)  |
| Modal             | `rounded-2xl` (24px) |
| Badge/chip/avatar | `rounded-full`       |

### Shadow

| Component        | Class       |
| ---------------- | ----------- |
| Card default     | `shadow-sm` |
| Card elevated    | `shadow`    |
| Dropdown/popover | `shadow-lg` |
| Modal            | `shadow-xl` |

### Spacing

- Card padding: `p-4` mobile / `p-6` desktop
- Form field gap: `gap-4`
- Section gap: `gap-6`
- Icon-to-label: `gap-2`

> Rules: see .ai/project-context.md Hard Rules
