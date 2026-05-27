import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

/** Section heading — ไม่มีกรอบ ไม่มีพื้นหลัง ใช้แค่ heading + spacing แยก block */
export function RegisterSectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <Title level={5} style={{ marginTop: 0, marginBottom: 12, fontSize: 14, fontWeight: 600 }}>
        {title}
      </Title>
      {children}
    </div>
  );
}
