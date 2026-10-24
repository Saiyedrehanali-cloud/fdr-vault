# 06 — BUILD PLAN & TASK CHECKLIST (vibe-coding friendly)

Give the agent **one phase at a time**. After each phase: run, click through, commit.
Suggested prompt per phase: *"Read /docs. Implement Phase N from 06_BUILD_PLAN_TASKS.md. Show files changed and how to test."*

## Phase 0 — Foundation (Steps 1–3 of master prompt)
- [ ] Next.js (TS, App Router, `src/`) + Tailwind v3.4 + lucide-react, recharts, date-fns, zod, jose, bcryptjs, prisma
- [ ] `tailwind.config.ts` with brand palette + fonts (`next/font`: Plus Jakarta Sans, DM Serif Display)
- [ ] `globals.css` base (bg `#F8FAFC`, text ink)
- [ ] `/docs` folder + root `prd.md`
- [ ] `.env.local`, `.gitignore` (storage, dev.db, .env*)

## Phase 1 — Data layer
- [ ] `schema.prisma` (doc 05) → `prisma migrate dev`
- [ ] `lib/db.ts` (singleton), `lib/utils.ts` (formatINR, dates, cn)
- [ ] `seed.ts`: users, 40 institutions, ~90 FDRs across all states, mock bank records (some mismatches), alert rules
- [ ] `lib/services/fdr.ts`: `computeLifecycle`, `daysToMaturity`, severity helpers

## Phase 2 — Auth & Shell  ✅ *first demo checkpoint*
- [ ] Login page (split screen, role chips, demo credentials)
- [ ] JWT session, `middleware.ts`, `requireRole`
- [ ] Admin layout: dark-teal sidebar, top bar, responsive drawer
- [ ] Admin dashboard: **4 KPI cards** from `/api/dashboard/summary`
- [ ] Charts: maturity bar + status donut; "Expiring soon" table; recent activity

## Phase 3 — Core FDR management
- [ ] Institution portal layout + dashboard
- [ ] Submit FDR (3-step form, dropzone, zod, encrypted upload) → `POST /api/fdrs`
- [ ] FDR list (admin + portal) with filters/pagination/URL state
- [ ] FDR detail page: data card with source badges, PDF viewer, timeline, tabs
- [ ] Document service: encrypt/decrypt, hash, secure serve route

## Phase 4 — Verification & Alerts  ✅ *second demo checkpoint (core PS)*
- [ ] Rule engine → DiscrepancyFlags (TRD §4.5)
- [ ] Verification queue + actions (start review, verify, discrepancy w/ reason, remarks)
- [ ] Mock bank adapter + "Verify with Bank" UI, source badges update
- [ ] Alert engine `scanAlerts()` (idempotent), "Run Scan" button, bell dropdown, Alerts page
- [ ] Escalation alerts to SENIOR_ADMIN

## Phase 5 — Renewal, Release, Audit, Reports
- [ ] Renewal flow + chain timeline
- [ ] Release request (portal) + admin scrutiny/approve/reject/mark-released + stepper tracker
- [ ] Audit hash chain (`logAudit` everywhere) + Audit page + Verify Integrity
- [ ] Reports page + CSV export (6 report types)
- [ ] Institutions page with risk score + profile

## Phase 6 — Polish & Demo Prep
- [ ] Loading skeletons, empty/error states, toasts
- [ ] Settings → alert thresholds editor
- [ ] Responsive pass, a11y pass (contrast, focus)
- [ ] Login hero wave artwork, favicon, metadata
- [ ] Seed "demo story" records (see doc 07)
- [ ] README with run steps; record 2–3 min demo video
- [ ] Final run of test scenarios (doc 07 §2)

## Cut-line if time is short
Must: Phases 0–4 + basic release + audit. Nice: renewal chain polish, reports beyond 3, settings page, integration stubs.

## Suggested Git commits
`feat: foundation` → `feat: data+seed` → `feat: auth+admin shell` → `feat: fdr submit+detail` → `feat: verification+alerts` → `feat: release+audit+reports` → `chore: polish`

## Handy agent prompts
- **Bug:** "Here is the error: … Fix without changing unrelated files."
- **UI polish:** "Match 04_UI_UX_DESIGN.md exactly for this screen; list any deviations."
- **Safety net:** "Before editing, summarize what you will change in 5 bullets."
