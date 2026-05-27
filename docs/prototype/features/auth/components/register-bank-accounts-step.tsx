'use client';

import React from 'react';
import { Alert, Button, Card, Col, Form, Input, Row, Select, Space, Tag, Typography } from 'antd';
import { Bank, CheckCircle } from '@phosphor-icons/react';
import type { BankAccount } from '@/features/approvals/services/approval-data';
import { BANKS, MAX_BANK_ACCOUNTS } from '../constants/register';

const { Option } = Select;
const { Text } = Typography;

/**
 * Multi-account UI:
 *  - Each account is its own bordered Card stacked vertically.
 *  - The "บัญชีหลัก" (primary) card glows with the role's accent color and
 *    carries a pill in the top-right corner. Other cards stay neutral.
 *  - "ตั้งเป็นบัญชีหลัก" link promotes a card; deleting the primary falls
 *    back to index 0. We allow up to 5 accounts (`MAX_BANK_ACCOUNTS`).
 *  - The number of accounts is a hidden field validated by the wizard so the
 *    step can't advance with an empty list.
 */
export function RegisterBankAccountsStep({
  form,
  accentColor,
}: {
  form: { setFieldValue: (name: string | (string | number)[], value: unknown) => void };
  accentColor: string;
}) {
  const primaryIndex = (Form.useWatch('primaryBankIndex', form as never) as number | undefined) ?? 0;
  const accounts = (Form.useWatch('bankAccounts', form as never) as Partial<BankAccount>[] | undefined) ?? [];
  const count = accounts.length;

  return (
    <>
      <Alert
        type="info"
        showIcon
        icon={<Bank size={16} weight="duotone" />}
        title="บัญชีธนาคารใช้สำหรับรับเงินค่ายาง / หักค่าธรรมเนียม"
        description={
          <Text style={{ fontSize: 12 }}>
            สามารถเพิ่มบัญชีได้สูงสุด {MAX_BANK_ACCOUNTS} บัญชี — เลือก
            <Text strong> บัญชีหลัก </Text>1 บัญชีสำหรับรับเงินค่ายาง
            บัญชีอื่นไว้สำรอง / ใช้ในกรณีพิเศษ
          </Text>
        }
        style={{ marginBottom: 16 }}
      />

      <Form.Item name="primaryBankIndex" hidden>
        <Input type="hidden" />
      </Form.Item>

      <Form.List
        name="bankAccounts"
        rules={[
          {
            validator: async (_, value: unknown[]) => {
              if (!Array.isArray(value) || value.length === 0) {
                return Promise.reject(new Error('กรุณาเพิ่มบัญชีธนาคารอย่างน้อย 1 บัญชี'));
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <>
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              {fields.map((field, idx) => {
                const isPrimary = idx === primaryIndex;
                const bankName = accounts[idx]?.bank;
                const accountNo = accounts[idx]?.accountNo;

                return (
                  <Card
                    key={field.key}
                    size="small"
                    style={{
                      borderColor: isPrimary ? accentColor : '#e8e8e8',
                      borderWidth: isPrimary ? 2 : 1,
                      borderStyle: 'solid',
                      background: isPrimary ? `${accentColor}08` : '#fff',
                      boxShadow: isPrimary
                        ? `0 4px 12px ${accentColor}22`
                        : '0 1px 2px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                    }}
                    styles={{ body: { padding: '12px 14px' } }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 8,
                        marginBottom: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Space size={8} wrap>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: isPrimary ? accentColor : '#bfbfbf',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                            fontWeight: 600,
                            transition: 'background 0.2s',
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <Text strong style={{ fontSize: 13 }}>
                            บัญชีที่ {idx + 1}
                          </Text>
                          {(bankName || accountNo) && (
                            <div style={{ fontSize: 11, color: '#595959', marginTop: 1 }}>
                              {bankName ?? '—'}
                              {accountNo ? ` · ****${String(accountNo).slice(-4)}` : ''}
                            </div>
                          )}
                        </div>
                        {isPrimary && (
                          <Tag
                            icon={<CheckCircle size={11} weight="fill" />}
                            style={{
                              marginInlineEnd: 0,
                              border: 'none',
                              background: accentColor,
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: 12,
                              padding: '2px 10px',
                              borderRadius: 999,
                              boxShadow: `0 2px 6px ${accentColor}55`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              lineHeight: 1.4,
                            }}
                          >
                            บัญชีหลัก
                          </Tag>
                        )}
                      </Space>

                      <Space size={4} wrap>
                        {!isPrimary && (
                          <Button
                            size="small"
                            type="link"
                            style={{ padding: 0, color: accentColor }}
                            onClick={() => form.setFieldValue('primaryBankIndex', idx)}
                          >
                            ตั้งเป็นบัญชีหลัก
                          </Button>
                        )}
                        {fields.length > 1 && (
                          <Button
                            size="small"
                            type="link"
                            danger
                            style={{ padding: 0 }}
                            onClick={() => {
                              remove(field.name);
                              if (idx === primaryIndex) {
                                form.setFieldValue('primaryBankIndex', 0);
                              } else if (idx < primaryIndex) {
                                form.setFieldValue('primaryBankIndex', Math.max(0, primaryIndex - 1));
                              }
                            }}
                          >
                            ลบ
                          </Button>
                        )}
                      </Space>
                    </div>

                    <Form.Item
                      label="ธนาคาร"
                      name={[field.name, 'bank']}
                      rules={[{ required: true, message: 'กรุณาเลือกธนาคาร' }]}
                      style={{ marginBottom: 12 }}
                    >
                      <Select placeholder="เลือกธนาคาร" showSearch>
                        {BANKS.map((b) => <Option key={b} value={b}>{b}</Option>)}
                      </Select>
                    </Form.Item>

                    <Row gutter={12}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="เลขบัญชี"
                          name={[field.name, 'accountNo']}
                          rules={[
                            { required: true, message: 'กรุณากรอกเลขบัญชี' },
                            { pattern: /^\d{10,12}$/, message: '10-12 หลัก' },
                          ]}
                          style={{ marginBottom: 12 }}
                        >
                          <Input placeholder="0000000000" maxLength={12} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="ชื่อบัญชี"
                          name={[field.name, 'accountName']}
                          rules={[{ required: true, message: 'กรุณากรอกชื่อบัญชี' }]}
                          style={{ marginBottom: 12 }}
                        >
                          <Input placeholder="ตามที่ปรากฏในสมุดบัญชี" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={12}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="สาขา"
                          name={[field.name, 'branch']}
                          rules={[{ required: true, message: 'กรุณากรอกสาขา' }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="สาขา" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="ประเภทบัญชี"
                          name={[field.name, 'accountType']}
                          rules={[{ required: true, message: 'กรุณาเลือกประเภทบัญชี' }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Select placeholder="ประเภท">
                            <Option value="savings">ออมทรัพย์</Option>
                            <Option value="current">กระแสรายวัน</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                );
              })}
            </Space>

            <div style={{ marginTop: 12 }}>
              <Button
                type="dashed"
                block
                disabled={count >= MAX_BANK_ACCOUNTS}
                onClick={() => add({ accountType: 'savings' })}
                icon={<Bank size={14} weight="bold" />}
                style={{
                  height: 44,
                  borderColor: count >= MAX_BANK_ACCOUNTS ? '#d9d9d9' : accentColor,
                  color: count >= MAX_BANK_ACCOUNTS ? '#bfbfbf' : accentColor,
                  fontWeight: 500,
                }}
              >
                {count >= MAX_BANK_ACCOUNTS
                  ? `ครบจำนวนสูงสุด ${MAX_BANK_ACCOUNTS} บัญชีแล้ว`
                  : `เพิ่มบัญชีธนาคารอีก (${count}/${MAX_BANK_ACCOUNTS})`}
              </Button>
            </div>
          </>
        )}
      </Form.List>
    </>
  );
}
