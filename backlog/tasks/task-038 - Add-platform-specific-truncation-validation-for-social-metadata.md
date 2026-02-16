---
id: TASK-038
title: Add platform-specific truncation validation for social metadata
status: To Do
assignee: []
created_date: '2026-02-16 14:51'
labels:
  - research-backed
  - lens-social
  - enhancement
dependencies: []
references:
  - research/topics/social-metadata/open-graph-validation.md
  - research/CHANGELOG.md#research-v060
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Research Context

**Source:** [[open-graph-validation]] (research-v0.6.0)

**Finding:**
Research documented specific character limits for og:title and og:description across 8 platforms. The current implementation uses conservative "safe limits" (60 chars title, 155 chars description) but doesn't inform users which specific platforms will truncate their content. Platform-specific limits vary significantly:

- **og:title**: Twitter/X (~70), WhatsApp (81), Facebook (88), LinkedIn (119), Telegram (1023)
- **og:description**: LinkedIn (69), Facebook (55-60/line), Twitter/X (~200)

Users need to know exactly which platforms will truncate their content so they can make informed decisions based on their target audience.

**Key Citations:**
- OGTester: Platform-specific character limits documentation
- Platform debuggers (Facebook, Twitter, LinkedIn): Observed truncation behavior

## Proposed Change

**Affected command(s):** `social`

**What should change:**
Replace the single generic "og:title too long" warning with individual validation rules per platform. Users will see specific warnings like:
- `og-title-truncates-on-twitter` (>70 chars)
- `og-title-truncates-on-whatsapp` (>81 chars)
- `og-title-truncates-on-facebook` (>88 chars)
- `og-title-truncates-on-linkedin` (>119 chars)

Similarly for og:description:
- `og-description-truncates-on-linkedin` (>69 chars)
- `og-description-truncates-on-facebook` (>55 chars per line, complex)
- `og-description-truncates-on-twitter` (>200 chars)

## Implementation Approach

**Key files likely involved:**
- `src/lib/metadata/social-validation.ts` - Add platform-specific validation functions
- `src/lib/metadata/types.ts` - Add platform limit constants
- `src/commands/social/formatters.ts` - Update issue display
- `src/lib/metadata/social-validation.test.ts` - Add tests for each platform limit

**Approach:**
1. Define platform limit constants based on research (with citations)
2. Create individual validation functions for each platform/property combination
3. Group related warnings in output (e.g., "Title truncation" section listing affected platforms)
4. Keep existing "safe limit" warnings as an additional layer (optional toggle)

**Considerations:**
- Twitter's limit "varies" - use ~70 as conservative estimate
- Facebook description is multi-line with per-line limits - may need simplified approximation
- Consider severity ordering (platforms with shortest limits shown first)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Individual validation rules exist for og:title limits on Twitter (~70), WhatsApp (81), Facebook (88), LinkedIn (119)
- [ ] #2 Individual validation rules exist for og:description limits on LinkedIn (69), Facebook (~55), Twitter (~200)
- [ ] #3 Warnings specify which platform(s) will truncate the content
- [ ] #4 Platform limit constants are documented with research citations
- [ ] #5 Existing test fixtures (social-long-title.html, social-long-description.html) trigger platform-specific warnings
- [ ] #6 Research page updated with toolCoverage entry
- [ ] #7 CHANGELOG entry references research page and version
<!-- AC:END -->
