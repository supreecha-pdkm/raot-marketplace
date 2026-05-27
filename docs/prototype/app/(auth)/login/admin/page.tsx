'use client';

import React from 'react';
import { Alert, Typography } from 'antd';
import { Crown, UserCircle, Info } from '@phosphor-icons/react';
import LoginPanel, { type RoleEntry } from '@/features/auth/components/login-panel';
import { MOCK_CREDENTIALS_FOR_DISPLAY } from '@/features/auth/services/auth';
import { ROLE_LABELS } from '@/shared/types';

const { Text } = Typography;

// Officer + Master share a single login form. The role-picker stays hidden
// because the auth service derives the role from the matched username — the
// user just types their credentials.
const ROLES: RoleEntry[] = [
  { role: 'master',  icon: <Crown      size={16} weight="duotone" />, description: 'ผู้ดูแลระบบหลัก — เห็นทุกเมนู' },
  { role: 'officer', icon: <UserCircle size={16} weight="duotone" />, description: 'เจ้าหน้าที่ — สิทธิ์ขึ้นกับ Role ที่ได้รับ' },
];

const ICONS = {
  master:  <Crown      size={14} weight="duotone" />,
  officer: <UserCircle size={14} weight="duotone" />,
} as const;

/** Demo credential sheet — surfaces the two default officer-side accounts
 *  so the developer can pick a Master or default-officer at a glance. */
function DemoUserRemark() {
  return (
    <Alert
      type="info"
      showIcon
      icon={<Info size={16} weight="duotone" />}
      title={
        <Text strong style={{ fontSize: 13 }}>
          บัญชีทดสอบ (Demo) — Master / Officer
        </Text>
      }
      description={
        <div style={{ marginTop: 8 }}>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#8c8c8c' }}>
                <th style={{ textAlign: 'left', padding: '4px 8px 4px 0', fontWeight: 500 }}>บทบาท</th>
                <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 500 }}>username</th>
                <th style={{ textAlign: 'left', padding: '4px 0 4px 8px', fontWeight: 500 }}>password</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map(({ role }) => {
                const creds = MOCK_CREDENTIALS_FOR_DISPLAY[role];
                return (
                  <tr key={role} style={{ borderTop: '1px solid #e8eaed' }}>
                    <td style={{ padding: '6px 8px 6px 0', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {ICONS[role as keyof typeof ICONS]}
                        {ROLE_LABELS[role].th}
                      </span>
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <code style={{ fontSize: 12 }}>{creds.username}</code>
                    </td>
                    <td style={{ padding: '6px 0 6px 8px' }}>
                      <code style={{ fontSize: 12 }}>{creds.password}</code>
                    </td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: '1px solid #e8eaed' }}>
                <td style={{ padding: '6px 8px 6px 0', whiteSpace: 'nowrap', color: '#8c8c8c' }}>
                  Officer (Auction Demo)
                </td>
                <td style={{ padding: '6px 8px' }}>
                  <code style={{ fontSize: 12 }}>officer02</code>
                </td>
                <td style={{ padding: '6px 0 6px 8px' }}>
                  <code style={{ fontSize: 12 }}>officer1234</code>
                </td>
              </tr>
            </tbody>
          </table>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 6 }}>
            ระบบจะตรวจสอบบทบาทจาก username อัตโนมัติ — กรอก username ที่มีอยู่ก็เข้าได้ทันที
          </Text>
        </div>
      }
    />
  );
}

export default function AdminLoginPage() {
  return (
    <LoginPanel
      roles={ROLES}
      rolePickerTitle=""
      hideRolePicker
      hideForgotPassword
      remark={<DemoUserRemark />}
      footerLink={{
        label: 'ผู้ซื้อ / ผู้ขาย',
        href: '/login',
      }}
    />
  );
}
