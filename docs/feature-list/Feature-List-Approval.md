# Feature List — ระบบอนุมัติผู้ซื้อ/ผู้ขาย (Two-tier Approval)

> **Project:** RAOT Green Rubber — ระบบตรวจสอบย้อนกลับผลผลิตยางพารา
> **Epic:** APPROVE — Buyer/Seller Registration Approval (Auction Officer & Market Director)
> **Source code:**
> - Officer: `src/app/(dashboard)/auction-officer/approvals/*`
> - Director: `src/app/(dashboard)/market-director/approval/*`
> - Service: `src/features/approvals/services/approval-data.ts`
> **Format:** Detail + Condition (BA spec)
> **Last updated:** 2026-05-15

---

## Epic Overview

ระบบอนุมัติคำขอลงทะเบียนผู้ซื้อ/ผู้ขายใช้ **Two-tier Approval Flow**:

```
ผู้สมัคร submit (จาก AUTH-2.7)
    ↓
[overallStatus=pending_review, approvalStage=officer_review]
    ↓
🔵 Tier 1 — เจ้าหน้าที่ประมูล (auction_officer) ตรวจเอกสาร
    ├─ ปฏิเสธ → [rejected, officer_rejected]
    └─ ส่งต่อ → [awaiting_director, director_review]
                  ↓
              🟣 Tier 2 — ผอ.ตลาด (market_director) อนุมัติ
                  ├─ ปฏิเสธ → [rejected, director_rejected]
                  └─ อนุมัติ → [approved, approved] → เปิดใช้งานบัญชี (AUTH-2.8)
```

| Status (`overallStatus`) | Stage (`approvalStage`) | ความหมาย |
|---|---|---|
| `pending_review` | `officer_review` | รอ Tier 1 ตรวจ |
| `awaiting_director` | `director_review` | Tier 1 ผ่านแล้ว รอ Tier 2 |
| `approved` | `approved` | ผ่าน Tier 2 เปิดใช้งานบัญชี |
| `rejected` | `officer_rejected` | Tier 1 ปฏิเสธ |
| `rejected` | `director_rejected` | Tier 2 ปฏิเสธ |
| `returned` | — | ส่งกลับให้แก้ไข (POC ยังไม่ใช้) |

**SLA:** 3 วันทำการ (จันทร์-ศุกร์) นับจาก `submittedAt` — ถ้าเกินจะแสดง Tag "เกิน SLA" สีแดง (`isOverSla()`)

---

## Feature List Summary

| Feature ID | ชื่อ Feature | Role | Priority | Phase |
|---|---|---|---|---|
| APPROVE-1.1 | Officer — รายการอนุมัติ (List + Tabs + Filter) | Auction Officer | High | 1 |
| APPROVE-1.2 | Officer — รายละเอียดใบสมัคร (Detail + Tabs) | Auction Officer | High | 1 |
| APPROVE-1.3 | Officer — ส่งต่อ ผอ. (Forward to Director) | Auction Officer | High | 1 |
| APPROVE-1.4 | Officer — ปฏิเสธใบสมัคร (Tier 1 Reject) | Auction Officer | High | 1 |
| APPROVE-1.5 | Officer — Bulk Action (Forward / Reject ทีละหลายรายการ) | Auction Officer | Medium | 2 |
| APPROVE-2.1 | Director — รายการพิจารณา (List + Tabs + Filter) | Market Director | High | 1 |
| APPROVE-2.2 | Director — รายละเอียดใบสมัคร + ผลตรวจ Tier 1 | Market Director | High | 1 |
| APPROVE-2.3 | Director — อนุมัติใบสมัคร (Tier 2 Approve) | Market Director | High | 1 |
| APPROVE-2.4 | Director — ปฏิเสธใบสมัคร (Tier 2 Reject) | Market Director | High | 1 |
| APPROVE-2.5 | Director — Bulk Action (Approve / Reject ทีละหลายรายการ) | Market Director | Medium | 2 |
| APPROVE-3.1 | ประวัติการยื่นใบสมัคร (Resubmission History) | Both | Medium | 2 |
| APPROVE-3.2 | SLA Indicator & Overdue Tag | Both | High | 1 |
| APPROVE-3.3 | Auto-refresh & Cross-tab Sync | Both | Medium | 1 |

---

## APPROVE-1.1 — Officer: รายการอนุมัติ (List + Tabs + Filter)

**Page:** `/auction-officer/approvals`
**Source:** `src/app/(dashboard)/auction-officer/approvals/page.tsx`
**Role:** `auction_officer`

### Detail

1. แสดงแถบ Search + Filter ด้านบนสุดเป็น Card:
   - **Search input** (Input + icon SearchOutlined) — ค้นหาชื่อหรือเลขประจำตัว (allowClear, width 280px)
   - **Select ประเภทย่อย** — 8 ตัวเลือก: ทุกประเภทย่อย / บุคคลธรรมดา / นิติบุคคล / เกษตรกร / สถาบันเกษตรกร / กลุ่มพัฒนาเกษตรกร / ผู้ประกอบกิจการยาง / องค์กร
2. แสดง Tabs 3 แท็บพร้อม Badge count:
   - **รอตรวจสอบ** (`pending`) — icon ClockCircleOutlined — รวมทุก in-flight stage (officer_review, awaiting_director, returned)
   - **อนุมัติสำเร็จ** (`approved`) — icon CheckCircleOutlined สีเขียว — เฉพาะ overallStatus = approved
   - **ปฏิเสธการอนุมัติ** (`rejected`) — icon CloseCircleOutlined สีแดง — เฉพาะ overallStatus = rejected
3. แต่ละ row ในตารางแสดง:
   - **ผู้สมัคร** — Avatar (สีฟ้าสำหรับ buyer, สีเขียวสำหรับ seller) + คำนำหน้า/ชื่อ/นามสกุล + เลขประจำตัว
   - **บทบาท** — Tag: ผู้ซื้อ (blue) / ผู้ขาย (green)
   - **ประเภทย่อย** — Tag แสดง label (เช่น "บุคคลธรรมดา", "เกษตรกร")
   - **วันที่สมัคร** — format `DD/MM/YYYY`
4. แท็บ "รอตรวจสอบ" — แสดงคอลัมน์เพิ่ม:
   - **SLA** — Tag สีแดง "เกิน SLA" หรือสีเขียว "ปกติ" (จาก `isOverSla(submittedAt)`)
   - **สถานะ** — Tag สถานะ + icon (รวมเป็น 3-state: รอตรวจสอบ / อนุมัติสำเร็จ / ปฏิเสธการอนุมัติ)
   - **ปุ่ม "ตรวจสอบ"** (สีเขียวแบรนด์ + icon EyeOutlined) → ไปหน้า detail
   - Checkbox column สำหรับ Bulk Selection (ดู APPROVE-1.5)
5. แท็บ "อนุมัติสำเร็จ" — แสดงคอลัมน์เพิ่ม:
   - **ผลการพิจารณา** — Tag success "อนุมัติสำเร็จ"
   - **เหตุผล / คอมเมนต์** — แสดง rejectReason / approveNote / forwardNote (truncate ที่ 80 ตัวอักษร)
   - **ดำเนินการเมื่อ** — `reviewedAt` format `DD/MM/YYYY HH:mm`
   - **ปุ่ม "ดู"** → ไปหน้า detail
