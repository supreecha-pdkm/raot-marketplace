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
  ClockCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface';
import {
  getAllApplications, isOverSla, setForwardNote, setOverallStatus,
  APPROVAL_UPDATED_EVENT,
  type Application, type AppOverallStatus,
} from '@/features/approvals/services/approval-data';
import { getSession } from '@/features/auth/services/auth';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

// Simplified 3-state display for the officer's approvals view.
// All in-flight stages (officer review, awaiting director, returned for edit)
// collapse into "รอตรวจสอบ"; final outcomes map to "อนุมัติสำเร็จ" or "ปฏิเสธการอนุมัติ".
type SimpleStatus = 'pending' | 'approved' | 'rejected';

const SIMPLE_STATUS_CFG: Record<SimpleStatus, { color: string; label: string; icon: React.ReactNode }> = {
  pending:  { color: 'warning', label: 'รอตรวจสอบ',       icon: <ClockCircleOutlined />  },
  approved: { color: 'success', label: 'อนุมัติสำเร็จ',    icon: <CheckCircleOutlined /> },
  rejected: { color: 'error',   label: 'ปฏิเสธการอนุมัติ', icon: <CloseCircleOutlined /> },
};

function toSimpleStatus(s: AppOverallStatus): SimpleStatus {
  if (s === 'approved') return 'approved';
  if (s === 'rejected') return 'rejected';
  return 'pending';
}

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

type BulkMode = 'forward' | 'reject';
type StatusTab = 'pending' | 'approved' | 'rejected';

