/**
 * Readability:js View Content Component
 *
 * Same as ReadabilityViewContent but handles timedOut status.
 */
import type { ReactNode } from 'react'
import {
  ContentMarkdown,
  SectionContainer,
  Section,
  SectionPriority,
  Table,
} from '../../components/ui/index.js'
import { palette } from '../../theme.js'
import type { ReadabilityJsResult } from '../../../lib/results.js'
import type { ViewComponentProps } from '../types.js'

/**
 * Format link density with assessment.
 */
function formatLinkDensity(density: number): { text: string; color: string } {
  const percentage = (density * 100).toFixed(1)
  if (density < 0.1) {
    return { text: `${percentage}% (low)`, color: palette.green }
  } else if (density < 0.3) {
    return { text: `${percentage}% (moderate)`, color: palette.yellow }
  } else {
    return { text: `${percentage}% (high)`, color: palette.red }
  }
}

/**
 * Metrics section content - includes link density
 */
function MetricsContent({
  data,
}: {
  data: ReadabilityJsResult
}): ReactNode {
  const { metrics } = data

  const getReadabilityStatus = () => {
    if (metrics.isReaderable) return { text: 'Yes', color: palette.green }
    return { text: 'No', color: palette.yellow }
  }

  const readability = getReadabilityStatus()
  const linkDensity = formatLinkDensity(metrics.linkDensity)

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Words:</span>{' '}
          <span fg={palette.white}>{metrics.wordCount.toLocaleString()}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Characters:</span>{' '}
          <span fg={palette.white}>
            {metrics.characterCount.toLocaleString()}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Paragraphs:</span>{' '}
          <span fg={palette.white}>
            {metrics.paragraphCount.toLocaleString()}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Link Density:</span>{' '}
          <span fg={linkDensity.color}>{linkDensity.text}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Readerable:</span>{' '}
          <span fg={readability.color}>{readability.text}</span>
        </text>
      </box>
    </box>
  )
}

/**
 * Main Readability:js View Content component
 */
export function ReadabilityJsViewContent({
  data,
  height,
}: ViewComponentProps<ReadabilityJsResult>): ReactNode {
  const { metrics, extraction, timedOut } = data
  const hasContent = data.markdown && metrics.wordCount > 0
  const hasExtraction =
    extraction &&
    (extraction.title ||
      extraction.byline ||
      extraction.siteName ||
      extraction.excerpt)

  // Compute summary text with link density
  const linkDensityPct = (metrics.linkDensity * 100).toFixed(1)
  const readableText = metrics.isReaderable ? 'Yes' : 'No'
  const summaryText = `${metrics.wordCount.toLocaleString()} words, Link density: ${linkDensityPct}%, Readerable: ${readableText}`

  // Compute extraction metadata
  const extractionItems = hasExtraction
    ? [
        { field: 'Title', value: extraction.title ?? '(not found)' },
        { field: 'Byline', value: extraction.byline ?? '(not found)' },
        { field: 'Site', value: extraction.siteName ?? '(not found)' },
        { field: 'Excerpt', value: extraction.excerpt ?? '(not found)' },
        ...(extraction.publishedTime
          ? [{ field: 'Published', value: extraction.publishedTime }]
          : []),
      ]
    : []

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
            The page took too long to load. The results shown are from partial
            content. Consider increasing the timeout with --timeout.
          </text>
        </Section>
      )}

      {/* Metrics section - includes link density */}
      <Section
        id="metrics"
        title="METRICS"
        priority={SectionPriority.SUMMARY}
        summary={summaryText}
        defaultExpanded={true}
      >
        <MetricsContent data={data} />
      </Section>

      {/* Extraction section */}
      <Section
        id="extraction"
        title="EXTRACTION"
        priority={SectionPriority.PRIMARY}
        severity={hasExtraction ? undefined : 'muted'}
        summary={
          hasExtraction
            ? (extraction?.title ?? 'Extraction metadata')
            : 'Extraction failed'
        }
        defaultExpanded={false}
      >
        {hasExtraction ? (
          <Table data={extractionItems} variant="borderless" labelWidth={10} />
        ) : (
          <text fg={palette.gray}>
            No content could be extracted. Readability requires article-like
            content.
          </text>
        )}
      </Section>

      {/* Content section */}
      <Section
        id="content"
        title="CONTENT"
        priority={SectionPriority.SECONDARY}
        severity={hasContent ? undefined : 'warning'}
        icon={hasContent ? undefined : '!'}
        summary={
          hasContent
            ? `${metrics.wordCount.toLocaleString()} words extracted`
            : 'No content could be extracted'
        }
        defaultExpanded={true}
        scrollable
      >
        {hasContent ? (
          <scrollbox flexGrow={1} paddingTop={1}>
            <ContentMarkdown
              content={data.markdown}
              title={extraction?.title ?? undefined}
            />
          </scrollbox>
        ) : (
          <text fg={palette.yellow}>
            No content could be extracted from this page.
          </text>
        )}
      </Section>
    </SectionContainer>
  )
}