6. แท็บ "ปฏิเสธการอนุมัติ" — มีคอลัมน์เพิ่ม:
   - **จำนวนครั้งที่ถูกปฏิเสธ** — Tag สีแดง "ถูกปฏิเสธ N ครั้ง" (ถ้า ≥2) หรือ Tag ปกติ "1 ครั้ง"
   - **เหตุผลครั้งล่าสุด** — truncate
   - **ปฏิเสธครั้งล่าสุดเมื่อ** — format `DD/MM/YYYY HH:mm`
   - Note bar — "แสดง 1 รายการต่อผู้สมัคร — หากเคยถูกปฏิเสธหลายครั้ง จะมีตัวเลขกำกับ..."
7. Footer microcopy — "อัปเดตอัตโนมัติทุก 30 วินาที"
8. รองรับ deep-link `?v={timestamp}` (cache-bust) จากหน้า detail หลัง mutation → re-read localStorage

### Condition

1. **Bucket logic** (`toSimpleStatus`) — collapse stage หลายแบบให้เหลือ 3 state:
   - `approved` → `approved`
   - `rejected` → `rejected`
   - อื่น (pending_review, awaiting_director, returned, officer_review, director_review) → `pending`
2. **Sort order**:
   - แท็บ pending — เรียงตาม overdue ก่อน (`isOverSla(a) - isOverSla(b)`)
   - แท็บ approved/rejected — เรียง `reviewedAt` desc
3. **Dedupe ในแท็บ rejected** — group ตาม `${type}|${nationalId}`; เก็บ row ที่ rejected ล่าสุด; นับจำนวนครั้งทั้งหมดเก็บใน `rejectionCountByUser` Map
4. **Filter logic** — AND ของ search (ชื่อหรือ nationalId) + subType
5. **Empty state**:
   - pending → "ไม่พบรายการที่รอตรวจสอบ"
   - approved → "ยังไม่มีรายการที่อนุมัติ"
   - rejected → "ยังไม่มีรายการที่ถูกปฏิเสธ"
6. **Auto-refresh triggers** (ดู APPROVE-3.3):
   - Polling ทุก 30 วินาที (`setInterval`)
   - Event `focus` (กลับเข้า tab)
   - Custom event `APPROVAL_UPDATED_EVENT` (broadcast จาก mutation)
   - `storage` event (cross-tab — เฉพาะ key `raot_application_overrides` หรือ null)

**Effect to / Relate to:**
- **APPROVE-1.2** (Detail navigation)
- **APPROVE-1.5** (Bulk action)
- **APPROVE-3.2** (SLA badge)
- **APPROVE-3.3** (Auto-refresh)
- **AUTH-2.7** (submitApplication producer)

---

## APPROVE-1.2 — Officer: รายละเอียดใบสมัคร (Detail + Tabs)

**Page:** `/auction-officer/approvals/[id]`
**Source:** `src/app/(dashboard)/auction-officer/approvals/[id]/page.tsx`

### Detail

1. แสดง Header strip:
   - ปุ่ม "← กลับไปรายการอนุมัติ" (text button สีเขียวแบรนด์)
   - Title — "ตรวจสอบใบสมัคร — {appId}" + icon FileTextOutlined
   - Tag บทบาท (Buyer/Seller) + Tag ประเภทย่อย + "สมัครเมื่อ {date}"
   - มุมขวา — Tag overall status (รอตรวจสอบ / รอ ผอ. อนุมัติ / อนุมัติแล้ว / ปฏิเสธ / ส่งกลับให้แก้ไข) + icon
2. แสดง **Resubmission banner** ถ้ามี prior attempts (ดู APPROVE-3.1):
   - type warning (ถ้าเคย reject) หรือ info (ถ้าเคยยื่นแต่ไม่ถูก reject)
   - "ผู้สมัครรายนี้เคยถูกปฏิเสธไป N ครั้ง (ยื่นทั้งหมด M ครั้ง)" + ครั้งล่าสุด + เหตุผล
3. แสดง **Tabs 4 แท็บ**:

   **(a) ข้อมูลส่วนตัว**:
   - Card "ข้อมูลส่วนตัว" — Descriptions: ชื่อ-นามสกุล / เลขประจำตัว / วันเกิด / โทรศัพท์ / Email
   - Card "ที่อยู่ตามบัตรประชาชน" — ที่อยู่ / ตำบล / อำเภอ / จังหวัด / รหัสไปรษณีย์
   - ถ้า Buyer + `markets` — Card "ตลาดที่ต้องการซื้อ" (Tag list สีฟ้า)
   - ถ้า Seller — Card "ข้อมูลการขาย" — ตลาดที่ลงทะเบียน / ชนิดยางที่ขาย (Tag สีเขียว)
   - ถ้า Seller + subType=`farmer` — เลขที่แปลง / GID + เนื้อที่ (ไร่)

   **(b) บัญชีธนาคาร**:
   - Card "บัญชีธนาคาร" — ธนาคาร / ประเภทบัญชี (ออมทรัพย์/กระแสรายวัน) / เลขบัญชี (mask `****{last4}`) / สาขา / ชื่อบัญชี

   **(c) เอกสาร**:
   - Card "เอกสารแนบ" + Tag count
   - แต่ละเอกสาร Card สีตาม status: pending สีเหลือง / approved สีเขียว / rejected สีแดง
   - แสดง label, filename, อัปโหลดเมื่อ, status tag + icon
   - ปุ่ม "ดูไฟล์" — เปิด `dataUrl` ใน tab ใหม่ (target=_blank) ถ้ามี; ไม่มี → message info "[Demo] เปิดไฟล์ {filename}"
   - ถ้าเอกสารมี `reviewerNote` (ถูก reject) — แสดง Alert error "หมายเหตุ" + เนื้อหา note
   - ถ้า `docs.length === 0` — Alert warning "ผู้สมัครยังไม่ได้อัปโหลดเอกสาร"

   **(d) ประวัติการอนุมัติ**:
   - Card timeline ของ prior attempts + current application (sort by submittedAt asc)
   - Tag count "N ครั้ง" + Tag "ถูกปฏิเสธ K ครั้ง" (ถ้ามี)
   - Table 4 columns: วันที่ยื่น (Tag "ปัจจุบัน" ที่แถวนี้) / สถานะการตอบรับ / ผู้ทำรายการ (+ เวลา) / สาเหตุการปฏิเสธ
   - ถ้าไม่มี prior attempts — Empty state "ผู้สมัครรายนี้ยื่นใบสมัครครั้งแรก..."

4. แสดง **Action bar** ด้านล่าง — Card พื้นขาว:
   - ถ้า `approvalStage === 'officer_review'` (ยังไม่ finalize) — ปุ่ม 2 ปุ่ม:
     - **"ส่งต่อ ผอ."** (primary, สีเขียวแบรนด์ + icon SendOutlined, size large) — disabled ถ้า `docs.length === 0`
     - **"ปฏิเสธ"** (danger + icon CloseCircleOutlined, size large)
   - ถ้า finalized แล้ว — Alert info "ใบสมัครนี้ถูกดำเนินการแล้ว — สถานะปัจจุบัน: {label} — เจ้าหน้าที่ไม่สามารถแก้ไขได้"

