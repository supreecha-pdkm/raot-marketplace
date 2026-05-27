'use client';

import { Alert, Progress, Tag, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import type { CloseMode, ProcessAction } from '../close-round-wizard';

const { Text } = Typography;

interface StepProcessProps {
  actions: ProcessAction[];
  done:    string[];
  mode:    CloseMode;
}

export default function StepProcess({ actions, done, mode }: StepProcessProps) {
  const pct = Math.round((done.length / actions.length) * 100);
  return (
    <>
      <Alert
        type="info" showIcon style={{ marginBottom: 16 }}
        title={mode === 'close' ? 'กำลังปิดรอบประมูล + ประกาศผู้ชนะ' : 'กำลังยกเลิกรอบประมูล'}
        description="กรุณาอย่าปิดหน้านี้จนกว่ากระบวนการจะเสร็จสมบูรณ์"
      />

      <Progress percent={pct} status={pct >= 100 ? 'success' : 'active'}
        strokeColor={mode === 'close' ? '#1a7c3e' : '#ff4d4f'} />

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {actions.map((a, idx) => {
          const isDone   = done.includes(a.id);
          const isActive = !isDone && done.length === idx;
          return (
            <div
              key={a.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 6,
                background: isDone ? '#f6ffed' : isActive ? '#fffbe6' : '#fafafa',
                border: `1px solid ${isDone ? '#b7eb8f' : isActive ? '#ffe58f' : '#f0f0f0'}`,
                transition: 'background 0.2s ease',
              }}
            >
              <span style={{ color: isDone ? '#1a7c3e' : isActive ? '#fa8c16' : '#8c8c8c' }}>
                {isDone ? <CheckCircleOutlined /> : a.icon}
              </span>
              <Text style={{ flex: 1, fontSize: 13 }}>{a.label}</Text>
              {isDone   && <Tag color="success" style={{ margin: 0, fontSize: 10 }}>เสร็จสิ้น</Tag>}
              {isActive && <Tag color="warning" style={{ margin: 0, fontSize: 10 }}>กำลังประมวลผล</Tag>}
            </div>
          );
        })}
      </div>
    </>
  );
}