export default function ApprovalsPage() {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  // `?v=<ts>` is appended by the detail page after mutating an application.
  // Using it as a useMemo dep guarantees the list re-reads localStorage even
  // when Next.js reuses the page instance from its router cache.
  const cacheBust = searchParams.get('v');
  const [tick, setTick] = useState(0);
  const [search, setSearch] = useState('');
  const [subTypeFilter, setSubTypeFilter] = useState('');
  const [tab, setTab] = useState<StatusTab>('pending');

  // Bulk selection — only meaningful on the "รอตรวจสอบ" tab.
  const [selectedPending, setSelectedPending] = useState<string[]>([]);

  // Bulk action modal
  const [bulkMode, setBulkMode] = useState<BulkMode | null>(null);
  const [bulkNote, setBulkNote] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Refresh triggers:
  //  - 30s polling fallback
  //  - window focus (returning to the tab)
  //  - approval mutations broadcast from anywhere (detail page, director page)
  //  - storage event (same key updated in another tab)
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
      return matchSearch && matchSubType;
    });
  }

  // Bucket by simplified outcome (3 states) so each tab matches its label.
  const pendingRows  = filterApps(sortByOverdue(everything.filter((a) => toSimpleStatus(a.overallStatus) === 'pending')));
  const approvedRows = filterApps(sortByReviewedDesc(everything.filter((a) => toSimpleStatus(a.overallStatus) === 'approved')));

  // For the "ปฏิเสธการอนุมัติ" tab: show 1 row per applicant (matched by
  // nationalId + role), keeping the most-recently-rejected attempt. The full
  // rejection history per applicant is available on the detail page.
  const userKey = (a: Application) => `${a.type}|${a.nationalId}`;
  const allRejected = sortByReviewedDesc(everything.filter((a) => toSimpleStatus(a.overallStatus) === 'rejected'));
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

  // Drop selections that no longer belong to the current pending list (e.g.,
  // after another tab moves them out of pending state via background polling).
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
    const officer = getSession()?.user.fullName ?? 'เจ้าหน้าที่ตลาด';
    const note = bulkNote.trim();
    if (bulkMode === 'reject' && !note) {
      message.error('กรุณาระบุเหตุผลการปฏิเสธ');
      return;
    }
    setBulkSubmitting(true);
    try {
      for (const id of selectedIds) {
        if (bulkMode === 'forward') {
          setForwardNote(id, note, officer);
        } else {
          setOverallStatus(id, 'rejected', officer, note, 'officer_rejected');
        }
      }
      message.success(
        bulkMode === 'forward'
          ? `ส่งต่อ ผอ. แล้ว ${selectedIds.length} รายการ`
          : `ปฏิเสธแล้ว ${selectedIds.length} รายการ`,
      );
      setSelectedIds([]);
      setBulkMode(null);
      setBulkNote('');
      setTick((t) => t + 1); // refresh
    } finally {
      setBulkSubmitting(false);
    }
  };

  const closeBulk = () => {
    setBulkMode(null);
    setBulkNote('');
  };

  // ── Columns ──────────────────────────────────────────────────────────────
  const baseColumns: ColumnsType<Application> = [
    {
      title: 'ผู้สมัคร',
      render: (_, r) => (
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
      ),
    },
    {
      title: 'บทบาท',
      dataIndex: 'type',
      render: (v: string) => (
        <Tag color={v === 'buyer' ? 'blue' : 'green'}>
          {v === 'buyer' ? 'ผู้ซื้อ' : 'ผู้ขาย'}
        </Tag>
      ),
    },
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
  ];

  const pendingColumns: ColumnsType<Application> = [
    ...baseColumns,
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
        const cfg = SIMPLE_STATUS_CFG[toSimpleStatus(s)];
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
      },
    },
    {
      title: '',
      render: (_, r) => (
        <Link href={`/officer/approvals/${r.id}`}>
          <Button size="small" type="primary" icon={<EyeOutlined />}
            style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
            ตรวจสอบ
          </Button>
        </Link>
      ),
    },
  ];

  const outcomeColumns: ColumnsType<Application> = [
    {
      title: 'ผู้สมัคร',
      render: (_, r) => (
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
      ),
    },
    {
      title: 'บทบาท',
      dataIndex: 'type',
      render: (v: string) => (
        <Tag color={v === 'buyer' ? 'blue' : 'green'}>
          {v === 'buyer' ? 'ผู้ซื้อ' : 'ผู้ขาย'}
        </Tag>
      ),
    },
    {
      title: 'ประเภทย่อย',
      dataIndex: 'subType',
      render: (v: string) => <Tag>{SUB_TYPE_LABEL[v] ?? v}</Tag>,
    },
    {
      title: 'ผลการพิจารณา',
      render: (_, r) => {
        const cfg = SIMPLE_STATUS_CFG[toSimpleStatus(r.overallStatus)];
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'เหตุผล / คอมเมนต์',
      render: (_, r) => {
        const text = r.rejectReason ?? r.approveNote ?? r.forwardNote ?? '';
        return text
          ? <Text style={{ fontSize: 12 }}>{text.length > 80 ? `${text.slice(0, 80)}…` : text}</Text>
          : <Text type="secondary">—</Text>;
      },
    },
    {
      title: 'ดำเนินการเมื่อ',
      dataIndex: 'reviewedAt',
      render: (v?: string) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—',
    },
    {
      title: '',
      render: (_, r) => (
        <Link href={`/officer/approvals/${r.id}`}>
          <Button size="small" icon={<EyeOutlined />}>ดู</Button>
        </Link>
      ),
    },
  ];

  // Rejected tab adds a "จำนวนครั้งที่ถูกปฏิเสธ" column right after the role.
  const rejectedColumns: ColumnsType<Application> = [
    outcomeColumns[0], // ผู้สมัคร
    outcomeColumns[1], // บทบาท
    outcomeColumns[2], // ประเภทย่อย
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
    outcomeColumns[3], // ผลการพิจารณา
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
    outcomeColumns[outcomeColumns.length - 1], // ดู button
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
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: 6,
            flexWrap: 'wrap',
          }}
        >
          <Text strong>เลือกแล้ว {selectedIds.length} รายการ</Text>
          <Space wrap>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => openBulk('forward')}
              style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
            >
              ส่งต่อ ผอ. ที่เลือก
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
        locale={{ emptyText: 'ไม่พบรายการที่รอตรวจสอบ' }}
      />
    </Card>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Search + filter bar */}
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
                อนุมัติสำเร็จ
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
                  columns={outcomeColumns}
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
                ปฏิเสธการอนุมัติ
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
                  แสดง 1 รายการต่อผู้สมัคร — หากผู้สมัครเคยถูกปฏิเสธหลายครั้ง จะมีตัวเลขกำกับ และดูประวัติทั้งหมดในรายละเอียดของใบสมัครได้
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
        อัปเดตอัตโนมัติทุก 30 วินาที
      </Text>

      {/* ── Bulk action modal — single input applies to every selected row ── */}
      <Modal
        open={bulkMode !== null}
        title={
          bulkMode === 'forward'
            ? `ส่งต่อ ผอ. — ${selectedIds.length} รายการที่เลือก`
            : `ปฏิเสธ — ${selectedIds.length} รายการที่เลือก`
        }
        okText={bulkMode === 'forward' ? 'ส่งต่อทั้งหมด' : 'ปฏิเสธทั้งหมด'}
        okButtonProps={{
          danger: bulkMode === 'reject',
          loading: bulkSubmitting,
          style: bulkMode === 'forward'
            ? { background: '#1a7c3e', borderColor: '#1a7c3e' }
            : undefined,
        }}
        cancelText="ยกเลิก"
        onOk={submitBulk}
        onCancel={closeBulk}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          {bulkMode === 'forward'
            ? 'บันทึก / ความเห็นที่จะส่งให้ ผอ. (ไม่บังคับ) — ทุกรายการที่เลือกจะได้รับข้อความเดียวกัน'
            : 'เหตุผลการปฏิเสธ (บังคับ) — ทุกรายการที่เลือกจะได้รับเหตุผลเดียวกัน'}
        </Text>
        <TextArea
          rows={4}
          value={bulkNote}
          onChange={(e) => setBulkNote(e.target.value)}
          placeholder={
            bulkMode === 'forward'
              ? 'เช่น เอกสารครบถ้วน ขอให้ ผอ. พิจารณาอนุมัติ'
              : 'เช่น เอกสารไม่ครบถ้วน / ใบสำคัญหมดอายุ / ภาพไม่ชัด'
          }
        />
      </Modal>
    </div>
  );
}
