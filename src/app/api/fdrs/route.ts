import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { storeEncryptedDocument } from "@/lib/services/document";
import { runDiscrepancyRules } from "@/lib/services/verification";
import { computeLifecycle, computeDaysToMaturity } from "@/lib/services/fdr";

const fdrCreateSchema = z
  .object({
    refNo: z.string().min(3).max(50),
    bankName: z.string().min(2),
    branch: z.string().min(2),
    amount: z.coerce.number().positive("Amount must be greater than zero"),
    issueDate: z.coerce.date(),
    maturityDate: z.coerce.date(),
    purpose: z.string().default("Approval Security Deposit"),
    academicYear: z.string().default("2026-27"),
    renewalOfId: z.string().optional().nullable(),
  })
  .refine((data) => data.maturityDate > data.issueDate, {
    message: "Maturity date must be after issue date",
    path: ["maturityDate"],
  });

export const dynamic = "force-dynamic";

// GET /api/fdrs - List FDRs with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const searchParams = req.nextUrl.searchParams;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const q = searchParams.get("q") || "";
    const bank = searchParams.get("bank");
    const verification = searchParams.get("verification");
    const institutionParam = searchParams.get("institutionId");

    // Enforce row-level tenant security: Institutions can only see their own FDRs
    let targetInstitutionId: string | undefined = undefined;
    if (session?.role === "INSTITUTION") {
      targetInstitutionId = session.institutionId || undefined;
    } else if (institutionParam) {
      targetInstitutionId = institutionParam;
    }

    const where: any = {};

    if (targetInstitutionId) {
      where.institutionId = targetInstitutionId;
    }

    if (bank) {
      where.bankName = { contains: bank };
    }

    if (verification) {
      where.verificationStatus = verification;
    }

    if (q) {
      where.OR = [
        { refNo: { contains: q } },
        { institution: { name: { contains: q } } },
        { institution: { aicteId: { contains: q } } },
        { bankName: { contains: q } },
      ];
    }

    const [total, fdrs] = await Promise.all([
      db.fDR.count({ where }),
      db.fDR.findMany({
        where,
        include: {
          institution: {
            select: {
              name: true,
              aicteId: true,
              city: true,
              state: true,
            },
          },
          bankChecks: {
            take: 1,
            orderBy: { checkedAt: "desc" },
            select: { status: true },
          },
          flags: {
            where: { resolved: false },
            select: { id: true, code: true, severity: true },
          },
          documents: {
            select: { id: true, fileName: true, mimeType: true, sizeBytes: true },
          },
        },
        orderBy: { maturityDate: "asc" },
        skip,
        take: limit,
      }),
    ]);

    const today = new Date();

    const formatted = fdrs.map((item) => {
      const daysToMaturity = computeDaysToMaturity(item.maturityDate, today);
      const lifecycle = computeLifecycle(item, today);

      let source: "SUBMITTED" | "BANK_CONFIRMED" | "MISMATCH" = "SUBMITTED";
      if (item.bankChecks && item.bankChecks.length > 0) {
        if (item.bankChecks[0].status === "MISMATCH") {
          source = "MISMATCH";
        } else if (item.bankChecks[0].status === "MATCH") {
          source = "BANK_CONFIRMED";
        }
      }

      return {
        id: item.id,
        refNo: item.refNo,
        institutionId: item.institutionId,
        institutionName: item.institution.name,
        aicteId: item.institution.aicteId,
        city: item.institution.city,
        state: item.institution.state,
        bankName: item.bankName,
        branch: item.branch,
        amount: item.amount,
        issueDate: item.issueDate.toISOString().split("T")[0],
        maturityDate: item.maturityDate.toISOString().split("T")[0],
        purpose: item.purpose,
        verificationStatus: item.verificationStatus,
        lifecycleStatus: lifecycle,
        daysToMaturity,
        source,
        flagsCount: item.flags.length,
        hasDocument: item.documents.length > 0,
        docId: item.documents[0]?.id || null,
        submittedAt: item.submittedAt.toISOString().split("T")[0],
      };
    });

    return NextResponse.json({
      ok: true,
      data: {
        items: formatted,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("List FDRs error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Failed to query FDR repository" } },
      { status: 500 }
    );
  }
}

