import type { OutputFormat } from '../../lib/arguments.js'
import {
  colorize,
  colors,
  createFormatterContext,
  formatIssues,
  formatTable,
  type Issue,
  type TableRow,
} from '../../lib/cli-formatting/index.js'
import type { OutputMode } from '../../lib/output-mode.js'
import type { SchemaCompareResult, SchemaResult } from '../../lib/results.js'

// ============================================================================
// Helpers
// ============================================================================

/**
 * Truncate string for display
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Format a value for display
 */
function formatValue(value: unknown, maxLength = 60): string {
  if (value === null || value === undefined) return '(empty)'
  if (typeof value === 'string') {
    const cleaned = value.replace(/\s+/g, ' ').trim()
    return truncate(cleaned, maxLength)
  }
  if (Array.isArray(value)) {
    return truncate(value.join(', '), maxLength)
  }
  if (typeof value === 'object') {
    return truncate(JSON.stringify(value), maxLength)
  }
  return String(value)
}

/**
 * Flatten nested schema properties for display
 */
function flattenSchemaProperties(
  obj: unknown,
  prefix = '',
): Array<{ path: string; value: unknown }> {
  const results: Array<{ path: string; value: unknown }> = []

  if (obj === null || obj === undefined) {
    return results
  }

  if (typeof obj !== 'object') {
    return [{ path: prefix, value: obj }]
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      results.push(...flattenSchemaProperties(item, `${prefix}[${index}]`))
    })
    return results
  }

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    // Skip @context and @type at nested levels
    if (key === '@context') continue

    const path = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // For nested objects, show the @type if present, then recurse
      const nestedObj = value as Record<string, unknown>
      if (nestedObj['@type']) {
        results.push({ path, value: `{${nestedObj['@type']}}` })
      }
      results.push(...flattenSchemaProperties(value, path))
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        results.push({ path, value: '[]' })
      } else if (typeof value[0] === 'object') {
        results.push(...flattenSchemaProperties(value, path))
      } else {
        results.push({ path, value })
      }
    } else {
      results.push({ path, value })
    }
  }

  return results
}

/**
 * Check if result has any structured data
 */
function hasAnyData(result: SchemaResult): boolean {
  const jsonldSchemas = Object.keys(result.jsonld).filter(
    (k) => k !== 'undefined',
  )
  const microdataSchemas = Object.keys(result.microdata).filter(
    (k) => k !== 'undefined',
  )
  const rdfaSchemas = Object.keys(result.rdfa).filter((k) => k !== 'undefined')

  return (
    jsonldSchemas.length > 0 ||
    microdataSchemas.length > 0 ||
    rdfaSchemas.length > 0 ||
    result.openGraph !== null ||
    result.twitter !== null
  )
}

// ============================================================================
// Issue Building
// ============================================================================

/**
 * Build an array of issues from the schema result.
 * Issues are ordered by priority (highest first):
 * 1. No structured data (info)
 * 2. OG missing required (warning/medium)
 * 3. Twitter missing required (warning/medium)
 * 4. OG missing recommended (warning/low)
 * 5. Twitter missing recommended (warning/low)
 */
export function buildIssues(result: SchemaResult): Issue[] {
  const issues: Issue[] = []

  // 1. No structured data found
  if (!hasAnyData(result)) {
    issues.push({
      type: 'info',
      severity: 'low',
      title: 'No Structured Data Found',
      description: 'This page has no structured data.',
      tip: 'Consider adding JSON-LD for rich search results, Open Graph for social sharing.',
    })
    return issues
  }

  // 2. OG missing required
  if (result.openGraph && result.openGraph.missingRequired.length > 0) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Open Graph Incomplete',
      description: `Missing required: ${result.openGraph.missingRequired.join(', ')}`,
      tip: 'Required for proper social sharing on Facebook and LinkedIn.',
    })
  }

  // 3. Twitter missing required
  if (result.twitter && result.twitter.missingRequired.length > 0) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Twitter Cards Incomplete',
      description: `Missing required: ${result.twitter.missingRequired.join(', ')}`,
    })
  }

  // 4. OG missing recommended
  if (result.openGraph && result.openGraph.missingRecommended.length > 0) {
    issues.push({
      type: 'warning',
      severity: 'low',
      title: 'Open Graph Missing Recommended Tags',
      description: `Consider adding: ${result.openGraph.missingRecommended.join(', ')}`,
    })
  }

  // 5. Twitter missing recommended
  if (result.twitter && result.twitter.missingRecommended.length > 0) {
    issues.push({
      type: 'warning',
      severity: 'low',
      title: 'Twitter Cards Missing Recommended Tags',
      description: `Consider adding: ${result.twitter.missingRecommended.join(', ')}`,
    })
  }

  return issues
}

