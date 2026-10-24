# 08 — SIH PITCH & SUBMISSION NOTES (use for PPT / idea submission)

## One-liner
**FinMatrix** — a secure, centralized portal that tracks every AICTE security deposit/FDR from submission to release, with dual-source verification, automated expiry alerts and a tamper-evident audit trail.

## Problem → Solution → Impact
| Problem | Our answer |
|---|---|
| Fragmented records, manual tracking | Single institution-wise / instrument-wise repository |
| Can't tell what institution claims vs. bank confirms | **Submitted vs Bank-confirmed** field badges |
| Missed maturities / renewals | 90-60-30-15-7 day alerts + escalation ladder |
| Slow verification | Queue with ageing SLA, rule-based discrepancy flags |
| Opaque release/refund | Tracked workflow with scrutiny + authorized approval |
| Trust & accountability | Hash-chained audit log, RBAC, encrypted documents |

## Suggested PPT outline (SIH idea format)
1. Title + team · 2. Problem understanding · 3. Proposed solution · 4. Key features (10 PS capabilities mapped 1:1) · 5. Architecture diagram · 6. Process flow · 7. Tech stack · 8. Innovation (dual-source truth, hash-chain audit, escalation, risk score) · 9. Feasibility & integration path (bank APIs, AICTE systems) · 10. Impact metrics · 11. Roadmap (OCR/AI forgery detection, e-FDR APIs, multilingual, SMS/email alerts) · 12. Team & links (prototype, GitHub, video)

## PS-requirement coverage matrix
| PS capability | Our module |
|---|---|
| 1 Centralized repository | FDR/Institution models + list/detail |
| 2 Digital document mgmt | Encrypted upload/view, versions, hash |
| 3 Verification & discrepancy | Rule engine + bank adapter + flags |
| 4 Validity & maturity tracking | Computed lifecycle + days chips |
| 5 Renewal/replacement | `renewalOf` chain + timeline |
| 6 Release/refund workflow | ReleaseRequest state machine |
| 7 Alerts & escalation | Alert engine + senior-admin escalation |
| 8 Dashboard & reports | KPI cards, charts, 6 CSV reports |
| 9 Audit & access control | Hash-chained AuditLog + RBAC |
| 10 Integration & security | REST API, adapters, AES-256-GCM, JWT |

## Likely judge Q&A
- **How is real bank verification done?** Adapter interface; swap mock with bank/CBS or e-FDR verification APIs; unavailable → manual review route.
- **Is AI used?** Prototype uses rule-based detection (explainable); roadmap adds OCR + ML anomaly/forgery detection — always advisory, human decides.
- **Scalability?** SQLite→PostgreSQL, object storage, queue workers; stateless API.
- **Data privacy?** Encryption at rest, RBAC + ownership checks, audit on document views, least-privilege.
- **Why trust the audit log?** HMAC-SHA256 hash chain; any edit breaks the chain (demonstrated live).
