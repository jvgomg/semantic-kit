```yaml
# Metadata (keep at top of file)
researchVersion: research-v0.3.0
toolVersion: null
status: pending
created: 2026-02-04
```

# Add table of contents preview to `reader` command

## Research Context

**Source:** [[reader-mode]], [[apple]], [[document-outline]]

**Finding:**
Safari 18 (iOS 18 / macOS Sequoia) introduced auto-generated table of contents in Reader Mode. The TOC is built from the heading hierarchy (h1-h6) and appears at the top of Reader view for articles with subheadings, allowing quick navigation to sections.

Developers would benefit from previewing what this TOC looks like to ensure their heading structure creates useful navigation. Poorly structured headings (skipped levels, unclear hierarchy) result in confusing or unhelpful TOCs.

**Citations:**

- [^macrumors-ios18-reader]: Safari 18 table of contents feature, auto-generated from headings
- [^9to5mac-safari-ai]: TOC appears for articles with subheadings

---

## Proposed Change

**Affected command(s):** `reader` command (enhancement), possibly `structure` command

**What should change:**
Add a table of contents preview that shows how Safari 18's Reader would generate navigation from the page's heading structure. This helps developers:

1. See their heading hierarchy as a navigable outline
2. Identify heading structure issues (skipped levels, flat structure, etc.)
3. Understand how their content will appear in Safari Reader's TOC

**Example output (if applicable):**
```
## Table of Contents Preview (Safari 18)

1. How to Build Better Websites          [h1]
   1.1. Getting Started                   [h2]
       1.1.1. Prerequisites               [h3]
       1.1.2. Installation                [h3]
   1.2. Core Concepts                     [h2]
       1.2.1. Components                  [h3]
       1.2.2. State Management            [h3]
   1.3. Advanced Topics                   [h2]
   1.4. Conclusion                        [h2]

TOC entries: 9
Max depth: 3 levels

⚠ Warning: Heading level skipped (h2 → h4) at "Some Section"
```

For pages without sufficient headings:
```
## Table of Contents Preview (Safari 18)

No table of contents would be generated.
Reason: Only 1 heading found (minimum ~2 for TOC)

Tip: Add subheadings (h2, h3) to enable Safari Reader's table of contents.
```

---

## Implementation Approach

**Key files likely involved:**
- `src/commands/reader.ts` - Add TOC preview to reader output
- `src/lib/headings.ts` (new or existing) - Heading extraction and hierarchy analysis
- `src/commands/structure.ts` - May already have heading extraction to reuse

**Approach:**

1. **Extract headings** — Get all h1-h6 elements from the document (or from Readability's extracted content for accuracy).

2. **Build hierarchy** — Create nested structure based on heading levels:
   ```typescript
   interface TocEntry {
     level: number;
     text: string;
     children: TocEntry[];
   }
   ```

3. **Detect issues** — Flag common problems:
   - Skipped heading levels (h2 → h4)
   - Missing h1
   - Flat structure (all same level)
   - Single heading (no TOC generated)

4. **Format output** — Render as indented tree with level indicators.

5. **Integration options**:
   - Add to `reader` command output (recommended — keeps reader analysis together)
   - Add `--toc` flag to `structure` command (alternative)
   - Both (share the heading analysis code)

**Considerations:**
- Safari's exact TOC generation logic isn't documented — this is a best-effort preview
- Should headings come from full document or Readability-extracted content? Probably extracted content (what Reader actually shows)
- Consider truncating very long heading text in preview
- Empty headings should be flagged as issues

---

## Acceptance Criteria

- [ ] `reader` command includes table of contents preview
- [ ] TOC shows heading hierarchy as indented tree
- [ ] Each entry shows heading text and level (h1, h2, etc.)
- [ ] Entry count and max depth are reported
- [ ] Heading structure issues are flagged (skipped levels, missing h1)
- [ ] Pages with insufficient headings show appropriate message
- [ ] JSON output includes TOC as structured data
- [ ] Research page updated:
  - [ ] `toolCoverage` entry added to [[reader-mode]] frontmatter
  - [ ] Note about TOC preview feature
- [ ] CHANGELOG entry references research page and version

---

## Notes

- This builds on the base `reader` command (separate backlog item).
- The `structure` command already shows headings but not as a TOC preview with hierarchy visualization.
- Future enhancement: Compare heading structure against accessibility best practices (WCAG heading requirements).
- Dependency: Should be implemented after the base `reader` command.
