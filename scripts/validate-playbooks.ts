import fs from "fs";
import path from "path";
import yaml from "yaml";
import { playbookSchema } from "../src/lib/schemas/playbook";

function validatePlaybooks() {
  const playbooksDir = path.join(process.cwd(), "data/playbooks");
  if (!fs.existsSync(playbooksDir)) {
    console.error(`Error: Playbooks directory not found at ${playbooksDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(playbooksDir);
  const yamlFiles = files.filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

  if (yamlFiles.length === 0) {
    console.warn("Warning: No playbook YAML files found.");
    process.exit(0);
  }

  console.log(`Validating ${yamlFiles.length} playbooks...`);
  let hasErrors = false;

  for (const file of yamlFiles) {
    const filePath = path.join(playbooksDir, file);
    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const parsed = yaml.parse(fileContent);
      
      const validated = playbookSchema.safeParse(parsed);
      if (validated.success) {
        console.log(`✅ [VALID] ${file} - "${validated.data.name}"`);
      } else {
        console.error(`❌ [INVALID] ${file}`);
        console.error(JSON.stringify(validated.error.format(), null, 2));
        hasErrors = true;
      }
    } catch (e: any) {
      console.error(`💥 [ERROR] Failed to read or parse file ${file}:`, e.message);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error("\nValidation failed! Please fix the errors listed above.");
    process.exit(1);
  } else {
    console.log("\nAll playbooks validated successfully!");
    process.exit(0);
  }
}

validatePlaybooks();
