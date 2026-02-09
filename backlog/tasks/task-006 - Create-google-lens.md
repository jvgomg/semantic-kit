---
id: TASK-006
title: Create google lens
status: To Do
assignee: []
created_date: '2026-02-09 14:21'
updated_date: '2026-02-09 14:34'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-017
references:
  - docs/backlog/command-api-restructure.md
  - src/commands/schema/
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
New lens showing how Googlebot sees a page.

**Purpose:** Answer "How does Google see my page?"

**Behavior:**
- Shows structured data relevant to Google Search
- Filters to JSON-LD types Google recognizes (Article, Product, FAQ, HowTo, BreadcrumbList, etc.)
- Shows relevant meta tags (title, description, canonical)
- Does NOT show Open Graph or Twitter Cards (not Google-relevant)
- May show structure signals (heading hierarchy, landmarks) per TASK-001 decision

**Implementation:**
1. Create `src/commands/google/` directory
2. Reuse schema extraction logic from `src/commands/schema/`
3. Create filter for Google-recognized schema types in `src/lib/schema-filter.ts`
4. Add page metadata extraction (title, description, canonical URL)
5. Register in CLI as a Lens
6. Add to TUI navigation
7. Add tests

**Options:**
- `--format <type>` — full, compact, json (default: full)

**Reference:** docs/backlog/command-api-restructure.md (google lens)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 google command exists and works
- [ ] #2 Filters schema to Google-recognized types only
- [ ] #3 Shows page metadata (title, description, canonical)
- [ ] #4 Does not show OG/Twitter Cards
- [ ] #5 TUI includes google in Lenses section
- [ ] #6 Integration tests cover command functionality
- [ ] #7 Documentation updated (AGENTS.md command table)
<!-- AC:END -->
