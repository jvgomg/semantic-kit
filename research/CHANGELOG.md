# Research Changelog

Version history for research documentation.

This changelog tracks changes to research content, separate from tool version changes (see `/CHANGELOG.md` for tool releases).

---

## Versioning

Research uses semantic versioning:

- **Major (X.0.0)**: Significant new research areas or major restructuring
- **Minor (0.X.0)**: New pages or substantial updates
- **Patch (0.0.X)**: Small corrections, verification updates, citation fixes

### When to Release

Release research (move from Unreleased to a versioned section) when:
- Creating a backlog item that references the research (required)
- Enough changes have accumulated to warrant a version
- Changes are ready to be cited by tool changelog entries

---

## Unreleased

_No unreleased changes._

---

## research-v0.5.0 (2026-02-04)

XML sitemap research: protocol specification, validation, and tool recommendations.

### Added
- New page [[sitemaps]] covering XML sitemap protocol, discovery mechanisms, extensions, validation, and best practices
- Updated [[topics]] index with Sitemaps section

### Backlog
- Created `docs/backlog/sitemap-command.md` for MVP sitemap validation and inspection
- Created `docs/backlog/sitemap-command-improvements.md` for discovery and deep validation features

---

## research-v0.4.0 (2026-02-04)

Example markup research: authoritative sources and notable blogs for demonstrating semantic HTML.

### Added
- New page [[example-markup-sources]] cataloging authoritative sources (W3C WAI, MDN, WebAIM, Deque) and notable accessibility blogs (Adrian Roselli, Scott O'Hara, Heydon Pickering) for semantic HTML examples

### Backlog
- Created `docs/backlog/example-html-fixtures.md` with detailed example HTML files for demonstrating `structure`, `validate:html`, and `validate:a11y` commands

---

## research-v0.3.3 (2026-02-04)

Comprehensive web crawler research and JavaScript rendering capabilities documentation.

### Added
- New page [[web-crawlers]] comprehensive reference documenting all major crawler types, JavaScript rendering capabilities, user agents, and timeout behavior

### Changed
- Updated [[ai-crawler-behavior]] with timeout thresholds section (200ms TTFB, 5-10s page load windows)
- Updated [[ai-crawler-behavior]] with 2024-2025 crawler traffic trends from Cloudflare report
- Updated [[ai-crawler-behavior]] with new user agents (OAI-SearchBot, ChatGPT-User)
- Updated [[openai]] with crawler information sharing note and traffic statistics
- Updated [[anthropic]] with traffic trends and deprecated user agent documentation

### Verified
- Confirmed Mozilla Readability 0.6.0 is latest version (matches semantic-kit)
- Confirmed Playwright 1.58.1 is latest version (matches semantic-kit)
- Confirmed [[streaming-ssr]] citations still current
- Confirmed [[mozilla-readability]] citations still current
- Confirmed 5000ms default timeout is appropriate for simulating search engine rendering
- Confirmed Google WRS has no fixed timeout (stops when event loop empty, 5s is median queue time)
- Confirmed only Google reliably renders JavaScript among major search engines
- Confirmed Bing has limitations at scale despite Chromium-based engine
- Confirmed all AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) do NOT render JavaScript
- Confirmed all social media crawlers do NOT render JavaScript

### Backlog
- Created `docs/backlog/rename-bot-to-crawler.md` for command rename

---

## research-v0.3.2 (2026-02-04)

Structure command research verification and WCAG 2.2 documentation.

### Changed
- Updated [[axe-core]] with WCAG 2.2 section documenting target-size rule and disabled-by-default status
- Updated [[axe-core]] with sa11y (Salesforce) in "Used By" section
- Updated [[violation-detection-tools]] with sa11y tool and preset documentation

### Verified
- Confirmed [[landmarks]] citations still current (W3C WAI APG maintained, copyright 2026)
- Confirmed [[document-outline]] citations still current (W3C WAI tutorials)
- Confirmed axe-core 4.11.1 is latest version (Jan 6, 2026)
- Confirmed linkedom 0.18.12 and jsdom 27.4.0 remain appropriate (happy-dom not suitable for axe-core)

### Backlog
- Created `docs/backlog/wcag22-target-size-rule.md` for opt-in WCAG 2.2 support

---

## research-v0.3.1 (2026-02-04)

Structured data tooling verification and library alternatives research.

### Changed
- Updated [[structured-data]] with metascraper library documentation and maintenance status notes for structured-data-testing-tool
- Updated [[schema-org]] with current vocabulary stats (v29.4, Dec 2025) and schema-dts TypeScript support section
- Updated [[google-structured-data]] with CLI tool maintenance status note

### Verified
- Confirmed Schema.org stats (827 types, 1,528 properties, 94 enumerations) match current version 29.4
- Confirmed Open Graph required tags (og:title, og:type, og:image, og:url) match official specification
- Confirmed Twitter Card required tags (twitter:card, twitter:title, twitter:description) match X Developer documentation

### Backlog
- Created `docs/backlog/schema-library-migration.md` based on findings about unmaintained extraction library

---

## research-v0.3.0 (2026-02-04)

Apple Safari Reader deep-dive: algorithm details, source code, and iOS 18 features.

