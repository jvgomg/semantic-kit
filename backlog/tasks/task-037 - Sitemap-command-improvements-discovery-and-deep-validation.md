---
id: TASK-037
title: 'Sitemap command improvements: discovery and deep validation'
status: To Do
assignee: []
created_date: '2026-02-16 13:14'
labels:
  - research-backed
  - utility-sitemap
  - enhancement
dependencies:
  - TASK-036
references:
  - research/topics/seo/sitemaps.md
  - research/CHANGELOG.md#research-v050
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Research Context

**Source:** [[sitemaps]], [[web-crawlers]] (research-v0.5.0)

**Finding:**
Beyond basic sitemap validation, developers need help with:

1. **Finding sitemaps** — Can be declared in robots.txt, HTML `<link>` tags, or at common paths
2. **URL health** — Sitemaps often contain stale URLs returning 404s or redirects
3. **Configuration conflicts** — URLs simultaneously in sitemap AND blocked by robots.txt
4. **noindex conflicts** — Pages with `<meta name="robots" content="noindex">` shouldn't be in sitemaps

## Proposed Change

**Affected command(s):** `sitemap` command (enhancement)

**What should change:**
Add discovery and deep validation features:

1. **Discover sitemaps** (`--discover`) — Find sitemaps for a domain via robots.txt, common paths, HTML links
2. **Check URL status codes** (`--check-urls`) — Verify URLs return 200, identify 404s/redirects
3. **Detect robots.txt conflicts** (`--check-robots`) — Flag URLs blocked by robots.txt
4. **Find noindex conflicts** (`--check-noindex`) — Identify URLs with noindex meta tags

**Example --discover output:**
```
Sitemap Discovery: https://example.com

## Found via robots.txt
https://example.com/sitemap.xml
https://example.com/sitemap-news.xml

## Found via HTML <link>
https://example.com/sitemap-index.xml

## Summary
3 sitemaps discovered
```

## Implementation Approach

**Key files:**
- `src/commands/sitemap.ts` - Add new flags
- `src/lib/sitemap-discovery.ts` (new)
- `src/lib/sitemap-validation.ts` (new)
- `src/lib/robots-txt.ts` (new or existing)

**Approach:**
1. Discovery: fetch robots.txt, parse `Sitemap:` directives, check HTML `<link>`, try common paths
2. URL checking: HEAD requests to each URL, categorize by status, rate limiting
3. Robots.txt: parse and check each URL against Disallow rules
4. noindex: fetch pages and check for noindex meta/header (slow, opt-in)

**Considerations:**
- URL checking can be slow — show progress, support `--sample N`
- Rate limiting important to avoid being blocked
- noindex checking requires full page fetches — warn about time
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 --discover finds sitemaps via robots.txt Sitemap: directives
- [ ] #2 --discover finds sitemaps via HTML <link rel="sitemap">
- [ ] #3 --discover checks common sitemap paths
- [ ] #4 --check-urls makes HEAD requests to all sitemap URLs
- [ ] #5 --check-urls reports status code distribution
- [ ] #6 --check-urls lists problematic URLs (non-200)
- [ ] #7 --check-robots fetches and parses robots.txt
- [ ] #8 --check-robots identifies URLs blocked by Disallow rules
- [ ] #9 --check-noindex fetches pages and checks for noindex
- [ ] #10 --check-noindex warns about time required for large sitemaps
- [ ] #11 All new features work with JSON output
- [ ] #12 Research page updated with toolCoverage entry
- [ ] #13 CHANGELOG entry references research page and version
<!-- AC:END -->
