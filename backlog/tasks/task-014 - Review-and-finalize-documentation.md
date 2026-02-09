---
id: TASK-014
title: Review and finalize documentation
status: To Do
assignee: []
created_date: '2026-02-09 14:22'
updated_date: '2026-02-09 14:35'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-004
  - TASK-006
  - TASK-007
  - TASK-010
  - TASK-012
  - TASK-016
  - TASK-018
references:
  - docs/backlog/command-api-restructure.md
  - README.md
  - AGENTS.md
  - CHANGELOG.md
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Final documentation review after all commands are implemented.

**Note:** Each task should update documentation as it goes. This task is a final review to ensure consistency and completeness.

**Review Checklist:**
- README.md shows Lenses and Utilities organization correctly
- AGENTS.md command table is complete and accurate
- All new commands have documentation in docs/commands/
- CHANGELOG documents all changes
- Migration guide exists for old command names (if deprecation period was used)
- Conceptual overview of Lenses vs Utilities is clear

**Reference:** docs/backlog/command-api-restructure.md (Phase 6: Documentation and Polish)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 README accurately reflects all commands
- [ ] #2 AGENTS.md command table is complete
- [ ] #3 All commands have consistent documentation
- [ ] #4 CHANGELOG is up to date
- [ ] #5 No broken links or outdated references
<!-- AC:END -->
