'use client';

import { useEffect, useMemo } from 'react';
import {
  Modal, Form, Input, Checkbox, Space, Typography, Divider, App, Tag,
} from 'antd';
import { ASSIGNABLE_MENU_CATALOG } from '../constants/menu-catalog';
import type { Role, RoleInput } from '../types/role';
import { useCreateRole, useUpdateRole } from '../hooks/use-roles';

const { Text } = Typography;

interface RoleFormModalProps {
  open: boolean;
  /** Role being edited; null for create mode. */
  role: Role | null;
  onClose: () => void;
}

interface FormValues {
  name: string;
  description?: string;
  permissions: string[];
}

export default function RoleFormModal({ open, role, onClose }: RoleFormModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const createMut = useCreateRole();
  const updateMut = useUpdateRole();

  const isEdit = role !== null;
  const isDefault = role?.isDefault === true;
  const isSystem = role?.isSystem === true;
  const submitting = createMut.isPending || updateMut.isPending;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      name: role?.name ?? '',
      description: role?.description ?? '',
      permissions: role?.permissions ?? [],
    });
  }, [open, role, form]);

  const allKeys = useMemo(
    () => ASSIGNABLE_MENU_CATALOG.flatMap((g) => g.items.map((i) => i.key)),
    [],
  );

  const handleToggleGroup = (groupKeys: string[]) => {
    const current: string[] = form.getFieldValue('permissions') ?? [];
    const allChecked = groupKeys.every((k) => current.includes(k));
    const next = allChecked
      ? current.filter((k) => !groupKeys.includes(k))
      : Array.from(new Set([...current, ...groupKeys]));
    form.setFieldValue('permissions', next);
  };

  const handleToggleAll = () => {
    const current: string[] = form.getFieldValue('permissions') ?? [];
    const allChecked = allKeys.every((k) => current.includes(k));
    form.setFieldValue('permissions', allChecked ? [] : allKeys);
  };

  const handleFinish = async (values: FormValues) => {
    const input: RoleInput = {
      name: values.name,
      description: values.description,
      permissions: isDefault ? [] : values.permissions ?? [],
    };
    try {
      if (isEdit && role) {
        await updateMut.mutateAsync({ id: role.id, patch: input });
        message.success(`อัปเดต Role "${input.name}" แล้ว`);
      } else {
        await createMut.mutateAsync(input);
        message.success(`สร้าง Role "${input.name}" แล้ว`);
      }
      onClose();
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={isEdit ? 'บันทึก' : 'สร้าง Role'}
      cancelText="ยกเลิก"
      confirmLoading={submitting}
      width={720}
      destroyOnHidden
      centered
      // Cap modal at the viewport so the permissions list scrolls internally
      // instead of pushing OK/Cancel below the fold. 100px = sticky title +
      // footer + breathing room. Scroll only the body.
      styles={{
        body: { maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' },
      }}
      title={
        <Space size={8}>
          <span>{isEdit ? 'แก้ไข Role' : 'สร้าง Role ใหม่'}</span>
          {isSystem && <Tag color="purple">ระบบ</Tag>}
          {isDefault && <Tag color="default">Default</Tag>}
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="name"
          label="ชื่อ Role"
          rules={[{ required: true, message: 'กรุณาระบุชื่อ Role' }]}
        >
          <Input placeholder="เช่น เจ้าหน้าที่ประมูล" disabled={isSystem} maxLength={80} />
        </Form.Item>

        <Form.Item name="description" label="คำอธิบาย (ไม่บังคับ)">
          <Input.TextArea rows={2} placeholder="อธิบายหน้าที่ของ Role นี้" maxLength={200} />
        </Form.Item>

        <Divider style={{ margin: '12px 0' }} />

        {isDefault ? (
          <div
            style={{
              padding: 12,
              background: '#fafafa',
              border: '1px dashed #d9d9d9',
              borderRadius: 8,
              color: '#8c8c8c',
              fontSize: 13,
            }}
          >
            Default Role ไม่สามารถกำหนดสิทธิ์ใด ๆ ได้ —
            เจ้าหน้าที่ใหม่ที่ยังไม่ถูกกำหนด Role จะอยู่ที่นี่และเห็นเพียงหน้าแรกเท่านั้น
          </div>
        ) : (
          <Form.Item
            name="permissions"
            label={
              <Space>
                <Text strong>สิทธิ์เมนู (Permission)</Text>
                <a onClick={handleToggleAll} style={{ fontSize: 12 }}>
                  สลับเลือกทั้งหมด
                </a>
              </Space>
            }
          >
            <PermissionsField onToggleGroup={handleToggleGroup} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

interface PermissionsFieldProps {
  value?: string[];
  onChange?: (next: string[]) => void;
  onToggleGroup: (groupKeys: string[]) => void;
}

function PermissionsField({ value, onChange, onToggleGroup }: PermissionsFieldProps) {
  const selected = value ?? [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {ASSIGNABLE_MENU_CATALOG.map((group) => {
        const groupKeys = group.items.map((i) => i.key);
        const allChecked = groupKeys.every((k) => selected.includes(k));
        const someChecked = groupKeys.some((k) => selected.includes(k));
        return (
          <div
            key={group.label}
            style={{
              padding: 12,
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              background: '#fafafa',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <Text strong>{group.label}</Text>
              <Checkbox
                checked={allChecked}
                indeterminate={!allChecked && someChecked}
                onChange={() => onToggleGroup(groupKeys)}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>เลือกทั้งกลุ่ม</Text>
              </Checkbox>
            </div>
            <Checkbox.Group
              value={selected}
              onChange={(next) => onChange?.(next as string[])}
              style={{ width: '100%' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 6 }}>
                {group.items.map((item) => (
                  <Checkbox key={item.key} value={item.key}>
                    {item.label}
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </div>
        );
      })}
    </div>
  );
}
