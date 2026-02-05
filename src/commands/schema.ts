import type { SchemaResult } from '../lib/results.js'
import { validateFormat } from '../lib/validation.js'

// ============================================================================
// Types
// ============================================================================

const VALID_FORMATS = ['full', 'compact', 'json'] as const

interface SchemaOptions {
  format?: string
}

interface StructuredData {
  metatags: Record<string, string[]>
  jsonld: Record<string, unknown[]>
  microdata: Record<string, unknown[]>
  rdfa: Record<string, unknown[]>
}

interface MetatagGroup {
  name: string
  prefix: string
  tags: Array<{ name: string; value: string }>
  missingRequired: string[]
  missingRecommended: string[]
  isComplete: boolean
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Fetch HTML from URL or read from file
 */
async function fetchHtmlContent(target: string): Promise<string> {
  if (target.startsWith('http://') || target.startsWith('https://')) {
    const response = await fetch(target)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${target}: ${response.status}`)
    }
    return response.text()
  }

  return Bun.file(target).text()
}

/**
 * Extract structured data from HTML using web-auto-extractor
 */
function extractStructuredData(html: string): StructuredData {
  // Use the same extractor as structured-data-testing-tool
  // Bun supports require() directly in ESM
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const WAE = require('web-auto-extractor').default

  const result = WAE().parse(html)

  return {
    metatags: result.metatags || {},
    jsonld: result.jsonld || {},
    microdata: result.microdata || {},
    rdfa: result.rdfa || {},
  }
}

// ============================================================================
// Metatag Analysis
// ============================================================================

/**
 * Required and recommended tags for Open Graph
 */
const OPEN_GRAPH_TAGS = {
  required: ['og:title', 'og:type', 'og:image', 'og:url'],
  recommended: ['og:description', 'og:site_name', 'og:locale'],
}

/**
 * Required and recommended tags for Twitter Cards
 */
const TWITTER_CARD_TAGS = {
  required: ['twitter:card', 'twitter:title', 'twitter:description'],
  recommended: ['twitter:image', 'twitter:site', 'twitter:creator'],
}

/**
 * Analyze metatags and group by standard
 */
function analyzeMetatags(metatags: Record<string, string[]>): {
  openGraph: MetatagGroup | null
  twitter: MetatagGroup | null
  other: Array<{ name: string; value: string }>
} {
  const ogTags: Array<{ name: string; value: string }> = []
  const twitterTags: Array<{ name: string; value: string }> = []
  const otherTags: Array<{ name: string; value: string }> = []

  for (const [name, values] of Object.entries(metatags)) {
    if (name === 'undefined') continue
    const value = values[0] || ''

    if (name.startsWith('og:')) {
      ogTags.push({ name, value })
    } else if (name.startsWith('twitter:')) {
      twitterTags.push({ name, value })
    } else {
      otherTags.push({ name, value })
    }
  }

  // Analyze Open Graph completeness
  let openGraph: MetatagGroup | null = null
  if (ogTags.length > 0) {
    const foundNames = new Set(ogTags.map((t) => t.name))
    const missingRequired = OPEN_GRAPH_TAGS.required.filter(
      (t) => !foundNames.has(t),
    )
    const missingRecommended = OPEN_GRAPH_TAGS.recommended.filter(
      (t) => !foundNames.has(t),
    )
    openGraph = {
      name: 'Open Graph',
      prefix: 'og:',
      tags: ogTags,
      missingRequired,
      missingRecommended,
      isComplete: missingRequired.length === 0,
    }
  }

  // Analyze Twitter Cards completeness
  let twitter: MetatagGroup | null = null
  if (twitterTags.length > 0) {
    const foundNames = new Set(twitterTags.map((t) => t.name))
    const missingRequired = TWITTER_CARD_TAGS.required.filter(
      (t) => !foundNames.has(t),
    )
    const missingRecommended = TWITTER_CARD_TAGS.recommended.filter(
      (t) => !foundNames.has(t),
    )
    twitter = {
      name: 'Twitter Cards',
      prefix: 'twitter:',
      tags: twitterTags,
      missingRequired,
      missingRecommended,
      isComplete: missingRequired.length === 0,
    }
  }

  return { openGraph, twitter, other: otherTags }
}

// ============================================================================
// Schema.org Analysis
// ============================================================================

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

// ============================================================================
// Output Formatting
// ============================================================================

/**
 * Truncate string for display
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 1) + '…'
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
 * Warning collected during output formatting
 */
interface Warning {
  category: string
  missingRequired: string[]
  missingRecommended: string[]
}

/**
 * Format the complete output
 */
function formatOutput(target: string, data: StructuredData): string {
  const lines: string[] = []
  const warnings: Warning[] = []

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Structured Data')
  lines.push(`│ ${target}`)
  lines.push('└─────────────────────────────────────────────────────────────')
  lines.push('')

  let hasContent = false

  // JSON-LD Schemas
  const jsonldSchemas = Object.entries(data.jsonld).filter(
    ([key]) => key !== 'undefined',
  )
  if (jsonldSchemas.length > 0) {
    hasContent = true
    for (const [schemaType, instances] of jsonldSchemas) {
      const instanceArray = instances as unknown[]
      for (let i = 0; i < instanceArray.length; i++) {
        const instance = instanceArray[i]
        const label =
          instanceArray.length > 1
            ? `JSON-LD: ${schemaType} #${i + 1}`
            : `JSON-LD: ${schemaType}`
        lines.push(label)
        lines.push('─'.repeat(label.length))

        const properties = flattenSchemaProperties(instance)
        for (const { path, value } of properties) {
          if (path === '@type') continue // Already in header
          const displayPath = path.padEnd(24)
          lines.push(`  ${displayPath} ${formatValue(value)}`)
        }
        lines.push('')
      }
    }
  }

  // Microdata Schemas
  const microdataSchemas = Object.entries(data.microdata).filter(
    ([key]) => key !== 'undefined',
  )
  if (microdataSchemas.length > 0) {
    hasContent = true
    for (const [schemaType, instances] of microdataSchemas) {
      const instanceArray = instances as unknown[]
      for (let i = 0; i < instanceArray.length; i++) {
        const instance = instanceArray[i]
        const label =
          instanceArray.length > 1
            ? `Microdata: ${schemaType} #${i + 1}`
            : `Microdata: ${schemaType}`
        lines.push(label)
        lines.push('─'.repeat(label.length))

        const properties = flattenSchemaProperties(instance)
        for (const { path, value } of properties) {
          const displayPath = path.padEnd(24)
          lines.push(`  ${displayPath} ${formatValue(value)}`)
        }
        lines.push('')
      }
    }
  }

  // RDFa Schemas
  const rdfaSchemas = Object.entries(data.rdfa).filter(
    ([key]) => key !== 'undefined',
  )
  if (rdfaSchemas.length > 0) {
    hasContent = true
    for (const [schemaType, instances] of rdfaSchemas) {
      const instanceArray = instances as unknown[]
      for (let i = 0; i < instanceArray.length; i++) {
        const instance = instanceArray[i]
        const label =
          instanceArray.length > 1
            ? `RDFa: ${schemaType} #${i + 1}`
            : `RDFa: ${schemaType}`
        lines.push(label)
        lines.push('─'.repeat(label.length))

        const properties = flattenSchemaProperties(instance)
        for (const { path, value } of properties) {
          const displayPath = path.padEnd(24)
          lines.push(`  ${displayPath} ${formatValue(value)}`)
        }
        lines.push('')
      }
    }
  }

  // Metatags
  const metatagAnalysis = analyzeMetatags(data.metatags)

  // Open Graph
  if (metatagAnalysis.openGraph) {
    hasContent = true
    const og = metatagAnalysis.openGraph
    const hasIssues =
      og.missingRequired.length > 0 || og.missingRecommended.length > 0
    const status = !hasIssues
      ? '✓'
      : og.isComplete
        ? '⚠ warnings'
        : '⚠ incomplete'
    lines.push(`Open Graph ${status}`)
    lines.push('─'.repeat(20))

    // Show existing tags
    for (const tag of og.tags) {
      const displayName = tag.name.padEnd(24)
      lines.push(`  ${displayName} ${formatValue(tag.value)}`)
    }

    // Show missing fields inline
    if (hasIssues) {
      lines.push('')
      for (const missing of og.missingRequired) {
        const displayName = missing.padEnd(24)
        lines.push(`  ${displayName} ✗ missing (required)`)
      }
      for (const missing of og.missingRecommended) {
        const displayName = missing.padEnd(24)
        lines.push(`  ${displayName} ⚠ missing (recommended)`)
      }
    }
    lines.push('')

    // Collect warning for summary
    if (hasIssues) {
      warnings.push({
        category: 'Open Graph',
        missingRequired: og.missingRequired,
        missingRecommended: og.missingRecommended,
      })
    }
  }

  // Twitter Cards
  if (metatagAnalysis.twitter) {
    hasContent = true
    const tw = metatagAnalysis.twitter
    const hasIssues =
      tw.missingRequired.length > 0 || tw.missingRecommended.length > 0
    const status = !hasIssues
      ? '✓'
      : tw.isComplete
        ? '⚠ warnings'
        : '⚠ incomplete'
    lines.push(`Twitter Cards ${status}`)
    lines.push('─'.repeat(20))

    // Show existing tags
    for (const tag of tw.tags) {
      const displayName = tag.name.padEnd(24)
      lines.push(`  ${displayName} ${formatValue(tag.value)}`)
    }

    // Show missing fields inline
    if (hasIssues) {
      lines.push('')
      for (const missing of tw.missingRequired) {
        const displayName = missing.padEnd(24)
        lines.push(`  ${displayName} ✗ missing (required)`)
      }
      for (const missing of tw.missingRecommended) {
        const displayName = missing.padEnd(24)
        lines.push(`  ${displayName} ⚠ missing (recommended)`)
      }
    }
    lines.push('')

    // Collect warning for summary
    if (hasIssues) {
      warnings.push({
        category: 'Twitter Cards',
        missingRequired: tw.missingRequired,
        missingRecommended: tw.missingRecommended,
      })
    }
  }

  // Other metatags (only show common ones)
  const commonMetatags = metatagAnalysis.other.filter((t) =>
    ['description', 'author', 'viewport', 'robots', 'canonical'].includes(
      t.name,
    ),
  )
  if (commonMetatags.length > 0) {
    hasContent = true
    lines.push('Metatags')
    lines.push('─'.repeat(8))
    for (const tag of commonMetatags) {
      const displayName = tag.name.padEnd(24)
      lines.push(`  ${displayName} ${formatValue(tag.value)}`)
    }
    lines.push('')
  }

  // Warnings summary at the end
  if (warnings.length > 0) {
    lines.push('─'.repeat(61))
    lines.push('⚠ Warnings')
    lines.push('')
    for (const warning of warnings) {
      lines.push(`${warning.category}:`)
      if (warning.missingRequired.length > 0) {
        lines.push('  Missing required:')
        for (const missing of warning.missingRequired) {
          lines.push(`    ✗ ${missing}`)
        }
      }
      if (warning.missingRecommended.length > 0) {
        lines.push('  Missing recommended:')
        for (const missing of warning.missingRecommended) {
          lines.push(`    ⚠ ${missing}`)
        }
      }
      lines.push('')
    }
  }

  if (!hasContent) {
    lines.push('No structured data found.')
    lines.push('')
    lines.push('Consider adding:')
    lines.push('  • JSON-LD for Schema.org types (Article, Organization, etc.)')
    lines.push(
      '  • Open Graph tags for social sharing (og:title, og:image, etc.)',
    )
    lines.push('  • Twitter Card tags (twitter:card, twitter:title, etc.)')
    lines.push('')
    lines.push('Learn more: https://schema.org/')
  }

  return lines.join('\n')
}

