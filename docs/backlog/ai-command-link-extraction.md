```yaml
# Metadata (keep at top of file)
researchVersion: research-v0.2.0
toolVersion: null
status: pending
created: 2026-02-03
```

# Add link extraction to `ai` command

## Research Context

**Source:** [[ai-crawler-behavior]], [[jina-reader]], [[content-extraction]]

**Finding:**
While researching AI content extraction, we found that Jina Reader offers an `X-With-Links-Summary` header specifically because "this helps downstream LLMs or web agents navigating the page or take further actions." Navigation is correctly excluded from main content extraction (Readability-style), but link information has separate value for understanding what an AI system could navigate to.

The `ai` command currently shows only extracted article content. However, AI crawlers receive the full HTML response (with potentially different content based on user-agent headers), and AI agents can see and interact with all links. Adding link extraction would make the `ai` command a more comprehensive assessment of what AI systems see.

**Citations:**

- [^jina-reader]: Jina Reader's `X-With-Links-Summary` feature exists for downstream LLM/agent navigation
- [^jina-professional]: Default extraction excludes menus/footers, but links can be preserved separately
- [^anthropic-computer-use]: AI agents see full visual pages and can interact with links

---

## Proposed Change

**Affected command(s):** `ai`

**What should change:**
The `ai` command should extract and return page links in addition to main content. Links should be:

1. **Unique** — deduplicated by URL
2. **Categorized** — separated into navigation links vs content links
3. **Counted** — include totals for each category
4. **Structured** — returned as structured data, with renderers deciding display format

This makes the `ai` command a comprehensive view of what AI systems see: both the extracted content and the navigation context.

**Example output (if applicable):**
```
# Main content (existing behavior)
...markdown content...

---

## Links

### Navigation (12 links)
- Home: https://example.com/
- About: https://example.com/about
- Contact: https://example.com/contact
...

### Content (8 links)
- Related Article: https://example.com/related
- Source: https://external.com/source
...
```

JSON format would include structured link data:
```json
{
  "markdown": "...",
  "links": {
    "navigation": [
      { "text": "Home", "href": "https://example.com/" }
    ],
    "content": [
      { "text": "Related Article", "href": "https://example.com/related" }
    ],
    "counts": {
      "navigation": 12,
      "content": 8,
      "total": 20
    }
  }
}
```

---

## Implementation Approach

**Key files likely involved:**
- `src/commands/ai.ts` - Add link extraction to the result, update renderers
- `src/lib/links.ts` (new or existing) - Link extraction utilities
- `src/lib/results.ts` - Update `AiResult` type to include links
- `src/commands/structure.ts` - Reference for existing link extraction logic

**Approach:**

1. **Reuse existing utilities** — The `structure` command already extracts links. Factor out link extraction into shared utility code that both commands can use.

2. **Categorize links** — Determine navigation vs content links by checking if the link is within a `<nav>` element, `<header>`, `<footer>`, or has navigation-related roles/classes. Links within `<main>`, `<article>`, or the Readability-extracted content are "content links."

3. **Deduplicate** — Track unique URLs, keeping the first anchor text encountered for each.

4. **Structured data first** — Add links to the `AiResult` type. Let each output format (full, compact, JSON, TUI) decide how to render.

5. **Request headers** — Note that the `ai` command may use AI crawler user-agent headers, so the server response (and thus available links) may differ from what `structure` sees.

**Considerations:**
- Links should be extracted from the full HTML response, not just the Readability-extracted content (otherwise we'd miss navigation links)
- Consider whether to include/exclude external vs internal links (or categorize them)
- Handle relative URLs by resolving them against the page URL
- Edge case: pages with very many links — may want a default limit with option to show all

---

## Acceptance Criteria

- [ ] `ai` command extracts unique links from the page
- [ ] Links are categorized as navigation vs content
- [ ] Link counts are included in output
- [ ] JSON output includes structured link data
- [ ] Full/TUI output displays links in readable format
- [ ] Link extraction code is shared with `structure` command (DRY)
- [ ] Research page updated:
  - [ ] `toolCoverage` entry added to [[ai-crawler-behavior]] frontmatter
  - [ ] Inline callout added noting link extraction feature
- [ ] CHANGELOG entry references research page and version

---

## Notes

- The `structure` command already shows links, but the `ai` command makes requests with AI crawler user-agent headers, so server responses may differ. This justifies having link extraction in both commands.
- Future enhancements could add other "comprehensive AI view" elements (meta description, structured data summary), but those should be separate backlog items.
- Implementation details (exact categorization heuristics, display format) are left to the developer.
