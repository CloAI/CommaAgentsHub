import type {
  CommaProjectManifest,
  HubArtifactKind,
  HubPackage,
  HubRegistry,
  HubRegistryArtifact,
  ProjectArtifactEntry,
} from "@comma-agents/core/hub";

export type ArtifactKind = HubArtifactKind;
export type ArtifactManifestEntry = ProjectArtifactEntry;
export type RegistryArtifact = HubRegistryArtifact;
export type RegistryPackage = HubPackage;
export type Registry = HubRegistry;
export type { CommaProjectManifest };

export type PackageValidationResult = {
  /** Package name as derived from the folder path (@scope/project-slug). */
  name: string;
  /** Absolute path to the package root. */
  packageRoot: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  /** Parsed manifest, present when it parsed successfully. */
  manifest?: CommaProjectManifest;
};

export type ValidationSummary = {
  valid: boolean;
  total: number;
  validCount: number;
  invalidCount: number;
  results: PackageValidationResult[];
};
