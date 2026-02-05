---
title: "Pa11y"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Pa11y

A CLI tool for automated accessibility testing, supporting multiple testing engines.

Pa11y runs accessibility tests against URLs from the command line or Node.js. It's designed for automation—CI pipelines, npm scripts, and programmatic testing workflows.

## Installation

```bash
npm install -g pa11y
```

Requires Node.js 20, 22, or 24 [^pa11y-repo].

## Basic Usage

```bash
# Test a URL
pa11y https://example.com

# Test with specific WCAG standard
pa11y --standard WCAG2AA https://example.com

# Output as JSON
pa11y --reporter json https://example.com
```

## Test Runners

Pa11y supports two testing engines via the `--runner` flag [^pa11y-repo]:

| Runner | Description |
|--------|-------------|
| `htmlcs` (default) | HTML_CodeSniffer engine |
| `axe` | [[axe-core]] engine |

```bash
# Use axe-core
pa11y --runner axe https://example.com

# Use both runners
pa11y --runner axe --runner htmlcs https://example.com
```

Using both runners provides broader coverage but may produce duplicate findings.

## WCAG Standards

The `--standard` flag sets the compliance level [^pa11y-repo]:

| Standard | Level |
|----------|-------|
| `WCAG2A` | Level A |
| `WCAG2AA` | Level AA (most common) |
| `WCAG2AAA` | Level AAA |

## Output Formats

Pa11y supports multiple reporters [^pa11y-repo]:

| Reporter | Output |
|----------|--------|
| `cli` | Human-readable (default) |
| `json` | Structured JSON |
| `csv` | Comma-separated |
| `tsv` | Tab-separated |
| `html` | HTML report |

```bash
pa11y --reporter json https://example.com > results.json
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | No accessibility issues |
| 1 | Technical error |
| 2 | Accessibility issues found |

This enables CI integration—builds fail when issues are detected.

## Configuration Options

Key options for programmatic use [^pa11y-repo]:

```javascript
const pa11y = require('pa11y');

const results = await pa11y('https://example.com', {
  standard: 'WCAG2AA',
  runners: ['axe'],
  ignore: ['WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail'],
  hideElements: '.ad-banner, .cookie-notice',
  actions: [
    'click element #accept-cookies',
    'wait for element #main-content to be visible'
  ],
  headers: {
    'Authorization': 'Bearer token'
  }
});
```

### Actions

Pa11y can interact with pages before testing [^pa11y-repo]:

```javascript
actions: [
  'click element #login-button',
  'set field #username to test@example.com',
  'set field #password to password123',
  'click element #submit',
  'wait for url to be https://example.com/dashboard'
]
```

## Pa11y CI

For batch testing multiple URLs, use pa11y-ci [^pa11y-ci-repo]:

```bash
npm install -g pa11y-ci
```

### Configuration File

Create `.pa11yci` in your project root:

```json
{
  "defaults": {
    "standard": "WCAG2AA",
    "runners": ["axe"]
  },
  "urls": [
    "https://example.com/",
    "https://example.com/about",
    {
      "url": "https://example.com/login",
      "actions": ["set field #email to test@example.com"]
    }
  ]
}
```

### Sitemap Testing

Test all URLs from a sitemap:

```bash
pa11y-ci --sitemap https://example.com/sitemap.xml
```

### Concurrency

Run tests in parallel:

```json
{
  "defaults": { "concurrency": 4 },
  "urls": [...]
}
```

## Comparison with Alternatives

| Aspect | Pa11y | [[lighthouse-accessibility]] |
|--------|-------|------------------------------|
| Engine choice | htmlcs or axe | axe only |
| Output | Issues list | Score (0-100) |
| CI tool | pa11y-ci | Lighthouse CI |
| Batch testing | Built-in | Requires scripting |

## Related Pages

- [[accessibility]] - Overview of accessibility testing
- [[violation-detection-tools]] - Comparison of testing tools
- [[axe-core]] - The axe testing engine
- [[lighthouse-accessibility]] - Alternative approach

## References

[^pa11y-repo]:
  - **Source**: GitHub
  - **Title**: "pa11y/pa11y"
  - **URL**: https://github.com/pa11y/pa11y
  - **Accessed**: 2026-02-03
  - **Supports**: CLI usage, runners, standards, output formats, actions, configuration

[^pa11y-ci-repo]:
  - **Source**: GitHub
  - **Title**: "pa11y/pa11y-ci"
  - **URL**: https://github.com/pa11y/pa11y-ci
  - **Accessed**: 2026-02-03
  - **Supports**: CI configuration, sitemap testing, concurrency options
