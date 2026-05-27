'use client';

import { Alert, Col, Form, Input, Row, Typography } from 'antd';
import type { AuctionLot } from '@/shared/types';

const { Text } = Typography;

interface CancelStepConfirmProps {
  form:      ReturnType<typeof Form.useForm>[0];
  lot:       AuctionLot;
  bidsCount: number;
}

export default function CancelStepConfirm({ form, lot, bidsCount }: CancelStepConfirmProps) {
  const reason = form.getFieldValue('cancelReason') as string | undefined;
  const detail = form.getFieldValue('cancelDetail') as string | undefined;

  return (
    <>
      <Alert type="error" showIcon style={{ marginBottom: 16 }}
        title="ยืนยันการยกเลิกรอบประมูล — การยกเลิกไม่สามารถย้อนกลับได้" />

      <div style={{ padding: 12, borderRadius: 8, background: '#fff1f0', border: '1px solid #ffa39e', marginBottom: 16 }}>
        <Row gutter={[12, 6]}>
          <Col span={24}>
            <Text type="secondary" style={{ fontSize: 11 }}>LOT</Text>
            <div style={{ fontWeight: 600 }}>{lot.lotNo} · {lot.rubberType} · เกรด {lot.grade}</div>
          </Col>
          <Col span={24}>
            <Text type="secondary" style={{ fontSize: 11 }}>เหตุผล</Text>
            <div style={{ fontWeight: 500 }}>{reason ?? '—'}</div>
          </Col>
          {detail && (
            <Col span={24}>
              <Text type="secondary" style={{ fontSize: 11 }}>รายละเอียด</Text>
              <div>{detail}</div>
            </Col>
          )}
          <Col span={24}>
            <Text type="secondary" style={{ fontSize: 11 }}>ผู้ที่จะได้รับการแจ้งเตือน</Text>
            <div>{bidsCount > 0 ? `ผู้เสนอราคา ${bidsCount} ราย + ผู้ขาย` : 'ผู้ขาย'}</div>
          </Col>
        </Row>
      </div>

      <Form form={form} layout="vertical">
        <Row gutter={[12, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item label="ผู้ปฏิบัติงาน" name="officerName" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="พยาน (ถ้ามี)" name="witnessName">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
}
