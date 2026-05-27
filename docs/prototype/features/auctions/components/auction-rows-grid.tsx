'use client';

import { Row, Col, Tag, Typography } from 'antd';
import type { RoundPhase, BoardViewMode } from '../utils/auction-constants';
import type { RubberRow } from '../services/auction-mock';
import type { RoundOffer } from '../hooks/use-offer-flow';
import WeightCard, { type OfficerStats } from './weight-card';

const { Text } = Typography;

interface RowsProps {
  rows:              RubberRow[];
  viewMode:          BoardViewMode;
  bottomMargin?:     boolean;
  rowPhase:          (row: RubberRow) => RoundPhase;
  findMyOffer?:      (rowKey: string) => RoundOffer | undefined;
  onOffer?:          (row: RubberRow) => void;
  viewer?:           'buyer' | 'officer';
  officerStatsByRow?: Record<string, OfficerStats>;
  onInspect?:        (row: RubberRow) => void;
}

function WeightCardRows({
  rows, viewMode, bottomMargin = false,
  rowPhase, findMyOffer, onOffer,
  viewer, officerStatsByRow, onInspect,
}: RowsProps) {
  const noOp = () => {};
  if (viewMode === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: bottomMargin ? 20 : 0 }}>
        {rows.map(row => (
          <WeightCard
            key={row.key}
            row={row}
            myOffer={findMyOffer?.(row.key)}
            onOffer={onOffer ?? noOp}
            roundPhase={rowPhase(row)}
            viewMode="list"
            viewer={viewer}
            officerStats={officerStatsByRow?.[row.key]}
            onInspect={onInspect}
          />
        ))}
      </div>
    );
  }
  return (
    <Row gutter={[12, 12]} style={{ marginBottom: bottomMargin ? 20 : 0 }}>
      {rows.map(row => (
        <Col key={row.key} xs={24} sm={12} md={8} lg={6}>
          <WeightCard
            row={row}
            myOffer={findMyOffer?.(row.key)}
            onOffer={onOffer ?? noOp}
            roundPhase={rowPhase(row)}
            viewer={viewer}
            officerStats={officerStatsByRow?.[row.key]}
            onInspect={onInspect}
          />
        </Col>
      ))}
    </Row>
  );
}

export interface AuctionRowsGridProps extends Omit<RowsProps, 'rows' | 'bottomMargin'> {
  displayedRows: RubberRow[];
}

/**
 * Renders all visible auction rows split into EUDR / Non-Green sections.
 * Used by both the buyer board (BoardTab) and the officer control board
 * (AuctionControlShell). Pass `viewer="officer"` + `officerStatsByRow` for
 * the officer view; omit for the default buyer view.
 */
export default function AuctionRowsGrid({
  displayedRows,
  ...rest
}: AuctionRowsGridProps) {
  const eudrRows    = displayedRows.filter(r => r.isEudr);
  const nonEudrRows = displayedRows.filter(r => !r.isEudr);

  if (displayedRows.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: '#8c8c8c' }}>
        ไม่มียางที่ตรงกับตัวกรอง
      </div>
    );
  }

  return (
    <>
      {eudrRows.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="badge-eudr">EUDR</span>
            <Text style={{ fontWeight: 600, fontSize: 13 }}>ยางมาตรฐาน EUDR</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>({eudrRows.length} รายการ)</Text>
          </div>
          <WeightCardRows rows={eudrRows} {...rest} bottomMargin />
        </>
      )}
      {nonEudrRows.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Tag style={{ margin: 0, fontSize: 11 }}>Non Green</Tag>
            <Text style={{ fontWeight: 600, fontSize: 13 }}>ยางทั่วไป (Non Green)</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>({nonEudrRows.length} รายการ)</Text>
          </div>
          <WeightCardRows rows={nonEudrRows} {...rest} />
        </>
      )}
    </>
  );
}
