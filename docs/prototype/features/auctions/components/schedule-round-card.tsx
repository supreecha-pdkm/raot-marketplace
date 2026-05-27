'use client';

import { Card, Tag, Alert, Space, Typography } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import {
  roundOptionFor, TYPE_KEY_TO_LABEL, TYPE_KEY_TO_COLOR,
  type RoundPhase, type RubberTypeKey,
} from '@/features/auctions/utils/auction-constants';
import type { ScheduledRound } from '@/features/auctions/services/auction-schedule';

const { Text } = Typography;

/**
 * Compact card for one scheduled round — used in both the Schedule tab's
 * 7-day list view and the per-day Drawer.
 *
 * When `expanded`, includes a status Alert with context.
 */
export default function ScheduleRoundCard({
  item, phase, expanded = false,
}: {
  item:       ScheduledRound;
  phase:      RoundPhase;
  expanded?:  boolean;
}) {
  const opt = roundOptionFor(item.round);
  const phaseTag =
    phase === 'open'     ? <Tag color="success" style={{ margin: 0 }}>กำลังเปิด</Tag> :
    phase === 'upcoming' ? <Tag color="processing" style={{ margin: 0 }}>เปิดเร็ว ๆ นี้</Tag> :
                           <Tag style={{ margin: 0 }}>ปิดแล้ว</Tag>;
  const accent =
    phase === 'open'     ? '#52c41a' :
    phase === 'upcoming' ? '#1677ff' :
                           '#bfbfbf';

  return (
    <Card
      size="small"
      styles={{ body: { padding: 12 } }}
      style={{
        borderLeft: `3px solid ${accent}`,
        opacity: phase === 'closed' ? 0.75 : 1,
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <Space size={6}>
          <ClockCircleOutlined style={{ color: accent }} />
          <Text strong style={{ fontSize: 13 }}>
            รอบ {item.round}
          </Text>
          {opt && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              ({String(opt.startH).padStart(2, '0')}:00–{String(opt.endH).padStart(2, '0')}:00)
            </Text>
          )}
        </Space>
        {phaseTag}
      </div>

      <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
        <EnvironmentOutlined />
        {item.market}
      </div>

      <Space size={4} wrap style={{ marginTop: 8 }}>
        <Tag
          color={item.auctionType === 'network' ? 'geekblue' : 'gold'}
          style={{ margin: 0, fontSize: 11 }}
        >
          {item.auctionType === 'network' ? 'ประมูล ณ เครือข่าย' : 'ประมูล ณ ที่ตั้ง'}
        </Tag>
        {item.isEudr && <span className="badge-eudr">EUDR</span>}
      </Space>

      <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
        {item.rubberTypeKeys.map(k => {
          const key = k as RubberTypeKey;
          return (
            <Tag
              key={k}
              style={{
                margin: 0, fontSize: 11,
                color: TYPE_KEY_TO_COLOR[key] ?? '#595959',
                background: `${TYPE_KEY_TO_COLOR[key] ?? '#595959'}1F`,
                borderColor: `${TYPE_KEY_TO_COLOR[key] ?? '#595959'}59`,
              }}
            >
              {TYPE_KEY_TO_LABEL[key] ?? k}
            </Tag>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: '1px dashed #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: '#8c8c8c' }}>จำนวน LOT</div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{item.totalLots.toLocaleString()}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: '#8c8c8c' }}>น้ำหนักประมาณรวม</div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>
            {item.estimatedWeightKg.toLocaleString()} <Text type="secondary" style={{ fontSize: 11 }}>กก.</Text>
          </div>
        </div>
      </div>

      {expanded && phase !== 'closed' && (
        <Alert
          type={phase === 'open' ? 'success' : 'info'}
          showIcon
          style={{ marginTop: 10 }}
          title={
            phase === 'open'
              ? 'รอบนี้กำลังเปิดประมูล — เข้าหน้ากระดานประมูลเพื่อเสนอราคา'
              : 'รอบนี้ยังไม่ถึงเวลา ระบบจะเปิดให้เสนอราคาตามเวลาที่กำหนด'
          }
        />
      )}
    </Card>
  );
}
