# 05 — DATABASE SCHEMA & API SPEC

## 1. Prisma Schema (`prisma/schema.prisma`)
```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "sqlite"; url = env("DATABASE_URL") }

model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  passwordHash  String
  role          String   // ADMIN | SENIOR_ADMIN | INSTITUTION
  institutionId String?
  institution   Institution? @relation(fields: [institutionId], references: [id])
  createdAt     DateTime @default(now())
  auditLogs     AuditLog[]
  remarks       Remark[]
}

model Institution {
  id                String  @id @default(cuid())
  aicteId           String  @unique        // AICTE Permanent ID e.g. 1-12345678
  name              String
  state             String
  city              String
  region            String                 // Central, Western, ...
  type              String                 // Engineering | Management | Pharmacy | ...
  nodalOfficer      String
  email             String
  phone             String?
  requiredDeposit   Float   @default(0)    // expected security deposit (INR)
  createdAt         DateTime @default(now())
  users             User[]
  fdrs              FDR[]
}

model FDR {
  id                 String   @id @default(cuid())
  refNo              String                 // FDR number
  institutionId      String
  institution        Institution @relation(fields: [institutionId], references: [id])
  bankName           String
  branch             String
  amount             Float
  issueDate          DateTime
  maturityDate       DateTime
  purpose            String   @default("Approval Security Deposit")
  academicYear       String   @default("2026-27")

  verificationStatus String   @default("PENDING") // PENDING|UNDER_REVIEW|VERIFIED|DISCREPANCY
  discrepancyReason  String?
  verifiedById       String?
  verifiedAt         DateTime?

  renewalOfId        String?  @unique        // new FDR points to the old one
  renewalOf          FDR?     @relation("RenewalChain", fields: [renewalOfId], references: [id])
  renewedBy          FDR?     @relation("RenewalChain")
  renewedAt          DateTime?

  releaseRequested   Boolean  @default(false)
  releasedAt         DateTime?

  submittedAt        DateTime @default(now())
  updatedAt          DateTime @updatedAt

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

model FDRDocument {
  id          String   @id @default(cuid())
  fdrId       String
  fdr         FDR      @relation(fields: [fdrId], references: [id], onDelete: Cascade)
  kind        String   @default("FDR_COPY")  // FDR_COPY | BANK_CONFIRMATION | RELEASE_SUPPORT | RENEWAL
  fileName    String
  storedName  String                          // uuid.enc
  mimeType    String
  sizeBytes   Int
  fileHash    String                          // sha256 of original
  version     Int      @default(1)
  uploadedById String
  uploadedAt  DateTime @default(now())
  @@index([fileHash])
}

model BankVerification {
  id          String   @id @default(cuid())
  fdrId       String
  fdr         FDR      @relation(fields: [fdrId], references: [id], onDelete: Cascade)
  status      String   // MATCH | MISMATCH | UNAVAILABLE
  source      String   @default("MOCK_BANK_API")
  confirmedJson String?                       // bank-confirmed fields
  diffsJson   String?                         // list of mismatching fields
  checkedById String
  checkedAt   DateTime @default(now())
}

model MockBankRecord {          // simulates the bank's own database
  id           String @id @default(cuid())
  bankName     String
  refNo        String
  amount       Float
  issueDate    DateTime
  maturityDate DateTime
  holderName   String
  @@unique([bankName, refNo])
}

model DiscrepancyFlag {
  id        String   @id @default(cuid())
  fdrId     String
  fdr       FDR      @relation(fields: [fdrId], references: [id], onDelete: Cascade)
  code      String   // see TRD §4.5
  severity  String   // LOW | MEDIUM | HIGH
  message   String
  evidence  String?
  resolved  Boolean  @default(false)
  createdAt DateTime @default(now())
}

model Alert {
  id         String   @id @default(cuid())
  fdrId      String?
  fdr        FDR?     @relation(fields: [fdrId], references: [id], onDelete: Cascade)
  institutionId String?
  type       String   // EXPIRING|OVERDUE|PENDING_STALE|DISCREPANCY_UNRESOLVED|ESCALATION|RELEASE_UPDATE
  threshold  Int      @default(0)            // days (90/60/30/15/7) or 0
  severity   String   // INFO | WARNING | HIGH | CRITICAL
  audience   String   // ADMIN | SENIOR_ADMIN | INSTITUTION
  title      String
  message    String
  isRead     Boolean  @default(false)
  createdAt  DateTime @default(now())
  @@unique([fdrId, type, threshold, audience])
}

model AlertRule {
  id       String @id @default(cuid())
  type     String @unique
  thresholdsJson String       // e.g. [90,60,30,15,7]
  escalateAfterDays Int @default(7)
  enabled  Boolean @default(true)
}

model ReleaseRequest {
  id          String   @id @default(cuid())
  fdrId       String
  fdr         FDR      @relation(fields: [fdrId], references: [id], onDelete: Cascade)
  requestedById String
  reason      String
  remarks     String?
  status      String   @default("REQUESTED") // REQUESTED|UNDER_SCRUTINY|APPROVED|REJECTED|RELEASED
  decisionById String?
  decisionRemarks String?
  releaseRef  String?
  requestedAt DateTime @default(now())
  decidedAt   DateTime?
  releasedAt  DateTime?
}

model Remark {          // scrutiny observations
  id        String   @id @default(cuid())
  fdrId     String
  fdr       FDR      @relation(fields: [fdrId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  text      String
  createdAt DateTime @default(now())
}

model AuditLog {
  id        Int      @id @default(autoincrement())
  actorId   String?
  actor     User?    @relation(fields: [actorId], references: [id])
  action    String   // FDR_SUBMITTED, FDR_VERIFIED, DOCUMENT_VIEWED, ...
  entity    String   // FDR | RELEASE | USER | ALERT ...
  entityId  String
  payload   String?  // JSON before/after
  prevHash  String
  hash      String
  createdAt DateTime @default(now())
}
```

