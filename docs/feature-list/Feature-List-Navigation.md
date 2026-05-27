# Feature List — Sidebar & Topbar (Navigation Shell)

> **Project:** RAOT Green Rubber — ระบบตรวจสอบย้อนกลับผลผลิตยางพารา
> **Epic:** NAV — Application Shell (Sidebar, Topbar, Role Layout)
> **Source code:**
> - Sidebar: `src/shared/components/app-sidebar.tsx`
> - Topbar/Header: `src/shared/components/app-header.tsx`
> - Layout shell: `src/shared/components/role-layout.tsx`
> - Text scale: `src/shared/components/text-scale.tsx`
> **Format:** Detail + Condition (BA spec)
> **Last updated:** 2026-05-15

---

## Epic Overview

Navigation shell ของ RAOT แบ่งเป็น **3 ส่วน** ที่ทำงานร่วมกัน:

```
┌─────────────────────────────────────────────────────────────┐
│  AppHeader (Topbar) — sticky, 56px height                  │
│  [☰] Breadcrumb            [TH] [A+] [🔔] [Avatar ▼]       │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│  Sidebar │         Page Content                             │
│  (240px  │         (children — pages render here)           │
│  หรือ 72) │                                                  │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

ใช้กับทุก dashboard route ผ่าน `RoleLayout` ใน `src/app/(dashboard)/{role}/layout.tsx`

---

## Feature List Summary

| Feature ID | ชื่อ Feature | Component | Priority | Phase |
|---|---|---|---|---|
| NAV-1.1 | Sidebar Layout & Brand Lockup | Sidebar | High | 1 |
| NAV-1.2 | Role-based Menu (7 roles) | Sidebar | High | 1 |
| NAV-1.3 | Permission-based Menu Filtering | Sidebar | High | 1 |
| NAV-1.4 | Collapse / Expand (Desktop) | Sidebar | Medium | 1 |
| NAV-1.5 | Mobile Drawer | Sidebar | High | 1 |
| NAV-1.6 | Logout Action (Sidebar Footer) | Sidebar | High | 1 |
| NAV-2.1 | Topbar Layout & Sidebar Toggle | Topbar | High | 1 |
| NAV-2.2 | Breadcrumb Navigation | Topbar | Medium | 1 |
| NAV-2.3 | Notification Dropdown | Topbar | Medium | 1 |
| NAV-2.4 | User Profile Dropdown | Topbar | High | 1 |
| NAV-2.5 | Text Scale Switcher (Accessibility) | Topbar | Medium | 1 |
| NAV-2.6 | Language Switcher | Topbar | Low | 2 |
| NAV-2.7 | Mobile Responsive Topbar | Topbar | High | 1 |
| NAV-3.1 | Session Guard & Auth Check | RoleLayout | High | 1 |
| NAV-3.2 | Role Guard & Redirect | RoleLayout | High | 1 |
| NAV-3.3 | Permission Route Guard | RoleLayout | High | 1 |
| NAV-3.4 | Cross-tab Session Sync (Suspend/Revoke) | RoleLayout | High | 1 |
| NAV-3.5 | Responsive Breakpoint Detection | RoleLayout | High | 1 |

---

## NAV-1.1 — Sidebar Layout & Brand Lockup

**Component:** `AppSidebar` (`SidebarBody`)
**Source:** `src/shared/components/app-sidebar.tsx`

### Detail

1. แสดง Sidebar ด้านซ้ายของหน้าจอ — Theme dark สีเขียวเข้ม background `#0f3d22`
2. แสดง **Brand Lockup** ส่วนบน (height 56px, border-bottom สีจาง):
   - **Logo** — รูปวงกลม `/logo.png` ขนาด 32px (พื้น `#fff`, padding 2px, border-radius 50%)
   - **Brand text** (เฉพาะ expanded mode):
     - บรรทัด 1 — "RAOT" (สีขาว, font-weight 700, size 15px)
     - บรรทัด 2 — "TRACEABILITY" (rgba 0.45, size 10px, letter-spacing 0.5px)
3. ส่วนกลาง (flex: 1) — แสดง Navigation Menu (ดู NAV-1.2)
4. ส่วนล่าง (border-top สีจาง) — แสดงปุ่ม **"ออกจากระบบ"** (ดู NAV-1.6)
5. Desktop mode: `position: fixed`, top:0, left:0, height: 100vh, zIndex: 100
6. Width: **240px** (expanded) / **72px** (collapsed) / **260px** (Drawer mobile)
7. Background color คงที่ `#0f3d22` ทุก mode

### Condition

1. **Theme** — AntD `theme="dark"` บน Menu ทุก instance ใน sidebar
2. **Brand text แสดงเฉพาะ expanded** — เมื่อ `showLabels === true` (`isDrawer || !collapsed`)
3. **Brand padding** — `0 20px` (expanded) / `0` (collapsed)
4. **Brand alignment** — `flex-start` (expanded) / `center` (collapsed)
5. **Logo คงที่ทุก mode** — ไม่ซ่อนแม้ collapsed
6. **z-index 100** — สูงพอที่จะ overlap page content แต่ต่ำกว่า Drawer (1100)

**Effect to / Relate to:**
- **NAV-1.2** (Menu rendering)
- **NAV-1.4** (Collapse mode width)
- **NAV-1.5** (Mobile drawer width)

---

## NAV-1.2 — Role-based Menu (7 roles)

**Function:** `getMenuItems(role, permissions)` ใน `app-sidebar.tsx`

### Detail

