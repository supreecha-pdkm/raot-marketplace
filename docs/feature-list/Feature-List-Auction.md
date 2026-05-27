# Feature List — ระบบประมูลยางพารา (Auction)

> **Version:** `v1.0.0`
> **Project:** RAOT Green Rubber — ระบบตรวจสอบย้อนกลับผลผลิตยางพารา
> **Jira Epic:** (TBD — Auction Epic)
> **Source code:**
> - Buyer: `src/app/(dashboard)/buyer/auction/page.tsx`, `src/features/auctions/*`
> - Officer Control: `src/app/(dashboard)/officer/auction-control/*`
> - Officer Rounds: `src/app/(dashboard)/officer/auction-rounds/page.tsx`
> - Officer Network: `src/app/(dashboard)/officer/network-auctions/page.tsx`
> - Opening Price: `src/app/(dashboard)/officer/opening-price/page.tsx`
> - Officer Approve-Price: `src/app/(dashboard)/officer/approve-price/page.tsx`
> **Format:** Detail + Condition (BA spec)
> **Last updated:** 2026-05-25

---

## Epic Overview

ระบบประมูลยางของ RAOT รองรับ **2 รูปแบบ**:

| ประเภท | ความหมาย | Actor |
|---|---|---|
| **ประมูล ณ ที่ตั้ง** (`location`) | ประมูลในตลาดกลางตามปกติ | Buyer, Officer |
| **ประมูล ณ เครือข่าย** (`network`) | สถาบัน/เครือข่ายของ กยท. ขอยื่นยางผ่านช่องพิเศษ | Officer อนุมัติ, Buyer ประมูลเหมือนกัน |

**ราคาเปิดตลาด** — Admin เสนอ → ผอ.ตลาดอนุมัติ ก่อนรอบประมูลเริ่ม (Two-step approval)

**รอบประมูล (Auction Round)** — Admin กำหนดตาราง 4 รอบ/วัน (09:00–11:00, 11:00–13:00, 13:00–15:00, 15:00–17:00) ต่อตลาด; ผู้ซื้อเข้าประมูลในรอบที่ตลาดตัวเองเปิด

**Rubber Types:** ยางแผ่นรมควัน (RSS), ยางแผ่นดิบ (USS), ยางก้อนถ้วย (Cup Lump), น้ำยางสด (Latex) — แต่ละชนิดมี Grade 1–3

---

## Feature List Summary

| Feature ID | ชื่อ Feature | Role | Priority | Phase |
|---|---|---|---|---|
| AUCTION-1.1 | Buyer — กระดานประมูล (Board Tab) | Buyer | High | 1 |
| AUCTION-1.2 | Buyer — เสนอราคา & ยืนยัน (Offer Modal) | Buyer | High | 1 |
| AUCTION-1.3 | Buyer — Schedule รอบประมูล | Buyer | Medium | 1 |
| AUCTION-1.4 | Buyer — ประวัติการประมูล (History Tab) | Buyer | Medium | 1 |
| AUCTION-2.1 | Officer — ควบคุมการประมูล (Auction Control List) | Auction Officer | High | 1 |
| AUCTION-2.2 | Officer — รายละเอียด LOT & สถิติการเสนอราคา | Auction Officer | High | 1 |
| AUCTION-2.3 | Officer — ตั้งค่ารอบประมูล (CRUD + Calendar) | Admin/Officer | High | 1 |
| AUCTION-2.4 | Officer — อนุมัติประมูล ณ เครือข่าย (Network Auctions) | Auction Officer | Medium | 1 |
| AUCTION-2.5 | Officer — เสนอราคาเปิดตลาด | Admin/Officer | High | 1 |
| AUCTION-2.6 | Director — อนุมัติราคาเปิดตลาด | Market Director | High | 1 |

---

## AUCTION-1.1 — Buyer: กระดานประมูล (Board Tab)

**Page:** `/buyer/auction`
**Component:** `BuyerAuctionShell` → `BoardTab`
**Source:** `src/features/auctions/components/buyer-auction-shell.tsx`, `board-tab.tsx`

### Detail

1. ผู้ซื้อเข้าหน้า `/buyer/auction` → แสดง Navigation Menu แนวนอน 3 แท็บ:
   - **กระดานประมูล** (icon AppstoreOutlined) + Badge count ราคาที่เสนอแล้วในรอบนี้ (สีเขียวแบรนด์)
   - **Schedule รอบประมูล** (icon CalendarOutlined)
   - **ประวัติการประมูล** (icon HistoryOutlined)
2. แท็บ "กระดานประมูล" — แสดง **Filter Card** ด้านบน:
   - **Select ตลาด** — แสดงเฉพาะตลาดที่ผู้ซื้อลงทะเบียนไว้ (`user.markets[]`); default ตลาดแรก
   - **Select รอบประมูล** — เฉพาะรอบของตลาดที่เลือก วันนี้; default รอบแรก
   - **Segmented ประเภทประมูล** — ทุกประเภท / ณ ที่ตั้ง / ณ เครือข่าย
   - **Select ชนิดยาง** — ทุกชนิด / RSS / Cup Lump / น้ำยางสด / USS
   - **Select เกรด** — ทุกเกรด / Grade 1 / Grade 2 / Grade 3
   - **Select EUDR** — ทั้งหมด / สินค้าเขียว (EUDR) / ไม่ใช่ EUDR
   - **Segmented View Mode** — Grid | List (icon AppstoreOutlined / UnorderedListOutlined)
   - **ปุ่ม "รีเซ็ต"** — ล้าง filter ทั้งหมดกลับ default