### Condition

1. **Loading state** — initial state `app = null`; useEffect โหลด → ถ้า null คงไว้ (ไม่แสดงอะไร); หลังโหลดถ้ายัง null = 404 (component คืน `null` ปัจจุบัน)
2. **Officer ดูได้ทุก stage** — ไม่จำกัดเฉพาะ pending; ดู rejected/approved อ่านอย่างเดียวได้
3. **Reload trigger** — listen event `APPROVAL_UPDATED_EVENT` ในหน้านี้ด้วย → re-fetch ทุกครั้งที่มี mutation
4. **Prior attempts query** — filter `getAllApplications()` ด้วย `nationalId + type` (ไม่รวม id ปัจจุบัน), sort by submittedAt asc
5. **ปุ่ม "ส่งต่อ ผอ." disabled** — เมื่อ `docs.length === 0` เพราะ ผอ. ต้องดูเอกสาร
6. **Action bar disable rule** — ทุก stage ที่ไม่ใช่ `officer_review` ถือว่า finalized (รวม director_review, approved, officer_rejected, director_rejected)
7. **Reviewer name fallback** — `getSession()?.user.fullName ?? 'เจ้าหน้าที่'` (default ใช้ตอน mock data ไม่มี user)
8. **Account number mask** — แสดงเฉพาะ 4 ตัวสุดท้าย ขึ้นต้น `****` (เพื่อ PDPA)

**Effect to / Relate to:**
- **APPROVE-1.1** (List → Detail navigation)
- **APPROVE-1.3** (Forward action)
- **APPROVE-1.4** (Reject action)
- **APPROVE-3.1** (Resubmission history)
- **APPROVE-2.2** (Tier 2 consume forwardNote)

---

## APPROVE-1.3 — Officer: ส่งต่อ ผอ. (Forward to Director)

**Action:** ปุ่ม "ส่งต่อ ผอ." บน detail page
**Service:** `setForwardNote(id, note, reviewerName)` ใน `approval-data.ts`

### Detail

1. ผู้ใช้กดปุ่ม **"ส่งต่อ ผอ."** ที่ Action bar → เปิด Modal "ยืนยันส่งต่อให้ ผอ. ตลาด"
2. Modal แสดง:
   - icon SendOutlined สีเขียว + Title "ยืนยันส่งต่อให้ ผอ. ตลาด"
   - Alert info — "ส่งต่อใบสมัคร {appId} — {title}{firstName} {lastName}" + description "เจ้าหน้าที่ตรวจสอบเอกสารเบื้องต้นเรียบร้อยแล้ว ส่งให้ ผอ. ตลาดพิจารณาอนุมัติขั้นสุดท้าย"
   - Label "หมายเหตุ (ไม่บังคับ)"
   - TextArea 3 rows — placeholder "เช่น: เอกสารครบถ้วน ข้อมูลถูกต้อง แนะนำให้อนุมัติ"
3. กดปุ่ม **"ยืนยันส่งต่อ"** (สีเขียวแบรนด์):
   - เรียก `setForwardNote(appId, note.trim(), officerName)` → เขียน override:
     - `status = 'awaiting_director'`
     - `stage = 'director_review'`
     - `reviewerName = officer`
     - `reviewedAt = new Date().toISOString()`
     - `forwardNote = note`
   - update local state (`setApp(...)`)
   - แสดง message success "ส่งต่อให้ ผอ. ตลาดพิจารณาแล้ว"
   - ปิด modal + reset form
   - navigate กลับ `/auction-officer/approvals?v={Date.now()}` (cache-bust)
   - `router.refresh()`

### Condition

1. **หมายเหตุไม่บังคับ** — TextArea ว่างได้; `note.trim()` ส่ง empty string ก็ผ่าน
2. **Status transition rule** — ใบสมัครต้องอยู่ `approvalStage === 'officer_review'` เท่านั้น (ปุ่ม disabled ใน finalized state)
3. **เอกสารต้องมี** — ปุ่มจะ disabled เมื่อ `docs.length === 0`
4. **localStorage write** — เขียน key `raot_application_overrides` + dispatch `APPROVAL_UPDATED_EVENT` ทำให้ list page refresh ทันที
5. **Mock token reviewer** — `officer = getSession()?.user.fullName ?? 'เจ้าหน้าที่'` (production ใช้ ID จริง)
6. **Cache-bust** — append `?v={timestamp}` ที่ list URL ทำให้ `useMemo` re-execute `getAllApplications()`

**Effect to / Relate to:**
- **APPROVE-1.2** (Action source)
- **APPROVE-2.1** (Director list pickup รายการนี้)
- **APPROVE-2.2** (Director ดู forwardNote ในแท็บ Tier 1)
- **AUTH-2.8** (Pending status page reflects awaiting_director)

---

## APPROVE-1.4 — Officer: ปฏิเสธใบสมัคร (Tier 1 Reject)

**Action:** ปุ่ม "ปฏิเสธ" บน detail page
**Service:** `setOverallStatus(id, 'rejected', reviewer, reason, 'officer_rejected')`

### Detail

1. ผู้ใช้กดปุ่ม **"ปฏิเสธ"** (danger) ที่ Action bar → เปิด Modal "ยืนยันการปฏิเสธ"
2. Modal แสดง:
   - icon CloseCircleOutlined สีแดง + Title
   - Alert error — "การปฏิเสธจะส่งผลให้ผู้สมัครต้องดำเนินการใหม่" + description "ใช้สำหรับกรณีเอกสารปลอม / ข้อมูลไม่ตรง / ผู้ที่ไม่มีสิทธิ์"
   - Label "เหตุผลการปฏิเสธ (บังคับ)"
   - TextArea 4 rows — placeholder "ระบุเหตุผลการปฏิเสธ..."
3. กดปุ่ม **"ยืนยันการปฏิเสธ"** (danger):
   - validate `rejectReason.trim()` ไม่ว่าง → ถ้าว่าง message error "กรุณาระบุเหตุผลการปฏิเสธ"
   - เรียก `setOverallStatus(appId, 'rejected', officer, reason, 'officer_rejected')` → เขียน override:
     - `status = 'rejected'`
     - `stage = 'officer_rejected'`
     - `reviewerName, reviewedAt, rejectReason`
   - update local state
   - แสดง message warning "ปฏิเสธใบสมัครแล้ว"
   - ปิด modal + reset form
   - navigate กลับ `/auction-officer/approvals?v={Date.now()}`

### Condition

1. **เหตุผลปฏิเสธ** — required + trim non-empty → "กรุณาระบุเหตุผลการปฏิเสธ"
2. **ผู้สมัครเห็นเหตุผลผ่าน Pending status page** (AUTH-2.8) — แสดงใต้ Alert error
3. **Resubmit eligibility** — ผู้สมัครยื่นใหม่ได้ผ่าน `/register/{role}?resubmit={appId}` (AUTH-2.9) — สร้าง Application ใหม่ ID ใหม่ ไม่อัปเดต record เดิม
4. **Stage `officer_rejected`** ต่างจาก `director_rejected` — ทำให้แท็บ "ผอ.ตลาด" ไม่เห็นรายการนี้ (filter ตาม stage)
5. ปฏิเสธแล้วยังคงอยู่ใน list ของ Officer (แท็บ rejected) — ดูประวัติได้ ไม่ใช่ลบ

