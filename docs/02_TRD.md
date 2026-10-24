# 02 — TECHNICAL REQUIREMENTS DOCUMENT (TRD)

## 1. Architecture Overview
```
┌──────────────────────────── Browser ────────────────────────────┐
│  Next.js App Router (React Server + Client Components)          │
│  Tailwind · Lucide · Recharts                                    │
└───────────────┬──────────────────────────────────────────────────┘
                │ fetch / Server Actions
┌───────────────▼──────────────────────────────────────────────────┐
│ Next.js Route Handlers  /api/*                                    │
│  ├─ auth (JWT cookie, jose)         ├─ alerts engine (service)    │
│  ├─ fdr / documents / verification  ├─ bank adapter (mock)        │
│  ├─ release workflow                ├─ audit service (hash chain) │
│  └─ reports (CSV)                   └─ RBAC guard                 │
└───────────────┬───────────────────────────┬──────────────────────┘
                │ Prisma                     │ fs (encrypted)
        ┌───────▼───────┐            ┌───────▼────────────┐
        │ SQLite dev.db │            │ /storage/fdr-docs  │
        └───────────────┘            └────────────────────┘
```
Monolith by design (hackathon speed). Service logic lives in `src/lib/services/*` so it can later be split out.

## 2. Tech Stack
| Layer | Choice | Note |
|---|---|---|
| Framework | Next.js 14/15 App Router, TypeScript | |
| Styling | Tailwind **v3.4** + custom tokens | v4 has no `tailwind.config.ts` by default |
| Icons / Charts | lucide-react / recharts | |
| DB / ORM | SQLite + Prisma 6 | enums as strings |
| Validation | zod | shared schemas client+server |
| Auth | `jose` JWT in httpOnly cookie, `bcryptjs` | demo-grade, documented upgrade path to AICTE SSO |
| Dates | date-fns | |
| Files | Node `fs` + AES-256-GCM encryption | key from `.env` |

## 3. Folder Structure
```
/docs                      ← all .md context files
/prisma  schema.prisma  seed.ts
/storage/fdr-documents     ← encrypted blobs (git-ignored)
/src
  /app
    /(auth)/login/page.tsx
    /(admin)/admin/
        layout.tsx  (sidebar + topbar)
        page.tsx            → dashboard
        institutions/       → list, [id]
        fdrs/               → list, [id]
        verification/       → queue
        releases/           → requests queue
        alerts/
        reports/
        audit/
        settings/           → alert rules
    /(institution)/portal/
        layout.tsx  page.tsx (dashboard)
        fdrs/ (list, new, [id])
        releases/
        alerts/
    /api/...                → see doc 05
  /components  /ui  /dashboard  /fdr  /layout
  /lib
    db.ts  auth.ts  rbac.ts  crypto.ts  audit.ts  utils.ts
    /services  fdr.ts  alerts.ts  verification.ts  bank.ts  release.ts  reports.ts
  /types
middleware.ts
.env.local
```

## 4. Key Technical Designs

### 4.1 Authentication & RBAC
- `POST /api/auth/login` → verify bcrypt → sign JWT `{userId, role, institutionId}` (8h) → httpOnly, SameSite=Lax cookie.
- `middleware.ts`: `/admin/**` requires `ADMIN|SUPER_ADMIN`; `/portal/**` requires `INSTITUTION`; `/api/**` (except login) requires session.
- `requireRole(roles)` helper in every route handler. Institution queries ALWAYS append `where: { institutionId: session.institutionId }`.

### 4.2 Computed Lifecycle Status
Never trust stored status for time-based states. Compute in `lib/services/fdr.ts`:
```ts
function computeLifecycle(f: FDR, today = new Date()): Lifecycle {
  if (f.releasedAt) return "RELEASED";
  if (f.releaseRequested) return "RELEASE_REQUESTED";
  if (f.renewedById) return "RENEWED";
  const days = differenceInCalendarDays(f.maturityDate, today);
  if (days < 0) return "MATURED";
  if (days <= 90) return "EXPIRING";
  return "ACTIVE";
}
```
`daysToMaturity` returned in every FDR DTO. Severity: `>90 ok · 31–90 warning(yellow-orange) · 8–30 high(orange) · ≤7 or overdue critical(burnt-orange)`.

### 4.3 Alert Engine
- Thresholds table `AlertRule` (default 90, 60, 30, 15, 7 days; overdue; escalation after 7 days unresolved).
- `scanAlerts()` iterates non-released FDRs, creates `Alert` rows if `(fdrId, type, threshold)` not already present (unique index → idempotent).
- Triggered by: (a) `POST /api/alerts/scan` (Admin "Run scan now" button, great for live demo), (b) dashboard load (cheap lazy scan, throttled to once/5 min via in-memory timestamp), (c) optional `node-cron` in dev.
- Alert types: `EXPIRING`, `OVERDUE`, `PENDING_VERIFICATION_STALE` (>3 days), `DISCREPANCY_UNRESOLVED`, `ESCALATION`, `RELEASE_UPDATE`.
- Escalation: Alert unread/unresolved for `escalateAfterDays` → new `ESCALATION` alert with `audience = SENIOR_ADMIN`.

