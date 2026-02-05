---
title: "Document Outline"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Document Outline

How heading hierarchy creates navigable structure for assistive technologies and search engines.

## The Basics

HTML headings (`<h1>` through `<h6>`) create a hierarchical outline of page content:

```html
<h1>Page Title</h1>
  <h2>Section One</h2>
    <h3>Subsection</h3>
  <h2>Section Two</h2>
```

This creates an implicit outline:
1. Page Title
   1. Section One
      1. Subsection
   2. Section Two

## Why It Matters

### Screen Readers

Screen reader users can [^w3c-headings]:
- Generate a list of all headings on a page
- Jump between headings (common shortcut: `H` key)
- Navigate the document by heading level

A well-structured outline lets users quickly understand page content and navigate to relevant sections.

### Search Engines

Search engines use heading hierarchy to understand content importance and structure. The `<h1>` is a primary signal for page topic [^google-seo].

## Best Practices

### One `<h1>` Per Page

Use a single `<h1>` that describes the page content, similar to the `<title>` element:

```html
<h1>How to Bake Bread</h1>
```

### Don't Skip Levels

Headings should follow a logical hierarchy without skipping levels:

```html
<!-- Good -->
<h1>Guide</h1>
<h2>Chapter</h2>
<h3>Section</h3>

<!-- Bad - skips h2 -->
<h1>Guide</h1>
<h3>Section</h3>
```

Skipping levels is confusing for screen reader users navigating by heading.

**Exception:** When closing a section, you may "jump back" to a higher level:

```html
<h2>Chapter One</h2>
<h3>Details</h3>
<h2>Chapter Two</h2>  <!-- Valid: closes Chapter One -->
```

### Use Headings for Structure, Not Styling

Don't choose heading levels based on visual appearance. Use CSS for styling:

```html
<!-- Bad: h3 chosen for smaller font -->
<h3>Main Page Title</h3>

<!-- Good: h1 for main title, styled as needed -->
<h1 class="compact-title">Main Page Title</h1>
```

## The HTML5 Outline Algorithm (Deprecated)

HTML5 originally proposed a document outline algorithm that allowed multiple `<h1>` elements, with each sectioning element (`<article>`, `<section>`, etc.) starting a new outline:

```html
<!-- This was supposed to work -->
<article>
  <h1>Article Title</h1>  <!-- Treated as h2 in outline -->
  <section>
    <h1>Section</h1>      <!-- Treated as h3 in outline -->
  </section>
</article>
```

**This algorithm was never implemented** by browsers or assistive technologies [^html5-outline]. It has been removed from the HTML specification.

**Always use explicit heading levels** (`<h1>` through `<h6>`) to create your outline.

## Testing

### axe-core Rules

[[axe-core]] includes heading-related rules:
- `heading-order`: Headings should not skip levels
- `page-has-heading-one`: Page should have at least one `<h1>`

### Manual Testing

1. Use a screen reader to navigate by headings
2. Generate a heading outline (browser extensions available)
3. Verify the outline makes sense out of context

## Related Pages

- [[landmarks]] - Landmarks complement headings for navigation
- [[semantic-html]] - Overview of semantic HTML
- [[accessibility-tree]] - How headings appear in the accessibility tree
- [[axe-core]] - Automated heading validation

## References

[^google-seo]:
  - **Source**: Google Search Central
  - **Title**: "JavaScript SEO Basics"
  - **URL**: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
  - **Accessed**: 2026-02-03
  - **Supports**: Heading hierarchy as content signal

[^html5-outline]:
  - **Source**: Accessibility Developer Guide
  - **Title**: "HTML 5's headings outline algorithm"
  - **URL**: https://www.accessibility-developer-guide.com/examples/headings/html-5-outline/
  - **Accessed**: 2026-02-03
  - **Supports**: Outline algorithm never implemented

[^w3c-headings]:
  - **Source**: W3C WAI
  - **Title**: "Headings"
  - **URL**: https://www.w3.org/WAI/tutorials/page-structure/headings/
  - **Accessed**: 2026-02-03
  - **Supports**: Heading best practices for accessibility
