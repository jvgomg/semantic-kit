# Backlog Request Template

_Copy this template to create a new backlog request. Delete this instruction block._

---

```yaml
# Metadata (keep at top of file)
researchVersion: research-v0.X.X   # Research version when this was discovered
toolVersion: null                   # Set to vX.X.X when implemented
status: pending                     # pending | in-progress | completed
created: YYYY-MM-DD
```

# [Title: Brief description of the change]

## Research Context

**Source:** [[research-page-name]] (and other relevant pages)

**Finding:**
_Summarize what was discovered during research. Include the key insight that suggests a tool change._

**Citations:**
_List the key citations that support this change (copy from research page)._

- [^citation-id]: Brief description of what it supports

---

## Proposed Change

**Affected command(s):** `command-name` (or "new command" / "library")

**What should change:**
_Describe the user-visible change. What will be different? What problem does it solve?_

**Example output (if applicable):**
```
Show what the output might look like after the change
```

---

## Implementation Approach

**Key files likely involved:**
- `src/commands/example.ts` - Brief note on what changes
- `src/lib/example.ts` - Brief note on what changes

**Approach:**
_Describe the general approach without writing full code. What's the strategy? What libraries or APIs might be useful? What patterns from the codebase should be followed?_

**Considerations:**
- _Edge cases to handle_
- _Backwards compatibility concerns_
- _Performance implications_

---

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Research page updated:
  - [ ] `toolCoverage` entry added to frontmatter (required for all changes)
  - [ ] Inline callout added/updated if editorially appropriate (new features: yes; incremental fixes: usually no)
- [ ] CHANGELOG entry references research page and version

---

## Notes

_Any additional context, open questions, or alternatives considered._
