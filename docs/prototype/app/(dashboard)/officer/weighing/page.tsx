'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card, Table, Tag, Button, Alert, Space, Typography, Tabs, Modal, App,
} from 'antd';
import {
  CheckCircleOutlined, ScissorOutlined, ReloadOutlined, ClearOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getQueue, resetQueue,
  type WaitingLot, type WeighedLot,
} from '@/features/lots/services/lot-queue';
import { resetCheckoutQueue } from '@/features/payments/services/checkout-queue';

const { Text } = Typography;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuctionOfficerWeighingPage() {
  const { message, modal } = App.useApp();
  const [waiting, setWaiting] = useState<WaitingLot[]>([]);
  const [weighed, setWeighed] = useState<WeighedLot[]>([]);

  function refresh() {
    const s = getQueue();
    setWaiting(s.waiting);
    setWeighed(s.weighed);
  }

  // Demo / prototype helper — wipes both queues (lots + checkout) so the
  // panels page can rebuild from the SEED with empty panels available again.
  function handleResetDemo() {
    modal.confirm({
      title: 'ล้างข้อมูล Demo?',
      content: 'จะล้าง lot-queue + checkout-queue ใน localStorage และโหลดข้อมูล seed ใหม่ — ใช้สำหรับทดสอบ Prototype',
      okText: 'ล้างและรีเซ็ต',
      cancelText: 'ยกเลิก',
      okButtonProps: { danger: true },
      onOk: () => {
        resetQueue();
        resetCheckoutQueue();
        const s = getQueue();
        setWaiting(s.waiting);
        setWeighed(s.weighed);
        message.success('ล้างข้อมูลแล้ว — แผงว่างพร้อมใช้งาน');
      },
    });
  }

  useEffect(() => {
    const s = getQueue();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWaiting(s.waiting);
    setWeighed(s.weighed);
    const onFocus = () => {
      const next = getQueue();
      setWaiting(next.waiting);
      setWeighed(next.weighed);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // ── Columns ──────────────────────────────────────────────────────────────

  const waitingCols: ColumnsType<WaitingLot> = [
    {
      title: 'LOT',
      dataIndex: 'id',
      width: 160,
      render: (v: string) => <Text strong style={{ fontFamily: 'monospace', fontSize: 12, color: '#0958d9' }}>{v}</Text>,
    },
    {
      title: 'ผู้ขาย',
      dataIndex: 'sellerName',
      render: (v: string, r) => (
        <div>
          <div style={{ fontSize: 13 }}>{v}</div>
          {r.sellerId && (
            <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>{r.sellerId}</Text>
          )}
        </div>
      ),
    },
    { title: 'ชนิดยาง', dataIndex: 'rubberType', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: 'เกรด',
      dataIndex: 'grade',
      width: 90,
      render: (v?: string) => v ? <Tag color="blue" style={{ margin: 0 }}>{v}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: 'น้ำหนักประมาณ',
      dataIndex: 'estimatedWeight',
      width: 140,
      align: 'right',
      render: (v: number) => <span><Text strong>{v.toLocaleString()}</Text> <Text type="secondary">กก.</Text></span>,
    },
    {
      title: 'ประเภท',
      dataIndex: 'eudrType',
      width: 130,
      render: (v: 'eudr' | 'non-eudr') =>
        v === 'eudr'
          ? <Tag color="success">EUDR</Tag>
          : <Tag>Non Green</Tag>,
    },
    {
      title: 'แหล่งที่มา',
      dataIndex: 'source',
      width: 90,
      render: (v: 'scan' | 'manual') =>
        v === 'scan'
          ? <Tag color="processing">QR</Tag>
          : <Tag>Manual</Tag>,
    },
    { title: 'เวลาสร้าง', dataIndex: 'createdAt', width: 90, render: (v: string) => <Text type="secondary" style={{ fontSize: 11 }}>{v}</Text> },
    {
      title: 'ดำเนินการ',
      width: 110,
      align: 'center',
      render: (_, r) => (
        <Link href={`/officer/weighing/${r.id}`} target="_blank" rel="noopener">
          <Button
            size="small"
            type="primary"
            icon={<ScissorOutlined />}
            style={{ background: '#fa8c16', borderColor: '#fa8c16' }}
          >
            ชั่ง
          </Button>
        </Link>
      ),
    },
  ];

  const weighedCols: ColumnsType<WeighedLot> = [
    {
      title: 'LOT',
      dataIndex: 'id',
      width: 160,
      render: (v: string) => <Text strong style={{ fontFamily: 'monospace', fontSize: 12, color: '#389e0d' }}>{v}</Text>,
    },
    { title: 'ผู้ขาย', dataIndex: 'sellerName', render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'ชนิดยาง', dataIndex: 'rubberType', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: 'น้ำหนักจริง',
      dataIndex: 'actualWeight',
      width: 150,
      align: 'right',
      render: (v: number, r) => (
        <div>
          <Text strong>{v.toLocaleString()}</Text>
          <Text type="secondary"> กก.</Text>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            ประมาณ {r.estimatedWeight.toLocaleString()} กก.
          </div>
        </div>
      ),
    },
    { title: 'ความชื้น', dataIndex: 'moisture', width: 90, align: 'right', render: (v: number) => `${v.toFixed(1)}%` },
    {
      title: 'แผง (Splits)',
      width: 220,
      render: (_, r) =>
        r.splits.length === 0 ? (
          <Text type="secondary">—</Text>
        ) : (
          <Space size={4} wrap>
            {r.splits.map((s, i) => (
              <Tag key={`${s.panelId}-${i}`} color="blue" style={{ fontFamily: 'monospace', margin: 0, fontSize: 11 }}>
                {s.panelId}: {s.weight.toLocaleString()}
              </Tag>
            ))}
          </Space>
        ),
    },
    { title: 'เวลา', dataIndex: 'weighedAt', width: 80, render: (v: string) => <Text type="secondary" style={{ fontSize: 11 }}>{v}</Text> },
    {
      title: 'สถานะ',
      width: 110,
      render: (_, r) => {
        const cnt = r.splits.length;
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            {cnt > 1 ? `ชั่ง ${cnt} แผง` : 'ชั่งแล้ว'}
          </Tag>
        );
      },
    },
    {
      title: 'ดำเนินการ',
      width: 130,
      align: 'center',
      render: (_, r) => (
        // In-tab navigation (no target="_blank") so the officer stays in the
        // same window when reviewing a completed weighing.
        <Link href={`/officer/weighing/${r.id}`}>
          <Button size="small" icon={<EyeOutlined />}>
            ดูรายละเอียด
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert
        type="info"
        showIcon
        title={
          <span>
            LOT รอชั่งน้ำหนัก: <Text strong>{waiting.length}</Text> รายการ
            {' '}· ชั่งแล้ววันนี้: <Text strong>{weighed.length}</Text> รายการ
          </span>
        }
        action={
          <Space size={4}>
            <Button size="small" icon={<ReloadOutlined />} onClick={refresh}>
              รีเฟรช
            </Button>
            <Button size="small" danger icon={<ClearOutlined />} onClick={handleResetDemo}>
              ล้างข้อมูล Demo
            </Button>
          </Space>
        }
      />

      <Tabs
        items={[
          {
            key: 'waiting',
            label: (
              <Space size={6}>
                <ScissorOutlined style={{ color: '#fa8c16' }} />
                <span>LOT รอชั่งน้ำหนัก</span>
                <Tag color="warning" style={{ margin: 0 }}>{waiting.length}</Tag>
              </Space>
            ),
            children: (
              <Card>
                {waiting.length === 0 ? (
                  <Alert
                    type="info"
                    showIcon
                    title="ไม่มี LOT ที่รอชั่ง"
                    description="LOT จะปรากฏที่นี่หลังจากเจ้าหน้าที่กด ‘ยืนยัน’ ในหน้า ‘ลงทะเบียนยาง’ (สร้างจาก QR หรือจากแบบฟอร์ม)"
                  />
                ) : (
                  <Table
                    dataSource={waiting}
                    columns={waitingCols}
                    rowKey="id"
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    size="small"
                  />
                )}
              </Card>
            ),
          },
          {
            key: 'weighed',
            label: (
              <Space size={6}>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>ชั่งน้ำหนักแล้ววันนี้</span>
                <Tag color="success" style={{ margin: 0 }}>{weighed.length}</Tag>
              </Space>
            ),
            children: (
              <Card>
                <Table
                  dataSource={weighed}
                  columns={weighedCols}
                  rowKey="id"
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  size="small"
                  locale={{ emptyText: 'ยังไม่มี LOT ที่ชั่งแล้ว' }}
                />
              </Card>
            ),
          },
        ]}
      />

      <Text type="secondary" style={{ fontSize: 11, textAlign: 'center', display: 'block' }}>
        คลิก &ldquo;ชั่ง&rdquo; เพื่อเปิดหน้ารายละเอียดในแท็บใหม่ — เลือกแผง · กดชั่ง · ทำซ้ำจนกว่าจะแบ่งยางครบ
      </Text>
    </div>
  );
}