1. ระบบสร้าง menu items ตาม `user.role` — รองรับ **7 บทบาท**:

   **(a) Buyer (ผู้ซื้อ):**
   - Dashboard
   - **กลุ่ม "การซื้อขาย"** — ประมูล (Auction) / ตกลงราคา / เสนอซื้อ-ขาย (Bid/Ask) / ตลาดล่วงหน้า
   - **กลุ่ม "สัญญาและการเงิน"** — สัญญาซื้อขาย / ชำระเงิน / รับมอบยาง
   - **กลุ่ม "บัญชี"** — ข้อมูลส่วนตัว

   **(b) Seller (ผู้ขาย):**
   - Dashboard
   - **กลุ่ม "การซื้อขาย"** — ตกลงราคา / เสนอซื้อ-ขาย / ตลาดล่วงหน้า
   - **กลุ่ม "การขาย"** — Dynamic QR Code / ประวัติธุรกรรม / ปริมาณผลผลิต (Quota) / ข้อตกลงซื้อขาย / สัญญาซื้อขาย
   - **กลุ่ม "บัญชี"** — ข้อมูลส่วนตัว

   **(c) Admin (IT Admin):**
   - Dashboard
   - **กลุ่ม "บริหารจัดการ"** — จัดการเจ้าหน้าที่ / ตั้งค่าตลาด / ตั้งค่ารอบประมูล / ตั้งค่าการชำระเงิน / ราคาเปิดตลาด
   - **กลุ่ม "รายงาน"** — รายงานระบบ

   **(d) Auction Officer (เจ้าหน้าที่ประมูล):**
   - Dashboard
   - **กลุ่ม "ข้อมูลหลัก"** — ข้อมูลแผง (Master)
   - **กลุ่ม "การจัดการยาง"** — ลงทะเบียนยาง · เข้า / ลงทะเบียนยาง · ออก / ชั่ง · คัดคุณภาพ / จัดการแผง
   - **กลุ่ม "การประมูล"** — ควบคุมการประมูล / อนุมัติเปิดประมูล ณ เครือข่าย
   - **กลุ่ม "สัญญาและอื่นๆ"** — สัญญาซื้อขาย / **อนุมัติผู้ซื้อ/ขาย** / ส่งมอบยาง / รายงาน

   **(e) Finance Officer (เจ้าหน้าที่การเงิน):**
   - Dashboard
   - **กลุ่ม "การเงิน"** — ชำระเงิน / สร้างสัญญา
   - **กลุ่ม "รายงาน"** — รายงานการเงิน

   **(f) Market Director (ผู้อำนวยการตลาด):**
   - Dashboard
   - **กลุ่ม "การอนุมัติ"** — อนุมัติราคาเปิดตลาด / **อนุมัติผู้ซื้อ / ผู้ขาย**
   - **กลุ่ม "รายงาน"** — รายงานภาพรวมตลาด

   **(g) Staff (เจ้าหน้าที่):**
   - Dashboard
   - **กลุ่ม "การปฏิบัติงาน"** — ลงทะเบียนยาง / ชั่ง · คัดคุณภาพ / ส่งมอบยาง / ตลาดล่วงหน้า
   - **กลุ่ม "ตัวแทนผู้ซื้อ"** — เจรจาต่อรอง (แทนผู้ซื้อ)
   - **กลุ่ม "รายงาน"** — รายงาน

2. ทุก menu item มี **icon** (AntD icon เช่น DashboardOutlined, TrophyOutlined, SwapOutlined)
3. คลิก menu item → navigate ไป `${basePath}/${key}` โดย `basePath = /${role.replace('_', '-')}`
   - เช่น `auction_officer` + key `approvals` → `/auction-officer/approvals`
4. **Selected key** — derive จาก `pathname.split('/')[2] || 'dashboard'` → highlight item ปัจจุบัน

### Condition

1. **Role fallback** — ถ้า role ไม่ตรงกับ map ใด ๆ → return เฉพาะ `[dashboard]`
2. **Dashboard always available** — ทุก role มี Dashboard เป็น item แรก (ไม่อยู่ในกลุ่ม)
3. **Group structure** — ใช้ `type: 'group'` สำหรับ section header (ไม่คลิกได้ ไม่ navigate)
4. **Menu items typing** — `MenuItem = Required<MenuProps>['items'][number]` จาก AntD
5. **Inline indent** — 16px (ลดจาก default 24px ของ AntD เพื่อประหยัดพื้นที่)
6. **Font size** — 13px (เล็กกว่า default เพื่อให้ menu ยาวลงตัวในความสูง 100vh)
7. **Collapsed mode** — แสดงเฉพาะ icon (`inlineCollapsed={!isDrawer && collapsed}`) — label ซ่อน
8. **Drawer mode** — บังคับ expanded เสมอ (`inlineCollapsed={false}`)

**Effect to / Relate to:**
- **NAV-1.3** (Permission filter consumes this)
- **NAV-1.4** (Collapse mode renders icon-only)
- **NAV-1.5** (Drawer mode renders full menu)
- **AUTH-1.3** (role + permissions producer)
- **BO-Admin** (Officer Management อาจ override permissions)

---

## NAV-1.3 — Permission-based Menu Filtering

**Function:** `filterByPermissions(items, permissions)` ใน `app-sidebar.tsx`

### Detail

1. ระบบรับ `user.permissions: string[]` (จาก AUTH-1.3 — admin-created officer หรือ built-in override)
2. ถ้า `permissions` undefined หรือ empty → return full role menu (back-compat สำหรับ legacy users)
3. ถ้า `permissions` มี keys — filter menu items ตาม allow-list:
   - **Always include `dashboard`** — append เข้า set เสมอ (ผู้ใช้ต้องมีที่ landing)
   - **Group node** — recurse filter children; ถ้า empty → drop group ทั้งกลุ่ม
   - **Leaf with sub-menu** — recurse; ถ้า children empty → drop parent
   - **Leaf node** — check `permissions.has(key)` → keep หรือ drop
4. ผลลัพธ์ — Menu ที่ผ่าน filter ถูกส่งเข้า `<Menu items={...} />`

### Condition

1. **Allow-list pattern** — เฉพาะ key ที่อยู่ใน set ผ่าน; ไม่ใช่ block-list
2. **Dashboard immutable** — ถูก force include เสมอ ไม่ว่า user จะมีสิทธิ์อะไร
3. **Empty group dropped** — ถ้าทุก child ถูก strip — group header (label เช่น "การซื้อขาย") ก็ไม่แสดง
4. **Backwards-compat** — `permissions === undefined` หรือ `[]` ถือว่าไม่มี restriction → ใช้ full role menu
5. **Permission source priority** (จาก AUTH-1.3 `effectivePermissionsFor`):
   - Admin-created officer inline `permissions` field
   - Built-in user override map (`raot_officer_permission_overrides`)
   - undefined → full role menu
