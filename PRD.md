# BOK — Product Requirements Document
**Version:** 1.0 (MVP)
**Stack:** React 18 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui (Radix UI) + Lucide icons
**Routing:** Custom client-side router via `useState` in `App.tsx` — no React Router
**State:** Local component state only (no global store)

---

## Product Overview

Bok is a Scandinavian-inspired invoicing and payment follow-up tool for freelancers and solopreneurs. Its primary value proposition is intelligent, automated follow-up — helping users get paid faster with less manual effort. The aesthetic is clean, minimal, and functional. Multi-currency support is required globally.

---

## Project Structure

```
src/
  app/
    App.tsx              — Root router, renders pages based on currentRoute state
    components/
      Sidebar.tsx        — Fixed left nav (220px), white bg, border-r
      Dashboard.tsx      — Composed of FinancialSnapshot, RecentInvoices, FollowUpIntelligence, QuickActions
      FinancialSnapshot.tsx
      FollowUpIntelligence.tsx
      RecentInvoices.tsx
      QuickActions.tsx
      InvoicesList.tsx
      InvoiceDetail.tsx
      CreateInvoice.tsx
      ProductLibrary.tsx
      ClientsList.tsx
      ClientDetail.tsx
      AddClient.tsx
      Reports.tsx
  styles/
    index.css            — Imports fonts.css, tailwind.css, theme.css
    theme.css            — CSS variables (shadcn/ui tokens + Bok overrides)
    fonts.css            — Font imports (Barlow Semi Condensed, Afacad)
  ui/                    — Full shadcn/ui component library (Radix-based)
```

---

## Navigation

Fixed left sidebar, 220px wide, white background with `border-r border-border`.

**Routes:**
| Path | Component |
|------|-----------|
| `/` | Dashboard |
| `/invoices` | InvoicesList |
| `/invoices/create` | CreateInvoice |
| `/invoice/:invoiceId` | InvoiceDetail |
| `/clients` | ClientsList |
| `/clients/add` | AddClient |
| `/clients/:clientId` | ClientDetail |
| `/reports` | Reports |

**Nav items:** Dashboard, Invoices, Clients, Reports
**Bottom:** User avatar (initials), name, logout icon
**Active state:** `bg-blue-500 text-white` on nav item

---

## Page 1 — Dashboard (`/`)

**Purpose:** Show urgency and actions needed right now.

**Layout:** 12-column grid. Main content left (col-span-9), Follow-Up panel right (col-span-3).

### Section A — Financial Snapshot (FinancialSnapshot.tsx)
4 KPI cards in a 4-column grid:
- Total Outstanding (blue icon)
- Total Invoiced (neutral icon)
- Payments Received (green icon)
- Overdue Amount (red icon — urgent)

Each card: icon, label, large currency value, trend indicator (↑/↓ % this month).

### Section B — Follow-Up Intelligence (FollowUpIntelligence.tsx)
**PRIMARY FOCUS.** Right sidebar panel (col-span-3).

Header: "Action Required"

3 follow-up cards stacked:
- Upcoming (blue status badge)
- Due Today (amber status badge)
- Overdue (red status badge — elevated urgency)

Each card:
- Client name (bold)
- Invoice ID (muted, small)
- Amount (bold, right-aligned)
- Status badge + follow-up date
- Action button (context-aware: Snooze / Mark as Paid / Send Reminder)
- More options (`MoreVertical` icon)

### Section C — Recent Invoices Feed (RecentInvoices.tsx)
Table with columns: Invoice ID | Client | Amount | Due Date | Status | Actions

Filter pills (decorative in dashboard, non-functional): Status | Client | Date

8 sample rows, alternating bg, clickable rows navigate to `/invoice/:id`

### Section D — Quick Actions (QuickActions.tsx)
3 buttons: [+ Create Invoice] (primary, blue) | [+ Add Client] (outlined) | [View Reports] (ghost)

---

