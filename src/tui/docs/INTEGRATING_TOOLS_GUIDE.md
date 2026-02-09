# Integrating Tools with the Expandable Sections Framework

A step-by-step guide for adding a new tool to the TUI using the expandable sections framework.

## Prerequisites

Before starting, ensure you have:

1. Read [EXPANDABLE_SECTIONS_FRAMEWORK.md](./EXPANDABLE_SECTIONS_FRAMEWORK.md)
2. Familiarity with the existing view system (see [src/tui/AGENTS.md](../AGENTS.md))
3. The framework components are implemented and available

---

## Overview

Adding a tool to the TUI involves:

1. **Analyze the data** - Understand the command's result structure
2. **Design the sections** - Plan which sections to create and their priorities
3. **Create the view component** - Build the React component using the framework
4. **Register the view** - Add it to the view registry

This guide uses `validate:a11y` as a worked example because it has:
- Multiple severity levels (critical, serious, moderate, minor)
- Structured violation data (perfect for cards)
- Potential for nested sections (violations grouped by type)
- Documentation links (demonstrates ClickableLink)

---

## Step 1: Analyze the Data Structure

First, understand what data the command returns.

### Find the Result Type

Look in the command file or `src/lib/results.ts`:

```typescript
// From src/commands/validate-a11y.ts

export interface ValidateA11yResult {
  url: string
  timestamp: string

  // Summary counts
  stats: {
    violations: number
    passes: number
    incomplete: number
    inapplicable: number
  }

  // Detailed results
  violations: AxeViolation[]
  passes: AxeRule[]
  incomplete: AxeRule[]
}

interface AxeViolation {
  id: string                    // Rule ID, e.g., "image-alt"
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  description: string           // Human-readable description
  help: string                  // Short help text
  helpUrl: string              // Link to documentation
  tags: string[]               // WCAG criteria, e.g., ["wcag2a", "wcag111"]
  nodes: AxeNode[]             // Affected elements
}

interface AxeNode {
  html: string                  // HTML snippet
  target: string[]             // CSS selectors
  failureSummary: string       // What to fix
}
```

### Identify Content Types

Map the data to UI patterns:

| Data | Content Type | Section Priority |
|------|--------------|------------------|
| Critical violations | Cards with severity | CRITICAL |
| Serious violations | Cards with severity | ERROR |
| Moderate violations | Cards with severity | WARNING |
| Minor violations | Cards with severity | INFO |
| Summary stats | Metrics display | SUMMARY |
| Passing rules | Collapsible list | SECONDARY |

---

## Step 2: Design the Sections

Plan the section hierarchy and collapsed states.

### Section Hierarchy

```
validate:a11y view
├─ CRITICAL (n)           # Critical violations
│  └─ [Violation cards]
├─ ERRORS (n)             # Serious violations
│  └─ [Violation cards]
├─ WARNINGS (n)           # Moderate violations
│  └─ [Violation cards]
├─ NOTICES (n)            # Minor violations
│  └─ [Violation cards]
├─ SUMMARY                # Stats overview
│  └─ Metrics display
└─ PASSING (n)            # Rules that passed
   └─ [Rule list]
```

### Collapsed State Design

For each section, define what shows when collapsed:

**Violations sections (CRITICAL, ERRORS, etc.):**
```
┌─ CRITICAL (2) ───────────────────────────── [▸] ─┐
│  2 critical violations affecting 5 elements       │
│  Rules: image-alt, button-name                    │
└───────────────────────────────────────────────────┘
```

**Summary section:**
```
┌─ SUMMARY ─────────────────────────────────── [▸] ─┐
│  4 violations • 52 passes • 3 incomplete          │
└───────────────────────────────────────────────────┘
```

**Empty section:**
```
── CRITICAL ────────────────────────────── ✓ None ──
```

### Card Design for Violations

Each violation becomes a card:

```
┌─────────────────────────────────────────────────┐
│ ✗ Images must have alternate text               │
│   Rule: image-alt                               │
│   Impact: Critical                              │
│   Elements: 3 affected                          │
│   WCAG: 1.1.1 (Level A)                        │
│   ─────────────────────────────────────────     │
│   [Docs]                                        │
└─────────────────────────────────────────────────┘
```

With nested content (when focused into the card):

