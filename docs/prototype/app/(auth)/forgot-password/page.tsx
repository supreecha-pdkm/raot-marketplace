'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import {
  Form, Input, Button, Typography, Alert, Card, Space,
} from 'antd';
import { Envelope, ArrowLeft, CheckCircle, Info } from '@phosphor-icons/react';
import { requestPasswordReset } from '@/features/auth/services/auth';

const { Title, Text, Paragraph } = Typography;

const BRAND_GREEN = '#1a7c3e';
const BRAND_GREEN_DARK = '#0f3d22';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<{ email: string; resetUrl: string; expiresAt: number } | null>(null);
  const isDev = process.env.NODE_ENV !== 'production';

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const { token, expiresAt } = requestPasswordReset(values.email);
    const resetUrl = `${window.location.origin}/reset-password?token=${token}`;
    setSubmitted({ email: values.email, resetUrl, expiresAt });
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: `linear-gradient(135deg, ${BRAND_GREEN_DARK} 0%, ${BRAND_GREEN} 100%)`,
      }}
    >
      <Card style={{ width: '100%', maxWidth: 460, borderRadius: 12 }} styles={{ body: { padding: 32 } }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: BRAND_GREEN_DARK }}>
            ลืมรหัสผ่าน?
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            กรอก email ที่ลงทะเบียนไว้ ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านให้
          </Text>
        </div>

        {submitted ? (
          <>
            <Alert
              type="success"
              showIcon
              icon={<CheckCircle weight="fill" />}
              title="ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว"
              description={
                <Paragraph style={{ margin: 0, fontSize: 13 }}>
                  หากมีบัญชีที่ใช้ <Text strong>{submitted.email}</Text> ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปทาง email
                  ลิงก์มีอายุ 1 ชั่วโมง
                </Paragraph>
              }
              style={{ marginBottom: 16 }}
            />

            {isDev && (
              <Alert
                type="info"
                showIcon
                icon={<Info weight="fill" />}
                title="โหมดพัฒนา (Dev only)"
                description={
                  <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                    <Text style={{ fontSize: 12 }}>ในการใช้งานจริง ลิงก์จะถูกส่งไปทาง email — ที่นี่แสดงไว้เพื่อทดสอบ:</Text>
                    <NextLink href={`/reset-password?token=${new URL(submitted.resetUrl).searchParams.get('token')}`} style={{ fontSize: 12, wordBreak: 'break-all' }}>
                      {submitted.resetUrl}
                    </NextLink>
                  </Space>
                }
                style={{ marginBottom: 16 }}
              />
            )}

            <Button block size="large" onClick={() => setSubmitted(null)} style={{ marginBottom: 8 }}>
              ส่งให้อีเมลอื่น
            </Button>
            <NextLink href="/login">
              <Button type="link" block icon={<ArrowLeft size={14} />}>
                กลับไปหน้าเข้าสู่ระบบ
              </Button>
            </NextLink>
          </>
        ) : (
          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              name="email"
              label="อีเมล"
              rules={[
                { required: true, message: 'กรุณากรอกอีเมล' },
                { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' },
              ]}
            >
              <Input prefix={<Envelope size={16} />} placeholder="you@example.com" autoComplete="email" />
            </Form.Item>

            <Button
              htmlType="submit"
              type="primary"
              block
              loading={loading}
              size="large"
              style={{ background: BRAND_GREEN, borderColor: BRAND_GREEN, height: 44, fontWeight: 600 }}
            >
              ส่งลิงก์รีเซ็ตรหัสผ่าน
            </Button>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <NextLink href="/login" style={{ color: BRAND_GREEN, fontSize: 13 }}>
                <ArrowLeft size={12} weight="bold" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                กลับไปหน้าเข้าสู่ระบบ
              </NextLink>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
}
