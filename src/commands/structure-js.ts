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
import {
  fetchRenderedHtml,
  PlaywrightNotInstalledError,
} from '../lib/playwright.js'
import type { StructureJsResult } from '../lib/results.js'
import {
  analyzeStructure,
  compareStructures,
  type StructureAnalysis,
  type StructureComparison,
} from '../lib/structure.js'
import {
  requireUrl,
  validateFormat,
  validateTimeout,
} from '../lib/validation.js'

// ============================================================================
// Types
// ============================================================================

type OutputFormat = 'full' | 'brief' | 'compact' | 'json'

interface StructureJsOptions {
  format?: OutputFormat
  timeout?: string
  /** Run all JSDOM-safe accessibility rules instead of just structure rules */
  allRules?: boolean
}

/**
 * Format compact view with comparison
 */
function formatCompact(
  analysis: StructureAnalysis,
  axeResult: AxeStaticResult,
  comparison: StructureComparison,
  url: string,
  timedOut: boolean,
): string {
  const lines: string[] = []

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Page Structure (Hydrated)')
  lines.push(`│ ${url}`)
  if (timedOut) {
    lines.push('│ ⚠ Timeout reached — showing partial content')
  }
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

  // Landmarks with comparison
  const landmarkDiff =
    comparison.summary.hydratedLandmarks - comparison.summary.staticLandmarks
  const landmarkSuffix = landmarkDiff > 0 ? ` (+${landmarkDiff} from JS)` : ''
  lines.push(
    `│ Landmarks:  ${formatLandmarkSkeletonCompact(analysis.landmarks.skeleton)}${landmarkSuffix}`,
  )

  // Headings with comparison
  const headingDiff =
    comparison.summary.hydratedHeadings - comparison.summary.staticHeadings
  const headingSuffix = headingDiff > 0 ? ` (+${headingDiff} from JS)` : ''
  lines.push(
    `│ Headings:   ${formatHeadingsSummary(analysis.headings.counts)}${headingSuffix}`,
  )

  // Links with comparison
  const linkDiff =
    comparison.summary.hydratedLinks - comparison.summary.staticLinks
  const linkSuffix = linkDiff > 0 ? ` (+${linkDiff} from JS)` : ''
  lines.push(
    `│ Links:      ${analysis.links.internal.count} internal · ${analysis.links.external.count} external${linkSuffix}`,
  )

  // Violations summary
  lines.push(
    `│ Violations: ${formatViolationsCompact(axeResult.violationWarnings)}`,
  )

  lines.push('└─────────────────────────────────────────────────────────────')

  return lines.join('\n')
}

/**
 * Format expanded view with comparison
 */
function formatExpanded(
  analysis: StructureAnalysis,
  axeResult: AxeStaticResult,
  comparison: StructureComparison,
  url: string,
  timedOut: boolean,
  truncate: boolean,
): string {
  const lines: string[] = []
  let hasTruncation = false
  const LIMIT = 5
  const showAll = !truncate

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Page Structure (Hydrated)')
  lines.push(`│ ${url}`)
  if (timedOut) {
    lines.push('│ ⚠ Timeout reached — showing partial content')
  }

  // Show comparison summary if there are differences
  if (comparison.hasDifferences) {
    lines.push('├─────────────────────────────────────────────────────────────')
    lines.push('│ Static vs Hydrated Comparison')
    if (
      comparison.summary.staticLandmarks !==
      comparison.summary.hydratedLandmarks
    ) {
      lines.push(
        `│   Landmarks: ${comparison.summary.staticLandmarks} → ${comparison.summary.hydratedLandmarks}`,
      )
    }
    if (
      comparison.summary.staticHeadings !== comparison.summary.hydratedHeadings
    ) {
      lines.push(
        `│   Headings:  ${comparison.summary.staticHeadings} → ${comparison.summary.hydratedHeadings}`,
      )
    }
    if (comparison.summary.staticLinks !== comparison.summary.hydratedLinks) {
      lines.push(
        `│   Links:     ${comparison.summary.staticLinks} → ${comparison.summary.hydratedLinks}`,
      )
    }
  }

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
    lines.push('Omit --format brief to show all')
  }

  return lines.join('\n')
}

// ============================================================================
// Main Command
// ============================================================================

const VALID_FORMATS: OutputFormat[] = ['full', 'brief', 'compact', 'json']

export async function structureJsView(
  target: string,
  options: StructureJsOptions,
): Promise<void> {
  requireUrl(target, 'structure:js', 'Local files cannot execute JavaScript.')
  const timeoutMs = validateTimeout(options.timeout)
  const format = validateFormat(options.format, VALID_FORMATS)

  try {
    // Fetch both static and hydrated HTML in parallel
    const [staticHtml, { html: hydratedHtml, timedOut }] = await Promise.all([
      fetchHtmlContent(target),
      fetchRenderedHtml(target, timeoutMs),
    ])

    // Parse both
    const { document: staticDoc } = parseHTML(staticHtml)
    const { document: hydratedDoc } = parseHTML(hydratedHtml)

    // Analyze both
    const staticAnalysis = analyzeStructure(staticDoc, target)
    const hydratedAnalysis = analyzeStructure(hydratedDoc, target)

    // Determine which rule set to use
    const ruleSet: RuleSet = options.allRules ? 'all' : 'structure'

    // Run axe-core on hydrated HTML for authoritative warnings
    const axeResult = await runAxeOnStaticHtml(hydratedHtml, { ruleSet })
    hydratedAnalysis.warnings = axeResult.warnings

    // Fail if any tests returned inconclusive - this means a rule was added
    // that cannot run in jsdom and should be removed from the safe rules list
    if (axeResult.incomplete.length > 0) {
      const ruleIds = axeResult.incomplete.map((r) => r.id).join(', ')
      throw new Error(
        `Accessibility test(s) returned inconclusive results in jsdom: ${ruleIds}\n` +
          `These rules require a browser and should be removed from JSDOM_SAFE_RULES in axe-static.ts`,
      )
    }

    // Compare
    const comparison = compareStructures(staticAnalysis, hydratedAnalysis)

    // Build the result
    const result: StructureJsResult = {
      static: staticAnalysis,
      hydrated: hydratedAnalysis,
      comparison,
      timedOut,
    }

    // JSON output
    if (format === 'json') {
      console.log(JSON.stringify(result, null, 2))
      return
    }

    // Compact view
    if (format === 'compact') {
      console.log(
        formatCompact(
          hydratedAnalysis,
          axeResult,
          comparison,
          target,
          timedOut,
        ),
      )
      return
    }

    // Expanded view (full or brief)
    const truncate = format === 'brief'
    console.log(
      formatExpanded(
        hydratedAnalysis,
        axeResult,
        comparison,
        target,
        timedOut,
        truncate,
      ),
    )
  } catch (error) {
    if (error instanceof PlaywrightNotInstalledError) {
      console.error(
        `Error: The 'structure:js' command requires Playwright to render JavaScript.\n\n${error.getInstallInstructions()}`,
      )
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`)
    } else {
      console.error('An unknown error occurred')
    }
    process.exit(1)
  }
}
