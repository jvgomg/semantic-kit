---
title: "Streaming SSR and Hidden Content"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Streaming SSR and Hidden Content

How modern streaming SSR frameworks can hide content from AI crawlers and static HTML parsers.

## The Problem

Streaming SSR allows frameworks to send HTML to the browser in chunks, with placeholder content that gets replaced as more data becomes available. This improves perceived performance for users with JavaScript enabled, but can result in content being delivered in hidden elements that require JavaScript to reveal.

**Impact:** Content inside hidden streaming elements is invisible to:
- [[ai-crawler-behavior|AI crawlers]] (GPTBot, ClaudeBot, PerplexityBot)
- [[reader-mode|Browser reader modes]]
- Content extraction tools using [[mozilla-readability]]

## Frameworks Using Streaming SSR

| Framework | Streaming Feature |
|-----------|-------------------|
| **Next.js** | App Router with React Server Components |
| **Remix** | Deferred data loading |
| **Nuxt** | Streaming with Suspense |
| **SvelteKit** | Streaming responses |
| **SolidStart** | Streaming SSR |
| **Qwik** | Resumability / streaming |

## Next.js Detection

Next.js App Router uses a specific pattern for streaming content:

```html
<div hidden id="S:0">...streamed content...</div>
<div hidden id="S:1">...more content...</div>
```

These `<div hidden id="S:X">` elements contain content that JavaScript reveals after hydration. The pattern is consistent enough for reliable detection.

### Detection Confidence

| Signal | Confidence |
|--------|------------|
| Multiple `<div hidden id="S:X">` elements | High |
| Combined with `__next` markers | Very high |
| Single hidden element | Could be other frameworks |

## Other Framework Patterns

Other frameworks have less consistent patterns, making detection harder:

| Framework | Pattern | Detectability |
|-----------|---------|---------------|
| Next.js | `<div hidden id="S:X">` | High |
| Remix | Varies | Low |
| Nuxt | Varies | Low |
| SvelteKit | Varies | Low |

Generic hidden content detection (any substantial content in `hidden` or CSS-hidden elements) can catch these cases without framework identification.

## Severity Assessment

Hidden content severity based on percentage of total content:

| Hidden % | Severity | Implication |
|----------|----------|-------------|
| < 10% | Negligible | Minor content hidden (likely intentional) |
| 10-49% | Warning | Significant content may be missed |
| >= 50% | Critical | Most content invisible to static parsers |

## Solutions

### For Developers

If AI crawler visibility matters:

1. **Avoid streaming for critical content** - Use regular SSR for main article content
2. **Test with JavaScript disabled** - What you see is what crawlers see
3. **Use static generation where possible** - Content is always visible

### Detection in Tools

Content extraction tools should:
1. Check for hidden elements with substantial text content
2. Compare visible vs total content word counts
3. Identify framework-specific patterns when possible
4. Warn users about hidden content with severity level

## Related Pages

- [[ai-crawler-behavior]] - Why AI crawlers don't execute JavaScript
- [[content-extraction]] - How extraction algorithms work
- [[mozilla-readability]] - Extraction algorithm affected by hidden content

## References

[^nextjs-streaming]:
  - **Source**: Next.js Documentation
  - **Title**: "Loading UI and Streaming"
  - **URL**: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
  - **Accessed**: 2026-02-03
  - **Supports**: Next.js streaming SSR behavior

[^react-suspense]:
  - **Source**: React Documentation
  - **Title**: "Suspense for Data Fetching"
  - **URL**: https://react.dev/reference/react/Suspense
  - **Accessed**: 2026-02-03
  - **Supports**: React Suspense mechanism used by streaming SSR
