---
id: TASK-040
title: Add --platform flag for platform-specific social previews
status: To Do
assignee: []
created_date: '2026-02-16 14:52'
labels:
  - research-backed
  - lens-social
  - feature
dependencies:
  - TASK-039
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
Research documented 8 platforms with distinct character limits and display behaviors:
- Facebook: 88 char title, 55-60 char/line description, 1.91:1 image
- LinkedIn: 119 char title, 69 char description
- Twitter/X: ~70 char title, ~200 char description, 2:1 image for large cards
- WhatsApp: 81 char title, HTTPS required
- Telegram: 1023 char title (rarely truncates)
- Slack: Full text, only reads first 32KB HTML
- Signal: Full text
- iMessage: Limited OG support

Users targeting specific platforms need to see how their content will appear on those platforms specifically.

**Key Citations:**
- OGTester: Platform-specific character limits
- OG Image Gallery: Platform dimension requirements
- Platform debugging tools: Observed display behaviors

## Proposed Change

**Affected command(s):** `social` (CLI and TUI)

**What should change:**

### CLI Enhancement
Add `--platform` flag to show platform-specific previews:
```bash
# Show specific platforms
bun run dev social https://example.com --platform=facebook,twitter

# Show all platform previews  
bun run dev social https://example.com --platform=all

# Default (no flag): conservative preview only
bun run dev social https://example.com
```

### TUI Enhancement
Add a "Platform Previews" expandable section in the TUI that shows side-by-side or stacked previews for each major platform, using the parameterized preview component from TASK-039.

## Implementation Approach

**Key files likely involved:**
- `src/commands/social/runner.ts` - Add --platform argument parsing
- `src/commands/social/formatters.ts` - Render multiple platform previews
- `src/tui/views/components/SocialViewContent.tsx` - Add Platform Previews section
- `src/lib/metadata/types.ts` - Define platform configuration types

**Approach:**
1. Define `PlatformConfig` for each supported platform (name, title limit, description limit, image aspect ratio)
2. Add `--platform` CLI argument with validation (accepts: facebook, twitter, linkedin, whatsapp, telegram, slack, all)
3. Reuse parameterized preview component from TASK-039 with platform-specific limits
4. In TUI, add collapsible "Platform Previews" section with horizontal tabs or stacked cards
5. Consider keyboard navigation for switching between platforms in TUI

**Considerations:**
- Start with major platforms (Facebook, Twitter, LinkedIn) and expand later
- Image aspect ratio differences are visual only (card shape hint)
- Platform names should match what users expect (Twitter vs X - support both)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 CLI accepts --platform flag with values: facebook, twitter, linkedin, whatsapp, telegram, slack, all
- [ ] #2 --platform=all shows previews for all supported platforms
- [ ] #3 Each platform preview uses that platform's specific character limits
- [ ] #4 TUI includes Platform Previews section with multiple platform cards
- [ ] #5 Platform previews indicate which platform they represent
- [ ] #6 JSON output includes platform-specific preview data when --platform is used
- [ ] #7 Research page updated with toolCoverage entry
- [ ] #8 CHANGELOG entry references research page and version
<!-- AC:END -->
