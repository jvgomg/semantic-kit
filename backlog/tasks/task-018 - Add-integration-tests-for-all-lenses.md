---
id: TASK-018
title: Add integration tests for all lenses
status: To Do
assignee: []
created_date: '2026-02-09 14:34'
updated_date: '2026-02-09 14:35'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-004
  - TASK-006
  - TASK-007
  - TASK-016
  - TASK-017
references:
  - integration-tests/
  - test-server/
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
After all lenses are complete, add comprehensive integration tests.

**Scope:**
1. Review test-server fixtures for suitability
2. Add new fixture pages if needed for lens testing
3. Create integration tests for each lens:
   - `ai` lens
   - `reader` lens
   - `google` lens
   - `social` lens
   - `screen-reader` lens

**Test Coverage:**
- Each lens should have tests for:
  - Basic functionality with well-formed pages
  - Edge cases (missing metadata, malformed content)
  - All output formats (full, compact, json)
  - Error handling

**Test Server Considerations:**
- May need fixtures with specific structured data for `google` lens
- May need fixtures with OG/Twitter tags for `social` lens
- May need fixtures that trigger/don't trigger Safari Reader for `reader` lens
- Consider adding fixtures in `test-server/fixtures/lenses/` directory

**Reference:** integration-tests/, test-server/
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Test server fixtures reviewed and extended as needed
- [ ] #2 Integration tests exist for all 5 lenses
- [ ] #3 Tests cover all output formats
- [ ] #4 Tests cover edge cases and error handling
- [ ] #5 Tests are documented and follow established patterns
<!-- AC:END -->
