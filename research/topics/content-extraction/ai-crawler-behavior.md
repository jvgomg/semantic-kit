---
title: "AI Crawler Behavior"
lastVerified: 2026-02-04
lastUpdated: 2026-02-04
---

# AI Crawler Behavior

How AI systems parse web pages — distinguishing between crawlers, answer engines, and AI agents.

Different AI systems consume web content in fundamentally different ways. Understanding these distinctions is critical for developers optimizing their sites for AI visibility.

## Three Types of AI Web Consumers

| Type | Examples | How they see content |
|------|----------|---------------------|
| **AI Crawlers** | GPTBot, ClaudeBot, CCBot | Static HTML extraction for training/indexing |
| **AI Answer Engines** | Perplexity, ChatGPT Search | LLM-based snippet extraction with citations |
| **AI Agents** | Claude computer use, ChatGPT browsing | Full visual page via screenshots |

### AI Crawlers (Training & Indexing)

Traditional AI crawlers retrieve static HTML for model training or index building. They do **not** execute JavaScript [^salt-agency] [^bluetick]:

| Crawler | Behavior |
|---------|----------|
| **GPTBot** (OpenAI) | "Simplified text extraction" - no DOM rendering |
| **ClaudeBot** (Anthropic) | "Text-based parsing" - static HTML only |
| **PerplexityBot** | "HTML snapshots" - no JavaScript execution |
| **CCBot** (Common Crawl) | Static HTML crawling |

These crawlers use proprietary extraction algorithms, likely similar to [[mozilla-readability]]-style scoring, to identify "main content" and discard navigation, ads, and boilerplate [^links-stream].

### AI Answer Engines (Perplexity, ChatGPT Search)

Answer engines work differently. Rather than extracting "the article," they use **LLM-based snippet extraction** [^frugal-testing]:

1. Hybrid retrieval pipelines combine lexical methods with semantic indexing
2. LLMs identify "sentences or paragraphs that best match each part of the question"
3. Extracted snippets are fed to the LLM for answer generation
4. Citations link back to source pages

This means Perplexity doesn't use Readability-style extraction — it extracts **relevant paragraphs** based on query relevance, which may come from anywhere on the page [^perplexity-help].

### AI Agents (Computer Use, Browser Extensions)

AI agents with browsing capabilities see the **full visual page** via screenshots [^anthropic-computer-use]:

- Claude computer use analyzes screenshots and controls mouse/keyboard
- Claude for Chrome can "see the content of your active browser tab"
- ChatGPT browsing operates similarly

These agents see everything a human sees: navigation, headers, footers, and all visual elements.

## Implications for Content Visibility

| Content type | Crawlers | Answer engines | AI agents |
|--------------|----------|----------------|-----------|
| Main article text | ✅ Extracted | ✅ Cited if relevant | ✅ Visible |
| Navigation menus | ❌ Ignored | ⚠️ May be cited if relevant | ✅ Visible |
| JavaScript-rendered | ❌ Invisible | ❌ Invisible | ✅ Visible (rendered) |
| Internal links | ❌ Not in output | ✅ Used for crawling | ✅ Clickable |
| Structured data | ❌ Not used | ⚠️ May inform answers | ❌ Not directly visible |

## Timeout and Performance Thresholds

AI companies do not publish official timeout specifications. However, observational research suggests [^amicited-ttfb]:

| Metric | Threshold | Implication |
|--------|-----------|-------------|
| TTFB | < 200ms | Optimal for AI crawler ingestion |
| TTFB | 500-1000ms | 40-60% reduction in AI visibility |
| Page load | 5-10 seconds | General timeout window before abandonment |

### Performance Recommendations

- **TTFB under 200ms** has emerged as a practical benchmark for AI crawler success
- Sites with consistent sub-200ms TTFB report 3-5x higher visibility in AI-generated content
- Client-side rendering adds 500ms to 2+ seconds, risking timeout before content is accessible

Note: These thresholds are derived from observational patterns, not published specifications from AI platforms.

## No JavaScript Rendering (Crawlers Only)

For AI crawlers specifically, JavaScript is a hard barrier:

- Client-side rendered content is **invisible** to AI crawlers
- SPAs (Single Page Applications) may appear empty
- Dynamic content loaded via JavaScript is not captured
- React, Vue, and Angular apps need SSR/SSG for AI visibility

## Implications for Developers

### Content Must Be in Static HTML

If you want AI systems to access your content:

```html
<!-- Good: Content in static HTML -->
<article>
  <h1>Article Title</h1>
  <p>Your content here...</p>
</article>

<!-- Bad: Content loaded by JavaScript -->
<div id="app"></div>
<script>loadContent()</script>
```

### Recommended Approaches

