'use client';

import { Alert, Col, Row, Typography } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import type { AuctionLot } from '@/shared/types';
import type { BidLike } from '../close-round-wizard';

const { Text } = Typography;

interface CloseStepReviewProps {
  lot:        AuctionLot;
  bids:       BidLike[];
  winner:     BidLike | undefined;
  checks:     { type: 'warning' | 'error' | 'info'; text: string }[];
  hasBlocker: boolean;
}

export default function CloseStepReview({
  lot, bids, winner, checks, hasBlocker,
}: CloseStepReviewProps) {
  return (
    <>
      <Alert
        type="info" showIcon style={{ marginBottom: 12 }}
        title="ตรวจสอบผู้ชนะก่อนปิดรอบ"
        description={`LOT ${lot.lotNo} · ${lot.rubberType} · เกรด ${lot.grade}${lot.isEudr ? ' · EUDR' : ''}`}
      />

      {checks.length > 0 && (
        <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {checks.map((c, i) => (
            <Alert key={i} type={c.type} showIcon title={<span style={{ fontSize: 12 }}>{c.text}</span>} />
          ))}
        </div>
      )}

      {winner && !hasBlocker && (
        <div style={{ padding: 16, borderRadius: 10, background: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <TrophyOutlined style={{ color: '#faad14', fontSize: 18 }} />
            <Text strong style={{ fontSize: 13, color: '#0f3d22' }}>ผู้ชนะการประมูล</Text>
          </div>
          <Row gutter={[16, 12]} align="middle">
            <Col flex="auto">
              <Text type="secondary" style={{ fontSize: 11 }}>ผู้เสนอ</Text>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{winner.buyer}</div>
              <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>{winner.bidId}</Text>
            </Col>
            <Col>
              <Text type="secondary" style={{ fontSize: 11 }}>ราคาผู้ชนะ</Text>
              <div style={{ fontWeight: 700, fontSize: 22, color: '#1a7c3e', lineHeight: 1.1 }}>
                {winner.price.toFixed(2)}
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 400, marginLeft: 4 }}>฿/กก.</Text>
              </div>
            </Col>
            <Col>
              <Text type="secondary" style={{ fontSize: 11 }}>มูลค่ารวม</Text>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {(winner.price * lot.weight).toLocaleString()}
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 400, marginLeft: 4 }}>฿</Text>
              </div>
            </Col>
          </Row>
        </div>
      )}

      <Text type="secondary" style={{ fontSize: 12 }}>
        มีผู้เข้าร่วมประมูลทั้งหมด <strong>{bids.length}</strong> ราย
        {' '}— แสดงเฉพาะผู้ชนะ (อันดับอื่นจะปรากฏในหน้ารายละเอียดผลการประมูล)
      </Text>
    </>
  );
}
