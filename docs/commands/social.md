# Social

Show how social media platforms see your page for link previews.

---

## What it does

The `social` lens shows what social platforms (WhatsApp, Slack, Twitter/X, iMessage, LinkedIn) extract when you share a link. This includes Open Graph tags, Twitter Cards, and a preview of how the link card will appear.

---

## Usage

```bash
# Show social preview data
semantic-kit social https://example.com

# Summary output
semantic-kit social https://example.com --format compact

# Machine-readable output
semantic-kit social https://example.com --format json

# Analyze a local file
semantic-kit social ./dist/index.html
```

---

## Options

| Option | Description |
|--------|-------------|
| `--format full` | Default. Tags, preview, and validation issues |
| `--format compact` | Preview and issue summary only |
| `--format json` | Machine-readable JSON output |

---

## What it shows

### Open Graph Tags

Essential tags for link previews across most platforms:

| Tag | Purpose | Required? |
|-----|---------|-----------|
| `og:title` | Link card title | Recommended |
| `og:description` | Link card description | Recommended |
| `og:image` | Preview image | Recommended |
| `og:url` | Canonical URL | Recommended |
| `og:type` | Content type (website, article) | Optional |
| `og:site_name` | Site name | Optional |
| `og:image:width` | Image width for optimization | Optional |
| `og:image:height` | Image height for optimization | Optional |

### Twitter Cards

Additional tags for Twitter/X:

| Tag | Purpose |
|-----|---------|
| `twitter:card` | Card type (summary, summary_large_image) |
| `twitter:title` | Title (falls back to og:title) |
| `twitter:description` | Description (falls back to og:description) |
| `twitter:image` | Image (falls back to og:image) |
| `twitter:site` | @username of the site |

### Preview

Shows resolved values after fallback chains:
- Title: `twitter:title` -> `og:title` -> `<title>`
- Description: `twitter:description` -> `og:description` -> `<meta name="description">`
- Image: `twitter:image` -> `og:image` -> null

---

## Output

### Default output

```
semantic-kit v0.0.17

Social lens analysis for https://example.com. Took 0.2s.

PREVIEW
Title: How to Build Better Websites
Description: A comprehensive guide to semantic HTML and accessibility.
Image: https://example.com/images/og-image.png
URL: https://example.com/guide
Site: Example Blog

OPEN GRAPH (6 tags)
og:title: How to Build Better Websites
og:description: A comprehensive guide to semantic HTML and accessibility.
og:image: https://example.com/images/og-image.png
og:url: https://example.com/guide
og:type: article
og:site_name: Example Blog

TWITTER (3 tags)
twitter:card: summary_large_image
twitter:site: @exampleblog
twitter:creator: @janesmith

ISSUES (1 warning)
[warning] og:image:width and og:image:height not specified - may affect image rendering
```

### Validation

The social lens validates metadata with tiered severity:

| Severity | Examples |
|----------|----------|
| **Error** | `og:url` not absolute (must include protocol) |
| **Warning** | `og:title` > 60 chars, `og:description` > 155 chars, missing image dimensions |
| **Info** | Missing `twitter:card`, missing image alt text |

---

## Common problems

### No preview image

```
Image: (none)
```

**Problem:** No `og:image` or `twitter:image` found.

**Solution:** Add an image tag:
```html
<meta property="og:image" content="https://example.com/preview.png">
```

### Title too long

```
[warning] og:title is 85 characters (recommended max: 60)
```

**Problem:** Long titles may be truncated on some platforms.

**Solution:** Keep `og:title` under 60 characters.

### Relative URL

```
[error] og:url must be an absolute URL with protocol
```

**Problem:** `og:url` is relative instead of absolute.

**Solution:** Use full URLs including protocol:
```html
<meta property="og:url" content="https://example.com/page">
```

### Missing image dimensions

```
[warning] og:image:width and og:image:height not specified
```

**Problem:** Without dimensions, platforms may not render the image correctly.

**Solution:** Add dimension tags:
```html
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
```

---

## Image recommendations

| Platform | Recommended Size | Aspect Ratio |
|----------|-----------------|--------------|
| Facebook | 1200 x 630 | 1.91:1 |
| Twitter (summary_large_image) | 1200 x 628 | 1.91:1 |
| Twitter (summary) | 120 x 120 | 1:1 |
| LinkedIn | 1200 x 627 | 1.91:1 |
| WhatsApp | 400 x 400 min | Various |

A 1200 x 630 image works well across most platforms.

---

## TUI

The social lens is available in the TUI under **Lenses > Social**.

```bash
semantic-kit tui
# Then select Social from the Lenses section
```

---

## Related

- [Google](./google.md) - Google Search metadata (not Open Graph)
- [Schema](./schema.md) - All structured data including OG/Twitter
- [Schema Validation](./validate-schema.md) - Validate against platform requirements
