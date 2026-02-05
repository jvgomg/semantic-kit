```yaml
# Metadata (keep at top of file)
researchVersion: research-v0.3.0
toolVersion: null
status: pending
created: 2026-02-04
```

# Add title extraction comparison to `reader` command

## Research Context

**Source:** [[reader-mode]], [[apple]], [[mozilla-readability]]

**Finding:**
Safari Reader and Mozilla Readability use fundamentally different approaches to extract article titles:

**Safari Reader:**
- Uses Levenshtein distance to compare heading candidates against `document.title`
- Evaluates visual proximity to the top of the article
- Candidates must be at least 4 characters long
- Falls back to `document.title` if no matching headline found

**Mozilla Readability:**
- Searches for heading elements (h1, h2)
- Uses separator detection in `document.title`
- Applies text cleaning and normalization
- Has specific logic for site names in titles

This means the same page may show different titles in Firefox Reader View vs Safari Reader. Developers should be aware of these differences.

**Citations:**

- [^ctrl-blog-metadata]: Safari uses Levenshtein distance and visual proximity for title matching
- [^safari-readability-repo]: Source code confirms title matching algorithm
- [^mozilla-readability-repo]: Mozilla Readability title extraction approach

---

## Proposed Change

**Affected command(s):** `reader` command (enhancement)

**What should change:**
Add title extraction analysis that shows:
1. What title each reader mode would likely extract
2. The `document.title` for comparison
3. Similarity scores (Levenshtein distance for Safari-style matching)
4. Which heading element was selected and why

This helps developers ensure their pages have consistent, expected titles across reader modes.

**Example output (if applicable):**
```
## Title Extraction Analysis

document.title:     "How to Build Websites | Example Blog"

Mozilla Readability: "How to Build Websites"
  Source: <title> with separator detection

Safari Reader:      "How to Build Better Websites"
  Source: <h1> (Levenshtein distance: 7 from document.title)

⚠ Titles differ between readers

Heading candidates evaluated:
  1. <h1> "How to Build Better Websites" — distance: 7 ✓ selected
  2. <h2> "Getting Started" — distance: 31
  3. <h2> "Core Concepts" — distance: 29
```

When titles match:
```
## Title Extraction Analysis

document.title:      "How to Build Websites"
Mozilla Readability: "How to Build Websites"
Safari Reader:       "How to Build Websites"

✓ Titles consistent across readers
```

---

## Implementation Approach

**Key files likely involved:**
- `src/commands/reader.ts` - Add title analysis to reader output
- `src/lib/title-extraction.ts` (new) - Title extraction logic
- `src/lib/levenshtein.ts` (new) - Levenshtein distance calculation

**Approach:**

1. **Get document.title** — The baseline for comparison.

2. **Get Mozilla Readability title** — Already extracted when running Readability.

3. **Simulate Safari title selection**:
   - Collect all h1-h6 elements
   - Calculate Levenshtein distance from each to `document.title`
   - Select the heading with lowest distance (if below threshold)
   - Fall back to `document.title` if no good match

4. **Implement Levenshtein distance** — Standard algorithm:
   ```typescript
   function levenshteinDistance(a: string, b: string): number
   ```

5. **Compare and report** — Show all three titles, indicate if they differ, show the selection reasoning.

**Considerations:**
- Safari's actual algorithm also considers visual position — we can't replicate this without rendering, so note this limitation
- Normalize strings before comparison (lowercase, trim whitespace)
- Consider showing percentage similarity in addition to raw distance
- Heading candidates should be from within the likely article area, not navigation

---

## Acceptance Criteria

- [ ] `reader` command shows document.title
- [ ] `reader` command shows Mozilla Readability extracted title
- [ ] `reader` command shows predicted Safari Reader title
- [ ] Levenshtein distance is calculated and shown for Safari matching
- [ ] Heading candidates are listed with their distances
- [ ] Differences between titles are flagged
- [ ] JSON output includes all title data
- [ ] Research page updated:
  - [ ] `toolCoverage` entry added to [[reader-mode]] frontmatter
  - [ ] Note about title comparison feature
- [ ] CHANGELOG entry references research page and version

---

## Notes

- This builds on the base `reader` command (separate backlog item).
- Levenshtein distance is a common algorithm — consider using an existing npm package vs implementing from scratch.
- Safari's visual positioning cannot be simulated without rendering, so this is a best-effort approximation.
- The "predicted Safari title" is an approximation — actual Safari behavior may differ.
- Dependency: Should be implemented after the base `reader` command.
