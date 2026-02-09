# Expandable Sections Framework

A modular UI system for displaying tool results in the TUI with collapsible, navigable sections.

## Overview

This framework provides a hierarchical section-based layout for displaying command results. Each view composes multiple `<Section>` components that can be expanded, collapsed, and navigated using keyboard controls.

### Key Features

- **Hierarchical navigation**: Tree-style keyboard navigation with focus trapping
- **Priority-based ordering**: Sections automatically sorted by importance (errors first)
- **Flexible content types**: Support for violations, prose, trees, tables, metrics
- **Arbitrary nesting**: Sections can contain subsections to any depth
- **Consistent styling**: Unified visual language with theme integration

---

## Architecture

### Component Hierarchy

```
<ViewContent>
  └─ <SectionContainer>           # Manages section list, keyboard nav, focus
       ├─ <Section>               # Individual collapsible section
       │    ├─ <SectionHeader>    # Title, icon, count, expand indicator
       │    └─ <SectionBody>      # Content when expanded
       │         ├─ <Card>        # For violations, structured items
       │         ├─ <Prose>       # For long text content
       │         ├─ <Tree>        # For hierarchical data
       │         └─ <Section>     # Nested sections (recursive)
       ├─ <Section>
       └─ <Section>
```

### State Management

Section state is managed via Jotai atoms, following the existing TUI patterns.

```typescript
// src/tui/state/atoms/sections.ts

import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

// Track expanded state per section, keyed by viewId + sectionPath
// sectionPath is a dot-separated path like "structure.headings" for nested sections
export const sectionExpandedAtomFamily = atomFamily(
  (key: string) => atom<boolean>(false)
)

// Track which section is currently selected within a view
// Path to the selected section, e.g., ["errors", "0"] for first error card
export const selectedSectionPathAtom = atom<string[]>([])

// Track focus depth (0 = section list, 1 = inside section, 2 = inside nested, etc.)
export const sectionFocusDepthAtom = atom<number>(0)
```

### Focus Model

The navigation uses a hierarchical focus model:

```
Depth 0: Section list level
  ↑↓ moves between sections
  → expands selected section
  ← collapses selected section
  Enter focuses into section (depth + 1)

Depth 1: Inside a section
  ↑↓ moves between items (cards, subsections)
  → expands subsection (if applicable)
  ← collapses subsection
  Enter focuses into item (depth + 1)
  Esc returns to depth 0

Depth N: Recursively same pattern
  Esc always returns to depth N-1
```

---

## Components

### SectionContainer

The root component that manages a list of sections.

```typescript
// src/tui/components/ui/SectionContainer.tsx

interface SectionContainerProps {
  viewId: string
  children: React.ReactNode  // Section components
}

export function SectionContainer({ viewId, children }: SectionContainerProps) {
  // Collects Section children
  // Sorts by priority
  // Manages keyboard navigation
  // Tracks selected index
  // Handles focus trapping
}
```

**Responsibilities:**
- Collect and sort child `<Section>` components by priority
- Track which section is selected
- Handle keyboard events at the container level
- Pass selection/focus state down to children

### Section

An individual collapsible section.

```typescript
// src/tui/components/ui/Section.tsx

interface SectionProps {
  id: string                    // Unique within parent container
  title: string                 // Display title, e.g., "ERRORS"
  priority?: SectionPriority    // For automatic ordering

  // Summary display (shown in header or when collapsed)
  count?: number                // Item count, e.g., 3 for "ERRORS (3)"
  summary?: string              // Text summary for collapsed state
  summaryLines?: number         // Max lines for summary (default: 3)

  // State
  defaultExpanded?: boolean     // Initial expanded state
  isEmpty?: boolean             // True if no content (renders as single line)

  // Visual
  severity?: 'critical' | 'error' | 'warning' | 'info' | 'success' | 'muted'
  icon?: string                 // Unicode symbol, e.g., "✗", "⚠", "✓"

  // Content
  children: React.ReactNode
}
```

**Rendering modes:**

1. **Empty section** (single line, muted):
```
── ERRORS ──────────────────────────────── ✓ None ──
```

2. **Collapsed with content** (shows summary):
```
┌─ ERRORS (3) ─────────────────────────────── [▸] ─┐
│  3 accessibility violations found                 │
│  Critical: 1 • Serious: 2                        │
└───────────────────────────────────────────────────┘
```

3. **Expanded** (shows full content):
```
┌─ ERRORS (3) ─────────────────────────────── [▼] ─┐
│                                                   │
│  [Card content...]                                │
│                                                   │
└───────────────────────────────────────────────────┘
```

### Card

A structured item within a section, used for violations, schema items, etc.

