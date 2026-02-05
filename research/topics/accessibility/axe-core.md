---
title: "axe-core"
lastVerified: 2026-02-04
lastUpdated: 2026-02-04
---

# axe-core

The most widely-used accessibility testing engine, created by Deque Systems.

axe-core is an open-source JavaScript library that powers automated accessibility testing in browsers and Node.js environments. It's the engine behind [[pa11y]] (when using the axe runner), [[lighthouse-accessibility]], and many other tools.

## How It Works

axe-core injects into a page and evaluates the DOM against a rule set derived from WCAG guidelines. Each rule targets specific accessibility requirements and returns one of four result types [^axe-core-repo]:

| Result | Meaning |
|--------|---------|
| violations | Definite failures |
| passes | Elements that passed |
| incomplete | Manual review needed |
| inapplicable | Rule doesn't apply to this page |

The "incomplete" category handles cases where automated testing cannot determine pass/fail with certainty, flagging them for manual review.

## Detection Rate

axe-core can find approximately 57% of WCAG issues automatically [^axe-core-repo]. Deque claims users can "find and fix up to 80% of issues" using their extended tooling [^deque-axe]. The remaining issues require manual testing with assistive technologies.

## Zero False Positives

A core design principle is the "zero false positives" commitment [^deque-axe]. Rather than flag uncertain cases as violations (which wastes developer time), axe-core marks them as "incomplete" for manual review. This makes the tool more trustworthy in CI pipelines where false positives cause friction.

## WCAG Coverage

axe-core implements rules for [^axe-core-repo]:
- WCAG 2.0 (Levels A, AA, AAA)
- WCAG 2.1 (Levels A, AA, AAA)
- WCAG 2.2 (Levels A, AA, AAA)
- Best practice checks (beyond WCAG)

Rules are documented in the Deque University rule reference [^deque-rules].

### WCAG 2.2 Rules

WCAG 2.2 rules are **disabled by default** until the standard is more widely adopted. The primary new rule is:

- **target-size** - Ensures touch targets have sufficient size and space (WCAG 2.5.8, Level AA)

To enable WCAG 2.2 rules:

```javascript
const results = await axe.run(document, {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
  }
});
```

Because most WCAG 2.2 success criteria require manual testing, `target-size` is likely the only WCAG 2.2 rule that will be automated in axe-core [^deque-wcag22].

## Basic Usage

```javascript
const axe = require('axe-core');

// Run all rules against the document
const results = await axe.run();

if (results.violations.length) {
  console.error('Accessibility issues found:', results.violations);
}
```

## Configuration

```javascript
// Run specific rules only
const results = await axe.run(document, {
  runOnly: ['color-contrast', 'image-alt']
});

// Target specific elements
const results = await axe.run('#main-content');

// Exclude elements from testing
const results = await axe.run({
  exclude: [['#advertising']]
});
```

## Localization

axe-core supports 15+ languages. Locales can be applied at runtime [^axe-core-repo]:

```javascript
axe.configure({ locale: frenchLocale });
```

## Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 42+ |
| Firefox | 38+ |
| Safari | 7+ |
| Edge | 40+ |

JSDOM is supported with limitations—the `color-contrast` rule doesn't work in JSDOM [^axe-core-repo].

## Used By

axe-core is the foundation for many accessibility tools:

- **[[lighthouse-accessibility]]** - Uses axe-core for its accessibility audits
- **[[pa11y]]** - Supports axe as an optional runner
- **axe DevTools** - Deque's browser extensions
- **jest-axe** - Jest integration for component testing
- **cypress-axe** - Cypress integration
- **sa11y** - Salesforce's accessibility testing libraries with preset rule configurations

## Comparison with HTML_CodeSniffer

| Aspect | axe-core | HTML_CodeSniffer |
|--------|----------|------------------|
| False positives | Zero false positives policy | More permissive flagging |
| Uncertain cases | Marked "incomplete" | May be reported as warnings |
| Maintenance | Actively maintained by Deque | Less frequent updates |
| WCAG 2.2 | Supported | Partial |

[[pa11y]] supports both engines via the `--runner` flag.

## Related Pages

- [[accessibility]] - Overview of accessibility testing
- [[violation-detection-tools]] - Tools that use axe-core
- [[pa11y]] - CLI tool with axe runner support
- [[lighthouse-accessibility]] - Google's audits powered by axe

## References

[^axe-core-repo]:
  - **Source**: GitHub
  - **Title**: "dequelabs/axe-core"
  - **URL**: https://github.com/dequelabs/axe-core
  - **Accessed**: 2026-02-03
  - **Supports**: Detection rate, zero false positives approach, WCAG coverage, browser support, JSDOM limitations

[^deque-axe]:
  - **Source**: Deque Systems
  - **Title**: "axe: Accessibility Testing Tools and Software"
  - **URL**: https://www.deque.com/axe/
  - **Accessed**: 2026-02-03
  - **Supports**: 80% issue detection claim, zero false positives commitment, billions of downloads

[^deque-rules]:
  - **Source**: Deque University
  - **Title**: "axe Rules"
  - **URL**: https://dequeuniversity.com/rules/axe/
  - **Accessed**: 2026-02-03
  - **Supports**: Complete rule documentation and WCAG mappings

[^deque-wcag22]:
  - **Source**: Deque Systems
  - **Title**: "Axe-core 4.5: First WCAG 2.2 Support and More"
  - **URL**: https://www.deque.com/blog/axe-core-4-5-first-wcag-2-2-support-and-more/
  - **Accessed**: 2026-02-04
  - **Supports**: WCAG 2.2 rules disabled by default, target-size rule details
