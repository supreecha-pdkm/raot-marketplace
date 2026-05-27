'use client';

import { useState } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Select, Badge, Typography,
  Space, Segmented, DatePicker,
} from 'antd';
import {
  TrophyOutlined, FilterOutlined, ReloadOutlined, HistoryOutlined,
  DollarOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs, { type Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { MOCK_LOTS } from '@/features/lots/services/mock-lots';
import type { AuctionLot } from '@/shared/types';
import { MARKET_OPTIONS, TYPE_OPTIONS } from '@/features/auctions/utils/auction-constants';
import { formatTappingRange, formatReceivedDate } from '@/shared/utils/tapping-format';
import MyRoundsSummary from './my-rounds-summary';

dayjs.extend(isBetween);

const { Text } = Typography;
const { Option } = Select;

// ─── Mock: which closed lots the buyer "won" ─────────────────────────────────
// Real implementation: source from the buyer's account / auction-results API.
const WON_LOT_IDS = new Set(
  MOCK_LOTS
    .filter(l => l.status === 'closed')
    .filter((_, i) => i % 2 === 0)
    .map(l => l.id),
);

type MyResult = 'win' | 'lose' | 'active' | 'cancelled';

function getMyResult(lot: AuctionLot): MyResult {
  if (lot.status === 'cancelled') return 'cancelled';
  if (lot.status === 'open' || lot.status === 'pending') return 'active';
  return WON_LOT_IDS.has(lot.id) ? 'win' : 'lose';
}

/**
 * History tab — past auctions filtered by rubber type, market, date range,
 * and win/lose result. The "ชำระเงิน" action on a won row deep-links to
 * `/buyer/payment` with lot context in the query string.
 */
export default function HistoryTab() {
  const router = useRouter();

  const [filterType,   setFilterType]   = useState<string>('all');
  const [filterMarket, setFilterMarket] = useState<string>('all');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [dateRange,    setDateRange]    = useState<[Dayjs, Dayjs] | null>(null);

  const historyLots = MOCK_LOTS.filter(l => {
    if (filterType !== 'all' && !l.rubberType.includes(
      filterType === 'rss' ? 'ยางแผ่นรมควัน' :
      filterType === 'cl'  ? 'ยางก้อนถ้วย'   :
      filterType === 'lat' ? 'น้ำยางสด'       : 'ยางแผ่นดิบ'
    )) return false;
    if (filterMarket !== 'all' && l.market !== filterMarket) return false;
    if (filterResult !== 'all') {
      const result = getMyResult(l);
      if (filterResult === 'win'  && result !== 'win')  return false;
      if (filterResult === 'lose' && result !== 'lose') return false;
    }
    if (dateRange) {
      const [from, to] = dateRange;
      const d = dayjs(l.auctionDate);
      if (!d.isBetween(from.startOf('day'), to.endOf('day'), null, '[]')) return false;
    }
    return true;
  });

  const winCount  = MOCK_LOTS.filter(l => getMyResult(l) === 'win').length;
  const loseCount = MOCK_LOTS.filter(l => getMyResult(l) === 'lose').length;

  const columns = [
    {
      title: 'LOT / ชนิดยาง',
      render: (r: AuctionLot) => {
        const result = getMyResult(r);
        return (
          <div>
            <div style={{ fontWeight: 600 }}>{r.lotNo}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{r.rubberType} · เกรด {r.grade}</div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.market}</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
              {r.isEudr && <span className="badge-eudr">EUDR</span>}
              {result === 'win' && (
                <Tag color="success" icon={<TrophyOutlined />} style={{ margin: 0, fontSize: 11 }}>
                  ยางนี้ตกเป็นของคุณ
                </Tag>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'น้ำหนัก (กก.)',
      dataIndex: 'weight',
      render: (v: number) => <span style={{ fontWeight: 500 }}>{v.toLocaleString()}</span>,
      align: 'right' as const,
    },
    {
      title: 'ราคาเปิด',
      dataIndex: 'openingPrice',
      render: (v: number) => `${v.toFixed(2)} ฿`,
      align: 'right' as const,
    },
    {
      title: 'ราคาสุดท้าย',
      dataIndex: 'currentPrice',
      render: (v: number, r: AuctionLot) => (
        <span style={{ fontWeight: 700, color: '#1a7c3e' }}>
          {(v ?? r.openingPrice).toFixed(2)} ฿
        </span>
      ),
      align: 'right' as const,
    },
    {
      title: 'เก็บ / รับยาง',
      render: (r: AuctionLot) => (
        <div style={{ fontSize: 11, lineHeight: 1.4 }}>
          {r.tappingDate && (
            <div>
              <span style={{ color: '#8c8c8c' }}>เก็บ:</span>{' '}
              <span style={{ color: '#1a1a2e', fontWeight: 500 }}>{formatTappingRange(r.tappingDate)}</span>
            </div>
          )}
          {r.receivedDate && (
            <div>
              <span style={{ color: '#8c8c8c' }}>รับ:</span>{' '}
              <span style={{ color: '#1a1a2e' }}>{formatReceivedDate(r.receivedDate)}</span>
            </div>
          )}
          {r.drc !== undefined && (
            <div>
              <span style={{ color: '#8c8c8c' }}>DRC:</span>{' '}
              <span style={{ color: '#722ed1', fontWeight: 600 }}>{r.drc}%</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'วันที่ประมูล',
      dataIndex: 'auctionDate',
      render: (v: string) => <span style={{ fontSize: 12, color: '#8c8c8c' }}>{v}</span>,
    },
    {
      title: 'ผล',
      render: (r: AuctionLot) => {
        const result = getMyResult(r);
        if (result === 'win')       return <Tag color="success"   icon={<TrophyOutlined />}>ชนะการประมูล</Tag>;
        if (result === 'lose')      return <Tag color="error"     icon={<CloseCircleOutlined />}>ไม่ได้รับคัดเลือก</Tag>;
        if (result === 'cancelled') return <Tag color="default">ยกเลิก</Tag>;
        return <Badge status="processing" text="กำลังประมูล" />;
      },
    },
    {
      title: 'การดำเนินการ',
      render: (r: AuctionLot) => {
        const result = getMyResult(r);
        if (result !== 'win') return null;
        return (
          <Button
            type="primary"
            size="small"
            icon={<DollarOutlined />}
            onClick={() => router.push(
              `/buyer/payment?lot=${r.id}&lotNo=${r.lotNo}` +
              `&amount=${((r.currentPrice ?? r.openingPrice) * r.weight).toFixed(0)}`,
            )}
          >
            ชำระเงิน
          </Button>
        );
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* My persisted offers — รอประกาศ / ประกาศแล้ว (Phase B) */}
      <MyRoundsSummary />

      {/* Filter bar */}
      <Card size="small">
        <Row gutter={[12, 8]} align="middle">
          <Col xs={24} md="auto">
            <FilterOutlined style={{ color: '#8c8c8c', marginRight: 6 }} />
            <Text type="secondary" style={{ fontSize: 13 }}>กรองประวัติ:</Text>
          </Col>

          {/* Rubber type */}
          <Col xs={24} sm={12} md="auto">
            <Select value={filterType} onChange={setFilterType} style={{ width: '100%', minWidth: 160 }} size="small">
              {TYPE_OPTIONS.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
            </Select>
          </Col>

          {/* Market */}
          <Col xs={24} sm={12} md="auto">
            <Select value={filterMarket} onChange={setFilterMarket} style={{ width: '100%', minWidth: 180 }} size="small" placeholder="ตลาดกลาง">
              {MARKET_OPTIONS.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
            </Select>
          </Col>

          {/* Date range */}
          <Col xs={24} sm={12} md="auto">
            <DatePicker.RangePicker
              size="small"
              value={dateRange}
              onChange={v => setDateRange(v as [Dayjs, Dayjs] | null)}
              placeholder={['วันเริ่มต้น', 'วันสิ้นสุด']}
              format="DD/MM/YYYY"
              style={{ width: '100%', minWidth: 220 }}
            />
          </Col>

          {/* Win / Lose result */}
          <Col xs={24} sm={12} md="auto">
            <Segmented
              size="small"
              block
              value={filterResult}
              onChange={v => setFilterResult(v as string)}
              options={[
                { label: 'ทั้งหมด', value: 'all' },
                { label: <span style={{ color: '#52c41a' }}>ชนะการประมูล</span>,        value: 'win'  },
                { label: <span style={{ color: '#ff4d4f' }}>ไม่ได้รับคัดเลือก</span>, value: 'lose' },
              ]}
            />
          </Col>

          <Col flex="auto" />

          {/* Win / Lose summary badges */}
          <Col xs={24} md="auto">
            <Space size={8} wrap>
              <Tag color="success" icon={<TrophyOutlined />}>{winCount} ชนะการประมูล</Tag>
              <Tag color="error"   icon={<CloseCircleOutlined />}>{loseCount} ไม่ได้รับคัดเลือก</Tag>
            </Space>
          </Col>

          <Col xs={24} md="auto">
            <Button
              size="small"
              icon={<ReloadOutlined />}
              block
              onClick={() => {
                setFilterType('all');
                setFilterMarket('all');
                setFilterResult('all');
                setDateRange(null);
              }}
            >
              รีเซ็ต
            </Button>
          </Col>
        </Row>
      </Card>

      {/* History table */}
      <Card
        title={
          <span>
            <HistoryOutlined style={{ marginRight: 6, color: '#595959' }} />
            ประวัติการประมูล
            <Badge count={historyLots.length} showZero color="#8c8c8c" style={{ marginLeft: 8 }} />
          </span>
        }
      >
        <Table
          dataSource={historyLots}
          columns={columns}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `ทั้งหมด ${t} รายการ` }}
          locale={{ emptyText: 'ไม่มีประวัติการประมูล' }}
          onRow={(record) => ({
            style: getMyResult(record) === 'win'
              ? { background: '#f6ffed', borderLeft: '3px solid #52c41a' }
              : {},
          })}
        />
      </Card>
    </div>
  );
}
