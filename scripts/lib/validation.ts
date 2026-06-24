/**
 * Package validation for CommaAgentsHub.
 *
 * This module performs static, data-only validation of community packages.
 * It NEVER imports or executes package code: tools, custom flows, and entry
 * files are only checked for existence and extension. Declarative strategy
 * and agent files are parsed as data (JSON/YAML) and structurally validated.
 *
 * The implementation is intentionally modular so deeper validation can be
 * layered on later without reshaping the public API.
 */

import path from "node:path";
import { lstat, realpath } from "node:fs/promises";
import { AgentDescriptionSchema, StrategySchema } from "@comma-agents/core";
import { CommaProjectManifestSchema } from "@comma-agents/core/hub";

import {
  MANIFEST_FILENAME,
  PACKAGES_DIRNAME,
  findPackageRoots,
  packageNameFromRoot,
  resolvePackagePath,
} from "./paths.js";
import { fileExists, readJsonFile, readJsonOrYamlFile } from "./read.js";
import type {
  ArtifactKind,
  ArtifactManifestEntry,
  CommaProjectManifest,
  PackageValidationResult,
  ValidationSummary,
} from "./types.js";

const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs"]);
const FILESYSTEM_TOOLS = new Set([
  "read_file", "list_directory", "search_files", "glob", "create_file",
  "write_file", "edit_file", "delete_file", "restore_file", "move_file",
]);
const SHELL_TOOLS = new Set(["run_command"]);
const NETWORK_TOOLS = new Set(["webfetch"]);
const BUILT_IN_TOOLS = new Set([
  ...FILESYSTEM_TOOLS,
  ...SHELL_TOOLS,
  ...NETWORK_TOOLS,
  "load_skill", "list_skills", "list_strategy", "launch_strategy",
  "todo_add", "todo_complete", "todo_get", "todo_get_next", "todo_remove",
  "todo_clear", "ask_question", "lsp_request",
]);

const ARTIFACT_KINDS: ArtifactKind[] = [
  "strategies",
  "agents",
  "flows",
  "tools",
];

/** Validate every package in the repo (optionally a single named one). */
export async function validateAllPackages(options?: {
  packageName?: string;
  repoRoot?: string;
}): Promise<ValidationSummary> {
  const repoRoot = options?.repoRoot ?? process.cwd();
  const packagesRoot = path.join(repoRoot, PACKAGES_DIRNAME);
  const roots = await findPackageRoots(repoRoot);

  const selected = options?.packageName
    ? roots.filter(
        (root) =>
          packageNameFromRoot(packagesRoot, root) === options.packageName,
      )
    : roots;

  const results: PackageValidationResult[] = [];
  for (const root of selected) {
    results.push(await validatePackage(root, repoRoot));
  }

  if (options?.packageName && selected.length === 0) {
    results.push({
      name: options.packageName,
      packageRoot: path.join(packagesRoot, options.packageName),
      valid: false,
      errors: [`Package "${options.packageName}" was not found.`],
      warnings: [],
    });
  }

  const validCount = results.filter((r) => r.valid).length;
  return {
    valid: results.length > 0 && results.every((r) => r.valid),
    total: results.length,
    validCount,
    invalidCount: results.length - validCount,
    results,
  };
}

