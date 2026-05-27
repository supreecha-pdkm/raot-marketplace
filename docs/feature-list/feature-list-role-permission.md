# Feature List — ระบบ Role & Permission (Officer Side)

> **Scope** — ระบบบริหารสิทธิ์เจ้าหน้าที่ฝั่ง Officer ของ RAOT-Next หลัง refactor (Phase 1–3)
> **โครงสร้าง** — Master Account (1) + Dynamic Roles (ผู้ดูแลสร้างเอง) + Officer Accounts (ผูก Role)
> **URL convention** — ทุกหน้าฝั่งเจ้าหน้าที่อยู่ที่ `/officer/*`
> **Format** — แต่ละ feature ใช้ **Detail + Condition + Edge Cases**
> - `Detail` = flow / UI ที่ user เห็น
> - `Condition` = rule / invariant ของ happy path
> - `Edge Cases` = scenario นอกเหนือจาก happy path ที่ QA ต้อง regression

---

## Epic Index

| Epic | ชื่อ | จำนวน Stories | Jira Epic |
|---|---|---|---|
| **ROLE** | Role Management (CRUD บน Role) | 6 | [RAOT-143](https://deeploytech-team.atlassian.net/browse/RAOT-143) |
| **OFF** | Officer Account Management (CRUD บนบัญชีเจ้าหน้าที่) | 7 | [RAOT-143](https://deeploytech-team.atlassian.net/browse/RAOT-143) |
| **AUTH** | Authentication & Authorization | 6 | [RAOT-143](https://deeploytech-team.atlassian.net/browse/RAOT-143) |
| **MAS** | Master Account | 3 | [RAOT-143](https://deeploytech-team.atlassian.net/browse/RAOT-143) |
| **MIG** | Migration & Seeding | 3 | [RAOT-143](https://deeploytech-team.atlassian.net/browse/RAOT-143) |
| **MENU** | Menu Catalog & Permission Resolution | 3 | [RAOT-143](https://deeploytech-team.atlassian.net/browse/RAOT-143) |

รวม **28 stories** → สร้างเป็น Jira cards **20 ใบใช้งานจริง** (RAOT-144 ถึง RAOT-165 ยกเว้น 157, 158) ภายใต้ Epic [RAOT-143](https://deeploytech-team.atlassian.net/browse/RAOT-143)

> **AUTH-3.1 + AUTH-3.2** (Master/Officer Login) — เนื้อหาถูก merge เข้า [RAOT-41](https://deeploytech-team.atlassian.net/browse/RAOT-41) (AUTH-1.2 Login — Master & Officer) ใน Epic [RAOT-1](https://deeploytech-team.atlassian.net/browse/RAOT-1) Authentication เพื่อรวมเป็น single source of truth ของหน้า `/login/admin`; RAOT-157 + RAOT-158 ถูก Reject เป็น duplicate

## Jira Card Mapping

| Story ID | Jira Card | หมายเหตุ |
|---|---|---|
| ROLE-1.1 | [RAOT-144](https://deeploytech-team.atlassian.net/browse/RAOT-144) | |
| ROLE-1.2 | [RAOT-145](https://deeploytech-team.atlassian.net/browse/RAOT-145) | |
| ROLE-1.3 | [RAOT-146](https://deeploytech-team.atlassian.net/browse/RAOT-146) | |
| ROLE-1.4 | [RAOT-147](https://deeploytech-team.atlassian.net/browse/RAOT-147) | |
| ROLE-1.5 | [RAOT-148](https://deeploytech-team.atlassian.net/browse/RAOT-148) | รวม MIG-5.2 (Default Role Seeding) |
| ROLE-1.6 | [RAOT-149](https://deeploytech-team.atlassian.net/browse/RAOT-149) | |
| OFF-2.1 | [RAOT-150](https://deeploytech-team.atlassian.net/browse/RAOT-150) | |
| OFF-2.2 | [RAOT-151](https://deeploytech-team.atlassian.net/browse/RAOT-151) | |
| OFF-2.3 | [RAOT-152](https://deeploytech-team.atlassian.net/browse/RAOT-152) | |
| OFF-2.4 | [RAOT-153](https://deeploytech-team.atlassian.net/browse/RAOT-153) | |
| OFF-2.5 | [RAOT-154](https://deeploytech-team.atlassian.net/browse/RAOT-154) | |
| OFF-2.6 | [RAOT-155](https://deeploytech-team.atlassian.net/browse/RAOT-155) | |
| OFF-2.7 | [RAOT-156](https://deeploytech-team.atlassian.net/browse/RAOT-156) | |
| AUTH-3.1 | [RAOT-41](https://deeploytech-team.atlassian.net/browse/RAOT-41) | Master Login รวมใน AUTH-1.2; RAOT-157 _Rejected_ (duplicate) |
| AUTH-3.2 | [RAOT-41](https://deeploytech-team.atlassian.net/browse/RAOT-41) | Officer Login รวมใน AUTH-1.2; RAOT-158 _Rejected_ (duplicate) |
| AUTH-3.3 | [RAOT-159](https://deeploytech-team.atlassian.net/browse/RAOT-159) | |
| AUTH-3.4 | [RAOT-160](https://deeploytech-team.atlassian.net/browse/RAOT-160) | รวมหมายเหตุ MAS-4.3 (Master Bypass Layer 1) |
| AUTH-3.5 | [RAOT-161](https://deeploytech-team.atlassian.net/browse/RAOT-161) | |
| AUTH-3.6 | [RAOT-162](https://deeploytech-team.atlassian.net/browse/RAOT-162) | |
| MAS-4.1 | [RAOT-163](https://deeploytech-team.atlassian.net/browse/RAOT-163) | รวม MAS-4.2 (Master-Only Menus) + MAS-4.3 (Bypass Filter) + MIG-5.3 (Demo Accounts) |
| MAS-4.2 | → [RAOT-163](https://deeploytech-team.atlassian.net/browse/RAOT-163) | _(merged เข้า MAS-4.1)_ |
| MAS-4.3 | → [RAOT-163](https://deeploytech-team.atlassian.net/browse/RAOT-163) + [RAOT-160](https://deeploytech-team.atlassian.net/browse/RAOT-160) | _(merged)_ |
| MIG-5.1 | _ไม่สร้างการ์ด_ | Storage migration runner — infrastructure-only (no user-facing feature) |
| MIG-5.2 | → [RAOT-148](https://deeploytech-team.atlassian.net/browse/RAOT-148) | _(merged เข้า ROLE-1.5)_ |
| MIG-5.3 | → [RAOT-163](https://deeploytech-team.atlassian.net/browse/RAOT-163) | _(merged เข้า MAS-4.1)_ |
| MENU-6.1 | [RAOT-164](https://deeploytech-team.atlassian.net/browse/RAOT-164) | รวม MENU-6.3 (Page Labels & Breadcrumb) |
| MENU-6.2 | [RAOT-165](https://deeploytech-team.atlassian.net/browse/RAOT-165) | |
| MENU-6.3 | → [RAOT-164](https://deeploytech-team.atlassian.net/browse/RAOT-164) | _(merged เข้า MENU-6.1)_ |

---

## Epic: ROLE — Role Management

หน้า `/officer/roles` (เฉพาะ Master) — สร้าง / แก้ไข / ลบ Role พร้อมเลือก Menu Permission

---

### ROLE-1.1 — แสดงรายการ Role · [RAOT-144](https://deeploytech-team.atlassian.net/browse/RAOT-144)

**Detail:**
1. Master เปิด `/officer/roles` จาก sidebar
2. ระบบ render `RoleListCard` พร้อม table ของทุก Role ที่มีอยู่ใน localStorage (`raot_roles`)
3. แต่ละแถวแสดง:
   - ชื่อ Role + icon กุญแจ
   - Badge `Default` ถ้าเป็น Default role
   - Badge `ระบบ` ถ้าเป็น `isSystem: true`
   - คำอธิบาย (description)
   - จำนวนสิทธิ์เมนู (Tag เขียวถ้า > 0, Tag default ถ้า = 0)
   - ปุ่ม `แก้ไข` / `ลบ`
4. ปุ่ม `+ สร้าง Role` มุมขวาบน เปิด `RoleFormModal` ในโหมด create

**Condition:**
1. Default Role (`id='role-default'`) ปรากฏที่นี่เสมอ — ปุ่ม `ลบ` ของแถวนี้ต้อง disabled
2. Table ไม่ใส่ pagination — Role ในระบบไม่น่ามีเยอะ (< 50)
3. หน้านี้เข้าถึงได้เฉพาะ `user.role === 'master'`
4. ขณะ loading ให้แสดง skeleton/spinner ของ Antd Table

**Edge Cases:**
1. `raot_roles` ว่างเปล่าใน localStorage → `listRoles()` auto-seed Default + Auction Demo ก่อน render
2. `raot_roles` มี data แต่ Default หาย (corruption) → auto-repair: prepend Default แล้ว save กลับ
3. Officer ปกติ (role ≠ master) เปิด URL `/officer/roles` ตรง ๆ → แสดง `Result 403` พร้อมปุ่มกลับ Dashboard
4. ถ้า Role list มีจำนวนมาก (เช่น > 100) → table scroll vertical (ปัจจุบันไม่ paginate)
5. Mobile breakpoint → Card ยังคงแสดง table แต่ scroll horizontal

**Effect to / Relate to:** ROLE-1.2 (แก้ไข), ROLE-1.3 (ลบ), ROLE-1.6 (เลือก permission), AUTH-3.4 (resolver), MAS-4.2 (Master-only menu)

---

### ROLE-1.2 — สร้าง Role ใหม่ · [RAOT-145](https://deeploytech-team.atlassian.net/browse/RAOT-145)

**Detail:**
1. Master กด `+ สร้าง Role` ที่หัว Card → เปิด `RoleFormModal` ในโหมด create (ฟอร์มว่าง)
2. กรอก:
   - **ชื่อ Role** (required) — เช่น "เจ้าหน้าที่ประมูล"
   - **คำอธิบาย** (optional) — อธิบายหน้าที่ ≤ 200 ตัวอักษร
   - **สิทธิ์เมนู (Permission)** — checkboxes จัดกลุ่มตาม `ASSIGNABLE_MENU_CATALOG` 7 กลุ่ม
3. แต่ละกลุ่มมีปุ่ม `เลือกทั้งกลุ่ม` (toggle ทุกเมนูในกลุ่มพร้อมกัน — แสดง indeterminate ถ้าเลือกบางอัน)
4. ลิงก์ `สลับเลือกทั้งหมด` ที่หัว Permission section toggle ทุกเมนูพร้อมกัน
5. กด `สร้าง Role` → call `createRole()` → invalidate query `['roles']` → ปิด modal + แสดง toast `สร้าง Role "<name>" แล้ว`

**Condition:**
1. ชื่อยาว ≤ 80 ตัวอักษร, คำอธิบาย ≤ 200 ตัวอักษร
2. Permission list ต้อง dedupe (Set) ก่อน persist
3. `isDefault: false`, `isSystem: false` ถูก fix ที่ service layer — UI กำหนดไม่ได้
4. `id` ถูก generate รูปแบบ `role-<base36-timestamp>-<random>`
5. `createdAt = updatedAt = new Date().toISOString()` ตอนสร้าง
6. ขณะ submitting → ปุ่ม OK loading, ปุ่ม cancel ยังกดได้

**Edge Cases:**
1. ชื่อ Role ว่าง / spaces เท่านั้น (trim แล้วว่าง) → error: "กรุณาระบุชื่อ Role"
2. ชื่อ Role ซ้ำ case-insensitive (เช่น "Auction Demo" vs "auction demo") → throw `Role ชื่อ "<x>" มีอยู่แล้ว`
3. Master กด `ยกเลิก` / ESC / คลิก backdrop → ปิด modal โดยไม่บันทึก; ฟอร์ม reset (destroyOnHidden)
4. เลือก permissions ครบทุก 22 keys ของ ASSIGNABLE_MENU_KEYS → save ผ่าน (Role นี้เห็นทุกเมนูยกเว้น `roles`)
5. ไม่เลือก permission เลย → save ผ่าน (เป็น Role ที่เห็นแค่ Dashboard เหมือน Default)
6. กด `สร้าง Role` ซ้ำขณะ `createMut.isPending` → ปุ่ม OK loading กันการ submit ซ้ำ
7. Description มีแค่ whitespace → service trim → persist เป็น undefined (ไม่ persist empty string)
8. ใส่ permission key ที่ไม่อยู่ใน catalog (เช่น manual mutation ผ่าน devtools) → service persist ตามที่ส่งมา (ไม่ validate); sidebar filter ออกตอน render

**Effect to / Relate to:** ROLE-1.1 (list), ROLE-1.6 (permission UI), MENU-6.1 (catalog), OFF-2.6 (ใช้ Role assign officer)

---

### ROLE-1.3 — แก้ไข Role · [RAOT-146](https://deeploytech-team.atlassian.net/browse/RAOT-146)

**Detail:**
1. Master กด `แก้ไข` ที่แถวใน table → เปิด `RoleFormModal` ในโหมด edit พร้อม preset ค่าจาก Role เดิม
2. หัว modal แสดง title `แก้ไข Role` + badge `ระบบ` / `Default` ถ้ามี
3. แก้ไข name / description / permissions แล้วกด `บันทึก`
4. ระบบ call `updateRole(id, patch)` → invalidate `['roles']` → ปิด modal + toast `อัปเดต Role "<name>" แล้ว`
5. `updatedAt` ถูกเซตเป็น `new Date().toISOString()` อัตโนมัติ

**Condition:**
1. ระบบรับ patch แบบ partial — field ที่ไม่ส่งมาจะคงค่าเดิม
2. Form ใช้ `destroyOnHidden` — เปิดใหม่จะ re-preset ทุกครั้ง
3. รวม Set ของ permissions ก่อน save (กัน duplicate)

**Edge Cases:**
1. **Default Role** (`isDefault: true`) — Permission section ถูกซ่อน + แสดงข้อความ "Default Role ไม่สามารถกำหนดสิทธิ์ใด ๆ ได้"; ถ้า force ส่ง permissions ≠ `[]` → throw `Default Role ต้องไม่มีสิทธิ์เมนูใด ๆ`
2. **System Role** (`isSystem: true`) — ช่อง `ชื่อ Role` ถูก disabled; ถ้าส่ง name ที่ต่างจากเดิม → throw `ไม่สามารถเปลี่ยนชื่อ Role ระบบได้`
3. Rename ชนกับ Role อื่น (case-insensitive) → throw `Role ชื่อ "<x>" มีอยู่แล้ว`
4. trim name แล้วว่าง → error: "กรุณาระบุชื่อ Role"
5. แก้ permissions ของ Role ที่มี officer ใช้อยู่ → officer ที่ login อยู่จะเห็นสิทธิ์ใหม่ภายใน 30 วินาที (polling) หรือทันทีเมื่อ focus tab
6. แก้ permissions ให้ลดลงจนเหลือ 0 → officer เห็นแค่ Dashboard ในรอบ sync ถัดไป
7. กดบันทึกโดยไม่แก้อะไรเลย → `updateMut` ยัง trigger (updatedAt เปลี่ยน) — ไม่กระทบ UI

**Effect to / Relate to:** ROLE-1.1, ROLE-1.6, AUTH-3.6 (cross-tab sync)

---

### ROLE-1.4 — ลบ Role · [RAOT-147](https://deeploytech-team.atlassian.net/browse/RAOT-147)

**Detail:**
1. Master กด `ลบ` ที่แถวใน table → ระบบเปิด `Modal.confirm` (Antd)
2. Modal แสดง:
   - Title: `ลบ Role "<name>"?`
   - Body: "เจ้าหน้าที่ที่ใช้ Role นี้จะถูกย้ายไปที่ Default Role โดยอัตโนมัติ (เห็นแค่ Dashboard) — ต้องการลบจริงหรือไม่?"
   - ปุ่ม `ลบ` (สีแดง) / `ยกเลิก`
3. กด `ลบ` → call `deleteRole(id)` → invalidate `['roles']` → toast `ลบ Role "<name>" แล้ว`

**Condition:**
1. ระบบไม่ cascade-update officers — role ที่ผูกอยู่ยังคงมี `roleId` ค้าง แต่ resolver fallback Default
2. Confirm modal ใช้ `okType: 'danger'` ให้ visual cue สีแดง

**Edge Cases:**
1. **System Role** (`isSystem: true`) — ปุ่ม `ลบ` disabled ใน UI; ถ้า call service ตรง ๆ → throw `ไม่สามารถลบ Role ระบบได้`
2. **Default Role** ลบไม่ได้ (`isSystem: true` ด้วย)
3. ลบ Role ที่ officer login อยู่ใช้ → ครั้งถัดไป `getRole(user.roleId)` คืน `null` → resolver fallback `getDefaultRole().permissions` (= `[]`) → sidebar เหลือเฉพาะ Dashboard ภายใน 30 วินาที, route guard kick กลับถ้าอยู่หน้าที่ไม่มีสิทธิ์แล้ว
4. กด `ยกเลิก` ใน confirm modal → ไม่มี side effect
5. กดลบซ้ำขณะ `deleteMut.isPending` — second click ที่ปุ่มลบ Modal.confirm จะ no-op (modal hide ตั้งแต่ครั้งแรก)
6. ลบ Role แล้ว Master ดู `/officer/officers` → คอลัมน์ Role ของ officer ที่ผูกอยู่แสดง "Default" (เพราะ lookup ใน useRolesList ไม่เจอ)
7. ลบ Role ที่ไม่มี officer ใช้ → ไม่มีผลกระทบต่อ session ใด ๆ

**Effect to / Relate to:** ROLE-1.1, AUTH-3.4 (fallback), AUTH-3.5 (route guard), OFF-2.6 (officer ถูก downgrade)

---

### ROLE-1.5 — Default Role (singleton, system-seeded) · [RAOT-148](https://deeploytech-team.atlassian.net/browse/RAOT-148)

> _Jira card นี้รวม **MIG-5.2** (Default Role Seeding) ด้วย_


**Detail:**
1. ตอน boot ครั้งแรก ถ้า `raot_roles` ว่าง → ระบบ auto-seed:
   - Default Role: `{ id: 'role-default', name: 'Default', permissions: [], isDefault: true, isSystem: true }`
   - Auction Demo: seed role ตัวอย่างที่มี ~12 เมนู (สำหรับ demo `officer02`)
2. Default Role ปรากฏใน table เหมือน Role อื่น แต่:
   - ปุ่ม `ลบ` disabled
   - Modal `แก้ไข` ซ่อน Permission section
   - ช่องชื่อ disabled
3. เป็น role fallback ของทุก officer ที่ไม่มี `roleId` หรือมี `roleId` ที่ชี้ไป Role ที่ถูกลบ

**Condition:**
1. `permissions: []` เสมอ — officer ที่ใช้ Default Role เห็นเฉพาะ Dashboard
2. `id = 'role-default'` เป็น constant ที่ exports จาก `types/role.ts` — ห้าม hardcode ใน UI
3. `getDefaultRole()` ต้องคืน Role เสมอ — ถ้า service เรียกแล้วไม่เจอ จะคืน in-memory fallback `DEFAULT_ROLE`

**Edge Cases:**
1. localStorage tamper ลบ Default หาย → `listRoles()` ตรวจ `!some(r => r.id === DEFAULT_ROLE_ID)` → prepend Default + save กลับ
2. มี Default Role มากกว่า 1 ใน storage (corruption) — `listRoles()` ไม่ enforce singleton; การ display แสดงทั้งคู่; id collision ไม่เกิด (id = `'role-default'` ตัวใหม่ก็คือ id เดิม) → ตอน save จะ overwrite
3. ถ้า Phase ถัดไปแก้ id ของ Default → ต้องเพิ่ม migration ใน `runStorageMigrations`
4. Master พยายามแก้ description ของ Default → save ผ่าน (เป็น field ที่ไม่ถูก lock)
5. Server-side render → `listRoles()` คืน null (typeof window check) → seed ไม่รัน; ครั้งแรกที่ client mount ค่อย seed

**Effect to / Relate to:** ROLE-1.3 (edit restrictions), ROLE-1.4 (delete blocked), AUTH-3.4 (fallback resolver), MIG-5.2 (seeding)

---

### ROLE-1.6 — เลือก Permission (Menu Catalog UI) · [RAOT-149](https://deeploytech-team.atlassian.net/browse/RAOT-149)

**Detail:**
1. ใน `RoleFormModal` Permission section render จาก `ASSIGNABLE_MENU_CATALOG` (7 กลุ่ม)
2. แต่ละกลุ่มแสดง:
   - หัวกลุ่ม + Checkbox `เลือกทั้งกลุ่ม` (พร้อม indeterminate state)
   - Checkbox grid 2 คอลัมน์ ของทุกเมนูในกลุ่ม
3. ลิงก์ `สลับเลือกทั้งหมด` ที่หัว Permission section toggle ทุกเมนู (เลือกทั้งหมด ↔ เคลียร์)
4. ค่า permissions ถูก persist เป็น array ของ menu key string

**Condition:**
1. Catalog source-of-truth = `src/features/roles/constants/menu-catalog.ts`
2. เมนูใน `MASTER_ONLY_KEYS` ถูก filter ออกจาก `ASSIGNABLE_MENU_CATALOG` — ปัจจุบัน Set ว่าง ทั้ง `roles` และ `officers` เป็น permission ที่ assign ให้ Role อื่นได้
3. `dashboard` ไม่อยู่ในตัวเลือก — เป็นสิทธิ์โดยปริยายของทุก officer (ดู MENU-6.2)
4. เมนูที่ checkbox = ตำแหน่ง `menuItem.key` (เช่น `'lot-registration'`, `'auction-control'`, `'roles'`, `'officers'`)
5. ค่าถูก dedupe (Set) ก่อน save

**Edge Cases:**
1. เพิ่มเมนูใหม่ใน catalog → checkbox ใหม่ render อัตโนมัติในรอบ render ถัดไป
2. เพิ่ม key เข้า MASTER_ONLY_KEYS → key ถูก filter ออกจาก checkbox grid ทันที (deploy ถัดไป Master เลือกไม่ได้)
3. กด "เลือกทั้งกลุ่ม" ขณะมี some-checked — indeterminate state → click จะ select-all-in-group
4. กด "เลือกทั้งกลุ่ม" ขณะ all-checked → unselect-all-in-group
5. กด "สลับเลือกทั้งหมด" ขณะมี some keys เลือกแล้ว → ถ้าไม่ครบทั้งหมด → เลือกทั้งหมด; ถ้าครบทั้งหมด → เคลียร์ทั้งหมด
6. Default Role section นี้ถูกซ่อน — render ข้อความ informational แทน
7. กรอก permission key ผ่าน devtools (เช่น `'fake-key'`) → save ผ่าน (service ไม่ validate กับ catalog); sidebar render ออกตอน filter (filterByPermissions ไม่เจอ menu item ที่ match key)
8. Non-Master ที่มี perm `roles` สร้าง Role ที่มี `roles`/`officers` ใน permissions → ระบบไม่กัน (privilege escalation อยู่ในความรับผิดชอบของ Master ที่ตัดสินใจ grant `roles` ให้ผู้ใช้นั้นตั้งแต่แรก)

**Effect to / Relate to:** ROLE-1.2, ROLE-1.3, MENU-6.1, MAS-4.2

---

## Epic: OFF — Officer Account Management

หน้า `/officer/officers` (เฉพาะ Master) — สร้าง / แก้ไข / suspend / reset password / ลบ บัญชีเจ้าหน้าที่

---

### OFF-2.1 — แสดงรายการเจ้าหน้าที่ · [RAOT-150](https://deeploytech-team.atlassian.net/browse/RAOT-150)

**Detail:**
1. ผู้ใช้ที่มีสิทธิ์ (Master หรือ officer ที่ Role มี `officers`) เปิด `/officer/officers` จาก sidebar
2. ระบบ render `OfficerListCard` พร้อม table ที่ประกอบด้วย:
   - **แถวแรก = Master row** (synthetic จาก MOCK_USER_ENTRIES) — Avatar icon มงกุฎสีม่วง + Tag `Master` สีม่วง
   - **แถวถัดไป = OfficerAccount** ทุก record จาก `raot_officer_accounts`
3. คอลัมน์:
   - **เจ้าหน้าที่** — Avatar + `fullName` + Tag `Master` (ถ้า Master row) + `username` (เทาเล็ก)
   - **อีเมล / โทร** — email บนสุด, phone (ถ้ามี) สีเทา
   - **Role** — Master แสดง "— (เห็นทุกเมนู)"; officer แสดง Tag เขียว (Default = Tag เทา) พร้อมชื่อ Role + icon กุญแจ
   - **สถานะ** — `ใช้งาน` (success) / `ระงับ` (warning); Master เสมอเป็น `ใช้งาน`
   - **จัดการ** — Master row ทุกปุ่ม disabled + tooltip; officer row ปกติแสดง `แก้ไข` / `รีเซ็ตรหัสผ่าน` / `ลบ`
4. ปุ่ม `+ เพิ่มเจ้าหน้าที่` มุมขวาบน เปิด `OfficerFormModal` ในโหมด create
5. Pagination 10 รายการต่อหน้า (Master row นับเป็น 1 รายการ)

**Condition:**
1. หน้านี้เข้าถึงได้ถ้า `user.role === 'master'` **หรือ** มี `'officers'` ใน effective permissions
2. **Master row** ถูก prepend เป็นแถวแรกเสมอ — ปุ่ม `แก้ไข` / `รีเซ็ตรหัสผ่าน` / `ลบ` disabled + tooltip "Master account ไม่สามารถจัดการจากที่นี่ได้" / "Master account ลบไม่ได้"
3. **บัญชี demo อื่น** (`officer01`, `officer02`, `buyer01`, `seller01`) ไม่ปรากฏใน table นี้ — เห็นเฉพาะ Master + OfficerAccount records
4. Role column lookup ผ่าน `useRolesList()` — ถ้า `roleId` ที่ผูกอยู่ไม่พบ Role → แสดง "Default"
5. Master row ใช้ `isMaster: true` flag เป็น discriminator — เป็น field row-local ไม่ persist กลับไป OfficerAccount
6. Master identity ใน row มาจาก `getMasterDisplayAccount()` ที่ exports จาก `auth.ts` (อ่านจาก `MOCK_USER_ENTRIES`) — **single source of truth** ไม่มี hardcoded duplicate ใน list-card

**Edge Cases:**
1. ยังไม่มี Master-created officer → table แสดงเฉพาะ Master row + Empty state ใน body หาย (เพราะมี row อย่างน้อย 1)
2. `officer.roleId` ที่ Role ถูกลบ → คอลัมน์ Role แสดง "Default" + Tag เทา (fallback ผ่าน roleNameById Map)
3. `officer.roleId === undefined` (Default มาแต่กำเนิด) → คอลัมน์แสดง "Default"
4. User ที่ไม่มีทั้ง `master` role และ `officers` perm พิมพ์ URL → `Result 403` ค้างไว้ + ปุ่มกลับ Dashboard
5. มี officer > 10 รายการ (รวม Master) → pagination ทำงาน; Master row จะอยู่หน้า 1 เสมอเพราะ prepend ก่อน slice
6. Mobile breakpoint → table scroll horizontal; ปุ่ม action stack เป็น vertical
7. Role list ยัง loading ขณะ render officer table → คอลัมน์ Role ของ officer ปกติแสดง "Default" ชั่วคราว (Map ว่าง); Master row ไม่กระทบ
8. Non-Master พยายามคลิกปุ่ม disabled ของ Master row → tooltip popup; ไม่มี action เกิด
9. Non-Master สร้าง officer แล้วต้องการลบ — ลบได้ปกติ (ไม่ใช่ Master row); สำหรับ Master row ทุก action disabled โดยไม่ขึ้นกับ user role

**Effect to / Relate to:** OFF-2.2, OFF-2.5, ROLE-1.1, AUTH-3.4, MAS-4.1

---

### OFF-2.2 — สร้างบัญชีเจ้าหน้าที่ · [RAOT-151](https://deeploytech-team.atlassian.net/browse/RAOT-151)

**Detail:**
1. Master กด `+ เพิ่มเจ้าหน้าที่` → เปิด `OfficerFormModal` ในโหมด create
2. กรอก:
   - **Username** (required) — pattern `^[a-z0-9._-]+$`, ≤ 32 ตัว
   - **รหัสผ่านเริ่มต้น** (required) — ≥ 8 ตัว, ≤ 64
   - **ชื่อ-นามสกุล** (required) — ≤ 100 ตัว
   - **อีเมล** (required, format email) — ≤ 120
   - **เบอร์โทรศัพท์** (optional) — ≤ 20
   - **Role** (required) — `<Select>` ที่ list มาจาก `useRolesList()` พร้อม Default และ count เมนู
   - **สถานะ** — Switch (ใช้งาน / ระงับ) default = ใช้งาน
3. กด `สร้างเจ้าหน้าที่` → call `addOfficerAccount()` → invalidate `['officers']` → toast `สร้างเจ้าหน้าที่ "<username>" แล้ว`

**Condition:**
1. `id` generate `OFF-<timestamp>`, `createdAt = new Date().toISOString()`
2. Password เก็บ plaintext (POC); production ต้องใช้ bcrypt
3. ถ้า Role select เลือก `DEFAULT_ROLE_ID` → service เซ็ต `roleId: undefined` (ไม่ persist `'role-default'`) เพื่อให้ resolver fallback ถูกต้อง

**Edge Cases:**
1. Username ซ้ำกับ `raot_officer_accounts` ที่มีอยู่ → throw `username "<x>" มีอยู่ในระบบแล้ว`
2. Username ซ้ำกับ MOCK_USER_ENTRIES (เช่น `officer01`, `buyer01`) → throw เดิม
3. Username = `'master'` → service throw `Master account ไม่สามารถจัดการจาก API นี้ได้` (hard guard ก่อน duplicate check) — ครอบครองชื่อ `master` ไม่ได้
4. Username มี uppercase / space / special อื่นนอกจาก `. _ -` → Form rule fail พร้อม inline message "ใช้ได้เฉพาะตัวอักษรพิมพ์เล็ก ตัวเลข . _ -"
5. Password < 8 ตัว → Form validator fail "อย่างน้อย 8 ตัวอักษร"
6. Email format ผิด → Form validator fail "รูปแบบอีเมลไม่ถูกต้อง"
7. ไม่เลือก Role → Form validator fail "กรุณาเลือก Role"
8. Phone ว่าง → ไม่ persist key `phone` (optional)
9. กด submit ซ้ำขณะ `createMut.isPending` → ปุ่ม OK loading กัน
10. กด `ยกเลิก` / ESC → ปิด modal; ฟอร์ม reset (destroyOnHidden)
11. ใส่ password ที่มี whitespace ขั้นต้น/ท้าย → service เก็บตรง ๆ (POC; production ควร normalize)

**Effect to / Relate to:** OFF-2.1, OFF-2.6, ROLE-1.1 (Role list), AUTH-3.2 (login), MAS-4.1 (master guard)

---

### OFF-2.3 — แก้ไขบัญชีเจ้าหน้าที่ · [RAOT-152](https://deeploytech-team.atlassian.net/browse/RAOT-152)

**Detail:**
1. Master กด `แก้ไข` ที่แถว → เปิด `OfficerFormModal` ในโหมด edit พร้อม preset
2. ฟอร์มแสดงทุก field เหมือนตอน create ยกเว้น:
   - **Username** disabled (ห้ามเปลี่ยน — เป็น primary key)
   - **รหัสผ่าน** ซ่อน (ใช้ปุ่ม `รีเซ็ตรหัสผ่าน` แยกต่างหาก)
3. แก้ field อื่น ๆ + เปลี่ยน Role + toggle สถานะ → กด `บันทึก`
4. Call `updateOfficerAccount(username, patch)` → invalidate → toast `อัปเดตเจ้าหน้าที่ "<username>" แล้ว`

**Condition:**
1. Username เปลี่ยนไม่ได้ — patch ที่ส่งไป service มี whitelist: `roleId | status | fullName | email | phone`
2. Form ใช้ `destroyOnHidden` — เปิดใหม่จะ re-preset ทุกครั้ง

**Edge Cases:**
1. เปลี่ยน Role ของ officer ขณะ login อยู่ — officer sidebar เห็นสิทธิ์ใหม่ภายใน 30 วินาที (polling) หรือทันทีเมื่อ focus tab; toast "สิทธิ์ของท่านถูกอัปเดตโดยผู้ดูแลระบบ"
2. Toggle status เป็น `ระงับ` ขณะ officer login → force logout ภายใน 30s + toast "บัญชีของท่านถูกระงับโดยผู้ดูแลระบบ"
3. แก้ Role เป็น Role ที่มี permissions น้อยลง → sidebar/menu officer ที่ login อยู่ลดสิทธิ์ทันที (รอบ sync ถัดไป)
4. แก้ Role เป็น Role ที่ถูกลบไปแล้ว (impossible UI flow แต่ถ้า devtools) → resolver fallback Default
5. แก้ค่าโดยไม่เปลี่ยนอะไรเลย → submit ยังคงเรียก updateMut (no-op สำหรับ resolver)
6. Master 2 tab แก้ officer คนเดียวกันพร้อมกัน → tab หลังชนะ (last-write-wins, ไม่มี optimistic locking)
7. Email format ผิด → Antd validator fail ก่อน submit
8. ถ้า call `updateOfficerAccount('master', ...)` ตรง (devtools) → service throw `Master account ไม่สามารถจัดการจาก API นี้ได้` — UI ของ Master row มีปุ่ม `แก้ไข` disabled อยู่แล้วเป็นชั้นแรก

**Effect to / Relate to:** OFF-2.1, OFF-2.4, AUTH-3.6 (sync), OFF-2.6, MAS-4.1 (master guard)

---

### OFF-2.4 — รีเซ็ตรหัสผ่าน · [RAOT-153](https://deeploytech-team.atlassian.net/browse/RAOT-153)

**Detail:**
1. Master กด `รีเซ็ตรหัสผ่าน` ที่แถว → เปิด `ResetPasswordModal`
2. กรอก:
   - **รหัสผ่านใหม่** (required, ≥ 8)
   - **ยืนยันรหัสผ่านใหม่** (required, ต้องตรงกับช่องบน)
3. กด `บันทึก` → call `setOfficerPassword(username, password)` → toast `รีเซ็ตรหัสผ่านของ "<username>" แล้ว`

**Condition:**
1. `setOfficerPassword` ทำงาน 2 mode:
   - ถ้า username อยู่ใน `raot_officer_accounts` → update inline + ลบ override (ถ้ามี)
   - ถ้า username อยู่ใน MOCK_USER_ENTRIES → write override ไป `raot_officer_password_overrides`
2. Effect ทันที — รอบ login ถัดไปใช้ password ใหม่
3. ฟอร์ม reset เมื่อเปิด modal ทุกครั้ง (useEffect on `open`)

**Edge Cases:**
1. รหัสผ่าน 2 ช่องไม่ตรงกัน → error toast "รหัสผ่านทั้งสองช่องไม่ตรงกัน" — ไม่ submit
2. รหัสใหม่ < 8 ตัวอักษร → Antd validator fail
3. รีเซ็ต password ของ built-in mock (`officer01`, `officer02`) → write ไป `raot_officer_password_overrides`; ครั้งถัดไปที่ `effectivePasswordFor()` ถูกเรียก จะใช้ override
4. **รีเซ็ต password ของ `master`** → service throw `Master account ไม่สามารถจัดการจาก API นี้ได้`; UI ของ Master row มีปุ่ม `รีเซ็ตรหัสผ่าน` disabled อยู่แล้ว. การหมุน password ของ Master ในเวอร์ชัน POC ต้องล้าง key `raot_officer_password_overrides['master']` ใน devtools เพื่อกลับไปใช้ seed `master1234`
5. รีเซ็ต password ของ Master-created officer → update inline + drop override (กัน override ค้าง)
6. Officer login อยู่ — session token เดิมยังใช้ได้จนหมดอายุ (TTL 1h หรือ 30d); ใช้รหัสใหม่ตอน login รอบหน้า
7. กด `ยกเลิก` / ESC → ปิด modal; ฟอร์ม reset
8. รีเซ็ต password ของ user ที่ไม่อยู่ทั้ง MOCK และ OfficerAccount → no-op (ไม่ throw)
9. รหัสผ่านมี whitespace ขั้นต้น/ท้าย → เก็บตรง ๆ (อาจ login ไม่ผ่านถ้า user พิมพ์โดยไม่มี space)

**Effect to / Relate to:** OFF-2.1, AUTH-3.2, MAS-4.1 (master guard)

---

### OFF-2.5 — ลบบัญชีเจ้าหน้าที่ · [RAOT-154](https://deeploytech-team.atlassian.net/browse/RAOT-154)

**Detail:**
1. Master หรือ officer ที่มี perm `officers` กด `ลบ` ที่แถว → ระบบเปิด `Modal.confirm`
2. Body: "การลบไม่สามารถย้อนกลับได้ ผู้ใช้รายนี้จะเข้าสู่ระบบไม่ได้อีก"
3. ปุ่ม `ลบ` (สีแดง) → call `removeOfficerAccount(username)` → toast `ลบบัญชี "<username>" แล้ว`

**Condition:**
1. ลบได้เฉพาะ officer ที่อยู่ใน `raot_officer_accounts` — built-in mocks (รวม Master) ไม่ปรากฏใน UI ในรูปที่ลบได้
2. **Master row** มีปุ่ม `ลบ` disabled พร้อม tooltip "Master account ลบไม่ได้" — ไม่มีทางลบผ่าน UI
3. ลบเสร็จ — `getOfficerAccount(username)` คืน null ครั้งถัดไป
4. ลบแล้ว Role ที่ผูกอยู่ไม่ได้ถูกลบ — แค่ตัด link

**Edge Cases:**
1. ลบ officer ขณะ login อยู่ → `refreshSession()` รอบถัดไปคืน `'gone'` → force logout + toast "บัญชีของท่านไม่อยู่ในระบบแล้ว กรุณาเข้าสู่ระบบใหม่"
2. กด `ยกเลิก` ใน confirm modal → no-op
3. ลบ built-in mock (officer01/officer02) ผ่าน UI → ไม่มีปุ่มให้กด (ไม่ปรากฏใน table); ถ้า call `removeOfficerAccount('officer01')` ตรง ๆ → no-op (ไม่อยู่ใน storage)
4. **ลบ Master** ผ่าน UI — ปุ่ม disabled; ถ้า call `removeOfficerAccount('master')` ตรง (devtools/หรือ malicious caller) → service throw `Master account ไม่สามารถจัดการจาก API นี้ได้` (hard guard ใน service layer — defense-in-depth ชั้นที่ 6)
5. ลบ password override ของ officer ที่ถูกลบ — overrides ยังค้างใน `raot_officer_password_overrides` (ไม่ cascade); ครั้งถัดไป login username เดิม (ถ้า Master สร้างใหม่) จะใช้ override password
6. Master 2 tab ลบ officer เดียวกันพร้อมกัน → tab หลังลบเป็น no-op (idempotent)
7. ลบ officer ที่ Role ของเขาก็เพิ่งถูกลบไปด้วย → no-op (ทั้งสอง side ลบสำเร็จ)
8. Non-Master กด `ลบ` ที่ Master row — เป็นไปไม่ได้ (ปุ่ม disabled); service guard ก็กันอีกชั้น

**Effect to / Relate to:** OFF-2.1, AUTH-3.6

---

### OFF-2.6 — Assign Role ให้ Officer · [RAOT-155](https://deeploytech-team.atlassian.net/browse/RAOT-155)

**Detail:**
1. ทั้งในโหมด create และ edit ของ `OfficerFormModal` มีช่อง `Role` เป็น `<Select>`
2. Option list มาจาก `useRolesList()` — เรียงตามลำดับใน storage; Default มักอยู่บนสุดเพราะถูก seed ก่อน
3. แต่ละ option แสดง:
   - ชื่อ Role
   - Tag `Default` ถ้าเป็น Default
   - ถ้าไม่ใช่ Default → text เทา "(<n> เมนู)"
4. เลือก Role แล้ว save → ระบบ map:
   - ถ้า roleId = `DEFAULT_ROLE_ID` → persist `roleId: undefined`
   - ถ้า roleId อื่น → persist `roleId: '<id>'`

**Condition:**
1. Field required — ถ้าไม่เลือก → error: "กรุณาเลือก Role"
2. ระบบไม่จำกัดจำนวน officer ต่อ Role
3. การ assign Role ที่ permissions ว่าง (เช่น Default หรือ Role ที่สร้างใหม่โดยไม่เลือกเมนูเลย) — officer เห็นแค่ Dashboard

**Edge Cases:**
1. ตอนเปิด edit modal officer มี `roleId` ที่ Role ถูกลบไปแล้ว → ค่า select จะว่าง (Antd ไม่ match option ได้), Master ต้องเลือก Role ใหม่ก่อน save (validator จะกัน)
2. การเปลี่ยน Role ของ officer เป็น Role ที่มีสิทธิ์น้อยลง — sidebar/menu officer ที่ login อยู่ลดสิทธิ์ทันที (รอบ sync ถัดไป)
3. การเปลี่ยน Role เป็น Role ที่มีสิทธิ์เพิ่มขึ้น — sidebar/menu officer เห็นเมนูใหม่ในรอบ sync ถัดไป
4. Assign Role ที่ permissions ว่าง (Role เพิ่งสร้าง) → officer เห็นแค่ Dashboard เหมือน Default
5. Role list ยัง loading ตอนเปิด modal — `<Select>` แสดง option ว่าง; เมื่อ resolve จะ populate (Antd auto-rerender)
6. เลือก Default Role ตอน edit แล้ว save → ระบบ persist `roleId: undefined` (ไม่ใช่ `'role-default'`) — ทำให้ resolver fallback ผ่าน undefined branch
7. Officer หลายคนผูก Role เดียวกัน — ทุกคนได้รับ permissions เหมือนกัน; แก้ Role 1 ครั้ง = อัปเดตทุกคน

**Effect to / Relate to:** ROLE-1.1, OFF-2.2, OFF-2.3, AUTH-3.4

---

### OFF-2.7 — Suspend / Activate Officer · [RAOT-156](https://deeploytech-team.atlassian.net/browse/RAOT-156)

**Detail:**
1. ใน `OfficerFormModal` มี Switch `สถานะ` (ใช้งาน / ระงับ)
2. Master toggle แล้วกด `บันทึก` → patch `status: 'active' | 'suspended'`

**Condition:**
1. Status default = `'active'` ตอนสร้างใหม่
2. ระงับแล้ว reactivate ได้ทุกเมื่อ — sidebar/menu คืนสภาพปกติเมื่อ login ใหม่

**Edge Cases:**
1. Officer ที่ `status === 'suspended'` ตอน login → throw `AuthError('ACCOUNT_SUSPENDED', 'บัญชีของท่านถูกระงับ กรุณาติดต่อเจ้าหน้าที่')`
2. Officer ถูก suspend ขณะ login ค้างอยู่ → `refreshSession()` คืน `'suspended'` → RoleLayout call `logout()` + toast `บัญชีของท่านถูกระงับโดยผู้ดูแลระบบ` → redirect `/login`
3. Suspend Master ไม่ได้ — Master เป็น built-in mock ไม่ได้อยู่ใน OfficerAccount; ไม่มี UI ให้กด
4. Master 2 tab toggle suspend ของ officer เดียวกันพร้อมกัน → tab หลังชนะ (last-write-wins)
5. Reactivate ขณะ session officer ยังไม่หมดอายุ — officer ต้อง login ใหม่อยู่ดี (logout ไปแล้ว)
6. Suspend แล้ว login ใหม่ทันที (ถ้ามี cached session ที่ TTL ยังไม่หมด) → consumeSession ผ่าน แต่ refreshSession รอบ poll ถัดไปคืน 'suspended' → logout

**Effect to / Relate to:** OFF-2.3, AUTH-3.2, AUTH-3.6

---

## Epic: AUTH — Authentication & Authorization

---

### AUTH-3.1 — Master Login · [RAOT-41](https://deeploytech-team.atlassian.net/browse/RAOT-41)

> _Merged เข้า [RAOT-41](https://deeploytech-team.atlassian.net/browse/RAOT-41) (AUTH-1.2 Login — Master & Officer); RAOT-157 ถูก Reject เป็น duplicate_


**Detail:**
1. ผู้ใช้เปิด `/login/admin` (officer-side login page)
2. กรอก username `master` + password `master1234`
3. กด `เข้าสู่ระบบ` → `loginWithCredentials(username, password, remember)` match กับ MOCK_USER_ENTRIES
4. Session ถูกเขียน (`raot_auth` ใน localStorage ถ้า remember, ไม่งั้นใน sessionStorage)
5. Router push ไป `/officer/dashboard`

**Condition:**
1. Password ตรวจผ่าน `effectivePasswordFor(username)` — ใช้ override ถ้ามี ไม่งั้นใช้ของ seed
2. `user.role === 'master'` — sidebar/route guard treat เสมือนมีทุก permission
3. หน้า `/login/admin` แสดง demo creds 3 ตัว: master, officer01, officer02
4. หน้านี้ `hideRolePicker=true` — auto-detect role จาก username; ไม่มี dropdown ให้เลือก
5. Session TTL: 1 ชั่วโมง (default), 30 วัน (ถ้า remember)

**Edge Cases:**
1. Master login จากหน้า `/login` (buyer/seller) → post-login check `allowedRoles.includes('master')` fail → throw + auto-logout + error "บัญชีนี้ไม่อนุญาตให้เข้าสู่ระบบจากหน้านี้"
2. Password ผิด → throw `INVALID_CREDENTIALS` ("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง") — ไม่บอกว่า user มี
3. Master พยายาม suspend ตัวเอง — เป็นไปไม่ได้ (ไม่อยู่ใน OfficerAccount UI)
4. Reset Master password ผ่าน setOfficerPassword('master', ...) → write override → ครั้งถัดไป login ใช้ password ใหม่
5. Token format: `mock-token-master` (ไม่มี timestamp — เพราะมีคนเดียว)
6. ปิด tab โดย remember-me checked → กลับมาเปิด `/officer/dashboard` ภายใน 30 วัน → session ยังอยู่
7. ปิด tab โดยไม่ remember → session หาย → ต้อง login ใหม่

**Effect to / Relate to:** AUTH-3.2, AUTH-3.3, MAS-4.1, MAS-4.3

---

### AUTH-3.2 — Officer Login · [RAOT-41](https://deeploytech-team.atlassian.net/browse/RAOT-41)

> _Merged เข้า [RAOT-41](https://deeploytech-team.atlassian.net/browse/RAOT-41) (AUTH-1.2 Login — Master & Officer); RAOT-158 ถูก Reject เป็น duplicate_


**Detail:**
1. ผู้ใช้กรอก username (`officer01`, `officer02`, หรือ account ที่ Master สร้าง) + password
2. `loginWithCredentials` ตรวจตามลำดับ:
   1. MOCK_USER_ENTRIES (built-in: officer01, officer02)
   2. `raot_officer_accounts` (Master-created)
   3. `raot_pending_credentials` (buyer/seller wizard — ผ่านแต่ throw PENDING)
3. ถ้า match + status active → write session → redirect `/officer/dashboard`

**Condition:**
1. Token รูปแบบ `mock-token-<account.id>-<timestamp>` (มี timestamp เพื่อ unique ต่อ session)
2. Officer ที่สร้างผ่าน Master ไม่มี role hardcoded — derive role = `'officer'` เสมอ

**Edge Cases:**
1. Username ไม่อยู่ไหนเลย → throw `INVALID_CREDENTIALS` ("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")
2. Password ไม่ตรง → throw `INVALID_CREDENTIALS` (กลั่นข้อความ — ไม่บอกว่า user มีอยู่)
3. Status = `'suspended'` → throw `ACCOUNT_SUSPENDED`
4. Status = `'pending'` (built-in mock — เป็นไปไม่ได้สำหรับ officer แต่กันไว้) → throw `ACCOUNT_PENDING`
5. Officer login จาก `/login` (buyer/seller) → post-login check fail → auto-logout + error message
6. Login พร้อม remember → localStorage TTL 30d; ไม่ remember → sessionStorage TTL 1h
7. Master เพิ่งลบ Role ของ officer แล้ว officer login → ผ่าน, sidebar เห็นแค่ Dashboard (Default fallback)
8. Master เพิ่ง suspend officer ระหว่างที่เพิ่งกรอก form แล้วยังไม่ submit → กด login → throw ACCOUNT_SUSPENDED

**Effect to / Relate to:** AUTH-3.1, AUTH-3.3, OFF-2.7, MIG-5.3 (built-in mocks)

---

### AUTH-3.3 — Session Management · [RAOT-159](https://deeploytech-team.atlassian.net/browse/RAOT-159)

**Detail:**
1. Session envelope: `{ user, token, expiresAt }` เก็บใน localStorage (remember) หรือ sessionStorage (one-shot)
2. `getSession()` คืน session ถ้ายังไม่หมดอายุ; `consumeSession()` คืน `'valid' | 'expired' | 'none'`
3. `RoleLayout` call `consumeSession()` ตอน mount:
   - `'expired'` → redirect `/login?reason=expired` (login page อ่าน param แล้ว toast "เซสชันหมดอายุ")
   - `'none'` → redirect `/login`
   - `'valid'` → ตรวจ `canEnter(user, requiredRole)` ต่อ
4. Logout → `clearSessionStorage()` (ลบทั้ง localStorage และ sessionStorage)

**Condition:**
1. Remember-me toggle ที่ login → ถ้า checked เก็บ localStorage TTL 30 วัน; ถ้า uncheck เก็บ sessionStorage TTL 1 ชม.
2. Token ใช้ใน Authorization header ของ axios interceptors (project-wide infra)

**Edge Cases:**
1. Session expired ขณะใช้งาน — รอบ poll ถัดไป (30s) จะเจอ → redirect `/login?reason=expired` + toast "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"
2. `expiresAt` < `Date.now()` ตอน mount → consumeSession คืน `'expired'` → ลบ session ทั้ง localStorage + sessionStorage + redirect login
3. ปิด tab โดยไม่ remember → session หายทันที (sessionStorage)
4. ปิด session ฝั่งเดียว (logout ใน tab A) → tab B ตรวจเจอใน storage event + sync → redirect login
5. localStorage ถูก clear โดยตรง (devtools) → consumeSession คืน `'none'` → redirect login
6. JSON ของ session envelope corrupt (เช่น manual edit) → `JSON.parse` throw → readSessionEnvelope คืน null → ถือเป็น 'none'
7. ปิด tab ขณะ session อยู่ใน sessionStorage แล้วเปิดใหม่ใน tab ใหม่ของเดียวกัน → sessionStorage ไม่ share → session หาย
8. Cross-device (login บน laptop + login บน mobile) — token ไม่ check unique device; ทั้งสอง device session ใช้งานพร้อมกันได้

**Effect to / Relate to:** AUTH-3.1, AUTH-3.2, AUTH-3.6

---

### AUTH-3.4 — Permission Resolution · [RAOT-160](https://deeploytech-team.atlassian.net/browse/RAOT-160)

> _Jira card นี้รวมหมายเหตุของ **MAS-4.3** (Master Bypass Layer 1) ด้วย_


**Detail:**
1. `resolvePermissionsForUser(user: User): string[]` ใน `src/features/roles/services/permissions.ts`
2. Logic ตามลำดับ:
   1. `user.role === 'master'` → คืน `ALL_MENU_KEYS` (รวม `roles`, `officers`)
   2. `user.role !== 'officer'` (buyer/seller) → คืน `[]`
   3. `!user.roleId` → คืน `getDefaultRole().permissions` (= `[]`)
   4. มี `roleId` แต่ `getRole(roleId)` คืน `null` → fallback `getDefaultRole().permissions`
   5. มี Role ปกติ → คืน `role.permissions`
3. ผลลัพธ์ใช้ใน sidebar filter, route guard, และ Dashboard chip list

**Condition:**
1. ผลลัพธ์ **ไม่รวม** `dashboard` — เป็นสิทธิ์โดยปริยาย (sidebar เพิ่มเอง, guard อนุญาตเสมอ)
2. ผลลัพธ์ **ไม่ใช่ Set** — เป็น array; consumer ต้อง dedupe เองถ้าต้องการ
3. resolver ไม่อ่าน session — รับ `user` object เป็น argument; ทำให้ pure + ทดสอบง่าย

**Edge Cases:**
1. Master → ทุกครั้งคืน `ALL_MENU_KEYS` (รวม master-only keys เช่น `'roles'`)
2. Officer มี `roleId` valid → คืน `role.permissions` ตามที่ persist
3. Officer ไม่มี `roleId` (undefined) → คืน `getDefaultRole().permissions` (= `[]`)
4. Officer มี `roleId` แต่ Role ถูกลบไปแล้ว → คืน Default permissions; ไม่ throw
5. Buyer / Seller → คืน `[]` (sidebar ของ buyer/seller ใช้ map ของตัวเองไม่อิง catalog)
6. Master โดน Master ลบ Role default (impossible — ระบบกัน) — Master ยังคืน ALL_MENU_KEYS
7. user.role เป็นค่าอื่นที่ไม่อยู่ใน UserRole enum (corruption) → คืน `[]`
8. localStorage ของ `raot_roles` corrupt — `getRole` คืน null สำหรับทุก id → officer ทุกคน fallback Default

**Effect to / Relate to:** ROLE-1.5 (default fallback), MENU-6.2 (dashboard implicit), AUTH-3.5

---

### AUTH-3.5 — Route Guard / Menu Filtering · [RAOT-161](https://deeploytech-team.atlassian.net/browse/RAOT-161)

**Detail:**
1. ทุก `(dashboard)/officer/*` ผ่าน layout `officer/layout.tsx` ที่ wrap ด้วย `<RoleLayout requiredRole="officer">`
2. `RoleLayout` ทำ 3 ระดับการป้องกัน:
   - **Initial mount check** — ถ้า `!canEnter(user, requiredRole)` → redirect home
   - **Route segment check** — ทุกครั้งที่ pathname เปลี่ยน อ่าน segment ที่ 2 (`/officer/<X>`) แล้วเทียบ `resolvePermissionsForUser(user)` ถ้าไม่ผ่าน → toast warning + redirect dashboard
   - **Session sync check** — polling 30s + storage event + focus event → ถ้า user.role/roleId/status เปลี่ยน → update sidebar / force logout
3. Sidebar render เฉพาะเมนูที่ user มีสิทธิ์ (filter `OFFICER_MENU` ผ่าน `filterByPermissions`)

**Condition:**
1. Master ผ่าน guard `requiredRole='officer'` เสมอ (`canEnter()` whitelist master)
2. Master ผ่าน segment check เสมอ (resolver คืน `ALL_MENU_KEYS`)
3. Dashboard เข้าได้เสมอ — segment check skip ถ้า `segment === 'dashboard'`

**Edge Cases:**
1. Officer พิมพ์ URL ตรงไปเมนูที่ไม่มีสิทธิ์ (เช่น `/officer/payment-settings`) → segment check fail → toast "สิทธิ์ของท่านไม่อนุญาตให้เข้าหน้านี้ — กลับไปยัง Dashboard" → redirect `/officer/dashboard`
2. Buyer/Seller เข้า `/officer/*` ตรง ๆ → `canEnter` คืน false → redirect `/buyer/dashboard` หรือ `/seller/dashboard`
3. Master พิมพ์ `/officer/<menu ใดก็ได้>` → ผ่านเสมอ (รวม `/officer/roles`, `/officer/officers`)
4. Master พิมพ์ `/buyer/*` หรือ `/seller/*` → canEnter false (master ไม่ใช่ buyer/seller) → redirect `/officer/dashboard`
5. Officer อยู่หน้าที่เคยมีสิทธิ์แล้ว Role ถูกลบ → sync รอบถัดไป (30s/focus) เห็นว่าไม่มีสิทธิ์ → toast + redirect dashboard
6. Session expire ขณะใช้งาน → sync detects → redirect login (overrides segment check)
7. Race ระหว่าง initial mount และ route segment effect → `handledRevocation` ref กันไม่ให้ redirect/toast ซ้ำ
8. Officer ที่ Role มี `'roles'` key (data corruption หรือ devtools mutation) → sidebar filter ออกที่ MASTER_ONLY_KEYS step + segment check ของ `/officer/roles` page ก็ gate ที่ runtime
9. URL `/officer/` (ไม่มี segment) → Next.js render 404 (ไม่มี page.tsx ที่ root /officer/)

**Effect to / Relate to:** AUTH-3.4, AUTH-3.6, MAS-4.3

---

### AUTH-3.6 — Cross-tab / Cross-device Sync · [RAOT-162](https://deeploytech-team.atlassian.net/browse/RAOT-162)

**Detail:**
1. `RoleLayout` ติดตั้ง 3 trigger เพื่อ sync session:
   - **Storage event** — `window.addEventListener('storage', ...)` — fire ใน tab อื่นเมื่อ key ใน `SYNC_KEYS` (`raot_auth`, `raot_officer_accounts`, `raot_officer_password_overrides`, `raot_roles`) เปลี่ยน
   - **Focus event** — เมื่อ user สลับกลับมา tab — ดักการเปลี่ยน same-tab
   - **Polling** — `setInterval(syncSession, 30_000)` — fallback กรณีไม่มี trigger
2. `refreshSession()` คืน:
   - `'unchanged'` — no-op
   - `'updated'` — update sidebar/header เห็นข้อมูลใหม่ทันที + toast "สิทธิ์ของท่านถูกอัปเดต"
   - `'role_changed'` — force logout + toast "บทบาทถูกเปลี่ยน — กรุณา login ใหม่"
   - `'suspended'` / `'gone'` — force logout
   - `'no-session'` — redirect login

**Condition:**
1. `handledRevocation` ref ป้องกัน trigger ซ้ำ (storage + focus + polling อาจ fire พร้อมกัน)
2. `sameUser()` เทียบ id / username / role / roleId / status / fullName — ฟิลด์อื่นเปลี่ยนไม่ trigger update

**Edge Cases:**
1. Same-tab admin action (Master แก้ role ใน tab เดียวกับที่ login officer ไม่ได้ — แต่ถ้า devtools sim) → storage event ไม่ fire; focus event + polling จึงสำคัญ
2. Cross-tab (Master ใน tab A เปลี่ยน Role ของ officer ที่ login ใน tab B) → storage event fire ใน tab B → sync → toast "สิทธิ์อัปเดต"
3. Cross-device (Master บน laptop, officer บน mobile) → polling 30s
4. Master ลบ Role ที่ officer ใช้ → refreshSession เห็น roleId เดิม แต่ resolver คืน Default; sameUser test fail → `'updated'` → sidebar refresh + toast
5. Master เปลี่ยน user.role primitive (officer ↔ master) → ปัจจุบัน UI ไม่มี → role_changed scenario เป็น edge case ของ refactor future
6. Master suspend officer → `refreshSession` คืน `'suspended'` → force logout + toast
7. Master ลบ officer → `'gone'` → force logout + toast
8. Polling 30s = trade-off ระหว่าง responsiveness และ load; user เห็นการเปลี่ยนแปลงล่าช้าสุด 30 วินาที + 1 รอบ render
9. Multiple toast trigger (เช่น storage + focus + polling พร้อมกัน) → handledRevocation block หลัง 1 toast แรก
10. ปิด focus event ที่ browser block (cross-origin iframe) → fallback polling

**Effect to / Relate to:** AUTH-3.4, AUTH-3.5, ROLE-1.3, ROLE-1.4, OFF-2.3, OFF-2.5, OFF-2.7

---

## Epic: MAS — Master Account

---

### MAS-4.1 — Master Seed Account · [RAOT-163](https://deeploytech-team.atlassian.net/browse/RAOT-163)

> _Jira card นี้รวม **MAS-4.2** (Master-Only Menus) + **MAS-4.3** (Bypass Filter) + **MIG-5.3** (Demo Accounts Seeding) ด้วย_


**Detail:**
1. Master account ฝังในโค้ดที่ MOCK_USER_ENTRIES:
   - username: `master`
   - password: `master1234`
   - role: `'master'`
   - fullName: `ผู้ดูแลระบบหลัก`
2. Account นี้ทำงานหลังจาก `runStorageMigrations()` รันครบ (ไม่ต้อง seed เข้า localStorage)
3. **Service-layer protection**: `auth.ts` export `MASTER_USERNAME = 'master'`, `isMasterUsername(name)` predicate, และ `getMasterDisplayAccount()` ที่ build snapshot จาก MOCK_USER_ENTRIES (UI ใช้ render Master row โดยไม่ duplicate identity fields)
4. Mutation guard: `addOfficerAccount`, `updateOfficerAccount`, `removeOfficerAccount`, `setOfficerPassword` ทั้ง 4 throw `Master account ไม่สามารถจัดการจาก API นี้ได้` ถ้า username = `'master'`

**Condition:**
1. Master เป็น singleton — ไม่มี mechanism สร้าง Master เพิ่ม (Phase 1–3 scope)
2. Master ไม่อยู่ใน `raot_officer_accounts` — แต่ปรากฏใน UI `/officer/officers` ผ่าน synthetic row (ดู OFF-2.1)
3. Master ไม่มี `roleId` — resolver ตรวจ `role === 'master'` ก่อนทุก case
4. `isMasterUsername(name)` เป็น predicate กลาง — อนาคต multi-master schema เปลี่ยนที่นี่ที่เดียว

**Edge Cases:**
1. **เปลี่ยน password ของ Master ผ่าน `setOfficerPassword('master', ...)`** → service throw (hard guard); rotation ของ Master password ใน POC ต้องล้าง `raot_officer_password_overrides['master']` ผ่าน devtools เพื่อกลับไปใช้ seed
2. Master suspend ไม่ได้ — `MOCK_USER_ENTRIES.user.status` hardcode `'active'`; UI Master row Switch สถานะไม่มี (status column แสดง "ใช้งาน" เสมอ); ถ้า call `updateOfficerAccount('master', { status: 'suspended' })` ตรง → service throw
3. Master ลบไม่ได้ — UI ปุ่ม `ลบ` disabled + service `removeOfficerAccount('master')` throw
4. ครอบครอง username `master` ไม่ได้ — `addOfficerAccount({ username: 'master', ... })` throw ก่อน duplicate check
5. ถ้า Phase ถัดไปต้องการ multi-master — ต้องเพิ่ม `isMaster: boolean` ที่ OfficerAccount + ปรับ `isMasterUsername` predicate; Phase 1–3 ไม่ support
6. ถ้า code ใน UI assume `user.roleId !== undefined` (เช่น lookup Role ทันที) → crash สำหรับ Master; ต้อง guard `if (user.role === 'officer')` ก่อน
7. `getMasterDisplayAccount()` throw ถ้า MOCK_USER_ENTRIES ไม่มี master entry — เป็น programming error ไม่ใช่ runtime case

**Effect to / Relate to:** AUTH-3.1, MAS-4.2, MAS-4.3, MIG-5.3, OFF-2.1 (Master row), OFF-2.2/2.3/2.4/2.5 (mutation guards)

---

### MAS-4.2 — Master-Only Menus · _merged into_ [RAOT-163](https://deeploytech-team.atlassian.net/browse/RAOT-163)

**Detail:**
1. Catalog มี key `'roles'` และ `'officers'` ใน `OFFICER_MENU_CATALOG` (เพื่อ render เป็นเมนูใน sidebar)
2. `MASTER_ONLY_KEYS` (ปัจจุบัน = Set ว่าง) เป็น mechanism กรองเมนูออกจาก:
   - `ASSIGNABLE_MENU_KEYS` / `ASSIGNABLE_MENU_CATALOG` — Role form ไม่แสดง checkbox ของ key เหล่านี้
   - Sidebar ของ officer ปกติ — filter ออกหลัง resolver (master ไม่กระทบ)
3. หน้า `/officer/roles` และ `/officer/officers` ใช้ gate logic:
   ```ts
   const allowed = user.role === 'master' || perms.includes('roles' | 'officers');
   ```
   → ไม่มีสิทธิ์ = `Result 403` ค้างไว้

**Condition:**
1. ถ้าเพิ่ม Master-only menu ในอนาคต (ห้ามให้ Role อื่น assign) → ใส่ key ใน `MASTER_ONLY_KEYS` + เพิ่ม runtime gate ในหน้า page
2. Master เห็น `roles` + `officers` ใน sidebar เสมอ — filterByPermissions allow ผ่านเพราะ resolver คืน `ALL_MENU_KEYS`
3. Non-Master ที่ Role มี perm `roles` หรือ `officers` ก็เห็นเมนูเหล่านี้ใน sidebar และเข้าหน้านั้นได้

**Edge Cases:**
1. Master grant `'roles'` ให้ Role อื่น → save ผ่าน, Role นั้นเข้า `/officer/roles` ได้ — สามารถ CRUD Role ทั่วไป; system Role (Default) ยัง locked
2. Master grant `'officers'` ให้ Role อื่น → save ผ่าน, Role นั้นเข้า `/officer/officers` ได้ — สามารถ CRUD officer ทั่วไป; **Master row** ที่ pin บนสุดของ table มีปุ่มจัดการ disabled ทั้งหมด (ไม่สามารถลบ/แก้/รีเซ็ต)
3. Non-Master ที่ได้ perm `roles` + `officers` ครบ — เทียบเท่า "second-tier admin"; สามารถสร้าง Role ใหม่ + assign permissions + จัดการ officer; **แต่ไม่สามารถแตะ Master account** (ห้ามผ่าน UI disable)
4. Non-Master สร้าง Role ใหม่แล้ว assign permission `roles` หรือ `officers` ให้ Role นั้น — save ผ่าน (ไม่กัน privilege escalation; Master ตัดสินใจ grant `roles` ให้ผู้ใช้แล้วถือว่ายอมรับ chain นี้)
5. Officer ที่ Role มี key `'roles'`/`'officers'` (รับมาจาก Master) → sidebar แสดงเมนู, page gate ผ่าน
6. Master ใช้ devtools manipulate Role ที่ตัวเองใช้ — ไม่กระทบ (resolver early-return master ก่อน)
7. ถ้าใส่ key ใหม่ใน `MASTER_ONLY_KEYS` แต่ลืม runtime gate ในหน้า page → sidebar filter ออก แต่ direct URL เข้าได้ (security gap)
8. Master ลบบัญชีตัวเองผ่าน UI → ไม่ได้ (ปุ่ม disabled ใน Master row)

**Effect to / Relate to:** MENU-6.1, ROLE-1.6, AUTH-3.5, OFF-2.1, OFF-2.5, MAS-4.1

---

### MAS-4.3 — Master Bypass Permission Filter · _merged into_ [RAOT-163](https://deeploytech-team.atlassian.net/browse/RAOT-163) + [RAOT-160](https://deeploytech-team.atlassian.net/browse/RAOT-160)

**Detail:**
1. ทุก permission check ที่เกี่ยวกับ officer side มี early-return สำหรับ master (defense-in-depth 6 ชั้น):
   - **Layer 1** `resolvePermissionsForUser(user)` — return `ALL_MENU_KEYS` ก่อนเช็ค roleId
   - **Layer 2** `canAccessMenu(user, key)` — return `true` ก่อนเช็ค permissions
   - **Layer 3** `RoleLayout.canEnter(user, 'officer')` — return `true` สำหรับ master
   - **Layer 4** `RoleLayout` route segment guard — skip ถ้า `user.role === 'master'`
   - **Layer 5** Sidebar filter — master ไม่โดน MASTER_ONLY_KEYS filter
   - **Layer 6** Service-layer guard — `addOfficerAccount` / `updateOfficerAccount` / `removeOfficerAccount` / `setOfficerPassword` throw ถ้า `isMasterUsername(name)` (กันไม่ให้ non-Master แตะ Master account ผ่าน API)

**Condition:**
1. Master access ทุก route ภายใต้ `/officer/*` ได้
2. Master ไม่ access route ภายใต้ `/buyer/*` หรือ `/seller/*` (canEnter ตรวจ exact role ก่อน fallback)

**Edge Cases:**
1. Master เข้า `/officer/<any-key>` — ผ่านทุก check แม้ key นั้นจะไม่อยู่ใน catalog (เช่นพิมพ์ `/officer/fake-page`) → ขึ้นกับว่ามี page file หรือไม่; ถ้าไม่มี → Next.js 404; ถ้ามี → render
2. Master พิมพ์ `/buyer/dashboard` → canEnter('buyer') false (master ≠ buyer) → redirect `/officer/dashboard`
3. Master ไม่มี `roleId` — code ที่ assume `user.roleId !== undefined` จะ crash; ต้อง guard ด้วย `if (s.user.role === 'officer')` ก่อน lookup (เห็นใน /officer/dashboard page snapshot)
4. ถ้าระบบเพิ่ม buyer/seller-only menu — Master เข้าไม่ได้ (เป็น officer-side bypass เท่านั้น)
5. Master เปลี่ยน Role ของตัวเองผ่าน devtools (เช่น set role='officer') — ครั้งถัดไป resolver จะใช้ Default branch → เห็นแค่ Dashboard (downgrade ตัวเอง)
6. Master assign permission ที่ตัวเองไม่ได้ — irrelevant (resolver ไม่เคยอ่าน roleId ของ master)

**Effect to / Relate to:** AUTH-3.4, AUTH-3.5, MAS-4.2

---

## Epic: MIG — Migration & Seeding

---

### MIG-5.1 — Storage Migration (v2) · _ไม่สร้างการ์ด_

> _Infrastructure-only migration runner — ไม่มี user-facing feature; ทดสอบโดยอ้อมผ่าน [RAOT-148](https://deeploytech-team.atlassian.net/browse/RAOT-148) (ROLE-1.5) และ [RAOT-163](https://deeploytech-team.atlassian.net/browse/RAOT-163) (MAS-4.1)_


**Detail:**
1. `runStorageMigrations()` ใน `src/features/auth/services/migrations.ts` ถูกเรียกครั้งเดียวที่ `ThemedShell` mount (root layout)
2. ตรวจ `localStorage.getItem('raot_storage_version')`:
   - ถ้า === `'2'` → no-op
   - ถ้าไม่ใช่ → ลบ LEGACY_KEYS (`raot_auth`, `raot_officer_accounts`, `raot_officer_password_overrides`, `raot_officer_permission_overrides`, `raot_roles`) จากทั้ง localStorage + sessionStorage → เซต version = `'2'`

**Condition:**
1. Idempotent — รอบที่ 2 เป็น no-op
2. **Destructive** — ผู้ใช้ที่เคย login (เช่น คน demo Phase 1) จะถูก logout ครั้งเดียวรอบแรกของ Phase 2 deploy
3. `raot_pending_credentials` ไม่อยู่ใน LEGACY_KEYS — buyer/seller registration ที่ค้างอยู่ไม่ถูกล้าง

**Edge Cases:**
1. ไม่มี `raot_storage_version` key (first ever boot) → wipe LEGACY_KEYS + set version=2; user ถูก logout 1 ครั้ง
2. Version = '1' (สมมติว่าเคยมี migration ก่อน) → wipe + set version=2
3. Version = '3' (downgrade scenario, สมมติว่าไปใช้เวอร์ชันใหม่กว่าแล้วถอยกลับ) → check `!== '2'` true → wipe + set version=2 (จะทำให้ข้อมูลของ v3 หาย!)
4. Server-side render — `typeof window === 'undefined'` → guard return ไม่ทำอะไร
5. Schema v3 ในอนาคต — ต้องเพิ่ม `CURRENT_VERSION = '3'` + บล็อก migration ใหม่ (incremental เช่น 2→3) มิเช่นนั้นจะ wipe ทุกอย่าง
6. ผู้ใช้ login ค้างอยู่ตอน deploy Phase 2 → รีเฟรชหน้าเว็บครั้งแรกหลัง deploy → migration ลบ session → redirect login
7. localStorage corrupt (เช่น quota exceeded ก่อนหน้า) → write `raot_storage_version` fail → migration จะรันซ้ำทุกรอบ (รำคาญแต่ไม่ critical)

**Effect to / Relate to:** MIG-5.2, MIG-5.3, AUTH-3.1, AUTH-3.2

---

### MIG-5.2 — Default Role Seeding · _merged into_ [RAOT-148](https://deeploytech-team.atlassian.net/browse/RAOT-148)

**Detail:**
1. `listRoles()` ครั้งแรก (หลัง migration) อ่าน `raot_roles` ได้ `null` → write seed:
   - Default Role (`role-default`, permissions=[], isDefault, isSystem)
   - Auction Demo (`role-auction-demo`, 12 permissions, สำหรับ officer02)
2. คืน seed array ทันที (sync write + return)

**Condition:**
1. รันที่ client-side เท่านั้น (typeof window check)
2. Seed รัน lazy — ไม่ block boot, ไม่อยู่ใน root layout effect

**Edge Cases:**
1. `raot_roles` ว่างเปล่า / null → seed Default + Auction Demo + คืน array
2. `raot_roles` มี data แต่ Default หาย → prepend Default + save + คืน
3. `raot_roles` มี Default แต่ไม่มี Auction Demo (Master ลบไป) → ระบบไม่ re-seed Auction Demo (เป็น demo role ไม่ใช่ system)
4. `raot_roles` มี Default duplicate (2 ตัวที่ id=`'role-default'`) — JSON.parse ผ่าน, listRoles คืนทั้งคู่; UI render duplicate row (ไม่ enforce singleton); แก้ผ่าน devtools เท่านั้น
5. JSON ของ `raot_roles` corrupt → `JSON.parse` throw → readRolesRaw คืน null → ถือเหมือนว่าง → seed
6. Server-side render → typeof window undefined → คืน null array → seed รัน lazy ที่ first client mount
7. Master ลบ Auction Demo Role → officer02 fallback Default ครั้งถัดไป

**Effect to / Relate to:** ROLE-1.1, ROLE-1.5, MIG-5.1

---

### MIG-5.3 — Demo Accounts Seeding · _merged into_ [RAOT-163](https://deeploytech-team.atlassian.net/browse/RAOT-163)

**Detail:**
1. MOCK_USER_ENTRIES ฝังในโค้ดไม่ใช่ localStorage — 5 บัญชี:
   - `buyer01/buyer1234` → role=buyer
   - `seller01/seller1234` → role=seller
   - `master/master1234` → role=master
   - `officer01/officer1234` → role=officer, roleId=undefined (Default)
   - `officer02/officer1234` → role=officer, roleId=`role-auction-demo`
2. login ผ่าน loginWithCredentials match ตามลำดับ (MOCK ก่อน OfficerAccount)

**Condition:**
1. Demo accounts ไม่ปรากฏใน `/officer/officers` table
2. Status ของ demo hardcode `'active'` ทุกคน — ระงับไม่ได้

**Edge Cases:**
1. Master พยายามสร้าง OfficerAccount ใหม่ที่ username ชน demo (เช่น `officer01`) → `addOfficerAccount` throw "username \"officer01\" มีอยู่ในระบบแล้ว"
2. Reset password ของ demo ผ่าน `/officer/officers` — ไม่ได้ (ไม่ปรากฏใน list); ถ้า call `setOfficerPassword('master', ...)` ตรง → write override
3. `officer02` ผูกกับ Role `role-auction-demo` — ถ้า Master ลบ Auction Demo Role → officer02 fallback เป็น Default (เห็นแค่ Dashboard) ครั้งถัดไปที่ resolver ถูกเรียก
4. Demo ใช้ password เดียวกัน (`officer1234` สำหรับ officer01/officer02) — ไม่กระทบเพราะ match ด้วย username ก่อน
5. ลบ MOCK entry ใน code (เช่น remove officer01) แล้ว deploy — user ที่เคย login officer01 อยู่จะถูก force logout (`refreshSession` คืน 'gone')
6. เพิ่ม MOCK entry ใหม่ใน code — ไม่ต้อง migrate; ใช้งานได้ทันที deploy

**Effect to / Relate to:** AUTH-3.1, AUTH-3.2, MIG-5.2, OFF-2.1

---

## Epic: MENU — Menu Catalog & Resolution

---

### MENU-6.1 — Menu Catalog (Source of Truth) · [RAOT-164](https://deeploytech-team.atlassian.net/browse/RAOT-164)

> _Jira card นี้รวม **MENU-6.3** (Page Labels & Breadcrumb) ด้วย_


**Detail:**
1. `src/features/roles/constants/menu-catalog.ts` ส่งออก:
   - `OFFICER_MENU_CATALOG: MenuGroup[]` — 23 menu keys รวม `roles` + `officers` ใน 7 กลุ่ม
   - `ALL_MENU_KEYS: string[]` — flat list
   - `ASSIGNABLE_MENU_KEYS` / `ASSIGNABLE_MENU_CATALOG` — เอา `MASTER_ONLY_KEYS` ออก
   - `MASTER_ONLY_KEYS: ReadonlySet<string>` = `new Set(['roles'])`
   - `MENU_LABEL_BY_KEY: Record<string, string>` — lookup label ภาษาไทย
   - `DASHBOARD_KEY = 'dashboard'`
2. Consumer:
   - Sidebar (`app-sidebar.tsx`) ใช้ render menu (icons เพิ่มในไฟล์ sidebar)
   - Role form ใช้ render checkbox grid
   - Resolver ใช้ master `ALL_MENU_KEYS`

**Condition:**
1. **เพิ่มเมนูใหม่ต้องอัปเดต 3 ที่:** catalog (key + label), sidebar (icon mapping), `app-header.tsx` PAGE_LABELS (breadcrumb)
2. Label ภาษาไทยเป็น Source of Truth — ถ้าจะ i18n ต้อง refactor structure (Phase 4)
3. Key เป็น kebab-case ต้องตรง folder name ภายใต้ `/officer/`
4. `MASTER_ONLY_KEYS` ปัจจุบัน = `new Set()` (ว่าง) — `roles`, `officers` เป็น permission ที่ assign ให้ Role ใดก็ได้

**Edge Cases:**
1. เพิ่ม key ใน catalog แต่ลืมเพิ่ม icon ใน sidebar — sidebar render menu โดยไม่มี icon (Antd render ช่องว่าง)
2. เพิ่ม key ใน catalog แต่ลืมสร้าง page → click sidebar → Next.js 404
3. ลบ key ออกจาก catalog — sidebar render ออก แต่ Role เก่าที่ persist key นั้นจะมี key ค้างใน array; resolver ยังคืน key นั้นใน array → sidebar filter ตอน render หา menuItem ไม่เจอ → key หายไป (acceptable)
4. ลบเมนูออกจาก catalog แต่ page file ยังอยู่ — user ที่พิมพ์ URL ตรง ๆ เข้าได้ แต่ guard เช็ค permission segment ไม่ pass (key ไม่อยู่ใน user perms) → redirect dashboard
5. เปลี่ยน `DASHBOARD_KEY` constant — ต้องอัปเดต `RoleLayout` segment check และ sidebar implicit-add ด้วย
6. เพิ่ม key เข้า `MASTER_ONLY_KEYS` แต่ลืมเพิ่ม runtime gate ใน page → officer ทำ devtools tweak ก็เข้าได้ (sidebar filter ออก แต่ direct URL เข้าได้)
7. Catalog 2 key มี label เดียวกัน — ไม่ throw, แต่ user สับสน

**Effect to / Relate to:** ROLE-1.6, AUTH-3.4, AUTH-3.5

---

### MENU-6.2 — Dashboard Implicit Grant + No-Access Blocker · [RAOT-165](https://deeploytech-team.atlassian.net/browse/RAOT-165)

**Detail:**
1. `dashboard` **ไม่อยู่** ใน `OFFICER_MENU_CATALOG` (เป็น static menu item)
2. Sidebar เพิ่ม Dashboard item เสมอ — ไม่ filter ออก
3. `RoleLayout` route guard skip segment check เมื่อ `segment === 'dashboard'`
4. `canAccessMenu(user, 'dashboard')` คืน true เสมอ
5. **No-Access Blocker** — Dashboard page ตรวจ `user.role === 'officer' && perms.length === 0` → render full-page `<Result>` พร้อมข้อความ "ยังไม่มีสิทธิ์การเข้าถึงระบบ" + ปุ่ม `ออกจากระบบ` แทนการ render dashboard ปกติ
6. **Quick Access Dashboard** (officer ที่มี perm ≥ 1 + Master) ประกอบด้วย 2 ชั้น:
   - **WelcomeHeader** — eyebrow `Officer Console · ศูนย์ปฏิบัติงาน` (uppercase letter-spacing), display "ยินดีต้อนรับ — `<fullName>`", subtitle `Role: <name> · ได้รับสิทธิ์ N เมนู`, live clock (date + time, mono font, refresh ทุก 60s) ทางขวา
   - **QuickAccessGrid** — sections จัดตาม `OFFICER_MENU_CATALOG` 7 groups (ซ่อน group ที่ไม่มี item granted), แต่ละ section มี: editorial eyebrow `01 / 07` (mono index) + group label + `N เมนู` count, ตามด้วย grid auto-fill (`minmax(220px, 1fr)`)
7. **QuickCard** = `<Link href="/officer/<key>">` แสดง: icon (top-left), arrow (top-right), label, mono URL path; hover effect = green left-border slide-in (220ms ease) + icon background fills เขียวเข้ม + arrow shifts ขวา + card lifts -1px พร้อม shadow

**Condition:**
1. `DASHBOARD_KEY = 'dashboard'` constant export จาก menu-catalog.ts
2. Sidebar inject Dashboard item เป็นรายการแรกเสมอก่อน group อื่น
3. No-Access blocker ทำงานเฉพาะ `user.role === 'officer'` — buyer/seller/master ไม่กระทบ
4. Blocker ใช้ icon `LockOutlined` สีส้ม `#fa8c16` (สีของ officer theme) เพื่อบอกชัดว่าเป็น officer-side issue
5. Master `perms` parameter ของ `QuickAccessGrid` ส่ง `null` → grid render ทุก item ใน catalog; Officer ส่ง array ของ effective perms → filter ด้วย Set
6. WelcomeHeader count: Master ใช้ `ALL_MENU_KEYS.length` (ทั้ง catalog), Officer ใช้ `perms.length`
7. Icon mapping อ่านจาก `MENU_ICON_BY_KEY` ใน [menu-icons.tsx](../src/features/roles/constants/menu-icons.tsx) — single source of truth; เพิ่มเมนูใหม่ต้องอัปเดต catalog + icon map + sidebar + page labels
8. `MASTER_ONLY_KEYS` filter จะ hide menu (เช่น 'roles' ใน aspect Phase 4) จาก grid ของ officer แม้จะมี perm นั้น (defense-in-depth ระดับ presentation)

**Edge Cases:**
1. Officer ที่ Role ว่าง (Default) login → ลงที่ `/officer/dashboard` → เห็น **No-Access Blocker** (ไม่ใช่ snapshot ปกติ); sidebar เหลือเฉพาะ Dashboard item; การพิมพ์ URL อื่นจะถูก guard kick กลับ → blocker อีก
2. Officer ที่มี Role ที่ permissions ว่าง (สร้างใหม่โดยไม่เลือก) — เหมือนกับ Default
3. ผู้ใช้กดปุ่ม `ออกจากระบบ` บน blocker → call `logout()` → redirect `/login` (sessionStorage + localStorage clear)
4. Master ลบสิทธิ์ของ Role officer ที่ login อยู่ → polling 30s detect → dashboard re-render เป็น blocker อัตโนมัติ (ไม่ต้อง force logout)
5. Master เพิ่มสิทธิ์ Role ของ officer ที่อยู่หน้า blocker → polling 30s detect → blocker เปลี่ยนเป็น snapshot ปกติ
6. URL `/officer/` ตรง ๆ (ไม่มี segment) → Next.js 404 (ไม่มี page.tsx ที่ root /officer/)
7. `canAccessMenu(user, 'dashboard')` = true เสมอ — แม้ user.status suspended (suspended จะ logout ก่อนถึง check นี้)
8. `dashboard` ไม่อยู่ใน ASSIGNABLE_MENU_CATALOG — เพิ่มไม่ได้ผ่าน Role form (Master grant ไม่ได้ แต่ implicit)
9. ถ้าเพิ่ม `'dashboard'` ใส่ใน `OFFICER_MENU_CATALOG` ด้วยพลาด → sidebar render duplicate (2 Dashboard items) เพราะ sidebar implicit-add + filterByPermissions ก็ allow
10. Master ที่ `ALL_MENU_KEYS` ว่าง (impossible — catalog corrupt) → ไม่ trigger blocker เพราะ check `role === 'officer'` ก่อน — master เห็น `Empty` placeholder ใน grid แทน
11. Officer click card ที่ไปเมนูที่ Role ถูก revoke ขณะกำลัง click (race) → route guard ของ target page kick กลับ dashboard + toast warning (จาก [RoleLayout](../src/shared/components/role-layout.tsx))
12. Live clock useEffect interval = 60s, cleanup ตอน unmount — ไม่มี memory leak
13. Card layout `auto-fill minmax(220px, 1fr)` → mobile 1 col, tablet 2 col, desktop 3-4 col responsive อัตโนมัติ; ไม่ต้องใส่ breakpoint manual
14. ถ้า group มี item แค่ 1 → ยัง render group section พร้อม eyebrow header (1 card alone ใน grid) — consistent visual rhythm

**Effect to / Relate to:** AUTH-3.5, MENU-6.1, ROLE-1.5 (Default role triggers blocker), AUTH-3.6 (sync re-renders blocker)

---

### MENU-6.3 — Page Labels & Breadcrumb · _merged into_ [RAOT-164](https://deeploytech-team.atlassian.net/browse/RAOT-164)

**Detail:**
1. `app-header.tsx` PAGE_LABELS map key → label ภาษาไทย (เช่น `'lot-registration' → 'ลงทะเบียนยาง · เข้า'`)
2. AppHeader render breadcrumb จาก pathname split — แต่ละ segment lookup label

**Condition:**
1. PAGE_LABELS แยกหมวด: officer / buyer-seller / role-bucket
2. Role-bucket labels: `buyer`, `seller`, `officer` — แสดงตอน user อยู่หน้า root ของ role (เช่น `/officer/dashboard` → "เจ้าหน้าที่ > Dashboard")

**Edge Cases:**
1. Key ไม่อยู่ใน PAGE_LABELS → fallback render raw key (เช่น "panels" แทน label ภาษาไทย)
2. การเพิ่มเมนูใหม่ → ต้องเพิ่ม key ใน PAGE_LABELS ด้วย (มิเช่นนั้น breadcrumb แสดงคีย์ดิบ — ดูไม่สวย แต่ไม่ break)
3. ลบ key เก่าใน Phase 3 (`admin`, `auction-officer`, `staff` ฯลฯ) — ไม่ collide กับ /officer/ keys
4. URL มี dynamic segment (เช่น `/officer/sellers/[id]`) — segment `[id]` เป็นค่าจริง (เช่น `SEL-001`) ไม่อยู่ใน PAGE_LABELS → render raw
5. รัน server-side → ทำงาน (เป็น static map, ไม่ใช่ effect)
6. PAGE_LABELS มี duplicate key (เช่น `payment` กับ `payments`) — ไม่ throw, label อันหลังชนะ
7. เปลี่ยน label ใน PAGE_LABELS — sidebar ไม่กระทบ (sidebar มี label ของตัวเอง); breadcrumb เปลี่ยนทันที

**Effect to / Relate to:** MENU-6.1, AUTH-3.5

---

## Cross-Epic Dependency Map

```
MIG-5.1 → MIG-5.2 → ROLE-1.5 → ROLE-1.1
                  ↘ MIG-5.3 → AUTH-3.1, AUTH-3.2
                              ↘ AUTH-3.3 → AUTH-3.5 ← AUTH-3.4 ← MENU-6.1
                                            ↑          ↑
                                         AUTH-3.6 ─────┤
                                                       │
            ROLE-1.2 / ROLE-1.3 / ROLE-1.4 / ROLE-1.6 ─┤
                                                       │
            OFF-2.2 / OFF-2.3 / OFF-2.5 / OFF-2.6 / OFF-2.7
                                                       │
                            MAS-4.1 → MAS-4.2 → MAS-4.3
```

ลูกศร `A → B` หมายถึง B พึ่ง A (B จะใช้งานได้ A ต้องพร้อม)

---

## หมายเหตุท้ายเอกสาร

- เอกสารนี้สะท้อนสถานะ code ณ สิ้นสุด Phase 3 + 3 Critical Fixes (post-code-review)
- POC ใช้ localStorage — production จะต้องย้ายเป็น API + bcrypt + audit log
- Test framework ยังไม่ install — [permissions.ts](../src/features/roles/services/permissions.ts) มี comment ระบุ 5 manual test cases ที่ควร port เป็น unit tests
- Phase 4 ที่แนะนำ: multi-Master support (เปลี่ยน `isMasterUsername` predicate + `isMaster` flag บน OfficerAccount), audit log ของ Role/Officer mutations, i18n, `<AccessGate>` extract pattern

### Recent fixes (post-code-review)

1. **DRY Master display data** — `getMasterDisplayAccount()` ใน [auth.ts](../src/features/auth/services/auth.ts) เป็น single source of truth; UI ไม่ duplicate identity fields
2. **Service-layer Master guard** — `MASTER_USERNAME` + `isMasterUsername()` + throw ใน 4 mutation functions (defense-in-depth Layer 6)
3. **Namespaced TanStack Query keys** — `['roles', 'list']` / `['officers', 'list']` แทน `['roles']` / `['officers']` เพื่อกัน collision กับ future `detail(id)` หรือ feature อื่น
4. **No-Access Blocker บน Dashboard** — officer ที่ permissions ว่างเห็น full-page `<Result>` "ยังไม่มีสิทธิ์การเข้าถึงระบบ โปรดติดต่อเจ้าหน้าที่" + ปุ่ม `ออกจากระบบ` (ดู MENU-6.2)
5. **Quick Access Dashboard** — เปลี่ยน decorative Tag chips → categorised navigation cards (editorial style: eyebrow index, mono URL paths, hover slide-in accent); ดู MENU-6.2 + new feature folder `src/features/officer-dashboard/`