### Changed
- Major update to [[apple]] entity page with comprehensive Safari Reader documentation
- Updated [[reader-mode]] with Safari 18 features (table of contents, Apple Intelligence summarization, Highlights)
- Updated [[readability]] with Safari Reader source code availability and algorithm specifics
- Added Safari Reader triggering requirements (minimum characters, commas, element counts)
- Added Safari Reader metadata extraction details (Levenshtein distance, visual positioning)
- Documented `instapaper_hide` class support in Safari Reader

### Added
- Citation for Safari Reader source code repository (iOS 17.2)
- Citations for Safari 18 features (MacRumors, 9to5Mac, AppleInsider)
- Citation for Safari Reader triggering requirements (Mathias Bynens)

---

## research-v0.2.0 (2026-02-03)

AI content extraction research: crawlers vs answer engines vs agents.

### Changed
- Major update to [[ai-crawler-behavior]] distinguishing three types of AI web consumers: crawlers, answer engines, and AI agents
- Added Answer Engine Optimization (AEO) section with content structure recommendations
- Added llms.txt standard documentation (with note that crawlers don't yet respect it)
- Updated [[jina-reader]] with `X-With-Links-Summary` header documentation
- Updated [[content-extraction]] to reflect different extraction approaches and when navigation matters

### Backlog
- Created `docs/backlog/ai-command-link-extraction.md` based on findings

---

## research-v0.1.0 (2026-02-03)

Initial release of research documentation.

### Added
- Research documentation scaffolding
- Agent directives for AI-assisted research updates
- Research guide for contributors
- Search strategies by entity and topic
- Verification log template
- New page [[reader-mode]] covering browser reader mode implementations (Mozilla, Apple, triggering conditions, CLI tools)
- New page [[ai-crawler-behavior]] covering GPTBot, ClaudeBot, PerplexityBot JavaScript limitations
- New page [[streaming-ssr]] covering hidden content in streaming SSR frameworks (Next.js, Remix, etc.)
- New page [[firecrawl]] covering the web scraping API service
- New page [[jina-reader]] covering URL-to-markdown service and Reader-LM
- New page [[turndown]] covering HTML-to-markdown conversion and alternatives
- New page [[postlight-parser]] covering content extraction with site-specific rules
- New page [[structured-data]] covering Schema.org, JSON-LD, Microdata, RDFa
- New page [[google-structured-data]] covering Google's rich results requirements
- New page [[accessibility]] overview covering accessibility testing approaches
- New page [[accessibility-tree]] covering browser accessibility tree, name computation, and inspection methods
- New page [[markup-validation]] covering why valid HTML matters, browser error recovery, validation tools
- New page [[landmarks]] covering ARIA landmarks, HTML-to-role mapping, skip links
- New page [[axe-core]] covering the accessibility testing engine
- New page [[violation-detection-tools]] overview of automated testing tools
- New page [[pa11y]] covering CLI accessibility testing
- New page [[lighthouse-accessibility]] covering Google's accessibility audits
- New page [[ibm-accessibility-checker]] covering IBM's Equal Access toolkit
- New page [[guidepup]] covering screen reader automation
- New page [[readability]] covering the readability algorithm concept and history
- New page [[schema-org]] covering Schema.org vocabulary, types, and properties
- New page [[semantic-html]] overview covering how HTML structure communicates meaning
- New page [[document-outline]] covering heading hierarchy and accessibility
- New page [[semantic-elements]] covering article, main, nav, aside, section usage
- New page [[googlebot]] covering crawler identification and verification
- New page [[google-javascript-rendering]] covering Web Rendering Service
- New page [[anthropic]] entity overview covering ClaudeBot crawler
- New page [[openai]] entity overview covering GPTBot crawler
- New page [[perplexity]] entity overview covering PerplexityBot crawler
- New page [[apple]] entity overview covering Safari Reader Mode

### Changed
- Updated [[mozilla-readability]] with security note about DOMPurify sanitization
- Added ctrl.blog citations to [[mozilla-readability]]
- Updated [[google]] with HTML structure signals section
- Updated [[content-extraction]] with links to all new pages
- Updated [[topics]] index to reflect created pages
- Fixed broken wikilinks: `[[firefox-reader]]` → `[[reader-mode]]`, `[[google-crawler-behavior]]` → `[[googlebot]]`
- Updated stale dates in frontmatter

### Migrated
- All content from `docs/html-to-markdown-content-extraction.md` (can be deleted)
- All content from `docs/accessibility-testing.md` (can be deleted)
- Research content from `docs/ai-crawlers.md` extracted to [[streaming-ssr]]
- Research content from `docs/accessibility.md` extracted to [[accessibility-tree]], command doc refactored to `docs/commands/a11y.md`
- Command doc `docs/validate-a11y.md` refactored to `docs/commands/validate-a11y.md` with Behavior table
- Command doc `docs/html-validation.md` refactored to `docs/commands/validate-html.md` with Behavior table
- Command doc `docs/bot.md` refactored to `docs/commands/bot.md` with Behavior table
- Command doc `docs/structured-data.md` refactored to `docs/commands/schema.md` with Behavior table
- Command doc `docs/structure.md` refactored to `docs/commands/structure.md` with Behavior table

---

<!-- Template for releases:

## research-vX.Y.Z (YYYY-MM-DD)

### Added
- New page [[page-name]] covering topic

### Changed
- Updated [[page-name]] with new findings about topic

### Fixed
- Corrected citation in [[page-name]]

### Verified
- Confirmed [[page-name]] conclusions still current as of YYYY-MM-DD

-->
