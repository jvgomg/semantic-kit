/**
 * Schema:compare View Content Component
 *
 * Shows comparison between static and JS-rendered structured data extraction.
 *
 * Sections:
 * 1. Timeout (conditional) - Warning when page load timed out
 * 2. Comparison - Summary of differences (counts, OG/Twitter status)
 * 3. Added by JavaScript - Schema types only in rendered
 * 4. Removed by JavaScript - Schema types only in static (rare)
 * 5. Open Graph Changes - OG tag differences (if any)
 * 6. Twitter Changes - Twitter tag differences (if any)
 */
import type { ReactNode } from 'react'
import {
  SectionContainer,
  Section,
  SectionPriority,
  Table,
} from '../../components/ui/index.js'
import { palette } from '../../theme.js'
import type { SchemaCompareResult, SchemaResult } from '../../../lib/results.js'
import type { ViewComponentProps } from '../types.js'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get schema type names from a schema record
 */
function getSchemaTypes(schemas: Record<string, unknown[]>): string[] {
  return Object.keys(schemas).filter((k) => k !== 'undefined')
}

/**
 * Count total schema types
 */
function countSchemaTypes(result: SchemaResult): number {
  const jsonld = getSchemaTypes(result.jsonld).length
  const microdata = getSchemaTypes(result.microdata).length
  const rdfa = getSchemaTypes(result.rdfa).length
  return jsonld + microdata + rdfa
}

/**
 * Truncate string for display
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Comparison section content
 */
function ComparisonContent({
  data,
}: {
  data: SchemaCompareResult
}): ReactNode {
  const { comparison } = data
  const staticCount = countSchemaTypes(data.static)
  const renderedCount = countSchemaTypes(data.rendered)

  const getDiffColor = (added: number, removed: number): string => {
    if (added > 0 && removed === 0) return palette.green
    if (removed > 0 && added === 0) return palette.red
    if (added > 0 || removed > 0) return palette.yellow
    return palette.gray
  }

  const formatDiff = (added: number, removed: number): string => {
    const parts: string[] = []
    if (added > 0) parts.push(`+${added}`)
    if (removed > 0) parts.push(`-${removed}`)
    return parts.length > 0 ? parts.join(', ') : 'No change'
  }

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Static HTML:</span>{' '}
          <span fg={palette.white}>
            {staticCount} schema type{staticCount !== 1 ? 's' : ''}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Rendered DOM:</span>{' '}
          <span fg={palette.white}>
            {renderedCount} schema type{renderedCount !== 1 ? 's' : ''}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2} marginTop={1}>
        <text>
          <span fg={palette.gray}>JSON-LD:</span>{' '}
          <span fg={getDiffColor(comparison.jsonldAdded, comparison.jsonldRemoved)}>
            {formatDiff(comparison.jsonldAdded, comparison.jsonldRemoved)}
          </span>
        </text>
      </box>
      {(comparison.microdataAdded > 0 || comparison.microdataRemoved > 0) && (
        <box flexDirection="row" gap={2}>
          <text>
            <span fg={palette.gray}>Microdata:</span>{' '}
            <span fg={getDiffColor(comparison.microdataAdded, comparison.microdataRemoved)}>
              {formatDiff(comparison.microdataAdded, comparison.microdataRemoved)}
            </span>
          </text>
        </box>
      )}
      {(comparison.rdfaAdded > 0 || comparison.rdfaRemoved > 0) && (
        <box flexDirection="row" gap={2}>
          <text>
            <span fg={palette.gray}>RDFa:</span>{' '}
            <span fg={getDiffColor(comparison.rdfaAdded, comparison.rdfaRemoved)}>
              {formatDiff(comparison.rdfaAdded, comparison.rdfaRemoved)}
            </span>
          </text>
        </box>
      )}
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Open Graph:</span>{' '}
          <span fg={comparison.openGraphChanged ? palette.yellow : palette.gray}>
            {comparison.openGraphChanged ? 'Changed' : 'No change'}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Twitter Cards:</span>{' '}
          <span fg={comparison.twitterChanged ? palette.yellow : palette.gray}>
            {comparison.twitterChanged ? 'Changed' : 'No change'}
          </span>
        </text>
      </box>
    </box>
  )
}

/**
 * Schema type list for added/removed sections
 */
