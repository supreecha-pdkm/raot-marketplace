'use client';

import {
  createContext, createElement, useContext, useEffect, useState,
  type ReactNode,
} from 'react';
import type { ThemeConfig } from 'antd';

// ─── Scale options ─────────────────────────────────────────────────────────────
// One source of truth for both the provider and the header dropdown.

export const TEXT_SCALES = [
  { key: 'sm', label: 'เล็ก',     short: 'A−',  value: 0.875 },
  { key: 'md', label: 'ปกติ',     short: 'A',   value: 1 },
  { key: 'lg', label: 'ใหญ่',     short: 'A+',  value: 1.125 },
  { key: 'xl', label: 'ใหญ่มาก',  short: 'A++', value: 1.25 },
] as const;

export type TextScaleKey = typeof TEXT_SCALES[number]['key'];

const STORAGE_KEY = 'raot_text_scale';
const DEFAULT_KEY: TextScaleKey = 'md';

function readStoredKey(): TextScaleKey {
  if (typeof window === 'undefined') return DEFAULT_KEY;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return TEXT_SCALES.some((s) => s.key === v) ? (v as TextScaleKey) : DEFAULT_KEY;
}

function scaleOf(key: TextScaleKey): number {
  return TEXT_SCALES.find((s) => s.key === key)?.value ?? 1;
}

// ─── Context ───────────────────────────────────────────────────────────────────
// All consumers share one piece of state. The provider lives in the root
// layout so the AntD theme and every header instance read the same value.

interface TextScaleContextValue {
  key:    TextScaleKey;
  scale:  number;
  setKey: (k: TextScaleKey) => void;
}

const TextScaleContext = createContext<TextScaleContextValue | null>(null);

export function TextScaleProvider({ children }: { children: ReactNode }) {
  // SSR-safe: starts at 'md' on the server / first paint, then swaps to the
  // stored value after mount. The brief mismatch is acceptable — this is a
  // user preference, not visible content.
  const [key, setKey] = useState<TextScaleKey>(DEFAULT_KEY);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKey(readStoredKey());
  }, []);

  // Persist + mirror to a CSS variable so non-AntD code can opt in via
  // `font-size: calc(<base>px * var(--raot-text-scale))`.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, key);
    document.documentElement.style.setProperty('--raot-text-scale', String(scaleOf(key)));
  }, [key]);

  return createElement(
    TextScaleContext.Provider,
    { value: { key, scale: scaleOf(key), setKey } },
    children,
  );
}

export function useTextScale(): TextScaleContextValue {
  const ctx = useContext(TextScaleContext);
  if (!ctx) {
    // Defensive fallback so a stray consumer outside the provider doesn't crash.
    return { key: DEFAULT_KEY, scale: 1, setKey: () => {} };
  }
  return ctx;
}

// ─── Theme deriver ─────────────────────────────────────────────────────────────
// Multiplies every font-size token in the base theme by the current scale.
// AntD recomputes derived sizes from these, so the whole UI follows.

export function withTextScale(base: ThemeConfig, scale: number): ThemeConfig {
  if (scale === 1) return base;
  const scaled = (n: number | undefined) =>
    typeof n === 'number' ? Math.round(n * scale) : n;
  return {
    ...base,
    token: {
      ...base.token,
      fontSize:         scaled(base.token?.fontSize),
      fontSizeSM:       scaled(base.token?.fontSizeSM),
      fontSizeLG:       scaled(base.token?.fontSizeLG),
      fontSizeXL:       scaled(base.token?.fontSizeXL),
      fontSizeHeading1: scaled(base.token?.fontSizeHeading1),
      fontSizeHeading2: scaled(base.token?.fontSizeHeading2),
      fontSizeHeading3: scaled(base.token?.fontSizeHeading3),
      fontSizeHeading4: scaled(base.token?.fontSizeHeading4),
      fontSizeHeading5: scaled(base.token?.fontSizeHeading5),
    },
  };
}
