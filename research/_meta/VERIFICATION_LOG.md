# Verification Log

A record of research verification and update tasks.

---

## How to Use This Log

After completing any research task, add an entry below with:
- Date and brief description
- What you were asked to do
- What pages you checked or updated
- Summary of findings
- Search queries used (helps future verification)

Entries are newest-first.

---

## Log Entries

### 2026-02-04 - Research XML sitemaps for potential tool feature

**Task:** Research XML sitemaps comprehensively to support potential sitemap validation and viewing functionality in semantic-kit.

**Pages created:**
- [[sitemaps]] - New comprehensive page in `research/topics/sitemaps/`

**Pages updated:**
- [[topics]] - Added Sitemaps section to index

**Key findings:**

1. **Protocol specification (sitemaps.org v0.9)**:
   - Three required elements: `<urlset>`, `<url>`, `<loc>`
   - Optional: `<lastmod>`, `<changefreq>`, `<priority>`
   - **Google ignores `<changefreq>` and `<priority>`** - only uses `<lastmod>` if verifiably accurate
   - Size limits: 50,000 URLs or 50MB per file, sitemap index for larger sites

2. **Discovery mechanisms**:
   - **robots.txt**: `Sitemap:` directive (recommended, most widely supported)
   - **HTML `<link rel="sitemap">`**: Less universally supported
   - **Search Console submission**: Direct submission with error reporting
   - **HTTP ping**: Deprecated by Google in 2023

3. **Extensions (Google-specific namespaces)**:
   - Image: `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`
   - Video: `xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"`
   - News: `xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"`
   - Hreflang: `xmlns:xhtml="http://www.w3.org/1999/xhtml"`

4. **Validation approaches**:
   - XSD schema validation via xmllint
   - Google Search Console (most authoritative)
   - sitemap.js npm package has CLI validation

5. **AI crawler behavior**:
   - GPTBot: Inconsistent sitemap usage
   - ClaudeBot: More consistent sitemap fetching
   - AI crawlers don't have mature sitemap-based discovery yet

6. **Best Node.js library**:
   - **sitemap.js** (ekalinin/sitemap.js): TypeScript-native, streaming support, CLI tools, actively maintained (last commit Jan 2025), 1.7k stars

7. **Common validation errors**:
   - Namespace mismatches
   - Non-UTF-8 encoding
   - Unescaped special characters
   - Relative URLs (must be absolute)
   - Including noindex/redirect/error pages

**Search queries used:**
- "sitemap.xml protocol specification structure 2026 official documentation"
- "sitemap discovery robots.txt HTTP header HTML link rel sitemap"
- "sitemap validation tools online CLI npm 2025 2026"
- "sitemap best practices Google Search Console 2025 2026 common mistakes"
- "sitemap index file multiple sitemaps organization large website"
- "XML sitemap extensions image video news Google hreflang xhtml namespace"
- "AI crawler sitemap GPTBot ClaudeBot robots.txt sitemap crawling 2025"
- "sitemap XML schema XSD validation errors common issues parsing"

**Sources used:**
- https://www.sitemaps.org/protocol.html (official specification)
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/combine-sitemap-extensions
- https://blog.cloudflare.com/from-googlebot-to-gptbot-whos-crawling-your-site-in-2025/
- https://github.com/ekalinin/sitemap.js
- https://searchengineland.com/how-to-implement-the-hreflang-element-using-xml-sitemaps-123030

---

### 2026-02-04 - Create comprehensive web crawlers reference

**Task:** Research all web crawlers, their JavaScript rendering capabilities, and create a comprehensive reference page to support renaming the "bot" command to "crawler".

**Pages created:**
- [[web-crawlers]] - New comprehensive crawler reference page in `research/topics/crawlers/`

**Key findings:**

1. **JavaScript rendering by category:**
   - **Google**: Full rendering (only major search engine that reliably renders JS)
   - **Bing**: Partial (limitations at scale, recommends SSR/dynamic rendering)
   - **Other search engines**: None (Yahoo, Yandex, DuckDuckGo, Baidu)
   - **AI training crawlers**: None (GPTBot, ClaudeBot, CCBot, etc.)
   - **AI search crawlers**: None (PerplexityBot, OAI-SearchBot)
   - **Social media**: None (all platforms - Facebook, Twitter, LinkedIn, etc.)
   - **SEO tools**: Optional (Screaming Frog has full Chromium support)
   - **AI agents**: Yes (use real browsers, undetectable in logs)

