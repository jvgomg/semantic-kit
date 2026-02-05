---
title: "Googlebot"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Googlebot

Googlebot is Google's web crawler that discovers and indexes content for Google Search.

## User Agent Tokens

Google operates multiple crawlers with different user agent tokens [^google-crawlers]:

| Crawler | Token | Purpose |
|---------|-------|---------|
| Googlebot | `Googlebot` | Web search indexing |
| Googlebot-Image | `Googlebot-Image` | Image search |
| Googlebot-News | `Googlebot-News` | News indexing |
| Googlebot-Video | `Googlebot-Video` | Video search |
| Google-Extended | `Google-Extended` | AI training (Bard, Vertex AI) |

### Sample User Agent String

```
Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)
```

## Verification

Unlike AI crawlers, Googlebot can be verified via reverse DNS lookup:

1. Perform a reverse DNS lookup on the IP address
2. Verify the hostname ends in `googlebot.com` or `google.com`
3. Perform a forward DNS lookup to confirm the IP matches

Google publishes IP ranges in `googlebot.json`, updated daily.

## Robots.txt

```
User-agent: Googlebot
Disallow: /private/

# Block AI training while allowing search
User-agent: Google-Extended
Disallow: /
```

The wildcard `*` matches all crawlers except AdsBot, which must be named explicitly.

## JavaScript Rendering

Unlike most crawlers, Googlebot **does** execute JavaScript using the Web Rendering Service (WRS).

See [[google-javascript-rendering]] for details on how Google renders JavaScript content.

## Related Pages

- [[google]] - Google ecosystem overview
- [[google-javascript-rendering]] - JavaScript rendering details
- [[google-structured-data]] - Structured data requirements
- [[ai-crawler-behavior]] - How AI crawlers differ from Googlebot

## Official Resources

- [Google's Common Crawlers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)
- [Verifying Googlebot](https://developers.google.com/search/docs/crawling-indexing/verifying-googlebot)
- [robots.txt Specification](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec)

## References

[^google-crawlers]:
  - **Source**: Google Developers
  - **Title**: "Google's common crawlers"
  - **URL**: https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
  - **Accessed**: 2026-02-03
  - **Supports**: Crawler types, user agent tokens, verification methods