6. **Real-time update** — เมื่อ admin เปลี่ยน permissions ใน tab อื่น → storage event trigger `refreshSession()` → `setUser(newUser)` → sidebar re-render ด้วย permissions ใหม่ (ดู NAV-3.4)
7. **Route guard** — แค่ filter menu ไม่พอ — RoleLayout มี route guard เพิ่ม (NAV-3.3) กันกรณีผู้ใช้พิมพ์ URL ตรง

**Effect to / Relate to:**
- **NAV-1.2** (Filter input)
- **NAV-3.3** (Route guard ใช้ permissions เดียวกัน)
- **NAV-3.4** (Cross-tab sync อัปเดต permissions)
- **AUTH-1.3** (`effectivePermissionsFor` source)
- **BO-Admin** Officer permissions configuration

---

## NAV-1.4 — Collapse / Expand (Desktop)

**State:** `collapsed: boolean` ใน RoleLayout

### Detail

1. Sidebar รองรับ 2 mode บน Desktop:
   - **Expanded** — width 240px, แสดง label + icon
   - **Collapsed** — width 72px, แสดงเฉพาะ icon (label hover tooltip)
2. ผู้ใช้สลับ mode ได้ 2 ทาง:
   - กดปุ่ม toggle ใน **Topbar** (icon MenuFold/MenuUnfold — ดู NAV-2.1)
   - กดปุ่ม collapse ที่ AntD Sider ในตัว (`collapsible` prop)
3. เมื่อ collapsed:
   - Brand text "RAOT TRACEABILITY" ซ่อน (เหลือเฉพาะ logo)
   - Menu label ซ่อน (เฉพาะ icon ตามแนวตั้ง)
   - Logout label ซ่อน
4. Page content margin-left ปรับตามอัตโนมัติ:
   - Expanded → `marginLeft: 240px`
   - Collapsed → `marginLeft: 72px`
   - Transition `margin-left 0.2s ease`

### Condition

1. **AntD Sider** — `collapsible + collapsed + onCollapse + width=240 + collapsedWidth=72`
2. **State location** — `collapsed` state อยู่ที่ `RoleLayout` (parent) ส่งลง props ทั้ง sidebar และ header
3. **ไม่ persist** — refresh page reset เป็น expanded ทุกครั้ง (POC — production อาจเก็บใน localStorage)
4. **Mobile mode** — collapsed prop ถูก override โดย Drawer (ดู NAV-1.5)
5. **Sider position fixed** — content margin shift เพื่อหลีก sidebar
6. **Transition** — 0.2s ease — ทั้ง sidebar width และ content marginLeft sync กัน

**Effect to / Relate to:**
- **NAV-1.1** (Layout dimensions)
- **NAV-2.1** (Toggle button trigger)
- **NAV-3.5** (Desktop vs Mobile mode)

---

## NAV-1.5 — Mobile Drawer

**Component:** AntD `<Drawer>` ใน `AppSidebar` (mobile branch)

### Detail

1. บน Mobile viewport (breakpoint < `md`) — Sidebar render เป็น **Drawer** แทน Sider:
   - `placement="left"` — slide เข้าจากซ้าย
   - Width 260px (กว้างกว่า desktop expanded 240px เล็กน้อย)
   - `closable={false}` — ไม่มีปุ่ม X เอง (ใช้ backdrop tap)
   - Body style: padding 0, background `#0f3d22`
   - Wrapper style: shadow `2px 0 12px rgba(0,0,0,0.25)` (เน้น depth)
   - `rootStyle={{ zIndex: 1100 }}` — สูงกว่า header (10) และ sider (100)
2. ผู้ใช้กดปุ่ม **MenuUnfoldOutlined** ใน Topbar → `mobileOpen=true` → drawer slide in
3. ผู้ใช้ปิด drawer ได้ 2 ทาง:
   - แตะ backdrop ด้านนอก drawer
   - คลิก menu item → navigate + `onMobileClose()`
4. **Auto-close on route change** — `useEffect` ใน RoleLayout reset `mobileOpen=false` เมื่อ `pathname` เปลี่ยน
5. Drawer แสดง `SidebarBody` ใน `isDrawer=true` mode — บังคับ expanded (ไม่มี collapsed mode)

### Condition

1. **Mobile detection** — `screens.md === false` จาก `Grid.useBreakpoint()` (AntD breakpoint 768px)
2. **Drawer always expanded** — `collapsed={false}` ภายใน Drawer (ไม่มีโหมด icon-only ใน mobile)
3. **Click menu = auto-close** — `handleNavigate` เรียก `onMobileClose?.()` ก่อน navigate
4. **Logout same behavior** — ปิด drawer หลัง logout
5. **z-index hierarchy**:
   - Drawer (1100) > Sider desktop (100) > Topbar (10)
6. **Backdrop** — แตะนอก drawer ปิดอัตโนมัติ (AntD default behavior)
7. **No body scroll lock** — ใช้ AntD default; ผู้ใช้สามารถ scroll body ได้แม้ drawer เปิด

**Effect to / Relate to:**
- **NAV-1.1** (Body content same)
- **NAV-2.1** (Toggle button on topbar)
- **NAV-3.5** (Responsive detection)
- **NAV-1.2** (Menu items same as desktop)

---

## NAV-1.6 — Logout Action (Sidebar Footer)

**Action:** ปุ่ม "ออกจากระบบ" ที่ footer ของ sidebar
**Service:** `logout()` ใน `auth.ts`

### Detail

1. Sidebar footer แสดง Menu item แยกออกจาก main menu (`border-top` คั่น):
   - **icon LogoutOutlined**
   - **Label "ออกจากระบบ"**
   - `danger: true` — สีแดงเพื่อบ่งบอกว่าเป็น destructive action
   - `selectable={false}` — ไม่ถูก highlight เป็น current selection
2. ผู้ใช้คลิก → `handleLogout()`:
   - เรียก `logout()` → ลบ session storage (ทั้ง localStorage และ sessionStorage)
   - `router.push('/login')` → redirect ไปหน้า login
   - ถ้า mobile drawer เปิด — `onMobileClose?.()` ปิด drawer ด้วย
3. ใน collapsed mode — แสดงเฉพาะ icon (label ซ่อน) แต่ tooltip ทำงาน

### Condition

