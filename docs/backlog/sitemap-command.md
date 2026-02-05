```yaml
# Metadata (keep at top of file)
researchVersion: research-v0.5.0
toolVersion: null
status: pending
created: 2026-02-04
```

# Add `sitemap` command for validation and inspection

## Research Context

**Source:** [[sitemaps]]

**Finding:**
XML sitemaps are critical for search engine crawling but developers often create invalid sitemaps or include problematic URLs. Research revealed that:

1. Google ignores `<changefreq>` and `<priority>` — only `<lastmod>` matters (if accurate)
2. Common errors include encoding issues, relative URLs, missing namespaces, and exceeding size limits
3. The `sitemap` npm package (ekalinin/sitemap.js) provides TypeScript-native parsing and validation
4. Sitemaps have strict limits: 50,000 URLs and 50MB per file

Developers need a quick way to validate their sitemaps and understand what's in them.

**Citations:**

- [^sitemaps-protocol]: Official XML sitemap protocol specification (required elements, encoding, limits)
- [^google-build-sitemap]: Google's handling of sitemap elements (ignores changefreq/priority)
- [^sitemap-js]: sitemap.js library capabilities for parsing and validation

---

## Proposed Change

**Affected command(s):** New `sitemap` command

**What should change:**
Add a new `sitemap` command that validates and inspects XML sitemaps:

1. **Validate sitemap XML** — Check schema compliance, UTF-8 encoding, URL format, namespace declarations
2. **Inspect sitemap contents** — Display URL count, lastmod range, extensions used (image/video/news/hreflang), file size
3. **Warn on size limits** — Alert when approaching 50,000 URLs or 50MB thresholds
4. **Extract URL list** — Output plain URL list for piping to other tools

**Example output:**

```
Sitemap: https://example.com/sitemap.xml

## Summary

URLs:        12,847
File size:   2.3 MB (4.6% of 50MB limit)
Encoding:    UTF-8 ✓
Schema:      Valid ✓

## Dates

Oldest:      2023-06-15
Newest:      2026-02-04
With dates:  12,523 (97%)

## Extensions

Namespace         URLs
─────────────────────────
image             3,241
video             127
hreflang          8,392

## Validation

✓ All URLs are absolute
✓ All URLs properly escaped
✓ Namespace declarations valid
⚠ 324 URLs missing lastmod (not an error, but recommended)
```

For `--urls` flag:
```
https://example.com/page-1
https://example.com/page-2
https://example.com/page-3
...
```

---

## Implementation Approach

**Key files likely involved:**
- `src/commands/sitemap.ts` (new) - Main command implementation
- `src/lib/sitemap.ts` (new) - Sitemap parsing and validation logic

**Approach:**

1. **Use sitemap.js library** — The `sitemap` package from ekalinin/sitemap.js is TypeScript-native and actively maintained. It provides:
   - `parseSitemap()` for parsing XML
   - Built-in validation capabilities
   - Streaming support for large files

2. **Fetch and parse** — Fetch the sitemap URL, parse XML, extract all `<url>` entries with their metadata.

3. **Validation checks:**
   - XML well-formedness
   - UTF-8 encoding declaration
   - Correct namespace (`xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`)
   - All `<loc>` values are absolute URLs
   - Proper entity escaping for special characters
   - Extension namespaces declared when extension tags used

4. **Statistics gathering:**
   - Count total URLs
   - Calculate file size
   - Find min/max lastmod dates
   - Count URLs by extension type
   - Count URLs missing lastmod

5. **Size limit warnings:**
   - Warn at 80% of 50,000 URL limit (40,000+)
   - Warn at 80% of 50MB size limit (40MB+)

6. **URL extraction mode** — `--urls` flag outputs just the `<loc>` values, one per line, for piping.

7. **Handle sitemap indexes** — If root element is `<sitemapindex>`, list child sitemaps with their lastmod. Consider `--expand` flag for future enhancement.

**Considerations:**
- Large sitemaps need streaming to avoid memory issues
- Support both direct sitemap URLs and sitemap index files
- Consider gzip-compressed sitemaps (`.xml.gz`)
- Follow existing output patterns (compact, full, JSON, TUI)

---

## Acceptance Criteria

- [ ] `sitemap <url>` fetches and parses XML sitemap
- [ ] Validates XML structure, encoding, and namespace declarations
- [ ] Validates all URLs are absolute and properly escaped
- [ ] Reports URL count, file size, and percentage of limits
- [ ] Reports lastmod date range and coverage
- [ ] Reports extension usage (image, video, news, hreflang)
- [ ] Warns when approaching size limits (80%+ threshold)
- [ ] `--urls` flag outputs plain URL list
- [ ] Handles sitemap index files (lists child sitemaps)
- [ ] JSON output includes all validation results and statistics
- [ ] Research page updated:
  - [ ] `toolCoverage` entry added to [[sitemaps]] frontmatter
  - [ ] Inline callout added noting `sitemap` command
- [ ] CHANGELOG entry references research page and version

---

## Notes

- This is the MVP `sitemap` command. Future enhancements (discovery, URL status checking, robots.txt cross-referencing) are tracked in `sitemap-command-improvements.md`.
- The command focuses on sitemap validation and inspection — it does not generate sitemaps.
- Consider whether to support text format sitemaps (one URL per line) in addition to XML.
