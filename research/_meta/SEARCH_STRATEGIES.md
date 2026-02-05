# Search Strategies

Suggested sources, queries, and approaches for researching different topics.

---

## General Approach

1. **Start with official sources** - Company documentation, engineering blogs
2. **Check for recent updates** - Filter searches by date when relevant
3. **Verify with multiple sources** - Don't rely on a single blog post
4. **Note publication dates** - Information decays; older sources may be outdated
5. **Save URLs immediately** - Sources can disappear or change

---

## By Entity

### Google

**Primary Sources:**

- [Google Search Central](https://developers.google.com/search) - Official documentation
- [Google Search Central Blog](https://developers.google.com/search/blog) - Announcements and updates
- [web.dev](https://web.dev/) - Best practices (Google-affiliated)
- [Chrome Developers Blog](https://developer.chrome.com/blog) - Browser and DevTools

**Useful Queries:**

- `site:developers.google.com/search [topic]`
- `site:web.dev [topic]`
- `"googlebot" [topic]`
- `google "javascript rendering" seo`
- `google "structured data" [schema type]`

**Key People to Follow:**

- John Mueller (@JohnMu) - Search Advocate
- Martin Splitt (@g33konaut) - Developer Advocate
- Gary Illyes - Search team

### Anthropic / Claude

**Primary Sources:**

- [Anthropic Blog](https://www.anthropic.com/blog) - Company announcements
- [Claude Documentation](https://docs.anthropic.com/) - API and usage docs
- [Anthropic Research](https://www.anthropic.com/research) - Technical papers

**Useful Queries:**

- `site:anthropic.com [topic]`
- `"claudebot" crawler`
- `anthropic "web browsing" OR "web access"`
- `claude "tool use" web`

**Note:** Anthropic publishes less about crawler behavior than Google. Community observations may be the best source for some topics.

### OpenAI / ChatGPT

**Primary Sources:**

- [OpenAI Blog](https://openai.com/blog) - Announcements
- [OpenAI Documentation](https://platform.openai.com/docs) - API docs
- [OpenAI Help Center](https://help.openai.com/) - Usage guides

**Useful Queries:**

- `site:openai.com [topic]`
- `"gptbot" crawler robots.txt`
- `chatgpt "browse" OR "browsing" web`
- `openai "plugins" web access`

### Perplexity

**Primary Sources:**

- [Perplexity Blog](https://blog.perplexity.ai/) - Company blog
- [Perplexity Documentation](https://docs.perplexity.ai/) - API docs

**Useful Queries:**

- `site:perplexity.ai [topic]`
- `"perplexitybot" crawler`
- `perplexity "web search" how`

---

## By Topic

### Content Extraction / Readability

**Primary Sources:**

- [Mozilla Readability GitHub](https://github.com/mozilla/readability) - Source code and issues
- [Postlight Parser GitHub](https://github.com/postlight/parser) - Alternative extractor
- [Ctrl.blog Reading Mode series](https://www.ctrl.blog/entry/browser-reading-mode-content.html) - Deep analysis

**Useful Queries:**

- `mozilla readability algorithm`
- `"content extraction" html algorithm`
- `reader mode "main content" detection`
- `"text density" content extraction`
- `boilerplate removal html`

### Structured Data / Schema.org

**Primary Sources:**

- [Schema.org](https://schema.org/) - Vocabulary definitions
- [Google Structured Data Docs](https://developers.google.com/search/docs/appearance/structured-data)
- [JSON-LD Spec](https://www.w3.org/TR/json-ld11/)

**Useful Queries:**

- `site:schema.org [type]`
- `site:developers.google.com/search "structured data" [type]`
- `json-ld vs microdata`
- `"rich results" [schema type]`

### Accessibility

**Primary Sources:**

- [W3C WAI](https://www.w3.org/WAI/) - Standards and guidelines
- [MDN](https://developer.mozilla.org/) - Web development documentation
- [Deque University](https://dequeuniversity.com/) - axe-core documentation
- [WebAIM](https://webaim.org/) - Practical guidance
- [A11y Project](https://www.a11yproject.com/) - Community resources

**Useful Queries:**

- `site:w3.org/WAI [topic]`
- `wcag [criterion number]`
- `axe-core rule [rule-id]`
- `screen reader [element/pattern]`
- `accessibility tree [topic]`

### AI Crawlers (General)

**Useful Queries:**

- `ai crawler javascript rendering`
- `llm web scraping static html`
- `"does not execute javascript" crawler`
- `robots.txt ai crawlers 2024`
- `gptbot claudebot perplexitybot comparison`

**Useful Sources:**

- Technical SEO blogs (Ahrefs, Moz, Search Engine Journal)
- Web development publications (Smashing Magazine, CSS-Tricks)
- Developer communities (Dev.to, Hacker News discussions)

---

## Search Tips

### Date Filtering

For rapidly evolving topics, filter by recent dates:

- Google: Tools > Any time > Past year
- Add `2024` or `2025` to queries for recent content

### Finding Official Sources

- Use `site:` operator to search within official domains
- Look for `.dev`, `.io` domains from companies
- Check GitHub repos for authoritative information

### Handling Paywalled Content

- Check if there's a free version (many publications have both)
- Look for the same information in official docs
- Archive.org may have cached versions
- Don't cite content you can't verify

### Verifying Claims

- Cross-reference with multiple sources
- Prefer primary sources over secondary reporting
- Check publication dates - old information may be outdated
- Look at comments/replies for corrections

---

## Source Quality Checklist

Before using a source, consider:

- [ ] Is this the authoritative source on this topic?
- [ ] When was it published? Still relevant?
- [ ] Does the author have relevant expertise?
- [ ] Are claims specific and verifiable?
- [ ] Is there a potential conflict of interest?
- [ ] Can I access this source again in the future?

---

## Topics Needing Research

Areas where documentation is thin or sources are hard to find:

- How Claude's web features actually work internally
- Bing's rendering and indexing pipeline
- Mobile-specific crawler differences
- How social media platforms parse shared links
- Regional search engine behavior (Baidu, Yandex)

If you find good sources on these topics, they're especially valuable.
