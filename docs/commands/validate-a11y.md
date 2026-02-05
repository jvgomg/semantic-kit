# Accessibility Validation

Validate pages against WCAG using axe-core.

---

## What it does

The `validate:a11y` command checks your page for accessibility violations including color contrast, missing labels, invalid ARIA, keyboard issues, and heading structure problems.

---

## Usage

```bash
# Validate with default settings (WCAG 2.2 Level AA)
semantic-kit validate:a11y https://example.com

# Validate with specific WCAG level
semantic-kit validate:a11y https://example.com --level a
semantic-kit validate:a11y https://example.com --level aa   # default
semantic-kit validate:a11y https://example.com --level aaa

# Different output formats
semantic-kit validate:a11y https://example.com --format full     # default
semantic-kit validate:a11y https://example.com --format compact  # summary
semantic-kit validate:a11y https://example.com --format json     # machine-readable

# Ignore incomplete checks (still displayed, but don't cause error exit)
semantic-kit validate:a11y https://example.com --ignore-incomplete

# Increase timeout for slow pages
semantic-kit validate:a11y https://example.com --timeout 10000
```

---

## Options

| Option | Description |
|--------|-------------|
| `--level` | WCAG level: `a`, `aa` (default), `aaa` |
| `--format full` | Default. Detailed violation output |
| `--format compact` | Summary counts only |
| `--format json` | Machine-readable JSON |
| `--ignore-incomplete` | Don't exit with error for incomplete checks |
| `--timeout` | Browser timeout in milliseconds (default: 30000) |

---

## Behavior

| What it does | Why | Research |
|--------------|-----|----------|
| Uses axe-core engine | Industry standard, zero false positives | [[axe-core]] |
| Renders with Playwright | Computes real contrast, builds accessibility tree | [[accessibility-tree]] |
| Reports violations by severity | Prioritize critical issues first | [[violation-detection-tools]] |
| Marks uncertain cases "incomplete" | Automated testing has limits (~57% coverage) | [[axe-core]] |

---

## Output

### Violation output

```
┌─────────────────────────────────────────────────────────────
│ Accessibility Validation
│ https://example.com
├─────────────────────────────────────────────────────────────
│ WCAG Level: AA
└─────────────────────────────────────────────────────────────

✗ 3 violation(s) found
  1 serious, 2 moderate

Serious:
✗ [serious] color-contrast
    Elements must meet minimum color contrast ratio thresholds
    Element: <p class="light-text">Some text...</p>
    Fix: Element has insufficient color contrast of 2.5:1

Moderate:
✗ [moderate] image-alt
    Images must have alternate text
    Element: <img src="hero.jpg">
    Fix: Element does not have an alt attribute

⚠ [moderate] landmark-one-main
    Document should have one main landmark
    Element: <html>
    Fix: Document does not have a main landmark

15 checks passed
```

### Severity levels

| Severity | Meaning |
|----------|---------|
| critical | Blocks users completely. Fix immediately. |
| serious | Significantly impacts users. Must fix. |
| moderate | Creates barriers for some users. Should fix. |
| minor | Minor inconvenience. Consider fixing. |

### Exit codes

| Code | Meaning |
|------|---------|
| `0` | No violations or incomplete checks |
| `1` | Violations found, incomplete checks, or error |

Use `--ignore-incomplete` to only fail on actual violations:

```bash
# CI: fail only for violations, not incomplete checks
semantic-kit validate:a11y https://example.com --ignore-incomplete || exit 1
```

---

## Common violations

### color-contrast

Text doesn't have enough contrast against its background.

```css
/* Bad: 2.5:1 contrast */
.light-text { color: #999; background: #fff; }

/* Good: 4.5:1 contrast or better */
.readable-text { color: #595959; background: #fff; }
```

### image-alt

Images missing alternative text.

```html
<!-- Bad -->
<img src="hero.jpg">

<!-- Good: descriptive alt -->
<img src="hero.jpg" alt="Team collaborating in office">

<!-- Good: decorative image -->
<img src="decorative.svg" alt="" role="presentation">
```

### label

Form inputs without associated labels.

```html
<!-- Bad -->
<input type="email" name="email">

<!-- Good: explicit label -->
<label for="email">Email</label>
<input type="email" id="email" name="email">
```

### landmark-one-main

Page missing a main content landmark.

```html
<!-- Bad -->
<div class="content">...</div>

<!-- Good -->
<main>...</main>
```

### heading-order

Heading levels skipped (e.g., h1 to h3).

```html
<!-- Bad: skips h2 -->
<h1>Page Title</h1>
<h3>Section</h3>

<!-- Good -->
<h1>Page Title</h1>
<h2>Section</h2>
```

---

## Requirements

Requires Playwright:

```bash
bun add playwright
bunx playwright install chromium
```

A real browser is needed to compute actual color contrast ratios and build the accessibility tree.

---

## Programmatic usage

```typescript
import AxeBuilder from '@axe-core/playwright'
import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('https://example.com')

const results = await new AxeBuilder({ page })
  .withTags(['wcag2aa', 'wcag21aa', 'wcag22aa'])
  .exclude('.third-party-widget')
  .analyze()

console.log(results.violations)
await browser.close()
```

---

## Related

- [[axe-core]] — The accessibility testing engine
- [[accessibility-tree]] — What assistive technologies see
- [[violation-detection-tools]] — Overview of testing tools
- [[pa11y]] — Alternative CLI tool
