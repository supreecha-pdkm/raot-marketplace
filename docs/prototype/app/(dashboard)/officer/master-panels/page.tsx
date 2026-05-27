'use client';

import { useState } from 'react';
import InputNumberSuffix from '@/shared/components/input-number-suffix';
import {
  Card, Table, Button, Modal, Form, Input, InputNumber,
  Typography, Space, Popconfirm, Tag, Alert, App,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, DatabaseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MASTER_PANELS, type MasterPanel } from '@/features/panels/services/master-panels';

const { Title, Text } = Typography;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuctionOfficerMasterPanelsPage() {
  const { message } = App.useApp();
  const [rows, setRows]       = useState<MasterPanel[]>(MASTER_PANELS);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<MasterPanel | null>(null);
  const [form] = Form.useForm<MasterPanel>();

  function openCreate() {
    setEditing(null);
    form.resetFields();
    setModal(true);
  }

  function openEdit(rec: MasterPanel) {
    setEditing(rec);
    form.setFieldsValue(rec);
    setModal(true);
  }

  function handleOk() {
    form.validateFields().then((v) => {
      if (editing) {
        // Edit: ID is the stable key; disallow changing it via this flow
        setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...r, code: v.code, panelWeight: v.panelWeight } : r)));
        message.success(`อัพเดต ${editing.id} แล้ว`);
      } else {
        if (rows.some((r) => r.id === v.id)) {
          message.error(`รหัส ${v.id} มีอยู่แล้ว`);
          return;
        }
        setRows((prev) => [...prev, { id: v.id, code: v.code, panelWeight: v.panelWeight }]);
        message.success(`เพิ่ม ${v.id} แล้ว`);
      }
      setModal(false);
    });
  }

  function handleDelete(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    message.success(`ลบ ${id} แล้ว`);
  }

  const cols: ColumnsType<MasterPanel> = [
    {
      title: 'รหัสแผง (ID)',
      dataIndex: 'id',
      width: 150,
      sorter: (a, b) => a.id.localeCompare(b.id),
      render: (v: string) => <Tag color="blue" style={{ fontFamily: 'monospace', fontSize: 13 }}>{v}</Tag>,
    },
    {
      title: 'รหัสครุภัณฑ์',
      dataIndex: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code),
      render: (v: string) => <Text strong style={{ fontFamily: 'monospace' }}>{v}</Text>,
    },
    {
      title: 'น้ำหนักแผง (Panel Weight)',
      dataIndex: 'panelWeight',
      width: 220,
      align: 'right',
      sorter: (a, b) => a.panelWeight - b.panelWeight,
      render: (v: number) => (
        <span>
          <Text strong>{v.toLocaleString()}</Text>
          <Text type="secondary"> กก.</Text>
        </span>
      ),
    },
    {
      title: 'ดำเนินการ',
      width: 160,
      align: 'center',
      render: (_, r) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>
            แก้ไข
          </Button>
          <Popconfirm
            title={`ลบ ${r.id}?`}
            description="การลบข้อมูลหลักของแผงจะไม่สามารถย้อนกลับได้"
            onConfirm={() => handleDelete(r.id)}
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>ลบ</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalPanelWeight = rows.reduce((s, r) => s + r.panelWeight, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <Title level={4} style={{ margin: 0, color: '#0f3d22' }}>
          <DatabaseOutlined style={{ marginRight: 8 }} />
          ข้อมูลหลัก — แผง (Master Data)
        </Title>
        <Text type="secondary">กำหนดรหัสแผง รหัสย่อ และน้ำหนักแผงที่ใช้อ้างอิงทั่วทั้งระบบ</Text>
      </div>

      <Alert
        type="info"
        showIcon
        title="ข้อมูลที่ตั้งค่าที่นี่จะใช้เป็นรายการอ้างอิงในหน้า 'จัดการแผง' และในรายงานน้ำหนักแผง"
      />

      <Card
        title={
          <Space>
            <DatabaseOutlined style={{ color: '#1a7c3e' }} />
            <span>รายการแผงทั้งหมด</span>
            <Tag color="blue">{rows.length} แผง</Tag>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
              · น้ำหนักแผงรวม {totalPanelWeight.toLocaleString()} กก.
            </Text>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
            style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
          >
            เพิ่มแผง
          </Button>
        }
      >
        <Table
          dataSource={rows}
          columns={cols}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          size="small"
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'ยังไม่มีข้อมูลแผง — กดปุ่ม "เพิ่มแผง" เพื่อเริ่มต้น' }}
        />
      </Card>

      {/* Create / edit modal */}
      <Modal
        open={modal}
        title={
          <span>
            {editing
              ? <><EditOutlined style={{ marginRight: 8, color: '#1a7c3e' }} />แก้ไขข้อมูลแผง</>
              : <><PlusOutlined style={{ marginRight: 8, color: '#1a7c3e' }} />เพิ่มแผงใหม่</>
            }
          </span>
        }
        onCancel={() => setModal(false)}
        onOk={handleOk}
        okText={editing ? 'บันทึก' : 'เพิ่ม'}
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#1a7c3e', borderColor: '#1a7c3e' } }}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="รหัสแผง (ID)"
            name="id"
            rules={[
              { required: true, message: 'กรุณาระบุรหัสแผง' },
              { pattern: /^[A-Z0-9-]+$/, message: 'ใช้เฉพาะตัวพิมพ์ใหญ่ ตัวเลข และขีด (-)' },
            ]}
          >
            <Input
              placeholder="เช่น PNL-06"
              disabled={!!editing}
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
          <Form.Item
            label="รหัสครุภัณฑ์"
            name="code"
            rules={[{ required: true, message: 'กรุณาระบุรหัสย่อ' }]}
          >
            <Input placeholder="เช่น C2-S" style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item
            label="น้ำหนักแผง (Panel Weight)"
            name="panelWeight"
            rules={[{ required: true, message: 'กรุณาระบุน้ำหนักแผง' }]}
          >
            <InputNumberSuffix
              style={{ width: '100%' }}
              min={1}
              step={100}
              suffix="กก."
              placeholder="เช่น 2500"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
