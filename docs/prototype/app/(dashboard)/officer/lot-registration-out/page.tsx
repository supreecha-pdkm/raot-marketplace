'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card, Table, Tag, Button, Alert, Space, Typography, Tabs,
} from 'antd';
import {
  LogoutOutlined, ReloadOutlined, EyeOutlined, CarOutlined,
  CheckCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getCheckoutQueue, type CheckoutLot } from '@/features/payments/services/checkout-queue';

const { Text, Title } = Typography;

export default function LotRegistrationOutPage() {
  const [lots, setLots] = useState<CheckoutLot[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLots(getCheckoutQueue());
    const onFocus = () => setLots(getCheckoutQueue());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  function refresh() {
    setLots(getCheckoutQueue());
  }

  const pending      = lots.filter((l) => l.status === 'pending');
  const checkedOut   = lots.filter((l) => l.status === 'checked-out');

  const cols: ColumnsType<CheckoutLot> = [
    {
      title: 'LOT',
      dataIndex: 'id',
      width: 130,
      render: (v: string) => <Text strong style={{ fontFamily: 'monospace', fontSize: 12, color: '#0958d9' }}>{v}</Text>,
    },
    {
      title: 'ผู้ขาย',
      render: (_, r) => (
        <div>
          <div style={{ fontSize: 13 }}>{r.sellerName}</div>
          <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>{r.sellerId}</Text>
        </div>
      ),
    },
    {
      title: 'ทะเบียนรถ',
      dataIndex: 'truckPlate',
      width: 160,
      render: (v: string) => (
        <Space size={4}>
          <CarOutlined style={{ color: '#1a7c3e' }} />
          <Text style={{ fontSize: 12 }}>{v}</Text>
        </Space>
      ),
    },
    { title: 'ชนิดยาง', dataIndex: 'rubberType', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: 'น้ำหนัก QR',
      dataIndex: 'qrWeight',
      width: 110,
      align: 'right',
      render: (v: number) => <span><Text strong>{v.toLocaleString()}</Text> <Text type="secondary">กก.</Text></span>,
    },
    {
      title: 'ชั่งเข้า (รวม)',
      dataIndex: 'grossWeightIn',
      width: 130,
      align: 'right',
      render: (v: number) => <span><Text strong>{v.toLocaleString()}</Text> <Text type="secondary">กก.</Text></span>,
    },
    { title: 'เวลาเข้า', dataIndex: 'checkedInAt', width: 90, render: (v: string) => <Text type="secondary" style={{ fontSize: 11 }}>{v}</Text> },
    {
      title: 'น้ำหนักยางจริง',
      width: 130,
      align: 'right',
      render: (_, r) =>
        r.realRubberWeight != null
          ? <span><Text strong style={{ color: '#1a7c3e' }}>{r.realRubberWeight.toLocaleString()}</Text> <Text type="secondary">กก.</Text></span>
          : <Text type="secondary">—</Text>,
    },
    {
      title: 'ดำเนินการ',
      width: 140,
      align: 'center',
      render: (_, r) => (
        <Link href={`/officer/lot-registration-out/${r.id}`} target="_blank" rel="noopener">
          <Button
            size="small"
            type="primary"
            icon={r.status === 'pending' ? <LogoutOutlined /> : <EyeOutlined />}
            style={r.status === 'pending'
              ? { background: '#fa8c16', borderColor: '#fa8c16' }
              : undefined}
          >
            {r.status === 'pending' ? 'ลงทะเบียนออก' : 'ดูรายละเอียด'}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#0f3d22' }}>
            <LogoutOutlined style={{ marginRight: 8 }} />
            ลงทะเบียนยาง · ออก
          </Title>
          <Text type="secondary">ชั่งรถเปล่า เปรียบเทียบน้ำหนัก และยืนยันการออกจากตลาด</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={refresh}>รีเฟรช</Button>
      </div>

      <Alert
        type="info"
        showIcon
        title={
          <span>
            รอออก: <Text strong>{pending.length}</Text> คัน · ออกแล้ววันนี้: <Text strong>{checkedOut.length}</Text> คัน
          </span>
        }
      />

      <Tabs
        items={[
          {
            key: 'pending',
            label: (
              <Space size={6}>
                <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                <span>รอออก</span>
                <Tag color="warning" style={{ margin: 0 }}>{pending.length}</Tag>
              </Space>
            ),
            children: (
              <Card>
                {pending.length === 0 ? (
                  <Alert
                    type="info"
                    showIcon
                    title="ไม่มีรถที่รอออก"
                    description="รายการจะปรากฏที่นี่หลังจากผู้ขายลงทะเบียนเข้าตลาด"
                  />
                ) : (
                  <Table
                    dataSource={pending}
                    columns={cols}
                    rowKey="id"
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    size="small"
                    scroll={{ x: 'max-content' }}
                  />
                )}
              </Card>
            ),
          },
          {
            key: 'checked-out',
            label: (
              <Space size={6}>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>ออกแล้ววันนี้</span>
                <Tag color="success" style={{ margin: 0 }}>{checkedOut.length}</Tag>
              </Space>
            ),
            children: (
              <Card>
                <Table
                  dataSource={checkedOut}
                  columns={cols}
                  rowKey="id"
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  size="small"
                  scroll={{ x: 'max-content' }}
                  locale={{ emptyText: 'ยังไม่มีรถที่ออกในวันนี้' }}
                />
              </Card>
            ),
          },
        ]}
      />

      <Text type="secondary" style={{ fontSize: 11, textAlign: 'center' }}>
        คลิก &ldquo;ลงทะเบียนออก&rdquo; เพื่อเปิดหน้ารายละเอียดในแท็บใหม่ — ชั่งรถเปล่า + เปรียบเทียบน้ำหนัก + ยืนยัน
      </Text>
    </div>
  );
}
