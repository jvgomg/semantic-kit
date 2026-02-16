/**
 * Screen reader experience analysis.
 *
 * This module provides tools for analyzing how screen readers interpret web pages
 * by examining the accessibility tree. It extracts key information like landmarks,
 * headings, and navigation patterns that screen reader users rely on.
 */
import { analyzeAriaSnapshot, type AriaNode } from './aria-snapshot.js'
import {
  fetchAccessibilitySnapshot,
  type AccessibilitySnapshotResult,
} from './playwright.js'
import type {
  ScreenReaderHeading,
  ScreenReaderLandmark,
  ScreenReaderResult,
  ScreenReaderSummary,
} from './results.js'

// ============================================================================
// Constants
// ============================================================================

/**
 * ARIA landmark roles that help screen reader users navigate page sections.
 * These include semantic regions like banner, navigation, main content, etc.
 */
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

/**
 * ARIA roles for form controls that screen readers announce specially.
 * Includes text inputs, checkboxes, selects, and other interactive elements.
 */
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
 *
 * Screen readers announce the page title when navigating to a new page.
 * This function looks for the document title first, then falls back to
 * the first h1 heading if no document title is found.
 *
 * @param nodes - The accessibility tree nodes to search
 * @returns The page title, or null if none found
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
 * Find the first heading at a specific level in the accessibility tree.
 *
 * Screen readers allow users to navigate by headings, so finding the first
 * heading at a given level helps understand the page structure.
 *
 * @param nodes - The accessibility tree nodes to search
 * @param level - The heading level to find (1-6)
 * @returns The first heading at the specified level, or null if none found
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
 * Extract all headings from the accessibility tree in document order.
 *
 * Screen readers let users navigate by headings and get a list of all headings.
 * This provides the complete heading outline that screen reader users see.
 *
 * @param nodes - The accessibility tree nodes to traverse
 * @returns Array of all headings in document order
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
 * Extract landmark information from the accessibility tree.
 *
 * Landmarks help screen reader users understand page structure and navigate
 * to different sections. This function identifies all landmarks and counts
 * their child elements to help assess content organization.
 *
 * @param nodes - The accessibility tree nodes to analyze
 * @returns Array of landmarks with their metadata
 */
function extractLandmarks(nodes: AriaNode[]): ScreenReaderLandmark[] {
  const landmarks: ScreenReaderLandmark[] = []

  function countInSubtree(node: AriaNode, role: string): number {
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
 * Check if the page has a skip link for keyboard and screen reader navigation.
 *
 * Skip links help users bypass repetitive navigation and jump to main content.
 * This function looks for links early in the document that match common skip
 * link patterns like "Skip to content" or "Skip to main".
 *
 * @param nodes - The accessibility tree nodes to check
 * @returns True if a skip link is found
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
 * Build a summary of key screen reader metrics from the accessibility tree.
 *
 * This aggregates role counts and analysis into a high-level summary that
 * helps understand the overall screen reader experience.
 *
 * @param nodes - The accessibility tree nodes
 * @param counts - Role counts from the accessibility tree
 * @returns Summary object with key metrics
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
 * Analyze how a screen reader would interpret a web page.
 *
 * This function fetches the accessibility tree for a page and analyzes it
 * to understand the screen reader experience. It extracts landmarks, headings,
 * and other key information that screen reader users rely on for navigation.
 *
 * Always uses JavaScript rendering because real screen readers interact with
 * the rendered page, not static HTML. Screen readers run after JavaScript
 * has modified the DOM and built the accessibility tree.
 *
 * @param target - URL or file path to analyze
 * @param timeoutMs - Maximum time to wait for page load (default: 5000ms)
 * @returns Analysis of the screen reader experience
 *
 * @example
 * ```typescript
 * const result = await analyzeScreenReaderExperience('https://example.com')
 * console.log('Page title:', result.summary.pageTitle)
 * console.log('Landmarks:', result.landmarks.length)
 * console.log('Has main landmark:', result.summary.hasMainLandmark)
 * ```
 */
export async function analyzeScreenReaderExperience(
  target: string,
  timeoutMs: number = 5000,
): Promise<ScreenReaderResult> {
  // Fetch accessibility snapshot with JavaScript enabled
  const { snapshot, timedOut }: AccessibilitySnapshotResult =
    await fetchAccessibilitySnapshot(target, {
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
