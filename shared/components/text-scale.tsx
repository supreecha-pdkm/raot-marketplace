"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { ThemeConfig } from "antd";

export const TEXT_SCALES = [
  { key: "sm", label: "เล็ก", short: "A−", value: 0.875 },
  { key: "md", label: "ปกติ", short: "A", value: 1 },
  { key: "lg", label: "ใหญ่", short: "A+", value: 1.125 },
  { key: "xl", label: "ใหญ่มาก", short: "A++", value: 1.25 },
] as const;

export type TextScaleKey = (typeof TEXT_SCALES)[number]["key"];

const STORAGE_KEY = "raot_text_scale";
const DEFAULT_KEY: TextScaleKey = "md";

function readStoredKey(): TextScaleKey {
  if (typeof window === "undefined") return DEFAULT_KEY;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return TEXT_SCALES.some((s) => s.key === v) ? (v as TextScaleKey) : DEFAULT_KEY;
}

function scaleOf(key: TextScaleKey): number {
  return TEXT_SCALES.find((s) => s.key === key)?.value ?? 1;
}

type TextScaleContextValue = {
  key: TextScaleKey;
  scale: number;
  setKey: (k: TextScaleKey) => void;
};

const TextScaleContext = createContext<TextScaleContextValue | null>(null);

export function TextScaleProvider({ children }: { children: ReactNode }) {
  const [key, setKey] = useState<TextScaleKey>(DEFAULT_KEY);

  useEffect(() => {
    setKey(readStoredKey());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, key);
    document.documentElement.style.setProperty(
      "--raot-text-scale",
      String(scaleOf(key)),
    );
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
    return { key: DEFAULT_KEY, scale: 1, setKey: () => {} };
  }
  return ctx;
}

export function withTextScale(base: ThemeConfig, scale: number): ThemeConfig {
  if (scale === 1) return base;
  const scaled = (n: number | undefined) =>
    typeof n === "number" ? Math.round(n * scale) : n;
  return {
    ...base,
    token: {
      ...base.token,
      fontSize: scaled(base.token?.fontSize),
      fontSizeSM: scaled(base.token?.fontSizeSM),
      fontSizeLG: scaled(base.token?.fontSizeLG),
      fontSizeXL: scaled(base.token?.fontSizeXL),
      fontSizeHeading1: scaled(base.token?.fontSizeHeading1),
      fontSizeHeading2: scaled(base.token?.fontSizeHeading2),
      fontSizeHeading3: scaled(base.token?.fontSizeHeading3),
      fontSizeHeading4: scaled(base.token?.fontSizeHeading4),
      fontSizeHeading5: scaled(base.token?.fontSizeHeading5),
    },
    components: {
      ...base.components,
      Menu: {
        ...base.components?.Menu,
        fontSize: scaled(base.components?.Menu?.fontSize),
      },
      Breadcrumb: {
        ...base.components?.Breadcrumb,
        fontSize: scaled(base.components?.Breadcrumb?.fontSize),
      },
    },
  };
}
