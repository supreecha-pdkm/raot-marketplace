'use client';

import { useState } from 'react';
import { Card, Table, Tag, Button, Modal, Alert, Typography, Input, Row, Col, Statistic } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, BarChartOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

const mockPrices = [
  { id: 'P1', rubberType: 'RSS3', round: 1, price: 68.00, proposedBy: 'IT Admin', proposedAt: '2024-04-17 07:00', marketRef: 68.50, status: 'pending' },
  { id: 'P2', rubberType: 'Cup Lump', round: 1, price: 44.00, proposedBy: 'IT Admin', proposedAt: '2024-04-17 07:10', marketRef: 44.50, status: 'pending' },
  { id: 'P3', rubberType: 'RSS3', round: 2, price: 68.50, proposedBy: 'IT Admin', proposedAt: '2024-04-17 07:05', marketRef: 68.50, status: 'approved' },
];

export default function ApprovePricePage() {
  const [approveModal, setApproveModal] = useState<any>(null);
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  const columns = [
    { title: 'ชนิดยาง', dataIndex: 'rubberType', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'รอบที่', dataIndex: 'round', render: (v: number) => `${v}` },
    {
      title: 'ราคาที่เสนอ (฿/กก.)',
      dataIndex: 'price',
      render: (v: number) => <span className="font-bold text-base" style={{ color: '#1a7c3e' }}>{v.toFixed(2)}</span>,
      align: 'right' as const,
    },
    {
      title: 'ราคาตลาดอ้างอิง (฿)',
      dataIndex: 'marketRef',
      render: (v: number, r: any) => (
        <span className={Math.abs(v - r.price) > 1 ? 'text-red-500 font-medium' : 'text-gray-600'}>
          {v.toFixed(2)}
        </span>
      ),
      align: 'right' as const,
    },
    { title: 'เสนอโดย', dataIndex: 'proposedBy' },
    { title: 'เวลา', dataIndex: 'proposedAt', render: (v: string) => <span className="text-xs" style={{ color: '#bfbfbf' }}>{v}</span> },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      render: (s: string) => ({
        pending: <Tag color="warning">รออนุมัติ ผอ.</Tag>,
        approved: <Tag color="success">อนุมัติแล้ว</Tag>,
        rejected: <Tag color="error">ปฏิเสธ</Tag>,
      }[s]),
    },
    {
      title: '',
      render: (r: any) => r.status === 'pending' ? (
        <div className="flex gap-1">
          <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => setApproveModal(r)}>
            อนุมัติ
          </Button>
          <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => setRejectModal(r)}>
            ปฏิเสธ
          </Button>
        </div>
      ) : null,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert
        type="info" showIcon
        title="ผู้อำนวยการตลาดอนุมัติขั้นที่ 2 (Final)"
        description="ราคาเปิดที่ IT Admin เสนอต้องผ่านการอนุมัติจาก ผอ. ก่อนนำไปใช้จริงในการประมูล"
      />

      <Card title={<span><BarChartOutlined className="text-pink-600" style={{ marginRight: 8 }} />อนุมัติราคาเปิดตลาด</span>}>
        <Table dataSource={mockPrices} columns={columns} rowKey="id" scroll={{ x: 'max-content' }} />
      </Card>

      {/* Approve Modal */}
      <Modal
        open={!!approveModal}
        onCancel={() => setApproveModal(null)}
        onOk={() => setApproveModal(null)}
        okText="อนุมัติราคาเปิด"
        title={<span><CheckCircleOutlined style={{ marginRight: 8, color: '#389e0d' }} />ยืนยันการอนุมัติราคาเปิดตลาด</span>}
      >
        {approveModal && (
          <div className="text-center py-4">
            <div className="mb-2" style={{ color: '#8c8c8c' }}>{approveModal.rubberType} — รอบที่ {approveModal.round}</div>
            <div className="text-4xl font-bold" style={{ color: '#1a7c3e' }}>{approveModal.price?.toFixed(2)} ฿/กก.</div>
            <Alert type="success" showIcon title="ราคานี้อยู่ในช่วงปกติ" className="mt-4" />
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={!!rejectModal}
        onCancel={() => setRejectModal(null)}
        onOk={() => { setRejectModal(null); setRejectReason(''); }}
        okText="ยืนยันการปฏิเสธ"
        okType="danger"
        title="ระบุเหตุผลการปฏิเสธราคา"
      >
        <Alert type="warning" showIcon title="IT Admin จะได้รับแจ้งและต้องเสนอราคาใหม่" className="mb-4" />
        <TextArea rows={3} placeholder="ระบุเหตุผล..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
      </Modal>
    </div>
  );
}
