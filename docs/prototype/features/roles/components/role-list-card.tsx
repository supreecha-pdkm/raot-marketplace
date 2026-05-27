'use client';

import { useState } from 'react';
import {
  Card, Table, Button, Tag, Space, Typography, App, Empty, Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined,
} from '@ant-design/icons';
import { useRolesList, useDeleteRole } from '../hooks/use-roles';
import type { Role } from '../types/role';
import RoleFormModal from './role-form-modal';

const { Text } = Typography;

export default function RoleListCard() {
  const { data: roles, isLoading } = useRolesList();
  const deleteMut = useDeleteRole();
  const { modal, message } = App.useApp();
  const [editing, setEditing] = useState<Role | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const confirmDelete = (role: Role) => {
    if (role.isSystem) return;
    modal.confirm({
      title: `ลบ Role "${role.name}"?`,
      content:
        'เจ้าหน้าที่ที่ใช้ Role นี้จะถูกย้ายไปที่ Default Role โดยอัตโนมัติ (เห็นแค่หน้าแรก) — ต้องการลบจริงหรือไม่?',
      okText: 'ลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          await deleteMut.mutateAsync(role.id);
          message.success(`ลบ Role "${role.name}" แล้ว`);
        } catch (e) {
          message.error(e instanceof Error ? e.message : 'ลบไม่สำเร็จ');
        }
      },
    });
  };

  const columns: ColumnsType<Role> = [
    {
      title: 'ชื่อ Role',
      dataIndex: 'name',
      key: 'name',
      render: (_, role) => (
        <Space size={6}>
          <KeyOutlined style={{ color: '#1a7c3e' }} />
          <Text strong>{role.name}</Text>
          {role.isDefault && <Tag color="default">Default</Tag>}
          {role.isSystem && <Tag color="purple">ระบบ</Tag>}
        </Space>
      ),
    },
    {
      title: 'คำอธิบาย',
      dataIndex: 'description',
      key: 'description',
      render: (v: string | undefined) =>
        v ? <Text type="secondary">{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'จำนวนสิทธิ์เมนู',
      key: 'permissions',
      width: 140,
      align: 'center',
      render: (_, role) => (
        <Tag color={role.permissions.length > 0 ? 'green' : 'default'}>
          {role.permissions.length} เมนู
        </Tag>
      ),
    },
    {
      title: 'จัดการ',
      key: 'actions',
      width: 180,
      align: 'right',
      render: (_, role) => {
        // Default Role เป็น singleton: แก้ไขหรือลบไม่ได้ — ใครก็ตามที่
        // ไม่ได้ถูก assign Role อื่นจะ fallback มาที่นี่ การเปลี่ยน
        // permission/ชื่อ/ลบทิ้งจะกระทบทุก officer ที่ยังไม่ได้กำหนด Role
        if (role.isDefault) {
          return (
            <Space>
              <Tooltip title="Default Role แก้ไขไม่ได้">
                <Button size="small" icon={<EditOutlined />} disabled>
                  แก้ไข
                </Button>
              </Tooltip>
              <Tooltip title="Default Role ลบไม่ได้">
                <Button size="small" danger icon={<DeleteOutlined />} disabled>
                  ลบ
                </Button>
              </Tooltip>
            </Space>
          );
        }
        return (
          <Space>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(role)}
            >
              แก้ไข
            </Button>
            <Button
              size="small"
              danger
              disabled={role.isSystem}
              icon={<DeleteOutlined />}
              onClick={() => confirmDelete(role)}
            >
              ลบ
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Card
        title={
          <Space>
            <KeyOutlined style={{ color: '#1a7c3e' }} />
            <span>รายการ Role ทั้งหมด</span>
            <Tag color="blue">{roles?.length ?? 0} Role</Tag>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
            style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
          >
            สร้าง Role
          </Button>
        }
      >
        <Table<Role>
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={roles ?? []}
          pagination={false}
          locale={{ emptyText: <Empty description="ยังไม่มี Role" /> }}
        />
      </Card>

      <RoleFormModal open={modalOpen} role={editing} onClose={closeModal} />
    </>
  );
}
