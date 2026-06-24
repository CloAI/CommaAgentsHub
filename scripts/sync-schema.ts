import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const sourcePath = fileURLToPath(
  import.meta.resolve("@comma-agents/core/hub/comma-project.schema.json"),
);
const targetPath = path.join(process.cwd(), "schemas", "comma-project.schema.json");
const source = await readFile(sourcePath, "utf8");

if (process.argv.includes("--check")) {
  const target = await readFile(targetPath, "utf8").catch(() => "");
  if (target !== source) {
    throw new Error(
      "schemas/comma-project.schema.json differs from @comma-agents/core. Run `bun run sync-schema`.",
    );
  }
  console.log("comma-project.schema.json matches @comma-agents/core.");
} else {
  await writeFile(targetPath, source, "utf8");
  console.log("Updated schemas/comma-project.schema.json from @comma-agents/core.");
}