/**
 * Format compact output - summary only
 */
function formatCompact(target: string, data: StructuredData): string {
  const lines: string[] = []
  const metatagAnalysis = analyzeMetatags(data.metatags)

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Structured Data')
  lines.push(`│ ${target}`)
  lines.push('├─────────────────────────────────────────────────────────────')

  // Count schemas
  const jsonldSchemas = Object.keys(data.jsonld).filter(
    (k) => k !== 'undefined',
  )
  const microdataSchemas = Object.keys(data.microdata).filter(
    (k) => k !== 'undefined',
  )
  const rdfaSchemas = Object.keys(data.rdfa).filter((k) => k !== 'undefined')

  if (jsonldSchemas.length > 0) {
    lines.push(`│ JSON-LD:  ${jsonldSchemas.join(', ')}`)
  }
  if (microdataSchemas.length > 0) {
    lines.push(`│ Microdata: ${microdataSchemas.join(', ')}`)
  }
  if (rdfaSchemas.length > 0) {
    lines.push(`│ RDFa:     ${rdfaSchemas.join(', ')}`)
  }

  // Status for Open Graph and Twitter Cards
  if (metatagAnalysis.openGraph) {
    const og = metatagAnalysis.openGraph
    const status = og.isComplete ? '✓' : '⚠ incomplete'
    lines.push(`│ Open Graph: ${status} (${og.tags.length} tags)`)
  }

  if (metatagAnalysis.twitter) {
    const tw = metatagAnalysis.twitter
    const status = tw.isComplete ? '✓' : '⚠ incomplete'
    lines.push(`│ Twitter Cards: ${status} (${tw.tags.length} tags)`)
  }

  const hasContent =
    jsonldSchemas.length > 0 ||
    microdataSchemas.length > 0 ||
    rdfaSchemas.length > 0 ||
    metatagAnalysis.openGraph ||
    metatagAnalysis.twitter

  if (!hasContent) {
    lines.push('│ ⚠ No structured data found')
  }

  lines.push('└─────────────────────────────────────────────────────────────')

  return lines.join('\n')
}

