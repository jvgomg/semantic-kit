/**
 * AI View Content Component
 *
 * Custom TUI rendering for the AI command using the expandable sections framework.
 *
 * Sections:
 * 1. Warnings - Hidden content issues (if any)
 * 2. Summary - Quick stats (word count, readerable)
 * 3. Metadata - Page info (title, byline, site)
 * 4. Content - Extracted markdown body
 */
import type { ReactNode } from 'react'
import {
  ContentMarkdown,
  SectionContainer,
  Section,
  SectionPriority,
  Card,
  CardRow,
  Table,
} from '../../components/ui/index.js'
import { usePalette } from '../../theme.js'
import type { AiResult, HiddenContentAnalysis } from '../../../lib/results.js'
import type { ViewComponentProps } from '../types.js'

/**
 * Warning card content for hidden content issues
 */
function HiddenContentCard({
  analysis,
  severity,
  icon,
}: {
  analysis: HiddenContentAnalysis
  severity: 'error' | 'warning'
  icon: string
}): ReactNode {
  return (
    <Card title="Hidden Content Detected" severity={severity} icon={icon}>
      <CardRow
        label="Hidden Words"
        value={analysis.hiddenWordCount.toLocaleString()}
      />
      <CardRow
        label="Visible Words"
        value={analysis.visibleWordCount.toLocaleString()}
      />
      <CardRow
        label="Hidden Percentage"
        value={`${analysis.hiddenPercentage}%`}
      />
      {analysis.framework && (
        <CardRow
          label="Framework"
          value={`${analysis.framework.name} (${analysis.framework.confidence})`}
        />
      )}
      {analysis.hasStreamingContent && (
        <CardRow
          label="Streaming"
          value="Page uses streaming/deferred content"
          muted
        />
      )}
    </Card>
  )
}

/**
 * Summary section content
 */
function SummaryContent({ data }: { data: AiResult }): ReactNode {
  const palette = usePalette()
  const { hiddenContentAnalysis } = data

  const getReadabilityStatus = () => {
    if (data.isReaderable) return { text: 'Yes', color: palette.base0B }
    return { text: 'No', color: palette.base0A }
  }

  const getHiddenStatus = () => {
    if (hiddenContentAnalysis.severity === 'none') {
      return { text: '0%', color: palette.base0B }
    }
    if (hiddenContentAnalysis.severity === 'low') {
      return {
        text: `${hiddenContentAnalysis.hiddenPercentage}%`,
        color: palette.base0A,
      }
    }
    return {
      text: `${hiddenContentAnalysis.hiddenPercentage}%`,
      color: palette.base08,
    }
  }

  const readability = getReadabilityStatus()
  const hidden = getHiddenStatus()

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Words:</span>{' '}
          <span fg={palette.base05}>{data.wordCount.toLocaleString()}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Readerable:</span>{' '}
          <span fg={readability.color}>{readability.text}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Hidden Content:</span>{' '}
          <span fg={hidden.color}>{hidden.text}</span>
        </text>
      </box>
      {hiddenContentAnalysis.framework && (
        <box flexDirection="row" gap={2}>
          <text>
            <span fg={palette.base03}>Framework:</span>{' '}
            <span fg={palette.base0D}>
              {hiddenContentAnalysis.framework.name}
            </span>
          </text>
        </box>
      )}
    </box>
  )
}

/**
 * Main AI View Content component
 */
export function AiViewContent({
  data,
  height,
}: ViewComponentProps<AiResult>): ReactNode {
  const palette = usePalette()
  const { hiddenContentAnalysis } = data
  const hasWarning = hiddenContentAnalysis.severity !== 'none'
  const hasContent = data.markdown && data.wordCount > 0
  const hasMetadata = data.title || data.byline || data.siteName || data.excerpt

  // Compute warning section props
  const warningSeverity =
    hiddenContentAnalysis.severity === 'high' ? 'error' : 'warning'
  const warningIcon = hiddenContentAnalysis.severity === 'high' ? '✗' : '⚠'
  const warningSummary = hasWarning
    ? `${hiddenContentAnalysis.hiddenPercentage}% of content is hidden (${hiddenContentAnalysis.hiddenWordCount} words)`
    : undefined

  // Compute summary text
  const readableText = data.isReaderable ? 'Yes' : 'No'
  const hiddenText =
    hiddenContentAnalysis.severity === 'none'
      ? '0%'
      : `${hiddenContentAnalysis.hiddenPercentage}%`
  const summaryText = `${data.wordCount.toLocaleString()} words • Readerable: ${readableText} • Hidden: ${hiddenText}`

  // Compute metadata
  const metadataItems = hasMetadata
    ? [
        { field: 'Title', value: data.title ?? '(not found)' },
        { field: 'Byline', value: data.byline ?? '(not found)' },
        { field: 'Site', value: data.siteName ?? '(not found)' },
        { field: 'Excerpt', value: data.excerpt ?? '(not found)' },
      ]
    : []

  return (
    <SectionContainer height={height}>
      {/* Warnings section */}
      <Section
        id="warnings"
        title="WARNINGS"
        priority={SectionPriority.WARNING}
        severity={hasWarning ? warningSeverity : 'success'}
        icon={hasWarning ? warningIcon : '✓'}
        count={hasWarning ? 1 : 0}
        summary={warningSummary ?? 'No issues detected'}
        defaultExpanded={hasWarning}
      >
        {hasWarning ? (
          <HiddenContentCard
            analysis={hiddenContentAnalysis}
            severity={warningSeverity}
            icon={warningIcon}
          />
        ) : (
          <text fg={palette.base0B}>
            All checks passed. No hidden content detected.
          </text>
        )}
      </Section>

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
            No title, author, site name, or excerpt found.
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
            ? `${data.wordCount.toLocaleString()} words extracted`
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
