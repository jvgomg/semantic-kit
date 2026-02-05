---
title: "Schema.org"
lastVerified: 2026-02-04
lastUpdated: 2026-02-04
---

# Schema.org

Schema.org is the shared vocabulary used by search engines and other consumers to understand structured data markup.

## Overview

Schema.org provides a standardized set of types (like `Article`, `Product`, `Person`) and properties (like `name`, `author`, `datePublished`) for describing web content [^schema-org].

Founded in 2011 by Google, Microsoft, Yahoo, and Yandex, it's now the de facto standard for structured data.

## Vocabulary Structure

### Types

Types are arranged in a hierarchy starting from `Thing`:

```
Thing
├── CreativeWork
│   ├── Article
│   │   ├── NewsArticle
│   │   └── BlogPosting
│   ├── Recipe
│   └── Review
├── Organization
│   └── LocalBusiness
├── Person
├── Place
└── Event
```

As of version 29.4 (December 2025), Schema.org defines:
- **827 Types**
- **1,528 Properties**
- **94 Enumerations** (with 522 enumeration members)
- **14 Datatypes**

### Properties

Properties describe attributes of types. Types inherit properties from their parents:

| Type | Inherits From | Has Properties |
|------|---------------|----------------|
| `Thing` | — | `name`, `description`, `url`, `image` |
| `Article` | `CreativeWork` → `Thing` | `headline`, `author`, `datePublished`, plus inherited |
| `Recipe` | `CreativeWork` → `Thing` | `ingredients`, `cookTime`, plus inherited |

### Naming Convention

Types and properties follow a consistent pattern [^schema-org-guide]:

- **Types** start with uppercase: `LocalBusiness`, `NewsArticle`
- **Properties** start with lowercase: `datePublished`, `aggregateRating`

## Common Types

| Type | Use Case | Example Properties |
|------|----------|-------------------|
| `Article` | News, blog posts | `headline`, `author`, `datePublished` |
| `Product` | E-commerce items | `name`, `offers`, `aggregateRating` |
| `Recipe` | Cooking content | `ingredients`, `cookTime`, `nutrition` |
| `Event` | Dates, locations | `startDate`, `location`, `performer` |
| `FAQPage` | Q&A content | `mainEntity` (list of Questions) |
| `HowTo` | Tutorials | `step`, `tool`, `supply` |
| `LocalBusiness` | Business listings | `address`, `openingHours`, `telephone` |
| `Person` | Author profiles | `name`, `jobTitle`, `worksFor` |
| `Organization` | Company info | `name`, `logo`, `contactPoint` |

## Usage with Formats

Schema.org vocabulary can be used with multiple formats:

### JSON-LD (Recommended)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  }
}
</script>
```

### Microdata

```html
<article itemscope itemtype="https://schema.org/Article">
  <h1 itemprop="headline">Article Title</h1>
  <span itemprop="author" itemscope itemtype="https://schema.org/Person">
    <span itemprop="name">Author Name</span>
  </span>
</article>
```

### RDFa

```html
<article vocab="https://schema.org/" typeof="Article">
  <h1 property="headline">Article Title</h1>
  <span property="author" typeof="Person">
    <span property="name">Author Name</span>
  </span>
</article>
```

See [[structured-data]] for format comparison and recommendations.

## Extensions

Schema.org supports extensions for domain-specific vocabularies:

- **Pending** - Proposed additions under review
- **External** - Third-party extensions (auto, health, etc.)

Extensions use different namespaces but follow Schema.org conventions.

## TypeScript Support

**schema-dts** (maintained by Google) provides TypeScript type definitions for Schema.org vocabulary [^schema-dts]:

```typescript
import { Article, WithContext } from 'schema-dts'

const article: WithContext<Article> = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Article Title',
  author: {
    '@type': 'Person',
    name: 'Author Name',
  },
}
```

This enables compile-time validation of JSON-LD structure and IDE autocompletion for Schema.org types.

**Links:** [GitHub](https://github.com/google/schema-dts) | [npm](https://www.npmjs.com/package/schema-dts)

## Resources

- [Schema.org](https://schema.org/) - Official documentation
- [Type Hierarchy](https://schema.org/docs/full.html) - Complete type list
- [Validator](https://validator.schema.org/) - Format-agnostic validation

## Related Pages

- [[structured-data]] - Overview of structured data formats
- [[google-structured-data]] - Google's requirements for rich results

## References

[^schema-org]:
  - **Source**: Schema.org
  - **Title**: "Schema.org"
  - **URL**: https://schema.org/
  - **Accessed**: 2026-02-04
  - **Supports**: Vocabulary definitions, type hierarchy, usage statistics

[^schema-org-guide]:
  - **Source**: Schema App
  - **Title**: "Guide to the Schema.org Vocabulary"
  - **URL**: https://www.schemaapp.com/schema-markup/guide-to-the-schema-org-vocabulary/
  - **Accessed**: 2026-02-03
  - **Supports**: Vocabulary structure, naming conventions

[^schema-dts]:
  - **Source**: Google Open Source Blog
  - **Title**: "schema-dts turns 1.0: Author valid Schema.org JSON-LD in TypeScript"
  - **URL**: https://opensource.googleblog.com/2021/08/schema-dts-turns-1-author-valid-schema-org-JSON-LD-in-typescript.html
  - **Accessed**: 2026-02-04
  - **Supports**: TypeScript type definitions, compile-time validation
