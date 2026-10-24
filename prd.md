# FinMatrix — Product Requirements & Architectural Context

> **Smart India Hackathon 2026** · Problem Statement: **SIH26265**  
> **Theme:** Smart Automation / AICTE  
> **Product Name:** FinMatrix — AICTE Security Deposit & Fixed Deposit Receipt Management Portal  
> **Detailed Docs Reference:** All comprehensive design and planning documents are maintained in [`/docs`](file:///c:/MY%20LAPTOP/My%20Project/FinMatrix/docs).

---

## 1. Executive Summary & Problem Scope

Technical educational institutions approved by AICTE are required to maintain Fixed Deposit Receipts (FDRs) / Security Deposits as financial guarantees for operational compliance and student interest protection. Historically, records have suffered from:
1. **Fragmented Records:** Spreadsheets, letters, and disparate physical files leading to zero centralized visibility.
2. **Untracked Maturity & Renewals:** Expired or near-expiry FDRs going unnoticed, risking forfeiture or non-compliance.
3. **Slow & Non-Standard Verification:** Time-consuming manual scrutiny with no real-time bank cross-verification.
4. **Opaque Release/Refund Processes:** No status tracking or conditional scrutiny when colleges request deposit releases.

**FinMatrix** solves this with a centralized, automated, and tamper-evident lifecycle platform tracking deposits from submission to renewal or release.

---

## 2. Core Personas & Permissions

| Role | Primary Functions |
|---|---|
| **AICTE Admin** (Regulation Bureau) | View all institutions and FDRs nationwide; review submissions side-by-side with uploaded PDFs; execute mock bank cross-checks; flag rule-based discrepancies; record scrutiny remarks; approve/reject release requests; configure reminder thresholds; export compliance reports; verify audit hash chain. |
| **Senior Admin** | Escalation recipient for overdue or unresolved discrepancies (>7 days); system-wide oversight. |
| **Institution** (College Nodal Officer) | View college-specific portfolio; submit new/renewal FDRs with encrypted PDF uploads; track verification progress via visual stepper; respond to discrepancy notices; request deposit releases. |

---

## 3. Key Differentiators & PS Mandates

1. **Dual-Source Truth ("Submitted" vs. "Bank-Confirmed"):**  
   Every field displays its origin badge. Discrepancies between college claims and bank records are highlighted with burnt-orange alerts.
2. **Tamper-Evident Hash-Chained Audit Trail:**  
   Every state modification computes an HMAC-SHA256 signature chained with the previous record's hash (`hash_n = HMAC(prevHash || actorId || action || entity || entityId || payload || timestamp)`). Any manual database tampering immediately breaks chain verification.
3. **Smart Advisory Discrepancy Engine:**  
   Rule-based instant checks on submission: duplicate FDR/ref number, maturity date earlier than issue date, expired upon submission, duplicate document hash, amount below required deposit threshold.
4. **Escalation Ladder & Proactive Alert Engine:**  
   Automated alerts at 90, 60, 30, 15, and 7 days before maturity. Overdue items (>0 days past maturity) or unaddressed discrepancies escalate to senior administrators.
5. **Secure Document Isolation:**  
   FDR PDFs are strictly stored outside `/public` (`/storage/fdr-documents`) as AES-256-GCM encrypted blobs and are only accessible through authenticated, role-authorized streaming endpoints (`/api/documents/:id`) with audit logging.

---

## 4. Complete Database Schema (Prisma 6 SQLite Models)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 1. Users & Authentication
model User {
  id            String       @id @default(cuid())
  name          String
  email         String       @unique
  passwordHash  String
  role          String       // ADMIN | SENIOR_ADMIN | INSTITUTION
  institutionId String?
  institution   Institution? @relation(fields: [institutionId], references: [id])
  createdAt     DateTime     @default(now())
  auditLogs     AuditLog[]
  remarks       Remark[]
}

// 2. Institutions
model Institution {
  id                String       @id @default(cuid())
  aicteId           String       @unique // e.g. "1-4829173"
  name              String
  state             String
  city              String
  region            String       // Central, Western, Southern, Northern, Eastern
  type              String       // Engineering | Management | Pharmacy | Polytechnic
  nodalOfficer      String
  email             String
  phone             String?
  requiredDeposit   Float        @default(0) // Expected security deposit in INR
  createdAt         DateTime     @default(now())
  users             User[]
  fdrs              FDR[]
}

// 3. Fixed Deposit Receipts (FDRs)
model FDR {
  id                 String             @id @default(cuid())
  refNo              String             // FDR / Instrument Number
  institutionId      String
  institution        Institution        @relation(fields: [institutionId], references: [id])
  bankName           String
  branch             String
  amount             Float
  issueDate          DateTime
  maturityDate       DateTime
  purpose            String             @default("Approval Security Deposit")
  academicYear       String             @default("2026-27")

  // Verification State
  verificationStatus String             @default("PENDING") // PENDING | UNDER_REVIEW | VERIFIED | DISCREPANCY
  discrepancyReason  String?
  verifiedById       String?
  verifiedAt         DateTime?

  // Renewal Linkage Chain
  renewalOfId        String?            @unique
  renewalOf          FDR?               @relation("RenewalChain", fields: [renewalOfId], references: [id])
  renewedBy          FDR?               @relation("RenewalChain")
  renewedAt          DateTime?

  // Release Workflow State
  releaseRequested   Boolean            @default(false)
  releasedAt         DateTime?

  submittedAt        DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  // Relations
  documents          FDRDocument[]
  flags              DiscrepancyFlag[]
  bankChecks         BankVerification[]
  alerts             Alert[]
  remarks            Remark[]
  releaseRequests    ReleaseRequest[]

  @@unique([bankName, refNo])
  @@index([institutionId])
  @@index([maturityDate])
  @@index([verificationStatus])
}

// 4. Encrypted Documents
model FDRDocument {
  id           String   @id @default(cuid())
  fdrId        String
  fdr          FDR      @relation(fields: [fdrId], references: [id], onDelete: Cascade)
  kind         String   @default("FDR_COPY") // FDR_COPY | BANK_CONFIRMATION | RELEASE_SUPPORT | RENEWAL
  fileName     String
  storedName   String   // uuid.enc in local private storage
  mimeType     String
  sizeBytes    Int
  fileHash     String   // SHA-256 for duplicate detection
  version      Int      @default(1)
  uploadedById String
  uploadedAt   DateTime @default(now())

  @@index([fileHash])
}

// 5. Bank Verification Log
model BankVerification {
  id            String   @id @default(cuid())
  fdrId         String
  fdr           FDR      @relation(fields: [fdrId], references: [id], onDelete: Cascade)
  status        String   // MATCH | MISMATCH | UNAVAILABLE
  source        String   @default("MOCK_BANK_API")
  confirmedJson String?  // Confirmed fields payload
  diffsJson     String?  // Array of divergent fields
  checkedById   String
  checkedAt     DateTime @default(now())
}

// 6. Mock Bank Records (Simulating Core Banking Systems)
model MockBankRecord {
  id           String   @id @default(cuid())
  bankName     String
  refNo        String
  amount       Float
  issueDate    DateTime
  maturityDate DateTime
  holderName   String

  @@unique([bankName, refNo])
}

// 7. Discrepancy Flags (Advisory Engine Output)
model DiscrepancyFlag {
  id        String   @id @default(cuid())
  fdrId     String
  fdr       FDR      @relation(fields: [fdrId], references: [id], onDelete: Cascade)
  code      String   // MISSING_DOC | DATE_INVALID | EXPIRED_AT_SUBMIT | DUP_REF_NO | DUPLICATE_DOCUMENT | AMOUNT_BELOW_REQUIRED | BANK_MISMATCH
  severity  String   // LOW | MEDIUM | HIGH
  message   String
  evidence  String?
  resolved  Boolean  @default(false)
  createdAt DateTime @default(now())
}

// 8. Alerts & Escalations
model Alert {
  id            String   @id @default(cuid())
  fdrId         String?
  fdr           FDR?     @relation(fields: [fdrId], references: [id], onDelete: Cascade)
  institutionId String?
  type          String   // EXPIRING | OVERDUE | PENDING_STALE | DISCREPANCY_UNRESOLVED | ESCALATION | RELEASE_UPDATE
  threshold     Int      @default(0) // 90 | 60 | 30 | 15 | 7 | 0
  severity      String   // INFO | WARNING | HIGH | CRITICAL
  audience      String   // ADMIN | SENIOR_ADMIN | INSTITUTION
  title         String
  message       String
  isRead        Boolean  @default(false)
  createdAt     DateTime @default(now())

  @@unique([fdrId, type, threshold, audience])
}

// 9. Alert Configuration Rules
model AlertRule {
  id                String  @id @default(cuid())
  type              String  @unique
  thresholdsJson    String  // JSON array e.g. [90, 60, 30, 15, 7]
  escalateAfterDays Int     @default(7)
  enabled           Boolean @default(true)
}

// 10. Release Requests
model ReleaseRequest {
  id              String    @id @default(cuid())
  fdrId           String
  fdr             FDR       @relation(fields: [fdrId], references: [id], onDelete: Cascade)
  requestedById   String
  reason          String
  remarks         String?
  status          String    @default("REQUESTED") // REQUESTED | UNDER_SCRUTINY | APPROVED | REJECTED | RELEASED
  decisionById    String?
  decisionRemarks String?
  releaseRef      String?
  requestedAt     DateTime  @default(now())
  decidedAt       DateTime?
  releasedAt      DateTime?
}

// 11. Scrutiny Remarks
model Remark {
  id        String   @id @default(cuid())
  fdrId     String
  fdr       FDR      @relation(fields: [fdrId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  text      String
  createdAt DateTime @default(now())
}

// 12. Hash-Chained Tamper-Evident Audit Log
model AuditLog {
  id        Int      @id @default(autoincrement())
  actorId   String?
  actor     User?    @relation(fields: [actorId], references: [id])
  action    String   // FDR_SUBMITTED | FDR_VERIFIED | DOCUMENT_VIEWED | etc.
  entity    String   // FDR | RELEASE | USER | ALERT
  entityId  String
  payload   String?  // JSON representation of change
  prevHash  String   // SHA-256 / HMAC link to previous log
  hash      String   // Current node hash
  createdAt DateTime @default(now())
}
```

---

## 5. Visual Palette Tokens

- **Brand Dark Teal (`#006675`):** Sidebar background, primary navigation, page headings.
- **Brand Teal (`#00959C`):** Verified/Success badges, secondary buttons, interactive links.
- **Brand Light Teal (`#4DC2C2`):** Highlights, informational badges, chart accents.
- **Brand Yellow Orange (`#FF9D2D`):** Warning, Pending status, hover indicator bar.
- **Brand Orange (`#F87C2B`):** Expiring alert indicators (mid-severity: 8–30 days).
- **Brand Burnt Orange (`#EB5A11`):** Critical alerts (≤7 days/overdue), Discrepancy flags, primary CTA buttons.
- **Background (`#F8FAFC`):** Application canvas.
- **Surface (`#FFFFFF`):** Cards and dialogs.
- **Ink (`#0F2A30`):** Body typography.
- **Muted (`#5B7480`):** Secondary text and labels.