**Effect to / Relate to:**
- **APPROVE-1.2** (Action source)
- **AUTH-2.8** (ผู้สมัครเห็น rejectReason)
- **AUTH-2.9** (Resubmit flow)
- **APPROVE-3.1** (Resubmission history)

---

## APPROVE-1.5 — Officer: Bulk Action (Forward / Reject ทีละหลายรายการ)

**Trigger:** เลือก ≥1 row ในแท็บ "รอตรวจสอบ" → action bar ปรากฏ

### Detail

1. ในแท็บ "รอตรวจสอบ" ผู้ใช้ติ๊ก checkbox ของแต่ละ row หรือ check-all ใน header
2. เมื่อ `selectedIds.length > 0` — แสดง action bar สีเขียว (`#f6ffed`, border `#b7eb8f`) เหนือตาราง:
   - Text "เลือกแล้ว {N} รายการ"
   - **ปุ่ม "ส่งต่อ ผอ. ที่เลือก"** (primary สีเขียวแบรนด์ + icon SendOutlined)
   - **ปุ่ม "ปฏิเสธที่เลือก"** (danger + icon CloseCircleOutlined)
   - **ปุ่ม "ล้างที่เลือก"** (clear selection)
3. กด **"ส่งต่อ ผอ. ที่เลือก"** → เปิด Modal "ส่งต่อ ผอ. — {N} รายการที่เลือก":
   - Description "บันทึก / ความเห็นที่จะส่งให้ ผอ. (ไม่บังคับ) — ทุกรายการที่เลือกจะได้รับข้อความเดียวกัน"
   - TextArea 4 rows — placeholder "เช่น เอกสารครบถ้วน ขอให้ ผอ. พิจารณาอนุมัติ"
   - ปุ่ม "ส่งต่อทั้งหมด" (สีเขียวแบรนด์) — loop เรียก `setForwardNote(id, note, officer)` ทุก id
4. กด **"ปฏิเสธที่เลือก"** → เปิด Modal "ปฏิเสธ — {N} รายการที่เลือก":
   - Description "เหตุผลการปฏิเสธ (บังคับ) — ทุกรายการที่เลือกจะได้รับเหตุผลเดียวกัน"
   - TextArea 4 rows — placeholder "เช่น เอกสารไม่ครบถ้วน / ใบสำคัญหมดอายุ / ภาพไม่ชัด"
   - ปุ่ม "ปฏิเสธทั้งหมด" (danger) — loop เรียก `setOverallStatus(id, 'rejected', officer, note, 'officer_rejected')`
5. หลังสำเร็จ — message success:
   - Forward → "ส่งต่อ ผอ. แล้ว N รายการ"
   - Reject → "ปฏิเสธแล้ว N รายการ"
   - clear selection + close modal + force tick++ (re-render)

### Condition

1. **Bulk action เฉพาะแท็บ pending** — แท็บอื่น (approved/rejected) selection จะถูก ignore (`setSelectedIds = () => {}`)
2. **Selection persist** — `preserveSelectedRowKeys: true` ทำให้กลับมาแท็บ pending ยังเลือกค้างไว้
3. **Stale selection cleanup** — `pendingIdSet` filter ทิ้ง id ที่ไม่ได้อยู่ใน pending list (เช่นถูก approve ใน tab อื่นไปแล้ว)
4. **Note rules**:
   - Forward — ไม่บังคับ (empty trim ก็ส่งได้)
   - Reject — บังคับ (`!note → message error 'กรุณาระบุเหตุผลการปฏิเสธ'`)
5. **Loading state** — `bulkSubmitting=true` ระหว่าง loop; ปุ่ม OK loading + disabled
6. **Empty selection guard** — กดปุ่มเมื่อ `selectedIds.length === 0` → message warning "กรุณาเลือกอย่างน้อย 1 รายการ" (ป้องกัน race)
7. **ข้อความเดียวกันทุกราย** — ทุก row ใน selection จะได้ note/reason ตัวเดียวกัน (ไม่ใช่ per-row note)

**Effect to / Relate to:**
- **APPROVE-1.1** (Triggered จาก list)
- **APPROVE-1.3** (Single-forward equivalent)
- **APPROVE-1.4** (Single-reject equivalent)

---

## APPROVE-2.1 — Director: รายการพิจารณา (List + Tabs + Filter)

**Page:** `/market-director/approval`
**Source:** `src/app/(dashboard)/market-director/approval/page.tsx`
**Role:** `market_director`

### Detail

1. แสดงแถบ Search + Filter:
   - **Search input** — ค้นหาชื่อหรือเลขประจำตัว (width 280)
   - **Select บทบาท** — 3 ตัวเลือก: ทุกบทบาท / ผู้ซื้อ / ผู้ขาย (เพิ่มจากของ Officer)
   - **Select ประเภทย่อย** — 8 ตัวเลือก (เหมือน Officer)
2. แสดง Tabs 3 แท็บพร้อม Badge count:
   - **รอตรวจสอบ** (`pending`) — เฉพาะ `approvalStage === 'director_review'`
   - **อนุมัติแล้ว** (`approved`) — เฉพาะ `approvalStage === 'approved'`
   - **ปฏิเสธ** (`rejected`) — เฉพาะ `approvalStage === 'director_rejected'`
3. ตาราง pending — 8 columns:
   - ผู้สมัคร / บทบาท / ประเภทย่อย / วันที่สมัคร
   - **ส่งต่อโดย** — `reviewerName` ของ Officer ที่ forward มา
   - **SLA** — Tag "เกิน SLA" / "ปกติ"
   - **สถานะ** — Tag "รอ ผอ. อนุมัติ" (processing color + icon HourglassOutlined)
   - **ปุ่ม "ดูและพิจารณา"** (สีม่วง `#722ed1` + icon EyeOutlined) → ไปหน้า detail
4. ตาราง approved — 6 columns:
   - ผู้สมัคร / บทบาท / ประเภทย่อย
   - **คอมเมนต์การอนุมัติ** — แสดง `approveNote` (truncate 80)
   - **อนุมัติเมื่อ** — `reviewedAt` format `DD/MM/YYYY HH:mm`
   - ปุ่ม "ดู"
5. ตาราง rejected — 7 columns:
   - ผู้สมัคร / บทบาท / ประเภทย่อย
   - **จำนวนครั้งที่ถูกปฏิเสธ** — Tag "ถูกปฏิเสธ N ครั้ง" (สีแดง ถ้า ≥2) หรือ "1 ครั้ง"
   - **เหตุผลครั้งล่าสุด** — truncate 80
   - **ปฏิเสธครั้งล่าสุดเมื่อ**
   - ปุ่ม "ดู"
   - Note bar — "แสดง 1 รายการต่อผู้สมัคร..."
6. Footer microcopy — "แท็บ 'รอตรวจสอบ' แสดงรายการที่ผ่าน Tier 1 และรอ ผอ. พิจารณา · อัปเดตอัตโนมัติทุก 30 วินาที"
7. Bulk action bar — เลือกแล้วแสดงสีม่วง (`#f9f0ff`, border `#d3adf7`) (ดู APPROVE-2.5)

