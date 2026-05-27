import {
  DashboardOutlined, UserOutlined, LogoutOutlined,
  BarChartOutlined, FileTextOutlined,
  DollarOutlined, CarOutlined, TeamOutlined,
  QrcodeOutlined, TrophyOutlined, SwapOutlined, CalendarOutlined,
  SafetyOutlined, AuditOutlined, CheckCircleOutlined, BankOutlined,
  DatabaseOutlined, ApartmentOutlined,
  AppstoreOutlined, NotificationOutlined, KeyOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

/** Single source of truth for menu→icon mapping. Both the sidebar and the
 *  Quick Access dashboard read from this map so adding a new menu only
 *  requires touching this file + the catalog + page label. */
export const MENU_ICON_BY_KEY: Record<string, ReactNode> = {
  // Implicit
  dashboard:                <DashboardOutlined />,
  // Management
  roles:                    <KeyOutlined />,
  officers:                 <TeamOutlined />,
  'auction-rounds':         <TrophyOutlined />,
  'payment-settings':       <BankOutlined />,
  'opening-price':          <BarChartOutlined />,
  // Master data
  'master-panels':          <DatabaseOutlined />,
  // Lot management
  'lot-registration':       <QrcodeOutlined />,
  'lot-registration-out':   <LogoutOutlined />,
  weighing:                 <SafetyOutlined />,
  panels:                   <TeamOutlined />,
  // Auction
  'auction-control':        <TrophyOutlined />,
  announcements:            <NotificationOutlined />,
  'network-auctions':       <ApartmentOutlined />,
  // Trading + contracts
  negotiated:               <SwapOutlined />,
  forward:                  <CalendarOutlined />,
  contracts:                <FileTextOutlined />,
  approvals:                <CheckCircleOutlined />,
  delivery:                 <CarOutlined />,
  // Finance
  payments:                 <DollarOutlined />,
  workflow:                 <AppstoreOutlined />,
  // Approvals (director)
  'approve-price':          <CheckCircleOutlined />,
  approval:                 <UserOutlined />,
  // Reports
  reports:                  <AuditOutlined />,
};

/** Lookup with a generic fallback icon so an unknown key never breaks render. */
export function getMenuIcon(key: string): ReactNode {
  return MENU_ICON_BY_KEY[key] ?? <AppstoreOutlined />;
}
