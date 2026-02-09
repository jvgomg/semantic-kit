/**
 * Screen reader command runner.
 *
 * Fetches the accessibility tree (with JavaScript enabled) and transforms
 * it into a user-friendly format that helps understand the screen reader
 * experience.
 */
import type { AriaNode } from '../../lib/aria-snapshot.js'
import { analyzeAriaSnapshot } from '../../lib/aria-snapshot.js'
import { fetchAccessibilitySnapshot } from '../../lib/playwright.js'
import type {
  ScreenReaderHeading,
  ScreenReaderLandmark,
  ScreenReaderResult,
  ScreenReaderSummary,
} from '../../lib/results.js'

// ============================================================================
// Constants
// ============================================================================

const LANDMARK_ROLES = [
  'banner',
  'navigation',
  'main',
  'contentinfo',
  'complementary',
  'region',
  'search',
  'form',
]

const FORM_CONTROL_ROLES = [
  'textbox',
  'checkbox',
  'radio',
  'combobox',
  'listbox',
  'slider',
  'spinbutton',
  'switch',
  'searchbox',
]

// ============================================================================
// Analysis Helpers
// ============================================================================

/**
 * Extract the page title from the accessibility tree.
 * Looks for document title or first h1.
 */
function extractPageTitle(nodes: AriaNode[]): string | null {
  // Look for document role with name
  for (const node of nodes) {
    if (node.role === 'document' && node.name) {
      return node.name
    }
  }

  // Fall back to first heading level 1
  const firstH1 = findFirstHeading(nodes, 1)
  return firstH1?.text ?? null
}

/**
 * Find the first heading at a specific level.
 */
function findFirstHeading(
  nodes: AriaNode[],
  level: number,
): ScreenReaderHeading | null {
  for (const node of nodes) {
    if (node.role === 'heading') {
      const nodeLevel = parseInt(node.attributes['level'] as string, 10)
      if (nodeLevel === level && node.name) {
        return { level: nodeLevel, text: node.name }
      }
    }
    const found = findFirstHeading(node.children, level)
    if (found) return found
  }
  return null
}

/**
 * Extract all headings from the tree in document order.
 */
function extractHeadings(nodes: AriaNode[]): ScreenReaderHeading[] {
  const headings: ScreenReaderHeading[] = []

  function traverse(node: AriaNode) {
    if (node.role === 'heading' && node.name) {
      const level = parseInt(node.attributes['level'] as string, 10) || 1
      headings.push({ level, text: node.name })
    }
    for (const child of node.children) {
      traverse(child)
    }
  }

  for (const node of nodes) {
    traverse(node)
  }

  return headings
}

/**
 * Extract landmark information from the tree.
 */
function extractLandmarks(nodes: AriaNode[]): ScreenReaderLandmark[] {
  const landmarks: ScreenReaderLandmark[] = []

  function countInSubtree(
    node: AriaNode,
    role: string,
  ): number {
    let count = node.role === role ? 1 : 0
    for (const child of node.children) {
      count += countInSubtree(child, role)
    }
    return count
  }

  function traverse(node: AriaNode) {
    if (LANDMARK_ROLES.includes(node.role)) {
      landmarks.push({
        role: node.role,
        name: node.name ?? null,
        headingCount: countInSubtree(node, 'heading'),
        linkCount: countInSubtree(node, 'link'),
      })
    }
    for (const child of node.children) {
      traverse(child)
    }
  }

  for (const node of nodes) {
    traverse(node)
  }

  return landmarks
}

/**
 * Check if the page has a skip link (link early in document that targets main content).
 */
function hasSkipLink(nodes: AriaNode[]): boolean {
  // Look for links early in the tree that might be skip links
  // Common patterns: "Skip to content", "Skip to main", "Skip navigation"
  const skipLinkPatterns = [
    /skip\s*(to)?\s*(main|content|navigation)/i,
    /jump\s*(to)?\s*(main|content|navigation)/i,
  ]

  function checkNode(node: AriaNode, depth: number): boolean {
    // Only check early links (within first 10 elements)
    if (depth > 10) return false

    if (node.role === 'link' && node.name) {
      for (const pattern of skipLinkPatterns) {
        if (pattern.test(node.name)) {
          return true
        }
      }
    }

    for (const child of node.children) {
      if (checkNode(child, depth + 1)) return true
    }
    return false
  }

  for (const node of nodes) {
    if (checkNode(node, 0)) return true
  }
  return false
}

/**
 * Build the summary from role counts and analysis.
 */
function buildSummary(
  nodes: AriaNode[],
  counts: Record<string, number>,
): ScreenReaderSummary {
  const landmarkCount = LANDMARK_ROLES.reduce(
    (sum, role) => sum + (counts[role] || 0),
    0,
  )

  const formControlCount = FORM_CONTROL_ROLES.reduce(
    (sum, role) => sum + (counts[role] || 0),
    0,
  )

  return {
    pageTitle: extractPageTitle(nodes),
    landmarkCount,
    headingCount: counts['heading'] || 0,
    linkCount: counts['link'] || 0,
    formControlCount,
    imageCount: counts['img'] || 0,
    hasMainLandmark: (counts['main'] || 0) > 0,
    hasNavigation: (counts['navigation'] || 0) > 0,
    hasSkipLink: hasSkipLink(nodes),
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Fetch and analyze how a screen reader would interpret a page.
 *
 * Always uses JavaScript rendering because real screen readers
 * interact with the rendered page, not static HTML.
 */
export async function fetchScreenReader(
  target: string,
  timeoutMs: number = 5000,
): Promise<ScreenReaderResult> {
  // Fetch accessibility snapshot with JavaScript enabled
  const { snapshot, timedOut } = await fetchAccessibilitySnapshot(target, {
    javaScriptEnabled: true,
    timeoutMs,
  })

  // Parse and analyze the snapshot
  const { nodes, counts } = analyzeAriaSnapshot(snapshot)

  // Build user-friendly analysis
  const summary = buildSummary(nodes, counts)
  const landmarks = extractLandmarks(nodes)
  const headings = extractHeadings(nodes)

  return {
    url: target,
    timedOut,
    summary,
    landmarks,
    headings,
    snapshot,
    parsed: nodes,
    counts,
  }
}
