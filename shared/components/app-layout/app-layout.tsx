"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";

import { Grid, Layout } from "antd";

import type { Role } from "@/lib/casl";
import { cn } from "@/shared/utils";

import { getNavForRole } from "./nav-config";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

const { Content } = Layout;

type AppLayoutProps = {
  role: Role;
  pageTitle?: string;
  children: ReactNode;
};

export function AppLayout({ role, pageTitle, children }: AppLayoutProps) {
  const screens = Grid.useBreakpoint();
  const pathname = usePathname();
  const isMobile = !screens.md;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  // TODO: replace render-phase setState with useEffect for mobileOpen reset
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  const nav = useMemo(() => getNavForRole(role), [role]);

  const handleToggle = () => {
    if (isMobile) setMobileOpen((v) => !v);
    else setCollapsed((v) => !v);
  };

  const desktopSiderWidth = collapsed ? 72 : 240;
  const contentOffsetClass = isMobile ? "ml-0" : "";

  return (
    <Layout className="bg-background min-h-screen">
      <AppSidebar
        role={role}
        nav={nav}
        collapsed={collapsed}
        mobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Layout
        className={cn(
          "bg-background transition-[margin] duration-200",
          contentOffsetClass,
        )}
        style={isMobile ? undefined : { marginInlineStart: desktopSiderWidth }}
      >
        <AppHeader
          role={role}
          pageTitle={pageTitle}
          mobile={isMobile}
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggle={handleToggle}
        />

        <Content className="bg-background p-3 md:p-6">
          <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto w-full max-w-7xl focus-visible:outline-none"
          >
            {children}
          </main>
        </Content>
      </Layout>
    </Layout>
  );
}
