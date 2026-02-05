---
title: "Example Markup Sources"
lastVerified: 2026-02-04
lastUpdated: 2026-02-04
toolCoverage:
  - finding: "Example HTML fixtures for demonstrating semantic HTML patterns"
    command: structure, validate:a11y
    since: test-server fixtures (research-v0.4.0)
---

# Example Markup Sources

Authoritative sources and notable blogs for semantic HTML examples, accessibility patterns, and common markup mistakes.

## Purpose

This page catalogs resources that provide concrete HTML examples demonstrating:

- Good semantic markup practices
- Common accessibility patterns
- Anti-patterns and mistakes to avoid
- Validation guidance

These sources inform the example files used to demonstrate semantic-kit's `structure`, `validate:html`, and `validate:a11y` commands.

---

## Authoritative Sources

### W3C / WAI

The W3C Web Accessibility Initiative provides the definitive standards and tutorials.

| Resource | Description | Examples Provided |
|----------|-------------|-------------------|
| [WAI Tutorials](https://www.w3.org/WAI/tutorials/) | Step-by-step guidance for common patterns | Page structure, forms, images, tables, menus, carousels |
| [Page Structure Tutorial](https://www.w3.org/WAI/tutorials/page-structure/) | Comprehensive landmark and heading guidance | Regions, labeling, headings, content structure |
| [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) | Component patterns with working examples | Accordion, alert, button, checkbox, dialog, tabs, etc. |
| [APG Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) | Individual component implementations | 30+ UI patterns with code examples |

The APG patterns are particularly valuable because each includes functional examples with proper keyboard support and ARIA usage [^wai-apg].

### MDN Web Docs

Mozilla's documentation provides the clearest explanations with practical examples.

| Resource | Description |
|----------|-------------|
| [Semantic HTML Curriculum](https://developer.mozilla.org/en-US/curriculum/core/semantic-html/) | Learning path for semantic elements |
| [HTML Elements Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements) | Complete element documentation |
| [HTML: A Good Basis for Accessibility](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML) | Accessibility fundamentals with examples |
| [Semantics Glossary](https://developer.mozilla.org/en-US/docs/Glossary/Semantics) | Definitions and quick reference |

MDN notes there are "roughly 100 semantic elements available" and emphasizes using "correct HTML elements for their intended purpose" [^mdn-semantics].

### WebAIM

WebAIM provides practical accessibility resources focused on implementation.

| Resource | Description |
|----------|-------------|
| [HTML Semantics Cheat Sheet](https://webaim.org/resources/htmlcheatsheet/) | Quick reference with good/bad examples |
| [WCAG 2 Checklist](https://webaim.org/standards/wcag/checklist) | Simplified WCAG requirements |
| [Semantic Structure Guide](https://webaim.org/techniques/semanticstructure/) | Regions, headings, and lists |
| [Testing Quick Reference](https://webaim.org/resources/evalquickref/) | Practical testing guidance |

The WebAIM cheat sheet is particularly useful for demonstrating concise good vs. bad patterns [^webaim-cheatsheet].

### Deque University

Deque maintains accessibility training materials and an open-source pattern library.

| Resource | Description |
|----------|-------------|
| [Code Library](https://dequeuniversity.com/library/) | ARIA component examples in React |
| [Resources Page](https://dequeuniversity.com/resources/) | Links to Cauldron pattern library |

The Cauldron library demonstrates accessible implementations of common widgets [^deque-library].

### W3C Validator

The Nu HTML Checker is the authoritative validation tool.

| Resource | Description |
|----------|-------------|
| [W3C Validator](https://validator.w3.org/) | HTML markup validation |
| [Nu HTML Checker](https://validator.w3.org/nu/) | Modern HTML5 validator |
| [About the Validator](https://validator.github.io/validator/site/nu-about.html) | Technical documentation |

The validator catches "unintended mistakes—mistakes you might have otherwise missed" and enforces conformance requirements that "help you and the users of your documents avoid certain kinds of potential problems" [^nu-validator].

---

## Notable Blogs

These individual experts and publications provide in-depth analysis and practical examples.

### Adrian Roselli

Adrian Roselli is a W3C working group member who writes extensively on accessibility pitfalls.

| Topic | URL |
|-------|-----|
| Accessibility articles | https://adrianroselli.com/tag/accessibility |
| "A11y Tricks" collection | https://adrianroselli.com/a11y-tricks |
| ARIA barriers analysis | https://adrianroselli.com/2022/11/your-accessibility-claims-are-wrong-unless.html |

Roselli emphasizes that "just using the W3C HTML Nu Checker could keep you from easy mistakes like typos" and that invalid HTML can result in "a 4.1.1 Parsing error under WCAG" [^roselli].

### Scott O'Hara

Scott O'Hara (Microsoft, W3C contributor) maintains accessible component implementations.

| Topic | URL |
|-------|-----|
| Styled form controls | https://scottaohara.github.io/a11y_styled_form_controls/ |
| Accessible modal dialogs | https://github.com/scottaohara/accessible_modal_window |
| Tooltips | https://scottaohara.github.io/a11y_tooltips/ |
| Accordions | https://scottaohara.github.io/a11y_accordions/ |
| Personal site/blog | https://www.scottohara.me/ |

O'Hara notes that "accessibility is harder than just using semantic HTML. One can easily use semantic HTML and still come out with garbage UX" [^ohara].

### Heydon Pickering

Heydon Pickering authored "Inclusive Components" with detailed accessible pattern implementations.

| Topic | URL |
|-------|-----|
| Inclusive Components website | https://inclusive-components.design/ |
| Book | https://book.inclusive-components.design/ |

Inclusive Components "examines common web UI patterns through the lens of inclusion" with working demos and code examples [^pickering].

### Smashing Magazine

Smashing Magazine publishes in-depth accessibility and semantic HTML articles.

| Article | Focus |
|---------|-------|
| [article vs section](https://www.smashingmagazine.com/2022/07/article-section-elements-accessibility/) | When to use each element |
| [Keyboard Accessibility Guide](https://www.smashingmagazine.com/2022/11/guide-keyboard-accessibility-html-css-part1/) | Keyboard navigation patterns |
| [Accessible Tables](https://www.smashingmagazine.com/2022/12/accessible-front-end-patterns-responsive-tables-part1/) | Responsive table patterns |
| [Accessible Menu Systems](https://www.smashingmagazine.com/2017/11/building-accessible-menu-systems/) | Navigation patterns |
| [Accessible Form Validation](https://www.smashingmagazine.com/2023/02/guide-accessible-form-validation/) | Form error handling |
| [HTML5 Sectioning Elements](https://www.smashingmagazine.com/2013/01/the-importance-of-sections/) | Structural semantics |

### 24 ways

24 ways publishes practical accessibility articles, notably:

| Article | URL |
|---------|-----|
| Accessibility Through Semantic HTML | https://24ways.org/2017/accessibility-through-semantic-html/ |

This article explains how "semantic HTML gives context to screen readers" and why "good usability is good accessibility" [^24ways].

### HTML5 Doctor

HTML5 Doctor provides the widely-referenced sectioning element flowchart.

| Resource | URL |
|----------|-----|
| Sectioning Flowchart (PDF) | http://html5doctor.com/downloads/h5d-sectioning-flowchart.pdf |
| Semantics Article | http://html5doctor.com/lets-talk-about-semantics/ |

The flowchart helps developers choose between `header`, `footer`, `aside`, `section`, `article`, `figure`, and `div` [^html5doctor].

### A List Apart

A List Apart covers web standards with technical depth.

| Article | Focus |
|---------|-------|
| [Semantics to Screen Readers](https://alistapart.com/article/semantics-to-screen-readers/) | How accessibility APIs expose semantics |

This article explains how "browsers render [semantic elements] with their own distinct styles and behaviors" that provide "consistent and well-tested components" [^alistapart].

---

## Common Mistakes Documented

These sources specifically document anti-patterns and common errors:

### "Div Soup"

Overusing `<div>` and `<span>` instead of semantic elements. The HTML spec advises viewing div as "an element of last resort" [^whatwg-div].

**Sources:**
- Scott O'Hara: [Div Divisiveness](https://www.scottohara.me/blog/2022/01/20/divisive.html)
- MDN: [HTML: A good basis for accessibility](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML)

### DIVs as Buttons

Creating `<div role="button">` instead of using native `<button>` elements.

**Sources:**
- Frontend Masters: [DIVs Are Not Buttons](https://frontendmasters.com/courses/accessibility-v3/divs-are-not-buttons/)
- MDN Accessibility guide

### Form Label Errors

Not associating `<label>` elements with form inputs—one of the most common accessibility errors.

**Sources:**
- WebAIM cheat sheet
- [Pope Tech Form Accessibility Guide](https://blog.pope.tech/2022/10/03/a-beginners-guide-to-form-accessibility/)

### Heading Hierarchy Violations

Skipping heading levels or using headings for visual styling.

**Sources:**
- WebAIM: Headings must "never be empty" and pages "should typically have one `<h1>` and should not skip heading levels"
- [Centre for Universal Design](https://universaldesign.ie/communications-digital/web-and-mobile-accessibility/web-accessibility-techniques/developers-introduction-and-index/provide-an-accessible-page-structure-and-layout/do-not-misuse-semantic-markup)

### Missing Alt Text

Images without descriptive alt attributes—renders them inaccessible to screen reader users.

**Sources:**
- WebAIM cheat sheet
- MDN accessibility guide

### Link Anti-Patterns

Using divs or spans for links, or links without meaningful text.

**Sources:**
- [A11Y Solutions: Link Anti-patterns](https://a11y-solutions.stevenwoodson.com/solutions/navigation/link-anti-patterns/)

---

## Implications for semantic-kit

These sources provide:

1. **Good markup examples** — For demonstrating successful `structure` and `validate:a11y` output
2. **Bad markup examples** — For demonstrating error detection and warnings
3. **Edge cases** — Complex patterns that test tool capabilities
4. **Real-world patterns** — Common mistakes developers actually make

**Implementation status**: Example fixtures implemented in `test-server/fixtures/`. See the test-server README for the full fixture catalog.

---

## Related Pages

- [[landmarks]] — ARIA landmark roles and HTML mapping
- [[document-outline]] — Heading hierarchy best practices
- [[semantic-elements]] — Article, main, nav, aside usage
- [[accessibility]] — Accessibility testing overview
- [[markup-validation]] — Why valid HTML matters

---

## References

[^wai-apg]:
  - **Source**: W3C WAI
  - **Title**: "ARIA Authoring Practices Guide"
  - **URL**: https://www.w3.org/WAI/ARIA/apg/
  - **Accessed**: 2026-02-04
  - **Supports**: Component patterns with working examples

[^mdn-semantics]:
  - **Source**: MDN Web Docs
  - **Title**: "Semantics - Glossary"
  - **URL**: https://developer.mozilla.org/en-US/docs/Glossary/Semantics
  - **Accessed**: 2026-02-04
  - **Supports**: Roughly 100 semantic elements available in HTML

[^webaim-cheatsheet]:
  - **Source**: WebAIM
  - **Title**: "HTML Semantics and Accessibility Cheat Sheet"
  - **URL**: https://webaim.org/resources/htmlcheatsheet/
  - **Accessed**: 2026-02-04
  - **Supports**: Common HTML accessibility patterns

[^deque-library]:
  - **Source**: Deque University
  - **Title**: "Code Library (Beta)"
  - **URL**: https://dequeuniversity.com/library/
  - **Accessed**: 2026-02-04
  - **Supports**: Accessible component implementations

[^nu-validator]:
  - **Source**: W3C
  - **Title**: "About the Nu Html Checker"
  - **URL**: https://validator.github.io/validator/site/nu-about.html
  - **Accessed**: 2026-02-04
  - **Supports**: Validation rationale and capabilities

[^roselli]:
  - **Source**: Adrian Roselli
  - **Title**: "Your Accessibility Claims Are Wrong, Unless..."
  - **URL**: https://adrianroselli.com/2022/11/your-accessibility-claims-are-wrong-unless.html
  - **Accessed**: 2026-02-04
  - **Supports**: Common accessibility mistakes

[^ohara]:
  - **Source**: Scott O'Hara
  - **Title**: "The accessibility of HTML"
  - **URL**: https://scottaohara.github.io/talks_and_such/a11yTO-2019/
  - **Accessed**: 2026-02-04
  - **Supports**: Semantic HTML limitations and proper ARIA usage

[^pickering]:
  - **Source**: Heydon Pickering
  - **Title**: "Inclusive Components"
  - **URL**: https://inclusive-components.design/
  - **Accessed**: 2026-02-04
  - **Supports**: Accessible component patterns

[^24ways]:
  - **Source**: 24 ways
  - **Title**: "Accessibility Through Semantic HTML"
  - **URL**: https://24ways.org/2017/accessibility-through-semantic-html/
  - **Accessed**: 2026-02-04
  - **Supports**: Benefits of semantic HTML for accessibility

[^html5doctor]:
  - **Source**: HTML5 Doctor
  - **Title**: "HTML5 Element Flowchart"
  - **URL**: http://html5doctor.com/downloads/h5d-sectioning-flowchart.pdf
  - **Accessed**: 2026-02-04
  - **Supports**: Choosing appropriate sectioning elements

[^alistapart]:
  - **Source**: A List Apart
  - **Title**: "Semantics to Screen Readers"
  - **URL**: https://alistapart.com/article/semantics-to-screen-readers/
  - **Accessed**: 2026-02-04
  - **Supports**: How accessibility APIs expose HTML semantics

[^whatwg-div]:
  - **Source**: WHATWG
  - **Title**: "HTML Living Standard - The div element"
  - **URL**: https://html.spec.whatwg.org/multipage/grouping-content.html#the-div-element
  - **Accessed**: 2026-02-04
  - **Supports**: Div as element of last resort
