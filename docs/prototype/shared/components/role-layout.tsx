'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Layout, Spin, Grid, App } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { consumeSession, refreshSession, logout } from '@/features/auth/services/auth';
import { resolvePermissionsForUser } from '@/features/roles/services/permissions';
import { DASHBOARD_KEY } from '@/features/roles/constants/menu-catalog';
import { User, UserRole } from '@/shared/types';
import AppSidebar from './app-sidebar';
import AppHeader from './app-header';

const { Content } = Layout;

// localStorage keys that, when mutated in another tab, should trigger a
// session refresh + sidebar re-render. Roles + officers can change at
// runtime; password overrides don't affect the menu but a re-check is cheap.
const SYNC_KEYS = new Set([
  'raot_auth',
  'raot_officer_accounts',
  'raot_officer_password_overrides',
  'raot_roles',
]);

const REFRESH_POLL_MS = 30_000;

interface RoleLayoutProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  pageTitle?: string;
}

/** True if the user is allowed to render under this role gate.
 *  - exact role match → yes
 *  - master is universally welcome on officer-side pages */
function canEnter(user: User, requiredRole: UserRole): boolean {
  if (user.role === requiredRole) return true;
  if (requiredRole === 'officer' && user.role === 'master') return true;
  return false;
}

export default function RoleLayout({ children, requiredRole, pageTitle }: RoleLayoutProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const screens  = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const { message } = App.useApp();

  const [user, setUser]             = useState<User | null>(null);
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading]       = useState(true);

  // Guard re-entry into the same toast / redirect from multiple effects firing
  // close together (storage event + polling tick + focus).
  const handledRevocation = useRef(false);

  // ── Initial session load ─────────────────────────────────────────────
  useEffect(() => {
    const result = consumeSession();
    if (result.status === 'expired') {
      router.replace('/login?reason=expired');
      return;
    }
    if (result.status === 'none') {
      router.replace('/login');
      return;
    }
    const { session } = result;
    if (!canEnter(session.user, requiredRole)) {
      router.replace(redirectHomeFor(session.user.role));
      return;
    }
    setUser(session.user);
    setLoading(false);
  }, [requiredRole, router]);

  // ── Auto-close mobile drawer on route change ─────────────────────────
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // ── Sync session against latest officer/role state ──────────────────
  const syncSession = useCallback(() => {
    if (handledRevocation.current) return;
    const r = refreshSession();

    if (r.kind === 'suspended') {
      handledRevocation.current = true;
      logout();
      message.error('บัญชีของท่านถูกระงับโดยผู้ดูแลระบบ');
      router.replace('/login');
      return;
    }

    if (r.kind === 'gone') {
      handledRevocation.current = true;
      logout();
      message.error('บัญชีของท่านไม่อยู่ในระบบแล้ว กรุณาเข้าสู่ระบบใหม่');
      router.replace('/login');
      return;
    }

    if (r.kind === 'role_changed') {
      handledRevocation.current = true;
      logout();
      message.warning(
        `บทบาทของท่านถูกเปลี่ยนเป็น ${r.newRole} โดยผู้ดูแลระบบ — กรุณาเข้าสู่ระบบใหม่`,
      );
      router.replace('/login');
      return;
    }

    if (r.kind === 'no-session') {
      handledRevocation.current = true;
      router.replace('/login');
      return;
    }

    if (r.kind === 'updated') {
      setUser(r.user);
      message.info('สิทธิ์ของท่านถูกอัปเดตโดยผู้ดูแลระบบ');
    }
    // 'unchanged' → no-op
  }, [router, message]);

  // Storage event — fires in OTHER tabs when a relevant key changes.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent) => {
      if (e.key && SYNC_KEYS.has(e.key)) syncSession();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [syncSession]);

  // Focus event — catches same-tab updates when the user tabs back in.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onFocus = () => syncSession();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [syncSession]);

  // Polling fallback — covers cross-device admin changes.
  useEffect(() => {
    if (!user) return;
    const id = setInterval(syncSession, REFRESH_POLL_MS);
    return () => clearInterval(id);
  }, [user, syncSession]);

  // ── Route guard — if current segment not in effective permissions, kick ──
  useEffect(() => {
    if (!user || handledRevocation.current) return;
    const segment = pathname.split('/')[2] ?? DASHBOARD_KEY;
    if (segment === DASHBOARD_KEY) return;
    // Buyer/Seller use their own sidebar maps, not the catalog — skip catalog check
    if (user.role === 'buyer' || user.role === 'seller') return;
    const perms = resolvePermissionsForUser(user);
    if (user.role === 'master') return; // master sees everything
    if (!perms.includes(segment)) {
      message.warning('สิทธิ์ของท่านไม่อนุญาตให้เข้าหน้านี้ — กลับไปยังหน้าแรก');
      router.replace(redirectHomeFor(user.role));
    }
  }, [user, pathname, router, message]);

  if (loading || !user) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', background: '#f5f7fa', gap: 12,
      }}>
        <Spin size="large" />
        <div style={{ color: '#8c8c8c', fontSize: 13 }}>กำลังโหลด...</div>
      </div>
    );
  }

  const desktopSiderWidth = collapsed ? 72 : 240;
  const contentMarginLeft = isMobile ? 0 : desktopSiderWidth;
  const contentPadding    = isMobile ? 12 : 24;

  const handleHeaderToggle = () => {
    if (isMobile) setMobileOpen(o => !o);
    else          setCollapsed(c => !c);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <AppSidebar
        user={user}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Layout
        style={{
          marginLeft: contentMarginLeft,
          transition: 'margin-left 0.2s ease',
          background: '#f5f7fa',
        }}
      >
        <AppHeader
          user={user}
          collapsed={collapsed}
          onToggle={handleHeaderToggle}
          pageTitle={pageTitle}
          mobile={isMobile}
        />
        <Content
          className="page-content"
          style={{
            padding: contentPadding,
            minHeight: 'calc(100vh - 56px)',
            background: '#f5f7fa',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

function redirectHomeFor(role: UserRole): string {
  if (role === 'buyer') return '/buyer/dashboard';
  if (role === 'seller') return '/seller/dashboard';
  return '/officer/dashboard';
}
