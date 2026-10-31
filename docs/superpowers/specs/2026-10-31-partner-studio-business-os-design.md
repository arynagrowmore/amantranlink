# Design Specification: Partner Studio Business OS

- **Date**: 2026-10-31
- **Author**: Antigravity & Shahi Heritage Studio Team
- **Status**: Final Specification for Approval
- **Target Application**: AmantranLink (`/partner`)
- **Selected Approach**: Approach 1 — Studio-Direct Hybrid Business OS

---

## 1. Intent and the "Why"

Wedding photographers, cinematographers, and design studios in India manage high-stakes client relationships. Today, they lose time and revenue juggling separate tools for client proposals, WhatsApp messaging, invitation drafting, and payment follow-ups.

The current Partner Dashboard has grown to **13 fragmented tabs**, creating cognitive clutter with overlapping settings (`Settings` vs `Profile` vs `Finance`), static placeholders (`Team Members`), and disjointed financial ledgers (`Commissions` separate from `Finance & Billing`).

**The Goal**: Re-architect `/partner` into a streamlined, high-utility **Studio Business Operating System (OS)** that consolidates the entire client lifecycle—from Inquiry and Quotation to Client Review, Delivery, and Profit Settlement—into **6 powerful, dedicated business hubs**.

---

## 2. Goals, Non-Goals, and Anti-Goals

### 2.1 Goals
1. **Clutter Elimination**: Condense 13 fragmented tabs into 6 clean, authoritative Business Hubs in both Desktop Sidebar and Mobile Slide-Over Drawer.
2. **Unified Financial Ledger (Money Hub)**: Merge Quotations, Invoices, Client Payments, and Wholesale Cost tracking (₹899 per card) into a single ledger displaying gross client revenue, platform costs, and net studio profit.
3. **Hybrid Payment Workflow**:
   - **Mode A (Direct Studio UPI / QR)**: Photographers provide their direct Google Pay / PhonePe / Bank QR. Client pays 100% directly to the photographer (0% platform deduction, instant liquidity). Studio only pays ₹899 wholesale cost when publishing.
   - **Mode B (AmantranLink Online Pay Link)**: Studio can generate a secure payment link (Razorpay/Cards/UPI). Client pays online; AmantranLink retains ₹899 wholesale fee and automatically credits the net balance to the studio's platform wallet balance, withdrawable with 1 tap to their UPI ID.
4. **1-Click WhatsApp Client Dispatches**: Pre-formatted, branded WhatsApp dispatch buttons for:
   - Quotation link
   - Draft preview & interactive review token
   - Final published royal invitation
   - Balance payment reminder
5. **Flexible Inquiry & Client Lifecycle**: Photographers can add an inquiry/client first, send a quotation, and link or generate the royal digital card whenever the client confirms booking.
6. **Consolidated Studio Identity**: Merge Studio Profile, Branding (watermark, co-badge), Custom Domains, and Partner URL Slug into a single cohesive settings hub.
7. **Eliminate Dead-End Placeholders**: Remove the static "Team Members (Coming Soon)" tab until multi-seat collaboration is built.

### 2.2 Non-Goals
- Not building an internal enterprise payroll or tax filing system.
- Not altering the public landing page or the couple-facing invitation reading experience.
- Not replacing the core Studio Customizer (`/studio`).

### 2.3 Anti-Goals
- **Anti-Goal 1: No Mandatory Platform Escrow**. Do not force photographers to route all client funds through AmantranLink's escrow. Indian wedding vendors demand instant cashflow and control over their client billing.
- **Anti-Goal 2: No Silent Failures or Dead Ends**. No tabs that display only "Coming Soon" cards without functionality, and no silent validation rejections.

---

## 3. Approaches Considered

### Approach 1: Studio-Direct Hybrid Business OS (Selected & Approved)
- Combines direct UPI payment collection (0% fee, instant cash) with optional platform pay links.
- Re-architects 13 tabs into 6 high-impact hubs:
  1. Overview & Pipeline (`dashboard`)
  2. Projects & Invitations (`invitations`)
  3. Clients CRM (`clients`)
  4. Money & Billing (`finance`)
  5. Guest Automations (`automation`)
  6. Studio Identity (`profile`)