| Approach | Description |
|----------|-------------|
| **SSR** (Server-Side Rendering) | Render on server, send complete HTML |
| **SSG** (Static Site Generation) | Pre-build HTML at deploy time |
| **Hybrid** | SSR for critical content, client-side for interactions |

Frameworks like Next.js, Nuxt, and Astro make SSR/SSG straightforward.

### Don't Rely on JavaScript for Primary Content

- Navigation and interactivity: JavaScript OK
- Main article content: Must be in static HTML
- Metadata: Must be in initial HTML response

## Controlling AI Crawler Access

### robots.txt

Block specific AI crawlers:

```
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /private/

User-agent: PerplexityBot
Disallow: /
```

### Known AI Crawler User Agents

| Bot | User Agent String | Purpose |
|-----|-------------------|---------|
| GPTBot | `GPTBot` | OpenAI model training |
| OAI-SearchBot | `OAI-SearchBot` | ChatGPT search functionality |
| ChatGPT-User | `ChatGPT-User` | User-initiated browsing |
| ClaudeBot | `ClaudeBot` | Anthropic model training |
| Claude-User | `Claude-User` | Real-time web access for Claude users |
| PerplexityBot | `PerplexityBot` | Perplexity search index |
| CCBot | `CCBot` | Common Crawl dataset |
| Google-Extended | `Google-Extended` | Google AI training (not Search) |

Note: OpenAI's OAI-SearchBot and GPTBot share information—if both are allowed, only one crawl may occur [^openai-crawlers].

## Crawler Traffic Trends (2024-2025)

According to Cloudflare's analysis [^cloudflare-2025]:

| Crawler | May 2024 | May 2025 | Change |
|---------|----------|----------|--------|
| GPTBot | 5% share | 30% share | +305% requests |
| ClaudeBot | 27% share | 21% share | -46% requests |
| PerplexityBot | 0.2% share | 0.2% share | +157,490% requests |
| ChatGPT-User | - | - | +2,825% requests |

GPTBot is now the most frequently blocked AI crawler (312 domains), yet also most explicitly allowed (61 domains).

## Answer Engine Optimization (AEO)

A growing field called "Answer Engine Optimization" focuses on visibility in AI answer engines like Perplexity [^seo-com]:

### Content Structure for AI Citation

- **Lead with the answer** — Start sections with direct answers; Perplexity extracts the most direct snippet it finds [^unusual-ai]
- **One idea per paragraph** — LLMs cite answers, not articles; self-contained blocks improve "chunking"
- **Question-driven headings** — AI extracts direct answers from question headings
- **Structured data** — Pages with comprehensive schema markup are ~33% more likely to be cited [^amsive]

### Internal Links Still Matter

Despite navigation being stripped from article extraction, internal links influence AI systems [^insidea]:

- Strategic internal linking creates semantic networks that help AI understand topical relationships
- Use descriptive, natural-language anchor text that reflects target questions
- Build "concept hubs" where related pages interlink on specific topics

### The llms.txt Standard

A proposed standard (llms.txt) allows sites to declare their most important content for AI systems [^llmstxt]. However, as of 2025, major AI crawlers (GPTBot, ClaudeBot, PerplexityBot) do not request this file [^longato].

## Comparison with Google

| Aspect | Google | AI Crawlers | AI Answer Engines |
|--------|--------|-------------|-------------------|
| JavaScript rendering | Yes (WRS) | No | No |
| Content extraction | Full DOM | Static HTML | LLM-based snippets |
| Rendering delay | Hours to days | N/A | N/A |
| Rich results | Yes (structured data) | No | No (but may inform answers) |
| robots.txt | Respected | Usually respected | Usually respected |
| Citation/attribution | No | No | Yes (inline citations) |

## Related Pages

- [[content-extraction]] - How content extraction algorithms work
- [[mozilla-readability]] - Algorithm many tools use for extraction
- [[reader-mode]] - Similar static-HTML parsing approach
- [[jina-reader]] - Extraction service with link summary options

## References

[^salt-agency]:
  - **Source**: Salt Agency
  - **Title**: "Making JavaScript websites AI and LLM crawler friendly"
  - **URL**: https://salt.agency/blog/ai-crawlers-javascript/
  - **Accessed**: 2026-02-03
  - **Supports**: AI crawler JavaScript limitations, SSR recommendations

[^bluetick]:
  - **Source**: BlueTick Consultants
  - **Title**: "Web crawler explained: GPTBot vs Googlebot JavaScript guide"
  - **URL**: https://www.bluetickconsultants.com/web-crawler-explained-gptbot-vs-googlebot-javascript-guide/
  - **Accessed**: 2026-02-03
  - **Supports**: GPTBot vs Googlebot comparison, JavaScript handling differences

