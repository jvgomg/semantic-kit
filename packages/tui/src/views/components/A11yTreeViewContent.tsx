/**
 * A11y Tree View Content Component
 *
 * Displays accessibility tree snapshot with role counts and hierarchical structure.
 * Used by both a11y-tree and a11y-tree:js views.
 *
 * Sections:
 * 1. Timeout (conditional) - Warning if page load timed out
 * 2. Summary - Quick stats (role counts by category)
 * 3. Accessibility Tree - Hierarchical AriaNode display
 */
import type { ReactNode } from 'react'
import {
  SectionContainer,
  Section,
  SectionPriority,
  Card,
  CardRow,
  Tree,
} from '../../components/ui/index.js'
import type { TreeNode } from '../../components/ui/index.js'
import { usePalette } from '../../theme.js'
import type { A11yResult } from '@webspecs/core'
import type { AriaNode } from '@webspecs/core'
import type { ViewComponentProps } from '../types.js'

// Role categories for summary display
const LANDMARK_ROLES = [
  'banner',
  'navigation',
  'main',
  'contentinfo',
  'complementary',
  'region',
  'search',
  'form',
]
const STRUCTURAL_ROLES = [
  'heading',
  'list',
  'listitem',
  'table',
  'row',
  'cell',
  'img',
  'article',
  'section',
]
const INTERACTIVE_ROLES = [
  'link',
  'button',
  'textbox',
  'checkbox',
  'radio',
  'combobox',
  'listbox',
  'slider',
  'menuitem',
  'tab',
]

/**
 * Convert AriaNode to TreeNode for Tree component display.
 */
function ariaNodeToTreeNode(node: AriaNode): TreeNode {
  // Build the label from role and name
  let label = node.role
  if (node.name) {
    label += ` "${node.name}"`
  }

  // Build meta from attributes
  const attrEntries = Object.entries(node.attributes)
  let meta: string | undefined
  if (attrEntries.length > 0) {
    const attrParts = attrEntries.map(([key, value]) => {
      if (value === true) return key
      return `${key}=${value}`
    })
    meta = `[${attrParts.join(' ')}]`
  }

  return {
    label,
    meta,
    children: node.children.map(ariaNodeToTreeNode),
  }
}

/**
 * Format role counts for a category.
 */
function formatCategoryCounts(
  counts: Record<string, number>,
  roles: string[],
): string {
  const items = roles
    .filter((role) => counts[role])
    .map((role) => `${role}: ${counts[role]}`)
  return items.length > 0 ? items.join(', ') : 'none'
}

/**
 * Get total count for a category.
 */
function getCategoryTotal(
  counts: Record<string, number>,
  roles: string[],
): number {
  return roles.reduce((total, role) => total + (counts[role] || 0), 0)
}

/**
 * Warning card for missing main landmark
 */
function MissingMainCard(): ReactNode {
  return (
    <Card title="Missing Main Landmark" severity="warning" icon="!">
      <CardRow label="Issue" value="No main landmark found" />
      <CardRow
        label="Impact"
        value="Screen readers cannot navigate to primary content"
        muted
      />
    </Card>
  )
}

/**
 * Warning card for missing headings
 */
function MissingHeadingsCard(): ReactNode {
  return (
    <Card title="No Headings Found" severity="warning" icon="!">
      <CardRow label="Issue" value="No heading elements found" />
      <CardRow
        label="Impact"
        value="Screen readers cannot navigate by headings"
        muted
      />
    </Card>
  )
}

/**
 * Summary section content showing role counts by category.
 */
