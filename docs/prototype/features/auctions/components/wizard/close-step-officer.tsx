'use client';

import { Alert, Col, Form, Input, Row } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import type { AuctionLot } from '@/shared/types';
import type { BidLike } from '../close-round-wizard';

const { Text } = Typography;
const { TextArea } = Input;

interface CloseStepOfficerProps {
  form:          ReturnType<typeof Form.useForm>[0];
  initialValues: Record<string, unknown>;
  lot:           AuctionLot;
  winner:        BidLike | undefined;
}

export default function CloseStepOfficer({
  form, initialValues, lot, winner,
}: CloseStepOfficerProps) {
  return (
    <>
      {winner && (
        <Alert
          type="success" showIcon icon={<TrophyOutlined />}
          style={{ marginBottom: 16 }}
          title={<span>ผู้ชนะ: <Text strong>{winner.buyer}</Text> ({winner.bidId})</span>}
          description={
            <span style={{ fontSize: 12 }}>
              เสนอ <strong>{winner.price.toFixed(2)} ฿/กก.</strong> × {lot.weight.toLocaleString()} กก. =
              {' '}<strong>{(winner.price * lot.weight).toLocaleString()} ฿</strong>
            </span>
          }
        />
      )}

      <Alert
        type="warning" showIcon style={{ marginBottom: 16 }}
        title="การปิดรอบประมูลและประกาศผู้ชนะไม่สามารถย้อนกลับได้"
        description="กรุณายืนยันชื่อผู้ปฏิบัติงาน (และพยานถ้ามี) เพื่อบันทึกใน audit log"
      />

      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Row gutter={[12, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item label="ผู้ปฏิบัติงาน" name="officerName" rules={[{ required: true, message: 'ระบุชื่อผู้ปิดรอบ' }]}>
              <Input placeholder="ชื่อ-นามสกุล" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="พยาน (ถ้ามี)" name="witnessName">
              <Input placeholder="ชื่อ-นามสกุลพยาน" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="หมายเหตุ (ถ้ามี)" name="note">
          <TextArea rows={3} placeholder="เช่น มีผู้เข้าร่วมประมูลครบทุกราย ราคาผู้ชนะอยู่ในเกณฑ์ตลาด" />
        </Form.Item>
      </Form>
    </>
  );
}
