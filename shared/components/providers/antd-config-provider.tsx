"use client";

import { type ReactNode } from "react";

import { ConfigProvider } from "antd";

import theme from "@/lib/theme";
import { useTextScale, withTextScale } from "@/shared/components/text-scale";

type Props = {
  children: ReactNode;
};

export function AntdConfigProvider({ children }: Props) {
  const { scale } = useTextScale();
  return (
    <ConfigProvider theme={withTextScale(theme, scale)}>
      {children}
    </ConfigProvider>
  );
}
