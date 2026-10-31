# Partner Studio Business OS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the 13-tab Partner Dashboard into a streamlined, high-utility 6-Hub Studio Business Operating System (OS) for Indian wedding photographers and studios, unifying project lifecycles, hybrid billing, 1-click WhatsApp dispatches, and wholesale margins.

**Architecture:** Consolidate navigation down to 6 core business hubs (`dashboard`, `invitations`, `clients`, `finance`, `automation`, `profile`) with bidirectional URL hash routing and legacy hash fallbacks. Introduce unified components for Studio Identity (`StudioIdentityView`) and consolidated Money & Billing (`StudioFinanceWorkspace`), while adding visual pipeline ribbons, WhatsApp link generators, and pre-card inquiry onboarding.

**Tech Stack:** React 18/19, TypeScript (strict mode), Vite, Tailwind CSS v4, Lucide React, Supabase PostgreSQL, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-31-partner-studio-business-os-design.md`

## Global Constraints

- Full backward compatibility with existing Supabase tables: `wedding_sites`, `quotations`, `invoices`, `studio_business_profiles`, `custom_domains`, `automation_logs`, `settlements`.
- Strict responsive compliance across Desktop (1440x900), Tablet (768x1024), and Mobile (390x844) with zero horizontal scroll/overflow (`overflow-x: hidden`).
- Safe URL hash routing supporting both canonical hashes (`#studio/dashboard`, `#studio/invitations`, `#studio/clients`, `#studio/finance`, `#studio/automation`, `#studio/profile`) and legacy aliases (`#studio/commissions`, `#studio/analytics`, `#studio/marketing`, `#studio/branding`, `#studio/domains`, `#studio/settings`, `#studio/team`).
- Zero API fees or third-party SMS dependencies for client communication: rely on 1-click personalized `https://wa.me/?text=...` URI-encoded links.
- Fixed wholesale cost calculation: ₹899 per published royal wedding card.

## Review Focus

1. **Legacy Hash Navigation**: A studio landing on a bookmarked `#studio/commissions` or `#studio/branding` URL must seamlessly activate Hub 4 (`finance`) or Hub 6 (`profile`) with the relevant sub-view without 404 or blank screen.
2. **Offline vs Online Payment Discrepancy**: Marking a quotation or balance invoice as "Paid" offline (Cash/Direct UPI) must update client financial records and calculate net studio profit without deducting any platform fee.
3. **Empty Client State with Pre-Card Inquiries**: A studio with zero wedding invitations must be able to register an Inquiry, generate a quote, and link/create a Royal Card project later without encountering undefined site ID runtime exceptions.
4. **WhatsApp URL Formatting**: Special characters, line breaks, emojis, and Hindi/English names in WhatsApp dispatches must be cleanly encoded using `encodeURIComponent` without URL truncation or browser crash.
5. **Mobile Viewport Drawer Navigation**: In mobile viewports (<768px), selecting any hub inside the mobile slide-over drawer must immediately dismiss the drawer, scroll the viewport to top, and display the target hub cleanly.

---

### Task 1: Navigation Harmonization & Tab Aliasing

**Files:**
- Create: `src/utils/__tests__/studioNavigation.test.ts`
- Modify: `src/utils/navigation.ts:1-150`
- Modify: `src/components/PartnerDashboard/PartnerDashboard.tsx:40-85`
- Modify: `src/components/PartnerDashboard/StudioWorkspaceNav.tsx:1-110`
- Modify: `src/components/PartnerDashboard/StudioAccountMenu.tsx:1-90`

**Interfaces:**
- Consumes: Raw URL hash string (e.g. `window.location.hash`).
- Produces:
  ```typescript
  export type StudioPrimaryHub = 
    | 'dashboard' 
    | 'invitations' 
    | 'clients' 
    | 'finance' 
    | 'automation' 
    | 'profile';

  export type StudioWorkspaceTab = StudioPrimaryHub | 'commissions' | 'analytics' | 'marketing' | 'branding' | 'domains' | 'team' | 'settings';

  export function normalizeStudioTab(tab: string): { hub: StudioPrimaryHub; subView?: string };
  ```

