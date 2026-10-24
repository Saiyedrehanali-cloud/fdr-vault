# 04 — UI / UX DESIGN SYSTEM

**Style:** Clean, modern B2B government-tech dashboard. Calm teal structure, warm orange for attention. Light canvas so colorful cards pop. Inspired by the "Abstract — minimal background" sunset-wave palette (orange → teal gradient bands).

## 1. Color Tokens (sampled from palette image)
```
dark-teal      #006675   Sidebar, headers, headings
teal           #00959C   Verified, success, secondary buttons, links
light-teal     #4DC2C2   Info, chart accent, subtle highlights
yellow-orange  #FF9D2D   Warning, Pending, hover
orange         #F87C2B   Expiring (high), secondary accent
burnt-orange   #EB5A11   Critical, Discrepancy, primary CTA
background     #F8FAFC   Page canvas
surface        #FFFFFF   Cards
ink            #0F2A30   Primary text
muted          #5B7480   Secondary text
border         #E2E8F0   Dividers
```
### Tints for badges (bg / text)
| Status | Bg | Text | Dot |
|---|---|---|---|
| Verified / Active | `#E0F5F5` | `#006675` | `#00959C` |
| Pending / Under review | `#FFF1DC` | `#9A5A00` | `#FF9D2D` |
| Expiring (≤30d) | `#FFE8D6` | `#B3470C` | `#F87C2B` |
| Critical / Overdue / Discrepancy | `#FDE3D6` | `#B2400A` | `#EB5A11` |
| Matured | `#EEF2F6` | `#475569` | `#94A3B8` |
| Released / Renewed | `#E6F7F7` | `#006675` | `#4DC2C2` |

### Tailwind config snippet
```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          "dark-teal": "#006675",
          teal: "#00959C",
          "light-teal": "#4DC2C2",
          "yellow-orange": "#FF9D2D",
          orange: "#F87C2B",
          "burnt-orange": "#EB5A11",
        },
        background: "#F8FAFC",
        surface: "#FFFFFF",
        ink: "#0F2A30",
        muted: "#5B7480",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-dmserif)", "serif"],
      },
      borderRadius: { xl: "14px", "2xl": "20px" },
      boxShadow: {
        card: "0 1px 2px rgba(15,42,48,.06), 0 4px 16px rgba(15,42,48,.06)",
        pop: "0 8px 30px rgba(0,102,117,.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

## 2. Typography
- **UI:** Plus Jakarta Sans (400/500/600/700). **Display (logo, login hero):** DM Serif Display.
- Scale: H1 28/36 · H2 22/30 · H3 18/26 · Body 14/22 · Small 12/18 · KPI number 32/40 bold.

## 3. Spacing, Radius, Elevation
8-pt grid. Cards: `rounded-2xl`, `shadow-card`, `p-5`. Inputs/buttons: `rounded-xl`, height 40 (sm 32, lg 48). Page gutter 24 (desktop) / 16 (mobile).

## 4. Layout — Admin Shell
```
┌────────┬──────────────────────────────────────────────────────┐
│ SIDEBAR│ TOP BAR: [☰] Search FDR / institution…  🔔(3) 👤 Admin │
│ 260px  ├──────────────────────────────────────────────────────┤
│ dark   │ Page title + breadcrumb            [Run Scan][Export] │
│ teal   │ ┌────────┐┌────────┐┌────────┐┌────────┐             │
│        │ │Total   ││Expiring││Pending ││Total   │  ← KPI cards │
│ logo   │ │FDRs    ││Soon    ││Verif.  ││Amount  │             │
│ nav    │ └────────┘└────────┘└────────┘└────────┘             │
│ items  │ ┌──────────────┐┌─────────────┐                      │
│        │ │Maturity bars ││Status donut │                      │
│ footer │ └──────────────┘└─────────────┘                      │
│ user   │ ┌ Expiring FDR table ┐┌ Recent activity ┐            │
└────────┴──────────────────────────────────────────────────────┘
```
### Sidebar
- Background `#006675`; logo block top (shield+rupee icon, "FDR Vault" in DM Serif, small "AICTE" tag).
- Nav items (Lucide): `LayoutDashboard` Dashboard · `Building2` Institutions · `FileText` All FDRs · `ShieldCheck` Verification (badge count) · `Undo2` Release Requests · `BellRing` Alerts · `BarChart3` Reports · `ScrollText` Audit Trail · `Settings` Settings.
- Item: white/80 text; hover `bg-white/10`; **active** = `bg-white/15` + 3px `#FF9D2D` left bar + white text.
- Bottom: user chip + logout. Decorative: subtle wave-curve SVG at the very bottom (orange→teal bands, 8% opacity) echoing the palette image.

### Top bar
White, h-16, border-b. Global search (⌘K style), alert bell with burnt-orange count dot, role pill ("AICTE Admin"), avatar menu.