1. **Click behavior** — ไม่มีการ confirm dialog (one-tap logout) — POC convention
2. **Storage cleanup** — ลบทั้ง `localStorage[raot_auth]` และ `sessionStorage[raot_auth]` (เผื่อ session แบบไหน)
3. **ไม่ล้าง** — `raot_officer_accounts`, `raot_pending_credentials`, `raot_text_scale` etc. — device-level prefs คงอยู่
4. **Cross-tab** — tab อื่นจะ detect logout ผ่าน `refreshSession()` ครั้งถัดไป → force redirect
5. **Mobile** — ปิด drawer ก่อน redirect (กัน UI ค้าง drawer)
6. **Theme** — `danger: true` ทำให้ icon + label สีแดงตาม AntD danger theme

**Effect to / Relate to:**
- **AUTH-1.5** (Logout service)
- **NAV-1.5** (Mobile drawer close)
- **NAV-2.4** (User dropdown also has logout)

---

## NAV-2.1 — Topbar Layout & Sidebar Toggle

**Component:** `AppHeader`
**Source:** `src/shared/components/app-header.tsx`

### Detail

1. แสดง Topbar ที่ด้านบน:
   - Background `#ffffff`, border-bottom `#f0f0f0`
   - Height **56px** (คงที่)
   - `position: sticky, top: 0, zIndex: 10`
   - Box shadow บางๆ `0 1px 4px rgba(0,0,0,0.04)`
   - Padding `0 24px` (desktop) / `0 12px` (mobile)
2. **Left section** — Toggle + Breadcrumb (`flex: 1, minWidth: 0`):
   - **ปุ่ม Toggle** — text button, icon เปลี่ยนตาม state:
     - Mobile: `MenuUnfoldOutlined` (เปิด drawer)
     - Desktop expanded: `MenuFoldOutlined` (ย่อ)
     - Desktop collapsed: `MenuUnfoldOutlined` (ขยาย)
   - Tooltip — "เมนู" (mobile) / "ย่อเมนู" / "ขยายเมนู"
   - ขนาด 36x36px
   - **Breadcrumb** — แสดงหลังจาก toggle (ดู NAV-2.2)
3. **Right section** — Action buttons (`flex-shrink: 0`):
   - Language switcher (desktop only)
   - Text size dropdown
   - Notification bell (Badge count)
   - User avatar dropdown
4. **Spacing** — `Space size=12` (desktop) / `size=6` (mobile) ใน left; `size=4` / `size=0` ใน right

### Condition

1. **Toggle action** — `onToggle()` callback:
   - Mobile → `setMobileOpen(o => !o)` (NAV-1.5)
   - Desktop → `setCollapsed(c => !c)` (NAV-1.4)
2. **Icon swap** — ใช้ `MenuFoldOutlined` ↔ `MenuUnfoldOutlined` ตามทิศทาง action
3. **Sticky positioning** — `position: sticky + top: 0` ทำให้ header pin บน scroll
4. **Height คงที่ 56px** — ใช้คำนวณ content `minHeight: 'calc(100vh - 56px)'`
5. **z-index 10** — สูงกว่า content ปกติ, ต่ำกว่า Drawer (1100) และ Modal (1000)
6. **Padding responsive** — ลดเหลือ 12px ใน mobile ให้พื้นที่ action buttons

**Effect to / Relate to:**
- **NAV-1.4, NAV-1.5** (Toggle actions)
- **NAV-2.2** → **NAV-2.7** (Component children)
- **NAV-3.5** (Mobile detection)

---

## NAV-2.2 — Breadcrumb Navigation

### Detail

1. แสดง **Breadcrumb** ถัดจากปุ่ม toggle ตาม pathname ปัจจุบัน
2. Parse pathname เป็น segments (`pathname.split('/').filter(Boolean)`):
   - เช่น `/buyer/auction` → `['buyer', 'auction']`
   - เช่น `/auction-officer/approvals/R001` → `['auction-officer', 'approvals', 'R001']`
3. Map แต่ละ segment เป็น Thai label จาก `PAGE_LABELS` map (40+ entries):
   - `dashboard` → "Dashboard"
   - `auction` → "ประมูล (Auction)"
   - `auction-control` → "ควบคุมการประมูล"
   - `approvals` → "อนุมัติผู้ซื้อ/ขาย"
   - `buyer` → "ผู้ซื้อ"
   - `auction-officer` → "เจ้าหน้าที่ประมูล"
   - ฯลฯ
   - ถ้าไม่พบใน map → แสดง segment raw (เช่น `R001`)
4. ทุก segment ยกเว้นตัวสุดท้าย — **clickable** → navigate กลับไป path นั้น
5. ตัวสุดท้าย — แสดงเป็นข้อความปกติ (current page)
6. Style:
   - Font size 13px
   - `overflow: hidden, textOverflow: ellipsis, whiteSpace: nowrap` — กันล้น
   - `minWidth: 0` — ให้ shrink ได้ใน flex container
7. **Mobile mode** — แสดงเฉพาะ segment สุดท้าย (`segments.slice(-1)`) — ประหยัดพื้นที่

### Condition

1. **Click handler** — ใช้ `router.push('/' + segments.slice(0, absoluteIdx + 1).join('/'))`
2. **Last segment never clickable** — ไม่มี onClick (current page)
3. **Mobile slice** — `visibleSegments = mobile ? segments.slice(-1) : segments`
4. **Segment offset** — รักษา absolute index เพื่อสร้าง URL ได้ถูกต้องแม้ slice แล้ว
5. **Empty breadcrumb** — ถ้า `segments.length === 0` → ไม่ render Breadcrumb component
6. **Fallback label** — `PAGE_LABELS[seg] ?? seg` (แสดง slug raw ถ้าไม่มี label)
7. **Dynamic segments** (เช่น `[id]`, `[contractNo]`) — แสดง raw value (เช่น `R001`, `C-2024-001`)

**Effect to / Relate to:**
- **NAV-2.1** (Layout container)
- ทุก page route (consumers ของ breadcrumb labels)

---

## NAV-2.3 — Notification Dropdown

**Source:** `MOCK_NOTIFICATIONS` ใน `src/features/notifications/services/mock-notifications.ts`

### Detail

