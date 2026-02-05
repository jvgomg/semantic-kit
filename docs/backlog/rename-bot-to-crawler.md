```yaml
# Metadata (keep at top of file)
researchVersion: research-v0.3.3
toolVersion: null
status: pending
created: 2026-02-04
```

# Rename `bot` Command to `crawler`

## Research Context

**Source:** [[web-crawlers]], [[ai-crawler-behavior]]

**Finding:**
The term "bot" has become ambiguous. In 2025-2026, "AI bots" commonly refers to AI crawlers like GPTBot and ClaudeBot, which do NOT render JavaScript. The `bot` command compares static HTML vs JavaScript-rendered content to show what *search engine crawlers* (primarily Google) see after rendering.

Renaming to `crawler` provides clarity:
- "Crawler" is the standard industry term for automated web access
- Distinguishes from "AI bots" which don't render JavaScript
- Better describes the command's purpose: simulating search engine crawler behavior

**Citations:**

- [^dev-to-js]: Documents that only Google reliably renders JavaScript among major search engines
- [^cloudflare-2025]: Shows AI crawler traffic trends and the prominence of GPTBot/ClaudeBot terminology
- [^sej-ai-crawlers]: Comprehensive AI crawler list showing "bot" suffix is standard for AI crawlers

---

## Proposed Change

**Affected command(s):** `bot` → `crawler`

**What should change:**

1. Rename the command from `bot` to `crawler`
2. Update all subcommands:
   - `bot` → `crawler` (compare static vs rendered)
   - Consider if `bot:js` pattern is needed for explicit JS-rendered view
3. Update documentation to clarify the distinction between:
   - **Search engine crawlers** (Google renders JS, others mostly don't)
   - **AI crawlers** (none render JS)
   - **Social media crawlers** (none render JS)

**Example usage after change:**
```bash
# Compare static vs rendered content
semantic-kit crawler https://example.com

# Show extracted markdown content
semantic-kit crawler https://example.com --content

# Custom timeout for complex SPAs
semantic-kit crawler https://example.com --timeout 10000
```

---

## Implementation Approach

**Key files likely involved:**
- `src/commands/bot.ts` → `src/commands/crawler.ts` - Rename file
- `src/cli.ts` - Update command registration
- `src/lib/results.ts` - Update type names (BotResult → CrawlerResult)
- `src/tui/` - Update any TUI references
- `docs/commands/bot.md` → `docs/commands/crawler.md` - Rename and update docs

**Approach:**

1. Rename command file and update exports
2. Update CLI command registration
3. Update type names for clarity (BotResult → CrawlerResult, etc.)
4. Update all documentation references
5. Consider adding a deprecation alias so `bot` still works temporarily

**Considerations:**
- **Backwards compatibility**: Consider keeping `bot` as an alias for one release cycle with a deprecation warning
- **TUI integration**: Ensure TUI menu reflects the new name
- **Documentation**: Update all wikilinks from `[[bot]]` to `[[crawler]]`
- **Research links**: Update docs/commands to link to [[web-crawlers]] research page

---

## Acceptance Criteria

- [ ] Command renamed from `bot` to `crawler`
- [ ] All subcommand variations work (`crawler`, `crawler --content`, etc.)
- [ ] Type names updated (BotResult → CrawlerResult, etc.)
- [ ] CLI help text updated
- [ ] TUI updated if applicable
- [ ] Documentation updated:
  - [ ] `docs/commands/bot.md` → `docs/commands/crawler.md`
  - [ ] All internal references updated
  - [ ] Behavior table links to [[web-crawlers]] research
- [ ] Optional: `bot` alias with deprecation warning
- [ ] CHANGELOG entry references [[web-crawlers]] and research-v0.3.3

---

## Notes

The `ai` command remains unchanged—it shows static HTML (what AI crawlers see). The renamed `crawler` command shows the comparison between static and rendered (what search engine crawlers see, particularly Google with its WRS).

This creates a clearer mental model:
- `ai` = What AI crawlers see (static HTML, no JS)
- `crawler` = What search engine crawlers see (static vs rendered comparison)

Alternative names considered:
- `render` - Too focused on the mechanism, not the purpose
- `seo` - Too broad, overlaps with other SEO concepts
- `google` - Too specific to one search engine
- `js` - Too narrow in scope
