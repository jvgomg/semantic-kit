---
id: TASK-036
title: Add sitemap command for validation and inspection
status: To Do
assignee: []
created_date: '2026-02-16 13:13'
labels:
  - research-backed
  - utility-sitemap
  - feature
dependencies: []
references:
  - research/topics/seo/sitemaps.md
  - research/CHANGELOG.md#research-v050
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Research Context

**Source:** [[sitemaps]] (research-v0.5.0)

**Finding:**
XML sitemaps are critical for search engine crawling but developers often create invalid sitemaps or include problematic URLs. Research revealed:

1. Google ignores `<changefreq>` and `<priority>` — only `<lastmod>` matters (if accurate)
2. Common errors include encoding issues, relative URLs, missing namespaces, exceeding size limits
3. The `sitemap` npm package (ekalinin/sitemap.js) provides TypeScript-native parsing
4. Sitemaps have strict limits: 50,000 URLs and 50MB per file

## Proposed Change

**Affected command(s):** New `sitemap` command

**What should change:**
Add a new command that validates and inspects XML sitemaps:
1. Validate sitemap XML (schema, UTF-8 encoding, URL format, namespaces)
2. Inspect contents (URL count, lastmod range, extensions, file size)
3. Warn on size limits (approaching 50,000 URLs or 50MB)
4. Extract URL list (`--urls` flag for piping)

**Example output:**
```
Sitemap: https://example.com/sitemap.xml

## Summary
URLs:        12,847
File size:   2.3 MB (4.6% of 50MB limit)
Encoding:    UTF-8 ✓
Schema:      Valid ✓

## Dates
Oldest:      2023-06-15
Newest:      2026-02-04
With dates:  12,523 (97%)

## Extensions
image:       3,241 URLs
video:       127 URLs
hreflang:    8,392 URLs
```

## Implementation Approach

**Key files:**
- `src/commands/sitemap.ts` (new)
- `src/lib/sitemap.ts` (new)

**Approach:**
1. Use sitemap.js library for TypeScript-native parsing
2. Validate XML well-formedness, encoding, namespaces
3. Validate all `<loc>` values are absolute URLs with proper escaping
4. Gather statistics (counts, sizes, dates)
5. Warn at 80% of limits
6. `--urls` flag outputs just `<loc>` values for piping
7. Handle sitemap indexes (list child sitemaps)

**Considerations:**
- Large sitemaps need streaming to avoid memory issues
- Support gzip-compressed sitemaps (.xml.gz)
- Follow existing output patterns (compact, full, JSON, TUI)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 sitemap <url> fetches and parses XML sitemap
- [ ] #2 Validates XML structure, encoding, and namespace declarations
- [ ] #3 Validates all URLs are absolute and properly escaped
- [ ] #4 Reports URL count, file size, and percentage of limits
- [ ] #5 Reports lastmod date range and coverage
- [ ] #6 Reports extension usage (image, video, news, hreflang)
- [ ] #7 Warns when approaching size limits (80%+ threshold)
- [ ] #8 --urls flag outputs plain URL list
- [ ] #9 Handles sitemap index files (lists child sitemaps)
- [ ] #10 JSON output includes all validation results and statistics
- [ ] #11 Research page updated with toolCoverage entry
- [ ] #12 CHANGELOG entry references research page and version
<!-- AC:END -->