1. แสดงปุ่ม **Bell icon** (`BellOutlined`, size 18) — ขนาด 36x36 text button
2. ครอบด้วย AntD **Badge** แสดง count ของ `unread` (filter `!n.read`) — `size="small", offset=[-4, 4]`
3. คลิก → เปิด **Dropdown menu** (placement bottomRight, minWidth 320):
   - **Header (disabled item)** — "การแจ้งเตือน" + Tag "{N} ใหม่" (สีแดง) ถ้ามี unread
   - **Divider**
   - **5 notification items แรก** (`MOCK_NOTIFICATIONS.slice(0, 5)`):
     - Indicator dot — สีฟ้า `#1677ff` (unread) / สีเทา `#d9d9d9` (read)
     - **Title** — bold ถ้า unread (font-weight 600), regular ถ้า read
     - **Message** — small text สีเทา
     - **Timestamp** — `DD/MM/YY HH:mm` (small, สีเทาอ่อน)
     - **Checkmark** (เฉพาะ unread) — tooltip "ทำเครื่องหมายว่าอ่านแล้ว"
   - **Divider**
   - **Footer item "ดูการแจ้งเตือนทั้งหมด"** — center, สีเขียวแบรนด์
4. Width ของแต่ละ item: 300px (รวม padding และ inner alignment)

### Condition

1. **Notification source** — `MOCK_NOTIFICATIONS` (mock data, ไม่มี backend)
2. **Unread count** — `MOCK_NOTIFICATIONS.filter(n => !n.read).length`
3. **Display limit** — เฉพาะ 5 รายการแรก (ไม่ pagination)
4. **No mark-as-read action** — ปุ่ม checkmark แสดงแต่ไม่ทำงาน (POC display only)
5. **"ดูทั้งหมด" link** — ไม่ navigate (placeholder)
6. **Badge hidden when count=0** — AntD Badge auto behavior (`count=0` ไม่แสดง dot)
7. **POC limitation** — ไม่มี real-time push; ไม่ persist read state

**Effect to / Relate to:**
- **NAV-2.1** (Topbar container)
- Notifications feature (future: full page `/notifications`)

---

## NAV-2.4 — User Profile Dropdown

### Detail

1. แสดงปุ่ม **Avatar + name** ที่ขวาสุดของ topbar:
   - **Avatar** — size 28px, icon UserOutlined, background สี role color (เช่น Buyer = `#1677ff`, Seller = `#52c41a`)
   - **Name section** (desktop only — ซ่อนใน mobile):
     - บรรทัด 1 — `user.fullName` (font-size 13, weight 500, ellipsis, maxWidth 140px)
     - บรรทัด 2 — `ROLE_LABELS[role].th` (สี role color, size 11, ellipsis)
2. คลิก → **Dropdown menu** (placement bottomRight, minWidth 220):
   - **Info item (disabled)** — full info card:
     - `user.fullName` (bold 14)
     - `user.email` (สีเทา 12)
     - Tag สี role color (เช่น "ผู้ซื้อ", "เจ้าหน้าที่ประมูล")
   - **Divider**
   - **ข้อมูลส่วนตัว** (icon UserOutlined) → `router.push('/${role}/profile')`
   - **ตั้งค่า** (icon SettingOutlined) — *placeholder, ไม่ทำงาน*
   - **Divider**
   - **ออกจากระบบ** (icon LogoutOutlined, danger) → `logout()` + `router.push('/login')`

### Condition

1. **Role color mapping** — `ROLE_LABELS[role].color`:
   - buyer: `#1677ff`, seller: `#52c41a`, admin: `#722ed1`
   - auction_officer: `#fa8c16`, finance_officer: `#13c2c2`
   - market_director: `#eb2f96`, staff: `#faad14`
2. **Profile route** — `/${role.replace('_', '-')}/profile` (เช่น `auction_officer` → `/auction-officer/profile`)
3. **Mobile**: ซ่อน name section, แสดงเฉพาะ avatar (ประหยัด 140px+)
4. **"ตั้งค่า" item** — ไม่มี handler ใน switch — placeholder for future
5. **Logout same as NAV-1.6** — duplicate entry point (sidebar + topbar)
6. **Click outside closes** — AntD Dropdown default behavior

**Effect to / Relate to:**
- **NAV-2.1** (Topbar container)
- **AUTH-1.5** (Logout service)
- Profile page (per-role `/profile`)

---

## NAV-2.5 — Text Scale Switcher (Accessibility)

**Hook:** `useTextScale()` from `src/shared/components/text-scale.tsx`

### Detail

1. แสดงปุ่ม **FontSizeOutlined** icon (size 16) — ขนาด 36x36 text button — Tooltip "ปรับขนาดตัวอักษร"
2. คลิก → **Dropdown menu** (placement bottomRight, width 200):
   - **Header (disabled)** — "ขนาดตัวอักษร" (bold 13)
   - **Divider**
   - **4 ตัวเลือก**:
     - **A−** "เล็ก" (scale 0.875)
     - **A** "ปกติ" (scale 1.0) — default
     - **A+** "ใหญ่" (scale 1.125)
     - **A++** "ใหญ่มาก" (scale 1.25)
   - แต่ละตัว: short label (สีเทา) + Thai label
   - ตัวที่เลือกอยู่ — bold + สีเขียวแบรนด์ + icon CheckOutlined ขวาสุด
3. คลิกตัวเลือก → `setKey(key)` → update context + persist localStorage
4. ขนาดตัวอักษรทั้งระบบ:
   - AntD theme `token.fontSize` ถูก scale ตามค่า
   - CSS variable `--raot-text-scale` set ที่ root element สำหรับ non-AntD components

### Condition

1. **Storage key** — `raot_text_scale` (`localStorage`)
2. **Default scale** — `md` (1.0) — ถ้าไม่มีค่าใน storage หรือ value invalid
3. **SSR-safe** — `useState(DEFAULT_KEY)` ก่อน hydrate → `useEffect` อ่าน localStorage หลัง mount
4. **Persist** — เปลี่ยน scale → write `localStorage[raot_text_scale]` ทันที
5. **Cross-tab sync** — ไม่ explicit; ต้อง refresh tab อื่นเพื่อเห็นค่าใหม่ (POC)
6. **CSS variable** — set บน `document.documentElement.style.setProperty('--raot-text-scale', scale)`
7. **Persistent across login** — preference อยู่ที่ device-level, ไม่ผูกกับ user account

