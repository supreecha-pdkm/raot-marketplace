# Design Tokens — TRT Green Rubber

> **System:** RAOT Traceability Platform
> **Stack:** Next.js 16 · React 19 · Tailwind CSS 4 · Ant Design 6 · CSS Custom Properties
> **Source of truth:** `app/globals.css` (`:root` block)
> **Tailwind mapping:** `app/globals.css` (`@theme inline` block — no `tailwind.config.ts`)
> **Ant Design mapping:** `lib/theme.ts`

All tokens are defined as CSS custom properties on `:root` and bridged into Tailwind v4 via an `@theme inline { ... }` block so generated utilities resolve to `var(--token)` at runtime (not literals). Never hardcode hex values or pixel sizes — always use a token.

---

## 1. Colors

### 1.1 Primary — Brand Green

| Token                 | Value     | Hex                                                      | Tailwind Class                                         |
| --------------------- | --------- | -------------------------------------------------------- | ------------------------------------------------------ |
| `--color-primary-50`  | `#e8f5e9` | ![#e8f5e9](https://placehold.co/14x14/e8f5e9/e8f5e9.png) | `bg-primary-50` / `text-primary-50`                    |
| `--color-primary-100` | `#c8e6c9` | ![#c8e6c9](https://placehold.co/14x14/c8e6c9/c8e6c9.png) | `bg-primary-100` / `text-primary-100`                  |
| `--color-primary-200` | `#a5d6a7` | ![#a5d6a7](https://placehold.co/14x14/a5d6a7/a5d6a7.png) | `bg-primary-200` / `text-primary-200`                  |
| `--color-primary-300` | `#81c784` | ![#81c784](https://placehold.co/14x14/81c784/81c784.png) | `bg-primary-300` / `text-primary-300`                  |
| `--color-primary-400` | `#66bb6a` | ![#66bb6a](https://placehold.co/14x14/66bb6a/66bb6a.png) | `bg-primary-400` / `text-primary-400`                  |
| `--color-primary-500` | `#2e7d32` | ![#2e7d32](https://placehold.co/14x14/2e7d32/2e7d32.png) | `bg-primary-500` / `text-primary-500` — **main brand** |
| `--color-primary-600` | `#1b5e20` | ![#1b5e20](https://placehold.co/14x14/1b5e20/1b5e20.png) | `bg-primary-600` / `text-primary-600` — hover state    |
| `--color-primary-700` | `#145a18` | ![#145a18](https://placehold.co/14x14/145a18/145a18.png) | `bg-primary-700` / `text-primary-700` — pressed state  |
| `--color-primary-900` | `#0a2e0b` | ![#0a2e0b](https://placehold.co/14x14/0a2e0b/0a2e0b.png) | `bg-primary-900` / `text-primary-900` — darkest        |

**Usage pattern:**

```html
<!-- Default button -->
<button
  class="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white"
>
  <!-- Tinted background -->
  <div class="bg-primary-50 border-primary-200 text-primary-700 border"></div>
</button>
```

---

### 1.2 Secondary — Teal Accent

| Token                   | Value     | Hex                                                      | Tailwind Class                  |
| ----------------------- | --------- | -------------------------------------------------------- | ------------------------------- |
| `--color-secondary-50`  | `#e0f2f1` | ![#e0f2f1](https://placehold.co/14x14/e0f2f1/e0f2f1.png) | `bg-secondary-50`               |
| `--color-secondary-100` | `#b2dfdb` | ![#b2dfdb](https://placehold.co/14x14/b2dfdb/b2dfdb.png) | `bg-secondary-100`              |
| `--color-secondary-500` | `#00897b` | ![#00897b](https://placehold.co/14x14/00897b/00897b.png) | `bg-secondary-500` — main teal  |
| `--color-secondary-600` | `#00695c` | ![#00695c](https://placehold.co/14x14/00695c/00695c.png) | `bg-secondary-600` — teal hover |

---

### 1.3 Neutral — Slate Scale

| Token                 | Value     | Hex                                                      | Tailwind Class       | Usage              |
| --------------------- | --------- | -------------------------------------------------------- | -------------------- | ------------------ |
| `--color-neutral-0`   | `#ffffff` | white                                                    | `bg-neutral-0`       | Pure white         |
| `--color-neutral-50`  | `#f8fafc` | ![#f8fafc](https://placehold.co/14x14/f8fafc/f8fafc.png) | `bg-neutral-50`      | Page background    |
| `--color-neutral-100` | `#f1f5f9` | ![#f1f5f9](https://placehold.co/14x14/f1f5f9/f1f5f9.png) | `bg-neutral-100`     | Hover backgrounds  |
| `--color-neutral-200` | `#e2e8f0` | ![#e2e8f0](https://placehold.co/14x14/e2e8f0/e2e8f0.png) | `border-neutral-200` | Dividers, borders  |
| `--color-neutral-300` | `#cbd5e1` | ![#cbd5e1](https://placehold.co/14x14/cbd5e1/cbd5e1.png) | `border-neutral-300` | Input borders      |
| `--color-neutral-400` | `#94a3b8` | ![#94a3b8](https://placehold.co/14x14/94a3b8/94a3b8.png) | `text-neutral-400`   | Placeholder, icons |
| `--color-neutral-500` | `#64748b` | ![#64748b](https://placehold.co/14x14/64748b/64748b.png) | `text-neutral-500`   | Secondary text     |
| `--color-neutral-600` | `#475569` | ![#475569](https://placehold.co/14x14/475569/475569.png) | `text-neutral-600`   | Body text          |
| `--color-neutral-700` | `#334155` | ![#334155](https://placehold.co/14x14/334155/334155.png) | `text-neutral-700`   | Label text         |
| `--color-neutral-800` | `#1e293b` | ![#1e293b](https://placehold.co/14x14/1e293b/1e293b.png) | `text-neutral-800`   | Heading text       |
| `--color-neutral-900` | `#0f172a` | ![#0f172a](https://placehold.co/14x14/0f172a/0f172a.png) | `text-neutral-900`   | Title text         |

---

### 1.4 Semantic Colors

| Token             | Value     | Light variant                    | Tailwind                            | Usage               |
| ----------------- | --------- | -------------------------------- | ----------------------------------- | ------------------- |
| `--color-success` | `#16a34a` | `--color-success-light: #dcfce7` | `text-success` / `bg-success-light` | Approved, completed |
| `--color-warning` | `#d97706` | `--color-warning-light: #fef3c7` | `text-warning` / `bg-warning-light` | Pending, caution    |
| `--color-error`   | `#dc2626` | `--color-error-light: #fee2e2`   | `text-error` / `bg-error-light`     | Failed, rejected    |
| `--color-info`    | `#0284c7` | `--color-info-light: #e0f2fe`    | `text-info` / `bg-info-light`       | Informational       |

**Usage pattern:**

```html
<!-- Status badge -->
<span class="bg-success-light text-success rounded-full px-2 py-0.5 text-xs">
  <!-- Error message -->
  <p class="text-error flex items-center gap-1">
    <!-- Warning box -->
  </p>

  <div class="bg-warning-light border-warning/30 rounded-lg border p-4"></div
></span>
```

---

### 1.5 Surface Colors

| Token                      | Value     | Tailwind              | Usage                     |
| -------------------------- | --------- | --------------------- | ------------------------- |
| `--color-surface`          | `#ffffff` | `bg-surface`          | Cards, modals, inputs     |
| `--color-surface-elevated` | `#ffffff` | `bg-surface-elevated` | Elevated cards, dropdowns |
| `--color-background`       | `#f8fafc` | `bg-background`       | Page/layout background    |

---

### 1.6 Text Color Aliases

These are role-based aliases kept on `:root` only (NOT mapped into the Tailwind color namespace — use the neutral utilities for utility-class needs, or reference these via `var()` in component CSS).

| Token                    | Value     | Equivalent Utility | Usage                    |
| ------------------------ | --------- | ------------------ | ------------------------ |
| `--color-text-primary`   | `#0f172a` | `text-neutral-900` | Main headings, titles    |
| `--color-text-secondary` | `#475569` | `text-neutral-600` | Body, supporting text    |
| `--color-text-disabled`  | `#94a3b8` | `text-neutral-400` | Disabled fields          |
| `--color-text-inverse`   | `#ffffff` | `text-white`       | Text on dark backgrounds |

---

## 2. Typography

### 2.1 Font Family

| Token                   | Value                             | Tailwind       |
| ----------------------- | --------------------------------- | -------------- |
| `--font-family-base`    | `var(--font-sarabun), sans-serif` | `font-base`    |
| `--font-family-heading` | `var(--font-sarabun), sans-serif` | `font-heading` |

> Sarabun supports both Thai and Latin scripts. Loaded via `next/font/google` in `app/layout.tsx` with subsets `['latin', 'thai']` and weights 300/400/500/600/700. next/font injects the hashed `--font-sarabun` CSS variable on `<html>`; the design tokens reference it through `--font-family-base`. The `<body>` selector in `app/globals.css` applies the font globally — no per-component `font-base` class needed.

---

### 2.2 Font Size Scale

In Tailwind v4 the font-size namespace is `--text-*` (not `--font-size-*`). The canonical `--font-size-*` vars stay on `:root` for `var()` use; the `@theme inline` block aliases them to `--text-*` so utilities generate.

| Token (`:root`)    | `@theme inline` alias | rem        | px   | Tailwind    |
| ------------------ | --------------------- | ---------- | ---- | ----------- |
| `--font-size-xs`   | `--text-xs`           | `0.75rem`  | 12px | `text-xs`   |
| `--font-size-sm`   | `--text-sm`           | `0.875rem` | 14px | `text-sm`   |
| `--font-size-base` | `--text-base`         | `1rem`     | 16px | `text-base` |
| `--font-size-lg`   | `--text-lg`           | `1.125rem` | 18px | `text-lg`   |
| `--font-size-xl`   | `--text-xl`           | `1.25rem`  | 20px | `text-xl`   |
| `--font-size-2xl`  | `--text-2xl`          | `1.5rem`   | 24px | `text-2xl`  |
| `--font-size-3xl`  | `--text-3xl`          | `1.875rem` | 30px | `text-3xl`  |
| `--font-size-4xl`  | `--text-4xl`          | `2.25rem`  | 36px | `text-4xl`  |

---

### 2.3 Font Weight

The canonical name on `:root` is `--font-weight-regular`. The `@theme inline` block aliases it to `--font-weight-normal` so Tailwind's `font-normal` utility resolves.

| Token (`:root`)          | `@theme inline` alias    | Value | Tailwind        |
| ------------------------ | ------------------------ | ----- | --------------- |
| `--font-weight-light`    | `--font-weight-light`    | `300` | `font-light`    |
| `--font-weight-regular`  | `--font-weight-normal`   | `400` | `font-normal`   |
| `--font-weight-medium`   | `--font-weight-medium`   | `500` | `font-medium`   |
| `--font-weight-semibold` | `--font-weight-semibold` | `600` | `font-semibold` |
| `--font-weight-bold`     | `--font-weight-bold`     | `700` | `font-bold`     |

---

### 2.4 Line Height

| Token (`:root`)         | `@theme inline` alias | Value  | Tailwind          |
| ----------------------- | --------------------- | ------ | ----------------- |
| `--line-height-tight`   | `--leading-tight`     | `1.25` | `leading-tight`   |
| `--line-height-normal`  | `--leading-normal`    | `1.5`  | `leading-normal`  |
| `--line-height-relaxed` | `--leading-relaxed`   | `1.75` | `leading-relaxed` |

---

### 2.5 Typography Combinations (Common Patterns)

| Role              | Classes                                               |
| ----------------- | ----------------------------------------------------- |
| Page title        | `text-2xl font-bold text-neutral-900 leading-tight`   |
| Section heading   | `text-lg font-semibold text-neutral-800`              |
| Card title        | `text-base font-semibold text-neutral-900`            |
| Body text         | `text-sm font-normal text-neutral-700 leading-normal` |
| Supporting / meta | `text-xs text-neutral-500`                            |
| Label             | `text-sm font-medium text-neutral-700`                |
| Placeholder       | `text-sm text-neutral-400`                            |
| Error message     | `text-sm text-error`                                  |

---

## 3. Spacing

> Tailwind v4 ships a single `--spacing: 0.25rem` multiplier — `p-N` resolves to `N × 0.25rem`. Because the enumerated steps (1,2,3,4,5,6,8,10,12,16) match the 4px grid exactly, no per-step keys are needed in `@theme inline`. The `--spacing-N` vars on `:root` are kept for `var()` use in component CSS.

| Token (`:root`) | rem       | px   | Tailwind (padding/margin/gap) |
| --------------- | --------- | ---- | ----------------------------- |
| `--spacing-1`   | `0.25rem` | 4px  | `p-1` `m-1` `gap-1`           |
| `--spacing-2`   | `0.5rem`  | 8px  | `p-2` `m-2` `gap-2`           |
| `--spacing-3`   | `0.75rem` | 12px | `p-3` `m-3` `gap-3`           |
| `--spacing-4`   | `1rem`    | 16px | `p-4` `m-4` `gap-4`           |
| `--spacing-5`   | `1.25rem` | 20px | `p-5` `m-5` `gap-5`           |
| `--spacing-6`   | `1.5rem`  | 24px | `p-6` `m-6` `gap-6`           |
| `--spacing-8`   | `2rem`    | 32px | `p-8` `m-8` `gap-8`           |
| `--spacing-10`  | `2.5rem`  | 40px | `p-10` `m-10` `gap-10`        |
| `--spacing-12`  | `3rem`    | 48px | `p-12` `m-12` `gap-12`        |
| `--spacing-16`  | `4rem`    | 64px | `p-16` `m-16` `gap-16`        |

**Common layout values:**

- Card padding: `p-4` (mobile) / `p-6` (desktop)
- Section gap: `gap-5` or `gap-6`
- Form field gap: `gap-4`
- Icon-to-label gap: `gap-2`

---

## 4. Border Radius

In Tailwind v4 the bare `rounded` utility maps to `--radius-md` (not `--radius-base`). The `@theme inline` block aliases `--radius-md: var(--radius-base);` so both `rounded` and `rounded-md` resolve to 8px.

| Token (`:root`) | `@theme inline` alias | rem       | px   | Tailwind                 |
| --------------- | --------------------- | --------- | ---- | ------------------------ |
| `--radius-sm`   | `--radius-sm`         | `0.25rem` | 4px  | `rounded-sm`             |
| `--radius-base` | `--radius-md`         | `0.5rem`  | 8px  | `rounded` / `rounded-md` |
| `--radius-lg`   | `--radius-lg`         | `0.75rem` | 12px | `rounded-lg`             |
| `--radius-xl`   | `--radius-xl`         | `1rem`    | 16px | `rounded-xl`             |
| `--radius-2xl`  | `--radius-2xl`        | `1.5rem`  | 24px | `rounded-2xl`            |
| `--radius-full` | `--radius-full`       | `9999px`  | pill | `rounded-full`           |

**Usage guide:**
| Component | Radius |
|---|---|
| Button (sm/md) | `rounded` (8px) |
| Button (lg) | `rounded-lg` (12px) |
| Input | `rounded` (8px) |
| Card | `rounded-xl` (16px) |
| Badge / chip | `rounded-full` |
| Modal | `rounded-2xl` (24px) |
| Avatar | `rounded-full` |

---

## 5. Shadows

In Tailwind v4 the bare `shadow` utility maps to `--shadow-md`. The `@theme inline` block aliases `--shadow-md: var(--shadow-base);` so both `shadow` and `shadow-md` resolve to the same value.

| Token (`:root`) | `@theme inline` alias | Value                                                                   | Tailwind               |
| --------------- | --------------------- | ----------------------------------------------------------------------- | ---------------------- |
| `--shadow-sm`   | `--shadow-sm`         | `0 1px 2px 0 rgb(0 0 0 / 0.05)`                                         | `shadow-sm`            |
| `--shadow-base` | `--shadow-md`         | `0 1px 3px 0 rgb(0 0 0 / 0.10), 0 1px 2px -1px rgb(0 0 0 / 0.10)`       | `shadow` / `shadow-md` |
| `--shadow-lg`   | `--shadow-lg`         | `0 10px 15px -3px rgb(0 0 0 / 0.10), 0 4px 6px -4px rgb(0 0 0 / 0.10)`  | `shadow-lg`            |
| `--shadow-xl`   | `--shadow-xl`         | `0 20px 25px -5px rgb(0 0 0 / 0.10), 0 8px 10px -6px rgb(0 0 0 / 0.10)` | `shadow-xl`            |

**Usage guide:**
| Component | Shadow |
|---|---|
| Input (focus ring preferred) | none |
| Card (default) | `shadow-sm` |
| Card (elevated) | `shadow` |
| Dropdown / popover | `shadow-lg` |
| Modal | `shadow-xl` |

---

## 6. Z-Index

Z-index vars stay only on `:root` (no Tailwind v4 z-index namespace). Reference via `var()` in component CSS.

| Token          | Value | Layer                    |
| -------------- | ----- | ------------------------ |
| `--z-dropdown` | `100` | Dropdowns, tooltips      |
| `--z-sticky`   | `200` | Sticky headers, sidebars |
| `--z-overlay`  | `300` | Overlay backdrops        |
| `--z-modal`    | `400` | Modals, dialogs          |
| `--z-toast`    | `500` | Toast notifications      |

**CSS usage:**

```css
.dropdown {
  z-index: var(--z-dropdown);
}
.modal {
  z-index: var(--z-modal);
}
```

---

## 7. Layout

Layout dimensions stay only on `:root` (consumed via `var()` in component CSS or AntD `Layout` overrides).

| Token             | Value   | Usage                         |
| ----------------- | ------- | ----------------------------- |
| `--sidebar-width` | `260px` | Main navigation sidebar width |
| `--topbar-height` | `64px`  | Top navigation bar height     |

**Layout CSS example:**

```css
.main-content {
  margin-left: var(--sidebar-width);
  padding-top: var(--topbar-height);
}
```

---

## 8. Tailwind v4 `@theme inline` Block

Tailwind v4 has no `tailwind.config.ts` — configuration lives inside `app/globals.css` as a `@theme` directive. We use `@theme inline { ... }` (not bare `@theme`) so generated utility classes emit `background-color: var(--color-primary-500)` instead of the literal hex. This is what preserves **runtime theming** — overriding a `:root` var live in DevTools updates every utility instantly.

**Pattern:**

```css
@import "tailwindcss";

:root {
  --color-primary-500: #2e7d32; /* canonical value */
}

@theme inline {
  --color-primary-500: var(--color-primary-500); /* passes through as var() */
}
```

**Without `inline`:** Tailwind would inline `#2e7d32` into every `bg-primary-500` rule, and a runtime `:root` override would do nothing to those utilities.

The full mapping is in `app/globals.css`. Key namespace bridges:

| Domain        | Canonical (`:root`)     | Tailwind v4 namespace                |
| ------------- | ----------------------- | ------------------------------------ |
| Color         | `--color-*`             | `--color-*` (1:1)                    |
| Font family   | `--font-family-base`    | `--font-base`                        |
| Font size     | `--font-size-*`         | `--text-*`                           |
| Font weight   | `--font-weight-regular` | `--font-weight-normal`               |
| Line height   | `--line-height-*`       | `--leading-*`                        |
| Radius (base) | `--radius-base`         | `--radius-md`                        |
| Shadow (base) | `--shadow-base`         | `--shadow-md`                        |
| Spacing       | `--spacing-N`           | (use default `--spacing` multiplier) |

---

## 9. Ant Design 6 Theme Mapping

`lib/theme.ts` exports a `ThemeConfig` consumed by `<ConfigProvider>` in `app/layout.tsx`. AntD runs its color-derivation algorithm **server-side** during SSR and cannot resolve CSS variables — every value must be a **literal hex string** (or number).

| Token domain | AntD key               | Value (literal)         | Source design token                                                      |
| ------------ | ---------------------- | ----------------------- | ------------------------------------------------------------------------ |
| Brand        | `colorPrimary`         | `#2e7d32`               | `--color-primary-500`                                                    |
| Semantic     | `colorSuccess`         | `#16a34a`               | `--color-success`                                                        |
|              | `colorWarning`         | `#d97706`               | `--color-warning`                                                        |
|              | `colorError`           | `#dc2626`               | `--color-error`                                                          |
|              | `colorInfo`            | `#0284c7`               | `--color-info`                                                           |
| Surface      | `colorBgContainer`     | `#ffffff`               | `--color-surface`                                                        |
|              | `colorBgElevated`      | `#ffffff`               | `--color-surface-elevated`                                               |
|              | `colorBgLayout`        | `#f8fafc`               | `--color-background`                                                     |
| Text         | `colorText`            | `#0f172a`               | `--color-neutral-900`                                                    |
|              | `colorTextSecondary`   | `#475569`               | `--color-neutral-600`                                                    |
|              | `colorTextTertiary`    | `#64748b`               | `--color-neutral-500`                                                    |
|              | `colorTextQuaternary`  | `#94a3b8`               | `--color-neutral-400`                                                    |
| Border       | `colorBorder`          | `#e2e8f0`               | `--color-neutral-200`                                                    |
|              | `colorBorderSecondary` | `#f1f5f9`               | `--color-neutral-100`                                                    |
| Typography   | `fontFamily`           | `"Sarabun, sans-serif"` | `--font-family-base` (literal name resolves to next/font's `@font-face`) |
|              | `fontSize`             | `16`                    | `--font-size-base`                                                       |
|              | `lineHeight`           | `1.5`                   | `--line-height-normal`                                                   |
| Shape        | `borderRadius`         | `8`                     | `--radius-base`                                                          |
|              | `controlHeight`        | `40`                    | `--spacing-10`                                                           |
| Shadow       | `boxShadow`            | `--shadow-base` value   | `--shadow-base`                                                          |
|              | `boxShadowSecondary`   | `--shadow-sm` value     | `--shadow-sm`                                                            |

**Component-level overrides** (pin interaction states to design tokens — AntD's color algorithm would otherwise derive different hover/active shades from `colorPrimary`):

| Component | Override                                                                               |
| --------- | -------------------------------------------------------------------------------------- |
| `Button`  | `colorPrimaryHover: "#1b5e20"`, `colorPrimaryActive: "#145a18"`, `borderRadius: 8`     |
| `Layout`  | `siderBg: "#ffffff"`, `headerBg: "#ffffff"`, `headerHeight: 64`, `bodyBg: "#f8fafc"`   |
| `Menu`    | `itemSelectedBg: "#e8f5e9"` (primary-50), `itemSelectedColor: "#1b5e20"` (primary-600) |
| `Modal`   | `borderRadiusLG: 24`                                                                   |
| `Card`    | `borderRadiusLG: 16`                                                                   |

**Algorithm:** `algorithm: theme.defaultAlgorithm` (explicit — makes future dark-mode toggling intentional).

---

## 10. Sarabun Font Loading

Sarabun is loaded once via `next/font/google` in `app/layout.tsx`:

```ts
import { Sarabun } from "next/font/google";

const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sarabun",
  preload: true,
});

// Apply to <html> so the variable is available globally
<html lang="en" className={sarabun.variable}>
```

The bridge to design tokens happens inside `app/globals.css`'s `:root` block:

```css
:root {
  --font-family-base: var(--font-sarabun), sans-serif;
  --font-family-heading: var(--font-sarabun), sans-serif;
}

body {
  font-family: var(--font-family-base);
}
```

**Why a literal `"Sarabun, sans-serif"` works in AntD `fontFamily`:** next/font also injects an `@font-face` declaration whose `font-family` is the Google family name (`Sarabun`), so the literal string resolves to the same loaded font in the browser. The hashed `--font-sarabun` variable is the canonical handle for CSS/Tailwind use.

---

## 11. CSS Variable Quick Reference

```css
/* app/globals.css — full :root block */
:root {
  /* Primary */
  --color-primary-50: #e8f5e9;
  --color-primary-100: #c8e6c9;
  --color-primary-200: #a5d6a7;
  --color-primary-300: #81c784;
  --color-primary-400: #66bb6a;
  --color-primary-500: #2e7d32;
  --color-primary-600: #1b5e20;
  --color-primary-700: #145a18;
  --color-primary-900: #0a2e0b;

  /* Secondary */
  --color-secondary-50: #e0f2f1;
  --color-secondary-100: #b2dfdb;
  --color-secondary-500: #00897b;
  --color-secondary-600: #00695c;

  /* Neutral */
  --color-neutral-0: #ffffff;
  --color-neutral-50: #f8fafc;
  --color-neutral-100: #f1f5f9;
  --color-neutral-200: #e2e8f0;
  --color-neutral-300: #cbd5e1;
  --color-neutral-400: #94a3b8;
  --color-neutral-500: #64748b;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1e293b;
  --color-neutral-900: #0f172a;

  /* Semantic */
  --color-success: #16a34a;
  --color-success-light: #dcfce7;
  --color-warning: #d97706;
  --color-warning-light: #fef3c7;
  --color-error: #dc2626;
  --color-error-light: #fee2e2;
  --color-info: #0284c7;
  --color-info-light: #e0f2fe;

  /* Surface */
  --color-surface: #ffffff;
  --color-surface-elevated: #ffffff;
  --color-background: #f8fafc;

  /* Text role aliases */
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-disabled: #94a3b8;
  --color-text-inverse: #ffffff;

  /* Typography */
  --font-family-base: var(--font-sarabun), sans-serif;
  --font-family-heading: var(--font-sarabun), sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-base: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-lg:
    0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl:
    0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Z-Index */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;

  /* Layout */
  --sidebar-width: 260px;
  --topbar-height: 64px;
}
```

---

## 12. Rules for New Projects

1. **Copy `app/globals.css`** — the `:root` block + `@theme inline` block + body base rule travel together as the token system.
2. **No `tailwind.config.ts`** — Tailwind v4 is CSS-first. All token mapping happens in the `@theme inline` block inside `app/globals.css`. Adding a config file is wrong.
3. **Use `@theme inline`, never bare `@theme`** — `inline` makes utilities emit `var(...)` references so runtime `:root` overrides propagate. Bare `@theme` inlines literals at build time and breaks runtime theming.
4. **Copy `lib/theme.ts`** — the AntD `ThemeConfig` mirrors the design tokens with literal hex values (AntD runs server-side and can't resolve CSS vars).
5. **Load Sarabun via `next/font/google`** in `app/layout.tsx` with subsets `['latin', 'thai']`. Apply `className={sarabun.variable}` to `<html>`. The `--font-family-base` token bridges next/font's `--font-sarabun` to Tailwind's `font-base` utility.
6. **Never use arbitrary Tailwind values** for brand colors or spacing: `text-[#2e7d32]` → use `text-primary-500`.
7. **Only use semantic tokens** for status states (`success`, `warning`, `error`, `info`) — do not use green/yellow/red directly.
8. **Spacing scale is 4px-based** — stick to the defined steps (1, 2, 3, 4, 5, 6, 8, 10, 12, 16); avoid one-off pixel values.
9. **Pin interaction states at the component level in `lib/theme.ts`** — AntD's color algorithm derives hover/active from `colorPrimary` and will not match `primary-600`/`primary-700` unless explicitly overridden on `components.Button`.
10. **Dark mode (future):** override `:root` tokens inside `[data-theme="dark"]` in `app/globals.css`, and swap AntD `algorithm` to `theme.darkAlgorithm` at runtime. Not currently scaffolded.
