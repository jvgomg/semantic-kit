import {
  analyzeAriaSnapshot,
  compareSnapshots,
  hasDifferences,
} from '../../lib/aria-snapshot.js'
import { fetchAccessibilityComparison } from '../../lib/playwright.js'
import type { A11yCompareResult } from '../../lib/results.js'
import { registerView } from './registry.js'
import type { SubTabDefinition, ViewDefinition } from './types.js'

// ============================================================================
// Formatting Helpers (adapted from aria-snapshot.ts for TUI line-by-line)
// ============================================================================

const LANDMARK_ROLES = [
  'banner',
  'navigation',
  'main',
  'contentinfo',
  'complementary',
  'region',
]
const INTERACTIVE_ROLES = [
  'link',
  'button',
  'textbox',
  'checkbox',
  'radio',
  'combobox',
  'listbox',
  'slider',
]
const STRUCTURAL_ROLES = [
  'heading',
  'list',
  'listitem',
  'table',
  'row',
  'cell',
  'img',
]

function formatRoleCounts(
  counts: Record<string, number>,
  roles: string[],
): string {
  return roles
    .filter((r) => counts[r])
    .map((r) => `${r}: ${counts[r]}`)
    .join(', ')
}

function formatChange(value: number): string {
  if (value > 0) return `+${value}`
  if (value < 0) return `${value}`
  return '0'
}

// ============================================================================
// Render Functions
// ============================================================================

/**
 * Render static HTML accessibility tree (matches `a11y` CLI output)
 */
function renderStatic(data: A11yCompareResult): string[] {
  const { static: staticData, url } = data
  const { counts } = analyzeAriaSnapshot(staticData.snapshot)
  const lines: string[] = []

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Accessibility Tree (Static)')
  lines.push(`│ ${url}`)
  if (staticData.timedOut) {
    lines.push('│ ⚠ Timeout reached — showing partial content')
  }
  lines.push('├─────────────────────────────────────────────────────────────')

  // Summary section
  lines.push('│ Summary')

  const landmarkCounts = formatRoleCounts(counts, LANDMARK_ROLES)
  const structuralCounts = formatRoleCounts(counts, STRUCTURAL_ROLES)
  const interactiveCounts = formatRoleCounts(counts, INTERACTIVE_ROLES)

  if (landmarkCounts) {
    lines.push(`│   Landmarks:   ${landmarkCounts}`)
  }
  if (structuralCounts) {
    lines.push(`│   Structure:   ${structuralCounts}`)
  }
  if (interactiveCounts) {
    lines.push(`│   Interactive: ${interactiveCounts}`)
  }

  // Full tree section
  lines.push('├─────────────────────────────────────────────────────────────')
  lines.push('│ Accessibility Tree (ARIA Snapshot)')

  const snapshotLines = staticData.snapshot.split('\n')
  for (const snapshotLine of snapshotLines) {
    if (snapshotLine.trim()) {
      lines.push(`│   ${snapshotLine}`)
    }
  }

  lines.push('└─────────────────────────────────────────────────────────────')

  return lines
}

/**
 * Render JavaScript-rendered accessibility tree (matches `a11y:js` CLI output)
 */
function renderHydrated(data: A11yCompareResult): string[] {
  const { hydrated: hydratedData, url } = data
  const { counts } = analyzeAriaSnapshot(hydratedData.snapshot)
  const lines: string[] = []

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Accessibility Tree (Hydrated)')
  lines.push(`│ ${url}`)
  if (hydratedData.timedOut) {
    lines.push('│ ⚠ Timeout reached — showing partial content')
  }
  lines.push('├─────────────────────────────────────────────────────────────')

  // Summary section
  lines.push('│ Summary')

  const landmarkCounts = formatRoleCounts(counts, LANDMARK_ROLES)
  const structuralCounts = formatRoleCounts(counts, STRUCTURAL_ROLES)
  const interactiveCounts = formatRoleCounts(counts, INTERACTIVE_ROLES)

  if (landmarkCounts) {
    lines.push(`│   Landmarks:   ${landmarkCounts}`)
  }
  if (structuralCounts) {
    lines.push(`│   Structure:   ${structuralCounts}`)
  }
  if (interactiveCounts) {
    lines.push(`│   Interactive: ${interactiveCounts}`)
  }

  // Full tree section
  lines.push('├─────────────────────────────────────────────────────────────')
  lines.push('│ Accessibility Tree (ARIA Snapshot)')

  const snapshotLines = hydratedData.snapshot.split('\n')
  for (const snapshotLine of snapshotLines) {
    if (snapshotLine.trim()) {
      lines.push(`│   ${snapshotLine}`)
    }
  }

  lines.push('└─────────────────────────────────────────────────────────────')

  return lines
}

