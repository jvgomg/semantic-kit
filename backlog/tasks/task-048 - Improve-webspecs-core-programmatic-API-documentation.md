---
id: TASK-048
title: Improve @webspecs/core programmatic API documentation
status: To Do
assignee: []
created_date: '2026-02-17 12:56'
labels:
  - docs
milestone: npm release
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current `packages/core/README.md` gives a practical quick-start for `@webspecs/core`. As external programmatic usage grows, a more complete API reference is needed.

Options to consider:
- **TypeDoc**: auto-generate API docs from TypeScript source (JSDoc comments). Output could be a static site or markdown files checked into `docs/`.
- **Expanded README**: hand-write more examples covering each major functional area.
- **Separate docs site**: integrate with a docs platform (e.g. Docusaurus, VitePress).

The core package has a large surface area — see `packages/core/src/index.ts` for the full export list. Key areas with no programmatic examples yet:
- Sitemap fetching/parsing (`fetchSitemap`, `buildSitemapTree`)
- Screen reader analysis (`analyzeScreenReaderExperience`)
- Google analysis (`analyzeForGoogle`)
- Social preview building (`buildSocialPreview`)
- Static axe-core testing (`runAxeOnStaticHtml`)
- Aria snapshot comparison (`compareSnapshots`, `hasDifferences`)

Most exported functions currently have no JSDoc comments, so adding those would be a prerequisite for TypeDoc to be useful.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Approach chosen (TypeDoc, hand-written, or docs site)
- [ ] #2 All major functional areas of @webspecs/core have at least one usage example
- [ ] #3 Key types are documented with their shape and purpose
<!-- AC:END -->
