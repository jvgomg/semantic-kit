---
id: TASK-034
title: Add WCAG 2.2 target-size rule support
status: To Do
assignee: []
created_date: '2026-02-16 13:12'
labels:
  - research-backed
  - validate-a11y
  - feature
dependencies: []
references:
  - research/topics/accessibility/axe-core.md
  - research/CHANGELOG.md#research-v032
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Research Context

**Source:** [[axe-core]] (research-v0.3.2)

**Finding:**
axe-core 4.11 includes the `target-size` rule for WCAG 2.2 Success Criterion 2.5.8 (Target Size Minimum, Level AA). This rule checks that interactive elements have a minimum size of 24x24 CSS pixels, or sufficient spacing from adjacent targets.

The rule is **disabled by default** in axe-core because WCAG 2.2 is not yet widely required. However, developers preparing for WCAG 2.2 compliance would benefit from opt-in access.

## Proposed Change

**Affected command(s):** `validate:a11y`

**What should change:**
Add a `--wcag22` flag to enable WCAG 2.2 rules (currently just `target-size`). This allows developers to opt into WCAG 2.2 testing before it becomes mandatory.

**Example:**
```
$ semantic-kit validate:a11y https://example.com --wcag22

Accessibility Validation
WCAG Level: AA (including WCAG 2.2)

Violations (3):
  ✗ target-size: Ensure touch targets have sufficient size (2 instances)
    Impact: serious
    Elements:
      - button.small-btn (16x16px, needs 24x24px minimum)
```

## Implementation Approach

**Key files:**
- `src/commands/validate-a11y.ts` - Add `--wcag22` flag
- `src/lib/axe-static.ts` - Add WCAG 2.2 rules to safe rules list

**Approach:**
1. Add `target-size` to safe rules (verify it works in jsdom first)
2. Create `WCAG22_RULES` constant
3. Add `wcag22` option to options interface
4. Update runner to include WCAG 2.2 rules when flag is set
5. Update output to indicate when WCAG 2.2 rules are enabled

**Considerations:**
- The `target-size` rule requires computing element dimensions — may not work reliably in jsdom
- If it doesn't work in jsdom, only enable for browser-based testing
- Future WCAG 2.2 rules can be added to same constant
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 --wcag22 flag added to validate:a11y command
- [ ] #2 target-size rule executes without returning incomplete in jsdom (or is excluded if it doesn't work)
- [ ] #3 Output clearly indicates when WCAG 2.2 rules are enabled
- [ ] #4 Help text explains that WCAG 2.2 rules are opt-in
- [ ] #5 Research page updated with toolCoverage entry
- [ ] #6 CHANGELOG entry references research page and version
<!-- AC:END -->