## Page 2 — Invoices (`/invoices`)

**Purpose:** Full workspace for creating and managing invoices.

### Invoice List View (InvoicesList.tsx)

**Top bar:** Title + search input + [+ Create Invoice] CTA

**Filters (all functional with dropdown state):**
- Status: All Statuses / Draft / Upcoming / Due Today / Overdue / Paid
- Client: Searchable list of clients
- Date Range: All Time / Today / This Week / This Month / Last 30 Days / Last Quarter
- Sort: Newest First / Oldest First / Amount High→Low / Amount Low→High / Due Date Soonest / Due Date Latest / Client A–Z / Client Z–A

Active filter = pill fills blue with × clear button. All filters combinable. "Clear all filters" link appears when any active.

Empty state: "No results found" + [Clear filters] CTA.

**Table columns:** Invoice ID (clickable → detail) | Client | Amount | Due Date | Status badge | Reminder Status | Actions (Edit, Copy, Eye, MoreVertical)

**Status badges:**
- Draft: `bg-slate-100 text-slate-700`
- Upcoming: `bg-blue-100 text-blue-700`
- Due Today: `bg-amber-100 text-amber-700`
- Overdue: `bg-red-100 text-red-700`
- Paid: `bg-green-100 text-green-700`

### Create Invoice (`/invoices/create`) — CreateInvoice.tsx

Sections (white cards, `border-[0.5px] border-border`, `rounded-xl`):

1. **Client** — dropdown select + [+ New Client] link
2. **Line Items** — editable table (Description, Qty, Unit Price, Total) + [Choose from Library] + [+ Add Line Item]
3. **Calculations** — Subtotal, Tax toggle (7.5% VAT), Total (auto-calculated)
4. **Details** — Due Date (date input), Notes (textarea)
5. **Reminders & Follow-Up** — 4 toggle checkboxes (3 days before / on due date / 3 days overdue / 7 days overdue), Escalation rule dropdown, Message template selector (Friendly / Firm / Final Notice)

Actions: [Save Draft] (outlined) + [Send Invoice] (primary blue)

### Product Library Modal (ProductLibrary.tsx)

Triggered from Create Invoice via "Choose from Library".
Full-screen overlay (`fixed inset-0 bg-black/50`).
Modal: white, max-w-2xl, scrollable list.
Each item: name, type badge (Flat/Hourly/Recurring), price, [Add to Invoice] button.
Recurring items show `RefreshCw` icon.

### Invoice Detail (`/invoice/:invoiceId`) — InvoiceDetail.tsx

Shows: breadcrumb, invoice header with status badge, Billed From/To, line items table, payment summary, activity log, notes.

Actions: [Send Reminder] | [Mark as Paid] | [Download PDF] | [More ▾]

Activity log: timeline of invoice created → sent → reminders → paid.

---

## Page 3 — Clients (`/clients`)

**Purpose:** Payment behaviour view.

### Client List (ClientsList.tsx)

Top bar: Title + search + [+ Add Client]

Summary stats row: Total Clients | With Outstanding Balances | High Risk

Table: Name | Business | Total Invoiced | Outstanding Balance | Payment Status | Actions

Payment status badges: Reliable (green) / Slow Payer (amber) / At Risk (red)

Actions per row: Eye (→ detail), Edit, MoreVertical

### Client Detail (`/clients/:clientId`) — ClientDetail.tsx

**Layout:** 12-col grid. Left (col-span-8) main content, Right (col-span-4) behavioral insights.

**Header:** Client name, business, email, phone, outstanding badge, payment status badge.
Actions: [Send Invoice] | [Send Reminder] | [Add Note]

**Tabs:** Contact Info | Invoice History | Payment History | Reminder History | Notes
Active tab: `border-b-2 border-blue-500 text-blue-600`

**Behavioral Insights sidebar card:**
- "Usually pays after 2 reminders" (blue icon)
- "Average payment delay: 5 days past due" (amber icon)
- "Risk level: Medium" (red icon)
- "On-time payment rate: 43%" (green icon)