## 5. KPI Cards (4-card summary)
| Card | Icon | Accent | Value | Sub-text |
|---|---|---|---|---|
| Total FDRs | `Landmark` | dark-teal | 128 | "+6 this month" |
| Expiring Soon (≤90d) | `CalendarClock` | **burnt-orange** | 14 | "5 within 30 days" |
| Pending Verification | `Hourglass` | **yellow-orange** | 9 | "Oldest: 6 days" |
| Total Amount | `IndianRupee` | **teal** | ₹ 42.6 Cr | "Across 64 institutions" |
Card anatomy: white surface, 4px top border in accent color, icon in 40px tinted rounded square, label (muted 13px), value (32px bold, ink), sub-text with trend chip. Hover: lift (`-translate-y-0.5`, `shadow-pop`). Format amounts in Indian system (`en-IN`, lakh/crore).

## 6. Components Spec
| Component | Spec |
|---|---|
| **Primary button (CTA)** | bg `#EB5A11`, white text, hover `#D44E0C`, focus ring `#FF9D2D` |
| **Secondary button** | bg `#00959C`, white text, hover `#007F85` |
| **Ghost/Outline** | border `#00959C`, text `#006675`, hover bg `#E0F5F5` |
| **Danger** | outline burnt-orange |
| **Status badge** | pill, dot + label, tints from §1 |
| **Source badge** | `Submitted` (gray, `UserRound` icon) vs `Bank-confirmed` (teal, `BadgeCheck`) vs `Mismatch` (burnt-orange, `AlertTriangle`) |
| **Data table** | sticky header `#F1F5F9`, row hover `#F8FAFC`, 20/page, sortable, row click → detail, days-to-maturity chip colored by severity |
| **Stepper / timeline** | vertical dots; done = teal filled, current = yellow-orange pulse, future = gray |
| **Alert item** | left color bar by severity, icon, title, FDR link, time, "Mark read" |
| **Toast** | bottom-right; success teal, warn yellow-orange, error burnt-orange |
| **File dropzone** | dashed border `#4DC2C2`, bg `#F0FBFB`, accepted: PDF ≤10MB |
| **Modal** | rounded-2xl, header dark-teal text, footer buttons right-aligned |
| **Skeleton** | slate-200 shimmer |

## 7. Charts (Recharts)
- **Maturity timeline** (bar, next 12 months): bars colored by severity bands; tooltip shows count + amount.
- **Status mix** (donut): Active teal · Expiring orange · Matured slate · Renewed light-teal · Released dark-teal · Pending yellow-orange.
- **Verification turnaround** (line, optional): avg days per week, teal line.
- Gridlines `#E2E8F0`, axis text `muted` 12px. Always provide legend + accessible labels.

## 8. Key Screens (wireframe notes)
1. **Login** — split screen: left = wave-gradient hero (orange→teal bands as CSS/SVG), "FDR Vault" in DM Serif, tagline "Every deposit. Tracked. Verified. Secured."; right = card with role toggle (Admin / Institution), email, password, quick "Demo login" chips.
2. **Admin Dashboard** — as §4.
3. **FDR List** — filters bar (Institution, Bank, Verification status, Lifecycle, Maturity range, Amount range), table, export CSV.
4. **FDR Detail** — header (Ref No., institution, status badges); left card "Instrument details" with source badges; right "Document viewer" (PDF iframe); below tabs: *Timeline · Flags · Bank Verification · Remarks · Renewal chain · Audit*. Sticky action bar for admin: **Verify with Bank · Mark Verified · Flag Discrepancy**.
5. **Verification Queue** — card/table hybrid with age chips and "Review" CTA.
6. **Release Requests** — kanban-lite columns (Requested / Under scrutiny / Approved / Released) or table with stepper.
7. **Alerts** — tabbed list with severity filter, bulk mark-read.
8. **Reports** — report type cards → preview table → Export CSV.
9. **Audit Trail** — table + "Verify chain integrity" button + result banner.
10. **Institution Portal Dashboard** — friendly: greeting, 4 cards (My FDRs, Expiring, Pending/Discrepancy needing action, Total deposited), "Action needed" list, big CTA "Submit New FDR".
11. **Submit FDR** — 3-step stepper form.

## 9. UX Principles
1. **Urgency by color** — burnt-orange = act now; yellow-orange = attention; teal = all good.
2. **Explain every flag** — show reason + evidence, never a bare red icon.
3. **Show source of truth** — Submitted vs Bank-confirmed everywhere.
4. **≤3 clicks** to verify, renew, or request release.
5. **Persistent filters** in URL.
6. **Human in the loop** — footer note on verification screens: "Automated flags are advisory; final decision rests with the competent authority."

## 10. Accessibility
Contrast: white on `#006675` ✓ AA; white on `#EB5A11` ✓ for large/bold text (use 600 weight, ≥14px); never rely on color alone (always icon + text in badges); focus ring 2px `#FF9D2D`; labels on all inputs; `aria-live` for toasts; keyboard-navigable tables/modals.

## 11. Motion
150–200ms ease-out; card hover lift; number count-up on dashboard load (optional); skeletons not spinners; respect `prefers-reduced-motion`.

## 12. Responsive
≥1024: fixed sidebar · 768–1023: icon-only sidebar · <768: drawer + stacked cards, tables become card lists.

## 13. Branding
Name **FDR Vault** · icon: shield with ₹ · tagline "Every deposit. Tracked. Verified. Secured." · Include "Prototype for SIH 2026 · PS SIH26265" in footer of login.
