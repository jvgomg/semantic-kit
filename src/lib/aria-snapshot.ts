// ============================================================================
// ARIA Snapshot Parsing and Formatting
// ============================================================================

// ============================================================================
// Types
// ============================================================================

export interface AriaNode {
  role: string
  name?: string
  attributes: Record<string, string | boolean>
  children: AriaNode[]
}

export interface AriaSnapshotAnalysis {
  nodes: AriaNode[]
  counts: Record<string, number>
}

// ============================================================================
// Parsing
// ============================================================================

/**
 * Parse ARIA snapshot YAML into structured data for analysis
 */
export function parseAriaSnapshot(snapshot: string): AriaNode[] {
  const lines = snapshot.split('\n').filter((line) => line.trim())
  const nodes: AriaNode[] = []
  const stack: { indent: number; children: AriaNode[] }[] = [
    { indent: -1, children: nodes },
  ]

  for (const line of lines) {
    const match = line.match(/^(\s*)- (.+)$/)
    if (!match) continue

    const indent = match[1].length
    const content = match[2]

    // Parse the node content
    const node = parseNodeContent(content)

    // Find the right parent based on indentation
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }

    // Add to current parent
    stack[stack.length - 1].children.push(node)

    // If this node might have children, push it to the stack
    if (content.endsWith(':')) {
      stack.push({ indent, children: node.children })
    }
  }

  return nodes
}

/**
 * Parse a single ARIA node line like: heading "Title" [level=1]
 */
function parseNodeContent(content: string): AriaNode {
  // Remove trailing colon if present
  const trimmed = content.replace(/:$/, '')

  // Match: role "name" [attr=value]
  const roleMatch = trimmed.match(/^(\w+)/)
  const role = roleMatch ? roleMatch[1] : 'unknown'

  // Match quoted name
  const nameMatch = trimmed.match(/"([^"]*)"/)
  const name = nameMatch ? nameMatch[1] : undefined

  // Match attributes in brackets
  const attributes: Record<string, string | boolean> = {}
  const attrMatch = trimmed.match(/\[([^\]]+)\]/)
  if (attrMatch) {
    const attrString = attrMatch[1]
    // Split by space to get individual attributes
    const attrs = attrString.split(/\s+/)
    for (const attr of attrs) {
      if (attr.includes('=')) {
        const [key, value] = attr.split('=')
        attributes[key] = value
      } else {
        // Boolean attribute like [checked] or [disabled]
        attributes[attr] = true
      }
    }
  }

  return { role, name, attributes, children: [] }
}

/**
 * Count nodes by role
 */
export function countByRole(nodes: AriaNode[]): Record<string, number> {
  const counts: Record<string, number> = {}

  function traverse(node: AriaNode) {
    counts[node.role] = (counts[node.role] || 0) + 1
    for (const child of node.children) {
      traverse(child)
    }
  }

  for (const node of nodes) {
    traverse(node)
  }

  return counts
}

/**
 * Analyze an ARIA snapshot into nodes and counts
 */
export function analyzeAriaSnapshot(snapshot: string): AriaSnapshotAnalysis {
  const nodes = parseAriaSnapshot(snapshot)
  const counts = countByRole(nodes)
  return { nodes, counts }
}

// ============================================================================
// Formatting
// ============================================================================

// Role categories for summary display
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

/**
 * Format role counts as a summary line
 */
function formatRoleCounts(
  counts: Record<string, number>,
  roles: string[],
): string {
  return roles
    .filter((r) => counts[r])
    .map((r) => `${r}: ${counts[r]}`)
    .join(', ')
}

export interface FormatOptions {
  title?: string
  timedOut?: boolean
}

/**
 * Format the ARIA snapshot with box-drawing
 */
export function formatAriaSnapshot(
  snapshot: string,
  url: string,
  options: FormatOptions = {},
): string {
  const { title = 'Accessibility Tree', timedOut = false } = options
  const lines: string[] = []
  const { counts } = analyzeAriaSnapshot(snapshot)

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push(`│ ${title}`)
  lines.push(`│ ${url}`)
  if (timedOut) {
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

  // Indent and prefix each line of the snapshot
  const snapshotLines = snapshot.split('\n')
  for (const snapshotLine of snapshotLines) {
    if (snapshotLine.trim()) {
      lines.push(`│   ${snapshotLine}`)
    }
  }

  lines.push('└─────────────────────────────────────────────────────────────')

  return lines.join('\n')
}

// ============================================================================
// Comparison
// ============================================================================

export interface SnapshotDiff {
  added: string[]
  removed: string[]
  countChanges: { role: string; static: number; hydrated: number }[]
}

/**
 * Compare two ARIA snapshots and return the differences
 */
export function compareSnapshots(
  staticSnapshot: string,
  hydratedSnapshot: string,
): SnapshotDiff {
  const staticAnalysis = analyzeAriaSnapshot(staticSnapshot)
  const hydratedAnalysis = analyzeAriaSnapshot(hydratedSnapshot)

  const staticLines = new Set(
    staticSnapshot.split('\n').filter((l) => l.trim()),
  )
  const hydratedLines = new Set(
    hydratedSnapshot.split('\n').filter((l) => l.trim()),
  )

  const added: string[] = []
  const removed: string[] = []

  for (const line of hydratedLines) {
    if (!staticLines.has(line)) {
      added.push(line)
    }
  }

  for (const line of staticLines) {
    if (!hydratedLines.has(line)) {
      removed.push(line)
    }
  }

  // Find count changes
  const allRoles = new Set([
    ...Object.keys(staticAnalysis.counts),
    ...Object.keys(hydratedAnalysis.counts),
  ])

  const countChanges: SnapshotDiff['countChanges'] = []
  for (const role of allRoles) {
    const staticCount = staticAnalysis.counts[role] || 0
    const hydratedCount = hydratedAnalysis.counts[role] || 0
    if (staticCount !== hydratedCount) {
      countChanges.push({ role, static: staticCount, hydrated: hydratedCount })
    }
  }

  // Sort by largest change
  countChanges.sort(
    (a, b) => Math.abs(b.hydrated - b.static) - Math.abs(a.hydrated - a.static),
  )

  return { added, removed, countChanges }
}

/**
 * Check if two snapshots have differences
 */
export function hasDifferences(diff: SnapshotDiff): boolean {
  return (
    diff.added.length > 0 ||
    diff.removed.length > 0 ||
    diff.countChanges.length > 0
  )
}