/** Validate a single package given its root and the repo root. */
export async function validatePackage(
  packageRoot: string,
  repoRoot: string,
): Promise<PackageValidationResult> {
  const packagesRoot = path.join(repoRoot, PACKAGES_DIRNAME);
  const derivedName = packageNameFromRoot(packagesRoot, packageRoot);
  const errors: string[] = [];
  const warnings: string[] = [];

  const result: PackageValidationResult = {
    name: derivedName,
    packageRoot,
    valid: false,
    errors,
    warnings,
  };

  // 1. Manifest exists.
  const manifestPath = path.join(packageRoot, MANIFEST_FILENAME);
  if (!(await fileExists(manifestPath))) {
    errors.push(`Missing ${MANIFEST_FILENAME}.`);
    return finalize(result);
  }

  // 2. Manifest parses.
  let raw: unknown;
  try {
    raw = await readJsonFile(manifestPath);
  } catch (err) {
    errors.push(`Failed to parse ${MANIFEST_FILENAME}: ${asMessage(err)}`);
    return finalize(result);
  }

  // 3. Manifest validates against the schema.
  const parsed = CommaProjectManifestSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const at = issue.path.length ? issue.path.join(".") : "(root)";
      errors.push(`Manifest schema error at "${at}": ${issue.message}`);
    }
    return finalize(result);
  }
  const manifest = parsed.data as CommaProjectManifest;
  result.manifest = manifest;

  // 4. manifest.name matches folder-derived package name.
  if (manifest.name !== derivedName) {
    errors.push(
      `Manifest name "${manifest.name}" does not match package path "${derivedName}".`,
    );
  }

  // 5. README.md exists.
  if (!(await fileExists(path.join(packageRoot, "README.md")))) {
    errors.push("Missing README.md.");
  }

  // 12 (foundational). Resolve every declared path safely; reject traversal.
  // 13. Exposed artifacts require a non-empty description.
  // 7-10. Declared paths exist.
  await validateArtifactPaths(manifest, packageRoot, errors);

  // 11. entry exists if present.
  if (manifest.entry !== undefined) {
    const resolved = safeResolve(packageRoot, manifest.entry, "entry", errors);
    if (resolved) {
      if (!CODE_EXTENSIONS.has(path.extname(resolved).toLowerCase())) {
        errors.push(
          `entry "${manifest.entry}" must be a code file (.ts, .tsx, .js, .mjs).`,
        );
      }
      if (!(await fileExists(resolved))) {
        errors.push(`entry path "${manifest.entry}" does not exist.`);
      } else {
        await validateRealPath(packageRoot, resolved, "entry", errors);
      }
    }
  }

  // 14. At least one exposed artifact.
  if (countExposed(manifest) === 0) {
    errors.push("Package has no exposed artifacts (set expose: true on at least one).");
  }

  // 15. flows/tools/entry require permissions.executesCode === true.
  const hasExecutable =
    hasEntries(manifest.flows) ||
    hasEntries(manifest.tools) ||
    manifest.entry !== undefined;
  if (hasExecutable && manifest.permissions?.executesCode !== true) {
    errors.push(
      "Packages declaring flows, tools, or an entry must set permissions.executesCode to true.",
    );
  }

  // 16. Environment variables must be documented.
  if (manifest.environment) {
    for (const [key, def] of Object.entries(manifest.environment) as Array<
      [string, { readonly description?: string }]
    >) {
      if (!def?.description || def.description.trim() === "") {
        errors.push(`Environment variable "${key}" is missing a description.`);
      }
    }
  }

  // 17. Strategy files are minimally validated.
  const usedTools = new Set<string>();
  if (manifest.strategies) {
    for (const [id, entry] of artifactEntries(manifest.strategies)) {
      await validateStrategyFile(id, entry, packageRoot, manifest, usedTools, errors);
    }
  }

  requirePermission(manifest, usedTools, FILESYSTEM_TOOLS, "filesystem", errors);
  requirePermission(manifest, usedTools, SHELL_TOOLS, "shell", errors);
  requirePermission(manifest, usedTools, NETWORK_TOOLS, "network", errors);

  // 18. Standalone agent files are minimally validated.
  if (manifest.agents) {
    for (const [id, entry] of artifactEntries(manifest.agents)) {
      await validateAgentFile(id, entry, packageRoot, errors);
    }
  }

  // 19. Custom flows and tools: existence + extension only, never imported.
  for (const kind of ["flows", "tools"] as const) {
    const map = manifest[kind];
    if (!map) continue;
    for (const [id, entry] of artifactEntries(map)) {
      await validateCodeArtifact(kind, id, entry, packageRoot, errors);
    }
  }

  return finalize(result);
}

function finalize(result: PackageValidationResult): PackageValidationResult {
  result.valid = result.errors.length === 0;
  return result;
}

