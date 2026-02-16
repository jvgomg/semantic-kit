---
id: TASK-029
title: Add Safari Reader validation command
status: To Do
assignee: []
created_date: '2026-02-16 13:11'
labels:
  - research-backed
  - validate-reader
  - feature
dependencies: []
references:
  - research/topics/content-extraction/reader-mode.md
  - research/entities/apple/apple.md
  - research/CHANGELOG.md#research-v030
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Research Context

**Source:** [[reader-mode]], [[apple]], [[readability]] (research-v0.3.0)

**Finding:**
Research revealed specific, testable requirements for Safari Reader activation that are not widely documented:
- Minimum 350-400 characters of text
- At least 10 commas in the article content
- At least 5 child elements in the content wrapper
- Container element must not be `<p>` alone
- Must be served via HTTP/HTTPS (not `file://` URLs)

These can be validated programmatically to help developers ensure Safari Reader compatibility.

## Proposed Change

**Affected command(s):** New `validate:reader` command

**What should change:**
Add validation that checks Safari Reader compatibility with clear pass/fail results for each requirement. Follows the pattern of existing `validate:html`, `validate:a11y`, and `validate:schema` commands.

**Example output:**
```
Safari Reader Validation: https://example.com/article

✓ Character count: 4,523 (minimum: 350)
✓ Comma count: 67 (minimum: 10)
✓ Child elements: 28 (minimum: 5)
✓ Container type: <article> (valid)
✓ Protocol: HTTPS (valid)

Result: PASS - Page should trigger Safari Reader
```

## Implementation Approach

**Key files:**
- `src/commands/validate-reader.ts` (new) - Validation command
- `src/lib/safari-heuristics.ts` (new or shared with `reader` command) - Safari checks

**Approach:**
1. Implement individual checks as pure functions
2. Identify content wrapper (look for `<article>`, `<main>`, or highest-scoring content container)
3. Return structured results with passed, actual, threshold, recommendation
4. Follow existing validation patterns (output format, exit codes)
5. Support CI usage (exit code 0 for pass, non-zero for fail)

**Considerations:**
- Character count should focus on likely content areas
- Comma count should be in main content, not navigation
- "Child elements" means direct children of content wrapper
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 validate:reader command checks Safari Reader requirements
- [ ] #2 Checks character count (>= 350)
- [ ] #3 Checks comma count (>= 10)
- [ ] #4 Checks child element count (>= 5)
- [ ] #5 Checks container type (not <p> alone)
- [ ] #6 Checks protocol (HTTP/HTTPS, not file://)
- [ ] #7 Output shows pass/fail for each check with actual vs threshold
- [ ] #8 Failed checks include recommendations
- [ ] #9 Exit code reflects pass/fail for CI usage
- [ ] #10 JSON output includes structured validation results
- [ ] #11 Research page updated with toolCoverage entry
- [ ] #12 CHANGELOG entry references research page and version
<!-- AC:END -->
