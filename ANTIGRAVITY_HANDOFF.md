# KUEXA Salon POS — Project Handoff Prompt (for Antigravity / any AI coding agent)

Copy everything below into your new agent to continue the project with full context.

---

## Role & goal
You are continuing a **UI-only React demo app** called **KUEXA** — a salon Point-of-Sale / appointments system. Everything uses **dummy data** (no backend, no API). Keep it that way unless told otherwise. Match the existing style and keep the UI **compact**.

## Project facts
- **Path:** `d:/Sazid/Github/kuexa_apt_billing`
- **Repo:** https://github.com/mohdsazidkhan/kuexa_apt_bill (branch `main`)
- **Live (Vercel, auto-deploy on push to main):** https://kuexa-apt-bill.vercel.app
- **Stack:** Vite + React (JavaScript, not TS) + Tailwind CSS v4 (`@tailwindcss/vite` plugin) + React Router DOM.
- **Run:** `npm install` then `npm run dev`. **Verify:** `npm run build` (do this ONCE after all edits, not repeatedly).
- `vercel.json` has an SPA rewrite (`/(.*) -> /index.html`) so route refresh doesn't 404.

## Folder structure
```
src/
  pages/        Appointments.jsx (route /appointment, default), Billing.jsx (/billing), Placeholder.jsx
  components/
    Sidebar.jsx           dark navy left nav
    TopBar.jsx            shared top navbar: <TopBar title="..." />
    KanbanBoard.jsx       appointments kanban (columns + cards)
    NewAppointmentModal.jsx   right-side "New Appointment" drawer
    GroupBookingModal.jsx     right-side "Group Booking" drawer (multi-guest)
    ClientDetailsDrawer.jsx   Transactions/Offers/Balances tabs
    ServiceModal.jsx      "Browse Select Items" drawer (Services/Products/Plans)
    RecentVisitsModal.jsx     past visits drawer
    AddCustomerModal.jsx      add-new-customer modal
    CustomerSearch.jsx        searchable customer picker (controlled: value+onChange)
    apptFields.jsx       SHARED: StylistSelect, AssistantSelect, SearchSelect, Field, cInput,
                         FUTURE_DATES, TIME_SLOTS, DEFAULT_TIME, kindMeta, tagStyle, itemToRow, emptyItem
    Icons.jsx            inline SVG icon set
  data/
    services.js          services, products, plans, stylists, customers, recentVisits, currency()
    appointments.js      kanbanColumns, appointments[], accentClasses, serviceStatuses
  App.jsx               routes + layout (sidebar + main)
```

## Design system / conventions (IMPORTANT — user enforces these)
- **Compact UI:** small fonts (`text-xs`, `text-[11px]`), tight paddings, group related fields into the **same row** where asked.
- **Labels:** column/field labels are **black + semibold** (`text-gray-900 font-semibold`), placeholders darker (`gray-600`).
- **Drawers:** all slide in from the **right**, `style={{ width: 'calc(100% - 16rem)' }}` (16rem = sidebar width), `fixed right-0 top-0 h-screen`, toggled via `translate-x-full` ↔ `translate-x-0`, `transition-transform duration-300`. Apply **`shadow-2xl` ONLY when open** (`open ? 'translate-x-0 shadow-2xl' : 'translate-x-full'`) — otherwise the off-screen shadow bleeds into the viewport.
- **Primary button color:** `bg-[#4a7196] hover:bg-[#3d6083]` (steel blue). Accent: indigo. Header CTA: `bg-[#3b5c7e]`.
- Currency via `currency()` from `data/services.js` (₹, en-IN).
- Build **once at the end** of a task, not repeatedly.

## Item type tags (used in appointment rows, browse, kanban)
Kinds: `service | product | plan`. Plans carry a `type`: **Membership / Package / Gift Card**. Row shows a `typeLabel` pill and a **tag-colored background**:
Service=indigo, Product=amber, Membership=emerald, Package=sky, Gift Card=rose. Helper: `tagStyle(tag)` in apptFields.jsx.

## Feature summary (already built)

