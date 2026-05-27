'use client';

import { ShoppingCart, Leaf } from '@phosphor-icons/react';
import LoginPanel, { type RoleEntry } from '@/features/auth/components/login-panel';

const ROLES: RoleEntry[] = [
  { role: 'buyer',  icon: <ShoppingCart size={16} weight="duotone" />, description: 'ซื้อยางพาราผ่านระบบประมูล' },
  { role: 'seller', icon: <Leaf         size={16} weight="duotone" />, description: 'ขายผลผลิตยางพาราเข้าตลาด' },
];

export default function LoginPage() {
  return (
    <LoginPanel
      roles={ROLES}
      rolePickerTitle="ฉันคือ"
      footerLink={{
        label: 'เป็นเจ้าหน้าที่?',
        href: '/login/admin',
      }}
      showRegistration
    />
  );
}
