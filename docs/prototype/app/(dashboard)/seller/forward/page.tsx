'use client';

import { useState } from 'react';
import InputNumberSuffix from '@/shared/components/input-number-suffix';
import {
  Card, Table, Tag, Button, Modal, Form,
  Typography, Row, Col, Descriptions, Alert, Space, Divider, Tabs,
  Statistic, Progress, Empty, DatePicker,
} from 'antd';
import {
  CalendarOutlined, SendOutlined, CheckCircleOutlined,
  ClockCircleOutlined, TrophyOutlined,
  HistoryOutlined, EyeOutlined, TeamOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { App as AntApp } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Text, Title } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

type RoundStatus     = 'collecting' | 'contracting' | 'completed';
type SubmitStatus    = 'pending' | 'allocated' | 'rejected';

interface MySubmission {
  offeredWeight: number;
  submittedAt: string;
  status: SubmitStatus;
  allocatedWeight?: number; // filled after staff issues contracts
}

interface ForwardRound {
  roundId: string;
  topic: string;
  winnerBuyerName: string;
  rubberType: string;    // from winning buyer's bid
  targetWeight: number;  // from winning buyer's bid
  winnerPrice: number;   // buyer's winning price (reference)
  bidDeadline: string;
  deliveryDate?: string;
  roundStatus: RoundStatus;
  mySubmission?: MySubmission;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ROUNDS: ForwardRound[] = [
  // Collecting — seller HAS NOT submitted yet
  {
    roundId: 'FWD-002',
    topic: 'รับซื้อน้ำยางสด ล็อตเดือนพฤษภาคม',
    winnerBuyerName: 'บริษัท น้ำยางสยาม จำกัด',
    rubberType: 'น้ำยางสด',
    targetWeight: 8000,
    winnerPrice: 42.00,
    bidDeadline: '2026-04-17',
    deliveryDate: '2026-05-20',
    roundStatus: 'collecting',
    mySubmission: undefined,
  },
  // Collecting — seller HAS submitted
  {
    roundId: 'FWD-004',
    topic: 'รับซื้อยางแผ่นรมควัน ล็อต Q2',
    winnerBuyerName: 'บริษัท ยางไทยพาณิชย์ จำกัด',
    rubberType: 'ยางแผ่นรมควัน RSS3',
    targetWeight: 5000,
    winnerPrice: 68.50,
    bidDeadline: '2026-04-20',
    deliveryDate: '2026-05-15',
    roundStatus: 'collecting',
    mySubmission: {
      offeredWeight: 2000,
      submittedAt: '2026-04-19 10:30',
      status: 'pending',
    },
  },
  // Contracting — allocated (seller received a contract)
  {
    roundId: 'FWD-H001',
    topic: 'รับซื้อยางก้อนถ้วยรอบแรกปี 2569',
    winnerBuyerName: 'ห้างหุ้นส่วน ยางเหนือ',
    rubberType: 'ยางก้อนถ้วย',
    targetWeight: 9000,
    winnerPrice: 37.50,
    bidDeadline: '2026-04-10',
    deliveryDate: '2026-05-30',
    roundStatus: 'contracting',
    mySubmission: {
      offeredWeight: 4000,
      submittedAt: '2026-04-11 08:30',
      status: 'allocated',
      allocatedWeight: 4000,
    },
  },
  // Contracting — rejected (seller submitted but not allocated)
  {
    roundId: 'FWD-H002',
    topic: 'รับซื้อ RSS3 มีนาคม 2569',
    winnerBuyerName: 'บริษัท กรีนรับเบอร์ จำกัด',
    rubberType: 'ยางแผ่นรมควัน RSS3',
    targetWeight: 6000,
    winnerPrice: 71.00,
    bidDeadline: '2026-03-25',
    deliveryDate: '2026-05-10',
    roundStatus: 'contracting',
    mySubmission: {
      offeredWeight: 3000,
      submittedAt: '2026-03-26 09:00',
      status: 'rejected',
    },
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const ROUND_STATUS_CFG: Record<RoundStatus, { label: string; color: string }> = {
  collecting:  { label: 'รับปริมาณผู้ขาย', color: 'processing' },
  contracting: { label: 'ออกสัญญา',        color: 'success' },
  completed:   { label: 'เสร็จสิ้น',        color: 'default' },
};

const SUBMIT_STATUS_CFG: Record<SubmitStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'รอดำเนินการ',    color: 'warning', icon: <ClockCircleOutlined /> },
  allocated: { label: 'ได้รับจัดสรร',   color: 'success', icon: <CheckCircleOutlined /> },
  rejected:  { label: 'ไม่ได้รับจัดสรร', color: 'default', icon: <ClockCircleOutlined /> },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SellerForwardPage() {
  const { message, modal } = AntApp.useApp();
  const [rounds, setRounds] = useState<ForwardRound[]>(MOCK_ROUNDS);

  const [offerRound,  setOfferRound]  = useState<ForwardRound | null>(null);
  const [detailRound, setDetailRound] = useState<ForwardRound | null>(null);
  const [offerForm]   = Form.useForm<{ offeredWeight: number }>();

  // Seller can withdraw their offered weight while it's still pending. Once
  // staff allocates (status === 'allocated' → contract issued) it is locked.
  // 'rejected' is a final state where no contract is formed; the seller may
  // tidy up by removing the record too.
  function canDeleteSubmission(r: ForwardRound): boolean {
    if (!r.mySubmission) return false;
    return r.mySubmission.status !== 'allocated';
  }

  function handleDeleteSubmission(r: ForwardRound) {
    if (!canDeleteSubmission(r)) {
      message.warning('ไม่สามารถลบการเสนอนี้ได้ — ได้รับจัดสรรและเข้าสู่ขั้นตอนทำสัญญาแล้ว');
      return;
    }
    modal.confirm({
      title: 'ลบปริมาณที่เสนอ?',
      content: `ต้องการลบปริมาณที่เสนอของรอบ ${r.roundId} หรือไม่?`,
      okText: 'ลบ',
      okButtonProps: { danger: true },
      cancelText: 'ยกเลิก',
      onOk: () => {
        setRounds(prev => prev.map(x =>
          x.roundId === r.roundId ? { ...x, mySubmission: undefined } : x,
        ));
        setDetailRound(prev => (prev && prev.roundId === r.roundId ? { ...prev, mySubmission: undefined } : prev));
        message.success('ลบปริมาณที่เสนอแล้ว');
      },
    });
  }

  const activeRounds  = rounds.filter((r) => r.roundStatus === 'collecting');
  const historyRounds = rounds.filter((r) => r.roundStatus !== 'collecting');

  const submittedCount  = rounds.filter((r) => r.mySubmission).length;
  const allocatedCount  = rounds.filter((r) => r.mySubmission?.status === 'allocated').length;
  const pendingCount    = rounds.filter((r) => r.mySubmission?.status === 'pending').length;
  // totalValue uses buyer's winning price (winnerPrice) × seller's allocated weight
  const totalValue      = rounds
    .filter((r) => r.mySubmission?.status === 'allocated')
    .reduce((s, r) => s + (r.mySubmission?.allocatedWeight ?? 0) * r.winnerPrice, 0);

  function handleSubmitOffer() {
    if (!offerRound) return;
    offerForm.validateFields().then((v) => {
      const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
      setRounds((prev) => prev.map((r) =>
        r.roundId === offerRound.roundId
          ? {
              ...r,
              mySubmission: {
                offeredWeight: Number(v.offeredWeight),
                submittedAt:   now,
                status:        'pending',
              },
            }
          : r,
      ));
      offerForm.resetFields();
      setOfferRound(null);
    });
  }

  // ── Active rounds table columns ──
  const activeCols: ColumnsType<ForwardRound> = [
    {
      title: 'รหัสรอบ',
      dataIndex: 'roundId',
      width: 110,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'หัวข้อรอบ',
      dataIndex: 'topic',
    },
    {
      title: 'ผู้ซื้อ (ผู้ชนะ)',
      dataIndex: 'winnerBuyerName',
      render: (v: string) => (
        <Space>
          <TrophyOutlined style={{ color: '#52c41a', fontSize: 12 }} />
          <Text>{v}</Text>
        </Space>
      ),
    },
    {
      title: 'ชนิดยางที่ต้องการ',
      dataIndex: 'rubberType',
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'ปริมาณที่ต้องการ (กก.)',
      dataIndex: 'targetWeight',
      align: 'right',
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: 'ราคาอ้างอิง (฿/กก.)',
      dataIndex: 'winnerPrice',
      align: 'right',
      render: (v: number) => <Text strong style={{ color: '#1a7c3e' }}>{v.toFixed(2)}</Text>,
    },
    {
      title: 'กำหนดส่งมอบ',
      dataIndex: 'deliveryDate',
      render: (v?: string) => v ?? <Text type="secondary">—</Text>,
    },
    {
      title: 'สถานะของฉัน',
      render: (_, r) => {
        if (!r.mySubmission) return <Tag color="default">ยังไม่ได้เสนอ</Tag>;
        const cfg = SUBMIT_STATUS_CFG[r.mySubmission.status];
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'ดำเนินการ',
      align: 'center',
      render: (_, r) => (
        <Space>
          {!r.mySubmission && (
            <Button
              size="small"
              type="primary"
              icon={<SendOutlined />}
              style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
              onClick={() => setOfferRound(r)}
            >
              เสนอปริมาณ
            </Button>
          )}
          <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailRound(r)}>
            รายละเอียด
          </Button>
          {canDeleteSubmission(r) && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteSubmission(r)}
              title="ลบปริมาณที่เสนอ"
            />
          )}
        </Space>
      ),
    },
  ];

