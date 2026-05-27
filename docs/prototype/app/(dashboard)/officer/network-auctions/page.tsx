'use client';

import { useMemo, useState } from 'react';
import {
  Card, Table, Tag, Button, Tabs, Space, Badge, Input, Select,
  Typography, Modal, Form, Row, Col, Alert, Descriptions,
  App as AntApp, DatePicker,
} from 'antd';
import {
  ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined,
  SearchOutlined, EyeOutlined, ApartmentOutlined, BankOutlined,
  TeamOutlined, FileDoneOutlined, EnvironmentOutlined,
  CalendarOutlined, ReloadOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import StatCard from '@/shared/components/stat-card';

dayjs.extend(isBetween);

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

// ─── Types ────────────────────────────────────────────────────────────────────
type RequesterKind = 'institute' | 'network';
type RequestStatus = 'pending' | 'approved' | 'rejected';

interface NetworkAuctionRequest {
  id: string;
  requestNo: string;
  requesterKind: RequesterKind;
  requesterName: string;
  requesterCode: string;
  province: string;
  district: string;
  rubberType: string;
  grade: string;
  isEudr: boolean;
  estimatedWeight: number;
  expectedOpeningPrice: number;
  proposedDate: string;            // YYYY-MM-DD
  proposedRoundLabel: string;      // 'รอบ 1 (09:00–11:00)'
  reason: string;
  submittedAt: string;             // ISO
  submittedBy: string;
  status: RequestStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
  rejectReason?: string;
}

const REQUESTER_KIND_CFG: Record<RequesterKind, { label: string; color: string; icon: React.ReactNode }> = {
  institute: { label: 'สถาบันการยาง', color: 'geekblue', icon: <BankOutlined /> },
  network:   { label: 'เครือข่าย',     color: 'green',    icon: <TeamOutlined /> },
};

const STATUS_CFG: Record<RequestStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:  { label: 'รอตรวจสอบ',  color: 'warning', icon: <ClockCircleOutlined /> },
  approved: { label: 'อนุมัติแล้ว',  color: 'success', icon: <CheckCircleOutlined /> },
  rejected: { label: 'ปฏิเสธ',      color: 'error',   icon: <CloseCircleOutlined /> },
};

const REJECT_REASONS = [
  'ปริมาณยางไม่ถึงเกณฑ์ขั้นต่ำ',
  'รอบที่ขอชนกับรอบอื่น',
  'เอกสารประกอบไม่ครบถ้วน',
  'ราคาเปิดต่ำกว่าราคาอ้างอิงตลาด',
  'ข้อมูลเครือข่าย/สถาบันไม่ถูกต้อง',
  'อื่น ๆ (โปรดระบุ)',
];

// ─── Mock data ────────────────────────────────────────────────────────────────
const today = dayjs();

