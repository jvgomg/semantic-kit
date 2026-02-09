```yaml
# Metadata (keep at top of file)
researchVersion: null
toolVersion: null
status: complete
created: 2025-02-07
```

# Add Spinner Support to validate-a11y and validate-schema Commands

## Context

**Problem:**
The `validate-a11y` and `validate-schema` commands don't show a spinner in TTY mode like other commands (`ai`, `structure`, `schema`, `bot`, etc.). This creates an inconsistent user experience.

**Background:**
The TTY spinner feature was added to provide visual feedback during network requests. Most commands now support:
- `--plain` / `--ci` flags to disable spinners
- Automatic TTY detection via `resolveOutputMode()`
- Spinner animation while fetching, then clean output

**Current state:**
- `validate-a11y.ts` and `validate-schema.ts` have the `OutputModeOptions` type added to their options interface
- The `resolveOutputMode` and `runWithSpinner` imports are not yet added
- The command logic still uses inline try/catch error handling

---

## Proposed Change

**Affected command(s):** `validate:a11y`, `validate:schema`

**What should change:**
Both commands should show a spinner while fetching/validating, consistent with other commands.

**Complexity:**
These commands have exit code logic that depends on validation results:

- `validate-a11y`: Exits with code 1 if `violations > 0` or `(incomplete > 0 && !ignoreIncomplete)`
- `validate-schema`: Exits with code 1 if any tests fail

This requires either:
1. Modifying `runWithSpinner` to return the result for post-output exit handling
2. Using `setTimeout(() => process.exit(1), 0)` in the render function (current pattern in `validate-html`)

---

## Implementation Approach

**Key files:**
- `src/tty/spinner.ts` - Modify `runWithSpinner` to return the result
- `src/commands/validate-a11y.ts` - Add spinner support
- `src/commands/validate-schema.ts` - Add spinner support

**Approach:**

### Step 1: Modify `runWithSpinner` to return result

```typescript
export async function runWithSpinner<T>(
  options: RunWithSpinnerOptions<T>,
): Promise<T> {  // Changed from Promise<void>
  // ... existing code ...

  const result = await fetch()
  stopSpinner()
  console.log(render(result))
  return result  // Return the result for post-output logic
}
```

### Step 2: Refactor validate-a11y.ts

```typescript
export async function validateA11y(
  url: string,
  options: ValidateA11yOptions,
): Promise<void> {
  requireUrl(url, 'validate:a11y')
  const format = validateFormat(options.format, VALID_FORMATS)
  const level = parseLevel(options.level)
  const timeoutMs = validateTimeout(options.timeout)
  const mode = resolveOutputMode(options)

  const fetchFn = () => runAxeAnalysis(url, level, timeoutMs)
  const renderFn = (result: AxeAnalysisResult) =>
    formatA11yOutput(result, format, url, level, options.ignoreIncomplete)

  let result: AxeAnalysisResult

  if (mode === 'tty') {
    result = await runWithSpinner({
      fetch: fetchFn,
      render: renderFn,
      message: `Validating ${url}...`,
    })
  } else {
    result = await fetchFn()
    console.log(renderFn(result))
  }

  // Exit logic after output
  const hasViolations = result.results.violations.length > 0
  const hasIncomplete = result.results.incomplete.length > 0
  if (hasViolations || (hasIncomplete && !options.ignoreIncomplete)) {
    process.exit(1)
  }
}
```

### Step 3: Refactor validate-schema.ts

Similar pattern - extract fetch and format functions, use spinner, handle exit after output.

**Considerations:**
- Error handling is now centralized in `cli.ts` via `withGlobalOptions` wrapper
- The `runWithSpinner` return type change is backwards compatible (callers can ignore the return value)
- Exit codes must be handled after `runWithSpinner` returns, not inside the render function

---

## Acceptance Criteria

- [ ] `runWithSpinner` returns the fetch result
- [ ] `validate:a11y` shows spinner in TTY mode
- [ ] `validate:a11y --plain` skips spinner
- [ ] `validate:a11y` exits with code 1 when violations found
- [ ] `validate:a11y --ignore-incomplete` respects flag for exit code
- [ ] `validate:schema` shows spinner in TTY mode
- [ ] `validate:schema --plain` skips spinner
- [ ] `validate:schema` exits with code 1 when tests fail
- [ ] All existing tests pass

---

## Notes

**Related files already updated:**
- `src/lib/output-mode.ts` - Detection logic (done)
- `src/cli.ts` - Global `--plain`/`--ci` flags and error handling wrapper (done)
- `src/tty/spinner.ts` - ANSI spinner implementation (done)

**Commands already using spinner:**
- `ai`, `structure`, `schema`, `bot`, `structure-js`, `structure-compare`, `validate-html`

**Estimated effort:** Small (~30 min)
