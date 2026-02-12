---
id: TASK-019
title: Enhance social lens validation based on OG research
status: To Do
assignee: []
created_date: '2026-02-12 01:10'
updated_date: '2026-02-12 01:11'
labels:
  - social
  - validation
  - research-driven
dependencies: []
references:
  - src/commands/social/types.ts
  - src/commands/social/runner.ts
  - integration-tests/social/tag-extraction.test.ts
documentation:
  - research/topics/social-metadata/open-graph-validation.md
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Improve the `social` command's validation and preview rendering based on comprehensive Open Graph and Twitter Card research.

**Research basis:** research-v0.6.0 (2026-02-12) documents platform-specific requirements, fallback chains, and validation strategies derived from official specifications and metascraper source analysis.

**Current state:** The social command extracts OG/Twitter tags and shows completeness scores, but validation is basic (just required/recommended tags). It doesn't validate URL formats, character limits, or image dimensions.

**Goal:** Implement tiered validation (errors/warnings/info) that reflects real-world platform behavior, helping developers understand what actually affects their link previews vs. what's merely best practice.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Validation reports error when twitter:card is missing (no fallback exists)
- [ ] #2 Validation reports error when og:url is not absolute (missing protocol or relative path)
- [ ] #3 Validation reports warning when og:title exceeds 60 characters (truncation likely)
- [ ] #4 Validation reports warning when og:description exceeds 155 characters (truncation likely)
- [ ] #5 Validation reports warning when og:image:width or og:image:height are missing (delays first-share rendering)
- [ ] #6 Validation reports info-level notice when og:image:alt or twitter:image:alt are missing
- [ ] #7 Preview mockup uses correct fallback chain: twitter:* → og:* → meta → semantic HTML
- [ ] #8 Integration tests cover all validation scenarios with fixtures
- [ ] #9 Documentation updated to explain validation tiers and rationale
<!-- AC:END -->