**Effect to / Relate to:**
- **NAV-2.1** (Topbar container)
- Root layout AntD ConfigProvider (theme tokens consumer)
- All pages (downstream font sizes)

---

## NAV-2.6 — Language Switcher (Display Only)

### Detail

1. แสดงปุ่ม **GlobalOutlined** icon + text "TH" ในปุ่มเดียวกัน
2. Tooltip "เลือกภาษา"
3. **ปุ่มแสดงเฉพาะ Desktop** — ซ่อนใน mobile (`{!mobile && (...)}`)
4. ปัจจุบัน **placeholder** — กดได้แต่ไม่มี handler/dropdown
5. ใช้เป็น UI placeholder สำหรับ i18n ในอนาคต (Thai/English switcher)

### Condition

1. **Hide on mobile** — เพราะพื้นที่ topbar mobile จำกัด
2. **No actual i18n** — POC; ทั้งระบบเป็น Thai เท่านั้น (ภาษาไทยผสม English nouns)
3. **No dropdown** — Button พื้น ไม่มี menu/popover
4. **Future** — production จะมี dropdown TH/EN + i18n provider (next-intl, react-i18next ฯลฯ)
5. **MOCK_USERS มี `fullNameEn` field** — เตรียมข้อมูลรอ i18n แต่ยังไม่ใช้

**Effect to / Relate to:**
- **NAV-2.1** (Topbar container)
- Future: i18n provider integration

---

## NAV-2.7 — Mobile Responsive Topbar

### Detail

1. ตรวจ mobile mode จาก `Grid.useBreakpoint()` ใน RoleLayout → ส่ง `mobile={!screens.md}` ลง AppHeader
2. **Mobile adjustments**:
   - Padding `0 12px` (ลดจาก 24px)
   - Toggle icon — `MenuUnfoldOutlined` เสมอ (เปิด drawer)
   - **Breadcrumb** — แสดงเฉพาะ segment สุดท้าย
   - **Language switcher** — ซ่อน
   - **Avatar dropdown** — ซ่อนชื่อ + role, แสดงเฉพาะ avatar
   - **Space size** — left: 6, right: 0 (ปกติ 12, 4)
3. ปุ่มทั้งหมดในขวา (text-size, notif, avatar) ยังคงแสดง — แต่ avatar ลด width

### Condition

1. **Breakpoint** — `md` = 768px (AntD default)
2. **Mobile = `!screens.md`** — ทุก screen size ที่ < 768px
3. **Tablet (768-992) ถือ desktop** — ใช้ layout เดียวกับ desktop
4. **Auto re-render** — Grid hook trigger re-render เมื่อ resize ข้าม breakpoint
5. **No window check inside** — Grid hook คือ AntD-managed, SSR-safe
6. **เฉพาะ visual** — ไม่เปลี่ยน functionality (notifications, profile, logout ทำงานเหมือนกัน)

**Effect to / Relate to:**
- **NAV-3.5** (RoleLayout mobile detection)
- **NAV-1.5** (Mobile drawer activation)
- **NAV-2.1**-**NAV-2.5** (Hidden/adjusted children)

---

## NAV-3.1 — Session Guard & Auth Check

**Component:** `RoleLayout` initial useEffect
**Service:** `consumeSession()` ใน `auth.ts`

### Detail

1. RoleLayout mount → useEffect เรียก `consumeSession()` (ไม่ใช่ `getSession()` เพราะต้องแยก expired vs none)
2. ตรวจผลลัพธ์:
   - `'expired'` → `router.replace('/login?reason=expired')` → AUTH-1.4 แสดง Alert
   - `'none'` → `router.replace('/login')` (silent — ไม่มี Alert)
   - `'valid'` → ตรวจ role ต่อ (ดู NAV-3.2)
3. ระหว่าง loading — แสดง **Spin overlay** เต็มจอ:
   - icon AntD Spin size large
   - text "กำลังโหลด..." สีเทา
   - background `#f5f7fa`, height 100vh
4. หลัง valid session — `setUser(session.user); setLoading(false)` → render layout
5. ทุก dashboard page wrap ด้วย RoleLayout ผ่าน `app/(dashboard)/{role}/layout.tsx`

### Condition

1. **`consumeSession()` vs `getSession()`** — `consumeSession` distinguish expired/none เพื่อแสดง Alert ที่หน้า login (AUTH-1.4)
2. **`router.replace` not `push`** — กันการกลับ back ไปหน้า protected ผ่าน history
3. **Loading state covers entire viewport** — ป้องกัน flash ของ unauthenticated content
4. **`requiredRole` prop** — ส่งจาก `layout.tsx` ของแต่ละ role (เช่น buyer layout ส่ง `requiredRole="buyer"`)
5. **Cleanup minimal** — useEffect ไม่มี cleanup (one-shot check on mount)
6. **POC limitation** — production จะมี server-side guard (middleware.ts) แทน client-side

**Effect to / Relate to:**
- **AUTH-1.1, AUTH-1.2** (Login redirect targets)
- **AUTH-1.3** (Session service)
- **AUTH-1.4** (Session expired notice)
- **NAV-3.2** (Role check ต่อจาก session valid)

---

## NAV-3.2 — Role Guard & Redirect

### Detail

1. หลัง session valid (NAV-3.1) → ตรวจ `session.user.role !== requiredRole`:
   - ถ้า mismatch → `router.replace('/${user.role.replace('_', '-')}/dashboard')`
   - ถ้า match → continue, `setUser(session.user)`
2. ตัวอย่าง:
   - Buyer พยายามเปิด `/admin/dashboard` → redirect ไป `/buyer/dashboard`
   - Auction Officer เปิด `/buyer/auction` → redirect ไป `/auction-officer/dashboard`
3. **Silent redirect** — ไม่มี toast/alert (ทำเหมือนเข้า URL ไม่มีจริง)

### Condition

1. **requiredRole จาก layout file** — ทุก `app/(dashboard)/{role}/layout.tsx` hardcode `requiredRole`:
   ```ts
   // src/app/(dashboard)/admin/layout.tsx
   export default ({ children }) => <RoleLayout requiredRole="admin">{children}</RoleLayout>;
   ```
