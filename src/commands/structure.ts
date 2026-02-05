import { parseHTML } from 'linkedom'

import {
  runAxeOnStaticHtml,
  type AxeStaticResult,
  type RuleSet,
} from '../lib/axe-static.js'
import { fetchHtmlContent } from '../lib/fetch.js'
import {
  formatElements,
  formatHeadingsSummary,
  formatHeadingTree,
  formatLandmarkSkeleton,
  formatLandmarkSkeletonCompact,
  formatLinkGroups,
  formatOutline,
  formatViolations,
  formatViolationsCompact,
} from '../lib/formatting.js'
import { analyzeStructure, type StructureAnalysis } from '../lib/structure.js'
import { validateFormat } from '../lib/validation.js'

// ============================================================================
// Types
// ============================================================================

type OutputFormat = 'full' | 'brief' | 'compact' | 'json'

interface StructureOptions {
  format?: OutputFormat
  /** Run all JSDOM-safe accessibility rules instead of just structure rules */
  allRules?: boolean
}

/**
 * Format compact view output
 */
function formatCompact(
  analysis: StructureAnalysis,
  axeResult: AxeStaticResult,
  url: string,
): string {
  const lines: string[] = []

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Page Structure')
  lines.push(`│ ${url}`)
  lines.push('├─────────────────────────────────────────────────────────────')

  // Title
  if (analysis.title) {
    lines.push(`│ Title:      ${analysis.title}`)
  } else {
    lines.push('│ Title:      (none) ⚠')
  }

  // Language
  if (analysis.language) {
    lines.push(`│ Language:   ${analysis.language}`)
  } else {
    lines.push('│ Language:   (not set) ⚠')
  }

  // Skip links
  if (analysis.skipLinks.length > 0) {
    const targets = analysis.skipLinks.map((s) => s.target).join(', ')
    lines.push(`│ Skip links: ${analysis.skipLinks.length} (${targets})`)
  } else {
    lines.push('│ Skip links: (none) ⚠')
  }

  // Landmarks
  lines.push(
    `│ Landmarks:  ${formatLandmarkSkeletonCompact(analysis.landmarks.skeleton)}`,
  )

  // Headings
  lines.push(`│ Headings:   ${formatHeadingsSummary(analysis.headings.counts)}`)

  // Links
  lines.push(
    `│ Links:      ${analysis.links.internal.count} internal · ${analysis.links.external.count} external`,
  )

  // Violations summary
  lines.push(
    `│ Violations: ${formatViolationsCompact(axeResult.violationWarnings)}`,
  )

  lines.push('└─────────────────────────────────────────────────────────────')

  return lines.join('\n')
}

/**
 * Format expanded view output
 */
