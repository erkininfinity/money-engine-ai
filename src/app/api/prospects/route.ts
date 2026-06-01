import { NextResponse } from "next/server";
import { db, prospects } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const list = await db
      .select()
      .from(prospects)
      .where(eq(prospects.projectId, projectId))
      .orderBy(desc(prospects.createdAt));

    return NextResponse.json({ prospects: list });
  } catch (error: any) {
    console.error("Error fetching prospects:", error);
    return NextResponse.json({ error: "Failed to fetch prospects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, sprintId, name, contactInfo, status, notes, objection } = body;

    if (!projectId || !name || !contactInfo || !status) {
      return NextResponse.json(
        { error: "projectId, name, contactInfo, and status are required" },
        { status: 400 }
      );
    }

    const newProspect = {
      id: crypto.randomUUID(),
      projectId,
      sprintId: sprintId || null,
      name,
      contactInfo,
      status,
      notes: notes || null,
      objection: objection || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.insert(prospects).values(newProspect);
    return NextResponse.json(newProspect);
  } catch (error: any) {
    console.error("Error creating prospect:", error);
    return NextResponse.json({ error: "Failed to create prospect" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, notes, objection, sprintId } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const updateData: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (objection !== undefined) updateData.objection = objection;
    if (sprintId !== undefined) updateData.sprintId = sprintId;

    await db.update(prospects).set(updateData).where(eq(prospects.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating prospect:", error);
    return NextResponse.json({ error: "Failed to update prospect" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await db.delete(prospects).where(eq(prospects.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting prospect:", error);
    return NextResponse.json({ error: "Failed to delete prospect" }, { status: 500 });
  }
}
