'use client';

import { useEffect, useState } from 'react';
import { Card, Tag, Row, Col, Space, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getRoundWindow, formatHMS, type AuctionRound,
} from '@/features/auctions/services/auction-rounds';

const { Text } = Typography;

/**
 * Hero countdown for the currently-selected board round.
 *
 * Re-renders every second while mounted; color shifts:
 *   • Closed → gray
 *   • Upcoming → info blue
 *   • Open, > 30min remaining → RAOT green
 *   • Open, 5–30min → amber
 *   • Open, < 5min → red with pulsing dot + soft glow
 */
export default function RoundCountdownCard({ round }: { round: AuctionRound }) {
  const [now, setNow] = useState(() => dayjs());
  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(id);
  }, []);

  const win = getRoundWindow(round, now);
  const { phase, secondsLeft, target } = win;

  // Urgency tones — only meaningful while the round is open.
  const tone =
    phase === 'closed'      ? { ring: '#bfbfbf', text: '#8c8c8c', bg: '#fafafa', border: '#f0f0f0', accent: '#8c8c8c', pulse: false } :
    phase === 'upcoming'    ? { ring: '#1677ff', text: '#0958d9', bg: '#f0f5ff', border: '#adc6ff', accent: '#1677ff', pulse: false } :
    secondsLeft < 5 * 60    ? { ring: '#ff4d4f', text: '#a8071a', bg: '#fff1f0', border: '#ffa39e', accent: '#ff4d4f', pulse: true  } :
    secondsLeft < 30 * 60   ? { ring: '#fa8c16', text: '#ad4e00', bg: '#fff7e6', border: '#ffd591', accent: '#fa8c16', pulse: false } :
                              { ring: '#1a7c3e', text: '#0f3d22', bg: '#f6ffed', border: '#b7eb8f', accent: '#1a7c3e', pulse: false };

  const statusTag =
    phase === 'open'     ? <Tag color="success" style={{ margin: 0 }}>กำลังเปิด</Tag> :
    phase === 'upcoming' ? <Tag color="processing" style={{ margin: 0 }}>เปิดเร็ว ๆ นี้</Tag> :
                           <Tag style={{ margin: 0 }}>ปิดแล้ว</Tag>;

  const captionLabel =
    phase === 'open'     ? 'ปิดประมูลใน' :
    phase === 'upcoming' ? 'เปิดประมูลใน' :
                           'รอบปิดเมื่อ';

  const roundLabel = `${round.name} (${round.startTime}–${round.endTime})`;

  return (
    <Card
      styles={{ body: { padding: '14px 18px' } }}
      style={{
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        borderLeft: `4px solid ${tone.accent}`,
      }}
    >
      <Row gutter={[16, 12]} align="middle" justify="space-between">
        {/* Left: round label + status */}
        <Col xs={24} md="auto">
          <Space size={6} wrap>
            <span
              className={tone.pulse ? 'animate-pulse' : ''}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: tone.accent, display: 'inline-block',
                boxShadow: tone.pulse ? `0 0 0 4px ${tone.accent}33` : 'none',
              }}
            />
            <Text strong style={{ fontSize: 13, color: tone.text }}>
              {roundLabel}
            </Text>
            {statusTag}
          </Space>
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
            {phase === 'closed'
              ? `รอบนี้สิ้นสุดเมื่อ ${target.format('HH:mm')} น.`
              : `${captionLabel} ${target.format('HH:mm')} น.`}
          </div>
        </Col>

        {/* Right: big digital countdown — right-aligned */}
        <Col xs={24} md="auto">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#8c8c8c', letterSpacing: 1, textTransform: 'uppercase' }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {captionLabel}
            </div>
            <div
              style={{
                fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
                fontSize: 36,
                fontWeight: 800,
                color: tone.text,
                lineHeight: 1.1,
                letterSpacing: 2,
                textShadow: tone.pulse ? `0 0 12px ${tone.accent}55` : 'none',
              }}
            >
              {phase === 'closed' ? '00:00:00' : formatHMS(secondsLeft)}
            </div>
            <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 2 }}>
              ชั่วโมง : นาที : วินาที
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
}
