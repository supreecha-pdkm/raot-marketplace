'use client';

import { Button, Col, Divider, Result, Row, Space, Typography } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, EyeOutlined, TrophyOutlined } from '@ant-design/icons';
import type { AuctionLot } from '@/shared/types';
import type { BidLike, CloseMode } from '../close-round-wizard';

const { Text, Title } = Typography;

interface StepCompleteProps {
  lot:         AuctionLot;
  mode:        CloseMode;
  winner:      BidLike | null | undefined;
  closedAt:    string | null;
  officerName: string;
  witnessName: string;
  note:        string;
  onClose:     () => void;
}

export default function StepComplete({
  lot, mode, winner, closedAt, officerName, witnessName, note, onClose,
}: StepCompleteProps) {
  return (
    <Result
      status="success"
      icon={mode === 'close'
        ? <TrophyOutlined style={{ color: '#1a7c3e' }} />
        : <CheckCircleOutlined style={{ color: '#1a7c3e' }} />}
      title={mode === 'close' ? 'ปิดรอบประมูลและประกาศผู้ชนะเรียบร้อย' : 'ยกเลิกรอบประมูลเรียบร้อย'}
      subTitle={
        mode === 'close' && winner ? (
          <>
            <Title level={5} style={{ margin: '8px 0', color: '#1a7c3e' }}>
              ผู้ชนะ: {winner.buyer} — {winner.price.toFixed(2)} ฿/กก.
            </Title>
            <Text type="secondary">
              LOT {lot.lotNo} · {lot.weight.toLocaleString()} กก. · มูลค่ารวม {(winner.price * lot.weight).toLocaleString()} ฿
            </Text>
          </>
        ) : (
          <Text type="secondary">LOT {lot.lotNo} ถูกยกเลิกแล้ว — ระบบได้แจ้งเตือนผู้เกี่ยวข้องเรียบร้อย</Text>
        )
      }
      extra={
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ textAlign: 'left', padding: 12, borderRadius: 8, background: '#fafafa', border: '1px solid #f0f0f0' }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>บันทึก Audit Log</Text>
            <Row gutter={[8, 4]}>
              <Col span={24}><Text style={{ fontSize: 12 }}><strong>เวลา:</strong> {closedAt ?? '—'}</Text></Col>
              <Col span={24}><Text style={{ fontSize: 12 }}><strong>ผู้ปฏิบัติงาน:</strong> {officerName || '—'}</Text></Col>
              {witnessName && <Col span={24}><Text style={{ fontSize: 12 }}><strong>พยาน:</strong> {witnessName}</Text></Col>}
              {note && <Col span={24}><Text style={{ fontSize: 12 }}><strong>{mode === 'cancel' ? 'เหตุผล' : 'หมายเหตุ'}:</strong> {note}</Text></Col>}
            </Row>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          <Space wrap style={{ justifyContent: 'center', width: '100%' }}>
            <Button onClick={onClose} icon={<ArrowLeftOutlined />}>กลับหน้าควบคุม</Button>
            {mode === 'close' && (
              <Button type="primary" icon={<EyeOutlined />}
                href={`/officer/auction-control/${lot.id}`}
                onClick={onClose}
                style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
              >
                ดูรายละเอียดผลการประมูล
              </Button>
            )}
          </Space>
        </Space>
      }
    />
  );
}
