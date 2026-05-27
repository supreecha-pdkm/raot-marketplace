'use client';

import React from 'react';
import { Col, DatePicker, Form, Input, Row, Select, Tooltip, Typography } from 'antd';
import { Info } from '@phosphor-icons/react';
import { TITLES } from '../constants/register';
import type { AddressStepProps } from '../types/register';
import { validateThaiId } from '../utils/validations/register';
import { RegisterAuthorizedPersonFields } from './register-authorized-person-fields';
import { RegisterContactAddressFields } from './register-contact-address-fields';
import { RegisterGroupRepresentativeFields } from './register-group-representative-fields';
import { RegisterSectionCard } from './register-section-card';

const { Option } = Select;
const { Text } = Typography;

/** Label สำหรับ "เลขประจำตัวผู้เสียภาษี…" — ย่อให้พอดี mobile + แสดง tooltip เต็ม */
const TAX_ID_LABEL = (
  <span>
    เลขผู้เสียภาษี / ทะเบียนนิติบุคคล{' '}
    <Tooltip title="เลขประจำตัวผู้เสียภาษี / ทะเบียนนิติบุคคล (13 หลัก)">
      <Text type="secondary" style={{ cursor: 'help' }}>
        <Info size={12} weight="duotone" />
      </Text>
    </Tooltip>
  </span>
);