2. **Role string transform** — `role.replace('_', '-')` เพราะ URL ใช้ kebab-case แต่ type ใช้ snake_case:
   - `auction_officer` → `/auction-officer/dashboard`
3. **ไม่ block** UI ก่อน redirect — ทำใน useEffect ก่อน setLoading(false) (Spin overlay คงอยู่)
4. **Always to dashboard** — redirect ไป dashboard ของ role ตัวเอง ไม่จำการพยายามเข้าหน้านั้น
5. **POC limit** — production ควรใช้ middleware.ts ของ Next.js ทำ guard ที่ server

**Effect to / Relate to:**
- **NAV-3.1** (Session check ก่อน)
- **AUTH-1.3** (`getRedirectPath` similar logic)
- All `app/(dashboard)/{role}/layout.tsx`

---

## NAV-3.3 — Permission Route Guard

### Detail

1. useEffect ตรวจ permissions vs current path ทุกครั้ง `user` หรือ `pathname` เปลี่ยน
2. ถ้า `user.permissions` empty/undefined → skip (legacy full access)
3. Parse current segment — `pathname.split('/')[2] ?? 'dashboard'`:
   - `/buyer/auction/123` → segment = `auction`
4. ตรวจ `allowed = new Set([...user.permissions, 'dashboard'])`:
   - ถ้า `!allowed.has(segment)`:
     - `message.warning('สิทธิ์ของท่านไม่อนุญาตให้เข้าหน้านี้ — กลับไปยัง Dashboard')`
     - `router.replace('/${role}/dashboard')`
5. ใช้คู่กับ Sidebar permission filter (NAV-1.3) — กันการพิมพ์ URL ตรง

### Condition

1. **Always allow `dashboard`** — เหมือน NAV-1.3 — ทุกคนมี landing page
2. **Skip when no restriction** — ถ้า `permissions` ไม่มีหรือเป็น `[]` → ใช้ role default (full access)
3. **Re-check on pathname change** — useEffect dep `[user, pathname]` → guard ทุก navigation
4. **Skip if `handledRevocation.current`** — กัน race กับ logout-in-progress
5. **Warning message** — แสดง toast ก่อน redirect (ต่างจาก NAV-3.2 ที่ silent)
6. **Sync with sidebar filter** — ใช้ permissions set เดียวกัน (NAV-1.3)
7. **POC limit** — guard เฉพาะ first segment; production ต้อง guard sub-path ด้วย

**Effect to / Relate to:**
- **NAV-1.3** (Sidebar filter ใช้ logic เดียวกัน)
- **NAV-3.4** (Permissions update trigger re-check)
- **AUTH-1.3** (`effectivePermissionsFor`)

---

## NAV-3.4 — Cross-tab Session Sync (Suspend/Revoke/Update)

**Service:** `refreshSession()` ใน `auth.ts`
**Constant:** `SYNC_KEYS`, `REFRESH_POLL_MS = 30_000`

### Detail

1. RoleLayout listen 3 events → ทุกครั้งเรียก `syncSession()`:
   - **`storage` event** (native) — fires ใน tab อื่นเมื่อ key เปลี่ยน — filter `SYNC_KEYS`
   - **`focus` event** — กลับเข้า tab → re-check
   - **Polling** — `setInterval(syncSession, 30_000)` — cover cross-device changes
2. `SYNC_KEYS` ที่ trigger sync:
   - `raot_auth` (session envelope)
   - `raot_officer_accounts` (officer added/edited/removed)
   - `raot_officer_permission_overrides` (permission changed)
   - `raot_officer_password_overrides` (password reset)
3. `refreshSession()` คืนค่า 6 แบบ — RoleLayout react ต่างกัน:
   - **`suspended`** → `logout()` + message error "บัญชีของท่านถูกระงับโดยผู้ดูแลระบบ" + redirect login
   - **`gone`** → `logout()` + message error "บัญชีของท่านไม่อยู่ในระบบแล้ว..." + redirect login
   - **`role_changed`** → `logout()` + message warning "บทบาทของท่านถูกเปลี่ยนเป็น {newRole}..." + redirect login
   - **`no-session`** → `router.replace('/login')` (silent)
   - **`updated`** → `setUser(r.user)` + message info "สิทธิ์ของท่านถูกอัปเดตโดยผู้ดูแลระบบ"
   - **`unchanged`** → no-op
4. **`handledRevocation` ref** — กัน race เมื่อหลาย event fire พร้อมกัน (เช่น storage + polling)

### Condition

1. **`handledRevocation.current` guard** — set เป็น true ก่อน logout/redirect; กัน duplicate toast/redirect
2. **Storage event ใน tab อื่น** — `storage` ไม่ fire ใน tab ที่เขียนเอง (browser spec)
3. **Focus event** — fires เมื่อ window กลับมา foreground (cover same-tab scenario)
4. **Polling 30 วินาที** — fallback cross-device (admin บน laptop คนละเครื่อง suspend → ภายใน 30s detect)
5. **Polling stops** — ถ้า `user === null` (เพิ่ง mount ยังไม่ load) — กัน race
6. **Permissions diff** — `refreshSession()` ใช้ `sameUser()` shallow compare (id, username, role, status, fullName, permissions) — เปลี่ยนแค่ permissions ก็ trigger `updated`
7. **Built-in vs admin-created users**:
   - Built-in — role/status คงที่ (ยกเว้น `MOCK_USERS.{role}.status` mutation — ไม่มีใน POC); permissions override ได้
   - Admin-created — role/status/permissions mutate ได้ทั้งหมด

**Effect to / Relate to:**
- **NAV-1.3** (Sidebar refresh เมื่อ permissions update)
- **NAV-3.3** (Route guard re-check หลัง user update)
- **AUTH-1.3** (`refreshSession` service)
- **AUTH-1.5** (logout used)
- **BO-Admin** Officer Management (mutation producer)

---

## NAV-3.5 — Responsive Breakpoint Detection

**Hook:** `Grid.useBreakpoint()` ใน RoleLayout

### Detail

