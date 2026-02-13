/**
 * Google lens formatters.
 *
 * Formats Google lens results for CLI output.
 */
import {
  colorize,
  colors,
  createFormatterContext,
  formatHeadingCounts,
  formatHeadingOutline,
  formatTable,
  type FormatterContext,
  type Issue,
  type TableRow,
} from '../../lib/cli-formatting/index.js'
import type { OutputMode } from '../../lib/output-mode.js'
import type { OutputFormat } from '../../lib/arguments.js'
import type { GoogleResult, GoogleSchemaItem } from './types.js'

// ============================================================================
// Issue Building
// ============================================================================

/**
 * Build issues for the Google lens.
 * Issues are warnings about SEO/structured data problems.
 */
export function buildIssues(result: GoogleResult): Issue[] {
  const issues: Issue[] = []

  // Missing page title
  if (!result.metadata.title) {
    issues.push({
      type: 'warning',
      severity: 'high',
      title: 'Missing Page Title',
      description: 'The page does not have a <title> element.',
      tip: 'Add a descriptive <title> element for better search visibility.',
    })
  }

  // Missing meta description
  if (!result.metadata.description) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Missing Meta Description',
      description: 'The page does not have a <meta name="description"> tag.',
      tip: 'Add a meta description to control how your page appears in search results.',
    })
  }

  // Missing canonical URL
  if (!result.metadata.canonical) {
    issues.push({
      type: 'info',
      severity: 'low',
      title: 'No Canonical URL',
      description: 'The page does not have a <link rel="canonical"> tag.',
      tip: 'Consider adding a canonical URL to prevent duplicate content issues.',
    })
  }

  // No structured data
  if (result.schemas.length === 0) {
    issues.push({
      type: 'info',
      severity: 'low',
      title: 'No Google-Recognized Structured Data',
      description: 'No JSON-LD schemas found that Google uses for rich results.',
      tip: 'Add structured data (Article, Product, FAQ, etc.) to enable rich results.',
    })
  }

  return issues
}

// ============================================================================
// Formatting Helpers
// ============================================================================

/**
 * Format a schema item for display.
 */
function formatSchemaItem(
  schema: GoogleSchemaItem,
  ctx: FormatterContext,
  detailed: boolean,
): string[] {
  const lines: string[] = []

  // Type header
  if (ctx.mode === 'tty') {
    lines.push(colorize(`  ${schema.type}`, colors.cyan, ctx))
  } else {
    lines.push(`  ${schema.type}`)
  }

  if (detailed) {
    // Show key properties
    const keyProps = getKeyProperties(schema)
    for (const { key, value } of keyProps) {
      const displayValue =
        typeof value === 'string'
          ? value.length > 50
            ? value.slice(0, 47) + '...'
            : value
          : JSON.stringify(value)

      if (ctx.mode === 'tty') {
        lines.push(
          `    ${colorize(key + ':', colors.dim, ctx)} ${displayValue}`,
        )
      } else {
        lines.push(`    ${key}: ${displayValue}`)
      }
    }
  }

  return lines
}

/**
 * Get key properties for a schema type.
 * Returns the most important properties based on schema type.
 */
