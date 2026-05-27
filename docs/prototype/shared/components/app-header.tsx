'use client';

import { Layout, Badge, Dropdown, Tag, Typography, Space, Tooltip, Button, Breadcrumb } from 'antd';
import {
  BellOutlined, UserOutlined, LogoutOutlined, SettingOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, GlobalOutlined, CheckOutlined,
  FontSizeOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { logout } from '@/features/auth/services/auth';
import { User, ROLE_LABELS } from '@/shared/types';
import { MOCK_NOTIFICATIONS } from '@/features/notifications/services/mock-notifications';
import { useTextScale, TEXT_SCALES } from '@/shared/components/text-scale';
import dayjs from 'dayjs';

const { Header } = Layout;
const { Text } = Typography;

/* ── Breadcrumb label map ─────────────────────────────── */
const PAGE_LABELS: Record<string, string> = {
  dashboard:                 'หน้าแรก',
  // Officer side — every key must appear in features/roles/menu-catalog.ts
  roles:                     'Role & Permission',
  officers:                  'จัดการเจ้าหน้าที่',
  'auction-rounds':          'ตั้งค่ารอบประมูล',
  'payment-settings':        'ตั้งค่าการชำระเงิน',
  'opening-price':           'ราคาเปิดตลาด',
  'master-panels':           'ข้อมูลแผง (Master)',
  'lot-registration':        'ลงทะเบียนยาง · เข้า',
  'lot-registration-out':    'ลงทะเบียนยาง · ออก',
  weighing:                  'ชั่ง / คัดคุณภาพ',
  panels:                    'จัดการแผง',
  'auction-control':         'ควบคุมการประมูล',
  announcements:             'ประกาศผู้ชนะ',
  'network-auctions':        'อนุมัติเปิดประมูล ณ เครือข่าย',
  negotiated:                'เจรจาต่อรอง / ตกลงราคา',
  forward:                   'ตลาดล่วงหน้า',
  contracts:                 'สัญญาซื้อขาย',
  approvals:                 'อนุมัติผู้ซื้อ/ขาย ลำดับที่ 1',
  approval:                  'อนุมัติผู้ซื้อ/ขาย ลำดับที่ 2',
  delivery:                  'ส่งมอบยาง',
  payments:                  'ชำระเงิน',
  payment:                   'ชำระเงิน',
  workflow:                  'Workflow การเงิน (4 Phase)',
  'approve-price':           'อนุมัติราคาเปิดตลาด',
  reports:                   'รายงาน',
  // Buyer/Seller pages
  auction:                   'ประมูล (Auction)',
  'bid-ask':                 'เสนอซื้อ/ขาย',
  profile:                   'ข้อมูลส่วนตัว',
  'qr-code':                 'Dynamic QR Code',
  transactions:              'ประวัติธุรกรรม',
  quota:                     'ปริมาณผลผลิต',
  agreements:                'ข้อตกลงซื้อขาย',
  sellers:                   'ข้อมูลผู้ขาย',
  // Role-bucket labels (URL prefixes)
  buyer:                     'ผู้ซื้อ',
  seller:                    'ผู้ขาย',
  officer:                   'เจ้าหน้าที่',
};

interface AppHeaderProps {
  user: User;
  collapsed: boolean;
  onToggle: () => void;
  pageTitle?: string;
  mobile?: boolean;
}

export default function AppHeader({ user, collapsed, onToggle, mobile = false }: AppHeaderProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const roleLabel = ROLE_LABELS[user.role];
  const unread    = MOCK_NOTIFICATIONS.filter(n => !n.read);

  // Text-scaling
  const { key: scaleKey, setKey: setScaleKey } = useTextScale();
  const textScaleItems: MenuProps['items'] = [
    {
      key: 'header',
      label: (
        <div style={{ width: 200, padding: '4px 0', fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
          ขนาดตัวอักษร
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    ...TEXT_SCALES.map((s) => ({
      key: s.key,
      label: (
        <div style={{ width: 200, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: scaleKey === s.key ? 600 : 400, color: scaleKey === s.key ? '#1a7c3e' : '#1a1a2e' }}>
            <span style={{ marginRight: 8, color: '#8c8c8c' }}>{s.short}</span>
            {s.label}
          </span>
          {scaleKey === s.key && <CheckOutlined style={{ color: '#1a7c3e', fontSize: 12 }} />}
        </div>
      ),
    })),
  ];
  const handleScaleClick: MenuProps['onClick'] = ({ key }) => {
    if (TEXT_SCALES.some((s) => s.key === key)) {
      setScaleKey(key as typeof scaleKey);
    }
  };

  /* ── Breadcrumb items from pathname ─────────────────── */
  const segments = pathname.split('/').filter(Boolean); // e.g. ['buyer', 'auction']
  // On mobile: show only the current page (last segment) as a single label
  const visibleSegments = mobile ? segments.slice(-1) : segments;
  const segmentOffset = segments.length - visibleSegments.length;
  const breadcrumbItems = visibleSegments.map((seg, idx) => {
    const absoluteIdx = idx + segmentOffset;
    return {
      title: PAGE_LABELS[seg] ?? seg,
      ...(absoluteIdx < segments.length - 1
        ? { onClick: () => router.push('/' + segments.slice(0, absoluteIdx + 1).join('/')), className: 'cursor-pointer' }
        : {}),
    };
  });

  /* ── Notification popover content ───────────────────── */
  const notifDropdown: MenuProps['items'] = [
    {
      key: 'header',
      label: (
        <div style={{ width: 300, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
          <Text strong style={{ fontSize: 14 }}>การแจ้งเตือน</Text>
          {unread.length > 0 && (
            <Tag color="red" style={{ margin: 0, fontSize: 11 }}>{unread.length} ใหม่</Tag>
          )}
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    ...MOCK_NOTIFICATIONS.slice(0, 5).map(n => ({
      key: n.id,
      label: (
        <div style={{ width: 300, padding: '6px 0', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div
            style={{
              width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
              background: n.read ? '#d9d9d9' : '#1677ff',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: n.read ? 400 : 600, fontSize: 13, color: '#1a1a2e' }}>{n.title}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{n.message}</div>
            <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 4 }}>
              {dayjs(n.createdAt).format('DD/MM/YY HH:mm')}
            </div>
          </div>
          {!n.read && (
            <Tooltip title="ทำเครื่องหมายว่าอ่านแล้ว">
              <CheckOutlined style={{ fontSize: 11, color: '#1677ff', marginTop: 4 }} />
            </Tooltip>
          )}
        </div>
      ),
    })),
    { type: 'divider' },
    {
      key: 'all',
      label: (
        <div style={{ textAlign: 'center', color: '#1a7c3e', fontSize: 13, fontWeight: 500 }}>
          ดูการแจ้งเตือนทั้งหมด
        </div>
      ),
    },
  ];

  /* ── User dropdown ───────────────────────────────────── */
  const userItems: MenuProps['items'] = [
    {
      key: 'info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>{user.fullName}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{user.email}</div>
          <Tag color={roleLabel.color} style={{ marginTop: 6, fontSize: 11 }}>{roleLabel.th}</Tag>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    { key: 'profile',  icon: <UserOutlined />,   label: 'ข้อมูลส่วนตัว' },
    { key: 'settings', icon: <SettingOutlined />, label: 'ตั้งค่า' },
    { type: 'divider' },
    { key: 'logout',   icon: <LogoutOutlined />,  label: 'ออกจากระบบ', danger: true },
  ];

  const handleUserMenu: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout')  { logout(); router.push('/login'); }
    if (key === 'profile') router.push(`/${user.role.replace('_', '-')}/profile`);
  };

  return (
    <Header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #f0f0f0',
        height: 56,
        padding: mobile ? '0 12px' : '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        gap: 8,
      }}
    >
      {/* ── Left: toggle + breadcrumb ──────────────────── */}
      <Space size={mobile ? 6 : 12} align="center" style={{ minWidth: 0, flex: 1 }}>
        <Tooltip title={mobile ? 'เมนู' : (collapsed ? 'ขยายเมนู' : 'ย่อเมนู')}>
          <Button
            type="text"
            icon={mobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={onToggle}
            style={{ color: '#595959', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          />
        </Tooltip>

        {breadcrumbItems.length > 0 && (
          <Breadcrumb
            items={breadcrumbItems}
            style={{
              fontSize: 13,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          />
        )}
      </Space>

      {/* ── Right: lang + notifications + avatar ──────── */}
      <Space size={mobile ? 0 : 4} align="center" style={{ flexShrink: 0 }}>
        {/* Language switcher — hidden on mobile to save space */}
        {!mobile && (
          <Tooltip title="เลือกภาษา">
            <Button
              type="text"
              icon={<GlobalOutlined />}
              style={{ color: '#595959', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              TH
            </Button>
          </Tooltip>
        )}

        {/* Text size */}
        <Dropdown
          menu={{ items: textScaleItems, onClick: handleScaleClick }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Tooltip title="ปรับขนาดตัวอักษร">
            <Button
              type="text"
              icon={<FontSizeOutlined style={{ fontSize: 16 }} />}
              style={{ color: '#595959', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          </Tooltip>
        </Dropdown>

        {/* Notifications */}
        <Dropdown
          menu={{ items: notifDropdown }}
          trigger={['click']}
          placement="bottomRight"
          styles={{ root: { minWidth: 320 } }}
        >
          <Badge count={unread.length} size="small" offset={[-4, 4]}>
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: 18 }} />}
              style={{ color: '#595959', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          </Badge>
        </Dropdown>

        {/* User avatar dropdown */}
        <Dropdown
          menu={{ items: userItems, onClick: handleUserMenu }}
          trigger={['click']}
          placement="bottomRight"
          styles={{ root: { minWidth: 220 } }}
        >
          <Button
            type="text"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              height: 40, padding: mobile ? '0 4px' : '0 8px', color: '#1a1a2e',
            }}
          >
            {mobile ? (
              // No more avatar — show a neutral user icon so the dropdown
              // still has a tappable target on small screens.
              <UserOutlined style={{ fontSize: 18, color: '#595959' }} />
            ) : (
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0, maxWidth: 160, lineHeight: 1.15 }}>
                <span style={{ fontSize: 13, fontWeight: 500, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.fullName}
                </span>
                <span style={{ color: roleLabel.color, fontSize: 11, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {roleLabel.th}
                </span>
              </span>
            )}
          </Button>
        </Dropdown>
      </Space>
    </Header>
  );
}
