/**
 * Schema:js View Content Component
 *
 * Same as SchemaViewContent but includes a TIMEOUT section at the top
 * when the page load timed out.
 *
 * Sections:
 * 1. Timeout (conditional) - Warning when page load timed out
 * 2. Summary - Quick stats (schemas found, OG/Twitter status)
 * 3. JSON-LD - JSON-LD schemas by type
 * 4. Microdata - Microdata schemas
 * 5. RDFa - RDFa schemas
 * 6. Open Graph - Open Graph metatags
 * 7. Twitter Cards - Twitter Card metatags
 * 8. Meta - Other metatags
 */
import type { ReactNode } from 'react'
import {
  SectionContainer,
  Section,
  SectionPriority,
  Card,
  CardRow,
  TagList,
  IssuesDisplay,
  IssuesContent,
  hasHighSeverityIssues,
  getIssuesSeverity,
} from '../../components/ui/index.js'
import { usePalette } from '../../theme.js'
import type { SchemaJsResult, MetatagGroupResult } from '@webspecs/core'
import type { ViewComponentProps } from '../types.js'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Count total schema types across all formats
 */
function countSchemaTypes(result: SchemaJsResult): {
  jsonld: number
  microdata: number
  rdfa: number
  total: number
} {
  const jsonld = Object.keys(result.jsonld).filter((k) => k !== 'undefined').length
  const microdata = Object.keys(result.microdata).filter((k) => k !== 'undefined').length
  const rdfa = Object.keys(result.rdfa).filter((k) => k !== 'undefined').length
  return { jsonld, microdata, rdfa, total: jsonld + microdata + rdfa }
}

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
    if (key === '@context') continue

    const path = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
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
// Helper Components
// ============================================================================

/**
 * Summary section content
 */
function SummaryContent({ data }: { data: SchemaJsResult }): ReactNode {
  const palette = usePalette()
  const counts = countSchemaTypes(data)
  const hasOG = data.openGraph !== null
  const hasTwitter = data.twitter !== null

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>JSON-LD:</span>{' '}
          <span fg={counts.jsonld > 0 ? palette.base0B : palette.base03}>
            {counts.jsonld} type{counts.jsonld !== 1 ? 's' : ''}
          </span>
        </text>
      </box>
      {counts.microdata > 0 && (
        <box flexDirection="row" gap={2}>
          <text>
            <span fg={palette.base03}>Microdata:</span>{' '}
            <span fg={palette.base0B}>
              {counts.microdata} type{counts.microdata !== 1 ? 's' : ''}
            </span>
          </text>
        </box>
      )}
      {counts.rdfa > 0 && (
        <box flexDirection="row" gap={2}>
          <text>
            <span fg={palette.base03}>RDFa:</span>{' '}
            <span fg={palette.base0B}>
              {counts.rdfa} type{counts.rdfa !== 1 ? 's' : ''}
            </span>
          </text>
        </box>
      )}
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Open Graph:</span>{' '}
          <span fg={hasOG ? palette.base0B : palette.base03}>
            {hasOG ? `${Object.keys(data.openGraph!.tags).length} tags` : 'None'}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Twitter Cards:</span>{' '}
          <span fg={hasTwitter ? palette.base0B : palette.base03}>
            {hasTwitter ? `${Object.keys(data.twitter!.tags).length} tags` : 'None'}
          </span>
        </text>
      </box>
    </box>
  )
}

/**
 * Schema instance card
 */
function SchemaCard({
  type,
  instance,
  index,
}: {
  type: string
  instance: unknown
  index: number
}): ReactNode {
  const palette = usePalette()
  const properties = flattenSchemaProperties(instance)
    .filter(({ path }) => path !== '@type')
    .slice(0, 8)

  return (
    <Card title={`${type} #${index}`}>
      {properties.map(({ path, value }, idx) => (
        <CardRow key={idx} label={path} value={formatValue(value, 50)} />
      ))}
      {properties.length === 0 && (
        <text fg={palette.base03}>(empty schema)</text>
      )}
    </Card>
  )
}

