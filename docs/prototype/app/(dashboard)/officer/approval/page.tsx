'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Card, Table, Tag, Button, Tabs, Avatar, Space, Badge, Input, Select, Typography,
  Modal, App,
} from 'antd';
import {
  UserOutlined, EyeOutlined, SearchOutlined,
  HourglassOutlined, CheckCircleOutlined, CloseCircleOutlined,
  FileOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface';
import {
  getAllApplications, isOverSla, setOverallStatus,
  APPROVAL_UPDATED_EVENT,
  type Application, type AppOverallStatus,
} from '@/features/approvals/services/approval-data';
import { getSession } from '@/features/auth/services/auth';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

const OVERALL_STATUS_CFG: Record<AppOverallStatus, { color: string; label: string; icon?: React.ReactNode }> = {
  pending_review:    { color: 'warning',    label: 'รอตรวจสอบ',       icon: <ClockCircleOutlined /> },
  awaiting_director: { color: 'processing', label: 'รอ ผอ. อนุมัติ',   icon: <HourglassOutlined />   },
  approved:          { color: 'success',    label: 'อนุมัติแล้ว',       icon: <CheckCircleOutlined /> },
  rejected:          { color: 'error',      label: 'ปฏิเสธ',           icon: <CloseCircleOutlined /> },
  returned:          { color: 'default',    label: 'ส่งกลับให้แก้ไข',   icon: <FileOutlined />        },
};

// 3-state status grouping mirroring the officer page. From the director's
// perspective: `pending` = forwarded items still in director_review;
// `approved` / `rejected` = items the director has finalised.
type SimpleStatus = 'pending' | 'approved' | 'rejected';
type StatusTab = SimpleStatus;

function toSimpleStatus(a: Application): SimpleStatus | null {
  if (a.approvalStage === 'director_review')   return 'pending';
  if (a.approvalStage === 'approved')          return 'approved';
  if (a.approvalStage === 'director_rejected') return 'rejected';
  return null; // still in officer_review or officer_rejected — invisible to director
}

const ROLE_OPTIONS = [
  { value: '',       label: 'ทุกบทบาท' },
  { value: 'buyer',  label: 'ผู้ซื้อ' },
  { value: 'seller', label: 'ผู้ขาย' },
];

const SUB_TYPE_OPTIONS = [
  { value: '', label: 'ทุกประเภทย่อย' },
  { value: 'individual',   label: 'บุคคลธรรมดา' },
  { value: 'company',      label: 'นิติบุคคล' },
  { value: 'farmer',       label: 'เกษตรกร' },
  { value: 'cooperative',  label: 'สถาบันเกษตรกร' },
  { value: 'farmer_group', label: 'กลุ่มพัฒนาเกษตรกร' },
  { value: 'business',     label: 'ผู้ประกอบกิจการยาง' },
  { value: 'organization', label: 'องค์กร' },
];

const SUB_TYPE_LABEL: Record<string, string> = {
  individual:   'บุคคลธรรมดา',
  company:      'นิติบุคคล',
  farmer:       'เกษตรกร',
  cooperative:  'สถาบันเกษตรกร',
  farmer_group: 'กลุ่มพัฒนาเกษตรกร',
  business:     'ผู้ประกอบกิจการยาง',
  organization: 'องค์กร',
};

type BulkMode = 'approve' | 'reject';

export default function DirectorApprovalPage() {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const cacheBust = searchParams.get('v');
  const [tick, setTick] = useState(0);
  const [search, setSearch] = useState('');
  const [subTypeFilter, setSubTypeFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<'' | 'buyer' | 'seller'>('');
  const [tab, setTab] = useState<StatusTab>('pending');

  // Bulk selection — only meaningful on the "รอตรวจสอบ" tab.
  const [selectedPending, setSelectedPending] = useState<string[]>([]);

  const [bulkMode, setBulkMode] = useState<BulkMode | null>(null);
  const [bulkNote, setBulkNote] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Refresh on poll, focus, mutation broadcast, and cross-tab storage event.
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const interval = setInterval(bump, 30000);
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === 'raot_application_overrides') bump();
    };
    window.addEventListener('focus', bump);
    window.addEventListener(APPROVAL_UPDATED_EVENT, bump);
    window.addEventListener('storage', onStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', bump);
      window.removeEventListener(APPROVAL_UPDATED_EVENT, bump);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const everything = useMemo(() => {
    void tick;
    void cacheBust;
    return getAllApplications();
  }, [tick, cacheBust]);

  const sortByOverdue = (apps: Application[]) =>
    [...apps].sort((a, b) => {
      const aOver = isOverSla(a.submittedAt) ? 0 : 1;
      const bOver = isOverSla(b.submittedAt) ? 0 : 1;
      return aOver - bOver;
    });

  const sortByReviewedDesc = (apps: Application[]) =>
    [...apps].sort(
      (a, b) => new Date(b.reviewedAt ?? b.submittedAt).getTime()
              - new Date(a.reviewedAt ?? a.submittedAt).getTime(),
    );

  function filterApps(apps: Application[]): Application[] {
    return apps.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
        a.nationalId.includes(q);
      const matchSubType = !subTypeFilter || a.subType === subTypeFilter;
      const matchRole    = !roleFilter    || a.type === roleFilter;
      return matchSearch && matchSubType && matchRole;
    });
  }

  // Bucket by 3-state status (director-relevant only)
  const directorRelevant = everything.filter((a) => toSimpleStatus(a) !== null);
  const pendingRows  = filterApps(sortByOverdue(directorRelevant.filter((a) => toSimpleStatus(a) === 'pending')));
  const approvedRows = filterApps(sortByReviewedDesc(directorRelevant.filter((a) => toSimpleStatus(a) === 'approved')));

  // For "ปฏิเสธ" tab: dedupe by applicant (nationalId + role) — keep latest
  // rejection, plus a per-user count for the badge column.
  const userKey = (a: Application) => `${a.type}|${a.nationalId}`;
  const allRejected = sortByReviewedDesc(directorRelevant.filter((a) => toSimpleStatus(a) === 'rejected'));
  const rejectionCountByUser = new Map<string, number>();
  for (const a of allRejected) {
    rejectionCountByUser.set(userKey(a), (rejectionCountByUser.get(userKey(a)) ?? 0) + 1);
  }
  const seenUsers = new Set<string>();
  const rejectedRows = filterApps(allRejected.filter((a) => {
    const key = userKey(a);
    if (seenUsers.has(key)) return false;
    seenUsers.add(key);
    return true;
  }));

  // Bulk selections must only count rows still in the pending tab.
  const pendingIdSet = new Set(pendingRows.map((a) => a.id));
  const visibleSelected = selectedPending.filter((id) => pendingIdSet.has(id));
  const selectedIds    = tab === 'pending' ? visibleSelected : [];
  const setSelectedIds = tab === 'pending' ? setSelectedPending : (() => {});

  // ── Bulk action ──────────────────────────────────────────────────────────
  const openBulk = (mode: BulkMode) => {
    if (selectedIds.length === 0) {
      message.warning('กรุณาเลือกอย่างน้อย 1 รายการ');
      return;
    }
    setBulkMode(mode);
    setBulkNote('');
  };

  const submitBulk = () => {
    if (!bulkMode) return;
    const director = getSession()?.user.fullName ?? 'ผู้อำนวยการตลาด';
    const note = bulkNote.trim();
    if (bulkMode === 'reject' && !note) {
      message.error('กรุณาระบุเหตุผลการปฏิเสธ');
      return;
    }
    setBulkSubmitting(true);
    try {
      for (const id of selectedIds) {
        if (bulkMode === 'approve') {
          setOverallStatus(id, 'approved', director, undefined, 'approved', note || undefined);
        } else {
          setOverallStatus(id, 'rejected', director, note, 'director_rejected');
        }
      }
      message.success(
        bulkMode === 'approve'
          ? `อนุมัติแล้ว ${selectedIds.length} รายการ`
          : `ปฏิเสธแล้ว ${selectedIds.length} รายการ`,
      );
      setSelectedIds([]);
      setBulkMode(null);
      setBulkNote('');
      setTick((t) => t + 1);
    } finally {
      setBulkSubmitting(false);
    }
  };

  const closeBulk = () => {
    setBulkMode(null);
    setBulkNote('');
  };

  // ── Columns ──────────────────────────────────────────────────────────────
  // Shared user-cell renderer
  const applicantCell = (_: unknown, r: Application) => (
    <Space>
      <Avatar
        icon={<UserOutlined />}
        style={{ background: r.type === 'buyer' ? '#1677ff' : '#52c41a' }}
      />
      <div>
        <div style={{ fontWeight: 500 }}>
          {r.title}{r.firstName} {r.lastName}
        </div>
        <div style={{ fontSize: 11, color: '#bfbfbf' }}>{r.nationalId}</div>
      </div>
    </Space>
  );

  const roleCell = (v: string) => (
    <Tag color={v === 'buyer' ? 'blue' : 'green'}>
      {v === 'buyer' ? 'ผู้ซื้อ' : 'ผู้ขาย'}
    </Tag>
  );

  const pendingColumns: ColumnsType<Application> = [
    { title: 'ผู้สมัคร', render: applicantCell },
    { title: 'บทบาท', dataIndex: 'type', render: roleCell },
    {
      title: 'ประเภทย่อย',
      dataIndex: 'subType',
      render: (v: string) => <Tag>{SUB_TYPE_LABEL[v] ?? v}</Tag>,
    },
    {
      title: 'วันที่สมัคร',
      dataIndex: 'submittedAt',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'ส่งต่อโดย',
      dataIndex: 'reviewerName',
      render: (v?: string) => v
        ? <Text style={{ fontSize: 13 }}>{v}</Text>
        : <Text type="secondary">—</Text>,
    },
    {
      title: 'SLA',
      render: (_, r) =>
        isOverSla(r.submittedAt)
          ? <Tag color="red">เกิน SLA</Tag>
          : <Tag color="green">ปกติ</Tag>,
    },
    {
      title: 'สถานะ',
      dataIndex: 'overallStatus',
      render: (s: AppOverallStatus) => {
        const cfg = OVERALL_STATUS_CFG[s];
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
      },
    },
    {
      title: '',
      render: (_, r) => (
        <Link href={`/officer/approval/${r.id}`}>
          <Button size="small" type="primary" icon={<EyeOutlined />}
            style={{ background: '#722ed1', borderColor: '#722ed1' }}>
            ดูและพิจารณา
          </Button>
        </Link>
      ),
    },
  ];

  const approvedColumns: ColumnsType<Application> = [
    { title: 'ผู้สมัคร', render: applicantCell },
    { title: 'บทบาท', dataIndex: 'type', render: roleCell },
    {
      title: 'ประเภทย่อย',
      dataIndex: 'subType',
      render: (v: string) => <Tag>{SUB_TYPE_LABEL[v] ?? v}</Tag>,
    },
    {
      title: 'คอมเมนต์การอนุมัติ',
      render: (_, r) => {
        const text = r.approveNote ?? '';
        return text
          ? <Text style={{ fontSize: 12 }}>{text.length > 80 ? `${text.slice(0, 80)}…` : text}</Text>
          : <Text type="secondary">—</Text>;
      },
    },
    {
      title: 'อนุมัติเมื่อ',
      dataIndex: 'reviewedAt',
      render: (v?: string) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—',
    },
    {
      title: '',
      render: (_, r) => (
        <Link href={`/officer/approval/${r.id}`}>
          <Button size="small" icon={<EyeOutlined />}>ดู</Button>
        </Link>
      ),
    },
  ];

  // Rejected tab adds "จำนวนครั้งที่ถูกปฏิเสธ" right after role.
  const rejectedColumns: ColumnsType<Application> = [
    { title: 'ผู้สมัคร', render: applicantCell },
    { title: 'บทบาท', dataIndex: 'type', render: roleCell },
    {
      title: 'ประเภทย่อย',
      dataIndex: 'subType',
      render: (v: string) => <Tag>{SUB_TYPE_LABEL[v] ?? v}</Tag>,
    },
    {
      title: 'จำนวนครั้งที่ถูกปฏิเสธ',
      align: 'center',
      render: (_, r) => {
        const count = rejectionCountByUser.get(userKey(r)) ?? 1;
        return count > 1
          ? <Tag color="red">ถูกปฏิเสธ {count} ครั้ง</Tag>
          : <Tag>1 ครั้ง</Tag>;
      },
    },
    {
      title: 'เหตุผลครั้งล่าสุด',
      render: (_, r) => {
        const text = r.rejectReason ?? '';
        return text
          ? <Text style={{ fontSize: 12 }}>{text.length > 80 ? `${text.slice(0, 80)}…` : text}</Text>
          : <Text type="secondary">—</Text>;
      },
    },
    {
      title: 'ปฏิเสธครั้งล่าสุดเมื่อ',
      dataIndex: 'reviewedAt',
      render: (v?: string) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—',
    },
    {
      title: '',
      render: (_, r) => (
        <Link href={`/officer/approval/${r.id}`}>
          <Button size="small" icon={<EyeOutlined />}>ดู</Button>
        </Link>
      ),
    },
  ];

  const rowSelection: TableRowSelection<Application> = {
    selectedRowKeys: selectedIds,
    onChange: (keys) => setSelectedIds(keys.map(String)),
    preserveSelectedRowKeys: true,
  };

  const renderPendingTab = (rows: Application[]) => (
    <Card>
      {selectedIds.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: '8px 12px',
            marginBottom: 12,
            background: '#f9f0ff',
            border: '1px solid #d3adf7',
            borderRadius: 6,
            flexWrap: 'wrap',
          }}
        >
          <Text strong>เลือกแล้ว {selectedIds.length} รายการ</Text>
          <Space wrap>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => openBulk('approve')}
              style={{ background: '#722ed1', borderColor: '#722ed1' }}
            >
              อนุมัติที่เลือก
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => openBulk('reject')}
            >
              ปฏิเสธที่เลือก
            </Button>
            <Button onClick={() => setSelectedIds([])}>ล้างที่เลือก</Button>
          </Space>
        </div>
      )}
      <Table
        dataSource={rows}
        columns={pendingColumns}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        rowSelection={rowSelection}
        locale={{ emptyText: 'ไม่พบรายการที่รอการพิจารณา' }}
      />
    </Card>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card size="small">
        <Space wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="ค้นหาชื่อ หรือ เลขประจำตัว"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 280 }}
          />
          <Select
            value={roleFilter}
            onChange={(v) => setRoleFilter(v as '' | 'buyer' | 'seller')}
            options={ROLE_OPTIONS}
            style={{ width: 140 }}
          />
          <Select
            value={subTypeFilter}
            onChange={setSubTypeFilter}
            options={SUB_TYPE_OPTIONS}
            style={{ width: 200 }}
          />
        </Space>
      </Card>

      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k as StatusTab)}
        items={[
          {
            key: 'pending',
            label: (
              <span>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                รอตรวจสอบ
                <Badge count={pendingRows.length} offset={[8, 0]} style={{ marginLeft: 4 }} />
              </span>
            ),
            children: renderPendingTab(pendingRows),
          },
          {
            key: 'approved',
            label: (
              <span>
                <CheckCircleOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                อนุมัติแล้ว
                <Badge
                  count={approvedRows.length}
                  offset={[8, 0]}
                  showZero
                  color="#52c41a"
                  style={{ marginLeft: 4 }}
                />
              </span>
            ),
            children: (
              <Card>
                <Table
                  dataSource={approvedRows}
                  columns={approvedColumns}
                  rowKey="id"
                  scroll={{ x: 'max-content' }}
                  locale={{ emptyText: 'ยังไม่มีรายการที่อนุมัติ' }}
                />
              </Card>
            ),
          },
          {
            key: 'rejected',
            label: (
              <span>
                <CloseCircleOutlined style={{ marginRight: 4, color: '#ff4d4f' }} />
                ปฏิเสธ
                <Badge
                  count={rejectedRows.length}
                  offset={[8, 0]}
                  showZero
                  color="#ff4d4f"
                  style={{ marginLeft: 4 }}
                />
              </span>
            ),
            children: (
              <Card>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                  แสดง 1 รายการต่อผู้สมัคร — หากเคยถูกปฏิเสธหลายครั้ง จะมีตัวเลขกำกับ
                  และดูประวัติทั้งหมดได้ในรายละเอียดของใบสมัคร
                </Text>
                <Table
                  dataSource={rejectedRows}
                  columns={rejectedColumns}
                  rowKey={(r) => userKey(r)}
                  scroll={{ x: 'max-content' }}
                  locale={{ emptyText: 'ยังไม่มีรายการที่ถูกปฏิเสธ' }}
                />
              </Card>
            ),
          },
        ]}
      />

      <Text type="secondary" style={{ fontSize: 11, textAlign: 'center' }}>
        แท็บ &ldquo;รอตรวจสอบ&rdquo; แสดงรายการที่ผ่าน Tier 1 และรอ ผอ. พิจารณา · อัปเดตอัตโนมัติทุก 30 วินาที
      </Text>

      <Modal
        open={bulkMode !== null}
        title={
          bulkMode === 'approve'
            ? `อนุมัติ — ${selectedIds.length} รายการที่เลือก`
            : `ปฏิเสธ — ${selectedIds.length} รายการที่เลือก`
        }
        okText={bulkMode === 'approve' ? 'อนุมัติทั้งหมด' : 'ปฏิเสธทั้งหมด'}
        okButtonProps={{
          danger: bulkMode === 'reject',
          loading: bulkSubmitting,
          style: bulkMode === 'approve'
            ? { background: '#722ed1', borderColor: '#722ed1' }
            : undefined,
        }}
        cancelText="ยกเลิก"
        onOk={submitBulk}
        onCancel={closeBulk}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          {bulkMode === 'approve'
            ? 'คอมเมนต์การอนุมัติ (ไม่บังคับ) — ทุกรายการที่เลือกจะได้รับข้อความเดียวกัน'
            : 'เหตุผลการปฏิเสธ (บังคับ) — ทุกรายการที่เลือกจะได้รับเหตุผลเดียวกัน'}
        </Text>
        <TextArea
          rows={4}
          value={bulkNote}
          onChange={(e) => setBulkNote(e.target.value)}
          placeholder={
            bulkMode === 'approve'
              ? 'เช่น เอกสารครบถ้วน อนุมัติให้เริ่มใช้งานระบบ'
              : 'เช่น คุณสมบัติไม่เป็นไปตามเกณฑ์ / ขัดต่อนโยบาย กยท.'
          }
        />
      </Modal>
    </div>
  );
}
