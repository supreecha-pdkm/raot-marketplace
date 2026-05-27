'use client';

import { useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Tabs, Tag, Table, Button, Space, Typography, Alert, Select,
  DatePicker, Row, Col, Card, App as AntApp,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  NotificationOutlined, ClockCircleOutlined, CheckCircleOutlined,
  FilterOutlined, TrophyOutlined, ReloadOutlined,
} from '@ant-design/icons';
import {
  getAuctionRounds, getRoundWindow, type AuctionRound,
} from '../services/auction-rounds';
import {
  announceWinners, getAnnouncementForRound, getBidsForRound, topBidPerRow,
  type BidCandidate, type RowWinner, type RoundAnnouncement,
} from '../services/auction-results';
import { RUBBER_ROWS, type RubberRow } from '../services/auction-mock';
import { ALL_MARKETS } from '../utils/auction-constants';
import LotDetailDrawer, { type LotDetailTarget } from './lot-detail-drawer';
import { getSession } from '@/features/auth/services/auth';

const { Text } = Typography;

interface RoundRow {
  key:          string;
  round:        AuctionRound;
  rows:         RubberRow[];
  announcement: RoundAnnouncement | null;
}

export default function AnnouncementShell() {
  const { modal, message } = AntApp.useApp();
  const [tick, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);

  const [filterMarket,      setFilterMarket]      = useState<string>('all');
  const [filterAuctionType, setFilterAuctionType] = useState<string>('all');
  const [filterDate,        setFilterDate]        = useState<Dayjs | null>(null);
  const [detailTarget,      setDetailTarget]      = useState<LotDetailTarget | null>(null);

  const now = dayjs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allRounds = useMemo(() => getAuctionRounds(), [tick]);

  const { pendingRows, announcedRows } = useMemo(() => {
    const pending: RoundRow[]   = [];
    const announced: RoundRow[] = [];

    for (const r of allRounds) {
      const phase = getRoundWindow(r, now).phase;
      if (phase !== 'closed' || !r.active) continue;
      if (filterMarket      !== 'all' && r.market      !== filterMarket)      continue;
      if (filterAuctionType !== 'all' && r.auctionType !== filterAuctionType) continue;
      if (filterDate && r.date !== filterDate.format('YYYY-MM-DD'))           continue;

      const rows         = RUBBER_ROWS.filter(row => row.market === r.market && row.auctionType === r.auctionType);
      const announcement = getAnnouncementForRound(r.id);
      const item: RoundRow = { key: r.id, round: r, rows, announcement };

      if (announcement) announced.push(item);
      else              pending.push(item);
    }

    pending.sort((a, b)   => `${a.round.date}${a.round.startTime}`.localeCompare(`${b.round.date}${b.round.startTime}`));
    announced.sort((a, b) => `${b.round.date}${b.round.startTime}`.localeCompare(`${a.round.date}${a.round.startTime}`));
    return { pendingRows: pending, announcedRows: announced };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRounds, now, tick, filterMarket, filterAuctionType, filterDate]);

  const handleAnnounce = (item: RoundRow) => {
    const { round, rows } = item;
    const top     = topBidPerRow(getBidsForRound(round, rows));
    const winners: RowWinner[] = Object.values(top).map(b => ({
      rowKey: b.rowKey, buyerId: b.buyerId, buyerLabel: b.buyerName,
      winningPrice: b.price, isMine: b.isMine,
    }));

    if (winners.length === 0) {
      message.warning(`${round.name} ไม่มีรายการประมูล — ไม่มีผู้ชนะให้ประกาศ`);
      return;
    }

    modal.confirm({
      title: `ยืนยันประกาศผู้ชนะ — ${round.name}?`,
      content: `ระบบจะส่งสถานะ "ชนะการประมูล / ไม่ได้รับคัดเลือก" ให้ผู้เสนอราคาทุกคนใน ${winners.length} รายการ — ต้องดำเนินการต่อ?`,
      okText: 'ประกาศ',
      okButtonProps: { style: { background: '#1a7c3e', borderColor: '#1a7c3e' } },
      cancelText: 'ยกเลิก',
      onOk: () => {
        announceWinners({
          roundId:     round.id,
          winners,
          announcedBy: getSession()?.user.fullName ?? 'เจ้าหน้าที่ประมูล',
        });
        message.success(`ประกาศผู้ชนะ ${round.name} เรียบร้อย`);
        refresh();
      },
    });
  };

  // ── Shared filter bar ──────────────────────────────────────────────────────
  const filterBar = (
    <Card size="small" styles={{ body: { padding: '10px 14px' } }} style={{ marginBottom: 12 }}>
      <Row gutter={[12, 8]} align="middle">
        <Col xs={24} sm="auto">
          <Space size={6}>
            <FilterOutlined style={{ color: '#8c8c8c' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>กรอง:</Text>
          </Space>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Select
            value={filterMarket}
            onChange={setFilterMarket}
            size="small"
            style={{ width: '100%' }}
            options={[
              { label: 'ทุกตลาด', value: 'all' },
              ...ALL_MARKETS.map(m => ({ label: m, value: m })),
            ]}
          />
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Select
            value={filterAuctionType}
            onChange={setFilterAuctionType}
            size="small"
            style={{ width: '100%' }}
            options={[
              { label: 'ทุกประเภทประมูล',     value: 'all'      },
              { label: 'ประมูล ณ เครือข่าย', value: 'network'  },
              { label: 'ประมูล ณ ที่ตั้ง',   value: 'location' },
            ]}
          />
        </Col>
        <Col xs={24} sm={8} md={5}>
          <DatePicker
            value={filterDate}
            onChange={setFilterDate}
            size="small"
            style={{ width: '100%' }}
            placeholder="เลือกวันที่"
            format="DD/MM/YYYY"
          />
        </Col>
        <Col xs={24} sm="auto">
          <Button
            size="small"
            type="text"
            icon={<ReloadOutlined />}
            onClick={() => { setFilterMarket('all'); setFilterAuctionType('all'); setFilterDate(null); }}
          >
            รีเซ็ต
          </Button>
        </Col>
      </Row>
    </Card>
  );

  // ── Tab: รอประกาศ — no winner column ──────────────────────────────────────
  const pendingColumns: ColumnsType<RoundRow> = [
    {
      title: 'รอบประมูล',
      render: (_, r) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{r.round.name}</Text>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.round.startTime}–{r.round.endTime} น.</div>
        </div>
      ),
    },
    {
      title: 'วันที่',
      width: 110,
      render: (_, r) => dayjs(r.round.date).format('DD/MM/YYYY'),
    },
    {
      title: 'ตลาดกลาง',
      render: (_, r) => <Text style={{ fontSize: 12 }}>{r.round.market}</Text>,
    },
    {
      title: 'ประเภทประมูล',
      width: 140,
      render: (_, r) => (
        <Tag color={r.round.auctionType === 'network' ? 'geekblue' : 'gold'}>
          {r.round.auctionType === 'network' ? 'ณ เครือข่าย' : 'ณ ที่ตั้ง'}
        </Tag>
      ),
    },
    {
      title: 'จำนวนรายการ',
      width: 120,
      align: 'center' as const,
      render: (_, r) => <Tag>{r.rows.length} รายการ</Tag>,
    },
    {
      title: 'ดำเนินการ',
      width: 150,
      align: 'center' as const,
      render: (_, r) => (
        <Button
          size="small"
          icon={<NotificationOutlined />}
          onClick={() => handleAnnounce(r)}
          style={{ background: '#1a7c3e', borderColor: '#1a7c3e', color: '#fff' }}
        >
          ประกาศผู้ชนะ
        </Button>
      ),
    },
  ];

  // ── Tab: ประกาศแล้ว — with expandable winner rows ─────────────────────────
  const announcedColumns: ColumnsType<RoundRow> = [
    {
      title: 'รอบประมูล',
      render: (_, r) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{r.round.name}</Text>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.round.startTime}–{r.round.endTime} น.</div>
        </div>
      ),
    },
    {
      title: 'วันที่',
      width: 110,
      render: (_, r) => dayjs(r.round.date).format('DD/MM/YYYY'),
    },
    {
      title: 'ตลาดกลาง',
      render: (_, r) => <Text style={{ fontSize: 12 }}>{r.round.market}</Text>,
    },
    {
      title: 'ประเภทประมูล',
      width: 140,
      render: (_, r) => (
        <Tag color={r.round.auctionType === 'network' ? 'geekblue' : 'gold'}>
          {r.round.auctionType === 'network' ? 'ณ เครือข่าย' : 'ณ ที่ตั้ง'}
        </Tag>
      ),
    },
    {
      title: 'จำนวนรายการ',
      width: 120,
      align: 'center' as const,
      render: (_, r) => <Tag color="success">{r.rows.length} รายการ</Tag>,
    },
    {
      title: 'ประกาศโดย',
      width: 160,
      render: (_, r) => <Text style={{ fontSize: 12 }}>{r.announcement?.announcedBy ?? '—'}</Text>,
    },
    {
      title: 'วันที่ประกาศ',
      width: 140,
      render: (_, r) => r.announcement
        ? <Text style={{ fontSize: 12 }}>{dayjs(r.announcement.announcedAt).format('DD/MM/YYYY HH:mm')}</Text>
        : '—',
    },
  ];

  // ── Pending expand — lots + top bid, no winner column ────────────────────
  const pendingExpandedRowRender = (r: RoundRow) => {
    const top = topBidPerRow(getBidsForRound(r.round, r.rows));
    type LotRow = RubberRow & { topBid: BidCandidate | undefined };
    const data: LotRow[] = r.rows.map(row => ({ ...row, topBid: top[row.key] }));
    return (
      <Table<LotRow>
        size="small"
        pagination={false}
        rowKey="key"
        dataSource={data}
        style={{ background: '#fffbe6', margin: '0 0 4px' }}
        onRow={(row) => ({
          style: { cursor: 'pointer' },
          onClick: () => setDetailTarget({ row, round: r.round }),
        })}
        columns={[
          {
            title: 'ชนิดยาง / เกรด',
            render: (row: LotRow) => (
              <div>
                <div style={{ fontWeight: 500, fontSize: 12 }}>{row.typeName}</div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  {row.grade} ({row.gradeCode})
                  {row.isEudr && <span className="badge-eudr" style={{ marginLeft: 6 }}>EUDR</span>}
                </div>
              </div>
            ),
          },
          {
            title: 'น้ำหนักประมาณ',
            align: 'right' as const,
            render: (row: LotRow) => (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {row.estimatedWeight.toLocaleString()} กก.
              </Text>
            ),
          },
          {
            title: 'ราคาเปิด',
            align: 'right' as const,
            render: (row: LotRow) => (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {row.openingPrice.toFixed(2)} ฿/กก.
              </Text>
            ),
          },
          {
            title: 'ราคาสูงสุด',
            align: 'right' as const,
            render: (row: LotRow) => row.topBid
              ? <Text strong style={{ color: '#1a7c3e', fontSize: 12 }}>{row.topBid.price.toFixed(2)} ฿/กก.</Text>
              : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
          },
        ]}
      />
    );
  };

  // ── Announced expand — winner details per lot ─────────────────────────────
  const expandedRowRender = (r: RoundRow) => {
    const winners = r.announcement?.winners ?? [];
    const data = winners.map(w => ({ ...w, row: r.rows.find(row => row.key === w.rowKey) as RubberRow | undefined }));
    return (
      <Table<RowWinner & { row?: RubberRow }>
        size="small"
        pagination={false}
        rowKey="rowKey"
        dataSource={data}
        style={{ background: '#f6fff9', margin: '0 0 4px' }}
        onRow={(w) => ({
          style: w.row ? { cursor: 'pointer' } : undefined,
          onClick: () => { if (w.row) setDetailTarget({ row: w.row, round: r.round }); },
        })}
        columns={[
          {
            title: 'ชนิดยาง / เกรด',
            render: (w) => w.row ? (
              <div>
                <div style={{ fontWeight: 500, fontSize: 12 }}>{w.row.typeName}</div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>{w.row.grade} ({w.row.gradeCode})</div>
              </div>
            ) : w.rowKey,
          },
          {
            title: 'ผู้ชนะ',
            render: (w) => (
              <Space size={4}>
                <TrophyOutlined style={{ color: '#1a7c3e', fontSize: 12 }} />
                <Text style={{ fontSize: 12 }}>{w.buyerLabel}</Text>
              </Space>
            ),
          },
          {
            title: 'ราคาที่ชนะ',
            align: 'right' as const,
            render: (w) => (
              <Text strong style={{ color: '#1a7c3e', fontSize: 12 }}>
                {w.winningPrice.toFixed(2)} ฿/กก.
              </Text>
            ),
          },
        ]}
      />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert
        type="info"
        showIcon
        icon={<NotificationOutlined />}
        title="ประกาศผู้ชนะการประมูล"
        description="รอบประมูลที่หมดเวลาแล้วจะรอให้เจ้าหน้าที่กดประกาศผู้ชนะก่อน ผู้ซื้อจึงจะเห็นสถานะชนะการประมูล/ไม่ได้รับคัดเลือกของตน"
      />

      <Tabs
        items={[
          {
            key: 'pending',
            label: (
              <span>
                <ClockCircleOutlined /> รอประกาศ
                <Tag style={{ marginLeft: 6 }} color={pendingRows.length > 0 ? 'orange' : 'default'}>
                  {pendingRows.length}
                </Tag>
              </span>
            ),
            children: (
              <>
                {filterBar}
                <Table<RoundRow>
                  size="small"
                  rowKey="key"
                  dataSource={pendingRows}
                  columns={pendingColumns}
                  expandable={{
                    expandedRowRender: pendingExpandedRowRender,
                    rowExpandable: (r) => r.rows.length > 0,
                  }}
                  pagination={{ pageSize: 20, showSizeChanger: false, hideOnSinglePage: true }}
                  locale={{ emptyText: 'ไม่มีรอบที่รอประกาศในขณะนี้' }}
                />
              </>
            ),
          },
          {
            key: 'announced',
            label: (
              <span>
                <CheckCircleOutlined /> ประกาศแล้ว
                <Tag style={{ marginLeft: 6 }}>{announcedRows.length}</Tag>
              </span>
            ),
            children: (
              <>
                {filterBar}
                <Table<RoundRow>
                  size="small"
                  rowKey="key"
                  dataSource={announcedRows}
                  columns={announcedColumns}
                  expandable={{
                    expandedRowRender,
                    rowExpandable: (r) => (r.announcement?.winners.length ?? 0) > 0,
                  }}
                  pagination={{ pageSize: 20, showSizeChanger: false, hideOnSinglePage: true }}
                  locale={{ emptyText: 'ยังไม่มีรอบที่ประกาศผล' }}
                />
              </>
            ),
          },
        ]}
      />
      <LotDetailDrawer
        target={detailTarget}
        onClose={() => setDetailTarget(null)}
      />
    </div>
  );
}