```
┌─────────────────────────────────────────────────┐
│ ✗ Images must have alternate text               │
│   Rule: image-alt                               │
│   Impact: Critical                              │
│   WCAG: 1.1.1 (Level A)                        │
│                                                 │
│   Affected Elements (3):                        │
│   ┌─────────────────────────────────────────┐   │
│   │ <img src="hero.jpg">                    │   │
│   │ Fix: Add an alt attribute               │   │
│   └─────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────┐   │
│   │ <img src="logo.png">                    │   │
│   │ Fix: Add an alt attribute               │   │
│   └─────────────────────────────────────────┘   │
│   ...                                           │
│                                                 │
│   [Docs]                                        │
└─────────────────────────────────────────────────┘
```

---

## Step 3: Create the View Component

### File Structure

```
src/tui/views/
├─ validate-a11y/
│  ├─ index.ts              # View definition and registration
│  ├─ ValidateA11yView.tsx  # Main view component
│  ├─ ViolationCard.tsx     # Reusable violation card
│  └─ types.ts              # View-specific types (if needed)
```

### View Definition

```typescript
// src/tui/views/validate-a11y/index.ts

import { registerView, type ViewDefinition } from '../registry'
import { fetchValidateA11y } from '../../commands/validate-a11y'
import type { ValidateA11yResult } from '../../lib/results'
import { ValidateA11yView } from './ValidateA11yView'

const view: ViewDefinition<ValidateA11yResult> = {
  id: 'validate-a11y',
  label: 'Accessibility',
  description: 'WCAG accessibility validation (axe-core)',

  fetch: fetchValidateA11y,

  // Component-based rendering (uses the section framework)
  Component: ValidateA11yView,

  // Optional: string-based fallback for simple output
  // render: (data) => renderValidateA11yLines(data),
}

registerView(view)
```

### Main View Component

```tsx
// src/tui/views/validate-a11y/ValidateA11yView.tsx

import React from 'react'
import type { ViewComponentProps } from '../types'
import type { ValidateA11yResult, AxeViolation } from '../../lib/results'
import { SectionContainer, Section } from '../../components/ui'
import { SectionPriority } from '../../components/ui/priorities'
import { ViolationCard } from './ViolationCard'

export function ValidateA11yView({ data }: ViewComponentProps<ValidateA11yResult>) {
  // Group violations by impact
  const grouped = groupViolationsByImpact(data.violations)

  return (
    <SectionContainer viewId="validate-a11y">
      <CriticalSection violations={grouped.critical} />
      <ErrorsSection violations={grouped.serious} />
      <WarningsSection violations={grouped.moderate} />
      <NoticesSection violations={grouped.minor} />
      <SummarySection stats={data.stats} />
      <PassingSection passes={data.passes} />
    </SectionContainer>
  )
}

// Helper to group violations
function groupViolationsByImpact(violations: AxeViolation[]) {
  return {
    critical: violations.filter(v => v.impact === 'critical'),
    serious: violations.filter(v => v.impact === 'serious'),
    moderate: violations.filter(v => v.impact === 'moderate'),
    minor: violations.filter(v => v.impact === 'minor'),
  }
}
```

### Section Components

```tsx
// Critical violations section

interface CriticalSectionProps {
  violations: AxeViolation[]
}

function CriticalSection({ violations }: CriticalSectionProps) {
  const count = violations.length
  const elementCount = violations.reduce((sum, v) => sum + v.nodes.length, 0)

  return (
    <Section
      id="critical"
      title="CRITICAL"
      priority={SectionPriority.CRITICAL}
      severity="critical"
      icon="✗"
      count={count}
      isEmpty={count === 0}
      summary={buildSummary(violations, elementCount)}
      defaultExpanded={count > 0}
    >
      {violations.map((violation, index) => (
        <ViolationCard
          key={violation.id}
          violation={violation}
          index={index}
        />
      ))}
    </Section>
  )
}

function buildSummary(violations: AxeViolation[], elementCount: number): string {
  if (violations.length === 0) return ''

  const rules = violations.map(v => v.id).join(', ')
  return `${violations.length} critical violations affecting ${elementCount} elements\nRules: ${rules}`
}
```

Similar pattern for other severity sections, adjusting priority and severity accordingly.

### Summary Section

