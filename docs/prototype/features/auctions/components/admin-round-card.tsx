'use client';

import { Card, Tag, Switch, Button, Space, Typography, Tooltip } from 'antd';
import {
  ClockCircleOutlined, EnvironmentOutlined,
  EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import type { AuctionRound } from '../services/auction-rounds';
import type { RoundPhase } from '../utils/auction-constants';

const { Text } = Typography;

export interface AdminRoundCardProps {
  item:           AuctionRound;
  phase:          RoundPhase;
  onEdit:         (r: AuctionRound) => void;
  onDelete:       (r: AuctionRound) => void;
  onToggleActive: (r: AuctionRound, next: boolean) => void;
  expanded?:      boolean;
}

export default function AdminRoundCard({
  item, phase, onEdit, onDelete, onToggleActive, expanded = false,
}: AdminRoundCardProps) {
  const phaseTag =
    !item.active         ? <Tag style={{ margin: 0 }}>ปิดใช้งาน</Tag> :
    phase === 'open'     ? <Tag color="success"    style={{ margin: 0 }}>กำลังเปิด</Tag> :
    phase === 'upcoming' ? <Tag color="processing" style={{ margin: 0 }}>เปิดเร็ว ๆ นี้</Tag> :
                           <Tag style={{ margin: 0 }}>ปิดแล้ว</Tag>;

  const accent =
    !item.active         ? '#bfbfbf' :
    phase === 'open'     ? '#52c41a' :
    phase === 'upcoming' ? '#1677ff' :
                           '#bfbfbf';

  return (
    <Card
      size="small"
      styles={{ body: { padding: 12 } }}
      style={{ borderLeft: `3px solid ${accent}`, opacity: !item.active ? 0.75 : 1, height: '100%' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <Space size={6}>
          <ClockCircleOutlined style={{ color: accent }} />
          <Text strong style={{ fontSize: 13 }}>{item.name}</Text>
          <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>
            {item.startTime}–{item.endTime}
          </Text>
        </Space>
        {phaseTag}
      </div>

      <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
        <EnvironmentOutlined />
        {item.market}
      </div>

      <Space size={4} wrap style={{ marginTop: 8 }}>
        <Tag color={item.auctionType === 'network' ? 'geekblue' : 'gold'} style={{ margin: 0, fontSize: 11 }}>
          {item.auctionType === 'network' ? 'ประมูล ณ เครือข่าย' : 'ประมูล ณ ที่ตั้ง'}
        </Tag>
        <Tag style={{ margin: 0, fontSize: 11 }}>
          ค่าธรรมเนียม {item.feePerKg.toFixed(2)} บาท/กก.
        </Tag>
      </Space>

      <div
        style={{
          marginTop: 10, paddingTop: 8, borderTop: '1px dashed #f0f0f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, flexWrap: 'wrap',
        }}
      >
        <Space size={6}>
          <Tooltip title={item.active ? 'ปิดใช้งานรอบนี้' : 'เปิดใช้งานรอบนี้'}>
            <Switch size="small" checked={item.active} onChange={c => onToggleActive(item, c)} />
          </Tooltip>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {item.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
          </Text>
        </Space>
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(item)}>แก้ไข</Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete(item)}>ลบ</Button>
        </Space>
      </div>

      {expanded && (
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
          ID: <span style={{ fontFamily: 'monospace' }}>{item.id}</span>
        </Text>
      )}
    </Card>
  );
}