2. **Google WRS timeout behavior:**
   - No fixed timeout - stops when "event loop is empty"
   - 5 seconds is median queue time, NOT a timeout
   - Complex scripts may timeout before completing
   - 30-day caching for JavaScript resources

3. **Current 5000ms default is appropriate:**
   - Matches Google's median rendering queue time
   - Playwright's `networkidle` is correct for simulating search engine rendering
   - Users can increase for complex SPAs

4. **Agentic browsers are undetectable:**
   - Google Mariner, Perplexity Comet, ChatGPT Atlas use standard Chrome user agents
   - Cannot be identified in server logs

5. **Comprehensive user agent list compiled:**
   - Search engines: Googlebot, Bingbot, Yahoo Slurp, YandexBot, DuckDuckBot
   - AI training: GPTBot, ClaudeBot, CCBot, Bytespider, Meta-ExternalAgent, Amazonbot
   - AI search: OAI-SearchBot, ChatGPT-User, Claude-User, PerplexityBot, DuckAssistBot
   - Social: facebookexternalhit, Twitterbot, LinkedInBot, Pinterest, Slackbot, Discordbot

**Search queries used:**
- "complete list web crawlers user agents 2025 2026 JavaScript rendering capability"
- "Bingbot JavaScript rendering capability 2025 does Bing render JS"
- "social media crawlers Facebook Twitter LinkedIn JavaScript rendering OGP"
- "DuckDuckBot Yandex Yahoo Slurp crawler JavaScript rendering capability 2025"
- "Googlebot WRS timeout seconds JavaScript rendering wait time 2025"
- "SEO crawler tools Screaming Frog Ahrefs Semrush JavaScript rendering capability"
- "Playwright networkidle timeout best practice SEO crawling simulation seconds"

**Sources used:**
- https://dev.to/rachellcostello/how-search-engines-social-media-crawlers-render-javascript-438e
- https://www.onely.com/blog/googles-rendering-delay-5-seconds/
- https://www.seroundtable.com/google-page-rendering-25797.html
- https://blogs.bing.com/webmaster/october-2018/bingbot-Series-JavaScript,-Dynamic-Rendering,-and-Cloaking-Oh-My
- https://www.screamingfrog.co.uk/blog/bing-javascript/
- https://www.searchenginejournal.com/ai-crawler-user-agents-list/558130/
- https://prerender.io/blog/how-to-fix-link-previews/
- https://www.checklyhq.com/docs/learn/playwright/waits-and-timeouts/

---

### 2026-02-04 - Verify and update bot command research

**Task:** Validate and update the research behind the bot tool, ensure research is up-to-date regarding crawler timeouts and technical behavior, and look for opportunities to improve tooling/libraries.

**Pages checked/updated:**
- [[ai-crawler-behavior]] - Added timeout thresholds section, crawler traffic trends, new user agents
- [[openai]] - Added crawler information sharing note, traffic statistics
- [[anthropic]] - Added traffic trends, deprecated user agent documentation
- [[streaming-ssr]] - Verified citations still valid
- [[mozilla-readability]] - Verified citations still valid

**Findings:**

1. **AI crawler timeout specifications are not publicly documented** - No AI company publishes official timeout settings. Observational research suggests:
   - 5-10 second timeout windows for complete page loads
   - TTFB under 200ms correlates with 40-60% better AI visibility
   - Client-side rendering adds 500ms-2s+ risking timeout

2. **Major crawler traffic shifts (Cloudflare 2025 report)**:
   - GPTBot: 5% → 30% market share (+305% requests)
   - ClaudeBot: 27% → 21% market share (-46% requests)
   - PerplexityBot: +157,490% request growth
   - ChatGPT-User: +2,825% (user-initiated browsing)

3. **New crawler documentation**: Added OAI-SearchBot, ChatGPT-User, and noted that OAI-SearchBot and GPTBot share crawl data to avoid duplication.