```tsx
interface SummarySectionProps {
  stats: ValidateA11yResult['stats']
}

function SummarySection({ stats }: SummarySectionProps) {
  const summaryText = `${stats.violations} violations • ${stats.passes} passes • ${stats.incomplete} incomplete`

  return (
    <Section
      id="summary"
      title="SUMMARY"
      priority={SectionPriority.SUMMARY}
      summary={summaryText}
      defaultExpanded={true}
    >
      <box flexDirection="column" gap={1}>
        <text>
          <text color="red">{stats.violations}</text> violations
        </text>
        <text>
          <text color="green">{stats.passes}</text> rules passed
        </text>
        <text>
          <text color="yellow">{stats.incomplete}</text> need review
        </text>
        <text>
          <text color="gray">{stats.inapplicable}</text> not applicable
        </text>
      </box>
    </Section>
  )
}
```

### Violation Card Component

```tsx
// src/tui/views/validate-a11y/ViolationCard.tsx

import React from 'react'
import type { AxeViolation } from '../../lib/results'
import { Card, CardRow, ClickableLink, Section } from '../../components/ui'

interface ViolationCardProps {
  violation: AxeViolation
  index: number
}

export function ViolationCard({ violation, index }: ViolationCardProps) {
  const wcagTags = violation.tags
    .filter(tag => tag.startsWith('wcag'))
    .map(formatWcagTag)
    .join(', ')

  return (
    <Card
      title={violation.help}
      severity={violation.impact === 'critical' ? 'critical' : 'error'}
      icon="✗"
      actions={[
        { label: 'Docs', href: violation.helpUrl },
      ]}
    >
      <CardRow label="Rule" value={violation.id} />
      <CardRow label="Impact" value={capitalise(violation.impact)} />
      <CardRow label="Elements" value={`${violation.nodes.length} affected`} />
      {wcagTags && <CardRow label="WCAG" value={wcagTags} />}

      {/* Nested section for affected elements */}
      <Section
        id={`elements-${index}`}
        title="Affected Elements"
        count={violation.nodes.length}
        priority={SectionPriority.SECONDARY}
        defaultExpanded={false}
      >
        {violation.nodes.map((node, nodeIndex) => (
          <box key={nodeIndex} flexDirection="column" marginBottom={1}>
            <text color="cyan">{truncate(node.html, 60)}</text>
            <text color="gray">  Fix: {node.failureSummary}</text>
          </box>
        ))}
      </Section>
    </Card>
  )
}

// Helpers
function formatWcagTag(tag: string): string {
  // "wcag111" -> "1.1.1"
  const match = tag.match(/wcag(\d)(\d)(\d)/)
  if (match) return `${match[1]}.${match[2]}.${match[3]}`
  return tag
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function truncate(s: string, maxLength: number): string {
  if (s.length <= maxLength) return s
  return s.slice(0, maxLength - 3) + '...'
}
```

---

## Step 4: Register the View

Add the view to the registry by importing it.

```typescript
// src/tui/views/index.ts

// Import views in menu order
import './ai-view'
import './structure'
import './validate-a11y'  // Add this line
// ... other views
```

The view self-registers on import. The order of imports determines menu order.

---

## Testing the Integration

### Manual Testing Checklist

1. **View loads correctly**
   - Navigate to the new view in the menu
   - Verify data fetches and displays

2. **Section rendering**
   - Empty sections show as single muted line
   - Sections with content show collapsed state
   - Expand/collapse works with arrow keys

3. **Navigation**
   - ↑/↓ moves between sections
   - →/← expands/collapses
   - Enter focuses into section
   - Esc returns to section list

4. **Cards**
   - Cards display correctly within sections
   - Actions are accessible
   - Links open in browser

5. **Priority ordering**
   - Critical section appears first
   - Sections are in correct priority order

6. **Edge cases**
   - No violations (all sections empty)
   - Many violations (scrolling works)
   - Long violation descriptions (truncation)

### Integration Tests

```typescript
// integration-tests/tui/validate-a11y.test.ts

import { describe, test, expect } from 'bun:test'
import { fetchValidateA11y } from '../../src/commands/validate-a11y'

describe('validate:a11y view', () => {
  test('fetches and structures data correctly', async () => {
    const result = await fetchValidateA11y('http://localhost:4000/bad/no-alt-images.html')

    expect(result.violations.length).toBeGreaterThan(0)
    expect(result.violations.some(v => v.impact === 'critical')).toBe(true)
  })

  test('handles page with no violations', async () => {
    const result = await fetchValidateA11y('http://localhost:4000/good/semantic-article.html')

    expect(result.violations.length).toBe(0)
    expect(result.passes.length).toBeGreaterThan(0)
  })
})
```

