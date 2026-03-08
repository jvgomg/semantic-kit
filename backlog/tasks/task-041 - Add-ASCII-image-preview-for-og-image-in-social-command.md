---
id: TASK-041
title: 'Add ASCII image preview for og:image in social command'
status: Done
assignee: []
created_date: '2026-02-16 14:52'
updated_date: '2026-03-08 13:06'
labels:
  - research-backed
  - lens-social
  - feature
dependencies: []
references:
  - research/topics/social-metadata/open-graph-validation.md
  - research/CHANGELOG.md#research-v060
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Research Context

**Source:** [[open-graph-validation]] (research-v0.6.0)

**Finding:**
Research documented image requirements across platforms:
- Universal recommendation: 1200×630 pixels (1.91:1 aspect ratio)
- Facebook: 600×315 minimum, <600px shows thumbnail
- Twitter/X: 144×144 minimum, 2:1 crop for summary_large_image
- og:image:width/height enable immediate rendering without fetch

Currently the social command shows `[IMG] https://example.com/image.jpg` as a placeholder. Users can't see what their og:image actually looks like without leaving the terminal.

## Proposed Change

**Affected command(s):** `social` (CLI TTY mode and TUI)

**What should change:**
Render a low-resolution ASCII art preview of the og:image directly in the terminal. This gives users immediate visual feedback about their social image without opening a browser.

Example output:
```
┌────────────────────────────────────────────────┐
│ ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ │
│ █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█ │
│ █  [ASCII rendered og:image preview]       █ │
│ █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█ │
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │
│────────────────────────────────────────────────│
│ example.com                                    │
│ Page Title Here                                │
│ Description text goes here...                  │
└────────────────────────────────────────────────┘
```

## Implementation Approach

**Key files likely involved:**
- `src/lib/image-to-ascii.ts` (new) - Image fetching and ASCII conversion
- `src/commands/social/formatters.ts` - Integrate ASCII preview into card
- `src/tui/views/components/SocialViewContent.tsx` - Integrate into TUI preview
- `src/commands/social/runner.ts` - Fetch image during command execution

**Approach:**
1. Fetch og:image URL (with timeout and error handling)
2. Use sharp or jimp for image processing (resize, grayscale conversion)
3. Convert pixels to ASCII using block characters: ` ░▒▓█` or `▀▄` for half-blocks
4. Render at appropriate resolution for terminal (e.g., 40×20 characters)
5. Cache fetched images briefly to avoid re-fetching on TUI refresh
6. Graceful fallback to `[IMG] url` placeholder when fetch fails

**Libraries to consider:**
- `sharp` - Fast image processing (already common in Node ecosystem)
- `terminal-image` - Purpose-built for terminal image rendering
- Custom implementation using block characters for minimal dependencies

**Considerations:**
- Network latency: Image fetch adds time - consider async loading with placeholder
- Large images: Resize before processing to limit memory
- Unsupported formats: Handle gracefully (AVIF may not be supported)
- Non-TTY mode: Skip ASCII rendering, keep URL placeholder
- TUI: May want toggle to show/hide image preview (bandwidth consideration)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 og:image is fetched and rendered as ASCII art in TTY mode
- [x] #2 ASCII preview maintains approximate aspect ratio of original image
- [x] #3 Preview renders within the social card mockup boundaries
- [x] #4 Graceful fallback to URL placeholder when image fetch fails or times out
- [x] #5 Non-TTY mode continues to show URL placeholder (no ASCII)
- [x] #6 TUI displays ASCII image preview in the card preview component
- [x] #7 Image fetch has reasonable timeout (e.g., 5 seconds)
- [x] #8 Research page updated with toolCoverage entry
- [x] #9 CHANGELOG entry references research page and version
- [x] #10 ASCII preview shows clear "broken image" state when og:image URL returns 404 or other errors (not just fallback to URL)
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary

Completed the ASCII image preview feature for the `social` command. The og:image is now rendered as colored ASCII art using half-block characters directly in the terminal, giving users immediate visual feedback about their social preview image.

### Changes Made

**packages/cli/src/commands/social/formatters.ts**
- Added TTY mode check to skip ASCII fetch in non-TTY mode (for performance)
- Changed error fallback from `[IMG] url` to `[IMG ERR] url` with red color for clear broken image indication

**packages/tui/src/views/components/SocialViewContent.tsx**
- Changed error state from `[IMG] url` to `[IMG ERR] url` with error color styling

**research/topics/social-metadata/open-graph-validation.md**
- Added toolCoverage entry for ASCII art preview feature (since v0.0.18)

**packages/cli/CHANGELOG.md** and **packages/tui/CHANGELOG.md**
- Added changelog entries documenting the feature with research reference

### Testing

- All unit tests pass (130 tests)
- Lint passes
- Build succeeds

### Research Reference

[[open-graph-validation]] (research-v0.6.0) - Image dimension requirements (1200×630 universal recommendation)
<!-- SECTION:FINAL_SUMMARY:END -->
