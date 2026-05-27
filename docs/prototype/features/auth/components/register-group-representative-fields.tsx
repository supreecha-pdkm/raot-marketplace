'use client';

import React from 'react';
import { Col, Form, Input, Row, Select } from 'antd';
import { TITLES } from '../constants/register';
import { validateThaiId } from '../utils/validations/register';

const { Option } = Select;

/** ข้อมูลตัวแทนกลุ่ม — farmer_group เท่านั้น */
export function RegisterGroupRepresentativeFields() {
  return (
    <>
      <Row gutter={12}>
        <Col xs={24} sm={6}>
          <Form.Item
            label="คำนำหน้า"
            name={['representative', 'title']}
            rules={[{ required: true, message: 'กรุณาเลือกคำนำหน้า' }]}
          >
            <Select size="large" placeholder="เลือกคำนำหน้า">
              {TITLES.map((t) => <Option key={t} value={t}>{t}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={9}>
          <Form.Item
            label="ชื่อ"
            name={['representative', 'firstName']}
            rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}
          >
            <Input size="large" autoComplete="given-name" placeholder="ชื่อ" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={9}>
          <Form.Item
            label="นามสกุล"
            name={['representative', 'lastName']}
            rules={[{ required: true, message: 'กรุณากรอกนามสกุล' }]}
          >
            <Input size="large" autoComplete="family-name" placeholder="นามสกุล" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="เลขบัตรประจำตัวประชาชน"
            name={['representative', 'nationalId']}
            rules={[
              {
                validator: (_, v) => {
                  if (!v) return Promise.reject(new Error('กรุณากรอกเลขบัตรประจำตัวประชาชน'));
                  if (!validateThaiId(v)) {
                    return Promise.reject(new Error('เลขบัตรประชาชนไม่ถูกต้อง (checksum ไม่ผ่าน)'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              size="large"
              inputMode="numeric"
              maxLength={13}
              placeholder="ตัวอย่าง 1234567890123"
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
