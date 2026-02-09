/**
 * Structure View Content Component
 *
 * Custom TUI rendering for the Structure command using the expandable sections framework.
 */
import type { ReactNode } from 'react'
import {
  SectionContainer,
  Section,
  SectionPriority,
  Card,
  CardRow,
  Tree,
  type TreeNode,
} from '../../components/ui/index.js'
import { palette } from '../../theme.js'
import type { TuiStructureResult } from '../../../commands/structure/index.js'
import type {
  StructureWarning,
  LandmarkNode,
  HeadingInfo,
  LandmarkSkeleton,
} from '../../../lib/structure.js'
import type { ViewComponentProps } from '../types.js'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert LandmarkNode to TreeNode for the Tree component.
 */
function landmarkToTreeNode(landmark: LandmarkNode): TreeNode {
  const label = landmark.role
    ? `<${landmark.tag} role="${landmark.role}">`
    : `<${landmark.tag}>`

  return {
    label,
    children: landmark.children.map(landmarkToTreeNode),
  }
}

/**
 * Convert HeadingInfo to TreeNode for the Tree component.
 */
function headingToTreeNode(heading: HeadingInfo): TreeNode {
  const meta =
    heading.content.wordCount > 0
      ? ` (${heading.content.wordCount} words)`
      : undefined

  return {
    label: `H${heading.level}`,
    meta: heading.text + (meta ?? ''),
    children: heading.children.map(headingToTreeNode),
  }
}

/**
 * Format heading counts summary.
 */
function formatHeadingsSummary(counts: Record<string, number>): string {
  const parts: string[] = []
  for (let i = 1; i <= 6; i++) {
    const key = `h${i}`
    const count = counts[key]
    if (count && count > 0) {
      parts.push(`${count}x H${i}`)
    }
  }
  return parts.length > 0 ? parts.join(', ') : 'No headings'
}

/**
 * Format landmark skeleton as compact summary.
 */
function formatLandmarkSummary(skeleton: LandmarkSkeleton[]): string {
  const present = skeleton.filter((s) => s.count > 0)
  if (present.length === 0) return 'No landmarks detected'
  return present
    .map((s) => (s.count > 1 ? `${s.role} (${s.count})` : s.role))
    .join(', ')
}

/**
 * Count total landmarks.
 */
function countLandmarks(skeleton: LandmarkSkeleton[]): number {
  return skeleton.reduce((sum, s) => sum + s.count, 0)
}

// ============================================================================
// Content Components (rendered inside Sections)
// ============================================================================

/**
 * Violations content
 */
function ViolationsContent({
  warnings,
}: {
  warnings: StructureWarning[]
}): ReactNode {
  if (warnings.length === 0) {
    return (
      <text fg={palette.green}>
        All structure checks passed. No accessibility issues detected.
      </text>
    )
  }

  return (
    <box flexDirection="column" gap={0}>
      {warnings.map((warning, i) => (
        <Card
          key={i}
          title={warning.message}
          severity={warning.severity === 'error' ? 'error' : 'warning'}
          icon={warning.severity === 'error' ? '✗' : '⚠'}
        >
          <CardRow label="Rule" value={warning.id} />
          {warning.details && <CardRow label="Fix" value={warning.details} />}
        </Card>
      ))}
    </box>
  )
}

/**
 * Metadata content
 */
function MetadataContent({
  title,
  language,
}: {
  title: string | null
  language: string | null
}): ReactNode {
  const hasTitle = Boolean(title)
  const hasLanguage = Boolean(language)

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row">
        <text fg={palette.gray}>Title: </text>
        {hasTitle ? (
          <text fg={palette.white}>{title}</text>
        ) : (
          <text fg={palette.yellow}>(none)</text>
        )}
      </box>
      <box flexDirection="row">
        <text fg={palette.gray}>Language: </text>
        {hasLanguage ? (
          <text fg={palette.white}>{language}</text>
        ) : (
          <text fg={palette.yellow}>(not set)</text>
        )}
      </box>
    </box>
  )
}

/**
 * Links content
 */
