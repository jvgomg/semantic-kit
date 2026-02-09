/**
 * AI View Content Component
 *
 * Custom TUI rendering for the AI command using the expandable sections framework.
 *
 * Sections:
 * 1. Warnings - Hidden content issues (if any)
 * 2. Summary - Quick stats (word count, readerable)
 * 3. Metadata - Page info (title, author, site)
 * 4. Content - Extracted markdown body
 */
import type { ReactNode } from 'react'
import { SyntaxStyle, RGBA } from '@opentui/core'
import {
  SectionContainer,
  Section,
  SectionPriority,
  Card,
  CardRow,
  Table,
} from '../../components/ui/index.js'
import { palette } from '../../theme.js'
import type { AiResult, HiddenContentAnalysis } from '../../../lib/results.js'
import type { ViewComponentProps } from '../types.js'

/**
 * Markdown syntax style for the content section.
 */
const markdownSyntaxStyle = SyntaxStyle.fromStyles({
  'markup.heading.1': {
    fg: RGBA.fromHex(palette.cyanBright),
    bold: true,
    underline: true,
  },
  'markup.heading.2': { fg: RGBA.fromHex(palette.cyan), bold: true },
  'markup.heading.3': { fg: RGBA.fromHex(palette.cyan), bold: true },
  'markup.heading.4': { fg: RGBA.fromHex(palette.cyan), bold: true },
  'markup.heading.5': { fg: RGBA.fromHex(palette.cyan), bold: true },
  'markup.heading.6': { fg: RGBA.fromHex(palette.cyan), bold: true },
  'markup.bold': { fg: RGBA.fromHex(palette.white), bold: true },
  'markup.strong': { fg: RGBA.fromHex(palette.white), bold: true },
  'markup.italic': { fg: RGBA.fromHex(palette.white), italic: true },
  'markup.list': { fg: RGBA.fromHex(palette.yellow) },
  'markup.quote': { fg: RGBA.fromHex(palette.gray), italic: true },
  'markup.raw': { fg: RGBA.fromHex(palette.green) },
  'markup.raw.block': { fg: RGBA.fromHex(palette.green) },
  'markup.link': { fg: RGBA.fromHex(palette.blue), underline: true },
  'markup.link.url': { fg: RGBA.fromHex(palette.blue), underline: true },
  default: { fg: RGBA.fromHex(palette.white) },
})

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
  const { hiddenContentAnalysis } = data

  const getReadabilityStatus = () => {
    if (data.isReaderable) return { text: 'Yes', color: palette.green }
    return { text: 'No', color: palette.yellow }
  }

  const getHiddenStatus = () => {
    if (hiddenContentAnalysis.severity === 'none') {
      return { text: '0%', color: palette.green }
    }
    if (hiddenContentAnalysis.severity === 'low') {
      return {
        text: `${hiddenContentAnalysis.hiddenPercentage}%`,
        color: palette.yellow,
      }
    }
    return {
      text: `${hiddenContentAnalysis.hiddenPercentage}%`,
      color: palette.red,
    }
  }

  const readability = getReadabilityStatus()
  const hidden = getHiddenStatus()

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Words:</span>{' '}
          <span fg={palette.white}>{data.wordCount.toLocaleString()}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Readerable:</span>{' '}
          <span fg={readability.color}>{readability.text}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Hidden Content:</span>{' '}
          <span fg={hidden.color}>{hidden.text}</span>
        </text>
      </box>
      {hiddenContentAnalysis.framework && (
        <box flexDirection="row" gap={2}>
          <text>
            <span fg={palette.gray}>Framework:</span>{' '}
            <span fg={palette.cyan}>
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
  const { hiddenContentAnalysis } = data
  const hasWarning = hiddenContentAnalysis.severity !== 'none'
  const hasContent = data.markdown && data.wordCount > 0
  const hasMetadata = data.title || data.author || data.siteName || data.excerpt

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
        { field: 'Author', value: data.author ?? '(not found)' },
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
          <text fg={palette.green}>
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
          <text fg={palette.gray}>
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
            <markdown
              content={
                data.title
                  ? `# ${data.title}\n\n${data.markdown}`
                  : data.markdown
              }
              syntaxStyle={markdownSyntaxStyle}
              conceal={false}
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