async function validateArtifactPaths(
  manifest: CommaProjectManifest,
  packageRoot: string,
  errors: string[],
): Promise<void> {
  for (const kind of ARTIFACT_KINDS) {
    const map = manifest[kind];
    if (!map) continue;
    for (const [id, entry] of artifactEntries(map)) {
      // 13. Exposed artifacts require a non-empty description.
      if (
        entry.expose === true &&
        (!entry.description || entry.description.trim() === "")
      ) {
        errors.push(
          `Exposed ${singular(kind)} "${id}" is missing a description.`,
        );
      }
      // 12 + 7-10. Resolve safely and confirm existence.
      const resolved = safeResolve(
        packageRoot,
        entry.path,
        `${singular(kind)} "${id}"`,
        errors,
      );
      if (resolved && !(await fileExists(resolved))) {
        errors.push(
          `${capitalize(singular(kind))} "${id}" path "${entry.path}" does not exist.`,
        );
      }
      if (resolved && (await fileExists(resolved))) {
        await validateRealPath(packageRoot, resolved, `${singular(kind)} "${id}"`, errors);
      }
    }
  }
}

async function validateStrategyFile(
  id: string,
  entry: ArtifactManifestEntry,
  packageRoot: string,
  manifest: CommaProjectManifest,
  usedTools: Set<string>,
  errors: string[],
): Promise<void> {
  const resolved = safeResolve(packageRoot, entry.path, `strategy "${id}"`, errors);
  if (!resolved || !(await fileExists(resolved))) return;

  let data: unknown;
  try {
    data = await readJsonOrYamlFile(resolved);
  } catch (err) {
    errors.push(`Strategy "${id}" failed to parse: ${asMessage(err)}`);
    return;
  }

  // Structural validation is delegated to the canonical CommaAgents schema
  // (@comma-agents/core). This keeps the Hub's notion of a valid strategy in
  // lockstep with the runtime that actually executes it.
  const parsed = StrategySchema.safeParse(data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const at = issue.path.length ? issue.path.join(".") : "(root)";
      errors.push(`Strategy "${id}" schema error at "${at}": ${issue.message}`);
    }
    return;
  }

  // Cross-references the schema cannot express: every agent named in the flow
  // (and any cycle observer) must be a declared agent of this strategy.
  const agentNames = new Set(Object.keys(parsed.data.agents ?? {}));
  checkFlowAgentRefs(id, "flow", parsed.data.flow, agentNames, errors);

  for (const [agentName, rawAgent] of Object.entries(parsed.data.agents ?? {})) {
    const agent = rawAgent as { readonly tools?: readonly string[]; readonly systemPrompt?: string };
    if (!("tools" in agent) || !Array.isArray(agent.tools)) continue;
    for (const tool of agent.tools) {
      usedTools.add(tool);
      if (!BUILT_IN_TOOLS.has(tool) && !manifest.tools?.[tool]) {
        errors.push(
          `Strategy "${id}" agent "${agentName}" uses undeclared custom tool "${tool}".`,
        );
      }
    }
    if (!("systemPrompt" in agent) || typeof agent.systemPrompt !== "string") continue;
    const prompt = agent.systemPrompt;
    if (!prompt.startsWith("./") && !prompt.startsWith("../")) continue;
    const strategyDir = path.dirname(resolved);
    const promptPath = safeResolve(packageRoot, path.relative(packageRoot, path.resolve(strategyDir, prompt)), `prompt for strategy "${id}"`, errors);
    if (!promptPath) continue;
    if (!(await fileExists(promptPath))) {
      errors.push(`Strategy "${id}" prompt asset "${prompt}" does not exist.`);
    } else {
      await validateRealPath(packageRoot, promptPath, `prompt for strategy "${id}"`, errors);
    }
  }
}

function requirePermission(
  manifest: CommaProjectManifest,
  usedTools: Set<string>,
  capabilityTools: Set<string>,
  permission: "filesystem" | "shell" | "network",
  errors: string[],
): void {
  const used = [...usedTools].some((tool) => capabilityTools.has(tool));
  if (used && manifest.permissions?.[permission] !== true) {
    errors.push(`Built-in tool usage requires permissions.${permission} to be true.`);
  }
}

async function validateRealPath(
  packageRoot: string,
  candidate: string,
  label: string,
  errors: string[],
): Promise<void> {
  try {
    const [root, target, stats] = await Promise.all([
      realpath(packageRoot),
      realpath(candidate),
      lstat(candidate),
    ]);
    const relative = path.relative(root, target);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      errors.push(`${capitalize(label)} resolves outside the package root.`);
    }
    if (!stats.isFile()) {
      errors.push(`${capitalize(label)} must be a regular file.`);
    }
  } catch (error) {
    errors.push(`${capitalize(label)} could not be inspected: ${asMessage(error)}`);
  }
}

