'use client';

import React from 'react';
import { Col, Form, Input, Radio, Row, Select } from 'antd';
import { TITLES } from '../constants/register';

const { Option } = Select;

/** ผู้มีอำนาจลงชื่อผูกพันนิติบุคคล — ใช้ใน cooperative / business / farmer_group / organization */
export function RegisterAuthorizedPersonFields({ withDelegated }: { withDelegated: boolean }) {
  return (
    <>
      <Row gutter={12}>
        <Col xs={24} sm={6}>
          <Form.Item
            label="คำนำหน้า"
            name={['authorizedPerson', 'title']}
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
            name={['authorizedPerson', 'firstName']}
            rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}
          >
            <Input size="large" autoComplete="given-name" placeholder="ชื่อ" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={9}>
          <Form.Item
            label="นามสกุล"
            name={['authorizedPerson', 'lastName']}
            rules={[{ required: true, message: 'กรุณากรอกนามสกุล' }]}
          >
            <Input size="large" autoComplete="family-name" placeholder="นามสกุล" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col xs={24} sm={withDelegated ? 12 : 24}>
          <Form.Item
            label="ตำแหน่ง"
            name={['authorizedPerson', 'position']}
            rules={[{ required: true, message: 'กรุณากรอกตำแหน่ง' }]}
          >
            <Input size="large" autoComplete="organization-title" placeholder="ตำแหน่ง" />
          </Form.Item>
        </Col>
        {withDelegated && (
          <Col xs={24} sm={12}>
            <Form.Item
              label="มอบอำนาจแก่ผู้รับมอบอำนาจ"
              name={['authorizedPerson', 'delegated']}
              rules={[{ required: true, message: 'กรุณาเลือก' }]}
            >
              <Radio.Group>
                <Radio value="delegated">มอบอำนาจ</Radio>
                <Radio value="not_delegated">ไม่มอบอำนาจ</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        )}
      </Row>
    </>
  );
}
