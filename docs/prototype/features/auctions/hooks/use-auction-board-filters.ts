'use client';

import { useCallback, useMemo, useState } from 'react';
import { RUBBER_ROWS } from '../services/auction-mock';
import {
  ALL_GRADES,
  type AuctionType,
  type BoardViewMode,
} from '../utils/auction-constants';

export interface AuctionBoardFilters {
  filterAuctionType:    'all' | AuctionType;
  setFilterAuctionType: (v: 'all' | AuctionType) => void;
  filterType:           string;
  handleTypeChange:     (v: string) => void;
  filterGrade:          string;
  setFilterGrade:       (v: string) => void;
  filterEudr:           'all' | 'green' | 'non-green';
  setFilterEudr:        (v: 'all' | 'green' | 'non-green') => void;
  viewMode:             BoardViewMode;
  setViewMode:          (v: BoardViewMode) => void;
  resetFilters:         () => void;
  gradeOptions:         { label: string; value: string }[];
}

/**
 * Shared filter state for the buyer board and the officer control board.
 * Pass `defaultViewMode` to start in 'grid' (buyer) or 'list' (officer).
 */
export function useAuctionBoardFilters(
  defaultViewMode: BoardViewMode = 'grid',
): AuctionBoardFilters {
  const [filterAuctionType, setFilterAuctionType] = useState<'all' | AuctionType>('all');
  const [filterType,        setFilterType]        = useState<string>('all');
  const [filterGrade,       setFilterGrade]       = useState<string>(ALL_GRADES);
  const [filterEudr,        setFilterEudr]        = useState<'all' | 'green' | 'non-green'>('all');
  const [viewMode,          setViewMode]          = useState<BoardViewMode>(defaultViewMode);

  const resetFilters = useCallback(() => {
    setFilterAuctionType('all');
    setFilterType('all');
    setFilterGrade(ALL_GRADES);
    setFilterEudr('all');
  }, []);

  // Reset grade when type changes so the selected grade stays valid.
  const handleTypeChange = useCallback((value: string) => {
    setFilterType(value);
    setFilterGrade(ALL_GRADES);
  }, []);

  const gradeOptions = useMemo(() => {
    const rows = filterType === 'all'
      ? RUBBER_ROWS
      : RUBBER_ROWS.filter(r => r.typeKey === filterType);
    return [
      { label: ALL_GRADES, value: ALL_GRADES },
      ...Array.from(new Set(rows.map(r => r.grade))).map(grade => ({
        label: grade,
        value: grade,
      })),
    ];
  }, [filterType]);

  return {
    filterAuctionType, setFilterAuctionType,
    filterType, handleTypeChange,
    filterGrade, setFilterGrade,
    filterEudr, setFilterEudr,
    viewMode, setViewMode,
    resetFilters,
    gradeOptions,
  };
}