/**
 * Render comparison between static and JS-rendered (matches `a11y:compare` CLI output)
 */
function renderCompare(data: A11yCompareResult): string[] {
  const { static: staticData, hydrated: hydratedData, url, diff } = data
  const timedOut = staticData.timedOut || hydratedData.timedOut
  const lines: string[] = []
  const LIMIT = 15

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Accessibility Comparison')
  lines.push(`│ ${url}`)
  if (timedOut) {
    lines.push('│ ⚠ Timeout reached — comparison may be incomplete')
  }
  lines.push('├─────────────────────────────────────────────────────────────')

  if (!hasDifferences(diff)) {
    lines.push(
      '│ ✓ No differences between static and hydrated accessibility trees',
    )
    lines.push('└─────────────────────────────────────────────────────────────')
    return lines
  }

  // Summary of role count changes
  if (diff.countChanges.length > 0) {
    lines.push('│ Role Changes')
    for (const change of diff.countChanges) {
      const delta = change.hydrated - change.static
      lines.push(
        `│   ${change.role}: ${change.static} → ${change.hydrated} (${formatChange(delta)})`,
      )
    }
  }

  // Show added elements
  if (diff.added.length > 0) {
    lines.push('├─────────────────────────────────────────────────────────────')
    lines.push('│ Added by JavaScript')
    const addedToShow = diff.added.slice(0, LIMIT)
    for (const line of addedToShow) {
      const trimmed = line.trim()
      const display =
        trimmed.length > 55 ? trimmed.slice(0, 52) + '...' : trimmed
      lines.push(`│   + ${display}`)
    }
    if (diff.added.length > LIMIT) {
      lines.push(`│   ... and ${diff.added.length - LIMIT} more`)
    }
  }

  // Show removed elements
  if (diff.removed.length > 0) {
    lines.push('├─────────────────────────────────────────────────────────────')
    lines.push('│ Removed by JavaScript')
    const removedToShow = diff.removed.slice(0, LIMIT)
    for (const line of removedToShow) {
      const trimmed = line.trim()
      const display =
        trimmed.length > 55 ? trimmed.slice(0, 52) + '...' : trimmed
      lines.push(`│   - ${display}`)
    }
    if (diff.removed.length > LIMIT) {
      lines.push(`│   ... and ${diff.removed.length - LIMIT} more`)
    }
  }

  lines.push('└─────────────────────────────────────────────────────────────')

  return lines
}

// ============================================================================
// Sub-tabs
// ============================================================================

const subTabs: SubTabDefinition<A11yCompareResult>[] = [
  { id: 'static', label: 'Static', render: renderStatic },
  { id: 'hydrated', label: 'Hydrated', render: renderHydrated },
  { id: 'compare', label: 'Compare', render: renderCompare },
]

// ============================================================================
// View Definition
// ============================================================================

export const accessibilityView: ViewDefinition<A11yCompareResult> = {
  id: 'accessibility',
  label: 'a11y',
  description:
    'Accessibility tree analysis showing ARIA snapshots. Compare static HTML vs JavaScript-rendered content to identify hydration issues.',
  fetch: async (url: string): Promise<A11yCompareResult> => {
    const { static: staticResult, hydrated: hydratedResult } =
      await fetchAccessibilityComparison(url)

    const diff = compareSnapshots(
      staticResult.snapshot,
      hydratedResult.snapshot,
    )
    const staticAnalysis = analyzeAriaSnapshot(staticResult.snapshot)
    const hydratedAnalysis = analyzeAriaSnapshot(hydratedResult.snapshot)

    return {
      url,
      hasDifferences: hasDifferences(diff),
      static: {
        snapshot: staticResult.snapshot,
        counts: staticAnalysis.counts,
        timedOut: staticResult.timedOut,
      },
      hydrated: {
        snapshot: hydratedResult.snapshot,
        counts: hydratedAnalysis.counts,
        timedOut: hydratedResult.timedOut,
      },
      diff,
    }
  },
  render: renderStatic, // Default render (first tab)
  subTabs,
}

// Self-register
registerView(accessibilityView)