function SchemaTypeList({
  types,
  color,
  format,
}: {
  types: string[]
  color: string
  format: string
}): ReactNode {
  if (types.length === 0) {
    return <text fg={palette.gray}>No {format} schemas</text>
  }

  return (
    <box flexDirection="column" gap={0}>
      {types.map((type, idx) => (
        <box key={idx}>
          <text fg={color}>
            {format}: {type}
          </text>
        </box>
      ))}
    </box>
  )
}

/**
 * Open Graph changes content
 */
function OpenGraphChangesContent({
  data,
}: {
  data: SchemaCompareResult
}): ReactNode {
  const staticOG = data.static.openGraph?.tags ?? {}
  const renderedOG = data.rendered.openGraph?.tags ?? {}

  const allKeys = new Set([...Object.keys(staticOG), ...Object.keys(renderedOG)])
  const changes: Array<{ field: string; static: string; rendered: string }> = []

  for (const key of allKeys) {
    const staticVal = staticOG[key]
    const renderedVal = renderedOG[key]
    if (staticVal !== renderedVal) {
      changes.push({
        field: key,
        static: staticVal ? truncate(staticVal, 25) : '(none)',
        rendered: renderedVal ? truncate(renderedVal, 25) : '(none)',
      })
    }
  }

  if (changes.length === 0) {
    return <text fg={palette.gray}>No Open Graph changes detected.</text>
  }

  return (
    <Table
      data={changes}
      columns={['field', 'static', 'rendered']}
      variant="bordered"
    />
  )
}

/**
 * Twitter changes content
 */
