/**
 * Readability:compare View Content Component
 *
 * Shows comparison between static and JS-rendered Readability extraction.
 * Uses OpenTUI diff component for unified diff view.
 *
 * Sections:
 * 1. Comparison - Word count comparison, JS-dependent percentage
 * 2. Content Diff - Unified diff of static vs rendered markdown
 */
import { createPatch } from 'diff'
import type { ReactNode } from 'react'
import {
  SectionContainer,
  Section,
  SectionPriority,
} from '../../components/ui/index.js'
import { usePalette } from '../../theme.js'
import type { ReadabilityCompareResult } from '@webspecs/core'
import type { ViewComponentProps } from '../types.js'

/**
 * Get severity color based on JS-dependent percentage
 */
function getJsDependencyColor(
  percentage: number,
  palette: ReturnType<typeof usePalette>,
): string {
  if (percentage === 0) return palette.base0B
  if (percentage <= 25) return palette.base0D
  if (percentage <= 50) return palette.base0A
  return palette.base08
}

/**
 * Comparison section content
 */
function ComparisonContent({
  data,
}: {
  data: ReadabilityCompareResult
}): ReactNode {
  const palette = usePalette()
  const { comparison } = data
  const depColor = getJsDependencyColor(
    comparison.jsDependentPercentage,
    palette,
  )
  const hasSections = comparison.sectionsOnlyInRendered.length > 0

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Static HTML:</span>{' '}
          <span fg={palette.base05}>
            {comparison.staticWordCount.toLocaleString()} words
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Rendered DOM:</span>{' '}
          <span fg={palette.base05}>
            {comparison.renderedWordCount.toLocaleString()} words
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>JS-Dependent:</span>{' '}
          <span fg={depColor}>
            {comparison.jsDependentWordCount.toLocaleString()} words (
            {comparison.jsDependentPercentage}%)
          </span>
        </text>
      </box>
      {hasSections && (
        <box flexDirection="row" gap={2} marginTop={1}>
          <text>
            <span fg={palette.base03}>JS-Only Sections:</span>{' '}
            <span fg={palette.base0A}>
              {comparison.sectionsOnlyInRendered.length} section(s) hidden from
              static crawlers
            </span>
          </text>
        </box>
      )}
    </box>
  )
}

/**
 * Main Readability:compare View Content component
 */
export function ReadabilityCompareViewContent({
  data,
  height,
}: ViewComponentProps<ReadabilityCompareResult>): ReactNode {
  const palette = usePalette()
  const { comparison, timedOut } = data
  const hasStaticContent =
    data.static.markdown && data.static.metrics.wordCount > 0
  const hasRenderedContent =
    data.rendered.markdown && data.rendered.metrics.wordCount > 0
  const hasContent = hasStaticContent || hasRenderedContent
  const hasDifferences = data.static.markdown !== data.rendered.markdown

  // Compute summary for comparison section
  const depPercentage = comparison.jsDependentPercentage
  const summaryText =
    depPercentage === 0
      ? 'No JavaScript dependency detected'
      : `${depPercentage}% of content requires JavaScript`

  // Get severity based on JS dependency
  const getSeverity = () => {
    if (depPercentage === 0) return undefined
    if (depPercentage <= 25) return undefined
    if (depPercentage <= 50) return 'warning' as const
    return 'error' as const
  }

  // Compute diff summary
  const getDiffSummary = () => {
    if (!hasContent) return 'No content to compare'
    if (!hasDifferences) return 'No differences between static and rendered'
    const added = comparison.renderedWordCount - comparison.staticWordCount
    if (added > 0) {
      return `+${added} words added by JavaScript`
    } else if (added < 0) {
      return `${added} words (content differs)`
    }
    return 'Content differs between versions'
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
          <text fg={palette.base0A}>
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
        icon={depPercentage > 50 ? '!' : undefined}
        summary={summaryText}
        defaultExpanded={true}
      >
        <ComparisonContent data={data} />
      </Section>

      {/* Content diff section */}
      <Section
        id="content-diff"
        title="CONTENT DIFF"
        priority={SectionPriority.PRIMARY}
        severity={hasDifferences ? 'info' : 'muted'}
        summary={getDiffSummary()}
        defaultExpanded={true}
        scrollable
      >
        {!hasContent ? (
          <text fg={palette.base0A}>
            No content could be extracted from either version.
          </text>
        ) : !hasDifferences ? (
          <text fg={palette.base03}>
            Static and rendered content are identical.
          </text>
        ) : (
          <scrollbox flexGrow={1}>
            <diff
              diff={createPatch(
                'content.md',
                data.static.markdown,
                data.rendered.markdown,
                'Static HTML',
                'Rendered DOM',
              )}
              view="unified"
              filetype="markdown"
              showLineNumbers
            />
          </scrollbox>
        )}
      </Section>
    </SectionContainer>
  )
}