// ============================================================================
// Section Builders
// ============================================================================

/**
 * Build JSON-LD sections with numbered headers
 */
function buildJsonLdSections(
  result: SchemaResult,
  ctx: ReturnType<typeof createFormatterContext>,
): string[] {
  const sections: string[] = []
  const jsonldSchemas = Object.entries(result.jsonld).filter(
    ([key]) => key !== 'undefined',
  )

  let globalIndex = 0
  for (const [schemaType, instances] of jsonldSchemas) {
    const instanceArray = instances as unknown[]
    for (const instance of instanceArray) {
      const headerText = `JSON-LD: ${schemaType.toUpperCase()} #${globalIndex}`
      const header = ctx.mode === 'tty' ? colorize(headerText, colors.gray, ctx) : headerText
      const properties = flattenSchemaProperties(instance)
      const rows: TableRow[] = properties
        .filter(({ path }) => path !== '@type')
        .map(({ path, value }) => ({
          key: path,
          value: formatValue(value),
        }))

      if (rows.length > 0) {
        sections.push(`${header}\n${formatTable(rows, ctx)}`)
      } else {
        sections.push(header)
      }
      globalIndex++
    }
  }

  return sections
}

/**
 * Build Microdata sections with numbered headers
 */
function buildMicrodataSections(
  result: SchemaResult,
  ctx: ReturnType<typeof createFormatterContext>,
): string[] {
  const sections: string[] = []
  const microdataSchemas = Object.entries(result.microdata).filter(
    ([key]) => key !== 'undefined',
  )

  let globalIndex = 0
  for (const [schemaType, instances] of microdataSchemas) {
    const instanceArray = instances as unknown[]
    for (const instance of instanceArray) {
      const headerText = `MICRODATA: ${schemaType.toUpperCase()} #${globalIndex}`
      const header = ctx.mode === 'tty' ? colorize(headerText, colors.gray, ctx) : headerText
      const properties = flattenSchemaProperties(instance)
      const rows: TableRow[] = properties.map(({ path, value }) => ({
        key: path,
        value: formatValue(value),
      }))

      if (rows.length > 0) {
        sections.push(`${header}\n${formatTable(rows, ctx)}`)
      } else {
        sections.push(header)
      }
      globalIndex++
    }
  }

  return sections
}

/**
 * Build RDFa sections with numbered headers
 */
function buildRdfaSections(
  result: SchemaResult,
  ctx: ReturnType<typeof createFormatterContext>,
): string[] {
  const sections: string[] = []
  const rdfaSchemas = Object.entries(result.rdfa).filter(
    ([key]) => key !== 'undefined',
  )

  let globalIndex = 0
  for (const [schemaType, instances] of rdfaSchemas) {
    const instanceArray = instances as unknown[]
    for (const instance of instanceArray) {
      const headerText = `RDFA: ${schemaType.toUpperCase()} #${globalIndex}`
      const header = ctx.mode === 'tty' ? colorize(headerText, colors.gray, ctx) : headerText
      const properties = flattenSchemaProperties(instance)
      const rows: TableRow[] = properties.map(({ path, value }) => ({
        key: path,
        value: formatValue(value),
      }))

      if (rows.length > 0) {
        sections.push(`${header}\n${formatTable(rows, ctx)}`)
      } else {
        sections.push(header)
      }
      globalIndex++
    }
  }

  return sections
}

/**
 * Build Open Graph section
 */
function buildOpenGraphSection(
  result: SchemaResult,
  ctx: ReturnType<typeof createFormatterContext>,
): string | null {
  if (!result.openGraph) return null

  const rows: TableRow[] = Object.entries(result.openGraph.tags).map(
    ([name, value]) => ({
      key: name,
      value: formatValue(value),
    }),
  )

  if (rows.length === 0) return null

  const header = ctx.mode === 'tty' ? colorize('OPEN GRAPH', colors.gray, ctx) : 'OPEN GRAPH'
  return `${header}\n${formatTable(rows, ctx)}`
}

