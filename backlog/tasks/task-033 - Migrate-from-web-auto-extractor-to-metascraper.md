---
id: TASK-033
title: Migrate from web-auto-extractor to metascraper
status: To Do
assignee: []
created_date: '2026-02-16 13:12'
labels:
  - research-backed
  - utility-schema
  - refactor
dependencies: []
references:
  - research/topics/structured-data/structured-data.md
  - research/topics/structured-data/schema-org.md
  - research/CHANGELOG.md#research-v031
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Research Context

**Source:** [[structured-data]], [[schema-org]], [[google-structured-data]] (research-v0.3.1)

**Finding:**
During verification of structured data research, discovered that `web-auto-extractor` (v1.0.17), the core library used by the `schema` command for extracting JSON-LD, Microdata, RDFa, and metatags, hasn't been published in 8 years. The library uses deprecated Travis CI and has 5 open issues on GitHub.

The `structured-data-testing-tool` (v4.5.0) also hasn't been updated since 2019.

While both libraries currently work, their unmaintained status presents a long-term maintenance risk.

`metascraper` is an actively-maintained alternative (published 18 days ago) with 2.6k stars.

## Proposed Change

**Affected command(s):** `schema`

**What should change:**
Replace `web-auto-extractor` with `metascraper` for structured data extraction. User-visible output remains the same, but underlying extraction becomes more reliable.

**Benefits:**
- Active maintenance (last published recently vs 8 years ago)
- Modular architecture (install only what's needed)
- Better fallback handling with rule-based priority system

## Implementation Approach

**Key files:**
- `src/commands/schema.ts` - Replace extraction calls
- `package.json` - Update dependencies

**Approach:**
1. Install metascraper and required rule packages
2. Create new extraction function using metascraper's API
3. Map metascraper's output to existing interface
4. For raw JSON-LD/Microdata/RDFa, may need to supplement with direct extraction
5. Test against real-world pages for parity

**Open questions:**
1. Does metascraper provide raw JSON-LD/Microdata/RDFa, or only unified metadata?
2. Should we also remove `structured-data-testing-tool` dependency?

**Alternative considered:**
Writing custom extraction with cheerio for JSON-LD and using `@devmehq/open-graph-extractor` for metatags.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Schema command produces identical output for all currently supported formats
- [ ] #2 JSON-LD extraction works correctly
- [ ] #3 Microdata extraction works correctly
- [ ] #4 RDFa extraction works correctly
- [ ] #5 Open Graph tag detection unchanged
- [ ] #6 Twitter Card tag detection unchanged
- [ ] #7 All existing tests pass
- [ ] #8 Research page updated with toolCoverage entry
- [ ] #9 CHANGELOG entry references research page and version
<!-- AC:END -->
