/**
 * CLI: build registry.json from validated package manifests.
 *
 *   bun run scripts/build-registry.ts            write registry.json
 *   bun run scripts/build-registry.ts --check    compare without writing
 *
 * Validation runs first; the registry is never built from invalid packages.
 * Only artifacts with `expose: true` are included. Output is deterministic:
 * packages sorted by name, artifacts by id, POSIX paths, no timestamps.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { PACKAGES_DIRNAME, packageNameFromRoot, toPosixPath } from "./lib/paths.js";
import { validateAllPackages } from "./lib/validation.js";
import type {
  ArtifactKind,
  CommaProjectManifest,
  Registry,
  RegistryArtifact,
  RegistryPackage,
} from "./lib/types.js";

const ARTIFACT_KINDS: ArtifactKind[] = [
  "strategies",
  "agents",
  "flows",
  "tools",
];

function buildArtifacts(
  manifest: CommaProjectManifest,
  kind: ArtifactKind,
  packagePath: string,
): RegistryArtifact[] {
  const map = manifest[kind];
  if (!map) return [];
  const artifacts: RegistryArtifact[] = [];
  for (const [id, entry] of Object.entries(map) as Array<
    [string, import("@comma-agents/core/hub").ProjectArtifactEntry]
  >) {
    if (entry.expose !== true) continue;
    const relPath = entry.path.replace(/^\.\//, "");
    artifacts.push({
      id,
      ref: `${manifest.name}/${kind}/${id}`,
      path: toPosixPath(path.posix.join(packagePath, relPath)),
      ...(entry.description ? { description: entry.description } : {}),
    });
  }
  artifacts.sort((a, b) => a.id.localeCompare(b.id));
  return artifacts;
}

function buildPackage(
  manifest: CommaProjectManifest,
  packagePath: string,
): RegistryPackage {
  return {
    name: manifest.name,
    version: manifest.version,
    ...(manifest.description ? { description: manifest.description } : {}),
    ...(manifest.license ? { license: manifest.license } : {}),
    path: packagePath,
    ...(manifest.author ? { author: manifest.author } : {}),
    ...(manifest.contributors ? { contributors: manifest.contributors } : {}),
    ...(manifest.keywords ? { keywords: manifest.keywords } : {}),
    exports: {
      strategies: buildArtifacts(manifest, "strategies", packagePath),
      agents: buildArtifacts(manifest, "agents", packagePath),
      flows: buildArtifacts(manifest, "flows", packagePath),
      tools: buildArtifacts(manifest, "tools", packagePath),
    },
    ...(manifest.environment ? { environment: manifest.environment } : {}),
    ...(manifest.permissions ? { permissions: manifest.permissions } : {}),
    ...(manifest.links ? { links: manifest.links } : {}),
  };
}

async function buildRegistry(repoRoot: string): Promise<Registry> {
  const summary = await validateAllPackages({ repoRoot });
  if (!summary.valid) {
    console.error("Cannot build registry: validation failed.\n");
    for (const result of summary.results) {
      if (result.valid) continue;
      console.error(`✗ ${result.name}`);
      for (const err of result.errors) console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  const packagesRoot = path.join(repoRoot, PACKAGES_DIRNAME);
  const packages: RegistryPackage[] = [];

  for (const result of summary.results) {
    if (!result.manifest) continue;
    const name = packageNameFromRoot(packagesRoot, result.packageRoot);
    const packagePath = toPosixPath(path.join(PACKAGES_DIRNAME, name));
    packages.push(buildPackage(result.manifest, packagePath));
  }

  packages.sort((a, b) => a.name.localeCompare(b.name));
  return { version: 1, packages };
}

function serialize(registry: Registry): string {
  return JSON.stringify(registry, null, 2) + "\n";
}

async function main(): Promise<void> {
  const repoRoot = process.cwd();
  const check = process.argv.slice(2).includes("--check");
  const candidate = process.argv.slice(2).includes("--candidate");
  const registryPath = path.join(repoRoot, "registry.json");

  const registry = await buildRegistry(repoRoot);
  const next = serialize(registry);

  if (candidate) {
    console.log(next);
    return;
  }

  if (check) {
    let current: string | null = null;
    try {
      current = await readFile(registryPath, "utf8");
    } catch {
      current = null;
    }
    if (current !== next) {
      console.error(
        "registry.json is out of date. Run `bun run build-registry` and commit the result.",
      );
      process.exit(1);
    }
    console.log("registry.json is up to date.");
    return;
  }

  await writeFile(registryPath, next, "utf8");
  console.log(`Wrote registry.json (${registry.packages.length} package(s)).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