  // ── History table columns ──
  const historyCols: ColumnsType<ForwardRound> = [
    {
      title: 'รหัสรอบ',
      dataIndex: 'roundId',
      width: 110,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    { title: 'หัวข้อรอบ', dataIndex: 'topic' },
    {
      title: 'ชนิดยาง',
      dataIndex: 'rubberType',
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'ปริมาณที่เสนอ (กก.)',
      align: 'right',
      render: (_, r) => r.mySubmission ? r.mySubmission.offeredWeight.toLocaleString() : <Text type="secondary">—</Text>,
    },
    {
      title: 'ปริมาณที่ได้รับ (กก.)',
      align: 'right',
      render: (_, r) => {
        if (!r.mySubmission || r.mySubmission.status !== 'allocated') return <Text type="secondary">—</Text>;
        return <Text strong style={{ color: '#1a7c3e' }}>{(r.mySubmission.allocatedWeight ?? 0).toLocaleString()}</Text>;
      },
    },
    {
      title: 'มูลค่า (฿)',
      align: 'right',
      render: (_, r) => {
        if (!r.mySubmission || r.mySubmission.status !== 'allocated') return <Text type="secondary">—</Text>;
        const val = (r.mySubmission.allocatedWeight ?? 0) * r.winnerPrice;
        return <Text strong>{val.toLocaleString()}</Text>;
      },
    },
    { title: 'กำหนดส่งมอบ', dataIndex: 'deliveryDate', render: (v?: string) => v ?? '—' },
    {
      title: 'สถานะ',
      render: (_, r) => {
        const rCfg = ROUND_STATUS_CFG[r.roundStatus];
        return (
          <Space orientation="vertical" size={2}>
            <Tag color={rCfg.color}>{rCfg.label}</Tag>
            {r.mySubmission && (() => {
              const sCfg = SUBMIT_STATUS_CFG[r.mySubmission.status];
              return <Tag color={sCfg.color} icon={sCfg.icon}>{sCfg.label}</Tag>;
            })()}
          </Space>
        );
      },
    },
    {
      title: '',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailRound(r)}>
            รายละเอียด
          </Button>
          {canDeleteSubmission(r) && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteSubmission(r)}
              title="ลบปริมาณที่เสนอ"
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div>
        <Title level={4} style={{ margin: 0, color: '#0f3d22' }}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          ตลาดล่วงหน้า (Forward Contract)
        </Title>
        <Text type="secondary">รอบที่เปิดรับปริมาณจากผู้ขาย</Text>
      </div>

      {/* Summary */}
      <Row gutter={[16, 12]}>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1a7c3e' }}>
            <Statistic title="รอบที่เข้าร่วม" value={submittedCount} suffix={`/ ${rounds.length} รอบ`} styles={{ content: { color: '#0f3d22' } }} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#52c41a' }}>
            <Statistic title="ได้รับจัดสรร" value={allocatedCount} suffix="รายการ" styles={{ content: { color: '#52c41a' } }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#faad14' }}>
            <Statistic title="รอดำเนินการ" value={pendingCount} suffix="รายการ" styles={{ content: { color: '#d48806' } }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1677ff' }}>
            <Statistic title="มูลค่าที่ได้รับ (฿)" value={totalValue} styles={{ content: { color: '#1677ff', fontSize: 18 } }} />
          </Card>
        </Col>
      </Row>

      {/* Tabs: เปิดรับ | ประวัติ */}
      <Tabs
        defaultActiveKey="active"
        items={[
          {
            key: 'active',
            label: (
              <Space>
                <TeamOutlined />
                รอบที่เปิดรับอยู่
                <Tag color="processing">{activeRounds.length}</Tag>
              </Space>
            ),
            children: activeRounds.length === 0 ? (
              <Card>
                <Empty description="ยังไม่มีรอบที่เปิดรับปริมาณจากผู้ขาย" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </Card>
            ) : (
              <Card
                title={<Space><TeamOutlined style={{ color: '#1a7c3e' }} /><span>รอบที่กำลังเปิดรับปริมาณ</span></Space>}
              >
                <Alert
                  type="info"
                  showIcon
                  title="รอบเหล่านี้มีผู้ซื้อชนะการประมูลแล้ว — คุณสามารถเสนอปริมาณยางที่มีเพื่อเข้าร่วมส่งมอบได้"
                  style={{ marginBottom: 16 }}
                />
                <Table
                  dataSource={activeRounds}
                  columns={activeCols}
                  rowKey="roundId"
                  pagination={false}
                  size="small"
                  scroll={{ x: 'max-content' }}
                  onRow={(r) => ({
                    style: r.mySubmission ? { background: '#f6ffed' } : {},
                  })}
                />
              </Card>
            ),
          },
          {
            key: 'history',
            label: (
              <Space>
                <HistoryOutlined />
                ประวัติ
                <Tag color="default">{historyRounds.length}</Tag>
              </Space>
            ),
            children: historyRounds.length === 0 ? (
              <Card>
                <Empty description="ยังไม่มีประวัติ" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </Card>
            ) : (
              <Card title={<Space><HistoryOutlined /><span>ประวัติการเสนอปริมาณ</span></Space>}>
                <Table
                  dataSource={historyRounds}
                  columns={historyCols}
                  rowKey="roundId"
                  pagination={{ pageSize: 10 }}
                  size="small"
                  scroll={{ x: 'max-content' }}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* ── Offer Modal ── */}
      <Modal
        open={!!offerRound}
        title={
          <Space>
            <SendOutlined style={{ color: '#1a7c3e' }} />
            เสนอปริมาณยาง — {offerRound?.roundId}
          </Space>
        }
        onCancel={() => { setOfferRound(null); offerForm.resetFields(); }}
        onOk={handleSubmitOffer}
        okText="ยืนยันเสนอปริมาณ"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#1a7c3e', borderColor: '#1a7c3e' } }}
        width={500}
      >
        {offerRound && (
          <>
            <Divider style={{ margin: '12px 0' }} />

            {/* Round info */}
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="หัวข้อรอบ" span={2}>{offerRound.topic}</Descriptions.Item>
              <Descriptions.Item label="ผู้ซื้อ" span={2}>
                <Space>
                  <TrophyOutlined style={{ color: '#52c41a' }} />
                  <Text strong>{offerRound.winnerBuyerName}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="ชนิดยาง" span={2}>
                <Tag color="blue">{offerRound.rubberType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ปริมาณที่ต้องการ">
                <Text strong>{offerRound.targetWeight.toLocaleString()} กก.</Text>
              </Descriptions.Item>
              <Descriptions.Item label="ราคาอ้างอิง">
                <Text strong style={{ color: '#1a7c3e' }}>{offerRound.winnerPrice.toFixed(2)} ฿/กก.</Text>
              </Descriptions.Item>
              {offerRound.deliveryDate && (
                <Descriptions.Item label="กำหนดส่งมอบ" span={2}>{offerRound.deliveryDate}</Descriptions.Item>
              )}
            </Descriptions>

            {/* Offer form */}
            <Form form={offerForm} layout="vertical">
              <Form.Item
                label="ปริมาณที่เสนอ (กก.)"
                name="offeredWeight"
                rules={[{ required: true, message: 'กรุณาระบุปริมาณ' }]}
              >
                <InputNumberSuffix
                  style={{ width: '100%' }}
                  min={100} step={100}
                  placeholder={`สูงสุด ${offerRound.targetWeight.toLocaleString()}`}
                  suffix="กก."
                />
              </Form.Item>
              <Form.Item
                label="วันที่เก็บยาง (ช่วง)"
                name="tappingRange"
                tooltip="ระบุช่วงวันที่เก็บยางของท่าน — ถ้าเก็บวันเดียวเลือกวันเดียวกันทั้งสองช่อง ข้อมูลนี้จะส่งให้ผู้ซื้อทราบความสดของยาง"
                rules={[{ required: true, message: 'กรุณาระบุช่วงวันที่เก็บยาง' }]}
              >
                <DatePicker.RangePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  allowEmpty={[false, false]}
                />
              </Form.Item>
              <Form.Item
                label="DRC (% เนื้อยางแห้ง)"
                name="drc"
                tooltip="จำเป็นสำหรับน้ำยางสด — สำหรับยางอื่นใส่ถ้ามีค่า"
              >
                <InputNumberSuffix
                  style={{ width: '100%' }}
                  min={0} max={100} step={0.5} precision={1}
                  placeholder="เช่น 35"
                  suffix="%"
                />
              </Form.Item>
            </Form>

            <Alert
              type="warning"
              showIcon
              title={`เมื่อยืนยันแล้วจะไม่สามารถแก้ไขได้ — ระบบจะใช้วันส่งมอบของรอบ (${offerRound.deliveryDate ?? 'ยังไม่กำหนด'}) และเจ้าหน้าที่จะพิจารณาจัดสรรปริมาณจากผู้ขายทุกรายในรอบนี้`}
            />
          </>
        )}
      </Modal>

      {/* ── Detail Modal ── */}
      <Modal
        open={!!detailRound}
        title={
          <Space>
            <EyeOutlined style={{ color: '#1a7c3e' }} />
            รายละเอียดรอบ — {detailRound?.roundId}
          </Space>
        }
        onCancel={() => setDetailRound(null)}
        footer={
          detailRound?.roundStatus === 'collecting' && !detailRound.mySubmission ? (
            <Space>
              <Button onClick={() => setDetailRound(null)}>ปิด</Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
                onClick={() => { setDetailRound(null); setOfferRound(detailRound); }}
              >
                เสนอปริมาณ
              </Button>
            </Space>
          ) : (
            <Space>
              <Button onClick={() => setDetailRound(null)}>ปิด</Button>
              {detailRound && canDeleteSubmission(detailRound) && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteSubmission(detailRound)}
                >
                  ลบปริมาณที่เสนอ
                </Button>
              )}
            </Space>
          )
        }
        width={540}
      >
        {detailRound && (
          <>
            <Divider style={{ margin: '12px 0' }} />

            {/* Round status */}
            <div style={{ marginBottom: 16 }}>
              <Tag color={ROUND_STATUS_CFG[detailRound.roundStatus].color} style={{ fontSize: 13 }}>
                {ROUND_STATUS_CFG[detailRound.roundStatus].label}
              </Tag>
            </div>

            {/* Round info */}
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="รหัสรอบ" span={2}><Text strong>{detailRound.roundId}</Text></Descriptions.Item>
              <Descriptions.Item label="หัวข้อรอบ" span={2}>{detailRound.topic}</Descriptions.Item>
              <Descriptions.Item label="ผู้ซื้อ (ผู้ชนะ)" span={2}>
                <Space>
                  <TrophyOutlined style={{ color: '#52c41a' }} />
                  <Text strong>{detailRound.winnerBuyerName}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="ชนิดยางที่ต้องการ" span={2}>
                <Tag color="blue">{detailRound.rubberType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ปริมาณที่ต้องการ">
                <Text strong>{detailRound.targetWeight.toLocaleString()} กก.</Text>
              </Descriptions.Item>
              <Descriptions.Item label="ราคาอ้างอิง">
                <Text strong style={{ color: '#1a7c3e' }}>{detailRound.winnerPrice.toFixed(2)} ฿/กก.</Text>
              </Descriptions.Item>
              <Descriptions.Item label="วันปิดรับประมูล">{detailRound.bidDeadline}</Descriptions.Item>
              <Descriptions.Item label="กำหนดส่งมอบ">{detailRound.deliveryDate ?? '—'}</Descriptions.Item>
            </Descriptions>

            {/* My submission */}
            <Text strong style={{ display: 'block', marginBottom: 8 }}>ข้อเสนอของฉัน</Text>
            {detailRound.mySubmission ? (
              <>
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 12 }}>
                  <Descriptions.Item label="ปริมาณที่เสนอ" span={2}>
                    <Text strong>{detailRound.mySubmission.offeredWeight.toLocaleString()} กก.</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="เวลายื่น" span={2}>{detailRound.mySubmission.submittedAt}</Descriptions.Item>
                  <Descriptions.Item label="สถานะ" span={2}>
                    {(() => {
                      const cfg = SUBMIT_STATUS_CFG[detailRound.mySubmission.status];
                      return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
                    })()}
                  </Descriptions.Item>
                  {detailRound.mySubmission.status === 'allocated' && detailRound.mySubmission.allocatedWeight != null && (
                    <>
                      <Descriptions.Item label="ปริมาณที่ได้รับจัดสรร" span={2}>
                        <Progress
                          percent={Math.round((detailRound.mySubmission.allocatedWeight / detailRound.mySubmission.offeredWeight) * 100)}
                          strokeColor="#1a7c3e"
                          format={() => `${detailRound.mySubmission!.allocatedWeight!.toLocaleString()} / ${detailRound.mySubmission!.offeredWeight.toLocaleString()} กก.`}
                        />
                      </Descriptions.Item>
                      <Descriptions.Item label="มูลค่าสัญญา (฿)" span={2}>
                        <Text strong style={{ color: '#1a7c3e', fontSize: 15 }}>
                          {(detailRound.mySubmission.allocatedWeight * detailRound.winnerPrice).toLocaleString()} ฿
                        </Text>
                      </Descriptions.Item>
                    </>
                  )}
                </Descriptions>
              </>
            ) : (
              <Alert
                type="info"
                showIcon
                title={
                  detailRound.roundStatus === 'collecting'
                    ? 'ยังไม่ได้เสนอปริมาณ — กด "เสนอปริมาณ" เพื่อเข้าร่วมรอบนี้'
                    : 'ไม่ได้เข้าร่วมรอบนี้'
                }
              />
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
