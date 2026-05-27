'use client';

import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  formatter?: (v: number | string) => React.ReactNode;
  trend?: number;
  /** CSS class that adds a left-border accent (stat-primary, stat-blue, stat-orange, stat-purple, stat-cyan) */
  accentClass?: string;
  loading?: boolean;
}

export default function StatCard({
  title, value, prefix, suffix, formatter, trend, accentClass = 'stat-primary', loading,
}: StatCardProps) {
  return (
    <Card
      className={accentClass}
      loading={loading}
      styles={{ body: { padding: '16px 20px' } }}
      style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <Statistic
        title={<span style={{ fontSize: 13, color: '#595959' }}>{title}</span>}
        value={value}
        prefix={prefix}
        suffix={suffix}
        formatter={formatter as any}
        styles={{ content: { fontSize: 22, fontWeight: 700, color: '#1a1a2e' } }}
      />
      {trend !== undefined && (
        <div
          style={{
            fontSize: 12,
            marginTop: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: trend >= 0 ? '#52c41a' : '#ff4d4f',
          }}
        >
          {trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(trend)}% จากเมื่อวาน
        </div>
      )}
    </Card>
  );
}