3. แสดง **RoundCountdownCard** — นาฬิกานับถอยหลังรอบที่เลือก:
   - Phase `upcoming` — "รอบประมูล เริ่มใน HH:MM:SS" (Tag processing)
   - Phase `open` — "รอบประมูล เปิดอยู่ — ปิดใน HH:MM:SS" (Tag สีเขียว pulse)
   - Phase `closed` — "รอบประมูลสิ้นสุดแล้ว" (Tag default สีเทา)
4. แสดง **ยาง Summary Bar** — "แสดง {N} รายการ · น้ำหนักรวมประมาณ {X} กก." (Text สีเทา, เล็ก)
5. แสดง **AuctionRowsGrid** (grid หรือ list ตาม viewMode):
   - **Grid mode** — WeightCard ต่อ 1 lot — แสดง: ชนิดยาง, เกรด, ตลาด, ประเภทประมูล, น้ำหนักประมาณ, น้ำหนักจริง, ราคาเปิด, Badge EUDR (สีเขียว), ข้อมูล tapping date / received date, DRC% (เฉพาะน้ำยางสด)
   - **List mode** — Table แสดง columns เดียวกันในแนวนอน
   - แต่ละ lot แสดง **ปุ่ม "เสนอราคา"** (สีเขียวแบรนด์) — enabled เฉพาะ phase `open` ของ typeKey นั้น
   - ถ้าผู้ซื้อเสนอราคาแล้ว — ปุ่มเปลี่ยนเป็น "แก้ไขราคา" + Pill แสดง "ราคาของฉัน: {price} ฿/กก." (สีเขียว 50%)
   - ปุ่ม delete (TrashOutlined) บน Pill — ลบราคาที่เสนอออก พร้อม confirm dialog "ยืนยันลบราคาที่เสนอสำหรับ {typeName} {grade}?"
6. แสดง **ราคาที่คุณเสนอในรอบนี้** — Table สรุปทุก lot ที่เสนอแล้ว:
   - คอลัมน์: ชนิดยาง, เกรด, น้ำหนัก, ราคาเสนอ, ค่าธรรมเนียม, มูลค่ารวม, ปุ่มแก้ไข / ลบ
   - แสดงเฉพาะเมื่อ `currentRoundOffers.length > 0`

### Condition

1. **ตลาดที่แสดง** — เฉพาะ `user.markets[]` (multi-market) หรือ `user.market` (legacy single) — ไม่แสดงตลาดที่ผู้ซื้อไม่ได้ลงทะเบียน
2. **รอบที่แสดง** — เฉพาะ `AuctionRound` ที่ `date = วันนี้`, `market = ตลาดที่เลือก`, `active = true`
3. **Phase ของรอบ** — `upcoming` / `open` / `closed` คำนวณ real-time ทุก 1 วินาที (`setInterval`) จาก `startTime–endTime` เปรียบเทียบกับ `now`:
   - `now < startTime` → upcoming
   - `startTime ≤ now ≤ endTime` AND ยังไม่ถูก `closedManuallyAt` → open
   - `now > endTime` OR มี `closedManuallyAt` → closed
4. **Phase ระดับ typeKey** — `closedRubberTypes[typeKey]` ทำให้ชนิดยางนั้น force closed แม้รอบยังเปิด (officer ปิดทีละชนิด)
5. **ปุ่ม "เสนอราคา"** — disabled เมื่อ `phase ≠ 'open'` หรือ `rowPhase(row) ≠ 'open'`; tooltip "รอบประมูลยังไม่เริ่ม" / "รอบประมูลสิ้นสุดแล้ว"
6. **Filter ทำงาน AND logic** — market + round + auctionType + typeKey + grade + eudr filter พร้อมกัน
7. **Empty state** — ถ้าไม่มี lot ที่ผ่าน filter → "ไม่พบรายการยางที่ตรงเงื่อนไข" + ปุ่ม "รีเซ็ตตัวกรอง"
8. **Offer state persist** — offers เก็บใน session state (`useOfferFlow`) — ไม่ persist localStorage; refresh หน้า → offers หาย
9. **ไม่มีตลาด** — ถ้า `buyerMarkets.length === 0` → Alert warning "คุณยังไม่ได้ลงทะเบียนตลาดใด กรุณาติดต่อเจ้าหน้าที่"
10. **ไม่มีรอบวันนี้** — ถ้า `marketRounds.length === 0` → Alert info "ไม่มีรอบประมูลสำหรับตลาดนี้วันนี้"