---

## Common Patterns

### Pattern: Grouped Violations

When violations can be grouped (by type, by page region, etc.):

```tsx
function GroupedViolationsSection({ violations }: Props) {
  const groups = groupBy(violations, v => v.id)

  return (
    <Section id="violations" title="VIOLATIONS" count={violations.length}>
      {Object.entries(groups).map(([ruleId, ruleViolations]) => (
        <Section
          key={ruleId}
          id={`rule-${ruleId}`}
          title={ruleId}
          count={ruleViolations.length}
          priority={SectionPriority.ERROR}
        >
          {ruleViolations.map((v, i) => (
            <ViolationCard key={i} violation={v} />
          ))}
        </Section>
      ))}
    </Section>
  )
}
```

### Pattern: Prose with Metadata

For content extraction views (ai, bot):

```tsx
function ContentSection({ content, wordCount }: Props) {
  return (
    <Section
      id="content"
      title="CONTENT"
      priority={SectionPriority.PRIMARY}
      summary={`${wordCount} words\n${truncateLines(content, 3)}`}
    >
      <Prose content={content} format="markdown" />
    </Section>
  )
}
```

### Pattern: Tree Display

For hierarchical data (structure, a11y tree):

```tsx
function LandmarksSection({ landmarks }: Props) {
  const nodes = landmarksToTreeNodes(landmarks)

  return (
    <Section
      id="landmarks"
      title="LANDMARKS"
      count={countNodes(nodes)}
      priority={SectionPriority.PRIMARY}
      summary={`${countNodes(nodes)} landmarks • Depth: ${maxDepth(nodes)}`}
    >
      <Tree nodes={nodes} showLines={true} expandable={true} />
    </Section>
  )
}
```

### Pattern: Comparison/Diff

For compare views (structure:compare, a11y-tree:compare):

```tsx
function ComparisonSection({ before, after, diff }: Props) {
  return (
    <Section
      id="comparison"
      title="CHANGES"
      count={diff.changeCount}
      priority={SectionPriority.PRIMARY}
      summary={`${diff.added} added • ${diff.removed} removed • ${diff.modified} modified`}
    >
      <Section id="added" title="Added" count={diff.added}>
        {/* ... */}
      </Section>
      <Section id="removed" title="Removed" count={diff.removed}>
        {/* ... */}
      </Section>
      <Section id="modified" title="Modified" count={diff.modified}>
        {/* ... */}
      </Section>
    </Section>
  )
}
```

---

## Checklist for New Tool Integration

- [ ] Identified result type and data structure
- [ ] Mapped data fields to content types (cards, prose, tree, etc.)
- [ ] Designed section hierarchy with priorities
- [ ] Designed collapsed state summaries
- [ ] Created view directory under `src/tui/views/`
- [ ] Implemented view definition with `fetch` and `Component`
- [ ] Implemented main view component using `SectionContainer`
- [ ] Implemented section components with appropriate priorities
- [ ] Implemented card/content components as needed
- [ ] Registered view in `src/tui/views/index.ts`
- [ ] Tested manually with real data
- [ ] Tested edge cases (empty, large datasets)
- [ ] Added integration tests

---

## Tools Ready for Integration

The following commands have data structures ready but no TUI views:

| Command | Result Type | Primary Content | Notes |
|---------|-------------|-----------------|-------|
| `validate:a11y` | ValidateA11yResult | Violations by severity | Worked example above |
| `validate:html` | ValidateHtmlResult | HTML errors/warnings | Similar to a11y |
| `validate:schema` | ValidateSchemaResult | Schema test results | Grouped by schema type |
| `schema` | SchemaResult | Extracted schemas | JSON-LD, Open Graph, etc. |
| `bot` | BotResult | Content comparison | Static vs rendered diff |
| `a11y-tree` | A11yTreeResult | Accessibility tree | Tree display |
| `a11y-tree:compare` | A11yTreeCompareResult | Tree diff | Comparison pattern |
| `structure:js` | StructureJsResult | Structure comparison | Comparison pattern |
| `structure:compare` | StructureCompareResult | Focused diff | Comparison pattern |

Each has existing `fetch*()` functions in their command files.

---

## Next Steps

1. Start with `validate:a11y` as the first integration (richest example)
2. Extract common patterns into shared components
3. Integrate remaining validation tools
4. Migrate existing views (ai, structure) to use the framework
