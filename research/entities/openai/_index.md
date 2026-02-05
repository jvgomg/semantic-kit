---
title: "OpenAI"
lastVerified: 2026-02-04
lastUpdated: 2026-02-04
---

# OpenAI

OpenAI develops ChatGPT and the GPT family of large language models.

## Web Crawlers

OpenAI operates several web crawlers [^openai-bots]:

| Bot | Purpose | User Agent Token |
|-----|---------|------------------|
| **GPTBot** | Training data collection | `GPTBot` |
| **ChatGPT-User** | Real-time web access for ChatGPT users | `ChatGPT-User` |
| **OAI-SearchBot** | Search functionality | `OAI-SearchBot` |

GPTBot is one of the most active AI crawlers on the web, generating hundreds of millions of monthly requests. According to Cloudflare, GPTBot's market share among AI crawlers grew from 5% to 30% between May 2024 and May 2025 [^cloudflare-2025].

### Crawler Information Sharing

OAI-SearchBot and GPTBot share information with each other. If your site allows both bots, OpenAI may use results from just one crawl for both use cases to avoid duplicate crawling [^openai-crawler-update].

### Robots.txt

```
User-agent: GPTBot
Disallow: /
```

### JavaScript Rendering

GPTBot does **not** execute JavaScript. It only sees static HTML content.

See [[ai-crawler-behavior]] for details on how AI crawlers parse pages.

## Related Pages

- [[ai-crawler-behavior]] - How AI crawlers extract content
- [[content-extraction]] - Content extraction algorithms

## Official Resources

- [OpenAI](https://openai.com/) - Company website
- [OpenAI Platform](https://platform.openai.com/) - API documentation
- [OpenAI Crawlers](https://platform.openai.com/docs/bots) - Official crawler documentation

## References

[^openai-bots]:
  - **Source**: OpenAI
  - **Title**: "Overview of OpenAI Crawlers"
  - **URL**: https://platform.openai.com/docs/bots
  - **Accessed**: 2026-02-03
  - **Supports**: Crawler names, purposes, user agent tokens

[^cloudflare-2025]:
  - **Source**: Cloudflare Blog
  - **Title**: "From Googlebot to GPTBot: who's crawling your site in 2025"
  - **URL**: https://blog.cloudflare.com/from-googlebot-to-gptbot-whos-crawling-your-site-in-2025/
  - **Accessed**: 2026-02-04
  - **Supports**: GPTBot market share growth statistics

[^openai-crawler-update]:
  - **Source**: PPC Land
  - **Title**: "OpenAI revises ChatGPT crawler documentation with significant policy changes"
  - **URL**: https://ppc.land/openai-revises-chatgpt-crawler-documentation-with-significant-policy-changes/
  - **Accessed**: 2026-02-04
  - **Supports**: OAI-SearchBot and GPTBot information sharing