/**
 * Build Twitter section
 */
function buildTwitterSection(
  result: SchemaResult,
  ctx: ReturnType<typeof createFormatterContext>,
): string | null {
  if (!result.twitter) return null

  const rows: TableRow[] = Object.entries(result.twitter.tags).map(
    ([name, value]) => ({
      key: name,
      value: formatValue(value),
    }),
  )

  if (rows.length === 0) return null

  const header = ctx.mode === 'tty' ? colorize('TWITTER', colors.gray, ctx) : 'TWITTER'
  return `${header}\n${formatTable(rows, ctx)}`
}

/**
 * Build Meta section
 */
function buildMetaSection(
  result: SchemaResult,
  ctx: ReturnType<typeof createFormatterContext>,
): string | null {
  const commonMetatags = [
    'description',
    'author',
    'viewport',
    'robots',
    'canonical',
  ]
  const filteredMetatags = Object.entries(result.metatags).filter(([name]) =>
    commonMetatags.includes(name),
  )

  if (filteredMetatags.length === 0) return null

  const rows: TableRow[] = filteredMetatags.map(([name, value]) => ({
    key: name,
    value: formatValue(value),
  }))

  const header = ctx.mode === 'tty' ? colorize('META', colors.gray, ctx) : 'META'
  return `${header}\n${formatTable(rows, ctx)}`
}

// ============================================================================
// Compact Mode
// ============================================================================

/**
 * Build compact summary table
 */
function buildCompactSummary(
  result: SchemaResult,
  ctx: ReturnType<typeof createFormatterContext>,
): string {
  const rows: TableRow[] = []

  // JSON-LD
  const jsonldSchemas = Object.keys(result.jsonld).filter(
    (k) => k !== 'undefined',
  )
  if (jsonldSchemas.length > 0) {
    rows.push({ key: 'JSON-LD', value: jsonldSchemas.join(', ') })
  } else {
    rows.push({ key: 'JSON-LD', value: '(none)' })
  }

  // Microdata
  const microdataSchemas = Object.keys(result.microdata).filter(
    (k) => k !== 'undefined',
  )
  if (microdataSchemas.length > 0) {
    rows.push({ key: 'Microdata', value: microdataSchemas.join(', ') })
  }

  // RDFa
  const rdfaSchemas = Object.keys(result.rdfa).filter((k) => k !== 'undefined')
  if (rdfaSchemas.length > 0) {
    rows.push({ key: 'RDFa', value: rdfaSchemas.join(', ') })
  }

  // Open Graph
  if (result.openGraph) {
    const tagCount = Object.keys(result.openGraph.tags).length
    const status = result.openGraph.isComplete
      ? `${tagCount} tags`
      : `${tagCount} tags (incomplete)`
    rows.push({ key: 'Open Graph', value: status })
  } else {
    rows.push({ key: 'Open Graph', value: '(none)' })
  }

  // Twitter
  if (result.twitter) {
    const tagCount = Object.keys(result.twitter.tags).length
    const status = result.twitter.isComplete
      ? `${tagCount} tags`
      : `${tagCount} tags (incomplete)`
    rows.push({ key: 'Twitter', value: status })
  } else {
    rows.push({ key: 'Twitter', value: '(none)' })
  }

  // Meta
  const commonMetatags = [
    'description',
    'author',
    'viewport',
    'robots',
    'canonical',
  ]
  const filteredMetatags = Object.entries(result.metatags).filter(([name]) =>
    commonMetatags.includes(name),
  )
  if (filteredMetatags.length > 0) {
    rows.push({ key: 'Meta', value: `${filteredMetatags.length} tags` })
  }

  const header = ctx.mode === 'tty' ? colorize('SCHEMAS', colors.gray, ctx) : 'SCHEMAS'
  return `${header}\n${formatTable(rows, ctx)}`
}

// ============================================================================
// Output Formats
// ============================================================================

/**
 * Format terminal output - full or compact mode.
 */
