"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

import { signOut } from "next-auth/react";
import { useLocale } from "next-intl";

import {
  Badge,
  Breadcrumb,
  Dropdown,
  type MenuProps,
  Tag,
  Tooltip,
} from "antd";
import {
  BellIcon,
  CheckIcon,
  GearIcon,
  GlobeIcon,
  ListIcon,
  SignOutIcon,
  TextAaIcon,
  UserIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";

import {
  TEXT_SCALES,
  type TextScaleKey,
  useTextScale,
} from "@/shared/components/text-scale";

import type { Role } from "@/lib/casl";
import { cn } from "@/shared/utils";

import { ROLE_LABEL, getNavForRole, isNavGroup } from "./nav-config";
import { APP_SIDEBAR_ID } from "./app-sidebar";

type AppHeaderProps = {
  role: Role;
  pageTitle?: string;
  mobile: boolean;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
};

type MockNotification = {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
};

const LANGUAGE_OPTIONS = [
  { key: "th", label: "ภาษาไทย", short: "TH" },
  { key: "en", label: "English", short: "EN" },
] as const;

const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: "1",
    title: "คำสั่งซื้อใหม่",
    message: "มีคำสั่งซื้อยางพาราจากผู้ซื้อรายใหม่",
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: "2",
    title: "การชำระเงินสำเร็จ",
    message: "การชำระเงินสำหรับสัญญา #A2024-001 เสร็จสมบูรณ์",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: "3",
    title: "อัปเดตสถานะการส่งมอบ",
    message: "ยางพาราล็อต #B-889 ได้รับการยืนยันการส่งมอบแล้ว",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
  },
];

const ACTION_BTN_CLS =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-primary-500";

function formatTimeAgo(date: Date): string {
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  return `${Math.floor(diffHours / 24)} วันที่แล้ว`;
}

function useBreadcrumb(role: Role, pageTitle?: string) {
  const pathname = usePathname();
  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const nav = getNavForRole(role);
    const labelMap = new Map<string, string>();
    const leaves = nav.flatMap((entry) =>
      isNavGroup(entry) ? entry.items : [entry],
    );
    for (const leaf of leaves) {
      labelMap.set(leaf.key, leaf.label);
    }

    const items: { key: string; title: string }[] = [
      { key: "role", title: ROLE_LABEL[role] },
    ];

    const parent = segments[1];
    if (parent) {
      items.push({ key: parent, title: labelMap.get(parent) ?? parent });
    }
    if (pageTitle) {
      items.push({ key: "page-title", title: pageTitle });
    }

    return items.map(({ key, title }) => ({ key, title }));
  }, [pathname, role, pageTitle]);
}

