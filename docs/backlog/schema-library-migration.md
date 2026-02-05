```yaml
# Metadata (keep at top of file)
researchVersion: research-v0.3.1
toolVersion: null
status: pending
created: 2026-02-04
```

# Consider migrating from web-auto-extractor to metascraper

## Research Context

**Source:** [[structured-data]], [[schema-org]], [[google-structured-data]]

**Finding:**
During verification of the structured data research, I discovered that `web-auto-extractor` (v1.0.17), the core library used by the `schema` command for extracting JSON-LD, Microdata, RDFa, and metatags, hasn't been published in 8 years. The library uses deprecated Travis CI for builds and has 5 open issues on GitHub.

The `structured-data-testing-tool` (v4.5.0), which is also used in the project, uses `web-auto-extractor` internally and hasn't been updated since 2019.

While both libraries currently work, their unmaintained status presents a long-term maintenance risk. If breaking changes occur in Node.js or browser APIs, these libraries may not be updated.

**Citations:**
- [^metascraper]: metascraper is an actively-maintained alternative (published 18 days ago) with 2.6k stars, supporting all the same formats plus additional platform integrations

---

## Proposed Change

**Affected command(s):** `schema`

**What should change:**
Replace `web-auto-extractor` with `metascraper` for structured data extraction. The user-visible output would remain the same, but the underlying extraction would be more reliable and maintainable long-term.

**Benefits:**
- Active maintenance (last published 18 days ago vs 8 years ago)
- Modular architecture (install only what's needed, reducing bundle size)
- Better fallback handling with rule-based priority system
- Additional platform support (YouTube, Instagram, Spotify integrations if needed later)

---

## Implementation Approach

**Key files likely involved:**
- `src/commands/schema.ts` - Replace `web-auto-extractor` calls with metascraper
- `package.json` - Update dependencies

**Approach:**
1. Install metascraper and required rule packages (`metascraper-title`, `metascraper-description`, `metascraper-image`, etc.)
2. Create a new extraction function using metascraper's API
3. Map metascraper's output format to the existing `StructuredData` interface
4. For JSON-LD, Microdata, and RDFa specifically, may need to extract raw data since metascraper provides unified metadata rather than raw structured data by format
5. Test against various real-world pages to ensure parity

**Considerations:**
- **API difference**: metascraper provides unified metadata, whereas the current tool shows raw JSON-LD/Microdata/RDFa separately. May need to use metascraper's underlying parsers or supplement with direct extraction.
- **Backwards compatibility**: Output format should remain identical to not break existing users
- **Bundle size**: metascraper is modular, so can potentially reduce bundle size by only importing needed packages
- **Alternative approach**: Could also consider writing custom extraction using cheerio directly for JSON-LD (simple) while using metascraper for Open Graph/Twitter Card parsing

---

## Acceptance Criteria

- [ ] Schema command produces identical output for all currently supported formats
- [ ] JSON-LD extraction works correctly
- [ ] Microdata extraction works correctly
- [ ] RDFa extraction works correctly
- [ ] Open Graph tag detection and completeness checking unchanged
- [ ] Twitter Card tag detection and completeness checking unchanged
- [ ] All existing tests pass
- [ ] Research page updated:
  - [ ] `toolCoverage` entry added to [[structured-data]] frontmatter
  - [ ] Note about migration in research (if appropriate)
- [ ] CHANGELOG entry references research page and version

---

## Notes

**Open questions:**
1. Does metascraper provide access to raw JSON-LD/Microdata/RDFa, or only unified metadata? If only unified, we may need a hybrid approach.
2. Should we also remove `structured-data-testing-tool` dependency, or keep it for validation presets?

**Alternative considered:**
- Writing custom extraction with cheerio for JSON-LD (`script[type="application/ld+json"]`) and using `@devmehq/open-graph-extractor` for metatags. This would give more control but increase maintenance burden.