### Condition

1. **Director-relevant filter** (`toSimpleStatus`):
   - `approvalStage === 'director_review'` → `pending`
   - `approvalStage === 'approved'` → `approved`
   - `approvalStage === 'director_rejected'` → `rejected`
   - อื่น (officer_review, officer_rejected) → `null` (ไม่แสดง — ผอ. ไม่ต้องเห็น)
2. **Director ไม่เห็น** ใบสมัครที่ยัง `officer_review` หรือ `officer_rejected` — กรองทิ้งก่อน bucket
3. **Filter logic** — AND ของ search + subType + role (เพิ่ม role filter จาก Officer)
4. **Sort** — pending: SLA overdue first; approved/rejected: `reviewedAt` desc
5. **Dedupe rejected** — เหมือน APPROVE-1.1: `${type}|${nationalId}` keep latest
6. **Cache-bust** — `?v={timestamp}` จาก detail page → re-read localStorage
7. **Auto-refresh triggers** เหมือน Officer (ดู APPROVE-3.3)
8. **Empty states**:
   - pending → "ไม่พบรายการที่รอการพิจารณา"
   - approved → "ยังไม่มีรายการที่อนุมัติ"
   - rejected → "ยังไม่มีรายการที่ถูกปฏิเสธ"

**Effect to / Relate to:**
- **APPROVE-1.3** (Forward producer — รายการมาจากที่นี่)
- **APPROVE-2.2** (Detail navigation)
- **APPROVE-2.5** (Bulk action)

---

## APPROVE-2.2 — Director: รายละเอียดใบสมัคร + ผลตรวจ Tier 1

**Page:** `/market-director/approval/[id]`
**Source:** `src/app/(dashboard)/market-director/approval/[id]/page.tsx`

### Detail

1. แสดง Header strip:
   - ปุ่ม "← กลับไปรายการอนุมัติ" สีม่วง
   - Title "พิจารณาใบสมัคร — {appId}" + icon FileTextOutlined (สีม่วงเข้ม `#3b0764`)
   - Tag บทบาท + ประเภทย่อย + วันที่สมัคร
   - มุมขวา — Tag overall status
2. แสดง Resubmission banner (ถ้ามี prior attempts — เหมือน APPROVE-3.1)
3. แสดง **Tabs 5 แท็บ**:

   **(a) ข้อมูลส่วนตัว** — เหมือน APPROVE-1.2 (แต่ใช้สีม่วง `#722ed1` แทน `#1a7c3e`)

   **(b) บัญชีธนาคาร** — เหมือน APPROVE-1.2 (mask `****{last4}`)

   **(c) เอกสาร** — เหมือน APPROVE-1.2 แต่:
   - ไม่แสดง `reviewerNote` ในแต่ละ doc (ผอ. ไม่ review per-doc — Officer review แล้ว)
   - ถ้าไม่มี docs — Alert warning "ไม่มีเอกสารแนบ"

   **(d) ผลตรวจ Tier 1** (แท็บใหม่ — ไม่มีใน Officer):
   - Badge status success — "ผ่านการตรวจสอบ Tier 1 แล้ว" (สีเขียว `#389e0d`)
   - Card "รายละเอียดการตรวจสอบขั้นที่ 1" + icon AuditOutlined:
     - **เจ้าหน้าที่ผู้ตรวจ** — `reviewerName` (จาก Officer)
     - **วันที่ส่งต่อ** — `reviewedAt` format `DD/MM/YYYY HH:mm`
     - **หมายเหตุจากเจ้าหน้าที่** — `forwardNote` หรือ "ไม่มีหมายเหตุ"

   **(e) ประวัติการอนุมัติ** — เหมือน APPROVE-1.2

4. แสดง **Action bar**:
   - ถ้า `approvalStage === 'director_review'` — ปุ่ม 2 ปุ่ม:
     - **"อนุมัติ"** (primary สีเขียว `#1a7c3e` + icon CheckCircleOutlined, size large)
     - **"ปฏิเสธ"** (danger, size large)
   - ถ้า finalized แล้ว — Alert info "ใบสมัครนี้ถูกดำเนินการแล้ว — สถานะปัจจุบัน: {label} — ไม่สามารถแก้ไขได้"

### Condition

1. **Not found state** — ถ้า `loaded === true && app === null` → แสดง Result 404 "ไม่พบใบสมัคร" + ปุ่ม "กลับไปรายการอนุมัติ" (สีม่วง)
2. **Action bar enabled** เฉพาะ `approvalStage === 'director_review'` — stage อื่น (approved, director_rejected, officer_review, officer_rejected) ถือ finalized
3. **Tier 1 tab ใหม่** — เฉพาะ Director (Officer ไม่มี เพราะเป็นผู้ทำ Tier 1 เอง)
4. **Director ดูใบสมัครที่ยัง officer_review ได้** (ถ้าเข้าผ่าน URL ตรง) — แต่ action bar disabled (stage ไม่ใช่ director_review)
5. **Reviewer name fallback** — `director = getSession()?.user.fullName ?? 'ผู้อำนวยการตลาด'`
6. **Theme color** — ใช้สีม่วง `#722ed1` แทนสีเขียวของ Officer (UI distinction ระหว่างสองบทบาท)

**Effect to / Relate to:**
- **APPROVE-1.3** (forwardNote producer)
- **APPROVE-2.1** (List → Detail)
- **APPROVE-2.3** (Approve action)
- **APPROVE-2.4** (Reject action)
- **APPROVE-3.1** (Resubmission history)

---

## APPROVE-2.3 — Director: อนุมัติใบสมัคร (Tier 2 Approve)

**Action:** ปุ่ม "อนุมัติ" บน detail page
**Service:** `setOverallStatus(id, 'approved', director, undefined, 'approved', approveNote)`

### Detail

1. ผู้ใช้กดปุ่ม **"อนุมัติ"** (สีเขียวแบรนด์) → เปิด Modal "ยืนยันอนุมัติ — {ชื่อ}"
2. Modal แสดง:
   - icon CheckCircleOutlined สีเขียว
   - Alert success — "การอนุมัตินี้จะเปิดใช้งานบัญชีของผู้สมัคร" + description "ผู้สมัครจะได้รับการแจ้งเตือนและสามารถเข้าใช้งานระบบได้ทันที"
   - Label "หมายเหตุ (ไม่บังคับ)"
   - TextArea 3 rows — placeholder "หมายเหตุประกอบการอนุมัติ..."
3. กดปุ่ม **"ยืนยันอนุมัติ"** (สีเขียว `#1a7c3e`):
   - เรียก `setOverallStatus(appId, 'approved', director, undefined, 'approved', approveNote.trim() || undefined)` → เขียน override:
     - `status = 'approved'`
     - `stage = 'approved'`
     - `reviewerName, reviewedAt`
     - `approveNote` (เฉพาะมี content)
   - update local state
   - message success "อนุมัติแล้ว"
   - ปิด modal + reset form
   - navigate `/market-director/approval?v={Date.now()}` + `router.refresh()`

### Condition

