'use client';

import { use } from 'react';
import {
  Card, Table, Tag, Space, Typography, Row, Col, Statistic,
  Descriptions, Alert, Button, Divider, Result, Tooltip, Empty,
} from 'antd';
import {
  TrophyOutlined, ArrowLeftOutlined, CheckCircleOutlined,
  FileTextOutlined, NotificationOutlined, LockOutlined,
  ClockCircleOutlined, PauseCircleOutlined, StopOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MOCK_LOTS } from '@/features/lots/services/mock-lots';
import { MOCK_BIDS, type MockBid } from '@/features/auctions/services/mock-bids';
import TappingInfo from '@/features/auctions/components/tapping-info';
import {
  formatTappingRange, formatReceivedDate,
} from '@/shared/utils/tapping-format';
import type { AuctionLot } from '@/shared/types';

const { Text, Title, Paragraph } = Typography;

// ─── Mask helpers (anti-collusion during open round) ─────────────────────────
const MASK_NAME = '●●●●●●●●';
const MASK_ID   = 'U•••';
const MASK_NUM  = '●●●●●';

export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ lotId: string }>;
}) {
  const { lotId } = use(params);
  const lot = MOCK_LOTS.find((l) => l.id === lotId);

  if (!lot) {
    return (
      <Result
        status="404"
        title="ไม่พบข้อมูล LOT"
        subTitle={`ไม่พบ LOT รหัส ${lotId}`}
        extra={
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            href="/officer/auction-control"
            style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
          >
            กลับไปหน้าควบคุมการประมูล
          </Button>
        }
      />
    );
  }

  const isClosed    = lot.status === 'closed';
  const isCancelled = lot.status === 'cancelled';
  const isOpen      = lot.status === 'open';
  const isPending   = lot.status === 'pending';

  // Bidder count is the only thing the admin sees during an open round.
  // For pending lots there are no bids yet.
  const bidderCount = isPending ? 0 : MOCK_BIDS.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <PageHeader lot={lot} />

      {/* ── State-specific body ──────────────────────────────────────────── */}
      {isClosed     && <ClosedView lot={lot} />}
      {isCancelled  && <CancelledView lot={lot} />}
      {isOpen       && <OpenView lot={lot} bidderCount={bidderCount} />}
      {isPending    && <PendingView lot={lot} />}

      {/* ── Lot info (always visible — public lot metadata) ─────────────── */}
      <Card title={<Space><FileTextOutlined style={{ color: '#1a7c3e' }} /><span>ข้อมูล LOT</span></Space>}>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="LOT No"><Text strong>{lot.lotNo}</Text></Descriptions.Item>
          <Descriptions.Item label="ชนิดยาง">{lot.rubberType}</Descriptions.Item>
          <Descriptions.Item label="เกรด">{lot.grade}</Descriptions.Item>
          <Descriptions.Item label="ตลาดกลาง">{lot.market ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="วันที่ประมูล">{lot.auctionDate}</Descriptions.Item>
          <Descriptions.Item label={isClosed ? 'ปิดรอบเวลา' : 'เวลาสิ้นสุด'}>{lot.endTime ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="วันที่เก็บยาง">
            {lot.tappingDate ? formatTappingRange(lot.tappingDate) : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="วันที่รับยาง">
            {lot.receivedDate ? formatReceivedDate(lot.receivedDate) : '—'}
          </Descriptions.Item>
          {lot.drc !== undefined && (
            <Descriptions.Item label="DRC" span={2}>
              <Text strong>{lot.drc}%</Text>
              <Text type="secondary" style={{ marginLeft: 6, fontSize: 11 }}>(Dry Rubber Content)</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
        <div style={{ marginTop: 12 }}>
          <TappingInfo
            rubberType={lot.rubberType}
            tappingDate={lot.tappingDate}
            receivedDate={lot.receivedDate}
            drc={lot.drc}
          />
        </div>
      </Card>

      <Divider style={{ margin: '8px 0' }} />
      <div style={{ textAlign: 'center', paddingBottom: 8 }}>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          href="/officer/auction-control"
          style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
        >
          กลับหน้าควบคุมการประมูล
        </Button>
      </div>
    </div>
  );
}

// ─── Page header ─────────────────────────────────────────────────────────────
function PageHeader({ lot }: { lot: AuctionLot }) {
  const statusTag =
    lot.status === 'closed'    ? <Tag color="success"    icon={<CheckCircleOutlined />} style={{ fontSize: 13, padding: '4px 10px' }}>ปิดรอบและประกาศผู้ชนะแล้ว</Tag> :
    lot.status === 'cancelled' ? <Tag color="default"    icon={<StopOutlined />}        style={{ fontSize: 13, padding: '4px 10px' }}>รอบประมูลถูกยกเลิก</Tag> :
    lot.status === 'open'      ? <Tag color="processing" icon={<ClockCircleOutlined />} style={{ fontSize: 13, padding: '4px 10px' }}>กำลังประมูล</Tag> :
                                  <Tag color="warning"   icon={<PauseCircleOutlined />} style={{ fontSize: 13, padding: '4px 10px' }}>รอเปิดประมูล</Tag>;

  const titleIconColor =
    lot.status === 'closed' ? '#faad14' :
    lot.status === 'open'   ? '#1677ff' :
                              '#8c8c8c';

  const titleLabel =
    lot.status === 'closed'    ? 'ผลการประมูล' :
    lot.status === 'cancelled' ? 'รอบประมูลที่ยกเลิก' :
    lot.status === 'open'      ? 'รายละเอียดรอบประมูล' :
                                  'รอเปิดรอบประมูล';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
      <div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          href="/officer/auction-control"
          style={{ padding: 0, color: '#1a7c3e' }}
        >
          กลับหน้าควบคุมการประมูล
        </Button>
        <Title level={4} style={{ margin: '8px 0 0', color: '#0f3d22' }}>
          <TrophyOutlined style={{ marginRight: 8, color: titleIconColor }} />
          {titleLabel} — {lot.lotNo}
        </Title>
        <Paragraph type="secondary" style={{ margin: 0 }}>
          {lot.rubberType} · เกรด {lot.grade} {lot.isEudr && <span className="badge-eudr" style={{ marginLeft: 6 }}>EUDR</span>}
        </Paragraph>
      </div>
      {statusTag}
    </div>
  );
}

// ─── CLOSED — full disclosure to admin ───────────────────────────────────────
function ClosedView({ lot }: { lot: AuctionLot }) {
  const winner   = MOCK_BIDS[0];
  const totalVal = winner.price * lot.weight;

  const bidCols: ColumnsType<MockBid> = [
    {
      title: 'อันดับ',
      dataIndex: 'rank',
      width: 60,
      align: 'center',
      render: (v: number) => (
        <div
          style={{
            width: 24, height: 24, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: v === 1 ? '#faad14' : '#bfbfbf',
            color: '#fff', fontWeight: 700, fontSize: 12,
            margin: '0 auto',
          }}
        >{v}</div>
      ),
    },
    { title: 'รหัสผู้เสนอ', dataIndex: 'bidId', width: 110 },
    { title: 'ผู้เสนอ', dataIndex: 'buyer' },
    {
      title: 'ราคาที่เสนอ (฿/กก.)',
      dataIndex: 'price',
      align: 'right',
      render: (v: number, r) => (
        <Text strong style={{ color: r.status === 'leading' ? '#1a7c3e' : undefined }}>
          {v.toFixed(2)}
        </Text>
      ),
    },
    {
      title: 'น้ำหนักที่ขอ (กก.)',
      dataIndex: 'weight',
      align: 'right',
      render: (v: number) => v.toLocaleString(),
    },
    { title: 'เวลายื่น', dataIndex: 'time' },
    {
      title: 'ผล',
      render: (_, r) => r.status === 'leading'
        ? <Tag color="success" icon={<TrophyOutlined />}>ผู้ชนะ</Tag>
        : <Tag>ไม่ได้รับคัดเลือก</Tag>,
    },
  ];

  return (
    <>
      <Alert
        type="success"
        showIcon
        icon={<TrophyOutlined />}
        title={<Text strong>ผู้ชนะ: {winner.buyer} ({winner.bidId})</Text>}
        description={`เสนอ ${winner.price.toFixed(2)} ฿/กก. × ${lot.weight.toLocaleString()} กก. = ${totalVal.toLocaleString()} ฿`}
      />

      <Row gutter={[16, 12]}>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1a7c3e' }}>
            <Statistic title="ราคาเปิด" value={lot.openingPrice} precision={2} suffix="฿/กก." styles={{ content: { color: '#0f3d22' } }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#faad14' }}>
            <Statistic title="ราคาผู้ชนะ" value={winner.price} precision={2} suffix="฿/กก." styles={{ content: { color: '#faad14' } }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1677ff' }}>
            <Statistic title="น้ำหนัก" value={lot.weight} suffix="กก." styles={{ content: { color: '#1677ff' } }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#fa8c16' }}>
            <Statistic title="มูลค่ารวม (฿)" value={totalVal} styles={{ content: { color: '#fa8c16' } }} />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <TrophyOutlined style={{ color: '#1a7c3e' }} />
            <span>ลำดับการเสนอราคา</span>
            <Tag color="blue">{MOCK_BIDS.length} ราย</Tag>
            <Tag color="purple" icon={<LockOutlined />}>เฉพาะเจ้าหน้าที่</Tag>
          </Space>
        }
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          title="ข้อมูลภายในสำหรับเจ้าหน้าที่เท่านั้น"
          description="ระบบประกาศต่อสาธารณะเฉพาะ ‘ราคาที่ชนะการประมูลสูงสุด’ โดยไม่เปิดเผยชื่อผู้ชนะและไม่เปิดเผยราคา/รายชื่อผู้เสนอราคารายอื่น เพื่อป้องกันการฮั้วประมูล รายชื่อ ราคา และอันดับด้านล่างนี้จะแสดงให้เห็นเมื่อรอบประมูลปิดเรียบร้อยแล้วเท่านั้น"
        />
        <Table
          dataSource={MOCK_BIDS}
          columns={bidCols}
          rowKey="bidId"
          pagination={false}
          size="small"
          scroll={{ x: 'max-content' }}
          onRow={(r) => ({
            style: r.status === 'leading' ? { background: '#f6ffed' } : {},
          })}
        />
      </Card>

      <Card title={<Space><NotificationOutlined style={{ color: '#1677ff' }} /><span>ขั้นตอนต่อไป</span></Space>}>
        <Alert
          type="info"
          showIcon
          title="ระบบจะดำเนินการอัตโนมัติ"
          description="สร้างสัญญาซื้อขาย, แจ้งเตือนผู้ชนะให้ชำระเงิน, แจ้งเตือนผู้ขายเตรียมส่งมอบ และอัปเดตสถานะ LOT เป็น 'ปิด/ขายแล้ว'"
        />
      </Card>
    </>
  );
}

// ─── CANCELLED ───────────────────────────────────────────────────────────────
function CancelledView({ lot }: { lot: AuctionLot }) {
  return (
    <>
      <Alert
        type="warning"
        showIcon
        icon={<StopOutlined />}
        title={<Text strong>รอบประมูลนี้ถูกยกเลิกแล้ว</Text>}
        description={`LOT ${lot.lotNo} ถูกยกเลิก — ไม่มีการประกาศผู้ชนะ ระบบได้แจ้งเตือนผู้เกี่ยวข้องเรียบร้อย`}
      />

      <Row gutter={[16, 12]}>
        <Col xs={12} md={8}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1a7c3e' }}>
            <Statistic title="ราคาเปิด" value={lot.openingPrice} precision={2} suffix="฿/กก." styles={{ content: { color: '#0f3d22' } }} />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1677ff' }}>
            <Statistic title="น้ำหนัก" value={lot.weight} suffix="กก." styles={{ content: { color: '#1677ff' } }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#8c8c8c' }}>
            <Statistic title="สถานะ" value="ยกเลิก" styles={{ content: { color: '#8c8c8c' } }} />
          </Card>
        </Col>
      </Row>
    </>
  );
}

// ─── OPEN — masked admin view (anti-collusion) ───────────────────────────────
function OpenView({ lot, bidderCount }: { lot: AuctionLot; bidderCount: number }) {
  // Build a fake "masked row" per real bid — admin sees rows exist, but
  // names/prices/order/time are replaced with placeholders. This proves to
  // the admin that bids are accumulating without revealing who or how much.
  type MaskedRow = MockBid & { _key: string };
  const maskedRows: MaskedRow[] = MOCK_BIDS.map((_, i) => ({
    _key:   `masked-${i}`,
    rank:   i + 1,
    bidId:  MASK_ID,
    buyer:  MASK_NAME,
    price:  0,
    weight: 0,
    time:   '••:••:••',
    status: 'outbid',
  }));

  const maskedCols: ColumnsType<MaskedRow> = [
    {
      title: '#',
      width: 50,
      align: 'center',
      render: (_, __, i) => (
        <div
          style={{
            width: 22, height: 22, borderRadius: '50%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: '#f0f0f0', color: '#8c8c8c', fontWeight: 600, fontSize: 11,
          }}
        >{i + 1}</div>
      ),
    },
    {
      title: 'รหัสผู้เสนอ',
      render: () => <Text type="secondary" style={{ fontFamily: 'monospace' }}>{MASK_ID}</Text>,
    },
    {
      title: 'ผู้เสนอ',
      render: () => (
        <Tooltip title="ปกปิดระหว่างประมูล — เปิดเผยเมื่อปิดรอบ">
          <Text type="secondary" style={{ fontFamily: 'monospace' }}>{MASK_NAME}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'ราคาที่เสนอ',
      align: 'right',
      render: () => (
        <Text type="secondary" style={{ fontFamily: 'monospace' }}>{MASK_NUM} ฿</Text>
      ),
    },
    {
      title: 'น้ำหนักที่ขอ',
      align: 'right',
      render: () => (
        <Text type="secondary" style={{ fontFamily: 'monospace' }}>{MASK_NUM} กก.</Text>
      ),
    },
    {
      title: 'เวลายื่น',
      render: () => <Text type="secondary" style={{ fontFamily: 'monospace' }}>••:••:••</Text>,
    },
  ];

  return (
    <>
      <Alert
        type="warning"
        showIcon
        icon={<LockOutlined />}
        title={<Text strong>รอบประมูลกำลังเปิดอยู่ — ข้อมูลผู้เสนอราคาถูกปิดไว้</Text>}
        description="ตามกฎ Anti-Collusion ระบบจะไม่แสดงรายชื่อและราคาเสนอของผู้ซื้อจนกว่าจะปิดรอบประมูล เจ้าหน้าที่จะเห็นเฉพาะจำนวนผู้เสนอราคาในช่วงนี้ ข้อมูลทั้งหมดจะเปิดเผยอัตโนมัติเมื่อปิดรอบ"
      />

      <Row gutter={[16, 12]}>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1a7c3e' }}>
            <Statistic title="ราคาเปิด" value={lot.openingPrice} precision={2} suffix="฿/กก." styles={{ content: { color: '#0f3d22' } }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#8c8c8c' }}>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 14, marginBottom: 4 }}>ราคาปัจจุบัน</div>
            <Tooltip title="ปิดไว้จนกว่าจะปิดรอบ — ป้องกันการรั่วไหลของราคาเสนอระหว่างประมูล">
              <span style={{ fontSize: 18, fontWeight: 700, color: '#8c8c8c', fontFamily: 'monospace' }}>
                {MASK_NUM} <LockOutlined style={{ fontSize: 12 }} />
              </span>
            </Tooltip>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1677ff' }}>
            <Statistic title="น้ำหนัก" value={lot.weight} suffix="กก." styles={{ content: { color: '#1677ff' } }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#fa8c16' }}>
            <Statistic title="จำนวนผู้เสนอราคา" value={bidderCount} suffix="ราย" styles={{ content: { color: '#fa8c16' } }} />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <EyeInvisibleOutlined style={{ color: '#8c8c8c' }} />
            <span>รายการผู้เสนอราคา (ปิดข้อมูลระหว่างประมูล)</span>
            <Tag>{bidderCount} ราย</Tag>
            <Tag color="warning" icon={<LockOutlined />}>ปกปิดข้อมูล</Tag>
          </Space>
        }
      >
        {bidderCount === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<Text type="secondary">ยังไม่มีผู้เสนอราคาในรอบนี้</Text>}
          />
        ) : (
          <Table
            dataSource={maskedRows}
            columns={maskedCols}
            rowKey="_key"
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>

      <Card title={<Space><NotificationOutlined style={{ color: '#1677ff' }} /><span>การดำเนินการ</span></Space>}>
        <Alert
          type="info"
          showIcon
          title="กลับไปปิดรอบที่หน้าควบคุม"
          description={
            <span style={{ fontSize: 12 }}>
              การปิดรอบและประกาศผู้ชนะทำได้จาก <strong>หน้าควบคุมการประมูล</strong> เท่านั้น — เพื่อให้ขั้นตอนทั้งหมด (ตรวจทาน → ยืนยัน → ประมวลผล) ถูกบันทึกใน audit log ครบถ้วน
            </span>
          }
        />
      </Card>
    </>
  );
}

// ─── PENDING — no bids yet, round not opened ─────────────────────────────────
function PendingView({ lot }: { lot: AuctionLot }) {
  return (
    <>
      <Alert
        type="info"
        showIcon
        icon={<PauseCircleOutlined />}
        title={<Text strong>รอบประมูลยังไม่เปิด</Text>}
        description={`LOT ${lot.lotNo} ยังไม่ได้เปิดรอบประมูล — เจ้าหน้าที่สามารถเปิดรอบได้จากหน้าควบคุมการประมูล`}
      />

      <Row gutter={[16, 12]}>
        <Col xs={12} md={8}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1a7c3e' }}>
            <Statistic title="ราคาเปิด" value={lot.openingPrice} precision={2} suffix="฿/กก." styles={{ content: { color: '#0f3d22' } }} />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1677ff' }}>
            <Statistic title="น้ำหนัก" value={lot.weight} suffix="กก." styles={{ content: { color: '#1677ff' } }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#fa8c16' }}>
            <Statistic title="จำนวนผู้เสนอราคา" value={0} suffix="ราย" styles={{ content: { color: '#fa8c16' } }} />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <ClockCircleOutlined style={{ color: '#fa8c16' }} />
            <span>รายการผู้เสนอราคา</span>
          </Space>
        }
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<Text type="secondary">ยังไม่มีการเสนอราคา — รอเปิดรอบประมูล</Text>}
        />
      </Card>
    </>
  );
}