function formatExpanded(
  analysis: StructureAnalysis,
  axeResult: AxeStaticResult,
  url: string,
  truncate: boolean,
): string {
  const lines: string[] = []
  let hasTruncation = false
  const LIMIT = 5
  const showAll = !truncate

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Page Structure')
  lines.push(`│ ${url}`)
  lines.push('├─────────────────────────────────────────────────────────────')

  // Title
  if (analysis.title) {
    lines.push(`│ Title:      ${analysis.title}`)
  } else {
    lines.push('│ Title:      (none)')
  }

  // Language
  if (analysis.language) {
    lines.push(`│ Language:   ${analysis.language}`)
  } else {
    lines.push('│ Language:   (not set)')
  }

  // Skip links section
  lines.push('├─────────────────────────────────────────────────────────────')
  lines.push('│ Skip Links')
  if (analysis.skipLinks.length > 0) {
    for (const link of analysis.skipLinks) {
      lines.push(`│   "${link.text}" → ${link.target}`)
    }
  } else {
    lines.push('│   (none detected)')
  }

  // Landmarks section (skeleton with all roles)
  lines.push('├─────────────────────────────────────────────────────────────')
  lines.push('│ Landmarks')
  lines.push(...formatLandmarkSkeleton(analysis.landmarks.skeleton))

  // Elements section (unopinionated counts)
  lines.push('├─────────────────────────────────────────────────────────────')
  lines.push('│ Elements')
  lines.push(...formatElements(analysis.landmarks.elements))

  // Outline section (nested structure)
  lines.push('├─────────────────────────────────────────────────────────────')
  lines.push('│ Outline')
  if (analysis.landmarks.outline.length > 0) {
    lines.push(...formatOutline(analysis.landmarks.outline))
  } else {
    lines.push('│   (none)')
  }

  // Headings section
  lines.push('├─────────────────────────────────────────────────────────────')
  lines.push('│ Heading Outline')
  if (analysis.headings.outline.length > 0) {
    lines.push(...formatHeadingTree(analysis.headings.outline))
  } else {
    lines.push('│   (no headings)')
  }

  // Links section
  lines.push('├─────────────────────────────────────────────────────────────')
  lines.push('│ Links')

  // Internal links
  lines.push(`│   Internal (${analysis.links.internal.count}):`)
  if (analysis.links.internal.groups.length > 0) {
    const { lines: internalLines, truncated } = formatLinkGroups(
      analysis.links.internal.groups,
      showAll,
      LIMIT,
      '│     ',
    )
    lines.push(...internalLines)
    if (truncated > 0) {
      hasTruncation = true
      lines.push(`│     ... and ${truncated} more destinations`)
    }
  } else {
    lines.push('│     (none)')
  }

  // External links
  lines.push(`│   External (${analysis.links.external.count}):`)
  if (analysis.links.external.groups.length > 0) {
    const { lines: externalLines, truncated } = formatLinkGroups(
      analysis.links.external.groups,
      showAll,
      LIMIT,
      '│     ',
    )
    lines.push(...externalLines)
    if (truncated > 0) {
      hasTruncation = true
      lines.push(`│     ... and ${truncated} more domains`)
    }
  } else {
    lines.push('│     (none)')
  }

  // Violations section (definite accessibility failures)
  lines.push('├─────────────────────────────────────────────────────────────')
  lines.push('│ Violations')
  lines.push(...formatViolations(axeResult.violationWarnings))

  lines.push('└─────────────────────────────────────────────────────────────')

  // Show hint outside the box if anything was truncated
  if (hasTruncation) {
    lines.push('')
    lines.push('Omit --detail brief to show all')
  }

  return lines.join('\n')
}

// ============================================================================
// Exported Functions for TUI
// ============================================================================

/**
 * Structure result for TUI consumption
 */
export interface TuiStructureResult {
  url: string
  analysis: StructureAnalysis
  axeResult: AxeStaticResult
}

/**
 * Fetch and analyze page structure from a URL or file path.
 * This is the main entry point for programmatic use.
 */
export async function fetchStructure(target: string): Promise<TuiStructureResult> {
  const html = await fetchHtmlContent(target)
  const { document } = parseHTML(html)
  const baseUrl = target.startsWith('http') ? target : null
  const analysis = analyzeStructure(document, baseUrl)
  const axeResult = await runAxeOnStaticHtml(html, { ruleSet: 'structure' })
  analysis.warnings = axeResult.warnings

  return { url: target, analysis, axeResult }
}

/**
 * Render structure result to display lines for TUI.
 */
