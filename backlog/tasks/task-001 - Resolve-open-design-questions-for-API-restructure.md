---
id: TASK-001
title: Resolve open design questions for API restructure
status: Done
assignee: []
created_date: '2026-02-09 14:20'
updated_date: '2026-02-09 14:43'
labels: []
milestone: Command API Restructure
dependencies: []
references:
  - docs/backlog/command-api-restructure.md
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Research and decide on open questions before implementation begins. Update relevant tasks with decisions.

**Open Questions to Resolve:**

1. **Deprecation period**: Should old command names (`bot`, `a11y`) continue to work with deprecation warnings, or be removed immediately?

2. **TUI navigation**: How should the TUI present the lens vs utility distinction? Tabs? Sections?

3. **`google` lens scope**: Should it attempt to show rendered content (like the cached version Google sees) or focus on metadata/schema?

4. **`social` lens preview**: Should it attempt to render a visual preview of how the link card would appear, or just show the raw data?

5. **Testing approach**: Should integration tests cover both old and new command names during transition?

**Reference:** docs/backlog/command-api-restructure.md (Part 4: Notes and Open Questions)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All 5 open questions have documented decisions
- [x] #2 Decisions are recorded in the restructure document or task notes
- [x] #3 Relevant downstream tasks are updated with decision context
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Decisions

### 1. Deprecation Period
**Decision: Remove immediately (no deprecation period)**

Old command names (`bot`, `a11y`, etc.) will not be kept as aliases. When the restructure ships, only the new names work. This provides a clean break and simpler codebase.

### 2. TUI Navigation
**Decision: Sidebar menu with 2 groups: "Lenses" and "Tools"**

The TUI will use a sidebar navigation pattern with two main groups:
- **Lenses** - Consumer perspective commands (ai, reader, google, social, screen-reader)
- **Tools** - Analysis, validation, and other utilities

Note: User prefers "Tools" over "Utilities" for the group name.

### 3. Google Lens Scope
**Decision: Metadata/schema only**

The `google` lens will show:
- Page title, meta description, canonical URL
- Google-relevant JSON-LD schema types (Article, Product, FAQ, HowTo, BreadcrumbList, etc.)
- Heading structure signals

It will NOT attempt to render content as Google sees it - that's complex and unreliable.

### 4. Social Lens Preview
**Decision: Context-dependent output**

- **Plain mode (`--plain`)**: Simple data list of OG/Twitter meta tags
- **TTY mode (default)**: Raw data + ASCII mockup showing card structure
- **TUI**: Raw data + ASCII mockup with visual formatting

### 5. Testing Approach
**Decision: Test new names only**

Since old names are removed immediately (decision #1), there are no deprecated aliases to test. Integration tests will cover the canonical new command names only.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary

Resolved all 5 open design questions for the API restructure:

1. **Deprecation period**: Remove old command names immediately (no deprecation warnings)
2. **TUI navigation**: Sidebar menu with 2 groups - "Lenses" and "Tools"
3. **Google lens scope**: Metadata/schema only (no rendered content simulation)
4. **Social lens preview**: Context-dependent - plain data in `--plain` mode, ASCII mockup in TTY/TUI
5. **Testing approach**: Test new names only (no deprecated aliases to test)

## Tasks Updated

Added decision context to 8 downstream tasks:
- TASK-002 (a11y rename) - no deprecation aliases
- TASK-003 (CLI help) - use "Tools" not "Utilities"
- TASK-006 (google lens) - metadata/schema scope
- TASK-007 (social lens) - context-dependent output
- TASK-010 (bot migration) - no deprecation aliases
- TASK-013 (remove aliases) - simplified, no transition period
- TASK-015 (TUI navigation) - sidebar with Lenses/Tools groups
- TASK-018 (integration tests) - test new names only
<!-- SECTION:FINAL_SUMMARY:END -->
