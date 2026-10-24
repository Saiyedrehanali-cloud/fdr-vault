# 07 — TEST SCENARIOS, SEED DATA & DEMO SCRIPT

## 1. Seed Data Spec
**Users** (password for all: `Demo@1234`)
| Email | Role | Notes |
|---|---|---|
| `admin@aicte.demo` | ADMIN | Regulation Bureau officer |
| `senior@aicte.demo` | SENIOR_ADMIN | receives escalations |
| `rgpv.college@demo.in` | INSTITUTION | linked to "Demo Institute of Technology, Bhopal" |
| `+ 5 more` institution users | INSTITUTION | |

**Institutions:** 40, mixed regions (Central, Western, Southern, Northern, Eastern), realistic names, AICTE IDs like `1-4829173`, `requiredDeposit` ₹5L–₹50L.
**Banks:** SBI, PNB, Bank of Baroda, Canara Bank, HDFC, ICICI, Union Bank, Bank of India.

**FDR state distribution (~90 FDRs)** — relative to "today":
| Count | Situation |
|---|---|
| 35 | VERIFIED, ACTIVE, maturity >120 days |
| 10 | VERIFIED, EXPIRING 31–90 days |
| 6 | VERIFIED, EXPIRING ≤30 days (3 of them ≤7 days) |
| 5 | MATURED / overdue (maturity passed 1–45 days ago) |
| 9 | PENDING (ages 0–8 days) |
| 3 | UNDER_REVIEW |
| 6 | DISCREPANCY (varied reasons) |
| 6 | RENEWED chains (old → new) |
| 5 | RELEASE requests (one per stage) |
| 5 | RELEASED |
**Planted anomalies for demo:** 2 FDRs with bank MISMATCH (amount differs), 1 duplicate ref no across institutions (should be blocked by bank+ref unique but test same ref different bank), 1 duplicate PDF hash, 1 FDR with maturity before issue (blocked by validation), 1 with missing document.
Provide 3 small sample PDFs (`sample-fdr-1.pdf` etc.) generated in seed for upload demo.

## 2. Test Scenarios (map to PS "Testing should cover…")
| # | Scenario | Steps | Expected |
|---|---|---|---|
| T1 | **New FDR submission** | Institution submits valid FDR + PDF | Status PENDING; appears in admin queue; audit row; admin alert |
| T2 | Invalid submit | non-PDF, >10MB, maturity<issue, negative amount | Inline validation errors; nothing saved |
| T3 | **Validity tracking** | View FDR with maturity in 120 days | Lifecycle ACTIVE, days chip shown (teal) |
| T4 | **Approaching maturity** | Click Run Scan | Alerts at 90/60/30/15/7 thresholds created once; rerun → no duplicates; critical ones burnt-orange |
| T5 | **Overdue + escalation** | Matured FDR unresolved > threshold | OVERDUE alert + ESCALATION to senior admin |
| T6 | **Verification happy path** | Admin: start review → Verify with Bank (MATCH) → Mark Verified | Bank-confirmed badges; VERIFIED; institution notified |
| T7 | **Discrepancy identification** | Verify with Bank on mismatch record | MISMATCH badge, `BANK_MISMATCH` flag; admin flags Discrepancy with reason; institution sees reason |
| T8 | Duplicate document | Upload same PDF to 2nd FDR | `DUPLICATE_DOCUMENT` flag raised |
| T9 | **Renewal** | Institution renews expiring FDR; admin verifies new | Old → RENEWED; chain visible both ways |
| T10 | **Authorized release** | Request release on verified FDR → scrutiny → approve → mark released | Tracker advances; FDR RELEASED; audit entries |
| T11 | Release guard | Request release on PENDING FDR | Blocked with clear message |
| T12 | **RBAC** | Institution A opens Institution B's FDR URL / document URL | 403/404; no data leak |
| T13 | Audit integrity | Verify chain; then tamper a row in DB; verify again | OK → "Tampering detected at #N" |
| T14 | Reports | Export "Upcoming maturities" | CSV matches filtered table |
| T15 | Responsive | 375px viewport | Drawer nav, stacked cards, no horizontal scroll |

## 3. Metrics to show judges (put on a "Impact" panel or slide)
- Avg. verification turnaround (seeded: 1.8 days vs. manual est. 7+ days)
- % FDRs alerted ≥30 days before maturity (100% in demo)
- Count of auto-detected discrepancies (flags raised vs. missed)
- Manual steps eliminated: tracking sheet updates, reminder emails, report compilation
- Pending visibility: oldest pending case age on dashboard

## 4. Demo Script (3–4 min)
1. **Hook (20s):** "AICTE tracks hundreds of FDRs across spreadsheets. One missed maturity = lost compliance." Show login wave hero.
2. **Admin dashboard (30s):** 4 KPI cards, maturity chart, expiring table. Point out color urgency.
3. **Institution submits FDR (40s):** switch role → submit new FDR + PDF → pending.
4. **Verification (50s):** Admin queue → open → Verify with Bank → show Submitted vs Bank-confirmed → flag mismatch case → verify clean case.
5. **Alerts (30s):** Run Scan → bell → escalation example.
6. **Release (30s):** request → approve → released tracker.
7. **Audit (20s):** hash-chain verify OK, then show tampered state.
8. **Close (20s):** roadmap (real bank APIs, AICTE SSO, OCR/AI forgery detection, PostgreSQL) + impact metrics.

## 5. Definition of Done
All P0 features in PRD §5 working on seeded data; T1–T13 pass; no console errors; palette/spacing per doc 04; README + demo video ready.
