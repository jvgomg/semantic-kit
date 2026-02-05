# Structured Data

Inspect and validate structured data (JSON-LD, Microdata, RDFa, Open Graph, Twitter Cards) in your page's static HTML.

---

## What it does

Two commands for working with structured data:

| Command | Purpose |
|---------|---------|
| `schema` | **Inspect** — View what's there, with actual values |
| `validate:schema` | **Validate** — Check against platform requirements |

---

## Usage

### Inspection (schema)

```bash
# View structured data from a URL
semantic-kit schema https://example.com

# Summary output (schema types and metatag status)
semantic-kit schema https://example.com --format compact

# Machine-readable output
semantic-kit schema https://example.com --format json

# Inspect a local file
semantic-kit schema ./dist/index.html
```

### Validation (validate:schema)

```bash
# Auto-detect and validate (Open Graph, Twitter Cards)
semantic-kit validate:schema https://example.com

# Validate specific presets
semantic-kit validate:schema https://example.com --presets google
semantic-kit validate:schema https://example.com --presets google,twitter

# Different output formats
semantic-kit validate:schema https://example.com --format full     # default
semantic-kit validate:schema https://example.com --format compact  # summary
semantic-kit validate:schema https://example.com --format json     # machine-readable
```

---

## Options

### schema

| Option | Description |
|--------|-------------|
| `--format full` | Default. All schemas and metatags with values |
| `--format compact` | Summary: schema types and metatag status |
| `--format json` | Machine-readable JSON output |

### validate:schema

| Option | Description |
|--------|-------------|
| `--presets` | Validation presets: `google`, `twitter`, `facebook`, `social-media` |
| `--format full` | Default. Detailed validation output |
| `--format compact` | Summary counts only |
| `--format json` | Machine-readable JSON output |

---

## Behavior

| What it does | Why | Research |
|--------------|-----|----------|
| Detects JSON-LD, Microdata, RDFa | All three formats used in production | [[structured-data]] |
| Validates against platform presets | Google, Twitter, Facebook have different requirements | [[google-structured-data]] |
| Checks Open Graph completeness | Missing og:image/url breaks social sharing | [[structured-data]] |
| Static HTML only (no JS) | Matches most crawler behavior | [[ai-crawler-behavior]] |

---

## Output

### Inspection output (schema)

```
┌─────────────────────────────────────────────────────────────
│ Structured Data
│ https://example.com
└─────────────────────────────────────────────────────────────

JSON-LD: Article
────────────────
  headline                 How to Build Better Websites
  datePublished            2024-01-15
  author.@type             Person
  author.name              Jane Doe

Open Graph ⚠ incomplete
────────────────────
  og:title                 How to Build Better Websites
  og:description           A comprehensive guide...

  og:type                  ✗ missing (required)
  og:image                 ✗ missing (required)
  og:url                   ✗ missing (required)
```

### Validation output (validate:schema)

```
┌─────────────────────────────────────────────────────────────
│ Structured Data Validation
│ https://example.com
├─────────────────────────────────────────────────────────────
│ Schemas: Article
│ Metatags: Open Graph, Twitter Cards
└─────────────────────────────────────────────────────────────

✗ 3 of 8 required tests failed

Failed Tests:

  Facebook:
  ✗ must have image url (metatag)
      Could not find "og:image"

  Twitter:
  ✗ must have card type (metatag)
      Could not find "twitter:card"
```

### Result meanings

| Result | Meaning |
|--------|---------|
| ✓ Passed | Required property exists and is valid |
| ✗ Failed | Required property missing or invalid |
| ⚠ Warning | Non-critical issue detected |

---

## When to use each command

| Use case | Command |
|----------|---------|
| "What structured data is on this page?" | `schema` |
| "Does this meet Google's requirements?" | `validate:schema --presets google` |
| "Is my Open Graph complete?" | `schema` (shows missing automatically) |
| "CI check before deploy" | `validate:schema --presets ...` |

Use `schema` during development to understand what exists. Use `validate:schema` in CI for pass/fail enforcement.

---

## Static vs Rendered

These commands validate **static HTML only** — no JavaScript execution.

| Scenario | Visible |
|----------|---------|
| JSON-LD in HTML source | Yes |
| JSON-LD injected via JS | No |
| SSR/SSG with JSON-LD | Yes |
| Meta tags in HTML | Yes |
| Meta tags added by JS | No |

For JavaScript-rendered structured data, use Google's Rich Results Test.

---

## Common problems

### Missing required properties

```
✗ Article validation failed
    ✗ headline — Could not find "Article[0].headline"
    ✗ datePublished — Could not find "Article[0].datePublished"
```

**Solution:** Add required properties to your JSON-LD. See [[structured-data]] for examples.

### Invalid schema type

If structured data isn't detected, the `@type` may not match a known Schema.org type.

**Solution:** Check [schema.org](https://schema.org/) for valid type names.

### No structured data

```
⚠ No structured data found on this page.
```

**Solution:** Add JSON-LD markup for your content type. See [[structured-data]].

---

## Programmatic usage

```javascript
const { structuredDataTest } = require('structured-data-testing-tool')
const { Google } = require('structured-data-testing-tool/presets')

const result = await structuredDataTest('https://example.com', {
  presets: [Google],
})

console.log(result.schemas) // Schemas found
console.log(result.passed)  // Tests that passed
console.log(result.failed)  // Tests that failed
```

---

## Related

- [[structured-data]] — Formats, Schema.org vocabulary, examples
- [[google-structured-data]] — Google's requirements and rich results