export function AppHeader({
  role,
  pageTitle,
  mobile,
  collapsed,
  mobileOpen,
  onToggle,
}: AppHeaderProps) {
  const breadcrumbs = useBreadcrumb(role, pageTitle);
  const expanded = mobile ? mobileOpen : !collapsed;
  const locale = useLocale();
  const router = useRouter();
  const { key: scaleKey, setKey: setScaleKey } = useTextScale();

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
  const localeShort =
    LANGUAGE_OPTIONS.find((l) => l.key === locale)?.short ?? "TH";

  // ── Language ──────────────────────────────────────────────
  const languageItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "lang-header",
        label: (
          <span className="block w-52 py-0.5 text-xs font-semibold text-neutral-900">
            ภาษา / Language
          </span>
        ),
        disabled: true,
      },
      { type: "divider" },
      ...LANGUAGE_OPTIONS.map((l) => ({
        key: l.key,
        label: (
          <span className="flex w-52 items-center justify-between">
            <span
              className={cn(
                "flex items-center gap-2 text-sm",
                locale === l.key
                  ? "text-primary-700 font-semibold"
                  : "text-neutral-700",
              )}
            >
              <GlobeIcon size={14} aria-hidden />
              {l.label}
            </span>
            {locale === l.key && (
              <CheckIcon size={12} className="text-primary-600" aria-hidden />
            )}
          </span>
        ),
      })),
    ],
    [locale],
  );

  function handleLocaleClick({ key }: { key: string }) {
    if (LANGUAGE_OPTIONS.some((l) => l.key === key)) {
      document.cookie = `NEXT_LOCALE=${key};path=/;max-age=31536000`;
      router.refresh();
    }
  }

  // ── TextScale ─────────────────────────────────────────────
  const textScaleItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "scale-header",
        label: (
          <span className="block w-52 py-0.5 text-xs font-semibold text-neutral-900">
            ขนาดตัวอักษร
          </span>
        ),
        disabled: true,
      },
      { type: "divider" },
      ...TEXT_SCALES.map((s) => ({
        key: s.key,
        label: (
          <span className="flex w-52 items-center justify-between">
            <span
              className={cn(
                "text-sm",
                scaleKey === s.key
                  ? "text-primary-700 font-semibold"
                  : "text-neutral-700",
              )}
            >
              <span className="mr-2 text-xs text-neutral-400">{s.short}</span>
              {s.label}
            </span>
            {scaleKey === s.key && (
              <CheckIcon size={12} className="text-primary-600" aria-hidden />
            )}
          </span>
        ),
      })),
    ],
    [scaleKey],
  );

  function handleScaleClick({ key }: { key: string }) {
    if (TEXT_SCALES.some((s) => s.key === key)) {
      setScaleKey(key as TextScaleKey);
    }
  }

  // ── Notification ──────────────────────────────────────────
  const notificationItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "notif-header",
        label: (
          <span className="flex w-72 items-center justify-between py-0.5">
            <span className="text-xs font-semibold text-neutral-900">
              การแจ้งเตือน
            </span>
            {unreadCount > 0 && (
              <Tag color="red" className="m-0! text-xs!">
                {unreadCount} ใหม่
              </Tag>
            )}
          </span>
        ),
        disabled: true,
      },
      { type: "divider" },
      ...MOCK_NOTIFICATIONS.map((n) => ({
        key: n.id,
        label: (
          <span className="flex w-72 items-start gap-3 py-1">
            <span
              className={cn(
                "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                n.read ? "bg-neutral-300" : "bg-primary-500",
              )}
            />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span
                className={cn(
                  "text-sm",
                  n.read
                    ? "font-normal text-neutral-600"
                    : "font-semibold text-neutral-900",
                )}
              >
                {n.title}
              </span>
              <span className="text-xs text-neutral-500">{n.message}</span>
              <span className="text-xs text-neutral-400">
                {formatTimeAgo(n.createdAt)}
              </span>
            </span>
          </span>
        ),
      })),
      { type: "divider" },
      {
        key: "notif-all",
        label: (
          <span className="text-primary-600 block w-72 py-0.5 text-center text-sm font-medium">
            ดูการแจ้งเตือนทั้งหมด
          </span>
        ),
      },
    ],
    [unreadCount],
  );

  // ── UserMenu ──────────────────────────────────────────────
  const userMenuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "user-info",
        label: (
          <span className="flex w-52 flex-col gap-1 py-0.5">
            <span className="text-xs font-semibold text-neutral-900">
              ผู้ใช้งาน
            </span>
            <Tag
              color={role === "buyer" ? "blue" : "green"}
              className="m-0! w-fit! text-xs!"
            >
              {ROLE_LABEL[role]}
            </Tag>
          </span>
        ),
        disabled: true,
      },
      { type: "divider" },
      {
        key: "profile",
        label: (
          <span className="flex w-52 items-center gap-2 text-sm text-neutral-700">
            <UserIcon size={14} aria-hidden />
            ข้อมูลส่วนตัว
          </span>
        ),
      },
      {
        key: "settings",
        label: (
          <span className="flex w-52 items-center gap-2 text-sm text-neutral-700">
            <GearIcon size={14} aria-hidden />
            ตั้งค่า
          </span>
        ),
      },
      { type: "divider" },
      {
        key: "logout",
        danger: true,
        label: (
          <span className="flex w-52 items-center gap-2 text-sm">
            <SignOutIcon size={14} aria-hidden />
            ออกจากระบบ
          </span>
        ),
      },
    ],
    [role],
  );

  function handleUserMenuClick({ key }: { key: string }) {
    if (key === "logout") {
      signOut({ redirectTo: "/login" });
    }
  }

  return (
    <header
      role="banner"
      className="bg-surface sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-neutral-200 px-3 shadow-sm md:px-6"
    >
      {/* Left: toggle + breadcrumb */}
      <div className="flex min-w-0 items-center gap-2 md:gap-4">
        <Tooltip
          title={mobile ? "เมนู" : expanded ? "ย่อเมนู" : "ขยายเมนู"}
        >
          <button
            type="button"
            onClick={onToggle}
            aria-label={expanded ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={expanded}
            aria-controls={APP_SIDEBAR_ID}
            className={ACTION_BTN_CLS}
          >
            {mobile && mobileOpen ? (
              <XIcon size={20} aria-hidden />
            ) : (
              <ListIcon size={20} aria-hidden />
            )}
          </button>
        </Tooltip>

        <nav aria-label="เส้นทางหน้า" className="hidden min-w-0 md:block">
          <Breadcrumb
            items={breadcrumbs.map(({ key, title }) => ({ key, title }))}
          />
        </nav>

        {pageTitle && (
          <h1 className="truncate text-base font-semibold text-neutral-900 md:hidden">
            {pageTitle}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {/* Language */}
        <Dropdown
          menu={{ items: languageItems, onClick: handleLocaleClick }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Tooltip title="เลือกภาษา">
            <button
              type="button"
              aria-label="เลือกภาษา"
              aria-haspopup="menu"
              className={cn(
                ACTION_BTN_CLS,
                "hidden w-auto gap-1.5 px-2 md:inline-flex",
              )}
            >
              <GlobeIcon size={18} aria-hidden />
              <span className="text-xs font-medium">{localeShort}</span>
            </button>
          </Tooltip>
        </Dropdown>

        {/* TextScale */}
        <Dropdown
          menu={{ items: textScaleItems, onClick: handleScaleClick }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Tooltip title="ปรับขนาดตัวอักษร">
            <button
              type="button"
              aria-label="ปรับขนาดตัวอักษร"
              aria-haspopup="menu"
              className={ACTION_BTN_CLS}
            >
              <TextAaIcon size={20} aria-hidden />
            </button>
          </Tooltip>
        </Dropdown>

        {/* Notification */}
        <Dropdown
          menu={{ items: notificationItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Tooltip title="การแจ้งเตือน">
            <button
              type="button"
              aria-label="การแจ้งเตือน"
              aria-haspopup="menu"
              className={ACTION_BTN_CLS}
            >
              <Badge count={unreadCount} size="small" offset={[-2, 4]}>
                <BellIcon size={20} aria-hidden />
              </Badge>
            </button>
          </Tooltip>
        </Dropdown>

        {/* UserMenu */}
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Tooltip title="เมนูผู้ใช้">
            <button
              type="button"
              aria-label="เมนูผู้ใช้"
              aria-haspopup="menu"
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-md px-2 text-neutral-700 transition-colors hover:bg-neutral-100",
                "focus-visible:outline-primary-500 focus-visible:outline-2",
              )}
            >
              <span className="hidden flex-col items-start leading-tight md:flex">
                <span className="text-sm font-medium text-neutral-900">
                  ผู้ใช้งาน
                </span>
                <Tag
                  color={role === "buyer" ? "blue" : "green"}
                  className="m-0! text-xs!"
                >
                  {ROLE_LABEL[role]}
                </Tag>
              </span>
            </button>
          </Tooltip>
        </Dropdown>
      </div>
    </header>
  );
}
