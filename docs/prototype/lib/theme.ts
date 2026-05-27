import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

export const antdTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  cssVar: { key: 'raot' },            // Ant Design CSS-variable mode
  token: {
    /* ── Brand ─────────────────────────────── */
    colorPrimary:   '#1a7c3e',
    colorSuccess:   '#52c41a',
    colorWarning:   '#fa8c16',
    colorError:     '#ff4d4f',
    colorInfo:      '#1677ff',

    /* ── Surface ────────────────────────────── */
    colorBgLayout:    '#f5f7fa',
    colorBgContainer: '#ffffff',
    colorBgElevated:  '#ffffff',
    colorBgSpotlight: 'rgba(0,0,0,0.85)',

    /* ── Text ───────────────────────────────── */
    colorText:          '#1a1a2e',
    colorTextSecondary: '#595959',
    colorTextTertiary:  '#8c8c8c',
    colorTextQuaternary:'#bfbfbf',

    /* ── Border ─────────────────────────────── */
    colorBorder:       '#e8e8e8',
    colorBorderSecondary: '#f0f0f0',

    /* ── Shape ──────────────────────────────── */
    borderRadius:   8,
    borderRadiusSM: 4,
    borderRadiusLG: 12,
    borderRadiusOuter: 16,

    /* ── Typography ─────────────────────────── */
    fontFamily: "'Sarabun', sans-serif",
    fontSize:   14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    fontSizeXL: 20,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,
    lineHeight:    1.6,
    lineHeightSM:  1.4,
    lineHeightLG:  1.8,

    /* ── Spacing ────────────────────────────── */
    sizeXXS:  4,
    sizeXS:   8,
    sizeSM:   12,
    size:     16,
    sizeMD:   20,
    sizeLG:   24,
    sizeXL:   32,
    sizeXXL:  48,

    /* ── Motion ─────────────────────────────── */
    motionDurationFast:  '0.1s',
    motionDurationMid:   '0.2s',
    motionDurationSlow:  '0.3s',

    /* ── Shadow ─────────────────────────────── */
    boxShadow:     '0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
    boxShadowSecondary: '0 6px 16px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.04)',
  },

  components: {
    Layout: {
      siderBg:    '#0f3d22',
      triggerBg:  '#0a2a17',
      headerBg:   '#ffffff',
      headerPadding: '0 24px',
      headerHeight: 56,
    },
    Menu: {
      darkItemBg:          '#0f3d22',
      darkSubMenuItemBg:   '#0a2a17',
      darkItemSelectedBg:  '#1a7c3e',
      darkItemHoverBg:     'rgba(255,255,255,0.08)',
      darkItemColor:       'rgba(255,255,255,0.75)',
      darkItemSelectedColor: '#ffffff',
      darkGroupTitleColor: 'rgba(255,255,255,0.35)',
      itemHeight:          40,
      iconSize:            16,
      iconMarginInlineEnd: 10,
    },
    Card: {
      borderRadiusLG: 12,
      paddingLG:      20,
      headerFontSize: 14,
      headerFontSizeSM: 12,
    },
    Button: {
      borderRadius:    8,
      controlHeight:   32,
      controlHeightSM: 24,
      controlHeightLG: 40,
      paddingInline:   16,
      boxShadow:       'none',
      primaryShadow:   'none',
      dangerShadow:    'none',
      defaultShadow:   'none',
    },
    Table: {
      borderRadius:       8,
      headerBg:           '#fafafa',
      headerColor:        '#595959',
      headerSortActiveBg: '#f0f0f0',
      rowHoverBg:         '#f6fff9',
      cellPaddingBlock:   10,
      cellPaddingInline:  12,
    },
    Input: {
      borderRadius:    8,
      controlHeight:   36,
      controlHeightLG: 44,
    },
    Select: {
      borderRadius:    8,
      controlHeight:   32,
    },
    Modal: {
      borderRadiusLG: 12,
      paddingLG:      28,
    },
    Form: {
      labelFontSize:  13,
      itemMarginBottom: 16,
    },
    Tabs: {
      inkBarColor:    '#1a7c3e',
      itemActiveColor: '#1a7c3e',
      itemSelectedColor: '#1a7c3e',
    },
    Badge: {
      colorBgContainer: '#ffffff',
    },
    Tag: {
      borderRadiusSM: 4,
    },
    Statistic: {
      contentFontSize: 22,
    },
    Breadcrumb: {
      fontSize: 13,
      linkColor: '#595959',
      linkHoverColor: '#1a7c3e',
      lastItemColor: '#1a1a2e',
      separatorColor: '#bfbfbf',
    },
    Divider: {
      colorSplit: '#f0f0f0',
    },
    Avatar: {
      borderRadius: 8,
    },
    Tooltip: {
      borderRadius: 6,
      fontSize: 12,
    },
  },
};

export const ROLE_THEME_COLORS: Record<string, string> = {
  buyer:   '#1677ff',
  seller:  '#1a7c3e',
  officer: '#fa8c16',
  master:  '#722ed1',
};
