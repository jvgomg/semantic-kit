/**
 * Readability View Content Component
 *
 * Custom TUI rendering for the Readability utility showing full metrics.
 *
 * Sections:
 * 1. Metrics - Full Readability metrics including link density
 * 2. Extraction - Page metadata (title, byline, site, excerpt)
 * 3. Content - Extracted markdown body
 */
import type { ReactNode } from 'react'
import {
  ContentMarkdown,
  SectionContainer,
  Section,
  SectionPriority,
  Table,
} from '../../components/ui/index.js'
import { useSemanticColors } from '../../theme.js'
import type { ReadabilityUtilityResult } from '@webspecs/core'
import type { ViewComponentProps } from '../types.js'

/**
 * Format link density with assessment.
 */
function formatLinkDensity(
  density: number,
  colors: ReturnType<typeof useSemanticColors>,
): { text: string; color: string } {
  const percentage = (density * 100).toFixed(1)
  if (density < 0.1) {
    return { text: `${percentage}% (low)`, color: colors.textSuccess }
  } else if (density < 0.3) {
    return { text: `${percentage}% (moderate)`, color: colors.textWarning }
  } else {
    return { text: `${percentage}% (high)`, color: colors.textError }
  }
}

/**
 * Metrics section content - includes link density
 */
function MetricsContent({
  data,
}: {
  data: ReadabilityUtilityResult
}): ReactNode {
  const colors = useSemanticColors()
  const { metrics } = data

  const getReadabilityStatus = () => {
    if (metrics.isReaderable) return { text: 'Yes', color: colors.textSuccess }
    return { text: 'No', color: colors.textWarning }
  }

  const readability = getReadabilityStatus()
  const linkDensity = formatLinkDensity(metrics.linkDensity, colors)

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={colors.textMuted}>Words:</span>{' '}
          <span fg={colors.text}>{metrics.wordCount.toLocaleString()}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={colors.textMuted}>Characters:</span>{' '}
          <span fg={colors.text}>
            {metrics.characterCount.toLocaleString()}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={colors.textMuted}>Paragraphs:</span>{' '}
          <span fg={colors.text}>
            {metrics.paragraphCount.toLocaleString()}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={colors.textMuted}>Link Density:</span>{' '}
          <span fg={linkDensity.color}>{linkDensity.text}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={colors.textMuted}>Readerable:</span>{' '}
          <span fg={readability.color}>{readability.text}</span>
        </text>
      </box>
    </box>
  )
}

/**
 * Main Readability View Content component
 */
export function ReadabilityViewContent({
  data,
  height,
}: ViewComponentProps<ReadabilityUtilityResult>): ReactNode {
  const colors = useSemanticColors()
  const { metrics, extraction } = data
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
          <text fg={colors.textMuted}>
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
          <text fg={colors.textWarning}>
            No content could be extracted from this page.
          </text>
        )}
      </Section>
    </SectionContainer>
  )
}