### Add Client (`/clients/add`) — AddClient.tsx

**Layout:** 12-col grid. Left (col-span-8) form, Right (col-span-4) AI Assistant sidebar (sticky).

Form sections:
1. Basic Information — name, contact person, email, phone, client type (Individual/Business/Agency/Vendor toggle)
2. Billing Information — address, city, state, country, postal code, tax ID
3. Payment Preferences — currency dropdown, payment terms, payment method toggles
4. Notes & Internal Data — textarea (500 char limit), tags (add/remove/suggest), client status (Active/Pending/Blocked)

**AI Assistant sidebar:** Generate summary, Check for duplicates, Smart suggestion card, Auto-save notice.

**Sticky footer:** Cancel | [Save as Draft] | [Add Client]

Unsaved changes guard: `confirm()` dialog on navigate away.

---

## Page 4 — Reports (`/reports`)

**Purpose:** Show system and follow-up performance.

### Header
Title + filter row: Date Range | Client | Status (all functional dropdowns)
Export: [↓ PDF] | [↓ CSV]
Clear all filters link when any active.

### Revenue Overview
Monthly / Quarterly / Yearly toggle buttons.
Custom bar chart (not Recharts — pure divs with dynamic height %).
Blue bars = invoiced, Green bars = collected.
Hover tooltips on bars.
Legend below chart.
Summary stats: Total Invoiced | Collected | Outstanding

### Invoice Performance (left panel)
- Average payment time: 8.3 days
- Paid vs Overdue donut chart (SVG, 72% paid / 28% overdue)
- Outstanding revenue
- Longest outstanding invoice (highlighted red card)

### Follow-Up Effectiveness (right panel) — CRITICAL METRIC
- 68% paid after first reminder (green card)
- 2.3 average reminders per invoice (neutral card)
- 41% escalation success rate (amber card)
- Best performing template badge
- Horizontal bar chart: Reminder 1 → 2 → 3 → Escalation with % dropout

---

## UI Patterns & Component Rules

### Cards
`bg-white rounded-xl border-[0.5px] border-border` — used for all content sections.
Padding: `p-6` standard, `p-3` compact (dashboard widgets).

### Buttons
- Primary: `bg-blue-500 text-white hover:bg-blue-600`
- Outlined: `border border-slate-300 text-slate-700 hover:bg-slate-50`
- Ghost: `text-slate-700 hover:bg-white`
- Danger: `bg-red-500 text-white`

### Status Badges
All pill-shaped: `px-3 py-1 rounded-full text-xs font-medium`

### Tables
- Header row: `bg-slate-50` with `text-sm font-semibold text-slate-700`
- Alternating rows: `bg-white` / `bg-slate-50/30`
- Hover: `hover:bg-slate-50`
- Border: `border-b border-slate-100`

### Dropdowns
Custom-built (not shadcn Select) using `useRef` + `useEffect` click-outside handler.
`absolute top-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10`

### Forms
All inputs: `border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`

### Grid System
12-column grid (`grid grid-cols-12 gap-4` or `gap-6`) used throughout.

---

## Data

All data is currently hardcoded mock data within each component. No API calls, no global store. Each component owns its own local state.

**Key mock clients:** Acme Ltd, Bright Media Agency, Lagos Prints Co, Kemi Stores, TechBuild NG, Olaolu Ventures

**Key mock invoices:** INV-0055 (Due Today), INV-0041 (Upcoming), INV-0038 (Overdue), INV-0030 (Paid), INV-0021 (Draft), INV-0018 (Upcoming)

---

## Not Yet Implemented (Future)

- Real authentication / user profiles
- API integration / persistent data
- Receipt generation (post-payment)
- Actual email/SMS reminder sending
- Dark mode (CSS variables are prepared in theme.css)
- Mobile responsive layout
- Real AI assistant features in AddClient
