/**
 * Path helpers for locating packages and safely resolving manifest-declared
 * paths. All declared paths are treated as untrusted: they must stay inside
 * the package root and must not be absolute.
 */

import { readdir, stat } from "node:fs/promises";
import path from "node:path";

export const MANIFEST_FILENAME = "comma-project.json";
export const PACKAGES_DIRNAME = "packages";

/** Convert any path to POSIX (forward-slash) separators. */
export function toPosixPath(p: string): string {
  return p.split(path.sep).join("/");
}

/**
 * Returns true if `child` is `parent` itself or nested within it.
 * Both inputs are resolved to absolute paths before comparison.
 */
export function isSubpath(parent: string, child: string): boolean {
  const resolvedParent = path.resolve(parent);
  const resolvedChild = path.resolve(child);
  if (resolvedParent === resolvedChild) return true;
  const rel = path.relative(resolvedParent, resolvedChild);
  return (
    rel.length > 0 &&
    !rel.startsWith("..") &&
    !path.isAbsolute(rel)
  );
}

/**
 * Resolve a manifest-declared relative path against the package root.
 * Throws if the path is absolute or escapes the package root.
 */
export function resolvePackagePath(
  packageRoot: string,
  relativePath: string,
): string {
  if (path.isAbsolute(relativePath)) {
    throw new Error(`Path "${relativePath}" must be relative, not absolute.`);
  }
  const resolved = path.resolve(packageRoot, relativePath);
  if (!isSubpath(packageRoot, resolved)) {
    throw new Error(
      `Path "${relativePath}" escapes the package root.`,
    );
  }
  return resolved;
}

/**
 * Derive the package identity (@scope/project-slug) from a package root,
 * relative to the `packages/` directory. Always uses POSIX separators.
 */
export function packageNameFromRoot(
  packagesRoot: string,
  packageRoot: string,
): string {
  const rel = toPosixPath(path.relative(packagesRoot, packageRoot));
  return rel;
}

/**
 * Find all package roots under `<repoRoot>/packages/@scope/project-slug`.
 * A package root is a directory that directly contains comma-project.json.
 * Returns absolute paths sorted lexicographically.
 */
export async function findPackageRoots(repoRoot: string): Promise<string[]> {
  const packagesRoot = path.join(repoRoot, PACKAGES_DIRNAME);
  const roots: string[] = [];

  let scopeEntries: string[];
  try {
    scopeEntries = await readdir(packagesRoot);
  } catch {
    return [];
  }

  for (const scope of scopeEntries) {
    if (!scope.startsWith("@")) continue;
    const scopeDir = path.join(packagesRoot, scope);
    if (!(await isDirectory(scopeDir))) continue;

    let projectEntries: string[];
    try {
      projectEntries = await readdir(scopeDir);
    } catch {
      continue;
    }

    for (const project of projectEntries) {
      const projectDir = path.join(scopeDir, project);
      if (!(await isDirectory(projectDir))) continue;
      if (await isFile(path.join(projectDir, MANIFEST_FILENAME))) {
        roots.push(projectDir);
      }
    }
  }

  roots.sort((a, b) => a.localeCompare(b));
  return roots;
}

async function isDirectory(p: string): Promise<boolean> {
  try {
    return (await stat(p)).isDirectory();
  } catch {
    return false;
  }
}

async function isFile(p: string): Promise<boolean> {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}
