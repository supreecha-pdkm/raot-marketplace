'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import NextLink from 'next/link';
import { Card, Result, Steps, Tag, Button, Descriptions, Alert, Spin, Typography } from 'antd';
import { CheckCircle, Clock, XCircle, ArrowRight } from '@phosphor-icons/react';
import { getAllApplications } from '@/features/approvals/services/approval-data';
import type { Application, AppOverallStatus } from '@/features/approvals/services/approval-data';

const { Title, Text } = Typography;

const BRAND_GREEN = '#1a7c3e';

function statusToStep(status: AppOverallStatus, stage: string): number {
  if (status === 'approved') return 3;
  if (status === 'rejected' || stage === 'officer_rejected' || stage === 'director_rejected') return -1;
  if (status === 'awaiting_director') return 2;
  return 1; // pending_review / officer_review
}

export default function PendingStatusPage() {
  // Next.js 16 requires `useSearchParams()` to be inside a Suspense boundary
  // so the page can be partially prerendered. Outer wrapper provides the
  // boundary; inner component reads the params.
  return (
    <Suspense
      fallback={
        <Shell>
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        </Shell>
      }
    >
      <PendingStatusContent />
    </Suspense>
  );
}

function PendingStatusContent() {
  const params = useSearchParams();
  const appId = params.get('id') ?? '';
  const role  = params.get('role') ?? 'buyer';

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      const all = getAllApplications();
      const found = all.find((a) => a.id === appId);
      setApp(found ?? null);
      setLoading(false);
    };
    load();
    // Poll every 5 seconds so officer actions reflect quickly
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [appId]);

  if (loading) {
    return (
      <Shell>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      </Shell>
    );
  }

  if (!app) {
    return (
      <Shell>
        <Result
          status="404"
          title="ไม่พบข้อมูลการสมัคร"
          subTitle={`รหัส: ${appId}`}
          extra={
            <NextLink href="/login">
              <Button type="primary" style={{ background: BRAND_GREEN, borderColor: BRAND_GREEN }}>
                กลับเข้าสู่ระบบ
              </Button>
            </NextLink>
          }
        />
      </Shell>
    );
  }

  const isRejected =
    app.overallStatus === 'rejected' ||
    app.approvalStage === 'officer_rejected' ||
    app.approvalStage === 'director_rejected';
  const isApproved = app.overallStatus === 'approved';
  const currentStep = statusToStep(app.overallStatus, app.approvalStage);

  const stepItems = [
    { title: 'ส่งใบสมัคร',           content: 'ส่งเอกสารเรียบร้อย'    },
    { title: 'เจ้าหน้าที่ตรวจสอบ',  content: 'Tier 1 review'          },
    { title: 'ผอ.ตลาดอนุมัติ',       content: 'Tier 2 approval'        },
    { title: 'เปิดใช้งาน',           content: 'สามารถเข้าระบบได้'     },
  ];

  const statusTag = isApproved
    ? <Tag color="success">อนุมัติแล้ว</Tag>
    : isRejected
    ? <Tag color="error">ปฏิเสธ</Tag>
    : <Tag color="warning">รอการอนุมัติ</Tag>;

  return (
    <Shell>
      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 32 } }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {isApproved ? (
            <CheckCircle size={56} weight="duotone" color="#52c41a" />
          ) : isRejected ? (
            <XCircle size={56} weight="duotone" color="#ff4d4f" />
          ) : (
            <Clock size={56} weight="duotone" color="#faad14" />
          )}
          <Title level={3} style={{ marginTop: 12, marginBottom: 4 }}>
            {isApproved
              ? 'บัญชีของคุณได้รับการอนุมัติแล้ว!'
              : isRejected
              ? 'คำขอลงทะเบียนถูกปฏิเสธ'
              : 'กำลังรอการอนุมัติ'}
          </Title>
          <Text type="secondary">
            รหัสใบสมัคร: <strong>{app.id}</strong> {statusTag}
          </Text>
        </div>

        {!isRejected && (
          <Steps
            current={isRejected ? -1 : currentStep}
            status={isRejected ? 'error' : isApproved ? 'finish' : 'process'}
            style={{ marginBottom: 24 }}
            items={stepItems}
          />
        )}

        <Descriptions bordered size="small" column={1} style={{ marginBottom: 20 }}>
          <Descriptions.Item label="ชื่อ-นามสกุล">
            {app.title} {app.firstName} {app.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="ประเภท">
            {app.type === 'buyer' ? 'ผู้ซื้อ' : 'ผู้ขาย'} ({app.subType})
          </Descriptions.Item>
          <Descriptions.Item label="วันที่สมัคร">{app.submittedAt}</Descriptions.Item>
          {app.reviewerName && (
            <Descriptions.Item label="ผู้ตรวจสอบ">{app.reviewerName}</Descriptions.Item>
          )}
        </Descriptions>

        {isApproved ? (
          <>
            <Alert
              type="success"
              showIcon
              title="บัญชีของคุณพร้อมใช้งานแล้ว คุณสามารถเข้าสู่ระบบได้ทันที"
              style={{ marginBottom: app.approveNote ? 12 : 16 }}
            />
            {app.approveNote && (
              <Alert
                type="info"
                showIcon
                title={<strong>คอมเมนต์จาก ผอ.ตลาด</strong>}
                description={<span style={{ whiteSpace: 'pre-wrap' }}>{app.approveNote}</span>}
                style={{ marginBottom: 16 }}
              />
            )}
          </>
        ) : isRejected ? (
          <>
            <Alert
              type="error"
              showIcon
              title={
                app.approvalStage === 'director_rejected'
                  ? 'คำขอลงทะเบียนถูก ผอ.ตลาด ปฏิเสธ'
                  : app.approvalStage === 'officer_rejected'
                  ? 'คำขอลงทะเบียนถูกเจ้าหน้าที่ตลาดปฏิเสธ'
                  : 'คำขอลงทะเบียนถูกปฏิเสธ'
              }
              description={
                app.rejectReason ? (
                  <>
                    <div style={{ marginBottom: 6 }}>
                      <strong>เหตุผล:</strong>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{app.rejectReason}</div>
                    {app.reviewerName && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                        โดย {app.reviewerName}
                        {app.reviewedAt && ` · ${new Date(app.reviewedAt).toLocaleString('th-TH')}`}
                      </div>
                    )}
                  </>
                ) : (
                  'กรุณาติดต่อเจ้าหน้าที่ตลาดเพื่อสอบถามรายละเอียด หรือยื่นคำขอใหม่'
                )
              }
              style={{ marginBottom: 16 }}
            />
            {app.forwardNote && app.approvalStage === 'director_rejected' && (
              <Alert
                type="info"
                showIcon
                title={<strong>บันทึกจากเจ้าหน้าที่ตลาด (ก่อนส่งต่อ ผอ.)</strong>}
                description={<span style={{ whiteSpace: 'pre-wrap' }}>{app.forwardNote}</span>}
                style={{ marginBottom: 16 }}
              />
            )}
          </>
        ) : app.overallStatus === 'awaiting_director' ? (
          <>
            <Alert
              type="warning"
              showIcon
              title="เจ้าหน้าที่ตลาดตรวจสอบผ่านแล้ว — รอ ผอ.ตลาด อนุมัติขั้นสุดท้าย"
              style={{ marginBottom: app.forwardNote ? 12 : 16 }}
            />
            {app.forwardNote && (
              <Alert
                type="info"
                showIcon
                title={<strong>บันทึกจากเจ้าหน้าที่ตลาด</strong>}
                description={<span style={{ whiteSpace: 'pre-wrap' }}>{app.forwardNote}</span>}
                style={{ marginBottom: 16 }}
              />
            )}
          </>
        ) : (
          <Alert
            type="info"
            showIcon
            title="เจ้าหน้าที่จะตรวจสอบเอกสารภายใน 1-3 วันทำการ ระบบจะแจ้งผลทาง Email/SMS"
            style={{ marginBottom: 16 }}
          />
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <NextLink href="/login">
            <Button
              type={isApproved ? 'primary' : 'default'}
              style={isApproved ? { background: BRAND_GREEN, borderColor: BRAND_GREEN } : {}}
            >
              {isApproved ? 'เข้าสู่ระบบ' : 'กลับหน้าเข้าสู่ระบบ'}
            </Button>
          </NextLink>
          {isRejected && (
            <NextLink href={`/register/${role}?resubmit=${app.id}`}>
              <Button type="primary" style={{ background: BRAND_GREEN, borderColor: BRAND_GREEN }}>
                ยื่นคำขอใหม่ <ArrowRight size={14} />
              </Button>
            </NextLink>
          )}
        </div>
      </Card>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'linear-gradient(135deg, #0f3d22 0%, #1a7c3e 50%, #0f3d22 100%)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 640 }}>{children}</div>
    </div>
  );
}