4. **Libraries are current**:
   - Mozilla Readability 0.6.0 is latest (matches semantic-kit)
   - Playwright 1.58.1 is latest (matches semantic-kit)

5. **No library changes recommended**: Current stack (Playwright, Readability, linkedom, Turndown) remains appropriate.

**Search queries used:**
- "GPTBot ClaudeBot PerplexityBot timeout request headers crawl behavior 2025 2026"
- "AI web crawler timeout duration connection settings technical specifications 2025"
- "Googlebot Web Rendering Service timeout JavaScript rendering 2025 2026"
- "OpenAI GPTBot request timeout crawl rate limit specifications technical 2025"
- "Mozilla Readability npm library update 2025 2026 changelog"
- "Playwright npm headless browser update 2025 2026 new features"

**Sources used:**
- https://blog.cloudflare.com/from-googlebot-to-gptbot-whos-crawling-your-site-in-2025/ (Cloudflare crawler report)
- https://www.amicited.com/blog/ttfb-200ms-ai-crawler-success/ (TTFB thresholds)
- https://ppc.land/openai-revises-chatgpt-crawler-documentation-with-significant-policy-changes/ (OpenAI crawler updates)
- https://github.com/mozilla/readability (Readability library)
- https://github.com/microsoft/playwright/releases (Playwright releases)

---

### 2026-02-04 - Verify and update structure command research

**Task:** Validate and update the research behind the structure tool, ensure research is up-to-date, and look for opportunities to improve tooling/libraries.

**Pages checked/updated:**
- [[axe-core]] - Added WCAG 2.2 section with target-size rule details, added sa11y to "Used By"
- [[violation-detection-tools]] - Added sa11y tool with preset documentation
- [[landmarks]] - Verified citations still valid
- [[document-outline]] - Verified citations still valid

**Findings:**

1. **Research is accurate** - All citations verified. W3C ARIA landmarks and heading documentation remain authoritative sources. The axe-core repository confirms current version 4.11.1.

2. **Libraries are current**:
   - axe-core 4.11.1 is the latest version (released Jan 6, 2026) - matches what semantic-kit uses
   - linkedom 0.18.12 remains appropriate for lightweight HTML parsing
   - jsdom 28.0.0 is available (Feb 2025), but 27.4.0 used by semantic-kit is stable and sufficient

3. **WCAG 2.2 opportunity**: The `target-size` rule is available but disabled by default. Could be added as opt-in feature for the validate:a11y command.

4. **DOM library evaluation**: Evaluated happy-dom as an alternative to jsdom. Conclusion: Not suitable for axe-core due to incomplete DOM implementation. jsdom remains the correct choice for accessibility testing.

5. **New tool documented**: Added sa11y (Salesforce) as an axe-core wrapper with preset configurations. Useful reference for teams wanting pre-configured rule sets.

6. **No library changes recommended**: The current stack (linkedom for parsing, jsdom for axe-core) remains appropriate. happy-dom offers speed benefits but sacrifices the DOM completeness axe-core requires.

**Search queries used:**
- "axe-core 4.11 4.12 new rules WCAG 2.2 2025 2026 changelog"
- "linkedom npm DOM parsing Node.js alternatives 2025 2026"
- "jsdom alternatives 2025 2026 happy-dom performance Node.js"
- "accessibility testing Node.js 2025 2026 axe-core alternatives new tools"

**Sources used:**
- https://github.com/dequelabs/axe-core (axe-core repository)
- https://github.com/dequelabs/axe-core/releases (release history)
- https://dequeuniversity.com/rules/axe/html/4.11 (rule reference)
- https://www.deque.com/blog/axe-core-4-5-first-wcag-2-2-support-and-more/ (WCAG 2.2 support)
- https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/ (landmarks documentation)
- https://www.w3.org/WAI/tutorials/page-structure/headings/ (headings documentation)
- https://github.com/jsdom/jsdom/releases (jsdom releases)
- https://github.com/salesforce/sa11y (sa11y repository)

---

### 2026-02-04 - Verify and update structured data research