**Effect to / Relate to:**
- **AUCTION-1.2** (เปิด Offer Modal เมื่อกดปุ่มเสนอราคา)
- **AUCTION-2.3** (Admin กำหนดรอบ — ผู้ซื้อเห็นรอบจาก store เดียวกัน)
- **AUCTION-2.1** (Officer ปิดรอบ / ปิด typeKey → board อัปเดต real-time)
- **AUTH-2.2** (markets ที่ลงทะเบียนใน register step 1 = ตลาดที่ buyer เห็นใน board)

---

## AUCTION-1.2 — Buyer: เสนอราคา & ยืนยัน (Offer Modal)

**Component:** `OfferModal` + `useOfferFlow` hook
**Source:** `src/features/auctions/components/offer-modal.tsx`, `hooks/use-offer-flow.ts`

### Detail

1. ผู้ซื้อกดปุ่ม "เสนอราคา" บน WeightCard → เปิด `OfferModal`:
   - Title: "เสนอราคา — {typeName}" + Tag เกรด + Tag รอบ (เช่น "รอบเช้า · 09:00–11:00")
   - ถ้าเคยเสนอแล้ว → Title: "แก้ไขราคาเสนอ — {typeName}" + แสดงราคาเดิม
2. แสดง **Photo Gallery** ด้านซ้าย (desktop 2-column layout):
   - รูปหลัก (720×480px) จาก `IMAGES_BY_TYPE[typeKey]`
   - Thumbnail strip ด้านล่าง — คลิกเปลี่ยนรูปหลัก (`previewIdx` state)
   - รองรับ 5 รูปต่อชนิดยาง
3. แสดง **Lot Summary** ด้านขวา:
   - ชนิดยาง + เกรด + ตลาด + ประเภทประมูล
   - Tapping Date / Received Date (จาก `TappingInfo` component)
   - DRC% (เฉพาะน้ำยางสด)
   - Badge EUDR / Non-EUDR
   - น้ำหนักประมาณ / น้ำหนักจริง (กก.)
   - ราคาเปิด (฿/กก.)
4. แสดง **Price Input Form**:
   - Label "ราคาที่ต้องการเสนอ (฿/กก.)" — required
   - `InputNumberSuffix` — min = `openingPrice + MIN_BID_INCREMENT (2)`, step 0.50, suffix "฿/กก."
   - **Live Cost Breakdown** (อัปเดตทุก keystroke):
     - มูลค่ายาง: `price × estimatedWeight`
     - ค่าธรรมเนียมตลาด: `MARKET_FEE_PER_KG (0.25) × estimatedWeight` หรือ `round.feePerKg`
     - **มูลค่ารวมโดยประมาณ**: ผลรวมทั้งสอง (สีเขียวแบรนด์ bold)
5. ผู้ซื้อกดปุ่ม **"ยืนยันราคา"** → `onFormSubmit()` → arm countdown lock:
   - ราคาปกติ (≤ 1.25× openingPrice) → **countdown 3 วินาที** (`REVIEW_COUNTDOWN_SEC`)
   - ราคาสูง (> 1.25× openingPrice) → **countdown 8 วินาที** (`HIGH_PRICE_COUNTDOWN_SEC`) + Alert warning "ราคาสูงกว่าราคาเปิดตลาดมากกว่า 25% — กรุณาตรวจสอบก่อนยืนยัน"
   - Progress bar นับถอยหลัง; ปุ่ม "ยืนยัน" disabled จนกว่า countdown = 0
6. หลัง countdown สิ้นสุด — ปุ่ม "ยืนยัน" enabled:
   - คลิก → `confirmAndSubmit()` → simulate 600ms API → เพิ่ม offer เข้า `currentRoundOffers`
   - Modal เปลี่ยนเป็น **Success Splash**:
     - Icon CheckCircleOutlined สีเขียว
     - "เสนอราคาเรียบร้อย! {typeName} {grade} — {price} ฿/กก."
     - Auto-close หลัง 2 วินาที
7. ระหว่าง countdown — ปุ่ม **"ยกเลิก"** ยังกดได้ → disarm countdown + กลับสู่ form state (price คงเดิม)
8. Modal เป็น page-level (`BuyerAuctionShell`) — survive tab switch (กระดาน ↔ schedule ↔ history)

### Field กรอก

| # | Field | Form name | Type | Required | Validation |
|---|---|---|---|---|---|
| 1 | ราคาที่ต้องการเสนอ | `price` | InputNumber | ✅ | min = `openingPrice + 2`; message "ราคาต้องสูงกว่าราคาเปิด {openingPrice} อย่างน้อย {MIN_BID_INCREMENT} ฿/กก." |

### Condition

1. **Min bid increment** — `MIN_BID_INCREMENT = 2 ฿/กก.`; ถ้ากรอกน้อยกว่า → error inline
2. **High price threshold** — `HIGH_PRICE_MULTIPLIER = 1.25`; เช่น openingPrice 72 → threshold = 90 ฿/กก.
3. **Countdown mechanics** — `setInterval` 1s decrement; cleanup on modal close; ไม่ reset ถ้าผู้ใช้เปลี่ยน tab
4. **Submitting guard** — ระหว่าง API in-flight: ปุ่มทุกปุ่ม disabled, backdrop close blocked, X button hidden
5. **Edit mode** — ถ้ามี `existingPrice` → form pre-filled ด้วยราคาเดิม + แสดง "แก้ไขจาก {existingPrice} ฿/กก."
6. **Round mismatch** — ถ้า round เปลี่ยน (officer ปิดรอบ) ขณะ modal เปิดอยู่ → countdown ยังทำงาน แต่ offer ถูก tag ด้วย roundId เดิม (POC limitation)
7. **Fee source** — `feePerKg` อ่านจาก `selectedRound.feePerKg` (Admin config); fallback `MARKET_FEE_PER_KG = 0.25`
8. **Photo fallback** — ถ้า `IMAGES_BY_TYPE[typeKey]` ว่าง → แสดง placeholder image
9. **Mobile layout** — Photo gallery ซ่อน thumbnail strip; ใช้ single column layout