/**
 * Build the result object for JSON output
 */
function buildSchemaResult(target: string, data: StructuredData): SchemaResult {
  const metatagAnalysis = analyzeMetatags(data.metatags)

  return {
    target,
    jsonld: data.jsonld,
    microdata: data.microdata,
    rdfa: data.rdfa,
    openGraph: metatagAnalysis.openGraph
      ? {
          tags: Object.fromEntries(
            metatagAnalysis.openGraph.tags.map((t) => [t.name, t.value]),
          ),
          missingRequired: metatagAnalysis.openGraph.missingRequired,
          missingRecommended: metatagAnalysis.openGraph.missingRecommended,
          isComplete: metatagAnalysis.openGraph.isComplete,
        }
      : null,
    twitter: metatagAnalysis.twitter
      ? {
          tags: Object.fromEntries(
            metatagAnalysis.twitter.tags.map((t) => [t.name, t.value]),
          ),
          missingRequired: metatagAnalysis.twitter.missingRequired,
          missingRecommended: metatagAnalysis.twitter.missingRecommended,
          isComplete: metatagAnalysis.twitter.isComplete,
        }
      : null,
    metatags: Object.fromEntries(
      metatagAnalysis.other.map((t) => [t.name, t.value]),
    ),
  }
}

/**
 * Fetch schema data and return as structured result.
 * Used by TUI and programmatic access.
 */