1. **หมายเหตุไม่บังคับ** — empty ก็อนุมัติได้; ถ้าใส่จะ trim และเก็บ
2. **Status transition** — ต้องอยู่ `approvalStage === 'director_review'` (ปุ่ม disabled ใน finalized state)
3. **เปิดใช้งานบัญชีอัตโนมัติ** — เมื่อ status = approved + stage = approved:
   - `raot_application_overrides[appId]` → status approved
   - `loginWithCredentials` branch 3 ตรวจ `readAppOverrideStatus` → return `approved` → สร้าง User active (AUTH-1.3)
4. **ผู้สมัคร login ได้ทันที** — username/password จาก `raot_pending_credentials` (POC)
5. **approveNote** แสดงในหน้า pending status (AUTH-2.8) — "คอมเมนต์จาก ผอ.ตลาด"
6. **No email/SMS notification** — POC limitation; production จะส่งแจ้งเตือน

**Effect to / Relate to:**
- **APPROVE-2.2** (Action source)
- **AUTH-2.8** (Pending → approved transition)
- **AUTH-1.1, AUTH-1.2** (ผู้สมัคร login ได้)
- **AUTH-1.3** (Session creation for approved user)

---

## APPROVE-2.4 — Director: ปฏิเสธใบสมัคร (Tier 2 Reject)

**Action:** ปุ่ม "ปฏิเสธ" บน detail page
**Service:** `setOverallStatus(id, 'rejected', director, reason, 'director_rejected')`

### Detail

1. ผู้ใช้กดปุ่ม **"ปฏิเสธ"** (danger) → เปิด Modal "ยืนยันการปฏิเสธ"
2. Modal แสดง:
   - icon CloseCircleOutlined สีแดง
   - Alert error — "การปฏิเสธจาก ผอ. ตลาด — ใบสมัครจะถูกปิดทันที" + description "ผู้สมัครจะได้รับการแจ้งเหตุผลการปฏิเสธและต้องยื่นใบสมัครใหม่"
   - Label "เหตุผลการปฏิเสธ (บังคับ)"
   - TextArea 4 rows — placeholder "ระบุเหตุผลการปฏิเสธ..."
3. กดปุ่ม **"ยืนยันการปฏิเสธ"** (danger):
   - validate `rejectReason.trim()` ไม่ว่าง → ถ้าว่าง message error
   - เรียก `setOverallStatus(appId, 'rejected', director, reason, 'director_rejected')` → เขียน override:
     - `status = 'rejected'`
     - `stage = 'director_rejected'` (ต่างจาก officer_rejected)
     - `reviewerName, reviewedAt, rejectReason`
   - update local state
   - message warning "ปฏิเสธใบสมัครแล้ว"
   - ปิด modal + reset form
   - navigate กลับ list + cache-bust

### Condition

1. **เหตุผลปฏิเสธ** — required + trim non-empty → "กรุณาระบุเหตุผลการปฏิเสธ"
2. **Stage `director_rejected`** — ผู้สมัครเห็น "คำขอลงทะเบียนถูก ผอ.ตลาด ปฏิเสธ" ที่ AUTH-2.8 (text ต่างจาก officer_rejected)
3. **แสดง forwardNote ด้วย** — ที่ pending page แสดง "บันทึกจากเจ้าหน้าที่ตลาด (ก่อนส่งต่อ ผอ.)" + forwardNote (ให้ผู้สมัครเข้าใจ context การส่งต่อ)
4. **Resubmit eligibility** — ผู้สมัครยื่นใหม่ได้ผ่าน `/register/{role}?resubmit={appId}` (AUTH-2.9)
5. **History tracking** — Application เก่าคงอยู่ — ใบใหม่จะ reference ผ่าน `nationalId + type` match
6. **ใบใหม่ต้องผ่าน Tier 1 ใหม่** — ไม่ skip; ผ่าน Officer review ก่อนจึงถึง Director อีกครั้ง

**Effect to / Relate to:**
- **APPROVE-2.2** (Action source)
- **AUTH-2.8** (Display rejection)
- **AUTH-2.9** (Resubmit flow)
- **APPROVE-3.1** (Resubmission history tracking)

---

## APPROVE-2.5 — Director: Bulk Action (Approve / Reject)

**Trigger:** เลือก ≥1 row ในแท็บ "รอตรวจสอบ"

### Detail

1. เลือก checkbox ของ row ในแท็บ pending → action bar สีม่วง (`#f9f0ff`, border `#d3adf7`)
2. แสดงปุ่ม:
   - **"อนุมัติที่เลือก"** (primary สีม่วง `#722ed1` + icon CheckCircleOutlined)
   - **"ปฏิเสธที่เลือก"** (danger + icon CloseCircleOutlined)
   - **"ล้างที่เลือก"**
3. กด **"อนุมัติที่เลือก"** → Modal "อนุมัติ — {N} รายการที่เลือก":
   - Description "คอมเมนต์การอนุมัติ (ไม่บังคับ) — ทุกรายการที่เลือกจะได้รับข้อความเดียวกัน"
   - TextArea placeholder "เช่น เอกสารครบถ้วน อนุมัติให้เริ่มใช้งานระบบ"
   - ปุ่ม "อนุมัติทั้งหมด" (สีม่วง) — loop `setOverallStatus(id, 'approved', director, undefined, 'approved', note || undefined)`
4. กด **"ปฏิเสธที่เลือก"** → Modal "ปฏิเสธ — {N} รายการที่เลือก":
   - Description "เหตุผลการปฏิเสธ (บังคับ)"
   - placeholder "เช่น คุณสมบัติไม่เป็นไปตามเกณฑ์ / ขัดต่อนโยบาย กยท."
   - ปุ่ม "ปฏิเสธทั้งหมด" (danger) — loop `setOverallStatus(id, 'rejected', director, note, 'director_rejected')`
5. หลังสำเร็จ — message success "อนุมัติแล้ว N รายการ" / "ปฏิเสธแล้ว N รายการ"

### Condition

1. **Bulk action เฉพาะแท็บ pending** ของ director_review
2. **Selection persist** — `preserveSelectedRowKeys: true`
3. **Note rules**:
   - Approve — ไม่บังคับ; ถ้า empty ส่ง undefined ไม่เก็บ approveNote
   - Reject — บังคับ
4. **Empty selection guard** — กดเมื่อ 0 → "กรุณาเลือกอย่างน้อย 1 รายการ"
5. **ข้อความเดียวกันทุกราย** — ทุก row ใน selection ได้ note/reason ตัวเดียวกัน
6. **Loading state** — `bulkSubmitting=true`; ปุ่ม OK loading

**Effect to / Relate to:**
- **APPROVE-2.1** (Triggered จาก list)
- **APPROVE-2.3, APPROVE-2.4** (Single-action equivalents)

---

## APPROVE-3.1 — ประวัติการยื่นใบสมัคร (Resubmission History)

**Shared by:** Officer detail (APPROVE-1.2) + Director detail (APPROVE-2.2)

### Detail