### ER summary
`Institution 1—N FDR` · `FDR 1—N FDRDocument / DiscrepancyFlag / BankVerification / Alert / Remark / ReleaseRequest` · `FDR 1—1 FDR (renewal chain)` · `User N—1 Institution` · `AuditLog` hash-chained.

## 2. API Spec (all JSON; auth cookie required unless noted)
Common response: `{ ok: true, data }` or `{ ok: false, error: { code, message } }`.

### Auth
| Method | Route | Role | Notes |
|---|---|---|---|
| POST | `/api/auth/login` | public | body `{email,password}` → sets cookie |
| POST | `/api/auth/logout` | any | |
| GET | `/api/auth/me` | any | current user |

### Dashboard
| GET | `/api/dashboard/summary` | ADMIN | `{totalFdrs, expiringSoon, pendingVerification, totalAmount, expiring30, oldestPendingDays, institutionCount}` |
| GET | `/api/dashboard/charts` | ADMIN | `{maturityByMonth[], statusMix[], turnaroundTrend[]}` |
| GET | `/api/portal/summary` | INSTITUTION | same shape scoped to own institution |

### Institutions
| GET | `/api/institutions?q=&region=&page=` | ADMIN | includes fdr counts + risk score |
| GET | `/api/institutions/:id` | ADMIN / own | profile + FDRs |

### FDRs
| GET | `/api/fdrs?institutionId=&bank=&verification=&lifecycle=&from=&to=&min=&max=&q=&page=&sort=` | ADMIN / own-scoped | list with `daysToMaturity`, computed `lifecycle` |
| POST | `/api/fdrs` | INSTITUTION | multipart: fields + `file` (PDF) → creates FDR, doc, runs rules |
| GET | `/api/fdrs/:id` | ADMIN / own | full detail incl. flags, bank checks, timeline |
| PATCH | `/api/fdrs/:id` | INSTITUTION (if DISCREPANCY/PENDING) | edit permitted fields; logs diff |
| POST | `/api/fdrs/:id/renew` | INSTITUTION | multipart new FDR with `renewalOfId` |
| POST | `/api/fdrs/:id/documents` | INSTITUTION/ADMIN | add/replace doc (version++) |

### Documents
| GET | `/api/documents/:id` | ADMIN / owner | decrypts + streams PDF; audit `DOCUMENT_VIEWED` |

### Verification
| POST | `/api/fdrs/:id/verify-bank` | ADMIN | calls mock bank adapter, stores `BankVerification`, may add `BANK_MISMATCH` flag |
| POST | `/api/fdrs/:id/start-review` | ADMIN | status → UNDER_REVIEW |
| POST | `/api/fdrs/:id/verify` | ADMIN | `{remarks?}` → VERIFIED |
| POST | `/api/fdrs/:id/discrepancy` | ADMIN | `{reason}` required → DISCREPANCY + notify |
| POST | `/api/fdrs/:id/remarks` | ADMIN | add scrutiny remark |
| POST | `/api/fdrs/:id/run-rules` | ADMIN | re-run discrepancy engine |
| GET | `/api/verification/queue` | ADMIN | PENDING/UNDER_REVIEW with ageing |

### Alerts
| POST | `/api/alerts/scan` | ADMIN | runs engine → `{created, escalated}` |
| GET | `/api/alerts?type=&severity=&unread=` | any (scoped) | |
| PATCH | `/api/alerts/:id/read` | any | |
| GET/PUT | `/api/settings/alert-rules` | ADMIN | thresholds config |

### Release
| POST | `/api/fdrs/:id/release-request` | INSTITUTION | `{reason, remarks}` guards per TRD §4.8 |
| GET | `/api/releases?status=` | ADMIN / own | |
| POST | `/api/releases/:id/scrutiny` | ADMIN | → UNDER_SCRUTINY |
| POST | `/api/releases/:id/approve` | ADMIN | `{remarks?}` |
| POST | `/api/releases/:id/reject` | ADMIN | `{remarks}` required |
| POST | `/api/releases/:id/mark-released` | ADMIN | `{releaseRef}` → FDR RELEASED |

### Reports & Audit
| GET | `/api/reports/:type?format=json|csv` | ADMIN | types per TRD §4.9 |
| GET | `/api/audit?page=&entity=&actor=` | ADMIN | |
| GET | `/api/audit/verify` | ADMIN | `{ok, checked, brokenAt?}` |

### Integration stubs (for "System Integration" requirement)
| GET | `/api/integration/aicte-institution/:aicteId` | ADMIN | simulated AICTE Permanent-ID lookup |
| POST | `/api/integration/bank-webhook` | API key | simulated bank pushing confirmation (documented, optional) |

## 3. Zod Schemas (shared) — key ones
```ts
export const fdrCreateSchema = z.object({
  refNo: z.string().min(4).max(40),
  bankName: z.string().min(2),
  branch: z.string().min(2),
  amount: z.coerce.number().positive(),
  issueDate: z.coerce.date(),
  maturityDate: z.coerce.date(),
  purpose: z.string().default("Approval Security Deposit"),
}).refine(d => d.maturityDate > d.issueDate, { path:["maturityDate"], message:"Must be after issue date" });
```

## 4. Error Codes
`UNAUTHENTICATED 401 · FORBIDDEN 403 · NOT_FOUND 404 · VALIDATION 422 · DUPLICATE_FDR 409 · INVALID_STATE 409 · FILE_INVALID 415 · SERVER 500`
