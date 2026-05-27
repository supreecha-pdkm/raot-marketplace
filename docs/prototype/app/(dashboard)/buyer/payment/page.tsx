'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card, Table, Tag, Button, Typography, Tabs, Alert,
} from 'antd';
import {
  DollarOutlined, CheckCircleOutlined, EyeOutlined, ClockCircleOutlined,
  HourglassOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MOCK_CONTRACTS } from '@/features/contracts/services/mock-contracts';
import { MOCK_PAYMENTS } from '@/features/payments/services/mock-payments';
import { Contract, TradingType } from '@/shared/types';
import { getPaymentStatusMap, type PaymentStatus } from '@/features/payments/services/payment-state';
import dayjs from 'dayjs';

const { Text } = Typography;

const TRADING_TYPE_CFG: Record<TradingType, { label: string; color: string }> = {
  auction:     { label: 'ประมูล',          color: 'orange' },
  negotiated:  { label: 'ตกลงราคา',        color: 'cyan'   },
  'bid-ask':   { label: 'Bid / Ask',       color: 'blue'   },
  forward:     { label: 'ตลาดล่วงหน้า',    color: 'purple' },
};

const PAYMENT_STATUS_CFG: Record<PaymentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  waiting:        { label: 'รอชำระ',              color: 'warning',    icon: <ClockCircleOutlined /> },
  waiting_verify: { label: 'รอเจ้าหน้าที่ตรวจสอบ', color: 'processing', icon: <HourglassOutlined />   },
  verified:       { label: 'ชำระเงินสำเร็จ',      color: 'success',    icon: <CheckCircleOutlined /> },
};

export default function BuyerPaymentPage() {
  // Snapshot of payment-status map — refreshed on mount + on window focus so
  // a submission made in a detail tab reflects here when the user returns.
  const [statusMap, setStatusMap] = useState<Record<string, 'waiting_verify' | 'verified'>>({});
  useEffect(() => {
    const refresh = () => setStatusMap(getPaymentStatusMap());
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  const statusOf = (contractNo: string): PaymentStatus =>
    statusMap[contractNo] ?? 'waiting';

  const contracts = MOCK_CONTRACTS.filter(c => c.status !== 'cancelled');

  const contractColumns: ColumnsType<Contract> = [
    {
      title: 'สัญญา',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.contractNo}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{r.rubberType}</div>
        </div>
      ),
    },
    {
      title: 'ประเภทการซื้อขาย',
      dataIndex: 'tradingType',
      render: (v: TradingType) => {
        const cfg = TRADING_TYPE_CFG[v];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    { title: 'น้ำหนัก (กก.)', dataIndex: 'weight', render: (v: number) => v.toLocaleString(), align: 'right' as const },
    { title: 'ราคา (฿/กก.)', dataIndex: 'price', render: (v: number) => v.toFixed(2), align: 'right' as const },
    {
      title: 'ยอดรวม (฿)',
      dataIndex: 'totalAmount',
      render: (v: number) => <span style={{ fontWeight: 700, color: '#ff4d4f' }}>{v.toLocaleString()}</span>,
      align: 'right' as const,
    },
    {
      title: 'ครบกำหนด',
      dataIndex: 'dueDate',
      render: (v: string) => {
        const isOverdue = dayjs(v).isBefore(dayjs());
        return <Tag color={isOverdue ? 'error' : 'warning'}>{dayjs(v).format('DD/MM/YYYY')}</Tag>;
      },
    },
    {
      title: 'สถานะชำระเงิน',
      render: (_, r) => {
        const cfg = PAYMENT_STATUS_CFG[statusOf(r.contractNo)];
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'รายละเอียด',
      align: 'center' as const,
      render: (_, r) => (
        <Link href={`/buyer/payment/${r.contractNo}`} target="_blank" rel="noopener">
          <Button size="small" icon={<EyeOutlined />}>
            ดูรายละเอียด
          </Button>
        </Link>
      ),
    },
  ];

  const pendingCount = contracts.filter(c => statusOf(c.contractNo) === 'waiting').length;

  const paymentColumns = [
    { title: 'สัญญา', dataIndex: 'contractNo', render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
    {
      title: 'จำนวน (฿)',
      dataIndex: 'amount',
      render: (v: number) => v.toLocaleString(),
      align: 'right' as const,
    },
    {
      title: 'วิธีชำระ',
      dataIndex: 'method',
      render: (v: string) => ({ transfer: 'โอนเงิน', cash: 'เงินสด', qr: 'QR Payment' }[v]),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      render: (v: string) => ({
        pending: <Tag color="warning" icon={<ClockCircleOutlined />}>รอตรวจสอบ</Tag>,
        approved: <Tag color="success" icon={<CheckCircleOutlined />}>อนุมัติ</Tag>,
        rejected: <Tag color="error">ปฏิเสธ</Tag>,
      }[v]),
    },
    {
      title: 'วันที่',
      dataIndex: 'submittedAt',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs
        items={[
          {
            key: 'contracts',
            label: (
              <span>
                <DollarOutlined style={{ marginRight: 6 }} />
                รายการชำระเงิน
                {pendingCount > 0 && (
                  <Tag color="warning" style={{ marginLeft: 6 }}>{pendingCount} รอชำระ</Tag>
                )}
              </span>
            ),
            children: (
              <Card>
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                  title="คลิก “ดูรายละเอียด” เพื่อเปิดหน้ารายละเอียดในแท็บใหม่และชำระเงินได้ในหน้านั้น"
                  description={<Text type="secondary" style={{ fontSize: 12 }}>รายการที่ชำระแล้วจะยังคงแสดงอยู่ในลิสต์ เพื่อให้สามารถดูรายละเอียดย้อนหลังได้</Text>}
                />
                <Table
                  dataSource={contracts}
                  columns={contractColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: 'ยังไม่มีรายการสัญญา' }}
                  scroll={{ x: 'max-content' }}
                />
              </Card>
            ),
          },
          {
            key: 'history',
            label: 'ประวัติการชำระ',
            children: (
              <Card>
                <Table dataSource={MOCK_PAYMENTS} columns={paymentColumns} rowKey="id" scroll={{ x: 'max-content' }} />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
