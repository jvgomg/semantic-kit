---
name: research-backlog-task
description: Create backlog tasks from research findings using the Backlog.md MCP. Use this skill when research reveals an actionable improvement to semantic-kit. Covers task structure, required metadata, labels, and research references.
---

# Research Backlog Task

This skill covers creating backlog tasks when research reveals actionable improvements to semantic-kit.

## Prerequisites

Before using this skill:

1. Research findings are documented in research pages
2. Research has been **released** (version created in `research/CHANGELOG.md`)
3. You have identified a specific, actionable tool improvement

## Decision Tree

```
Should I create a backlog task?
├── Research reveals tool could better match real-world behavior → YES
├── Finding suggests new feature, flag, or output format → YES
├── Documentation suggests tool should handle something differently → YES
├── Research contradicts assumptions built into current tool → YES
├── Finding is purely informational (no tool change) → NO
├── Change is trivial (just mention in conversation) → NO
└── Uncertain if actionable → Discuss first, then decide
```

## Creating the Task

Use the Backlog.md MCP tools. **Never edit markdown files directly.**

### Required Fields

```
title: Clear, action-oriented title
description: Full context including research findings
labels: ["research-backed", ...domain labels]
references: [research page paths, research changelog section]
acceptanceCriteria: Specific, testable criteria
```

### Task Structure Template

Use this structure for the **description** field:

```markdown
## Research Context

**Source:** [[research-page-name]] (research-vX.Y.Z)

**Finding:**
Summary of what was discovered during research. Include the key insight that suggests a tool change.

**Key Citations:**
- Citation 1: Brief description of what it supports
- Citation 2: Brief description of what it supports

## Proposed Change

**Affected command(s):** `command-name` (or "new command")

**What should change:**
Describe the user-visible change. What will be different? What problem does it solve?

## Implementation Approach

**Key files likely involved:**
- `src/commands/example.ts` - Brief note on what changes
- `src/lib/example.ts` - Brief note on what changes

**Approach:**
General strategy without full code. What patterns to follow? What libraries to use?

**Considerations:**
- Edge cases to handle
- Backwards compatibility concerns
- Performance implications
```

### Standard Labels

Always include `research-backed` for research-originated tasks.

**Domain labels** (reverse domain notation):
- `lens-ai`, `lens-reader`, `lens-google`, `lens-social`, `lens-screen-reader`
- `utility-schema`, `utility-structure`, `utility-readability`, `utility-sitemap`
- `validate-html`, `validate-schema`, `validate-a11y`

**Type labels:**
- `feature` - New functionality
- `enhancement` - Improvement to existing functionality
- `fix` - Bug fix
- `refactor` - Code improvement without behavior change

### References Field

Link to research documentation:

```javascript
references: [
  "research/topics/content-extraction/sitemaps.md",
  "research/CHANGELOG.md#research-v050"
]
```

### Acceptance Criteria

Always include these standard items for research-backed tasks:

```javascript
acceptanceCriteria: [
  // Task-specific criteria first
  "Command validates XML sitemap structure",
  "Reports URL count and file size",
  // ... other specific criteria

  // Standard research-backed criteria (always include)
  "Research page updated with toolCoverage entry",
  "CHANGELOG entry references research page and version"
]
```

## Example Task Creation

```javascript
// Using Backlog.md MCP
task_create({
  title: "Add sitemap command for validation and inspection",
  description: `## Research Context

**Source:** [[sitemaps]] (research-v0.5.0)

**Finding:**
XML sitemaps are critical for search engine crawling but developers often create invalid sitemaps. Research revealed that Google ignores <changefreq> and <priority> — only <lastmod> matters. Common errors include encoding issues, relative URLs, and exceeding size limits.

## Proposed Change

**Affected command(s):** New \`sitemap\` command

**What should change:**
Add a new command that validates and inspects XML sitemaps, reporting URL count, file size, extension usage, and validation errors.

## Implementation Approach

**Key files:**
- \`src/commands/sitemap.ts\` (new)
- \`src/lib/sitemap.ts\` (new)

**Approach:**
Use the sitemap.js library for TypeScript-native parsing. Validate XML structure, check encoding, verify absolute URLs.`,

  labels: ["research-backed", "utility-sitemap", "feature"],
  priority: "medium",

  references: [
    "research/topics/seo/sitemaps.md",
    "research/CHANGELOG.md#research-v050"
  ],

  acceptanceCriteria: [
    "sitemap <url> fetches and parses XML sitemap",
    "Validates XML structure and encoding",
    "Reports URL count and file size",
    "Warns when approaching size limits",
    "JSON output includes all validation results",
    "Research page updated with toolCoverage entry",
    "CHANGELOG entry references research page and version"
  ]
})
```

## Dependencies

If a task depends on another task being completed first:

```javascript
task_create({
  // ...
  dependencies: ["TASK-016"],  // Reference by task ID
  // ...
})
```

## After Creating the Task

1. Mention the task ID to the user
2. Summarize what the task covers
3. Note any dependencies or sequencing considerations

## Related Skills

- **research-workflow**: For performing research before creating tasks
- **research-update-after-implementation**: For developers implementing these tasks
