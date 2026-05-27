'use client';

import { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, App, Space, Tag } from 'antd';
import { useRolesList } from '@/features/roles';
import { DEFAULT_ROLE_ID } from '@/features/roles/types/role';
import type { OfficerAccount } from '@/features/auth/services/auth';
import { useCreateOfficer, useUpdateOfficer } from '../hooks/use-officers';

interface OfficerFormModalProps {
  open: boolean;
  /** OfficerAccount being edited; null for create mode. */
  officer: OfficerAccount | null;
  onClose: () => void;
}

interface FormValues {
  username: string;
  password?: string;
  fullName: string;
  email: string;
  phone?: string;
  roleId: string;
  active: boolean;
}

export default function OfficerFormModal({ open, officer, onClose }: OfficerFormModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const { data: roles } = useRolesList();
  const createMut = useCreateOfficer();
  const updateMut = useUpdateOfficer();

  const isEdit = officer !== null;
  const submitting = createMut.isPending || updateMut.isPending;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      username: officer?.username ?? '',
      password: '',
      fullName: officer?.fullName ?? '',
      email: officer?.email ?? '',
      phone: officer?.phone ?? '',
      roleId: officer?.roleId ?? DEFAULT_ROLE_ID,
      active: officer ? officer.status === 'active' : true,
    });
  }, [open, officer, form]);

  const handleFinish = async (values: FormValues) => {
    try {
      if (isEdit && officer) {
        await updateMut.mutateAsync({
          username: officer.username,
          patch: {
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            roleId: values.roleId === DEFAULT_ROLE_ID ? undefined : values.roleId,
            status: values.active ? 'active' : 'suspended',
          },
        });
        message.success(`อัปเดตเจ้าหน้าที่ "${officer.username}" แล้ว`);
      } else {
        if (!values.password) {
          message.error('กรุณาระบุรหัสผ่าน');
          return;
        }
        await createMut.mutateAsync({
          username: values.username,
          password: values.password,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          roleId: values.roleId === DEFAULT_ROLE_ID ? undefined : values.roleId,
          status: values.active ? 'active' : 'suspended',
        });
        message.success(`สร้างเจ้าหน้าที่ "${values.username}" แล้ว`);
      }
      onClose();
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={isEdit ? 'บันทึก' : 'สร้างเจ้าหน้าที่'}
      cancelText="ยกเลิก"
      confirmLoading={submitting}
      width={560}
      destroyOnHidden
      title={isEdit ? 'แก้ไขเจ้าหน้าที่' : 'สร้างเจ้าหน้าที่ใหม่'}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="username"
          label="Username"
          rules={[
            { required: true, message: 'กรุณาระบุ username' },
            { pattern: /^[a-z0-9._-]+$/, message: 'ใช้ได้เฉพาะตัวอักษรพิมพ์เล็ก ตัวเลข . _ -' },
          ]}
        >
          <Input placeholder="เช่น clerk01" disabled={isEdit} maxLength={32} />
        </Form.Item>

        {!isEdit && (
          <Form.Item
            name="password"
            label="รหัสผ่านเริ่มต้น"
            rules={[
              { required: true, message: 'กรุณาระบุรหัสผ่าน' },
              { min: 8, message: 'อย่างน้อย 8 ตัวอักษร' },
            ]}
          >
            <Input.Password placeholder="••••••••" autoComplete="new-password" maxLength={64} />
          </Form.Item>
        )}

        <Form.Item
          name="fullName"
          label="ชื่อ-นามสกุล"
          rules={[{ required: true, message: 'กรุณาระบุชื่อ-นามสกุล' }]}
        >
          <Input maxLength={100} />
        </Form.Item>

        <Form.Item
          name="email"
          label="อีเมล"
          rules={[
            { required: true, message: 'กรุณาระบุอีเมล' },
            { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' },
          ]}
        >
          <Input maxLength={120} />
        </Form.Item>

        <Form.Item name="phone" label="เบอร์โทรศัพท์ (ไม่บังคับ)">
          <Input maxLength={20} />
        </Form.Item>

        <Form.Item
          name="roleId"
          label="Role"
          rules={[{ required: true, message: 'กรุณาเลือก Role' }]}
        >
          <Select
            placeholder="เลือก Role"
            options={(roles ?? []).map((r) => ({
              value: r.id,
              label: (
                <Space size={6}>
                  <span>{r.name}</span>
                  {r.isDefault && <Tag color="default" style={{ marginRight: 0 }}>Default</Tag>}
                  {!r.isDefault && (
                    <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                      ({r.permissions.length} เมนู)
                    </span>
                  )}
                </Space>
              ),
            }))}
          />
        </Form.Item>

        <Form.Item name="active" label="สถานะ" valuePropName="checked">
          <Switch checkedChildren="ใช้งาน" unCheckedChildren="ระงับ" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