1. หน้า detail โหลด `getAllApplications()` แล้ว filter ด้วย `nationalId + type` (ไม่รวม id ปัจจุบัน) → `priorAttempts[]`
2. sort `priorAttempts` ตาม `submittedAt` asc
3. แสดง **Resubmission banner** ด้านบนทุก tab ถ้ามี prior attempts:
   - type warning (ถ้า prior มี rejected) หรือ info (ถ้าไม่มี rejected)
   - Title:
     - มี rejected — "ผู้สมัครรายนี้เคยถูกปฏิเสธไป N ครั้ง (ยื่นทั้งหมด M ครั้ง)"
     - ไม่มี — "ผู้สมัครรายนี้เคยยื่นมาก่อน M ครั้ง"
   - Description:
     - "ครั้งล่าสุดก่อนหน้านี้ถูก {status} เมื่อ {date}"
     - + reason (ถ้ามี rejectReason)
     - + "ดูประวัติทั้งหมดที่แท็บ 'ประวัติการอนุมัติ'"
4. แท็บ "ประวัติการอนุมัติ" แสดง:
   - Title + count badges — "N ครั้ง" / "ถูกปฏิเสธ K ครั้ง"
   - ถ้า 1 ครั้งและไม่มี prior — Empty state "ผู้สมัครรายนี้ยื่นใบสมัครครั้งแรก..."
   - ถ้ามี prior — Alert info + Table:
     - **วันที่ยื่น** — `DD/MM/YYYY` + Tag "ปัจจุบัน" (สีฟ้า) ที่แถวปัจจุบัน
     - **สถานะการตอบรับ** — Tag overall status + icon
     - **ผู้ทำรายการ** — reviewerName + เวลา (small text)
     - **สาเหตุการปฏิเสธ** — rejectReason (text-danger) หรือ "—"
5. แถวปัจจุบัน — มี `rowClassName="history-row-current"` (highlight)

### Condition

1. **Match key** — `${type}|${nationalId}` (Buyer R001 และ Seller S001 ที่มี nationalId เดียวกันถือว่าคนละบุคคล)
2. **Sort asc by submittedAt** — เก่าไปใหม่; row ปัจจุบันอาจอยู่กลางถ้ามี attempt หลังจากนี้ (กรณีพิเศษ)
3. **Reload trigger** — listen `APPROVAL_UPDATED_EVENT` → re-query getAllApplications + recompute prior
4. **Director กับ Officer ใช้ logic เดียวกัน** — query function เดียวกัน + columns เดียวกัน
5. **ใบเก่า rejected ใช้อ้างอิงเท่านั้น** — ไม่อนุญาตให้แก้/approve ใบเก่าผ่านหน้านี้

**Effect to / Relate to:**
- **APPROVE-1.2** (Officer detail)
- **APPROVE-2.2** (Director detail)
- **AUTH-2.9** (Resubmit creates new Application linked by nationalId)

---

## APPROVE-3.2 — SLA Indicator & Overdue Tag

**Helper:** `isOverSla(submittedAt)` ใน `approval-data.ts`

### Detail

1. ทุกแถวในแท็บ "รอตรวจสอบ" (Officer + Director) แสดง **SLA column**:
   - Tag สีแดง **"เกิน SLA"** — ถ้า `isOverSla(submittedAt) === true`
   - Tag สีเขียว **"ปกติ"** — ถ้ายังอยู่ใน SLA
2. รายการ pending เรียงโดยให้ overdue อยู่บนสุด (`sortByOverdue`):
   - `aOver = isOverSla(a) ? 0 : 1`
   - `bOver = isOverSla(b) ? 0 : 1`
   - sort `aOver - bOver` → overdue ก่อน
3. ใช้ทั้งใน Officer page (`/auction-officer/approvals`) และ Director page (`/market-director/approval`)

### Condition

1. **SLA threshold** — 3 **วันทำการ** (Mon-Fri) จาก `submittedAt` ถึงปัจจุบัน
2. **Algorithm** (`isOverSla`):
   ```
   นับ businessDays จาก submitted → now
   ข้ามวันเสาร์ (day=6) และอาทิตย์ (day=0)
   return businessDays > 3
   ```
3. **ไม่นับวันหยุดราชการ** — POC; production ควรรวมปฏิทินวันหยุดราชการไทย
4. **เริ่มนับจากวันถัดไปของ submittedAt** — cursor.setDate(+1) ก่อนเช็ค
5. **SLA badge แสดงเฉพาะแท็บ pending** — approved/rejected ไม่แสดง (เพราะ finalized แล้ว)
6. **ไม่มี blocking action** — เกิน SLA แค่แสดงสัญญาณ ไม่ block การกระทำ
7. **แสดงในแท็บ pending ของทั้ง 2 ฝั่ง** — แต่ submittedAt เดียวกัน ทำให้ Director เห็น "เกิน SLA" ตั้งแต่รายการเข้า queue ตน

**Effect to / Relate to:**
- **APPROVE-1.1** (Officer list SLA column)
- **APPROVE-2.1** (Director list SLA column)
- Dashboard widgets (ไม่อยู่ใน scope นี้)

---

## APPROVE-3.3 — Auto-refresh & Cross-tab Sync

**Service:** `APPROVAL_UPDATED_EVENT` constant + `setOverallStatus`/`setForwardNote`/`setDocOverride` dispatch

### Detail

1. ทุกครั้งที่ mutation เกิด (`writeMap()` ใน approval-data.ts):
   - เขียน `localStorage['raot_application_overrides']`
   - `window.dispatchEvent(new Event(APPROVAL_UPDATED_EVENT))` (`'raot:approval-updated'`)
2. หน้า list (Officer + Director) ติด listener 4 ประเภท:
   - **Polling** — `setInterval(bump, 30000)` ทุก 30 วินาที
   - **`focus` event** — กลับเข้า tab → re-read
   - **`APPROVAL_UPDATED_EVENT`** (custom) — mutation จากที่ใดก็ตามในหน้านี้
   - **`storage` event** (native, cross-tab) — เมื่อ tab อื่นเขียน `raot_application_overrides` หรือ key=null
3. เมื่อ event ถูก fire → `setTick(t => t + 1)` → `useMemo` recompute `getAllApplications()`
4. หน้า detail (Officer + Director) ติด listener `APPROVAL_UPDATED_EVENT` → reload `app` และ `priorAttempts`
5. หลัง mutation จาก detail page — navigate กลับ list ด้วย `?v={Date.now()}` cache-bust:
   - `searchParams.get('v')` ใน list ถูกใช้เป็น useMemo dep → force re-read แม้ Next.js router cache จะ reuse page

### Condition

1. **Polling interval** — 30 วินาที (fallback กรณี event miss)
2. **Custom event ใช้ tab เดียวกัน** — `dispatchEvent` ใน window ทำงานในหน้าปัจจุบันเท่านั้น
3. **Storage event ใช้ cross-tab เท่านั้น** — `storage` event ไม่ fire ในหน้าที่เขียนเอง (browser spec)
4. **Cleanup** — return จาก `useEffect` ลบ listeners ทั้ง 4
5. **Cache-bust pattern** — `router.push('?v=' + Date.now())` แทน `router.refresh()` เพราะ refresh อย่างเดียวอาจไม่ trigger client-side memo invalidation
6. **POC limitation** — ไม่มี backend WebSocket; production จะใช้ SSE/WebSocket แทน polling
7. **Event name constant** — `APPROVAL_UPDATED_EVENT = 'raot:approval-updated'` (exported สำหรับ consumer)