**Effect to / Relate to:**
- **AUCTION-1.1** (trigger + receive offers)
- **AUCTION-2.3** (`feePerKg` จาก AuctionRound)
- **CONTRACT** (ถ้า buyer ชนะ → สร้าง contract ต่อ)

---

## AUCTION-1.3 — Buyer: Schedule รอบประมูล

**Component:** `SchedulePanel`
**Source:** `src/features/auctions/components/schedule-panel.tsx`

### Detail

1. แสดงรายการ **AuctionRound 7 วันข้างหน้า** (วันนี้ + 6 วัน) ต่อตลาดที่ผู้ซื้อลงทะเบียน
2. แต่ละวัน แสดง:
   - Header วันที่ + ชื่อวัน (เช่น "จันทร์ที่ 26 พ.ค. 2026")
   - List of Rounds ของวันนั้น — ชื่อรอบ, เวลา, ตลาด, ประเภทประมูล (Tag), ค่าธรรมเนียม (฿/กก.)
   - Phase badge — upcoming / open / closed (สีตาม phase)
3. ถ้าไม่มีรอบใน 7 วัน → Empty state "ไม่มีรอบประมูลที่กำหนดในช่วงนี้"
4. ข้อมูล sync กับ `raot_auction_rounds` localStorage — เห็นรอบที่ Admin สร้างทันที

### Condition

1. **Date range** — วันนี้ถึง +6 วัน; ไม่แสดงรอบที่ผ่านมาแล้ว (วันก่อนหน้า)
2. **Market filter** — แสดงเฉพาะรอบของตลาดที่ `user.markets` ลงทะเบียนไว้
3. **active = false** — ไม่แสดงรอบที่ Admin deactivate
4. **Phase** — คำนวณจาก `now` เหมือน Board Tab
5. **POC limitation** — ไม่มี reminder / notification เมื่อรอบใกล้จะเปิด

**Effect to / Relate to:** AUCTION-1.1 (Round Selector), AUCTION-2.3 (Admin ตั้งค่ารอบ)

---

## AUCTION-1.4 — Buyer: ประวัติการประมูล (History Tab)

**Component:** `HistoryTab` + `MyRoundsSummary`
**Source:** `src/features/auctions/components/history-tab.tsx`

### Detail

1. แสดง **Filter bar** ด้านบน:
   - Select ชนิดยาง (ทุกชนิด / RSS / Cup Lump / น้ำยางสด / USS)
   - Select ตลาด (ทุกตลาด / สุราษฎร์ฯ / นครศรีฯ / สงขลา)
   - Select ผลการประมูล (ทั้งหมด / ชนะ / แพ้)
   - DatePicker.RangePicker — กรองตามช่วงวันที่ประมูล
2. แสดง **Summary Header**:
   - "ชนะ {N} LOT · แพ้ {M} LOT" (Text สีเขียว / สีแดง)
3. แสดง **Table ประวัติ** — columns:
   - LOT No. (Text bold)
   - ชนิดยาง + เกรด + EUDR badge
   - น้ำหนัก (กก.)
   - ราคาปิด (฿/กก.) — สีเขียวแบรนด์
   - มูลค่ารวม (฿)
   - วันที่ประมูล + เวลาปิด
   - ตลาด
   - ผลการประมูล — Tag: "ชนะ" (สีเขียว) / "แพ้" (สีแดง) / "ยกเลิก" (สีเทา)
   - ปุ่ม "ชำระเงิน" (สีเขียว, เฉพาะ status=closed + ชนะ) → navigate ไป `/buyer/payment?lotId={id}`
4. แสดง **MyRoundsSummary** — สรุปรอบที่ผ่านมา (จำนวน LOT ที่เข้าประมูล, ชนะ, แพ้)

### Condition

1. **Data source** — `MOCK_LOTS` filter `status ∈ {closed, cancelled}` + `WON_LOT_IDS` (mock set — index คู่ = ชนะ)
2. **Win/Lose logic** — production: ดึงจาก account auction results API
3. **ปุ่ม "ชำระเงิน"** — แสดงเฉพาะ `status === 'closed' AND getMyResult === 'win'`
4. **Date filter** — ใช้ `dayjs.isBetween` plugin กรองตาม `auctionDate`
5. **Empty state** — ถ้าไม่มีประวัติ → "ยังไม่มีประวัติการประมูล"

**Effect to / Relate to:** PAYMENT (ปุ่มชำระเงิน), AUCTION-2.1 (LOT data source เดียวกัน)

