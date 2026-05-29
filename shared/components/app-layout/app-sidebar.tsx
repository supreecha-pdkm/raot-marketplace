"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { Drawer, Layout, Menu, type MenuProps } from "antd";

import type { Role } from "@/lib/casl";
import { cn } from "@/shared/utils";

import { isNavGroup, type NavEntry, type NavLeaf } from "./nav-config";

const { Sider } = Layout;

const SIDER_ID = "app-sidebar";

type AppSidebarProps = {
  role: Role;
  nav: NavEntry[];
  collapsed: boolean;
  mobile: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

function toLeafMenuItem(
  leaf: NavLeaf,
): NonNullable<MenuProps["items"]>[number] {
  const IconCmp = leaf.icon;
  return {
    key: leaf.key,
    icon: <IconCmp size={18} weight="regular" aria-hidden />,
    label: <Link href={leaf.href}>{leaf.label}</Link>,
  };
}

function buildMenuItems(nav: NavEntry[]): MenuProps["items"] {
  return nav.map((entry) => {
    if (isNavGroup(entry)) {
      return {
        type: "group",
        key: entry.key,
        label: entry.groupLabel,
        children: entry.items.map(toLeafMenuItem),
      };
    }
    return toLeafMenuItem(entry);
  });
}

function deriveSelectedKey(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return segments[1] ?? "dashboard";
}

function SidebarBrand({ collapsed, role }: { collapsed: boolean; role: Role }) {
  return (
    <Link
      href={`/${role}/dashboard`}
      className={cn(
        "flex h-14 items-center gap-3 border-b border-white/10 px-5 transition-all",
        collapsed && "justify-center px-2",
      )}
      aria-label="กลับสู่หน้าหลัก"
    >
      <Image
        src="/images/logo.png"
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-full object-contain"
        aria-hidden
        priority
      />
      {!collapsed && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-neutral-0 truncate text-sm font-bold">
            RAOT
          </span>
          <span className="text-primary-200/70 truncate text-[10px] tracking-wider">
            TRACEABILITY
          </span>
        </span>
      )}
    </Link>
  );
}

function SidebarBody({
  nav,
  selectedKey,
  collapsed,
  role,
  isDrawer,
}: {
  nav: NavEntry[];
  selectedKey: string;
  collapsed: boolean;
  role: Role;
  isDrawer: boolean;
}) {
  const items = useMemo(() => buildMenuItems(nav), [nav]);

  return (
    <div className="flex h-full flex-col">
      <SidebarBrand collapsed={collapsed} role={role} />

      <nav
        aria-label="เมนูหลัก"
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
      >
        <Menu
          theme="dark"
          mode="inline"
          items={items}
          selectedKeys={[selectedKey]}
          inlineCollapsed={!isDrawer && collapsed}
          inlineIndent={16}
          style={{ background: "transparent", borderInlineEnd: 0 }}
        />
      </nav>
    </div>
  );
}

export function AppSidebar({
  role,
  nav,
  collapsed,
  mobile,
  mobileOpen,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname();
  const selectedKey = useMemo(() => deriveSelectedKey(pathname), [pathname]);

  if (mobile) {
    return (
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={onMobileClose}
        size={260}
        closable={false}
        styles={{
          body: { padding: 0, background: "#0a2e0b" },
          section: { background: "#0a2e0b" },
        }}
        rootClassName="app-sidebar-drawer"
        aria-label="ระบบนำทาง"
      >
        <aside id={SIDER_ID} className="bg-primary-900 h-full">
          <SidebarBody
            nav={nav}
            selectedKey={selectedKey}
            collapsed={false}
            role={role}
            isDrawer
          />
        </aside>
      </Drawer>
    );
  }

  return (
    <Sider
      id={SIDER_ID}
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={240}
      collapsedWidth={72}
      theme="dark"
      className="bg-primary-900 !fixed inset-y-0 left-0 h-screen border-r border-white/10 shadow-lg"
      aria-label="ระบบนำทาง"
    >
      <SidebarBody
        nav={nav}
        selectedKey={selectedKey}
        collapsed={collapsed}
        role={role}
        isDrawer={false}
      />
    </Sider>
  );
}

export const APP_SIDEBAR_ID = SIDER_ID;
