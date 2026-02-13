/**
 * Google View Content Component
 *
 * Custom TUI rendering for the Google lens using the expandable sections framework.
 *
 * Sections:
 * 1. Summary - Quick stats (schemas found, headings count)
 * 2. Metadata - Page info (title, description, canonical, language)
 * 3. Structured Data - Google-recognized JSON-LD schemas
 * 4. Headings - Heading outline (same as structure command)
 */
import type { ReactNode } from 'react'
import {
  SectionContainer,
  Section,
  SectionPriority,
  Table,
  HeadingOutline,
} from '../../components/ui/index.js'
import { usePalette } from '../../theme.js'
import type { GoogleResult, GoogleSchemaItem } from '../../../commands/google/types.js'
import type { ViewComponentProps } from '../types.js'

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Summary section content
 */
function SummaryContent({ data }: { data: GoogleResult }): ReactNode {
  const palette = usePalette()
  const hasSchemas = data.counts.schemas > 0
  const hasHeadings = data.counts.headings > 0
  const hasTitle = !!data.metadata.title
  const hasDescription = !!data.metadata.description

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Page Title:</span>{' '}
          <span fg={hasTitle ? palette.base0B : palette.base0A}>
            {hasTitle ? 'Present' : 'Missing'}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Meta Description:</span>{' '}
          <span fg={hasDescription ? palette.base0B : palette.base0A}>
            {hasDescription ? 'Present' : 'Missing'}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Structured Data:</span>{' '}
          <span fg={hasSchemas ? palette.base0B : palette.base03}>
            {data.counts.schemas} schema{data.counts.schemas !== 1 ? 's' : ''}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Headings:</span>{' '}
          <span fg={hasHeadings ? palette.base05 : palette.base0A}>
            {data.counts.headings}
          </span>
        </text>
      </box>
    </box>
  )
}

/**
 * Schema item display
 */
function SchemaItemContent({ schema }: { schema: GoogleSchemaItem }): ReactNode {
  const palette = usePalette()
  const keyProps = getKeyProperties(schema)

  return (
    <box flexDirection="column" gap={0} paddingBottom={1}>
      <text fg={palette.base0D}>
        {schema.type}
      </text>
      {keyProps.map(({ key, value }, idx) => (
        <box key={idx} paddingLeft={2}>
          <text>
            <span fg={palette.base03}>{key}:</span>{' '}
            <span fg={palette.base05}>{formatValue(value)}</span>
          </text>
        </box>
      ))}
    </box>
  )
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get key properties for a schema type (simplified for TUI display).
 */
function getKeyProperties(
  schema: GoogleSchemaItem,
): Array<{ key: string; value: unknown }> {
  const { type, data } = schema
  const props: Array<{ key: string; value: unknown }> = []

  // Common properties
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

    case 'Event':
      if (data['startDate'])
        props.push({ key: 'startDate', value: data['startDate'] })
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
      break
  }

  return props.slice(0, 3) // Limit to 3 for TUI display
}

/**
 * Format a value for display.
 */
function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return value.length > 40 ? value.slice(0, 37) + '...' : value
  }
  if (typeof value === 'number') {
    return String(value)
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value).slice(0, 40)
  }
  return String(value)
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main Google View Content component
 */
export function GoogleViewContent({
  data,
  height,
}: ViewComponentProps<GoogleResult>): ReactNode {
  const palette = usePalette()
  const hasSchemas = data.counts.schemas > 0
  const hasHeadings = data.counts.headings > 0
  const hasMetadata =
    data.metadata.title ||
    data.metadata.description ||
    data.metadata.canonical

  // Compute summary text
  const summaryParts: string[] = []
  if (data.metadata.title) summaryParts.push('Title')
  if (data.metadata.description) summaryParts.push('Desc')
  summaryParts.push(`${data.counts.schemas} schema${data.counts.schemas !== 1 ? 's' : ''}`)
  summaryParts.push(`${data.counts.headings} heading${data.counts.headings !== 1 ? 's' : ''}`)
  const summaryText = summaryParts.join(', ')

  // Compute metadata items
  const metadataItems = [
    { field: 'Title', value: data.metadata.title ?? '(not set)' },
    {
      field: 'Description',
      value: data.metadata.description
        ? data.metadata.description.length > 50
          ? data.metadata.description.slice(0, 47) + '...'
          : data.metadata.description
        : '(not set)',
    },
    { field: 'Canonical', value: data.metadata.canonical ?? '(not set)' },
    { field: 'Language', value: data.metadata.language ?? '(not set)' },
  ]

  return (
    <SectionContainer height={height}>
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

      {/* Metadata section */}
      <Section
        id="metadata"
        title="METADATA"
        priority={SectionPriority.PRIMARY}
        severity={hasMetadata ? undefined : 'warning'}
        summary={
          hasMetadata ? (data.metadata.title ?? 'Page metadata') : 'Missing key metadata'
        }
        defaultExpanded={false}
      >
        <Table data={metadataItems} variant="borderless" labelWidth={12} />
      </Section>

      {/* Structured Data section */}
      <Section
        id="structured-data"
        title="STRUCTURED DATA"
        priority={SectionPriority.PRIMARY}
        severity={hasSchemas ? undefined : 'muted'}
        summary={
          hasSchemas
            ? `${data.counts.schemas} Google-recognized schema${data.counts.schemas !== 1 ? 's' : ''}`
            : 'No Google-recognized schemas found'
        }
        defaultExpanded={hasSchemas}
        scrollable={data.schemas.length > 3}
      >
        {hasSchemas ? (
          <box flexDirection="column" gap={0}>
            {data.schemas.map((schema, idx) => (
              <SchemaItemContent key={idx} schema={schema} />
            ))}
          </box>
        ) : (
          <text fg={palette.base03}>
            No JSON-LD schemas found that Google uses for rich results.
          </text>
        )}
      </Section>

      {/* Headings section */}
      <Section
        id="headings"
        title="HEADINGS"
        priority={SectionPriority.SECONDARY}
        severity={hasHeadings ? undefined : 'warning'}
        summary={
          hasHeadings
            ? `${data.counts.headings} heading${data.counts.headings !== 1 ? 's' : ''}`
            : 'No headings found'
        }
        defaultExpanded={false}
        scrollable
      >
        {hasHeadings ? (
          <scrollbox flexGrow={1} paddingTop={1}>
            <HeadingOutline headings={data.headings.outline} />
          </scrollbox>
        ) : (
          <text fg={palette.base0A}>
            No headings found. Add heading structure for better SEO.
          </text>
        )}
      </Section>
    </SectionContainer>
  )
}
