# 06 — BUILD PLAN & TASK CHECKLIST (vibe-coding friendly)

Give the agent **one phase at a time**. After each phase: run, click through, commit.
Suggested prompt per phase: *"Read /docs. Implement Phase N from 06_BUILD_PLAN_TASKS.md. Show files changed and how to test."*

## Phase 0 — Foundation (Steps 1–3 of master prompt) ✅ COMPLETED
- [x] Next.js (TS, App Router, `src/`) + Tailwind v3.4 + lucide-react, recharts, date-fns, zod, jose, bcryptjs, prisma
- [x] `tailwind.config.ts` with brand palette + fonts (`next/font`: Plus Jakarta Sans, DM Serif Display)
- [x] `globals.css` base (bg `#F8FAFC`, text ink)
- [x] `/docs` folder + root `prd.md`
- [x] `.env.local`, `.gitignore` (storage, dev.db, .env*)

## Phase 1 — Data layer ✅ COMPLETED
- [x] `schema.prisma` (doc 05) → `prisma migrate dev` / `db push`
- [x] `lib/db.ts` (singleton), `lib/utils.ts` (formatINR, dates, cn)
- [x] `seed.ts`: users, 40 institutions, ~90 FDRs across all states, mock bank records (some mismatches), alert rules
- [x] `lib/services/fdr.ts`: `computeLifecycle`, `daysToMaturity`, severity helpers

## Phase 2 — Auth & Shell ✅ COMPLETED
- [x] Login page (split screen, role chips, demo credentials)
- [x] JWT session, `middleware.ts`, `requireRole`
- [x] Admin layout: dark-teal sidebar, top bar, responsive drawer
- [x] Admin dashboard: **4 KPI cards** from `/api/dashboard/summary`
- [x] Charts: maturity bar + status donut; "Expiring soon" table; recent activity

## Phase 3 — Core FDR management ✅ COMPLETED
- [x] Institution portal layout + dashboard
- [x] Submit FDR (3-step form, dropzone, zod, encrypted upload) → `POST /api/fdrs`
- [x] FDR list (admin + portal) with filters/pagination/URL state
- [x] FDR detail page: data card with source badges, PDF viewer, timeline, tabs
- [x] Document service: encrypt/decrypt, hash, secure serve route

## Phase 4 — Verification & Alerts ✅ COMPLETED
- [x] Rule engine → DiscrepancyFlags (TRD §4.5)
- [x] Verification queue + actions (start review, verify, discrepancy w/ reason, remarks)
- [x] Mock bank adapter + "Verify with Bank" UI, source badges update
- [x] Alert engine `scanAlerts()` (idempotent), "Run Scan" button, bell dropdown, Alerts page
- [x] Escalation alerts to SENIOR_ADMIN

## Phase 5 — Renewal, Release, Audit, Reports ✅ COMPLETED
- [x] Renewal flow + chain timeline
- [x] Release request (portal) + admin scrutiny/approve/reject/mark-released + stepper tracker
- [x] Audit hash chain (`logAudit` everywhere) + Audit page + Verify Integrity
- [x] Reports page + CSV export (6 report types)
- [x] Institutions page with risk score + profile

## Phase 6 — Polish & Demo Prep ✅ COMPLETED
- [x] Loading skeletons, empty/error states, toasts
- [x] Settings → alert thresholds editor
- [x] Responsive pass, a11y pass (contrast, focus)
- [x] Login hero wave artwork, favicon, metadata
- [x] Seed "demo story" records (see doc 07)
- [x] README with run steps; recorded browser demo video walkthrough
- [x] Final run of test scenarios (doc 07 §2 T1–T15)
- [x] Interactive Presentation Pitch Deck at `/pitch`
- [x] Live Cryptographic Tampering Simulation widget for hackathon jury demonstration

## Cut-line if time is short
Must: Phases 0–4 + basic release + audit. Nice: renewal chain polish, reports beyond 3, settings page, integration stubs.

## Suggested Git commits
`feat: foundation` → `feat: data+seed` → `feat: auth+admin shell` → `feat: fdr submit+detail` → `feat: verification+alerts` → `feat: release+audit+reports` → `chore: polish`

## Handy agent prompts
- **Bug:** "Here is the error: … Fix without changing unrelated files."
- **UI polish:** "Match 04_UI_UX_DESIGN.md exactly for this screen; list any deviations."
- **Safety net:** "Before editing, summarize what you will change in 5 bullets."
