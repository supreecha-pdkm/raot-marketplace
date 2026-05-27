'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import InputNumberSuffix from '@/shared/components/input-number-suffix';
import {
  Card, Table, Tag, Select, Space, Typography, Row, Col, Statistic,
  Modal, Form, Button, Divider, Descriptions, Alert,
  Progress, Radio, App,
} from 'antd';
import {
  CalendarOutlined, TrophyOutlined, TeamOutlined, FileProtectOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  EyeOutlined, EditOutlined, ExclamationCircleOutlined, DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  MOCK_ROUNDS,
  type RoundStatus, type BidStatus, type AllocationMode,
  type ForwardRound,
} from '@/features/forward/services/forward-data';

const { Text, Title } = Typography;

// ─── Config ───────────────────────────────────────────────────────────────────

const RUBBER_TYPES = ['ยางแผ่นรมควัน RSS3', 'ยางแผ่นดิบ', 'ยางก้อนถ้วย', 'น้ำยางสด'];

const ROUND_STATUS_CFG: Record<RoundStatus, { label: string; color: string; icon: React.ReactNode; step: number }> = {
  bidding:     { label: 'เปิดประมูลฝั่งผู้ซื้อ', color: 'processing', icon: <TrophyOutlined />,      step: 0 },
  collecting:  { label: 'รับปริมาณผู้ขาย',       color: 'warning',    icon: <TeamOutlined />,         step: 1 },
  contracting: { label: 'ออกสัญญา',              color: 'success',    icon: <FileProtectOutlined />,  step: 2 },
};

const BID_STATUS_CFG: Record<BidStatus, { label: string; color: string; icon: React.ReactNode }> = {
  winner:  { label: 'ชนะการประมูล',      color: 'success', icon: <CheckCircleOutlined /> },
  pending: { label: 'รอประกาศผล',        color: 'default', icon: <ClockCircleOutlined /> },
  lost:    { label: 'ไม่ได้รับคัดเลือก', color: 'error',   icon: <CloseCircleOutlined /> },
};

