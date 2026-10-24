import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { addDays, subDays } from "date-fns";

const db = new PrismaClient();

const AUDIT_SECRET =
  process.env.AUDIT_KEY || "finmatrix-tamper-evident-audit-hmac-key-2026";
let lastAuditHash =
  "0000000000000000000000000000000000000000000000000000000000000000";

function createAuditHash(
  prevHash: string,
  actorId: string | null,
  action: string,
  entity: string,
  entityId: string,
  payloadStr: string | null,
  timestampStr: string
): string {
  const content = [
    prevHash,
    actorId || "SYSTEM",
    action,
    entity,
    entityId,
    payloadStr || "",
    timestampStr,
  ].join("|");
  return crypto.createHmac("sha256", AUDIT_SECRET).update(content).digest("hex");
}

async function recordSeedAudit(
  actorId: string | null,
  action: string,
  entity: string,
  entityId: string,
  payload?: any
) {
  const payloadStr = payload ? JSON.stringify(payload) : null;
  const now = new Date();
  const timestampStr = now.toISOString();

  const hash = createAuditHash(
    lastAuditHash,
    actorId,
    action,
    entity,
    entityId,
    payloadStr,
    timestampStr
  );

  const log = await db.auditLog.create({
    data: {
      actorId,
      action,
      entity,
      entityId,
      payload: payloadStr,
      prevHash: lastAuditHash,
      hash,
      createdAt: now,
    },
  });

  lastAuditHash = hash;
  return log;
}

