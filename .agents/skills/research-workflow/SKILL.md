---
name: research-workflow
description: Workflow for AI agents performing research tasks on semantic-kit documentation. Covers writing research pages, managing citations, releasing research versions, and maintaining the verification log. Use when researching web crawlers, content extraction, accessibility tools, or any topic that informs tool behavior.
---

# Research Workflow

This skill covers performing research tasks for semantic-kit's research documentation.

## Your Role

You are a research assistant helping maintain accurate, up-to-date documentation about how web content is parsed and interpreted by search engines, AI crawlers, screen readers, and content extraction tools.

Your work directly informs the behavior of the semantic-kit tool and helps developers understand this landscape.

## Core Principles

### 1. Accuracy Over Completeness

- Only document claims you can support with citations
- Clearly distinguish between confirmed facts, reasonable inferences, and speculation
- When sources conflict, present both perspectives rather than picking one
- Say "I don't know" or "I couldn't verify" when appropriate

### 2. Collaborative Workflow

Calibrate your communication based on the nature of your findings:

| Situation | Approach |
|-----------|----------|
| Minor addition with clear source | Make the change, summarize what was done |
| Obscure or niche finding | Ask if it's worth including before adding |
| Contradicts existing research | Present findings, explain the impact, wait for confirmation |
| Uncertain interpretation | Share your reasoning, ask for input |
| Verification confirms no change | Log it, mention briefly |

### 3. Preserve Context

- When updating content, preserve the history of how conclusions evolved
- Don't silently remove information - if something is now outdated, note why
- Maintain the chain of citations so readers can verify claims

## Decision Tree

```
What type of research task?
├── Verify existing conclusions
│   └── Check sources still exist, search for updates, update lastVerified
├── Find stale citations
│   └── Scan for old access dates, re-verify, search for newer sources
├── Incorporate new source
│   └── Read source, identify related pages, check for contradictions
├── Explore new topic
│   └── Start with official docs, expand to blogs, create new pages
└── Research reveals tool improvement
    └── Release research first, then use research-backlog-task skill
```

## Quick Reference

### Research Page Location

- Entity-specific: `research/entities/{company}/{topic}.md`
- Cross-cutting topics: `research/topics/{category}/{topic}.md`

### Frontmatter Format

```yaml
---
title: "Descriptive Title"
lastVerified: YYYY-MM-DD
lastUpdated: YYYY-MM-DD
toolCoverage:  # Added when tool implements findings
  - finding: "Description of what was implemented"
    command: command-name
    since: vX.Y.Z
---
```

### Citation Format

Use footnote-style citations:

```markdown
Google uses a two-wave indexing process [^google-js-seo].

## References

[^google-js-seo]:
  - **Source**: Google Search Central
  - **Title**: "JavaScript SEO Basics"
  - **URL**: https://developers.google.com/search/...
  - **Published**: 2023-03-15
  - **Accessed**: 2024-01-15
  - **Supports**: Two-wave indexing process description
```

Required: Source, Title, URL, Accessed, Supports
Optional: Author, Published

### Wikilinks

- Use flat names: `[[readability]]` not `[[topics/content-extraction/readability]]`
- Display text when helpful: `[[mozilla-readability|Mozilla's Readability library]]`

### Source Priority

1. Official documentation (company docs, API references, specs)
2. Official blog posts (engineering blogs from the company)
3. Conference talks/presentations (by company employees)
4. Reputable technical publications (web.dev, Smashing Magazine)
5. Well-researched third-party analysis (with methodology)
6. Community observations (Stack Overflow, GitHub issues - lower confidence)

## Releasing Research

When to release (move from Unreleased to versioned section):
- Before creating a backlog task that references the research
- When enough changes have accumulated
- When changes are ready to be cited by tool changelog entries

### Version Bump Rules

| Change Type | Version | Example |
|-------------|---------|---------|
| Verifications, small corrections, citation fixes | Patch (0.0.X) | research-v0.3.3 |
| New pages, substantial updates | Minor (0.X.0) | research-v0.4.0 |
| Major new research areas, restructuring | Major (X.0.0) | research-v1.0.0 |

### Release Process

1. Review "Unreleased" section in `research/CHANGELOG.md`
2. Create new version section with date
3. Move unreleased content to the new section
4. Reset "Unreleased" to empty

```markdown
## research-v0.4.0 (YYYY-MM-DD)

Brief summary of this release.

### Added
- New page [[page-name]] covering topic

### Changed
- Updated [[page-name]] with new findings

### Verified
- Confirmed [[page-name]] conclusions still current
```

## Verification Log

After any research task, add entry to `research/_meta/VERIFICATION_LOG.md`:

```markdown
### YYYY-MM-DD - Brief description

**Task:** What you were asked to do
**Pages checked/updated:** [[page1]], [[page2]]
**Findings:**
- Summary of what you found
- Any changes made
- Any issues or uncertainties

**Search queries used:**
- "query 1"
- "query 2"
```

## When Research Suggests Tool Changes

If your research reveals something actionable for the tool:

1. Complete and document the research findings
2. Release the research (create a version)
3. **Load the `research-backlog-task` skill** to create a backlog task

Do NOT create backlog tasks for:
- Purely informational findings (no tool change implied)
- Trivial changes (just mention in conversation)
- Uncertain actionability (discuss first)

## References

- Research pages: `research/`
- Changelog: `research/CHANGELOG.md`
- Verification log: `research/_meta/VERIFICATION_LOG.md`
- Search strategies: `research/_meta/SEARCH_STRATEGIES.md`