---

## AUCTION-2.1 — Officer: ควบคุมการประมูล (Auction Control List)

**Page:** `/officer/auction-control`
**Component:** `AuctionControlShell` (Tab 1: Live Board) + Legacy History Table (Tab 2)
**Source:** `src/app/(dashboard)/officer/auction-control/page.tsx`, `src/features/auctions/components/auction-control-shell.tsx`

### Detail

1. แสดง **Tabs 2 แท็บ**:
   - **"ควบคุมการประมูล"** (icon TrophyOutlined) — Live board mode (default)
   - **"ประวัติการประมูล"** (icon HistoryOutlined) — Legacy table (closed/cancelled lots)
2. **แท็บ Live Board** — layout เหมือน `BoardTab` ของ Buyer แต่ใช้ **officer view mode**:
   - Filter card: ตลาด, รอบ, ประเภทประมูล, ชนิดยาง, เกรด, EUDR — เหมือน Buyer
   - Countdown card เหมือน Buyer
   - WeightCard Grid/List: แสดงข้อมูลเดียวกับ Buyer ยกเว้น:
     - **ไม่มีปุ่ม "เสนอราคา"** (officer ไม่เสนอราคาเอง)
     - แสดงปุ่ม **"ดูรายละเอียด"** (icon EyeOutlined) → `/officer/auction-control/{lotId}`
     - แสดงปุ่ม **"ปิด {ชนิดยาง}"** (เฉพาะ phase open) — ปิดการประมูลสำหรับชนิดยางนั้นก่อนรอบสิ้นสุด
   - **Round Control** — ปุ่ม "ปิดรอบประมูล" (danger) เมื่อ phase = open → confirm → set `closedManuallyAt + closedManuallyBy` → phase = closed
3. **แท็บ ประวัติ** — Table lots ที่ `status = closed | cancelled`:
   - columns: LOT No, ชนิดยาง, น้ำหนัก, ราคาปิด, มูลค่ารวม, วันที่ประมูล, สถานะ, ปุ่ม "ดู"
   - ปุ่ม "ดู" → `/officer/auction-control/{lotId}`

### Condition

1. **Officer vs Buyer view** — Officer ใช้ prop `isOfficerView=true` บน `AuctionControlShell` — ซ่อน offer UI, แสดง control buttons
2. **ปิดรอบ (Round Close)** — เขียน `closedManuallyAt + closedManuallyBy` ลงใน `AuctionRound` store → Buyer board ทุก tab detect ทันทีผ่าน `getRoundPhase()`
3. **ปิด typeKey** — เขียน `closedRubberTypes[typeKey]` → Buyer board ปิดปุ่ม "เสนอราคา" เฉพาะชนิดนั้น
4. **Confirm dialog** — ปิดรอบ/ปิด typeKey ต้องผ่าน `modal.confirm()` ก่อน (`round name`, `typeKey`, `reviewer name`)
5. **Permission** — เฉพาะ role ที่มี permission `auction-control` (ดู ROLE-PERM)

**Effect to / Relate to:** AUCTION-1.1 (Buyer board ได้รับผลกระทบ), AUCTION-2.2 (Detail page)

---

## AUCTION-2.2 — Officer: รายละเอียด LOT & สถิติการเสนอราคา

**Page:** `/officer/auction-control/[lotId]`
**Source:** `src/app/(dashboard)/officer/auction-control/[lotId]/page.tsx`

### Detail

1. ดึง `lotId` จาก param → `MOCK_LOTS.find(l => l.id === lotId)`
2. แสดง **Header** — LOT No. + ชนิดยาง + เกรด + EUDR badge + สถานะ (pending/open/closed/cancelled)
3. **Content ตาม สถานะ**:
   - **Pending** — `PendingView`: แสดงข้อมูล LOT (น้ำหนัก, ราคาเปิด, tapping date, DRC%) + Alert "ยังไม่มีผู้เสนอราคา"
   - **Open** — `OpenView`: แสดง Bidder Count (ไม่เปิดเผยรายชื่อ — anti-collusion) + Countdown real-time + "กำลังประมูลอยู่"
   - **Closed** — `ClosedView`: แสดงตาราง Top 3 ผู้เสนอราคา (rank, ชื่อ masked → เปิดเผยหลังปิด, ราคา, เวลา) + ราคาชนะ + ผู้ชนะ
   - **Cancelled** — `CancelledView`: Alert "LOT นี้ถูกยกเลิก" + เหตุผล
4. แสดง **ข้อมูล LOT** เสมอ (ทุก status): ชนิดยาง, เกรด, น้ำหนักประมาณ, น้ำหนักจริง, ราคาเปิด, EUDR status, Tapping Date/Received Date, DRC% (ถ้ามี)
5. ปุ่ม **"← กลับไปหน้าควบคุมการประมูล"**

### Condition — Anti-collusion Masking (Open Phase)

