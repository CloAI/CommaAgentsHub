<!--
Thanks for contributing to CommaAgentsHub! Most PRs add a single package under
packages/@your-scope/your-project/. PRs that touch anything outside packages/
(scripts, workflows, schemas, root config) are reserved for maintainers and the
PR Guard check will fail for community contributors.
-->

## What does this PR add?

<!-- One or two sentences. Which package(s)? -->

- Package: `@scope/project-slug`

## Checklist

- [ ] Only files under `packages/` are changed (community contributions).
- [ ] `comma-project.json` `name` matches the folder path exactly.
- [ ] At least one artifact is marked `"expose": true` with a non-empty `description`.
- [ ] `pnpm check` passes locally (validates the manifest and strategy/agent files
      against the `@comma-agents/core` schemas).
- [ ] If the package ships executable code (tools, custom flows, or `entry`),
      `permissions.executesCode` is `true` and the relevant
      `network` / `filesystem` / `shell` permissions are declared.
- [ ] Every `environment` variable has a non-empty `description`.

## Notes for reviewers

<!-- Anything reviewers should pay special attention to. -->
