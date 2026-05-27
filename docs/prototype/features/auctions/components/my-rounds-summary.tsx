'use client';

/**
 * Buyer-side summary card listing rounds the user has placed offers in
 * (across the persisted `raot_my_offers` store) along with their phase /
 * announcement status:
 *
 *   • รอบยังเปิด  — live, can still edit on the board tab
 *   • รอบปิด · รอประกาศ — officer hasn't pressed "ประกาศผู้ชนะ" yet
 *   • ประกาศแล้ว · ชนะ — show winning price + per-row chips
 *   • ประกาศแล้ว · ไม่ชนะ — show winning competitor's price for transparency
 *
 * Lives above the existing `MOCK_LOTS` history table on `HistoryTab` —
 * doesn't replace it (the LOT-level table feeds the payment flow and will
 * be reworked in Phase C/D).
 */

import { useMemo, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  Card, Tag, Table, Space, Typography, Tooltip,
} from 'antd';
import {
  TrophyOutlined, ClockCircleOutlined, NotificationOutlined,
  CheckCircleOutlined, CloseCircleOutlined, LockOutlined,
} from '@ant-design/icons';
import {
  getAuctionRounds, getRoundWindow, type AuctionRound,
} from '../services/auction-rounds';
import { getWinnerForRow } from '../services/auction-results';
import { RUBBER_ROWS } from '../services/auction-mock';
import type { RoundOffer } from '../hooks/use-offer-flow';

const { Text } = Typography;
const OFFERS_KEY = 'raot_my_offers';

interface RowItem {
  key:      string;
  round:    AuctionRound;
  phase:    'open' | 'upcoming' | 'closed';
  announced:boolean;
  offer:    RoundOffer;
  // Outcome — populated only when announced.
  isWinner?:    boolean;
  winnerLabel?: string;
  winningPrice?:number;
}