1. ขณะ `status = open` — **ชื่อผู้เสนอ masked** เป็น `●●●●●●●●`, เลข ID masked เป็น `U•••`, เลขราคา masked เป็น `●●●●●`
2. **เฉพาะ Bidder Count** ที่แสดงได้ระหว่าง open (จำนวนคน ไม่มีราคา)
3. หลัง `status = closed` — unmask ทั้งหมด: ชื่อ, ราคา, เวลา เสนอ
4. **404 handling** — ถ้าหา lotId ไม่เจอ → Result 404 "ไม่พบข้อมูล LOT" + ปุ่มกลับ

**Effect to / Relate to:** AUCTION-2.1 (entry), LOT-REGISTRATION (LOT data producer)

---

## AUCTION-2.3 — Officer/Admin: ตั้งค่ารอบประมูล (CRUD + Calendar)

**Page:** `/officer/auction-rounds`
**Component:** `AdminAuctionRoundsShell`
**Source:** `src/app/(dashboard)/officer/auction-rounds/page.tsx` (AdminAuctionRoundsShell)

### Detail

1. แสดง **Filter bar** ด้านบน:
   - Select ตลาด — ทุกตลาด / 3 ตลาด
   - Select ประเภทประมูล — ทุกประเภท / ณ ที่ตั้ง / ณ เครือข่าย
   - **Segmented View Mode** — "ปฏิทิน" (CalendarOutlined) | "รายการ 7 วัน" (AppstoreOutlined)
   - ปุ่ม **"+ สร้างรอบประมูล"** มุมขวาบน
2. **Calendar Mode**:
   - AntD Calendar (month view) — วันที่มีรอบแสดง badge (จำนวนรอบ + สีตามตลาด)
   - คลิกวันที่ → เปิด Drawer ด้านขวา แสดง list of rounds ของวันนั้น
   - Drawer: ชื่อรอบ, เวลา, ตลาด, ประเภท, ค่าธรรมเนียม, สถานะ (active/inactive), ปุ่มแก้ไข/ลบ
   - ปุ่ม Prev/Next เดือน
3. **List Mode (7 วัน)**:
   - แสดง list รอบ 7 วัน (วันนี้ + 6) เรียงตาม date+startTime
   - แต่ละ item: AdminRoundCard — ชื่อรอบ, วันที่, เวลา, ตลาด, ประเภท, ค่าธรรมเนียม, สถานะ (Tag active/inactive), ปุ่ม "แก้ไข" / "ลบ"
4. **สร้างรอบใหม่** (`RoundForm` Modal):
   - ชื่อรอบ (required, เช่น "รอบเช้า")
   - วันที่ (DatePicker, required)
   - เวลาเริ่ม / เวลาสิ้นสุด (TimePicker, required)
   - ตลาด (Select, required)
   - ประเภทประมูล (Select: ณ ที่ตั้ง / ณ เครือข่าย)
   - ค่าธรรมเนียม/กก. (InputNumber ฿, required)
   - Active toggle (Switch, default true)
5. **แก้ไขรอบ** — เปิด `editForm` Modal พร้อม preset ค่าเดิม → บันทึก → update `raot_auction_rounds`
6. **ลบรอบ** — `modal.confirm()` "ยืนยันลบรอบ '{name}'?" → splice จาก array

### Field กรอก (สร้าง/แก้ไขรอบ)

| # | Field | Type | Required | Validation |
|---|---|---|---|---|
| 1 | ชื่อรอบ | Input | ✅ | max 50 ตัวอักษร |
| 2 | วันที่ | DatePicker | ✅ | ≥ วันนี้ (ห้ามสร้างรอบอดีต) |
| 3 | เวลาเริ่ม | TimePicker (HH:mm) | ✅ | |
| 4 | เวลาสิ้นสุด | TimePicker (HH:mm) | ✅ | ต้องหลัง startTime |
| 5 | ตลาด | Select | ✅ | 3 ตลาด |
| 6 | ประเภทประมูล | Select | ✅ | location / network |
| 7 | ค่าธรรมเนียม (฿/กก.) | InputNumber | ✅ | min 0; step 0.05 |
| 8 | เปิดใช้งาน | Switch | — | default true |

### Condition

1. **Persistence** — `raot_auction_rounds` localStorage; Buyer board อ่าน store เดียวกัน → เปลี่ยนทันที
2. **Seed** — ถ้าไม่มี store → generate 10 rounds sample โดยอิงวันปัจจุบัน (relative dates)
3. **Overlap check** — POC ไม่ validate รอบซ้อนกัน; production ควรตรวจ market + timeRange conflict
4. **active = false** — ซ่อนจาก Buyer board แต่ยังแสดงใน Admin calendar (greyed out)
5. **Drawer close** — คลิก backdrop หรือปุ่ม X; auto-close หลัง delete/edit สำเร็จ
6. **Permission** — ต้องมี permission `auction-rounds`

**Effect to / Relate to:** AUCTION-1.1, AUCTION-1.3 (Buyer เห็นรอบจาก store นี้), AUCTION-2.1 (Officer Control ใช้รอบนี้)

---

## AUCTION-2.4 — Officer: อนุมัติประมูล ณ เครือข่าย (Network Auctions)

**Page:** `/officer/network-auctions`
**Source:** `src/app/(dashboard)/officer/network-auctions/page.tsx`

### Detail

