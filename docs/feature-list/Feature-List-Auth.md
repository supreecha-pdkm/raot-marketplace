# Feature List — ระบบ Login & Register

> **Version:** `v1.2.0`
> **Project:** RAOT Green Rubber — ระบบตรวจสอบย้อนกลับผลผลิตยางพารา
> **Jira Epic:** [RAOT-1](https://deeploytech-team.atlassian.net/browse/RAOT-1) Authentication
> **Stories:** RAOT-40 → RAOT-55 (16 stories) + RAOT-139 (AUTH-2.3.1) + RAOT-140 (AUTH-2.3.2) = **18 stories**
> **Source code:** `src/app/(auth)/*`, `src/features/auth/*`, `src/features/approvals/services/approval-data.ts`
> **Format:** Detail + Condition (BA spec)
> **Last updated:** 2026-05-19

## Changelog

| Version | Date | Changes |
|---|---|---|
| v1.2.0 | 2026-05-19 | **AUTH-2.3** แยกเป็น 2 sub-features ตาม sub-type: AUTH-2.3.1 (individual / บุคคลธรรมดา) + **AUTH-2.3.2 (company / นิติบุคคล)** — เพิ่ม corporate fields (`orgName`, `taxId`, `authorizedPerson{title/firstName/lastName/position/delegated}`); **AUTH-2.4** Bank Account รองรับ **multi-account + เลือกบัญชีหลัก** (`bankAccounts[]` พร้อม `isPrimary` flag); ลบ plot info residue ใน AUTH-2.3 (ย้ายไป Seller registration แล้ว) |
| v1.1.0 | 2026-05-19 | เพิ่ม Jira card mapping (RAOT-40 → RAOT-55); ปรับ AUTH-2.x ให้สอดคล้องกับ Jira (Buyer-only) |
| v1.0.0 | 2026-05-15 | เวอร์ชันแรก — สร้างจาก `/description-writer` skill |

---

## Epic Overview

ระบบ Authentication & Registration ของ RAOT รองรับ **7 บทบาท** แบ่งเป็น 2 กลุ่มทางเข้า:

| กลุ่ม | บทบาท | หน้าเข้าใช้งาน |
|---|---|---|
| Public (สมัครเองได้) | `buyer`, `seller` | `/login` |
| Internal (Admin สร้างให้) | `admin`, `auction_officer`, `finance_officer`, `market_director`, `staff` | `/login/admin` |

มีกระบวนการอนุมัติแบบ **Two-tier Approval** สำหรับผู้ซื้อ/ผู้ขาย:
**ผู้สมัครส่งเอกสาร → เจ้าหน้าที่ตลาดตรวจ (Tier 1) → ผอ.ตลาดอนุมัติ (Tier 2) → เปิดใช้งานบัญชี**

---

## Feature List Summary

| Jira Card | Feature ID | ชื่อ Feature | Priority | Phase |
|---|---|---|---|---|
| [RAOT-40](https://deeploytech-team.atlassian.net/browse/RAOT-40) | AUTH-1.1 | Login — ผู้ซื้อ / ผู้ขาย (Public Login) | High | 1 |
| [RAOT-41](https://deeploytech-team.atlassian.net/browse/RAOT-41) | AUTH-1.2 | Login — เจ้าหน้าที่ / Admin (Internal Login) | High | 1 |
| [RAOT-42](https://deeploytech-team.atlassian.net/browse/RAOT-42) | AUTH-1.3 | Role Detection & Session Management | High | 1 |
| [RAOT-43](https://deeploytech-team.atlassian.net/browse/RAOT-43) | AUTH-1.4 | Remember Me & Session Expiry Notice | Medium | 1 |
| [RAOT-44](https://deeploytech-team.atlassian.net/browse/RAOT-44) | AUTH-1.5 | Logout | High | 1 |
| [RAOT-45](https://deeploytech-team.atlassian.net/browse/RAOT-45) | AUTH-2.1 | Buyer : Register Wizard — ลงทะเบียนผู้ซื้อ | High | 1 |
| [RAOT-46](https://deeploytech-team.atlassian.net/browse/RAOT-46) | AUTH-2.2 | Buyer : Register Step 1 — PDPA Consent & เลือกประเภทย่อย | High | 1 |
| [RAOT-47](https://deeploytech-team.atlassian.net/browse/RAOT-47) | **AUTH-2.3** | Buyer : Register Step 2 — ข้อมูลส่วนตัว / องค์กร + ที่อยู่ติดต่อ (Parent) | High | 1 |
| [RAOT-139](https://deeploytech-team.atlassian.net/browse/RAOT-139) | ↳ AUTH-2.3.1 | individual — บุคคลธรรมดา (title, firstName, lastName, dob, nationalId) | High | 1 |
| [RAOT-140](https://deeploytech-team.atlassian.net/browse/RAOT-140) | ↳ AUTH-2.3.2 | company — นิติบุคคล (orgName, taxId, commerceRegNo, authorizedPerson + delegated) | High | 1 |
| [RAOT-48](https://deeploytech-team.atlassian.net/browse/RAOT-48) | AUTH-2.4 | Buyer : Register Step 3 — บัญชีธนาคาร (Multi-account + Primary) | High | 1 |
| [RAOT-49](https://deeploytech-team.atlassian.net/browse/RAOT-49) | AUTH-2.5 | Buyer : Register Step 4 — ตั้งชื่อผู้ใช้ & รหัสผ่าน | High | 1 |
| [RAOT-50](https://deeploytech-team.atlassian.net/browse/RAOT-50) | AUTH-2.6 | Buyer : Register Step 5 — อัปโหลดเอกสาร | High | 1 |
| [RAOT-51](https://deeploytech-team.atlassian.net/browse/RAOT-51) | AUTH-2.7 | Buyer : Register Success & Application ID | High | 1 |
| [RAOT-52](https://deeploytech-team.atlassian.net/browse/RAOT-52) | AUTH-2.8 | Buyer Pending Status Page — ติดตามสถานะคำขอ | High | 1 |
| [RAOT-53](https://deeploytech-team.atlassian.net/browse/RAOT-53) | AUTH-2.9 | Buyer : Resubmit Rejected Application — ยื่นคำขอใหม่ | High | 2 |
| [RAOT-54](https://deeploytech-team.atlassian.net/browse/RAOT-54) | AUTH-3.1 | Forgot Password — ขอลิงก์รีเซ็ต | High | 1 |
| [RAOT-55](https://deeploytech-team.atlassian.net/browse/RAOT-55) | AUTH-3.2 | Reset Password — ตั้งรหัสผ่านใหม่จากลิงก์ | High | 1 |

---

## [RAOT-40](https://deeploytech-team.atlassian.net/browse/RAOT-40) · AUTH-1.1 — Login (ผู้ซื้อ / ผู้ขาย)

**Page:** `/login`
**Component:** `LoginPanel` with `roles=[buyer, seller]`, `showRegistration=true`

### Detail
1. แสดงหน้า Login แบบ Split layout — ซ้าย Hero brand (gradient เขียว + Logo RAOT + tagline "ตลาดยาง Green Rubber" + แท็ก "รองรับ EUDR Traceability") / ขวาเป็น form
2. แสดง chip มุมขวาบน "เป็นเจ้าหน้าที่?" → ลิงก์ไป `/login/admin`
3. แสดงโลโก้ RAOT + Title "เข้าสู่ระบบ" + Subtitle "เลือกบทบาทและเข้าสู่ระบบ RAOT Green Rubber"
4. แสดง Role picker (Segmented) — "ฉันคือ" ให้เลือก 2 บทบาท:
   - **ผู้ซื้อ (Buyer)** — icon `ShoppingCart` — "ซื้อยางพาราผ่านระบบประมูล"
   - **ผู้ขาย (Seller)** — icon `Leaf` — "ขายผลผลิตยางพาราเข้าตลาด"
5. กรอกฟอร์ม Login:
   - **ชื่อผู้ใช้ (username)** — text input + icon `User`
   - **รหัสผ่าน (password)** — password input + icon `Lock` + ปุ่มแสดง/ซ่อน (Eye/EyeSlash)
6. แสดง checkbox "จำฉันไว้" (Remember Me) + ลิงก์ "ลืมรหัสผ่าน?" → `/forgot-password`
7. กดปุ่ม **"เข้าสู่ระบบ"** (สีเขียวแบรนด์ #1a7c3e) → ระบบตรวจสอบและ redirect ตามบทบาท:
   - buyer → `/buyer/dashboard`
   - seller → `/seller/dashboard`
8. แสดง trust microcopy ใต้ปุ่ม — "ข้อมูลของคุณเข้ารหัสตามมาตรฐาน TLS · นโยบาย PDPA · ความช่วยเหลือ"
9. แสดง Divider "ยังไม่มีบัญชี?" พร้อมปุ่ม:
   - **สมัครผู้ซื้อ** → `/register/buyer`
   - **สมัครผู้ขาย** → `/register/seller`
10. แสดงคำเตือนสีเหลือง — "ผู้ขายต้องผ่านการอนุมัติจากเจ้าหน้าที่ตลาดกลางก่อนใช้งาน"
11. แสดง footer version — "RAOT v1.0.0 · {บทบาทที่เลือก}"
12. โหมด Development แสดง Demo Alert (warning) — username + password ของบทบาทที่เลือกอัตโนมัติ (ซ่อนใน production)

### Condition
1. Role picker ต้อง**ไม่กั้น** form — default เลือก role แรก (buyer) ทันทีที่หน้าโหลด ผู้ใช้กรอก/submit ได้เลยโดยไม่ต้องเลือก role ก่อน
2. เมื่อเปลี่ยน role ใน Picker → auto-fill ชื่อผู้ใช้และรหัสผ่าน demo ของ role นั้น (เฉพาะ dev mode)
3. รูปแบบ username — ต้องตรงกับที่ลงทะเบียน (ไม่ระบุ regex ตอน login; validate ทั้งสองช่องว่า required)
4. หากเข้าระบบสำเร็จ → เขียน session ลง `localStorage` (ถ้าติ๊ก Remember Me) หรือ `sessionStorage` (ปกติ)
5. หากผิดพลาด แสดง Alert error ตามรหัส:
   - `INVALID_CREDENTIALS` → "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
   - `ACCOUNT_PENDING` → redirect ไป `/register/pending?id={applicationId}&role={role}` (ไม่แสดง error)
   - `ACCOUNT_SUSPENDED` → "บัญชีของท่านถูกระงับ กรุณาติดต่อเจ้าหน้าที่"
6. ปุ่ม "เข้าสู่ระบบ" สถานะ loading 600ms (simulate API) ก่อนตอบกลับ
7. หน้านี้ใช้ Role picker แบบ Segmented เพราะมี ≤3 roles; เกินจากนั้นจะ fallback เป็น Select (ไม่ใช้ในหน้านี้)
8. ถ้า URL มี `?reason=expired` → แสดง Alert warning "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" และล้าง query string ทันที (ไม่ค้างเมื่อ refresh)

**Effect to / Relate to:** AUTH-1.3 (Session creation), AUTH-1.4 (Remember Me + expiry notice), AUTH-2.1 (สมัครผู้ซื้อ/ผู้ขาย entry), AUTH-2.8 (redirect เมื่อ ACCOUNT_PENDING), AUTH-3.1 (Forgot password link)

---

## [RAOT-41](https://deeploytech-team.atlassian.net/browse/RAOT-41) · AUTH-1.2 — Login (เจ้าหน้าที่ / Admin)

**Page:** `/login/admin`
**Component:** `LoginPanel` with `roles=[admin, auction_officer, finance_officer, market_director, staff]`, `hideRolePicker=true`

### Detail
1. แสดงหน้า Login layout เดียวกับ AUTH-1.1 — Hero ซ้าย + form ขวา
2. แสดง chip มุมขวาบน "ผู้ซื้อ / ผู้ขาย" → ลิงก์กลับ `/login`
3. ซ่อน Role picker ทั้งหมด — ระบบ auto-detect role จาก username ที่ผู้ใช้กรอก
4. แสดง Remark block (`DemoUserRemark`) — ตารางบัญชี Demo สำหรับ 5 บทบาทพร้อมกัน:
   | บทบาท | username | password |
   |---|---|---|
   | IT Admin | `admin01` | `admin1234` |
   | เจ้าหน้าที่ประมูล | `auction01` | `auction1234` |
   | เจ้าหน้าที่การเงิน | `finance01` | `finance1234` |
   | ผู้อำนวยการตลาด | `director01` | `director1234` |
   | เจ้าหน้าที่ | `staff01` | `staff1234` |
5. กรอก username + password + กดเข้าสู่ระบบ → ระบบ resolve role และ redirect:
   - `admin` → `/admin/dashboard`
   - `auction_officer` → `/auction-officer/dashboard`
   - `finance_officer` → `/finance-officer/dashboard`
   - `market_director` → `/market-director/dashboard`
   - `staff` → `/staff/dashboard`
6. **ไม่แสดง** ปุ่ม "สมัครผู้ซื้อ / สมัครผู้ขาย" (showRegistration = false)
7. แสดง trust microcopy + version footer เหมือน AUTH-1.1

### Condition
1. Role ของบัญชี resolve ตามลำดับนี้:
   1. **Built-in MOCK_CREDENTIALS** (5 บัญชี demo ข้างต้น) — เทียบ username ตรงๆ
   2. **Officer ที่ Admin สร้างเพิ่ม** ใน `/admin/officers` (เก็บใน `localStorage` key `raot_officer_accounts`) — เทียบ username
   3. หากไม่พบทั้ง 2 → fallback ใช้ role default (`admin`) → จะ fail INVALID_CREDENTIALS
2. หาก Admin รีเซ็ตรหัสผ่านของ built-in user (ผ่าน `/admin/officers` → "รีเซ็ตรหัสผ่าน") — ระบบจะใช้ override password ก่อน built-in
3. หาก Admin สร้าง officer ใหม่และ status = `suspended` → ขึ้น "บัญชีของท่านถูกระงับ"
4. ถ้า username ตรงกับ pending application ที่ยังไม่ถูกอนุมัติ → throw `ACCOUNT_PENDING` พร้อม applicationId → redirect ไป `/register/pending`
5. หน้านี้ **ไม่แสดง** registration block (เป็น flow Admin สร้างบัญชีเท่านั้น)
6. หน้า Login picker ใช้ Select เมื่อมี role > 3 (admin role พอดี 5) — แต่ในหน้านี้ `hideRolePicker=true` ทำให้ไม่แสดง picker เลย

**Effect to / Relate to:** AUTH-1.3 (Session + role resolution), AUTH-1.5 (Logout), BO-Admin (Officer Management — สร้าง/แก้ไข/รีเซ็ตรหัสผ่าน)

---

## [RAOT-42](https://deeploytech-team.atlassian.net/browse/RAOT-42) · AUTH-1.3 — Role Detection & Session Management

**Service:** `src/features/auth/services/auth.ts` — `loginWithCredentials`, `getSession`, `consumeSession`, `refreshSession`, `getRedirectPath`

### Detail
1. รับ `username`, `password`, `role`, `remember` จากหน้า Login
2. ตรวจสอบลำดับการ authenticate:
   - (1) Built-in MOCK_CREDENTIALS — match username + check overridden password ก่อน (`effectivePasswordFor`)
   - (2) Admin-created officer accounts — match username + check role + password + status
   - (3) Pending applications จาก register wizard — match username + role + password + check approval override
3. หาก match สำเร็จ → สร้าง `User` object พร้อม `permissions` (ถ้ามี override) → เขียน session envelope
4. คืน object `User` ให้ caller ใช้ navigate ไปยัง dashboard ของแต่ละ role ผ่าน `getRedirectPath(role)`
5. Session envelope ประกอบด้วย:
   - `user` — full User object
   - `token` — mock token `mock-token-{role}` หรือ `mock-token-{id}-{timestamp}`
   - `expiresAt` — timestamp หมดอายุ
6. รองรับ `refreshSession()` สำหรับ cross-tab sync — เปรียบเทียบ role / status / permissions ใหม่กับใน storage:
   - `unchanged` / `updated` / `role_changed` / `suspended` / `gone` / `no-session`

### Condition
1. รูปแบบ username — ห้ามซ้ำกับ MOCK_CREDENTIALS หรือ officer accounts (ตรวจที่ `addOfficerAccount`)
2. Status check ระหว่าง login:
   - `pending` → throw `ACCOUNT_PENDING` พร้อม applicationId (ถ้ามี)
   - `suspended` → throw `ACCOUNT_SUSPENDED`
   - `active` → ผ่าน
3. Permission resolution — `effectivePermissionsFor(username)`:
   - ลำดับ: admin-created inline permissions > built-in user override > undefined (= ใช้ default sidebar เต็ม)
4. Redirect path — ตาม mapping:
   ```
   buyer → /buyer/dashboard
   seller → /seller/dashboard
   admin → /admin/dashboard
   auction_officer → /auction-officer/dashboard
   finance_officer → /finance-officer/dashboard
   market_director → /market-director/dashboard
   staff → /staff/dashboard
   ```
5. หาก built-in user role mismatch กับ role parameter → throw `INVALID_CREDENTIALS`
6. การเก็บ session — production จะใช้ JWT + httpOnly cookie แทน localStorage (POC limitation)

**Effect to / Relate to:** AUTH-1.1, AUTH-1.2 (consume service), AUTH-1.4 (TTL constants), BO-Admin (officer management)

---

## [RAOT-43](https://deeploytech-team.atlassian.net/browse/RAOT-43) · AUTH-1.4 — Remember Me & Session Expiry Notice

**Service:** `auth.ts` — `SESSION_TTL_MS`, `REMEMBER_TTL_MS`, `consumeSession`

### Detail
1. ผู้ใช้ติ๊ก checkbox "จำฉันไว้" บนหน้า Login → state `remember = true`
2. เมื่อ login สำเร็จ:
   - ถ้า `remember = true` → เขียน session ลง `localStorage` (`raot_auth`) + ลบจาก `sessionStorage`
   - ถ้า `remember = false` → เขียน session ลง `sessionStorage` + ลบจาก `localStorage`
3. ทุก request RoleLayout จะเรียก `consumeSession()` เพื่อตรวจ envelope:
   - หากไม่มี → return `none` → redirect ไป `/login`
   - หาก expiresAt < Date.now() → ลบ session + return `expired` → redirect ไป `/login?reason=expired`
   - หาก valid → คืน user + token
4. หน้า Login ตรวจ query `?reason=expired` ตอน mount → set `expiredNotice=true` แสดง Alert warning "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" + ปุ่ม close
5. หลังอ่าน query → ล้าง `reason` ออกจาก URL ด้วย `history.replaceState` (กันค้างเมื่อ refresh)

### Condition
1. Session TTL:
   - ปกติ (ไม่ติ๊ก Remember Me) — `SESSION_TTL_MS = 1 ชั่วโมง`
   - ติ๊ก Remember Me — `REMEMBER_TTL_MS = 30 วัน`
2. Storage policy — Remember Me ↔ `localStorage` (อยู่ข้ามการปิด tab); ปกติ ↔ `sessionStorage` (ล้างเมื่อปิด tab)
3. Cross-tab sync — เมื่อ refresh ใน tab อื่น `refreshSession()` จะ detect การเปลี่ยน status/role และ react ตาม:
   - `suspended` → force logout
   - `role_changed` → redirect ไป dashboard ใหม่
   - `gone` → force logout (admin ลบบัญชี)
4. ค่า TTL เป็น POC values — production อ่านจาก config server
5. Alert "เซสชันหมดอายุ" — closable; ปิดแล้วไม่กลับมาอีกใน mount นั้น

**Effect to / Relate to:** AUTH-1.1, AUTH-1.2 (consume), AUTH-1.5 (Logout consumer), Layout-RoleLayout

---

## [RAOT-44](https://deeploytech-team.atlassian.net/browse/RAOT-44) · AUTH-1.5 — Logout

**Service:** `auth.ts` — `logout()` → `clearSessionStorage()`

### Detail
1. ผู้ใช้คลิก "ออกจากระบบ" จาก user menu บน sidebar
2. ระบบเรียก `logout()` → ลบทั้ง `localStorage[raot_auth]` และ `sessionStorage[raot_auth]`
3. Redirect ไป `/login` ทันที

### Condition
1. การ logout จะล้าง session storage ทั้ง 2 แห่งเสมอ (ไม่ว่าจะ login แบบ Remember Me หรือไม่)
2. **ไม่** ล้าง `raot_officer_accounts`, `raot_officer_password_overrides`, `raot_pending_credentials` — ข้อมูลเหล่านี้คงอยู่ที่ device
3. การ logout จาก tab หนึ่ง — tab อื่นจะ detect ที่ `refreshSession()` ครั้งถัดไป (ดู AUTH-1.4)

**Effect to / Relate to:** ทุก dashboard ที่มี logout menu

---

## [RAOT-45](https://deeploytech-team.atlassian.net/browse/RAOT-45) · AUTH-2.1 — Buyer : Register Wizard — ลงทะเบียนผู้ซื้อ

**Page:** `/register/[role]` where `role ∈ {buyer, seller}`

### Detail
1. ผู้ใช้คลิก "สมัครผู้ซื้อ" หรือ "สมัครผู้ขาย" จากหน้า `/login` → เข้า `/register/buyer` หรือ `/register/seller`
2. ตรวจ param `role` — ถ้าไม่ใช่ `buyer` หรือ `seller` → แสดง Result 404 "ไม่พบประเภทผู้ลงทะเบียน" + ปุ่ม "กลับไปเข้าสู่ระบบ"
3. แสดง ShellContainer — gradient เขียว + Card กึ่งกลาง maxWidth 720px
4. แสดง Header strip ขาว — Icon (ShoppingCart สำหรับ buyer สีเขียว / Leaf สำหรับ seller สีส้ม) + Title "ลงทะเบียน{ผู้ซื้อ/ผู้ขาย}" + Subtitle "RAOT Rubber Traceability — Registration"
5. แสดง chip "กลับเข้าสู่ระบบ" มุมขวาบน → `/login`
6. แสดง Steps component — 5 ขั้นตอน:
   1. ยอมรับ PDPA & เลือกประเภท (`pdpa`)
   2. ข้อมูลส่วนตัว (`personal`)
   3. บัญชีธนาคาร (`bank`)
   4. ตั้งรหัสผ่าน (`creds`)
   5. อัปโหลดเอกสาร (`docs`)
7. แสดงปุ่ม navigation ด้านล่างทุก step:
   - **ย้อนกลับ** (disabled ที่ step 0)
   - Text "ขั้นตอนที่ {n} / 5 — {title}"
   - **ถัดไป** (step 0-3) → `validateFields` ของ step ปัจจุบันก่อน setStep
   - **ส่งคำขอลงทะเบียน** (step สุดท้าย) → `handleSubmit`
8. แสดง footer text — "บัญชีจะอยู่ในสถานะ 'รอตรวจสอบ' จนกว่าเจ้าหน้าที่จะอนุมัติ (Two-tier Approval)"

### Condition
1. Role param ที่ valid — เฉพาะ `buyer` กับ `seller` เท่านั้น; เจ้าหน้าที่/admin ไม่สมัครเองได้ (Admin สร้างให้)
2. การ navigate ระหว่าง step — กดถัดไปจะตรวจ `getStepFields()` ตาม role + subType และเรียก `form.validateFields()` ก่อน setStep
3. การ validate fail — แสดง inline error ของ AntD Form (ไม่ขยับ step)
4. หากเข้าโหมด Resubmit (URL มี `?resubmit={appId}`) — Steps จะซ่อน `creds` (เหลือ 4 ขั้นตอน) เพราะใช้ username/password เดิม
5. Color theme ของ Card border — เขียว (#1a7c3e) สำหรับ buyer, ส้ม (#fa8c16) สำหรับ seller (`roleColor`)
6. หลังส่งสำเร็จ → switch view ไปหน้า Success (ดู AUTH-2.7)

**Effect to / Relate to:** AUTH-2.2 → AUTH-2.6 (5 steps), AUTH-2.7 (Success), AUTH-2.9 (Resubmit mode)

---

## [RAOT-46](https://deeploytech-team.atlassian.net/browse/RAOT-46) · AUTH-2.2 — Buyer : Register Step 1 — PDPA Consent & เลือกประเภทย่อย

### Detail
1. แสดง Alert info "นโยบายความเป็นส่วนตัว (PDPA) — การยางแห่งประเทศไทย" พร้อมเนื้อหา 5 หัวข้อ:
   - ข้อมูลที่เก็บรวบรวม — ชื่อ, เลขบัตรประชาชน, เลขผู้เสียภาษี, บัญชีธนาคาร, เอกสารยืนยันตัวตน, ที่อยู่, email, เบอร์, Cookie/IP/Log
   - วัตถุประสงค์ — ยืนยันตัวตน, เปิดบัญชี, ประมูล/ซื้อ-ขาย, ออกใบเสร็จ, ติดต่อ, รายงานตามภารกิจ
   - การเปิดเผย — ไม่เปิดเผยต่อบุคคลที่สาม ยกเว้นคู่ค้า/หน่วยงานรัฐที่มีอำนาจ
   - สิทธิของท่าน — เข้าถึง/แก้ไข/ลบ/ระงับ/โอนย้าย/คัดค้าน/เพิกถอน/ร้องเรียน สคส.
   - ความมั่นคงปลอดภัย — TLS encryption + จำกัดสิทธิเข้าถึง
2. แสดง link "นโยบาย PDPA ฉบับเต็ม" → เปิด `PrivacyPolicyModal`
3. แสดง Checkbox "ฉันได้อ่านและยอมรับนโยบาย PDPA แล้ว"
4. แสดง Section "ประเภท{ผู้ซื้อ/ผู้ขาย}" — Radio.Group ใน Card list:
   - **Buyer**: บุคคลธรรมดา (`individual`), นิติบุคคล (`company`)
   - **Seller**: เกษตรกร (`farmer`), สถาบันเกษตรกร (`cooperative`), กลุ่มพัฒนาเกษตรกร (`farmer_group`), ผู้ประกอบกิจการยาง (`business`), องค์กร (`organization`)
5. เฉพาะ Seller — แสดงเพิ่ม:
   - Checkbox.Group "ชนิดยางที่ต้องการขาย" — 6 ชนิด: RSS, USS, Cup Lump, Field Latex, Crepe, ยางก้อนแห้ง (เลือกอย่างน้อย 1)
   - Select "ตลาดที่ลงทะเบียน" — 3 ตลาด: สุราษฎร์ธานี / นครศรีธรรมราช / สงขลา (เลือก**1 ตลาดเท่านั้น**)
   - Extra text — "ผู้ขายลงทะเบียนได้กับ 1 ตลาดเท่านั้น (ตามนโยบาย กยท.)"
6. เฉพาะ Buyer — แสดงเพิ่ม:
   - Select mode multiple "ตลาดที่ต้องการซื้อ" — เลือกได้หลายตลาด (≥1)

### Condition
1. PDPA checkbox — required; ไม่ติ๊ก → "กรุณายอมรับนโยบาย PDPA เพื่อดำเนินการต่อ"
2. subType — required (radio); ไม่เลือก → "กรุณาเลือกประเภท"
3. Seller `rubberTypes` — array ต้องมีอย่างน้อย 1 element → "เลือกอย่างน้อย 1 ชนิด"
4. Seller `market` — required (single) → "กรุณาเลือกตลาด"
5. Buyer `markets` — array ≥1 → "กรุณาเลือกอย่างน้อย 1 ตลาด"
6. การคลิกที่ Card subType ทั้งใบ — `onClick={() => form.setFieldValue('subType', t.value)}` (ขยายพื้นที่กด)
7. การเลือก subType เปลี่ยน sub-flow ที่ต้องอัปโหลดเอกสารใน Step 5 (ดู AUTH-2.6 Condition 2)

**Effect to / Relate to:** AUTH-2.6 (subType กำหนดเอกสารที่ต้องอัปโหลด), Privacy-Modal

---

## [RAOT-47](https://deeploytech-team.atlassian.net/browse/RAOT-47) · AUTH-2.3 — Buyer : Register Step 2 — ข้อมูลส่วนตัว / องค์กร + ที่อยู่ติดต่อ (Parent)

**Step key:** `personal` (Step 2 of 5)
**Source:** `src/app/(auth)/register/[role]/page.tsx` → `BuyerPersonalStep`
**Helpers:** `validateThaiId`, `getDistricts`, `getSubDistricts`, `lookupZipcode`

> **หมายเหตุ:** Story นี้เป็น **parent overview** ของ Step 2 — fields รายละเอียดของแต่ละ sub-type อยู่ที่ AUTH-2.3.1 (individual) และ AUTH-2.3.2 (company)

### Detail (common — applies to both sub-types)

1. ที่หัว step แสดง Select **"ประเภทผู้ใช้งาน"** — `name="subType"`, required, placeholder "เลือกประเภทผู้ใช้งาน"
2. หากยังไม่เลือก subType — แสดง Alert info "กรุณาเลือกประเภทผู้ใช้งานเพื่อแสดงแบบฟอร์มที่ต้องกรอก" และซ่อน field อื่นทั้งหมด
3. หลังเลือก subType — render Form per-subType ตาม mapping ใน AUTH-2.3.1 / AUTH-2.3.2
4. ทุก sub-type จะ render Section **"ข้อมูลที่อยู่ติดต่อ"** ด้านล่างเหมือนกัน (ดู Common Fields ด้านล่าง)
5. การเปลี่ยน subType — fields เก่าคงค่าใน Form state แต่ field ที่ไม่ relevant จะไม่ถูกส่งใน `submitApplication`

### Common Section — ข้อมูลที่อยู่ติดต่อ (ใช้ทุก sub-type)

| # | Field | Form name | Type | Required | Validation / Notes |
|---|---|---|---|---|---|
| 1 | บ้านเลขที่ / หมู่ / ซอย / ถนน | `addressLine` | Text | ✅ | placeholder "เช่น 123/4 หมู่ 5 ซ.รักไทย ถ.สุขุมวิท" |
| 2 | จังหวัด | `province` | Select showSearch | ✅ | เปลี่ยน → clear district/subDistrict/zipcode |
| 3 | อำเภอ | `district` | Select showSearch | ✅ | disabled จนกว่าจะเลือกจังหวัด |
| 4 | ตำบล | `subDistrict` | Select showSearch | ✅ | disabled จนกว่าจะเลือกอำเภอ; auto-fill zipcode |
| 5 | รหัสไปรษณีย์ | `zipcode` | Text (5 หลัก) | ✅ | pattern `^\d{5}$`; auto-fill จาก lookup |
| 6 | อีเมล | `email` | Email | ✅ | AntD email validator |
| 7 | เบอร์โทรศัพท์ | `phone` | Text (10 หลัก) | ✅ | pattern `^0\d{9}$`; placeholder "ตัวอย่าง 0812345678" |

### Condition (common)

1. `subType` — required (Select); ไม่เลือก → "กรุณาเลือกประเภทผู้ใช้งาน" และ block ปุ่ม "ถัดไป"
2. แต่ละ sub-type มี `getStepFields()` ของตัวเอง — wizard validate เฉพาะ fields ของ sub-type ปัจจุบันก่อน setStep
3. การเปลี่ยน subType — fields ของ sub-type เดิมที่ไม่ relevant จะไม่ถูกส่ง

**Effect to / Relate to:** AUTH-2.2 (subType picker), **AUTH-2.3.1** / **AUTH-2.3.2** (per-subType field set), AUTH-2.6 (subType ตัดสิน document set), AUTH-2.8 (display ข้อมูลในใบสมัคร)

---

### [RAOT-139](https://deeploytech-team.atlassian.net/browse/RAOT-139) · AUTH-2.3.1 — บุคคลธรรมดา (`individual`)

**Sub-type:** `individual`
**Section card:** "ข้อมูลส่วนตัวผู้ใช้งาน" → "ข้อมูลที่อยู่ติดต่อ"

#### Field กรอก — ข้อมูลส่วนตัวผู้ใช้งาน

| # | Field | Form name | Type | Required | Validation / Notes |
|---|---|---|---|---|---|
| 1 | คำนำหน้า | `title` | Select | ✅ | นาย / นาง / นางสาว / อื่นๆ |
| 2 | ชื่อ | `firstName` | Text | ✅ | 2-50 ตัวอักษร; autoComplete="given-name" |
| 3 | นามสกุล | `lastName` | Text | ✅ | 2-50 ตัวอักษร; autoComplete="family-name" |
| 4 | วันเกิด | `dob` | DatePicker | ✅ | format `DD/MM/YYYY`; `inputReadOnly` |
| 5 | เลขบัตรประจำตัวประชาชน | `nationalId` | Text (13 หลัก) | ✅ | ผ่าน `validateThaiId` checksum; placeholder "0000000000000"; `inputMode="numeric"` |

#### Conditional fields
- ไม่มี (individual ใช้ field set พื้นฐานเท่านั้น — ไม่ต้องระบุผู้มีอำนาจ)

#### เอกสารที่ต้องอัปโหลด (Step 5 — AUTH-2.6)
- **4 ฉบับพื้นฐาน:** `docIdCard` + `docHouseReg` + `docBankBook` + `docPdpa`

#### Field count
| Section | จำนวน field |
|---|---|
| ข้อมูลส่วนตัว | 5 |
| ข้อมูลที่อยู่ติดต่อ (common) | 7 |
| **รวม Step 2** | **12** |

---

### [RAOT-140](https://deeploytech-team.atlassian.net/browse/RAOT-140) · AUTH-2.3.2 — นิติบุคคล (`company`)

**Sub-type:** `company`
**Section cards:** "ข้อมูลนิติบุคคล" → "ข้อมูลผู้มีอำนาจลงชื่อผูกพันนิติบุคคล" → "ข้อมูลที่อยู่ติดต่อ"

> **Pattern:** ใช้แบบเดียวกับ Seller cooperative ([RAOT-129](https://deeploytech-team.atlassian.net/browse/RAOT-129) / SELLER-1.3.2) — ลด tax field 1 อันเพราะ Buyer ไม่ต้องระบุเลขทะเบียนสถาบันเกษตรกร

#### Field กรอก — ข้อมูลนิติบุคคล

| # | Field | Form name | Type | Required | Validation / Notes |
|---|---|---|---|---|---|
| 1 | ชื่อบริษัท / นิติบุคคล | `orgName` | Text (full-width) | ✅ | autoComplete="organization" |
| 2 | เลขประจำตัวผู้เสียภาษี / ทะเบียนนิติบุคคล | `taxId` | Text (numeric) | ✅ | UI label ย่อ "เลขผู้เสียภาษี / ทะเบียนนิติบุคคล" + tooltip ฉบับเต็ม |
| 3 | เลขทะเบียนพาณิชย์ | `commerceRegNo` | Text | ✅ | เลขที่กรมพัฒนาธุรกิจการค้าออกให้ |

#### Field กรอก — ผู้มีอำนาจลงชื่อผูกพันนิติบุคคล (`AuthorizedPersonFields withDelegated={true}`)

| # | Field | Form name | Type | Required | Validation / Notes |
|---|---|---|---|---|---|
| 4 | คำนำหน้า | `authorizedPerson.title` | Select | ✅ | นาย / นาง / นางสาว / อื่นๆ |
| 5 | ชื่อ | `authorizedPerson.firstName` | Text | ✅ | autoComplete="given-name" |
| 6 | นามสกุล | `authorizedPerson.lastName` | Text | ✅ | autoComplete="family-name" |
| 7 | ตำแหน่ง | `authorizedPerson.position` | Text | ✅ | autoComplete="organization-title" |
| 8 | มอบอำนาจแก่ผู้รับมอบอำนาจ | `authorizedPerson.delegated` | Radio | ✅ | ตัวเลือก: `delegated` (มอบอำนาจ) / `not_delegated` (ไม่มอบอำนาจ) |

#### Condition

1. `orgName` — ชื่อต้องตรงกับหนังสือรับรองบริษัท (`docCompanyCert`) — ตรวจตอน approval
2. `taxId` — `inputMode="numeric"`; ไม่มี checksum validation (POC); production ควร validate 13 หลัก + format ตามกรมสรรพากร
3. `commerceRegNo` — ผู้ซื้อนิติบุคคลต้องจดทะเบียนพาณิชย์ก่อน
4. `authorizedPerson.delegated` — required; ถ้า `delegated` → backend คาดหวัง `docPoa` ใน Step 5
5. หากเลือก `not_delegated` → ผู้ที่จะลงชื่อทำธุรกรรมต้องเป็นผู้มีอำนาจตาม `docCompanyCert` เท่านั้น

#### เอกสารที่ต้องอัปโหลด (Step 5)
- **7 ฉบับ:** 4 ฉบับพื้นฐาน + `docCompanyCert` (หนังสือรับรองบริษัท ≤6 เดือน) + `docDirectorId` (สำเนาบัตรประชาชนกรรมการผู้มีอำนาจ) + `docPoa` (หนังสือมอบอำนาจ — required ถ้า `delegated=delegated`)

#### Field count
| Section | จำนวน field |
|---|---|
| ข้อมูลนิติบุคคล | 3 |
| ผู้มีอำนาจลงนาม | 5 (รวม delegated radio) |
| ข้อมูลที่อยู่ติดต่อ (common) | 7 |
| **รวม Step 2** | **15** |

---

## [RAOT-48](https://deeploytech-team.atlassian.net/browse/RAOT-48) · AUTH-2.4 — Buyer : Register Step 3 — บัญชีธนาคาร (Multi-account + Primary)

**Step key:** `bank` (Step 3 of 5)
**Form state:** `bankAccounts: BankAccount[]` (array; ขั้นต่ำ 1 รายการ)

### Detail

1. แสดง Alert info — "บัญชีธนาคารใช้สำหรับรับเงินค่ายาง / หักค่าธรรมเนียม **สามารถเพิ่มได้มากกว่า 1 บัญชี และเลือกบัญชีหลัก**"
2. แสดงรายการบัญชีธนาคาร (`bankAccounts[]`) ในรูปแบบ **Card list** — เริ่มต้นมี 1 รายการ (empty form ให้กรอก)
3. แต่ละ Card บัญชีธนาคารแสดง:
   - Header — Tag เลขลำดับ "บัญชีที่ {n}" + **Radio "บัญชีหลัก"** (เลือกได้ 1 รายการเท่านั้นในทั้ง list) + **ปุ่ม "ลบ"** (เฉพาะถ้ามี ≥2 บัญชี)
   - Fields ภายใน Card:
     - **ธนาคาร** — Select showSearch — 7 ตัวเลือก
     - **เลขบัญชี** + **ชื่อบัญชี** (2 columns)
     - **สาขา** + **ประเภทบัญชี** (2 columns)
4. ใต้ list — ปุ่ม **"+ เพิ่มบัญชีธนาคาร"** (dashed border, full-width) → append entry ใหม่เข้า `bankAccounts[]`
5. แสดง Summary แถวสุดท้าย: "มี {N} บัญชี · บัญชีหลัก: {bank} ****{last4}"

### Field กรอก — ต่อ 1 บัญชี (`bankAccounts[i]`)

| # | Field | Form name | Type | Required | Validation / Notes |
|---|---|---|---|---|---|
| 1 | ธนาคาร | `bankAccounts[i].bank` | Select showSearch | ✅ | 7 ตัวเลือก: ธนาคารกรุงเทพ, กสิกรไทย, ไทยพาณิชย์, กรุงไทย, กรุงศรีอยุธยา, ทหารไทยธนชาต, ธ.ก.ส. |
| 2 | เลขบัญชี | `bankAccounts[i].accountNo` | Text (10-12 หลัก) | ✅ | pattern `^\d{10,12}$`; maxLength=12 |
| 3 | ชื่อบัญชี | `bankAccounts[i].accountName` | Text | ✅ | "ตามที่ปรากฏในสมุดบัญชี" |
| 4 | สาขา | `bankAccounts[i].branch` | Text | ✅ | |
| 5 | ประเภทบัญชี | `bankAccounts[i].accountType` | Select | ✅ | `savings` (ออมทรัพย์) / `current` (กระแสรายวัน) |
| 6 | บัญชีหลัก | `bankAccounts[i].isPrimary` | Radio (1 ใน list) | ✅ | true/false — ในทั้ง list ต้องมี `isPrimary=true` เท่ากับ **1 รายการ** เท่านั้น |

### Condition

1. **ต้องมีอย่างน้อย 1 บัญชี** — submit failed ถ้า `bankAccounts.length === 0`
2. **ต้องเลือกบัญชีหลัก 1 รายการ** — submit failed ถ้าไม่มีรายการใดมี `isPrimary === true` → message error "กรุณาเลือกบัญชีหลัก"
3. **เลือกบัญชีหลักได้แค่ 1** — เมื่อ click Radio "บัญชีหลัก" ที่ Card ใด → set `isPrimary=true` ที่ Card นั้น + `isPrimary=false` ที่ Cards อื่นทั้งหมด (mutually exclusive)
4. **ปุ่ม "ลบ"** — แสดงเฉพาะเมื่อ `bankAccounts.length >= 2`; กดแล้ว splice รายการนั้นออก
5. **ลบบัญชีหลัก** — ถ้าผู้ใช้ลบบัญชีที่เป็น primary และยังมีบัญชีอื่นเหลือ → auto-set บัญชีแรกในรายการที่เหลือเป็น primary
6. **Default ของบัญชีแรก** — เมื่อ render entry แรก, `isPrimary=true` โดย default
7. **Default ของบัญชีใหม่** — บัญชีที่เพิ่มผ่าน "+ เพิ่มบัญชีธนาคาร", `isPrimary=false`
8. **เลขบัญชีซ้ำ** — block submit ถ้ามี `accountNo + bank` ซ้ำกันใน list → message error "บัญชีนี้มีในรายการแล้ว"
9. **`accountType`** — enum `savings` หรือ `current` เท่านั้น (default `savings` ที่ entry ใหม่)
10. **ชื่อบัญชี** — ไม่บังคับให้ตรงกับชื่อ-นามสกุล/ชื่อบริษัท แต่ควรตรง (ใช้ตอน reviewer ตรวจ)
11. **บัญชีนิติบุคคล** (subType=company) — ชื่อบัญชีควรเป็นชื่อนิติบุคคล (`orgName`) — ไม่บังคับใน UI; ใช้วิจารณญาณของ reviewer ตอนตรวจ

### Use Cases

- **Single account** — ผู้ใช้ที่มีบัญชีเดียวก็ใช้งานได้ปกติ (entry แรก + isPrimary=true อัตโนมัติ)
- **Multi-account** — ผู้ค้าที่ต้องการแยกบัญชีรับเงินค่ายาง vs หักค่าธรรมเนียม สามารถเพิ่ม 2-N บัญชี และเลือกบัญชีหลัก 1 บัญชีสำหรับรับโอนเงิน
- **บัญชีหลัก = บัญชีรับโอนเงิน default** — Finance Officer ใช้บัญชีหลักเป็น default เมื่อสร้างรายการจ่ายเงิน; ผู้ใช้สามารถเลือกบัญชีอื่นในรายการได้ตอน Finance flow

**Effect to / Relate to:** AUTH-2.6 (เอกสารสำเนาสมุดบัญชี — ต้องตรงกับทุกบัญชีใน list), Finance-Officer-Approval (verify ตอนตรวจ), Buyer-Profile (แสดง bank list หลัง approved)

---

## [RAOT-49](https://deeploytech-team.atlassian.net/browse/RAOT-49) · AUTH-2.5 — Buyer : Register Step 4 — ตั้งชื่อผู้ใช้ & รหัสผ่าน

### Detail
1. แสดง Alert warning — "ตั้งรหัสผ่านอย่างปลอดภัย" + คำแนะนำเรื่องความซับซ้อนของรหัสผ่าน
2. แสดง field:
   - **ชื่อผู้ใช้ (Username)** — Input (placeholder "ชื่อผู้ใช้", autoComplete=username)
3. แสดง 2 columns:
   - **รหัสผ่าน** — Input.Password (hasFeedback, autoComplete=new-password)
   - **ยืนยันรหัสผ่าน** — Input.Password (hasFeedback, dependencies=[password])

### Condition
1. `username` — required, pattern `^[a-z0-9]{6,}$` → "≥6 ตัว, a-z และ 0-9 เท่านั้น"
2. `password` — รวม rules ผ่าน `passwordRule`:
   - ความยาวอย่างน้อย 8 ตัวอักษร → "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร"
   - มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว → "ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว"
   - มีตัวพิมพ์เล็กอย่างน้อย 1 ตัว → "ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว"
   - มีตัวเลขอย่างน้อย 1 ตัว → "ต้องมีตัวเลขอย่างน้อย 1 ตัว"
   - มีอักขระพิเศษอย่างน้อย 1 ตัว → "ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว"
3. `confirmPassword` — required + ต้องตรงกับ `password` → "รหัสผ่านไม่ตรงกัน"
4. ในโหมด Resubmit — step นี้ **ถูกซ่อนทั้ง step** เพราะใช้ username/password เดิม
5. Username — ตอน submitApplication จะถูก reuse ใน `raot_pending_credentials` (ดู AUTH-2.7)

**Effect to / Relate to:** AUTH-1.1/AUTH-1.2 (username+password ใช้ login ภายหลัง), AUTH-2.9 (Resubmit ซ่อน step นี้), AUTH-3.2 (Reset password rule เดียวกัน)

---

## [RAOT-50](https://deeploytech-team.atlassian.net/browse/RAOT-50) · AUTH-2.6 — Buyer : Register Step 5 — อัปโหลดเอกสาร

### Detail
1. แสดง Alert info — "อัปโหลดเอกสาร (รองรับ JPG, PNG, PDF — ขนาดไม่เกิน 10MB ต่อไฟล์)"
2. แสดง 4 ช่องอัปโหลด required ที่ทุก subType ต้องส่ง:
   - **สำเนาบัตรประชาชน** (`docIdCard`)
   - **สำเนาทะเบียนบ้าน** (`docHouseReg`)
   - **สำเนาสมุดบัญชีธนาคาร (≤6 เดือน)** (`docBankBook`)
   - **แบบยินยอม PDPA (เซ็นแล้ว)** (`docPdpa`)
3. แสดงช่องเพิ่มตาม sub-type:
   - **Buyer + `company`** (นิติบุคคล): Divider "เอกสารนิติบุคคล"
     - หนังสือรับรองบริษัท (≤6 เดือน) (`docCompanyCert`)
     - สำเนาบัตรประชาชนกรรมการผู้มีอำนาจ (`docDirectorId`)
     - หนังสือมอบอำนาจ (`docPoa`)
   - **Seller + (`cooperative` / `farmer_group` / `organization`)**: Divider "เอกสารสถาบัน / กลุ่ม"
     - หนังสือจดทะเบียนสถาบัน / กลุ่ม (`docOrgCert`)
   - **Seller + `business`**: Divider "เอกสารผู้ประกอบกิจการ"
     - ใบอนุญาตประกอบกิจการโรงงาน (`docFactoryLicense`)
     - หนังสือรับรองบริษัท (≤6 เดือน) (`docCompanyCert`)
4. แต่ละช่อง — ปุ่ม "เลือกไฟล์ (JPG / PNG / PDF, ≤10MB)" + แสดง file list หลังเลือก
5. การ submit สุดท้าย — แปลงทุกไฟล์เป็น Base64 data URL (`fileToDataUrl`) แล้วผูกเข้าใน `RegistrationDoc[]` ก่อนเรียก `submitApplication`

### Condition
1. รูปแบบไฟล์ที่รับ — MIME: `image/jpeg`, `image/png`, `application/pdf`; Extension fallback: `.jpg`, `.jpeg`, `.png`, `.pdf`
2. ขนาดไฟล์ — สูงสุด `10MB` (`MAX_UPLOAD_SIZE_BYTES = 10*1024*1024`)
3. หากไฟล์ผิดประเภท — message error: `"{filename}" ไม่ใช่ประเภทไฟล์ที่รองรับ (JPG / PNG / PDF เท่านั้น)` + reject ด้วย `Upload.LIST_IGNORE`
4. หากไฟล์ขนาดเกิน — message error: `"{filename}" มีขนาด {N} MB เกินกำหนด (สูงสุด 10 MB)`
5. แต่ละช่อง — `maxCount=1` (อัปโหลดได้ไฟล์เดียวต่อช่อง)
6. Validate ซ้ำตอน submit (defence-in-depth) — เผื่อ beforeUpload ถูก bypass
7. หากเกิด `QuotaExceededError` ตอน submit (localStorage เต็มจากการเก็บ Base64 หลายๆ ไฟล์) → message: "พื้นที่จัดเก็บไม่เพียงพอ — กรุณาอัปโหลดไฟล์ขนาดเล็กลง หรือลบใบสมัครเก่าออกก่อน"
8. POC limitation — ไฟล์เก็บเป็น Base64 ใน localStorage (production จะใช้ encrypted S3 + signed URL)

**Effect to / Relate to:** AUTH-2.2 (subType ตัดสิน document set), AUTH-2.7 (submit), Officer-Approval (ตรวจเอกสารทีละไฟล์), Director-Approval

---

## [RAOT-51](https://deeploytech-team.atlassian.net/browse/RAOT-51) · AUTH-2.7 — Buyer : Register Success & Application ID

### Detail
1. หลัง submit สำเร็จ — view เปลี่ยนเป็น Success state:
   - Icon CheckCircle ขนาด 64px สีเขียว
   - Title "ส่งคำขอลงทะเบียนเรียบร้อย"
   - Subtitle — "บัญชี{ผู้ซื้อ/ผู้ขาย}ของคุณถูกสร้างในสถานะ [รอตรวจสอบ] — เจ้าหน้าที่จะตรวจเอกสารและอนุมัติภายใน 1-3 วันทำการ ระบบจะแจ้งผลทาง email/SMS ที่กรอกไว้"
2. แสดง 2 ปุ่ม:
   - **กลับไปหน้าเข้าสู่ระบบ** → `/login`
   - **ตรวจสอบสถานะ** → `/register/pending?id={applicationId}&role={role}` (ถ้ามี applicationId)
3. แสดง Alert info — "ขั้นตอนการอนุมัติ (Two-tier Approval): (1) เจ้าหน้าที่ตลาดตรวจสอบเอกสาร → (2) ผู้อำนวยการตลาดอนุมัติ → เปิดใช้งานบัญชี"
4. ระบบสร้าง `Application` ใหม่ผ่าน `submitApplication()`:
   - generate id (format `R{nnn}` สำหรับ buyer / `RS{nnn}` สำหรับ seller)
   - บันทึก `submittedAt` = current ISO timestamp
   - `overallStatus` = `pending_review`
   - `approvalStage` = `officer_review`
   - เก็บ `username` + `password` ลง `raot_pending_credentials` (key by username)
5. ส่ง user navigate ไป Pending page หรือ Login ตามที่กด

### Condition
1. Application ID format:
   - Buyer → `R{nnn}` (เช่น R001, R002)
   - Seller → `RS{nnn}` (เช่น RS001, RS002)
2. หาก submit error — แสดง message ตามประเภท:
   - `QuotaExceededError` → "พื้นที่จัดเก็บไม่เพียงพอ..."
   - อื่นๆ → "ส่งคำขอลงทะเบียนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
3. POC — username/password เก็บใน `raot_pending_credentials` ทำให้ user login ได้ทันที (แต่จะเข้าได้ก็ต่อเมื่อ status approved); ก่อนนั้น login จะ throw `ACCOUNT_PENDING`
4. หลัง submit — `password` ของ resubmit reuse จากที่บันทึกไว้เดิม (ถ้าผู้ใช้ทำ resubmit)
5. ไม่ส่ง email/SMS จริงในโหมด POC

**Effect to / Relate to:** AUTH-2.8 (Pending page), AUTH-1.1 (login ใช้ creds นี้), Officer-Approval (Tier 1), Director-Approval (Tier 2)

---

## [RAOT-52](https://deeploytech-team.atlassian.net/browse/RAOT-52) · AUTH-2.8 — Buyer Pending Status Page — ติดตามสถานะคำขอ

**Page:** `/register/pending?id={appId}&role={buyer|seller}`

### Detail
1. ดึง `id` และ `role` จาก query string (อยู่ใน Suspense boundary ตาม Next.js 16)
2. โหลด Application จาก `getAllApplications().find(a => a.id === id)` — แสดง Spin loading ระหว่างรอ
3. หากไม่พบ — แสดง Result 404 "ไม่พบข้อมูลการสมัคร" + รหัส appId + ปุ่ม "กลับเข้าสู่ระบบ"
4. หากพบ — แสดง Card:
   - **Header**: Icon เปลี่ยนตามสถานะ (CheckCircle สีเขียว / XCircle สีแดง / Clock สีเหลือง) + Title:
     - approved → "บัญชีของคุณได้รับการอนุมัติแล้ว!"
     - rejected → "คำขอลงทะเบียนถูกปฏิเสธ"
     - อื่น → "กำลังรอการอนุมัติ"
   - แสดง Application ID + Tag สี (`success`/`error`/`warning`)
5. แสดง **Steps 4 ขั้นตอน** (ซ่อนเมื่อ rejected):
   1. ส่งใบสมัคร — "ส่งเอกสารเรียบร้อย"
   2. เจ้าหน้าที่ตรวจสอบ — "Tier 1 review"
   3. ผอ.ตลาดอนุมัติ — "Tier 2 approval"
   4. เปิดใช้งาน — "สามารถเข้าระบบได้"
6. แสดง Descriptions ข้อมูลสรุป:
   - ชื่อ-นามสกุล / ประเภท (Buyer/Seller + subType) / วันที่สมัคร / ผู้ตรวจสอบ (ถ้ามี)
7. แสดง Alert ตามสถานะ:
   - approved → success + คอมเมนต์จาก ผอ. (ถ้ามี `approveNote`)
   - rejected → error พร้อม "เหตุผล:" + `rejectReason` + ผู้ปฏิเสธ + เวลา; ถ้า director_rejected และมี `forwardNote` แสดงบันทึกจากเจ้าหน้าที่ด้วย
   - awaiting_director → warning "เจ้าหน้าที่ตลาดตรวจสอบผ่านแล้ว — รอ ผอ.ตลาด อนุมัติขั้นสุดท้าย" + แสดง `forwardNote` (ถ้ามี)
   - default → info "เจ้าหน้าที่จะตรวจสอบเอกสารภายใน 1-3 วันทำการ ระบบจะแจ้งผลทาง Email/SMS"
8. แสดง 2 ปุ่ม:
   - **เข้าสู่ระบบ / กลับหน้าเข้าสู่ระบบ** → `/login`
   - **ยื่นคำขอใหม่ →** (เฉพาะ rejected) → `/register/{role}?resubmit={appId}` (ดู AUTH-2.9)
9. **Auto-refresh** — polling ทุก 5 วินาที ดึงข้อมูลใหม่ (เพื่อ reflect การกดของเจ้าหน้าที่)

### Condition
1. Step current คำนวณจาก `statusToStep()`:
   - approved → step 3
   - rejected / officer_rejected / director_rejected → step -1 (ซ่อน Steps)
   - awaiting_director → step 2
   - pending_review / officer_review → step 1
2. Steps status:
   - rejected → `error`
   - approved → `finish`
   - อื่น → `process`
3. Polling interval — 5 วินาที; cleanup ตอน unmount ด้วย `clearInterval`
4. ปุ่ม "เข้าสู่ระบบ" — ใช้ primary style (สีเขียวแบรนด์) เฉพาะเมื่อ approved; กรณีอื่นเป็น default
5. ปุ่ม "ยื่นคำขอใหม่" — แสดงเฉพาะกรณี rejected (officer_rejected หรือ director_rejected); ส่ง query `?resubmit={id}` ไปที่หน้า register
6. หาก `appId` ไม่ตรงกับ application ใน storage — แสดง Result 404 (ไม่ throw error)

**Effect to / Relate to:** AUTH-2.7 (entry จาก success), AUTH-2.9 (Resubmit), AUTH-1.1 (ACCOUNT_PENDING redirect), Officer-Approval (เปลี่ยน status), Director-Approval (เปลี่ยน status)

---

## [RAOT-53](https://deeploytech-team.atlassian.net/browse/RAOT-53) · AUTH-2.9 — Buyer : Resubmit Rejected Application — ยื่นคำขอใหม่

**Page:** `/register/[role]?resubmit={appId}`

### Detail
1. ผู้สมัครคลิก "ยื่นคำขอใหม่" จากหน้า `/register/pending` (กรณี rejected) → navigate ไป `/register/{role}?resubmit={appId}`
2. หน้า register detect `resubmitId` จาก query → ดึง Application เดิมผ่าน `getAllApplications().find(a => a.id === resubmitId && a.type === role)`
3. **Re-hydrate ทุก field** จาก application เดิม:
   - PDPA, subType, market(s), rubberTypes
   - ข้อมูลส่วนตัวทั้งหมด, dob (parse กลับเป็น dayjs), ที่อยู่
   - plotId / plotArea (สำหรับ farmer)
   - ข้อมูลธนาคารทั้งหมด
4. **Re-hydrate เอกสาร** — fetch `dataUrl` ของแต่ละเอกสาร → แปลงกลับเป็น `Blob` → สร้าง `File` object ใส่ `fileList` ของ Upload component (ผู้ใช้ไม่ต้อง attach ใหม่)
5. เก็บ `resubmitUsername` (จาก app เดิม) + `resubmitPassword` (จาก `getPendingCred(username)`) สำหรับ submit
6. แสดง Alert info สีฟ้าด้านบน Card:
   - "ยื่นคำขอใหม่ — ข้อมูลเดิมถูกกรอกให้แล้ว"
   - "ระบบดึงข้อมูลจากใบสมัครที่ถูกปฏิเสธ ({resubmitId}) มาให้ทั้งหมด รวมถึงเอกสารที่อัปโหลดไว้ — กรุณาตรวจสอบและแก้ไขจุดที่ถูกระบุในเหตุผลการปฏิเสธก่อนส่งใหม่"
   - "* ใช้ชื่อผู้ใช้ ({username}) และรหัสผ่านเดิม — ไม่ต้องตั้งใหม่"
7. **ซ่อน step "ตั้งรหัสผ่าน"** — `visibleSteps` filter `creds` ออก (เหลือ 4 ขั้นตอน)
8. ผู้ใช้แก้ไขเฉพาะจุดที่ถูก reject แล้ว submit เหมือนปกติ (ดู AUTH-2.7)

### Condition
1. หาก app เดิมไม่อยู่ใน storage หรือ type ไม่ตรงกับ role — ไม่ prefill (เงียบๆ — ผู้ใช้กรอกใหม่หมด)
2. หาก `dataUrl` ของบางเอกสารเสีย — skip เฉพาะเอกสารนั้น (console.warn) ผู้ใช้ต้องอัปโหลดใหม่เฉพาะช่องนั้น
3. หาก resubmit ไม่พบ pending cred password — ใช้ fallback string `(reused-from-previous-application)` (POC — backend จริงจะใช้ user record)
4. ใช้ username เดิม **ห้ามเปลี่ยน** — กันการเปลี่ยนตัวตน
5. submitApplication จะสร้าง **Application ใหม่** (ID ใหม่) — ไม่ใช่อัปเดต application เก่า; application เก่า rejected ยังคงอยู่
6. หน้านี้ใช้ `useEffect` กับ async loader พร้อม cancellation flag — ป้องกัน race condition

**Effect to / Relate to:** AUTH-2.1 (โหมดพิเศษของ register), AUTH-2.5 (ซ่อน step creds), AUTH-2.8 (entry จาก rejected status), Officer-Approval (review รอบใหม่)

---

## [RAOT-54](https://deeploytech-team.atlassian.net/browse/RAOT-54) · AUTH-3.1 — Forgot Password (ขอลิงก์รีเซ็ตรหัสผ่าน)

**Page:** `/forgot-password`

### Detail
1. ผู้ใช้คลิก "ลืมรหัสผ่าน?" จากหน้า Login → `/forgot-password`
2. แสดง Card กลางหน้าจอ (gradient เขียวแบรนด์):
   - Title "ลืมรหัสผ่าน?"
   - Subtitle "กรอก email ที่ลงทะเบียนไว้ ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านให้"
3. แสดง Form ช่องเดียว:
   - **อีเมล** — Input + icon Envelope (autoComplete=email)
4. กดปุ่ม **"ส่งลิงก์รีเซ็ตรหัสผ่าน"** → ระบบ:
   - Simulate API delay 600ms
   - เรียก `requestPasswordReset(email)` → return `{token, expiresAt}`
   - บันทึก token ลง `localStorage[raot_reset_tokens]` map (key=token, value={email, expiresAt})
5. หลังส่งสำเร็จ — เปลี่ยน view เป็น Success:
   - Alert success "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว"
   - "หากมีบัญชีที่ใช้ {email} ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปทาง email ลิงก์มีอายุ 1 ชั่วโมง"
6. โหมด Dev — แสดง Alert info "โหมดพัฒนา (Dev only)" + ลิงก์ `/reset-password?token={token}` ที่กดได้เลย (production ส่ง email จริง)
7. แสดงปุ่ม "ส่งให้อีเมลอื่น" — กลับไปกรอก email ใหม่; ปุ่ม "กลับไปหน้าเข้าสู่ระบบ" → `/login`
8. ลิงก์ "กลับไปหน้าเข้าสู่ระบบ" ด้านล่าง form ก่อน submit

### Condition
1. `email` — required + ผ่าน AntD email validator
2. Token format — `rst_{random}_{timestamp36}` (single-use, ไม่ reuse ได้)
3. Token TTL — `RESET_TOKEN_TTL_MS = 1 ชั่วโมง` (60*60*1000 ms)
4. POC — ทุก email ที่กรอกได้ token หมด (ไม่ check user table — production จะตรวจก่อน)
5. ไม่เปิดเผยว่า email มีหรือไม่ในระบบ (ใช้ภาษากำกวม "หากมีบัญชีที่ใช้...")
6. โหมด dev (`NODE_ENV !== 'production'`) — แสดง resetUrl ในหน้าจอ; production ไม่แสดง

**Effect to / Relate to:** AUTH-3.2 (consume token), AUTH-1.1 (link จาก login)

---

## [RAOT-55](https://deeploytech-team.atlassian.net/browse/RAOT-55) · AUTH-3.2 — Reset Password (ตั้งรหัสผ่านใหม่จากลิงก์)

**Page:** `/reset-password?token={token}`

### Detail
1. ผู้ใช้เปิดลิงก์จาก email → `/reset-password?token={token}` (อยู่ใน Suspense boundary)
2. ตอน mount — เรียก `verifyResetToken(token)`:
   - `tokenStatus` = `checking` → แสดง Spin
   - หาก token ไม่อยู่ใน `localStorage` → `invalid`
   - หากหมดอายุ → `expired`
   - หาก valid → set `email` และ `tokenStatus = valid`
3. หาก invalid/expired — แสดง Alert error:
   - "ลิงก์หมดอายุ" + "ลิงก์รีเซ็ตรหัสผ่านมีอายุ 1 ชั่วโมง กรุณาขอลิงก์ใหม่" → ปุ่ม "ขอลิงก์ใหม่" → `/forgot-password`
   - "ลิงก์ไม่ถูกต้อง" + "ไม่พบลิงก์รีเซ็ตรหัสผ่านนี้ในระบบ อาจถูกใช้ไปแล้วหรือไม่ถูกต้อง" → ปุ่ม "ขอลิงก์ใหม่"
4. หาก valid — แสดง form:
   - Subtitle "กำลังรีเซ็ตรหัสผ่านสำหรับ {email}"
   - **รหัสผ่านใหม่** — Input.Password + icon Lock + toggle Eye/EyeSlash
   - **ยืนยันรหัสผ่านใหม่** — Input.Password
5. กดปุ่ม **"รีเซ็ตรหัสผ่าน"** → `resetPassword(token)` → consume token (ลบจาก map) + return `{ok: true}`
6. หลังสำเร็จ — แสดง Alert success "รีเซ็ตรหัสผ่านสำเร็จ" + "กำลังนำท่านไปยังหน้าเข้าสู่ระบบ..."
7. หลัง 2 วินาที — `router.push('/login')` อัตโนมัติ
8. แสดงลิงก์ "กลับไปหน้าเข้าสู่ระบบ" ด้านล่าง form

### Condition
1. Password rule — pattern `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$`
   - ≥8 ตัว + พิมพ์ใหญ่ + พิมพ์เล็ก + ตัวเลข + อักขระพิเศษ
   - Error message — "รหัสผ่านต้องมีอย่างน้อย 8 ตัว มีพิมพ์ใหญ่+เล็ก+ตัวเลข+อักขระพิเศษ"
2. `confirm` — ต้องตรงกับ `password` → "รหัสผ่านไม่ตรงกัน"
3. Token — single-use; เมื่อเรียก `resetPassword()` สำเร็จจะลบทิ้งใน `localStorage`; กดอีกครั้งจะ error `INVALID_TOKEN`
4. หากไม่มี query `token` — set `tokenStatus = invalid` ทันที (ไม่เรียก verify)
5. POC limitation — password ใหม่ "captured here in production" comment — ไม่ persist ใน POC (ไม่อัปเดต MOCK_CREDENTIALS); production จะอัปเดต password hash ของ user record
6. หลัง redirect ไป login — ผู้ใช้ต้อง login ด้วย password เดิม (POC) หรือ password ใหม่ (production)

**Effect to / Relate to:** AUTH-3.1 (token producer), AUTH-1.1 (login หลังรีเซ็ต), AUTH-2.5 (Password rule เดียวกัน)

---

## Cross-cutting Notes

### Storage Keys (`localStorage` / `sessionStorage`)

| Key | Purpose | Producer | Consumer |
|---|---|---|---|
| `raot_auth` | Session envelope (User + token + expiresAt) | `loginWithCredentials` | `getSession`, `consumeSession`, `refreshSession`, `logout` |
| `raot_reset_tokens` | Password reset tokens map | `requestPasswordReset` | `verifyResetToken`, `resetPassword` |
| `raot_officer_accounts` | Admin-created officers | `addOfficerAccount` (BO-Admin) | `loginWithCredentials`, `getOfficerAccount` |
| `raot_officer_password_overrides` | Reset passwords for built-in users | `setOfficerPassword` (BO-Admin) | `effectivePasswordFor` |
| `raot_officer_permission_overrides` | Per-user menu permissions | `setOfficerPermissions` (BO-Admin) | `effectivePermissionsFor` |
| `raot_pending_credentials` | Username/password ของ pending applications | `submitApplication` | `loginWithCredentials` (branch 3) |
| `raot_application_overrides` | Status override สำหรับ approved/rejected | Officer/Director approval flow | `loginWithCredentials` (branch 3) |

### Constants

| Constant | Value | Used by |
|---|---|---|
| `SESSION_TTL_MS` | 1 ชม. | Non-Remember-Me sessions |
| `REMEMBER_TTL_MS` | 30 วัน | Remember-Me sessions |
| `RESET_TOKEN_TTL_MS` | 1 ชม. | Password reset link expiry |
| `MAX_UPLOAD_SIZE_MB` | 10 MB | Document upload validator |
| `ACCEPTED_MIME_TYPES` | jpg, png, pdf | Document upload validator |

### Two-tier Approval Flow

```
ผู้สมัคร submit
    ↓
[overallStatus=pending_review, approvalStage=officer_review]
    ↓
เจ้าหน้าที่ตลาด (auction_officer) ตรวจเอกสาร
    ├─ ปฏิเสธ → [pending → rejected, officer_rejected]
    └─ ส่งต่อ → [pending → awaiting_director, director_review]
                  ↓
              ผอ.ตลาด (market_director) อนุมัติ
                  ├─ ปฏิเสธ → [awaiting_director → rejected, director_rejected]
                  └─ อนุมัติ → [awaiting_director → approved, approved] → เปิดใช้งานบัญชี
```

### Roles & Default Redirect

| Role | Redirect after login | Source |
|---|---|---|
| `buyer` | `/buyer/dashboard` | `MOCK_USERS.buyer` (id U001, username `buyer01`) |
| `seller` | `/seller/dashboard` | `MOCK_USERS.seller` (id U002, username `seller01`) |
| `admin` | `/admin/dashboard` | `MOCK_USERS.admin` (id U003, username `admin01`) |
| `auction_officer` | `/auction-officer/dashboard` | `MOCK_USERS.auction_officer` (id U004, `auction01`) |
| `finance_officer` | `/finance-officer/dashboard` | `MOCK_USERS.finance_officer` (id U005, `finance01`) |
| `market_director` | `/market-director/dashboard` | `MOCK_USERS.market_director` (id U006, `director01`) |
| `staff` | `/staff/dashboard` | `MOCK_USERS.staff` (id U007, `staff01`) |

### Reference Data ใน Register Wizard

- **Titles**: นาย, นาง, นางสาว, อื่นๆ
- **Provinces**: จาก `PROVINCE_NAMES` (`src/shared/utils/thai-address`)
- **Markets**: ตลาดกลางยางพาราสุราษฎร์ธานี / นครศรีธรรมราช / สงขลา
- **Banks**: กรุงเทพ, กสิกรไทย, ไทยพาณิชย์, กรุงไทย, กรุงศรีอยุธยา, ทหารไทยธนชาต, ธ.ก.ส.
- **Rubber Types**: RSS, USS, Cup Lump, Field Latex, Crepe, ยางก้อนแห้ง
- **Buyer Types**: individual, company
- **Seller Types**: farmer, cooperative, farmer_group, business, organization

---

## Out-of-scope / POC Limitations

1. **No real email/SMS** — แจ้งผลผ่าน UI เท่านั้น (production: integrate email/SMS provider)
2. **Documents เก็บเป็น Base64 ใน localStorage** — มี quota limit (production: encrypted S3 + signed URL)
3. **Password เก็บ plaintext** — POC เท่านั้น (production: bcrypt hash)
4. **Session ใน localStorage/sessionStorage** — POC (production: JWT + httpOnly cookie + refresh token rotation)
5. **Reset password ไม่ persist new password** — POC consume token แต่ไม่อัปเดต credential (production: update password hash)
6. **PDPA consent log** — ไม่ track timestamp/IP ของการ accept (production: audit log table)
7. **Resubmit สร้าง Application ใหม่** — ไม่ทำ versioning ของใบสมัคร (production: link old↔new ผ่าน parent_id)

---

*Generated by `/description-writer` skill — Detail + Condition format*
*Source code last reviewed: 2026-05-15*
