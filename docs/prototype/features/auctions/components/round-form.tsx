'use client';

import { Alert, Col, Form, Input, InputNumber, Row, Select, Switch, TimePicker, DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import { MARKET_PICK_OPTIONS, AUCTION_TYPE_PICK } from '../utils/auction-constants';

export interface RoundFormProps {
  form:     ReturnType<typeof Form.useForm>[0];
  editing?: boolean;
}

export default function RoundForm({ form, editing = false }: RoundFormProps) {
  return (
    <Form form={form} layout="vertical" className="mt-2">
      <Row gutter={[12, 0]}>
        <Col xs={24} sm={14}>
          <Form.Item label="ชื่อรอบ" name="name" rules={[{ required: true, message: 'กรุณาใส่ชื่อรอบ' }]}>
            <Input placeholder="เช่น รอบเช้า · รอบบ่าย · รอบพิเศษ" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={10}>
          <Form.Item label="วันที่ประมูล" name="date" rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 0]}>
        <Col xs={24} sm={12}>
          <Form.Item label="เวลาเริ่ม" name="startTime" rules={[{ required: true, message: 'เวลาเริ่ม' }]}>
            <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="เวลาสิ้นสุด"
            name="endTime"
            dependencies={['startTime']}
            rules={[
              { required: true, message: 'เวลาสิ้นสุด' },
              ({ getFieldValue }) => ({
                validator(_, v) {
                  const s = getFieldValue('startTime') as Dayjs | undefined;
                  if (!s || !v) return Promise.resolve();
                  return (v as Dayjs).isAfter(s)
                    ? Promise.resolve()
                    : Promise.reject(new Error('เวลาสิ้นสุดต้องหลังเวลาเริ่ม'));
                },
              }),
            ]}
          >
            <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="ตลาดกลาง" name="market" rules={[{ required: true, message: 'เลือกตลาด' }]}>
        <Select placeholder="เลือกตลาดกลาง" options={MARKET_PICK_OPTIONS} />
      </Form.Item>

      <Row gutter={[12, 0]}>
        <Col xs={24} sm={12}>
          <Form.Item label="ประเภทประมูล" name="auctionType" rules={[{ required: true }]}>
            <Select options={AUCTION_TYPE_PICK} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="ค่าธรรมเนียม (บาท/กก.)"
            name="feePerKg"
            rules={[
              { required: true, message: 'กรุณากรอกค่าธรรมเนียม' },
              { type: 'number', min: 0, message: 'ต้องไม่ต่ำกว่า 0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0} step={0.01} precision={2}
              placeholder="เช่น 0.25"
              addonAfter="บาท/กก."
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="สถานะ" name="active" valuePropName="checked">
        <Switch checkedChildren="เปิดใช้งาน" unCheckedChildren="ปิดใช้งาน" />
      </Form.Item>

      {!editing && (
        <Alert
          type="info" showIcon
          title="รอบประมูลถูกสร้างแบบรอบต่อรอบ — หากต้องการรอบในวันถัดไป ให้สร้างใหม่อีกครั้ง"
        />
      )}
    </Form>
  );
}