function TwitterChangesContent({
  data,
}: {
  data: SchemaCompareResult
}): ReactNode {
  const staticTw = data.static.twitter?.tags ?? {}
  const renderedTw = data.rendered.twitter?.tags ?? {}

  const allKeys = new Set([...Object.keys(staticTw), ...Object.keys(renderedTw)])
  const changes: Array<{ field: string; static: string; rendered: string }> = []

  for (const key of allKeys) {
    const staticVal = staticTw[key]
    const renderedVal = renderedTw[key]
    if (staticVal !== renderedVal) {
      changes.push({
        field: key,
        static: staticVal ? truncate(staticVal, 25) : '(none)',
        rendered: renderedVal ? truncate(renderedVal, 25) : '(none)',
      })
    }
  }

  if (changes.length === 0) {
    return <text fg={palette.gray}>No Twitter Card changes detected.</text>
  }

  return (
    <Table
      data={changes}
      columns={['field', 'static', 'rendered']}
      variant="bordered"
    />
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main Schema:compare View Content component
 */
export function SchemaCompareViewContent({
  data,
  height,
}: ViewComponentProps<SchemaCompareResult>): ReactNode {
  const { comparison, timedOut } = data

  // Compute added/removed schema types
  const staticJsonld = new Set(getSchemaTypes(data.static.jsonld))
  const renderedJsonld = new Set(getSchemaTypes(data.rendered.jsonld))
  const staticMicrodata = new Set(getSchemaTypes(data.static.microdata))
  const renderedMicrodata = new Set(getSchemaTypes(data.rendered.microdata))
  const staticRdfa = new Set(getSchemaTypes(data.static.rdfa))
  const renderedRdfa = new Set(getSchemaTypes(data.rendered.rdfa))

  const addedJsonld = [...renderedJsonld].filter((t) => !staticJsonld.has(t))
  const addedMicrodata = [...renderedMicrodata].filter((t) => !staticMicrodata.has(t))
  const addedRdfa = [...renderedRdfa].filter((t) => !staticRdfa.has(t))

  const removedJsonld = [...staticJsonld].filter((t) => !renderedJsonld.has(t))
  const removedMicrodata = [...staticMicrodata].filter((t) => !renderedMicrodata.has(t))
  const removedRdfa = [...staticRdfa].filter((t) => !renderedRdfa.has(t))

  const hasAdded = addedJsonld.length > 0 || addedMicrodata.length > 0 || addedRdfa.length > 0
  const hasRemoved = removedJsonld.length > 0 || removedMicrodata.length > 0 || removedRdfa.length > 0

  // Compute summary text
  const getSummaryText = () => {
    if (!comparison.hasDifferences) {
      return 'No differences detected'
    }
    const parts: string[] = []
    const totalAdded = comparison.jsonldAdded + comparison.microdataAdded + comparison.rdfaAdded
    const totalRemoved = comparison.jsonldRemoved + comparison.microdataRemoved + comparison.rdfaRemoved
    if (totalAdded > 0) parts.push(`+${totalAdded} type${totalAdded !== 1 ? 's' : ''}`)
    if (totalRemoved > 0) parts.push(`-${totalRemoved} type${totalRemoved !== 1 ? 's' : ''}`)
    if (comparison.openGraphChanged) parts.push('OG changed')
    if (comparison.twitterChanged) parts.push('Twitter changed')
    return parts.join(', ')
  }

  // Get severity based on differences
  const getSeverity = () => {
    if (!comparison.hasDifferences) return undefined
    const totalAdded = comparison.jsonldAdded + comparison.microdataAdded + comparison.rdfaAdded
    if (totalAdded > 0) return 'warning' as const
    return 'info' as const
  }

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
          <text fg={palette.yellow}>
            The page took too long to load. The comparison may be based on
            partial content.
          </text>
        </Section>
      )}

      {/* Comparison section */}
      <Section
        id="comparison"
        title="COMPARISON"
        priority={SectionPriority.SUMMARY}
        severity={getSeverity()}
        icon={comparison.hasDifferences ? '!' : undefined}
        summary={getSummaryText()}
        defaultExpanded={true}
      >
        <ComparisonContent data={data} />
      </Section>

      {/* Added by JavaScript section */}
      {hasAdded && (
        <Section
          id="added"
          title="ADDED BY JAVASCRIPT"
          priority={SectionPriority.PRIMARY}
          severity="warning"
          summary={`${addedJsonld.length + addedMicrodata.length + addedRdfa.length} type${addedJsonld.length + addedMicrodata.length + addedRdfa.length !== 1 ? 's' : ''} added`}
          defaultExpanded={true}
        >
          <box flexDirection="column" gap={0}>
            {addedJsonld.length > 0 && (
              <SchemaTypeList types={addedJsonld} color={palette.green} format="JSON-LD" />
            )}
            {addedMicrodata.length > 0 && (
              <SchemaTypeList types={addedMicrodata} color={palette.green} format="Microdata" />
            )}
            {addedRdfa.length > 0 && (
              <SchemaTypeList types={addedRdfa} color={palette.green} format="RDFa" />
            )}
            <box marginTop={1}>
              <text fg={palette.yellow}>
                These schemas are only visible to bots that execute JavaScript.
              </text>
            </box>
          </box>
        </Section>
      )}

      {/* Removed by JavaScript section */}
      {hasRemoved && (
        <Section
          id="removed"
          title="REMOVED BY JAVASCRIPT"
          priority={SectionPriority.PRIMARY}
          severity="error"
          summary={`${removedJsonld.length + removedMicrodata.length + removedRdfa.length} type${removedJsonld.length + removedMicrodata.length + removedRdfa.length !== 1 ? 's' : ''} removed`}
          defaultExpanded={true}
        >
          <box flexDirection="column" gap={0}>
            {removedJsonld.length > 0 && (
              <SchemaTypeList types={removedJsonld} color={palette.red} format="JSON-LD" />
            )}
            {removedMicrodata.length > 0 && (
              <SchemaTypeList types={removedMicrodata} color={palette.red} format="Microdata" />
            )}
            {removedRdfa.length > 0 && (
              <SchemaTypeList types={removedRdfa} color={palette.red} format="RDFa" />
            )}
            <box marginTop={1}>
              <text fg={palette.red}>
                These schemas are removed during JavaScript hydration. This is unusual.
              </text>
            </box>
          </box>
        </Section>
      )}

      {/* Open Graph changes section */}
      {comparison.openGraphChanged && (
        <Section
          id="og-changes"
          title="OPEN GRAPH CHANGES"
          priority={SectionPriority.SECONDARY}
          severity="info"
          summary="OG tags differ between versions"
          defaultExpanded={false}
        >
          <OpenGraphChangesContent data={data} />
        </Section>
      )}

      {/* Twitter changes section */}
      {comparison.twitterChanged && (
        <Section
          id="twitter-changes"
          title="TWITTER CARD CHANGES"
          priority={SectionPriority.SECONDARY}
          severity="info"
          summary="Twitter tags differ between versions"
          defaultExpanded={false}
        >
          <TwitterChangesContent data={data} />
        </Section>
      )}

      {/* No differences message */}
      {!comparison.hasDifferences && (
        <Section
          id="no-diff"
          title="DETAILS"
          priority={SectionPriority.SECONDARY}
          severity="muted"
          summary="Static and rendered schemas are identical"
          defaultExpanded={false}
        >
          <text fg={palette.gray}>
            No differences detected between static HTML and JavaScript-rendered page.
            Your structured data does not depend on JavaScript execution.
          </text>
        </Section>
      )}
    </SectionContainer>
  )
}