export function renderStructureLines(result: TuiStructureResult): string[] {
  const { url, analysis, axeResult } = result
  const lines: string[] = []

  lines.push('═══════════════════════════════════════════════')
  lines.push('  Page Structure')
  lines.push('═══════════════════════════════════════════════')
  lines.push('')

  // Title & Language
  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push(`│ ${url}`)
  lines.push('├─────────────────────────────────────────────────────────────')
  if (analysis.title) {
    lines.push(`│ Title:      ${analysis.title}`)
  } else {
    lines.push('│ Title:      (none) ⚠')
  }
  if (analysis.language) {
    lines.push(`│ Language:   ${analysis.language}`)
  } else {
    lines.push('│ Language:   (not set) ⚠')
  }
  lines.push('└─────────────────────────────────────────────────────────────')
  lines.push('')

  // Skip links
  lines.push('Skip Links')
  lines.push('─────────────────────────────────────────────────────────────')
  if (analysis.skipLinks.length > 0) {
    for (const link of analysis.skipLinks) {
      lines.push(`  "${link.text}" → ${link.target}`)
    }
  } else {
    lines.push('  (none detected) ⚠')
  }
  lines.push('')

  // Landmarks
  lines.push('Landmarks')
  lines.push('─────────────────────────────────────────────────────────────')
  const landmarkLines = formatLandmarkSkeleton(analysis.landmarks.skeleton)
  for (const line of landmarkLines) {
    lines.push(line.replace(/^│\s*/, '  '))
  }
  lines.push('')

  // Elements
  lines.push('Elements')
  lines.push('─────────────────────────────────────────────────────────────')
  const elementLines = formatElements(analysis.landmarks.elements)
  for (const line of elementLines) {
    lines.push(line.replace(/^│\s*/, '  '))
  }
  lines.push('')

  // Heading Outline
  lines.push('Heading Outline')
  lines.push('─────────────────────────────────────────────────────────────')
  if (analysis.headings.outline.length > 0) {
    const headingLines = formatHeadingTree(analysis.headings.outline)
    for (const line of headingLines) {
      lines.push(line.replace(/^│\s*/, '  '))
    }
  } else {
    lines.push('  (no headings)')
  }
  lines.push('')

  // Links
  lines.push('Links')
  lines.push('─────────────────────────────────────────────────────────────')
  lines.push(`  Internal (${analysis.links.internal.count}):`)
  if (analysis.links.internal.groups.length > 0) {
    const { lines: internalLines } = formatLinkGroups(
      analysis.links.internal.groups,
      false,
      5,
      '    ',
    )
    lines.push(...internalLines)
  } else {
    lines.push('    (none)')
  }
  lines.push(`  External (${analysis.links.external.count}):`)
  if (analysis.links.external.groups.length > 0) {
    const { lines: externalLines } = formatLinkGroups(
      analysis.links.external.groups,
      false,
      5,
      '    ',
    )
    lines.push(...externalLines)
  } else {
    lines.push('    (none)')
  }
  lines.push('')

  // Violations
  lines.push('Violations')
  lines.push('─────────────────────────────────────────────────────────────')
  const violationLines = formatViolations(axeResult.violationWarnings)
  for (const line of violationLines) {
    lines.push(line.replace(/^│\s*/, '  '))
  }

  return lines
}

// ============================================================================
// Main Command
// ============================================================================

const VALID_FORMATS: OutputFormat[] = ['full', 'brief', 'compact', 'json']

export async function structureView(
  target: string,
  options: StructureOptions,
): Promise<void> {
  const format = validateFormat(options.format, VALID_FORMATS)

  try {
    // Fetch the HTML
    const html = await fetchHtmlContent(target)

    // Parse with linkedom
    const { document } = parseHTML(html)

    // Determine base URL for link classification
    const baseUrl = target.startsWith('http') ? target : null

    // Analyze structure
    const analysis = analyzeStructure(document, baseUrl)

    // Determine which rule set to use
    const ruleSet: RuleSet = options.allRules ? 'all' : 'structure'

    // Run axe-core for authoritative accessibility warnings
    const axeResult = await runAxeOnStaticHtml(html, { ruleSet })
    analysis.warnings = axeResult.warnings

    // Fail if any tests returned inconclusive - this means a rule was added
    // that cannot run in jsdom and should be removed from the safe rules list
    if (axeResult.incomplete.length > 0) {
      const ruleIds = axeResult.incomplete.map((r) => r.id).join(', ')
      throw new Error(
        `Accessibility test(s) returned inconclusive results in jsdom: ${ruleIds}\n` +
          `These rules require a browser and should be removed from JSDOM_SAFE_RULES in axe-static.ts`,
      )
    }

    // JSON output
    if (format === 'json') {
      console.log(JSON.stringify(analysis, null, 2))
      return
    }

    // Compact view
    if (format === 'compact') {
      console.log(formatCompact(analysis, axeResult, target))
      return
    }

    // Expanded view (full or brief)
    const truncate = format === 'brief'
    console.log(formatExpanded(analysis, axeResult, target, truncate))
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`)
    } else {
      console.error('An unknown error occurred')
    }
    process.exit(1)
  }
}