function SummaryContent({ data }: { data: A11yResult }): ReactNode {
  const palette = usePalette()
  const { counts } = data

  const landmarkCount = getCategoryTotal(counts, LANDMARK_ROLES)
  const structuralCount = getCategoryTotal(counts, STRUCTURAL_ROLES)
  const interactiveCount = getCategoryTotal(counts, INTERACTIVE_ROLES)

  const hasMain = (counts['main'] || 0) > 0

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Landmarks:</span>{' '}
          <span fg={landmarkCount > 0 ? palette.base05 : palette.base0A}>
            {landmarkCount}
          </span>
          {landmarkCount > 0 && (
            <span fg={palette.base02}>
              {' '}
              ({formatCategoryCounts(counts, LANDMARK_ROLES)})
            </span>
          )}
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Structural:</span>{' '}
          <span fg={palette.base05}>{structuralCount}</span>
          {structuralCount > 0 && (
            <span fg={palette.base02}>
              {' '}
              ({formatCategoryCounts(counts, STRUCTURAL_ROLES)})
            </span>
          )}
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Interactive:</span>{' '}
          <span fg={palette.base05}>{interactiveCount}</span>
          {interactiveCount > 0 && (
            <span fg={palette.base02}>
              {' '}
              ({formatCategoryCounts(counts, INTERACTIVE_ROLES)})
            </span>
          )}
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Main Landmark:</span>{' '}
          <span fg={hasMain ? palette.base0B : palette.base0A}>
            {hasMain ? 'Yes' : 'No'}
          </span>
        </text>
      </box>
    </box>
  )
}

/**
 * Accessibility Tree section content.
 */
function TreeContent({ data }: { data: A11yResult }): ReactNode {
  const palette = usePalette()
  if (data.parsed.length === 0) {
    return (
      <text fg={palette.base0A}>
        No accessibility tree could be extracted from this page.
      </text>
    )
  }

  const treeNodes = data.parsed.map(ariaNodeToTreeNode)

  return <Tree nodes={treeNodes} showLines={true} />
}

/**
 * Main A11y Tree View Content component.
 * Shared by both a11y-tree and a11y-tree:js views.
 */
export function A11yTreeViewContent({
  data,
  height,
}: ViewComponentProps<A11yResult>): ReactNode {
  const palette = usePalette()
  const { counts, timedOut, parsed } = data

  // Calculate totals for summary
  const landmarkCount = getCategoryTotal(counts, LANDMARK_ROLES)
  const headingCount = counts['heading'] || 0
  const linkCount = counts['link'] || 0
  const totalNodes = Object.values(counts).reduce((a, b) => a + b, 0)

  // Check for issues
  const hasMain = (counts['main'] || 0) > 0
  const hasHeadings = headingCount > 0
  const hasIssues = !hasMain || !hasHeadings
  const issueCount = (!hasMain ? 1 : 0) + (!hasHeadings ? 1 : 0)

  // Build summary text
  const summaryText = `${landmarkCount} landmarks, ${headingCount} headings, ${linkCount} links`

  // Build tree summary
  const treeSummary =
    parsed.length > 0
      ? `${totalNodes} nodes in ${parsed.length} root element${parsed.length !== 1 ? 's' : ''}`
      : 'No tree content'

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
            The page took too long to load. The accessibility tree shown may be
            incomplete. Consider increasing the timeout.
          </text>
        </Section>
      )}

      {/* Warnings section - only show if issues found */}
      {hasIssues && (
        <Section
          id="warnings"
          title="WARNINGS"
          priority={SectionPriority.WARNING}
          severity="warning"
          icon="!"
          count={issueCount}
          summary={`${issueCount} potential issue${issueCount > 1 ? 's' : ''} detected`}
          defaultExpanded={true}
        >
          <box flexDirection="column" gap={1}>
            {!hasMain && <MissingMainCard />}
            {!hasHeadings && <MissingHeadingsCard />}
          </box>
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

      {/* Accessibility Tree section */}
      <Section
        id="tree"
        title="ACCESSIBILITY TREE"
        priority={SectionPriority.PRIMARY}
        severity={parsed.length > 0 ? undefined : 'warning'}
        summary={treeSummary}
        defaultExpanded={true}
        scrollable
      >
        <scrollbox flexGrow={1}>
          <TreeContent data={data} />
        </scrollbox>
      </Section>
    </SectionContainer>
  )
}