**Effect to / Relate to:**
- ทุก page ใน Approval system (Officer + Director, list + detail)
- **APPROVE-1.3, 1.4, 1.5, 2.3, 2.4, 2.5** (mutation producers)

---

## Cross-cutting Notes

### Service Layer — `approval-data.ts`

| Function | Purpose | Caller |
|---|---|---|
| `getAllApplications()` | รวม `MOCK_APPLICATIONS` + submitted apps + overrides | List/detail pages |
| `submitApplication(data)` | สร้าง Application ใหม่ + save pending creds | Register wizard (AUTH-2.7) |
| `applyOverrides(app)` | merge override map ลงบน Application | `getAllApplications` |
| `setOverallStatus(id, status, reviewer, reason?, stage?, note?)` | เปลี่ยน status + stage | Approve/Reject actions |
| `setForwardNote(id, note, reviewer)` | Forward to director (stage=director_review) | APPROVE-1.3 |
| `setDocOverride(appId, docId, status, note?)` | per-doc review | (per-doc review — UI ไม่ใช้แล้วใน detail) |
| `getOverride(id)` | อ่าน override entry | Internal |
| `isOverSla(submittedAt)` | เช็ค 3 business days | SLA column |
| `getPendingCred(username)` | อ่าน creds จาก register | Login (AUTH-1.3) |
| `APPROVAL_UPDATED_EVENT` | event name constant | Listeners |

### Storage Keys

| Key | Content | Producer | Consumer |
|---|---|---|---|
| `raot_application_overrides` | override map (status/stage/notes/per-doc) | `setOverallStatus`, `setForwardNote`, `setDocOverride` | `applyOverrides` |
| `raot_submitted_applications` | Application array จาก register | `submitApplication` | `getSubmittedApplications` → `getAllApplications` |
| `raot_pending_credentials` | username/password ของ pending users | `submitApplication` | `getPendingCred`, `loginWithCredentials` |

### Quota Fallback (`saveSubmittedAppsWithQuotaFallback`)

เนื่องจาก Base64 dataUrl ของเอกสารหลายไฟล์อาจเกิน 5MB quota:
1. **Happy path** — เขียน full payload ลง `raot_submitted_applications`
2. **Fallback 1** — ถ้า quota เต็ม → drop `dataUrl` ของ apps อื่น (เก็บเฉพาะ app ใหม่)
3. **Fallback 2** — ถ้ายังเต็ม → drop `dataUrl` ของ app ใหม่ด้วย (metadata ยังครบ ดูเอกสารไม่ได้)

### Status Configuration

```ts
OVERALL_STATUS_CFG = {
  pending_review:    { color: 'warning',    label: 'รอตรวจสอบ',       icon: <ClockCircleOutlined /> },
  awaiting_director: { color: 'processing', label: 'รอ ผอ. อนุมัติ',   icon: <HourglassOutlined />   },
  approved:          { color: 'success',    label: 'อนุมัติแล้ว',       icon: <CheckCircleOutlined /> },
  rejected:          { color: 'error',      label: 'ปฏิเสธ',           icon: <CloseCircleOutlined /> },
  returned:          { color: 'default',    label: 'ส่งกลับให้แก้ไข',   icon: <FileOutlined />        },
}

DOC_STATUS_CFG = {
  pending:  { color: 'warning', label: 'รอตรวจ' },
  approved: { color: 'success', label: 'ผ่าน'   },
  rejected: { color: 'error',   label: 'ไม่ผ่าน' },
}
```

### UI Theme — Officer vs Director

| Element | Officer (`auction_officer`) | Director (`market_director`) |
|---|---|---|
| Primary action color | สีเขียวแบรนด์ `#1a7c3e` | สีม่วง `#722ed1` |
| Action title color | `#0f3d22` | `#3b0764` |
| Bulk action bar bg | `#f6ffed` / border `#b7eb8f` | `#f9f0ff` / border `#d3adf7` |
| Personal info icon | สีเขียว | สีม่วง |
| Detail page back link | สีเขียวแบรนด์ | สีม่วง |

### Officer vs Director — Tab Comparison

| Tab | Officer | Director |
|---|---|---|
| ข้อมูลส่วนตัว | ✅ | ✅ |
| บัญชีธนาคาร | ✅ | ✅ |
| เอกสาร | ✅ + per-doc reviewer note | ✅ (อ่านอย่างเดียว) |
| **ผลตรวจ Tier 1** | ❌ | ✅ (แท็บใหม่) |
| ประวัติการอนุมัติ | ✅ | ✅ |

### Reference — Mock Applications (Seed Data)

`MOCK_APPLICATIONS[]` ใน `approval-data.ts` มีข้อมูล seed สำหรับ POC:
- R001-R005 — Buyers (individual + company, ทั้ง pending/rejected/awaiting_director)
- RS001-RS005 — Sellers (farmer + cooperative, ทั้ง pending/rejected/awaiting_director)

ใช้ดู flow ในระบบทันทีโดยไม่ต้องสมัครจริง

### Legacy/Alternative Page — `/market-director/approve-members`

มีหน้า **ทางเลือก/เก่า** ที่ใช้ mock data แบบง่ายกว่า (hard-coded ใน file):
- ไม่เชื่อมกับ `approval-data.ts`
- ไม่ใช้ Two-tier flow แบบเต็มของ APPROVE-2.x
- เก็บเป็น UI placeholder/demo เก่า
- หน้าจริงที่ใช้งานคือ `/market-director/approval` (APPROVE-2.x)

แนะนำ **ลบหรือ deprecate** ไฟล์นี้ออกเพื่อกัน confusion (ดู Out-of-scope ด้านล่าง)

---

## Out-of-scope / POC Limitations

1. **No real notification** — เมื่อ approve/reject ระบบไม่ส่ง email/SMS จริง (production: integrate provider)
2. **No backend audit log** — ทุก mutation เก็บใน localStorage; production ต้องมี audit trail server-side พร้อม IP/User-Agent
3. **Per-doc review UI** — `setDocOverride` รองรับแล้วใน service แต่หน้า detail ใน POC ปัจจุบันไม่มี UI ให้ Officer mark per-doc status (Future enhancement)
4. **Returned status** — `'returned'` อยู่ใน enum แต่ flow ส่งกลับให้แก้ไขยังไม่ implement (ใช้ Reject + Resubmit แทน)
5. **ปฏิทินวันหยุดราชการ** — SLA นับเฉพาะ Mon-Fri; ไม่รวมวันหยุดราชการไทย
6. **Director ไม่เห็น officer_rejected** — Direct บางครั้งอาจต้องการ override การปฏิเสธของ Officer; ปัจจุบันไม่รองรับ (production อาจมี escalation path)
7. **Bulk action ใช้ note เดียวกัน** — ไม่ support per-row note ใน bulk modal
8. **`/market-director/approve-members` (legacy)** — ควรลบหรือ merge เข้ากับ `/market-director/approval`
9. **Quota workaround** — เมื่อ localStorage เต็ม dataUrl ถูก strip → preview ไม่ทำงาน (Production: S3 + signed URL)
10. **No reviewer accountability tracking** — `reviewerName` เก็บแค่ string จาก session; ไม่ link กับ user ID จริง

---

*Generated by `/description-writer` skill — Detail + Condition format*
*Source code last reviewed: 2026-05-15*