/**
 * Walk a (schema-valid) strategy flow and report any step or cycle observer
 * that references an agent the strategy does not declare. The shape is already
 * guaranteed by `StrategySchema`, so this only checks referential integrity.
 */
function checkFlowAgentRefs(
  strategyId: string,
  location: string,
  flow: unknown,
  agentNames: Set<string>,
  errors: string[],
): void {
  if (!isRecord(flow)) return;

  if (flow.type === "cycle" && typeof flow.observer === "string") {
    if (!agentNames.has(flow.observer)) {
      errors.push(
        `Strategy "${strategyId}" ${location} observer "${flow.observer}" is not a declared agent.`,
      );
    }
  }

  if (!Array.isArray(flow.steps)) return;
  flow.steps.forEach((step, index) => {
    const stepLoc = `${location}.steps[${index}]`;
    if (!isRecord(step)) return;
    if (typeof step.agent === "string") {
      if (!agentNames.has(step.agent)) {
        errors.push(
          `Strategy "${strategyId}" ${stepLoc} references unknown agent "${step.agent}".`,
        );
      }
    } else {
      // Nested flow.
      checkFlowAgentRefs(strategyId, stepLoc, step, agentNames, errors);
    }
  });
}

async function validateAgentFile(
  id: string,
  entry: ArtifactManifestEntry,
  packageRoot: string,
  errors: string[],
): Promise<void> {
  const resolved = safeResolve(packageRoot, entry.path, `agent "${id}"`, errors);
  if (!resolved || !(await fileExists(resolved))) return;

  let data: unknown;
  try {
    data = await readJsonOrYamlFile(resolved);
  } catch (err) {
    errors.push(`Agent "${id}" failed to parse: ${asMessage(err)}`);
    return;
  }

  // Standalone agent files are validated against the canonical agent
  // description schema from @comma-agents/core.
  const parsed = AgentDescriptionSchema.safeParse(data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const at = issue.path.length ? issue.path.join(".") : "(root)";
      errors.push(`Agent "${id}" schema error at "${at}": ${issue.message}`);
    }
  }
}

async function validateCodeArtifact(
  kind: "flows" | "tools",
  id: string,
  entry: ArtifactManifestEntry,
  packageRoot: string,
  errors: string[],
): Promise<void> {
  const resolved = safeResolve(
    packageRoot,
    entry.path,
    `${singular(kind)} "${id}"`,
    errors,
  );
  if (!resolved) return;
  // Existence already checked in validateArtifactPaths; only check extension
  // here. Never import or execute the file.
  if (!CODE_EXTENSIONS.has(path.extname(resolved).toLowerCase())) {
    errors.push(
      `${capitalize(singular(kind))} "${id}" must be a code file (.ts, .tsx, .js, .mjs).`,
    );
  }
}

function safeResolve(
  packageRoot: string,
  relativePath: string,
  label: string,
  errors: string[],
): string | undefined {
  try {
    return resolvePackagePath(packageRoot, relativePath);
  } catch (err) {
    errors.push(`${capitalize(label)} ${asMessage(err)}`);
    return undefined;
  }
}

function countExposed(manifest: CommaProjectManifest): number {
  let count = 0;
  for (const kind of ARTIFACT_KINDS) {
    const map = manifest[kind];
    if (!map) continue;
    for (const [, entry] of artifactEntries(map)) {
      if (entry.expose === true) count++;
    }
  }
  return count;
}

function artifactEntries(
  map: Readonly<Record<string, ArtifactManifestEntry>>,
): Array<[string, ArtifactManifestEntry]> {
  return Object.entries(map) as Array<[string, ArtifactManifestEntry]>;
}

function hasEntries(map?: Record<string, unknown>): boolean {
  return !!map && Object.keys(map).length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function singular(kind: ArtifactKind): string {
  const map: Record<ArtifactKind, string> = {
    strategies: "strategy",
    agents: "agent",
    flows: "flow",
    tools: "tool",
  };
  return map[kind];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function asMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
