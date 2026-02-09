---
id: TASK-015
title: Set up TUI Lenses/Utilities navigation structure
status: Done
assignee: []
created_date: '2026-02-09 14:34'
updated_date: '2026-02-09 17:25'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-001
  - TASK-003
references:
  - docs/backlog/command-api-restructure.md
  - src/tui/
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the foundational TUI structure for the Lenses vs Utilities organization before adding the first lens.

**Purpose:** Establish the navigation patterns, layout, and UX conventions that all subsequent lenses and utilities will follow.

**Scope:**
1. Design and implement Lenses/Utilities navigation in TUI
2. Establish consistent patterns for:
   - How lenses are presented vs utilities
   - Navigation between commands
   - Output display conventions
3. Consider how existing commands (ai, structure, schema, validate) fit into the new structure
4. Set up placeholder sections for upcoming lenses

**UX Focus:**
- Navigation should be intuitive
- The lens vs utility distinction should be clear to users
- Consider keyboard shortcuts and accessibility

**Architecture Focus:**
- Establish Jotai state patterns for lens/utility data
- Define consistent JSON output structure for all commands
- Create reusable TUI components for command output display

**Reference:** docs/backlog/command-api-restructure.md (TUI navigation question in TASK-001)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 TUI has Lenses and Utilities sections in navigation
- [x] #2 Navigation patterns are documented for future lens implementations
- [x] #3 Jotai state patterns for command data are established
- [x] #4 JSON output structure conventions are defined
- [x] #5 Existing commands are reorganized into appropriate sections
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Step 1: Add category support to ViewDefinition
- Add `category: 'lens' | 'tool'` field to ViewDefinition interface
- Update existing views (ai-view, structure) with categories

### Step 2: Update view registry
- Add `getViewsByCategory()` function
- Update `getMenuItems()` to return grouped structure

### Step 3: Update Menu component
- Render grouped menu with section headers ("LENSES", "TOOLS")
- Handle navigation within and between groups
- Style group headers distinctly

### Step 4: Categorize existing views
- ai-view → lens
- structure → tool

### Step 5: Document patterns
- Add navigation patterns to TUI docs
- Document category assignment guidelines
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Decision Context

Per TASK-001 decision #2: **Sidebar menu with 2 groups**

- Group 1: **Lenses** (ai, reader, google, social, screen-reader)
- Group 2: **Tools** (not "Utilities" - user preference)

Use sidebar navigation pattern, not tabs.

## Completion Summary

Implemented Lenses/Tools navigation structure in TUI:

### Changes Made

1. **ViewDefinition types** (`src/tui/views/types.ts`)
   - Added `category: 'lens' | 'tool'` field to ViewDefinition interface
   - Added `ViewCategory` type export

2. **View registry** (`src/tui/views/registry.ts`)
   - Added `getViewsByCategory()` function
   - Added `getGroupedMenuItems()` function that returns items with section headers
   - Added `MenuItem` type for grouped navigation

3. **Menu atoms** (`src/tui/state/atoms/menu.ts`)
   - Added `groupedMenuItemsAtom` for grouped menu items
   - Added `initializeMenuIndexAtom` to set initial selection
   - Updated `navigateMenuAtom` to skip header items during navigation

4. **Menu component** (`src/tui/components/chrome/Menu.tsx`)
   - Renders grouped menu with section headers (LENSES, TOOLS)
   - Headers are styled distinctly (bold, muted color)
   - Navigation skips headers and only selects view items

5. **Existing views categorized**
   - ai-view → lens (shows how AI crawlers see the page)
   - structure → tool (analysis utility)

6. **Documentation** (`src/tui/AGENTS.md`)
   - Added View Categories section explaining lens vs tool distinction
   - Updated Adding a New View section with category field
   - Updated Key Atoms table with new grouped menu atoms
   - Updated ViewDefinition interface documentation

### Technical Notes

- Jotai state patterns already established via `viewDataAtomFamily`
- JSON output conventions already established via `--format json` flag on CLI commands
- Navigation wraps around at ends, skipping header items
<!-- SECTION:NOTES:END -->