**Task:** Validate and update the research behind the schema tool, ensure research is up-to-date, and look for opportunities to improve tooling/libraries.

**Pages checked/updated:**
- [[structured-data]] - Added metascraper library documentation, noted maintenance status of structured-data-testing-tool
- [[schema-org]] - Updated vocabulary stats to v29.4 (Dec 2025), added schema-dts TypeScript support section
- [[google-structured-data]] - Added note about CLI tool maintenance status

**Findings:**

1. **Research is accurate** - Schema.org stats (827 types, 1,528 properties, 94 enumerations) match current version 29.4. Open Graph and Twitter Card required tags in research match official specifications.

2. **Major tooling concern identified**: The `web-auto-extractor` library (v1.0.17) used by the schema command hasn't been updated in 8 years. The `structured-data-testing-tool` (v4.5.0) also hasn't been updated since 2019 and uses web-auto-extractor internally.

3. **Better alternative exists**: `metascraper` (v5.49.15) is actively maintained (published 18 days ago), has 2.6k stars, supports all the same formats (Open Graph, Microdata, RDFa, Twitter Cards, JSON-LD), and uses a modular architecture.

4. **Added schema-dts documentation**: Google's TypeScript type definitions for Schema.org are useful for developers but weren't documented.

**Search queries used:**
- "web-auto-extractor npm structured data JSON-LD microdata 2025 2026"
- "structured-data-testing-tool npm CLI 2025 2026 alternative"
- "Schema.org validator API npm JSON-LD validation library 2025 2026"
- "JSON-LD extraction npm library TypeScript 2025 modern maintained"
- "Open Graph Twitter Card extraction npm library 2025 metadata parsing"
- "metascraper npm microdata rdfa json-ld extraction features 2025"

**Sources used:**
- https://ogp.me/ (Open Graph specification)
- https://developer.x.com/en/docs/x-for-websites/cards/overview/markup (Twitter Cards specification)
- https://schema.org/docs/schemas.html (Schema.org vocabulary stats)
- https://github.com/microlinkhq/metascraper (metascraper library)
- https://github.com/indix/web-auto-extractor (web-auto-extractor repository)
- https://github.com/iaincollins/structured-data-testing-tool (structured-data-testing-tool repository)
- https://github.com/google/schema-dts (schema-dts repository)

**Follow-up:** Created backlog item for considering migration from web-auto-extractor to metascraper.

---

### 2026-02-03 - Research Apple Safari Reader tooling updates

**Task:** Improve research on readability concepts, specifically Apple's readability tooling.

**Pages updated:**
- [[apple]] - Major expansion of Safari Reader documentation
- [[reader-mode]] - Added Safari 18 features, updated triggering requirements
- [[readability]] - Added Safari Reader source code availability

**Findings:**

1. **Safari Reader source code is publicly available**: A GitHub repository (dm-zharov/safari-readability) contains extracted source code from iOS 17.2. The `ReaderArticleFinder.js` file is ~1200 lines of unminified JavaScript.

2. **Algorithm technical details** revealed by source code analysis:
   - Requires at least 10 commas for primary article candidate
   - Uses Levenshtein distance for title matching against `document.title`
   - Scores adjusted based on visual position when Reader button pressed
   - +1 score per 100 characters in paragraphs
   - Hardcodes certain excludes like `#disqus_thread`
   - Supports multi-page article detection

3. **Safari 18 / iOS 18 new features**:
   - Auto-generated table of contents from heading hierarchy
   - Apple Intelligence summarization (3 sentences, manual activation)
   - Highlights feature (separate from Reader Mode)
   - Redesigned UI with Page Menu access
   - Available in English-speaking regions only

