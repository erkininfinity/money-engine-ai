import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "yaml";
import { playbookSchema, RevenuePlaybook } from "@/lib/schemas/playbook";

export async function GET() {
  try {
    const playbooksDir = path.join(process.cwd(), "data/playbooks");
    if (!fs.existsSync(playbooksDir)) {
      return NextResponse.json({ playbooks: [] });
    }

    const files = fs.readdirSync(playbooksDir);
    const playbooks: RevenuePlaybook[] = [];

    for (const file of files) {
      if (file.endsWith(".yaml") || file.endsWith(".yml")) {
        const filePath = path.join(playbooksDir, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const parsed = yaml.parse(fileContent);
        
        const validated = playbookSchema.safeParse(parsed);
        if (validated.success) {
          playbooks.push(validated.data);
        } else {
          console.warn(`Playbook ${file} failed validation:`, validated.error.format());
          // We can still push parsed if we want fallback, but let's be strict in the registry
        }
      }
    }

    return NextResponse.json({ playbooks });
  } catch (error: any) {
    console.error("Error loading playbooks in API:", error);
    return NextResponse.json(
      { error: "Failed to load playbooks library", message: error.message },
      { status: 500 }
    );
  }
}
