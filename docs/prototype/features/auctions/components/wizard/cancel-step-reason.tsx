'use client';

import { Alert, Form, Input, Tag } from 'antd';
import type { AuctionLot } from '@/shared/types';

const { TextArea } = Input;

const CANCEL_REASONS = [
  'ไม่มีผู้เสนอราคา',
  'ราคาเสนอต่ำกว่าราคาประกัน',
  'พบความผิดปกติของการเสนอราคา',
  'ผู้ขายขอยกเลิก',
  'อุปกรณ์/ระบบขัดข้อง',
  'อื่น ๆ (โปรดระบุ)',
];

interface CancelStepReasonProps {
  form:          ReturnType<typeof Form.useForm>[0];
  initialValues: Record<string, unknown>;
  lot:           AuctionLot;
  bidsCount:     number;
}

export default function CancelStepReason({
  form, initialValues, lot, bidsCount,
}: CancelStepReasonProps) {
  return (
    <>
      <Alert
        type="warning" showIcon style={{ marginBottom: 16 }}
        title={`ยกเลิกรอบประมูล ${lot.lotNo}?`}
        description={
          bidsCount === 0
            ? 'ยังไม่มีผู้เสนอราคาเลย — สามารถยกเลิกได้โดยไม่กระทบผู้ซื้อ'
            : `มีผู้เสนอราคาแล้ว ${bidsCount} ราย — ระบบจะแจ้งเตือนทุกรายว่ารอบนี้ถูกยกเลิก`
        }
      />

      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          label="เหตุผลการยกเลิก"
          name="cancelReason"
          rules={[{ required: true, message: 'กรุณาเลือกเหตุผล' }]}
        >
          <Input.Search placeholder="เลือกเหตุผล" enterButton={false} readOnly />
        </Form.Item>

        <Form.Item shouldUpdate noStyle>
          {() => {
            const current = form.getFieldValue('cancelReason') as string | undefined;
            return (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: -8, marginBottom: 16 }}>
                {CANCEL_REASONS.map(r => (
                  <Tag.CheckableTag
                    key={r}
                    checked={current === r}
                    onChange={() => form.setFieldValue('cancelReason', r)}
                    style={{ padding: '4px 10px', fontSize: 12, border: '1px solid #f0f0f0' }}
                  >
                    {r}
                  </Tag.CheckableTag>
                ))}
              </div>
            );
          }}
        </Form.Item>

        <Form.Item
          label="รายละเอียดเพิ่มเติม"
          name="cancelDetail"
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (getFieldValue('cancelReason') === 'อื่น ๆ (โปรดระบุ)' && !value?.trim()) {
                  return Promise.reject(new Error('กรุณาระบุรายละเอียด'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <TextArea rows={3} placeholder="ระบุรายละเอียดที่ผู้เกี่ยวข้องต้องทราบ" />
        </Form.Item>
      </Form>
    </>
  );
}
