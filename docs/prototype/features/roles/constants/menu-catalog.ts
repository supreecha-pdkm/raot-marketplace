/** Source of truth for every menu the officer side can grant via a Role.
 *  Mirrors the legacy ROLE_MENUS dictionary collapsed into a single catalog —
 *  any menu listed here can be checked in the Role form to grant access. */
export interface MenuItem {
  key: string;
  label: string;
}

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

/** Always-on landing page. Granted implicitly to every officer regardless of
 *  Role permissions so they have somewhere to land. Not a permission to
 *  toggle — kept out of the catalog and out of ALL_MENU_KEYS. */
export const DASHBOARD_KEY = 'dashboard';

/** Master-only menu keys — present in the catalog so master always sees them
 *  in the sidebar, but hidden from the Role form (cannot be granted to a Role).
 *
 *  Currently empty: both `roles` and `officers` are assignable so a non-Master
 *  officer can be granted those permissions and act as a Role/Officer admin.
 *  Keep the Set mechanism in place — future genuinely-master-only menus would
 *  list their key here. */
export const MASTER_ONLY_KEYS: ReadonlySet<string> = new Set<string>();

export const OFFICER_MENU_CATALOG: MenuGroup[] = [
  {
    label: 'บริหารจัดการ',
    items: [
      { key: 'roles',            label: 'จัดการ Role & Permission' },
      { key: 'officers',         label: 'จัดการเจ้าหน้าที่' },
      { key: 'auction-rounds',   label: 'ตั้งค่ารอบประมูล' },
      { key: 'payment-settings', label: 'ตั้งค่าการชำระเงิน' },
      { key: 'opening-price',    label: 'ราคาเปิดตลาด' },
    ],
  },
  {
    label: 'ข้อมูลหลัก',
    items: [
      { key: 'master-panels', label: 'ข้อมูลแผง (Master)' },
    ],
  },
  {
    label: 'การจัดการยาง',
    items: [
      { key: 'lot-registration',     label: 'ลงทะเบียนยาง · เข้า' },
      { key: 'lot-registration-out', label: 'ลงทะเบียนยาง · ออก' },
      { key: 'weighing',             label: 'ชั่ง / คัดคุณภาพ' },
      { key: 'panels',               label: 'จัดการแผง' },
    ],
  },
  {
    label: 'การประมูล',
    items: [
      { key: 'auction-control',  label: 'ควบคุมการประมูล' },
      { key: 'announcements',    label: 'ประกาศผู้ชนะ' },
      { key: 'network-auctions', label: 'อนุมัติเปิดประมูล ณ เครือข่าย' },
      { key: 'forward',          label: 'ตลาดล่วงหน้า' },
    ],
  },
  {
    label: 'การซื้อขายและสัญญา',
    items: [
      { key: 'negotiated', label: 'เจรจาต่อรอง (แทนผู้ซื้อ)' },
      { key: 'contracts',  label: 'สัญญาซื้อขาย' },
      { key: 'delivery',   label: 'ส่งมอบยาง' },
    ],
  },
  {
    label: 'การเงิน',
    items: [
      { key: 'payments', label: 'ชำระเงิน' },
      { key: 'workflow', label: 'ภาพรวม Workflow (4 Phase)' },
    ],
  },
  {
    label: 'การอนุมัติ',
    items: [
      { key: 'approvals',     label: 'อนุมัติผู้ซื้อ/ขาย ลำดับที่ 1' },
      { key: 'approval',      label: 'อนุมัติผู้ซื้อ/ขาย ลำดับที่ 2' },
      { key: 'approve-price', label: 'อนุมัติราคาเปิดตลาด' },
    ],
  },
  {
    label: 'รายงาน',
    items: [
      { key: 'reports', label: 'รายงาน' },
    ],
  },
];

/** Flat list of every menu key in the catalog. Used by master permission
 *  resolution and by the Role form to validate selections. */
export const ALL_MENU_KEYS: string[] = OFFICER_MENU_CATALOG.flatMap((g) =>
  g.items.map((i) => i.key),
);

/** Subset of catalog keys that may be selected when authoring a Role.
 *  Excludes master-only keys (e.g. `roles`) since those should never be
 *  granted to non-master officers. */
export const ASSIGNABLE_MENU_KEYS: string[] = ALL_MENU_KEYS.filter(
  (k) => !MASTER_ONLY_KEYS.has(k),
);

/** Catalog filtered to the assignable subset — drives the Role form UI. */
export const ASSIGNABLE_MENU_CATALOG: MenuGroup[] = OFFICER_MENU_CATALOG
  .map((g) => ({
    ...g,
    items: g.items.filter((i) => !MASTER_ONLY_KEYS.has(i.key)),
  }))
  .filter((g) => g.items.length > 0);

/** Quick label lookup by key — used by toast/UI surfaces that need the
 *  human-readable name of a permission. */
export const MENU_LABEL_BY_KEY: Record<string, string> = OFFICER_MENU_CATALOG
  .flatMap((g) => g.items)
  .reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = item.label;
    return acc;
  }, {});
