'use client';

import { useMemo, useState } from 'react';
import InputNumberSuffix from '@/shared/components/input-number-suffix';
import {
  Card, Button, Modal, Form, Select, Row, Col, Typography,
  Segmented, Empty, Tag, App, Tooltip, Tabs, Badge,
} from 'antd';
import {
  BarChartOutlined, PlusOutlined, ArrowUpOutlined, ArrowDownOutlined,
  RiseOutlined, UserOutlined, DownOutlined, UpOutlined, FileTextOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import MatchingPanel from '@/features/bid-ask/components/matching-panel';
import {
  MOCK_MATCHES, myMatches, getMatchStage,
  type Match,
} from '@/features/bid-ask/services/bidask-match-data';

const ROW_LIMIT = 10;

const { Option } = Select;
const { Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Offer {
  id: string;
  rubberType: string;   // RSS3 / CL / Latex / USS3
  price: number;
  quantity: number;
  by: string;
  mine?: boolean;
}

const RUBBER_TYPES = [
  { label: 'ยางแผ่นรมควัน RSS3', value: 'RSS3',  lastPrice: 70.50 },
  { label: 'ยางก้อนถ้วย (CL)',    value: 'CL',    lastPrice: 45.75 },
  { label: 'น้ำยางสด',            value: 'Latex', lastPrice: 52.25 },
  { label: 'ยางแผ่นดิบ USS3',     value: 'USS3',  lastPrice: 63.00 },
];

// ─── Mock order book ──────────────────────────────────────────────────────────
const INITIAL_BIDS: Offer[] = [
  { id: 'B01', rubberType: 'RSS3',  price: 70.50, quantity: 4800, by: 'ผู้ซื้อ A' },
  { id: 'B02', rubberType: 'RSS3',  price: 70.25, quantity: 3200, by: 'ผู้ซื้อ B' },
  { id: 'B03', rubberType: 'RSS3',  price: 70.00, quantity: 8500, by: 'ผู้ซื้อ C' },
  { id: 'B04', rubberType: 'RSS3',  price: 69.75, quantity: 2100, by: 'ผู้ซื้อ D' },
  { id: 'B05', rubberType: 'RSS3',  price: 69.50, quantity: 6400, by: 'ผู้ซื้อ E' },
  { id: 'B13', rubberType: 'RSS3',  price: 69.25, quantity: 3900, by: 'ผู้ซื้อ M' },
  { id: 'B14', rubberType: 'RSS3',  price: 69.00, quantity: 5500, by: 'ผู้ซื้อ N' },
  { id: 'B15', rubberType: 'RSS3',  price: 68.75, quantity: 2700, by: 'ผู้ซื้อ O' },
  { id: 'B16', rubberType: 'RSS3',  price: 68.50, quantity: 7200, by: 'ผู้ซื้อ P' },
  { id: 'B17', rubberType: 'RSS3',  price: 68.25, quantity: 1500, by: 'ผู้ซื้อ Q' },
  { id: 'B18', rubberType: 'RSS3',  price: 68.00, quantity: 4100, by: 'ผู้ซื้อ R' },
  { id: 'B19', rubberType: 'RSS3',  price: 67.75, quantity: 9000, by: 'ผู้ซื้อ S' },
  { id: 'B06', rubberType: 'CL',    price: 45.75, quantity: 3000, by: 'ผู้ซื้อ F' },
  { id: 'B07', rubberType: 'CL',    price: 45.50, quantity: 5200, by: 'ผู้ซื้อ G' },
  { id: 'B08', rubberType: 'CL',    price: 45.00, quantity: 7800, by: 'ผู้ซื้อ H' },
  { id: 'B09', rubberType: 'Latex', price: 52.25, quantity: 4000, by: 'ผู้ซื้อ I' },
  { id: 'B10', rubberType: 'Latex', price: 52.00, quantity: 6100, by: 'ผู้ซื้อ J' },
  { id: 'B11', rubberType: 'USS3',  price: 63.00, quantity: 1800, by: 'ผู้ซื้อ K' },
  { id: 'B12', rubberType: 'USS3',  price: 62.50, quantity: 2400, by: 'ผู้ซื้อ L' },
];

const INITIAL_ASKS: Offer[] = [
  { id: 'A01', rubberType: 'RSS3',  price: 70.75, quantity: 2200, by: 'ผู้ขาย α' },
  { id: 'A02', rubberType: 'RSS3',  price: 71.00, quantity: 5500, by: 'ผู้ขาย β' },
  { id: 'A03', rubberType: 'RSS3',  price: 71.25, quantity: 3800, by: 'ผู้ขาย γ' },
  { id: 'A04', rubberType: 'RSS3',  price: 71.50, quantity: 7100, by: 'ผู้ขาย δ' },
  { id: 'A05', rubberType: 'RSS3',  price: 72.00, quantity: 1900, by: 'ผู้ขาย ε' },
  { id: 'A13', rubberType: 'RSS3',  price: 72.25, quantity: 4400, by: 'ผู้ขาย ν' },
  { id: 'A14', rubberType: 'RSS3',  price: 72.50, quantity: 2600, by: 'ผู้ขาย ξ' },
  { id: 'A15', rubberType: 'RSS3',  price: 72.75, quantity: 6800, by: 'ผู้ขาย ο' },
  { id: 'A16', rubberType: 'RSS3',  price: 73.00, quantity: 3100, by: 'ผู้ขาย π' },
  { id: 'A17', rubberType: 'RSS3',  price: 73.25, quantity: 5900, by: 'ผู้ขาย ρ' },
  { id: 'A18', rubberType: 'RSS3',  price: 73.50, quantity: 2000, by: 'ผู้ขาย σ' },
  { id: 'A19', rubberType: 'RSS3',  price: 73.75, quantity: 4700, by: 'ผู้ขาย τ' },
  { id: 'A06', rubberType: 'CL',    price: 46.00, quantity: 4200, by: 'ผู้ขาย ζ' },
  { id: 'A07', rubberType: 'CL',    price: 46.50, quantity: 6300, by: 'ผู้ขาย η' },
  { id: 'A08', rubberType: 'CL',    price: 47.00, quantity: 2900, by: 'ผู้ขาย θ' },
  { id: 'A09', rubberType: 'Latex', price: 52.50, quantity: 3500, by: 'ผู้ขาย ι' },
  { id: 'A10', rubberType: 'Latex', price: 53.00, quantity: 5000, by: 'ผู้ขาย κ' },
  { id: 'A11', rubberType: 'USS3',  price: 63.25, quantity: 1600, by: 'ผู้ขาย λ' },
  { id: 'A12', rubberType: 'USS3',  price: 63.75, quantity: 2800, by: 'ผู้ขาย μ' },
];

// ─── Color tokens ─────────────────────────────────────────────────────────────
const BID_COLORS = {
  header: '#389e0d',
  headerBg: '#52c41a',
  border: '#b7eb8f',
  surface: '#f6ffed',
  rowTint: 'rgba(82,196,26,0.18)',
  priceText: '#237804',
  subHeadBg: '#d9f7be',
};

const ASK_COLORS = {
  header: '#cf1322',
  headerBg: '#ff4d4f',
  border: '#ffa39e',
  surface: '#fff1f0',
  rowTint: 'rgba(255,77,79,0.18)',
  priceText: '#a8071a',
  subHeadBg: '#ffccc7',
};

// ─── Order-book row ───────────────────────────────────────────────────────────
function OrderRow({
  offer, maxQty, side, cumulativeWeight, totalWeight, onDelete,
}: {
  offer: Offer;
  maxQty: number;
  side: 'bid' | 'ask';
  cumulativeWeight: number;   // sum from top of book down to & incl. this row
  totalWeight: number;        // total weight on this side
  onDelete?: (offer: Offer) => void;
}) {
  const c = side === 'bid' ? BID_COLORS : ASK_COLORS;
  const pct = Math.min(100, (offer.quantity / maxQty) * 100);
  const remaining = Math.max(0, totalWeight - cumulativeWeight);
  const sideLabel = side === 'bid' ? 'เสนอซื้อ' : 'เสนอขาย';

  return (
    <Tooltip
      placement={side === 'bid' ? 'right' : 'left'}
      title={
        <div style={{ fontSize: 12, lineHeight: 1.6 }}>
          <div><strong>ราคา:</strong> {offer.price.toFixed(2)} ฿/กก.</div>
          <div><strong>ปริมาณในแถว:</strong> {offer.quantity.toLocaleString()} กก.</div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: 4, paddingTop: 4 }}>
            <div><strong>สะสมถึงราคานี้:</strong> {cumulativeWeight.toLocaleString()} กก.</div>
            <div><strong>น้ำหนักคงเหลือในฝั่ง{sideLabel}:</strong> {remaining.toLocaleString()} กก.</div>
          </div>
        </div>
      }
    >
      <div
        style={{
          position: 'relative',
          padding: '8px 14px',
          borderBottom: `1px solid ${c.border}`,
          display: 'flex',
          alignItems: 'center',
          fontSize: 13,
          cursor: 'pointer',
          transition: 'background 0.12s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = c.rowTint; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0, bottom: 0, right: 0,
            width: `${pct}%`,
            background: c.rowTint,
            pointerEvents: 'none',
          }}
        />
        <div style={{ flex: 1, fontWeight: 700, color: c.priceText, zIndex: 1 }}>
          {offer.price.toFixed(2)}
        </div>
        <div style={{ flex: 1, textAlign: 'right', fontWeight: 500, color: '#1a1a2e', zIndex: 1 }}>
          {offer.quantity.toLocaleString()}
        </div>
        <div style={{ flex: 1, textAlign: 'right', fontSize: 11, color: '#8c8c8c', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
          {offer.mine ? (
            <>
              <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>
                <UserOutlined style={{ marginRight: 2 }} />
                คุณ
              </Tag>
              {onDelete && (
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  style={{ height: 22, padding: '0 4px' }}
                  onClick={(e) => { e.stopPropagation(); onDelete(offer); }}
                  title="ลบคำเสนอ"
                />
              )}
            </>
          ) : (
            <span style={{ color: '#bfbfbf' }}>—</span>
          )}
        </div>
      </div>
    </Tooltip>
  );
}

// ─── Side column (bid or ask) ─────────────────────────────────────────────────
function SideColumn({
  side, offers, maxQty, onDelete,
}: {
  side: 'bid' | 'ask';
  offers: Offer[];
  maxQty: number;
  onDelete?: (offer: Offer) => void;
}) {
  const c = side === 'bid' ? BID_COLORS : ASK_COLORS;
  const title = side === 'bid' ? 'เสนอซื้อ (Bid)' : 'เสนอขาย (Ask)';
  const Icon  = side === 'bid' ? ArrowUpOutlined : ArrowDownOutlined;

  const [expanded, setExpanded] = useState(false);
  const hasMore = offers.length > ROW_LIMIT;
  const visibleOffers = expanded ? offers : offers.slice(0, ROW_LIMIT);
  const hiddenCount = offers.length - ROW_LIMIT;

  return (
    <div
      style={{
        border: `1px solid ${c.border}`,
        borderRadius: 8,
        overflow: 'hidden',
        background: c.surface,
      }}
    >
      <div
        style={{
          padding: '10px 14px',
          background: c.headerBg,
          color: '#fff',
          fontWeight: 600,
          fontSize: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span><Icon style={{ marginRight: 6 }} />{title}</span>
        <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.9 }}>
          {offers.length} รายการ
        </span>
      </div>

      <div
        style={{
          padding: '6px 14px',
          background: c.subHeadBg,
          display: 'flex',
          fontSize: 11,
          color: c.header,
          fontWeight: 600,
        }}
      >
        <div style={{ flex: 1 }}>ราคา (฿/กก.)</div>
        <div style={{ flex: 1, textAlign: 'right' }}>ปริมาณ (กก.)</div>
        <div style={{ flex: 1, textAlign: 'right' }}>โดย</div>
      </div>

      {offers.length === 0 ? (
        <div style={{ padding: '40px 16px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={side === 'bid' ? 'ยังไม่มีคำเสนอซื้อ' : 'ยังไม่มีคำเสนอขาย'}
          />
        </div>
      ) : (
        <>
          <div>
            {(() => {
              // Cumulative uses the FULL offers list so hover totals stay consistent
              // whether the user has expanded or not.
              const totalWeight = offers.reduce((s, o) => s + o.quantity, 0);
              let running = 0;
              return offers.map((o, idx) => {
                running += o.quantity;
                if (idx >= visibleOffers.length) return null;
                return (
                  <OrderRow
                    key={o.id}
                    offer={o}
                    maxQty={maxQty}
                    side={side}
                    cumulativeWeight={running}
                    totalWeight={totalWeight}
                    onDelete={onDelete}
                  />
                );
              });
            })()}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded(e => !e)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                borderTop: `1px solid ${c.border}`,
                background: c.subHeadBg,
                color: c.header,
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = c.rowTint; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = c.subHeadBg; }}
            >
              {expanded ? (
                <>
                  <UpOutlined style={{ fontSize: 10 }} />
                  ย่อรายการ
                </>
              ) : (
                <>
                  <DownOutlined style={{ fontSize: 10 }} />
                  ดูเพิ่มเติม ({hiddenCount.toLocaleString()} รายการ)
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BidAskPage() {
  const { message, modal } = App.useApp();
  const [rubberType, setRubberType] = useState<string>('RSS3');
  const [viewMode, setViewMode]     = useState<'all' | 'mine'>('all');
  const [bids, setBids] = useState<Offer[]>(INITIAL_BIDS);
  const [asks] = useState<Offer[]>(INITIAL_ASKS);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  // Matching state — seeded from shared mock, filtered to matches where buyer = "me"
  const [matches, setMatches] = useState<Match[]>(() => myMatches('buyer', MOCK_MATCHES));

  // Count matches awaiting my action (for tab badge)
  const pendingMatchCount = useMemo(() => matches.filter((m) => {
    const stage = getMatchStage(m);
    if (stage === 'awaiting_match') return true;
    if (stage === 'awaiting_counterparty' && !m.buyerMatchedAt) return true;
    if (stage === 'contract_drafted' && !m.buyerSignedAt) return true;
    if (stage === 'contract_signed') return true;  // buyer must pay
    return false;
  }).length, [matches]);

  const typeMeta = RUBBER_TYPES.find(t => t.value === rubberType)!;
  const onlyMine = viewMode === 'mine';

  const filteredBids = useMemo(
    () => bids
      .filter(b => b.rubberType === rubberType && (!onlyMine || b.mine))
      .sort((a, b) => b.price - a.price),
    [bids, rubberType, onlyMine]
  );
  const filteredAsks = useMemo(
    () => asks
      .filter(a => a.rubberType === rubberType && (!onlyMine || a.mine))
      .sort((a, b) => a.price - b.price),
    [asks, rubberType, onlyMine]
  );

  const maxQty = Math.max(
    1,
    ...filteredBids.map(b => b.quantity),
    ...filteredAsks.map(a => a.quantity),
  );

  // Delete one of my own bids (only allowed before any contract stage is reached).
  // In the order-book model, a row only exists in the book until it matches; a
  // matched row moves to the "การจับคู่ของฉัน" tab (Match) and is governed by
  // MatchingPanel's own delete rules (blocked once contract is signed).
  const handleDeleteBid = (offer: Offer) => {
    if (!offer.mine) return;
    modal.confirm({
      title: 'ลบคำเสนอซื้อ?',
      content: `ต้องการลบคำเสนอซื้อ ${offer.rubberType} ราคา ${offer.price.toFixed(2)} ฿/กก. ปริมาณ ${offer.quantity.toLocaleString()} กก. หรือไม่?`,
      okText: 'ลบ',
      okButtonProps: { danger: true },
      cancelText: 'ยกเลิก',
      onOk: () => {
        setBids(prev => prev.filter(b => b.id !== offer.id));
        message.success('ลบคำเสนอซื้อแล้ว');
      },
    });
  };

  // Create offer → add to Bid table.
  // Duplicate policy: if same rubberType+price exists, still list as a SEPARATE row.
  const handleCreate = (values: { rubberType: string; price: number; quantity: number }) => {
    const duplicate = bids.some(
      b => b.rubberType === values.rubberType &&
           Math.abs(b.price - values.price) < 0.001
    );
    setBids(prev => [...prev, {
      id: `B-${Date.now()}`,
      rubberType: values.rubberType,
      price:      values.price,
      quantity:   values.quantity,
      by:         'คุณ',
      mine:       true,
    }]);
    message.success(
      duplicate
        ? 'มีคำเสนอราคานี้อยู่แล้ว — เพิ่มเป็นรายการแยก'
        : 'เพิ่มคำเสนอซื้อแล้ว'
    );
    setRubberType(values.rubberType);
    form.resetFields();
    setOpen(false);
  };

  // ── Board tab content (existing UI) ──────────────────────────────────────
  const boardCard = (
    <Card
      title={
        <span>
          <BarChartOutlined style={{ marginRight: 8 }} />
          กระดานเสนอซื้อ/ขาย (Bid / Ask Board)
        </span>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
          สร้างข้อเสนอซื้อ
        </Button>
      }
      styles={{ body: { paddingTop: 16 } }}
    >
        {/* Top strip: rubber type + view-mode filter + last price */}
        <Row gutter={[16, 12]} align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} md="auto">
            <Segmented
              value={rubberType}
              onChange={v => setRubberType(v as string)}
              block
              options={RUBBER_TYPES.map(t => ({ label: t.label, value: t.value }))}
            />
          </Col>
          <Col xs={24} md="auto">
            <Segmented
              value={viewMode}
              onChange={v => setViewMode(v as 'all' | 'mine')}
              block
              options={[
                { label: 'ทั้งหมด',         value: 'all' },
                { label: 'เฉพาะของฉัน',     value: 'mine' },
              ]}
            />
          </Col>
          <Col flex="auto" />
          <Col xs={24} md="auto">
            <div style={{ textAlign: 'right' }}>
              <Text type="secondary" style={{ fontSize: 11 }}>ราคาอ้างอิง</Text>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#1a7c3e' }}>
                <RiseOutlined style={{ marginRight: 4 }} />
                {typeMeta.lastPrice.toFixed(2)}{' '}
                <span style={{ fontSize: 11, fontWeight: 400, color: '#8c8c8c' }}>฿/กก.</span>
              </div>
            </div>
          </Col>
        </Row>

        {/* Two side-by-side order tables */}
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <SideColumn key={`bid-${rubberType}-${viewMode}`} side="bid" offers={filteredBids} maxQty={maxQty} onDelete={handleDeleteBid} />
          </Col>
          <Col xs={24} md={12}>
            <SideColumn key={`ask-${rubberType}-${viewMode}`} side="ask" offers={filteredAsks} maxQty={maxQty} />
          </Col>
        </Row>

        {/* Hint */}
        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: '#8c8c8c' }}>
          คำเสนอของคุณจะถูกเพิ่มในฝั่ง <span style={{ color: BID_COLORS.priceText, fontWeight: 600 }}>เสนอซื้อ (Bid)</span>
          {' '}· คำเสนอที่ซ้ำกันจะแสดงแยกเป็นคนละรายการ · ชี้เมาส์ที่แถวเพื่อดูน้ำหนักคงเหลือ
          {' '}· แสดงได้สูงสุด {ROW_LIMIT} รายการต่อฝั่ง — คลิก “ดูเพิ่มเติม” เพื่อขยาย
        </div>
      </Card>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <Tabs
        defaultActiveKey="board"
        items={[
          {
            key: 'board',
            label: <span><BarChartOutlined style={{ marginRight: 6 }} />กระดาน Bid / Ask</span>,
            children: boardCard,
          },
          {
            key: 'matching',
            label: (
              <span>
                <FileTextOutlined style={{ marginRight: 6 }} />
                การจับคู่ของฉัน
                {pendingMatchCount > 0 && (
                  <Badge count={pendingMatchCount} size="small" style={{ marginLeft: 6, background: '#fa8c16' }} />
                )}
              </span>
            ),
            children: (
              <MatchingPanel
                matches={matches}
                setMatches={setMatches}
                viewerRole="buyer"
              />
            ),
          },
        ]}
      />

      {/* ── Create offer modal ─────────────────────────────────────────── */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        title={
          <span>
            <PlusOutlined style={{ marginRight: 8, color: BID_COLORS.priceText }} />
            สร้างคำเสนอซื้อ (Bid)
          </span>
        }
        okText="เพิ่มเข้ากระดาน"
        width={440}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ rubberType, price: typeMeta.lastPrice }}
          style={{ marginTop: 12 }}
        >
          <Form.Item label="ชนิดยาง" name="rubberType" rules={[{ required: true }]}>
            <Select placeholder="เลือกชนิดยาง">
              {RUBBER_TYPES.map(t => (
                <Option key={t.value} value={t.value}>{t.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="ราคาที่ต้องการซื้อ"
                name="price"
                rules={[{ required: true, message: 'กรุณากรอกราคา' }]}
              >
                <InputNumberSuffix
                  style={{ width: '100%' }}
                  step={0.25}
                  precision={2}
                  suffix="฿/กก."
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="ปริมาณ"
                name="quantity"
                rules={[{ required: true, message: 'กรุณากรอกปริมาณ' }]}
              >
                <InputNumberSuffix
                  style={{ width: '100%' }}
                  step={100}
                  min={100}
                  suffix="กก."
                />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: -4 }}>
            * คำเสนอที่ซ้ำกับของผู้อื่น จะถูกแสดงแยกเป็นคนละรายการในกระดาน
          </div>
        </Form>
      </Modal>
    </div>
  );
}
