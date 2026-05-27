'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal, Steps, Button, Alert, Form, Space, Typography } from 'antd';
import {
  TrophyOutlined, ExclamationCircleOutlined, CheckCircleOutlined,
  UserOutlined, NotificationOutlined, StopOutlined,
  BellOutlined, FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getSession } from '@/features/auth/services/auth';
import type { AuctionLot } from '@/shared/types';
import CloseStepReview  from './wizard/close-step-review';
import CloseStepOfficer from './wizard/close-step-officer';
import CancelStepReason  from './wizard/cancel-step-reason';
import CancelStepConfirm from './wizard/cancel-step-confirm';
import StepProcess  from './wizard/step-process';
import StepComplete from './wizard/step-complete';

const { Text } = Typography;

// ─── Public types ─────────────────────────────────────────────────────────────
export type CloseMode = 'close' | 'cancel';

export interface BidLike {
  rank:   number;
  buyer:  string;
  bidId:  string;
  price:  number;
  weight: number;
  time:   string;
  status: 'leading' | 'outbid' | string;
}

export interface ProcessAction {
  id:    string;
  label: string;
  icon:  React.ReactNode;
}

// ─── Step configs ─────────────────────────────────────────────────────────────
const CLOSE_STEPS = [
  { title: 'ตรวจทาน',       icon: <ExclamationCircleOutlined /> },
  { title: 'ผู้ปฏิบัติงาน', icon: <UserOutlined /> },
  { title: 'ประมวลผล',     icon: <NotificationOutlined /> },
  { title: 'เสร็จสมบูรณ์', icon: <CheckCircleOutlined /> },
];
const CANCEL_STEPS = [
  { title: 'ระบุเหตุผล',   icon: <ExclamationCircleOutlined /> },
  { title: 'ยืนยัน',       icon: <UserOutlined /> },
  { title: 'ประมวลผล',     icon: <NotificationOutlined /> },
  { title: 'เสร็จสมบูรณ์', icon: <CheckCircleOutlined /> },
];

const CLOSE_ACTIONS: ProcessAction[] = [
  { id: 'lock',          label: 'หยุดรับการเสนอราคา + ปิด LOT',      icon: <StopOutlined /> },
  { id: 'contract',      label: 'สร้างสัญญาซื้อขายอัตโนมัติ',          icon: <FileTextOutlined /> },
  { id: 'notify-winner', label: 'แจ้งเตือนผู้ชนะให้ชำระเงิน',          icon: <BellOutlined /> },
  { id: 'notify-loser',  label: 'แจ้งผลผู้เสนอราคารายอื่น',            icon: <BellOutlined /> },
  { id: 'notify-seller', label: 'แจ้งผู้ขายเตรียมส่งมอบ',            icon: <BellOutlined /> },
  { id: 'audit',         label: 'บันทึก audit log การปิดรอบ',        icon: <FileTextOutlined /> },
];
const CANCEL_ACTIONS: ProcessAction[] = [
  { id: 'lock',            label: 'ยกเลิก LOT + หยุดรับการเสนอราคา', icon: <StopOutlined /> },
  { id: 'notify-bidders',  label: 'แจ้งเตือนผู้เสนอราคาทุกราย',        icon: <BellOutlined /> },
  { id: 'notify-seller',   label: 'แจ้งผู้ขายเตรียมรับคืน',            icon: <BellOutlined /> },
  { id: 'audit',           label: 'บันทึก audit log การยกเลิกรอบ',   icon: <FileTextOutlined /> },
];

const PROCESS_DELAY_MS = 450;

// ─── Public props ─────────────────────────────────────────────────────────────
interface CloseRoundWizardProps {
  lot:        AuctionLot | null;
  mode:       CloseMode;
  bids:       BidLike[];
  onClose:    () => void;
  onComplete: (lotId: string, mode: CloseMode) => void;
}

