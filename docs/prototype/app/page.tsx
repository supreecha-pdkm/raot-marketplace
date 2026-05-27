'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getRedirectPath } from '@/features/auth/services/auth';
import { Spin } from 'antd';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (session) {
      router.replace(getRedirectPath(session.user.role));
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen" style={{ background: '#fafafa' }}>
      <Spin size="large" description="กำลังโหลด..." />
    </div>
  );
}
