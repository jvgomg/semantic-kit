# Bot

Compare static HTML vs JavaScript-rendered content to understand how much of your page depends on JavaScript.

---

## What it does

The `bot` command fetches a page twice:

1. **Static HTML** — What you get without JavaScript (like AI crawlers see)
2. **Rendered DOM** — After JavaScript execution (like browsers and Google see)

It compares them to show how much content is JavaScript-dependent.

---

## Usage

```bash
# Compare static vs rendered content
semantic-kit bot https://example.com

# Also show extracted markdown content
semantic-kit bot https://example.com --content

# Summary output (word counts only)
semantic-kit bot https://example.com --format compact

# Machine-readable output
semantic-kit bot https://example.com --format json

# Custom timeout (default: 5000ms)
semantic-kit bot https://example.com --timeout 10000
```

**Note:** Only URLs are supported. Local files cannot execute JavaScript.

---

## Options

| Option | Description |
|--------|-------------|
| `--content` | Show extracted markdown content after comparison |
| `--format full` | Default. Word counts + JS-dependent sections |
| `--format compact` | Summary only: word counts and JS dependency % |
| `--format json` | Machine-readable JSON output |
| `--timeout` | Render timeout in milliseconds (default: 5000) |

---

## Behavior

| What it does | Why | Research |
|--------------|-----|----------|
| Compares static vs rendered | AI crawlers don't render JS, Google does | [[ai-crawler-behavior]] |
| Uses Readability for extraction | Matches AI crawler approach | [[mozilla-readability]] |
| Waits for network idle | Approximates when JS finishes loading | [[ai-crawler-behavior]] |
| Detects streaming SSR patterns | Next.js hides content until JS runs | [[streaming-ssr]] |

---

## Output

### Default output

```
┌─────────────────────────────────────────────────────────────
│ Bot View (Static vs JavaScript)
│ https://example.com/page
├─────────────────────────────────────────────────────────────
│ Static HTML:    450 words
│ Rendered DOM:   1,200 words
│ JS-dependent:   750 words (63%)
├─────────────────────────────────────────────────────────────
│ Sections only visible after JavaScript execution:
│   • Main article content (~600 words)
│   • Comments section (~100 words)
│   • Related articles sidebar (~50 words)
└─────────────────────────────────────────────────────────────
```

### With --content flag

Adds extracted markdown after the comparison:

```
─────────────────────────────────────────────────────────────
Extracted Content (Markdown)
─────────────────────────────────────────────────────────────

# Article Title

The article content converted to markdown...
```

### Timeout warning

```
│ ⚠ Timeout reached — showing partial content
```

If JavaScript doesn't finish within timeout, partial content is shown.

---

## Common patterns

### Fully static (SSG)

```
│ Static HTML:    1,200 words
│ Rendered DOM:   1,200 words
│ JS-dependent:   0 words (0%)
```

All content in initial HTML. AI crawlers see everything.

### Server-rendered with hydration (SSR)

```
│ Static HTML:    1,150 words
│ Rendered DOM:   1,200 words
│ JS-dependent:   50 words (4%)
```

Most content server-rendered. Small JS additions for interactivity.

### Streaming SSR (Next.js App Router)

```
│ Static HTML:    50 words
│ Rendered DOM:   1,200 words
│ JS-dependent:   1,150 words (96%)
```

Content delivered in hidden elements. See [[streaming-ssr]].

### Client-side rendered (SPA)

```
│ Static HTML:    0 words
│ Rendered DOM:   1,200 words
│ JS-dependent:   1,200 words (100%)
```

No content in static HTML. AI crawlers see nothing.

---

## Limitations

This command focuses on **content differences**. It does NOT show:

- Full page structure
- Navigation/footer content
- Heading hierarchy
- Internal link structure
- Semantic landmarks

Use the `structure` commands for page structure analysis.

---

## Requirements

Requires Playwright:

```bash
bun add playwright
bunx playwright install chromium
```

---

## Related

- [[ai-crawler-behavior]] — How AI crawlers differ from Google
- [[streaming-ssr]] — Hidden content in streaming frameworks
- [[mozilla-readability]] — The extraction algorithm
- [ai command](./ai.md) — Static HTML extraction only
- [structure command](./structure.md) — Page structure analysis
