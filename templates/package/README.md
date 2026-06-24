# @user/project-slug

> Replace this template with a description of your CommaAgents package.

## What it does

Briefly explain what this package does and when someone would use it.

## Exported strategy

Document each artifact you mark with `expose: true`. Only exposed artifacts
appear in `registry.json`.

| Artifact | Type | Ref | Description |
| --- | --- | --- | --- |
| `code-review` | strategy | `@user/project-slug/strategies/code-review` | Analyze code and produce actionable review comments. |

## Requirements

List any model providers, environment variables, or permissions your package
needs. Keep declarative strategies free of network/filesystem/shell access
unless they truly need it.

## Usage expectations

Explain how a runtime is expected to load and run the exposed strategy.

## Checklist before opening a PR

- [ ] Folder path matches `name` in `comma-project.json`
       (`packages/@user/project-slug/`).
- [ ] `version` is valid semver.
- [ ] Every exposed artifact has a non-empty `description`.
- [ ] At least one artifact has `expose: true`.
- [ ] If you ship tools, custom flows, or an `entry`, set
       `permissions.executesCode` to `true`.
- [ ] Document every environment variable.
- [ ] `bun run validate` passes locally.
