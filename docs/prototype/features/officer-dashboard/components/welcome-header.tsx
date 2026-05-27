'use client';

import { useEffect, useState } from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface WelcomeHeaderProps {
  fullName: string;
  roleLabel: string;
  permCount: number;
}

/** Editorial-style header strip: large display name on the left, a small
 *  metadata column on the right (date / clock / perm count). The clock is
 *  the only live element — ticks every second so seconds stay accurate.
 *  `tabular-nums` (set on the time element below) keeps digits from
 *  shifting horizontally on each tick. */
export default function WelcomeHeader({ fullName, roleLabel, permCount }: WelcomeHeaderProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(t);
  }, []);

  const dateLabel = now
    ? now.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const timeLabel = now
    ? now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  return (
    <header
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'end',
        gap: 32,
        paddingBottom: 20,
        borderBottom: '1px solid #e8e4dc',
        marginBottom: 32,
      }}
    >
      <div>
        <Text
          style={{
            display: 'block',
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#9ca39a',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Officer Console · ศูนย์ปฏิบัติงาน
        </Text>
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            lineHeight: 1.1,
            fontWeight: 700,
            color: '#0f3d22',
            letterSpacing: '-0.01em',
          }}
        >
          ยินดีต้อนรับ — <span style={{ fontWeight: 400 }}>{fullName}</span>
        </h1>
        <Text
          style={{
            display: 'block',
            marginTop: 6,
            fontSize: 13,
            color: '#736b62',
          }}
        >
          {roleLabel} · ได้รับสิทธิ์ <strong style={{ color: '#1a7c3e' }}>{permCount}</strong> เมนู
        </Text>
      </div>

      <div style={{ textAlign: 'right', fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace' }}>
        <div style={{ fontSize: 11, color: '#9ca39a', letterSpacing: '0.04em' }}>
          {dateLabel || ' '}
        </div>
        <div style={{ fontSize: 28, color: '#0f3d22', fontWeight: 600, lineHeight: 1, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
          {timeLabel || ' '}
        </div>
      </div>
    </header>
  );
}
