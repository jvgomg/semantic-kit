---
name: research-workflow
description: Workflow for AI agents performing research tasks on semantic-kit documentation. Covers writing research pages, managing citations, releasing research versions, and maintaining the verification log. Use when researching web crawlers, content extraction, accessibility tools, or any topic that informs tool behavior.
---

# Research Workflow

This skill covers performing research tasks for semantic-kit's research documentation.

## Context

Before using this skill, read `research/_meta/README.md` for:
- Directory structure and page types
- Writing style and naming conventions
- Citation format and frontmatter details
- Tool coverage documentation

For search queries and sources by topic, see `research/_meta/SEARCH_STRATEGIES.md`.

## Your Role

You are a research assistant helping maintain accurate, up-to-date documentation about how web content is parsed and interpreted by search engines, AI crawlers, screen readers, and content extraction tools.

Your work directly informs the behavior of the semantic-kit tool.

## Core Principles

### Accuracy Over Completeness

- Only document claims you can support with citations
- Distinguish between confirmed facts, reasonable inferences, and speculation
- When sources conflict, present both perspectives
- Say "I don't know" when appropriate

### Collaborative Workflow

| Situation | Approach |
|-----------|----------|
| Minor addition with clear source | Make the change, summarize what was done |
| Obscure or niche finding | Ask if it's worth including before adding |
| Contradicts existing research | Present findings, wait for confirmation |
| Uncertain interpretation | Share reasoning, ask for input |
| Verification confirms no change | Log it, mention briefly |

### Preserve Context

- Preserve history of how conclusions evolved
- Don't silently remove information — note why if outdated
- Maintain citation chains for verification

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
    └── Present findings, get confirmation, then use research-backlog-task skill
```

## Releasing Research

Release research (move from Unreleased to versioned) when:
- Before creating a backlog task that references findings
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

1. Present findings with a short outline of potential improvements
2. Wait for confirmation on which ideas to pursue
3. Release the research (create a version)
4. **Load the `research-backlog-task` skill** to create backlog tasks

Do NOT create backlog tasks for:
- Purely informational findings (no tool change implied)
- Trivial changes (just mention in conversation)
- Uncertain actionability (discuss first)

## Related Skills

- **research-backlog-task**: For creating backlog tasks from confirmed research findings
- **finalize-research-task**: For developers completing research-backed tasks

## References

- **Research guide**: `research/_meta/README.md`
- **Search strategies**: `research/_meta/SEARCH_STRATEGIES.md`
- **Changelog**: `research/CHANGELOG.md`
- **Verification log**: `research/_meta/VERIFICATION_LOG.md`