- **Trade-offs**: Requires the studio to click "Mark Payment Received" when cash/direct UPI is received offline, but delivers 100% control, high trust, and clean ergonomics.

### Approach 2: Strict Platform Escrow OS (Rejected)
- Requires all quotes to be paid exclusively through AmantranLink gateway; AmantranLink holds funds until event completion and deducts 2% gateway fees.
- **Why Rejected**: Causes strong resistance among Indian wedding photographers who rely on 50% cash/UPI advances for operational gear, travel, and crew booking.

### Approach 3: Minimalist Card-Only Tool (Rejected)
- Strips out quotations, invoicing, and billing entirely, reducing the dashboard to only an invitation launcher.
- **Why Rejected**: Fails the user's explicit mandate for a "Proper Business OS", forcing studios back to spreadsheets and paper diaries.

---

## 4. Architectural Specification of the 6 Business Hubs

### Hub 1: 📊 Overview & Pipeline (`#studio/overview` or `#studio/dashboard`)
- **KPI Summary Cards**:
  - *This Month's Gross Revenue* (Total client quotes accepted)
  - *Net Studio Profit* (Gross revenue minus ₹899 wholesale costs)
  - *Active Wedding Projects* (Drafts, In Review, Live)
  - *Pending Action Items* (Client feedback awaiting revision, unpaid balance reminders)
- **Visual Lead-to-Delivery Pipeline Ribbon**:
  `Inquiry` → `Quote Sent` → `Advance Paid` → `Designing` → `In Client Review` → `Approved & Live`
- **Sub-Tabs**:
  - `Pipeline`: Visual workflow of all ongoing projects.
  - `Analytics`: Partner growth, page views, and referral performance.
- **Dominant Action Button**: `+ Create Client Project` (opens quick setup wizard).

### Hub 2: 💌 Projects & Invitations (`#studio/invitations`)
- **Status Filter Pills**: `All`, `Drafts`, `Sent for Review`, `Client Approved`, `Live`.
- **Search & Sort**: Search by groom, bride, phone, date; sort by newest or wedding date.
- **Project Cards with 1-Click WhatsApp Dispatches**:
  - *Review Status Pill* (e.g., `Changes Requested: 2 notes`, `Approved by Client`).
  - *Quick Action Menu*:
    - "Open in Studio" (launches full editor with client project state).
    - "Send Review Link on WhatsApp" (opens `https://wa.me/?text=...` with client review token).
    - "Send Live Invitation Link" (opens `https://wa.me/?text=...` with published short URL).
    - "Record Payment" (quick modal for Advance / Paid status).
    - "Duplicate Project".

### Hub 3: 👥 Clients CRM (`#studio/clients`)
- **Flexible Lead & Client Directory**:
  - Couples can be registered as an early Inquiry or directly linked to an invitation.
  - Couple name, phone, email, wedding date, venue, guest count.
  - Linked invitation project status + "Create Royal Card" button if invitation not yet created.
  - Financial summary per client: Quoted amount, Paid amount, Pending balance.
- **Add Client Modal**: Quick form for couple names, phone, email, event date, and initial quote amount.

### Hub 4: 💰 Money & Billing Hub (`#studio/money` or `#studio/finance`)
- **Unified Financial Ledger** (Merged `Finance` + `Commissions`):
  - *Gross Client Billings*: Total ₹ invoiced across all couples.
  - *Wholesale Platform Costs*: ₹899 × published cards.
  - *Net Profit Kept*: Exact studio earnings.
  - *Available Platform Credit / Payout*: Payout balance from online client payments or referral cashback, withdrawable with 1 tap to UPI.
- **Quotations Manager**:
  - Create professional wedding quotations with studio logo, custom line items (e.g. Traditional Photography, Cinematic Film, Luxury Digital Kankotri, Drone Coverage).
  - GST / Non-GST calculation (toggle 0%, 5%, 18%).
  - Payment terms (e.g., "50% Advance on Booking, 50% on Final Delivery").
  - Instant PDF Generation (`generateQuotationPdf`) & 1-tap WhatsApp sharing.
