```yaml
# Metadata (keep at top of file)
researchVersion: research-v0.3.0
toolVersion: null
status: pending
created: 2026-02-04
```

# Add Safari Reader validation to `validate` commands

## Research Context

**Source:** [[reader-mode]], [[apple]], [[readability]]

**Finding:**
Research revealed specific, testable requirements for Safari Reader activation that are not widely documented. Developers often don't know why Safari Reader doesn't appear on their pages. The requirements include:

- Minimum 350-400 characters of text
- At least 10 commas in the article content
- At least 5 child elements in the content wrapper
- Container element must not be `<p>` alone
- Must be served via HTTP/HTTPS (not `file://` URLs)

These can be validated programmatically to help developers ensure Safari Reader compatibility.

**Citations:**

- [^mathias-safari-reader]: Safari Reader triggering requirements, minimum thresholds
- [^safari-readability-repo]: Source code confirming 10-comma minimum for primary candidate
- [^ctrl-blog-content]: Safari vs Mozilla differences, visual positioning

---

## Proposed Change

**Affected command(s):** New `validate:reader` command (or flag on existing validation)

**What should change:**
Add validation that checks Safari Reader compatibility with clear pass/fail results for each requirement. This follows the pattern of existing `validate:html`, `validate:a11y`, and `validate:schema` commands.

**Example output (if applicable):**
```
Safari Reader Validation: https://example.com/article

✓ Character count: 4,523 (minimum: 350)
✓ Comma count: 67 (minimum: 10)
✓ Child elements: 28 (minimum: 5)
✓ Container type: <article> (valid)
✓ Protocol: HTTPS (valid)

Result: PASS - Page should trigger Safari Reader

---

Safari Reader Validation: https://example.com/short-page

✗ Character count: 287 (minimum: 350)
✓ Comma count: 12 (minimum: 10)
✗ Child elements: 3 (minimum: 5)
✓ Container type: <div> (valid)
✓ Protocol: HTTPS (valid)

Result: FAIL - 2 issues found

Recommendations:
- Add more content (need 63+ more characters)
- Add more paragraph elements (need 2+ more)
```

---

## Implementation Approach

**Key files likely involved:**
- `src/commands/validate-reader.ts` (new) - Validation command
- `src/lib/safari-heuristics.ts` (new or shared with `reader` command) - Safari checks

**Approach:**

1. **Implement individual checks** as pure functions:
   ```typescript
   checkCharacterCount(doc: Document): ValidationResult
   checkCommaCount(doc: Document): ValidationResult
   checkChildElements(doc: Document): ValidationResult
   checkContainerType(doc: Document): ValidationResult
   checkProtocol(url: string): ValidationResult
   ```

2. **Identify content wrapper** — Look for `<article>`, `<main>`, or highest-scoring content container (similar to Readability's candidate selection).

3. **Return structured results** — Each check returns:
   - `passed: boolean`
   - `actual: number | string`
   - `threshold: number | string`
   - `recommendation?: string`

4. **Follow existing validation patterns** — Match the output format and exit codes of `validate:html`, `validate:a11y`, etc.

5. **Support CI usage** — Exit code 0 for pass, non-zero for fail. JSON output for programmatic consumption.

**Considerations:**
- Character count should focus on likely content areas (exclude nav, footer, etc.)
- Comma count should be in the main content, not navigation
- "Child elements" means direct children of the content wrapper
- Edge case: pages with multiple potential content wrappers — check the best candidate
- Consider `--fix` suggestions like other validators

---

## Acceptance Criteria

- [ ] `validate:reader` command checks Safari Reader requirements
- [ ] Checks character count (>= 350)
- [ ] Checks comma count (>= 10)
- [ ] Checks child element count (>= 5)
- [ ] Checks container type (not `<p>` alone)
- [ ] Checks protocol (HTTP/HTTPS, not file://)
- [ ] Output shows pass/fail for each check with actual vs threshold values
- [ ] Failed checks include recommendations
- [ ] Exit code reflects pass/fail for CI usage
- [ ] JSON output includes structured validation results
- [ ] Research page updated:
  - [ ] `toolCoverage` entry added to [[apple]] frontmatter
  - [ ] Note about `validate:reader` command added
- [ ] CHANGELOG entry references research page and version

---

## Notes

- This command focuses specifically on Safari Reader. Mozilla Readability uses `isProbablyReaderable()` which could be a separate check.
- The `reader` command (separate backlog item) provides detailed analysis; this command provides quick pass/fail validation.
- Consider future enhancement: `--browser safari|firefox|all` to check different reader mode implementations.
- Dependency: May want to implement after the base `reader` command to share heuristic code.
