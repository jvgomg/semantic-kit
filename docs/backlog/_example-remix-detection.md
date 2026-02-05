# Example Backlog Request

_This is an example file showing what a completed backlog request looks like. It demonstrates the template in use. Delete this file or keep it as reference._

---

```yaml
# Metadata
researchVersion: research-v0.1.0
toolVersion: null
status: pending
created: 2026-02-03
```

# Add Remix Streaming Detection to AI Command

## Research Context

**Source:** [[streaming-ssr]]

**Finding:**
While documenting streaming SSR patterns, I found that Remix uses a different streaming approach than Next.js. The current `ai` command only detects Next.js streaming patterns (looking for `__next` markers and specific template structures). Remix uses `<script>` tags with `__remixContext` and deferred data resolved via `<Await>` components that may not be present in the initial HTML.

This means the `ai` command's hidden content detection may miss Remix-specific streaming content, giving developers incomplete information about what AI crawlers see.

**Citations:**

- [^remix-streaming]: Remix documentation on streaming - describes the deferred data pattern
- [^salt-ai-crawlers]: Salt Agency article confirming AI crawlers don't execute JavaScript

---

## Proposed Change

**Affected command(s):** `ai`

**What should change:**
The `ai` command should detect Remix streaming patterns in addition to Next.js patterns. When Remix streaming markers are found, it should:
1. Warn that the page uses Remix streaming SSR
2. Attempt to identify deferred content that won't be visible to AI crawlers
3. Show the hidden content ratio similar to Next.js detection

**Example output:**
```
Hidden Content Analysis
  Framework: Remix (streaming SSR detected)
  Visible words: 450
  Hidden words: ~120 (estimated from deferred boundaries)
  Hidden ratio: 21% (low severity)

  Warning: Remix deferred content won't be visible to AI crawlers.
  Consider using `loader` instead of `defer` for SEO-critical content.
```

---

## Implementation Approach

**Key files likely involved:**
- `src/commands/ai.ts` - Add Remix to framework detection switch
- `src/lib/framework-detection.ts` (if extracted) - Add Remix detector

**Approach:**
1. Look at the existing Next.js detection pattern in `ai.ts`
2. Add a similar detector for Remix that looks for:
   - `window.__remixContext` in script tags
   - `data-remix-` attributes on elements
   - Deferred data script patterns
3. Estimate hidden content by identifying `<Await>` fallback boundaries
4. Follow the same severity classification (low/high based on percentage)

**Considerations:**
- Remix detection should not conflict with Next.js detection
- Some sites may use both frameworks (unlikely but possible)
- Deferred content estimation is less precise than Next.js template analysis

---

## Acceptance Criteria

- [ ] `ai` command detects Remix streaming patterns
- [ ] Warning message mentions Remix specifically
- [ ] Hidden content ratio calculated for Remix sites
- [ ] Existing Next.js detection unchanged
- [ ] Research page [[streaming-ssr]] updated:
  - [ ] `toolCoverage` entry added to frontmatter (required)
  - [ ] Inline callout updated if editorially appropriate (this is a new framework, so yes)
- [ ] CHANGELOG entry references [[streaming-ssr]], research-v0.1.0

---

## Notes

This is a lower priority than other improvements since Remix has smaller market share than Next.js. Consider implementing after other framework detectors (Nuxt, SvelteKit) are scoped.
