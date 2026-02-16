---
id: TASK-039
title: Refactor social preview to use conservative truncation limits
status: To Do
assignee: []
created_date: '2026-02-16 14:51'
labels:
  - research-backed
  - lens-social
  - enhancement
dependencies:
  - TASK-038
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
Research documented that platforms have vastly different truncation points. The most restrictive limits are:
- **og:title**: Twitter/X at ~70 characters
- **og:description**: LinkedIn at 69 characters

The current preview uses a fixed 50-character card width that doesn't reflect real-world truncation behavior. Users should see a "worst case" preview that shows how their content appears on the most restrictive platforms.

**Key Citations:**
- OGTester: Twitter title truncation at ~70 chars
- LinkedIn Post Inspector: Description display at 69 chars

## Proposed Change

**Affected command(s):** `social` (CLI and TUI)

**What should change:**
1. Refactor the preview component/function to accept configurable width parameters for title and description
2. Default to "conservative" limits based on the most restrictive platforms:
   - Title: 70 characters (Twitter/X)
   - Description: 69 characters (LinkedIn)
3. Show truncated text with ellipsis exactly as platforms would display it
4. The preview represents "if it looks good here, it looks good everywhere"

## Implementation Approach

**Key files likely involved:**
- `src/commands/social/formatters.ts` - Refactor `formatCardPreview()` to accept width options
- `src/tui/views/components/SocialViewContent.tsx` - Refactor `CardPreview` component with props
- `src/lib/metadata/types.ts` - Define preview configuration types and default limits

**Approach:**
1. Define a `PreviewConfig` interface with title/description max lengths
2. Create `CONSERVATIVE_PREVIEW_LIMITS` constant based on research
3. Update preview functions to use these limits instead of arbitrary card width
4. Ensure text wrapping respects the configured limits
5. Add visual indicator when content is truncated (e.g., "..." with subtle styling)

**Considerations:**
- Current card width (50 chars) is for display, not semantic truncation - these are different concerns
- Preview should show the truncated content, not just warn about it
- Component should be reusable for platform-specific previews in future task
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Preview component/function accepts configurable title and description max lengths
- [ ] #2 Default preview uses conservative limits: 70 chars (title), 69 chars (description)
- [ ] #3 Truncated content displays with ellipsis showing actual truncation point
- [ ] #4 Preview is labeled as 'Conservative Preview' or similar to indicate worst-case display
- [ ] #5 CLI and TUI previews both use the new parameterized approach
- [ ] #6 Research page updated with toolCoverage entry
- [ ] #7 CHANGELOG entry references research page and version
<!-- AC:END -->
