import { NextResponse } from "next/server";
import { db, prospects } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const format = searchParams.get("format") || "csv";

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const list = await db
      .select()
      .from(prospects)
      .where(eq(prospects.projectId, projectId))
      .orderBy(desc(prospects.createdAt));

    if (format === "csv") {
      const csvHeader = "ID,Name,Contact Info,Status,Notes,Objection,Created At\n";
      const csvRows = list
        .map((p) => {
          const escape = (str: string | null) => {
            if (!str) return '""';
            return `"${str.replace(/"/g, '""')}"`;
          };
          return `${escape(p.id)},${escape(p.name)},${escape(p.contactInfo)},${escape(p.status)},${escape(p.notes)},${escape(p.objection)},${escape(new Date(p.createdAt).toISOString())}`;
        })
        .join("\n");

      return new Response(csvHeader + csvRows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="prospects-${projectId}.csv"`,
        },
      });
    } else {
      // Markdown
      const headers = "| Name | Contact Info | Status | Notes | Objection |\n|---|---|---|---|---|\n";
      const rows = list
        .map((p) => {
          const sanitize = (str: string | null) => {
            if (!str) return "";
            return str.replace(/\|/g, "\\|"); // escape pipe characters in markdown
          };
          return `| ${sanitize(p.name)} | ${sanitize(p.contactInfo)} | ${sanitize(p.status)} | ${sanitize(p.notes)} | ${sanitize(p.objection)} |`;
        })
        .join("\n");

      return new Response(headers + rows, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="prospects-${projectId}.md"`,
        },
      });
    }
  } catch (error: any) {
    console.error("Error exporting prospects:", error);
    return NextResponse.json({ error: "Failed to export prospects" }, { status: 500 });
  }
}
