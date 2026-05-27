'use client';

import { useState } from 'react';
import { Card, Table, Button, Modal, Form, InputNumber, Select, Steps, Tag, Alert, Space } from 'antd';
import { BarChartOutlined, CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import InputNumberSuffix from '@/shared/components/input-number-suffix';

const RUBBER_TYPES = ['RSS1', 'RSS2', 'RSS3', 'RSS4', 'RSS5', 'USS3', 'Cup Lump', 'Latex', 'Crepe'];

const mockPrices = [
  { id: 1, rubberType: 'RSS3', round: 1, price: 68.00, status: 'pending_director', proposedBy: 'IT Admin', proposedAt: '2024-04-17 07:00' },
  { id: 2, rubberType: 'RSS3', round: 2, price: 68.50, status: 'approved', proposedBy: 'IT Admin', proposedAt: '2024-04-17 07:05' },
  { id: 3, rubberType: 'Cup Lump', round: 1, price: 44.00, status: 'draft', proposedBy: 'IT Admin', proposedAt: '2024-04-17 07:10' },
];

const statusConfig: Record<string, { color: string; label: string; step: number }> = {
  draft: { color: 'default', label: 'ร่าง', step: 0 },
  pending_director: { color: 'warning', label: 'รอ ผอ.อนุมัติ', step: 1 },
  approved: { color: 'success', label: 'อนุมัติแล้ว', step: 2 },
  rejected: { color: 'error', label: 'ปฏิเสธ', step: 1 },
};

export default function OpeningPricePage() {
  const [proposeModal, setProposeModal] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    { title: 'ชนิดยาง', dataIndex: 'rubberType', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'รอบ', dataIndex: 'round', render: (v: number) => `รอบที่ ${v}` },
    { title: 'ราคาเปิด (฿/กก.)', dataIndex: 'price', render: (v: number) => <span className="font-bold" style={{ color: '#1a7c3e' }}>{v.toFixed(2)}</span>, align: 'right' as const },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      render: (s: string) => <Tag color={statusConfig[s].color}>{statusConfig[s].label}</Tag>,
    },
    { title: 'เสนอโดย', dataIndex: 'proposedBy', render: (v: string) => <span className="text-xs" style={{ color: '#8c8c8c' }}>{v}</span> },
    { title: 'เวลา', dataIndex: 'proposedAt', render: (v: string) => <span className="text-xs" style={{ color: '#bfbfbf' }}>{v}</span> },
    {
      title: '',
      render: (r: any) =>
        r.status === 'draft' ? (
          <Button size="small" type="primary" icon={<SendOutlined />}>ส่งอนุมัติ</Button>
        ) : null,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert
        type="info" showIcon
        title="กระบวนการอนุมัติ 2 ขั้น"
        description="IT Admin เสนอราคา → ผู้อำนวยการตลาดอนุมัติขั้นที่ 2 → ราคาเปิดใช้งาน"
      />

      <Card
        title={<span><BarChartOutlined style={{ marginRight: 8 }} />ราคาเปิดตลาด</span>}
        extra={<Button type="primary" onClick={() => setProposeModal(true)}>+ เสนอราคาเปิด</Button>}
      >
        <Table dataSource={mockPrices} columns={columns} rowKey="id" scroll={{ x: 'max-content' }} />
      </Card>

      <Modal
        open={proposeModal} onCancel={() => setProposeModal(false)}
        onOk={() => { form.resetFields(); setProposeModal(false); }}
        title="เสนอราคาเปิดตลาด" okText="เสนอราคา"
      >
        <Alert type="warning" showIcon title="ราคาที่เสนอต้องรอการอนุมัติจากผู้อำนวยการตลาด" className="mb-4" />
        <Form form={form} layout="vertical">
          <Form.Item label="ชนิดยาง" name="rubberType" rules={[{ required: true }]}>
            <Select placeholder="เลือกชนิดยาง">
              {RUBBER_TYPES.map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="รอบที่" name="round" rules={[{ required: true }]}>
            <Select placeholder="เลือกรอบ">
              {[1, 2, 3, 4, 5, 6, 7].map(r => <Select.Option key={r} value={r}>รอบที่ {r}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="ราคาเปิด (฿/กก.)" name="price" rules={[{ required: true }]}>
            <InputNumberSuffix style={{ width: '100%' }} step={0.5} precision={2} suffix="฿/กก." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
