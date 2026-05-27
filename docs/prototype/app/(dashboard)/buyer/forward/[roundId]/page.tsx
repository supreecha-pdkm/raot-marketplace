'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  Card, Table, Tag, Space, Typography, Row, Col, Statistic,
  Descriptions, Steps, Alert, Progress, Button, Divider, Result,
} from 'antd';
import {
  CalendarOutlined, TrophyOutlined, TeamOutlined, FileProtectOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  ArrowLeftOutlined, ExclamationCircleOutlined, UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  MOCK_ROUNDS,
  type RoundStatus, type BidStatus,
  type ContractDetail, type SellerSubmission,
} from '@/features/forward/services/forward-data';

const { Text, Title, Paragraph } = Typography;

// ─── Config (same as list page) ──────────────────────────────────────────────

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

const STEP_ITEMS = [
  { title: 'เปิดประมูลฝั่งผู้ซื้อ', icon: <TrophyOutlined /> },
  { title: 'รับปริมาณผู้ขาย',       icon: <TeamOutlined /> },
  { title: 'ออกสัญญา',              icon: <FileProtectOutlined /> },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForwardRoundDetailPage({
  params,
}: {
  params: Promise<{ roundId: string }>;
}) {
  const { roundId } = use(params);
  const round = MOCK_ROUNDS.find((r) => r.roundId === roundId);

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!round) {
    return (
      <Result
        status="404"
        title="ไม่พบรอบตลาดล่วงหน้า"
        subTitle={`ไม่พบข้อมูลรอบรหัส ${roundId}`}
        extra={
          <Link href="/buyer/forward">
            <Button type="primary" icon={<ArrowLeftOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
              กลับไปยังรายการรอบ
            </Button>
          </Link>
        }
      />
    );
  }

  const roundCfg       = ROUND_STATUS_CFG[round.roundStatus];
  const submissions    = round.sellerSubmissions ?? [];
  const bid            = round.myBid;
  const hasExcess      = !!bid && bid.bidStatus === 'winner' && round.sellerCollectedWeight > bid.bidWeight;
  const pendingDecision = hasExcess && !bid?.allocationChoice && (!bid?.contracts || bid.contracts.length === 0);

  // ── Seller submissions table ─────────────────────────────────────────────
  const sellerCols: ColumnsType<SellerSubmission> = [
    {
      title: 'ลำดับ',
      width: 60,
      align: 'center',
      render: (_, __, i) => i + 1,
    },
    {
      title: 'ผู้ขาย',
      dataIndex: 'sellerName',
      render: (v: string) => (
        <Space>
          <UserOutlined style={{ color: '#1a7c3e' }} />
          <Text strong>{v}</Text>
        </Space>
      ),
    },
    {
      title: 'ปริมาณที่เสนอ (กก.)',
      dataIndex: 'offeredWeight',
      align: 'right',
      render: (v: number) => <Text strong>{v.toLocaleString()}</Text>,
    },
    {
      title: 'ปริมาณที่ได้รับจัดสรร (กก.)',
      dataIndex: 'allocatedWeight',
      align: 'right',
      render: (v?: number, r?: SellerSubmission) => {
        if (v == null) return <Text type="secondary">—</Text>;
        if (r && v < r.offeredWeight) {
          return <Text strong style={{ color: '#fa8c16' }}>{v.toLocaleString()}</Text>;
        }
        return <Text strong style={{ color: '#1a7c3e' }}>{v.toLocaleString()}</Text>;
      },
    },
    {
      title: 'สถานะ',
      render: (_, r) => {
        if (r.allocatedWeight == null) return <Tag color="processing">รอจัดสรร</Tag>;
        if (r.allocatedWeight === 0) return <Tag color="default">ไม่ได้รับ</Tag>;
        if (r.allocatedWeight < r.offeredWeight) return <Tag color="warning">ตัดปริมาณบางส่วน</Tag>;
        return <Tag color="success" icon={<CheckCircleOutlined />}>ได้รับเต็มจำนวน</Tag>;
      },
    },
    { title: 'เวลายื่น', dataIndex: 'submittedAt', render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
  ];

  const contractCols: ColumnsType<ContractDetail> = [
    { title: 'เลขสัญญา', dataIndex: 'contractNo', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'ผู้ขาย', dataIndex: 'sellerName' },
    { title: 'ปริมาณ (กก.)', dataIndex: 'quantity', align: 'right', render: (v: number) => v.toLocaleString() },
    { title: 'ราคา (฿/กก.)', dataIndex: 'price', align: 'right', render: (v: number) => v.toFixed(2) },
    { title: 'มูลค่ารวม (฿)', dataIndex: 'totalValue', align: 'right', render: (v: number) => <Text strong>{v.toLocaleString()}</Text> },
    { title: 'กำหนดส่งมอบ', dataIndex: 'deliveryDate' },
    { title: 'สถานะ', render: () => <Tag color="success" icon={<CheckCircleOutlined />}>ลงนามแล้ว</Tag> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <Link href="/buyer/forward">
            <Button type="text" icon={<ArrowLeftOutlined />} style={{ padding: 0, color: '#1a7c3e' }}>
              กลับไปยังรายการรอบ
            </Button>
          </Link>
          <Title level={4} style={{ margin: '8px 0 0', color: '#0f3d22' }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            รายละเอียดรอบตลาดล่วงหน้า — {round.roundId}
          </Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>{round.topic}</Paragraph>
        </div>
        <Tag color={roundCfg.color} icon={roundCfg.icon} style={{ fontSize: 13, padding: '4px 10px' }}>
          {roundCfg.label}
        </Tag>
      </div>

      {/* Progress steps */}
      <Card>
        <Steps current={roundCfg.step} size="small" items={STEP_ITEMS} />
      </Card>

      {/* Pending-decision banner */}
      {pendingDecision && (
        <Alert
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          title={`ผู้ขายเสนอมารวม ${round.sellerCollectedWeight.toLocaleString()} กก. เกินจากที่คุณประมูล (${bid!.bidWeight.toLocaleString()} กก.) ${(round.sellerCollectedWeight - bid!.bidWeight).toLocaleString()} กก.`}
          description={
            <span>
              เจ้าหน้าที่กำลังรอให้คุณตัดสินใจ &mdash; กลับไปยังหน้ารายการรอบและกดปุ่ม &ldquo;ตัดสินใจการจัดสรร&rdquo;
              {' '}
              <Link href="/buyer/forward" style={{ color: '#1677ff' }}>กลับไปยังรายการรอบ →</Link>
            </span>
          }
        />
      )}

      {/* Round info */}
      <Card title={<Space><CalendarOutlined style={{ color: '#1a7c3e' }} /><span>ข้อมูลรอบ</span></Space>}>
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="รหัสรอบ"><Text strong>{round.roundId}</Text></Descriptions.Item>
          <Descriptions.Item label="สถานะรอบ">
            <Tag color={roundCfg.color} icon={roundCfg.icon}>{roundCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="หัวข้อรอบ" span={2}>{round.topic}</Descriptions.Item>
          {round.biddingOpensAt && (
            <Descriptions.Item label="เปิดรับประมูล">{round.biddingOpensAt}</Descriptions.Item>
          )}
          <Descriptions.Item label="วันปิดรับประมูล">{round.bidDeadline}</Descriptions.Item>
          <Descriptions.Item label="กำหนดส่งมอบ">{round.deliveryDate ?? '—'}</Descriptions.Item>
          {(round.minBuyerWeight != null || round.minBuyerPrice != null) && (
            <Descriptions.Item label="ขั้นต่ำที่เสนอได้" span={2}>
              {round.minBuyerWeight != null && (
                <Tag color="blue">น้ำหนัก ≥ {round.minBuyerWeight.toLocaleString()} กก.</Tag>
              )}
              {round.minBuyerPrice != null && (
                <Tag color="blue">ราคา ≥ {round.minBuyerPrice.toFixed(2)} ฿/กก.</Tag>
              )}
            </Descriptions.Item>
          )}
          {round.remark && (
            <Descriptions.Item label="หมายเหตุ" span={2}>{round.remark}</Descriptions.Item>
          )}
          {bid?.bidStatus === 'winner' && round.roundStatus !== 'bidding' && (
            <Descriptions.Item label="ผู้ขายส่งแล้ว" span={2}>
              <Progress
                percent={Math.min(Math.round((round.sellerCollectedWeight / bid.bidWeight) * 100), 100)}
                strokeColor="#1a7c3e"
                format={() => `${round.sellerCollectedWeight.toLocaleString()} / ${bid.bidWeight.toLocaleString()} กก.`}
              />
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* My bid */}
      <Card title={<Space><TrophyOutlined style={{ color: '#1a7c3e' }} /><span>การเสนอราคาของฉัน</span></Space>}>
        {bid ? (
          <>
            <Row gutter={[16, 12]} style={{ marginBottom: 16 }}>
              <Col xs={12} md={6}>
                <Card size="small" style={{ textAlign: 'center', borderColor: '#1a7c3e' }}>
                  <Statistic title="น้ำหนักที่เสนอ" value={bid.bidWeight} suffix="กก." styles={{ content: { color: '#0f3d22' } }} />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card size="small" style={{ textAlign: 'center', borderColor: '#1677ff' }}>
                  <Statistic title="ราคาที่เสนอ" value={bid.offerPrice} precision={2} suffix="฿/กก." styles={{ content: { color: '#1677ff' } }} />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card size="small" style={{ textAlign: 'center', borderColor: '#fa8c16' }}>
                  <Statistic title="มูลค่าประมาณ" value={bid.bidWeight * bid.offerPrice} suffix="฿" styles={{ content: { color: '#fa8c16' } }} />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card size="small" style={{ textAlign: 'center', borderColor: '#52c41a' }}>
                  <div style={{ marginBottom: 8, fontSize: 14, color: '#8c8c8c' }}>สถานะการเสนอ</div>
                  {(() => {
                    const cfg = BID_STATUS_CFG[bid.bidStatus];
                    return <Tag color={cfg.color} icon={cfg.icon} style={{ fontSize: 13, padding: '4px 10px' }}>{cfg.label}</Tag>;
                  })()}
                </Card>
              </Col>
            </Row>
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="ชนิดยางที่เสนอ">
                <Tag color="blue">{bid.rubberType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="เวลายื่น">{bid.submittedAt}</Descriptions.Item>
              {bid.allocationChoice && (
                <Descriptions.Item label="การจัดสรรที่เลือก" span={2}>
                  <Tag color={bid.allocationChoice === 'all' ? 'success' : 'warning'}>
                    {bid.allocationChoice === 'all'
                      ? 'รับทั้งหมดจากผู้ขายทุกราย'
                      : 'รับเฉพาะที่ต้องการ (ตัดตามลำดับ)'}
                  </Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        ) : (
          <Alert
            type="info"
            showIcon
            title="ยังไม่ได้เสนอราคาในรอบนี้"
            description={
              round.roundStatus === 'bidding'
                ? 'รอบนี้ยังเปิดรับอยู่ — กลับไปยังรายการรอบและกด "เสนอราคา" เพื่อเข้าร่วมประมูล'
                : 'รอบนี้ปิดรับการเสนอราคาแล้ว'
            }
          />
        )}
      </Card>

      {/* Seller submissions */}
      <Card
        title={
          <Space>
            <TeamOutlined style={{ color: '#1a7c3e' }} />
            <span>รายชื่อผู้ขายที่เสนอปริมาณ</span>
            <Tag color="blue">{submissions.length} ราย</Tag>
          </Space>
        }
      >
        {submissions.length === 0 ? (
          <Alert
            type="info"
            showIcon
            title={
              round.roundStatus === 'bidding'
                ? 'รอบนี้ยังอยู่ในช่วงประมูลของผู้ซื้อ — ผู้ขายจะเริ่มเสนอปริมาณได้หลังประกาศผลผู้ชนะ'
                : 'ยังไม่มีผู้ขายเสนอปริมาณในรอบนี้'
            }
          />
        ) : (
          <>
            <Row gutter={[16, 12]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={8}>
                <Card size="small" style={{ textAlign: 'center', borderColor: '#1a7c3e' }}>
                  <Statistic
                    title="จำนวนผู้ขาย"
                    value={submissions.length}
                    suffix="ราย"
                    styles={{ content: { color: '#0f3d22' } }}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8}>
                <Card size="small" style={{ textAlign: 'center', borderColor: '#1677ff' }}>
                  <Statistic
                    title="ปริมาณที่ผู้ขายเสนอรวม"
                    value={submissions.reduce((s, x) => s + x.offeredWeight, 0)}
                    suffix="กก."
                    styles={{ content: { color: '#1677ff' } }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8}>
                <Card size="small" style={{ textAlign: 'center', borderColor: '#52c41a' }}>
                  <Statistic
                    title="ปริมาณที่จัดสรรแล้ว"
                    value={submissions.reduce((s, x) => s + (x.allocatedWeight ?? 0), 0)}
                    suffix="กก."
                    styles={{ content: { color: '#52c41a' } }}
                  />
                </Card>
              </Col>
            </Row>
            <Table
              dataSource={submissions}
              columns={sellerCols}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
            />
          </>
        )}
      </Card>

      {/* Contracts (if any) */}
      {bid?.contracts && bid.contracts.length > 0 && (
        <Card
          title={
            <Space>
              <FileTextOutlined style={{ color: '#1677ff' }} />
              <span>สัญญาซื้อขายล่วงหน้า</span>
              <Tag color="blue">{bid.contracts.length} ฉบับ</Tag>
            </Space>
          }
        >
          <Row gutter={[16, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ textAlign: 'center', borderColor: '#1a7c3e' }}>
                <Statistic title="จำนวนสัญญา" value={bid.contracts.length} suffix="ฉบับ" styles={{ content: { color: '#0f3d22' } }} />
              </Card>
            </Col>
            <Col xs={12} sm={8}>
              <Card size="small" style={{ textAlign: 'center', borderColor: '#1677ff' }}>
                <Statistic title="ปริมาณรวม (กก.)" value={bid.contracts.reduce((s, c) => s + c.quantity, 0)} styles={{ content: { color: '#1677ff' } }} />
              </Card>
            </Col>
            <Col xs={12} sm={8}>
              <Card size="small" style={{ textAlign: 'center', borderColor: '#fa8c16' }}>
                <Statistic title="มูลค่ารวม (฿)" value={bid.contracts.reduce((s, c) => s + c.totalValue, 0)} styles={{ content: { color: '#fa8c16' } }} />
              </Card>
            </Col>
          </Row>
          <Table
            dataSource={bid.contracts}
            columns={contractCols}
            rowKey="contractNo"
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}

      <Divider style={{ margin: '8px 0' }} />
      <div style={{ textAlign: 'center', paddingBottom: 8 }}>
        <Link href="/buyer/forward">
          <Button type="primary" icon={<ArrowLeftOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
            กลับไปยังรายการรอบ
          </Button>
        </Link>
      </div>
    </div>
  );
}
