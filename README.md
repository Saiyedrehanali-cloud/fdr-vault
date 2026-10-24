# FDR Vault — Streamline of Security Deposit & FDR Portal
> **Smart India Hackathon 2026** · Problem Statement: **SIH26265**  
> **Theme:** Smart Automation · **Organization:** All India Council for Technical Education (AICTE), Ministry of Education  
> **Tagline:** *Every deposit. Tracked. Verified. Secured.*

---

## 🏛️ Executive Summary

AICTE currently monitors thousands of Fixed Deposit Receipts (FDRs) pledged by technical institutions nationwide as mandatory security deposits for course approvals. Managing these instruments via fragmented regional spreadsheets creates severe vulnerabilities:
- **Zero Real-Time Visibility:** Matured deposits sit unattended for months without automated alerts.
- **Verification Bottlenecks:** No instant cross-referencing between institutional claims and Core Banking System (CBS) records.
- **Tampering & Audit Vulnerability:** Unprotected document uploads and non-verifiable change histories.

**FDR Vault** transitions AICTE into an automated, tamper-evident, dual-source regulatory clearinghouse with automated 90-60-30-15-7 day countdown matrix alerts, encrypted document enclaves, scheduled commercial bank cross-checks, and an immutable HMAC-SHA256 audit chain.

---

## ⚡ Key Highlights & Core Capabilities

1. **Dual-Source Presentation (Institution Claim vs. Bank Core Record):**
   - Every instrument parameter displays visual badges: `Submitted` (gray), `Bank-confirmed` (teal), or `Mismatch` (burnt-orange).
   - Mock Bank Adapter simulates Finacle/BaNCS CBS queries to detect unauthorized encashment or parameter mismatches instantly.

2. **Automated 5-Stage Alert Surveillance Engine:**
   - Idempotent alert generator tracking 90d, 60d, 30d, 15d, and 7d maturity horizons.
   - Automatic escalation to Senior Administration (`SENIOR_ADMIN`) for overdue or non-renewed deposits.

3. **Tamper-Evident HMAC-SHA256 Audit Trail:**
   - Cryptographically chained hash graph linking every state change (submissions, bank verifications, discrepancy flags, release approvals, and document views).
   - 1-Click **"Verify Chain Integrity"** button recomputes cryptographic signatures from genesis hash to guarantee non-repudiation.

4. **AES-256-GCM Encrypted Document Enclave:**
   - Original scanned deposit certificates are encrypted at rest outside `/public` at `/storage/fdr-documents`.
   - Served exclusively via authenticated streaming route `/api/documents/:id` with mandatory RBAC ownership validation.

5. **End-to-End Stepper Workflows:**
   - **Renewal Chaining:** Expiring deposits trigger pre-filled renewal applications linking parent and child instruments (`oldFDR -> newFDR`).
   - **Release & Refund Stepper:** 4-stage pipeline (`REQUESTED -> UNDER_SCRUTINY -> APPROVED -> RELEASED`) with automated discharge voucher generation.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router, Server & Client Components, TypeScript)
- **Styling:** Tailwind CSS v3.4 (Strictly pinned design tokens: `brand-dark-teal` `#006675`, `brand-teal` `#00959C`, `brand-burnt-orange` `#EB5A11`, `brand-yellow-orange` `#FF9D2D`)
- **Typography:** DM Serif Display (headings & brand) + Plus Jakarta Sans (UI data)
- **Database & ORM:** Prisma 6 with SQLite (`file:./dev.db`)
- **Cryptography & Auth:** `crypto` (AES-256-GCM, HMAC-SHA256), `jose` (stateless encrypted JWT session `fdr_session`), `bcryptjs`
- **Visuals & Charts:** Lucide React icons, Recharts

---

## 👥 Demo Personas & Credentials

All seeded accounts use password: **`Demo@1234`** (or 1-click quick login chips on `/login`):

| Persona | Role | Email | Scope of Access |
|---|---|---|---|
| **Dr. Rajesh Sharma** | `ADMIN` | `admin@aicte.demo` | Regulation Bureau: Dashboard, Queue, Verify, Flag Discrepancy, Releases, Reports |
| **Smt. Sunita Rao** | `SENIOR_ADMIN` | `senior@aicte.demo` | Executive Bureau: Escalation alerts, Policy overrides, Tamper audit verification |
| **Prof. Anand Verma** | `INSTITUTION` | `rgpv.college@demo.in` | Nodal Officer (Demo Inst. of Tech, Bhopal): Submit FDR, Renew, Request Release |

---

## 🚀 Quickstart & Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Push Prisma database schema
npx prisma db push

# 3. Seed repository with 40 institutions and 90 realistic FDRs
npx prisma db seed

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📋 Comprehensive Test Scenario Verification (Doc 07 §2)

| # | Test Scenario | Verified Behavior |
|---|---|---|
| **T1** | **New FDR Submission** | Dropzone PDF upload + 3-step wizard creates record in `PENDING` state with encrypted AES storage and audit log entry. |
| **T2** | **Validation Guards** | Blocks non-PDF files, files >10MB, maturity dates earlier than issue date, and negative amounts. |
| **T3** | **Dynamic Validity Tracking** | Severity badges calculate exact countdown days: Green (>90d), Yellow (31-90d), Orange (8-30d), Red (≤7d), Overdue (<0d). |
| **T4** | **Automated Alert Scan** | `POST /api/alerts/scan` generates non-duplicate alerts at 90/60/30/15/7 thresholds with bell icon badge increment. |
| **T5** | **Senior Admin Escalation** | Overdue deposits automatically generate critical red alerts routed to `SENIOR_ADMIN`. |
| **T6** | **Bank Verification (Match)** | Mock Bank Adapter queries Core Banking System; matches update source badge to `Bank-confirmed` and marks verified. |
| **T7** | **Discrepancy Identification** | Planted anomaly records detect amount divergences; admin flags discrepancy with mandatory justification. |
| **T8** | **Document Integrity** | Secure streaming endpoint `/api/documents/:id` logs `DOCUMENT_VIEWED` audit entry on every view. |
| **T9** | **Deposit Renewal Chaining** | Chained submission transitions previous instrument to `RENEWED` upon verification of new deposit. |
| **T10** | **Release & Refund Pipeline** | 4-step stepper (`Requested -> Scrutiny -> Approved -> Released`) generates official voucher `AICTE/REL/2026/XXXX`. |
| **T11** | **Release Gatekeeping** | Unverified or unapproved deposits are blocked from release requests. |
| **T12** | **Role-Based Access Control** | Middleware redirects unauthorized requests; institutions can only access their own instruments. |
| **T13** | **Audit Hash Chain Integrity** | Interactive integrity check validates hash pointers and HMAC signatures across all records. |
| **T14** | **Statutory Reports Export** | 6 statutory report formats preview in real-time and stream CSV downloads with UTF-8 encoding. |
| **T15** | **Responsive Layout** | Mobile drawer, collapsible navigation, and card stacks verified on standard mobile viewports. |

---

## 📈 Projected Real-World Impact for AICTE

- **100% Elimination of Spreadsheets:** Zero reliance on unversioned Excel trackers across 8 regional offices.
- **Turnaround Reduction:** Verification time reduced from **~7+ working days** to **< 48 hours**.
- **Zero Unnoticed Expiries:** 100% of maturing deposits flagged ≥90 days in advance with automatic escalation.
- **Tamper-Evident Accountability:** Cryptographic proof guaranteeing institutional deposits cannot be secretly encashed or altered.