function getKeyProperties(
  schema: GoogleSchemaItem,
): Array<{ key: string; value: unknown }> {
  const { type, data } = schema
  const props: Array<{ key: string; value: unknown }> = []

  // Common properties for most types
  if (data['name']) props.push({ key: 'name', value: data['name'] })
  if (data['headline']) props.push({ key: 'headline', value: data['headline'] })

  // Type-specific properties
  switch (type) {
    case 'Article':
    case 'NewsArticle':
    case 'BlogPosting':
      if (data['datePublished'])
        props.push({ key: 'datePublished', value: data['datePublished'] })
      if (data['author']) {
        const authorVal = data['author']
        const author =
          typeof authorVal === 'object' && authorVal !== null
            ? (authorVal as Record<string, unknown>)['name'] || authorVal
            : authorVal
        props.push({ key: 'author', value: author })
      }
      break

    case 'Product':
      if (data['offers']) {
        const offers = data['offers'] as Record<string, unknown>
        if (offers['price'])
          props.push({
            key: 'price',
            value: `${offers['price']} ${offers['priceCurrency'] || ''}`.trim(),
          })
      }
      break

    case 'FAQPage':
      if (data['mainEntity'] && Array.isArray(data['mainEntity'])) {
        props.push({ key: 'questions', value: data['mainEntity'].length })
      }
      break

    case 'HowTo':
      if (data['step'] && Array.isArray(data['step'])) {
        props.push({ key: 'steps', value: data['step'].length })
      }
      break

    case 'Event':
      if (data['startDate'])
        props.push({ key: 'startDate', value: data['startDate'] })
      if (data['location']) {
        const location = data['location'] as Record<string, unknown>
        props.push({ key: 'location', value: location['name'] || location })
      }
      break

    case 'LocalBusiness':
    case 'Organization':
      if (data['address']) {
        const address = data['address'] as Record<string, unknown>
        props.push({
          key: 'address',
          value:
            address['addressLocality'] || address['streetAddress'] || address,
        })
      }
      break

    case 'BreadcrumbList':
      if (data['itemListElement'] && Array.isArray(data['itemListElement'])) {
        props.push({ key: 'items', value: data['itemListElement'].length })
      }
      break

    case 'VideoObject':
      if (data['duration'])
        props.push({ key: 'duration', value: data['duration'] })
      if (data['uploadDate'])
        props.push({ key: 'uploadDate', value: data['uploadDate'] })
      break
  }

  return props.slice(0, 4) // Limit to 4 properties
}

// ============================================================================
// Terminal Formatters
// ============================================================================

/**
 * Format terminal output - full or compact mode.
 */
function formatTerminal(
  result: GoogleResult,
  ctx: FormatterContext,
  options?: { compact?: boolean },
): string {
  const compact = options?.compact ?? false
  const sections: string[] = []

  // [METADATA] section
  if (ctx.mode === 'tty') {
    sections.push(colorize('METADATA', colors.gray, ctx))
  } else {
    sections.push('METADATA')
  }

  const metadataRows: TableRow[] = [
    { key: 'Title', value: result.metadata.title ?? '(not set)' },
    {
      key: 'Description',
      value: result.metadata.description
        ? result.metadata.description.length > 60
          ? result.metadata.description.slice(0, 57) + '...'
          : result.metadata.description
        : '(not set)',
    },
    { key: 'Canonical', value: result.metadata.canonical ?? '(not set)' },
    { key: 'Language', value: result.metadata.language ?? '(not set)' },
  ]
  sections.push(formatTable(metadataRows, ctx))

  // [STRUCTURED DATA] section
  sections.push('')
  if (ctx.mode === 'tty') {
    sections.push(
      colorize(`STRUCTURED DATA (${result.counts.schemas})`, colors.gray, ctx),
    )
  } else {
    sections.push(`STRUCTURED DATA (${result.counts.schemas})`)
  }

  if (result.schemas.length === 0) {
    sections.push('(no Google-recognized schemas found)')
  } else if (compact) {
    // Compact: just list types
    const types = result.schemas.map((s) => s.type).join(', ')
    sections.push(types)
  } else {
    // Full: show type with key properties
    for (const schema of result.schemas) {
      sections.push(...formatSchemaItem(schema, ctx, true))
    }
  }

  // [HEADINGS] section
  sections.push('')
  if (ctx.mode === 'tty') {
    sections.push(
      colorize(`HEADINGS (${result.counts.headings})`, colors.gray, ctx),
    )
  } else {
    sections.push(`HEADINGS (${result.counts.headings})`)
  }

  if (result.headings.outline.length === 0) {
    sections.push('(no headings)')
  } else if (compact) {
    sections.push(formatHeadingCounts(result.headings.counts))
  } else {
    sections.push(...formatHeadingOutline(result.headings.outline, ctx))
  }

  return sections.join('\n')
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Format Google lens result for terminal output.
 * JSON format is handled directly by runCommand.
 */
export function formatGoogleOutput(
  result: GoogleResult,
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
