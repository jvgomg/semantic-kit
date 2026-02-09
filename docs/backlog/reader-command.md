```yaml
# Metadata (keep at top of file)
researchVersion: research-v0.3.0
toolVersion: null
status: migrated
created: 2026-02-04
migratedTo: backlog/tasks/task-016
migratedDate: 2026-02-09
```

# Add `reader` command for Readability preview and analysis

## Research Context

**Source:** [[readability]], [[mozilla-readability]], [[reader-mode]], [[apple]]

**Finding:**
The tool currently lacks a dedicated command for previewing how browser reader modes extract and display content. Research revealed that Mozilla Readability and Apple's Safari Reader use significantly different algorithms — Apple's codebase is 2x larger, uses visual positioning, Levenshtein distance for title matching, and has different scoring heuristics.

Developers need to understand:
1. What content will be extracted by reader modes
2. How their pages score under different algorithms
3. Whether their pages meet triggering thresholds
4. What metadata (title, author, date) will be extracted

**Citations:**

- [^mozilla-readability-repo]: Mozilla Readability algorithm and configuration options
- [^safari-readability-repo]: Safari Reader source code (iOS 17.2) revealing algorithm details
- [^ctrl-blog-content]: Comparison of Mozilla vs Apple Readability implementations
- [^mathias-safari-reader]: Safari Reader triggering requirements

---

## Proposed Change

**Affected command(s):** New `reader` command

**What should change:**
Add a new `reader` command that:

1. **Extracts content** using Mozilla Readability (the available open-source implementation)
2. **Shows extraction results** — title, byline, excerpt, content preview, length
3. **Reports Mozilla heuristics** — character count, paragraph count, link density
4. **Reports Apple/Safari heuristics** — comma count, estimated Safari compatibility, element count in wrapper
5. **Shows what triggered** — whether the page meets thresholds for reader mode activation

This gives developers a comprehensive view of how reader modes interpret their content.

**Example output (if applicable):**
```
Reader Analysis: https://example.com/article

## Extraction Results

Title:       "How to Build Better Websites"
Byline:      "Jane Smith"
Excerpt:     "A comprehensive guide to modern web development..."
Length:      4,523 characters
Site Name:   Example Blog

## Content Preview

# How to Build Better Websites

A comprehensive guide to modern web development...

[Content truncated - use --full to see complete extraction]

## Mozilla Readability Metrics

Paragraph count:     23
Character count:     4,523
Link density:        0.12 (low - good)
Top candidate score: 847

## Safari Reader Compatibility

Character count:     4,523  ✓ (min: 350-400)
Comma count:         67     ✓ (min: 10)
Child elements:      28     ✓ (min: 5)
Container element:   <article>  ✓ (not <p>)

Safari Reader:       LIKELY TO TRIGGER
```

JSON output would include all metrics as structured data.

---

## Implementation Approach

**Key files likely involved:**
- `src/commands/reader.ts` (new) - Main command implementation
- `src/lib/readability.ts` (new or existing) - Readability wrapper and analysis
- `src/lib/safari-heuristics.ts` (new) - Safari-specific checks

**Approach:**

1. **Use Mozilla Readability** — Already a dependency for the `ai` command. Use it for content extraction.

2. **Add pre-extraction analysis** — Before running Readability, analyze the DOM for:
   - Character count in likely content areas
   - Comma frequency
   - Child element count in content wrappers
   - Container element types

3. **Add post-extraction metrics** — After Readability runs, report:
   - What was extracted (title, byline, excerpt, content length)
   - Readability's internal scoring (if accessible)
   - Link density in extracted content

4. **Safari compatibility scoring** — Implement checks based on research:
   - `checkCharacterCount(doc)` — >= 350 characters
   - `checkCommaCount(doc)` — >= 10 commas
   - `checkChildElements(doc)` — >= 5 children in wrapper
   - `checkContainerType(doc)` — not `<p>` alone

5. **Output formats** — Support full, compact, JSON, and TUI modes following existing patterns.

**Considerations:**
- Mozilla Readability is the only available implementation; Safari's algorithm can only be approximated
- The `ai` command already uses Readability — share extraction code but keep commands separate (different purposes)
- Consider adding `--full` flag to show complete extracted content vs truncated preview
- Consider `--json` for CI/automated checking

---

## Acceptance Criteria

- [ ] `reader` command extracts content using Mozilla Readability
- [ ] Output shows extracted title, byline, excerpt, and content length
- [ ] Output shows Mozilla Readability metrics (paragraph count, character count, link density)
- [ ] Output shows Safari compatibility checks (character count, comma count, element count, container type)
- [ ] Safari compatibility shows pass/fail for each check with thresholds
- [ ] JSON output includes all metrics as structured data
- [ ] `--full` flag shows complete extracted content
- [ ] Research page updated:
  - [ ] `toolCoverage` entry added to [[reader-mode]] frontmatter
  - [ ] Inline callout added noting `reader` command
- [ ] CHANGELOG entry references research page and version

---

## Notes

- This is the foundational `reader` command. Future enhancements (TOC preview, title comparison, metadata preview) build on this base.
- The `ai` command focuses on "what AI crawlers see" while `reader` focuses on "what browser reader modes see" — related but distinct use cases.
- Safari's actual algorithm cannot be perfectly replicated since it uses visual positioning (requires rendering), but key heuristics can be checked.
