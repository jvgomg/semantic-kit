# Backlog

Research-driven change requests for semantic-kit.

---

## What is this?

When agents perform research and discover findings that could improve the tool, they document those ideas here. Each file captures:

- **Research context** - What was discovered and where
- **Proposed change** - What should be built or modified
- **Implementation approach** - Guidance on how to implement (not full code)
- **Version tracking** - Links research to tool releases

---

## Workflow

### 1. Agent Creates Request

During research, if an agent discovers something actionable for the tool:

1. **Releases the research first** - moves changes from "Unreleased" to a new version in `research/CHANGELOG.md`
2. Creates a file in `docs/backlog/` using the template
3. Links to relevant research pages
4. Describes the proposed change at medium detail
5. References the just-released research version

This ensures backlog items always reference concrete, released research versions rather than unreleased work.

### 2. Developer Picks Up

A developer reviews the backlog and:

1. Reads the request and linked research
2. Implements the change
3. Updates the tool CHANGELOG with the research reference
4. Updates the backlog file with the implementing tool version
5. Moves the file to `docs/backlog/_completed/` (or deletes it)

### 3. Research Updated

When significant research drives a tool change, update the research page with an "Implemented" note linking to the tool version.

---

## File Naming

Use descriptive kebab-case names:

```
ai-command-framework-detection.md
structure-landmark-nesting-rules.md
validate-a11y-wcag22-rules.md
```

---

## Cross-Referencing

The goal is bidirectional traceability:
- Users browsing the tool CHANGELOG can find the research behind changes
- Users reading research can see which tool version implements findings

### In Research Pages

When research leads to a tool change, update the research page in two places:

**1. Frontmatter** (machine-readable):
```yaml
---
title: "Streaming SSR"
toolCoverage:
  - finding: "Remix streaming detection"
    command: ai
    since: v0.0.17
---
```

**2. Inline callout** (human-readable, near the relevant content):
```markdown
> **Tool support:** The `ai` command detects Remix streaming since v0.0.17.
```

See `research/_meta/RESEARCH_GUIDE.md` for full formatting conventions.

### In Tool CHANGELOG

Reference the research that drove the change:

```markdown
### Added

- Remix streaming detection in `ai` command
  - Research: [[streaming-ssr]], research-v0.1.0
```

### In Backlog Files

Track the research and tool versions:

```yaml
researchVersion: research-v0.1.0  # When this was discovered
toolVersion: null                  # Set when implemented (e.g., v0.0.17)
```

---

## Templates

See [TEMPLATE.md](TEMPLATE.md) for the standard format.

---

## Index

_Files in this directory represent pending changes. Completed items are moved to `_completed/` or deleted._