```typescript
// src/tui/components/ui/Card.tsx

interface CardProps {
  // Header
  title: string
  severity?: 'critical' | 'error' | 'warning' | 'info'
  icon?: string                 // e.g., "✗", "⚠"

  // Content rows
  children: React.ReactNode     // CardRow components

  // Actions
  actions?: CardAction[]

  // State
  selected?: boolean            // Visual selection indicator
  focused?: boolean             // Has keyboard focus
}

interface CardAction {
  label: string                 // "Docs", "Details"
  shortcut?: string             // "d", "enter"
  href?: string                 // URL - renders as ClickableLink
  onSelect?: () => void         // Custom handler
}

// Helper component for card content rows
interface CardRowProps {
  label: string                 // "Element", "Line", "Impact"
  value: React.ReactNode        // Can be string or component
  muted?: boolean               // Dim styling
}
```

**Example rendering:**
```
┌─────────────────────────────────────────────────┐
│ ✗ Missing alt attribute                         │
│   Element: <img src="hero.jpg">                 │
│   Line: 42                                      │
│   Impact: Critical                              │
│   ─────────────────────────────────────────     │
│   [Docs] [Details]                              │
└─────────────────────────────────────────────────┘
```

### Prose

For displaying long text content with truncation support.

```typescript
// src/tui/components/ui/Prose.tsx

interface ProseProps {
  content: string               // Full text content
  format?: 'plain' | 'markdown' // Rendering format

  // Truncation (for collapsed state)
  truncate?: boolean
  maxLines?: number             // Default: 3

  // Metadata
  wordCount?: number            // Shown in section header
}
```

### Tree

For displaying hierarchical data (landmarks, headings, accessibility trees).

```typescript
// src/tui/components/ui/Tree.tsx

interface TreeProps {
  nodes: TreeNode[]

  // Display options
  showLines?: boolean           // Box-drawing connectors
  indentSize?: number           // Spaces per level (default: 2)
  maxDepth?: number             // Truncate deeper levels

  // Interaction
  expandable?: boolean          // Allow expanding/collapsing branches
}

interface TreeNode {
  label: string
  icon?: string
  meta?: string                 // Secondary text (dimmed)
  children?: TreeNode[]
  expanded?: boolean
}
```

**Example rendering:**
```
<header>
├─ <nav> Main Navigation
│  ├─ <ul> (5 items)
│  └─ <button> Menu Toggle
<main>
├─ <article>
│  ├─ <h1> Page Title
│  └─ <section> Content
<footer>
```

### ClickableLink

For documentation links that open in the browser.

```typescript
// src/tui/components/ui/ClickableLink.tsx

interface ClickableLinkProps {
  href: string
  children: React.ReactNode

  // Styling
  muted?: boolean
  underline?: boolean
}
```

Uses OpenTUI's link capabilities to open URLs in the system browser when clicked or activated.

---

## Section Priority System

Sections are automatically sorted by priority within their container.

```typescript
// src/tui/components/ui/priorities.ts

export enum SectionPriority {
  CRITICAL = 0,    // Critical errors, blocking issues
  ERROR = 1,       // Errors, violations
  WARNING = 2,     // Warnings, potential issues
  INFO = 3,        // Informational notices
  SUMMARY = 4,     // Quick stats, metrics dashboard
  PRIMARY = 5,     // Main content (extracted markdown, etc.)
  SECONDARY = 6,   // Supporting details, metadata
  SUPPLEMENTARY = 7, // Additional context
  DEBUG = 8,       // Technical details, raw data
}

// Map severity to default priority
export const severityToPriority: Record<string, SectionPriority> = {
  critical: SectionPriority.CRITICAL,
  error: SectionPriority.ERROR,
  warning: SectionPriority.WARNING,
  info: SectionPriority.INFO,
  success: SectionPriority.SUMMARY,
  muted: SectionPriority.SECONDARY,
}
```

---

## Keyboard Navigation

### Global Keybindings (when main content focused)

| Key | Action |
|-----|--------|
| `↑` / `k` | Select previous section/item |
| `↓` / `j` | Select next section/item |
| `→` / `l` | Expand selected section |
| `←` / `h` | Collapse selected section |
| `Enter` | Focus into selected section |
| `Esc` | Focus out (up one level) |
| `Home` | Select first section |
| `End` | Select last section |
| `e` | Expand all sections |
| `c` | Collapse all sections |

### Focus Context

The `SectionContainer` maintains focus context:

```typescript
interface FocusContext {
  // Current selection path, e.g., ["errors", "0", "actions"]
  path: string[]

  // Depth in the hierarchy
  depth: number

  // Current container at this depth
  container: SectionContainer | Section | Card

  // Selected index within container
  selectedIndex: number
}
```

Navigation events bubble up through the hierarchy. Each component handles its own level and delegates to parent/child as needed.

---

## Styling

### Theme Integration

Extend the existing theme with section-specific tokens:

```typescript
// src/tui/theme.ts additions

export const sectionTheme = {
  // Borders
  borderExpanded: palette.cyan,
  borderCollapsed: palette.gray,
  borderEmpty: palette.darkGray,
  borderSelected: palette.yellow,

  // Severity colors
  severityCritical: palette.red,
  severityError: palette.red,
  severityWarning: palette.yellow,
  severityInfo: palette.blue,
  severitySuccess: palette.green,
  severityMuted: palette.gray,

  // Text
  titleExpanded: palette.white,
  titleCollapsed: palette.gray,
  titleEmpty: palette.darkGray,
  summaryText: palette.gray,

  // Indicators
  expandIndicator: palette.cyan,
  countBadge: palette.yellow,
}
```

