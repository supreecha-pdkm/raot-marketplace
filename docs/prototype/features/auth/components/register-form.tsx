'use client';

import React, { useEffect, useRef, useState } from 'react';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Result,
  Row,
  Select,
  Steps,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Files,
  Info,
  Key,
  Leaf,
  ShieldCheck,
  ShoppingCart,
} from '@phosphor-icons/react';
import { getDistricts, getSubDistricts } from '@/shared/utils/thai-address';
import { PrivacyPolicyModal } from '@/shared/components/privacy-policy-modal';
import {
  ALL_STEPS,
  BUYER_TYPES,
  INSTITUTION_VARIANT_SUBTYPES,
  MARKETS,
  RUBBER_TYPES,
  SELLER_TYPES,
} from '../constants/register';
import { useRegisterResubmit } from '../hooks/use-register-resubmit';
import { submitRegistration } from '../services/register';
import type { Role } from '../types/register';
import { buildDocsFromForm } from '../utils/register-files';
import { getStepFields, passwordRule } from '../utils/validations/register';
import { RegisterBankAccountsStep } from './register-bank-accounts-step';
import { RegisterBuyerPersonalStep } from './register-buyer-personal-step';
import { RegisterDocumentField } from './register-document-field';
import { RegisterSellerPersonalStep } from './register-seller-personal-step';
import { RegisterShell } from './register-shell';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export function RegisterForm({ role }: { role: Role }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resubmitId = searchParams.get('resubmit') ?? '';
  const isInstitutionVariant = searchParams.get('variant') === 'institution';
  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string>('');
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const isResubmit = !!resubmitId;

  const subType = Form.useWatch('subType', form);
  const selectedProvince = Form.useWatch('province', form);
  const selectedDistrict = Form.useWatch('district', form);
  const { message } = App.useApp();

  const { prefilled, resubmitUsername, resubmitPassword } = useRegisterResubmit({
    resubmitId,
    role,
    form,
  });

  const districtOptions = selectedProvince ? getDistricts(selectedProvince) : [];
  const subDistrictOptions =
    selectedProvince && selectedDistrict ? getSubDistricts(selectedProvince, selectedDistrict) : [];

  const isSeller = role === 'seller';
  const roleLabel = isSeller
    ? isInstitutionVariant
      ? 'สถาบันเกษตรกร / ผู้ประกอบกิจการยาง'
      : 'ผู้ขาย'
    : 'ผู้ซื้อ';
  const RoleIcon = isSeller ? Leaf : ShoppingCart;
  const roleColor = isSeller ? '#fa8c16' : '#1a7c3e';

  // Seller-type dropdown options vary by variant:
  // - Default seller flow hides cooperative + business — they register
  //   through the dedicated `?variant=institution` entry point.
  // - Institution variant shows only those two types.
  const institutionSubtypes = INSTITUTION_VARIANT_SUBTYPES as readonly string[];
  const sellerTypeOptions = isInstitutionVariant
    ? SELLER_TYPES.filter((t) => institutionSubtypes.includes(t.value))
    : SELLER_TYPES.filter((t) => !institutionSubtypes.includes(t.value));

  // Guard against a stale subType surviving a variant switch via SPA
  // navigation (e.g., /register/seller?variant=institution → /register/seller).
  // Without this, a user could pick "cooperative" under the institution
  // variant, swap to the default seller URL, and submit a hidden subType.
  // Skipped during resubmit-prefill since that path overrides the value.
  const variantRef = useRef(isInstitutionVariant);
  useEffect(() => {
    if (isResubmit) return;
    if (variantRef.current === isInstitutionVariant) return;
    variantRef.current = isInstitutionVariant;
    form.setFieldValue('subType', undefined);
  }, [isInstitutionVariant, isResubmit, form]);

  const visibleSteps = isResubmit ? ALL_STEPS.filter((s) => s.key !== 'creds') : ALL_STEPS;
  const currentStepKey = visibleSteps[step]?.key ?? 'pdpa';

  const handleNext = async () => {
    try {
      await form.validateFields(getStepFields(currentStepKey, isSeller, subType));
      setStep((s) => Math.min(s + 1, visibleSteps.length - 1));
    } catch {
      // Ant Design Form will display inline errors automatically
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const values = form.getFieldsValue(true);
      const docs = await buildDocsFromForm(values);
      const submitUsername = isResubmit ? resubmitUsername : (values.username ?? '');
      const submitPassword = isResubmit
        ? resubmitPassword || '(reused-from-previous-application)'
        : (values.password ?? '');

      const app = submitRegistration({
        role,
        values,
        docs,
        username: submitUsername,
        password: submitPassword,
      });
      setApplicationId(app.id);
      setSubmitted(true);
    } catch (err) {
      console.error('submitApplication error', err);
      const isQuota =
        err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22);
      message.error(
        isQuota
          ? 'พื้นที่จัดเก็บไม่เพียงพอ — กรุณาอัปโหลดไฟล์ขนาดเล็กลง หรือลบใบสมัครเก่าออกก่อน'
          : 'ส่งคำขอลงทะเบียนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const goLogin = () => router.push('/login');

  if (submitted) {
    return (
      <RegisterShell>
        <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 40 } }}>
          <Result
            status="success"
            icon={<CheckCircle size={64} weight="duotone" color="#52c41a" />}
            title="ส่งคำขอลงทะเบียนเรียบร้อย"
            subTitle={
              <span>
                บัญชี{roleLabel}ของคุณถูกสร้างในสถานะ <Tag color="warning">รอตรวจสอบ</Tag>
                {' '}— เจ้าหน้าที่จะตรวจเอกสารและอนุมัติภายใน 1-3 วันทำการ
                ระบบจะแจ้งผลทาง email/SMS ที่กรอกไว้
              </span>
            }
            extra={[
              <Button
                key="login"
                type="primary"
                onClick={goLogin}
                style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
              >
                กลับไปหน้าเข้าสู่ระบบ
              </Button>,
              applicationId ? (
                <Button
                  key="status"
                  onClick={() => router.push(`/register/pending?id=${applicationId}&role=${role}`)}
                >
                  ตรวจสอบสถานะ
                </Button>
              ) : null,
            ].filter(Boolean)}
          />
          <Alert
            type="info"
            showIcon
            icon={<Info size={16} weight="bold" />}
            title="ขั้นตอนการอนุมัติ (Two-tier Approval)"
            description="(1) เจ้าหน้าที่ตลาดตรวจสอบเอกสาร  →  (2) ผู้อำนวยการตลาดอนุมัติ  →  เปิดใช้งานบัญชี"
            style={{ marginTop: 16 }}
          />
        </Card>
      </RegisterShell>
    );
  }

  return (
    <RegisterShell>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          color: '#fff',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <RoleIcon size={32} weight="duotone" color={isSeller ? '#fa8c16' : '#52c41a'} />
          <div>
            <Title level={5} style={{ color: '#fff', margin: 0, lineHeight: 1.2 }}>
              ลงทะเบียน{roleLabel}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
              RAOT Rubber Traceability — Registration
            </Text>
          </div>
        </div>
        <NextLink
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            fontSize: 12,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={12} weight="bold" />
          กลับเข้าสู่ระบบ
        </NextLink>
      </div>

      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 24 } }}>
        {prefilled && (
          <Alert
            type="info"
            showIcon
            icon={<Info size={16} weight="duotone" />}
            title={<strong>ยื่นคำขอใหม่ — ข้อมูลเดิมถูกกรอกให้แล้ว</strong>}
            description={
              <span>
                ระบบดึงข้อมูลจากใบสมัครที่ถูกปฏิเสธ ({resubmitId}) มาให้ทั้งหมด
                รวมถึงเอกสารที่อัปโหลดไว้ — กรุณาตรวจสอบและแก้ไขจุดที่ถูกระบุในเหตุผลการปฏิเสธก่อนส่งใหม่
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  * ใช้ชื่อผู้ใช้ ({resubmitUsername || 'จากใบสมัครเดิม'}) และรหัสผ่านเดิม — ไม่ต้องตั้งใหม่
                </Text>
              </span>
            }
            style={{ marginBottom: 16 }}
          />
        )}
        <Steps
          current={step}
          size="small"
          responsive
          style={{ marginBottom: 24 }}
          items={visibleSteps.map((s) => ({ title: s.title }))}
        />

        <Form
          form={form}
          layout="vertical"
          requiredMark
          initialValues={{
            bankAccounts: [{ accountType: 'savings' }],
            primaryBankIndex: 0,
          }}
        >
          {currentStepKey === 'pdpa' && (
            <>
              <Alert
                type="info"
                showIcon
                icon={<ShieldCheck size={16} weight="duotone" />}
                title="นโยบายความเป็นส่วนตัว (PDPA) — การยางแห่งประเทศไทย"
                description={
                  <div style={{ fontSize: 12, lineHeight: 1.7 }}>
                    <Paragraph style={{ marginBottom: 8, fontSize: 12 }}>
                      <Text strong>กยท. ในฐานะผู้ควบคุมข้อมูลส่วนบุคคล</Text> จะเก็บรวบรวม ใช้
                      และเปิดเผยข้อมูลส่วนบุคคลของท่านอย่างโปร่งใส เป็นธรรม และเป็นไปตาม
                      พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. ๒๕๖๒
                    </Paragraph>
                    <Paragraph style={{ marginBottom: 4, fontSize: 12 }}>
                      <Text strong>ข้อมูลที่เก็บรวบรวม</Text> — ชื่อ-นามสกุล, เลขบัตรประชาชน,
                      เลขประจำตัวผู้เสียภาษี, เลขบัญชีธนาคาร, สำเนาเอกสารยืนยันตัวตน, ที่อยู่,
                      อีเมล, เบอร์โทรศัพท์ รวมถึง Cookie / IP Address / Log File
                    </Paragraph>
                    <Paragraph style={{ marginBottom: 4, fontSize: 12 }}>
                      <Text strong>วัตถุประสงค์</Text> — ยืนยันตัวตน เปิดบัญชีผู้ใช้ ดำเนินการ
                      ประมูล / ซื้อ-ขายยางพารา ออกใบเสร็จ-ใบกำกับภาษี ติดต่อสื่อสาร และจัดทำ
                      รายงานตามภารกิจของ กยท.
                    </Paragraph>
                    <Paragraph style={{ marginBottom: 4, fontSize: 12 }}>
                      <Text strong>การเปิดเผย</Text> — กยท. จะไม่เปิดเผยต่อบุคคลที่สาม
                      โดยไม่ได้รับอนุญาต ยกเว้นคู่ค้า/พันธมิตรในการประกอบกิจการ และหน่วยงานรัฐ
                      ที่มีอำนาจตามกฎหมาย
                    </Paragraph>
                    <Paragraph style={{ marginBottom: 4, fontSize: 12 }}>
                      <Text strong>สิทธิของท่าน</Text> — เข้าถึง / แก้ไข / ลบ / ระงับใช้ /
                      โอนย้ายข้อมูล / คัดค้านการประมวลผล / เพิกถอนความยินยอม / ร้องเรียนต่อ สคส.
                    </Paragraph>
                    <Paragraph style={{ marginBottom: 0, fontSize: 12 }}>
                      <Text strong>ความมั่นคงปลอดภัย</Text> — เข้ารหัสตามมาตรฐาน TLS,
                      จำกัดสิทธิการเข้าถึงเฉพาะเจ้าหน้าที่ที่ได้รับมอบหมาย — ดูรายละเอียดทั้งหมดที่{' '}
                      <a
                        role="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setPrivacyOpen(true);
                        }}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        นโยบาย PDPA ฉบับเต็ม
                      </a>
                    </Paragraph>
                  </div>
                }
                style={{ marginBottom: 16 }}
              />

              <Form.Item
                name="pdpaAccept"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, v) =>
                      v
                        ? Promise.resolve()
                        : Promise.reject(new Error('กรุณายอมรับนโยบาย PDPA เพื่อดำเนินการต่อ')),
                  },
                ]}
              >
                <Checkbox>ฉันได้อ่านและยอมรับนโยบาย PDPA แล้ว</Checkbox>
              </Form.Item>

              <Divider style={{ margin: '12px 0 16px' }} />
            </>
          )}

          {/* subType — always mounted so its value survives step transitions. */}
          <Form.Item
            label={<Text strong>ประเภทผู้ใช้งาน</Text>}
            name="subType"
            rules={[{ required: true, message: 'กรุณาเลือกประเภทผู้ใช้งาน' }]}
            hidden={currentStepKey !== 'pdpa'}
          >
            <Select placeholder="เลือกประเภทผู้ใช้งาน" size="large">
              {(isSeller ? sellerTypeOptions : BUYER_TYPES).map((t) => (
                <Option key={t.value} value={t.value}>
                  {t.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {currentStepKey === 'pdpa' && (
            <>
              {isSeller && (
                <>
                  <Form.Item
                    label="ชนิดยางที่ต้องการขาย (เลือกอย่างน้อย 1)"
                    name="rubberTypes"
                    rules={[
                      {
                        validator: (_, v) =>
                          Array.isArray(v) && v.length > 0
                            ? Promise.resolve()
                            : Promise.reject(new Error('เลือกอย่างน้อย 1 ชนิด')),
                      },
                    ]}
                  >
                    <Checkbox.Group style={{ width: '100%' }}>
                      <Row gutter={[8, 8]}>
                        {RUBBER_TYPES.map((t) => (
                          <Col xs={24} sm={12} key={t}>
                            <Checkbox value={t}>{t}</Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </Checkbox.Group>
                  </Form.Item>

                  <Form.Item
                    label="ตลาดที่ลงทะเบียน (เลือก 1 ตลาดเท่านั้น)"
                    name="market"
                    rules={[{ required: true, message: 'กรุณาเลือกตลาด' }]}
                    extra="ผู้ขายลงทะเบียนได้กับ 1 ตลาดเท่านั้น (ตามนโยบาย กยท.)"
                  >
                    <Select placeholder="เลือกตลาด">
                      {MARKETS.map((m) => (
                        <Option key={m} value={m}>
                          {m}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </>
              )}

              {!isSeller && (
                <Form.Item
                  label="ตลาดที่ต้องการซื้อ (เลือกได้หลายตลาด)"
                  name="markets"
                  rules={[
                    {
                      validator: (_, v) =>
                        Array.isArray(v) && v.length > 0
                          ? Promise.resolve()
                          : Promise.reject(new Error('กรุณาเลือกอย่างน้อย 1 ตลาด')),
                    },
                  ]}
                >
                  <Select mode="multiple" placeholder="เลือกตลาด">
                    {MARKETS.map((m) => (
                      <Option key={m} value={m}>
                        {m}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
            </>
          )}

          {currentStepKey === 'personal' &&
            (isSeller ? (
              <RegisterSellerPersonalStep
                subType={subType}
                form={form}
                selectedProvince={selectedProvince}
                selectedDistrict={selectedDistrict}
                districtOptions={districtOptions}
                subDistrictOptions={subDistrictOptions}
              />
            ) : (
              <RegisterBuyerPersonalStep
                form={form}
                selectedProvince={selectedProvince}
                selectedDistrict={selectedDistrict}
                districtOptions={districtOptions}
                subDistrictOptions={subDistrictOptions}
              />
            ))}

          {currentStepKey === 'bank' && (
            <RegisterBankAccountsStep form={form} accentColor={roleColor} />
          )}

          {currentStepKey === 'creds' && (
            <>
              <Alert
                type="warning"
                showIcon
                icon={<Key size={16} weight="duotone" />}
                title="ตั้งรหัสผ่านอย่างปลอดภัย"
                description="รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร และมีตัวพิมพ์ใหญ่ + พิมพ์เล็ก + ตัวเลข + อักขระพิเศษ"
                style={{ marginBottom: 16 }}
              />

              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="ชื่อผู้ใช้ (Username)"
                    name="username"
                    rules={[
                      { required: true, message: 'กรุณากรอกชื่อผู้ใช้' },
                      { pattern: /^[a-z0-9]{6,}$/, message: '≥6 ตัว, a-z และ 0-9 เท่านั้น' },
                    ]}
                  >
                    <Input placeholder="ชื่อผู้ใช้" autoComplete="username" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="รหัสผ่าน"
                    name="password"
                    rules={[{ validator: passwordRule }]}
                    hasFeedback
                  >
                    <Input.Password placeholder="••••••••" autoComplete="new-password" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="ยืนยันรหัสผ่าน"
                    name="confirmPassword"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                      { required: true, message: 'กรุณายืนยันรหัสผ่าน' },
                      ({ getFieldValue }) => ({
                        validator(_, v) {
                          if (!v || v === getFieldValue('password')) return Promise.resolve();
                          return Promise.reject(new Error('รหัสผ่านไม่ตรงกัน'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="••••••••" autoComplete="new-password" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {currentStepKey === 'docs' && (
            <>
              <Alert
                type="info"
                showIcon
                icon={<Files size={16} weight="duotone" />}
                title="อัปโหลดเอกสาร (รองรับ JPG, PNG, PDF — ขนาดไม่เกิน 10MB ต่อไฟล์)"
                style={{ marginBottom: 16 }}
              />

              <RegisterDocumentField name="docIdCard" label="สำเนาบัตรประชาชน" required />
              <RegisterDocumentField name="docHouseReg" label="สำเนาทะเบียนบ้าน" required />
              <RegisterDocumentField name="docBankBook" label="สำเนาสมุดบัญชีธนาคาร (≤6 เดือน)" required />
              <RegisterDocumentField name="docPdpa" label="แบบยินยอม PDPA (เซ็นแล้ว)" required />

              {!isSeller && subType === 'company' && (
                <>
                  <Divider style={{ margin: '8px 0 16px' }}>เอกสารนิติบุคคล</Divider>
                  <RegisterDocumentField name="docCompanyCert" label="หนังสือรับรองบริษัท (≤6 เดือน)" required />
                  <RegisterDocumentField name="docDirectorId" label="สำเนาบัตรประชาชนกรรมการผู้มีอำนาจ" required />
                  <RegisterDocumentField name="docPoa" label="หนังสือมอบอำนาจ" required />
                </>
              )}

              {isSeller &&
                (subType === 'cooperative' || subType === 'farmer_group' || subType === 'organization') && (
                  <>
                    <Divider style={{ margin: '8px 0 16px' }}>เอกสารสถาบัน / กลุ่ม</Divider>
                    <RegisterDocumentField name="docOrgCert" label="หนังสือจดทะเบียนสถาบัน / กลุ่ม" required />
                  </>
                )}
              {isSeller && subType === 'business' && (
                <>
                  <Divider style={{ margin: '8px 0 16px' }}>เอกสารผู้ประกอบกิจการ</Divider>
                  <RegisterDocumentField name="docFactoryLicense" label="ใบอนุญาตประกอบกิจการโรงงาน" required />
                  <RegisterDocumentField name="docCompanyCert" label="หนังสือรับรองบริษัท (≤6 เดือน)" required />
                </>
              )}
            </>
          )}

          <Divider style={{ margin: '24px 0 16px' }} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Button
              icon={<ArrowLeft size={14} weight="bold" />}
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              disabled={step === 0}
            >
              ย้อนกลับ
            </Button>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ขั้นตอนที่ {step + 1} / {visibleSteps.length} — {visibleSteps[step]?.title}
            </Text>
            {step < visibleSteps.length - 1 ? (
              <Button
                type="primary"
                onClick={handleNext}
                style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
              >
                ถัดไป <ArrowRight size={14} weight="bold" />
              </Button>
            ) : (
              <Button
                type="primary"
                loading={submitting}
                onClick={handleSubmit}
                icon={<CheckCircle size={16} weight="bold" />}
                style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
              >
                ส่งคำขอลงทะเบียน
              </Button>
            )}
          </div>
        </Form>
      </Card>

      <div
        style={{
          marginTop: 14,
          textAlign: 'center',
          color: 'rgba(255,255,255,0.5)',
          fontSize: 11,
        }}
      >
        บัญชีจะอยู่ในสถานะ &ldquo;รอตรวจสอบ&rdquo; จนกว่าเจ้าหน้าที่จะอนุมัติ (Two-tier Approval)
      </div>

      <PrivacyPolicyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </RegisterShell>
  );
}
