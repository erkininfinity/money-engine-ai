import { NextResponse } from "next/server";
import { db, prospects } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, prospectsList } = body;

    if (!projectId || !Array.isArray(prospectsList)) {
      return NextResponse.json(
        { error: "projectId and prospectsList (array) are required" },
        { status: 400 }
      );
    }

    const inserted = [];
    const timestamp = Date.now();

    for (const item of prospectsList) {
      if (!item.name || !item.contactInfo) {
        continue; // skip invalid items
      }

      const newProspect = {
        id: crypto.randomUUID(),
        projectId,
        sprintId: null,
        name: item.name,
        contactInfo: item.contactInfo,
        status: item.status || "identified",
        notes: item.notes || null,
        objection: item.objection || null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await db.insert(prospects).values(newProspect);
      inserted.push(newProspect);
    }

    return NextResponse.json({ success: true, count: inserted.length, prospects: inserted });
  } catch (error: any) {
    console.error("Error importing prospects:", error);
    return NextResponse.json({ error: "Failed to import prospects" }, { status: 500 });
  }
}