- [ ] **Step 1: Write the failing test for tab normalization and URL hash fallback**

Create `src/utils/__tests__/studioNavigation.test.ts` testing:
- `normalizeStudioTab('dashboard')` returns `{ hub: 'dashboard' }`
- `normalizeStudioTab('commissions')` returns `{ hub: 'finance', subView: 'settlements' }`
- `normalizeStudioTab('analytics')` returns `{ hub: 'dashboard', subView: 'analytics' }`
- `normalizeStudioTab('branding')` returns `{ hub: 'profile', subView: 'branding' }`
- `normalizeStudioTab('domains')` returns `{ hub: 'profile', subView: 'domains' }`
- `normalizeStudioTab('marketing')` returns `{ hub: 'profile', subView: 'marketing' }`
- `normalizeStudioTab('settings')` returns `{ hub: 'profile', subView: 'settings' }`
- `normalizeStudioTab('unknown_tab')` returns fallback `{ hub: 'dashboard' }`

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/__tests__/studioNavigation.test.ts`
Expected: FAIL with "normalizeStudioTab is not a function"

- [ ] **Step 3: Implement `normalizeStudioTab` and update navigation definitions**

Implement `normalizeStudioTab` in `src/utils/navigation.ts`. Update `STUDIO_TAB_LABELS` and nav structures in `StudioWorkspaceNav.tsx` and `PartnerDashboard.tsx` to display the 6 clean hubs while accepting legacy tabs.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/__tests__/studioNavigation.test.ts`
Expected: PASS

- [ ] **Step 5: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors

- [ ] **Step 6: Commit navigation harmonization**

```bash
git add src/utils/navigation.ts src/utils/__tests__/studioNavigation.test.ts src/components/PartnerDashboard/StudioWorkspaceNav.tsx src/components/PartnerDashboard/StudioAccountMenu.tsx src/components/PartnerDashboard/PartnerDashboard.tsx
git commit -m "feat(partner): consolidate navigation to 6 business hubs with legacy hash fallbacks"
```

---

### Task 2: Consolidated Studio Identity & Settings Hub (`StudioIdentityView.tsx`)

**Files:**
- Create: `src/components/PartnerDashboard/StudioIdentityView.tsx`
- Modify: `src/components/PartnerDashboard/PartnerDashboard.tsx:2380-2620`

**Interfaces:**
- Consumes:
  ```typescript
  interface StudioIdentityViewProps {
    initialSection?: 'profile' | 'branding' | 'domains' | 'settings' | 'marketing';
    profileData: any;
    onUpdateProfile: (data: any) => Promise<boolean>;
    userEmail: string;
    stats: any;
    onOpenAssetKit?: (site: any) => void;
  }
  ```
- Produces: Consolidated settings workspace containing 5 sub-views in unified tab/pill switch:
  1. `Studio Profile & Contact` (phone, city, experience, logo, tagline)
  2. `Branding & Watermark` (renders `StudioBrandingView`)
  3. `Custom Domains` (renders `CustomDomainsView`)
  4. `Referral & UPI Payout Settings` (partner code, referral share, payout UPI ID)
  5. `Marketing Kit` (renders `PartnerMarketingTab`)

- [ ] **Step 1: Create `StudioIdentityView.tsx` with sub-section switching**

Implement `StudioIdentityView.tsx` with:
- Top sticky sub-navigation pill ribbon (`Profile`, `Branding`, `Custom Domains`, `Referral & Payouts`, `Marketing Kit`).
- Controlled tab state synced with optional `initialSection` prop.
- Responsive container with dark luxury styling matching Shahi Heritage aesthetic.

- [ ] **Step 2: Connect `StudioIdentityView` in `PartnerDashboard.tsx`**

