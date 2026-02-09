---
id: TASK-017
title: Review and align ai command with lens patterns
status: To Do
assignee: []
created_date: '2026-02-09 14:34'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-016
references:
  - src/commands/ai/
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
After the first lens (reader) is complete, review the existing `ai` command and align it with the established lens patterns.

**Purpose:** Ensure the `ai` command follows the same UX, architecture, and output patterns established by the reader lens.

**Review Areas:**
1. **CLI output format** — Does it match the reader lens style?
2. **Help text** — Does it clearly position `ai` as a lens ("How AI crawlers see your page")?
3. **JSON output structure** — Does it follow the conventions established for lenses?
4. **TUI integration** — Is it properly placed in the Lenses section?
5. **Code architecture** — Does it use shared libraries appropriately?

**Potential Changes:**
- Update help text to use lens framing
- Align output format with reader lens conventions
- Ensure JSON structure matches lens conventions
- Update TUI placement/presentation
- Refactor to use shared Readability library from TASK-016

**Note:** The `ai` command may not need significant changes, but this review ensures consistency across all lenses.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 ai command reviewed against reader lens patterns
- [ ] #2 Help text uses lens framing
- [ ] #3 Output format is consistent with other lenses
- [ ] #4 JSON structure follows lens conventions
- [ ] #5 TUI shows ai in Lenses section correctly
- [ ] #6 Code uses shared libraries where appropriate
- [ ] #7 Documentation updated if changes made
<!-- AC:END -->
