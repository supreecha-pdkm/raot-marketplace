'use client';

import { Suspense, useEffect, useState } from 'react';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Form, Input, Button, Typography, Alert, Card, Spin,
} from 'antd';
import { Lock, Eye, EyeSlash, CheckCircle, ArrowLeft } from '@phosphor-icons/react';
import { resetPassword, verifyResetToken } from '@/features/auth/services/auth';

const { Title, Text } = Typography;

const BRAND_GREEN = '#1a7c3e';
const BRAND_GREEN_DARK = '#0f3d22';

// Matches FR-LOG-06: ≥8 chars, upper + lower + digit + special.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'invalid' | 'expired'>('checking');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenStatus('invalid');
      return;
    }
    const result = verifyResetToken(token);
    if ('error' in result) {
      setTokenStatus(result.error === 'EXPIRED_TOKEN' ? 'expired' : 'invalid');
    } else {
      setEmail(result.email);
      setTokenStatus('valid');
    }
  }, [token]);

  const onFinish = async (values: { password: string }) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = resetPassword(token);
    setLoading(false);
    if (!result.ok) {
      setTokenStatus(result.error === 'EXPIRED_TOKEN' ? 'expired' : 'invalid');
      return;
    }
    void values; // password is captured here in production
    setSuccess(true);
    setTimeout(() => router.push('/login'), 2000);
  };

  if (tokenStatus === 'checking') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (tokenStatus === 'invalid' || tokenStatus === 'expired') {
    return (
      <>
        <Alert
          type="error"
          showIcon
          title={tokenStatus === 'expired' ? 'ลิงก์หมดอายุ' : 'ลิงก์ไม่ถูกต้อง'}
          description={
            tokenStatus === 'expired'
              ? 'ลิงก์รีเซ็ตรหัสผ่านมีอายุ 1 ชั่วโมง กรุณาขอลิงก์ใหม่'
              : 'ไม่พบลิงก์รีเซ็ตรหัสผ่านนี้ในระบบ อาจถูกใช้ไปแล้วหรือไม่ถูกต้อง'
          }
          style={{ marginBottom: 16 }}
        />
        <NextLink href="/forgot-password">
          <Button type="primary" block size="large" style={{ background: BRAND_GREEN, borderColor: BRAND_GREEN }}>
            ขอลิงก์ใหม่
          </Button>
        </NextLink>
      </>
    );
  }

  if (success) {
    return (
      <Alert
        type="success"
        showIcon
        icon={<CheckCircle weight="fill" />}
        title="รีเซ็ตรหัสผ่านสำเร็จ"
        description="กำลังนำท่านไปยังหน้าเข้าสู่ระบบ..."
      />
    );
  }

  return (
    <>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
        กำลังรีเซ็ตรหัสผ่านสำหรับ <Text strong>{email}</Text>
      </Text>

      <Form layout="vertical" onFinish={onFinish} size="large">
        <Form.Item
          name="password"
          label="รหัสผ่านใหม่"
          rules={[
            { required: true, message: 'กรุณากรอกรหัสผ่านใหม่' },
            {
              pattern: PASSWORD_REGEX,
              message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัว มีพิมพ์ใหญ่+เล็ก+ตัวเลข+อักขระพิเศษ',
            },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<Lock size={16} />}
            placeholder="••••••••"
            autoComplete="new-password"
            iconRender={(v) => (v ? <Eye size={16} /> : <EyeSlash size={16} />)}
          />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="ยืนยันรหัสผ่านใหม่"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'กรุณายืนยันรหัสผ่าน' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject(new Error('รหัสผ่านไม่ตรงกัน'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<Lock size={16} />}
            placeholder="••••••••"
            autoComplete="new-password"
            iconRender={(v) => (v ? <Eye size={16} /> : <EyeSlash size={16} />)}
          />
        </Form.Item>

        <Button
          htmlType="submit"
          type="primary"
          block
          loading={loading}
          size="large"
          style={{ background: BRAND_GREEN, borderColor: BRAND_GREEN, height: 44, fontWeight: 600 }}
        >
          รีเซ็ตรหัสผ่าน
        </Button>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <NextLink href="/login" style={{ color: BRAND_GREEN, fontSize: 13 }}>
            <ArrowLeft size={12} weight="bold" style={{ verticalAlign: 'middle', marginRight: 4 }} />
            กลับไปหน้าเข้าสู่ระบบ
          </NextLink>
        </div>
      </Form>
    </>
  );
}

export default function ResetPasswordPage() {
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
            รีเซ็ตรหัสผ่าน
          </Title>
        </div>
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center' }}><Spin /></div>}>
          <ResetPasswordInner />
        </Suspense>
      </Card>
    </div>
  );
}
