'use client';

import { useEffect } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App } from 'antd';
import thTH from 'antd/locale/th_TH';
import { antdTheme } from '@/lib/theme';
import { TextScaleProvider, useTextScale, withTextScale } from '@/shared/components/text-scale';
import { QueryProvider } from '@/shared/components/providers/query-provider';
import { runStorageMigrations } from '@/features/auth/services/migrations';
import './globals.css';

// Inner shell sits inside <TextScaleProvider> so it can read the live scale
// and rebuild the AntD theme on every change. Also runs one-shot storage
// migrations on first mount so legacy localStorage shapes are cleaned up
// before any auth/role code reads from them.
function ThemedShell({ children }: { children: React.ReactNode }) {
  const { scale } = useTextScale();
  const themed = withTextScale(antdTheme, scale);
  useEffect(() => {
    runStorageMigrations();
  }, []);
  return (
    <ConfigProvider theme={themed} locale={thTH}>
      <App>{children}</App>
    </ConfigProvider>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>RAOT Traceability — ระบบตรวจสอบย้อนกลับยางพารา</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full" style={{ background: '#fafafa' }}>
        <AntdRegistry>
          <QueryProvider>
            <TextScaleProvider>
              <ThemedShell>{children}</ThemedShell>
            </TextScaleProvider>
          </QueryProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