- **Invoice & Payment Settlement**:
  - Convert approved Quote into Official Invoice.
  - Payment status tracking: `UNPAID`, `PARTIAL (ADVANCE RECEIVED)`, `PAID IN FULL`.
  - Record payment method: `Direct UPI / Cash` or `Online Gateway`.
  - PDF Receipt download.

### Hub 5: ⚡ Guest Automations & RSVPs (`#studio/automations`)
- **RSVP Live Attendance Intelligence**:
  - Headcount across ceremonies (Haldi, Sangeet, Shubh Vivah, Reception).
  - Food preference counters (Veg / Jain / Non-Veg).
- **1-Click WhatsApp Reminder Queue**:
  - Visual queue of guests with pending RSVPs.
  - 1-Click WhatsApp dispatch (`https://wa.me/?text=...`) without expensive Meta API gateway charges.

### Hub 6: 🏢 Studio Identity & Settings (`#studio/identity` or `#studio/profile`)
- **Unified Branding & Configuration** (Merged `Profile` + `Branding` + `Domains` + `Settings`):
  - *Studio Business Card*: Legal studio name, contact phone, email, city, Instagram handle, portfolio website.
  - *Royal Watermark & Co-Badge*: Studio logo upload, co-badge positioning ("Suites Curated by [Studio Name]").
  - *Custom Brand Accent Color*: Primary palette for quotes and invoices.
  - *Custom Domain Integration*: Connect `invites.mystudio.com` with CNAME verification instructions.
  - *Payout Destination*: Studio UPI ID (`name@upi`) for referral payouts and online gateway settlements.
  - *Partner Referral Link*: Studio slug (`amantranlink-web.vercel.app/?partner=studio-name`) with 1-tap copy.
  - *Marketing Kit Sub-view*: Downloadable posters, story creatives, and WhatsApp pitch templates.

---

## 5. Navigation & UI Structure

### 5.1 Desktop Sidebar
Compact dark navigation (`bg-[#11161B]`) featuring:
1. **Brand Header**: AmantranLink crest + Studio Partner verified badge.
2. **Studio Card**: Studio avatar, studio name, `@partner-slug`.
3. **The 6 Hub Navigation Links**:
   - `Overview` (`LayoutDashboard`)
   - `Projects & Cards` (`FileText`, badge: active count)
   - `Clients CRM` (`Users`)
   - `Money & Billing` (`Receipt`, badge: `Net Profit ₹...`)
   - `Automations` (`Zap`)
   - `Studio Identity` (`Building2`)
4. **Footer**: "View Public Website", "Sign Out".

### 5.2 Mobile & Tablet Slide-Over Drawer
- Opened via the header Hamburger button (`onOpenMobileMenu`).
- Features the exact same 6 Hub links with high contrast, touch-friendly 44px tap targets.
- Auto-closes upon tab selection and updates the URL hash (`#studio/:tab`).

---

## 6. Engineering Architecture & Backward Compatibility

- **Consolidated Component Factoring**:
  - Create unified `StudioIdentityView.tsx` by cleanly combining `StudioProfileTab`, `StudioBrandingView`, `CustomDomainsView`, and referral settings into tabbed/sectional panes.
  - Unify `StudioFinanceWorkspace.tsx` and `PartnerSettlementTab.tsx` into `StudioMoneyWorkspace.tsx`, preserving existing Supabase queries.
- **Preserved Database Compatibility**:
  - All operations map cleanly to existing tables: `wedding_sites`, `quotations`, `invoices`, `studio_business_profiles`, `custom_domains`, `automation_logs`, `settlements`.
- **Zero Route Regressions**:
  - `src/utils/navigation.ts` updated with aliases so existing bookmarks (`#studio/dashboard`, `#studio/finance`, `#studio/invitations`, `#studio/profile`, etc.) resolve seamlessly to the new 6 Hubs.
