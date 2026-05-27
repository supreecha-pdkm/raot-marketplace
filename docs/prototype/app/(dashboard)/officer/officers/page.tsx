'use client';

import { useEffect, useState } from 'react';
import { Result, Button, Typography } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { getSession } from '@/features/auth/services/auth';
import { resolvePermissionsForUser } from '@/features/roles';
import { OfficerListCard } from '@/features/officers';

const { Title, Text } = Typography;

export default function OfficersPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const s = getSession();
    const ok = s ? s.user.role === 'master' || resolvePermissionsForUser(s.user).includes('officers') : false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllowed(ok);
  }, []);

  if (allowed === null) return null;
  if (!allowed) {
    return (
      <Result
        status="403"
        title="ไม่มีสิทธิ์เข้าถึงหน้านี้"
        subTitle="คุณต้องมีสิทธิ์ 'จัดการเจ้าหน้าที่' หรือเป็น Master เท่านั้นจึงจะเข้าหน้านี้ได้"
        extra={
          <Link href="/officer/dashboard">
            <Button type="primary">กลับไปยังหน้าแรก</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header — match master-panels pattern (Title level 4 + icon + green) */}
      <div>
        <Title level={4} style={{ margin: 0, color: '#0f3d22' }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          จัดการเจ้าหน้าที่
        </Title>
        <Text type="secondary">
          สร้างบัญชี กำหนด Role และจัดการสถานะของเจ้าหน้าที่
        </Text>
      </div>

      <OfficerListCard />
    </div>
  );
}