4. **Triggering requirements** are more specific than previously documented:
   - 350-400 characters minimum (not 500)
   - At least 5 child elements in wrapper
   - At least 10 commas in content
   - Must use HTTP/HTTPS (not file://)
   - Container cannot be `<p>` alone

5. **Markup hints**: Safari respects `instapaper_hide` class for explicit exclusion.

**Search queries used:**
- "Apple Safari Reader Mode 2025 2026 new features iOS 18 macOS Sequoia"
- "Apple WebKit readability algorithm Safari reader content extraction"
- "Apple Intelligence Safari Reader summarization article summary iOS 18"
- "Safari Reader Levenshtein distance title matching algorithm"
- "WebKit Safari Reader source code ReaderArticleFinder.js algorithm"
- "Safari Reader instapaper_ignore instapaper_body class markup hints"
- "Safari 18 Reader Mode iOS 18.1 18.2 new features summarize table of contents"

**Sources used:**
- https://github.com/dm-zharov/safari-readability (iOS 17.2 source code)
- https://www.ctrl.blog/entry/browser-reading-mode-content.html
- https://www.ctrl.blog/entry/browser-reading-mode-metadata.html
- https://mathiasbynens.be/notes/safari-reader
- https://www.macrumors.com/how-to/use-new-reader-mode-ios-safari/
- https://9to5mac.com/2024/07/30/safari-gets-apple-intelligence-upgrade-in-ios-181-with-new-summarize-feature/
- https://appleinsider.com/articles/24/06/10/safari-18-includes-a-new-highlights-feature-for-summarizing-articles-and-more

---

### 2026-02-03 - Research AI content extraction methods and navigation handling

**Task:** Investigate whether Readability is still appropriate for the `ai` command, and whether navigational content should be shown to users.

**Pages updated:**
- [[ai-crawler-behavior]] - Major update distinguishing crawlers, answer engines, and AI agents
- [[jina-reader]] - Added documentation for X-With-Links-Summary header
- [[content-extraction]] - Updated to reflect different extraction approaches

**Findings:**

1. **Readability remains appropriate** for simulating AI crawler extraction, but the landscape is more nuanced:
   - AI crawlers (GPTBot, ClaudeBot) use proprietary extraction, likely Readability-style
   - AI answer engines (Perplexity) use LLM-based snippet extraction, not Readability
   - AI agents (Claude computer use) see full visual pages via screenshots

2. **Navigation is intentionally excluded** by Readability and similar tools. This is correct for main content extraction.

3. **Links have separate value** for downstream use. Jina Reader offers `X-With-Links-Summary` header specifically for LLMs/agents that need to navigate further.

4. **Answer Engine Optimization (AEO)** is an emerging field with specific recommendations for AI visibility (lead with answer, one idea per paragraph, structured data).

5. **llms.txt standard** exists but is not yet respected by major AI crawlers as of 2025.

**Search queries used:**
- "AI agent web browsing content extraction navigation 2025 2026 Claude ChatGPT"
- "GPTBot ClaudeBot PerplexityBot content extraction algorithm how crawlers parse pages 2025"
- "Perplexity AI how it extracts content from pages does it include navigation links citations"
- "Jina Reader API X-With-Links-Summary header documentation 2025"
- "answer engine optimization site structure internal links navigation SEO for AI 2025"
- "llms.txt standard specification AI crawlers how it works 2025"

---

### 2026-02-03 - Create all missing pages for initial release

**Task:** Audit research documentation for broken wikilinks and create all missing pages to prepare for initial release.

**Pages created:**
- [[readability]] - General concept page for the readability algorithm (separate from [[mozilla-readability]])
- [[schema-org]] - Schema.org vocabulary, types, and properties
- [[semantic-html]] - Overview of semantic HTML topic area
- [[document-outline]] - Heading hierarchy and accessibility
- [[semantic-elements]] - Article, main, nav, aside, section usage
- [[googlebot]] - Crawler identification and verification
- [[google-javascript-rendering]] - Web Rendering Service details
- [[anthropic]] - Entity stub with ClaudeBot information
- [[openai]] - Entity stub with GPTBot information
- [[perplexity]] - Entity stub with PerplexityBot information
- [[apple]] - Entity stub with Safari Reader Mode information

**Files updated:**
- Fixed `[[firefox-reader]]` → `[[reader-mode]]` in RESEARCH_GUIDE.md
- Fixed `[[javascript-rendering]]` → `[[google-javascript-rendering]]` in RESEARCH_GUIDE.md
- Fixed `[[google-crawler-behavior]]` → `[[googlebot]]` in AGENT_DIRECTIVES.md
- Fixed `[[google-crawler-behavior|Google]]` → `[[google|Google]]` in ai-crawler-behavior.md
- Updated stale dates (2024-01-01 → 2026-02-03) in entities/_index.md and google/_index.md

**Research sources used:**
- https://support.anthropic.com/en/articles/8896518 (Anthropic crawler docs)
- https://platform.openai.com/docs/bots (OpenAI crawler docs)
- https://docs.perplexity.ai/guides/bots (Perplexity crawler docs)
- https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers (Googlebot docs)
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics (Google JS SEO)
- https://support.apple.com/guide/iphone/hide-distractions-when-reading-iphdc30e3b86/ios (Safari Reader)
- https://www.w3.org/WAI/tutorials/page-structure/headings/ (Heading accessibility)
- https://schema.org/ (Schema.org vocabulary)

---

### 2026-02-03 - Complete migration of html-to-markdown-content-extraction.md

**Task:** Migrate all remaining content from `docs/html-to-markdown-content-extraction.md` into the research documentation structure.

**Pages created:**
- [[ai-crawler-behavior]] - How AI crawlers (GPTBot, ClaudeBot, PerplexityBot) parse pages
- [[firecrawl]] - Web scraping API service (Playwright, Cheerio, Turndown stack)
- [[jina-reader]] - URL to markdown service (includes Reader-LM)
- [[turndown]] - HTML to markdown conversion (includes alternatives)
- [[postlight-parser]] - Content extraction with site-specific rules
- [[structured-data]] - Schema.org, JSON-LD, Microdata, RDFa, validation tools
- [[google-structured-data]] - Google's rich results requirements

**Pages updated:**
- [[google]] (_index.md) - Added HTML structure signals section
- [[content-extraction]] (_index.md) - Added links to new pages
- [[topics]] (_index.md) - Updated to reflect created pages

**Findings:**
- All content from `docs/html-to-markdown-content-extraction.md` has been migrated
- Original file can now be deleted
- Content was reorganized into entity-specific (Google) and topic-based (content-extraction, structured-data) pages
- Citations preserved and updated with current access dates

**Sources used:**
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/appearance/structured-data
- https://salt.agency/blog/ai-crawlers-javascript/
- https://www.bluetickconsultants.com/web-crawler-explained-gptbot-vs-googlebot-javascript-guide/
- https://github.com/mendableai/firecrawl
- https://jina.ai/reader/
- https://github.com/mixmark-io/turndown
- https://github.com/postlight/parser
- https://schema.org/

---

### 2026-02-03 - Migrate Mozilla Readability content from docs

**Task:** Migrate content about Mozilla Readability from `docs/html-to-markdown-content-extraction.md` into the research documentation structure.
**Pages created:** [[reader-mode]]
**Pages updated:** [[mozilla-readability]]
**Findings:**
- Created new [[reader-mode]] page covering browser reader mode implementations
- Added Apple Readability (Safari) documentation with comparison table
- Added reader mode triggering conditions
- Added CLI tools section (readability-cli, readability-extractor)
- Updated [[mozilla-readability]] with security note about DOMPurify
- Added ctrl.blog citations to both pages

**Sources used:**
- https://www.ctrl.blog/entry/browser-reading-mode-content.html
- https://www.ctrl.blog/entry/browser-reading-mode-metadata.html
- https://github.com/mozilla/readability

---

### 2024-XX-XX - Initial scaffolding

**Task:** Set up research documentation structure
**Pages created:** Directory structure and meta documentation
**Findings:**
- Created scaffolding for research documentation system
- Existing research content in `docs/` to be migrated:
  - `docs/html-to-markdown-content-extraction.md`
  - `docs/accessibility-testing.md`
  - `docs/semantic-kit-roadmap.md`

**Next steps:**
- Migrate existing research into new structure
- Create initial entity and topic pages
- Verify citations in migrated content

---

<!-- Template for new entries:

### YYYY-MM-DD - Brief description

**Task:** What you were asked to do
**Pages checked/updated:** [[page1]], [[page2]]
**Findings:**
- Summary of what you found
- Any changes made
- Any issues or uncertainties

**Search queries used:**
- "query 1"
- "query 2"

-->
