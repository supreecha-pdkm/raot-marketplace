'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card, Descriptions, Tag, Button, Typography, Row, Col, Statistic,
  Result, Divider, Space,
} from 'antd';
import {
  FileTextOutlined, DownloadOutlined, PrinterOutlined, ArrowLeftOutlined,
  CheckCircleOutlined, ClockCircleOutlined, HourglassOutlined, DollarOutlined,
} from '@ant-design/icons';
import { MOCK_CONTRACTS } from '@/features/contracts/services/mock-contracts';
import { TradingType } from '@/shared/types';
import { getPaymentStatus, type PaymentStatus } from '@/features/payments/services/payment-state';
import dayjs from 'dayjs';

const { Text, Title, Paragraph } = Typography;

const STATUS_CFG: Record<string, { color: string; label: string }> = {
  pending:   { color: 'warning',    label: 'รอชำระเงิน' },
  active:    { color: 'processing', label: 'กำลังดำเนินการ' },
  completed: { color: 'success',    label: 'เสร็จสิ้น' },
  cancelled: { color: 'error',      label: 'ยกเลิก' },
};

const TRADING_TYPE_CFG: Record<TradingType, { label: string; color: string }> = {
  auction:    { label: 'ประมูล',       color: 'orange' },
  negotiated: { label: 'ตกลงราคา',     color: 'cyan'   },
  'bid-ask':  { label: 'Bid / Ask',    color: 'blue'   },
  forward:    { label: 'ตลาดล่วงหน้า', color: 'purple' },
};

const PAYMENT_STATUS_CFG: Record<PaymentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  waiting:        { label: 'รอชำระ',              color: 'warning',    icon: <ClockCircleOutlined /> },
  waiting_verify: { label: 'รอเจ้าหน้าที่ตรวจสอบ', color: 'processing', icon: <HourglassOutlined />   },
  verified:       { label: 'ชำระเงินสำเร็จ',      color: 'success',    icon: <CheckCircleOutlined /> },
};

export type ViewerRole = 'buyer' | 'seller' | 'officer';

interface ContractDetailPanelProps {
  /** Contract number from URL */
  contractNo: string;
  /** Base route for the back link, e.g. "/buyer/contracts" */
  basePath: string;
  /** Determines payment-section behaviour */
  viewerRole: ViewerRole;
}

const VIEWER_LABELS: Record<ViewerRole, string> = {
  buyer:   'รายการสัญญาของฉัน',
  seller:  'รายการสัญญาของฉัน',
  officer: 'รายการสัญญาทั้งหมด',
};

