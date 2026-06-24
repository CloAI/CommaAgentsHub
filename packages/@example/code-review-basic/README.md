# @example/code-review-basic

A basic, declarative CommaAgents package that performs an automated code review
in two passes.

## What it does

The package exposes a single strategy, `code-review`, which orchestrates two
agents in a sequential flow:

1. **analyzer** — examines the supplied code and lists bugs, edge cases, risks,
   and code smells.
2. **reviewer** — turns those findings into concrete, actionable review
   comments.

## Exported strategy

| Artifact | Type | Ref | Description |
| --- | --- | --- | --- |
| `code-review` | strategy | `@example/code-review-basic/strategies/code-review` | Analyze code and produce actionable review comments. |

## Requirements

- A model provider capable of serving the model referenced in the strategy
  (`openai/gpt-4o`). Model and provider resolution is handled by the
  CommaAgents runtime, not by this package.
- No network, filesystem, or shell access is required — the package is purely
  declarative and does not execute code.

## Usage expectations

Load the `code-review` strategy in a CommaAgents-compatible runtime and provide
the code you want reviewed as input. The strategy runs the analyzer and then
the reviewer, returning the reviewer's actionable comments.
