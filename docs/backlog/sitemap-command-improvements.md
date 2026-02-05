```yaml
# Metadata (keep at top of file)
researchVersion: research-v0.5.0
toolVersion: null
status: pending
created: 2026-02-04
depends: sitemap-command.md
```

# Improve `sitemap` command with discovery and deep validation

## Research Context

**Source:** [[sitemaps]], [[web-crawlers]]

**Finding:**
Beyond basic sitemap validation, developers need help with:

1. **Finding sitemaps** — Sitemaps can be declared in robots.txt, HTML `<link>` tags, or at common paths. Many developers don't know where their sitemaps are or if they're properly discoverable.

2. **URL health** — Sitemaps often contain stale URLs that return 404s, redirects, or errors. Google Search Console catches these but developers need faster feedback during development.

3. **Configuration conflicts** — URLs can be simultaneously in a sitemap AND blocked by robots.txt, creating confusing signals for crawlers.

4. **noindex conflicts** — Pages with `<meta name="robots" content="noindex">` shouldn't be in sitemaps, but this is a common mistake.

**Citations:**

- [^robots-txt-sitemap]: Sitemap autodiscovery via robots.txt `Sitemap:` directive
- [^astro-sitemap]: HTML `<link rel="sitemap">` discovery method
- [^google-build-sitemap]: Google's guidance on what URLs to include/exclude

---

## Proposed Change

**Affected command(s):** `sitemap` command (enhancement)

**What should change:**
Add discovery and deep validation features to the existing `sitemap` command:

1. **Discover sitemaps** (`--discover`) — Find sitemaps for a domain via robots.txt, common paths, and HTML links
2. **Check URL status codes** (`--check-urls`) — Verify URLs return 200, identify 404s/redirects/errors
3. **Detect robots.txt conflicts** (`--check-robots`) — Flag URLs in sitemap that are disallowed by robots.txt
4. **Find noindex conflicts** (`--check-noindex`) — Identify URLs with noindex meta tags

**Example output for `--discover`:**

```
Sitemap Discovery: https://example.com

## Found via robots.txt

https://example.com/sitemap.xml
https://example.com/sitemap-news.xml

## Found via HTML <link>

https://example.com/sitemap-index.xml

## Checked common paths

/sitemap.xml         ✓ Found (via robots.txt)
/sitemap_index.xml   ✗ 404
/sitemap-index.xml   ✓ Found (via HTML)

## Summary

3 sitemaps discovered
```

**Example output for `--check-urls`:**

```
URL Status Check: https://example.com/sitemap.xml

Checking 12,847 URLs...

## Results

Status    Count    Percentage
──────────────────────────────
200 OK    12,501   97.3%
301       289      2.2%
404       52       0.4%
500       5        0.04%

## Issues

### 404 Not Found (52 URLs)

https://example.com/old-page-1
https://example.com/old-page-2
...

### Redirects (289 URLs)

https://example.com/page → https://example.com/new-page
...

[Use --json for complete list]
```

**Example output for `--check-robots`:**

```
Robots.txt Conflict Check: https://example.com/sitemap.xml

## Conflicts Found (7 URLs)

These URLs are in the sitemap but blocked by robots.txt:

URL                              Blocked by rule
────────────────────────────────────────────────
/admin/dashboard                 Disallow: /admin/
/api/internal                    Disallow: /api/
...

⚠ URLs in sitemap should not be blocked by robots.txt
```

---

## Implementation Approach

**Key files likely involved:**
- `src/commands/sitemap.ts` - Add new flags and logic
- `src/lib/sitemap-discovery.ts` (new) - Discovery logic
- `src/lib/sitemap-validation.ts` (new) - Deep validation logic
- `src/lib/robots-txt.ts` (new or existing) - robots.txt parsing

**Approach:**

### 1. Discovery (`--discover`)

```
sitemap --discover https://example.com
```

Discovery order:
1. Fetch `/robots.txt`, parse `Sitemap:` directives
2. Fetch homepage, look for `<link rel="sitemap">`
3. Try common paths: `/sitemap.xml`, `/sitemap_index.xml`, `/sitemap-index.xml`

Report all found sitemaps with their discovery method.

### 2. URL Status Checking (`--check-urls`)

```
sitemap https://example.com/sitemap.xml --check-urls
```

- Parse sitemap, extract all URLs
- Make HEAD requests to each URL (faster than GET)
- Categorize by status code (2xx, 3xx, 4xx, 5xx)
- Report summary and list problematic URLs
- Consider rate limiting to avoid overwhelming servers
- Consider `--concurrency` flag for parallel requests

### 3. Robots.txt Conflict Detection (`--check-robots`)

```
sitemap https://example.com/sitemap.xml --check-robots
```

- Fetch and parse `/robots.txt`
- For each sitemap URL, check if it matches any `Disallow` rules
- Consider User-agent: * rules (and optionally Googlebot-specific rules)
- Report conflicting URLs with the rule that blocks them

### 4. Noindex Detection (`--check-noindex`)

```
sitemap https://example.com/sitemap.xml --check-noindex
```

- For each URL in sitemap, fetch the page
- Check for `<meta name="robots" content="noindex">` or `X-Robots-Tag: noindex` header
- Report URLs that have noindex directives
- This is slow (requires fetching each page) — consider sampling or `--limit` flag

**Considerations:**
- URL checking can be slow for large sitemaps — provide progress indication
- Rate limiting is important to avoid being blocked or overwhelming servers
- Consider `--sample N` flag to check a random sample instead of all URLs
- Noindex checking requires full page fetches — make it opt-in and warn about time
- Cache robots.txt parsing to avoid repeated fetches

---

## Acceptance Criteria

### Discovery
- [ ] `--discover` finds sitemaps via robots.txt `Sitemap:` directives
- [ ] `--discover` finds sitemaps via HTML `<link rel="sitemap">`
- [ ] `--discover` checks common sitemap paths
- [ ] Reports discovery method for each found sitemap

### URL Status Checking
- [ ] `--check-urls` makes HEAD requests to all sitemap URLs
- [ ] Reports status code distribution (2xx, 3xx, 4xx, 5xx)
- [ ] Lists problematic URLs (non-200 responses)
- [ ] Shows progress for large sitemaps
- [ ] Respects rate limiting (configurable or sensible default)

### Robots.txt Conflicts
- [ ] `--check-robots` fetches and parses robots.txt
- [ ] Identifies URLs blocked by Disallow rules
- [ ] Reports which rule blocks each URL
- [ ] Handles User-agent: * rules correctly

### Noindex Conflicts
- [ ] `--check-noindex` fetches pages and checks for noindex
- [ ] Checks both meta tags and X-Robots-Tag headers
- [ ] Warns about time required for large sitemaps
- [ ] Supports `--limit` or `--sample` to reduce scope

### General
- [ ] All new features work with JSON output
- [ ] Research page updated with new feature documentation
- [ ] CHANGELOG entry references research page and version

---

## Notes

- These features require network requests beyond fetching the sitemap itself — they should be opt-in flags, not default behavior.
- Consider combining flags: `--check-all` could run all checks.
- URL status checking at scale may require careful rate limiting — consider using a configurable delay between requests.
- For very large sitemaps (50,000 URLs), full checking may take significant time. Consider progress bars and ability to interrupt/resume.