In `PartnerDashboard.tsx`, replace the separated render blocks for `activeTab === 'profile'`, `'branding'`, `'domains'`, `'marketing'`, and `'settings'` with a single render:
```tsx
{activeTab === 'profile' && (
  <StudioIdentityView
    initialSection={identityInitialSection}
    profileData={partnerProfile}
    onUpdateProfile={handleUpdateProfile}
    userEmail={user?.email || ''}
    stats={stats}
    onOpenAssetKit={onOpenAssetKit}
  />
)}
```

- [ ] **Step 3: Run TypeScript compiler check**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors

- [ ] **Step 4: Commit Studio Identity consolidation**

```bash
git add src/components/PartnerDashboard/StudioIdentityView.tsx src/components/PartnerDashboard/PartnerDashboard.tsx
git commit -m "feat(partner): build unified StudioIdentityView consolidating branding, domains, marketing, and settings"
```

---

### Task 3: Unified Money & Billing Hub (`StudioFinanceWorkspace.tsx`)

**Files:**
- Modify: `src/components/PartnerDashboard/Finance/StudioFinanceWorkspace.tsx:1-250`
- Modify: `src/components/PartnerDashboard/PartnerDashboard.tsx:2490-2505`

**Interfaces:**
- Consumes:
  ```typescript
  interface StudioFinanceWorkspaceProps {
    sites: WeddingSite[];
    partnerStats: PartnerDashboardStats;
    quotations: any[];
    invoices: any[];
    onRefresh: () => void;
  }
  ```
- Produces:
  - Top 4-card KPI Ledger:
    1. *Gross Client Billings* (Total quotation amounts invoiced)
    2. *Platform Wholesale Costs* (`sites.filter(s => s.published).length * 899`)
    3. *Net Studio Profit* (Gross Billings - Wholesale Costs)
    4. *Platform Wallet & Payout Balance* (with 1-tap "Request UPI Withdrawal" modal)
  - Sub-view navigation:
    - `Quotations & Invoicing`: Full quote generator with line items, GST toggle, and PDF download.
    - `Wholesale Margin & Settlements`: Card-by-card breakdown showing client billing vs ₹899 wholesale cost and net margin per couple.

- [ ] **Step 1: Implement top 4-card KPI Ledger calculation in `StudioFinanceWorkspace.tsx`**

Add wholesale cost calculation helper:
```typescript
const publishedSitesCount = sites.filter(s => s.status === 'published' || s.is_published).length;
const totalWholesaleCost = publishedSitesCount * 899;
const totalGrossInvoiced = quotations.reduce((sum, q) => sum + (Number(q.total_amount) || 0), 0);
const netStudioProfit = Math.max(0, totalGrossInvoiced - totalWholesaleCost);
```

- [ ] **Step 2: Add Sub-view Toggle and Embed Wholesale Margin Ledger**

Integrate the settlement breakdown directly into `StudioFinanceWorkspace`:
- Tab 1: `Quotations & Invoices` (existing comprehensive quote generator)
- Tab 2: `Wholesale Ledger & Payouts` (card-by-card margin ledger + 1-tap UPI withdrawal form)

- [ ] **Step 3: Add 1-Click WhatsApp Share for Quotations**

