/**
 * Tree component for the expandable sections framework.
 *
 * Displays hierarchical data with box-drawing connectors.
 * Used for landmarks, headings, accessibility trees, etc.
 */
import type { ReactNode } from 'react'
import { boxChars } from '../view-display/priorities.js'
import { palette } from '../../theme.js'

/**
 * A node in the tree structure.
 */
export interface TreeNode {
  /** Display label */
  label: string
  /** Optional icon */
  icon?: string
  /** Secondary text (dimmed) */
  meta?: string
  /** Child nodes */
  children?: TreeNode[]
  /** Whether this node is expanded (for expandable trees) */
  expanded?: boolean
  /** Unique key for this node */
  key?: string
}

export interface TreeProps {
  /** Tree nodes to render */
  nodes: TreeNode[]

  /** Show box-drawing connectors (default: true) */
  showLines?: boolean
  /** Spaces per indentation level (default: 2) */
  indentSize?: number
  /** Maximum depth to render (default: unlimited) */
  maxDepth?: number

  /** Allow expanding/collapsing branches */
  expandable?: boolean
}

/**
 * Generate a unique key for a node at a given path.
 */
function getNodeKey(node: TreeNode, path: number[]): string {
  return node.key ?? `node-${path.join('-')}`
}

/**
 * Render a single tree node with its children.
 */
function TreeNodeComponent({
  node,
  path,
  isLast,
  depth,
  showLines,
  indentSize,
  maxDepth,
  expandable,
  prefix,
}: {
  node: TreeNode
  path: number[]
  isLast: boolean
  depth: number
  showLines: boolean
  indentSize: number
  maxDepth?: number
  expandable: boolean
  prefix: string
}): ReactNode {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = node.expanded ?? true

  // Check if we've reached max depth
  const atMaxDepth = maxDepth !== undefined && depth >= maxDepth

  // Build the connector prefix
  let connector = ''
  if (showLines && depth > 0) {
    connector = isLast ? boxChars.treeLastBranch : boxChars.treeBranch
    connector += ' '
  }

  // Build the expand/collapse indicator
  let expandIndicator = ''
  if (expandable && hasChildren && !atMaxDepth) {
    expandIndicator = isExpanded ? `${boxChars.expanded} ` : `${boxChars.collapsed} `
  }

  // Build the node content
  const icon = node.icon ? `${node.icon} ` : ''
  const meta = node.meta ? ` ${node.meta}` : ''

  // Build prefix for children
  let childPrefix = prefix
  if (showLines && depth > 0) {
    childPrefix += isLast ? '   ' : `${boxChars.treeVertical}  `
  } else if (depth > 0) {
    childPrefix += ' '.repeat(indentSize)
  }

  return (
    <box flexDirection="column">
      {/* Node line */}
      <box flexDirection="row">
        <text fg={palette.darkGray}>{prefix}{connector}</text>
        {expandable && hasChildren && !atMaxDepth && (
          <text fg={palette.cyan}>{expandIndicator}</text>
        )}
        <text fg={palette.cyan}>{icon}</text>
        <text>{node.label}</text>
        {meta && <text fg={palette.gray}>{meta}</text>}
      </box>

      {/* Children */}
      {hasChildren && isExpanded && !atMaxDepth && (
        <box flexDirection="column">
          {node.children!.map((child, index) => (
            <TreeNodeComponent
              key={getNodeKey(child, [...path, index])}
              node={child}
              path={[...path, index]}
              isLast={index === node.children!.length - 1}
              depth={depth + 1}
              showLines={showLines}
              indentSize={indentSize}
              maxDepth={maxDepth}
              expandable={expandable}
              prefix={childPrefix}
            />
          ))}
        </box>
      )}

      {/* Truncation indicator at max depth */}
      {hasChildren && !atMaxDepth && !isExpanded && expandable && (
        <text fg={palette.gray}>
          {childPrefix}  ... ({node.children!.length} items)
        </text>
      )}
    </box>
  )
}

/**
 * Tree component.
 *
 * Renders hierarchical data with optional box-drawing connectors
 * and expandable branches.
 */
export function Tree({
  nodes,
  showLines = true,
  indentSize = 2,
  maxDepth,
  expandable = false,
}: TreeProps): ReactNode {
  if (nodes.length === 0) {
    return <text fg={palette.gray}>(empty)</text>
  }

  return (
    <box flexDirection="column">
      {nodes.map((node, index) => (
        <TreeNodeComponent
          key={getNodeKey(node, [index])}
          node={node}
          path={[index]}
          isLast={index === nodes.length - 1}
          depth={0}
          showLines={showLines}
          indentSize={indentSize}
          maxDepth={maxDepth}
          expandable={expandable}
          prefix=""
        />
      ))}
    </box>
  )
}

/**
 * Helper to count total nodes in a tree.
 */
export function countTreeNodes(nodes: TreeNode[]): number {
  let count = 0
  for (const node of nodes) {
    count += 1
    if (node.children) {
      count += countTreeNodes(node.children)
    }
  }
  return count
}

/**
 * Helper to get max depth of a tree.
 */
export function getTreeMaxDepth(nodes: TreeNode[], currentDepth = 0): number {
  let maxDepth = currentDepth
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      const childDepth = getTreeMaxDepth(node.children, currentDepth + 1)
      maxDepth = Math.max(maxDepth, childDepth)
    }
  }
  return maxDepth
}
