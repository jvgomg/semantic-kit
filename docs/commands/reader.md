# Reader Mode

Show how browser reader modes see your page (Safari Reader, Pocket, Firefox Reader View).

---

## What it does

The `reader` lens shows how browser reader modes extract and display content from your page. Reader modes use content extraction (Mozilla Readability) to present a distraction-free reading experience.

---

## Usage

```bash
# Show reader mode view
semantic-kit reader https://example.com/article

# Summary output
semantic-kit reader https://example.com --format compact

# Machine-readable output
semantic-kit reader https://example.com --format json

# Analyze a local file
semantic-kit reader ./dist/index.html
```

---

## Options

| Option | Description |
|--------|-------------|
| `--format full` | Default. Full extraction with metadata and content |
| `--format compact` | Summary only: title, byline, word count |
| `--format json` | Machine-readable JSON output |

---

## Behavior

| What it does | Why |
|--------------|-----|
| Extracts via Mozilla Readability | Same algorithm Safari Reader uses |
| Uses static HTML | Reader modes activate on initial load |
| Shows extraction metadata | Title, byline, excerpt, site name |
| Reports word count | Content length indicator |

---

## Output

### Default output

```
semantic-kit v0.0.17

Reader mode view for https://example.com. Took 0.3s.

READER MODE VIEW
Title: Understanding Semantic HTML
Byline: Jane Smith
Site: Example Blog
Excerpt: A comprehensive guide to semantic HTML and accessibility...
Word Count: 1,247

---

# Understanding Semantic HTML

The extracted content in markdown format...
```

### Metadata fields

| Field | Source |
|-------|--------|
| Title | Readability extraction, `<title>`, or OG tags |
| Byline | Author detection, `<meta name="author">` |
| Site | `<meta property="og:site_name">` |
| Excerpt | First paragraph or meta description |
| Word Count | Word count of extracted text |

---

## reader vs ai vs readability

| Aspect | `reader` | `ai` | `readability` |
|--------|----------|------|---------------|
| Purpose | Browser reader preview | AI crawler view | Developer analysis |
| Framing | "Safari Reader sees..." | "ChatGPT sees..." | Raw metrics |
| Metrics | Hidden | Hidden content warnings | Link density, etc. |
| Category | Lens | Lens | Utility |

Use `reader` when previewing browser reader mode experience. Use `ai` for AI crawler perspective. Use `readability` for debugging extraction issues.

---

## Common problems

### Reader mode won't activate

**Problem:** Some browsers won't show the reader mode button.

**Solution:** Ensure sufficient article-like content. Safari Reader requires:
- At least ~500 characters of text content
- Semantic structure (`<article>`, `<main>`)
- Clear separation from navigation

### Wrong content extracted

**Problem:** Navigation or sidebar content appears in reader view.

**Solution:** Use semantic HTML to clearly separate main content:
```html
<article>
  <h1>Article Title</h1>
  <p>Article content here...</p>
</article>
```

### No content extracted

**Problem:** Reader mode shows empty or minimal content.

**Solution:** Check that content is in static HTML (not JavaScript-rendered). Reader modes typically don't wait for JavaScript.

---

## TUI

The reader lens is available in the TUI under **Lenses > Reader**.

```bash
semantic-kit tui
# Then select Reader from the Lenses section
```

---

## Related

- [AI Crawlers](./ai.md) - How AI tools see your content
- [Readability](./readability.md) - Raw Readability extraction with full metrics
