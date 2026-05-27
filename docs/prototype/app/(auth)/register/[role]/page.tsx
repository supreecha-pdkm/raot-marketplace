'use client';

import { use } from 'react';
import NextLink from 'next/link';
import { Button, Result } from 'antd';
import { RegisterForm, type Role } from '@/features/auth';

export default function RegisterPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role: rawRole } = use(params);

  if (rawRole !== 'buyer' && rawRole !== 'seller') {
    return (
      <Result
        status="404"
        title="ไม่พบประเภทผู้ลงทะเบียน"
        subTitle={`รองรับเฉพาะ /register/buyer และ /register/seller (ค่าที่รับ: ${rawRole})`}
        extra={
          <NextLink href="/login">
            <Button type="primary" style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
              กลับไปเข้าสู่ระบบ
            </Button>
          </NextLink>
        }
      />
    );
  }

  return <RegisterForm role={rawRole as Role} />;
}