/**
 * Schema type section - displays all instances of schemas
 */
function SchemaTypeSection({
  schemas,
  format,
}: {
  schemas: Record<string, unknown[]>
  format: string
}): ReactNode {
  const palette = usePalette()
  const types = Object.entries(schemas).filter(([key]) => key !== 'undefined')

  if (types.length === 0) {
    return <text fg={palette.base03}>No {format} schemas found.</text>
  }

  let globalIndex = 0
  return (
    <box flexDirection="column" gap={1}>
      {types.map(([schemaType, instances]) =>
        (instances as unknown[]).map((instance) => {
          const idx = globalIndex++
          return (
            <SchemaCard
              key={`${schemaType}-${idx}`}
              type={schemaType}
              instance={instance}
              index={idx}
            />
          )
        }),
      )}
    </box>
  )
}

/**
 * Metatag group content (Open Graph / Twitter)
 */
function MetatagGroupContent({
  group,
}: {
  group: MetatagGroupResult
}): ReactNode {
  return (
    <box flexDirection="column" gap={0}>
      <TagList tags={group.tags} maxValueLength={50} />
      <IssuesDisplay issues={group.issues} />
    </box>
  )
}

/**
 * Other metatags content
 */
function MetaContent({ metatags }: { metatags: Record<string, string> }): ReactNode {
  const palette = usePalette()
  const entries = Object.entries(metatags)

  if (entries.length === 0) {
    return <text fg={palette.base03}>No other metatags found.</text>
  }

  return (
    <box flexDirection="column" gap={0}>
      {entries.map(([name, value], idx) => (
        <box key={idx}>
          <text>
            <span fg={palette.base0D}>{name}:</span>{' '}
            <span fg={palette.base05}>{truncate(value, 50)}</span>
          </text>
        </box>
      ))}
    </box>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main Schema:js View Content component
 */
export function SchemaJsViewContent({
  data,
  height,
}: ViewComponentProps<SchemaJsResult>): ReactNode {
  const palette = usePalette()
  const counts = countSchemaTypes(data)
  const hasOG = data.openGraph !== null
  const hasTwitter = data.twitter !== null
  const hasMetatags = Object.keys(data.metatags).length > 0
  const { timedOut } = data

  // Compute summary text
  const summaryParts: string[] = []
  if (counts.total > 0) {
    summaryParts.push(`${counts.total} schema type${counts.total !== 1 ? 's' : ''}`)
  }
  if (hasOG) summaryParts.push('OG')
  if (hasTwitter) summaryParts.push('Twitter')
  const summaryText = summaryParts.length > 0 ? summaryParts.join(', ') : 'No structured data'

  // Get all issues for the issues section
  const allIssues = data.issues ?? []
  const issuesSeverity = getIssuesSeverity(allIssues)

  return (
    <SectionContainer height={height}>
      {/* Timeout warning if applicable */}
      {timedOut && (
        <Section
          id="timeout"
          title="TIMEOUT"
          priority={SectionPriority.CRITICAL}
          severity="warning"
          icon="!"
          summary="Page load timed out - results may be incomplete"
          defaultExpanded={false}
        >
          <text fg={palette.base0A}>
            The page took too long to load. The results shown are from partial
            content. Consider increasing the timeout with --timeout.
          </text>
        </Section>
      )}

      {/* Summary section */}
      <Section
        id="summary"
        title="SUMMARY"
        priority={SectionPriority.SUMMARY}
        summary={summaryText}
        defaultExpanded={true}
      >
        <SummaryContent data={data} />
      </Section>

      {/* Issues section */}
      <Section
        id="issues"
        title="ISSUES"
        priority={SectionPriority.PRIMARY}
        severity={issuesSeverity}
        summary={
          allIssues.length === 0
            ? 'No issues'
            : `${allIssues.length} issue${allIssues.length !== 1 ? 's' : ''}`
        }
        defaultExpanded={allIssues.length > 0}
      >
        <IssuesContent issues={allIssues} />
      </Section>

      {/* JSON-LD section */}
      <Section
        id="jsonld"
        title="JSON-LD"
        priority={SectionPriority.PRIMARY}
        severity={counts.jsonld > 0 ? undefined : 'muted'}
        summary={
          counts.jsonld > 0
            ? `${counts.jsonld} type${counts.jsonld !== 1 ? 's' : ''}`
            : 'No JSON-LD schemas'
        }
        defaultExpanded={counts.jsonld > 0}
        scrollable={counts.jsonld > 2}
      >
        <SchemaTypeSection schemas={data.jsonld} format="JSON-LD" />
      </Section>

      {/* Microdata section - only show if present */}
      {counts.microdata > 0 && (
        <Section
          id="microdata"
          title="MICRODATA"
          priority={SectionPriority.PRIMARY}
          summary={`${counts.microdata} type${counts.microdata !== 1 ? 's' : ''}`}
          defaultExpanded={false}
          scrollable={counts.microdata > 2}
        >
          <SchemaTypeSection schemas={data.microdata} format="Microdata" />
        </Section>
      )}

      {/* RDFa section - only show if present */}
      {counts.rdfa > 0 && (
        <Section
          id="rdfa"
          title="RDFA"
          priority={SectionPriority.PRIMARY}
          summary={`${counts.rdfa} type${counts.rdfa !== 1 ? 's' : ''}`}
          defaultExpanded={false}
          scrollable={counts.rdfa > 2}
        >
          <SchemaTypeSection schemas={data.rdfa} format="RDFa" />
        </Section>
      )}

      {/* Open Graph section */}
      <Section
        id="open-graph"
        title="OPEN GRAPH"
        priority={SectionPriority.PRIMARY}
        severity={
          hasOG
            ? hasHighSeverityIssues(data.openGraph)
              ? 'warning'
              : undefined
            : 'muted'
        }
        summary={
          hasOG
            ? `${Object.keys(data.openGraph!.tags).length} tag${Object.keys(data.openGraph!.tags).length !== 1 ? 's' : ''}`
            : 'No Open Graph tags'
        }
        defaultExpanded={hasOG && hasHighSeverityIssues(data.openGraph)}
      >
        {hasOG ? (
          <MetatagGroupContent group={data.openGraph!} />
        ) : (
          <text fg={palette.base03}>
            No Open Graph tags found. Add og:title, og:description, og:image for
            social previews.
          </text>
        )}
      </Section>

      {/* Twitter Cards section */}
      <Section
        id="twitter-cards"
        title="TWITTER CARDS"
        priority={SectionPriority.SECONDARY}
        severity={
          hasTwitter
            ? hasHighSeverityIssues(data.twitter)
              ? 'warning'
              : undefined
            : 'muted'
        }
        summary={
          hasTwitter
            ? `${Object.keys(data.twitter!.tags).length} tag${Object.keys(data.twitter!.tags).length !== 1 ? 's' : ''}`
            : 'No Twitter Card tags'
        }
        defaultExpanded={hasTwitter && !hasOG}
      >
        {hasTwitter ? (
          <MetatagGroupContent group={data.twitter!} />
        ) : (
          <text fg={palette.base03}>
            No Twitter Card tags found. Twitter will fall back to Open Graph tags.
          </text>
        )}
      </Section>

      {/* Meta section - only show if present */}
      {hasMetatags && (
        <Section
          id="meta"
          title="META"
          priority={SectionPriority.SUPPLEMENTARY}
          summary={`${Object.keys(data.metatags).length} tag${Object.keys(data.metatags).length !== 1 ? 's' : ''}`}
          defaultExpanded={false}
        >
          <MetaContent metatags={data.metatags} />
        </Section>
      )}
    </SectionContainer>
  )
}