export default function ContractDetailPanel({
  contractNo, basePath, viewerRole,
}: ContractDetailPanelProps) {
  const contract = MOCK_CONTRACTS.find((c) => c.contractNo === contractNo);

  // Hydrate payment status from localStorage (client-only)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('waiting');
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPaymentStatus(getPaymentStatus(contractNo));
  }, [contractNo]);

  // ── Not found ───────────────────────────────────────────────────────────
  if (!contract) {
    return (
      <Result
        status="404"
        title="ไม่พบสัญญา"
        subTitle={`ไม่พบสัญญาเลขที่ ${contractNo}`}
        extra={
          <Link href={basePath}>
            <Button type="primary" icon={<ArrowLeftOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
              กลับไปรายการสัญญา
            </Button>
          </Link>
        }
      />
    );
  }

  const statusCfg  = STATUS_CFG[contract.status];
  const tradingCfg = TRADING_TYPE_CFG[contract.tradingType];
  const payCfg     = PAYMENT_STATUS_CFG[paymentStatus];
  const showPaymentSection = viewerRole !== 'officer'; // buyer + seller see payment status; officer in this view doesn't act on payment

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <Link href={basePath}>
            <Button type="text" icon={<ArrowLeftOutlined />} style={{ padding: 0, color: '#1a7c3e' }}>
              {`กลับไป${VIEWER_LABELS[viewerRole]}`}
            </Button>
          </Link>
          <Title level={4} style={{ margin: '8px 0 0', color: '#0f3d22' }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            สัญญาซื้อขาย — {contract.contractNo}
          </Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            <Tag color={tradingCfg.color}>{tradingCfg.label}</Tag>
            <span style={{ marginLeft: 4 }}>{contract.rubberType}</span>
          </Paragraph>
        </div>
        <Space wrap>
          <Button icon={<PrinterOutlined />}>พิมพ์</Button>
          <Button type="primary" icon={<DownloadOutlined />} style={{ background: '#1677ff', borderColor: '#1677ff' }}>
            ดาวน์โหลด PDF
          </Button>
        </Space>
      </div>

      {/* Stat cards */}
      <Row gutter={[16, 12]}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1a7c3e' }}>
            <Statistic title="น้ำหนัก" value={contract.weight} suffix="กก." styles={{ content: { color: '#0f3d22' } }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1677ff' }}>
            <Statistic title="ราคา" value={contract.price} precision={2} suffix="฿/กก." styles={{ content: { color: '#1677ff' } }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#ff4d4f' }}>
            <Statistic
              title="ยอดรวม"
              value={contract.totalAmount}
              suffix="฿"
              styles={{ content: { color: '#ff4d4f', fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#fa8c16' }}>
            <div style={{ marginBottom: 8, fontSize: 14, color: '#8c8c8c' }}>สถานะสัญญา</div>
            <Tag color={statusCfg.color} style={{ fontSize: 13, padding: '4px 10px' }}>
              {statusCfg.label}
            </Tag>
          </Card>
        </Col>
      </Row>

      {/* Contract info */}
      <Card title={<Space><FileTextOutlined style={{ color: '#1a7c3e' }} /><span>รายละเอียดสัญญา</span></Space>}>
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="เลขที่สัญญา" span={2}>
            <Text strong style={{ color: '#0958d9', fontSize: 15 }}>{contract.contractNo}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="ประเภทการซื้อขาย" span={2}>
            <Tag color={tradingCfg.color}>{tradingCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="ผู้ซื้อ">{contract.buyer}</Descriptions.Item>
          <Descriptions.Item label="ผู้ขาย">{contract.seller}</Descriptions.Item>
          <Descriptions.Item label="ชนิดยาง" span={2}>{contract.rubberType}</Descriptions.Item>
          <Descriptions.Item label="น้ำหนัก">
            <Text strong>{contract.weight.toLocaleString()} กก.</Text>
          </Descriptions.Item>
          <Descriptions.Item label="ราคา">
            <Text strong>{contract.price.toFixed(2)} ฿/กก.</Text>
          </Descriptions.Item>
          <Descriptions.Item label="ยอดรวม" span={2}>
            <Text strong style={{ fontSize: 18, color: '#1a7c3e' }}>
              {contract.totalAmount.toLocaleString()} ฿
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="สถานะสัญญา">
            <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="ครบกำหนดชำระ">
            {dayjs(contract.dueDate).format('DD/MM/YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="วันที่ทำสัญญา" span={2}>
            {dayjs(contract.createdAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Payment section — buyer+seller see status; only buyer gets the pay link */}
      {showPaymentSection && (
        <Card
          title={<Space><DollarOutlined style={{ color: '#1677ff' }} /><span>สถานะการชำระเงิน</span></Space>}
          extra={
            viewerRole === 'buyer' && (
              <Link href={`/buyer/payment/${contract.contractNo}`}>
                <Button
                  type="primary"
                  icon={<DollarOutlined />}
                  style={{ background: '#1677ff', borderColor: '#1677ff' }}
                  disabled={paymentStatus === 'verified'}
                >
                  {paymentStatus === 'waiting'        ? 'ไปชำระเงิน'
                   : paymentStatus === 'waiting_verify' ? 'ดูสถานะชำระเงิน'
                   : 'ดูรายละเอียดการชำระ'}
                </Button>
              </Link>
            )
          }
        >
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="สถานะปัจจุบัน">
              <Tag color={payCfg.color} icon={payCfg.icon} style={{ fontSize: 13, padding: '4px 10px' }}>
                {payCfg.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={viewerRole === 'seller' ? 'ยอดที่จะได้รับ' : 'ยอดที่ต้องชำระ'}>
              <Text strong style={{ color: '#ff4d4f', fontSize: 15 }}>
                {contract.totalAmount.toLocaleString()} ฿
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="ครบกำหนด">
              {dayjs(contract.dueDate).format('DD/MM/YYYY')}
              {dayjs(contract.dueDate).isBefore(dayjs()) && paymentStatus === 'waiting' && (
                <Tag color="error" style={{ marginLeft: 8 }}>เกินกำหนด</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Divider style={{ margin: '8px 0' }} />
      <div style={{ textAlign: 'center', paddingBottom: 8 }}>
        <Link href={basePath}>
          <Button type="primary" icon={<ArrowLeftOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
            {`กลับไป${VIEWER_LABELS[viewerRole]}`}
          </Button>
        </Link>
      </div>
    </div>
  );
}
