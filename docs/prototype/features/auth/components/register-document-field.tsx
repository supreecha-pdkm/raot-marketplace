'use client';

import React from 'react';
import { App, Button, Form, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { UploadSimple } from '@phosphor-icons/react';
import {
  MAX_UPLOAD_SIZE_MB,
  MAX_UPLOAD_SIZE_BYTES,
  ACCEPTED_EXTENSIONS,
} from '../constants/register';
import { isAcceptedFile } from '../utils/register-files';

/** A document upload row with file-type + size validation. */
export function RegisterDocumentField({
  name,
  label,
  required = false,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  const { message } = App.useApp();

  const uploadProps: UploadProps = {
    maxCount: 1,
    accept: ACCEPTED_EXTENSIONS.join(','),
    listType: 'text',
    beforeUpload: (file) => {
      if (!isAcceptedFile(file)) {
        message.error(`"${file.name}" ไม่ใช่ประเภทไฟล์ที่รองรับ (JPG / PNG / PDF เท่านั้น)`);
        return Upload.LIST_IGNORE;
      }
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        const sizeMb = (file.size / 1024 / 1024).toFixed(1);
        message.error(`"${file.name}" มีขนาด ${sizeMb} MB เกินกำหนด (สูงสุด ${MAX_UPLOAD_SIZE_MB} MB)`);
        return Upload.LIST_IGNORE;
      }
      return false;
    },
  };

  return (
    <Form.Item
      label={label}
      name={name}
      valuePropName="fileList"
      getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      rules={[
        ...(required
          ? [
              {
                validator: (_: unknown, v: unknown) =>
                  Array.isArray(v) && v.length > 0
                    ? Promise.resolve()
                    : Promise.reject(new Error('กรุณาแนบไฟล์')),
              },
            ]
          : []),
        {
          validator: (_: unknown, v: unknown) => {
            if (!Array.isArray(v) || v.length === 0) return Promise.resolve();
            const file = v[0] as { originFileObj?: File; name?: string; size?: number; type?: string };
            const raw = file.originFileObj ?? (file as unknown as File);
            if (raw instanceof File) {
              if (!isAcceptedFile(raw)) {
                return Promise.reject(new Error('ประเภทไฟล์ไม่ถูกต้อง (รองรับเฉพาะ JPG / PNG / PDF)'));
              }
              if (raw.size > MAX_UPLOAD_SIZE_BYTES) {
                return Promise.reject(new Error(`ขนาดไฟล์เกิน ${MAX_UPLOAD_SIZE_MB} MB`));
              }
            }
            return Promise.resolve();
          },
        },
      ]}
    >
      <Upload {...uploadProps}>
        <Button icon={<UploadSimple size={14} weight="bold" />} block>
          เลือกไฟล์ (JPG / PNG / PDF, ≤{MAX_UPLOAD_SIZE_MB}MB)
        </Button>
      </Upload>
    </Form.Item>
  );
}
