'use client';

import { Space, Tag, Tooltip, Typography } from 'antd';
import {
  ExperimentOutlined, CalendarOutlined, InboxOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { TappingRange } from '@/shared/types';
import {
  formatTappingRange, formatReceivedDate, tappingDayCount,
  daysSinceTapping, isFreshRubber,
} from '@/shared/utils/tapping-format';

const { Text } = Typography;

export interface TappingInfoProps {
  rubberType:    string;
  tappingDate?:  TappingRange;
  receivedDate?: string;
  drc?:          number;
  /** 'compact' for board cards, 'detailed' for modals and detail pages. */
  variant?:      'compact' | 'detailed';
}

/** Renders ⬇️ together — they cluster naturally in every "lot info" surface.
 *  - Tapping date (single day or range with day count badge)
 *  - Received date (with วันนี้/เมื่อวาน hint)
 *  - DRC % for latex
 *  - "Same-day auction" warning for fresh latex
 */
export default function TappingInfo({
  rubberType, tappingDate, receivedDate, drc, variant = 'compact',
}: TappingInfoProps) {
  const fresh    = isFreshRubber(rubberType);
  const dayCount = tappingDayCount(tappingDate);
  const ageDays  = daysSinceTapping(tappingDate);

  // Ages > 7 days for latex is suspect (it has to be sold same-day);
  // for sheet/cup-lump 7+ days is fine. Color the tag accordingly.
  const ageColor = ageDays < 0 ? 'default'
                  : fresh ? (ageDays === 0 ? 'success' : 'error')
                  : (ageDays > 14 ? 'warning' : 'default');

  if (variant === 'compact') {
    return (
      <Space size={4} wrap style={{ fontSize: 11 }}>
        {tappingDate && (
          <Tooltip title={`วันที่เก็บยาง${dayCount > 1 ? ` (${dayCount} วัน)` : ''}`}>
            <Tag icon={<CalendarOutlined />} color={ageColor} style={{ margin: 0, fontSize: 11 }}>
              เก็บ {formatTappingRange(tappingDate)}
              {dayCount > 1 && <span style={{ marginLeft: 4, opacity: 0.7 }}>· {dayCount} วัน</span>}
            </Tag>
          </Tooltip>
        )}
        {drc !== undefined && (
          <Tooltip title="Dry Rubber Content — % เนื้อยางแห้ง">
            <Tag icon={<ExperimentOutlined />} color="blue" style={{ margin: 0, fontSize: 11 }}>
              DRC {drc}%
            </Tag>
          </Tooltip>
        )}
        {fresh && ageDays === 0 && (
          <Tag icon={<WarningOutlined />} color="warning" style={{ margin: 0, fontSize: 11 }}>
            ประมูลภายในวันนี้
          </Tag>
        )}
      </Space>
    );
  }

  // detailed
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {tappingDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <CalendarOutlined style={{ color: '#1a7c3e' }} />
          <Text type="secondary" style={{ fontSize: 12, minWidth: 90 }}>วันที่เก็บยาง:</Text>
          <Text strong>{formatTappingRange(tappingDate)}</Text>
          {dayCount > 1 && (
            <Tag style={{ margin: 0, fontSize: 11 }}>รวม {dayCount} วัน</Tag>
          )}
        </div>
      )}
      {receivedDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <InboxOutlined style={{ color: '#1677ff' }} />
          <Text type="secondary" style={{ fontSize: 12, minWidth: 90 }}>วันที่รับยาง:</Text>
          <Text strong>{formatReceivedDate(receivedDate)}</Text>
        </div>
      )}
      {drc !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <ExperimentOutlined style={{ color: '#722ed1' }} />
          <Text type="secondary" style={{ fontSize: 12, minWidth: 90 }}>DRC:</Text>
          <Text strong>{drc}%</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>(Dry Rubber Content)</Text>
        </div>
      )}
      {fresh && tappingDate && (
        <div
          style={{
            marginTop: 4, padding: '6px 10px', borderRadius: 6,
            background: ageDays === 0 ? '#fffbe6' : '#fff1f0',
            border: `1px solid ${ageDays === 0 ? '#ffe58f' : '#ffa39e'}`,
            fontSize: 12, color: ageDays === 0 ? '#874d00' : '#a8071a',
          }}
        >
          <WarningOutlined style={{ marginRight: 6 }} />
          {ageDays === 0
            ? 'น้ำยางสดวันนี้ — ต้องประมูลและรับมอบภายในวันเดียว เพื่อรักษาคุณภาพ'
            : `น้ำยางถูกเก็บมาแล้ว ${ageDays} วัน — คุณภาพอาจลดลง โปรดตรวจสอบก่อนเสนอราคา`}
        </div>
      )}
    </div>
  );
}
