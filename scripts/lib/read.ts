/**
 * Filesystem read helpers. Declarative artifact files (strategies, agents)
 * may be authored as JSON or YAML; these helpers parse data only and never
 * execute or import package code.
 */

import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import stripJsonComments from "strip-json-comments";

export async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

export async function readTextFile(p: string): Promise<string> {
  return readFile(p, "utf8");
}

export async function readJsonFile(p: string): Promise<unknown> {
  const text = await readTextFile(p);
  return JSON.parse(text);
}

/**
 * Read and parse a declarative file as data, choosing the parser by
 * extension. Supports `.json`, `.jsonc`, `.yaml`, and `.yml`. YAML is parsed in
 * data-only mode (no custom tags / code execution).
 */
export async function readJsonOrYamlFile(p: string): Promise<unknown> {
  const ext = path.extname(p).toLowerCase();
  const text = await readTextFile(p);
  if (ext === ".yaml" || ext === ".yml") {
    return parseYaml(text);
  }
  if (ext === ".json" || ext === ".jsonc") {
    return JSON.parse(stripJsonComments(text));
  }
  throw new Error(`Unsupported declarative file extension: "${ext}"`);
}
