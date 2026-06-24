# Welcome to CommaAgents Hub 📚

## Share reusable building blocks for CommaAgents

CommaAgents Hub is the community registry for reusable CommaAgents packages.
It is where contributors publish strategies, agents, custom flows, and tools
that other users can discover and install.

Each package is stored in this repository as source, reviewed through a pull
request, and added to the generated [`registry.json`](./registry.json) after it
is merged.

## What can you build? 🛠️

### Strategies 🧩

Package complete agent workflows using declarative JSON, JSONC, or YAML.
Strategies can compose the built-in `sequential`, `broadcast`, and `cycle`
flow types.

### Agents 🤖

Share standalone agent definitions for focused roles, prompts, and tool
configurations.

### Custom flows 🌊

Publish reusable coded flow implementations when the built-in orchestration
types do not fit your use case.

### Tools 🔧

Extend what agents can do with custom tools. Packages containing executable
code must declare that capability and require explicit approval when installed.

## How the Hub works

Every package has a scoped identity:

```text
@scope/project-slug
```

and lives at the matching repository path:

```text
packages/@scope/project-slug/
```

Its `comma-project.json` manifest declares the package metadata, artifacts,
environment requirements, and permissions. The manifest `name` must exactly
match the folder path.

A minimal package looks like this:

```text
packages/@scope/project-slug/
├── comma-project.json
├── README.md
└── strategies/
    └── code-review.yaml
```

Only artifacts marked with `"expose": true` are published in the registry.
Unexposed artifacts remain available to other files inside the package but are
not listed as public exports.

## Discover and install packages 🔎

In the CommaAgents TUI, open the command palette and select **Hub Packages** to
browse, install, update, or remove packages. Installing a package that declares
executable code requires an additional confirmation.

Applications using Core directly can use the Hub manager:

```ts
import { createHubManager } from "@comma-agents/core/hub";

const hub = createHubManager();
const packages = await hub.listAvailable();
await hub.install("@comma/core-strategies");
```

## Contribute a package 🙌

1. Fork this repository.
2. Copy [`templates/package`](./templates/package) to
   `packages/@your-scope/your-project`.
3. Update `comma-project.json`, including its name, version, metadata, and
   permissions.
4. Add your strategies, agents, custom flows, or tools.
5. Mark each public artifact with `"expose": true` and provide a description.
6. Document the package in its `README.md`.
7. Run the repository checks locally.
8. Open a pull request using the provided template.

Community pull requests may change files only under `packages/`. The schema,
validation scripts, workflows, root configuration, and generated registry are
maintainer-owned trust boundaries.

## Validate your package ✅

Install dependencies and run the full check:

```bash
pnpm install
pnpm check
```

You can also run individual checks:

```bash
pnpm validate
pnpm validate --package @your-scope/your-project
pnpm build-registry
```

`pnpm check` verifies schema synchronization, validates every package and its
declarative artifacts, and builds a candidate registry without modifying the
checked-in registry.

## Package requirements

- `comma-project.json` must include a scoped `name` and semantic `version`.
- The manifest name must match `packages/@scope/project-slug`.
- Every package must include a `README.md`.
- At least one artifact must set `"expose": true`.
- Every exposed artifact must include a non-empty `description`.
- Every declared artifact path must stay inside the package and exist.
- Every environment variable must include a description.
- Packages with tools, custom coded flows, or an `entry` file must set
  `permissions.executesCode` to `true`.
- Strategies using network, filesystem, or shell tools must declare the
  matching permission.

See the generated
[`comma-project.json` schema](./schemas/comma-project.schema.json) and the
[`package template`](./templates/package/comma-project.json) for the complete
manifest shape.

## Registry and security model 🔒

The public registry is generated from merged package manifests. Contributors
do not edit `registry.json` directly; the trusted main-branch workflow
regenerates it after package changes are merged.

Hub validation is static and data-only:

- Declarative strategies and agents are parsed and validated against the
  schemas published by `@comma-agents/core`.
- Community tools, custom flows, and entry files are checked for safe paths and
  supported extensions but are never imported or executed by validation.
- Package permissions are recorded in the registry so users can review
  capabilities before installation.
- Installs are resolved from an immutable repository commit so registry
  metadata and package source refer to the same version.

## Why contribute? 🌟

- Share useful agent workflows with the CommaAgents community.
- Build on reusable packages instead of duplicating project-specific setup.
- Improve packages through public review and collaboration.
- Help establish clear, inspectable patterns for agent orchestration.

## Ready to contribute?

Start with [`templates/package`](./templates/package), review
[`@example/code-review-basic`](./packages/@example/code-review-basic), and open
a pull request when `pnpm check` passes.
