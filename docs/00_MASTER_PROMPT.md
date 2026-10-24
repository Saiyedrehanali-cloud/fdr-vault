# 00 — MASTER PROMPT (paste this into your new chat / Windsurf / OpenCode / Antigravity)

> Before pasting: put all `.md` files from this folder into your project root (or a `/docs` folder). Tell the agent to READ them first.

---

You are my **lead full-stack developer and architect**. I'm building a prototype for **Smart India Hackathon 2026 — PS SIH26265: "Streamline of Security Deposit / FDR Portal" (AICTE, Ministry of Education)**. Product name: **FinMatrix — AICTE Security Deposit & FDR Management Portal**.

## Context files (read ALL before writing code)
`01_PRD.md`, `02_TRD.md`, `03_APP_FLOW.md`, `04_UI_UX_DESIGN.md`, `05_DATABASE_AND_API.md`, `06_BUILD_PLAN_TASKS.md`, `07_TEST_AND_DEMO.md`.
These are the source of truth. If something conflicts, `01_PRD.md` wins on scope, `04_UI_UX_DESIGN.md` wins on visuals.

## Tech stack (locked)
- Next.js 14/15 (App Router) + TypeScript
- **Tailwind CSS v3.4** (pin v3 so `tailwind.config.ts` works — do NOT use Tailwind v4)
- `lucide-react` icons, `recharts` charts, `date-fns`, `zod`, `jose` (JWT cookie session), `bcryptjs`
- Next.js API Route Handlers (`app/api/**/route.ts`)
- SQLite via **Prisma 6** (store enums as `String`, validate with zod)
- Local file storage in `/storage/fdr-documents` (outside `/public`), served only through an authenticated API route

## Design system (EXACT colors — sampled from our brand palette image)
| Token | Hex | Use |
|---|---|---|
| `brand-dark-teal` | `#006675` | Sidebar, primary headers, text on light |
| `brand-teal` | `#00959C` | Verified/success, secondary buttons, links |
| `brand-light-teal` | `#4DC2C2` | Highlights, chart accents, info badges |
| `brand-yellow-orange` | `#FF9D2D` | Warning, Pending, hover states |
| `brand-orange` | `#F87C2B` | Secondary accent, "Expiring" mid-severity |
| `brand-burnt-orange` | `#EB5A11` | Critical alerts, Discrepancy, primary CTA buttons |
| `background` | `#F8FAFC` | Dashboard canvas |
| `surface` | `#FFFFFF` | Cards |
| `ink` | `#0F2A30` | Body text |

Also add tinted variants (50/100/200) for badge backgrounds. Font: **Plus Jakarta Sans** (UI) + **DM Serif Display** for the logo/page hero only (matches the serif feel of our palette art).

## Execution — do these in order, confirm after each
**Step 1** — Initialize Next.js (TS, App Router, ESLint, `src/` dir, NO default Tailwind v4): then install Tailwind v3.4, `lucide-react`, `recharts`, `date-fns`, `zod`, `jose`, `bcryptjs`, `prisma`, `@prisma/client`.
**Step 2** — Configure `tailwind.config.ts` with the palette above (colors + tints, fonts, card shadow, radius `xl/2xl`). Set up `globals.css` base styles.
**Step 3** — Copy the docs into `/docs`, and create root `prd.md` (short summary + schema; pointer to `/docs`) so context persists across sessions.
**Step 4** — Prisma schema from `05_DATABASE_AND_API.md`, run migration, write `prisma/seed.ts` with realistic demo data (see `07_TEST_AND_DEMO.md` §Seed Data).
**Step 5** — Auth: demo login page with role switch (AICTE Admin / Institution), JWT cookie, `middleware.ts` route protection.
**Step 6** — Build the **AICTE Admin Dashboard shell**: dark-teal left sidebar, top nav bar (search, alert bell, user menu), main area with the **4 summary cards** (Total FDRs, Expiring Soon, Pending Verification, Total Amount) wired to real DB data via `/api/dashboard/summary`.
**Step 7+** — Continue per `06_BUILD_PLAN_TASKS.md` (phases 2→6). Do not skip ahead; keep each phase demo-able.

## Rules
1. Keep it **hackathon-fast but demo-polished**. Working > perfect. No over-engineering.
2. Every page must have loading, empty, and error states.
3. Never expose files from `/public`. FDR PDFs only via `/api/documents/[id]`.
4. Always distinguish **"Submitted by Institution"** vs **"Confirmed by Bank"** data (core PS requirement).
5. Every state change writes an **AuditLog** row (hash-chained, see TRD).
6. Automated alerts are advisory — final decisions (verify / release) are by authorized human officials (a regulatory safeguard the PS stresses).
7. Mobile-responsive; sidebar collapses to a drawer.
8. After each step: list files created/changed, how to run, and what to test.

Begin with **Steps 1–3** now, then pause for my confirmation before Step 4.