[^links-stream]:
  - **Source**: Links-Stream
  - **Title**: "How LLM Crawlers Work: GPTBot, ClaudeBot, PerplexityBot, Google-Extended & CCBot"
  - **URL**: https://links-stream.com/blog/uncategorized-en/llm-crawlers-how-they-scan-sites/
  - **Accessed**: 2026-02-03
  - **Supports**: Crawler behavior descriptions, extraction focus on knowledge extraction

[^frugal-testing]:
  - **Source**: FrugalTesting
  - **Title**: "Behind Perplexity's Architecture: How AI Search Handles Real-Time Web Data"
  - **URL**: https://www.frugaltesting.com/blog/behind-perplexitys-architecture-how-ai-search-handles-real-time-web-data
  - **Accessed**: 2026-02-03
  - **Supports**: Perplexity's hybrid retrieval pipelines, LLM-based snippet extraction

[^perplexity-help]:
  - **Source**: Perplexity Help Center
  - **Title**: "How does Perplexity work?"
  - **URL**: https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work
  - **Accessed**: 2026-02-03
  - **Supports**: Citation-forward answer generation, snippet extraction

[^anthropic-computer-use]:
  - **Source**: Anthropic
  - **Title**: "Computer use tool"
  - **URL**: https://docs.anthropic.com/en/docs/build-with-claude/computer-use
  - **Accessed**: 2026-02-03
  - **Supports**: AI agents see full visual page via screenshots

[^seo-com]:
  - **Source**: SEO.com
  - **Title**: "What Is Answer Engine Optimization? The SEO's Guide to AEO"
  - **URL**: https://www.seo.com/ai/answer-engine-optimization/
  - **Accessed**: 2026-02-03
  - **Supports**: AEO definition, content structure recommendations

[^unusual-ai]:
  - **Source**: Unusual
  - **Title**: "Perplexity Platform Guide: Design for Citation-Forward Answers"
  - **URL**: https://www.unusual.ai/blog/perplexity-platform-guide-design-for-citation-forward-answers
  - **Accessed**: 2026-02-03
  - **Supports**: Lead with answer, snippet extraction behavior

[^amsive]:
  - **Source**: Amsive
  - **Title**: "Answer Engine Optimization (AEO): Your Complete Guide to AI Search Visibility"
  - **URL**: https://www.amsive.com/insights/seo/answer-engine-optimization-aeo-evolving-your-seo-strategy-in-the-age-of-ai-search/
  - **Accessed**: 2026-02-03
  - **Supports**: Structured data citation statistics

[^insidea]:
  - **Source**: INSIDEA
  - **Title**: "How Can Website Architecture Influence AI Answer Engine Rankings?"
  - **URL**: https://insidea.com/blog/seo/aeo/website-architecture-influence-ai-answer-engine-rankings/
  - **Accessed**: 2026-02-03
  - **Supports**: Internal linking for AI, semantic networks

[^llmstxt]:
  - **Source**: Bluehost
  - **Title**: "What Is llms.txt? How the New AI Standard Works (2025 Guide)"
  - **URL**: https://www.bluehost.com/blog/what-is-llms-txt/
  - **Accessed**: 2026-02-03
  - **Supports**: llms.txt standard description

[^longato]:
  - **Source**: Flavio Longato
  - **Title**: "LLMs.txt - Why Almost Every AI Crawler Ignores it as of August 2025"
  - **URL**: https://www.longato.ch/llms-recommendation-2025-august/
  - **Accessed**: 2026-02-03
  - **Supports**: Major crawlers don't request llms.txt

[^cloudflare-2025]:
  - **Source**: Cloudflare Blog
  - **Title**: "From Googlebot to GPTBot: who's crawling your site in 2025"
  - **URL**: https://blog.cloudflare.com/from-googlebot-to-gptbot-whos-crawling-your-site-in-2025/
  - **Accessed**: 2026-02-04
  - **Supports**: AI crawler traffic trends, market share changes, blocking statistics

[^amicited-ttfb]:
  - **Source**: Am I Cited
  - **Title**: "TTFB Under 200ms: Technical Thresholds for AI Crawler Success"
  - **URL**: https://www.amicited.com/blog/ttfb-200ms-ai-crawler-success/
  - **Accessed**: 2026-02-04
  - **Supports**: 200ms TTFB threshold, 5-10 second timeout windows, performance correlation data

[^openai-crawlers]:
  - **Source**: PPC Land
  - **Title**: "OpenAI revises ChatGPT crawler documentation with significant policy changes"
  - **URL**: https://ppc.land/openai-revises-chatgpt-crawler-documentation-with-significant-policy-changes/
  - **Accessed**: 2026-02-04
  - **Supports**: OAI-SearchBot and GPTBot information sharing, new crawler documentation