### 4.4 Document Security
- Upload: validate MIME + magic bytes (`%PDF-`), ≤10 MB; compute SHA-256 → store `fileHash`.
- Encrypt with AES-256-GCM (`DOC_ENC_KEY` in env), save as `{uuid}.enc` in `/storage/fdr-documents`.
- Serve via `GET /api/documents/[id]`: check RBAC (+ ownership) → decrypt → stream with `Content-Disposition: inline`. Audit `DOCUMENT_VIEWED`.
- Duplicate detection: same `fileHash` already attached to another FDR → auto discrepancy flag `DUPLICATE_DOCUMENT`.

### 4.5 Verification & Discrepancy Engine (rule-based)
Rules run on submit and on demand (`lib/services/verification.ts`):
| Code | Rule |
|---|---|
| `MISSING_DOC` | no FDR PDF attached |
| `DATE_INVALID` | maturity ≤ issue date |
| `EXPIRED_AT_SUBMIT` | maturity < today at submission |
| `DUP_REF_NO` | same refNo + bank exists |
| `DUPLICATE_DOCUMENT` | same file hash on another FDR |
| `AMOUNT_BELOW_REQUIRED` | amount < institution's required deposit (config) |
| `BANK_MISMATCH` | bank API returned differing field(s) |
| `INCOMPLETE_FIELDS` | optional-but-required-for-verify fields blank |
Each produces a `DiscrepancyFlag {code, severity, message, evidence}`. Flags are **advisory**; admin decides.

### 4.6 Bank Verification Adapter (mock)
Interface in `lib/services/bank.ts`:
```ts
interface BankVerifier {
  verify(input:{bank:string; refNo:string}): Promise<
    | {status:"MATCH"; confirmed:BankFields}
    | {status:"MISMATCH"; confirmed:BankFields; diffs:string[]}
    | {status:"UNAVAILABLE"}
  >;
}
```
Mock reads a `MockBankRecord` table seeded with true values; deliberately seed a few mismatches. Result saved to `BankVerification` (source, timestamp, raw response). Fields confirmed here show the **"Bank-confirmed"** badge in UI.

### 4.7 Hash-Chained Audit Log
```
hash_n = HMAC_SHA256(AUDIT_KEY, prevHash || actorId || action || entity || entityId || payloadJSON || timestamp)
```
`audit.ts → logAudit()` fetches last hash (inside a transaction) and writes the new row. `GET /api/audit/verify` recomputes the chain → `{ok:true}` or first broken index. (Direct reuse of our HMAC-SHA256 hash-chain research — mention in pitch.)

### 4.8 Release / Refund State Machine
```
(none) → REQUESTED → UNDER_SCRUTINY → APPROVED → RELEASED
                         └──────────→ REJECTED (with remarks; institution can re-request)
```
Guards: FDR VERIFIED; no other open request; on RELEASED set `fdr.releasedAt`.

### 4.9 Reports
`GET /api/reports/:type?format=csv` — types: `pending-verifications`, `upcoming-maturities`, `missing-documents`, `discrepancies`, `release-requests`, `institution-risk`. Server builds CSV string; UI also shows a preview table.

## 5. Environment Variables (`.env.local`)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-me-32+chars"
DOC_ENC_KEY="64-hex-chars (32 bytes)"
AUDIT_KEY="another-secret"
ALERT_SCAN_THROTTLE_MIN=5
```

## 6. Security Checklist
- [ ] httpOnly cookies, bcrypt hashes · [ ] zod validate all inputs · [ ] RBAC + ownership on every query · [ ] files outside `/public`, encrypted · [ ] audit on every mutation · [ ] no stack traces to client · [ ] rate-limit login (simple in-memory) · [ ] security headers in `next.config.js`.

## 7. Performance
Index: `FDR(institutionId)`, `FDR(maturityDate)`, `FDR(verificationStatus)`, `Alert(fdrId,type,threshold)` unique. Paginate lists (20/page), server-side filter/sort.

## 8. Deployment (demo)
Local run + optional Vercel (note: SQLite/file storage is not persistent on Vercel → demo from local or Railway/Render with a volume). Include `npm run seed`, `npm run dev`.

## 9. Scalability Roadmap (for pitch)
SQLite → PostgreSQL; local FS → S3/AICTE object store; mock bank → real bank/CBS APIs; JWT demo auth → AICTE SSO/DigiLocker; cron → queue worker; add OCR + AI document forgery detection.
