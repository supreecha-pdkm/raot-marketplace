'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import {
  Form, Input, Button, Typography, Divider, Alert,
  Checkbox, Segmented, Select, Space,
} from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import {
  User, Lock, Eye, EyeSlash,
  Key, ArrowRight, ShieldCheck, LockKey, Info,
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { loginWithCredentials, AuthError, getRedirectPath, MOCK_CREDENTIALS_FOR_DISPLAY, logout } from '@/features/auth/services/auth';
import { UserRole, ROLE_LABELS } from '@/shared/types';

const { Title, Text, Link } = Typography;

export type RoleEntry = { role: UserRole; icon: React.ReactNode; description: string };

interface LoginPanelProps {
  /** Roles that can log in via this page (must contain at least one entry). */
  roles: RoleEntry[];
  /** Visible above the role picker, e.g. "ฉันคือ" or "เลือกบทบาทผู้ดูแล" */
  rolePickerTitle: string;
  /** Cross-login chip in the top-right of the header */
  footerLink: { label: string; href: string };
  /** Show "สมัครผู้ซื้อ / สมัครผู้ขาย" links + approval note (public buyer/seller variant) */
  showRegistration?: boolean;
  /** Hide the role picker entirely. Role is auto-detected from the typed
   *  username against the `roles` allow-list (admin/officer login flow). */
  hideRolePicker?: boolean;
  /** Hide the "ลืมรหัสผ่าน?" link. Officer/admin login does not expose a
   *  self-service reset flow — passwords are reset by a master account. */
  hideForgotPassword?: boolean;
  /** Optional remark block rendered above the dev demo panel — used by the
   *  admin page to surface every demo credential at once. */
  remark?: React.ReactNode;
}

const BRAND_GREEN = '#1a7c3e';
const BRAND_GREEN_DARK = '#0f3d22';

export default function LoginPanel({
  roles, rolePickerTitle, footerLink, showRegistration = false,
  hideRolePicker = false, hideForgotPassword = false, remark,
}: LoginPanelProps) {
  const router = useRouter();
  const [form] = Form.useForm();

  // Default to the first role so the form is usable on first paint.
  // Removes the "select role first" empty state — gating users behind a
  // separate selection step is a layout failure (Norman, Design of Everyday Things).
  const defaultRole = roles[0]?.role;
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);
  const [expiredNotice, setExpiredNotice] = useState(false);

  // Auto-fill demo creds for the active role (works on mount + role change).
  // When the role picker is hidden (admin login), skip auto-fill so the
  // user types from the remark sheet — otherwise we'd hard-code one role.
  useEffect(() => {
    if (hideRolePicker) return;
    const creds = MOCK_CREDENTIALS_FOR_DISPLAY[selectedRole];
    form.setFieldsValue({ username: creds.username, password: creds.password });
  }, [selectedRole, form, hideRolePicker]);

  // Show "เซสชันหมดอายุ" notice when redirected from a protected page after
  // session expiry (POC-47 Scenario 3). Read once on mount; clear the URL so
  // a refresh doesn't show it again.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('reason') === 'expired') {
      setExpiredNotice(true);
      params.delete('reason');
      const qs = params.toString();
      const url = window.location.pathname + (qs ? `?${qs}` : '');
      window.history.replaceState({}, '', url);
    }
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
  };

  /** The auth service derives the user's role from the matched account, so the
   *  login form no longer passes a role hint. After login we still verify the
   *  resulting role is one of the roles this page is meant to serve — e.g. an
   *  officer username typed on the buyer/seller form gets rejected. */
  const allowedRoles = roles.map((r) => r.role);

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 600));
    try {
      const user = loginWithCredentials(values.username, values.password, remember);
      if (!allowedRoles.includes(user.role)) {
        logout();
        throw new AuthError(
          'INVALID_CREDENTIALS',
          'บัญชีนี้ไม่อนุญาตให้เข้าสู่ระบบจากหน้านี้ กรุณาใช้หน้าเข้าสู่ระบบที่ถูกต้อง',
        );
      }
      router.push(getRedirectPath(user.role));
    } catch (e) {
      if (e instanceof AuthError && e.code === 'ACCOUNT_PENDING') {
        router.push(`/register/pending?id=${e.applicationId ?? ''}&role=${selectedRole}`);
        return; // navigate away — don't setLoading(false)
      }
      setError(e instanceof AuthError ? e.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่');
      setLoading(false);
    }
  };

  const handleRememberChange = (e: CheckboxChangeEvent) => setRemember(e.target.checked);

  const selectedLabel = ROLE_LABELS[selectedRole];
  const selectedDescription = roles.find((r) => r.role === selectedRole)?.description;
  const isDev = process.env.NODE_ENV !== 'production';

  // Adaptive picker — Segmented when ≤3 roles, Select when >3 (admin login).
  const useSegmented = roles.length <= 3;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#fff' }}>

      {/* ── Left hero — brand gradient + Leaf + tagline (desktop only) ── */}
      <div
        className="hidden md:flex"
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
          background: `linear-gradient(135deg, ${BRAND_GREEN_DARK} 0%, ${BRAND_GREEN} 50%, ${BRAND_GREEN_DARK} 100%)`,
          color: '#fff',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.15,
            backgroundImage:
              'radial-gradient(circle at 30% 30%, #52c41a 0%, transparent 60%), radial-gradient(circle at 70% 70%, #1677ff 0%, transparent 60%)',
          }}
        />
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 420 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="RAOT"
            width={112}
            height={112}
            style={{
              background: '#fff',
              borderRadius: '50%',
              padding: 10,
              boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
              objectFit: 'contain',
            }}
          />
          <Title level={2} style={{ color: '#fff', marginTop: 24, marginBottom: 0, fontWeight: 700 }}>
            ตลาดยาง Green Rubber
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, display: 'block', marginTop: 8 }}>
            ระบบตรวจสอบย้อนกลับผลผลิตยางพารา RAOT
          </Text>
          <div
            style={{
              marginTop: 32,
              padding: '14px 18px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.85)',
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            รองรับ EUDR Traceability<br />
            ปลอดภัย · โปร่งใส · ตรวจสอบได้
          </div>
        </div>
      </div>

      {/* ── Right form panel (white) ── */}
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          flexShrink: 0,
          background: '#fff',
          padding: '24px 40px 32px',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >

        {/* Cross-login chip — top-right of right panel */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <NextLink
            href={footerLink.href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 999,
              background: '#f5f5f5',
              border: '1px solid #e8e8e8',
              color: BRAND_GREEN,
              fontSize: 12,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {footerLink.label}
            <ArrowRight size={12} weight="bold" />
          </NextLink>
        </div>

        {/* Form column — centered vertically, constrained width */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', maxWidth: 420, margin: '0 auto' }}>

          {/* Brand lockup — visible on all breakpoints */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="RAOT"
              width={80}
              height={80}
              style={{
                display: 'block',
                margin: '0 auto 4px',
                objectFit: 'contain',
              }}
            />
            <Title level={2} style={{ margin: '12px 0 4px', color: '#0f3d22' }}>
              เข้าสู่ระบบ
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              เลือกบทบาทและเข้าสู่ระบบ RAOT Green Rubber
            </Text>
          </div>


          {/* Role picker — always visible, never gates the form.
              Hidden entirely on the admin variant; role is auto-detected. */}
          {!hideRolePicker && (
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
                {rolePickerTitle}
              </Text>
              {useSegmented ? (
                <Segmented
                  block
                  value={selectedRole}
                  onChange={(v) => handleRoleChange(v as UserRole)}
                  options={roles.map(({ role, icon }) => ({
                    value: role,
                    label: (
                      <Space size={6}>
                        <span style={{ display: 'inline-flex', verticalAlign: 'middle', fontSize: 14 }}>
                          {icon}
                        </span>
                        <span>{ROLE_LABELS[role].th}</span>
                      </Space>
                    ),
                  }))}
                />
              ) : (
                <Select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  style={{ width: '100%' }}
                  options={roles.map(({ role }) => ({
                    value: role,
                    label: (
                      <span>
                        <span style={{ fontWeight: 600 }}>{ROLE_LABELS[role].th}</span>
                        <span style={{ color: '#bfbfbf', marginLeft: 8, fontSize: 12 }}>
                          {ROLE_LABELS[role].en}
                        </span>
                      </span>
                    ),
                  }))}
                />
              )}
              {selectedDescription && (
                <Text type="secondary" style={{ fontSize: 12, marginTop: 6, display: 'block' }}>
                  {selectedDescription}
                </Text>
              )}
            </div>
          )}

          {expiredNotice && (
            <Alert
              type="warning"
              title="เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"
              showIcon
              style={{ marginBottom: 16 }}
              closable
              onClose={() => setExpiredNotice(false)}
            />
          )}

          {error && (
            <Alert
              type="error"
              title={error}
              showIcon
              style={{ marginBottom: 16 }}
              closable
              onClose={() => setError('')}
            />
          )}

          <Form form={form} onFinish={handleLogin} layout="vertical" size="large">
            <Form.Item
              name="username"
              label="ชื่อผู้ใช้"
              rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
              style={{ marginBottom: 14 }}
            >
              <Input prefix={<User size={16} weight="regular" />} placeholder="username" autoComplete="username" />
            </Form.Item>

            <Form.Item
              name="password"
              label="รหัสผ่าน"
              rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
              style={{ marginBottom: 12 }}
            >
              <Input.Password
                prefix={<Lock size={16} weight="regular" />}
                placeholder="••••••••"
                autoComplete="current-password"
                iconRender={(v) => (v ? <Eye size={16} /> : <EyeSlash size={16} />)}
              />
            </Form.Item>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <Checkbox checked={remember} onChange={handleRememberChange}>จำฉันไว้</Checkbox>
              {!hideForgotPassword && (
                <NextLink href="/forgot-password" style={{ fontSize: 13, color: BRAND_GREEN }}>
                  ลืมรหัสผ่าน?
                </NextLink>
              )}
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
              style={{
                background: BRAND_GREEN,
                borderColor: BRAND_GREEN,
                height: 52,
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              เข้าสู่ระบบ
            </Button>
          </Form>

          {/* Trust microcopy — above the fold, ground-truth signals */}
          <div
            style={{
              marginTop: 16,
              padding: '10px 12px',
              borderRadius: 8,
              background: '#fafafa',
              border: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <LockKey size={16} weight="duotone" color={BRAND_GREEN} style={{ flexShrink: 0, marginTop: 1 }} />
            <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.5 }}>
              ข้อมูลของคุณเข้ารหัสตามมาตรฐาน TLS &middot;{' '}
              <Link href="#" style={{ fontSize: 11 }}>นโยบาย PDPA</Link> &middot;{' '}
              <Link href="#" style={{ fontSize: 11 }}>ความช่วยเหลือ</Link>
            </Text>
          </div>

          {/* Registration block — buyer/seller variant only */}
          {showRegistration && (
            <>
              <Divider plain style={{ margin: '20px 0 12px' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>ยังไม่มีบัญชี?</Text>
              </Divider>
              <Space style={{ width: '100%', justifyContent: 'center' }} size={8} wrap>
                <NextLink href="/register/buyer">
                  <Button>สมัครผู้ซื้อ</Button>
                </NextLink>
                <NextLink href="/register/seller">
                  <Button>สมัครผู้ขาย</Button>
                </NextLink>
                <NextLink href="/register/seller?variant=institution">
                  <Button>สมัครสถาบันเกษตรกร และผู้ประกอบกิจการยาง</Button>
                </NextLink>
              </Space>
              <div
                style={{
                  marginTop: 10,
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: '#fffbe6',
                  border: '1px solid #ffe58f',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 6,
                }}
              >
                <Info size={14} weight="bold" color="#d48806" style={{ flexShrink: 0, marginTop: 2 }} />
                <Text style={{ fontSize: 11, color: '#874d00' }}>
                  ผู้ขายต้องผ่านการอนุมัติจากเจ้าหน้าที่ตลาดกลางก่อนใช้งาน
                </Text>
              </div>
            </>
          )}

          {/* Caller-supplied remark — admin variant uses this to expose
              every demo cred in one block since there's no role picker. */}
          {remark && <div style={{ marginTop: 16 }}>{remark}</div>}

          {/* Per-role demo panel — only when the picker is visible.
              Hidden in production. */}
          {isDev && !hideRolePicker && (
            <Alert
              type="warning"
              showIcon
              icon={<Key size={14} weight="bold" />}
              style={{ marginTop: 16, fontSize: 12 }}
              title={
                <span>
                  <strong>Demo</strong> · username: <code>{MOCK_CREDENTIALS_FOR_DISPLAY[selectedRole].username}</code>
                  {' '}· password: <code>{MOCK_CREDENTIALS_FOR_DISPLAY[selectedRole].password}</code>
                  {' '}<em>(จะซ่อนอัตโนมัติใน production)</em>
                </span>
              }
            />
          )}
        </div>

        {/* Version footer — muted on white background */}
        <div style={{ marginTop: 20, textAlign: 'center', color: '#bfbfbf', fontSize: 11 }}>
          <ShieldCheck size={12} weight="duotone" style={{ verticalAlign: 'middle', marginRight: 4 }} />
          RAOT v1.0.0 · {selectedLabel.th}
        </div>
      </div>
    </div>
  );
}