export default function MyRoundsSummary() {
  // Re-read the persisted offers every second so the badge state updates
  // shortly after the officer pushes an announcement.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1500);
    return () => clearInterval(id);
  }, []);

  const items: RowItem[] = useMemo(() => {
    if (typeof window === 'undefined') return [];
    const offers = (() => {
      try {
        return JSON.parse(localStorage.getItem(OFFERS_KEY) ?? '[]') as RoundOffer[];
      } catch {
        return [] as RoundOffer[];
      }
    })();
    if (offers.length === 0) return [];

    const rounds = getAuctionRounds();
    const now    = dayjs();
    const out: RowItem[] = [];

    for (const o of offers) {
      const round = rounds.find(r => r.id === o.roundId);
      if (!round) continue;
      const phase = getRoundWindow(round, now).phase;
      const winner = getWinnerForRow(o.roundId, o.rowKey);
      const announced = !!winner;
      const isWinner  = announced && winner!.isMine === true;
      out.push({
        key:        `${o.roundId}:${o.rowKey}`,
        round,
        phase,
        announced,
        offer:      o,
        isWinner,
        winnerLabel: winner?.buyerLabel,
        winningPrice: winner?.winningPrice,
      });
    }

    // Sort: open first, then closed-awaiting, then announced; within each,
    // newest round date first.
    const phaseRank = { open: 0, upcoming: 1, closed: 2 } as const;
    out.sort((a, b) => {
      // Announced sorts to the bottom.
      if (a.announced !== b.announced) return a.announced ? 1 : -1;
      const ra = phaseRank[a.phase];
      const rb = phaseRank[b.phase];
      if (ra !== rb) return ra - rb;
      return `${b.round.date}${b.round.startTime}`.localeCompare(`${a.round.date}${a.round.startTime}`);
    });
    return out;
    // `tick` intentionally drives re-evaluation each interval so freshly
    // persisted offers + announcements show up without a manual refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  if (items.length === 0) return null;

  return (
    <Card
      size="small"
      title={
        <Space size={6}>
          <TrophyOutlined style={{ color: '#1a7c3e' }} />
          <Text strong>การประมูลของฉัน (สถานะรอประกาศ / ผลประกาศ)</Text>
          <Tag color="default" style={{ margin: 0 }}>{items.length}</Tag>
        </Space>
      }
    >
      <Table<RowItem>
        size="small"
        pagination={false}
        rowKey="key"
        dataSource={items}
        scroll={{ x: 'max-content' }}
        columns={[
          {
            title: 'รอบประมูล / ตลาด',
            render: (it) => (
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>
                  {it.round.name} <Text type="secondary" style={{ fontSize: 11 }}>({it.round.startTime}–{it.round.endTime})</Text>
                </div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  {it.round.market} · {it.round.date}
                </div>
              </div>
            ),
          },
          {
            title: 'ชนิดยาง / เกรด',
            render: (it) => {
              const row = RUBBER_ROWS.find(r => r.key === it.offer.rowKey);
              if (!row) return <Text type="secondary">—</Text>;
              return (
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{row.typeName}</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                    {row.grade} ({row.gradeCode})
                    {row.isEudr && <span className="badge-eudr" style={{ marginLeft: 6 }}>EUDR</span>}
                  </div>
                </div>
              );
            },
          },
          {
            title: 'ราคาที่เสนอ',
            align: 'right' as const,
            render: (it) => (
              <Text strong style={{ color: '#1677ff' }}>
                {it.offer.myPrice?.toFixed(2)}
                <Text type="secondary" style={{ fontSize: 10, fontWeight: 400, marginLeft: 2 }}>฿/กก.</Text>
              </Text>
            ),
          },
          {
            title: 'สถานะ',
            render: (it) => {
              if (!it.announced) {
                if (it.phase === 'open') {
                  return <Tag color="processing">รอบยังเปิด — แก้ไขได้</Tag>;
                }
                if (it.phase === 'upcoming') {
                  return <Tag icon={<ClockCircleOutlined />}>รอเปิดรอบ</Tag>;
                }
                return (
                  <Tag color="warning" icon={<NotificationOutlined />}>
                    รอประกาศผล
                  </Tag>
                );
              }
              if (it.isWinner) {
                return (
                  <Space size={4}>
                    <Tag color="success" icon={<TrophyOutlined />} style={{ margin: 0 }}>
                      ชนะการประมูล
                    </Tag>
                    <Tag color="success" style={{ margin: 0, fontSize: 11 }}>
                      {it.winningPrice?.toFixed(2)} ฿/กก.
                    </Tag>
                  </Space>
                );
              }
              return (
                <Tooltip title={`ผู้ชนะ: ${it.winnerLabel} ที่ ${it.winningPrice?.toFixed(2)} ฿/กก.`}>
                  <Tag color="error" icon={<CloseCircleOutlined />} style={{ margin: 0 }}>
                    ไม่ได้รับคัดเลือก
                  </Tag>
                </Tooltip>
              );
            },
          },
          {
            title: 'การดำเนินการ',
            render: (it) => {
              if (it.announced && it.isWinner) {
                // Phase C will wire this to the provisional-contract surface.
                return (
                  <Tag color="processing" style={{ margin: 0, fontSize: 11 }}>
                    เตรียมออกสัญญา (Phase C)
                  </Tag>
                );
              }
              if (!it.announced && it.phase === 'closed') {
                return <Text type="secondary" style={{ fontSize: 11 }}>รอเจ้าหน้าที่ประกาศ</Text>;
              }
              if (!it.announced && it.phase === 'open') {
                return <Text type="secondary" style={{ fontSize: 11 }}>กลับไปแก้ราคาในแท็บกระดานประมูล</Text>;
              }
              return <LockOutlined style={{ color: '#bfbfbf' }} />;
            },
          },
        ]}
      />
      <div style={{ marginTop: 8, fontSize: 11, color: '#8c8c8c' }}>
        <CheckCircleOutlined style={{ marginRight: 4 }} />
        ระบบจะอัปเดตสถานะอัตโนมัติเมื่อเจ้าหน้าที่กดประกาศผู้ชนะ — ไม่ต้องรีเฟรชหน้า
      </div>
    </Card>
  );
}
