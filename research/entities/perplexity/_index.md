---
title: "Perplexity"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Perplexity

Perplexity AI is an AI-powered search engine that provides real-time answers with citations.

## Web Crawlers

Perplexity operates two declared crawlers [^perplexity-bots]:

| Bot | Purpose | User Agent Token |
|-----|---------|------------------|
| **PerplexityBot** | Search index crawling | `PerplexityBot` |
| **Perplexity-User** | Real-time web access for users | `Perplexity-User` |

### Robots.txt

```
User-agent: PerplexityBot
Disallow: /
```

Perplexity states that blocked pages will not have full content indexed, but domain, headline, and brief summaries may still appear.

### IP Verification

Official IP ranges are published at:
- `https://www.perplexity.ai/perplexitybot.json`
- `https://www.perplexity.ai/perplexity-user.json`

### JavaScript Rendering

PerplexityBot does **not** execute JavaScript. It only sees static HTML content.

See [[ai-crawler-behavior]] for details on how AI crawlers parse pages.

## Related Pages

- [[ai-crawler-behavior]] - How AI crawlers extract content
- [[content-extraction]] - Content extraction algorithms

## Official Resources

- [Perplexity AI](https://www.perplexity.ai/) - Search engine
- [Perplexity Documentation](https://docs.perplexity.ai/) - API documentation
- [Perplexity Crawlers](https://docs.perplexity.ai/guides/bots) - Official crawler documentation

## References

[^perplexity-bots]:
  - **Source**: Perplexity
  - **Title**: "Perplexity Crawlers"
  - **URL**: https://docs.perplexity.ai/guides/bots
  - **Accessed**: 2026-02-03
  - **Supports**: Crawler names, robots.txt handling, IP verification
