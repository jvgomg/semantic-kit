```yaml
# Metadata (keep at top of file)
researchVersion: research-v0.3.0
toolVersion: null
status: pending
created: 2026-02-04
```

# Add metadata extraction preview to `reader` command

## Research Context

**Source:** [[reader-mode]], [[apple]]

**Finding:**
Safari Reader extracts author, publication date, and site name metadata using a combination of:

1. **Class name patterns**: `author-name`, `article-author`, `dateline`, `entry-date`
2. **HTML attributes**: `a[rel="author"]`, `<time>` elements
3. **Visual proximity**: Elements nearest the title are preferred
4. **Confirmation sources**: Schema.org and Open Graph are used to *confirm* selections, not as primary sources

This differs from how the `schema` command shows structured data — reader modes may ignore explicit metadata in favor of visually-detected patterns. Developers should understand what metadata will actually be displayed.

**Citations:**

- [^ctrl-blog-metadata]: Safari metadata extraction through visual examination and class names
- [^safari-readability-repo]: Source code showing class name patterns searched

---

## Proposed Change

**Affected command(s):** `reader` command (enhancement)

**What should change:**
Add metadata extraction preview showing what author, date, and site name Safari Reader would display. This includes:

1. What metadata was detected and from which source
2. Whether structured data (Schema.org, Open Graph) matches detected metadata
3. Warnings when metadata might not be detected

**Example output (if applicable):**
```
## Reader Metadata Extraction

Author:
  Detected:  "Jane Smith"
  Source:    <span class="author-name">
  Schema.org: "Jane Smith" ✓ matches
  Open Graph: (not specified)

Date:
  Detected:  "February 3, 2026"
  Source:    <time datetime="2026-02-03">
  Schema.org: "2026-02-03" ✓ matches

Site Name:
  Detected:  "Example Blog"
  Source:    Open Graph (og:site_name)
```

When metadata is missing:
```
## Reader Metadata Extraction

Author:
  Detected:  (none)
  ⚠ No author detected. Add class="author-name" or rel="author" link.
  Schema.org: "Jane Smith" — not used by Safari Reader directly

Date:
  Detected:  (none)
  ⚠ No date detected. Add <time> element or class="dateline".
  Schema.org: "2026-02-03" — not used by Safari Reader directly

Site Name:
  Detected:  "example.com"
  Source:    Domain fallback
```

---

## Implementation Approach

**Key files likely involved:**
- `src/commands/reader.ts` - Add metadata preview to reader output
- `src/lib/reader-metadata.ts` (new) - Metadata detection logic

**Approach:**

1. **Detect author** — Search in order:
   - Elements with class containing `author-name`, `article-author`, `author`
   - Links with `rel="author"`
   - Elements near the detected title (within article header)

2. **Detect date** — Search in order:
   - `<time>` elements with `datetime` attribute
   - Elements with class containing `dateline`, `entry-date`, `published`, `date`
   - Elements near the detected title

3. **Detect site name** — Search in order:
   - Open Graph `og:site_name`
   - Schema.org `publisher.name`
   - Fall back to domain

4. **Cross-reference structured data** — Check if Schema.org/Open Graph values match detected values, flag discrepancies.

5. **Provide recommendations** — When metadata not detected, suggest markup patterns that would work.

**Considerations:**
- Safari's visual proximity detection can't be fully replicated without rendering
- Focus on the documented class name patterns as primary detection
- The `schema` command already extracts structured data — reuse that code
- Consider showing "confidence" for each detected value

---

## Acceptance Criteria

- [ ] `reader` command shows detected author with source element
- [ ] `reader` command shows detected date with source element
- [ ] `reader` command shows detected site name with source
- [ ] Structured data (Schema.org, Open Graph) is shown for comparison
- [ ] Matches between detected and structured data are indicated
- [ ] Missing metadata shows warning with recommendation
- [ ] JSON output includes all metadata detection results
- [ ] Research page updated:
  - [ ] `toolCoverage` entry added to [[reader-mode]] frontmatter
  - [ ] Note about metadata preview feature
- [ ] CHANGELOG entry references research page and version

---

## Notes

- This builds on the base `reader` command (separate backlog item).
- Safari's actual algorithm uses visual proximity which we can't fully simulate.
- The class name patterns are documented in ctrl.blog and confirmed in Safari source code.
- This is complementary to the `schema` command — `schema` shows what's declared, `reader` shows what's detected.
- Dependency: Should be implemented after the base `reader` command.
