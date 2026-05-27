'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import InputNumberSuffix from '@/shared/components/input-number-suffix';
import {
  Card, Table, Tag, Button, Modal, Form, Input, Select, InputNumber,
  Alert, Row, Col, Typography, Statistic, Space, App, Tooltip,
  Checkbox, Descriptions, Popconfirm,
} from 'antd';
import {
  AppstoreOutlined, PlusOutlined, ScissorOutlined,
  ClockCircleOutlined, TrophyOutlined, ArrowRightOutlined,
  CarOutlined, FilterOutlined, UserOutlined,
  InboxOutlined, ExportOutlined, RollbackOutlined, ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getSession } from '@/features/auth/services/auth';
import { MASTER_PANELS } from '@/features/panels/services/master-panels';
import { getQueue, type WeighedLot, type WeighSplit } from '@/features/lots/services/lot-queue';

const { Option } = Select;
const { Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

/** Owner of a panel — either the auction winner or "waiting" (auction not closed yet) */
type PanelOwner =
  | { kind: 'waiting' }
  | { kind: 'winner'; name: string };

/**
 * One record per master-panel. The presence of `lotNo` indicates the panel
 * currently holds rubber. After a normal delivery the operational fields are
 * cleared and the panel returns to the empty pool. After a "borrowed" delivery
 * the panel keeps `borrowedByBuyer = true` and stays out of rotation.
 */
interface Panel {
  id:           string;       // ref MasterPanel.id
  code:         string;       // cached from master
  panelWeight:  number;       // capacity (cached from master)

  // current filling — undefined when empty
  lotNo?:        string;
  owner?:        PanelOwner;
  weight?:       number;      // currently held weight (kg)
  auctionRound?: string;
  filledAt?:     string;      // ISO

  // seller + rubber detail (denormalized from the weighed lot)
  sellerName?:    string;
  sellerId?:      string;
  rubberType?:    string;
  grade?:         string;
  eudrType?:      'eudr' | 'non-eudr';
  moisture?:      number;

  // auction result (for the demo we mock a few winning bids)
  pricePerKg?:    number;
  closedAt?:      string;     // ISO

  // delivery / borrow tracking
  deliveredAt?:     string;   // ISO of last delivery
  deliveredBy?:     string;   // officer fullName
  deliveredTo?:     string;   // buyer name (winner)
  borrowedByBuyer?: boolean;  // true if buyer took the panel itself
}

// Mock auction outcomes — for demo purposes a couple of weighed lots are
// already past the bidding round with a confirmed winner. Anything not
// listed here stays in 'waiting' state until the auction closes.
const MOCK_AUCTION_RESULTS: Record<string, {
  winner:       string;
  pricePerKg:   number;
  auctionRound: string;
  closedAt:     string;
}> = {
  'L004': {
    winner:       'บจก.สยามรับเบอร์ จำกัด',
    pricePerKg:   65.50,
    auctionRound: 'รอบเช้า · 21/04/2024',
    closedAt:     '2024-04-21T11:30:00',
  },
  'L002': {
    winner:       'บจก.ยางพาราใต้ จำกัด',
    pricePerKg:   38.25,
    auctionRound: 'รอบเช้า · 21/04/2024',
    closedAt:     '2024-04-21T11:45:00',
  },
};

type PanelStatus = 'empty' | 'occupied' | 'borrowed';

function statusOf(p: Panel): PanelStatus {
  if (p.borrowedByBuyer && p.deliveredAt) return 'borrowed';
  if (p.lotNo)                            return 'occupied';
  return 'empty';
}

const STATUS_CFG: Record<PanelStatus, { label: string; color: string; icon: React.ReactNode }> = {
  empty:    { label: 'ว่าง',         color: 'default',    icon: <InboxOutlined /> },
  occupied: { label: 'มียาง',        color: 'processing', icon: <AppstoreOutlined /> },
  borrowed: { label: 'ผู้ซื้อยืมไป', color: 'warning',    icon: <ExportOutlined /> },
};

// ─── Mock seed ────────────────────────────────────────────────────────────────
// Build initial panels from MASTER_PANELS. A few are pre-filled with demo lots
// so the new flows have something to work with.

// Static demo seed for the borrow flow — PNL-05 looks like an old delivery
// where the buyer kept the panel. Doesn't come from the weighing flow.
const BORROW_DEMO: Record<string, Partial<Panel>> = {
  'PNL-05': {
    deliveredAt:     '2024-04-20T15:30:00',
    deliveredBy:     'เจ้าหน้าที่ A',
    deliveredTo:     'บจก.รับเบอร์เจริญ จำกัด',
    borrowedByBuyer: true,
  },
};

/**
 * Build the panel list by joining MASTER_PANELS with the weighed-lots queue.
 * Each split in a weighed lot occupies its target panel with that lot's data,
 * so the panels page reflects whatever the weighing page just produced.
 */
function buildInitialPanels(): Panel[] {
  const fromMaster: Panel[] = MASTER_PANELS.map((m) => ({
    id: m.id,
    code: m.code,
    panelWeight: m.panelWeight,
  }));

  // Index splits → { panelId: { lot, split } } so we can fill the matching
  // panels in O(panels) overall.
  const splitIndex: Record<string, { lot: WeighedLot; split: WeighSplit }> = {};
  for (const lot of getQueue().weighed) {
    for (const split of lot.splits ?? []) {
      splitIndex[split.panelId] = { lot, split };
    }
  }

  return fromMaster.map((p) => {
    // 1. Demo-only borrow takes precedence (so the borrow flow has a row).
    if (BORROW_DEMO[p.id]) return { ...p, ...BORROW_DEMO[p.id] };
    // 2. Weighed lots populate occupancy.
    const hit = splitIndex[p.id];
    if (hit) {
      const lot     = hit.lot;
      const auction = MOCK_AUCTION_RESULTS[lot.id];
      const owner: PanelOwner = auction
        ? { kind: 'winner', name: auction.winner }
        : { kind: 'waiting' };
      return {
        ...p,
        lotNo:        lot.id,
        owner,
        weight:       hit.split.weight,
        auctionRound: auction?.auctionRound ?? 'รอประกาศ',
        filledAt:     dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        sellerName:   lot.sellerName,
        sellerId:     lot.sellerId,
        rubberType:   lot.rubberType,
        grade:        lot.grade,
        eudrType:     lot.eudrType,
        moisture:     hit.split.moisture,
        pricePerKg:   auction?.pricePerKg,
        closedAt:     auction?.closedAt,
      };
    }
    // 3. Otherwise empty.
    return p;
  });
}

const RUBBER_TYPES = ['ยางแผ่นรมควัน RSS3', 'ยางแผ่นดิบ USS3', 'ยางก้อนถ้วย', 'น้ำยางสด'];
const ROUNDS = ['รอบเช้า · 21/04/2024', 'รอบบ่าย · 21/04/2024'];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuctionOfficerPanelsPage() {
  const { message } = App.useApp();
  const [panels, setPanels] = useState<Panel[]>(buildInitialPanels);

  /**
   * Pull the latest weighed-lots → panels join. Local borrow / delivery state
   * is preserved (we keep delivery markers from the prior render); only empty
   * + occupied rows get refreshed from the weighing queue.
   */
  function syncFromWeighing() {
    setPanels((prev) => {
      const fresh = buildInitialPanels();
      const prevById = Object.fromEntries(prev.map((p) => [p.id, p]));
      return fresh.map((next) => {
        const old = prevById[next.id];
        // If the panel is currently delivered/borrowed in local state, keep it.
        if (old && (old.deliveredAt || old.borrowedByBuyer)) return old;
        return next;
      });
    });
  }

  // Re-sync whenever the user comes back to this tab (e.g. after weighing).
  useEffect(() => {
    const onFocus = () => syncFromWeighing();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | PanelStatus>('all');
  const [ownerFilter,  setOwnerFilter]  = useState<string>('all');

  // Modals
  const [fillOpen, setFillOpen] = useState(false);
  const [fillForm] = Form.useForm<{ targetId: string; lotNo: string; weight: number; auctionRound: string; rubberType: string }>();

  const [separateSource, setSeparateSource] = useState<Panel | null>(null);
  const [separateForm]   = Form.useForm<{ targetId: string; weight: number }>();

  // Row selection used by delivery
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  // Per-row "buyer borrows panel" choice for the delivery modal
  const [borrowChoice, setBorrowChoice] = useState<Record<string, boolean>>({});

  // ── Derived ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return panels
      .filter((p) => {
        if (statusFilter !== 'all' && statusOf(p) !== statusFilter) return false;
        if (ownerFilter !== 'all') {
          if (ownerFilter === 'waiting') return p.owner?.kind === 'waiting';
          if (ownerFilter === 'empty')   return statusOf(p) === 'empty';
          return p.owner?.kind === 'winner' && p.owner.name === ownerFilter;
        }
        return true;
      })
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [panels, statusFilter, ownerFilter]);

  const counts = useMemo(() => {
    const total    = panels.length;
    const empty    = panels.filter((p) => statusOf(p) === 'empty').length;
    const occupied = panels.filter((p) => statusOf(p) === 'occupied').length;
    const borrowed = panels.filter((p) => statusOf(p) === 'borrowed').length;
    return { total, empty, occupied, borrowed };
  }, [panels]);

  // Owners for the filter dropdown
  const ownerOptions = useMemo(() => {
    const winners = Array.from(
      new Set(
        panels
          .filter((p) => p.owner?.kind === 'winner')
          .map((p) => (p.owner as Extract<PanelOwner, { kind: 'winner' }>).name),
      ),
    ).sort();
    return [
      { value: 'all',     label: 'ทุกเจ้าของ' },
      { value: 'empty',   label: '— ว่าง (ไม่มียาง) —' },
      { value: 'waiting', label: 'รอประกาศผลผู้ชนะ' },
      ...winners.map((w) => ({ value: w, label: w })),
    ];
  }, [panels]);

  // Empty panels available as separation targets
  const emptyPanels = useMemo(
    () => panels.filter((p) => statusOf(p) === 'empty'),
    [panels],
  );

  // Selected rows (by id) — only occupied panels can be selected for delivery
  const selectedPanels = useMemo(
    () => panels.filter((p) => selectedKeys.includes(p.id) && statusOf(p) === 'occupied'),
    [panels, selectedKeys],
  );

  // For the delivery modal: are all selected panels owned by the same winner?
  const selectionOwnerCheck = useMemo(() => {
    if (selectedPanels.length === 0) return { ok: false, owner: null as string | null, mixed: false, hasWaiting: false };
    const names = selectedPanels.map((p) =>
      p.owner?.kind === 'winner' ? p.owner.name : '__waiting__',
    );
    const uniq = Array.from(new Set(names));
    const hasWaiting = uniq.includes('__waiting__');
    const winnerNames = uniq.filter((n) => n !== '__waiting__');
    const mixed = winnerNames.length > 1 || (hasWaiting && winnerNames.length > 0);
    return {
      ok: !hasWaiting && winnerNames.length === 1,
      owner: winnerNames.length === 1 ? winnerNames[0] : null,
      mixed,
      hasWaiting,
    };
  }, [selectedPanels]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function openFill() {
    fillForm.resetFields();
    setFillOpen(true);
  }

  function handleFill() {
    fillForm.validateFields().then((v) => {
      const target = panels.find((p) => p.id === v.targetId);
      if (!target) return;
      if (statusOf(target) !== 'empty') {
        message.error('แผงนี้ไม่ว่าง');
        return;
      }
      const now = dayjs().toISOString();
      setPanels((prev) =>
        prev.map((p) =>
          p.id === v.targetId
            ? {
                ...p,
                lotNo:        v.lotNo,
                owner:        { kind: 'waiting' },     // new lot — auction not closed yet
                weight:       v.weight,
                auctionRound: v.auctionRound,
                filledAt:     now,
              }
            : p,
        ),
      );
      message.success(`เก็บล็อต ${v.lotNo} ลงแผง ${v.targetId} แล้ว`);
      setFillOpen(false);
    });
  }

  function openSeparate(p: Panel) {
    setSeparateSource(p);
    separateForm.resetFields();
  }

  function handleSeparate() {
    if (!separateSource) return;
    separateForm.validateFields().then((v) => {
      const target = panels.find((p) => p.id === v.targetId);
      if (!target) return;
      if (statusOf(target) !== 'empty') {
        message.error('แผงปลายทางต้องว่าง');
        return;
      }
      if (v.weight >= (separateSource.weight ?? 0)) {
        message.error('น้ำหนักที่ย้ายต้องน้อยกว่าน้ำหนักในแผงต้นทาง');
        return;
      }
      const now = dayjs().toISOString();
      setPanels((prev) =>
        prev.map((p) => {
          if (p.id === separateSource.id) {
            return { ...p, weight: (p.weight ?? 0) - v.weight };
          }
          if (p.id === v.targetId) {
            return {
              ...p,
              lotNo:        separateSource.lotNo,
              owner:        separateSource.owner,
              weight:       v.weight,
              auctionRound: separateSource.auctionRound,
              filledAt:     now,
            };
          }
          return p;
        }),
      );
      message.success(`ย้าย ${v.weight.toLocaleString()} กก. ไปยัง ${v.targetId} แล้ว`);
      setSeparateSource(null);
    });
  }

  function openDelivery() {
    if (selectedPanels.length === 0) {
      message.warning('กรุณาเลือกแผงที่ต้องการส่งมอบ');
      return;
    }
    if (!selectionOwnerCheck.ok) {
      message.error('แผงที่เลือกต้องเป็นของผู้ชนะรายเดียวกัน และไม่ใช่แผงที่ยังรอประกาศผล');
      return;
    }
    // Reset borrow choices for all selected panels
    const init: Record<string, boolean> = {};
    selectedPanels.forEach((p) => { init[p.id] = false; });
    setBorrowChoice(init);
    setDeliveryOpen(true);
  }

  function handleDelivery() {
    const officerName = getSession()?.user.fullName ?? 'เจ้าหน้าที่';
    const now = dayjs().toISOString();
    const buyer = selectionOwnerCheck.owner ?? '';
    setPanels((prev) =>
      prev.map((p) => {
        if (!selectedKeys.includes(p.id) || statusOf(p) !== 'occupied') return p;
        const borrow = borrowChoice[p.id] === true;
        if (borrow) {
          // Buyer took the panel — keep markers, but strip rubber state
          return {
            ...p,
            lotNo: undefined,
            weight: undefined,
            auctionRound: undefined,
            filledAt: undefined,
            owner: undefined,
            deliveredAt:     now,
            deliveredBy:     officerName,
            deliveredTo:     buyer,
            borrowedByBuyer: true,
          };
        }
        // Normal delivery — panel returns to empty pool
        return {
          id: p.id,
          code: p.code,
          panelWeight: p.panelWeight,
        };
      }),
    );
    const borrowedCount = Object.values(borrowChoice).filter(Boolean).length;
    message.success(
      `ส่งมอบ ${selectedPanels.length} แผงให้ ${buyer} แล้ว` +
      (borrowedCount > 0 ? ` (ผู้ซื้อยืม ${borrowedCount} แผง)` : ''),
    );
    setSelectedKeys([]);
    setDeliveryOpen(false);
    setBorrowChoice({});
  }

  // Buyer brings the panel back — clear the borrow markers and put the panel
  // back into the empty pool. Operational fields stay untouched (they were
  // already cleared at delivery time).
  function handleReturn(p: Panel) {
    setPanels((prev) =>
      prev.map((row) =>
        row.id === p.id
          ? {
              id:          row.id,
              code:        row.code,
              panelWeight: row.panelWeight,
            }
          : row,
      ),
    );
    message.success(`รับคืนแผง ${p.id} จาก ${p.deliveredTo ?? 'ผู้ซื้อ'} แล้ว`);
  }

  // ── Columns ───────────────────────────────────────────────────────────────

  const cols: ColumnsType<Panel> = [
    {
      title: 'แผง',
      width: 140,
      render: (_, p) => (
        <div>
          <Tag color="blue" style={{ fontFamily: 'monospace', fontSize: 12, margin: 0 }}>{p.id}</Tag>
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2, fontFamily: 'monospace' }}>{p.code}</div>
        </div>
      ),
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'น้ำหนักปัจจุบัน',
      width: 150,
      align: 'right',
      render: (_, p) => {
        const w = p.weight ?? 0;
        const status = statusOf(p);
        if (status === 'empty') return <Text type="secondary">—</Text>;
        return (
          <span>
            <Text strong style={{ color: '#0f3d22' }}>{w.toLocaleString()}</Text>
            <Text type="secondary"> กก.</Text>
          </span>
        );
      },
    },
    {
      title: 'ล็อต',
      render: (_, p) =>
        p.lotNo
          ? <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.lotNo}</Text>
          : <Text type="secondary">—</Text>,
    },
    {
      title: 'ผู้ขาย',
      width: 180,
      render: (_, p) => {
        if (!p.sellerName) return <Text type="secondary">—</Text>;
        return (
          <div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{p.sellerName}</div>
            {p.sellerId && (
              <Text type="secondary" style={{ fontSize: 10, fontFamily: 'monospace' }}>
                {p.sellerId}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: 'รอบประมูล',
      dataIndex: 'auctionRound',
      render: (v?: string) => v ? <Text style={{ fontSize: 12 }}>{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'เจ้าของ',
      width: 220,
      render: (_, p) => {
        if (!p.owner) {
          if (statusOf(p) === 'borrowed') {
            return (
              <Space size={4}>
                <ExportOutlined style={{ color: '#fa8c16' }} />
                <Text style={{ fontSize: 12 }}>ผู้ซื้อยืมไป: {p.deliveredTo}</Text>
              </Space>
            );
          }
          return <Text type="secondary">—</Text>;
        }
        if (p.owner.kind === 'waiting') {
          return (
            <Space size={4}>
              <ClockCircleOutlined style={{ color: '#faad14' }} />
              <Text type="warning" style={{ fontSize: 12 }}>รอประกาศผล</Text>
            </Space>
          );
        }
        return (
          <Space size={4}>
            <TrophyOutlined style={{ color: '#52c41a' }} />
            <Text strong style={{ fontSize: 12 }}>{p.owner.name}</Text>
          </Space>
        );
      },
    },
    {
      title: 'สถานะ',
      width: 130,
      render: (_, p) => {
        const cfg = STATUS_CFG[statusOf(p)];
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'ดำเนินการ',
      width: 240,
      align: 'center',
      render: (_, p) => {
        const status = statusOf(p);
        const detailLink = (
          <Link href={`/officer/panels/${p.id}`}>
            <Button size="small" icon={<EyeOutlined />}>
              ดูรายละเอียด
            </Button>
          </Link>
        );
        let primaryAction: React.ReactNode = null;
        if (status === 'occupied') {
          primaryAction = (
            <Tooltip title="แบ่งย้ายไปแผงว่าง">
              <Button
                size="small"
                icon={<ScissorOutlined />}
                onClick={() => openSeparate(p)}
                disabled={emptyPanels.length === 0}
              >
                แบ่งแผง
              </Button>
            </Tooltip>
          );
        } else if (status === 'borrowed') {
          primaryAction = (
            <Popconfirm
              title="คืนแผงเข้าระบบ?"
              description={
                <span style={{ fontSize: 12 }}>
                  แผง <Text strong>{p.id}</Text> จะกลับเข้าสู่กลุ่มแผงว่างทันที
                  {p.deliveredTo && (
                    <>
                      <br />ผู้ที่ยืม: <Text strong>{p.deliveredTo}</Text>
                    </>
                  )}
                </span>
              }
              okText="คืนแผง"
              cancelText="ยกเลิก"
              okButtonProps={{ style: { background: '#1a7c3e', borderColor: '#1a7c3e' } }}
              onConfirm={() => handleReturn(p)}
            >
              <Button
                size="small"
                type="primary"
                icon={<RollbackOutlined />}
                style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
              >
                คืนแผง
              </Button>
            </Popconfirm>
          );
        }

        return (
          <Space size={4} wrap={false}>
            {primaryAction}
            {detailLink}
          </Space>
        );
      },
    },
  ];

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <Row gutter={12}>
        <Col xs={12} md={6}>
          <Card size="small" style={{ borderColor: '#1a7c3e' }}>
            <Statistic title="แผงทั้งหมด" value={counts.total} suffix="แผง" styles={{ content: { color: '#0f3d22' } }} prefix={<AppstoreOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ borderColor: '#bfbfbf' }}>
            <Statistic title="ว่าง" value={counts.empty} suffix="แผง" styles={{ content: { color: '#595959' } }} prefix={<InboxOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ borderColor: '#1677ff' }}>
            <Statistic title="มียาง" value={counts.occupied} suffix="แผง" styles={{ content: { color: '#1677ff' } }} prefix={<AppstoreOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ borderColor: '#fa8c16' }}>
            <Statistic title="ผู้ซื้อยืมไป" value={counts.borrowed} suffix="แผง" styles={{ content: { color: '#fa8c16' } }} prefix={<ExportOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Toolbar */}
      <Card size="small">
        <Space wrap>
          <Space size={6}>
            <FilterOutlined style={{ color: '#8c8c8c' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>สถานะ:</Text>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%', minWidth: 130 }}
              size="small"
              options={[
                { value: 'all',      label: 'ทุกสถานะ' },
                { value: 'empty',    label: 'ว่าง' },
                { value: 'occupied', label: 'มียาง' },
                { value: 'borrowed', label: 'ผู้ซื้อยืม' },
              ]}
            />
          </Space>
          <Space size={6}>
            <Text type="secondary" style={{ fontSize: 12 }}>เจ้าของ:</Text>
            <Select
              value={ownerFilter}
              onChange={setOwnerFilter}
              style={{ width: '100%', minWidth: 200 }}
              size="small"
              options={ownerOptions}
            />
          </Space>
          <span style={{ flex: 1 }} />
          <Tooltip title="ดึงข้อมูลล็อตที่เพิ่งชั่งจากหน้า ‘ชั่งน้ำหนัก’">
            <Button icon={<ReloadOutlined />} onClick={syncFromWeighing}>
              รีเฟรชจากการชั่ง
            </Button>
          </Tooltip>
          <Button icon={<PlusOutlined />} onClick={openFill} disabled={emptyPanels.length === 0}>
            เก็บล็อตเข้าแผง [Demo]
          </Button>
          <Button
            type="primary"
            icon={<CarOutlined />}
            onClick={openDelivery}
            disabled={selectedPanels.length === 0}
            style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
          >
            ส่งมอบที่เลือก ({selectedPanels.length})
          </Button>
        </Space>
      </Card>

      {/* Mixed-owner / has-waiting warning when selection is invalid */}
      {selectedPanels.length > 0 && !selectionOwnerCheck.ok && (
        <Alert
          type="warning"
          showIcon
          title="แผงที่เลือกไม่สามารถส่งมอบได้"
          description={
            selectionOwnerCheck.hasWaiting
              ? 'มีแผงที่ยังรอประกาศผลผู้ชนะอยู่ — ส่งมอบได้เฉพาะแผงที่มีผู้ชนะแน่นอนแล้ว'
              : 'แผงที่เลือกมีหลายเจ้าของ — กรุณาเลือกเฉพาะแผงของผู้ชนะรายเดียวกัน'
          }
        />
      )}

      {/* Table */}
      <Card>
        <Table
          dataSource={filtered}
          columns={cols}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          size="small"
          scroll={{ x: 'max-content' }}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: setSelectedKeys,
            getCheckboxProps: (r) => ({
              disabled: statusOf(r) !== 'occupied',
            }),
          }}
          locale={{ emptyText: 'ไม่มีแผงตามตัวกรองที่เลือก' }}
        />
      </Card>

      {/* ── Fill modal (demo) ──────────────────────────────────────────────── */}
      <Modal
        open={fillOpen}
        title={<span><PlusOutlined style={{ marginRight: 8, color: '#1a7c3e' }} />เก็บล็อตเข้าแผง [Demo]</span>}
        onCancel={() => setFillOpen(false)}
        onOk={handleFill}
        okText="เก็บลงแผง"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#1a7c3e', borderColor: '#1a7c3e' } }}
        destroyOnHidden
      >
        <Form form={fillForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="แผงปลายทาง (ว่างเท่านั้น)" name="targetId" rules={[{ required: true, message: 'กรุณาเลือกแผง' }]}>
            <Select placeholder="เลือกแผงว่าง">
              {emptyPanels.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.id} ({p.code})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="เลขที่ล็อต" name="lotNo" rules={[{ required: true, message: 'กรุณาระบุเลขล็อต' }]}>
            <Input placeholder="เช่น LOT-2024-010" />
          </Form.Item>
          <Row gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="น้ำหนัก (กก.)" name="weight" rules={[{ required: true, message: 'กรุณาระบุ' }]}>
                <InputNumberSuffix style={{ width: '100%' }} min={1} step={100} suffix="กก." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="รอบประมูล" name="auctionRound" rules={[{ required: true, message: 'กรุณาเลือก' }]}>
                <Select placeholder="เลือกรอบ">
                  {ROUNDS.map((r) => <Option key={r} value={r}>{r}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="ชนิดยาง" name="rubberType" rules={[{ required: true, message: 'กรุณาเลือก' }]}>
            <Select placeholder="เลือกชนิดยาง">
              {RUBBER_TYPES.map((t) => <Option key={t} value={t}>{t}</Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Separate modal ─────────────────────────────────────────────────── */}
      <Modal
        open={!!separateSource}
        title={<span><ScissorOutlined style={{ marginRight: 8, color: '#1a7c3e' }} />แบ่งย้ายแผง</span>}
        onCancel={() => setSeparateSource(null)}
        onOk={handleSeparate}
        okText="ย้าย"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#1a7c3e', borderColor: '#1a7c3e' } }}
        destroyOnHidden
      >
        {separateSource && (
          <>
            <Descriptions bordered size="small" column={1} style={{ marginTop: 12, marginBottom: 12 }}>
              <Descriptions.Item label="แผงต้นทาง">
                <Tag color="blue" style={{ fontFamily: 'monospace' }}>{separateSource.id}</Tag>
                <Text type="secondary"> · {separateSource.code}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="ล็อต">{separateSource.lotNo}</Descriptions.Item>
              <Descriptions.Item label="น้ำหนักปัจจุบัน">
                <Text strong>{(separateSource.weight ?? 0).toLocaleString()}</Text> กก.
              </Descriptions.Item>
            </Descriptions>
            <Form form={separateForm} layout="vertical">
              <Form.Item
                label="แผงปลายทาง (ว่างเท่านั้น)"
                name="targetId"
                rules={[{ required: true, message: 'กรุณาเลือกแผงปลายทาง' }]}
              >
                <Select placeholder="เลือกแผงว่าง" notFoundContent="ไม่มีแผงว่างในระบบ">
                  {emptyPanels.map((p) => (
                    <Option key={p.id} value={p.id}>
                      {p.id} ({p.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="น้ำหนักที่จะย้าย (กก.)"
                name="weight"
                rules={[
                  { required: true, message: 'กรุณาระบุน้ำหนัก' },
                  () => ({
                    validator(_, v) {
                      if (v == null) return Promise.resolve();
                      const cur = separateSource.weight ?? 0;
                      if (v >= cur) return Promise.reject(new Error(`ต้องน้อยกว่า ${cur.toLocaleString()} กก. (น้ำหนักในต้นทาง)`));
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumberSuffix
                  style={{ width: '100%' }}
                  min={1}
                  step={100}
                  max={(separateSource.weight ?? 1) - 1}
                  suffix="กก."
                />
              </Form.Item>
            </Form>
            <Alert
              type="info"
              showIcon
              title="ล็อต / เจ้าของ / รอบประมูล จะถูกคัดลอกไปยังแผงปลายทาง"
            />
          </>
        )}
      </Modal>

      {/* ── Delivery modal ─────────────────────────────────────────────────── */}
      <Modal
        open={deliveryOpen}
        title={<span><CarOutlined style={{ marginRight: 8, color: '#1a7c3e' }} />ยืนยันการส่งมอบ</span>}
        onCancel={() => setDeliveryOpen(false)}
        onOk={handleDelivery}
        okText="ยืนยันส่งมอบ"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#1a7c3e', borderColor: '#1a7c3e' } }}
        width={620}
        destroyOnHidden
      >
        <div style={{ marginTop: 12 }}>
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="ผู้รับ" span={2}>
              <Space>
                <UserOutlined style={{ color: '#1a7c3e' }} />
                <Text strong>{selectionOwnerCheck.owner}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="จำนวนแผง">
              <Tag color="blue">{selectedPanels.length} แผง</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="น้ำหนักรวม">
              <Text strong>
                {selectedPanels.reduce((s, p) => s + (p.weight ?? 0), 0).toLocaleString()}
              </Text> กก.
            </Descriptions.Item>
          </Descriptions>

          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            รายการแผงที่จะส่งมอบ
          </Text>
          <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '4px 0', marginBottom: 12 }}>
            {selectedPanels.map((p, idx) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderBottom: idx < selectedPanels.length - 1 ? '1px solid #f5f5f5' : 'none',
                }}
              >
                <div>
                  <Tag color="blue" style={{ fontFamily: 'monospace' }}>{p.id}</Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>{p.code}</Text>
                  <span style={{ marginLeft: 8 }}>
                    <Text style={{ fontSize: 12 }}>{p.lotNo}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}> · {(p.weight ?? 0).toLocaleString()} กก.</Text>
                  </span>
                </div>
                <Checkbox
                  checked={borrowChoice[p.id] === true}
                  onChange={(e) => setBorrowChoice((prev) => ({ ...prev, [p.id]: e.target.checked }))}
                >
                  <Text style={{ fontSize: 12 }}>
                    <ExportOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                    ผู้ซื้อยืมแผงไป
                  </Text>
                </Checkbox>
              </div>
            ))}
          </div>

          <Alert
            type="info"
            showIcon
            title={
              <Text style={{ fontSize: 12 }}>
                แผงที่ผู้ซื้อยืมจะถูกบันทึกสถานะ &ldquo;ผู้ซื้อยืมไป&rdquo; และไม่กลับเข้ากลุ่มแผงว่าง
                ส่วนแผงที่ไม่ยืม จะกลับเข้าสู่กลุ่มแผงว่างทันที
              </Text>
            }
          />
        </div>
      </Modal>

      <Text type="secondary" style={{ fontSize: 11, textAlign: 'center', display: 'block' }}>
        <ArrowRightOutlined /> ข้อมูลแผงทั้งหมดดึงมาจาก &ldquo;ข้อมูลหลัก — แผง&rdquo; (Master Data)
      </Text>
    </div>
  );
}