// ─── Outer shell ─────────────────────────────────────────────────────────────
export default function CloseRoundWizard({
  lot, mode, bids, onClose, onComplete,
}: CloseRoundWizardProps) {
  return (
    <Modal
      open={!!lot}
      onCancel={onClose}
      width={760}
      footer={null}
      title={
        <Space>
          {mode === 'close'
            ? <TrophyOutlined style={{ color: '#1a7c3e' }} />
            : <StopOutlined  style={{ color: '#ff4d4f' }} />}
          <span>
            {mode === 'close' ? 'ปิดรอบประมูล + ประกาศผู้ชนะ' : 'ยกเลิกรอบประมูล'}
            {lot && <Text type="secondary" style={{ fontSize: 13, marginLeft: 8 }}>— {lot.lotNo}</Text>}
          </span>
        </Space>
      }
      destroyOnHidden
    >
      {lot && (
        <WizardBody
          key={`${lot.id}-${mode}`}
          lot={lot} mode={mode} bids={bids}
          onClose={onClose} onComplete={onComplete}
        />
      )}
    </Modal>
  );
}

// ─── Wizard body (keyed per lot+mode so state resets cleanly) ─────────────────
function WizardBody({
  lot, mode, bids, onClose, onComplete,
}: {
  lot:        AuctionLot;
  mode:       CloseMode;
  bids:       BidLike[];
  onClose:    () => void;
  onComplete: (lotId: string, mode: CloseMode) => void;
}) {
  const stepsCfg = mode === 'close' ? CLOSE_STEPS : CANCEL_STEPS;
  const actions  = mode === 'close' ? CLOSE_ACTIONS : CANCEL_ACTIONS;
  const winner   = bids[0];

  const [stepIdx, setStepIdx]         = useState(0);
  const [form]                        = Form.useForm();
  const [doneActions, setDoneActions] = useState<string[]>([]);
  const [closedAt, setClosedAt]       = useState<string | null>(null);

  const submitting = stepIdx === 2 && doneActions.length < actions.length;

  const initialValues = useMemo(() => ({
    officerName:  getSession()?.user.fullName ?? 'เจ้าหน้าที่ตลาด',
    witnessName:  '',
    note:         '',
    cancelReason: undefined,
    cancelDetail: '',
  }), []);

  const checks = useMemo(() => {
    const list: { type: 'warning' | 'error' | 'info'; text: string }[] = [];
    if (bids.length === 0) {
      list.push({ type: 'error', text: 'ไม่มีผู้เสนอราคาเลย — แนะนำให้ยกเลิกรอบประมูล' });
    } else if (bids.length === 1) {
      list.push({ type: 'warning', text: 'มีผู้เสนอราคารายเดียว — ไม่มีการแข่งขัน' });
    }
    if (winner && winner.price < lot.openingPrice) {
      list.push({ type: 'error', text: 'ราคาของผู้นำต่ำกว่าราคาเปิด — ต้องตรวจสอบก่อนปิดรอบ' });
    }
    if (winner) {
      const margin = ((winner.price - lot.openingPrice) / lot.openingPrice) * 100;
      if (margin < 5 && margin >= 0) {
        list.push({ type: 'info', text: `ราคาผู้นำสูงกว่าราคาเปิดเพียง ${margin.toFixed(1)}% — น้อยกว่าค่าเฉลี่ยตลาด` });
      }
    }
    return list;
  }, [bids, lot, winner]);

  const hasBlocker = checks.some(c => c.type === 'error');

  const goNext = async () => {
    if (mode === 'close' && stepIdx === 1) {
      if (!await form.validateFields(['officerName']).catch(() => null)) return;
    }
    if (mode === 'cancel' && stepIdx === 0) {
      if (!await form.validateFields(['cancelReason', 'cancelDetail']).catch(() => null)) return;
    }
    if (mode === 'cancel' && stepIdx === 1) {
      if (!await form.validateFields(['officerName']).catch(() => null)) return;
    }
    setStepIdx(i => i + 1);
  };
  const goBack = () => setStepIdx(i => Math.max(0, i - 1));

  useEffect(() => {
    if (stepIdx !== 2) return;
    let cancelled = false;
    (async () => {
      for (const a of actions) {
        await new Promise(r => setTimeout(r, PROCESS_DELAY_MS));
        if (cancelled) return;
        setDoneActions(d => [...d, a.id]);
      }
      if (cancelled) return;
      setClosedAt(dayjs().format('DD/MM/YYYY HH:mm'));
      setStepIdx(3);
      onComplete(lot.id, mode);
    })();
    return () => { cancelled = true; };
  }, [stepIdx, actions, lot.id, mode, onComplete]);

  return (
    <>
      <Steps current={stepIdx} size="small" items={stepsCfg} style={{ marginBottom: 16 }} />

      {mode === 'close' ? (
        <>
          {stepIdx === 0 && <CloseStepReview lot={lot} bids={bids} winner={winner} checks={checks} hasBlocker={hasBlocker} />}
          {stepIdx === 1 && <CloseStepOfficer form={form} initialValues={initialValues} lot={lot} winner={winner} />}
          {stepIdx === 2 && <StepProcess actions={actions} done={doneActions} mode="close" />}
          {stepIdx === 3 && (
            <StepComplete
              lot={lot} mode="close" winner={winner} closedAt={closedAt}
              officerName={form.getFieldValue('officerName')}
              witnessName={form.getFieldValue('witnessName')}
              note={form.getFieldValue('note')}
              onClose={onClose}
            />
          )}
        </>
      ) : (
        <>
          {stepIdx === 0 && <CancelStepReason form={form} initialValues={initialValues} lot={lot} bidsCount={bids.length} />}
          {stepIdx === 1 && <CancelStepConfirm form={form} lot={lot} bidsCount={bids.length} />}
          {stepIdx === 2 && <StepProcess actions={actions} done={doneActions} mode="cancel" />}
          {stepIdx === 3 && (
            <StepComplete
              lot={lot} mode="cancel" winner={null} closedAt={closedAt}
              officerName={form.getFieldValue('officerName')}
              witnessName={form.getFieldValue('witnessName')}
              note={[form.getFieldValue('cancelReason'), form.getFieldValue('cancelDetail')].filter(Boolean).join(' — ')}
              onClose={onClose}
            />
          )}
        </>
      )}

      {submitting && (
        <Alert type="info" showIcon style={{ marginTop: 12 }}
          title={<span style={{ fontSize: 12 }}>กำลังประมวลผล — กรุณาอย่าปิดหน้าต่างจนกว่าจะเสร็จสมบูรณ์</span>} />
      )}

      {stepIdx < 2 && (
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <Button onClick={stepIdx === 0 ? onClose : goBack}>
            {stepIdx === 0 ? 'ยกเลิก' : 'ย้อนกลับ'}
          </Button>

          {mode === 'close' && stepIdx === 0 && hasBlocker ? (
            <Space>
              <Text type="danger" style={{ fontSize: 12 }}>
                <ExclamationCircleOutlined /> ตรวจพบประเด็นที่ต้องแก้ — ไม่สามารถปิดรอบได้
              </Text>
            </Space>
          ) : (
            <Button
              type="primary"
              onClick={goNext}
              disabled={mode === 'close' && stepIdx === 0 && hasBlocker}
              style={{
                background:  mode === 'close' ? '#1a7c3e' : '#ff4d4f',
                borderColor: mode === 'close' ? '#1a7c3e' : '#ff4d4f',
              }}
              icon={stepIdx === 1
                ? (mode === 'close' ? <TrophyOutlined /> : <StopOutlined />)
                : undefined}
            >
              {stepIdx === 0 && 'ดำเนินการต่อ'}
              {stepIdx === 1 && (mode === 'close' ? 'ยืนยันปิดรอบ + ประกาศผู้ชนะ' : 'ยืนยันยกเลิกรอบ')}
            </Button>
          )}
        </div>
      )}
    </>
  );
}