export async function fetchSchema(target: string): Promise<SchemaResult> {
  const html = await fetchHtmlContent(target)
  const data = extractStructuredData(html)
  return buildSchemaResult(target, data)
}

/**
 * Render schema result as formatted lines for display.
 * Used by TUI for rendering in scrollable view.
 */
export function renderSchemaLines(result: SchemaResult): string[] {
  const lines: string[] = []

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Structured Data')
  lines.push(`│ ${result.target}`)
  lines.push('└─────────────────────────────────────────────────────────────')
  lines.push('')

  let hasContent = false

  // JSON-LD Schemas
  const jsonldSchemas = Object.entries(result.jsonld).filter(
    ([key]) => key !== 'undefined',
  )
  if (jsonldSchemas.length > 0) {
    hasContent = true
    for (const [schemaType, instances] of jsonldSchemas) {
      const instanceArray = instances as unknown[]
      for (let i = 0; i < instanceArray.length; i++) {
        const instance = instanceArray[i]
        const label =
          instanceArray.length > 1
            ? `JSON-LD: ${schemaType} #${i + 1}`
            : `JSON-LD: ${schemaType}`
        lines.push(label)
        lines.push('─'.repeat(label.length))

        const properties = flattenSchemaProperties(instance)
        for (const { path, value } of properties) {
          if (path === '@type') continue
          const displayPath = path.padEnd(24)
          lines.push(`  ${displayPath} ${formatValue(value)}`)
        }
        lines.push('')
      }
    }
  }

  // Microdata Schemas
  const microdataSchemas = Object.entries(result.microdata).filter(
    ([key]) => key !== 'undefined',
  )
  if (microdataSchemas.length > 0) {
    hasContent = true
    for (const [schemaType, instances] of microdataSchemas) {
      const instanceArray = instances as unknown[]
      for (let i = 0; i < instanceArray.length; i++) {
        const instance = instanceArray[i]
        const label =
          instanceArray.length > 1
            ? `Microdata: ${schemaType} #${i + 1}`
            : `Microdata: ${schemaType}`
        lines.push(label)
        lines.push('─'.repeat(label.length))

        const properties = flattenSchemaProperties(instance)
        for (const { path, value } of properties) {
          const displayPath = path.padEnd(24)
          lines.push(`  ${displayPath} ${formatValue(value)}`)
        }
        lines.push('')
      }
    }
  }

  // RDFa Schemas
  const rdfaSchemas = Object.entries(result.rdfa).filter(
    ([key]) => key !== 'undefined',
  )
  if (rdfaSchemas.length > 0) {
    hasContent = true
    for (const [schemaType, instances] of rdfaSchemas) {
      const instanceArray = instances as unknown[]
      for (let i = 0; i < instanceArray.length; i++) {
        const instance = instanceArray[i]
        const label =
          instanceArray.length > 1
            ? `RDFa: ${schemaType} #${i + 1}`
            : `RDFa: ${schemaType}`
        lines.push(label)
        lines.push('─'.repeat(label.length))

        const properties = flattenSchemaProperties(instance)
        for (const { path, value } of properties) {
          const displayPath = path.padEnd(24)
          lines.push(`  ${displayPath} ${formatValue(value)}`)
        }
        lines.push('')
      }
    }
  }

  // Open Graph
  if (result.openGraph) {
    hasContent = true
    const og = result.openGraph
    const hasIssues =
      og.missingRequired.length > 0 || og.missingRecommended.length > 0
    const status = !hasIssues
      ? '✓'
      : og.isComplete
        ? '⚠ warnings'
        : '⚠ incomplete'
    lines.push(`Open Graph ${status}`)
    lines.push('─'.repeat(20))

    for (const [name, value] of Object.entries(og.tags)) {
      const displayName = name.padEnd(24)
      lines.push(`  ${displayName} ${formatValue(value)}`)
    }

    if (hasIssues) {
      lines.push('')
      for (const missing of og.missingRequired) {
        const displayName = missing.padEnd(24)
        lines.push(`  ${displayName} ✗ missing (required)`)
      }
      for (const missing of og.missingRecommended) {
        const displayName = missing.padEnd(24)
        lines.push(`  ${displayName} ⚠ missing (recommended)`)
      }
    }
    lines.push('')
  }

  // Twitter Cards
  if (result.twitter) {
    hasContent = true
    const tw = result.twitter
    const hasIssues =
      tw.missingRequired.length > 0 || tw.missingRecommended.length > 0
    const status = !hasIssues
      ? '✓'
      : tw.isComplete
        ? '⚠ warnings'
        : '⚠ incomplete'
    lines.push(`Twitter Cards ${status}`)
    lines.push('─'.repeat(20))

    for (const [name, value] of Object.entries(tw.tags)) {
      const displayName = name.padEnd(24)
      lines.push(`  ${displayName} ${formatValue(value)}`)
    }

    if (hasIssues) {
      lines.push('')
      for (const missing of tw.missingRequired) {
        const displayName = missing.padEnd(24)
        lines.push(`  ${displayName} ✗ missing (required)`)
      }
      for (const missing of tw.missingRecommended) {
        const displayName = missing.padEnd(24)
        lines.push(`  ${displayName} ⚠ missing (recommended)`)
      }
    }
    lines.push('')
  }

  // Other metatags
  const commonMetatags = ['description', 'author', 'viewport', 'robots', 'canonical']
  const filteredMetatags = Object.entries(result.metatags).filter(([name]) =>
    commonMetatags.includes(name),
  )
  if (filteredMetatags.length > 0) {
    hasContent = true
    lines.push('Metatags')
    lines.push('─'.repeat(8))
    for (const [name, value] of filteredMetatags) {
      const displayName = name.padEnd(24)
      lines.push(`  ${displayName} ${formatValue(value)}`)
    }
    lines.push('')
  }

  if (!hasContent) {
    lines.push('No structured data found.')
    lines.push('')
    lines.push('Consider adding:')
    lines.push('  • JSON-LD for Schema.org types (Article, Organization, etc.)')
    lines.push('  • Open Graph tags for social sharing (og:title, og:image, etc.)')
    lines.push('  • Twitter Card tags (twitter:card, twitter:title, etc.)')
    lines.push('')
    lines.push('Learn more: https://schema.org/')
  }

  return lines
}

// ============================================================================
// Main Command
// ============================================================================

export async function schemaView(
  target: string,
  options: SchemaOptions,
): Promise<void> {
  // Validate format option
  const format = validateFormat(options.format, VALID_FORMATS)

  try {
    // Fetch HTML content
    const html = await fetchHtmlContent(target)

    // Extract structured data
    const data = extractStructuredData(html)

    // Output based on format
    if (format === 'json') {
      const result = buildSchemaResult(target, data)
      console.log(JSON.stringify(result, null, 2))
    } else if (format === 'compact') {
      console.log(formatCompact(target, data))
    } else {
      console.log(formatOutput(target, data))
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`)
    } else {
      console.error('An unknown error occurred')
    }
    process.exit(1)
  }
}
