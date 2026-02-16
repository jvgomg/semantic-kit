---
id: TASK-031
title: Add title extraction comparison to reader command
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

**Source:** [[reader-mode]], [[apple]], [[mozilla-readability]] (research-v0.3.0)

**Finding:**
Safari Reader and Mozilla Readability use fundamentally different approaches to extract article titles:

**Safari Reader:**
- Uses Levenshtein distance to compare heading candidates against `document.title`
- Evaluates visual proximity to top of article
- Candidates must be at least 4 characters long
- Falls back to `document.title` if no matching headline found

**Mozilla Readability:**
- Searches for heading elements (h1, h2)
- Uses separator detection in `document.title`
- Applies text cleaning and normalization

This means the same page may show different titles in Firefox Reader View vs Safari Reader.

## Proposed Change

**Affected command(s):** `reader` command (enhancement)

**What should change:**
Add title extraction analysis showing:
1. What title each reader mode would likely extract
2. The `document.title` for comparison
3. Similarity scores (Levenshtein distance for Safari-style matching)
4. Which heading element was selected and why

**Example output:**
```
## Title Extraction Analysis

document.title:     "How to Build Websites | Example Blog"

Mozilla Readability: "How to Build Websites"
  Source: <title> with separator detection

Safari Reader:      "How to Build Better Websites"
  Source: <h1> (Levenshtein distance: 7 from document.title)

⚠ Titles differ between readers
```

## Implementation Approach

**Key files:**
- `src/commands/reader.ts` - Add title analysis to reader output
- `src/lib/title-extraction.ts` (new) - Title extraction logic
- `src/lib/levenshtein.ts` (new) - Levenshtein distance calculation

**Approach:**
1. Get document.title as baseline
2. Get Mozilla Readability title (already extracted)
3. Simulate Safari title selection using Levenshtein distance
4. Compare and report with selection reasoning

**Considerations:**
- Safari's visual positioning cannot be simulated without rendering
- Normalize strings before comparison
- Consider showing percentage similarity
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 reader command shows document.title
- [ ] #2 reader command shows Mozilla Readability extracted title
- [ ] #3 reader command shows predicted Safari Reader title
- [ ] #4 Levenshtein distance is calculated and shown for Safari matching
- [ ] #5 Heading candidates are listed with their distances
- [ ] #6 Differences between titles are flagged
- [ ] #7 JSON output includes all title data
- [ ] #8 Research page updated with toolCoverage entry
- [ ] #9 CHANGELOG entry references research page and version
<!-- AC:END -->
