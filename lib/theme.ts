import { theme as antdTheme, type ThemeConfig } from "antd";

const theme: ThemeConfig = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: "#2e7d32",

    colorSuccess: "#16a34a",
    colorWarning: "#d97706",
    colorError: "#dc2626",
    colorInfo: "#0284c7",

    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBgLayout: "#f8fafc",

    colorText: "#0f172a",
    colorTextSecondary: "#475569",
    colorTextTertiary: "#64748b",
    colorTextQuaternary: "#94a3b8",

    colorBorder: "#e2e8f0",
    colorBorderSecondary: "#f1f5f9",

    colorFill: "#f1f5f9",
    colorFillSecondary: "#f8fafc",

    fontFamily: "Sarabun, sans-serif",
    fontSize: 16,
    lineHeight: 1.5,

    borderRadius: 8,
    controlHeight: 40,

    boxShadow:
      "0 1px 3px 0 rgb(0 0 0 / 0.10), 0 1px 2px -1px rgb(0 0 0 / 0.10)",
    boxShadowSecondary: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  },
  components: {
    Button: {
      colorPrimaryHover: "#1b5e20",
      colorPrimaryActive: "#145a18",
      borderRadius: 8,
    },
    Layout: {
      siderBg: "#0a2e0b",
      headerBg: "#ffffff",
      headerHeight: 64,
      bodyBg: "#f8fafc",
    },
    Menu: {
      itemSelectedBg: "#e8f5e9",
      itemSelectedColor: "#1b5e20",
      darkItemBg: "transparent",
      darkSubMenuItemBg: "transparent",
      darkItemColor: "#ffffff",
      darkItemHoverBg: "rgba(255,255,255,0.08)",
      darkItemHoverColor: "#ffffff",
      darkItemSelectedBg: "#2e7d32",
      darkItemSelectedColor: "#ffffff",
      darkGroupTitleColor: "rgba(165,214,167,0.7)",
    },
    Modal: {
      borderRadiusLG: 24,
    },
    Card: {
      borderRadiusLG: 16,
    },
    Tooltip: {
      fontSize: 12,
      controlHeight: 28,
    },
  },
};

export default theme;