function formatTerminal(
  result: SchemaResult,
  ctx: ReturnType<typeof createFormatterContext>,
  options?: { compact?: boolean },
): string {
  const compact = options?.compact ?? false
  const sections: string[] = []

  // Issues section with success message
  const issues = buildIssues(result)
  const issuesSection = formatIssues(issues, ctx, {
    compact,
    successMessage: 'All structured data is properly configured',
  })
  if (issuesSection) {
    sections.push(issuesSection)
  }

  if (compact) {
    // Compact mode: summary table only
    sections.push(buildCompactSummary(result, ctx))
  } else {
    // Full mode: all sections

    // JSON-LD sections
    const jsonldSections = buildJsonLdSections(result, ctx)
    sections.push(...jsonldSections)

    // Microdata sections
    const microdataSections = buildMicrodataSections(result, ctx)
    sections.push(...microdataSections)

    // RDFa sections
    const rdfaSections = buildRdfaSections(result, ctx)
    sections.push(...rdfaSections)

    // Open Graph
    const ogSection = buildOpenGraphSection(result, ctx)
    if (ogSection) {
      sections.push(ogSection)
    }

    // Twitter
    const twitterSection = buildTwitterSection(result, ctx)
    if (twitterSection) {
      sections.push(twitterSection)
    }

    // Meta
    const metaSection = buildMetaSection(result, ctx)
    if (metaSection) {
      sections.push(metaSection)
    }
  }

  return sections.join('\n\n')
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Format schema result for terminal output (full or compact mode).
 * JSON format is handled directly by runCommand.
 */
export function formatSchemaOutput(
  result: SchemaResult,
  format: OutputFormat,
  mode: OutputMode,
): string {
  const ctx = createFormatterContext(mode)

  switch (format) {
    case 'compact':
      return formatTerminal(result, ctx, { compact: true })
    case 'full':
    default:
      return formatTerminal(result, ctx)
  }
}

// ============================================================================
// Compare Output
// ============================================================================

/**
 * Build an array of issues from the schema compare result.
 */
export function buildCompareIssues(result: SchemaCompareResult): Issue[] {
  const issues: Issue[] = []
  const { comparison, timedOut } = result

  // 1. Timeout warning
  if (timedOut) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Page Load Timeout',
      description: 'Rendering exceeded timeout. Analysis shows partial content.',
      tip: 'Increase timeout with --timeout or optimize page load.',
    })
  }

  // 2. No differences found
  if (!comparison.hasDifferences) {
    issues.push({
      type: 'info',
      severity: 'low',
      title: 'No Schema Differences',
      description: 'Static and JavaScript-rendered pages have identical structured data.',
    })
    return issues
  }

  // 3. JSON-LD added by JavaScript
  if (comparison.jsonldAdded > 0) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'JSON-LD Added by JavaScript',
      description: `${comparison.jsonldAdded} JSON-LD schema type${comparison.jsonldAdded === 1 ? '' : 's'} only appear after JavaScript execution.`,
      tip: 'Search engines may not see JavaScript-injected schemas. Consider server-side rendering.',
    })
  }

  // 4. Microdata added by JavaScript
  if (comparison.microdataAdded > 0) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Microdata Added by JavaScript',
      description: `${comparison.microdataAdded} Microdata schema type${comparison.microdataAdded === 1 ? '' : 's'} only appear after JavaScript execution.`,
    })
  }

  // 5. RDFa added by JavaScript
  if (comparison.rdfaAdded > 0) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'RDFa Added by JavaScript',
      description: `${comparison.rdfaAdded} RDFa schema type${comparison.rdfaAdded === 1 ? '' : 's'} only appear after JavaScript execution.`,
    })
  }

  // 6. Open Graph changed
  if (comparison.openGraphChanged) {
    issues.push({
      type: 'info',
      severity: 'low',
      title: 'Open Graph Tags Changed',
      description: 'Open Graph tags differ between static and JavaScript-rendered pages.',
    })
  }

  // 7. Twitter Cards changed
  if (comparison.twitterChanged) {
    issues.push({
      type: 'info',
      severity: 'low',
      title: 'Twitter Card Tags Changed',
      description: 'Twitter Card tags differ between static and JavaScript-rendered pages.',
    })
  }

  return issues
}

/**
 * Build the COMPARISON table for schema:compare output.
 */