1. แสดง **StatCards** 3 ใบ ด้านบน: ทั้งหมด / รอตรวจสอบ / อนุมัติแล้ว (Badge count สีเขียว/เหลือง)
2. แสดง **Filter bar**: Search (ชื่อผู้ร้องขอ), Select ประเภท (สถาบัน/เครือข่าย), Select สถานะ, DatePicker ช่วงวันที่ยื่น, ปุ่ม "รีเซ็ต"
3. แสดง **Tabs 3 แท็บ** + Badge count: รอตรวจสอบ / อนุมัติแล้ว / ปฏิเสธ
4. แต่ละ request row แสดง:
   - Request No. + ชื่อผู้ร้องขอ + ประเภท (สถาบันการยาง/เครือข่าย) + จังหวัด/อำเภอ
   - ชนิดยาง + เกรด + EUDR badge + น้ำหนักประมาณ + ราคาเปิดที่เสนอ
   - วันที่ขอประมูล + รอบที่เสนอ + วันที่ยื่นคำขอ
   - ปุ่ม "ดูรายละเอียด" → Modal detail (ดูข้อมูลครบ + เหตุผล)
5. **Modal รายละเอียด** (Descriptions):
   - ข้อมูลผู้ร้องขอ: ชื่อ, รหัส, ประเภท, จังหวัด, อำเภอ
   - ข้อมูลยาง: ชนิด, เกรด, EUDR, น้ำหนัก, ราคาเปิดที่เสนอ
   - วันที่/รอบที่ขอ + เหตุผลการขอ
   - Action buttons (เฉพาะ status=pending):
     - **"อนุมัติ"** (primary สีเขียว) + TextArea note (optional)
     - **"ปฏิเสธ"** (danger) + TextArea rejectReason (required)
6. หลังอนุมัติ → request เข้าสู่รอบประมูล ณ เครือข่าย ที่กำหนด

### Condition

1. **ประเภทผู้ร้องขอ** — `institute` (สถาบันการยาง, สีน้ำเงิน) | `network` (เครือข่าย, สีเขียว)
2. **approve action** — บันทึก `reviewedAt, reviewedBy, reviewNote` + status → `approved`
3. **reject action** — `rejectReason` required; บันทึก + status → `rejected`
4. **Finalized** — status ≠ pending → ปุ่ม action ซ่อน, แสดง Timeline สรุปผล
5. **Permission** — `network-auctions`

**Effect to / Relate to:** AUCTION-1.1 (approved network lots ปรากฏบน buyer board), AUCTION-2.3 (ผูกกับ round ที่อนุมัติ)

---

## AUCTION-2.5 — Officer/Admin: เสนอราคาเปิดตลาด

**Page:** `/officer/opening-price`
**Source:** `src/app/(dashboard)/officer/opening-price/page.tsx`

### Detail

1. แสดง Alert info — "กระบวนการอนุมัติ 2 ขั้น: Admin เสนอราคา → ผู้อำนวยการตลาดอนุมัติขั้นสุดท้าย → ราคาเปิดใช้งาน"
2. แสดง Card "ราคาเปิดตลาด" + Table รายการราคาที่เสนอ:
   - คอลัมน์: ชนิดยาง, รอบ, ราคาเปิด (฿/กก.), สถานะ, เสนอโดย, เวลาที่เสนอ, Action
   - Status: `draft` (ร่าง) / `pending_director` (รอ ผอ.อนุมัติ) / `approved` (อนุมัติแล้ว) / `rejected` (ปฏิเสธ)
   - ปุ่ม "ส่งอนุมัติ" — เฉพาะ status = `draft`
3. ปุ่ม **"+ เสนอราคาเปิด"** → Modal:
   - ชนิดยาง (Select) + รอบ (Select) + ราคา (InputNumber ฿/กก.)
   - ส่ง → สร้าง record ใหม่ status=`draft`
4. กดปุ่ม "ส่งอนุมัติ" → status เปลี่ยนเป็น `pending_director` → ส่งต่อ ผอ. (ดู AUCTION-2.6)

### Field กรอก

| # | Field | Type | Required | Notes |
|---|---|---|---|---|
| 1 | ชนิดยาง | Select | ✅ | RSS1–RSS5, USS3, Cup Lump, Latex, Crepe |
| 2 | รอบ | Select | ✅ | รอบที่ 1–4 (ตาม ROUND_OPTIONS) |
| 3 | ราคาเปิด | InputNumber (฿/กก.) | ✅ | min 0; decimal 2 ตำแหน่ง |

### Condition

1. **Status flow**: `draft → pending_director → approved / rejected`
2. **Steps UI**: แสดง `<Steps>` 3 ขั้น: ร่าง → รอ ผอ. → สำเร็จ/ปฏิเสธ
3. **Permission** — `opening-price` (ดู ROLE-PERM)
4. **POC limitation** — ราคาที่ approved ยังไม่ wire กับ `openingPrice` ของ `RUBBER_ROWS` — production ต้อง sync ราคาเปิดที่อนุมัติเข้า board ก่อนรอบเริ่ม

**Effect to / Relate to:** AUCTION-2.6 (Director อนุมัติ), AUCTION-1.1 (openingPrice บน board)

---

