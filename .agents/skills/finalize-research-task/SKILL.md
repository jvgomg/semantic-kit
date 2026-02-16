---
name: finalize-research-task
description: Finalize a research-backed backlog task after implementation. For developer agents completing tasks that originated from research. Covers adding toolCoverage to research pages, writing CHANGELOG entries with research references, and marking tasks complete.
---

# Finalize Research Task

This skill is for **developer agents** completing backlog tasks that originated from research findings.

## Context

For research documentation structure and conventions, see `research/_meta/README.md`.

## When to Use

Use this skill when:
- You are a developer agent who has implemented a feature from a `research-backed` backlog task
- The acceptance criteria includes "Research page updated with toolCoverage entry"
- You are ready to finalize the task and update documentation

## Checklist

After implementing the feature:

- [ ] Add `toolCoverage` entry to research page frontmatter
- [ ] Add inline callout if editorially appropriate (new features: yes; fixes: usually no)
- [ ] Add CHANGELOG entry with research reference
- [ ] Update backlog task status to Done

## Step 1: Update Research Page Frontmatter

Find the research page(s) linked in the task's `references` field and add a `toolCoverage` entry.

### Frontmatter Format

```yaml
---
title: "Sitemaps"
lastVerified: 2026-02-04
lastUpdated: 2026-02-04
toolCoverage:
  - finding: "XML sitemap validation"
    command: sitemap
    since: v0.1.0
  - finding: "Sitemap index file support"
    command: sitemap
    since: v0.1.0
---
```

### toolCoverage Fields

| Field | Description | Example |
|-------|-------------|---------|
| `finding` | Brief description of what was implemented | "XML sitemap validation" |
| `command` | The command that implements this | `sitemap`, `ai`, `validate:a11y` |
| `since` | Tool version when this was added | `v0.1.0` |

### Adding to Existing toolCoverage

If the page already has `toolCoverage`, append to the array:

```yaml
toolCoverage:
  - finding: "Existing feature"
    command: existing-command
    since: v0.0.15
  # Add new entry
  - finding: "New feature you implemented"
    command: your-command
    since: v0.1.0
```

## Step 2: Add Inline Callout (When Appropriate)

Add a callout near the relevant content in the research page body.

### When to Add Callouts

| Situation | Add Callout? |
|-----------|--------------|
| New command or major feature | Yes |
| Significant new capability | Yes |
| Incremental improvement | Usually no |
| Bug fix | No |
| Internal refactor | No |

### Callout Format

```markdown
> **Tool support:** The `sitemap` command validates XML sitemaps since v0.1.0.
```

Place the callout:
- Near the finding that drove the implementation
- After the relevant paragraph or section
- Not at the very top (let the content come first)

### Example in Context

```markdown
## Validation

XML sitemaps must be well-formed and follow the protocol specification [^sitemaps-protocol].
Common validation errors include relative URLs, missing namespaces, and encoding issues.

> **Tool support:** The `sitemap` command validates these requirements since v0.1.0.
```

## Step 3: Add CHANGELOG Entry

Add an entry to the tool's `CHANGELOG.md` with a research reference.

### Format

```markdown
## v0.1.0 (YYYY-MM-DD)

### Added

- `sitemap` command for XML sitemap validation and inspection
  - Research: [[sitemaps]], research-v0.5.0
```

### Research Reference Format

```
Research: [[page-name]], research-vX.Y.Z
```

- Use wikilink style `[[page-name]]` for the research page
- Include the research version that documented the finding

### Multiple Research Sources

```markdown
- Enhanced `ai` command with link extraction
  - Research: [[ai-crawler-behavior]], [[jina-reader]], research-v0.2.0
```

## Step 4: Mark Task Complete

Use the Backlog.md MCP to update the task:

```javascript
task_edit({
  id: "TASK-XXX",
  status: "Done",
  // Optionally add implementation notes
  notesAppend: ["Implemented in v0.1.0. Updated [[sitemaps]] with toolCoverage."]
})
```

### Definition of Done

Verify all acceptance criteria are met, especially:
- [ ] Feature works as specified
- [ ] Tests pass (if applicable)
- [ ] Research page has `toolCoverage` entry
- [ ] CHANGELOG entry references research

## Complete Example

### Before (research page frontmatter)

```yaml
---
title: "Sitemaps"
lastVerified: 2026-02-04
lastUpdated: 2026-02-04
---
```

### After (research page frontmatter)

```yaml
---
title: "Sitemaps"
lastVerified: 2026-02-04
lastUpdated: 2026-02-04
toolCoverage:
  - finding: "XML sitemap validation and inspection"
    command: sitemap
    since: v0.1.0
---
```

### Research page body addition

```markdown
## Validation

Sitemaps must be UTF-8 encoded and properly escape special characters [^sitemaps-protocol].

> **Tool support:** The `sitemap` command validates encoding and escaping since v0.1.0.
```

### CHANGELOG entry

```markdown
## v0.1.0 (2026-02-16)

### Added

- `sitemap` command for XML sitemap validation and inspection
  - Validates XML structure, encoding, and namespace declarations
  - Reports URL count, file size, and extension usage
  - Warns when approaching protocol limits (50,000 URLs, 50MB)
  - Research: [[sitemaps]], research-v0.5.0
```

## Traceability

This workflow ensures bidirectional traceability:

```
Research Page ←──────────────────→ Tool CHANGELOG
     │                                    │
     │ toolCoverage.since: v0.1.0        │ Research: [[page]], research-vX.Y.Z
     │                                    │
     └──────────── Backlog Task ──────────┘
                  (references both)
```

Users can:
- Read research → see which tool version implements findings
- Read CHANGELOG → find the research behind changes
- Read backlog → understand full context of both

## Related Skills

- **research-workflow**: For performing research tasks
- **research-backlog-task**: For creating backlog tasks from research findings
