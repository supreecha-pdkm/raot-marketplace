'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card, Tag, Button, Row, Col, Select, Typography, Space,
  Segmented, Calendar, Drawer, Empty,
} from 'antd';
import {
  CalendarOutlined, AppstoreOutlined,
  LeftOutlined, RightOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import {
  AUCTION_TYPE_OPTIONS, MARKET_OPTIONS,
  type AuctionType,
} from '@/features/auctions/utils/auction-constants';
import {
  generateSchedule, scheduledRoundPhase,
  type ScheduledRound,
} from '@/features/auctions/services/auction-schedule';
import ScheduleRoundCard from './schedule-round-card';

const { Text } = Typography;

/**
 * Schedule tab for the buyer/auction page.
 *
 * Two views (toggleable):
 *   • ปฏิทิน (calendar) — full-month grid with per-day round counts +
 *     phase-colored dots. Click a date → opens a Drawer with that day's
 *     rounds.
 *   • รายการ (list) — next 7 days grouped, each day with a 3-column grid
 *     of round cards.
 *
 * Data: `generateSchedule(dayjs())` produces a stable deterministic mock.
 * Swap that call for a real API to wire up production data — the rest of
 * the panel consumes `ScheduledRound[]` and needs no further changes.
 */
export default function SchedulePanel() {
  const [now, setNow]                     = useState(() => dayjs());
  const [filterMarket,  setFilterMarket]  = useState<string>('all');
  const [filterAuction, setFilterAuction] = useState<'all' | AuctionType>('all');
  const [viewMode,      setViewMode]      = useState<'calendar' | 'list'>('calendar');
  const [calendarValue, setCalendarValue] = useState<Dayjs>(dayjs());
  const [dayDrawer,     setDayDrawer]     = useState<string | null>(null); // YYYY-MM-DD

  // Keep "now" reasonably fresh so phases shift across the day.
  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Mock schedule — generated once relative to today.
  const schedule = useMemo(() => generateSchedule(dayjs()), []);

  // Apply filters, then index by date.
  const byDate = useMemo(() => {
    const m = new Map<string, ScheduledRound[]>();
    for (const it of schedule) {
      if (filterMarket  !== 'all' && it.market      !== filterMarket)  continue;
      if (filterAuction !== 'all' && it.auctionType !== filterAuction) continue;
      const list = m.get(it.date) ?? [];
      list.push(it);
      m.set(it.date, list);
    }
    return m;
  }, [schedule, filterMarket, filterAuction]);

  // Next 7 days for the list view.
  const next7 = useMemo(() => {
    const result: { date: string; rounds: ScheduledRound[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = dayjs().add(i, 'day').format('YYYY-MM-DD');
      result.push({ date: d, rounds: byDate.get(d) ?? [] });
    }
    return result;
  }, [byDate]);

  const drawerRounds = dayDrawer ? byDate.get(dayDrawer) ?? [] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Filter / view toggle ─────────────────────────────────────────── */}
      <Card size="small" styles={{ body: { padding: 12 } }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md="auto">
            <Space size={6}>
              <CalendarOutlined style={{ color: '#1a7c3e' }} />
              <Text strong>ตารางรอบประมูล</Text>
            </Space>
          </Col>
          <Col flex="auto" />
          <Col xs={24} sm={12} md={6}>
            <Select
              value={filterAuction}
              onChange={setFilterAuction}
              size="small"
              style={{ width: '100%' }}
              options={AUCTION_TYPE_OPTIONS}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              value={filterMarket}
              onChange={setFilterMarket}
              size="small"
              style={{ width: '100%' }}
              options={MARKET_OPTIONS}
            />
          </Col>
          <Col xs={24} md="auto">
            <Segmented
              size="small"
              value={viewMode}
              onChange={v => setViewMode(v as 'calendar' | 'list')}
              options={[
                { label: <span><CalendarOutlined /> ปฏิทิน</span>, value: 'calendar' },
                { label: <span><AppstoreOutlined /> รายการ</span>,  value: 'list' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* ── Calendar view ────────────────────────────────────────────────── */}
      {viewMode === 'calendar' && (
        <Card
          styles={{ body: { padding: 12 } }}
          title={
            <Space>
              <CalendarOutlined style={{ color: '#1a7c3e' }} />
              <span>ปฏิทินรอบประมูล</span>
              <Text type="secondary" style={{ fontSize: 12 }}>
                คลิกที่วันเพื่อดูรอบประมูลทั้งหมดของวันนั้น
              </Text>
            </Space>
          }
        >
          <Calendar
            value={calendarValue}
            onChange={setCalendarValue}
            onSelect={(d, info) => {
              if (info?.source === 'date') {
                setCalendarValue(d);
                setDayDrawer(d.format('YYYY-MM-DD'));
              }
            }}
            cellRender={(date, info) => {
              if (info.type !== 'date') return null;
              const key  = date.format('YYYY-MM-DD');
              const list = byDate.get(key) ?? [];
              if (list.length === 0) return null;

              const isToday = date.isSame(dayjs(), 'day');
              const counts  = {
                upcoming: list.filter(r => scheduledRoundPhase(r, now) === 'upcoming').length,
                open:     list.filter(r => scheduledRoundPhase(r, now) === 'open').length,
                closed:   list.filter(r => scheduledRoundPhase(r, now) === 'closed').length,
              };

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
                  <div
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '1px 6px', borderRadius: 999,
                      fontSize: 10, fontWeight: 600,
                      background: isToday ? '#1a7c3e' : '#f6ffed',
                      color:      isToday ? '#fff'    : '#1a7c3e',
                      border:     `1px solid ${isToday ? '#1a7c3e' : '#b7eb8f'}`,
                      width: 'fit-content',
                    }}
                  >
                    {list.length} รอบ
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {counts.open     > 0 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#52c41a' }} title={`เปิดอยู่ ${counts.open} รอบ`} />}
                    {counts.upcoming > 0 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1677ff' }} title={`เปิดเร็ว ๆ นี้ ${counts.upcoming} รอบ`} />}
                    {counts.closed   > 0 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#bfbfbf' }} title={`ปิดแล้ว ${counts.closed} รอบ`} />}
                  </div>
                </div>
              );
            }}
            headerRender={({ value, onChange }) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px 12px', flexWrap: 'wrap', gap: 8 }}>
                <Space size={4}>
                  <Button size="small" icon={<LeftOutlined />} onClick={() => onChange(value.subtract(1, 'month'))} />
                  <Button size="small" onClick={() => { const t = dayjs(); onChange(t); setCalendarValue(t); }}>
                    วันนี้
                  </Button>
                  <Button size="small" icon={<RightOutlined />} onClick={() => onChange(value.add(1, 'month'))} />
                </Space>
                <Text strong style={{ fontSize: 16 }}>{value.format('MMMM YYYY')}</Text>
                <Space size={10}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#52c41a', marginRight: 4 }} />
                    เปิดอยู่
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#1677ff', marginRight: 4 }} />
                    เปิดเร็ว ๆ นี้
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#bfbfbf', marginRight: 4 }} />
                    ปิดแล้ว
                  </Text>
                </Space>
              </div>
            )}
          />
        </Card>
      )}

      {/* ── List view: next 7 days grouped by date ───────────────────────── */}
      {viewMode === 'list' && (
        <Card
          title={
            <Space>
              <AppstoreOutlined style={{ color: '#1a7c3e' }} />
              <span>รอบประมูลใน 7 วันข้างหน้า</span>
            </Space>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {next7.map(({ date, rounds }) => {
              const d       = dayjs(date);
              const isToday = d.isSame(dayjs(), 'day');
              return (
                <div key={date}>
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      marginBottom: 10, paddingBottom: 6,
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <Text strong style={{ fontSize: 14, color: isToday ? '#1a7c3e' : '#1a1a2e' }}>
                      {d.format('dddd D MMMM YYYY')}
                    </Text>
                    {isToday && <Tag color="success" style={{ margin: 0 }}>วันนี้</Tag>}
                    <Tag style={{ margin: 0 }}>{rounds.length} รอบ</Tag>
                  </div>
                  {rounds.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={<Text type="secondary" style={{ fontSize: 12 }}>ไม่มีรอบประมูลในวันนี้</Text>}
                      style={{ margin: '8px 0' }}
                    />
                  ) : (
                    <Row gutter={[12, 12]}>
                      {rounds.map(r => (
                        <Col xs={24} sm={12} lg={8} key={r.id}>
                          <ScheduleRoundCard item={r} phase={scheduledRoundPhase(r, now)} />
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Day detail drawer ────────────────────────────────────────────── */}
      <Drawer
        open={!!dayDrawer}
        onClose={() => setDayDrawer(null)}
        styles={{ wrapper: { width: 'min(520px, calc(100vw - 40px))' } }}
        title={
          dayDrawer
            ? (
              <Space>
                <CalendarOutlined style={{ color: '#1a7c3e' }} />
                <span>รอบประมูลวันที่ {dayjs(dayDrawer).format('dddd D MMMM YYYY')}</span>
              </Space>
            )
            : null
        }
      >
        {drawerRounds.length === 0
          ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="ไม่มีรอบประมูลในวันนี้"
              style={{ marginTop: 32 }}
            />
          )
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                ทั้งหมด <strong>{drawerRounds.length}</strong> รอบ ·
                {' '}รวม <strong>{drawerRounds.reduce((s, r) => s + r.totalLots, 0).toLocaleString()}</strong> LOT ·
                {' '}<strong>{drawerRounds.reduce((s, r) => s + r.estimatedWeightKg, 0).toLocaleString()}</strong> กก.
              </Text>
              {drawerRounds.map(r => (
                <ScheduleRoundCard key={r.id} item={r} phase={scheduledRoundPhase(r, now)} expanded />
              ))}
            </div>
          )}
      </Drawer>
    </div>
  );
}
