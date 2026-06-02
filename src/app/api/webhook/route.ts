import { NextResponse } from "next/server";
import { db, prospects } from "../../../lib/db";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { webhookUrl, payload, projectId, prospects: prospectsList, name, contactInfo, status, notes, objection } = body;

    // 1. OUTGOING WEBHOOK PROXY (Forwarding request to target URL)
    if (webhookUrl && typeof webhookUrl === "string") {
      if (!payload) {
        return NextResponse.json(
          { error: "Missing payload data for outgoing webhook" },
          { status: 400 }
        );
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        return NextResponse.json(
          {
            error: `Webhook target returned error status ${response.status}`,
            details: responseText.slice(0, 500),
          },
          { status: 502 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // 2. INCOMING WEBHOOK (Syncing leads from external CRM/source like n8n)
    const incomingProspects: any[] = [];

    if (Array.isArray(prospectsList)) {
      // Bulk import/sync
      for (const p of prospectsList) {
        const pProjectId = p.projectId || projectId;
        if (!pProjectId || !p.name || !p.contactInfo) {
          return NextResponse.json(
            { error: "Each prospect in list must have projectId, name, and contactInfo" },
            { status: 400 }
          );
        }
        incomingProspects.push({
          projectId: pProjectId,
          name: p.name,
          contactInfo: p.contactInfo,
          status: p.status || "identified",
          notes: p.notes || null,
          objection: p.objection || null,
        });
      }
    } else if (projectId && name && contactInfo) {
      // Single prospect import/sync
      incomingProspects.push({
        projectId,
        name,
        contactInfo,
        status: status || "identified",
        notes: notes || null,
        objection: objection || null,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid webhook payload. Must specify either webhookUrl (proxy) or projectId, name, and contactInfo (incoming sync)" },
        { status: 400 }
      );
    }

    // Process all upserts in database
    const results: any[] = [];
    for (const item of incomingProspects) {
      // Check if prospect exists by contactInfo AND projectId
      const existing = await db
        .select()
        .from(prospects)
        .where(
          and(
            eq(prospects.projectId, item.projectId),
            eq(prospects.contactInfo, item.contactInfo)
          )
        );

      if (existing.length > 0) {
        // Update existing prospect
        const existingId = existing[0].id;
        const updateData: Record<string, any> = {
          name: item.name,
          status: item.status,
          updatedAt: Date.now(),
        };
        if (item.notes !== undefined) updateData.notes = item.notes;
        if (item.objection !== undefined) updateData.objection = item.objection;

        await db.update(prospects).set(updateData).where(eq(prospects.id, existingId));
        results.push({ id: existingId, ...item, action: "update" });
      } else {
        // Insert new prospect
        const newId = crypto.randomUUID();
        const newRecord = {
          id: newId,
          projectId: item.projectId,
          name: item.name,
          contactInfo: item.contactInfo,
          status: item.status,
          notes: item.notes,
          objection: item.objection,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await db.insert(prospects).values(newRecord);
        results.push({ id: newId, ...item, action: "insert" });
      }
    }

    return NextResponse.json({ success: true, processedCount: results.length, prospects: results });
  } catch (error: any) {
    console.error("Error in webhook route:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", message: error.message },
      { status: 500 }
    );
  }
}
