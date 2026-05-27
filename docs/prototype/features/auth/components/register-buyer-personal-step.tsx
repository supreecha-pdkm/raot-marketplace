'use client';

import React from 'react';
import { Col, DatePicker, Divider, Form, Input, Row, Select } from 'antd';
import { lookupZipcode } from '@/shared/utils/thai-address';
import { PROVINCES, TITLES } from '../constants/register';
import type { AddressStepProps } from '../types/register';
import { validateThaiId } from '../utils/validations/register';
import { RegisterAuthorizedPersonFields } from './register-authorized-person-fields';
import { RegisterSectionCard } from './register-section-card';

const { Option } = Select;

/** Step 1 — ผู้ซื้อ — โครงสร้างเดิม (ยังใช้ addressLine เพื่อ backward compat) */
export function RegisterBuyerPersonalStep({
  form,
  selectedProvince,
  selectedDistrict,
  districtOptions,
  subDistrictOptions,
}: AddressStepProps) {
  const subType = Form.useWatch('subType', form);

  return (
    <>
      {subType === 'individual' && (
        <>
          <Row gutter={12}>
            <Col xs={24} sm={6}>
              <Form.Item label="คำนำหน้า" name="title" rules={[{ required: true, message: 'กรุณาเลือกคำนำหน้า' }]}>
                <Select placeholder="คำนำหน้า">
                  {TITLES.map((t) => <Option key={t} value={t}>{t}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={9}>
              <Form.Item
                label="ชื่อ"
                name="firstName"
                rules={[
                  { required: true, message: 'กรุณากรอกชื่อ' },
                  { min: 2, max: 50, message: '2-50 ตัวอักษร' },
                ]}
              >
                <Input placeholder="ชื่อ" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={9}>
              <Form.Item
                label="นามสกุล"
                name="lastName"
                rules={[
                  { required: true, message: 'กรุณากรอกนามสกุล' },
                  { min: 2, max: 50, message: '2-50 ตัวอักษร' },
                ]}
              >
                <Input placeholder="นามสกุล" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="เลขบัตรประชาชน (13 หลัก)"
                name="nationalId"
                rules={[
                  {
                    validator: (_, v) => {
                      if (!v) return Promise.reject(new Error('กรุณากรอกเลขบัตรประชาชน'));
                      if (!validateThaiId(v)) return Promise.reject(new Error('เลขบัตรประชาชนไม่ถูกต้อง (checksum ไม่ผ่าน)'));
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input maxLength={13} placeholder="0000000000000" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="วัน/เดือน/ปีเกิด" name="dob" rules={[{ required: true, message: 'กรุณาเลือกวันเกิด' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="วัน/เดือน/ปี" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="หมายเลขโทรศัพท์"
                name="phone"
                rules={[
                  { required: true, message: 'กรุณากรอกหมายเลขโทรศัพท์' },
                  { pattern: /^0\d{9}$/, message: 'รูปแบบ: 0XXXXXXXXX (10 หลัก)' },
                ]}
              >
                <Input maxLength={10} placeholder="0812345678" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'กรุณากรอก Email' },
                  { type: 'email', message: 'รูปแบบ email ไม่ถูกต้อง' },
                ]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 16px' }}>ที่อยู่ตามบัตรประชาชน</Divider>

          <Form.Item
            label="บ้านเลขที่ / หมู่ / ซอย / ถนน"
            name="addressLine"
            rules={[{ required: true, message: 'กรุณากรอกที่อยู่' }]}
          >
            <Input placeholder="เช่น 123/4 หมู่ 5 ซ.รักไทย ถ.สุขุมวิท" />
          </Form.Item>

          <Row gutter={12}>
            <Col xs={24} sm={8}>
              <Form.Item label="จังหวัด" name="province" rules={[{ required: true, message: 'กรุณาเลือกจังหวัด' }]}>
                <Select
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
              <Form.Item label="อำเภอ" name="district" rules={[{ required: true, message: 'กรุณาเลือกอำเภอ' }]}>
                <Select
                  placeholder={selectedProvince ? 'เลือกอำเภอ' : 'เลือกจังหวัดก่อน'}
                  showSearch
                  optionFilterProp="children"
                  disabled={!selectedProvince}
                  notFoundContent="ไม่พบอำเภอ"
                  onChange={() => {
                    form.setFieldsValue({ subDistrict: undefined, zipcode: undefined });
                  }}
                >
                  {districtOptions.map((d) => <Option key={d.name} value={d.name}>{d.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="ตำบล" name="subDistrict" rules={[{ required: true, message: 'กรุณาเลือกตำบล' }]}>
                <Select
                  placeholder={selectedDistrict ? 'เลือกตำบล' : 'เลือกอำเภอก่อน'}
                  showSearch
                  optionFilterProp="children"
                  disabled={!selectedDistrict}
                  notFoundContent="ไม่พบตำบล"
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
                  { pattern: /^\d{5}$/, message: 'รหัสไปรษณีย์ต้องเป็น 5 หลัก' },
                ]}
              >
                <Input maxLength={5} placeholder="84000" />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      {subType === 'company' && (
        <div className="page-content">
          <RegisterSectionCard title="ข้อมูลนิติบุคคล">
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="ชื่อนิติบุคคล"
                  name="orgName"
                  rules={[{ required: true, message: 'กรุณากรอกชื่อนิติบุคคล' }]}
                >
                  <Input size="large" autoComplete="organization" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="เลขประจำตัวผู้เสียภาษี"
                  name="taxId"
                  rules={[
                    { required: true, message: 'กรุณากรอกเลขประจำตัวผู้เสียภาษี' },
                    { pattern: /^\d{13}$/, message: 'เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก' },
                  ]}
                >
                  <Input size="large" inputMode="numeric" maxLength={13} />
                </Form.Item>
              </Col>
            </Row>
          </RegisterSectionCard>

          <RegisterSectionCard title="ข้อมูลผู้มีอำนาจลงชื่อผูกพันนิติบุคคล">
            <RegisterAuthorizedPersonFields withDelegated />
          </RegisterSectionCard>

          <RegisterSectionCard title="ข้อมูลที่อยู่ติดต่อ">
            <Row gutter={12}>
              <Col xs={24} sm={12}>
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
              <Col xs={24} sm={12}>
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
            </Row>

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
                    { pattern: /^\d{5}$/, message: 'รหัสไปรษณีย์ต้องเป็น 5 หลัก' },
                  ]}
                >
                  <Input
                    size="large"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="84000"
                  />
                </Form.Item>
              </Col>
            </Row>
          </RegisterSectionCard>
        </div>
      )}
    </>
  );
}
