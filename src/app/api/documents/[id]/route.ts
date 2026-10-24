import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDecryptedDocument } from "@/lib/services/document";
import { logAudit } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    // Check RBAC
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHENTICATED", message: "Authentication required to access documents" } },
        { status: 401 }
      );
    }

    const docId = params.id;
    const result = await getDecryptedDocument(docId);

    if (!result) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Document not found" } },
        { status: 404 }
      );
    }

    const { doc, buffer } = result;

    // Check Institution ownership if user is INSTITUTION
    if (session.role === "INSTITUTION") {
      if (session.institutionId && doc.fdr.institutionId !== session.institutionId) {
        return NextResponse.json(
          { ok: false, error: { code: "FORBIDDEN", message: "Access denied to unauthorized institution record" } },
          { status: 403 }
        );
      }
    }

    // Record AuditLog for DOCUMENT_VIEWED (TRD requirement)
    await logAudit({
      actorId: session.userId,
      action: "DOCUMENT_VIEWED",
      entity: "DOCUMENT",
      entityId: doc.id,
      payload: {
        fdrId: doc.fdrId,
        fileName: doc.fileName,
        sizeBytes: doc.sizeBytes,
      },
    });

    // Stream PDF buffer with correct headers
    const uint8 = new Uint8Array(buffer);
    return new Response(uint8, {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType || "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(doc.fileName)}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("Document streaming error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Failed to decrypt and stream document" } },
      { status: 500 }
    );
  }
}
