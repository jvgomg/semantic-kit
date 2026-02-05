---
title: "Anthropic"
lastVerified: 2026-02-04
lastUpdated: 2026-02-04
---

# Anthropic

Anthropic is an AI safety company that builds Claude, a family of AI assistants.

## Web Crawlers

Anthropic operates several web crawlers [^anthropic-crawler]:

| Bot | Purpose | User Agent Token |
|-----|---------|------------------|
| **ClaudeBot** | Training data collection | `ClaudeBot` |
| **Claude-User** | Real-time web access for Claude users | `Claude-User` |
| **Claude-SearchBot** | Search index for improving results | `Claude-SearchBot` |

ClaudeBot respects `robots.txt` directives and supports the non-standard `Crawl-delay` directive.

### Traffic Trends

According to Cloudflare, ClaudeBot's share of AI crawler traffic decreased from 27% to 21% between May 2024 and May 2025, with total requests falling 46% [^cloudflare-2025]. Note: The older `anthropic-ai` and `claude-web` user agents are deprecated.

### Deprecated User Agents

Anthropic deprecated the `anthropic-ai` and `claude-web` user agents in July 2024 in favor of ClaudeBot. Traffic using older strings is likely legacy or spoofed.

### Robots.txt

```
User-agent: ClaudeBot
Disallow: /
```

### JavaScript Rendering

ClaudeBot does **not** execute JavaScript. It only sees static HTML content.

See [[ai-crawler-behavior]] for details on how AI crawlers parse pages.

## Related Pages

- [[ai-crawler-behavior]] - How AI crawlers extract content
- [[content-extraction]] - Content extraction algorithms

## Official Resources

- [Anthropic](https://www.anthropic.com/) - Company website
- [Claude Documentation](https://docs.anthropic.com/) - API documentation
- [Crawler FAQ](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) - Official crawler documentation

## References

[^anthropic-crawler]:
  - **Source**: Anthropic Help Center
  - **Title**: "Does Anthropic crawl data from the web?"
  - **URL**: https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
  - **Accessed**: 2026-02-03
  - **Supports**: Crawler names, robots.txt compliance, user agent information

[^cloudflare-2025]:
  - **Source**: Cloudflare Blog
  - **Title**: "From Googlebot to GPTBot: who's crawling your site in 2025"
  - **URL**: https://blog.cloudflare.com/from-googlebot-to-gptbot-whos-crawling-your-site-in-2025/
  - **Accessed**: 2026-02-04
  - **Supports**: ClaudeBot traffic trends, deprecated user agents
