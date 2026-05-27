'use client';

import { useState } from 'react';
import {
  Card, Table, Tag, Button, Modal, Descriptions, Alert, Typography, Steps,
} from 'antd';
import { CarOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { MOCK_DELIVERIES } from '@/features/deliveries/services/mock-deliveries';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function AuctionOfficerDeliveryPage() {
  const [detail, setDetail] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<any>(null);
  const [confirmed, setConfirmed] = useState(false);

  const statusConfig: Record<string, { color: string; label: string; step: number }> = {
    pending: { color: 'warning', label: 'รอนัดหมาย', step: 0 },
    approved: { color: 'processing', label: 'อนุมัติแล้ว', step: 1 },
    completed: { color: 'success', label: 'รับมอบแล้ว', step: 2 },
  };

  const columns = [
    { title: 'สัญญา', dataIndex: 'contractNo', render: (v: string) => <span className="font-semibold">{v}</span> },
    { title: 'วันนัดหมาย', dataIndex: 'appointmentDate', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'ผู้รับ', dataIndex: 'receiverName' },
    { title: 'ทะเบียนรถ', dataIndex: 'vehiclePlate' },
    { title: 'จังหวัด', dataIndex: 'province' },
    { title: 'น้ำหนัก (กก.)', dataIndex: 'weight', render: (v: number) => v.toLocaleString(), align: 'right' as const },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      render: (s: string) => <Tag color={statusConfig[s]?.color}>{statusConfig[s]?.label}</Tag>,
    },
    {
      title: '',
      render: (r: any) => (
        <div className="flex gap-1">
          <Button size="small" icon={<EyeOutlined />} onClick={() => setDetail(r)}>รายละเอียด</Button>
          {r.status === 'pending' && (
            <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => { setConfirmModal(r); setConfirmed(false); }}>
              อนุมัติ
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card title={<span><CarOutlined style={{ marginRight: 8, color: '#1677ff' }} />รายการรับมอบยาง</span>}>
        <Table dataSource={MOCK_DELIVERIES} columns={columns} rowKey="id" scroll={{ x: 'max-content' }} />
      </Card>

      {/* Detail Modal */}
      <Modal
        open={!!detail} onCancel={() => setDetail(null)}
        footer={[<Button key="close" onClick={() => setDetail(null)}>ปิด</Button>]}
        title="รายละเอียดการรับมอบ" width={520}
      >
        {detail && (
          <>
            <Steps
              current={statusConfig[detail.status]?.step ?? 0}
              size="small"
              className="mb-4"
              items={[{ title: 'รอนัดหมาย' }, { title: 'อนุมัติ' }, { title: 'รับมอบแล้ว' }]}
            />
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label="สัญญา">{detail.contractNo}</Descriptions.Item>
              <Descriptions.Item label="สถานะ"><Tag color={statusConfig[detail.status]?.color}>{statusConfig[detail.status]?.label}</Tag></Descriptions.Item>
              <Descriptions.Item label="วันนัดหมาย">{dayjs(detail.appointmentDate).format('DD/MM/YYYY')}</Descriptions.Item>
              <Descriptions.Item label="จังหวัด">{detail.province}</Descriptions.Item>
              <Descriptions.Item label="ผู้รับ">{detail.receiverName}</Descriptions.Item>
              <Descriptions.Item label="ทะเบียนรถ">{detail.vehiclePlate}</Descriptions.Item>
              <Descriptions.Item label="น้ำหนัก" span={2}>{detail.weight?.toLocaleString()} กก.</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>

      {/* Confirm Approval Modal */}
      <Modal
        open={!!confirmModal} onCancel={() => setConfirmModal(null)}
        footer={confirmed ? [<Button key="close" onClick={() => setConfirmModal(null)}>ปิด</Button>] : [
          <Button key="cancel" onClick={() => setConfirmModal(null)}>ยกเลิก</Button>,
          <Button key="ok" type="primary" icon={<CheckCircleOutlined />} onClick={() => setConfirmed(true)}>ยืนยันอนุมัติ</Button>,
        ]}
        title="อนุมัติการนัดรับมอบ" width={400}
      >
        {confirmed ? (
          <div className="text-center py-8">
            <CheckCircleOutlined style={{ fontSize: 56, color: '#52c41a' }} />
            <div className="text-lg font-semibold mt-4" style={{ color: '#1a7c3e' }}>อนุมัติสำเร็จ!</div>
          </div>
        ) : (
          <Alert type="info" showIcon title={`ยืนยันอนุมัตินัดรับมอบสัญญา ${confirmModal?.contractNo} วันที่ ${confirmModal ? dayjs(confirmModal.appointmentDate).format('DD/MM/YYYY') : ''}`} />
        )}
      </Modal>
    </div>
  );
}
