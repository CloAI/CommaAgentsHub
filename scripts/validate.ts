/**
 * CLI: validate CommaAgentsHub packages.
 *
 *   bun run scripts/validate.ts                 validate all packages
 *   bun run scripts/validate.ts --json          machine-readable summary
 *   bun run scripts/validate.ts --package @s/p  validate one package
 *
 * Exit code 0 when all selected packages are valid, 1 otherwise.
 */

import { validateAllPackages } from "./lib/validation.js";
import type { ValidationSummary } from "./lib/types.js";

function parseArgs(argv: string[]): { json: boolean; packageName?: string } {
  let json = false;
  let packageName: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") {
      json = true;
    } else if (arg === "--package") {
      packageName = argv[++i];
    } else if (arg.startsWith("--package=")) {
      packageName = arg.slice("--package=".length);
    }
  }
  return { json, packageName };
}

function printHumanReport(summary: ValidationSummary): void {
  console.log("Validating CommaAgentsHub packages...\n");

  if (summary.total === 0) {
    console.log("No packages found.\n");
  }

  for (const result of summary.results) {
    if (result.valid) {
      console.log(`✓ ${result.name}`);
    } else {
      console.log(`✗ ${result.name}`);
      for (const err of result.errors) {
        console.log(`  - ${err}`);
      }
    }
    for (const warn of result.warnings) {
      console.log(`  ! ${warn}`);
    }
  }

  console.log("\nSummary:");
  console.log(`  Packages: ${summary.total}`);
  console.log(`  Valid: ${summary.validCount}`);
  console.log(`  Invalid: ${summary.invalidCount}`);
}

async function main(): Promise<void> {
  const { json, packageName } = parseArgs(process.argv.slice(2));
  const summary = await validateAllPackages({ packageName });

  if (json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    printHumanReport(summary);
  }

  process.exit(summary.valid ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
