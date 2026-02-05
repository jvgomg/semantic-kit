---
title: "Accessibility"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Accessibility

How assistive technologies interpret web content, and tools for validating accessibility.

## The Problem

Web accessibility ensures people with disabilities can perceive, understand, navigate, and interact with websites. Assistive technologies like screen readers rely on properly structured HTML and ARIA attributes to convey meaning.

Automated tools can catch approximately 30-57% of accessibility issues [^axe-core-repo]. They identify violations of WCAG rules and expose the accessibility tree structure, but cannot assess whether content is meaningfully structured or contextually appropriate. Manual testing with real assistive technologies remains necessary for comprehensive coverage.

## Testing Approaches

### Violation Detection

Tools that scan pages against WCAG rules and report failures. Output is typically a list of violations with severity, element selectors, and remediation guidance.

- [[axe-core]] - The underlying engine used by most tools
- [[pa11y]] - CLI tool supporting multiple runners
- [[lighthouse-accessibility]] - Google's auditing tool
- [[ibm-accessibility-checker]] - IBM's Equal Access toolkit

See [[violation-detection-tools]] for the overview.

### Accessibility Tree Inspection

Browser DevTools and automation libraries (Puppeteer, Playwright) expose APIs to capture the accessibility tree as JSON. This shows the structure that assistive technologies receive: roles, names, states, and hierarchy.

### Screen Reader Automation

Programmatic control of real screen readers (VoiceOver, NVDA), enabling assertions on actual spoken output.

- [[guidepup]] - Screen reader driver for test automation

## WCAG Standards

The Web Content Accessibility Guidelines (WCAG) define success criteria at three levels:

| Level | Description |
|-------|-------------|
| A | Minimum accessibility |
| AA | Standard compliance target (most regulations) |
| AAA | Enhanced accessibility |

Most organizations target WCAG 2.1 AA compliance. Automated tools can verify many Level A and AA criteria, but some require manual evaluation.

## Implications for semantic-kit

The `validate:a11y` command uses [[axe-core]] to check pages against WCAG rules. This provides a baseline but doesn't replace testing with actual assistive technologies.

## Related Pages

- [[accessibility-tree]] — How browsers build the accessibility tree
- [[violation-detection-tools]] — Overview of automated testing tools
- [[axe-core]] — The most widely-used accessibility testing engine
- [[pa11y]] — CLI accessibility testing
- [[lighthouse-accessibility]] — Google's accessibility audits
- [[ibm-accessibility-checker]] — IBM's Equal Access toolkit
- [[guidepup]] — Screen reader automation

## References

[^axe-core-repo]:
  - **Source**: GitHub
  - **Title**: "dequelabs/axe-core"
  - **URL**: https://github.com/dequelabs/axe-core
  - **Accessed**: 2026-02-03
  - **Supports**: Detection rate of 57% for WCAG issues
