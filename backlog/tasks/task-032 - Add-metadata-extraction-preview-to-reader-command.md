---
id: TASK-032
title: Add metadata extraction preview to reader command
status: To Do
assignee: []
created_date: '2026-02-16 13:12'
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

**Source:** [[reader-mode]], [[apple]] (research-v0.3.0)

**Finding:**
Safari Reader extracts author, publication date, and site name metadata using a combination of:
1. Class name patterns: `author-name`, `article-author`, `dateline`, `entry-date`
2. HTML attributes: `a[rel="author"]`, `<time>` elements
3. Visual proximity: Elements nearest the title are preferred
4. Confirmation sources: Schema.org and Open Graph are used to *confirm* selections, not as primary sources

This differs from how the `schema` command shows structured data — reader modes may ignore explicit metadata in favor of visually-detected patterns.

## Proposed Change

**Affected command(s):** `reader` command (enhancement)

**What should change:**
Add metadata extraction preview showing what author, date, and site name Safari Reader would display:
1. What metadata was detected and from which source
2. Whether structured data (Schema.org, Open Graph) matches detected metadata
3. Warnings when metadata might not be detected

**Example output:**
```
## Reader Metadata Extraction

Author:
  Detected:  "Jane Smith"
  Source:    <span class="author-name">
  Schema.org: "Jane Smith" ✓ matches

Date:
  Detected:  "February 3, 2026"
  Source:    <time datetime="2026-02-03">
  Schema.org: "2026-02-03" ✓ matches

Site Name:
  Detected:  "Example Blog"
  Source:    Open Graph (og:site_name)
```

## Implementation Approach

**Key files:**
- `src/commands/reader.ts` - Add metadata preview to reader output
- `src/lib/reader-metadata.ts` (new) - Metadata detection logic

**Approach:**
1. Detect author via class patterns and `rel="author"` links
2. Detect date via `<time>` elements and date-related classes
3. Detect site name via Open Graph, Schema.org, or domain fallback
4. Cross-reference with structured data
5. Provide recommendations when metadata not detected

**Considerations:**
- Visual proximity detection can't be fully replicated without rendering
- Focus on documented class name patterns
- Reuse schema extraction code for comparison
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 reader command shows detected author with source element
- [ ] #2 reader command shows detected date with source element
- [ ] #3 reader command shows detected site name with source
- [ ] #4 Structured data (Schema.org, Open Graph) is shown for comparison
- [ ] #5 Matches between detected and structured data are indicated
- [ ] #6 Missing metadata shows warning with recommendation
- [ ] #7 JSON output includes all metadata detection results
- [ ] #8 Research page updated with toolCoverage entry
- [ ] #9 CHANGELOG entry references research page and version
<!-- AC:END -->
