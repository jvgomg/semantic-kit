---
title: "Web Crawlers Reference"
lastVerified: 2026-02-04
lastUpdated: 2026-02-04
---

# Web Crawlers Reference

A comprehensive reference of web crawlers, their JavaScript rendering capabilities, and behavior.

## Crawler Categories

| Category | Purpose | JavaScript Rendering |
|----------|---------|---------------------|
| **Search Engine Crawlers** | Index content for search results | Varies (Google yes, most others no) |
| **AI Training Crawlers** | Collect data for LLM training | No |
| **AI Search Crawlers** | Power AI answer engines | No |
| **AI User Agents** | Real-time browsing for AI assistants | Varies |
| **Social Media Crawlers** | Generate link previews | No |
| **SEO Tool Crawlers** | Audit and analyze websites | Yes (optional) |

## Search Engine Crawlers

### Google (Full JavaScript Rendering)

Google is the **only major search engine** that reliably renders JavaScript [^dev-to-js].

| Crawler | User Agent Token | Purpose |
|---------|------------------|---------|
| Googlebot | `Googlebot` | Web search indexing |
| Googlebot-Image | `Googlebot-Image` | Image search |
| Googlebot-News | `Googlebot-News` | News indexing |
| Googlebot-Video | `Googlebot-Video` | Video search |
| Google-Extended | `Google-Extended` | AI training (Gemini) |
| Google-InspectionTool | `Google-InspectionTool` | Search Console testing |

**Rendering behavior:**
- Uses headless Chrome (Web Rendering Service)
- "Evergreen" - always uses latest stable Chrome version
- Two-wave indexing: HTML first, then JavaScript rendering
- Median rendering delay: ~5 seconds (not a timeout, just queue time) [^onely-5sec]
- No fixed timeout - stops when "event loop is empty" [^seroundtable-timeout]

### Bing (Limited JavaScript Rendering)

Bingbot uses Microsoft Edge (Chromium-based) but has significant limitations at scale [^bing-js].

| Crawler | User Agent Token | Purpose |
|---------|------------------|---------|
| Bingbot | `bingbot` | Web search indexing |
| MSNBot | `msnbot` | Legacy crawler |

**Rendering behavior:**
- Can render JavaScript in theory
- Practical limitations at scale
- Bing officially recommends dynamic rendering for JS-heavy sites
- Testing shows JavaScript changes often don't appear in indexed content [^screaming-frog-bing]

### Other Search Engines (No JavaScript Rendering)

These search engines do **not** render JavaScript [^dev-to-js]:

| Crawler | User Agent Token | Notes |
|---------|------------------|-------|
| Yahoo Slurp | `Slurp` | Cannot render JavaScript at all |
| YandexBot | `YandexBot` | Does not render JavaScript |
| DuckDuckBot | `DuckDuckBot` | JavaScript-blind |
| Baiduspider | `Baiduspider` | Limited documentation |

## AI Training Crawlers

These crawlers collect data for training large language models. **None render JavaScript** [^sej-ai-crawlers].

| Crawler | Company | User Agent Token |
|---------|---------|------------------|
| GPTBot | OpenAI | `GPTBot` |
| ClaudeBot | Anthropic | `ClaudeBot` |
| CCBot | Common Crawl | `CCBot` |
| Bytespider | ByteDance | `Bytespider` |
| Meta-ExternalAgent | Meta | `Meta-ExternalAgent` |
| Amazonbot | Amazon | `Amazonbot` |
| Diffbot | Diffbot | `Diffbot` |

### Full User Agent Strings

```
# GPTBot
Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.3; +https://openai.com/gptbot)

# ClaudeBot
Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)

# CCBot
CCBot/2.0 (https://commoncrawl.org/faq/)
```

## AI Search & User Crawlers

These power AI answer engines and real-time browsing. **None render JavaScript**.

| Crawler | Company | User Agent Token | Purpose |
|---------|---------|------------------|---------|
| OAI-SearchBot | OpenAI | `OAI-SearchBot` | ChatGPT search |
| ChatGPT-User | OpenAI | `ChatGPT-User` | User-initiated browsing |
| Claude-User | Anthropic | `Claude-User` | Real-time web access |
| PerplexityBot | Perplexity | `PerplexityBot` | AI search index |
| DuckAssistBot | DuckDuckGo | `DuckAssistBot` | AI search features |
| Gemini-Deep-Research | Google | `Gemini-Deep-Research` | Gemini research |

Note: OAI-SearchBot and GPTBot share crawl data - if both are allowed, only one crawl may occur [^ppc-land-openai].

## Social Media Crawlers

Social platforms use crawlers to generate link previews. **None render JavaScript** [^prerender-og].

| Crawler | Platform | User Agent Token |
|---------|----------|------------------|
| facebookexternalhit | Facebook/Meta | `facebookexternalhit` |
| Twitterbot | Twitter/X | `Twitterbot` |
| LinkedInBot | LinkedIn | `LinkedInBot` |
| Pinterest | Pinterest | `Pinterest` |
| Slackbot | Slack | `Slackbot` |
| Discordbot | Discord | `Discordbot` |
| WhatsApp | WhatsApp | `WhatsApp` |
| TelegramBot | Telegram | `TelegramBot` |

**Impact:** Open Graph tags must be in static HTML. Client-side rendered OG tags will not be read.

## SEO Tool Crawlers

These tools can optionally render JavaScript using headless browsers.

