---
title: "Open Graph and Social Metadata Validation"
lastVerified: 2026-02-12
lastUpdated: 2026-02-12
toolCoverage:
  - finding: "Tiered validation (error/warning/info) for OG and Twitter Card tags"
    command: social
    since: v0.0.17
  - finding: "Platform-accurate fallback chains for preview content"
    command: social
    since: v0.0.17
  - finding: "Character limit warnings (60 title, 155 description)"
    command: social
    since: v0.0.17
---

# Open Graph and Social Metadata Validation

Comprehensive reference for validating Open Graph, Twitter Card, and social metadata tags across major platforms.

> **Tool support:** The `social` command implements tiered validation and platform-accurate fallbacks since v0.0.17.

This page documents:
- Required vs optional tags per specification
- Platform-specific behavior and fallbacks
- Image requirements and dimension handling
- Character limits and truncation behavior
- URL handling and canonical behavior
- Validation strategies for link previews

## Required vs Optional Tags

### Open Graph Protocol

Per the [official OGP specification](https://ogp.me/), four properties are **required** for every page:

| Tag | Purpose | Example |
|-----|---------|---------|
| `og:title` | Title as it appears in the social graph | "The Rock" |
| `og:type` | Object type | "website", "article", "video.movie" |
| `og:image` | Image URL representing the object | `https://example.com/image.jpg` |
| `og:url` | Canonical URL (permanent ID in the graph) | `https://example.com/page` |

**Optional but recommended:**

| Tag | Purpose |
|-----|---------|
| `og:description` | One to two sentence description |
| `og:site_name` | Parent website name (e.g., "IMDb") |
| `og:locale` | Content language/region (default: `en_US`) |
| `og:determiner` | Word preceding title: a, an, the, "", auto |

**Practical reality:** In practice, all OG tags are optional. Facebook will generate previews without any OG markup using internal heuristics [^facebook-heuristics]. However, explicit tags provide control over appearance.

### Open Graph Image Properties

When `og:image` is present, these structured properties provide additional control:

| Tag | Purpose | Example |
|-----|---------|---------|
| `og:image:url` | Identical to `og:image` (redundant) | |
| `og:image:secure_url` | HTTPS version of image | |
| `og:image:type` | MIME type | `image/jpeg`, `image/png` |
| `og:image:width` | Pixel width (integer) | `1200` |
| `og:image:height` | Pixel height (integer) | `630` |
| `og:image:alt` | Description of image content | "Product screenshot" |

### Twitter/X Cards

Per X Developer documentation, Twitter Cards require only the card type:

| Tag | Required | Purpose |
|-----|----------|---------|
| `twitter:card` | **Yes** | Card type: `summary`, `summary_large_image`, `app`, `player` |
| `twitter:title` | No | Falls back to `og:title` |
| `twitter:description` | No | Falls back to `og:description` |
| `twitter:image` | No | Falls back to `og:image` |
| `twitter:site` | No | @username of website |
| `twitter:creator` | No | @username of content creator |

**Critical note:** Twitter/X has **no fallback for card type**. Without `twitter:card`, you get plain text with no preview card [^twitter-no-fallback].

## Platform Fallback Chains

When social meta tags are missing, platforms fall back in this order:

### Title Fallback Chain

1. `og:title`
2. `twitter:title`
3. `<title>` element
4. First `<h1>` (heuristic)

### Description Fallback Chain

1. `og:description`
2. `twitter:description`
3. `<meta name="description">`
4. Content heuristics (first paragraph, etc.)

### Image Fallback Chain

1. `og:image`
2. `twitter:image`
3. First suitable image in content (platform-dependent)

**metascraper fallback order** (authoritative reference for extraction libraries) [^metascraper]:

**Description:**
1. `og:description`
2. `twitter:description` (name)
3. `twitter:description` (property)
4. `<meta name="description">`
5. `itemprop="description"`
6. JSON-LD `articleBody`
7. JSON-LD `description`

**Title:**
1. `og:title`
2. `twitter:title` (name)
3. `twitter:title` (property)
4. `<title>` element
5. JSON-LD `headline`
6. `.post-title`, `.entry-title` classes

**Image:**
1. `og:image:secure_url`
2. `og:image:url`
3. `og:image`
4. `twitter:image:src` (name/property)
5. `twitter:image` (name/property)
6. `itemprop="image"`
7. JSON-LD `image`
8. First `<img>` in `<article>`
9. First `<img>` in `#content`
10. First visible `<img>` not aria-hidden

## Image Requirements

### Dimensions

**Universal recommendation:** 1200×630 pixels (1.91:1 aspect ratio) works across all major platforms [^og-dimensions].

| Platform | Recommended | Minimum | Maximum | Notes |
|----------|-------------|---------|---------|-------|
| Facebook | 1200×630 | 600×315 | 8MB | <600px shows thumbnail left of text |
| LinkedIn | 1200×627 | 1200×627 | 5MB | Requires exact size for full preview |
| Twitter/X | 1200×675 (16:9) | 144×144 | 5MB | `summary_large_image` uses 2:1 crop |
| WhatsApp | 1200×630 | 300×200 | - | HTTPS required |
| Telegram | 1200×630 | - | - | Caches aggressively |
| Slack | 1200×630 | - | - | Only reads first 32KB of HTML |

### Why Provide Image Dimensions?

Providing `og:image:width` and `og:image:height` enables platforms to:
1. **Render immediately** without fetching/analyzing the image first
2. **Avoid layout shift** when the preview loads
3. **Skip images that are too small** before downloading

Facebook specifically documents that without dimensions, it must fetch the image to determine size, delaying first-share rendering [^facebook-dimensions].

**Recommendation:** Always provide `og:image:width` and `og:image:height`. They cost nothing and improve first-share performance.

### Image Alt Text (`og:image:alt`)

**Current platform support is limited:**

| Platform | Uses `og:image:alt`? | Notes |
|----------|---------------------|-------|
| Facebook | No | Uses `og:title` as image alt text |
| Twitter/X | Yes | Renders `twitter:image:alt` for screen readers |
| LinkedIn | Unknown | No documentation found |

**Accessibility note:** Both Facebook and Twitter render preview images with `aria-hidden`, meaning screen reader users don't discover the image alt text in the normal flow. Twitter still exposes `twitter:image:alt` through other means [^og-image-alt].

**Recommendation:** Include both `og:image:alt` and `twitter:image:alt`. Costs nothing, provides accessibility benefits on Twitter, and future-proofs against platform changes.

### Supported Image Formats

All major platforms support: **JPEG, PNG, GIF, WebP**

AVIF support is emerging but not universal. Prefer JPEG for photographs, PNG for graphics with transparency.

## Character Limits and Truncation

Character limits vary by platform and are not formally documented. These are observed limits:

### og:title

| Platform | Display Limit | Truncation Point | Notes |
|----------|---------------|------------------|-------|
| Facebook | 88 chars | 100 chars | Truncates to 88 if >100 |
| LinkedIn | 119 chars | 119 chars | Full title in source (400 chars) |
| Twitter/X | ~70 chars | Varies | Depends on card type |
| WhatsApp | 81 chars | - | |
| Telegram | 1023 chars | - | Rarely truncates |
| Slack | Full | - | |
| Signal | Full | - | |

**Safe limit:** Keep titles under **60 characters** to avoid truncation on most platforms [^og-limits].

### og:description

| Platform | Display Limit | Notes |
|----------|---------------|-------|
| Facebook | 55-60 chars/line | Multi-line with truncation |
| LinkedIn | 69 chars | 254 chars in source |
| Twitter/X | ~200 chars | Varies by card type |
| General | 200 chars | Cut-offs begin at 300 |

**Safe limit:** Keep descriptions under **155 characters** for reliable display (matches meta description best practices).

## URL Handling (`og:url`)

### Purpose

`og:url` serves as the **canonical URL** and **permanent ID** in the social graph. It:
1. Aggregates likes/shares across URL variations
2. Defines which URL appears when shared
3. Tells platforms where to scrape metadata (if different from shared URL)

### URL Format Requirements

Per OGP specification, `og:url` must be:
- **Absolute URL** with `http://` or `https://` protocol
- **Fully qualified domain name** (not relative)

```html
<!-- Correct -->
<meta property="og:url" content="https://example.com/page" />

<!-- Incorrect -->
<meta property="og:url" content="/page" />
<meta property="og:url" content="example.com/page" />
```

### What Happens When og:url Differs from Shared URL

When a user shares `https://example.com/page-a` but that page has `og:url="https://example.com/page-b"`:

1. Facebook fetches metadata from **page-b** (the og:url), not page-a
2. Likes and shares aggregate on **page-b**
3. Users who click the shared link go to **page-a** (the originally shared URL)
4. The preview displays metadata from **page-b**

**Important:** The og:url page must:
- Return HTTP 200 (not redirect)
- Contain its own OG tags
- Be accessible to the platform's crawler

**Use case:** URL migrations. When moving from `/old-path` to `/new-path`, the old page can include `og:url="/new-path"` to consolidate social signals while still being accessible [^og-url-migration].

### og:url vs Canonical Link

These serve different purposes:

| Attribute | Purpose | Used By |
|-----------|---------|---------|
| `og:url` | Social graph canonical | Facebook, LinkedIn, etc. |
| `<link rel="canonical">` | SEO canonical | Search engines |

They should typically match, but can differ when social and SEO canonicalization needs diverge.

**Recommendation:** Ensure `og:url` matches `<link rel="canonical">` unless you have a specific reason to diverge. Mismatches cause confusion and may indicate configuration errors.

## Platform-Specific Notes

### Slack

- Only reads the **first 32KB** of HTML [^slack-32kb]
- If meta tags appear after inline CSS/JS, they may not be parsed
- Supports OG protocol, falls back to `<title>` and `<meta name="description">`

### WhatsApp

- Requires **HTTPS** for images and URLs
- Limited OG support (ignores `og:video`, `og:audio`)
- Caches previews aggressively

### Telegram

- Supports OG, Twitter Cards, and standard meta tags
- Caches previews and doesn't update immediately
- Use [@webpagebot](https://t.me/webpagebot) to force refresh

### iMessage

- Uses OG tags when available
- Falls back to page title and first suitable image
- No public documentation on specific requirements

## Validation Strategy

### Recommended Approach for semantic-kit

Given the research findings, validation should be **tiered**:

**Tier 1: Errors (blocks proper display)**
- `twitter:card` missing (no fallback exists)
- `og:url` not absolute/fully qualified
- `og:image` URL not accessible

**Tier 2: Warnings (affects quality)**
- `og:title` missing (falls back but less control)
- `og:description` missing (falls back but less control)
- `og:image` missing (platform may pick unsuitable image)
- `og:title` > 60 characters (will truncate)
- `og:description` > 155 characters (may truncate)
- `og:image:width`/`og:image:height` missing (delays first render)

**Tier 3: Info (best practices)**
- `og:type` missing (defaults to "website")
- `og:site_name` missing
- `og:locale` missing (defaults to en_US)
- `og:image:alt`/`twitter:image:alt` missing
- Image not 1200×630

### Preview Content Selection

For displaying a preview mockup, use this fallback chain:

```
title:       twitter:title → og:title → <title> → <h1>
description: twitter:description → og:description → meta description → null
image:       twitter:image → og:image → null
url:         og:url → canonical → actual URL
site:        og:site_name → domain name
```

### Testing Strategy

1. **Unit tests for extraction:**
   - Each tag type extracts correctly
   - Missing tags handled gracefully
   - Fallback chains work

2. **Validation rule tests:**
   - Character limit detection
   - URL format validation
   - Image accessibility checks

3. **Integration tests with fixtures:**
   - Complete OG + Twitter example
   - Partial tags (test fallbacks)
   - Missing required tags
   - Malformed URLs
   - Truncation scenarios

4. **Platform-specific preview rendering:**
   - Facebook-style card (1.91:1)
   - Twitter large card (2:1)
   - Twitter summary card (1:1 thumbnail)
   - Generic preview (Slack/Discord style)

## Debugging Tools

| Platform | Tool | URL |
|----------|------|-----|
| Facebook | Sharing Debugger | https://developers.facebook.com/tools/debug/ |
| Twitter/X | Card Validator | https://cards-dev.twitter.com/validator |
| LinkedIn | Post Inspector | https://www.linkedin.com/post-inspector/ |
| General | OpenGraph.xyz | https://www.opengraph.xyz/ |
| General | metatags.io | https://metatags.io/ |

## Related Pages

- [[structured-data]] - Broader structured data formats
- [[content-extraction]] - How extractors find metadata

## References

[^facebook-heuristics]:
  - **Source**: Facebook for Developers
  - **Title**: "Webmaster Guidelines - Best Practices"
  - **URL**: https://developers.facebook.com/docs/sharing/webmasters/
  - **Accessed**: 2026-02-12
  - **Supports**: "Without these Open Graph tags, the Facebook Crawler uses internal heuristics to make a best guess"

[^twitter-no-fallback]:
  - **Source**: NuxtSEO Documentation
  - **Title**: "Social Sharing Meta Tags in Nuxt"
  - **URL**: https://nuxtseo.com/learn-seo/nuxt/mastering-meta/open-graph
  - **Accessed**: 2026-02-12
  - **Supports**: "X/Twitter has no fallback for card type. Skip it and you get plain text."

[^metascraper]:
  - **Source**: GitHub
  - **Title**: "metascraper - Unified metadata from websites"
  - **URL**: https://github.com/microlinkhq/metascraper
  - **Accessed**: 2026-02-12
  - **Supports**: Fallback chain priorities in metascraper-title, metascraper-description, metascraper-image

[^og-dimensions]:
  - **Source**: OG Image Gallery
  - **Title**: "The Ultimate Guide to OG Image Dimensions"
  - **URL**: https://www.ogimage.gallery/libary/the-ultimate-guide-to-og-image-dimensions-2024-update
  - **Accessed**: 2026-02-12
  - **Supports**: Platform dimension requirements and recommendations

[^facebook-dimensions]:
  - **Source**: Conductor
  - **Title**: "Open Graph: Take Control of Your Snippets on Facebook"
  - **URL**: https://www.conductor.com/academy/open-graph/
  - **Accessed**: 2026-02-12
  - **Supports**: og:image:width/height enables immediate rendering without image fetch

[^og-image-alt]:
  - **Source**: Stefan Judis Web Development
  - **Title**: "How to define Open Graph / Twitter image alt text"
  - **URL**: https://www.stefanjudis.com/today-i-learned/how-to-define-open-graph-twitter-image-alt-text-and-why-it-might-not-matter/
  - **Accessed**: 2026-02-12
  - **Supports**: Platform-specific alt text handling, aria-hidden behavior

[^og-limits]:
  - **Source**: OGTester
  - **Title**: "What is the maximum length of open graph title and description?"
  - **URL**: https://ogtester.com/blog/what-is-maximum-length-of-og-title-and-og-description
  - **Accessed**: 2026-02-12
  - **Supports**: Character limits by platform

[^slack-32kb]:
  - **Source**: Dave Allie
  - **Title**: "Debugging Slack Link Unfurling"
  - **URL**: https://blog.daveallie.com/slack-link-unfurling/
  - **Accessed**: 2026-02-12
  - **Supports**: "Slack only reads the first 32kB of the HTML page"

[^og-url-migration]:
  - **Source**: Byrden
  - **Title**: "Canonical URLs explained | Facebook's og:url"
  - **URL**: https://byrden.com/what-is-a-canonical-url.html
  - **Accessed**: 2026-02-12
  - **Supports**: og:url behavior during URL migrations

[^ogp-spec]:
  - **Source**: Open Graph Protocol
  - **Title**: "The Open Graph protocol"
  - **URL**: https://ogp.me/
  - **Accessed**: 2026-02-12
  - **Supports**: Official protocol specification, required/optional properties