const STATUS_FILTER_OPTIONS = [
  { value: 'all',         label: 'ทุกสถานะ' },
  { value: 'bidding',     label: 'เปิดประมูลฝั่งผู้ซื้อ' },
  { value: 'collecting',  label: 'รับปริมาณผู้ขาย' },
  { value: 'contracting', label: 'ออกสัญญา' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuyerForwardPage() {
  const { message, modal } = App.useApp();
  const [rounds, setRounds]             = useState<ForwardRound[]>(MOCK_ROUNDS);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [bidRound, setBidRound]           = useState<ForwardRound | null>(null);
  const [bidForm] = Form.useForm<{ rubberType: string; bidWeight: number; offerPrice: number }>();

  // Allocation-decision modal state
  const [allocRound, setAllocRound]   = useState<ForwardRound | null>(null);
  const [allocChoice, setAllocChoice] = useState<AllocationMode>('all');

  // True when staff scheduled bidding to open in the future and that time hasn't arrived yet.
  // We don't show countdowns or auto-refresh — the user is expected to revisit.
  function isBiddingOpenYet(r: ForwardRound): boolean {
    if (!r.biddingOpensAt) return true;
    return dayjs().isAfter(dayjs(r.biddingOpensAt));
  }

  // A round needs the buyer's allocation decision when:
  // - buyer won the bid
  // - sellers have offered more than the buyer's bid weight
  // - buyer has not yet picked an allocation
  // - contracts have not been issued yet
  function needsAllocationDecision(r: ForwardRound): boolean {
    const b = r.myBid;
    if (!b || b.bidStatus !== 'winner') return false;
    if (b.allocationChoice !== undefined) return false;
    if (b.contracts && b.contracts.length > 0) return false;
    return r.sellerCollectedWeight > b.bidWeight;
  }

  function openAllocationModal(r: ForwardRound) {
    setAllocRound(r);
    setAllocChoice(r.myBid?.allocationChoice ?? 'all');
  }

  function handleSubmitAllocation() {
    if (!allocRound || !allocRound.myBid) return;
    setRounds((prev) => prev.map((r) =>
      r.roundId === allocRound.roundId && r.myBid
        ? { ...r, myBid: { ...r.myBid, allocationChoice: allocChoice } }
        : r,
    ));
    const label = allocChoice === 'all' ? 'รับทั้งหมดจากผู้ขายทุกราย' : 'รับเฉพาะที่ต้องการ';
    message.success(`บันทึกการตัดสินใจแล้ว — ${label}`);
    setAllocRound(null);
  }

  const filtered = statusFilter === 'all'
    ? rounds
    : rounds.filter((r) => r.roundStatus === statusFilter);

  // Buyer can withdraw their bid while the round is still in bidding stage and
  // a winner hasn't been announced. Once the bid is `winner` and the system
  // has issued contracts (or moved to collecting/contracting), it is locked.
  function canDeleteBid(r: ForwardRound): boolean {
    if (!r.myBid) return false;
    if (r.myBid.contracts && r.myBid.contracts.length > 0) return false;
    return r.roundStatus === 'bidding' && r.myBid.bidStatus === 'pending';
  }

  function handleDeleteBid(r: ForwardRound) {
    if (!canDeleteBid(r)) {
      message.warning('ไม่สามารถลบราคาเสนอนี้ได้ — เข้าสู่ขั้นตอนทำสัญญาแล้ว');
      return;
    }
    modal.confirm({
      title: 'ลบราคาเสนอ?',
      content: `ต้องการลบราคาเสนอของรอบ ${r.roundId} หรือไม่?`,
      okText: 'ลบ',
      okButtonProps: { danger: true },
      cancelText: 'ยกเลิก',
      onOk: () => {
        setRounds(prev => prev.map(x =>
          x.roundId === r.roundId ? { ...x, myBid: undefined } : x,
        ));
        message.success('ลบราคาเสนอแล้ว');
      },
    });
  }

  function handleSubmitBid() {
    if (!bidRound) return;
    bidForm.validateFields().then((v) => {
      const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
      setRounds((prev) => prev.map((r) =>
        r.roundId === bidRound.roundId
          ? {
              ...r,
              myBid: {
                rubberType: v.rubberType,
                bidWeight:  Number(v.bidWeight),
                offerPrice: Number(v.offerPrice),
                bidStatus:  'pending',
                submittedAt: now,
              },
            }
          : r,
      ));
      bidForm.resetFields();
      setBidRound(null);
    });
  }

  const myBidCount   = rounds.filter((r) => r.myBid).length;
  const winCount     = rounds.filter((r) => r.myBid?.bidStatus === 'winner').length;
  const pendingCount = rounds.filter((r) => r.myBid?.bidStatus === 'pending').length;
  const totalValue   = rounds
    .filter((r) => r.myBid?.bidStatus === 'winner')
    .reduce((s, r) => s + (r.myBid?.bidWeight ?? 0) * (r.myBid?.offerPrice ?? 0), 0);

  // Compact 6-column layout. Related info is stacked vertically inside cells
  // so the table fits without horizontal scroll on a typical desktop.
  const columns: ColumnsType<ForwardRound> = [
    {
      title: 'รอบ',
      render: (_, r) => (
        <div style={{ minWidth: 180 }}>
          <Text strong style={{ color: '#0f3d22' }}>{r.roundId}</Text>
          <div style={{ fontSize: 12, color: '#595959', marginTop: 2 }}>{r.topic}</div>
        </div>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'roundStatus',
      width: 150,
      render: (s: RoundStatus) => {
        const cfg = ROUND_STATUS_CFG[s];
        return <Tag color={cfg.color} icon={cfg.icon} style={{ margin: 0 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'ช่วงประมูล / ขั้นต่ำ',
      width: 200,
      render: (_, r) => {
        const open = isBiddingOpenYet(r);
        return (
          <div style={{ fontSize: 12, lineHeight: 1.5 }}>
            {r.biddingOpensAt && (
              <div>
                <Text type="secondary">เปิด: </Text>
                <Text>{r.biddingOpensAt}</Text>
                {!open && <Tag color="warning" style={{ marginLeft: 4, fontSize: 10 }}>ยังไม่เปิด</Tag>}
              </div>
            )}
            <div>
              <Text type="secondary">ปิด: </Text>
              <Text>{r.bidDeadline}</Text>
            </div>
            {(r.minBuyerWeight != null || r.minBuyerPrice != null) && (
              <div style={{ marginTop: 2 }}>
                {r.minBuyerWeight != null && (
                  <Tag color="blue" style={{ marginRight: 4, fontSize: 10 }}>
                    ≥ {r.minBuyerWeight.toLocaleString()} กก.
                  </Tag>
                )}
                {r.minBuyerPrice != null && (
                  <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>
                    ≥ {r.minBuyerPrice.toFixed(2)} ฿
                  </Tag>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'การเสนอของฉัน',
      width: 240,
      render: (_, r) => {
        if (!r.myBid) {
          return <Text type="secondary" style={{ fontSize: 12 }}>ยังไม่เสนอราคา</Text>;
        }
        const bidCfg = BID_STATUS_CFG[r.myBid.bidStatus];
        const showProgress =
          r.myBid.bidStatus === 'winner' && r.roundStatus !== 'bidding';
        return (
          <div style={{ fontSize: 12, lineHeight: 1.5 }}>
            <div style={{ marginBottom: 2 }}>
              <Tag color="blue" style={{ marginRight: 4 }}>{r.myBid.rubberType}</Tag>
              <Tag color={bidCfg.color} icon={bidCfg.icon} style={{ margin: 0 }}>
                {bidCfg.label}
              </Tag>
            </div>
            <div>
              <Text strong>{r.myBid.bidWeight.toLocaleString()}</Text>
              <Text type="secondary"> กก. × </Text>
              <Text strong style={{ color: r.myBid.bidStatus === 'winner' ? '#1a7c3e' : undefined }}>
                {r.myBid.offerPrice.toFixed(2)}
              </Text>
              <Text type="secondary"> ฿/กก.</Text>
            </div>
            {showProgress && (
              <div style={{ marginTop: 4 }}>
                <Progress
                  percent={Math.min(Math.round((r.sellerCollectedWeight / r.myBid.bidWeight) * 100), 100)}
                  size="small"
                  strokeColor="#1a7c3e"
                  format={() =>
                    `ผู้ขายส่งแล้ว ${r.sellerCollectedWeight.toLocaleString()} / ${r.myBid!.bidWeight.toLocaleString()}`
                  }
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'กำหนดส่งมอบ',
      dataIndex: 'deliveryDate',
      width: 120,
      render: (v?: string) =>
        v ? <Text style={{ fontSize: 12 }}>{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'ดำเนินการ',
      align: 'center',
      width: 170,
      render: (_, r) => {
        const deleteBidBtn = canDeleteBid(r) ? (
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteBid(r)}
            block
          >
            ลบราคาเสนอ
          </Button>
        ) : null;

        // Priority 1: needs allocation decision (excess)
        if (needsAllocationDecision(r)) {
          return (
            <Space orientation="vertical" size={4} style={{ width: '100%' }}>
              <Button
                size="small"
                type="primary"
                danger
                icon={<ExclamationCircleOutlined />}
                onClick={() => openAllocationModal(r)}
                block
              >
                ตัดสินใจจัดสรร
              </Button>
              <Link href={`/buyer/forward/${r.roundId}`} target="_blank" rel="noopener">
                <Button size="small" icon={<EyeOutlined />} block>รายละเอียด</Button>
              </Link>
            </Space>
          );
        }
        // Priority 2: round still open, buyer hasn't bid yet
        if (r.roundStatus === 'bidding' && !r.myBid) {
          const open = isBiddingOpenYet(r);
          return (
            <Space orientation="vertical" size={4} style={{ width: '100%' }}>
              <Button
                size="small"
                type="primary"
                icon={<EditOutlined />}
                style={open ? { background: '#1a7c3e', borderColor: '#1a7c3e' } : undefined}
                disabled={!open}
                onClick={() => { setBidRound(r); }}
                title={open ? undefined : `เปิดรับประมูล ${r.biddingOpensAt}`}
                block
              >
                {open ? 'เสนอราคา' : 'ยังไม่เปิด'}
              </Button>
              <Link href={`/buyer/forward/${r.roundId}`} target="_blank" rel="noopener">
                <Button size="small" icon={<EyeOutlined />} block>รายละเอียด</Button>
              </Link>
            </Space>
          );
        }
        // Otherwise: detail link + (optional) withdraw bid
        return (
          <Space orientation="vertical" size={4} style={{ width: '100%' }}>
            <Link href={`/buyer/forward/${r.roundId}`} target="_blank" rel="noopener">
              <Button size="small" icon={<EyeOutlined />} block>รายละเอียด</Button>
            </Link>
            {deleteBidBtn}
          </Space>
        );
      },
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
        <Text type="secondary">รายการรอบตลาดล่วงหน้าทั้งหมด</Text>
      </div>

      {/* Summary */}
      <Row gutter={[16, 12]}>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1a7c3e' }}>
            <Statistic title="รอบที่เข้าร่วม" value={myBidCount} suffix={`/ ${rounds.length} รอบ`} styles={{ content: { color: '#0f3d22' } }} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#52c41a' }}>
            <Statistic title="ชนะการประมูล" value={winCount} suffix="รายการ" styles={{ content: { color: '#52c41a' } }} prefix={<TrophyOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#d9d9d9' }}>
            <Statistic title="รอประกาศผล" value={pendingCount} suffix="รายการ" styles={{ content: { color: '#595959' } }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1677ff' }}>
            <Statistic title="มูลค่ารวม (เฉพาะที่ชนะ)" value={totalValue} suffix="฿" styles={{ content: { color: '#1677ff', fontSize: 18 } }} />
          </Card>
        </Col>
      </Row>

      {/* Allocation-decision banner */}
      {rounds.some(needsAllocationDecision) && (
        <Alert
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          title={`มี ${rounds.filter(needsAllocationDecision).length} รอบที่ผู้ขายเสนอมาเกินจากที่คุณขอ — กรุณาเลือกว่าจะรับทั้งหมดหรือรับเฉพาะที่ต้องการ`}
          description="เจ้าหน้าที่กำลังรอการตัดสินใจของคุณเพื่อออกสัญญา — กดปุ่ม 'ตัดสินใจการจัดสรร' ในตารางเพื่อเลือก"
        />
      )}

      {/* Table */}
      <Card
        title={<Space><CalendarOutlined style={{ color: '#1a7c3e' }} /><span>รายการรอบตลาดล่วงหน้า</span></Space>}
        extra={
          <Space>
            <Text type="secondary">กรองสถานะรอบ:</Text>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%', minWidth: 180 }}
              options={STATUS_FILTER_OPTIONS}
            />
          </Space>
        }
      >
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="roundId"
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'ไม่มีรายการที่ตรงกับสถานะที่เลือก' }}
          onRow={(r) => ({
            style: r.myBid?.bidStatus === 'winner' ? { background: '#f6ffed' } : {},
          })}
        />
      </Card>

      {/* ── Bid Modal ── */}
      <Modal
        open={!!bidRound}
        title={
          <Space>
            <EditOutlined style={{ color: '#1a7c3e' }} />
            เสนอราคาประมูลล่วงหน้า
          </Space>
        }
        onCancel={() => { setBidRound(null); bidForm.resetFields(); }}
        onOk={handleSubmitBid}
        okText="ยืนยันเสนอราคา"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#1a7c3e', borderColor: '#1a7c3e' } }}
        width={480}
      >
        {bidRound && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="รหัสรอบ"><Text strong>{bidRound.roundId}</Text></Descriptions.Item>
              <Descriptions.Item label="หัวข้อรอบ">{bidRound.topic}</Descriptions.Item>
              {bidRound.biddingOpensAt && (
                <Descriptions.Item label="เปิดรับประมูล">{bidRound.biddingOpensAt}</Descriptions.Item>
              )}
              <Descriptions.Item label="วันปิดรับประมูล">{bidRound.bidDeadline}</Descriptions.Item>
              {(bidRound.minBuyerWeight != null || bidRound.minBuyerPrice != null) && (
                <Descriptions.Item label="ขั้นต่ำที่เสนอได้">
                  {bidRound.minBuyerWeight != null && (
                    <Tag color="blue">น้ำหนัก ≥ {bidRound.minBuyerWeight.toLocaleString()} กก.</Tag>
                  )}
                  {bidRound.minBuyerPrice != null && (
                    <Tag color="blue">ราคา ≥ {bidRound.minBuyerPrice.toFixed(2)} ฿/กก.</Tag>
                  )}
                </Descriptions.Item>
              )}
            </Descriptions>
            <Form form={bidForm} layout="vertical">
              <Form.Item
                label="ชนิดยางที่ต้องการซื้อ"
                name="rubberType"
                rules={[{ required: true, message: 'กรุณาเลือกชนิดยาง' }]}
              >
                <Select placeholder="เลือกชนิดยาง">
                  {RUBBER_TYPES.map((t) => <Select.Option key={t} value={t}>{t}</Select.Option>)}
                </Select>
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label={`น้ำหนักที่ต้องการซื้อ (กก.)${bidRound.minBuyerWeight ? ` — ขั้นต่ำ ${bidRound.minBuyerWeight.toLocaleString()}` : ''}`}
                    name="bidWeight"
                    rules={[
                      { required: true, message: 'กรุณาระบุน้ำหนัก' },
                      () => ({
                        validator(_, value) {
                          const min = bidRound.minBuyerWeight;
                          if (value == null || min == null) return Promise.resolve();
                          return value >= min
                            ? Promise.resolve()
                            : Promise.reject(new Error(`ต้องไม่ต่ำกว่า ${min.toLocaleString()} กก.`));
                        },
                      }),
                    ]}
                  >
                    <InputNumberSuffix
                      style={{ width: '100%' }}
                      min={bidRound.minBuyerWeight ?? 100}
                      step={100}
                      placeholder={bidRound.minBuyerWeight ? `≥ ${bidRound.minBuyerWeight}` : 'เช่น 2000'}
                      suffix="กก."
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={`ราคาที่เสนอ (฿/กก.)${bidRound.minBuyerPrice ? ` — ขั้นต่ำ ${bidRound.minBuyerPrice.toFixed(2)}` : ''}`}
                    name="offerPrice"
                    rules={[
                      { required: true, message: 'กรุณาระบุราคา' },
                      () => ({
                        validator(_, value) {
                          const min = bidRound.minBuyerPrice;
                          if (value == null || min == null) return Promise.resolve();
                          return value >= min
                            ? Promise.resolve()
                            : Promise.reject(new Error(`ต้องไม่ต่ำกว่า ${min.toFixed(2)} ฿/กก.`));
                        },
                      }),
                    ]}
                  >
                    <InputNumberSuffix
                      style={{ width: '100%' }}
                      min={bidRound.minBuyerPrice ?? 1}
                      step={0.5}
                      precision={2}
                      placeholder={bidRound.minBuyerPrice ? `≥ ${bidRound.minBuyerPrice.toFixed(2)}` : 'เช่น 68.50'}
                      suffix="฿/กก."
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <Alert
              type="warning"
              showIcon
              title="เมื่อยืนยันแล้วจะไม่สามารถแก้ไขได้ — ผู้ชนะพิจารณาจากราคาและน้ำหนักที่เสนอ"
            />
          </>
        )}
      </Modal>

      {/* ── Allocation-Decision Modal ── */}
      <Modal
        open={!!allocRound}
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
            เลือกวิธีรับยางส่วนเกิน — {allocRound?.roundId}
          </Space>
        }
        onCancel={() => setAllocRound(null)}
        onOk={handleSubmitAllocation}
        okText="ยืนยันการตัดสินใจ"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#1a7c3e', borderColor: '#1a7c3e' } }}
        width={520}
      >
        {allocRound && allocRound.myBid && (() => {
          const target = allocRound.myBid.bidWeight;
          const total  = allocRound.sellerCollectedWeight;
          const excess = total - target;
          return (
            <>
              <Divider style={{ margin: '12px 0' }} />
              <Alert
                type="warning"
                showIcon
                title={`ผู้ขายเสนอมารวม ${total.toLocaleString()} กก. — เกินที่คุณต้องการ (${target.toLocaleString()} กก.) ${excess.toLocaleString()} กก.`}
                description="กรุณาเลือกว่าจะรับทั้งหมด หรือรับเฉพาะปริมาณที่คุณต้องการ"
                style={{ marginBottom: 16 }}
              />

              <Row gutter={12} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Card size="small" style={{ textAlign: 'center', borderColor: '#1a7c3e' }}>
                    <Statistic title="ปริมาณที่คุณประมูล" value={target} suffix="กก." styles={{ content: { color: '#0f3d22', fontSize: 16 } }} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ textAlign: 'center', borderColor: '#1677ff' }}>
                    <Statistic title="ผู้ขายเสนอรวม" value={total} suffix="กก." styles={{ content: { color: '#1677ff', fontSize: 16 } }} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ textAlign: 'center', borderColor: '#fa8c16' }}>
                    <Statistic title="ส่วนเกิน" value={excess} suffix="กก." styles={{ content: { color: '#fa8c16', fontSize: 16 } }} />
                  </Card>
                </Col>
              </Row>

              <Text strong style={{ display: 'block', marginBottom: 8 }}>เลือกวิธีรับยาง:</Text>
              <Radio.Group
                value={allocChoice}
                onChange={(e) => setAllocChoice(e.target.value)}
                style={{ width: '100%' }}
              >
                <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                  <Card
                    size="small"
                    style={{
                      borderColor: allocChoice === 'all' ? '#1a7c3e' : '#d9d9d9',
                      background: allocChoice === 'all' ? '#f6ffed' : '#fff',
                      cursor: 'pointer',
                    }}
                    onClick={() => setAllocChoice('all')}
                  >
                    <Radio value="all">
                      <Text strong>รับทั้งหมดจากผู้ขายทุกราย</Text>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 24 }}>
                        ปริมาณที่รับ: <Text strong>{total.toLocaleString()} กก.</Text>
                        {' '}· มูลค่า: <Text strong style={{ color: '#fa8c16' }}>
                          {(total * allocRound.myBid.offerPrice).toLocaleString()} ฿
                        </Text>
                      </div>
                    </Radio>
                  </Card>
                  <Card
                    size="small"
                    style={{
                      borderColor: allocChoice === 'cut' ? '#1a7c3e' : '#d9d9d9',
                      background: allocChoice === 'cut' ? '#f6ffed' : '#fff',
                      cursor: 'pointer',
                    }}
                    onClick={() => setAllocChoice('cut')}
                  >
                    <Radio value="cut">
                      <Text strong>รับเฉพาะที่ต้องการ (ตัดตามลำดับการยื่น)</Text>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 24 }}>
                        ปริมาณที่รับ: <Text strong>{target.toLocaleString()} กก.</Text>
                        {' '}· มูลค่า: <Text strong style={{ color: '#fa8c16' }}>
                          {(target * allocRound.myBid.offerPrice).toLocaleString()} ฿
                        </Text>
                      </div>
                    </Radio>
                  </Card>
                </Space>
              </Radio.Group>

              <Alert
                type="info"
                showIcon
                style={{ marginTop: 16 }}
                title="การตัดสินใจนี้จะส่งให้เจ้าหน้าที่เพื่อออกสัญญาตามที่คุณเลือก — เมื่อยืนยันแล้วจะไม่สามารถแก้ไขได้"
              />
            </>
          );
        })()}
      </Modal>

    </div>
  );
}