Add button on quotation card:
```typescript
const shareQuoteWhatsApp = (quote: any) => {
  const text = `Namaste ${quote.client_name}! Here is your official wedding photography & digital invitation quotation from ${studioName}.\n\nTotal: ₹${quote.total_amount}\nDetails: ${quoteUrl}`;
  window.open(`https://wa.me/${cleanPhone(quote.client_phone)}?text=${encodeURIComponent(text)}`, '_blank');
};
```

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors

- [ ] **Step 5: Commit Money Hub enhancements**

```bash
git add src/components/PartnerDashboard/Finance/StudioFinanceWorkspace.tsx src/components/PartnerDashboard/PartnerDashboard.tsx
git commit -m "feat(partner): unify Finance and Commissions into high-utility Money Hub with wholesale ledger"
```

---

### Task 4: Overview Hub with Lead-to-Delivery Pipeline Ribbon

**Files:**
- Modify: `src/components/PartnerDashboard/PartnerDashboard.tsx:1400-1690`

**Interfaces:**
- Consumes: `clientSites: any[]`, `quotations: any[]`.
- Produces:
  - Visual 6-Stage Business Process Flow (BPF) Ribbon:
    1. `Inquiry` (Lead logged, no quote yet)
    2. `Quote Sent` (Quotation pending client review)
    3. `Advance Paid` (Booking confirmed, advance received)
    4. `Designing` (Invitation draft in progress)
    5. `In Client Review` (Interactive token active, waiting on couple feedback)
    6. `Approved & Live` (Published, royal link live)
  - Sub-view switcher: `Pipeline & Overview` vs `Analytics Insights` (rendering `PartnerAnalyticsTab`).

- [ ] **Step 1: Calculate pipeline stage counts from existing sites and quotations**

Compute counts for each of the 6 stages based on `site.status`, `site.review_status`, and quotation payment status.

- [ ] **Step 2: Render interactive Pipeline Ribbon in Hub 1 (`dashboard`)**

Render a responsive, clickable pipeline ribbon displaying stage count badges. Clicking any stage filters the project view or scrolls to matching projects.

- [ ] **Step 3: Add sub-tab toggle for Analytics**

Add sub-tab pills (`Pipeline Overview` | `Growth Analytics`) in the dashboard header. When `Growth Analytics` is selected, render `<PartnerAnalyticsTab stats={stats} />`.

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors

- [ ] **Step 5: Commit Overview Pipeline & Analytics**

```bash
git add src/components/PartnerDashboard/PartnerDashboard.tsx
git commit -m "feat(partner): add visual lead-to-delivery pipeline ribbon and nested analytics in overview hub"
```

---

### Task 5: Projects & Invitations Hub with 1-Click WhatsApp Dispatches

**Files:**
- Modify: `src/components/PartnerDashboard/PartnerDashboard.tsx:1690-2195`

**Interfaces:**
- Consumes: Project site data (`groom_name`, `bride_name`, `client_phone`, `review_token`, `slug`).
- Produces:
  - 1-Click WhatsApp Dispatch for Client Review Link:
    `wa.me/{phone}?text=Namaste {couple}! Your royal wedding invitation preview is ready for review: {reviewUrl}`
  - 1-Click WhatsApp Dispatch for Live Published Card:
    `wa.me/{phone}?text=Shubh Vivah! Your royal wedding invitation is now officially live: {liveUrl}`
  - Review Status Indicator badge directly on the project card:
    `Changes Requested ({count} notes)` (amber) or `Approved by Client` (emerald).

- [ ] **Step 1: Create WhatsApp message helper functions**

Implement clean URI-encoded message generators:
```typescript
function buildReviewWhatsAppUrl(site: any, reviewToken: string): string;
function buildLiveWhatsAppUrl(site: any): string;
function buildPaymentReminderWhatsAppUrl(site: any, pendingAmount: number): string;
```

- [ ] **Step 2: Add 1-Click WhatsApp buttons to Project Cards**

Embed quick WhatsApp action buttons directly on each invitation card in the project grid, with phone pre-validation and copy-link fallback.

- [ ] **Step 3: Display client review badge prominently**

Ensure `site.review_status` (Approved / Changes Requested / Pending) is rendered with clear badges and feedback counts.

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors

- [ ] **Step 5: Commit Projects WhatsApp dispatches**

```bash
git add src/components/PartnerDashboard/PartnerDashboard.tsx
git commit -m "feat(partner): add 1-click WhatsApp dispatches and review status indicators on project cards"
```

---

### Task 6: Clients CRM Hub & Pre-Card Inquiry Creation

**Files:**
- Modify: `src/components/PartnerDashboard/PartnerDashboard.tsx:2195-2345`

**Interfaces:**
- Consumes: Client records, inquiries, and invitations.
- Produces:
  - Modal: `+ Add Inquiry / Client` allowing studios to register a lead before creating an invitation project.
  - Action: `Create Royal Card` on client cards that do not yet have an invitation, pre-populating groom, bride, and event date in the project creator.
  - Client Financial Status Pill: Displays quoted amount, advance received, and pending balance.

- [ ] **Step 1: Build `+ Add Client Inquiry` Modal**

Add inquiry creation form with fields:
- Couple Name (Groom & Bride)
- Client Phone (WhatsApp)
- Client Email
- Wedding Date
- Estimated Budget / Quote Amount
- Notes / Requirements

- [ ] **Step 2: Add `Create Royal Card` action to Client Directory**

When clicking "Create Royal Card" on an inquiry row:
- Open the Create Invitation modal with the client's names and phone pre-filled.
- Link the new project to this client record upon creation.

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors

- [ ] **Step 4: Commit Clients CRM enhancements**

```bash
git add src/components/PartnerDashboard/PartnerDashboard.tsx
git commit -m "feat(partner): add pre-invitation inquiry onboarding and 1-click royal card creator in Clients CRM"
```

---

### Task 7: Guest Automations Hub with 1-Click RSVP Dispatch Queue

**Files:**
- Modify: `src/components/PartnerDashboard/PartnerDashboard.tsx:2500-2515`
- Modify: `src/components/Automation/AutomationCenterWorkspace.tsx:1-200`

**Interfaces:**
- Consumes: Guest RSVPs for studio projects.
- Produces:
  - Top Summary: Total RSVPs Received, Attending, Declined, Pending.
  - 1-Click WhatsApp RSVP Reminder Dispatch Queue: Filter guests with `status === 'pending'` and provide 1-click dispatch button to nudge them via WhatsApp.

- [ ] **Step 1: Add RSVP attendance summary counters to `AutomationCenterWorkspace.tsx`**

Display aggregate statistics: Confirmed Guests, Dietary/Meal counts, Ceremony Attendance counts.

- [ ] **Step 2: Add 1-Click WhatsApp Reminder queue for pending RSVPs**

Provide a list of guests awaiting response with 1-tap WhatsApp nudge link:
`wa.me/{guestPhone}?text=Namaste {guestName}! Shahi Parivar cordially awaits your RSVP for the royal wedding...`

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors

- [ ] **Step 4: Commit Automations Hub enhancements**

```bash
git add src/components/Automation/AutomationCenterWorkspace.tsx src/components/PartnerDashboard/PartnerDashboard.tsx
git commit -m "feat(partner): add RSVP attendance metrics and 1-click WhatsApp reminder queue to Automations Hub"
```

---

### Task 8: Verification & Playwright Multi-Device Testing

**Files:**
- Create: `test_partner_business_os.py`
- Test: All 6 Hubs across Desktop (1440x900), Tablet (768x1024), and Mobile (390x844).

- [ ] **Step 1: Run TypeScript compiler check**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors

- [ ] **Step 2: Run Production Build**

Run: `npm run build`
Expected: Build succeeds with 0 errors

- [ ] **Step 3: Write and execute Playwright test suite**

Run Python Playwright script `test_partner_business_os.py` to verify:
1. Desktop navigation across all 6 hubs: Dashboard, Invitations, Clients, Finance, Automation, Profile.
2. Legacy hash backward compatibility (e.g., `#studio/commissions` routes to Finance, `#studio/branding` routes to Profile).
3. Mobile Slide-Over Drawer opens, displays 6 clean hubs, and navigates cleanly without overflow.
4. Capture high-resolution verification screenshots into artifact directory.

- [ ] **Step 4: Update test report artifact**

Update `webapp_test_report.md` with test results and screenshot links.

---

### Task 9: Production Deployment & Live Verification

- [ ] **Step 1: Commit all changes**

```bash
git add .
git commit -m "feat(partner): release Partner Studio Business OS with 6 consolidated hubs, WhatsApp dispatches, and wholesale margins"
```

- [ ] **Step 2: Push to GitHub**

```bash
git push origin master
```

- [ ] **Step 3: Verify Vercel production deployment**

Test live URL `https://amantranlink-web.vercel.app/partner` via Playwright to ensure zero production regressions.
