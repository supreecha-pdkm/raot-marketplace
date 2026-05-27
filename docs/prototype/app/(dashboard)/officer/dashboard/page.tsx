'use client';

import { useEffect, useState } from 'react';
import { Result, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { getSession } from '@/features/auth/services/auth';
import { resolvePermissionsForUser } from '@/features/roles/services/permissions';
import { getRole } from '@/features/roles/services/roles';
import { ALL_MENU_KEYS } from '@/features/roles';
import { User } from '@/shared/types';
import { WelcomeHeader, QuickAccessGrid } from '@/features/officer-dashboard';

const { Paragraph, Text } = Typography;

interface Snapshot {
  user: User;
  perms: string[];
  roleName: string | null;
}

function buildSnapshot(): Snapshot | null {
  const s = getSession();
  if (!s) return null;
  const perms = resolvePermissionsForUser(s.user);
  let roleName: string | null = null;
  if (s.user.role === 'officer') {
    const r = s.user.roleId ? getRole(s.user.roleId) : getRole('role-default');
    roleName = r?.name ?? 'Default';
  }
  return { user: s.user, perms, roleName };
}

export default function OfficerDashboardPage() {
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSnap(buildSnapshot());
  }, []);

  if (!snap) return null;
  const { user, perms, roleName } = snap;

  const isMaster = user.role === 'master';
  const noAccess = user.role === 'officer' && perms.length === 0;
  const roleLabel = isMaster ? 'Master Account · เห็นทุกเมนู' : `Role: ${roleName ?? '-'}`;
  // Master sees the entire catalog (pass null to bypass filtering); officer
  // sees only their effective permissions. Header count for master uses the
  // assignable catalog length so it reflects what's actually rendered.
  const gridPerms = isMaster ? null : perms;
  const headerCount = isMaster ? ALL_MENU_KEYS.length : perms.length;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '4px 4px 32px' }}>
      <WelcomeHeader
        fullName={user.fullName}
        roleLabel={roleLabel}
        permCount={headerCount}
      />
      {noAccess ? (
        // Welcome header (name / date / clock) ยังคงแสดงเพื่อให้ user
        // ไม่รู้สึกว่าระบบ broken — ส่วน body แทน QuickAccessGrid ด้วย
        // ข้อความแจ้งว่ายังไม่มีสิทธิ์
        <Result
          icon={<LockOutlined style={{ color: '#fa8c16' }} />}
          title="ยังไม่มีสิทธิ์การเข้าถึงระบบ"
          subTitle={
            <div style={{ marginTop: 4 }}>
              <Paragraph style={{ marginBottom: 4 }}>
                บัญชีของท่าน <Text strong>{user.fullName}</Text>
                {' '}({roleName ?? 'Default'}) ยังไม่ได้รับสิทธิ์การใช้งานเมนูใด ๆ
              </Paragraph>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                โปรดติดต่อผู้ดูแลระบบเพื่อขอกำหนด Role และสิทธิ์การเข้าถึง
              </Paragraph>
            </div>
          }
        />
      ) : (
        <QuickAccessGrid perms={gridPerms} />
      )}
    </div>
  );
}
