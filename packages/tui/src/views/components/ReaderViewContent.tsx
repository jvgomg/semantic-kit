/**
 * Reader View Content Component
 *
 * Custom TUI rendering for the Reader command using the expandable sections framework.
 *
 * Sections:
 * 1. Summary - Quick stats (word count, paragraph count, readerable)
 * 2. Metadata - Page info (title, byline, site, excerpt)
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
import { usePalette } from '../../theme.js'
import type { ReaderResult } from '@webspecs/core'
import type { ViewComponentProps } from '../types.js'

/**
 * Summary section content
 */
function SummaryContent({ data }: { data: ReaderResult }): ReactNode {
  const palette = usePalette()
  const { metrics } = data

  const getReadabilityStatus = () => {
    if (metrics.isReaderable) return { text: 'Yes', color: palette.base0B }
    return { text: 'No', color: palette.base0A }
  }

  const readability = getReadabilityStatus()

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Words:</span>{' '}
          <span fg={palette.base05}>{metrics.wordCount.toLocaleString()}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Characters:</span>{' '}
          <span fg={palette.base05}>
            {metrics.characterCount.toLocaleString()}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Paragraphs:</span>{' '}
          <span fg={palette.base05}>
            {metrics.paragraphCount.toLocaleString()}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Readerable:</span>{' '}
          <span fg={readability.color}>{readability.text}</span>
        </text>
      </box>
    </box>
  )
}

/**
 * Main Reader View Content component
 */
export function ReaderViewContent({
  data,
  height,
}: ViewComponentProps<ReaderResult>): ReactNode {
  const palette = usePalette()
  const { metrics } = data
  const hasContent = data.markdown && metrics.wordCount > 0
  const hasMetadata = data.title || data.byline || data.siteName || data.excerpt

  // Compute summary text
  const readableText = metrics.isReaderable ? 'Yes' : 'No'
  const summaryText = `${metrics.wordCount.toLocaleString()} words, ${metrics.paragraphCount} paragraphs, Readerable: ${readableText}`

  // Compute metadata
  const metadataItems = hasMetadata
    ? [
        { field: 'Title', value: data.title ?? '(not found)' },
        { field: 'Byline', value: data.byline ?? '(not found)' },
        { field: 'Site', value: data.siteName ?? '(not found)' },
        { field: 'Excerpt', value: data.excerpt ?? '(not found)' },
        ...(data.publishedTime
          ? [{ field: 'Published', value: data.publishedTime }]
          : []),
      ]
    : []

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
        severity={hasMetadata ? undefined : 'muted'}
        summary={
          hasMetadata ? (data.title ?? 'Page metadata') : 'No metadata found'
        }
        defaultExpanded={false}
      >
        {hasMetadata ? (
          <Table data={metadataItems} variant="borderless" labelWidth={10} />
        ) : (
          <text fg={palette.base03}>
            No title, byline, site name, or excerpt found.
          </text>
        )}
      </Section>

      {/* Content section */}
      <Section
        id="content"
        title="CONTENT"
        priority={SectionPriority.SECONDARY}
        severity={hasContent ? undefined : 'warning'}
        icon={hasContent ? undefined : '⚠'}
        summary={
          hasContent
            ? `${metrics.wordCount.toLocaleString()} words extracted`
            : 'No content could be extracted from this page'
        }
        defaultExpanded={true}
        scrollable
      >
        {hasContent ? (
          <scrollbox flexGrow={1} paddingTop={1}>
            <ContentMarkdown
              content={data.markdown}
              title={data.title ?? undefined}
            />
          </scrollbox>
        ) : (
          <text fg={palette.base0A}>
            No content could be extracted from this page.
          </text>
        )}
      </Section>
    </SectionContainer>
  )
}
