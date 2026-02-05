---
title: "Violation Detection Tools"
lastVerified: 2026-02-04
lastUpdated: 2026-02-04
---

# Violation Detection Tools

Automated tools that scan web pages against WCAG rules and report accessibility failures.

## How They Work

Violation detection tools evaluate the DOM against a rule set derived from WCAG guidelines. Each rule checks for specific accessibility requirements (e.g., "images must have alt text", "color contrast must meet minimum ratios").

Output typically includes:
- **Violation type** - Which rule failed
- **Severity** - Impact level (critical, serious, moderate, minor)
- **Element selector** - CSS selector for the failing element
- **Remediation guidance** - How to fix the issue

## The Underlying Engine

Most tools use [[axe-core]] as their testing engine. This provides consistency—the same rules produce the same results across different tools. Some tools offer alternative engines:

| Tool | Default Engine | Alternative |
|------|----------------|-------------|
| [[pa11y]] | HTML_CodeSniffer | axe-core |
| [[lighthouse-accessibility]] | axe-core | None |
| [[ibm-accessibility-checker]] | IBM rules | None |
| sa11y | axe-core (presets) | None |

## Detection Limits

Automated tools catch 30-57% of accessibility issues [^axe-core-repo]. They excel at:

- Missing alt text
- Color contrast failures
- Invalid ARIA attributes
- Missing form labels
- Heading hierarchy issues

They cannot detect:
- Whether alt text is meaningful
- Whether content order makes sense
- Keyboard navigation usability
- Screen reader announcement quality

Manual testing with real assistive technologies remains necessary.

## Integration Patterns

### CLI Testing

Run against a URL during development:

```bash
# Pa11y
pa11y https://localhost:3000

# Lighthouse
lighthouse https://localhost:3000 --only-categories=accessibility --output=json
```

### CI Pipeline

Fail builds when violations exceed thresholds:

```yaml
# Example GitHub Actions step
- name: Accessibility check
  run: pa11y-ci --sitemap https://example.com/sitemap.xml
```

### Component Testing

Test individual components in isolation:

```javascript
const { axe, toHaveNoViolations } = require('jest-axe');
expect.extend(toHaveNoViolations);

test('Button is accessible', async () => {
  const { container } = render(<Button>Click me</Button>);
  expect(await axe(container)).toHaveNoViolations();
});
```

## Tool Comparison

| Tool | Best For | Unique Strength |
|------|----------|-----------------|
| [[pa11y]] | CLI workflows | Multiple runner support |
| [[lighthouse-accessibility]] | Scoring/reporting | Familiar to most teams |
| [[ibm-accessibility-checker]] | Regression tracking | Baseline comparison |
| sa11y | Salesforce projects | Pre-configured axe presets |

### sa11y (Salesforce)

Salesforce's sa11y is an axe-core wrapper that provides pre-configured rule presets [^sa11y-repo]:

- **Base** - Core accessibility rules
- **Extended** - Additional best practices
- **Full** - All available rules

The presets can be customized, making sa11y useful for teams that want consistent rule configurations across projects without manual axe configuration.

## Choosing a Tool

**Use [[pa11y]] when:**
- You want CLI-first workflows
- You need to switch between axe and HTML_CodeSniffer
- You're testing multiple URLs with pa11y-ci

**Use [[lighthouse-accessibility]] when:**
- Your team already uses Lighthouse for performance
- You want a single score (0-100) for dashboards
- You're using Lighthouse CI infrastructure

**Use [[ibm-accessibility-checker]] when:**
- You need baseline tracking for regressions
- You want to scan local HTML files directly
- You prefer IBM's rule documentation

## Related Pages

- [[accessibility]] - Overview of accessibility testing
- [[axe-core]] - The underlying testing engine
- [[pa11y]] - CLI accessibility testing tool
- [[lighthouse-accessibility]] - Google's accessibility audits
- [[ibm-accessibility-checker]] - IBM's Equal Access toolkit
- [[guidepup]] - Screen reader automation (different approach)

## References

[^axe-core-repo]:
  - **Source**: GitHub
  - **Title**: "dequelabs/axe-core"
  - **URL**: https://github.com/dequelabs/axe-core
  - **Accessed**: 2026-02-03
  - **Supports**: Detection rate of 57% for WCAG issues

[^sa11y-repo]:
  - **Source**: GitHub
  - **Title**: "salesforce/sa11y"
  - **URL**: https://github.com/salesforce/sa11y
  - **Accessed**: 2026-02-04
  - **Supports**: Pre-configured axe-core presets (Base, Extended, Full)