| Tool | User Agent | JavaScript Rendering |
|------|------------|---------------------|
| Screaming Frog | `Screaming Frog SEO Spider` | Yes (Chromium) |
| Ahrefs | `AhrefsBot` | Limited |
| Semrush | `SemrushBot` | Limited |
| Moz | `rogerbot` | Limited |

## Agentic Browsers (Undetectable)

Modern AI agents often use standard browser user agents and are **not identifiable** in server logs [^sej-ai-crawlers]:

- Google Mariner (DeepMind)
- Perplexity Comet
- ChatGPT Atlas
- Claude computer use

These appear as normal Chrome/Chromium traffic.

## JavaScript Rendering Summary

| Category | Renders JavaScript | Notes |
|----------|-------------------|-------|
| **Google** | Yes | Full rendering, evergreen Chrome |
| **Bing** | Partial | Limitations at scale, recommends SSR |
| **Other search engines** | No | Yahoo, Yandex, DuckDuckGo, Baidu |
| **AI training crawlers** | No | GPTBot, ClaudeBot, CCBot, etc. |
| **AI search crawlers** | No | PerplexityBot, OAI-SearchBot, etc. |
| **Social media** | No | All platforms |
| **SEO tools** | Optional | Screaming Frog has full support |
| **AI agents** | Yes | Use real browsers |

## Timeout Considerations

### Google WRS

- No fixed timeout [^seroundtable-timeout]
- Rendering stops when "event loop is empty"
- Median time in render queue: ~5 seconds [^onely-5sec]
- Complex scripts may timeout before completing
- 30-day caching for JavaScript resources

### Simulating Rendered Content

When simulating what Google sees, Playwright's `networkidle` wait strategy is commonly used but has limitations [^playwright-networkidle]:

- Waits for no network activity for 500ms
- Can hang on pages with continuous polling/analytics
- Default timeout: 30 seconds
- For SEO simulation, 5-10 seconds is typically sufficient

### Recommendations

For the crawler command:
- **5000ms default** is reasonable for most sites
- Matches the median Google rendering time
- Users can increase for complex SPAs
- `networkidle` is appropriate for simulating search engine rendering

## Related Pages

- [[ai-crawler-behavior]] - Detailed AI crawler behavior
- [[googlebot]] - Google crawler specifics
- [[streaming-ssr]] - Hidden content in streaming frameworks

## References

[^dev-to-js]:
  - **Source**: DEV Community
  - **Title**: "How search engines & social media crawlers render JavaScript"
  - **URL**: https://dev.to/rachellcostello/how-search-engines-social-media-crawlers-render-javascript-438e
  - **Accessed**: 2026-02-04
  - **Supports**: JavaScript rendering capabilities by platform

[^onely-5sec]:
  - **Source**: Onely
  - **Title**: "Google's Rendering Delay is Now 5 Seconds BUT..."
  - **URL**: https://www.onely.com/blog/googles-rendering-delay-5-seconds/
  - **Accessed**: 2026-02-04
  - **Supports**: 5-second median is queue time, not timeout

[^seroundtable-timeout]:
  - **Source**: Search Engine Roundtable
  - **Title**: "Google Says There Is No Fixed Waiting Period For JavaScript Page Rendering"
  - **URL**: https://www.seroundtable.com/google-page-rendering-25797.html
  - **Accessed**: 2026-02-04
  - **Supports**: No fixed timeout, stops when event loop empty

[^bing-js]:
  - **Source**: Bing Webmaster Blog
  - **Title**: "bingbot Series: JavaScript, Dynamic Rendering, and Cloaking"
  - **URL**: https://blogs.bing.com/webmaster/october-2018/bingbot-Series-JavaScript,-Dynamic-Rendering,-and-Cloaking-Oh-My
  - **Accessed**: 2026-02-04
  - **Supports**: Bing's JavaScript limitations and SSR recommendation

[^screaming-frog-bing]:
  - **Source**: Screaming Frog
  - **Title**: "Is Bing Really Rendering & Indexing JavaScript?"
  - **URL**: https://www.screamingfrog.co.uk/blog/bing-javascript/
  - **Accessed**: 2026-02-04
  - **Supports**: Testing showing Bing's JS rendering limitations

[^sej-ai-crawlers]:
  - **Source**: Search Engine Journal
  - **Title**: "Complete Crawler List For AI User-Agents"
  - **URL**: https://www.searchenginejournal.com/ai-crawler-user-agents-list/558130/
  - **Accessed**: 2026-02-04
  - **Supports**: Complete AI crawler list, user agents, agentic browsers

[^prerender-og]:
  - **Source**: Prerender.io
  - **Title**: "How to Fix Your Social Sharing Link Previews"
  - **URL**: https://prerender.io/blog/how-to-fix-link-previews/
  - **Accessed**: 2026-02-04
  - **Supports**: Social crawlers don't render JavaScript

[^ppc-land-openai]:
  - **Source**: PPC Land
  - **Title**: "OpenAI revises ChatGPT crawler documentation with significant policy changes"
  - **URL**: https://ppc.land/openai-revises-chatgpt-crawler-documentation-with-significant-policy-changes/
  - **Accessed**: 2026-02-04
  - **Supports**: OAI-SearchBot and GPTBot information sharing

[^playwright-networkidle]:
  - **Source**: Checkly
  - **Title**: "Dealing with waits and timeouts in Playwright"
  - **URL**: https://www.checklyhq.com/docs/learn/playwright/waits-and-timeouts/
  - **Accessed**: 2026-02-04
  - **Supports**: networkidle behavior, timeout recommendations