// POST /api/fdrs - Submit new FDR with encrypted PDF upload
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHENTICATED", message: "Login required" } },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const rawData = {
      refNo: formData.get("refNo")?.toString(),
      bankName: formData.get("bankName")?.toString(),
      branch: formData.get("branch")?.toString(),
      amount: formData.get("amount")?.toString(),
      issueDate: formData.get("issueDate")?.toString(),
      maturityDate: formData.get("maturityDate")?.toString(),
      purpose: formData.get("purpose")?.toString() || "Approval Security Deposit",
      academicYear: formData.get("academicYear")?.toString() || "2026-27",
      renewalOfId: formData.get("renewalOfId")?.toString() || null,
    };

    // Zod validation
    const parsed = fdrCreateSchema.safeParse(rawData);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION", message: errorMsg } },
        { status: 422 }
      );
    }

    // Determine target institutionId
    let institutionId = session.institutionId;
    if (!institutionId && (session.role === "ADMIN" || session.role === "SENIOR_ADMIN")) {
      institutionId = formData.get("institutionId")?.toString() || null;
    }

    if (!institutionId) {
      // Fallback for demo: find first institution
      const firstInst = await db.institution.findFirst();
      institutionId = firstInst?.id || null;
    }

    if (!institutionId) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION", message: "Institution ID could not be identified" } },
        { status: 422 }
      );
    }

    // Check duplicate RefNo per Bank (PRD rule 2)
    const existing = await db.fDR.findUnique({
      where: {
        bankName_refNo: {
          bankName: parsed.data.bankName,
          refNo: parsed.data.refNo,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "DUPLICATE_FDR",
            message: `FDR number '${parsed.data.refNo}' is already registered with ${parsed.data.bankName}.`,
          },
        },
        { status: 409 }
      );
    }

    // Create the FDR record
    const fdr = await db.fDR.create({
      data: {
        refNo: parsed.data.refNo,
        institutionId,
        bankName: parsed.data.bankName,
        branch: parsed.data.branch,
        amount: parsed.data.amount,
        issueDate: parsed.data.issueDate,
        maturityDate: parsed.data.maturityDate,
        purpose: parsed.data.purpose,
        academicYear: parsed.data.academicYear,
        verificationStatus: "PENDING",
        renewalOfId: parsed.data.renewalOfId || null,
      },
      include: {
        institution: true,
      },
    });

    // Handle file upload if attached
    const file = formData.get("file") as File | null;
    let savedDoc = null;

    if (file && file.size > 0) {
      // Validate file type
      if (!file.type.includes("pdf") && !file.name.endsWith(".pdf")) {
        return NextResponse.json(
          { ok: false, error: { code: "FILE_INVALID", message: "Only PDF format files are accepted (max 10MB)" } },
          { status: 415 }
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { ok: false, error: { code: "FILE_INVALID", message: "PDF exceeds maximum allowed size of 10MB" } },
          { status: 415 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      savedDoc = await storeEncryptedDocument({
        fdrId: fdr.id,
        buffer,
        fileName: file.name,
        mimeType: file.type || "application/pdf",
        uploadedById: session.userId,
        kind: parsed.data.renewalOfId ? "RENEWAL" : "FDR_COPY",
      });
    }

    // Run rule engine
    await runDiscrepancyRules(fdr.id);

    // Record Hash-Chained Audit Log
    await logAudit({
      actorId: session.userId,
      action: "FDR_SUBMITTED",
      entity: "FDR",
      entityId: fdr.id,
      payload: {
        refNo: fdr.refNo,
        amount: fdr.amount,
        bankName: fdr.bankName,
        institution: fdr.institution.name,
        hasDocument: !!savedDoc,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        fdr: {
          id: fdr.id,
          refNo: fdr.refNo,
          institutionName: fdr.institution.name,
          verificationStatus: fdr.verificationStatus,
        },
      },
    });
  } catch (error) {
    console.error("Submit FDR error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Failed to submit FDR record" } },
      { status: 500 }
    );
  }
}
