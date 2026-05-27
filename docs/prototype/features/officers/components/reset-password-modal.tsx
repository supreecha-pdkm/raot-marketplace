'use client';

import { useEffect } from 'react';
import { Modal, Form, Input, App } from 'antd';
import type { OfficerAccount } from '@/features/auth/services/auth';
import { useResetOfficerPassword } from '../hooks/use-officers';

interface ResetPasswordModalProps {
  open: boolean;
  officer: OfficerAccount | null;
  onClose: () => void;
}

interface FormValues {
  password: string;
  confirm: string;
}

export default function ResetPasswordModal({ open, officer, onClose }: ResetPasswordModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const resetMut = useResetOfficerPassword();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const handleFinish = async (values: FormValues) => {
    if (!officer) return;
    if (values.password !== values.confirm) {
      message.error('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }
    try {
      await resetMut.mutateAsync({ username: officer.username, password: values.password });
      message.success(`รีเซ็ตรหัสผ่านของ "${officer.username}" แล้ว`);
      onClose();
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'รีเซ็ตไม่สำเร็จ');
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="บันทึก"
      cancelText="ยกเลิก"
      confirmLoading={resetMut.isPending}
      title={`รีเซ็ตรหัสผ่าน — ${officer?.username ?? ''}`}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="password"
          label="รหัสผ่านใหม่"
          rules={[
            { required: true, message: 'กรุณาระบุรหัสผ่านใหม่' },
            { min: 8, message: 'อย่างน้อย 8 ตัวอักษร' },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="ยืนยันรหัสผ่านใหม่"
          rules={[{ required: true, message: 'กรุณายืนยันรหัสผ่าน' }]}
          dependencies={['password']}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
