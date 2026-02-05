import { parseHTML } from 'linkedom'

import { fetchHtmlContent } from '../lib/fetch.js'
import {
  fetchRenderedHtml,
  PlaywrightNotInstalledError,
} from '../lib/playwright.js'
import {
  analyzeStructure,
  compareStructures,
  type StructureComparison,
  type LandmarkDiff,
  type HeadingDiff,
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

interface StructureCompareOptions {
  format?: OutputFormat
  timeout?: string
}

// ============================================================================
// Output Formatting
// ============================================================================

/**
 * Format a change value with + or - prefix
 */
function formatChange(value: number): string {
  if (value > 0) return `+${value}`
  if (value < 0) return `${value}`
  return '0'
}

/**
 * Format compact view
 */
function formatCompact(
  comparison: StructureComparison,
  url: string,
  timedOut: boolean,
): string {
  const lines: string[] = []
  const { summary } = comparison

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Structure Comparison')
  lines.push(`│ ${url}`)
  if (timedOut) {
    lines.push('│ ⚠ Timeout reached — comparison may be incomplete')
  }
  lines.push('├─────────────────────────────────────────────────────────────')

  if (!comparison.hasDifferences) {
    lines.push('│ ✓ No structural differences between static and hydrated')
  } else {
    const landmarkChange = summary.hydratedLandmarks - summary.staticLandmarks
    const headingChange = summary.hydratedHeadings - summary.staticHeadings
    const linkChange = summary.hydratedLinks - summary.staticLinks

    lines.push(
      `│ Landmarks: ${summary.staticLandmarks} → ${summary.hydratedLandmarks} (${formatChange(landmarkChange)})`,
    )
    lines.push(
      `│ Headings:  ${summary.staticHeadings} → ${summary.hydratedHeadings} (${formatChange(headingChange)})`,
    )
    lines.push(
      `│ Links:     ${summary.staticLinks} → ${summary.hydratedLinks} (${formatChange(linkChange)})`,
    )
  }

  lines.push('└─────────────────────────────────────────────────────────────')

  return lines.join('\n')
}

/**
 * Format landmark diffs for display
 */
function formatLandmarkDiffs(diffs: LandmarkDiff[]): string[] {
  const lines: string[] = []

  for (const diff of diffs) {
    const prefix = diff.change > 0 ? '+' : '-'
    lines.push(
      `│   ${prefix} ${diff.role}: ${diff.staticCount} → ${diff.hydratedCount}`,
    )
  }

  return lines
}

/**
 * Format heading diffs for display
 */
function formatHeadingDiffs(
  diffs: HeadingDiff[],
  showAll: boolean,
  limit: number,
): { lines: string[]; truncated: number } {
  const lines: string[] = []
  const added = diffs.filter((d) => d.status === 'added')
  const removed = diffs.filter((d) => d.status === 'removed')

  const addedToShow = showAll ? added : added.slice(0, limit)
  const removedToShow = showAll ? removed : removed.slice(0, limit)

  for (const h of addedToShow) {
    const text = h.text.length > 40 ? h.text.slice(0, 40) + '...' : h.text
    lines.push(`│   + h${h.level}: "${text}"`)
  }

  for (const h of removedToShow) {
    const text = h.text.length > 40 ? h.text.slice(0, 40) + '...' : h.text
    lines.push(`│   - h${h.level}: "${text}"`)
  }

  const truncated =
    added.length - addedToShow.length + (removed.length - removedToShow.length)

  return { lines, truncated }
}

/**
 * Format expanded view
 */
function formatExpanded(
  comparison: StructureComparison,
  url: string,
  timedOut: boolean,
  truncate: boolean,
): string {
  const lines: string[] = []
  let hasTruncation = false
  const LIMIT = 10
  const showAll = !truncate

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Structure Comparison')
  lines.push(`│ ${url}`)
  if (timedOut) {
    lines.push('│ ⚠ Timeout reached — comparison may be incomplete')
  }
  lines.push('├─────────────────────────────────────────────────────────────')

  if (!comparison.hasDifferences) {
    lines.push('│ ✓ No structural differences between static and hydrated')
    lines.push('└─────────────────────────────────────────────────────────────')
    return lines.join('\n')
  }

  // Summary section
  const { summary } = comparison
  lines.push('│ Summary')
  lines.push(
    `│   Landmarks: ${summary.staticLandmarks} → ${summary.hydratedLandmarks} (${formatChange(summary.hydratedLandmarks - summary.staticLandmarks)})`,
  )
  lines.push(
    `│   Headings:  ${summary.staticHeadings} → ${summary.hydratedHeadings} (${formatChange(summary.hydratedHeadings - summary.staticHeadings)})`,
  )
  lines.push(
    `│   Links:     ${summary.staticLinks} → ${summary.hydratedLinks} (${formatChange(summary.hydratedLinks - summary.staticLinks)})`,
  )

  // Metadata changes
  if (comparison.metadata.title || comparison.metadata.language) {
    lines.push('├─────────────────────────────────────────────────────────────')
    lines.push('│ Metadata Changes')
    if (comparison.metadata.title) {
      lines.push(
        `│   Title: "${comparison.metadata.title.static || '(none)'}" → "${comparison.metadata.title.hydrated || '(none)'}"`,
      )
    }
    if (comparison.metadata.language) {
      lines.push(
        `│   Language: "${comparison.metadata.language.static || '(none)'}" → "${comparison.metadata.language.hydrated || '(none)'}"`,
      )
    }
  }

  // Landmark changes
  if (comparison.landmarks.length > 0) {
    lines.push('├─────────────────────────────────────────────────────────────')
    lines.push('│ Landmark Changes')
    lines.push(...formatLandmarkDiffs(comparison.landmarks))
  }

  // Heading changes
  if (comparison.headings.length > 0) {
    lines.push('├─────────────────────────────────────────────────────────────')
    lines.push('│ Heading Changes')
    const { lines: headingLines, truncated } = formatHeadingDiffs(
      comparison.headings,
      showAll,
      LIMIT,
    )
    lines.push(...headingLines)
    if (truncated > 0) {
      hasTruncation = true
      lines.push(`│   ... and ${truncated} more`)
    }
  }

  // Link changes
  const { links } = comparison
  if (
    links.internalAdded > 0 ||
    links.internalRemoved > 0 ||
    links.externalAdded > 0 ||
    links.externalRemoved > 0
  ) {
    lines.push('├─────────────────────────────────────────────────────────────')
    lines.push('│ Link Changes')

    if (links.internalAdded > 0 || links.internalRemoved > 0) {
      const parts: string[] = []
      if (links.internalAdded > 0) parts.push(`+${links.internalAdded}`)
      if (links.internalRemoved > 0) parts.push(`-${links.internalRemoved}`)
      lines.push(`│   Internal: ${parts.join(', ')}`)

      // Show new destinations
      if (links.newInternalDestinations.length > 0) {
        const destsToShow = showAll
          ? links.newInternalDestinations
          : links.newInternalDestinations.slice(0, 5)
        for (const dest of destsToShow) {
          lines.push(`│     + ${dest}`)
        }
        if (!showAll && links.newInternalDestinations.length > 5) {
          hasTruncation = true
          lines.push(
            `│     ... and ${links.newInternalDestinations.length - 5} more destinations`,
          )
        }
      }
    }

    if (links.externalAdded > 0 || links.externalRemoved > 0) {
      const parts: string[] = []
      if (links.externalAdded > 0) parts.push(`+${links.externalAdded}`)
      if (links.externalRemoved > 0) parts.push(`-${links.externalRemoved}`)
      lines.push(`│   External: ${parts.join(', ')}`)

      // Show new domains
      if (links.newExternalDomains.length > 0) {
        const domainsToShow = showAll
          ? links.newExternalDomains
          : links.newExternalDomains.slice(0, 5)
        for (const domain of domainsToShow) {
          lines.push(`│     + ${domain}`)
        }
        if (!showAll && links.newExternalDomains.length > 5) {
          hasTruncation = true
          lines.push(
            `│     ... and ${links.newExternalDomains.length - 5} more domains`,
          )
        }
      }
    }
  }

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

export async function structureCompareView(
  target: string,
  options: StructureCompareOptions,
): Promise<void> {
  requireUrl(
    target,
    'structure:compare',
    'Local files cannot execute JavaScript.',
  )
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

    // Compare
    const comparison = compareStructures(staticAnalysis, hydratedAnalysis)

    // JSON output
    if (format === 'json') {
      console.log(JSON.stringify(comparison, null, 2))
      return
    }

    // Compact view
    if (format === 'compact') {
      console.log(formatCompact(comparison, target, timedOut))
      return
    }

    // Expanded view (full or brief)
    const truncate = format === 'brief'
    console.log(formatExpanded(comparison, target, timedOut, truncate))
  } catch (error) {
    if (error instanceof PlaywrightNotInstalledError) {
      console.error(
        `Error: The 'structure:compare' command requires Playwright to render JavaScript.\n\n${error.getInstallInstructions()}`,
      )
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`)
    } else {
      console.error('An unknown error occurred')
    }
    process.exit(1)
  }
}
