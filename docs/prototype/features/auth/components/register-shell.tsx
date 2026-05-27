import React from 'react';

/** Outer shell — gradient background + centered card. */
export function RegisterShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'linear-gradient(135deg, #0f3d22 0%, #1a7c3e 50%, #0f3d22 100%)',
      }}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: 720 }}>{children}</div>
    </div>
  );
}