function buildSchemaComparisonTable(
  result: SchemaCompareResult,
  ctx: ReturnType<typeof createFormatterContext>,
): string {
  const { comparison } = result
  const rows: TableRow[] = []

  // Count schemas in each version
  const staticJsonld = Object.keys(result.static.jsonld).filter(
    (k) => k !== 'undefined',
  ).length
  const renderedJsonld = Object.keys(result.rendered.jsonld).filter(
    (k) => k !== 'undefined',
  ).length

  rows.push({
    key: 'JSON-LD (static)',
    value: `${staticJsonld} type${staticJsonld === 1 ? '' : 's'}`,
  })
  rows.push({
    key: 'JSON-LD (rendered)',
    value: `${renderedJsonld} type${renderedJsonld === 1 ? '' : 's'}`,
  })

  if (comparison.jsonldAdded > 0 || comparison.jsonldRemoved > 0) {
    const changes: string[] = []
    if (comparison.jsonldAdded > 0) changes.push(`+${comparison.jsonldAdded}`)
    if (comparison.jsonldRemoved > 0) changes.push(`-${comparison.jsonldRemoved}`)
    rows.push({
      key: 'JSON-LD diff',
      value: changes.join(', '),
    })
  }

  rows.push({
    key: 'Open Graph',
    value: comparison.openGraphChanged ? 'Changed' : 'No change',
  })
  rows.push({
    key: 'Twitter Cards',
    value: comparison.twitterChanged ? 'Changed' : 'No change',
  })

  const header =
    ctx.mode === 'tty' ? colorize('COMPARISON', colors.gray, ctx) : 'COMPARISON'
  return `${header}\n${formatTable(rows, ctx)}`
}

/**
 * Build schema type lists showing what's in each version.
 */
function buildSchemaTypeLists(
  result: SchemaCompareResult,
  ctx: ReturnType<typeof createFormatterContext>,
): string[] {
  const sections: string[] = []

  const staticTypes = Object.keys(result.static.jsonld).filter(
    (k) => k !== 'undefined',
  )
  const renderedTypes = Object.keys(result.rendered.jsonld).filter(
    (k) => k !== 'undefined',
  )

  const staticSet = new Set(staticTypes)
  const renderedSet = new Set(renderedTypes)

  // Types only in rendered (added by JS)
  const addedTypes = renderedTypes.filter((t) => !staticSet.has(t))
  if (addedTypes.length > 0) {
    const header =
      ctx.mode === 'tty'
        ? colorize('ADDED BY JAVASCRIPT', colors.gray, ctx)
        : 'ADDED BY JAVASCRIPT'
    const rows: TableRow[] = addedTypes.map((t) => ({
      key: 'JSON-LD',
      value: t,
    }))
    sections.push(`${header}\n${formatTable(rows, ctx)}`)
  }

  // Types only in static (removed by JS) - rare but possible
  const removedTypes = staticTypes.filter((t) => !renderedSet.has(t))
  if (removedTypes.length > 0) {
    const header =
      ctx.mode === 'tty'
        ? colorize('REMOVED BY JAVASCRIPT', colors.gray, ctx)
        : 'REMOVED BY JAVASCRIPT'
    const rows: TableRow[] = removedTypes.map((t) => ({
      key: 'JSON-LD',
      value: t,
    }))
    sections.push(`${header}\n${formatTable(rows, ctx)}`)
  }

  return sections
}

/**
 * Format terminal output for schema:compare - full or compact mode.
 */
function formatCompareTerminal(
  result: SchemaCompareResult,
  ctx: ReturnType<typeof createFormatterContext>,
  options?: { compact?: boolean },
): string {
  const compact = options?.compact ?? false
  const sections: string[] = []

  // Issues section
  const issues = buildCompareIssues(result)
  const issuesSection = formatIssues(issues, ctx, {
    compact,
    successMessage: 'Static and rendered schemas are identical',
  })
  if (issuesSection) {
    sections.push(issuesSection)
  }

  // Comparison table
  sections.push(buildSchemaComparisonTable(result, ctx))

  if (!compact) {
    // Schema type lists showing differences
    const typeLists = buildSchemaTypeLists(result, ctx)
    sections.push(...typeLists)
  }

  return sections.join('\n\n')
}

/**
 * Format schema compare result for terminal output.
 */
export function formatSchemaCompareOutput(
  result: SchemaCompareResult,
  format: OutputFormat,
  mode: OutputMode,
): string {
  const ctx = createFormatterContext(mode)

  switch (format) {
    case 'compact':
      return formatCompareTerminal(result, ctx, { compact: true })
    case 'full':
    default:
      return formatCompareTerminal(result, ctx)
  }
}