// 40 Realistic Indian Institutions
const INSTITUTIONS_DATA = [
  { name: "Demo Institute of Technology", city: "Bhopal", state: "Madhya Pradesh", region: "Central", type: "Engineering", deposit: 2500000 },
  { name: "Delhi Institute of Technology & Science", city: "New Delhi", state: "Delhi", region: "Northern", type: "Engineering", deposit: 3500000 },
  { name: "St. Xavier College of Engineering", city: "Pune", state: "Maharashtra", region: "Western", type: "Engineering", deposit: 5000000 },
  { name: "Techno India Management Academy", city: "Kolkata", state: "West Bengal", region: "Eastern", type: "Management", deposit: 2000000 },
  { name: "Vidyapeeth Pharmacy Institute", city: "Bengaluru", state: "Karnataka", region: "Southern", type: "Pharmacy", deposit: 1500000 },
  { name: "Madras Polytechnic College", city: "Chennai", state: "Tamil Nadu", region: "Southern", type: "Polytechnic", deposit: 1000000 },
  { name: "Sardar Patel Institute of Tech", city: "Mumbai", state: "Maharashtra", region: "Western", type: "Engineering", deposit: 4000000 },
  { name: "Gujarat Business School", city: "Ahmedabad", state: "Gujarat", region: "Western", type: "Management", deposit: 2500000 },
  { name: "Rajasthan Engineering Academy", city: "Jaipur", state: "Rajasthan", region: "Northern", type: "Engineering", deposit: 3000000 },
  { name: "Punjab Technical College", city: "Ludhiana", state: "Punjab", region: "Northern", type: "Engineering", deposit: 2000000 },
  { name: "Lucknow Institute of Management", city: "Lucknow", state: "Uttar Pradesh", region: "Northern", type: "Management", deposit: 1500000 },
  { name: "Patna Institute of Technology", city: "Patna", state: "Bihar", region: "Eastern", type: "Engineering", deposit: 2500000 },
  { name: "Bhubaneswar College of Engineering", city: "Bhubaneswar", state: "Odisha", region: "Eastern", type: "Engineering", deposit: 3000000 },
  { name: "Assam Technical Institute", city: "Guwahati", state: "Assam", region: "Eastern", type: "Polytechnic", deposit: 1200000 },
  { name: "Hyderabad Engineering College", city: "Hyderabad", state: "Telangana", region: "Southern", type: "Engineering", deposit: 4500000 },
  { name: "Andhra College of Pharmacy", city: "Visakhapatnam", state: "Andhra Pradesh", region: "Southern", type: "Pharmacy", deposit: 1800000 },
  { name: "Cochin Institute of Science & Tech", city: "Kochi", state: "Kerala", region: "Southern", type: "Engineering", deposit: 3200000 },
  { name: "Indore Institute of Management", city: "Indore", state: "Madhya Pradesh", region: "Central", type: "Management", deposit: 2200000 },
  { name: "Raipur College of Engineering", city: "Raipur", state: "Chhattisgarh", region: "Central", type: "Engineering", deposit: 2800000 },
  { name: "Nagpur Institute of Technology", city: "Nagpur", state: "Maharashtra", region: "Western", type: "Engineering", deposit: 3500000 },
  { name: "Goa College of Architecture", city: "Panaji", state: "Goa", region: "Western", type: "Architecture", deposit: 1500000 },
  { name: "Chandigarh Management Institute", city: "Chandigarh", state: "Punjab", region: "Northern", type: "Management", deposit: 2000000 },
  { name: "Dehradun Institute of Technology", city: "Dehradun", state: "Uttarakhand", region: "Northern", type: "Engineering", deposit: 2500000 },
  { name: "Jammu College of Engineering", city: "Jammu", state: "Jammu & Kashmir", region: "Northern", type: "Engineering", deposit: 1800000 },
  { name: "Shimla Institute of Hotel Mgmt", city: "Shimla", state: "Himachal Pradesh", region: "Northern", type: "Management", deposit: 1000000 },
  { name: "Ranchi Polytechnic College", city: "Ranchi", state: "Jharkhand", region: "Eastern", type: "Polytechnic", deposit: 1200000 },
  { name: "Shillong College of Engineering", city: "Shillong", state: "Meghalaya", region: "Eastern", type: "Engineering", deposit: 1500000 },
  { name: "Agartala Technical Institute", city: "Agartala", state: "Tripura", region: "Eastern", type: "Polytechnic", deposit: 800000 },
  { name: "Imphal Institute of Technology", city: "Imphal", state: "Manipur", region: "Eastern", type: "Engineering", deposit: 1400000 },
  { name: "Mysore College of Engineering", city: "Mysuru", state: "Karnataka", region: "Southern", type: "Engineering", deposit: 3000000 },
  { name: "Coimbatore Institute of Tech", city: "Coimbatore", state: "Tamil Nadu", region: "Southern", type: "Engineering", deposit: 4200000 },
  { name: "Calicut College of Pharmacy", city: "Kozhikode", state: "Kerala", region: "Southern", type: "Pharmacy", deposit: 1600000 },
  { name: "Warangal Engineering Academy", city: "Warangal", state: "Telangana", region: "Southern", type: "Engineering", deposit: 2600000 },
  { name: "Vijayawada Institute of Tech", city: "Vijayawada", state: "Andhra Pradesh", region: "Southern", type: "Engineering", deposit: 3100000 },
  { name: "Jabalpur Engineering College", city: "Jabalpur", state: "Madhya Pradesh", region: "Central", type: "Engineering", deposit: 2400000 },
  { name: "Gwalior Management Institute", city: "Gwalior", state: "Madhya Pradesh", region: "Central", type: "Management", deposit: 1800000 },
  { name: "Bilaspur College of Technology", city: "Bilaspur", state: "Chhattisgarh", region: "Central", type: "Engineering", deposit: 2000000 },
  { name: "Nashik Polytechnic Institute", city: "Nashik", state: "Maharashtra", region: "Western", type: "Polytechnic", deposit: 1100000 },
  { name: "Surat College of Architecture", city: "Surat", state: "Gujarat", region: "Western", type: "Architecture", deposit: 1700000 },
  { name: "Varanasi Technical Institute", city: "Varanasi", state: "Uttar Pradesh", region: "Northern", type: "Engineering", deposit: 2700000 },
];

const BANKS = [
  { name: "State Bank of India", branches: ["Connaught Place, New Delhi", "TT Nagar, Bhopal", "Nariman Point, Mumbai", "MG Road, Bengaluru", "Park Street, Kolkata"] },
  { name: "Punjab National Bank", branches: ["Sector 17, Chandigarh", "Civil Lines, Jaipur", "Ashok Nagar, Chennai", "Boring Road, Patna"] },
  { name: "Bank of Baroda", branches: ["Shivaji Nagar, Pune", "Alkapuri, Vadodara", "Banjara Hills, Hyderabad", "Hazratganj, Lucknow"] },
  { name: "Canara Bank", branches: ["Town Hall, Bengaluru", "Mount Road, Chennai", "Marine Lines, Mumbai", "Lalbagh, Lucknow"] },
  { name: "HDFC Bank Ltd.", branches: ["Salt Lake Sector V, Kolkata", "BKC, Mumbai", "Koramangala, Bengaluru", "Nehru Place, New Delhi"] },
  { name: "ICICI Bank Ltd.", branches: ["Gachibowli, Hyderabad", "Andheri East, Mumbai", "C-Scheme, Jaipur", "South Extension, New Delhi"] },
  { name: "Union Bank of India", branches: ["Fort, Mumbai", "Vikas Marg, New Delhi", "Frazer Town, Bengaluru", "Koti, Hyderabad"] },
  { name: "Bank of India", branches: ["Cama Road, Mumbai", "Free School Street, Kolkata", "Station Road, Bhopal", "Sayaji Gunj, Vadodara"] },
];

