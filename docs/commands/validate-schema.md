# Structured Data Validation

Validate structured data (JSON-LD, Open Graph, Twitter Cards) against platform requirements.

---

## What it does

The `validate:schema` command checks your page's structured data markup for compliance with platform requirements. It detects JSON-LD schemas, Open Graph tags, and Twitter Cards, then validates them against Google, Facebook, and Twitter specifications.

---

## Usage

```bash
# Validate a URL (auto-detects standards present)
semantic-kit validate:schema https://example.com

# Validate a local file
semantic-kit validate:schema ./dist/index.html

# Validate specific platforms (failures affect exit code)
semantic-kit validate:schema https://example.com --presets facebook
semantic-kit validate:schema https://example.com --presets twitter
semantic-kit validate:schema https://example.com --presets google
semantic-kit validate:schema https://example.com --presets facebook,twitter

# Different output formats
semantic-kit validate:schema https://example.com --format full     # default
semantic-kit validate:schema https://example.com --format compact  # summary
semantic-kit validate:schema https://example.com --format json     # machine-readable
```

---

## Options

| Option | Description |
|--------|-------------|
| `--presets` | Platforms to validate: `google`, `twitter`, `facebook`, `social-media` |
| `--format full` | Default. Detailed validation output |
| `--format compact` | Summary counts only |
| `--format json` | Machine-readable JSON |

---

## Behavior

| What it does | Why | Research |
|--------------|-----|----------|
| Auto-detects standards present | Validates only what you're using | |
| Validates against platform specs | Each platform has different requirements | [[structured-data]] |
| Separates required vs info failures | Only specified presets affect exit code | |
| Reports JSON-LD, Microdata, RDFa | Covers all structured data formats | [[structured-data]] |

### Preset behavior

Without `--presets`: Validates all detected standards. All failures affect the exit code.

With `--presets`: Only specified platform failures affect the exit code. Other detected standards are validated but reported as informational.

---

## Output

### Full output

```
┌─────────────────────────────────────────────────────────────
│ Structured Data Validation
│ https://example.com
├─────────────────────────────────────────────────────────────
│ Schemas: Article
│ Metatags: Open Graph, Twitter Cards
└─────────────────────────────────────────────────────────────

✗ 2 of 15 required tests failed

Failed Tests:

  Facebook:
  ✗ og:image must be present (metatag)
      Expected: "string"
      Found: undefined

  Twitter:
  ✗ twitter:card must be present (metatag)
      Expected: "string"
      Found: undefined

Structured Data Summary:
  JSON-LD: Article
  Metatags: 8 found
```

### Compact output

```
┌─────────────────────────────────────────────────────────────
│ Structured Data Validation
│ https://example.com
├─────────────────────────────────────────────────────────────
│ Schemas:  Article
│ Metatags: Open Graph, Twitter Cards
│ Passed:   13 · Failed: 2 · Warnings: 0
│ ✗ 2 required test(s) failed
└─────────────────────────────────────────────────────────────
```

### Exit codes

| Code | Meaning |
|------|---------|
| `0` | All required tests passed |
| `1` | Required tests failed or error |

---

## Common issues

### Missing Open Graph image

```html
<!-- Bad: no og:image -->
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Description">

<!-- Good -->
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Description">
<meta property="og:image" content="https://example.com/image.jpg">
```

### Missing Twitter card type

```html
<!-- Bad: missing twitter:card -->
<meta name="twitter:title" content="Page Title">

<!-- Good -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Page Title">
```

### Invalid JSON-LD

```html
<!-- Bad: missing @type -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "name": "Article Title"
}
</script>

<!-- Good -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title"
}
</script>
```

---

## Supported platforms

| Preset | What it validates |
|--------|-------------------|
| `google` | Google rich results requirements |
| `facebook` | Open Graph protocol (og:* tags) |
| `twitter` | Twitter Cards (twitter:* tags) |
| `social-media` | Combined Facebook + Twitter |

---

## Related

- [[structured-data]] - How Google uses structured data
- [[schema-org]] - The Schema.org vocabulary