### Appointments page (`/appointment`)
- Layout = **fixed top + scrollable board**: outer `flex h-screen flex-col overflow-hidden`; TopBar + header (title, stat chips, Refresh/Group Booking/New Appointment) + view tabs (Kanban/List/Scheduler/Stylist/Month/Day) + filter chip row are `shrink-0` (fixed); the board is `flex-1 overflow-y-auto`.
- Filter row has date filters (Today/This Week/All Dates), status filters (All/Scheduled/Confirmed/In Progress/Completed/No Show/Cancelled), All-stylists select, "N shown", and **up/down scroll arrows** (scroll board to top/bottom via refs).
- **Kanban:** 11 status columns in a **4-per-row grid** (`lg:grid-cols-4`), order:
  Row1 Scheduled, Checked-In, In Progress, Completed · Row2 Draft, Waiting, Rescheduled, Partial Advance · Row3 Cancelled, Full Advance, No Show.
  Each column: `border-t-[3px]` accent + tinted body + count badge. Accent colors in `accentClasses` (data/appointments.js) — magenta/brown/orange etc use arbitrary `bg-[#hex]` classes because Tailwind lacks those palettes.
  Each **card**: id + time, source + Billed/Not-Billed + High badge (same row), customer·gender·phone (same row), per-service `name · type-pill · stylist · date · time · price`, status dropdown + Not Billed + Total (same row), action buttons per column, and a **Bill** button (SKIP on Cancelled / No Show / Full Advance).
- List view = simple table of the same appointments.

### New Appointment drawer (opens from "New Appointment")
- It is a right-side drawer (NOT a full page). Empty by default; items added only via **Browse Select Items** (ServiceModal).
- **Section 1 (customer row):** CustomerSearch (searchable; if no match, an Add-Customer modal auto-opens pre-filling phone-vs-name) + Date + Time (both searchable dropdowns: future 90 days, 15-min AM/PM slots) + Home Service toggle + Recent Visits (only when a customer is selected). Selected customer's gender+phone show after the "Customer" label, and the header shows a customer chip (click → ClientDetailsDrawer).
- **Section 2 (items):** compact single-row table with column header once (Service/Item, Dur, Primary Stylist, Assistant(s), Date, Time, Price). Non-service items (product/plan) show only name+price (read-only). Each service row: Duration, **StylistSelect** (searchable single), **AssistantSelect** (searchable multi, hover shows selected), Date/Time (searchable), Price; remove (×) on every row. Totals row: `Total N (SERV-2, PROD-1, ...)` + duration total + price total, aligned to columns. Buttons: **Auto Assign Stylist** (round-robin), **Auto Sequence** (reorder modal or group-by-type), **Browse Select Items**.
- **Footer:** Take Payment Now toggle (ON → button becomes "Book and Pay Now" → navigate `/billing`), Cancel, Save as Waiting, Save as Draft, Book Appointment. Book opens a Confirm modal with **Walk-in / Phone radios** (mandatory, same row) + Remarks; confirm → success toast on the list.

### Group Booking drawer (opens from "Group Booking")
- Multi-client version of the appointment drawer. **Header tabs (top-right):** `All · N`, one tab per guest (name/label + item count + × remove), then **+ Add Guest** (creates a fresh dummy guest and switches to it). Default active = first guest.
- Each **guest tab** = the same editor as single New Appointment (customer row + items + totals + Browse + per-guest Auto Assign/Sequence). Use `key={guest.id}` on the editor so switching guests remounts fresh.
- **All tab:** 2-per-row summary cards; client name is **violet + underlined** (click → ClientDetailsDrawer); each service line shows `name · type · stylist · date · time` inline; per-guest subtotal.
- Header also has small **Auto Assign** + **Auto Sequence** buttons that apply to the active guest, or **all guests** when on the All tab.
- Footer = same buttons as single (Take Payment Now, Cancel, Save as Waiting, Save as Draft, Book Group Appointment).

### Client Details drawer (from customer chip in single, or client name in group All tab)
- Header: avatar + name + gender·phone. Tabs: **Transactions** (bills table: Bill#, Date, Total, Paid, Outstanding, Status), **Offers** (Loyalty/Cashback/Advance stat cards + Memberships/Packages/Gift Cards tables — all), **Balances** (same but only items with remaining balance > 0). Dummy data inside the component.

### Billing page (`/billing`)
- POS: left catalog (Services/Products/Plans tabs + category filter + search), right bill panel (customer search, bill items with qty/discount, coupon, subtotal → manual discount → 18% CGST+SGST → grand total, Collect Payment).

## How to continue / typical requests style
The user gives short Hinglish instructions with screenshots and iterates on UI details ("same row", "compact", "dark labels", "2 cards per row", "fixed header", etc.). Make the change, keep it consistent with the above, run a single `npm run build` to verify, and only `git push` when explicitly asked (Vercel deploys from `main`).

## Not yet built / possible next steps
Scheduler / Stylist / Month / Day-Calendar views are placeholders. No persistence/localStorage. No real payment/billing linkage. Everything is front-end dummy.
