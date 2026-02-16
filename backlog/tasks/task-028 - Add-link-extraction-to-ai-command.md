---
id: TASK-028
title: Add link extraction to ai command
status: To Do
assignee: []
created_date: '2026-02-16 13:11'
labels:
  - research-backed
  - lens-ai
  - enhancement
dependencies: []
references:
  - research/topics/content-extraction/ai-crawler-behavior.md
  - research/topics/content-extraction/jina-reader.md
  - research/CHANGELOG.md#research-v020
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Research Context

**Source:** [[ai-crawler-behavior]], [[jina-reader]], [[content-extraction]] (research-v0.2.0)

**Finding:**
Jina Reader offers an `X-With-Links-Summary` header specifically because "this helps downstream LLMs or web agents navigating the page or take further actions." Navigation is correctly excluded from main content extraction (Readability-style), but link information has separate value for understanding what an AI system could navigate to.

The `ai` command currently shows only extracted article content. However, AI crawlers receive the full HTML response, and AI agents can see and interact with all links. Adding link extraction would make the `ai` command a more comprehensive assessment of what AI systems see.

## Proposed Change

**Affected command(s):** `ai`

**What should change:**
Extract and return page links in addition to main content. Links should be:
- Unique (deduplicated by URL)
- Categorized (navigation links vs content links)
- Counted (include totals for each category)
- Structured (returned as structured data, with renderers deciding display format)

## Implementation Approach

**Key files:**
- `src/commands/ai.ts` - Add link extraction to the result, update renderers
- `src/lib/links.ts` (new or existing) - Link extraction utilities
- `src/commands/structure.ts` - Reference for existing link extraction logic

**Approach:**
1. Reuse existing utilities — The `structure` command already extracts links. Factor out link extraction into shared utility code.
2. Categorize links — Check if link is within `<nav>`, `<header>`, `<footer>`, or navigation-related roles/classes.
3. Deduplicate — Track unique URLs, keeping first anchor text for each.
4. Structured data first — Add links to result type. Let each output format decide rendering.

**Considerations:**
- Links should be extracted from full HTML, not just Readability-extracted content
- Handle relative URLs by resolving against page URL
- Consider default limit for pages with many links
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 ai command extracts unique links from the page
- [ ] #2 Links are categorized as navigation vs content
- [ ] #3 Link counts are included in output
- [ ] #4 JSON output includes structured link data
- [ ] #5 Full/TUI output displays links in readable format
- [ ] #6 Link extraction code is shared with structure command (DRY)
- [ ] #7 Research page updated with toolCoverage entry
- [ ] #8 CHANGELOG entry references research page and version
<!-- AC:END -->
