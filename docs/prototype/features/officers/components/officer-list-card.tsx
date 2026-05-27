'use client';

import { useMemo, useState } from 'react';
import {
  Card, Table, Button, Tag, Space, Typography, Avatar, Empty, App,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined,
  TeamOutlined, UserOutlined,
} from '@ant-design/icons';
import { useRolesList } from '@/features/roles';
import { DEFAULT_ROLE_ID } from '@/features/roles/types/role';
import type { OfficerAccount } from '@/features/auth/services/auth';
import { useOfficersList, useDeleteOfficer } from '../hooks/use-officers';
import OfficerFormModal from './officer-form-modal';
import ResetPasswordModal from './reset-password-modal';

const { Text } = Typography;

export default function OfficerListCard() {
  const { data: officers, isLoading } = useOfficersList();
  const { data: roles } = useRolesList();
  const deleteMut = useDeleteOfficer();
  const { modal, message } = App.useApp();

  const [editing, setEditing] = useState<OfficerAccount | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pwTarget, setPwTarget] = useState<OfficerAccount | null>(null);
  const [pwOpen, setPwOpen] = useState(false);

  // Master is intentionally hidden — it's a built-in singleton managed
  // outside this UI. Showing it here only adds noise (all destructive
  // actions are disabled anyway).
  const rows = officers ?? [];

  const roleNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of roles ?? []) map.set(r.id, r.name);
    return map;
  }, [roles]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (officer: OfficerAccount) => {
    setEditing(officer);
    setFormOpen(true);
  };
  const closeForm = () => setFormOpen(false);

  const openPw = (officer: OfficerAccount) => {
    setPwTarget(officer);
    setPwOpen(true);
  };
  const closePw = () => setPwOpen(false);

  const confirmDelete = (officer: OfficerAccount) => {
    modal.confirm({
      title: `ลบบัญชี "${officer.username}"?`,
      content: 'การลบไม่สามารถย้อนกลับได้ ผู้ใช้รายนี้จะเข้าสู่ระบบไม่ได้อีก',
      okText: 'ลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          await deleteMut.mutateAsync(officer.username);
          message.success(`ลบบัญชี "${officer.username}" แล้ว`);
        } catch (e) {
          message.error(e instanceof Error ? e.message : 'ลบไม่สำเร็จ');
        }
      },
    });
  };

  const columns: ColumnsType<OfficerAccount> = [
    {
      title: 'เจ้าหน้าที่',
      key: 'name',
      render: (_, row) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ background: '#1a7c3e' }} />
          <div>
            <span style={{ fontWeight: 600 }}>{row.fullName}</span>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{row.username}</Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'อีเมล / โทร',
      key: 'contact',
      render: (_, row) => (
        <div>
          <div style={{ fontSize: 13 }}>{row.email}</div>
          {row.phone && <Text type="secondary" style={{ fontSize: 12 }}>{row.phone}</Text>}
        </div>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      width: 220,
      render: (_, row) => {
        const id = row.roleId ?? DEFAULT_ROLE_ID;
        const name = roleNameById.get(id) ?? 'Default';
        const isDefault = id === DEFAULT_ROLE_ID;
        return (
          <Tag color={isDefault ? 'default' : 'green'}>
            <KeyOutlined style={{ marginRight: 4 }} />
            {name}
          </Tag>
        );
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (s: OfficerAccount['status']) =>
        s === 'active'
          ? <Tag color="success">ใช้งาน</Tag>
          : <Tag color="warning">ระงับ</Tag>,
    },
    {
      title: 'จัดการ',
      key: 'actions',
      width: 320,
      align: 'right',
      render: (_, row) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)}>
            แก้ไข
          </Button>
          <Button size="small" icon={<KeyOutlined />} onClick={() => openPw(row)}>
            รีเซ็ตรหัสผ่าน
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(row)}>
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title={
          <Space>
            <TeamOutlined style={{ color: '#1a7c3e' }} />
            <span>รายการเจ้าหน้าที่ทั้งหมด</span>
            <Tag color="blue">{rows.length} คน</Tag>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
            style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
          >
            เพิ่มเจ้าหน้าที่
          </Button>
        }
      >
        <Table<OfficerAccount>
          rowKey="username"
          loading={isLoading}
          columns={columns}
          dataSource={rows}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <Empty
                description={
                  <>
                    ยังไม่มีเจ้าหน้าที่ที่สร้างเพิ่ม
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      บัญชี demo (officer01 / officer02) ฝังในระบบไม่ปรากฏที่นี่
                    </Text>
                  </>
                }
              />
            ),
          }}
        />
      </Card>

      <OfficerFormModal open={formOpen} officer={editing} onClose={closeForm} />
      <ResetPasswordModal open={pwOpen} officer={pwTarget} onClose={closePw} />
    </>
  );
}