/** Step 1 — ผู้ขาย — render fields per `subType` ตาม docs/image/register-fields.md */
export function RegisterSellerPersonalStep({
  subType,
  form,
  selectedProvince,
  selectedDistrict,
  districtOptions,
  subDistrictOptions,
}: AddressStepProps & { subType: string | undefined }) {
  return (
    <div key={subType} className={subType ? 'page-content' : undefined}>
      {/* === 1. เกษตรกรชาวสวนยาง === */}
      {subType === 'farmer' && (
        <RegisterSectionCard title="ข้อมูลส่วนตัวผู้ใช้งาน">
          <Row gutter={12}>
            <Col xs={24} sm={6}>
              <Form.Item label="คำนำหน้า" name="title" rules={[{ required: true, message: 'กรุณาเลือกคำนำหน้า' }]}>
                <Select size="large" placeholder="เลือกคำนำหน้า">
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
                <Input size="large" autoComplete="given-name" placeholder="ชื่อ" />
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
                <Input size="large" autoComplete="family-name" placeholder="นามสกุล" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item label="วันเกิด" name="dob" rules={[{ required: true, message: 'กรุณาเลือกวันเกิด' }]}>
                <DatePicker
                  size="large"
                  inputReadOnly
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="วัน/เดือน/ปี"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="เลขบัตรประจำตัวประชาชน"
                name="nationalId"
                rules={[
                  {
                    validator: (_, v) => {
                      if (!v) return Promise.reject(new Error('กรุณากรอกเลขบัตรประจำตัวประชาชน'));
                      if (!validateThaiId(v)) return Promise.reject(new Error('เลขบัตรประชาชนไม่ถูกต้อง (checksum ไม่ผ่าน)'));
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input size="large" inputMode="numeric" maxLength={13} placeholder="0000000000000" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="เลขทะเบียนเกษตรกรชาวสวนยาง"
                name="farmerRegNo"
                rules={[{ required: true, message: 'กรุณากรอกเลขทะเบียนเกษตรกรชาวสวนยาง' }]}
              >
                <Input size="large" placeholder="เลขทะเบียนเกษตรกรชาวสวนยาง" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
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
          </Row>
        </RegisterSectionCard>
      )}

      {/* === 2. สถาบันเกษตรสวนยาง === */}
      {subType === 'cooperative' && (
        <>
          <RegisterSectionCard title="ข้อมูลสถาบันการเกษตร">
            <Form.Item
              label="ชื่อสถาบันการเกษตร"
              name="orgName"
              rules={[{ required: true, message: 'กรุณากรอกชื่อสถาบันการเกษตร' }]}
            >
              <Input size="large" autoComplete="organization" placeholder="ชื่อสถาบันการเกษตร" />
            </Form.Item>
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={TAX_ID_LABEL}
                  name="taxId"
                  rules={[{ required: true, message: 'กรุณากรอกเลขประจำตัวผู้เสียภาษี / ทะเบียนนิติบุคคล' }]}
                >
                  <Input size="large" inputMode="numeric" placeholder="เลขประจำตัวผู้เสียภาษี / ทะเบียนนิติบุคคล" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="เลขทะเบียนสถาบันเกษตรกร"
                  name="instRegNo"
                  rules={[{ required: true, message: 'กรุณากรอกเลขทะเบียนสถาบันเกษตรกร' }]}
                >
                  <Input size="large" placeholder="เลขทะเบียนสถาบันเกษตรกร" />
                </Form.Item>
              </Col>
            </Row>
          </RegisterSectionCard>
          <RegisterSectionCard title="ข้อมูลผู้มีอำนาจลงชื่อผูกพันนิติบุคคล">
            <RegisterAuthorizedPersonFields withDelegated />
          </RegisterSectionCard>
        </>
      )}

      {/* === 3. ผู้ประกอบกิจการยาง === */}
      {subType === 'business' && (
        <>
          <RegisterSectionCard title="ข้อมูลสถานประกอบการ">
            <Form.Item
              label="ชื่อผู้ประกอบกิจการยาง / สถานประกอบการ"
              name="orgName"
              rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ประกอบกิจการยาง' }]}
            >
              <Input
                size="large"
                autoComplete="organization"
                placeholder="ชื่อผู้ประกอบกิจการยาง / สถานประกอบการ"
              />
            </Form.Item>
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="เลขทะเบียนพาณิชย์"
                  name="commerceRegNo"
                  rules={[{ required: true, message: 'กรุณากรอกเลขทะเบียนพาณิชย์' }]}
                >
                  <Input size="large" placeholder="เลขทะเบียนพาณิชย์" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="เลขทะเบียนผู้ประกอบกิจการยาง (ถ้ามี)" name="businessRegNo">
                  <Input size="large" placeholder="เลขทะเบียนผู้ประกอบกิจการยาง" />
                </Form.Item>
              </Col>
            </Row>
          </RegisterSectionCard>
          <RegisterSectionCard title="ข้อมูลผู้มีอำนาจลงชื่อผูกพันนิติบุคคล">
            <RegisterAuthorizedPersonFields withDelegated />
          </RegisterSectionCard>
        </>
      )}

      {/* === 4. กลุ่มพัฒนาชาวสวนยาง === */}
      {subType === 'farmer_group' && (
        <>
          <RegisterSectionCard title="ข้อมูลกลุ่มพัฒนาชาวสวนยาง">
            <Form.Item
              label="ชื่อกลุ่มพัฒนาชาวสวนยาง"
              name="orgName"
              rules={[{ required: true, message: 'กรุณากรอกชื่อกลุ่มพัฒนาชาวสวนยาง' }]}
            >
              <Input size="large" autoComplete="organization" placeholder="ชื่อกลุ่มพัฒนาชาวสวนยาง" />
            </Form.Item>
          </RegisterSectionCard>
          <RegisterSectionCard title="ข้อมูลผู้มีอำนาจลงชื่อผูกพันนิติบุคคล">
            <RegisterAuthorizedPersonFields withDelegated={false} />
          </RegisterSectionCard>
          <RegisterSectionCard title="ข้อมูลตัวแทนกลุ่ม">
            <RegisterGroupRepresentativeFields />
          </RegisterSectionCard>
        </>
      )}

      {/* === 5. องค์กร === */}
      {subType === 'organization' && (
        <>
          <RegisterSectionCard title="ข้อมูลองค์กร">
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="ชื่อสถาบันการเกษตร"
                  name="orgName"
                  rules={[{ required: true, message: 'กรุณากรอกชื่อสถาบันการเกษตร' }]}
                >
                  <Input size="large" autoComplete="organization" placeholder="ชื่อสถาบันการเกษตร" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={TAX_ID_LABEL}
                  name="taxId"
                  rules={[{ required: true, message: 'กรุณากรอกเลขประจำตัวผู้เสียภาษี / ทะเบียนนิติบุคคล' }]}
                >
                  <Input size="large" inputMode="numeric" placeholder="เลขประจำตัวผู้เสียภาษี / ทะเบียนนิติบุคคล" />
                </Form.Item>
              </Col>
            </Row>
          </RegisterSectionCard>
          <RegisterSectionCard title="ข้อมูลผู้มีอำนาจลงชื่อผูกพันนิติบุคคล">
            <RegisterAuthorizedPersonFields withDelegated />
          </RegisterSectionCard>
        </>
      )}

      {subType && (
        <RegisterSectionCard title="ข้อมูลที่อยู่ติดต่อ">
          <RegisterContactAddressFields
            form={form}
            selectedProvince={selectedProvince}
            selectedDistrict={selectedDistrict}
            districtOptions={districtOptions}
            subDistrictOptions={subDistrictOptions}
            hideContactInfo={subType === 'farmer'}
          />
        </RegisterSectionCard>
      )}
    </div>
  );
}