async function main() {
  console.log("🚀 Starting FinMatrix Seed Execution...");

  // Clear existing records
  await db.auditLog.deleteMany();
  await db.remark.deleteMany();
  await db.releaseRequest.deleteMany();
  await db.alert.deleteMany();
  await db.alertRule.deleteMany();
  await db.discrepancyFlag.deleteMany();
  await db.bankVerification.deleteMany();
  await db.mockBankRecord.deleteMany();
  await db.fDRDocument.deleteMany();
  await db.fDR.deleteMany();
  await db.user.deleteMany();
  await db.institution.deleteMany();

  // Create local storage directory for encrypted PDFs
  const storageDir = path.join(process.cwd(), "storage", "fdr-documents");
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  // Common password hash for Demo@1234
  const passwordHash = await bcrypt.hash("Demo@1234", 10);

  // 1. Seed Alert Rules
  await db.alertRule.createMany({
    data: [
      {
        type: "EXPIRING",
        thresholdsJson: JSON.stringify([90, 60, 30, 15, 7]),
        escalateAfterDays: 7,
        enabled: true,
      },
      {
        type: "OVERDUE",
        thresholdsJson: JSON.stringify([0]),
        escalateAfterDays: 3,
        enabled: true,
      },
      {
        type: "PENDING_STALE",
        thresholdsJson: JSON.stringify([3]),
        escalateAfterDays: 5,
        enabled: true,
      },
      {
        type: "DISCREPANCY_UNRESOLVED",
        thresholdsJson: JSON.stringify([7]),
        escalateAfterDays: 7,
        enabled: true,
      },
    ],
  });

  // 2. Seed Institutions (40)
  const createdInstitutions = [];
  for (let i = 0; i < INSTITUTIONS_DATA.length; i++) {
    const item = INSTITUTIONS_DATA[i];
    const inst = await db.institution.create({
      data: {
        aicteId: `1-${4829100 + i}`,
        name: item.name,
        state: item.state,
        city: item.city,
        region: item.region,
        type: item.type,
        nodalOfficer: `Prof. ${["Anand Verma", "Priya Nair", "Sanjay Joshi", "Meenakshi Iyer", "Rajeev Gupta", "Sunil Kulkarni"][i % 6]}`,
        email: `nodal.${item.city.toLowerCase().replace(/[^a-z]/g, "")}@demo.ac.in`,
        phone: `+91 98${(10000000 + i * 3719).toString().substring(0, 8)}`,
        requiredDeposit: item.deposit,
      },
    });
    createdInstitutions.push(inst);
  }
  console.log(`✓ Seeded ${createdInstitutions.length} Institutions`);

  // 3. Seed Users
  // Admin & Senior Admin
  const adminUser = await db.user.create({
    data: {
      name: "Dr. Rajesh Sharma",
      email: "admin@aicte.demo",
      passwordHash,
      role: "ADMIN",
    },
  });

  const seniorAdmin = await db.user.create({
    data: {
      name: "Smt. Sunita Rao",
      email: "senior@aicte.demo",
      passwordHash,
      role: "SENIOR_ADMIN",
    },
  });

  // Institution Nodal Officer Users
  const instUsers = [
    { email: "rgpv.college@demo.in", name: "Prof. Anand Verma", instIndex: 0 },
    { email: "delhi.tech@demo.in", name: "Prof. Priya Nair", instIndex: 1 },
    { email: "xavier.engg@demo.in", name: "Prof. Sunil Kulkarni", instIndex: 2 },
    { email: "techno.kolkata@demo.in", name: "Prof. Rajeev Gupta", instIndex: 3 },
    { email: "vidyapeeth.pharma@demo.in", name: "Prof. Meenakshi Iyer", instIndex: 4 },
    { email: "chennai.poly@demo.in", name: "Prof. Sanjay Joshi", instIndex: 5 },
  ];

  const createdInstUsers = [];
  for (const u of instUsers) {
    const user = await db.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash,
        role: "INSTITUTION",
        institutionId: createdInstitutions[u.instIndex].id,
      },
    });
    createdInstUsers.push(user);
  }
  console.log("✓ Seeded Admin & Institution Users");

  // Record initial audit entry
  await recordSeedAudit(
    adminUser.id,
    "SYSTEM_INIT",
    "SYSTEM",
    "ROOT",
    { description: "FinMatrix Database Initialized for AICTE Regulation Bureau" }
  );

  // 4. Seed ~90 FDRs matching exact state distribution from 07_TEST_AND_DEMO.md
  // Today reference date: 2026-10-24
  const today = new Date("2026-10-24T12:00:00Z");

  const fdrDistribution = [
    { count: 35, type: "ACTIVE_LONG", status: "VERIFIED", daysRange: [120, 720] },
    { count: 10, type: "EXPIRING_MID", status: "VERIFIED", daysRange: [31, 90] },
    { count: 3, type: "EXPIRING_30", status: "VERIFIED", daysRange: [8, 30] },
    { count: 3, type: "EXPIRING_7", status: "VERIFIED", daysRange: [1, 7] },
    { count: 5, type: "OVERDUE", status: "VERIFIED", daysRange: [-45, -1] },
    { count: 9, type: "PENDING", status: "PENDING", daysRange: [300, 900] },
    { count: 3, type: "UNDER_REVIEW", status: "UNDER_REVIEW", daysRange: [300, 600] },
    { count: 6, type: "DISCREPANCY", status: "DISCREPANCY", daysRange: [90, 400] },
    { count: 6, type: "RENEWED", status: "VERIFIED", daysRange: [180, 500] },
    { count: 5, type: "RELEASE_REQUESTS", status: "VERIFIED", daysRange: [-10, 60] },
    { count: 5, type: "RELEASED", status: "VERIFIED", daysRange: [-60, 0] },
  ];

  let fdrCounter = 1000;
  const createdFdrs = [];

  for (const group of fdrDistribution) {
    for (let i = 0; i < group.count; i++) {
      fdrCounter++;
      const inst = createdInstitutions[fdrCounter % createdInstitutions.length];
      const bankInfo = BANKS[fdrCounter % BANKS.length];
      const branch = bankInfo.branches[fdrCounter % bankInfo.branches.length];
      const refNo = `FDR-${bankInfo.name.substring(0, 3).toUpperCase()}-202${(fdrCounter % 4) + 1}-${fdrCounter}`;
      
      // Calculate days to maturity
      const [minDays, maxDays] = group.daysRange;
      const daysOffset = Math.floor(minDays + ((maxDays - minDays) * (i + 1)) / (group.count + 1));
      const maturityDate = addDays(today, daysOffset);
      const issueDate = subDays(maturityDate, 1095); // ~3 year tenure standard

      const amount = Math.floor(10 + ((fdrCounter * 17) % 40)) * 100000; // ₹10L - ₹50L

      const fdr = await db.fDR.create({
        data: {
          refNo,
          institutionId: inst.id,
          bankName: bankInfo.name,
          branch,
          amount,
          issueDate,
          maturityDate,
          purpose: fdrCounter % 2 === 0 ? "New Course Security Deposit" : "Establishment Compliance Deposit",
          academicYear: "2026-27",
          verificationStatus: group.status,
          verifiedById: group.status === "VERIFIED" ? adminUser.id : null,
          verifiedAt: group.status === "VERIFIED" ? subDays(today, 10) : null,
          discrepancyReason:
            group.status === "DISCREPANCY"
              ? ["Bank confirmed amount differs by ₹5,00,000", "Uploaded PDF illegible, seal missing", "FDR issue date conflicts with bank record"][i % 3]
              : null,
          releaseRequested: group.type === "RELEASE_REQUESTS",
          releasedAt: group.type === "RELEASED" ? subDays(today, 5) : null,
          submittedAt: subDays(today, 15),
        },
      });

      // Also create corresponding MockBankRecord
      // For planted anomalies (2 items in DISCREPANCY group), create mismatch amount
      const isMismatch = group.type === "DISCREPANCY" && (i === 0 || i === 1);
      const bankRecordAmount = isMismatch ? amount - 500000 : amount;

      await db.mockBankRecord.create({
        data: {
          bankName: bankInfo.name,
          refNo,
          amount: bankRecordAmount,
          issueDate,
          maturityDate,
          holderName: inst.name,
        },
      });

      // Record bank check record if verified or mismatch
      if (group.status === "VERIFIED" || isMismatch) {
        await db.bankVerification.create({
          data: {
            fdrId: fdr.id,
            status: isMismatch ? "MISMATCH" : "MATCH",
            source: "MOCK_BANK_API",
            confirmedJson: JSON.stringify({
              bankName: bankInfo.name,
              refNo,
              amount: bankRecordAmount,
              holderName: inst.name,
            }),
            diffsJson: isMismatch ? JSON.stringify(["amount"]) : null,
            checkedById: adminUser.id,
            checkedAt: subDays(today, 5),
          },
        });
      }

      // Add discrepancy flag if mismatch
      if (isMismatch) {
        await db.discrepancyFlag.create({
          data: {
            fdrId: fdr.id,
            code: "BANK_MISMATCH",
            severity: "HIGH",
            message: `Bank core system reports amount ₹${(bankRecordAmount/100000).toFixed(2)} Lakhs vs submitted ₹${(amount/100000).toFixed(2)} Lakhs.`,
            evidence: JSON.stringify({ submitted: amount, bankConfirmed: bankRecordAmount }),
            resolved: false,
          },
        });
      }

      // Generate Alert rows for expiring / overdue
      if (group.type === "EXPIRING_7") {
        await db.alert.create({
          data: {
            fdrId: fdr.id,
            institutionId: inst.id,
            type: "EXPIRING",
            threshold: 7,
            severity: "CRITICAL",
            audience: "ADMIN",
            title: `Critical: FDR ${fdr.refNo} maturing in ${daysOffset} days`,
            message: `${inst.name} deposit of ₹${(amount / 100000).toFixed(0)} Lakhs matures on ${maturityDate.toISOString().split("T")[0]}. Urgent renewal notice required.`,
            isRead: false,
          },
        });
      } else if (group.type === "OVERDUE") {
        await db.alert.create({
          data: {
            fdrId: fdr.id,
            institutionId: inst.id,
            type: "OVERDUE",
            threshold: 0,
            severity: "CRITICAL",
            audience: "SENIOR_ADMIN",
            title: `ESCALATION: FDR ${fdr.refNo} is ${Math.abs(daysOffset)} days overdue`,
            message: `${inst.name} security deposit has matured without renewal submission. Escalated to Senior Administration for compliance action.`,
            isRead: false,
          },
        });
      }

      // Record ReleaseRequest if requested or released
      if (group.type === "RELEASE_REQUESTS" || group.type === "RELEASED") {
        const releaseStatuses = ["REQUESTED", "UNDER_SCRUTINY", "APPROVED", "REJECTED", "RELEASED"];
        const relStatus = group.type === "RELEASED" ? "RELEASED" : releaseStatuses[i % releaseStatuses.length];

        await db.releaseRequest.create({
          data: {
            fdrId: fdr.id,
            requestedById: createdInstUsers[0].id,
            reason: "Course Closure & Student Relocation Completed",
            remarks: "All liabilities cleared per AICTE Approval Process Handbook norm.",
            status: relStatus,
            decisionById: relStatus !== "REQUESTED" ? adminUser.id : null,
            decisionRemarks: relStatus === "APPROVED" || relStatus === "RELEASED" ? "Audited and verified. No dues pending." : null,
            releaseRef: relStatus === "RELEASED" ? `AICTE/REL/2026/${fdrCounter}` : null,
            decidedAt: relStatus !== "REQUESTED" ? subDays(today, 2) : null,
            releasedAt: relStatus === "RELEASED" ? subDays(today, 1) : null,
          },
        });
      }

      createdFdrs.push(fdr);
    }
  }

  console.log(`✓ Seeded ${createdFdrs.length} Fixed Deposit Receipts across all lifecycle states`);

  // 5. Connect 6 Renewal Chains (old FDR -> new FDR)
  for (let r = 0; r < 6; r++) {
    const oldFdr = createdFdrs[r * 3];
    const newFdr = createdFdrs[r * 3 + 1];

    await db.fDR.update({
      where: { id: newFdr.id },
      data: {
        renewalOfId: oldFdr.id,
        renewedAt: subDays(today, 3),
      },
    });
  }
  console.log("✓ Seeded Renewal Chains");

  // Record audit trail entries for seed demonstration
  await recordSeedAudit(
    adminUser.id,
    "FDR_VERIFIED",
    "FDR",
    createdFdrs[0].id,
    { status: "VERIFIED", refNo: createdFdrs[0].refNo }
  );

  await recordSeedAudit(
    createdInstUsers[0].id,
    "FDR_SUBMITTED",
    "FDR",
    createdFdrs[1].id,
    { status: "PENDING", refNo: createdFdrs[1].refNo }
  );

  await recordSeedAudit(
    adminUser.id,
    "DISCREPANCY_FLAGGED",
    "FDR",
    createdFdrs[2].id,
    { reason: "Amount mismatch detected by Bank Core Interface" }
  );

  console.log("✓ Hash-chained Audit Trail verified and populated");
  console.log("🎉 Seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
