---
id: TASK-007
title: Create social lens
status: Done
assignee: []
created_date: '2026-02-09 14:21'
updated_date: '2026-02-10 00:55'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-017
references:
  - docs/backlog/command-api-restructure.md
  - src/commands/schema/
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
New lens showing how social media platforms see a page for link previews.

**Purpose:** Answer "How will my link appear when shared on WhatsApp, Slack, Twitter, iMessage?"

**Behavior:**
- Shows Open Graph tags (og:title, og:description, og:image, og:url, etc.)
- Shows Twitter Card tags (twitter:card, twitter:title, etc.)
- Reports completeness (missing required/recommended tags)
- May show visual preview per TASK-001 decision

**Implementation:**
1. Create `src/commands/social/` directory
2. Reuse schema extraction logic from `src/commands/schema/`
3. Filter to OG and Twitter Card meta tags
4. Show preview of how link would appear (title, description, image)
5. Register in CLI as a Lens
6. Add to TUI navigation
7. Add tests

**Options:**
- `--format <type>` — full, compact, json (default: full)

**Reference:** docs/backlog/command-api-restructure.md (social lens)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 social command exists and works
- [x] #2 Shows Open Graph and Twitter Card tags
- [x] #3 Reports missing required/recommended tags
- [x] #4 TUI includes social in Lenses section
- [x] #5 Integration tests cover command functionality
- [x] #6 Documentation updated (AGENTS.md command table)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Decision Context

Per TASK-001 decision #4: **Context-dependent output**

- **Plain mode (`--plain`)**: Simple data list of OG/Twitter meta tags
- **TTY mode (default)**: Raw data + ASCII mockup showing card structure
- **TUI**: Raw data + ASCII mockup with visual formatting

Ascii mockup should show title, description, and image URL in a card-like layout.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary

Implemented the `social` lens command that shows how social media platforms see a page for link previews.

### Features
- Extracts Open Graph tags (og:title, og:description, og:image, og:url, og:type, og:site_name, og:locale)
- Extracts Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image, twitter:site, twitter:creator)
- ASCII card preview mockup showing how the link will appear when shared
- Completeness bars showing OG and Twitter tag coverage (0-100%)
- Reports missing required and recommended tags
- Falls back to page metadata (title, description, canonical URL) when social tags are missing
- JSON output includes issues for missing/incomplete tags

### Files Added
- `src/commands/social/types.ts` - Type definitions and tag constants
- `src/commands/social/runner.ts` - HTML extraction logic
- `src/commands/social/formatters.ts` - Terminal output with ASCII card preview
- `src/commands/social/command.ts` - CLI command handler
- `src/commands/social/index.ts` - Public API exports
- `src/tui/views/social-view.ts` - TUI view registration
- `src/tui/views/components/SocialViewContent.tsx` - TUI component
- `test-server/fixtures/good/social-complete.html` - Test fixture with complete social tags
- `integration-tests/social/tag-extraction.test.ts` - Integration tests

### Files Modified
- `src/cli.ts` - Added social command registration and help text
- `src/tui/views/index.ts` - Added social view import
- `integration-tests/utils/cli.ts` - Added `runSocial` test helper
- `AGENTS.md` - Added social command to documentation table
<!-- SECTION:FINAL_SUMMARY:END -->
