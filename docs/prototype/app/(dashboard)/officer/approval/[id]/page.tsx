'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card, Button, Typography, Tag, Space, Descriptions, Result,
  Modal, Input, Alert, App, Tabs, Avatar, Badge, Table, Empty,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftOutlined, UserOutlined, BankOutlined, FileOutlined,
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined,
  ClockCircleOutlined, HourglassOutlined, FileTextOutlined,
  EnvironmentOutlined, IdcardOutlined, AuditOutlined, HistoryOutlined,
} from '@ant-design/icons';
import {
  getAllApplications, setOverallStatus, APPROVAL_UPDATED_EVENT,
  type Application, type AppOverallStatus, type DocStatus,
} from '@/features/approvals/services/approval-data';
import { getSession } from '@/features/auth/services/auth';
import dayjs from 'dayjs';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

const OVERALL_STATUS_CFG: Record<AppOverallStatus, { color: string; label: string; icon?: React.ReactNode }> = {
  pending_review:    { color: 'warning',    label: 'รอตรวจสอบ',       icon: <ClockCircleOutlined /> },
  awaiting_director: { color: 'processing', label: 'รอ ผอ. อนุมัติ',   icon: <HourglassOutlined />   },
  approved:          { color: 'success',    label: 'อนุมัติแล้ว',       icon: <CheckCircleOutlined /> },
  rejected:          { color: 'error',      label: 'ปฏิเสธ',           icon: <CloseCircleOutlined /> },
  returned:          { color: 'default',    label: 'ส่งกลับให้แก้ไข',   icon: <FileOutlined />        },
};

const DOC_STATUS_CFG: Record<DocStatus, { color: string; label: string; icon: React.ReactNode }> = {
  pending:  { color: 'warning', label: 'รอตรวจ', icon: <ClockCircleOutlined /> },
  approved: { color: 'success', label: 'ผ่าน',   icon: <CheckCircleOutlined /> },
  rejected: { color: 'error',   label: 'ไม่ผ่าน', icon: <CloseCircleOutlined /> },
};

const SUB_TYPE_LABEL: Record<string, string> = {
  individual:   'บุคคลธรรมดา',
  company:      'นิติบุคคล',
  farmer:       'เกษตรกร (รายบุคคล)',
  cooperative:  'สถาบันเกษตรกร',
  farmer_group: 'กลุ่มพัฒนาเกษตรกร',
  business:     'ผู้ประกอบกิจการยาง',
  organization: 'องค์กร',
};

