---
title: "Accessibility Tree"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Accessibility Tree

The accessibility tree is a parallel representation of the DOM, built by browsers to communicate page structure to assistive technologies.

## What It Is

When a browser renders a page, it creates two representations:

1. **Visual render tree** — Layout, paint, and compositing for display
2. **Accessibility tree** — Semantic structure for assistive technologies

The accessibility tree exposes:

| Property | Example |
|----------|---------|
| Role | button, link, heading, navigation |
| Name | "Submit", "Home", "Main Navigation" |
| State | checked, expanded, disabled |
| Value | Input content, slider position |
| Relationships | Parent, children, labelledby |

Screen readers, switch controls, and other assistive technologies navigate this tree, not the visual interface.

## How It's Built

Browsers compute the accessibility tree from:

1. **HTML semantics** — Native elements have implicit roles
2. **ARIA attributes** — Explicit overrides and enhancements
3. **Computed styles** — `display: none` removes elements from the tree
4. **Accessible name computation** — Text content, labels, aria-label, alt text

| HTML | Implicit Role | Accessible Name Source |
|------|---------------|----------------------|
| `<button>Submit</button>` | button | Text content: "Submit" |
| `<img alt="Logo">` | img | Alt attribute: "Logo" |
| `<nav aria-label="Main">` | navigation | aria-label: "Main" |
| `<input id="x">` + `<label for="x">` | textbox | Associated label |

The name computation follows the [Accessible Name and Description Computation](https://www.w3.org/TR/accname-1.2/) spec, a recursive algorithm that resolves names from multiple sources [^accname].

## Two Interfaces

Every web page presents two interfaces:

| Interface | Audience | Built From |
|-----------|----------|------------|
| Visual | Sighted users | CSS, layout, rendering |
| Accessibility tree | AT users | HTML semantics, ARIA |

These can diverge. A visually prominent element might be invisible to screen readers (`aria-hidden="true"`), or hidden text might be exposed only to AT (`visually-hidden` CSS patterns).

## Inspection Methods

### Browser DevTools

All major browsers expose the accessibility tree:

- **Chrome/Edge**: DevTools → Elements → Accessibility pane
- **Firefox**: DevTools → Accessibility tab (full tree view)
- **Safari**: Web Inspector → Node → Accessibility

### Automation APIs

Playwright and Puppeteer expose accessibility tree snapshots:

```javascript
// Playwright
const snapshot = await page.accessibility.snapshot()

// Or using ARIA snapshot format
const ariaSnapshot = await page.ariaSnapshot()
```

The ARIA snapshot format represents the tree as YAML-like text:

```
- navigation "Main":
  - list:
    - listitem:
      - link "Home":
        - /url: /
```

## Common Issues

### Missing Accessible Names

Elements without names are announced only by role:

```html
<!-- Bad: Screen reader says "button" -->
<button><svg>...</svg></button>

<!-- Good: Screen reader says "Close, button" -->
<button aria-label="Close"><svg>...</svg></button>
```

### JavaScript-Dependent Content

Content rendered only via JavaScript may not exist in the initial accessibility tree. Server-side rendering ensures content is available immediately.

### Role Misuse

Using incorrect roles or overriding native semantics breaks expectations:

```html
<!-- Bad: Looks like a link, acts like a button -->
<a href="#" onclick="doAction()">Submit</a>

<!-- Good: Semantic button -->
<button onclick="doAction()">Submit</button>
```

## Related Pages

- [[violation-detection-tools]] — Tools that check accessibility rules
- [[axe-core]] — The engine behind most accessibility testing
- [[guidepup]] — Testing with real screen reader output

## References

[^accname]:
  - **Source**: W3C
  - **Title**: "Accessible Name and Description Computation 1.2"
  - **URL**: https://www.w3.org/TR/accname-1.2/
  - **Accessed**: 2026-02-03
  - **Supports**: Name computation algorithm specification
