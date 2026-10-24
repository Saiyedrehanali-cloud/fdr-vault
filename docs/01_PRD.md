# 01 — PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Product:** FinMatrix — Centralized Security Deposit / FDR Management Portal
**PS:** SIH26265 · Organization: AICTE · Category: Software · Theme: Smart Automation
**Version:** 1.0 · **Owner:** Team Zeven · **Deadline:** 28 Oct 2026 (idea submission)

---

## 1. Problem Summary
Technical institutions submit Security Deposits / Fixed Deposit Receipts (FDRs) to AICTE as part of approval & compliance. Today records are fragmented across spreadsheets, letters and emails. Result: no single accurate view of deposit status, missed maturity/renewal dates, slow verification, and slow release/refund handling.

## 2. Vision
One secure portal where **every FDR is tracked from submission to release** — verified, monitored, alerted, audited.

## 3. Goals & Success Metrics (prototype must demonstrate)
| Goal | Metric (demo-able) |
|---|---|
| Record accuracy | % of records with complete mandatory fields; discrepancy auto-flag count |
| Verification turnaround | Avg. time Pending → Verified (shown on dashboard) |
| Timely renewal monitoring | % of expiring FDRs alerted ≥30 days in advance |
| Less manual effort | Auto-generated alerts + reports vs. manual tracking |
| Visibility | Single dashboard of Active / Expiring / Matured / Renewed / Released / Pending |

## 4. Users & Roles
| Role | Who | Can do |
|---|---|---|
| **AICTE Admin** (Regulation Bureau officer) | AICTE staff | View all institutions/FDRs, verify docs, flag discrepancies, record scrutiny remarks, approve/reject release, configure reminders, export reports, view audit trail |
| **Institution** | College nodal officer | Submit FDRs + PDFs, view own FDRs, respond to discrepancies, submit renewal/replacement, request release/refund, track status |
| **Super Admin** *(optional stretch)* | AICTE IT | Manage users, alert rules, view full audit |

## 5. Scope — MVP (must ship)
| # | Feature (maps to PS capability) | Priority |
|---|---|---|
| F1 | **Centralized repository** — institution-wise & instrument-wise FDR records (ref no., bank, branch, amount, issue date, maturity date, status) | P0 |
| F2 | **Digital document management** — secure PDF upload, versioned history, view/download with authorization | P0 |
| F3 | **Verification workflow** — `Pending → Under Review → Verified / Discrepancy`; scrutiny remarks; incomplete-record detection | P0 |
| F4 | **Source distinction** — fields tagged *Institution-submitted* vs *Bank-confirmed* (simulated bank verification API) | P0 |
| F5 | **Automated validity & maturity tracking** — computed status: Active, Expiring (≤90d), Matured/Expired, Renewed, Released | P0 |
| F6 | **Automated alerts & escalation** — configurable thresholds (90/60/30/15/7 days), overdue flag, escalation to senior officer if unresolved | P0 |
| F7 | **Renewal / replacement monitoring** — link new FDR to old one; full history chain | P1 |
| F8 | **Release / refund workflow** — Request → Scrutiny → Approve/Reject → Released; status tracker for institution | P0 |
| F9 | **Dashboard & reports** — KPI cards, charts, filters, CSV export (pending verifications, upcoming maturities, missing docs) | P0 |
| F10 | **Audit trail & RBAC** — hash-chained audit log, role-based access, document encryption at rest | P0 |
| F11 | **Integration readiness** — documented REST API + mock Bank Verification adapter + AICTE Permanent-ID lookup stub | P1 |

### Out of scope (state in pitch as "future")
Real bank API integration, real AICTE SSO/DigiLocker, payment processing, OCR/AI forgery detection (mention as Phase 2 roadmap), multi-language UI.

## 6. User Stories (with acceptance criteria)
**US-1 Institution submits FDR** — *As an institution officer, I submit an FDR with details and PDF.*
AC: required fields validated; PDF ≤10 MB, type `application/pdf` only; status becomes `PENDING`; admin notified; audit logged.

**US-2 Admin verifies FDR** — *As an AICTE officer, I review submitted data & PDF and mark Verified or Discrepancy.*
AC: side-by-side view of data + PDF; discrepancy requires a reason; institution notified; status change audit-logged.

**US-3 Bank confirmation** — *As an admin, I click "Verify with Bank" to cross-check details.*
AC: mock API returns MATCH / MISMATCH (field-level) / UNAVAILABLE; result stored with source + timestamp; mismatches auto-flag discrepancy.

**US-4 Expiry alerts** — *As an admin/institution, I get alerts before FDR maturity.*
AC: alerts generated at configured thresholds; no duplicate alert for same FDR+threshold; overdue ones flagged red; unresolved after N days escalate.

**US-5 Renewal** — *As an institution, I submit a renewal FDR against an expiring one.*
AC: new FDR linked as `renewalOf`; old FDR status → `RENEWED` once new one is verified; history shown as timeline.

**US-6 Release request** — *As an institution, I request release of a matured/obsolete FDR.*
AC: only allowed if FDR is Verified and (Matured or approval-condition met flag); admin approves/rejects with remarks; status tracker visible to institution; final status `RELEASED`.

**US-7 Dashboard** — *As an admin, I see all KPIs at a glance and drill down.*
AC: cards (Total FDRs, Expiring Soon, Pending Verification, Total Amount), status donut, maturity timeline bar chart, recent activity, filters persist in URL.

**US-8 Audit** — *As an admin, I can view an immutable audit trail and verify its integrity.*
AC: every action logged with actor, time, before/after; "Verify chain integrity" button returns OK/Tampered.

## 7. Business Rules
1. **Status (computed from dates + workflow):**
   - `verificationStatus`: PENDING | UNDER_REVIEW | VERIFIED | DISCREPANCY
   - `lifecycleStatus`: ACTIVE | EXPIRING | MATURED | RENEWED | RELEASE_REQUESTED | RELEASED
   - EXPIRING = maturityDate within next 90 days and not renewed/released. MATURED = maturityDate < today.
2. FDR reference number must be unique per bank.
3. Maturity date must be > issue date; amount > 0.
4. Release request allowed only if `verificationStatus = VERIFIED`.
5. Only one open release request per FDR.
6. Institutions only see their own data (row-level check on every query).
7. Alerts are advisory; verification/release decisions are made by humans.

## 8. Non-Functional Requirements
Security (RBAC, encrypted file storage, audit, input validation) · Performance (dashboard <2s on 1,000 FDRs) · Usability (≤3 clicks to key actions) · Accessibility (WCAG AA contrast, keyboard nav) · Responsiveness (desktop-first, tablet/mobile OK) · Explainability (every flag shows reason).

## 9. Innovation / Differentiators (for judges)
1. **Dual-source truth** — "Submitted vs Bank-Confirmed" badges per field.
2. **Hash-chained audit log** (tamper-evident; tied to our Data Integrity research).
3. **Smart discrepancy engine** — rule-based checks (date logic, duplicate ref no., amount mismatch, expired at submission, missing docs).
4. **Escalation ladder** — alert → reminder → escalate to senior officer.
5. **Risk score** per institution (count of overdue/discrepant FDRs).
6. **Integration-ready** — OpenAPI-style endpoints + bank adapter interface.

## 10. Risks & Mitigations
| Risk | Mitigation |
|---|---|
| No real bank API | Mock adapter with clear interface; pitch real integration path (bank APIs / e-FDR / NeSL-style verification) |
| Time limit | Strict phased plan (doc 06); P1 items optional |
| Demo data looks fake | Seed 40+ realistic institutions/FDRs with varied states |
