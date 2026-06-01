import { NextResponse } from "next/server";
import { db, projects } from "@/lib/db";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(projects).orderBy(desc(projects.createdAt));
    return NextResponse.json({ projects: list });
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newProject = {
      id: crypto.randomUUID(),
      name,
      description: description || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.insert(projects).values(newProject);
    return NextResponse.json(newProject);
  } catch (error: any) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
