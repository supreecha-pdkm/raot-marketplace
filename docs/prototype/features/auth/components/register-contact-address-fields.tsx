'use client';

import React from 'react';
import { Col, Form, Input, Row, Select } from 'antd';
import { lookupZipcode } from '@/shared/utils/thai-address';
import { PROVINCES } from '../constants/register';
import type { AddressStepProps } from '../types/register';

const { Option } = Select;

/**
 * ข้อมูลที่อยู่ติดต่อ — แสดงเหมือนกันสำหรับทุก seller subType ตาม register-fields.md
 * ต้องห่อด้วย RegisterSectionCard ที่ parent (เพื่อให้ pattern เดียวกับ section อื่นๆ)
 * hideContactInfo=true เมื่อ email/phone ถูกย้ายไป section อื่นแล้ว (เช่น farmer)
 */
export function RegisterContactAddressFields({
  form,
  selectedProvince,
  selectedDistrict,
  districtOptions,
  subDistrictOptions,
  hideContactInfo = false,
}: AddressStepProps & { hideContactInfo?: boolean }) {
  return (
    <>
      <Form.Item
        label="เลขที่ / หมู่ที่ / ถนน"
        name="addressLine"
        rules={[{ required: true, message: 'กรุณากรอกที่อยู่' }]}
      >
        <Input
          size="large"
          autoComplete="street-address"
          placeholder="ตัวอย่าง 111/1 หมู่ 5 ถ.สุขุมวิท"
        />
      </Form.Item>

      <Row gutter={12}>
        <Col xs={24} sm={8}>
          <Form.Item label="จังหวัด" name="province" rules={[{ required: true, message: 'กรุณาเลือกจังหวัด' }]}>
            <Select
              size="large"
              placeholder="เลือกจังหวัด"
              showSearch
              optionFilterProp="children"
              onChange={() => {
                form.setFieldsValue({ district: undefined, subDistrict: undefined, zipcode: undefined });
              }}
            >
              {PROVINCES.map((p) => <Option key={p} value={p}>{p}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="เขต/อำเภอ" name="district" rules={[{ required: true, message: 'กรุณาเลือกเขต/อำเภอ' }]}>
            <Select
              size="large"
              placeholder={selectedProvince ? 'เลือกเขต/อำเภอ' : 'เลือกจังหวัดก่อน'}
              showSearch
              optionFilterProp="children"
              disabled={!selectedProvince}
              notFoundContent="ไม่พบเขต/อำเภอ"
              onChange={() => {
                form.setFieldsValue({ subDistrict: undefined, zipcode: undefined });
              }}
            >
              {districtOptions.map((d) => <Option key={d.name} value={d.name}>{d.name}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="แขวง/ตำบล" name="subDistrict" rules={[{ required: true, message: 'กรุณาเลือกแขวง/ตำบล' }]}>
            <Select
              size="large"
              placeholder={selectedDistrict ? 'เลือกแขวง/ตำบล' : 'เลือกเขต/อำเภอก่อน'}
              showSearch
              optionFilterProp="children"
              disabled={!selectedDistrict}
              notFoundContent="ไม่พบแขวง/ตำบล"
              onChange={(value) => {
                if (!selectedProvince || !selectedDistrict) return;
                const zip = lookupZipcode(selectedProvince, selectedDistrict, value);
                if (zip) form.setFieldValue('zipcode', zip);
              }}
            >
              {subDistrictOptions.map((s) => <Option key={s.name} value={s.name}>{s.name}</Option>)}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col xs={24} sm={8}>
          <Form.Item
            label="รหัสไปรษณีย์"
            name="zipcode"
            rules={[
              { required: true, message: 'กรุณากรอกรหัสไปรษณีย์' },
              { pattern: /^\d{5}$/, message: '5 หลัก' },
            ]}
          >
            <Input size="large" autoComplete="postal-code" maxLength={5} placeholder="84000" />
          </Form.Item>
        </Col>
        {!hideContactInfo && (
          <>
            <Col xs={24} sm={8}>
              <Form.Item
                label="อีเมล"
                name="email"
                rules={[
                  { required: true, message: 'กรุณากรอกอีเมล' },
                  { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' },
                ]}
              >
                <Input
                  size="large"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="ตัวอย่าง example@mail.com"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="เบอร์โทรศัพท์"
                name="phone"
                rules={[
                  { required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' },
                  { pattern: /^0\d{9}$/, message: 'รูปแบบ: 0XXXXXXXXX (10 หลัก)' },
                ]}
              >
                <Input
                  size="large"
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={10}
                  placeholder="ตัวอย่าง 0812345678"
                />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>
    </>
  );
}
