---
title: "Lighthouse Accessibility"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Lighthouse Accessibility

Google's accessibility auditing within the Lighthouse performance tool.

Lighthouse is Google's open-source tool for auditing web page quality. The accessibility category uses [[axe-core]] to evaluate pages against WCAG guidelines and produces a score from 0-100.

## How Scoring Works

The accessibility score is a weighted average of all accessibility audits [^lighthouse-a11y-docs]. Key characteristics:

- **Binary pass/fail** - Each audit is all-or-nothing. If some buttons have accessible names but others don't, the page scores zero for that audit.
- **Weighted by impact** - Audits are weighted based on axe-core's user impact assessments.
- **High-impact audits carry weight 10** - Critical issues like missing alt text, invalid ARIA, and color contrast.

## Running Accessibility-Only Audits

### CLI

```bash
# Run only accessibility audits
lighthouse https://example.com --only-categories=accessibility

# Output as JSON
lighthouse https://example.com --only-categories=accessibility --output=json --output-path=./report.json

# Chrome flags for headless
lighthouse https://example.com --only-categories=accessibility --chrome-flags="--headless"
```

### Node.js API

```javascript
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
const results = await lighthouse('https://example.com', {
  port: chrome.port,
  onlyCategories: ['accessibility']
});

console.log('Score:', results.lhr.categories.accessibility.score * 100);
await chrome.kill();
```

## Audit Categories

### High Weight (10)

These audits have the most impact on your score [^lighthouse-a11y-docs]:

| Audit | Checks |
|-------|--------|
| aria-* | ARIA attribute validity |
| button-name | Buttons have accessible names |
| image-alt | Images have alt text |
| input-* | Form inputs have labels |
| video-caption | Videos have captions |
| color-contrast | Sufficient color contrast |

### Medium Weight (7-3)

- Heading hierarchy (`heading-order`)
- Language declaration (`html-has-lang`)
- Table structure (`th-has-data-cells`)
- Link text (`link-name`)
- Landmark structure

### Manual Checks (Not Scored)

Some accessibility requirements can't be automated. Lighthouse lists these as manual checks [^lighthouse-a11y-docs]:

- Custom controls have appropriate ARIA roles
- Focus is managed appropriately
- Keyboard navigation is logical
- Visual order matches DOM order

## Lighthouse CI

For CI/CD integration, use Lighthouse CI [^lighthouse-ci-repo]:

```bash
npm install -g @lhci/cli
```

### Configuration

Create `lighthouserc.js`:

```javascript
module.exports = {
  ci: {
    collect: {
      url: ['https://example.com/', 'https://example.com/about'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.9 }]
      }
    }
  }
};
```

### GitHub Action

```yaml
- name: Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun
```

## Comparison with Pa11y

| Aspect | Lighthouse | [[pa11y]] |
|--------|------------|-----------|
| Output | Score (0-100) | Issues list |
| Engine | axe-core only | axe or htmlcs |
| Strengths | Familiar, dashboards | Flexibility, batch testing |
| CI tool | Lighthouse CI | pa11y-ci |

## Limitations

- **Score can be misleading** - A page with few elements may score higher than a complex page with minor issues
- **Binary audits** - Partial fixes don't improve the score until fully resolved
- **axe-core only** - No option to use alternative engines

## Related Pages

- [[accessibility]] - Overview of accessibility testing
- [[violation-detection-tools]] - Comparison of testing tools
- [[axe-core]] - The underlying testing engine
- [[pa11y]] - Alternative CLI tool

## References

[^lighthouse-a11y-docs]:
  - **Source**: Chrome Developers
  - **Title**: "Lighthouse accessibility scoring"
  - **URL**: https://developer.chrome.com/docs/lighthouse/accessibility
  - **Accessed**: 2026-02-03
  - **Supports**: Scoring methodology, audit weights, manual checks

[^lighthouse-repo]:
  - **Source**: GitHub
  - **Title**: "GoogleChrome/lighthouse"
  - **URL**: https://github.com/GoogleChrome/lighthouse
  - **Accessed**: 2026-02-03
  - **Supports**: CLI usage, Node.js API, configuration options

[^lighthouse-ci-repo]:
  - **Source**: GitHub
  - **Title**: "GoogleChrome/lighthouse-ci"
  - **URL**: https://github.com/GoogleChrome/lighthouse-ci
  - **Accessed**: 2026-02-03
  - **Supports**: CI configuration, assertions, GitHub integration