function LinksContent({
  internalCount,
  externalCount,
}: {
  internalCount: number
  externalCount: number
}): ReactNode {
  return (
    <box flexDirection="column" gap={0}>
      <text>
        <span fg={palette.gray}>Internal: </span>
        <span fg={palette.white}>{internalCount}</span>
      </text>
      <text>
        <span fg={palette.gray}>External: </span>
        <span fg={palette.white}>{externalCount}</span>
      </text>
    </box>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main Structure View Content component
 */
export function StructureViewContent({
  data,
  height,
}: ViewComponentProps<TuiStructureResult>): ReactNode {
  const { analysis, axeResult } = data

  // Compute violations section props
  const warnings = axeResult.violationWarnings
  const errors = warnings.filter((w) => w.severity === 'error')
  const warningItems = warnings.filter((w) => w.severity === 'warning')
  const hasIssues = warnings.length > 0
  const violationsSummary = hasIssues
    ? `${errors.length} errors, ${warningItems.length} warnings`
    : 'No accessibility issues detected'

  // Compute metadata section props
  const hasTitle = Boolean(analysis.title)
  const hasLanguage = Boolean(analysis.language)
  const metadataOk = hasTitle && hasLanguage
  const metadataSummary = [
    analysis.title ? `"${analysis.title}"` : 'No title',
    analysis.language ? `lang="${analysis.language}"` : 'No language',
  ].join(' | ')

  // Compute landmarks section props
  const landmarkCount = countLandmarks(analysis.landmarks.skeleton)
  const hasLandmarks = landmarkCount > 0
  const landmarkSummary = formatLandmarkSummary(analysis.landmarks.skeleton)
  const landmarkTreeNodes = analysis.landmarks.outline.map(landmarkToTreeNode)

  // Compute headings section props
  const hasHeadings = analysis.headings.total > 0
  const headingsSummary = formatHeadingsSummary(analysis.headings.counts)
  const headingTreeNodes = analysis.headings.outline.map(headingToTreeNode)

  // Compute links section props
  const totalLinks =
    analysis.links.internal.count + analysis.links.external.count
  const linksSummary = `${analysis.links.internal.count} internal, ${analysis.links.external.count} external`

  return (
    <SectionContainer height={height}>
      {/* Violations section */}
      <Section
        id="violations"
        title="VIOLATIONS"
        priority={SectionPriority.ERROR}
        severity={
          errors.length > 0
            ? 'error'
            : warningItems.length > 0
              ? 'warning'
              : 'success'
        }
        icon={errors.length > 0 ? '✗' : warningItems.length > 0 ? '⚠' : '✓'}
        count={warnings.length}
        summary={violationsSummary}
        defaultExpanded={hasIssues}
      >
        <ViolationsContent warnings={warnings} />
      </Section>

      {/* Metadata section */}
      <Section
        id="metadata"
        title="METADATA"
        priority={SectionPriority.SUMMARY}
        severity={metadataOk ? undefined : 'warning'}
        icon={metadataOk ? undefined : '⚠'}
        summary={metadataSummary}
        defaultExpanded={true}
      >
        <MetadataContent title={analysis.title} language={analysis.language} />
      </Section>

      {/* Landmarks section */}
      <Section
        id="landmarks"
        title="LANDMARKS"
        priority={SectionPriority.PRIMARY}
        count={landmarkCount}
        severity={hasLandmarks ? undefined : 'warning'}
        icon={hasLandmarks ? undefined : '⚠'}
        summary={landmarkSummary}
        defaultExpanded={hasLandmarks}
        scrollable
      >
        {hasLandmarks ? (
          <Tree nodes={landmarkTreeNodes} showLines={true} />
        ) : (
          <text fg={palette.yellow}>No landmark elements found.</text>
        )}
      </Section>

      {/* Headings section */}
      <Section
        id="headings"
        title="HEADINGS"
        priority={SectionPriority.PRIMARY}
        count={analysis.headings.total}
        severity={hasHeadings ? undefined : 'warning'}
        icon={hasHeadings ? undefined : '⚠'}
        summary={headingsSummary}
        defaultExpanded={hasHeadings}
        scrollable
      >
        {hasHeadings ? (
          <Tree nodes={headingTreeNodes} showLines={true} />
        ) : (
          <text fg={palette.yellow}>No headings found.</text>
        )}
      </Section>

      {/* Links section */}
      <Section
        id="links"
        title="LINKS"
        priority={SectionPriority.SECONDARY}
        count={totalLinks}
        summary={linksSummary}
        defaultExpanded={false}
      >
        <LinksContent
          internalCount={analysis.links.internal.count}
          externalCount={analysis.links.external.count}
        />
      </Section>
    </SectionContainer>
  )
}
