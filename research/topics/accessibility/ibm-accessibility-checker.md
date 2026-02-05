---
title: "IBM accessibility-checker"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# IBM accessibility-checker

IBM's automated accessibility testing toolkit from the Equal Access project.

The IBM Equal Access Accessibility Checker provides automated testing tools for browsers and CI environments. Unlike [[pa11y]] and [[lighthouse-accessibility]] which use [[axe-core]], it implements IBM's own rule set that maps to WCAG guidelines.

## Installation

```bash
npm install accessibility-checker
```

Requires Node.js 18 or higher [^ibm-equal-access-repo].

## Key Features

### Baseline Comparison

The standout feature is baseline tracking for regression detection [^ibm-equal-access-repo]. You can:

1. Run an initial scan and save results as a baseline
2. Compare subsequent scans against the baseline
3. Detect new violations (regressions) vs. known issues

This is useful for large codebases where fixing all issues immediately isn't feasible.

### Local File Scanning

Unlike tools that require a running server, accessibility-checker can scan local HTML files directly [^ibm-equal-access-repo]:

```bash
npx achecker scan ./path/to/file.html
```

### Multiple Output Formats

Results can be exported as [^ibm-equal-access-repo]:
- JSON
- CSV
- XLSX (Excel)
- HTML reports

## CLI Usage

```bash
# Scan a URL
npx achecker scan https://example.com

# Scan a local file
npx achecker scan ./index.html

# Scan multiple files
npx achecker scan ./pages/*.html
```

## Programmatic Usage

### With Puppeteer

```javascript
const { getCompliance } = require('accessibility-checker');
const puppeteer = require('puppeteer');

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://example.com');

const results = await getCompliance(page, 'example-scan');
console.log(results.report.results);

await browser.close();
```

### With Playwright

```javascript
const { getCompliance } = require('accessibility-checker');
const { chromium } = require('playwright');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://example.com');

const results = await getCompliance(page, 'example-scan');

await browser.close();
```

## Test Framework Integration

### Jest

```javascript
const { getCompliance, assertCompliance } = require('accessibility-checker');

describe('Accessibility', () => {
  test('homepage has no violations', async () => {
    const results = await getCompliance(page, 'homepage');
    const assertionResult = assertCompliance(results.report);
    expect(assertionResult).toBe(0); // 0 = compliant
  });
});
```

### Cypress

IBM provides a dedicated Cypress wrapper:

```bash
npm install cypress-accessibility-checker
```

```javascript
// cypress/support/commands.js
import 'cypress-accessibility-checker';

// In tests
cy.visit('https://example.com');
cy.getCompliance('homepage');
cy.assertCompliance();
```

## IBM Rule Set

The checker uses IBM's own accessibility rules, which map to WCAG guidelines but include additional checks based on IBM's accessibility standards. The rules are documented in the IBM Equal Access Toolkit [^ibm-equal-access-repo].

## Browser Extensions

IBM also provides browser extensions for manual testing [^ibm-equal-access-repo]:
- Chrome extension
- Firefox extension
- Edge extension

These integrate accessibility checking into browser DevTools.

## Comparison with Alternatives

| Aspect | IBM accessibility-checker | [[pa11y]] |
|--------|---------------------------|-----------|
| Engine | IBM rules | axe or htmlcs |
| Baseline tracking | Built-in | Not available |
| Local file scan | Supported | Requires server |
| Browser extensions | Available | Not available |

## When to Use

**Choose IBM accessibility-checker when:**
- You need baseline comparison for regression tracking
- You want to scan local HTML files directly
- You prefer IBM's rule documentation style
- You're already using IBM's accessibility toolkit

## Related Pages

- [[accessibility]] - Overview of accessibility testing
- [[violation-detection-tools]] - Comparison of testing tools
- [[axe-core]] - Alternative testing engine
- [[pa11y]] - Alternative CLI tool
- [[lighthouse-accessibility]] - Alternative approach

## References

[^ibm-equal-access-repo]:
  - **Source**: GitHub
  - **Title**: "IBMa/equal-access"
  - **URL**: https://github.com/IBMa/equal-access
  - **Accessed**: 2026-02-03
  - **Supports**: Installation, CLI usage, baseline comparison, local file scanning, browser extensions, test framework integration
