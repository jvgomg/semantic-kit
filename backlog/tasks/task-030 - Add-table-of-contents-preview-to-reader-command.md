---
id: TASK-030
title: Add table of contents preview to reader command
status: To Do
assignee: []
created_date: '2026-02-16 13:11'
labels:
  - research-backed
  - lens-reader
  - enhancement
dependencies: []
references:
  - research/topics/content-extraction/reader-mode.md
  - research/entities/apple/apple.md
  - research/CHANGELOG.md#research-v030
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Research Context

**Source:** [[reader-mode]], [[apple]], [[document-outline]] (research-v0.3.0)

**Finding:**
Safari 18 (iOS 18 / macOS Sequoia) introduced auto-generated table of contents in Reader Mode. The TOC is built from the heading hierarchy (h1-h6) and appears at the top of Reader view for articles with subheadings, allowing quick navigation to sections.

Developers would benefit from previewing what this TOC looks like to ensure their heading structure creates useful navigation.

## Proposed Change

**Affected command(s):** `reader` command (enhancement)

**What should change:**
Add a table of contents preview that shows how Safari 18's Reader would generate navigation from the page's heading structure:
1. See heading hierarchy as a navigable outline
2. Identify heading structure issues (skipped levels, flat structure)
3. Understand how content will appear in Safari Reader's TOC

**Example output:**
```
## Table of Contents Preview (Safari 18)

1. How to Build Better Websites          [h1]
   1.1. Getting Started                   [h2]
       1.1.1. Prerequisites               [h3]
       1.1.2. Installation                [h3]
   1.2. Core Concepts                     [h2]

TOC entries: 9
Max depth: 3 levels

⚠ Warning: Heading level skipped (h2 → h4) at "Some Section"
```

## Implementation Approach

**Key files:**
- `src/commands/reader.ts` - Add TOC preview to reader output
- `src/lib/headings.ts` (new or existing) - Heading extraction and hierarchy analysis
- `src/commands/structure.ts` - May already have heading extraction to reuse

**Approach:**
1. Extract headings from Readability's extracted content
2. Build nested hierarchy based on heading levels
3. Detect issues (skipped levels, missing h1, flat structure)
4. Format as indented tree with level indicators

**Considerations:**
- Safari's exact TOC logic isn't documented — this is best-effort preview
- Consider truncating very long heading text
- Empty headings should be flagged
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 reader command includes table of contents preview
- [ ] #2 TOC shows heading hierarchy as indented tree
- [ ] #3 Each entry shows heading text and level (h1, h2, etc.)
- [ ] #4 Entry count and max depth are reported
- [ ] #5 Heading structure issues are flagged (skipped levels, missing h1)
- [ ] #6 Pages with insufficient headings show appropriate message
- [ ] #7 JSON output includes TOC as structured data
- [ ] #8 Research page updated with toolCoverage entry
- [ ] #9 CHANGELOG entry references research page and version
<!-- AC:END -->