### Box Drawing Characters

Consistent characters for section boundaries:

```typescript
export const boxChars = {
  // Section borders
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',

  // Empty section (single line)
  emptyLeft: '──',
  emptyRight: '──',

  // Tree connectors
  treeVertical: '│',
  treeBranch: '├─',
  treeLastBranch: '└─',

  // Indicators
  expanded: '▼',
  collapsed: '▸',

  // Status
  checkmark: '✓',
  cross: '✗',
  warning: '⚠',
  info: 'ℹ',
}
```

---

## Implementation Plan

### Phase 1: Core Components

1. Create `SectionContainer` with basic keyboard navigation
2. Create `Section` with expand/collapse and three rendering modes
3. Implement section priority sorting
4. Add Jotai atoms for section state

### Phase 2: Content Components

1. Create `Card` component with actions support
2. Create `Prose` component with truncation
3. Create `Tree` component with expand/collapse
4. Create `ClickableLink` component

### Phase 3: Navigation Enhancement

1. Implement hierarchical focus model
2. Add focus trapping within sections
3. Add expand all / collapse all
4. Integrate with existing TUI keyboard handling

### Phase 4: View Migration

1. Update `AiViewContent` to use new section components
2. Update `StructureView` to use new section components
3. Add new views using the framework

---

## File Structure

```
src/tui/
├─ components/
│  └─ ui/
│     ├─ Section.tsx           # Main section component
│     ├─ SectionContainer.tsx  # Section list manager
│     ├─ SectionHeader.tsx     # Title bar with indicators
│     ├─ SectionBody.tsx       # Content wrapper
│     ├─ Card.tsx              # Violation/item cards
│     ├─ CardRow.tsx           # Key-value row in card
│     ├─ Prose.tsx             # Long text with truncation
│     ├─ Tree.tsx              # Hierarchical display
│     ├─ ClickableLink.tsx     # Browser-opening links
│     └─ priorities.ts         # Priority enum and helpers
├─ state/
│  └─ atoms/
│     └─ sections.ts           # Section state atoms
└─ docs/
   ├─ EXPANDABLE_SECTIONS_FRAMEWORK.md  # This document
   └─ INTEGRATING_TOOLS_GUIDE.md        # Integration guide
```

---

## Usage Example

```tsx
// Example: Validation view using the section framework

import { SectionContainer, Section, Card, CardRow } from '../components/ui'
import { SectionPriority } from '../components/ui/priorities'

interface ValidationViewProps {
  data: ValidateA11yResult
}

export function ValidationView({ data }: ValidationViewProps) {
  const { violations, warnings } = data

  const criticalViolations = violations.filter(v => v.impact === 'critical')
  const seriousViolations = violations.filter(v => v.impact === 'serious')

  return (
    <SectionContainer viewId="validate-a11y">
      {/* Critical errors - highest priority, auto-sorted to top */}
      <Section
        id="critical"
        title="CRITICAL"
        priority={SectionPriority.CRITICAL}
        severity="critical"
        icon="✗"
        count={criticalViolations.length}
        isEmpty={criticalViolations.length === 0}
        summary={`${criticalViolations.length} critical accessibility violations`}
        defaultExpanded={criticalViolations.length > 0}
      >
        {criticalViolations.map((violation, i) => (
          <Card
            key={i}
            title={violation.description}
            severity="critical"
            icon="✗"
            actions={[
              { label: 'Docs', href: violation.helpUrl },
            ]}
          >
            <CardRow label="Rule" value={violation.id} />
            <CardRow label="Impact" value={violation.impact} />
            <CardRow label="Elements" value={`${violation.nodes.length} affected`} />
          </Card>
        ))}
      </Section>

      {/* Serious errors */}
      <Section
        id="serious"
        title="ERRORS"
        priority={SectionPriority.ERROR}
        severity="error"
        icon="✗"
        count={seriousViolations.length}
        isEmpty={seriousViolations.length === 0}
        summary={`${seriousViolations.length} serious violations`}
      >
        {/* ... similar card rendering ... */}
      </Section>

      {/* Warnings */}
      <Section
        id="warnings"
        title="WARNINGS"
        priority={SectionPriority.WARNING}
        severity="warning"
        icon="⚠"
        count={warnings.length}
        isEmpty={warnings.length === 0}
      >
        {/* ... */}
      </Section>

      {/* Summary stats - lower priority, appears after issues */}
      <Section
        id="summary"
        title="SUMMARY"
        priority={SectionPriority.SUMMARY}
        defaultExpanded={true}
      >
        <text>Total rules checked: {data.rulesChecked}</text>
        <text>Passing: {data.passes}</text>
      </Section>
    </SectionContainer>
  )
}
```

---

## Next Steps

After implementing this framework, proceed to [INTEGRATING_TOOLS_GUIDE.md](./INTEGRATING_TOOLS_GUIDE.md) for step-by-step instructions on adding a new tool to the TUI.