## AUCTION-2.6 — Director: อนุมัติราคาเปิดตลาด

**Page:** `/officer/approve-price`
**Role:** Market Director
**Source:** `src/app/(dashboard)/officer/approve-price/page.tsx`

### Detail

1. แสดง Table รายการราคาเปิดที่ Admin ส่งมา (`status = pending_director`)
2. แต่ละ row: ชนิดยาง, รอบ, ราคาเปิด, เสนอโดย, เวลา + ปุ่ม "อนุมัติ" / "ปฏิเสธ"
3. **อนุมัติ** — `modal.confirm()` → status → `approved` + บันทึก `approvedAt, approvedBy`
4. **ปฏิเสธ** — Modal กรอก `rejectReason` (required) → status → `rejected`
5. ราคาที่ approved → active สำหรับรอบนั้น

### Condition

1. **Permission** — `approve-price` (เฉพาะ Market Director หรือ Master)
2. ราคา approved หลาย version ในรอบเดียว → production ใช้ล่าสุด (POC แสดงทั้งหมด)

**Effect to / Relate to:** AUCTION-2.5 (producer), AUCTION-1.1 (consumer)

---

## Cross-cutting Notes

### Auction Round Phase Logic

```
now < round.startTime                     → 'upcoming'
round.startTime ≤ now ≤ round.endTime
  AND ไม่มี closedManuallyAt             → 'open'
now > round.endTime
  OR closedManuallyAt ≤ now              → 'closed'
```

**Per-typeKey override:**
```
if closedRubberTypes[typeKey] exists     → force 'closed' for that type only
```

### Storage Keys (Auction-related)

| Key | Purpose | Producer | Consumer |
|---|---|---|---|
| `raot_auction_rounds` | AuctionRound[] — config ทุกรอบ | AUCTION-2.3 (Admin CRUD) | AUCTION-1.1, AUCTION-1.3, AUCTION-2.1 |
| `raot_lot_queue` | WaitingLot[] + WeighedLot[] | LOT-REGISTRATION | AUCTION-2.1, AUCTION-2.2 |

### Constants

| Constant | Value | Used by |
|---|---|---|
| `MIN_BID_INCREMENT` | 2 ฿/กก. | Offer form validation |
| `HIGH_PRICE_MULTIPLIER` | 1.25 × openingPrice | Countdown tier selector |
| `REVIEW_COUNTDOWN_SEC` | 3 วินาที | ราคาปกติ |
| `HIGH_PRICE_COUNTDOWN_SEC` | 8 วินาที | ราคาสูง |
| `MARKET_FEE_PER_KG` | 0.25 ฿/กก. | Fallback ถ้า round ไม่มี feePerKg |

### Rubber Types (Board)

| typeKey | ชื่อ | สี | EUDR |
|---|---|---|---|
| `rss` | ยางแผ่นรมควัน | `#1a7c3e` | ✅ มักเป็น EUDR |
| `cl` | ยางก้อนถ้วย (Cup Lump) | `#fa8c16` | ❌ ส่วนใหญ่ non-EUDR |
| `lat` | น้ำยางสด | `#1677ff` | ❌ ต้องประมูลวันเดียวกับกรีด |
| `uss` | ยางแผ่นดิบ | `#722ed1` | ✅ มักเป็น EUDR |

### Markets

| ค่าคงที่ | ชื่อเต็ม |
|---|---|
| `MARKET_SURAT` | ตลาดกลางยางพาราสุราษฎร์ธานี |
| `MARKET_NAKHON` | ตลาดกลางยางพารานครศรีธรรมราช |
| `MARKET_SONGKHLA` | ตลาดกลางยางพาราสงขลา |

---

## Out-of-scope / POC Limitations

1. **Bid real-time** — ราคาเสนอเก็บใน React state ไม่ใช่ localStorage; refresh หน้า → ข้อมูลหาย (production: WebSocket/SSE)
2. **Anti-collusion unmasking** — masking เป็น static hardcode; production ต้อง server-side unmask หลังปิดรอบ
3. **Opening price not wired** — ราคาเปิดที่ Director อนุมัติยังไม่ส่งผลต่อ `openingPrice` ของ RUBBER_ROWS
4. **Network auction approval** — approval ยังไม่ทำให้ lot ปรากฏใน buyer board จริง (mock data แยก)
5. **Fee per round** — `feePerKg` อยู่ใน AuctionRound แต่ cost breakdown บน Offer Modal ยังใช้ `MARKET_FEE_PER_KG` constant เป็น fallback
6. **No bid history per buyer** — ประวัติการประมูลใช้ `WON_LOT_IDS` mock set ไม่ใช่ account-level data
7. **Calendar month navigation** — Admin Calendar ไม่ fetch รอบเดือนที่ผ่านมา (seed เป็น relative to today)
8. **No email/SMS notification** — ผู้ซื้อไม่ได้รับแจ้งเตือนเมื่อรอบเปิด/ราคาเปลี่ยน
9. **Round overlap validation** — ไม่ตรวจรอบซ้ำซ้อนในตลาดเดียว (production: conflict check)

---

*Generated by Cowork (Claude) — Detail + Condition format*
*Source code reviewed: 2026-05-25*
