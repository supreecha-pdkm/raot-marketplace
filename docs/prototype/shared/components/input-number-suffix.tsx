'use client';

import { CSSProperties, ReactNode } from 'react';
import { InputNumber, Space } from 'antd';
import type { InputNumberProps } from 'antd';

/**
 * antd 6 deprecated `InputNumber.addonAfter` in favor of `Space.Compact`.
 * This wrapper preserves the original visual (text suffix box on the right)
 * with a one-line migration: replace `<InputNumber addonAfter="x">` with
 * `<InputNumberSuffix suffix="x">`.
 */
type Props = Omit<InputNumberProps, 'addonAfter' | 'addonBefore'> & {
  suffix: ReactNode;
  /** Width applied to the wrapper Space.Compact. Defaults to 100% so the
   *  control fills its parent like the old addonAfter behavior. */
  style?: CSSProperties;
};

const SUFFIX_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0 11px',
  background: 'rgba(0, 0, 0, 0.02)',
  border: '1px solid #d9d9d9',
  borderInlineStart: 0,
  borderStartStartRadius: 0,
  borderEndStartRadius: 0,
  borderStartEndRadius: 6,
  borderEndEndRadius: 6,
  color: 'rgba(0, 0, 0, 0.88)',
  fontSize: 14,
  whiteSpace: 'nowrap',
};

export default function InputNumberSuffix({ suffix, style, ...rest }: Props) {
  return (
    <Space.Compact style={{ display: 'flex', width: '100%', ...style }}>
      <InputNumber {...rest} style={{ flex: 1, minWidth: 0 }} />
      <span style={SUFFIX_STYLE}>{suffix}</span>
    </Space.Compact>
  );
}
