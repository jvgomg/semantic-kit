```yaml
# Metadata (keep at top of file)
researchVersion: research-v0.3.2
toolVersion: null
status: pending
created: 2026-02-04
```

# Add WCAG 2.2 Target Size Rule Support

## Research Context

**Source:** [[axe-core]]

**Finding:**
axe-core 4.11 includes the `target-size` rule for WCAG 2.2 Success Criterion 2.5.8 (Target Size Minimum, Level AA). This rule checks that interactive elements (links, buttons, form controls) have a minimum size of 24x24 CSS pixels, or sufficient spacing from adjacent targets.

The rule is **disabled by default** in axe-core because WCAG 2.2 is not yet widely required. However, developers preparing for WCAG 2.2 compliance would benefit from opt-in access to this rule.

**Citations:**

- [^deque-wcag22]: Deque's announcement that WCAG 2.2 rules are disabled by default and `target-size` is likely the only automatable WCAG 2.2 rule
- [^axe-rules-4.11]: Deque University rule reference showing target-size tagged with wcag22aa

---

## Proposed Change

**Affected command(s):** `validate:a11y`

**What should change:**
Add a `--wcag22` flag to enable WCAG 2.2 rules (currently just `target-size`). This allows developers to opt into WCAG 2.2 testing before it becomes mandatory.

**Example output:**
```
$ semantic-kit validate:a11y https://example.com --wcag22

Accessibility Validation
https://example.com
─────────────────────────────────────────────────────────────

WCAG Level: AA (including WCAG 2.2)

Violations (3):
  ✗ target-size: Ensure touch targets have sufficient size and space (2 instances)
    Impact: serious
    Elements:
      - button.small-btn (16x16px, needs 24x24px minimum)
      - a.icon-link (20x20px, needs 24x24px minimum)

  ✗ color-contrast: Elements must meet minimum color contrast ratio requirements
    ...
```

---

## Implementation Approach

**Key files likely involved:**
- `src/commands/validate-a11y.ts` - Add `--wcag22` flag option
- `src/lib/axe-static.ts` - Add WCAG 2.2 rules to the safe rules list, create new rule set option

**Approach:**

1. Add `target-size` to `JSDOM_SAFE_RULES` in `axe-static.ts` (verify it works in jsdom first)
2. Create a new `WCAG22_RULES` constant containing rules for WCAG 2.2
3. Add a `wcag22` option to `AxeStaticOptions` interface
4. Update `runAxeOnStaticHtml()` to include WCAG 2.2 rules when the flag is set
5. Add `--wcag22` CLI flag to validate:a11y command
6. Update output to indicate when WCAG 2.2 rules are enabled

**Considerations:**
- The `target-size` rule requires computing element dimensions, which may not work reliably in jsdom. Need to test whether it returns "incomplete" or actual results.
- If it doesn't work in jsdom, we should only enable it for browser-based testing (Playwright integration)
- Future WCAG 2.2 rules can be added to the same `WCAG22_RULES` constant
- Consider also adding `--wcag21` for explicit version targeting (currently implicit)

---

## Acceptance Criteria

- [ ] `--wcag22` flag added to `validate:a11y` command
- [ ] `target-size` rule executes without returning "incomplete" in jsdom (or is excluded if it doesn't work)
- [ ] Output clearly indicates when WCAG 2.2 rules are enabled
- [ ] Help text explains that WCAG 2.2 rules are opt-in
- [ ] Research page updated:
  - [ ] `toolCoverage` entry added to [[axe-core]] frontmatter
  - [ ] Inline callout added noting semantic-kit support
- [ ] CHANGELOG entry references [[axe-core]] and research-v0.3.2

---

## Notes

- WCAG 2.2 became a W3C Recommendation in October 2023, but adoption is still gradual
- The European Accessibility Act (June 2025) references WCAG 2.1, not 2.2
- Section 508 (US) still references WCAG 2.0
- Making this opt-in is appropriate until WCAG 2.2 becomes more widely mandated
- The `target-size` rule is the only WCAG 2.2 rule likely to be automated—other 2.2 criteria require manual testing