const INITIAL_REQUESTS: NetworkAuctionRequest[] = [
  {
    id: 'NAR-001',
    requestNo: 'NA-2026-0001',
    requesterKind: 'institute',
    requesterName: 'สถาบันเกษตรกรชาวสวนยางสุราษฎร์ธานี',
    requesterCode: 'INST-SRT-001',
    province: 'สุราษฎร์ธานี',
    district: 'พุนพิน',
    rubberType: 'ยางแผ่นรมควัน',
    grade: 'Grade 1',
    isEudr: true,
    estimatedWeight: 18000,
    expectedOpeningPrice: 73.50,
    proposedDate: today.add(1, 'day').format('YYYY-MM-DD'),
    proposedRoundLabel: 'รอบ 1 (09:00–11:00)',
    reason: 'มีสมาชิก 24 รายรวบรวมยางพร้อมประมูล ยางเก็บไว้ที่โกดังเครือข่ายเรียบร้อย',
    submittedAt: today.subtract(2, 'hour').toISOString(),
    submittedBy: 'นายสมชาย ใจดี',
    status: 'pending',
  },
  {
    id: 'NAR-002',
    requestNo: 'NA-2026-0002',
    requesterKind: 'network',
    requesterName: 'เครือข่ายชาวสวนยางอำเภอปะทิว',
    requesterCode: 'NET-CHUMPHON-007',
    province: 'ชุมพร',
    district: 'ปะทิว',
    rubberType: 'ยางก้อนถ้วย (Cup Lump)',
    grade: 'Grade 1',
    isEudr: false,
    estimatedWeight: 9500,
    expectedOpeningPrice: 47.50,
    proposedDate: today.add(1, 'day').format('YYYY-MM-DD'),
    proposedRoundLabel: 'รอบ 2 (11:00–13:00)',
    reason: 'เครือข่ายรวบรวมยางก้อนถ้วยพร้อมขายในวันพรุ่งนี้ ขอเปิดรอบประมูล ณ โกดังเครือข่าย',
    submittedAt: today.subtract(5, 'hour').toISOString(),
    submittedBy: 'นางสาวอารีย์ สวนยาง',
    status: 'pending',
  },
  {
    id: 'NAR-003',
    requestNo: 'NA-2026-0003',
    requesterKind: 'institute',
    requesterName: 'สถาบันเกษตรกรชาวสวนยางนครศรีธรรมราช',
    requesterCode: 'INST-NST-002',
    province: 'นครศรีธรรมราช',
    district: 'ทุ่งสง',
    rubberType: 'น้ำยางสด',
    grade: 'Grade 1',
    isEudr: false,
    estimatedWeight: 12000,
    expectedOpeningPrice: 56.00,
    proposedDate: today.add(2, 'day').format('YYYY-MM-DD'),
    proposedRoundLabel: 'รอบ 1 (09:00–11:00)',
    reason: 'น้ำยางสดเก็บไว้ที่ถังเครือข่าย ต้องการประมูลด่วนเนื่องจากเก็บได้ไม่นาน',
    submittedAt: today.subtract(1, 'day').toISOString(),
    submittedBy: 'นายมานพ ยางพารา',
    status: 'pending',
  },
  {
    id: 'NAR-004',
    requestNo: 'NA-2026-0004',
    requesterKind: 'network',
    requesterName: 'เครือข่ายชาวสวนยางสงขลา',
    requesterCode: 'NET-SKA-003',
    province: 'สงขลา',
    district: 'หาดใหญ่',
    rubberType: 'ยางแผ่นรมควัน',
    grade: 'Grade 2',
    isEudr: true,
    estimatedWeight: 14500,
    expectedOpeningPrice: 69.00,
    proposedDate: today.subtract(1, 'day').format('YYYY-MM-DD'),
    proposedRoundLabel: 'รอบ 3 (13:00–15:00)',
    reason: 'รอบประมูลของเครือข่ายอำเภอหาดใหญ่ ปริมาณยางพร้อมขาย',
    submittedAt: today.subtract(2, 'day').toISOString(),
    submittedBy: 'นายอภิชาติ มั่นคง',
    status: 'approved',
    reviewedAt: today.subtract(1, 'day').subtract(3, 'hour').toISOString(),
    reviewedBy: 'นางสาวพิมพ์ใจ ประมูลดี',
    reviewNote: 'เอกสารครบถ้วน อนุมัติเปิดรอบประมูลตามที่ขอ',
  },
  {
    id: 'NAR-005',
    requestNo: 'NA-2026-0005',
    requesterKind: 'network',
    requesterName: 'เครือข่ายชาวสวนยางพังงา',
    requesterCode: 'NET-PNG-004',
    province: 'พังงา',
    district: 'ตะกั่วป่า',
    rubberType: 'ยางแผ่นดิบ',
    grade: 'Grade 3',
    isEudr: false,
    estimatedWeight: 2200,
    expectedOpeningPrice: 58.00,
    proposedDate: today.subtract(2, 'day').format('YYYY-MM-DD'),
    proposedRoundLabel: 'รอบ 4 (15:00–17:00)',
    reason: 'ขอเปิดรอบประมูลของเครือข่าย',
    submittedAt: today.subtract(3, 'day').toISOString(),
    submittedBy: 'นายสุชาติ ใจกล้า',
    status: 'rejected',
    reviewedAt: today.subtract(2, 'day').subtract(2, 'hour').toISOString(),
    reviewedBy: 'นางสาวพิมพ์ใจ ประมูลดี',
    rejectReason: 'ปริมาณยางไม่ถึงเกณฑ์ขั้นต่ำ (ต้องไม่น้อยกว่า 3,000 กก.)',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NetworkAuctionsPage() {
  const { message } = AntApp.useApp();

  const [requests, setRequests] = useState<NetworkAuctionRequest[]>(INITIAL_REQUESTS);
  const [tab, setTab] = useState<RequestStatus>('pending');

  // Filters
  const [search, setSearch]               = useState('');
  const [kindFilter, setKindFilter]       = useState<'all' | RequesterKind>('all');
  const [dateRange, setDateRange]         = useState<[Dayjs, Dayjs] | null>(null);

  // Detail / action modals
  const [detail, setDetail]               = useState<NetworkAuctionRequest | null>(null);
  const [approveTarget, setApproveTarget] = useState<NetworkAuctionRequest | null>(null);
  const [rejectTarget, setRejectTarget]   = useState<NetworkAuctionRequest | null>(null);
  const [approveForm]                     = Form.useForm<{ note: string }>();
  const [rejectForm]                      = Form.useForm<{ reason: string; detail: string }>();
  const [submitting, setSubmitting]       = useState(false);

  const filtered = useMemo(() => {
    return requests.filter(r => {
      if (r.status !== tab) return false;
      if (kindFilter !== 'all' && r.requesterKind !== kindFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hit = [
          r.requestNo, r.requesterName, r.requesterCode,
          r.province, r.district, r.rubberType,
        ].some(s => s.toLowerCase().includes(q));
        if (!hit) return false;
      }
      if (dateRange) {
        const [from, to] = dateRange;
        const d = dayjs(r.proposedDate);
        if (!d.isBetween(from.startOf('day'), to.endOf('day'), null, '[]')) return false;
      }
      return true;
    });
  }, [requests, tab, search, kindFilter, dateRange]);

  const counts = useMemo(() => ({
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }), [requests]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const submitApprove = async () => {
    if (!approveTarget) return;
    const values = await approveForm.validateFields().catch(() => null);
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      setRequests(prev => prev.map(r =>
        r.id === approveTarget.id
          ? {
              ...r,
              status: 'approved',
              reviewedAt: dayjs().toISOString(),
              reviewedBy: 'นางสาวพิมพ์ใจ ประมูลดี',
              reviewNote: values?.note?.trim() || 'อนุมัติเปิดรอบประมูลตามที่ขอ',
            }
          : r,
      ));
      message.success(`อนุมัติคำขอ ${approveTarget.requestNo} แล้ว`);
      approveForm.resetFields();
      setApproveTarget(null);
    } finally {
      setSubmitting(false);
    }
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    const values = await rejectForm.validateFields().catch(() => null);
    if (!values) return;
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      const fullReason = values.reason === 'อื่น ๆ (โปรดระบุ)'
        ? values.detail
        : [values.reason, values.detail].filter(Boolean).join(' — ');
      setRequests(prev => prev.map(r =>
        r.id === rejectTarget.id
          ? {
              ...r,
              status: 'rejected',
              reviewedAt: dayjs().toISOString(),
              reviewedBy: 'นางสาวพิมพ์ใจ ประมูลดี',
              rejectReason: fullReason,
            }
          : r,
      ));
      message.success(`ปฏิเสธคำขอ ${rejectTarget.requestNo} แล้ว`);
      rejectForm.resetFields();
      setRejectTarget(null);
    } finally {
      setSubmitting(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setKindFilter('all');
    setDateRange(null);
  };

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'เลขที่คำขอ',
      dataIndex: 'requestNo',
      width: 140,
      render: (v: string, r: NetworkAuctionRequest) => (
        <div>
          <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{v}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            ส่งเมื่อ {dayjs(r.submittedAt).format('DD/MM HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: 'ผู้ขอเปิดรอบ',
      render: (r: NetworkAuctionRequest) => {
        const cfg = REQUESTER_KIND_CFG[r.requesterKind];
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Tag color={cfg.color} icon={cfg.icon} style={{ margin: 0 }}>
                {cfg.label}
              </Tag>
              <Text style={{ fontSize: 11, color: '#8c8c8c' }}>{r.requesterCode}</Text>
            </div>
            <div style={{ fontWeight: 500 }}>{r.requesterName}</div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
              <EnvironmentOutlined /> {r.district}, {r.province}
            </div>
          </div>
        );
      },
    },
    {
      title: 'ยางที่จะประมูล',
      render: (r: NetworkAuctionRequest) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.rubberType}</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
            <Tag style={{ margin: 0, fontSize: 11 }}>{r.grade}</Tag>
            {r.isEudr && <span className="badge-eudr">EUDR</span>}
          </div>
        </div>
      ),
    },
    {
      title: 'ปริมาณ',
      dataIndex: 'estimatedWeight',
      align: 'right' as const,
      render: (v: number) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>กก. (ประมาณ)</div>
        </div>
      ),
    },
    {
      title: 'ราคาเปิดที่เสนอ',
      dataIndex: 'expectedOpeningPrice',
      align: 'right' as const,
      render: (v: number) => (
        <span style={{ fontWeight: 600, color: '#1a7c3e' }}>
          {v.toFixed(2)} <Text type="secondary" style={{ fontSize: 11 }}>฿/กก.</Text>
        </span>
      ),
    },
    {
      title: 'รอบที่ขอเปิด',
      render: (r: NetworkAuctionRequest) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            <CalendarOutlined style={{ marginRight: 4, color: '#8c8c8c' }} />
            {dayjs(r.proposedDate).format('DD MMM YYYY')}
          </div>
          <div style={{ fontSize: 12, color: '#595959', marginTop: 2 }}>
            {r.proposedRoundLabel}
          </div>
        </div>
      ),
    },
    {
      title: 'สถานะ / ผลพิจารณา',
      render: (r: NetworkAuctionRequest) => {
        const cfg = STATUS_CFG[r.status];
        return (
          <div>
            <Tag color={cfg.color} icon={cfg.icon} style={{ marginBottom: 2 }}>
              {cfg.label}
            </Tag>
            {r.status !== 'pending' && r.reviewedAt && (
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                {dayjs(r.reviewedAt).format('DD/MM HH:mm')}
              </div>
            )}
            {r.status === 'rejected' && r.rejectReason && (
              <div style={{ fontSize: 11, color: '#ff4d4f', marginTop: 2, maxWidth: 220 }}>
                {r.rejectReason}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'การดำเนินการ',
      fixed: 'right' as const,
      render: (r: NetworkAuctionRequest) => (
        <Space size={4} wrap>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setDetail(r)}>
            รายละเอียด
          </Button>
          {r.status === 'pending' && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
                onClick={() => { approveForm.resetFields(); setApproveTarget(r); }}
              >
                อนุมัติ
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => { rejectForm.resetFields(); setRejectTarget(r); }}
              >
                ปฏิเสธ
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Page header / context ──────────────────────────────────────── */}
      <Card>
        <Space align="start" size="middle" style={{ width: '100%' }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: 10,
              background: 'linear-gradient(135deg, #1a7c3e 0%, #5cb85c 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 22, flexShrink: 0,
            }}
          >
            <ApartmentOutlined />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title level={4} style={{ margin: 0 }}>
              อนุมัติการเปิดประมูล ณ เครือข่าย
            </Title>
            <Paragraph type="secondary" style={{ margin: '4px 0 0 0', fontSize: 13 }}>
              พิจารณาคำขอเปิดรอบประมูลจาก <strong>สถาบันการยาง</strong> และ <strong>เครือข่ายชาวสวนยาง</strong> —
              เมื่ออนุมัติ ตลาดกลางจะเปิดรอบให้ โดยยางจะอยู่ที่เครือข่าย ไม่ต้องขนเข้ามาที่ตลาดกลาง
            </Paragraph>
          </div>
        </Space>
      </Card>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <StatCard
            title="รอตรวจสอบ"
            value={counts.pending}
            prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
            accentClass="stat-orange"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="อนุมัติแล้ว"
            value={counts.approved}
            prefix={<CheckCircleOutlined style={{ color: '#1a7c3e' }} />}
            accentClass="stat-primary"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="ปฏิเสธ"
            value={counts.rejected}
            prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            accentClass="stat-orange"
          />
        </Col>
      </Row>

      {/* ── Filter card ────────────────────────────────────────────────── */}
      <Card size="small" styles={{ body: { padding: 16 } }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="ค้นหาเลขที่คำขอ / ชื่อ / รหัส / จังหวัด"
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
              size="small"
            />
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select
              value={kindFilter}
              onChange={setKindFilter}
              style={{ width: '100%' }}
              size="small"
              options={[
                { label: 'ทุกประเภทผู้ขอ', value: 'all' },
                { label: 'สถาบันการยาง',  value: 'institute' },
                { label: 'เครือข่าย',       value: 'network' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} lg={7}>
            <DatePicker.RangePicker
              size="small"
              value={dateRange}
              onChange={v => setDateRange(v as [Dayjs, Dayjs] | null)}
              placeholder={['วันที่เริ่ม', 'วันที่สิ้นสุด']}
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={4} style={{ textAlign: 'right' }}>
            <Button size="small" icon={<ReloadOutlined />} onClick={resetFilters}>
              รีเซ็ต
            </Button>
          </Col>
        </Row>
      </Card>

      {/* ── Tabs + Table ───────────────────────────────────────────────── */}
      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k as RequestStatus)}
        items={(['pending', 'approved', 'rejected'] as const).map(s => {
          const cfg = STATUS_CFG[s];
          const color = s === 'approved' ? '#1a7c3e'
                      : s === 'rejected' ? '#ff4d4f'
                      : '#fa8c16';
          return {
            key: s,
            label: (
              <span>
                <span style={{ marginRight: 4, color }}>{cfg.icon}</span>
                {cfg.label}
                <Badge
                  count={counts[s]}
                  showZero
                  color={color}
                  offset={[8, 0]}
                  style={{ marginLeft: 4 }}
                />
              </span>
            ),
            children: (
              <Card>
                <Table<NetworkAuctionRequest>
                  dataSource={filtered}
                  columns={columns}
                  rowKey="id"
                  size="small"
                  scroll={{ x: 'max-content' }}
                  pagination={{ pageSize: 10, showTotal: t => `ทั้งหมด ${t} รายการ` }}
                  locale={{
                    emptyText:
                      s === 'pending'  ? 'ไม่มีคำขอที่รอตรวจสอบ' :
                      s === 'approved' ? 'ยังไม่มีคำขอที่อนุมัติ'   :
                                         'ยังไม่มีคำขอที่ปฏิเสธ',
                  }}
                />
              </Card>
            ),
          };
        })}
      />

      {/* ═══ DETAIL MODAL ═══════════════════════════════════════════════ */}
      <Modal
        open={!!detail}
        onCancel={() => setDetail(null)}
        title={
          <Space>
            <FileDoneOutlined style={{ color: '#1a7c3e' }} />
            <span>รายละเอียดคำขอ — {detail?.requestNo}</span>
            {detail && (
              <Tag color={STATUS_CFG[detail.status].color} icon={STATUS_CFG[detail.status].icon}>
                {STATUS_CFG[detail.status].label}
              </Tag>
            )}
          </Space>
        }
        footer={
          detail?.status === 'pending'
            ? [
                <Button key="close" onClick={() => setDetail(null)}>ปิด</Button>,
                <Button
                  key="reject" danger icon={<CloseCircleOutlined />}
                  onClick={() => { rejectForm.resetFields(); setRejectTarget(detail); setDetail(null); }}
                >
                  ปฏิเสธ
                </Button>,
                <Button
                  key="approve" type="primary" icon={<CheckCircleOutlined />}
                  style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
                  onClick={() => { approveForm.resetFields(); setApproveTarget(detail); setDetail(null); }}
                >
                  อนุมัติ
                </Button>,
              ]
            : <Button onClick={() => setDetail(null)}>ปิด</Button>
        }
        width={680}
      >
        {detail && (
          <>
            <Descriptions size="small" column={2} bordered style={{ marginBottom: 12 }}>
              <Descriptions.Item label="ผู้ขอ" span={2}>
                <Space>
                  <Tag
                    color={REQUESTER_KIND_CFG[detail.requesterKind].color}
                    icon={REQUESTER_KIND_CFG[detail.requesterKind].icon}
                  >
                    {REQUESTER_KIND_CFG[detail.requesterKind].label}
                  </Tag>
                  <span style={{ fontWeight: 500 }}>{detail.requesterName}</span>
                  <Text type="secondary" style={{ fontSize: 11 }}>({detail.requesterCode})</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="ที่ตั้ง">{detail.district}, {detail.province}</Descriptions.Item>
              <Descriptions.Item label="ผู้ส่งคำขอ">{detail.submittedBy}</Descriptions.Item>
              <Descriptions.Item label="ชนิดยาง">{detail.rubberType}</Descriptions.Item>
              <Descriptions.Item label="เกรด / มาตรฐาน">
                <Space>
                  <Tag>{detail.grade}</Tag>
                  {detail.isEudr && <span className="badge-eudr">EUDR</span>}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="ปริมาณ (ประมาณ)">
                <span style={{ fontWeight: 600 }}>
                  {detail.estimatedWeight.toLocaleString()} กก.
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="ราคาเปิดที่เสนอ">
                <span style={{ fontWeight: 600, color: '#1a7c3e' }}>
                  {detail.expectedOpeningPrice.toFixed(2)} ฿/กก.
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="วันที่ขอเปิด">
                {dayjs(detail.proposedDate).format('DD MMMM YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="รอบที่ขอเปิด">{detail.proposedRoundLabel}</Descriptions.Item>
              <Descriptions.Item label="วันที่ส่งคำขอ" span={2}>
                {dayjs(detail.submittedAt).format('DD MMMM YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="เหตุผล / รายละเอียด" span={2}>
                {detail.reason}
              </Descriptions.Item>
            </Descriptions>

            {detail.status === 'approved' && detail.reviewNote && (
              <Alert
                type="success"
                showIcon
                title={`อนุมัติโดย ${detail.reviewedBy} · ${dayjs(detail.reviewedAt).format('DD/MM/YYYY HH:mm')}`}
                description={detail.reviewNote}
              />
            )}
            {detail.status === 'rejected' && detail.rejectReason && (
              <Alert
                type="error"
                showIcon
                title={`ปฏิเสธโดย ${detail.reviewedBy} · ${dayjs(detail.reviewedAt).format('DD/MM/YYYY HH:mm')}`}
                description={detail.rejectReason}
              />
            )}
          </>
        )}
      </Modal>

      {/* ═══ APPROVE MODAL ══════════════════════════════════════════════ */}
      <Modal
        open={!!approveTarget}
        onCancel={() => setApproveTarget(null)}
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#1a7c3e' }} />
            <span>อนุมัติเปิดรอบประมูล</span>
          </Space>
        }
        okText="ยืนยันอนุมัติ"
        okButtonProps={{
          icon: <CheckCircleOutlined />,
          style: { background: '#1a7c3e', borderColor: '#1a7c3e' },
          loading: submitting,
        }}
        cancelText="ยกเลิก"
        onOk={submitApprove}
        width={520}
      >
        {approveTarget && (
          <>
            <Alert
              type="info" showIcon style={{ marginBottom: 16 }}
              title="เมื่ออนุมัติ ระบบจะสร้างรอบประมูลให้อัตโนมัติ"
              description={
                <div style={{ fontSize: 12 }}>
                  {REQUESTER_KIND_CFG[approveTarget.requesterKind].label} <strong>{approveTarget.requesterName}</strong>
                  {' '}จะได้รับการแจ้งเตือนทันที และยางจะคงอยู่ที่เครือข่าย ไม่ต้องขนเข้ามาที่ตลาดกลาง
                </div>
              }
            />
            <Descriptions size="small" column={1} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="เลขที่คำขอ">{approveTarget.requestNo}</Descriptions.Item>
              <Descriptions.Item label="ผู้ขอ">{approveTarget.requesterName}</Descriptions.Item>
              <Descriptions.Item label="วันที่ / รอบที่ขอ">
                {dayjs(approveTarget.proposedDate).format('DD MMM YYYY')} — {approveTarget.proposedRoundLabel}
              </Descriptions.Item>
              <Descriptions.Item label="ยาง">
                {approveTarget.rubberType} ({approveTarget.grade}) · {approveTarget.estimatedWeight.toLocaleString()} กก.
              </Descriptions.Item>
            </Descriptions>
            <Form form={approveForm} layout="vertical">
              <Form.Item
                name="note"
                label="หมายเหตุถึงผู้ขอ (ไม่บังคับ)"
              >
                <TextArea
                  rows={3}
                  placeholder="เช่น อนุมัติเปิดรอบประมูลตามที่ขอ — กรุณาเตรียมยางและเอกสารให้พร้อมในวันประมูล"
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* ═══ REJECT MODAL ═══════════════════════════════════════════════ */}
      <Modal
        open={!!rejectTarget}
        onCancel={() => setRejectTarget(null)}
        title={
          <Space>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            <span>ปฏิเสธคำขอเปิดรอบประมูล</span>
          </Space>
        }
        okText="ยืนยันปฏิเสธ"
        okButtonProps={{
          danger: true,
          icon: <CloseCircleOutlined />,
          loading: submitting,
        }}
        cancelText="ยกเลิก"
        onOk={submitReject}
        width={520}
      >
        {rejectTarget && (
          <>
            <Alert
              type="warning" showIcon style={{ marginBottom: 16 }}
              title="กรุณาระบุเหตุผลให้ชัดเจน"
              description="เหตุผลจะถูกส่งกลับให้ผู้ขอ เพื่อให้ปรับปรุงและส่งคำขอใหม่ได้"
            />
            <Descriptions size="small" column={1} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="เลขที่คำขอ">{rejectTarget.requestNo}</Descriptions.Item>
              <Descriptions.Item label="ผู้ขอ">{rejectTarget.requesterName}</Descriptions.Item>
            </Descriptions>
            <Form form={rejectForm} layout="vertical">
              <Form.Item
                name="reason"
                label="เหตุผลการปฏิเสธ"
                rules={[{ required: true, message: 'กรุณาเลือกเหตุผล' }]}
              >
                <Select
                  placeholder="เลือกเหตุผล"
                  options={REJECT_REASONS.map(r => ({ label: r, value: r }))}
                />
              </Form.Item>
              <Form.Item
                name="detail"
                label="รายละเอียดเพิ่มเติม"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (getFieldValue('reason') === 'อื่น ๆ (โปรดระบุ)' && !value?.trim()) {
                        return Promise.reject(new Error('กรุณาระบุรายละเอียด'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <TextArea rows={3} placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
}
