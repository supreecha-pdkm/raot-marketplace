'use client';

import { Layout, Menu, Drawer } from 'antd';
import {
  DashboardOutlined, UserOutlined, LogoutOutlined,
  BarChartOutlined, FileTextOutlined,
  DollarOutlined, CarOutlined, TeamOutlined,
  QrcodeOutlined, TrophyOutlined, SwapOutlined, CalendarOutlined,
  SafetyOutlined, AuditOutlined, CheckCircleOutlined, BankOutlined,
  DatabaseOutlined, ApartmentOutlined,
  AppstoreOutlined, NotificationOutlined, KeyOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/shared/types';
import { resolvePermissionsForUser } from '@/features/roles/services/permissions';
import { MASTER_ONLY_KEYS } from '@/features/roles/constants/menu-catalog';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function item(
  key: string,
  label: string,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return { key, label, icon, children, type } as MenuItem;
}

function group(label: string, children: MenuItem[]): MenuItem {
  return { type: 'group', label, children } as MenuItem;
}

/** Officer + master share the same URL root; buyer/seller keep their own. */
function officerBasePath(role: User['role']): string {
  if (role === 'buyer') return '/buyer';
  if (role === 'seller') return '/seller';
  return '/officer';
}

/** Filter menu items by the granted permission set. Groups whose children are
 *  all stripped are dropped. Dashboard is always retained even if not listed,
 *  so the user has somewhere to land. */
function filterByPermissions(items: MenuItem[], permissions: Set<string>): MenuItem[] {
  return items
    .map((it) => {
      if (!it) return it;
      // group node
      if ('type' in it && it.type === 'group') {
        const children = filterByPermissions((it.children ?? []) as MenuItem[], permissions);
        if (children.length === 0) return null;
        return { ...it, children } as MenuItem;
      }
      // leaf node
      const leaf = it as { key?: string; children?: MenuItem[] };
      if (leaf.children && leaf.children.length > 0) {
        // sub-menu — recurse
        const children = filterByPermissions(leaf.children, permissions);
        if (children.length === 0) return null;
        return { ...it, children } as MenuItem;
      }
      const key = String(leaf.key ?? '');
      return permissions.has(key) ? it : null;
    })
    .filter((x): x is MenuItem => x !== null);
}

/** Officer-side menu in catalog order. Filtered by the user's effective
 *  permission set (master sees everything; officer sees their Role's grants). */
const OFFICER_MENU: MenuItem[] = [
  item('dashboard', 'หน้าแรก', <DashboardOutlined />),
  group('บริหารจัดการ', [
    item('roles',            'จัดการ Role & Permission', <KeyOutlined />),
    item('officers',         'จัดการเจ้าหน้าที่',         <TeamOutlined />),
    item('auction-rounds',   'ตั้งค่ารอบประมูล',          <TrophyOutlined />),
    item('payment-settings', 'ตั้งค่าการชำระเงิน',        <BankOutlined />),
    item('opening-price',    'ราคาเปิดตลาด',             <BarChartOutlined />),
  ]),
  group('ข้อมูลหลัก', [
    item('master-panels', 'ข้อมูลแผง (Master)', <DatabaseOutlined />),
  ]),
  group('การจัดการยาง', [
    item('lot-registration',     'ลงทะเบียนยาง · เข้า', <QrcodeOutlined />),
    item('lot-registration-out', 'ลงทะเบียนยาง · ออก', <LogoutOutlined />),
    item('weighing',             'ชั่ง / คัดคุณภาพ',    <SafetyOutlined />),
    item('panels',               'จัดการแผง',           <TeamOutlined />),
  ]),
  group('การประมูล', [
    item('auction-control',  'ควบคุมการประมูล',                <TrophyOutlined />),
    item('announcements',    'ประกาศผู้ชนะ',                    <NotificationOutlined />),
    item('network-auctions', 'อนุมัติเปิดประมูล ณ เครือข่าย', <ApartmentOutlined />),
    item('forward',          'ตลาดล่วงหน้า',                    <CalendarOutlined />),
  ]),
  group('การซื้อขายและสัญญา', [
    item('negotiated', 'เจรจาต่อรอง (แทนผู้ซื้อ)', <SwapOutlined />),
    item('contracts',  'สัญญาซื้อขาย',              <FileTextOutlined />),
    item('delivery',   'ส่งมอบยาง',                 <CarOutlined />),
  ]),
  group('การเงิน', [
    item('payments', 'ชำระเงิน',                  <DollarOutlined />),
    item('workflow', 'ภาพรวม Workflow (4 Phase)', <AppstoreOutlined />),
  ]),
  group('การอนุมัติ', [
    item('approvals',     'อนุมัติผู้ซื้อ/ขาย ลำดับที่ 1', <CheckCircleOutlined />),
    item('approval',      'อนุมัติผู้ซื้อ/ขาย ลำดับที่ 2', <TeamOutlined />),
    item('approve-price', 'อนุมัติราคาเปิดตลาด',     <CheckCircleOutlined />),
  ]),
  group('รายงาน', [
    item('reports', 'รายงาน', <AuditOutlined />),
  ]),
];

function getMenuItems(user: User): MenuItem[] {
  const dashboard = item('dashboard', 'หน้าแรก', <DashboardOutlined />);

  if (user.role === 'buyer') {
    return [
      dashboard,
      group('การซื้อขาย', [
        item('auction',    'ประมูล (Auction)',       <TrophyOutlined />),
        item('negotiated', 'ตกลงราคา',               <SwapOutlined />),
        item('bid-ask',    'เสนอซื้อ/ขาย (Bid/Ask)', <BarChartOutlined />),
        item('forward',    'ตลาดล่วงหน้า',            <CalendarOutlined />),
      ]),
      group('สัญญาและการเงิน', [
        item('contracts', 'สัญญาซื้อขาย', <FileTextOutlined />),
        item('payment',   'ชำระเงิน',     <DollarOutlined />),
        item('delivery',  'รับมอบยาง',    <CarOutlined />),
      ]),
      group('บัญชี', [
        item('profile', 'ข้อมูลส่วนตัว', <UserOutlined />),
      ]),
    ];
  }

  if (user.role === 'seller') {
    return [
      dashboard,
      group('การซื้อขาย', [
        item('negotiated', 'ตกลงราคา',               <SwapOutlined />),
        item('bid-ask',    'เสนอซื้อ/ขาย (Bid/Ask)', <BarChartOutlined />),
        item('forward',    'ตลาดล่วงหน้า',            <CalendarOutlined />),
      ]),
      group('การขาย', [
        item('qr-code',      'Dynamic QR Code',       <QrcodeOutlined />),
        item('transactions', 'ประวัติธุรกรรม',          <SwapOutlined />),
        item('quota',        'ปริมาณผลผลิต (Quota)',   <BarChartOutlined />),
        item('agreements',   'ข้อตกลงซื้อขาย',         <FileTextOutlined />),
        item('contracts',    'สัญญาซื้อขาย',           <FileTextOutlined />),
      ]),
      group('บัญชี', [
        item('profile', 'ข้อมูลส่วนตัว', <UserOutlined />),
      ]),
    ];
  }

  // Officer + Master share the catalog. Master sees every key; officers see
  // their Role's grants (Dashboard implicit, master-only keys hidden for
  // non-masters).
  const perms = resolvePermissionsForUser(user);
  const allowed = new Set<string>([...perms, 'dashboard']);
  if (user.role !== 'master') {
    for (const k of MASTER_ONLY_KEYS) allowed.delete(k);
  }
  return filterByPermissions(OFFICER_MENU, allowed);
}

interface SidebarProps {
  user: User;
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  mobile?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

/** Reusable inner content for both Sider (desktop) and Drawer (mobile). */
function SidebarBody({
  user,
  collapsed,
  isDrawer,
  onNavigate,
}: {
  user: User;
  collapsed: boolean;
  isDrawer: boolean;
  onNavigate: (key: string) => void;
}) {
  const pathname = usePathname();
  const selectedKey = pathname.split('/')[2] || 'dashboard';

  // In drawer mode we always render the expanded layout (no collapsed mode).
  const showLabels = isDrawer || !collapsed;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Logo ─────────────────────────────────────── */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: showLabels ? 'flex-start' : 'center',
          padding: showLabels ? '0 20px' : 0,
          gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="RAOT"
          width={32}
          height={32}
          style={{
            flexShrink: 0,
            background: '#fff',
            borderRadius: '50%',
            padding: 2,
            objectFit: 'contain',
          }}
        />
        {showLabels && (
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>RAOT</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, letterSpacing: '0.5px' }}>TRACEABILITY</div>
          </div>
        )}
      </div>

      {/* ── Navigation menu ──────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
        <Menu
          theme="dark"
          mode="inline"
          inlineCollapsed={!isDrawer && collapsed}
          selectedKeys={[selectedKey]}
          onClick={({ key }) => onNavigate(key)}
          items={getMenuItems(user)}
          inlineIndent={16}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: 13,
          }}
        />
      </div>

    </div>
  );
}

export default function AppSidebar({
  user, collapsed, onCollapse,
  mobile = false, mobileOpen = false, onMobileClose,
}: SidebarProps) {
  const router = useRouter();
  const basePath = officerBasePath(user.role);

  const handleNavigate = (key: string) => {
    router.push(`${basePath}/${key}`);
    if (mobile) onMobileClose?.();
  };

  // ── Mobile: render as Drawer ───────────────────────────
  if (mobile) {
    return (
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={onMobileClose}
        closable={false}
        styles={{
          body:    { padding: 0, background: '#0f3d22' },
          wrapper: { width: 260, boxShadow: '2px 0 12px rgba(0,0,0,0.25)' },
        }}
        rootStyle={{ zIndex: 1100 }}
      >
        <SidebarBody
          user={user}
          collapsed={false}
          isDrawer
          onNavigate={handleNavigate}
        />
      </Drawer>
    );
  }

  // ── Desktop: render as fixed Sider ─────────────────────
  // `collapsed` is still wired so the header's MenuFold button can fold/unfold
  // the rail; we just don't render the auto-trigger at the bottom anymore.
  return (
    <Sider
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      width={240}
      collapsedWidth={72}
      style={{
        background: '#0f3d22',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        height: '100vh',
        overflow: 'hidden',
        zIndex: 100,
      }}
    >
      <SidebarBody
        user={user}
        collapsed={collapsed}
        isDrawer={false}
        onNavigate={handleNavigate}
      />
    </Sider>
  );
}
