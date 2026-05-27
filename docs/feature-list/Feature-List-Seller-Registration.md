# Feature List — ระบบสมัครสมาชิกผู้ขาย (Seller Registration)

> **Version:** `v1.2.2`
> **Project:** RAOT Green Rubber — ระบบตรวจสอบย้อนกลับผลผลิตยางพารา
> **Jira Epic:** [RAOT-1](https://deeploytech-team.atlassian.net/browse/RAOT-1) Authentication
> **Stories:** RAOT-125 → RAOT-138 (14 stories ขนานกันใต้ Epic)
> **Source code:** `src/app/(auth)/register/[role]/page.tsx` (role = `seller`)
> **Spec reference:** `docs/image/register-fields.md` (จาก screenshot trt.raot.co.th/register)
> **Format:** Detail + Condition (BA spec)
> **Last updated:** 2026-05-19

## Changelog

| Version | Date | Changes |
|---|---|---|
| v1.2.2 | 2026-05-19 | อัปเดต SELLER-1.4 ให้รองรับการเพิ่มบัญชีธนาคารหลายบัญชี (`bankAccounts[]`) และเลือกบัญชีหลัก (`primaryBankIndex`) |
| v1.2.1 | 2026-05-19 | เพิ่ม Edge Case ครบทุก Feature ID ใน Seller Registration: SELLER-1.1 → SELLER-1.9 รวม sub-features SELLER-1.3.1 → SELLER-1.3.5 |
| v1.2.0 | 2026-05-19 | สร้าง 14 Stories ใน Jira RAOT-125 → RAOT-138 (flat structure ใต้ Epic RAOT-1); เพิ่ม Jira card link ในทุก section header และ summary table |
| v1.1.0 | 2026-05-19 | แยก SELLER-1.3 ออกเป็น 5 sub-features (1.3.1 – 1.3.5) ตาม sub-type พร้อม Field table ครบทุก field; sync กับ implementation จริง (orgName, taxId, instRegNo, commerceRegNo, businessRegNo, farmerRegNo, authorizedPerson, representative); **ลบ plot info (plotId/plotArea)** — ไม่มีใน production code แล้ว ใช้ `farmerRegNo` แทน |
| v1.0.0 | 2026-05-19 | เวอร์ชันแรก — แยก scope จาก Feature-List-Auth.md (AUTH-2.x = Buyer-only) เป็นไฟล์ Seller registration โดยเฉพาะ |

---

## Epic Overview

ระบบสมัครสมาชิกผู้ขายของ RAOT รองรับ **5 ประเภทผู้ขาย** ลงทะเบียนผ่าน wizard 5 ขั้นตอนเดียวกับ Buyer แต่มี business rules ที่ต่างกัน:

| ความแตกต่าง | Buyer (AUTH-2.x) | **Seller (SELLER-1.x)** |
|---|---|---|
| **Route** | `/register/buyer` | `/register/seller` |
| **Icon / Theme** | ShoppingCart / เขียว `#1a7c3e` | **Leaf / ส้ม `#fa8c16`** |
| **Sub-types** | 2 (individual, company) | **5 (farmer, cooperative, farmer_group, business, organization)** |
| **Markets** | Multi-select (≥1 ตลาด) | **Single select (1 ตลาดเท่านั้น)** |
| **Rubber types** | — | **Multi-select 6 ชนิด (≥1)** |
| **Registration No.** | — | **`farmerRegNo` (farmer) / `instRegNo` (cooperative) / `commerceRegNo` + `businessRegNo` (business)** |
| **Authorized Person / Representative** | — | **มีในทุก sub-type ยกเว้น `farmer`** |
| **Special docs** | นิติบุคคล → company cert + director ID + POA | **สถาบัน/กลุ่ม → orgCert; กิจการยาง → factoryLicense + companyCert** |
| **Application ID** | `R{nnn}` (R001, R002) | **`RS{nnn}` (RS001, RS002)** |

มีกระบวนการอนุมัติแบบ **Two-tier Approval** เหมือนกับ Buyer:
**ผู้สมัครส่งเอกสาร → เจ้าหน้าที่ตลาดตรวจ (Tier 1) → ผอ.ตลาดอนุมัติ (Tier 2) → เปิดใช้งานบัญชี**

---

## Feature List Summary

| Jira Card | Feature ID | ชื่อ Feature | Priority | Phase |
|---|---|---|---|---|
| [RAOT-125](https://deeploytech-team.atlassian.net/browse/RAOT-125) | SELLER-1.1 | Seller : Register Wizard Shell — ลงทะเบียนผู้ขาย | High | 1 |
| [RAOT-126](https://deeploytech-team.atlassian.net/browse/RAOT-126) | SELLER-1.2 | Seller : Register Step 1 — PDPA + เลือกประเภทผู้ขาย + ตลาด + ชนิดยาง | High | 1 |
| [RAOT-127](https://deeploytech-team.atlassian.net/browse/RAOT-127) | **SELLER-1.3** | Seller : Register Step 2 — ข้อมูลส่วนตัว/องค์กร + ที่อยู่ติดต่อ (Parent) | High | 1 |
| [RAOT-128](https://deeploytech-team.atlassian.net/browse/RAOT-128) | ↳ SELLER-1.3.1 | farmer — เกษตรกรชาวสวนยาง (6 personal fields + farmerRegNo) | High | 1 |
| [RAOT-129](https://deeploytech-team.atlassian.net/browse/RAOT-129) | ↳ SELLER-1.3.2 | cooperative — สถาบันเกษตรสวนยาง (orgName + taxId + instRegNo + authorized person + delegated) | High | 1 |
| [RAOT-130](https://deeploytech-team.atlassian.net/browse/RAOT-130) | ↳ SELLER-1.3.3 | business — ผู้ประกอบกิจการยาง (orgName + commerceRegNo + businessRegNo + authorized person + delegated) | High | 1 |
| [RAOT-131](https://deeploytech-team.atlassian.net/browse/RAOT-131) | ↳ SELLER-1.3.4 | farmer_group — กลุ่มพัฒนาชาวสวนยาง (orgName + authorized person + group representative) | High | 1 |
| [RAOT-132](https://deeploytech-team.atlassian.net/browse/RAOT-132) | ↳ SELLER-1.3.5 | organization — องค์กร (orgName + taxId + authorized person + delegated) | High | 1 |
| [RAOT-133](https://deeploytech-team.atlassian.net/browse/RAOT-133) | SELLER-1.4 | Seller : Register Step 3 — บัญชีธนาคาร | High | 1 |
| [RAOT-134](https://deeploytech-team.atlassian.net/browse/RAOT-134) | SELLER-1.5 | Seller : Register Step 4 — ตั้งชื่อผู้ใช้ & รหัสผ่าน | High | 1 |
| [RAOT-135](https://deeploytech-team.atlassian.net/browse/RAOT-135) | SELLER-1.6 | Seller : Register Step 5 — อัปโหลดเอกสาร (ตาม sub-type) | High | 1 |
| [RAOT-136](https://deeploytech-team.atlassian.net/browse/RAOT-136) | SELLER-1.7 | Seller : Register Success & Application ID | High | 1 |
| [RAOT-137](https://deeploytech-team.atlassian.net/browse/RAOT-137) | SELLER-1.8 | Seller : Pending Status Page — ติดตามสถานะคำขอ | High | 1 |
| [RAOT-138](https://deeploytech-team.atlassian.net/browse/RAOT-138) | SELLER-1.9 | Seller : Resubmit Rejected Application — ยื่นคำขอใหม่ | High | 2 |

> **หมายเหตุ:** Login (AUTH-1.x), Forgot/Reset Password (AUTH-3.x) ใช้ shared flow กับ Buyer — ดูใน [Feature-List-Auth.md](Feature-List-Auth.md)

---

## [RAOT-125](https://deeploytech-team.atlassian.net/browse/RAOT-125) · SELLER-1.1 — Register Wizard Shell

**Page:** `/register/seller`
**Source:** `src/app/(auth)/register/[role]/page.tsx` (role param = `seller`)

### Detail

1. ผู้ใช้คลิก "สมัครผู้ขาย" จากหน้า `/login` → เข้า `/register/seller`
2. ตรวจ param `role` — รองรับเฉพาะ `seller`; ค่าอื่น → แสดง Result 404 "ไม่พบประเภทผู้ลงทะเบียน" + ปุ่ม "กลับไปเข้าสู่ระบบ"
3. แสดง ShellContainer — gradient เขียว + Card กึ่งกลาง maxWidth 720px
4. แสดง Header strip ขาว — **Icon Leaf สีส้ม `#fa8c16`** + Title "ลงทะเบียนผู้ขาย" + Subtitle "RAOT Rubber Traceability — Registration"
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

1. **Role param ที่ valid** — เฉพาะ `seller` เท่านั้น; เจ้าหน้าที่/admin ไม่สมัครเองได้ (Admin สร้างให้)
2. **การ navigate ระหว่าง step** — กดถัดไปจะตรวจ `getStepFields()` ตาม subType และเรียก `form.validateFields()` ก่อน setStep
3. **การ validate fail** — แสดง inline error ของ AntD Form (ไม่ขยับ step)
4. **โหมด Resubmit** — หาก URL มี `?resubmit={appId}` → Steps จะซ่อน `creds` (เหลือ 4 ขั้นตอน) เพราะใช้ username/password เดิม (ดู SELLER-1.9)
5. **Color theme** — Card border + Radio selection สีส้ม `#fa8c16` (`roleColor`) — แยกจาก Buyer ที่ใช้สีเขียว
6. **หลังส่งสำเร็จ** → switch view ไปหน้า Success (ดู SELLER-1.7)

### Edge Case

1. **เข้า URL ด้วย role ที่ไม่รองรับ** — เช่น `/register/admin`, `/register/staff`, `/register/abc` ต้องแสดง Result 404 และไม่ render wizard form
2. **กดถัดไปโดยยังกรอก field required ของ step ปัจจุบันไม่ครบ** — ต้องแสดง inline validation error และคงอยู่ step เดิม
3. **ผู้ใช้กดย้อนกลับหลังกรอกข้อมูลใน step ถัดไปแล้ว** — ข้อมูลที่กรอกไว้ต้องยังคงอยู่ใน Form state เพื่อให้กลับมาแก้ไขได้
4. **กดปุ่มถัดไป/ส่งคำขอซ้ำเร็ว ๆ** — ระบบต้องป้องกัน duplicate submit หรือการขยับ step ซ้ำจาก double click
5. **Refresh browser ระหว่างกรอกข้อมูล** — หากยังไม่มี draft persistence ต้องถือว่าข้อมูลหายและเริ่ม wizard ใหม่; หากมี draft ในอนาคตต้อง restore ตาม role/subType เดิม
6. **เปิด `/register/seller?resubmit={appId}` แต่ `appId` ไม่ถูกต้องหรือไม่พบใบสมัคร** — ต้องแสดง error/resubmit not found และไม่ให้ส่งคำขอซ้ำภายใต้ application ที่ไม่ valid
7. **Resubmit mode แต่ application เดิมไม่ใช่ seller** — ต้อง block flow และไม่ใช้ wizard ของ seller กับใบสมัคร role อื่น
8. **Resubmit mode ต้องซ่อน step ตั้งรหัสผ่านเท่านั้น** — step index, label "ขั้นตอนที่ {n} / {total}" และปุ่ม navigation ต้องนับเป็น 4 ขั้นตอนอย่างถูกต้อง
9. **Validation ของ step ก่อนหน้าล้มเหลวหลังผู้ใช้ย้อนกลับมาแก้ไข** — เมื่อกดถัดไปต้อง validate ใหม่ทุกครั้ง ไม่อิงผล validate เดิม
10. **Submit สำเร็จแล้วผู้ใช้กด back browser** — ไม่ควรส่งซ้ำทันที; ควรคงหน้า Success หรือป้องกัน duplicate application
11. **Network/API error ตอนส่งคำขอ** — ต้องแสดง error message ให้ผู้ใช้รับรู้ และยังคงข้อมูลในฟอร์มเพื่อให้ลองส่งใหม่ได้
12. **ขนาดหน้าจอ mobile** — Steps, header, chip กลับเข้าสู่ระบบ และปุ่ม navigation ต้องไม่ซ้อนทับกันหรือทำให้ปุ่มหลักหายจาก viewport

### Effect to / Relate to

- **SELLER-1.2 → SELLER-1.6** (5 steps)
- **SELLER-1.7** (Success)
- **SELLER-1.9** (Resubmit mode)

---

## [RAOT-126](https://deeploytech-team.atlassian.net/browse/RAOT-126) · SELLER-1.2 — Register Step 1: PDPA + เลือกประเภทผู้ขาย + ตลาด + ชนิดยาง

**Step key:** `pdpa` (Step 1 of 5)
**Source:** `src/app/(auth)/register/[role]/page.tsx` (currentStepKey === 'pdpa', isSeller=true)

### Detail

1. แสดง Alert info "นโยบายความเป็นส่วนตัว (PDPA) — การยางแห่งประเทศไทย" พร้อมเนื้อหา 5 หัวข้อ:
   - ข้อมูลที่เก็บรวบรวม — ชื่อ, เลขบัตรประชาชน, เลขผู้เสียภาษี, บัญชีธนาคาร, เอกสารยืนยันตัวตน, ที่อยู่, email, เบอร์, Cookie/IP/Log
   - วัตถุประสงค์ — ยืนยันตัวตน, เปิดบัญชี, ประมูล/ซื้อ-ขาย, ออกใบเสร็จ, ติดต่อ, รายงานตามภารกิจ
   - การเปิดเผย — ไม่เปิดเผยต่อบุคคลที่สาม ยกเว้นคู่ค้า/หน่วยงานรัฐที่มีอำนาจ
   - สิทธิของท่าน — เข้าถึง/แก้ไข/ลบ/ระงับ/โอนย้าย/คัดค้าน/เพิกถอน/ร้องเรียน สคส.
   - ความมั่นคงปลอดภัย — TLS encryption + จำกัดสิทธิเข้าถึง
2. แสดง link "นโยบาย PDPA ฉบับเต็ม" → เปิด `PrivacyPolicyModal`
3. แสดง Checkbox "ฉันได้อ่านและยอมรับนโยบาย PDPA แล้ว"
4. แสดง Section "ประเภทผู้ขาย" — Radio.Group ใน Card list — **5 ตัวเลือก**:
   - **เกษตรกร (รายบุคคล)** (`farmer`) — "เจ้าของสวนยาง — ต้องระบุเลขทะเบียนเกษตรกรชาวสวนยาง"
   - **สถาบันเกษตรกร** (`cooperative`) — "สหกรณ์การเกษตร / กลุ่มเกษตรกร"
   - **กลุ่มพัฒนาเกษตรกร** (`farmer_group`) — "กลุ่มที่ขึ้นทะเบียนกับ กยท."
   - **ผู้ประกอบกิจการยาง** (`business`) — "ผู้ประกอบการแปรรูปยาง — ต้องแนบใบอนุญาต"
   - **องค์กร** (`organization`) — "องค์กรอื่นๆ ที่ขึ้นทะเบียน"
5. แสดง **Checkbox.Group "ชนิดยางที่ต้องการขาย"** (เลือกอย่างน้อย 1) — 6 ชนิด layout 2 columns:
   - ยางแผ่นรมควัน RSS
   - ยางแผ่นดิบ USS
   - ยางก้อนถ้วย (Cup Lump)
   - น้ำยางสด (Field Latex)
   - ยางเครป (Crepe)
   - ยางก้อนแห้ง
6. แสดง **Select "ตลาดที่ลงทะเบียน"** (เลือก 1 ตลาดเท่านั้น) — 3 ตัวเลือก:
   - ตลาดกลางยางพาราสุราษฎร์ธานี
   - ตลาดกลางยางพารานครศรีธรรมราช
   - ตลาดกลางยางพาราสงขลา
   - Extra text — "ผู้ขายลงทะเบียนได้กับ 1 ตลาดเท่านั้น (ตามนโยบาย กยท.)"

### Condition

1. **PDPA checkbox** — required; ไม่ติ๊ก → "กรุณายอมรับนโยบาย PDPA เพื่อดำเนินการต่อ"
2. **subType** — required (radio); ไม่เลือก → "กรุณาเลือกประเภท"
3. **`rubberTypes`** — array ต้องมีอย่างน้อย 1 element → "เลือกอย่างน้อย 1 ชนิด"
4. **`market`** — required (single select) → "กรุณาเลือกตลาด"
5. **One-market rule** — เป็นนโยบายของ กยท. ผู้ขายลงได้ 1 ตลาดเท่านั้น (ต่างจาก Buyer ที่ลงได้หลายตลาด); การเปลี่ยนตลาดต้องผ่าน Admin
6. **การคลิกที่ Card subType ทั้งใบ** — `onClick={() => form.setFieldValue('subType', t.value)}` (ขยายพื้นที่กด)
7. **subType เปลี่ยน sub-flow** ใน step ถัดไป:
   - `farmer` → SELLER-1.3.1 บังคับกรอก `farmerRegNo` + dob + nationalId; SELLER-1.6 ใช้เอกสารพื้นฐาน 4 ฉบับ
   - `cooperative` / `farmer_group` / `organization` → SELLER-1.6 + `docOrgCert`
   - `business` → SELLER-1.6 + `docFactoryLicense` + `docCompanyCert`

### Edge Case

1. **ไม่ยอมรับ PDPA แต่เลือกข้อมูลอื่นครบแล้ว** — ต้อง block การกดถัดไปและ focus/scroll ไปที่ checkbox PDPA
2. **ยอมรับ PDPA แล้วเปลี่ยนใจเอา checkbox ออก** — ต้องถือว่า step ไม่ valid ทันที และห้ามไป step ถัดไป
3. **ยังไม่เลือกประเภทผู้ขาย (`subType`)** — ต้องไม่ render form เฉพาะ sub-type ใน Step 2 และต้องแสดง required error เมื่อกดถัดไป
4. **เปลี่ยน `subType` หลังเคยกรอก Step 2 แล้ว** — Step 2 ต้อง render form ใหม่ตาม subType ล่าสุด และ validate เฉพาะ field ของ subType ล่าสุด
5. **เลือกชนิดยางแล้วเอาออกจนเหลือ 0 รายการ** — ต้องแสดง error "เลือกอย่างน้อย 1 ชนิด" และ block การไป step ถัดไป
6. **เลือกชนิดยางหลายรายการ** — ต้องบันทึกเป็น array ของค่าที่เลือกทั้งหมด และต้องไม่ถูกลดเหลือรายการเดียว
7. **พยายามเลือกตลาดมากกว่า 1 ตลาด** — UI ต้องเป็น single select เท่านั้น; payload ต้องมี `market` ค่าเดียวตาม One-market rule
8. **ตลาดที่เลือกถูกเปลี่ยน/ลบจาก master data ระหว่างใช้งาน** — ต้อง validate อีกครั้งก่อน submit และแจ้งให้ผู้ใช้เลือกตลาดใหม่หากค่าเดิมไม่ valid
9. **คลิกบริเวณ Card subType แต่ไม่ได้คลิก radio โดยตรง** — ต้องเลือก subType ได้เหมือนกัน เพื่อให้พื้นที่กดทั้งใบทำงานตาม spec
10. **กลับมาที่ Step 1 หลังกรอกข้อมูลใน step ถัดไปแล้วเปลี่ยน subType** — ข้อมูลเดิมที่ไม่เกี่ยวข้องต้องไม่ถูกส่งใน payload และเอกสาร Step 5 ต้องเปลี่ยนตาม subType ใหม่
11. **เปิด Privacy Policy Modal แล้วปิดโดยไม่ติ๊ก PDPA** — ต้องยังถือว่า PDPA ไม่ผ่าน; การเปิดอ่าน policy ไม่เท่ากับยอมรับ
12. **หน้าจอ mobile ที่ชนิดยางแสดง 2 columns ไม่พอดี** — ต้องปรับ layout ให้ไม่ล้นจอ และ checkbox label ต้องอ่านได้ครบ

### Effect to / Relate to

- **SELLER-1.3.1** → **SELLER-1.3.5** (subType ตัดสิน form layout — ดู sub-features)
- **SELLER-1.6** (subType ตัดสินเอกสารเพิ่มเติม)
- **Privacy-Modal** (PDPA full policy)

---

## [RAOT-127](https://deeploytech-team.atlassian.net/browse/RAOT-127) · SELLER-1.3 — Register Step 2: ข้อมูลส่วนตัว / องค์กร + ที่อยู่ติดต่อ (Parent)

**Step key:** `personal` (Step 2 of 5)
**Source:** `src/app/(auth)/register/[role]/page.tsx` → `SellerPersonalStep`
**Spec reference:** `docs/image/register-fields.md` (จาก screenshot trt.raot.co.th/register)
**Helpers:** `validateThaiId`, `getDistricts`, `getSubDistricts`, `lookupZipcode`

### Detail (common — applies to all sub-types)

1. ที่หัว step แสดง Select **"ประเภทผู้ใช้งาน"** — `name="subType"`, required, placeholder "เลือกประเภทผู้ใช้งาน"
2. หากยังไม่เลือก subType — แสดง Alert info "กรุณาเลือกประเภทผู้ใช้งานเพื่อแสดงแบบฟอร์มที่ต้องกรอก" และซ่อน field อื่นทั้งหมด
3. หลังเลือก subType — render Form per-subType ตาม mapping ใน SELLER-1.3.1 → SELLER-1.3.5
4. ทุก sub-type จะ render Section **"ข้อมูลที่อยู่ติดต่อ"** ด้านล่างเหมือนกัน (ดู Common Fields ด้านล่าง)
5. การเปลี่ยน subType ระหว่างกรอก — fields เก่าคงค่าใน Form state แต่ไม่ถูก validate; UI fade-in ใหม่ (key={subType} remount + class "page-content")

### Condition (common)

1. `subType` — required (Select); ไม่เลือก → "กรุณาเลือกประเภทผู้ใช้งาน" และ block ปุ่ม "ถัดไป"
2. แต่ละ sub-type มี `getStepFields()` ของตัวเอง — wizard validate เฉพาะ fields ของ sub-type ปัจจุบันก่อน setStep
3. การเปลี่ยน subType — Form state ไม่ถูก reset (กันผู้ใช้พิมพ์ใหม่หมด) แต่ field ที่ไม่ relevant จะไม่ถูกส่งใน `submitApplication`

### Edge Case (common)

1. **เข้ามา Step 2 โดยยังไม่มี `subType`** — ต้องแสดง Alert ให้เลือกประเภทผู้ใช้งาน และซ่อน field อื่นทั้งหมดจนกว่าจะเลือก subType
2. **เปลี่ยน `subType` จาก dropdown ใน Step 2 ไม่ตรงกับที่เลือกใน Step 1** — ต้องใช้ค่า subType ล่าสุดเป็น source of truth สำหรับ form layout, validation และเอกสารที่ต้องอัปโหลด
3. **เปลี่ยน `subType` หลายครั้งระหว่างกรอก** — Form state อาจคงค่า field เก่าได้ แต่ validation และ payload ต้องอิงเฉพาะ field ที่เกี่ยวกับ subType ปัจจุบัน
4. **กดถัดไปทันทีหลังเปลี่ยน `subType`** — ต้อง validate field set ของ subType ใหม่ ไม่ใช่ field set ก่อนหน้า
5. **field common address กรอกไม่ครบ** — ต้อง block ทุก subType เหมือนกัน เพราะข้อมูลที่อยู่ติดต่อเป็น required common section
6. **เลือกจังหวัดแล้วเปลี่ยนจังหวัดใหม่** — ต้อง clear `district`, `subDistrict`, `zipcode` เพื่อไม่ให้ข้อมูลพื้นที่ค้างจากจังหวัดเดิม
7. **เลือกอำเภอแล้วเปลี่ยนอำเภอใหม่** — ต้อง clear `subDistrict`, `zipcode` เพื่อให้ zipcode ตรงกับตำบลใหม่
8. **zipcode auto-fill ได้ค่า แต่ผู้ใช้แก้เองเป็น format ไม่ถูกต้อง** — ต้อง validate pattern `^\d{5}$` ก่อนให้ไป step ถัดไป
9. **อีเมล format ไม่ถูกต้อง หรือมีช่องว่างหัวท้าย** — ต้อง trim ก่อน validate หรือแจ้ง error format email ของ AntD
10. **เบอร์โทรศัพท์ไม่ขึ้นต้นด้วย 0 / ไม่ครบ 10 หลัก / มีตัวอักษรปน** — ต้องแสดง validation error ตาม pattern `^0\d{9}$`
11. **ข้อมูล master จังหวัด/อำเภอ/ตำบลโหลดไม่สำเร็จหรือไม่พบรายการ** — ต้องไม่ให้เลือกค่าที่ไม่ valid และควรแสดงข้อความให้ผู้ใช้ลองใหม่หรือแจ้งเจ้าหน้าที่
12. **ข้อมูลที่อยู่ยาวมากใน `addressLine`** — ต้องไม่ทำให้ layout แตก และควรมี max length ตาม policy หาก backend จำกัดความยาว field

---

### Common Section — ข้อมูลที่อยู่ติดต่อ (ใช้ทุก sub-type)

**Component:** `ContactAddressFields`
**Section card title:** "ข้อมูลที่อยู่ติดต่อ"

| # | Field | Form name | Type | Required | Validation / Notes |
|---|---|---|---|---|---|
| 1 | บ้านเลขที่ / หมู่ / ซอย / ถนน | `addressLine` | Text (Input) | ✅ | placeholder "เช่น 123/4 หมู่ 5 ซ.รักไทย ถ.สุขุมวิท" — รวมเลขที่/หมู่/ถนน ในช่องเดียว |
| 2 | จังหวัด | `province` | Select showSearch | ✅ | รายชื่อจาก `PROVINCE_NAMES`; เปลี่ยนค่า → clear `district`/`subDistrict`/`zipcode` |
| 3 | อำเภอ | `district` | Select showSearch | ✅ | disabled จนกว่าจะเลือกจังหวัด; รายชื่อจาก `getDistricts(province)`; เปลี่ยนค่า → clear `subDistrict`/`zipcode` |
| 4 | ตำบล | `subDistrict` | Select showSearch | ✅ | disabled จนกว่าจะเลือกอำเภอ; รายชื่อจาก `getSubDistricts(province, district)`; auto-fill zipcode หลังเลือก |
| 5 | รหัสไปรษณีย์ | `zipcode` | Text (5 หลัก) | ✅ | pattern `^\d{5}$`; auto-fill จาก `lookupZipcode(province, district, subDistrict)` แต่ผู้ใช้แก้ได้ |
| 6 | อีเมล | `email` | Email | ✅ | placeholder "ตัวอย่าง example@mail.com"; AntD email validator |
| 7 | เบอร์โทรศัพท์ | `phone` | Text (10 หลัก) | ✅ | pattern `^0\d{9}$`; placeholder "ตัวอย่าง 0812345678" |

> **Spec vs Implementation:** `docs/image/register-fields.md` ระบุ "เลขที่ / ถนน / หมู่ที่" เป็น 3 fields แยก แต่ implementation รวมเป็น `addressLine` ช่องเดียว (เหตุผล: backward compat กับ Buyer flow + รวมข้อมูลเดียวง่ายต่อ approval review)

---

### [RAOT-128](https://deeploytech-team.atlassian.net/browse/RAOT-128) · SELLER-1.3.1 — เกษตรกรชาวสวนยาง (`farmer`)

**Section cards:** "ข้อมูลส่วนตัวผู้ใช้งาน" → "ข้อมูลที่อยู่ติดต่อ"

#### Field กรอก — ข้อมูลส่วนตัวผู้ใช้งาน

| # | Field | Form name | Type | Required | Validation / Notes |
|---|---|---|---|---|---|
| 1 | คำนำหน้า | `title` | Select | ✅ | นาย / นาง / นางสาว / อื่นๆ |
| 2 | ชื่อ | `firstName` | Text | ✅ | 2-50 ตัวอักษร; autoComplete="given-name" |
| 3 | นามสกุล | `lastName` | Text | ✅ | 2-50 ตัวอักษร; autoComplete="family-name" |
| 4 | วันเกิด | `dob` | DatePicker | ✅ | format `DD/MM/YYYY`; `inputReadOnly` (DatePicker เท่านั้น ห้ามพิมพ์) |
| 5 | เลขบัตรประจำตัวประชาชน | `nationalId` | Text (13 หลัก) | ✅ | ผ่าน `validateThaiId` Thai national ID checksum; placeholder "0000000000000"; `inputMode="numeric"` |
| 6 | **เลขทะเบียนเกษตรกรชาวสวนยาง** | `farmerRegNo` | Text | ✅ | เลขทะเบียนที่ออกโดย กยท. (Rubber Authority of Thailand) |

#### Conditional fields
- **ไม่มี** (farmer ใช้ field set พื้นฐานเท่านั้น — ไม่ต้องระบุผู้มีอำนาจ/ตัวแทน เพราะเป็นบุคคลธรรมดา)

#### เอกสารที่ต้องอัปโหลด (Step 5 — SELLER-1.6)
- **4 ฉบับ:** `docIdCard` + `docHouseReg` + `docBankBook` + `docPdpa`

#### Edge Case

1. **เปลี่ยนประเภทจาก `farmer` ไป sub-type อื่นหลังกรอกข้อมูลแล้ว** — ค่าของ `farmerRegNo`, `dob`, `nationalId` อาจยังคงอยู่ใน Form state แต่ต้องไม่ถูก validate และไม่ถูกส่งใน payload ของ sub-type ใหม่
2. **เปลี่ยนจาก sub-type อื่นกลับมาเป็น `farmer`** — ต้องแสดงเฉพาะ field ของบุคคลธรรมดา; field องค์กร/ผู้มีอำนาจ/ตัวแทนต้องไม่แสดงและไม่ block การกดถัดไป
3. **วันเกิดเป็นวันที่ในอนาคต** — ต้องไม่อนุญาตให้ผ่าน validation; ผู้สมัครต้องเลือกวันเกิดย้อนหลังเท่านั้น
4. **เลขบัตรประชาชนครบ 13 หลักแต่ checksum ไม่ถูกต้อง** — ต้องแสดง error จาก `validateThaiId` และห้ามไป step ถัดไป
5. **เลขบัตรประชาชนมีช่องว่าง/ขีด/ตัวอักษรปน** — ต้อง normalize หรือ reject ให้เหลือเฉพาะตัวเลข 13 หลักตาม rule ของ field
6. **เลขทะเบียนเกษตรกรชาวสวนยาง (`farmerRegNo`) มีเฉพาะช่องว่าง** — ต้องถือว่าไม่ได้กรอก และแสดง required error
7. **อายุต่ำกว่าเกณฑ์ที่ กยท. กำหนด** — หากมี policy อายุขั้นต่ำ ต้อง validate จาก `dob`; ถ้ายังไม่มี policy ให้ตรวจเฉพาะไม่เป็นวันที่อนาคต
8. **ชื่อ/นามสกุลสั้นกว่า 2 ตัวอักษร หรือยาวเกิน 50 ตัวอักษร** — ต้องแสดง inline validation error และคงอยู่ใน step เดิม
9. **เลือกคำนำหน้า "อื่นๆ"** — หากระบบยังไม่มี field ระบุคำนำหน้าเอง ต้องบันทึกค่าเป็น "อื่นๆ" ตาม option โดยไม่บังคับกรอก field เพิ่ม
10. **ข้อมูลที่อยู่เลือกจังหวัดแล้วเปลี่ยนจังหวัดใหม่** — ต้อง clear `district`, `subDistrict`, `zipcode` เดิม เพื่อป้องกัน zipcode ไม่ตรงพื้นที่
11. **zipcode auto-fill ไม่พบจาก master data** — ผู้ใช้ต้องยังสามารถกรอกเองได้ แต่ต้องผ่าน pattern ตัวเลข 5 หลัก
12. **เบอร์โทรศัพท์/อีเมลซ้ำกับใบสมัครที่ยังรอตรวจสอบ** — ระบบควร block หรือแจ้งผู้สมัครให้ติดตามใบสมัครเดิม เพื่อป้องกันคำขอซ้ำ

---

### [RAOT-129](https://deeploytech-team.atlassian.net/browse/RAOT-129) · SELLER-1.3.2 — สถาบันเกษตรสวนยาง (`cooperative`)

**Section cards:** "ข้อมูลสถาบันการเกษตร" → "ข้อมูลผู้มีอำนาจลงชื่อผูกพันนิติบุคคล" → "ข้อมูลที่อยู่ติดต่อ"

#### Field กรอก — ข้อมูลสถาบันการเกษตร

| # | Field | Form name | Type | Required | Validation / Notes |
|---|---|---|---|---|---|
| 1 | ชื่อสถาบันการเกษตร | `orgName` | Text (full-width) | ✅ | autoComplete="organization" |
| 2 | เลขประจำตัวผู้เสียภาษี / ทะเบียนนิติบุคคล | `taxId` | Text (numeric) | ✅ | UI label ย่อ "เลขผู้เสียภาษี / ทะเบียนนิติบุคคล" + tooltip "เลขประจำตัวผู้เสียภาษีหรือทะเบียนนิติบุคคลเลขที่" (label เต็ม) |
| 3 | เลขทะเบียนสถาบันเกษตรกร | `instRegNo` | Text | ✅ | เลขทะเบียนที่ออกโดย กยท. |

#### Field กรอก — ผู้มีอำนาจลงชื่อผูกพันนิติบุคคล (`AuthorizedPersonFields withDelegated={true}`)

| # | Field | Form name | Type | Required | Validation / Notes |
|---|---|---|---|---|---|
| 4 | คำนำหน้า | `authorizedPerson.title` | Select | ✅ | นาย / นาง / นางสาว / อื่นๆ |
| 5 | ชื่อ | `authorizedPerson.firstName` | Text | ✅ | autoComplete="given-name" |
| 6 | นามสกุล | `authorizedPerson.lastName` | Text | ✅ | autoComplete="family-name" |
| 7 | ตำแหน่ง | `authorizedPerson.position` | Text | ✅ | autoComplete="organization-title" |
| 8 | มอบอำนาจแก่ผู้รับมอบอำนาจ | `authorizedPerson.delegated` | Radio | ✅ | ตัวเลือก: `delegated` (มอบอำนาจ) / `not_delegated` (ไม่มอบอำนาจ) |

#### เอกสารที่ต้องอัปโหลด (Step 5)
- **5 ฉบับ:** 4 ฉบับพื้นฐาน + `docOrgCert` (หนังสือจดทะเบียนสถาบัน)

#### Edge Case

1. **ชื่อสถาบันเป็นค่าว่างหรือมีเฉพาะช่องว่าง** — ต้องถือว่าไม่ได้กรอก และ block การไป step ถัดไป
2. **เลขผู้เสียภาษี/ทะเบียนนิติบุคคลมีตัวอักษรหรือสัญลักษณ์ปน** — ต้อง reject หรือ normalize ให้เป็นตัวเลขตาม policy ของ field
3. **เลขทะเบียนสถาบันเกษตรกร (`instRegNo`) ไม่ตรงกับเอกสาร `docOrgCert`** — UI อนุญาตให้ส่งได้ แต่ reviewer ต้อง flag เป็นเหตุผล reject/ขอแก้ไข
4. **เลือก "มอบอำนาจ" แต่ยังไม่มีเอกสารมอบอำนาจใน document set** — ต้องถือเป็นช่องว่างของ spec; BA ต้องยืนยันว่าจะเพิ่มเอกสาร POA หรือให้ reviewer ตรวจจากเอกสารอื่น
5. **ผู้มีอำนาจไม่กรอกตำแหน่ง** — ต้อง block เพราะ `authorizedPerson.position` เป็น required
6. **เปลี่ยนจาก `cooperative` ไป subType อื่น** — `taxId`, `instRegNo`, `authorizedPerson` เดิมต้องไม่ถูก validate และไม่ถูกส่งใน payload ของ subType ใหม่

---

### [RAOT-130](https://deeploytech-team.atlassian.net/browse/RAOT-130) · SELLER-1.3.3 — ผู้ประกอบกิจการยาง (`business`)

**Section cards:** "ข้อมูลสถานประกอบการ" → "ข้อมูลผู้มีอำนาจลงชื่อผูกพันนิติบุคคล" → "ข้อมูลที่อยู่ติดต่อ"

#### Field กรอก — ข้อมูลสถานประกอบการ

| # | Field | Form name | Type | Required | Validation / Notes |
|---|---|---|---|---|---|
| 1 | ชื่อผู้ประกอบกิจการยาง / สถานประกอบการ | `orgName` | Text (full-width) | ✅ | autoComplete="organization" |
| 2 | เลขทะเบียนพาณิชย์ | `commerceRegNo` | Text | ✅ | |
| 3 | เลขทะเบียนผู้ประกอบกิจการยาง (ถ้ามี) | `businessRegNo` | Text | ❌ | optional — ระบุเมื่อมีเลขทะเบียนกับ กยท. แล้ว |

#### Field กรอก — ผู้มีอำนาจลงชื่อผูกพันนิติบุคคล (`AuthorizedPersonFields withDelegated={true}`)

| # | Field | Form name | Type | Required | Validation / Notes |
|---|---|---|---|---|---|
| 4 | คำนำหน้า | `authorizedPerson.title` | Select | ✅ | |
| 5 | ชื่อ | `authorizedPerson.firstName` | Text | ✅ | |
| 6 | นามสกุล | `authorizedPerson.lastName` | Text | ✅ | |
| 7 | ตำแหน่ง | `authorizedPerson.position` | Text | ✅ | |
| 8 | มอบอำนาจแก่ผู้รับมอบอำนาจ | `authorizedPerson.delegated` | Radio | ✅ | delegated / not_delegated |

#### เอกสารที่ต้องอัปโหลด (Step 5)
- **6 ฉบับ:** 4 ฉบับพื้นฐาน + `docFactoryLicense` (ใบอนุญาตประกอบกิจการโรงงาน — รง.4) + `docCompanyCert` (หนังสือรับรองบริษัท ≤6 เดือน)

#### Edge Case

1. **เลขทะเบียนพาณิชย์ (`commerceRegNo`) เป็นค่าว่างหรือมีเฉพาะช่องว่าง** — ต้องแสดง required error และคงอยู่ step เดิม
2. **ไม่กรอก `businessRegNo`** — ต้องยังผ่าน validation ได้ เพราะ field นี้ optional
3. **กรอก `businessRegNo` แล้วไม่ตรงกับใบอนุญาต/เอกสารประกอบกิจการ** — UI อนุญาตให้ส่งได้ แต่ reviewer ต้องตรวจและ reject ได้
4. **ผู้ประกอบกิจการเลือก "มอบอำนาจ"** — ต้องบันทึกค่า `authorizedPerson.delegated` ให้ครบ; หากต้องใช้เอกสารมอบอำนาจเพิ่มเติมต้องระบุใน SELLER-1.6 เพิ่มภายหลัง
5. **ขาด `docFactoryLicense` หรือ `docCompanyCert` ใน Step 5** — ต้อง block submit แม้ข้อมูล Step 2 จะครบ
6. **เปลี่ยนจาก `business` ไป `farmer` หลังกรอกเลขทะเบียนพาณิชย์แล้ว** — `commerceRegNo`, `businessRegNo`, `authorizedPerson` ต้องไม่ถูกส่งใน payload ของ farmer

---

### [RAOT-131](https://deeploytech-team.atlassian.net/browse/RAOT-131) · SELLER-1.3.4 — กลุ่มพัฒนาชาวสวนยาง (`farmer_group`)

**Section cards:** "ข้อมูลกลุ่มพัฒนาชาวสวนยาง" → "ข้อมูลผู้มีอำนาจลงชื่อผูกพันนิติบุคคล" → "ข้อมูลตัวแทนกลุ่ม" → "ข้อมูลที่อยู่ติดต่อ"

#### Field กรอก — ข้อมูลกลุ่ม

| # | Field | Form name | Type | Required | Validation / Notes |
|---|---|---|---|---|---|
| 1 | ชื่อกลุ่มพัฒนาชาวสวนยาง | `orgName` | Text (full-width) | ✅ | autoComplete="organization" |

#### Field กรอก — ผู้มีอำนาจลงชื่อผูกพันนิติบุคคล (`AuthorizedPersonFields withDelegated={false}`)

| # | Field | Form name | Type | Required | Validation / Notes |
|---|---|---|---|---|---|
| 2 | คำนำหน้า | `authorizedPerson.title` | Select | ✅ | |
| 3 | ชื่อ | `authorizedPerson.firstName` | Text | ✅ | |
| 4 | นามสกุล | `authorizedPerson.lastName` | Text | ✅ | |
| 5 | ตำแหน่ง | `authorizedPerson.position` | Text (full-width) | ✅ | **ไม่มี** field "มอบอำนาจ" (เพราะ `withDelegated=false`) |

#### Field กรอก — ข้อมูลตัวแทนกลุ่ม (`GroupRepresentativeFields`)

| # | Field | Form name | Type | Required | Validation / Notes |
|---|---|---|---|---|---|
| 6 | คำนำหน้า | `representative.title` | Select | ✅ | |
| 7 | ชื่อ | `representative.firstName` | Text | ✅ | autoComplete="given-name" |
| 8 | นามสกุล | `representative.lastName` | Text | ✅ | autoComplete="family-name" |
| 9 | เลขบัตรประจำตัวประชาชน | `representative.nationalId` | Text (13 หลัก) | ✅ | ผ่าน `validateThaiId` checksum; placeholder "ตัวอย่าง 1234567890123"; `inputMode="numeric"` |

#### หมายเหตุพิเศษ
- มี **2 บุคคล** ที่ต้องระบุ: (1) ผู้มีอำนาจลงนามผูกพัน + (2) ตัวแทนกลุ่ม — อาจเป็นคนเดียวกันหรือคนละคนก็ได้; ระบบไม่ตรวจซ้ำ
- ไม่มี field "มอบอำนาจ" เนื่องจากกลุ่มไม่ได้เป็นนิติบุคคลที่ต้องมอบอำนาจ — ใช้ "ตัวแทนกลุ่ม" แทน

#### เอกสารที่ต้องอัปโหลด (Step 5)
- **5 ฉบับ:** 4 ฉบับพื้นฐาน + `docOrgCert` (หนังสือจดทะเบียนกลุ่ม)

#### Edge Case

1. **ชื่อกลุ่มเป็นค่าว่างหรือมีเฉพาะช่องว่าง** — ต้องแสดง required error และ block การไป step ถัดไป
2. **ผู้มีอำนาจและตัวแทนกลุ่มเป็นคนเดียวกัน** — ระบบอนุญาตตาม spec และไม่ต้องแสดง duplicate error
3. **ผู้มีอำนาจและตัวแทนกลุ่มเป็นคนละคนกัน** — ต้องบันทึกทั้ง `authorizedPerson` และ `representative` ครบถ้วนใน payload
4. **เลขบัตรประชาชนของตัวแทนกลุ่มครบ 13 หลักแต่ checksum ไม่ถูกต้อง** — ต้องแสดง error จาก `validateThaiId` และห้ามไป step ถัดไป
5. **ไม่มี field "มอบอำนาจ" ใน `farmer_group`** — ต้องไม่ render, ไม่ validate และไม่ส่ง `authorizedPerson.delegated`
6. **ขาด `docOrgCert` ใน Step 5** — ต้อง block submit เพราะเป็นเอกสารบังคับของกลุ่ม
7. **เปลี่ยนจาก `farmer_group` ไป subType อื่น** — `representative` เดิมต้องไม่ถูก validate และไม่ถูกส่งถ้า subType ใหม่ไม่ใช้ field นี้

---

### [RAOT-132](https://deeploytech-team.atlassian.net/browse/RAOT-132) · SELLER-1.3.5 — องค์กร (`organization`)

**Section cards:** "ข้อมูลองค์กร" → "ข้อมูลผู้มีอำนาจลงชื่อผูกพันนิติบุคคล" → "ข้อมูลที่อยู่ติดต่อ"

#### Field กรอก — ข้อมูลองค์กร

| # | Field | Form name | Type | Required | Validation / Notes |
|---|---|---|---|---|---|
| 1 | ชื่อสถาบันการเกษตร | `orgName` | Text | ✅ | ⚠️ **Label ซ้ำกับ cooperative** — spec จาก trt.raot.co.th ระบุชื่อนี้ ถ้า BA ต้องการแยกควรเปลี่ยนเป็น "ชื่อองค์กร" |
| 2 | เลขประจำตัวผู้เสียภาษี / ทะเบียนนิติบุคคล | `taxId` | Text (numeric) | ✅ | UI label ย่อ + tooltip ฉบับเต็มเหมือน cooperative |

#### Field กรอก — ผู้มีอำนาจลงชื่อผูกพันนิติบุคคล (`AuthorizedPersonFields withDelegated={true}`)

| # | Field | Form name | Type | Required | Validation / Notes |
|---|---|---|---|---|---|
| 3 | คำนำหน้า | `authorizedPerson.title` | Select | ✅ | |
| 4 | ชื่อ | `authorizedPerson.firstName` | Text | ✅ | |
| 5 | นามสกุล | `authorizedPerson.lastName` | Text | ✅ | |
| 6 | ตำแหน่ง | `authorizedPerson.position` | Text | ✅ | |
| 7 | มอบอำนาจแก่ผู้รับมอบอำนาจ | `authorizedPerson.delegated` | Radio | ✅ | delegated / not_delegated |

#### เอกสารที่ต้องอัปโหลด (Step 5)
- **5 ฉบับ:** 4 ฉบับพื้นฐาน + `docOrgCert` (หนังสือจดทะเบียนองค์กร)

#### Edge Case

1. **ชื่อองค์กรเป็นค่าว่างหรือมีเฉพาะช่องว่าง** — ต้องถือว่าไม่ได้กรอก และแสดง required error
2. **label `orgName` แสดงเป็น "ชื่อสถาบันการเกษตร" เหมือน cooperative** — หาก BA ยังไม่แก้ label ต้องยอมรับตาม implementation; reviewer อาจสับสนกับประเภท cooperative
3. **เลขผู้เสียภาษี/ทะเบียนนิติบุคคลมี format ไม่ถูกต้อง** — ต้อง reject หรือ normalize ตาม rule ตัวเลขของ field ก่อนให้ไป step ถัดไป
4. **เลือก "มอบอำนาจ" แต่ไม่มีเอกสารประกอบการมอบอำนาจใน document set** — ต้องให้ BA ยืนยันว่าจะเพิ่มเอกสารหรือใช้การตรวจจาก `docOrgCert`
5. **ตำแหน่งผู้มีอำนาจยาวมาก** — ต้องไม่ทำให้ layout แตก และควรมี max length หาก backend จำกัด field
6. **เปลี่ยนจาก `organization` ไป `cooperative`** — `taxId` อาจใช้ร่วมได้ แต่ `docOrgCert` และ label/ความหมายของ `orgName` ต้องอิง subType ล่าสุด

---

### Field Count Summary

| Sub-type | Personal/Org fields | Common (address+contact) | **รวม Step 2** | Section cards |
|---|---|---|---|---|
| `farmer` | 6 | 7 | **13** | 2 (Personal + Address) |
| `cooperative` | 8 (3 org + 5 authority) | 7 | **15** | 3 (Org + Authority + Address) |
| `business` | 8 (3 business + 5 authority) | 7 | **15** | 3 (Business + Authority + Address) |
| `farmer_group` | 9 (1 group + 4 authority + 4 representative) | 7 | **16** | 4 (Group + Authority + Representative + Address) |
| `organization` | 7 (2 org + 5 authority) | 7 | **14** | 3 (Org + Authority + Address) |

### Effect to / Relate to

- **SELLER-1.2** (subType picker producer — ตัดสินว่าจะ render sub-feature ไหน)
- **SELLER-1.6** (subType ตัดสิน document set — ดู document matrix ใน Cross-cutting Notes)
- **SELLER-1.7** (submit ส่ง orgName / taxId / instRegNo / commerceRegNo / businessRegNo / farmerRegNo / authorizedPerson{} / representative{} ไป backend)
- **SELLER-1.8** (display ข้อมูลในใบสมัครสำหรับ pending status)
- **Officer/Director Approval** (verify ข้อมูลองค์กรกับเอกสารที่แนบ)

---

## [RAOT-133](https://deeploytech-team.atlassian.net/browse/RAOT-133) · SELLER-1.4 — Register Step 3: บัญชีธนาคาร

**Step key:** `bank` (Step 3 of 5)
**Component:** `BankAccountsStep`
**Form fields:** `bankAccounts[]`, `primaryBankIndex`
**Limit:** เพิ่มบัญชีได้สูงสุด 5 บัญชี (`MAX_ACCOUNTS = 5`)

### Detail

1. แสดง Alert info — "บัญชีธนาคารใช้สำหรับรับเงินค่ายาง / หักค่าธรรมเนียม"
   - Description: "สามารถเพิ่มบัญชีได้สูงสุด 5 บัญชี — เลือกบัญชีหลัก 1 บัญชีสำหรับรับเงินค่ายาง บัญชีอื่นไว้สำรอง / ใช้ในกรณีพิเศษ"
2. แสดงรายการบัญชีธนาคารแบบ Card stacked ผ่าน `Form.List name="bankAccounts"`
3. เริ่มต้น step ด้วยบัญชีว่าง 1 รายการ (`bankAccounts: [{ accountType: 'savings' }]`) เพื่อให้ผู้ใช้กรอกได้ทันที
4. แต่ละ Card แสดง:
   - ลำดับ "บัญชีที่ {n}"
   - summary ธนาคาร + เลขบัญชี mask เฉพาะ 4 หลักท้าย เมื่อกรอกแล้ว
   - Tag **"บัญชีหลัก"** เฉพาะ card ที่ index ตรงกับ `primaryBankIndex`
   - ปุ่ม **"ตั้งเป็นบัญชีหลัก"** เฉพาะบัญชีที่ยังไม่ใช่บัญชีหลัก
   - ปุ่ม **"ลบ"** เมื่อมีมากกว่า 1 บัญชี
5. Field ภายในแต่ละบัญชี:
   - **ธนาคาร** — Select showSearch — 7 ตัวเลือก: ธนาคารกรุงเทพ, กสิกรไทย, ไทยพาณิชย์, กรุงไทย, กรุงศรีอยุธยา, ทหารไทยธนชาต, ธ.ก.ส.
   - **เลขบัญชี** — Input maxLength=12 (10-12 หลัก)
   - **ชื่อบัญชี** — Input ("ตามที่ปรากฏในสมุดบัญชี")
   - **สาขา** — Input
   - **ประเภทบัญชี** — Select: ออมทรัพย์ (`savings`) / กระแสรายวัน (`current`)
6. แสดงปุ่ม dashed **"เพิ่มบัญชีธนาคารอีก ({count}/5)"** ด้านล่างรายการบัญชี
7. เมื่อจำนวนบัญชีครบ 5 รายการ ปุ่มเพิ่มบัญชี disabled และแสดงข้อความ "ครบจำนวนสูงสุด 5 บัญชีแล้ว"
8. เมื่อ submit ระบบบันทึกข้อมูลทั้งชุดใน `bankAccounts[]` และบันทึก `primaryBankIndex`
9. เพื่อ backward compatibility ระบบ flatten บัญชีหลักไปยัง legacy fields เดิมด้วย:
   - `bank`
   - `accountNo`
   - `accountName`
   - `branch`
   - `accountType`

### Condition

1. **ต้องมีอย่างน้อย 1 บัญชีธนาคาร** — หาก `bankAccounts` ว่าง → "กรุณาเพิ่มบัญชีธนาคารอย่างน้อย 1 บัญชี"
2. **เพิ่มได้สูงสุด 5 บัญชี** — เมื่อครบ `MAX_ACCOUNTS` ปุ่มเพิ่มบัญชี disabled
3. **ทุก field ภายในแต่ละบัญชี** — required (`bank`, `accountNo`, `accountName`, `branch`, `accountType`)
4. **`bankAccounts[n].accountNo`** — pattern `^\d{10,12}$` (10-12 หลักตัวเลข)
5. **`bankAccounts[n].accountType`** — enum `savings` หรือ `current` เท่านั้น; ค่าเริ่มต้นบัญชีใหม่เป็น `savings`
6. **`primaryBankIndex`** — ต้องชี้ไปยัง index ของบัญชีที่มีอยู่จริง; หากอยู่นอกช่วงตอน submit ให้ clamp กลับมาอยู่ในช่วงที่ valid
7. **ต้องมีบัญชีหลัก 1 บัญชีเสมอ** — default เป็นบัญชีแรก (`primaryBankIndex = 0`) และผู้ใช้กด "ตั้งเป็นบัญชีหลัก" เพื่อเปลี่ยนได้
8. **ลบบัญชีหลัก** — ระบบต้อง set `primaryBankIndex = 0` เพื่อให้บัญชีที่เหลือมีบัญชีหลักต่อทันที
9. **ลบบัญชีที่อยู่ก่อนบัญชีหลัก** — ระบบต้องลด `primaryBankIndex` ลง 1 เพื่อให้ยังชี้ไปยังบัญชีหลักเดิมหลัง index shift
10. **ชื่อบัญชี** ไม่บังคับให้ตรงกับชื่อ-นามสกุลผู้สมัคร แต่ควรตรง (ใช้ตอน reviewer ตรวจ)
11. **บัญชีนิติบุคคล/สถาบัน** — สำหรับ `cooperative` / `farmer_group` / `business` / `organization` ชื่อบัญชีหลักควรเป็นชื่อนิติบุคคล/กลุ่ม (ไม่บังคับใน UI; ใช้วิจารณญาณของ reviewer ตอนตรวจสอบ)
12. **เอกสารสมุดบัญชีใน SELLER-1.6** — อย่างน้อยต้องสอดคล้องกับบัญชีหลัก; หากต้องตรวจบัญชีสำรองทุกบัญชี ต้องเพิ่ม requirement เอกสารแนบรายบัญชีใน phase ถัดไป

### Edge Case

1. **เลขบัญชีมีขีด/ช่องว่าง/ตัวอักษรปน** — ต้อง reject หรือ normalize ให้เหลือเฉพาะตัวเลข 10-12 หลักก่อน validate ในบัญชีนั้น
2. **เลขบัญชีสั้นกว่า 10 หรือยาวกว่า 12 หลัก** — ต้องแสดง error ที่บัญชีนั้นและคงอยู่ step เดิม
3. **ผู้ใช้กรอกชื่อบัญชีไม่ตรงกับชื่อผู้สมัคร/ชื่อนิติบุคคล** — UI ไม่ block แต่ reviewer ต้องใช้เทียบกับ `docBankBook`
4. **ไม่เลือกประเภทบัญชีในบัญชีใดบัญชีหนึ่ง** — ต้องแสดง required error; บัญชีใหม่ default เป็น `savings` แต่ผู้ใช้ต้องมีค่า valid ตอน submit
5. **ธนาคารที่เลือกถูกลบจาก master list ระหว่างใช้งาน** — ต้อง validate อีกครั้งก่อน submit และให้ผู้ใช้เลือกใหม่หากค่าไม่ valid
6. **ชื่อสาขาว่างหรือมีเฉพาะช่องว่าง** — ต้องถือว่าไม่ได้กรอก เพราะทุก field ในแต่ละบัญชี required
7. **เพิ่มบัญชีครบ 5 แล้วกดเพิ่มอีก** — ปุ่มต้อง disabled และห้ามเพิ่ม record เกิน `MAX_ACCOUNTS`
8. **ลบบัญชีจนเหลือ 1 บัญชี** — ต้องซ่อน/disable ปุ่มลบ เพื่อไม่ให้ `bankAccounts` ว่าง
9. **ตั้งบัญชีที่ข้อมูลยังไม่ครบเป็นบัญชีหลัก** — อนุญาตให้ตั้งได้ แต่ยังต้อง validate field ของบัญชีนั้นก่อนกดถัดไป
10. **เลขบัญชีซ้ำกันในหลาย Card** — ระบบควรเตือนหรือ block ตาม policy; หากยังไม่ implement ให้ reviewer ตรวจ duplicate ตอน approval
11. **บัญชีหลักไม่ตรงกับสมุดบัญชีที่อัปโหลดใน `docBankBook`** — reviewer ต้อง reject หรือขอแก้ไข เพราะเอกสารต้องอ้างอิงบัญชีหลักเป็นขั้นต่ำ
12. **เปลี่ยน subType หลังกรอกบัญชีธนาคารแล้ว** — ข้อมูลบัญชีทั้งหมดต้องคงอยู่ แต่ reviewer expectation ของชื่อบัญชีหลักจะเปลี่ยนตาม subType ใหม่
13. **Application เก่ามีเฉพาะ legacy flat fields (`bank`, `accountNo`, `accountName`, `branch`, `accountType`)** — Resubmit ต้องแปลงกลับเป็น `bankAccounts[0]` และตั้ง `primaryBankIndex = 0`
14. **`primaryBankIndex` ค้างหลัง reorder/delete จาก Form.List** — ต้อง re-anchor ให้ชี้บัญชีที่ยังมีอยู่จริงก่อน submit

### Effect to / Relate to

- **SELLER-1.6** (เอกสารสำเนาสมุดบัญชีต้องสอดคล้อง)
- **SELLER-1.7** (submit บันทึก `bankAccounts[]` + `primaryBankIndex` และ flatten บัญชีหลักไป legacy fields)
- **SELLER-1.8** (Pending/Approval แสดงบัญชีธนาคารหลายบัญชี และแสดง Tag บัญชีหลัก)
- **Finance-Officer-Approval** (verify ตอนตรวจ)

---

## [RAOT-134](https://deeploytech-team.atlassian.net/browse/RAOT-134) · SELLER-1.5 — Register Step 4: ตั้งชื่อผู้ใช้ & รหัสผ่าน

**Step key:** `creds` (Step 4 of 5)
**Validator:** `passwordRule` (function in `register/[role]/page.tsx`)

### Detail

1. แสดง Alert warning — "ตั้งรหัสผ่านอย่างปลอดภัย" + คำแนะนำเรื่องความซับซ้อนของรหัสผ่าน
2. แสดง field:
   - **ชื่อผู้ใช้ (Username)** — Input (placeholder "ชื่อผู้ใช้", autoComplete=username)
3. แสดง 2 columns:
   - **รหัสผ่าน** — Input.Password (hasFeedback, autoComplete=new-password)
   - **ยืนยันรหัสผ่าน** — Input.Password (hasFeedback, dependencies=[password])

### Condition

1. **`username`** — required, pattern `^[a-z0-9]{6,}$` → "≥6 ตัว, a-z และ 0-9 เท่านั้น"
2. **`password`** — รวม rules ผ่าน `passwordRule`:
   - ความยาวอย่างน้อย 8 ตัวอักษร → "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร"
   - มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว → "ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว"
   - มีตัวพิมพ์เล็กอย่างน้อย 1 ตัว → "ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว"
   - มีตัวเลขอย่างน้อย 1 ตัว → "ต้องมีตัวเลขอย่างน้อย 1 ตัว"
   - มีอักขระพิเศษอย่างน้อย 1 ตัว → "ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว"
3. **`confirmPassword`** — required + ต้องตรงกับ `password` → "รหัสผ่านไม่ตรงกัน"
4. **โหมด Resubmit** — step นี้ **ถูกซ่อนทั้ง step** เพราะใช้ username/password เดิม (ดู SELLER-1.9)
5. **Username uniqueness** — ตอน submitApplication จะถูก reuse ใน `raot_pending_credentials` (ดู SELLER-1.7); การ submit ด้วย username ซ้ำกับ MOCK_CREDENTIALS หรือ pending credentials จะ throw error

### Edge Case

1. **username มีตัวพิมพ์ใหญ่** — ต้อง reject ตาม pattern `^[a-z0-9]{6,}$` หรือ normalize เป็นตัวพิมพ์เล็กตาม policy ที่ BA ยืนยัน
2. **username มีช่องว่าง/ขีด/underscore/อักขระพิเศษ** — ต้องแสดง validation error เพราะอนุญาตเฉพาะ a-z และ 0-9
3. **username ซ้ำกับบัญชีที่มีอยู่หรือ pending credentials** — submit ต้อง fail และแสดงข้อความให้ผู้ใช้เปลี่ยน username
4. **password ผ่านบาง rule แต่ไม่ครบทุก rule** — ต้องแสดง error เฉพาะ rule ที่ไม่ผ่าน และไม่ให้ไป step ถัดไป
5. **แก้ password หลังกรอก confirmPassword แล้ว** — ต้อง validate confirmPassword ใหม่ทันทีจาก dependency `[password]`
6. **confirmPassword มีช่องว่างหัวท้ายต่างจาก password** — ต้องถือว่าไม่ตรงกัน เว้นแต่ BA กำหนดให้ trim password ซึ่งไม่แนะนำ
7. **Resubmit mode แสดง step นี้โดยไม่ตั้งใจ** — ต้องถือเป็น bug เพราะผู้ใช้ต้องใช้ username/password เดิมเท่านั้น
8. **กด submit ซ้ำหลัง username uniqueness fail** — ต้องไม่สร้าง pending credential ค้างไว้บางส่วน

### Effect to / Relate to

- **AUTH-1.1** (username+password ใช้ login ภายหลัง — shared กับ Buyer)
- **SELLER-1.9** (Resubmit ซ่อน step นี้)
- **AUTH-3.2** (Reset password rule เดียวกัน — shared)

---

## [RAOT-135](https://deeploytech-team.atlassian.net/browse/RAOT-135) · SELLER-1.6 — Register Step 5: อัปโหลดเอกสาร (ตาม sub-type)

**Step key:** `docs` (Step 5 of 5)
**Constants:** `MAX_UPLOAD_SIZE_MB=10`, `ACCEPTED_MIME_TYPES=['image/jpeg','image/png','application/pdf']`

### Detail

1. แสดง Alert info — "อัปโหลดเอกสาร (รองรับ JPG, PNG, PDF — ขนาดไม่เกิน 10MB ต่อไฟล์)"
2. แสดง **4 ช่องอัปโหลด required** ที่ทุก subType ของผู้ขายต้องส่ง:
   - **สำเนาบัตรประชาชน** (`docIdCard`)
   - **สำเนาทะเบียนบ้าน** (`docHouseReg`)
   - **สำเนาสมุดบัญชีธนาคาร (≤6 เดือน)** (`docBankBook`)
   - **แบบยินยอม PDPA (เซ็นแล้ว)** (`docPdpa`)
3. แสดงช่องเพิ่มตาม **sub-type**:
   - **Seller + `farmer`** (เกษตรกรรายบุคคล): ไม่มีเอกสารเพิ่ม (ใช้เฉพาะ 4 ช่องข้างบน)
   - **Seller + (`cooperative` / `farmer_group` / `organization`)**: Divider "เอกสารสถาบัน / กลุ่ม"
     - หนังสือจดทะเบียนสถาบัน / กลุ่ม (`docOrgCert`) **required**
   - **Seller + `business`** (ผู้ประกอบกิจการยาง): Divider "เอกสารผู้ประกอบกิจการ"
     - ใบอนุญาตประกอบกิจการโรงงาน (`docFactoryLicense`) **required**
     - หนังสือรับรองบริษัท (≤6 เดือน) (`docCompanyCert`) **required**
4. แต่ละช่อง — ปุ่ม "เลือกไฟล์ (JPG / PNG / PDF, ≤10MB)" + แสดง file list หลังเลือก
5. การ submit สุดท้าย — แปลงทุกไฟล์เป็น Base64 data URL (`fileToDataUrl`) แล้วผูกเข้าใน `RegistrationDoc[]` ก่อนเรียก `submitApplication`

### Condition

1. **รูปแบบไฟล์ที่รับ** — MIME: `image/jpeg`, `image/png`, `application/pdf`; Extension fallback: `.jpg`, `.jpeg`, `.png`, `.pdf`
2. **ขนาดไฟล์** — สูงสุด `10MB` (`MAX_UPLOAD_SIZE_BYTES = 10*1024*1024`)
3. **หากไฟล์ผิดประเภท** — message error: `"{filename}" ไม่ใช่ประเภทไฟล์ที่รองรับ (JPG / PNG / PDF เท่านั้น)` + reject ด้วย `Upload.LIST_IGNORE`
4. **หากไฟล์ขนาดเกิน** — message error: `"{filename}" มีขนาด {N} MB เกินกำหนด (สูงสุด 10 MB)`
5. **แต่ละช่อง** — `maxCount=1` (อัปโหลดได้ไฟล์เดียวต่อช่อง)
6. **Validate ซ้ำตอน submit** (defence-in-depth) — เผื่อ beforeUpload ถูก bypass
7. **`QuotaExceededError`** ตอน submit (localStorage เต็มจากการเก็บ Base64 หลายๆ ไฟล์) → message: "พื้นที่จัดเก็บไม่เพียงพอ — กรุณาอัปโหลดไฟล์ขนาดเล็กลง หรือลบใบสมัครเก่าออกก่อน"
8. **POC limitation** — ไฟล์เก็บเป็น Base64 ใน localStorage (production จะใช้ encrypted S3 + signed URL)
9. **Document set summary**:

   | Sub-type | เอกสารบังคับ (รวม) |
   |---|---|
   | `farmer` | 4 ฉบับ (ID, ทะเบียนบ้าน, สมุดบัญชี, PDPA) |
   | `cooperative` / `farmer_group` / `organization` | 5 ฉบับ (4 พื้นฐาน + `docOrgCert`) |
   | `business` | 6 ฉบับ (4 พื้นฐาน + `docFactoryLicense` + `docCompanyCert`) |

### Edge Case

1. **ไม่อัปโหลดเอกสาร required ครบทุกช่อง** — ต้อง block submit และแสดง error ที่ช่องเอกสารนั้น
2. **ไฟล์มี extension ถูกต้องแต่ MIME ไม่ตรง** — ต้อง reject หากตรวจพบว่าไม่ใช่ JPG/PNG/PDF จริง
3. **ไฟล์ไม่มี MIME type จาก browser** — ให้ใช้ extension fallback เฉพาะ `.jpg`, `.jpeg`, `.png`, `.pdf`
4. **อัปโหลดไฟล์ขนาดพอดี 10MB** — ต้องผ่านได้; เกิน 10MB แม้เล็กน้อยต้อง reject
5. **อัปโหลดไฟล์ใหม่แทนไฟล์เดิมในช่องเดียวกัน** — ต้องแทนที่ไฟล์เดิมเพราะ `maxCount=1`
6. **เปลี่ยน subType หลังอัปโหลดเอกสารแล้ว** — document set ต้องเปลี่ยนตาม subType ใหม่; เอกสารที่ไม่เกี่ยวข้องต้องไม่ถูกส่ง
7. **Base64 conversion fail ระหว่าง submit** — ต้องแสดง error และคง fileList ไว้ให้ผู้ใช้ลองใหม่
8. **localStorage เต็มหลังแปลงไฟล์หลายฉบับ** — ต้องแสดง `QuotaExceededError` message และไม่สร้าง application แบบข้อมูลไม่ครบ
9. **ชื่อไฟล์ยาวมากหรือมีอักขระพิเศษ** — ต้องไม่ทำให้ file list layout แตก และควรเก็บชื่อไฟล์ตามที่ browser ส่งมา
10. **เอกสารหมดอายุ เช่น company cert เกิน 6 เดือน** — UI อาจไม่ตรวจจากไฟล์ได้ แต่ reviewer ต้องตรวจและ reject ได้

### Effect to / Relate to

- **SELLER-1.2** (subType ตัดสิน document set)
- **SELLER-1.7** (submit)
- **Officer-Approval** (ตรวจเอกสารทีละไฟล์ — Tier 1)
- **Director-Approval** (Tier 2)

---

## [RAOT-136](https://deeploytech-team.atlassian.net/browse/RAOT-136) · SELLER-1.7 — Register Success & Application ID

**Trigger:** หลัง `handleSubmit` สำเร็จใน wizard
**Service:** `submitApplication()` ใน `src/features/approvals/services/approval-data.ts`

### Detail

1. หลัง submit สำเร็จ — view เปลี่ยนเป็น Success state:
   - Icon CheckCircle ขนาด 64px สีเขียว
   - Title "ส่งคำขอลงทะเบียนเรียบร้อย"
   - Subtitle — "บัญชีผู้ขายของคุณถูกสร้างในสถานะ [รอตรวจสอบ] — เจ้าหน้าที่จะตรวจเอกสารและอนุมัติภายใน 1-3 วันทำการ ระบบจะแจ้งผลทาง email/SMS ที่กรอกไว้"
2. แสดง 2 ปุ่ม:
   - **กลับไปหน้าเข้าสู่ระบบ** → `/login`
   - **ตรวจสอบสถานะ** → `/register/pending?id={applicationId}&role=seller` (ถ้ามี applicationId)
3. แสดง Alert info — "ขั้นตอนการอนุมัติ (Two-tier Approval): (1) เจ้าหน้าที่ตลาดตรวจสอบเอกสาร → (2) ผู้อำนวยการตลาดอนุมัติ → เปิดใช้งานบัญชี"
4. ระบบสร้าง `Application` ใหม่ผ่าน `submitApplication()`:
   - generate id ฟอร์มัต **`RS{nnn}`** (เช่น RS001, RS002 — `RS` prefix แยกจาก Buyer ที่ใช้ `R`)
   - บันทึก `submittedAt` = current ISO timestamp
   - `overallStatus` = `pending_review`
   - `approvalStage` = `officer_review`
   - เก็บ `username` + `password` ลง `raot_pending_credentials` (key by username)
5. ส่ง user navigate ไป Pending page หรือ Login ตามที่กด

### Condition

1. **Application ID format** — Seller → **`RS{nnn}`** (RS001, RS002, ...) — แตกต่างจาก Buyer ที่ใช้ `R{nnn}`
2. **หาก submit error** — แสดง message ตามประเภท:
   - `QuotaExceededError` → "พื้นที่จัดเก็บไม่เพียงพอ..."
   - อื่นๆ → "ส่งคำขอลงทะเบียนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
3. **POC** — username/password เก็บใน `raot_pending_credentials` ทำให้ user login ได้ทันที (แต่จะเข้าได้ก็ต่อเมื่อ status approved); ก่อนนั้น login จะ throw `ACCOUNT_PENDING`
4. **Subtitle เตือนเรื่องการอนุมัติ** — ผู้ขายต้องผ่าน approval ก่อนจึงใช้งานได้ (เหมือนกับ Buyer)
5. **ไม่ส่ง email/SMS จริงในโหมด POC**

### Edge Case

1. **submit สำเร็จแต่ไม่ได้รับ `applicationId` กลับมา** — ปุ่ม "ตรวจสอบสถานะ" ต้องไม่ navigate ด้วย id ว่าง และควรให้กลับหน้า login ได้
2. **generate ID ชนกับ application เดิมใน storage** — ต้องหาเลขถัดไปและไม่ overwrite application เดิม
3. **บันทึก application สำเร็จแต่บันทึก pending credentials ล้มเหลว** — ต้องแสดง error หรือ rollback ให้ชัดเจนเพื่อไม่ให้เกิดใบสมัครที่ login ไม่ได้ภายหลัง
4. **ผู้ใช้กดปุ่ม submit ซ้ำระหว่างรอ response** — ต้องไม่สร้าง application ซ้ำหลายใบ
5. **submit error จาก username ซ้ำ** — ต้องกลับไปแก้ Step 4 ได้พร้อมข้อมูลเดิม ไม่ล้าง wizard ทั้งหมด
6. **submit error จาก document/storage** — ต้องคงไฟล์ที่เลือกไว้เพื่อให้ผู้ใช้ลดขนาดหรือเปลี่ยนไฟล์แล้วส่งใหม่
7. **ผู้ใช้ปิดหน้า Success แล้วกลับมาใหม่ด้วย browser back** — ต้องไม่ trigger submit ซ้ำจาก state เดิม
8. **POC ไม่ส่ง email/SMS จริง** — ข้อความบนหน้า Success ต้องไม่ทำให้ผู้ใช้เข้าใจว่าจะได้รับ notification จริงใน environment นี้

### Effect to / Relate to

- **SELLER-1.8** (Pending page)
- **AUTH-1.1** (login ใช้ creds นี้)
- **Officer-Approval** (Tier 1)
- **Director-Approval** (Tier 2)

---

## [RAOT-137](https://deeploytech-team.atlassian.net/browse/RAOT-137) · SELLER-1.8 — Pending Status Page (ติดตามสถานะคำขอ)

**Page:** `/register/pending?id={appId}&role=seller`
**Source:** `src/app/(auth)/register/pending/page.tsx`

### Detail

1. ดึง `id` และ `role` จาก query string (อยู่ใน Suspense boundary ตาม Next.js 16); `role` คงที่ `seller`
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
   - ชื่อ-นามสกุล / ประเภท (ผู้ขาย + subType เช่น "farmer", "cooperative") / วันที่สมัคร / ผู้ตรวจสอบ (ถ้ามี)
7. แสดง Alert ตามสถานะ:
   - approved → success + คอมเมนต์จาก ผอ. (ถ้ามี `approveNote`)
   - rejected → error พร้อม "เหตุผล:" + `rejectReason` + ผู้ปฏิเสธ + เวลา; ถ้า director_rejected และมี `forwardNote` แสดงบันทึกจากเจ้าหน้าที่ด้วย
   - awaiting_director → warning "เจ้าหน้าที่ตลาดตรวจสอบผ่านแล้ว — รอ ผอ.ตลาด อนุมัติขั้นสุดท้าย" + แสดง `forwardNote` (ถ้ามี)
   - default → info "เจ้าหน้าที่จะตรวจสอบเอกสารภายใน 1-3 วันทำการ ระบบจะแจ้งผลทาง Email/SMS"
8. แสดง 2 ปุ่ม:
   - **เข้าสู่ระบบ / กลับหน้าเข้าสู่ระบบ** → `/login`
   - **ยื่นคำขอใหม่ →** (เฉพาะ rejected) → `/register/seller?resubmit={appId}` (ดู SELLER-1.9)
9. **Auto-refresh** — polling ทุก 5 วินาที ดึงข้อมูลใหม่ (เพื่อ reflect การกดของเจ้าหน้าที่)

### Condition

1. **Step current** คำนวณจาก `statusToStep()`:
   - approved → step 3
   - rejected / officer_rejected / director_rejected → step -1 (ซ่อน Steps)
   - awaiting_director → step 2
   - pending_review / officer_review → step 1
2. **Steps status**: rejected → `error`; approved → `finish`; อื่น → `process`
3. **Polling interval** — 5 วินาที; cleanup ตอน unmount ด้วย `clearInterval`
4. **ปุ่ม "เข้าสู่ระบบ"** — ใช้ primary style (สีเขียวแบรนด์) เฉพาะเมื่อ approved
5. **ปุ่ม "ยื่นคำขอใหม่"** — แสดงเฉพาะกรณี rejected; ส่ง query `?resubmit={id}` ไปที่หน้า `/register/seller`
6. **หาก `appId` ไม่ตรงกับ application** ใน storage — แสดง Result 404 (ไม่ throw error)
7. **สถานะหลัง approval** — ผู้ขายจะ login ได้ทันที + ใช้งานฟีเจอร์ขายได้ (QR Code, Quota, ตกลงราคา, Bid/Ask, ตลาดล่วงหน้า — ดูใน sidebar menu ของ role seller)

### Edge Case

1. **query ไม่มี `id`** — ต้องแสดง Result 404 หรือ state ไม่พบข้อมูล โดยไม่ throw runtime error
2. **query `role` ไม่ใช่ `seller` แต่ `id` เป็น seller application** — ต้องใช้ rule ของ seller page หรือ block ตาม policy เพื่อกัน deep link ข้าม role
3. **application ถูกลบจาก storage ระหว่าง polling** — รอบ polling ถัดไปต้องแสดงไม่พบข้อมูลหรือหยุด polling อย่างปลอดภัย
4. **status เปลี่ยนจาก pending เป็น approved ระหว่างเปิดหน้าอยู่** — polling ต้อง update Steps, Alert และปุ่ม login ให้ตรงสถานะใหม่
5. **status เปลี่ยนเป็น rejected ระหว่างเปิดหน้าอยู่** — ต้องซ่อน Steps และแสดงปุ่ม "ยื่นคำขอใหม่" โดยไม่ต้อง refresh หน้าเอง
6. **rejectReason ว่างหรือไม่มีค่า** — ต้องแสดงข้อความ fallback เช่น "ไม่ระบุเหตุผล" เพื่อไม่ให้ Alert ว่าง
7. **วันที่/เวลาใน application invalid** — ต้องแสดง fallback ที่อ่านได้ แทนการ render `Invalid Date`
8. **เปิดหลายแท็บที่สถานะต่างกันจาก localStorage** — polling ต้องอ่านค่าล่าสุดทุกครั้งและไม่ cache stale application
9. **unmount page ระหว่าง interval ทำงาน** — ต้อง cleanup `clearInterval` เพื่อป้องกัน memory leak
10. **กด "ยื่นคำขอใหม่" หลายครั้ง** — ต้อง navigate ไป resubmit URL เดิม ไม่สร้าง application ใหม่จนกว่าจะ submit wizard

### Effect to / Relate to

- **SELLER-1.7** (entry จาก success)
- **SELLER-1.9** (Resubmit)
- **AUTH-1.1** (ACCOUNT_PENDING redirect)
- **Officer-Approval**, **Director-Approval** (เปลี่ยน status)

---

## [RAOT-138](https://deeploytech-team.atlassian.net/browse/RAOT-138) · SELLER-1.9 — Resubmit Rejected Application (ยื่นคำขอใหม่)

**Page:** `/register/seller?resubmit={appId}` (Resubmit mode)
**Trigger:** จาก Pending status page (กรณี rejected)

### Detail

1. ผู้สมัครคลิก "ยื่นคำขอใหม่" จากหน้า `/register/pending` (กรณี rejected) → navigate ไป `/register/seller?resubmit={appId}`
2. หน้า register detect `resubmitId` จาก query → ดึง Application เดิมผ่าน `getAllApplications().find(a => a.id === resubmitId && a.type === 'seller')`
3. **Re-hydrate ทุก field** จาก application เดิม:
   - PDPA, subType
   - **rubberTypes** (multi-select)
   - **market** (single select)
   - ข้อมูลส่วนตัวทั้งหมด, dob (parse กลับเป็น dayjs), ที่อยู่
   - **Sub-type-specific fields**: `farmerRegNo` (farmer) / `orgName`+`taxId`+`instRegNo`+`authorizedPerson` (cooperative) / `orgName`+`commerceRegNo`+`businessRegNo`+`authorizedPerson` (business) / `orgName`+`authorizedPerson`+`representative` (farmer_group) / `orgName`+`taxId`+`authorizedPerson` (organization)
   - ข้อมูลธนาคารทั้งหมด
4. **Re-hydrate เอกสาร** — fetch `dataUrl` ของแต่ละเอกสาร → แปลงกลับเป็น `Blob` → สร้าง `File` object ใส่ `fileList` ของ Upload component (ผู้ใช้ไม่ต้อง attach ใหม่)
5. เก็บ `resubmitUsername` (จาก app เดิม) + `resubmitPassword` (จาก `getPendingCred(username)`) สำหรับ submit
6. แสดง Alert info สีฟ้าด้านบน Card:
   - "ยื่นคำขอใหม่ — ข้อมูลเดิมถูกกรอกให้แล้ว"
   - "ระบบดึงข้อมูลจากใบสมัครที่ถูกปฏิเสธ ({resubmitId}) มาให้ทั้งหมด รวมถึงเอกสารที่อัปโหลดไว้ — กรุณาตรวจสอบและแก้ไขจุดที่ถูกระบุในเหตุผลการปฏิเสธก่อนส่งใหม่"
   - "* ใช้ชื่อผู้ใช้ ({username}) และรหัสผ่านเดิม — ไม่ต้องตั้งใหม่"
7. **ซ่อน step "ตั้งรหัสผ่าน"** — `visibleSteps` filter `creds` ออก (เหลือ 4 ขั้นตอน)
8. ผู้ใช้แก้ไขเฉพาะจุดที่ถูก reject แล้ว submit เหมือนปกติ (ดู SELLER-1.7)

### Condition

1. **หาก app เดิมไม่อยู่ใน storage หรือ type ไม่ตรงกับ `seller`** — ไม่ prefill (เงียบๆ — ผู้ใช้กรอกใหม่หมด); ป้องกันการเปลี่ยนข้าม role
2. **หาก `dataUrl` ของบางเอกสารเสีย** — skip เฉพาะเอกสารนั้น (console.warn) ผู้ใช้ต้องอัปโหลดใหม่เฉพาะช่องนั้น
3. **หาก resubmit ไม่พบ pending cred password** — ใช้ fallback string `(reused-from-previous-application)` (POC — backend จริงจะใช้ user record)
4. **ใช้ username เดิม** **ห้ามเปลี่ยน** — กันการเปลี่ยนตัวตน
5. **submitApplication จะสร้าง Application ใหม่** (ID ใหม่ format `RS{nnn}`) — ไม่ใช่อัปเดต application เก่า; application เก่า rejected ยังคงอยู่ใน history
6. **หน้านี้ใช้ `useEffect` กับ async loader พร้อม cancellation flag** — ป้องกัน race condition
7. **subType เปลี่ยนได้ระหว่าง resubmit** — เช่น farmer → cooperative; ถ้าเปลี่ยน sub-type จะ render form set ใหม่ (ดู SELLER-1.3.x ตามที่เลือก) และ fields ของ sub-type เดิมจะไม่ถูกส่ง; แต่โดยปกติ reviewer คาดหวังให้ผู้ใช้แก้เฉพาะจุดที่ถูก reject ไม่ได้เปลี่ยน sub-type ทั้งหมด

### Edge Case

1. **resubmit id ไม่พบหรือ application ไม่ใช่ seller** — ต้องไม่ prefill ข้อมูล และต้องไม่ใช้ credentials ของใบสมัคร role อื่น
2. **application เดิมไม่ได้อยู่สถานะ rejected** — ควร block resubmit หรือแสดงข้อความว่า resubmit ได้เฉพาะคำขอที่ถูกปฏิเสธ
3. **เอกสารบางไฟล์ rehydrate ไม่สำเร็จ** — ต้อง prefill เอกสารที่ใช้ได้ต่อ และบังคับอัปโหลดใหม่เฉพาะช่องที่เสีย
4. **password เดิมหาไม่พบจาก pending credentials** — POC ใช้ fallback ได้ แต่ production ต้องอิง user record และไม่ expose password เดิม
5. **ผู้ใช้เปลี่ยน subType ระหว่าง resubmit** — ต้องเปลี่ยน field validation และ document set ตาม subType ใหม่ และไม่ส่ง field/เอกสารที่ไม่เกี่ยวข้อง
6. **ผู้ใช้ลบเอกสารที่ prefill มาแล้วไม่อัปโหลดใหม่** — ต้อง block submit หากช่องนั้นเป็น required ของ subType ปัจจุบัน
7. **ใบสมัครเก่ามีข้อมูล field ที่ schema ปัจจุบันเลิกใช้แล้ว** — ต้อง ignore field นั้นระหว่าง rehydrate และไม่ส่งซ้ำ
8. **เกิด race condition จากการออกจากหน้าเร็ว ๆ ระหว่าง loader ทำงาน** — cancellation flag ต้องป้องกัน setState หลัง unmount
9. **submit รอบใหม่สำเร็จ** — ต้องสร้าง `RS{nnn}` ใหม่และเก็บใบเก่าเป็น rejected history ไม่แก้ทับใบเดิม
10. **submit รอบใหม่ล้มเหลว** — ต้องคงข้อมูลที่ prefill/แก้ไขล่าสุดไว้เพื่อให้ผู้ใช้ลองส่งใหม่

### Effect to / Relate to

- **SELLER-1.1** (โหมดพิเศษของ register)
- **SELLER-1.5** (ซ่อน step creds)
- **SELLER-1.8** (entry จาก rejected status)
- **Officer-Approval** (review รอบใหม่ — Tier 1 ทำใหม่หมด ไม่ skip)

---

## Cross-cutting Notes

### Reference Data (Seller-only)

| Constant | Values | จำนวน |
|---|---|---|
| `SELLER_TYPES` | farmer, cooperative, farmer_group, business, organization | 5 |
| `RUBBER_TYPES` | RSS, USS, Cup Lump, Field Latex, Crepe, ยางก้อนแห้ง | 6 |
| `MARKETS` | สุราษฎร์ธานี, นครศรีธรรมราช, สงขลา | 3 |

### Document Matrix (Seller)

| Doc Field | Type | farmer | cooperative | farmer_group | organization | business |
|---|---|:-:|:-:|:-:|:-:|:-:|
| `docIdCard` | id_card | ✅ | ✅ | ✅ | ✅ | ✅ |
| `docHouseReg` | house_reg | ✅ | ✅ | ✅ | ✅ | ✅ |
| `docBankBook` | bank_book | ✅ | ✅ | ✅ | ✅ | ✅ |
| `docPdpa` | pdpa | ✅ | ✅ | ✅ | ✅ | ✅ |
| `docOrgCert` | org_cert | — | ✅ | ✅ | ✅ | — |
| `docFactoryLicense` | factory_license | — | — | — | — | ✅ |
| `docCompanyCert` | company_cert | — | — | — | — | ✅ |
| **รวมเอกสารบังคับ** | | **4** | **5** | **5** | **5** | **6** |

### Shared Features (ไม่ duplicate ที่นี่)

| Shared Feature | อยู่ใน |
|---|---|
| Login Public (`/login`) | [AUTH-1.1 in Feature-List-Auth.md](Feature-List-Auth.md#auth-11) |
| Role Detection & Session | [AUTH-1.3](Feature-List-Auth.md) |
| Remember Me & Session Expiry | [AUTH-1.4](Feature-List-Auth.md) |
| Logout | [AUTH-1.5](Feature-List-Auth.md) |
| Forgot Password | [AUTH-3.1](Feature-List-Auth.md) |
| Reset Password | [AUTH-3.2](Feature-List-Auth.md) |
| Officer Approval (Tier 1) | [Feature-List-Approval.md](Feature-List-Approval.md) |
| Director Approval (Tier 2) | [Feature-List-Approval.md](Feature-List-Approval.md) |

### Storage Keys (Seller-related)

| Key | Producer | Consumer |
|---|---|---|
| `raot_submitted_applications` | SELLER-1.7 (submitApplication) | Officer/Director approval pages |
| `raot_pending_credentials` | SELLER-1.7 | `loginWithCredentials` (AUTH-1.3) |
| `raot_application_overrides` | Officer/Director approve/reject | SELLER-1.8 status display |

---

## Out-of-scope / POC Limitations

1. **เลขทะเบียน Verification** — `farmerRegNo`, `instRegNo`, `commerceRegNo`, `businessRegNo` เป็นแค่ Text input ไม่มี backend ตรวจกับฐานข้อมูล กยท./กรมพัฒนาธุรกิจการค้าจริง; production ควรมี API verify
2. **One-market enforcement** — เป็น UI rule เท่านั้น (Select single mode); backend ไม่มี constraint table; production ควรเพิ่ม unique constraint `(seller_id, market_id)` พร้อม transfer flow ถ้าเปลี่ยนตลาด
3. **Rubber type validation** — ไม่ตรวจว่า rubber type ที่เลือกตรงกับ subType จริงไหม (เช่น `business` ไม่ควรเลือกน้ำยางสด); production อาจ business-rule เพิ่ม
4. **Cooperative member proof** — ไม่ตรวจว่าผู้สมัคร cooperative จริงๆ เป็นกรรมการ/ผู้มีอำนาจของสหกรณ์นั้นไหม; ใช้แค่ docOrgCert ซึ่งอาจไม่ระบุชื่อผู้สมัคร
5. **No real notification** — email/SMS เป็น UI placeholder; production: integrate provider
6. **Document Base64 storage** — POC limitation; production: encrypted S3 + signed URL
7. **Plot area unit** — ปัจจุบันรับเฉพาะ "ไร่"; ไม่รองรับ "งาน" หรือ "ตารางวา" (1 ไร่ = 4 งาน = 400 ตารางวา)
8. **Resubmit ไม่ skip Tier 1** — ใบใหม่ของ Resubmit ต้องผ่าน Officer review ใหม่หมด แม้ Officer คนเดิมเคยอนุมัติแล้ว; production อาจมี fast-track flow

---

*Generated by `/description-writer` skill — Detail + Condition format*
*Source code last reviewed: 2026-05-19*
