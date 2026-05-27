import type { Icon } from "@phosphor-icons/react";
import {
  CalendarIcon,
  CarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  FileTextIcon,
  HouseIcon,
  QrCodeIcon,
  SwapIcon,
  TrophyIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";

import type { Role } from "@/lib/casl";

export type NavLeaf = {
  key: string;
  label: string;
  icon: Icon;
  href: string;
};

export type NavGroup = {
  key: string;
  groupLabel: string;
  items: NavLeaf[];
};

export type NavEntry = NavLeaf | NavGroup;

const buyerNav: NavEntry[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: HouseIcon,
    href: "/buyer/dashboard",
  },
  {
    key: "trade",
    groupLabel: "การซื้อขาย",
    items: [
      {
        key: "auction",
        label: "ประมูล (Auction)",
        icon: TrophyIcon,
        href: "/buyer/auction",
      },
      {
        key: "negotiated",
        label: "ตกลงราคา",
        icon: SwapIcon,
        href: "/buyer/negotiated",
      },
      {
        key: "bid-ask",
        label: "เสนอซื้อ/ขาย (Bid/Ask)",
        icon: ChartBarIcon,
        href: "/buyer/bid-ask",
      },
      {
        key: "forward",
        label: "ตลาดล่วงหน้า",
        icon: CalendarIcon,
        href: "/buyer/forward",
      },
    ],
  },
  {
    key: "finance",
    groupLabel: "สัญญาและการเงิน",
    items: [
      {
        key: "contracts",
        label: "สัญญาซื้อขาย",
        icon: FileTextIcon,
        href: "/buyer/contracts",
      },
      {
        key: "payment",
        label: "ชำระเงิน",
        icon: CurrencyDollarIcon,
        href: "/buyer/payment",
      },
      {
        key: "delivery",
        label: "รับมอบยาง",
        icon: CarIcon,
        href: "/buyer/delivery",
      },
    ],
  },
  // {
  //   key: "account",
  //   groupLabel: "บัญชี",
  //   items: [
  //     {
  //       key: "profile",
  //       label: "ข้อมูลส่วนตัว",
  //       icon: UserIcon,
  //       href: "/buyer/profile",
  //     },
  //   ],
  // },
];

const sellerNav: NavEntry[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: HouseIcon,
    href: "/seller/dashboard",
  },
  {
    key: "trade",
    groupLabel: "การซื้อขาย",
    items: [
      {
        key: "negotiated",
        label: "ตกลงราคา",
        icon: SwapIcon,
        href: "/seller/negotiated",
      },
      {
        key: "bid-ask",
        label: "เสนอซื้อ/ขาย (Bid/Ask)",
        icon: ChartBarIcon,
        href: "/seller/bid-ask",
      },
      {
        key: "forward",
        label: "ตลาดล่วงหน้า",
        icon: CalendarIcon,
        href: "/seller/forward",
      },
    ],
  },
  {
    key: "sell",
    groupLabel: "การขาย",
    items: [
      {
        key: "qr-code",
        label: "Dynamic QR Code",
        icon: QrCodeIcon,
        href: "/seller/qr-code",
      },
      {
        key: "transactions",
        label: "ประวัติธุรกรรม",
        icon: SwapIcon,
        href: "/seller/transactions",
      },
      {
        key: "quota",
        label: "ปริมาณผลผลิต (Quota)",
        icon: ChartBarIcon,
        href: "/seller/quota",
      },
      {
        key: "agreements",
        label: "ข้อตกลงซื้อขาย",
        icon: FileTextIcon,
        href: "/seller/agreements",
      },
      {
        key: "contracts",
        label: "สัญญาซื้อขาย",
        icon: FileTextIcon,
        href: "/seller/contracts",
      },
    ],
  },
  {
    key: "account",
    groupLabel: "บัญชี",
    items: [
      {
        key: "profile",
        label: "ข้อมูลส่วนตัว",
        icon: UserIcon,
        href: "/seller/profile",
      },
    ],
  },
];

export function getNavForRole(role: Role): NavEntry[] {
  return role === "buyer" ? buyerNav : sellerNav;
}

export const ROLE_LABEL: Record<Role, string> = {
  buyer: "ผู้ซื้อ",
  seller: "ผู้ขาย",
};

export const isNavGroup = (entry: NavEntry): entry is NavGroup =>
  "groupLabel" in entry;