export default function DirectorApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { message } = App.useApp();
  const { id } = use(params);
  const router = useRouter();

  // Look up across mock + localStorage-submitted apps so the director can see
  // applications forwarded from officer review (POC stores submitted ones in
  // localStorage rather than the seed array).
  const [app, setApp] = useState<Application | null>(null);
  const [loaded, setLoaded] = useState(false);
  // Other applications by the same person (matched on nationalId + role) —
  // used to render the resubmission history.
  const [priorAttempts, setPriorAttempts] = useState<Application[]>([]);
  useEffect(() => {
    const reload = () => {
      const all = getAllApplications();
      const found = all.find((a) => a.id === id) ?? null;
      setApp(found);
      if (found) {
        const prior = all
          .filter((a) =>
            a.id !== found.id &&
            a.type === found.type &&
            a.nationalId === found.nationalId,
          )
          .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
        setPriorAttempts(prior);
      } else {
        setPriorAttempts([]);
      }
      setLoaded(true);
    };
    reload();
    window.addEventListener(APPROVAL_UPDATED_EVENT, reload);
    return () => window.removeEventListener(APPROVAL_UPDATED_EVENT, reload);
  }, [id]);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen,  setRejectOpen]  = useState(false);
  const [approveNote, setApproveNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // ── Not found ─────────────────────────────────────────────────────────
  if (loaded && !app) {
    return (
      <Result
        status="404"
        title="ไม่พบใบสมัคร"
        subTitle={`ไม่พบใบสมัครเลขที่ ${id}`}
        extra={
          <Link href="/officer/approval">
            <Button type="primary" icon={<ArrowLeftOutlined />}
              style={{ background: '#722ed1', borderColor: '#722ed1' }}>
              กลับไปรายการอนุมัติ
            </Button>
          </Link>
        }
      />
    );
  }

  if (!app) return null;

  const director = getSession()?.user.fullName ?? 'ผู้อำนวยการตลาด';
  const overallCfg = OVERALL_STATUS_CFG[app.overallStatus];
  const isFinalized = app.approvalStage !== 'director_review';

  // ── Approve ────────────────────────────────────────────────────────────
  const handleApproveSubmit = () => {
    const note = approveNote.trim() || undefined;
    setOverallStatus(app.id, 'approved', director, undefined, 'approved', note);
    setApp((prev) => prev && {
      ...prev,
      overallStatus: 'approved',
      approvalStage: 'approved',
      reviewerName: director,
      reviewedAt: new Date().toISOString(),
      approveNote: note,
    });
    message.success('อนุมัติแล้ว');
    setApproveOpen(false);
    setApproveNote('');
    router.push(`/officer/approval?v=${Date.now()}`);
    router.refresh();
  };

  // ── Reject ─────────────────────────────────────────────────────────────
  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      message.error('กรุณาระบุเหตุผลการปฏิเสธ');
      return;
    }
    const reason = rejectReason.trim();
    setOverallStatus(app.id, 'rejected', director, reason, 'director_rejected');
    setApp((prev) => prev && {
      ...prev,
      overallStatus: 'rejected',
      approvalStage: 'director_rejected',
      reviewerName: director,
      reviewedAt: new Date().toISOString(),
      rejectReason: reason,
    });
    message.warning('ปฏิเสธใบสมัครแล้ว');
    setRejectOpen(false);
    setRejectReason('');
    router.push(`/officer/approval?v=${Date.now()}`);
    router.refresh();
  };

  // ── Tab: ข้อมูลส่วนตัว ────────────────────────────────────────────────
  const tabPersonal = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card title={
        <Space><UserOutlined style={{ color: '#722ed1' }} /><span>ข้อมูลส่วนตัว</span></Space>
      }>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="ชื่อ-นามสกุล" span={2}>
            <Avatar size={20} icon={<UserOutlined />}
              style={{ marginRight: 6, background: app.type === 'buyer' ? '#1677ff' : '#52c41a' }} />
            <Text strong>{app.title}{app.firstName} {app.lastName}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="เลขประจำตัว">
            <IdcardOutlined style={{ marginRight: 4, color: '#8c8c8c' }} />
            <Text style={{ fontFamily: 'monospace' }}>{app.nationalId}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="วันเกิด">
            {dayjs(app.dob).format('DD/MM/YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="โทรศัพท์">{app.phone}</Descriptions.Item>
          <Descriptions.Item label="Email">{app.email}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={
        <Space><EnvironmentOutlined style={{ color: '#fa8c16' }} /><span>ที่อยู่ตามบัตรประชาชน</span></Space>
      }>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="ที่อยู่" span={2}>{app.addressLine}</Descriptions.Item>
          <Descriptions.Item label="ตำบล">{app.subDistrict}</Descriptions.Item>
          <Descriptions.Item label="อำเภอ">{app.district}</Descriptions.Item>
          <Descriptions.Item label="จังหวัด">{app.province}</Descriptions.Item>
          <Descriptions.Item label="รหัสไปรษณีย์">{app.zipcode}</Descriptions.Item>
        </Descriptions>
      </Card>

      {app.type === 'buyer' && app.markets && (
        <Card title="ตลาดที่ต้องการซื้อ">
          <Space wrap>
            {app.markets.map((m) => (
              <Tag key={m} color="blue" style={{ fontSize: 13, padding: '4px 10px' }}>{m}</Tag>
            ))}
          </Space>
        </Card>
      )}

      {app.type === 'seller' && (
        <Card title="ข้อมูลการขาย">
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="ตลาดที่ลงทะเบียน">{app.market ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="ชนิดยางที่ขาย">
              <Space wrap>
                {app.rubberTypes?.map((r) => <Tag key={r} color="green">{r}</Tag>) ?? '—'}
              </Space>
            </Descriptions.Item>
            {app.subType === 'farmer' && (
              <>
                <Descriptions.Item label="เลขที่แปลง / GID">
                  <Text style={{ fontFamily: 'monospace' }}>{app.plotId ?? '—'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="เนื้อที่">
                  {app.plotArea != null ? `${app.plotArea} ไร่` : '—'}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </Card>
      )}
    </div>
  );

  // ── Tab: บัญชีธนาคาร (multi-account aware) ────────────────────────────
  const bankList = (app.bankAccounts && app.bankAccounts.length > 0)
    ? app.bankAccounts
    : [{
        bank: app.bank,
        accountNo: app.accountNo,
        accountName: app.accountName,
        branch: app.branch,
        accountType: app.accountType,
      }];
  const primaryIdx = app.primaryBankIndex ?? 0;
  const tabBank = (
    <Card title={
      <Space wrap>
        <BankOutlined style={{ color: '#1677ff' }} />
        <span>บัญชีธนาคาร</span>
        {bankList.length > 1 && <Tag color="blue">{bankList.length} บัญชี</Tag>}
      </Space>
    }>
      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        {bankList.map((acc, idx) => {
          const isPrimary = idx === primaryIdx;
          const masked = `****${acc.accountNo.slice(-4)}`;
          return (
            <Card
              key={idx}
              size="small"
              style={{
                borderColor: isPrimary ? '#722ed1' : '#e8e8e8',
                borderWidth: isPrimary ? 2 : 1,
                background: isPrimary ? '#f9f0ff' : '#fff',
              }}
              styles={{ body: { padding: '10px 14px' } }}
              title={
                <Space size={6} wrap>
                  <Text strong style={{ fontSize: 13 }}>
                    บัญชีที่ {idx + 1}
                  </Text>
                  {isPrimary && (
                    <Tag color="purple" style={{ marginInlineEnd: 0 }}>บัญชีหลัก</Tag>
                  )}
                </Space>
              }
            >
              <Descriptions size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="ธนาคาร">{acc.bank}</Descriptions.Item>
                <Descriptions.Item label="ประเภทบัญชี">
                  {acc.accountType === 'savings' ? 'ออมทรัพย์' : 'กระแสรายวัน'}
                </Descriptions.Item>
                <Descriptions.Item label="เลขบัญชี">
                  <Text style={{ fontFamily: 'monospace' }}>{masked}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="สาขา">{acc.branch}</Descriptions.Item>
                <Descriptions.Item label="ชื่อบัญชี" span={2}>{acc.accountName}</Descriptions.Item>
              </Descriptions>
            </Card>
          );
        })}
      </Space>
    </Card>
  );

  // ── Tab: เอกสาร ──────────────────────────────────────────────────────
  const tabDocs = (
    <Card title={
      <Space>
        <FileOutlined style={{ color: '#fa8c16' }} />
        <span>เอกสารแนบ</span>
        <Tag color="blue">{app.docs.length} ฉบับ</Tag>
      </Space>
    }>
      {app.docs.length === 0 ? (
        <Alert type="warning" showIcon title="ไม่มีเอกสารแนบ" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {app.docs.map((doc) => {
            const cfg = DOC_STATUS_CFG[doc.status];
            return (
              <Card
                key={doc.id}
                size="small"
                style={{
                  borderColor:
                    doc.status === 'approved' ? '#b7eb8f' :
                    doc.status === 'rejected' ? '#ffa39e' : '#ffd591',
                  background:
                    doc.status === 'approved' ? '#f6ffed' :
                    doc.status === 'rejected' ? '#fff1f0' : '#fffbe6',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <Space size={6}>
                      <FileOutlined style={{ color: '#8c8c8c' }} />
                      <Text strong>{doc.label}</Text>
                      <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>
                    </Space>
                    <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                      {doc.filename} · อัปโหลดเมื่อ {dayjs(doc.uploadedAt).format('DD/MM/YYYY HH:mm')}
                    </div>
                  </div>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    href={doc.dataUrl}
                    target={doc.dataUrl ? '_blank' : undefined}
                    rel={doc.dataUrl ? 'noopener noreferrer' : undefined}
                    onClick={doc.dataUrl ? undefined : () => message.info(`[Demo] เปิดไฟล์ ${doc.filename}`)}
                  >
                    ดูไฟล์
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Card>
  );

  // ── Tab: ผลตรวจ Tier 1 ───────────────────────────────────────────────
  const tabTier1 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <Badge
          status="success"
          text={
            <Text strong style={{ color: '#389e0d', fontSize: 14 }}>
              ผ่านการตรวจสอบ Tier 1 แล้ว
            </Text>
          }
        />
      </div>
      <Card title={
        <Space><AuditOutlined style={{ color: '#1a7c3e' }} /><span>รายละเอียดการตรวจสอบขั้นที่ 1</span></Space>
      }>
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="เจ้าหน้าที่ผู้ตรวจ">
            <Text strong>{app.reviewerName ?? '—'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="วันที่ส่งต่อ">
            {app.reviewedAt
              ? dayjs(app.reviewedAt).format('DD/MM/YYYY HH:mm')
              : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="หมายเหตุจากเจ้าหน้าที่">
            {app.forwardNote ? (
              <Text>{app.forwardNote}</Text>
            ) : (
              <Text type="secondary">ไม่มีหมายเหตุ</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );

  // ── Tab: ประวัติการอนุมัติ ────────────────────────────────────────────
  // Combines prior submissions by the same person + the current application
  // into one chronological table — same UX as the officer-side page.
  const timelineAttempts: Application[] = [...priorAttempts, app].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
  );
  const tabHistory = (
    <Card title={
      <Space wrap>
        <HistoryOutlined style={{ color: '#722ed1' }} />
        <span>ประวัติการอนุมัติ</span>
        <Tag color="blue">{timelineAttempts.length} ครั้ง</Tag>
        {(() => {
          const rejectedCount = timelineAttempts.filter((a) => a.overallStatus === 'rejected').length;
          return rejectedCount > 0
            ? <Tag color="red">ถูกปฏิเสธ {rejectedCount} ครั้ง</Tag>
            : null;
        })()}
      </Space>
    }>
      {timelineAttempts.length === 1 && priorAttempts.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="ผู้สมัครรายนี้ยื่นใบสมัครครั้งแรก — ยังไม่มีประวัติก่อนหน้า"
        />
      ) : (
        <>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            title="ผู้สมัครรายนี้เคยยื่นใบสมัครมาก่อน"
            description={`พบประวัติการยื่นทั้งหมด ${timelineAttempts.length} ครั้ง — รายการที่ปฏิเสธไปก่อนหน้านี้สามารถใช้เป็นข้อมูลอ้างอิงในการพิจารณาครั้งนี้`}
          />
          {(() => {
            const columns: ColumnsType<Application> = [
              {
                title: 'วันที่ยื่น',
                dataIndex: 'submittedAt',
                key: 'submittedAt',
                width: 140,
                render: (date: string, a) => (
                  <Space size={4} wrap>
                    <Text>{dayjs(date).format('DD/MM/YYYY')}</Text>
                    {a.id === app.id && <Tag color="blue">ปัจจุบัน</Tag>}
                  </Space>
                ),
              },
              {
                title: 'สถานะการตอบรับ',
                dataIndex: 'overallStatus',
                key: 'status',
                width: 180,
                render: (_status: AppOverallStatus, a) => {
                  const cfg = OVERALL_STATUS_CFG[a.overallStatus];
                  return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
                },
              },
              {
                title: 'ผู้ทำรายการ',
                dataIndex: 'reviewerName',
                key: 'reviewerName',
                width: 200,
                render: (name: string | undefined, a) =>
                  name
                    ? (
                      <div style={{ fontSize: 12 }}>
                        <div>{name}</div>
                        {a.reviewedAt && (
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {dayjs(a.reviewedAt).format('DD/MM/YYYY HH:mm')}
                          </Text>
                        )}
                      </div>
                    )
                    : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
              },
              {
                title: 'สาเหตุการปฏิเสธ',
                dataIndex: 'rejectReason',
                key: 'rejectReason',
                render: (reason?: string) =>
                  reason
                    ? <Text type="danger" style={{ fontSize: 13 }}>{reason}</Text>
                    : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
              },
            ];
            return (
              <Table<Application>
                size="small"
                rowKey="id"
                pagination={false}
                columns={columns}
                dataSource={timelineAttempts}
                rowClassName={(a) => (a.id === app.id ? 'history-row-current' : '')}
              />
            );
          })()}
        </>
      )}
    </Card>
  );

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <Link href="/officer/approval">
            <Button type="text" icon={<ArrowLeftOutlined />} style={{ padding: 0, color: '#722ed1' }}>
              กลับไปรายการอนุมัติ
            </Button>
          </Link>
          <Title level={4} style={{ margin: '8px 0 0', color: '#3b0764' }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            พิจารณาใบสมัคร — {app.id}
          </Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            <Tag color={app.type === 'buyer' ? 'blue' : 'green'}>
              {app.type === 'buyer' ? 'ผู้ซื้อ' : 'ผู้ขาย'}
            </Tag>
            <Tag>{SUB_TYPE_LABEL[app.subType] ?? app.subType}</Tag>
            <span style={{ marginLeft: 8 }}>
              สมัครเมื่อ {dayjs(app.submittedAt).format('DD/MM/YYYY')}
            </span>
          </Paragraph>
        </div>
        <Tag color={overallCfg.color} icon={overallCfg.icon}
          style={{ fontSize: 13, padding: '6px 12px' }}>
          {overallCfg.label}
        </Tag>
      </div>

      {/* Resubmission banner — visible across all tabs.
          Highlights the rejection count (most common reason for resubmission). */}
      {priorAttempts.length > 0 && (() => {
        const priorRejected = priorAttempts.filter((a) => a.overallStatus === 'rejected');
        const lastPrior = priorAttempts[priorAttempts.length - 1];
        return (
          <Alert
            type={priorRejected.length > 0 ? 'warning' : 'info'}
            showIcon
            icon={<HistoryOutlined />}
            title={
              priorRejected.length > 0
                ? `ผู้สมัครรายนี้เคยถูกปฏิเสธไป ${priorRejected.length} ครั้ง (ยื่นทั้งหมด ${priorAttempts.length} ครั้ง)`
                : `ผู้สมัครรายนี้เคยยื่นมาก่อน ${priorAttempts.length} ครั้ง`
            }
            description={
              <>
                ครั้งล่าสุดก่อนหน้านี้ถูก
                {' '}
                <Text strong style={{ color: lastPrior.overallStatus === 'rejected' ? '#ff4d4f' : '#1677ff' }}>
                  {OVERALL_STATUS_CFG[lastPrior.overallStatus].label}
                </Text>
                {' '}เมื่อ {dayjs(lastPrior.reviewedAt ?? lastPrior.submittedAt).format('DD/MM/YYYY')}
                {lastPrior.rejectReason && (
                  <> — เหตุผล: {lastPrior.rejectReason}</>
                )}
                <br />
                ดูประวัติทั้งหมดที่แท็บ &ldquo;ประวัติการอนุมัติ&rdquo;
              </>
            }
          />
        );
      })()}

      {/* Tab layout */}
      <Tabs
        defaultActiveKey="personal"
        items={[
          {
            key: 'personal',
            label: <Space><UserOutlined />ข้อมูลส่วนตัว</Space>,
            children: tabPersonal,
          },
          {
            key: 'bank',
            label: <Space><BankOutlined />บัญชีธนาคาร</Space>,
            children: tabBank,
          },
          {
            key: 'docs',
            label: <Space><FileOutlined />เอกสาร</Space>,
            children: tabDocs,
          },
          {
            key: 'tier1',
            label: <Space><AuditOutlined />ผลตรวจ Tier 1</Space>,
            children: tabTier1,
          },
          {
            key: 'history',
            label: (
              <Space>
                <HistoryOutlined />
                ประวัติการอนุมัติ
                {priorAttempts.length > 0 && (
                  <Badge count={priorAttempts.length} size="small" style={{ background: '#fa8c16' }} />
                )}
              </Space>
            ),
            children: tabHistory,
          },
        ]}
      />

      {/* Action bar */}
      <Card>
        {isFinalized ? (
          <Alert
            type="info"
            showIcon
            title="ใบสมัครนี้ถูกดำเนินการแล้ว"
            description={`สถานะปัจจุบัน: ${overallCfg.label} — ไม่สามารถแก้ไขได้`}
          />
        ) : (
          <Space wrap>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              size="large"
              style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
              onClick={() => { setApproveNote(''); setApproveOpen(true); }}
            >
              อนุมัติ
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              size="large"
              onClick={() => { setRejectReason(''); setRejectOpen(true); }}
            >
              ปฏิเสธ
            </Button>
          </Space>
        )}
      </Card>

      {/* Approve modal */}
      <Modal
        open={approveOpen}
        onCancel={() => setApproveOpen(false)}
        onOk={handleApproveSubmit}
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>ยืนยันอนุมัติ — {app.title}{app.firstName} {app.lastName}</span>
          </Space>
        }
        okText="ยืนยันอนุมัติ"
        okButtonProps={{ style: { background: '#1a7c3e', borderColor: '#1a7c3e' } }}
        cancelText="ยกเลิก"
      >
        <Alert
          type="success"
          showIcon
          title="การอนุมัตินี้จะเปิดใช้งานบัญชีของผู้สมัคร"
          description="ผู้สมัครจะได้รับการแจ้งเตือนและสามารถเข้าใช้งานระบบได้ทันที"
          style={{ marginBottom: 12 }}
        />
        <div style={{ marginBottom: 8 }}>
          <Text>หมายเหตุ (ไม่บังคับ)</Text>
        </div>
        <TextArea
          rows={3}
          placeholder="หมายเหตุประกอบการอนุมัติ..."
          value={approveNote}
          onChange={(e) => setApproveNote(e.target.value)}
        />
      </Modal>

      {/* Reject modal */}
      <Modal
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onOk={handleRejectSubmit}
        title={
          <Space>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            <span>ยืนยันการปฏิเสธ</span>
          </Space>
        }
        okText="ยืนยันการปฏิเสธ"
        okType="danger"
        cancelText="ยกเลิก"
      >
        <Alert
          type="error"
          showIcon
          title="การปฏิเสธจาก ผอ. ตลาด — ใบสมัครจะถูกปิดทันที"
          description="ผู้สมัครจะได้รับการแจ้งเหตุผลการปฏิเสธและต้องยื่นใบสมัครใหม่"
          style={{ marginBottom: 12 }}
        />
        <div style={{ marginBottom: 8 }}>
          <Text>เหตุผลการปฏิเสธ (บังคับ)</Text>
        </div>
        <TextArea
          rows={4}
          placeholder="ระบุเหตุผลการปฏิเสธ..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
