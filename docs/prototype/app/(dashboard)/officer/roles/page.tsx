'use client';

import { useEffect, useState } from 'react';
import { Result, Button, Typography, Alert } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { getSession } from '@/features/auth/services/auth';
import { resolvePermissionsForUser, RoleListCard } from '@/features/roles';

const { Title, Text } = Typography;

export default function RolesPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const s = getSession();
    const ok = s ? s.user.role === 'master' || resolvePermissionsForUser(s.user).includes('roles') : false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllowed(ok);
  }, []);

  if (allowed === null) return null;
  if (!allowed) {
    return (
      <Result
        status="403"
        title="ไม่มีสิทธิ์เข้าถึงหน้านี้"
        subTitle="คุณต้องมีสิทธิ์ 'จัดการ Role & Permission' หรือเป็น Master เท่านั้นจึงจะเข้าหน้านี้ได้"
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
          <KeyOutlined style={{ marginRight: 8 }} />
          จัดการ Role &amp; Permission
        </Title>
        <Text type="secondary">
          สร้าง Role และเลือกเมนูที่อนุญาต (Permission) เพื่อใช้กำหนดสิทธิ์ให้เจ้าหน้าที่
        </Text>
      </div>

      <Alert
        type="info"
        showIcon
        title="Default Role แก้ไขหรือลบไม่ได้ — เจ้าหน้าที่ใหม่ที่ยังไม่ได้รับ Role จะอยู่ที่นี่และเห็นเฉพาะหน้าแรก"
      />

      <RoleListCard />
    </div>
  );
}
