---
id: TASK-007
title: Create social lens
status: To Do
assignee: []
created_date: '2026-02-09 14:21'
updated_date: '2026-02-09 14:43'
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
- [ ] #1 social command exists and works
- [ ] #2 Shows Open Graph and Twitter Card tags
- [ ] #3 Reports missing required/recommended tags
- [ ] #4 TUI includes social in Lenses section
- [ ] #5 Integration tests cover command functionality
- [ ] #6 Documentation updated (AGENTS.md command table)
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