1. RoleLayout เรียก `const screens = Grid.useBreakpoint();` → คืน `{ xs, sm, md, lg, xl, xxl: boolean }`
2. กำหนด `const isMobile = !screens.md;` (viewport < 768px)
3. ส่ง `mobile={isMobile}` ลง:
   - `<AppSidebar mobile={isMobile} ... />` → render Drawer mode (NAV-1.5)
   - `<AppHeader mobile={isMobile} ... />` → mobile layout (NAV-2.7)
4. กำหนด content layout:
   - `desktopSiderWidth = collapsed ? 72 : 240`
   - `contentMarginLeft = isMobile ? 0 : desktopSiderWidth`
   - `contentPadding = isMobile ? 12 : 24`
5. `handleHeaderToggle`:
   - Mobile → toggle `mobileOpen` (open/close drawer)
   - Desktop → toggle `collapsed` (sidebar width)

### Condition

1. **AntD breakpoints**:
   - `xs` < 576px, `sm` ≥ 576, `md` ≥ 768, `lg` ≥ 992, `xl` ≥ 1200, `xxl` ≥ 1600
2. **Mobile threshold** — `md` (< 768px); tablet portrait มักผ่าน mobile
3. **Auto re-render** — Grid hook trigger re-render ทุกครั้ง breakpoint เปลี่ยน
4. **SSR-safe** — Grid hook คืน undefined values บน server → component handle ได้ (`!undefined === true` แต่ใช้ optional chain ไม่มี problem)
5. **No window check** — ใช้ AntD hook แทน `window.matchMedia` (กัน hydration mismatch)
6. **Mobile drawer auto-close on route change** — `useEffect [pathname] → setMobileOpen(false)`

**Effect to / Relate to:**
- **NAV-1.5** (Mobile drawer)
- **NAV-2.7** (Mobile topbar)
- **NAV-1.4** (Desktop collapse)

---

## Cross-cutting Notes

### Layout Hierarchy

```
app/layout.tsx (root)
└─ TextScaleProvider (NAV-2.5 context)
   └─ AntD ConfigProvider (theme tokens)
      └─ App.useApp (global message/notif/modal)
         └─ app/(dashboard)/{role}/layout.tsx
            └─ RoleLayout (NAV-3.x)
               ├─ AppSidebar (NAV-1.x)
               └─ Layout
                  ├─ AppHeader (NAV-2.x)
                  └─ Content (page children)
```

### Theme Colors

| Element | Color | Usage |
|---|---|---|
| Sidebar background | `#0f3d22` | Dark brand green |
| Sidebar separators | `rgba(255,255,255,0.08)` | Border |
| Brand text "TRACEABILITY" | `rgba(255,255,255,0.45)` | Muted |
| Topbar background | `#ffffff` | Clean |
| Topbar border-bottom | `#f0f0f0` | Subtle |
| Page background | `#f5f7fa` | Content area |
| Brand green primary | `#1a7c3e` | Buttons, links |
| Brand green dark | `#0f3d22` | Backgrounds |

### Storage Keys (Navigation-related)

| Key | Producer | Consumer |
|---|---|---|
| `raot_auth` | login | NAV-3.1, NAV-3.4 |
| `raot_text_scale` | NAV-2.5 | TextScaleProvider |
| `raot_officer_accounts` | BO-Admin | NAV-3.4 (sync) |
| `raot_officer_permission_overrides` | BO-Admin | NAV-3.4 (sync) |
| `raot_officer_password_overrides` | BO-Admin | NAV-3.4 (sync) |

### Menu Item Structure

```ts
// Leaf item
{ key: 'auction', label: 'ประมูล (Auction)', icon: <TrophyOutlined /> }

// Group (uncliclable section header)
{ type: 'group', label: 'การซื้อขาย', children: [...] }
```

### URL Convention

```
/{role-kebab}/{feature-slug}/{...dynamic}
```

- `role-kebab` — `auction-officer`, `market-director`, `finance-officer` (snake_case → kebab-case)
- `feature-slug` — ตรงกับ menu `key` (เช่น `auction`, `approvals`, `lot-registration`)
- Dynamic — `[id]`, `[contractNo]`, `[roundId]`, etc.

### Role Color Mapping (`ROLE_LABELS`)

| Role | Thai | Color | Avatar BG |
|---|---|---|---|
| buyer | ผู้ซื้อ | `#1677ff` | Blue |
| seller | ผู้ขาย | `#52c41a` | Green |
| admin | IT Admin | `#722ed1` | Purple |
| auction_officer | เจ้าหน้าที่ประมูล | `#fa8c16` | Orange |
| finance_officer | เจ้าหน้าที่การเงิน | `#13c2c2` | Cyan |
| market_director | ผู้อำนวยการตลาด | `#eb2f96` | Pink |
| staff | เจ้าหน้าที่ | `#faad14` | Yellow |

---

## Out-of-scope / POC Limitations

1. **Notification real-time** — `MOCK_NOTIFICATIONS` เป็น static array; ไม่มี WebSocket/SSE push (production: subscribe channel)
2. **Notification mark-as-read** — checkmark UI ไม่ทำงาน; ไม่ persist read state
3. **"ดูการแจ้งเตือนทั้งหมด"** — ไม่มี full notifications page
4. **Settings menu** — placeholder, ไม่ navigate
5. **Language switcher** — ไม่มี i18n provider; UI placeholder เท่านั้น (Thai only)
6. **Collapsed state ไม่ persist** — refresh ทำให้กลับเป็น expanded (production: เก็บใน localStorage)
7. **Server-side guards** — RoleLayout เป็น client-side guard; production ต้องใช้ Next.js middleware.ts ด้วย
8. **Permission guard ลึก** — guard เฉพาะ first segment (`/{role}/{seg}`); ไม่ guard sub-paths
9. **Tablet portrait = mobile** — < 768px ทั้งหมดถือ mobile (อาจไม่ optimal สำหรับ iPad portrait)
10. **No keyboard shortcuts** — ไม่รองรับ `Cmd+B` toggle sidebar, `Esc` ปิด drawer
11. **No active link transition animation** — sidebar item highlight เปลี่ยนทันที (no smooth scroll/glow)
12. **No favorites/pinned menus** — ผู้ใช้ไม่สามารถ pin frequent menus

---

*Generated by `/description-writer` skill — Detail + Condition format*
*Source code last reviewed: 2026-05-15*
