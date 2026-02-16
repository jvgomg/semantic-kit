/**
 * Tree building utilities for config URL display.
 *
 * Converts flat and grouped config entries into a tree structure
 * suitable for hierarchical display in the TUI.
 */
import type { TuiConfig } from './schema.js'
import { isConfigGroup } from './types.js'

// ============================================================================
// Types
// ============================================================================

/**
 * Base tree node interface.
 */
interface ConfigTreeNodeBase {
  /** Unique identifier for this node */
  id: string
  /** Display label */
  label: string
  /** Tree depth (0 = root level) */
  depth: number
}

/**
 * A URL leaf node in the config tree.
 */
export interface ConfigTreeUrlNode extends ConfigTreeNodeBase {
  type: 'url'
  /** The full URL */
  url: string
}

/**
 * A group node in the config tree (can be expanded/collapsed).
 */
export interface ConfigTreeGroupNode extends ConfigTreeNodeBase {
  type: 'group'
  /** Child nodes (URLs within this group) */
  children: ConfigTreeUrlNode[]
  /** Number of URLs in this group */
  urlCount: number
}

/**
 * A node in the config tree (either URL or group).
 */
export type ConfigTreeNode = ConfigTreeUrlNode | ConfigTreeGroupNode

/**
 * Flattened tree node for display (includes group membership info).
 */
export interface FlattenedConfigNode {
  /** The original tree node */
  node: ConfigTreeNode
  /** Parent group name (if this is a child of a group) */
  parentGroup: string | null
  /** Whether this node is visible (groups control child visibility) */
  visible: boolean
}

// ============================================================================
// Tree Building
// ============================================================================

/**
 * Build a tree structure from TUI config entries.
 *
 * Flat URLs become root-level URL nodes.
 * Groups become group nodes with URL children.
 *
 * @param config - The parsed TUI config
 * @returns Array of root tree nodes
 */
export function buildConfigTree(config: TuiConfig): ConfigTreeNode[] {
  const nodes: ConfigTreeNode[] = []
  let urlIndex = 0

  for (const entry of config.urls) {
    if (isConfigGroup(entry)) {
      // Group node
      const children: ConfigTreeUrlNode[] = entry.urls.map((url, i) => ({
        type: 'url' as const,
        id: `group-${entry.group}-url-${i}`,
        label: url.title || extractDisplayUrl(url.url),
        url: url.url,
        depth: 1,
      }))

      nodes.push({
        type: 'group',
        id: `group-${entry.group}`,
        label: entry.group,
        depth: 0,
        children,
        urlCount: children.length,
      })
    } else {
      // Flat URL node
      nodes.push({
        type: 'url',
        id: `url-${urlIndex++}`,
        label: entry.title || extractDisplayUrl(entry.url),
        url: entry.url,
        depth: 0,
      })
    }
  }

  return nodes
}

/**
 * Flatten the config tree for display, respecting expanded state.
 *
 * @param nodes - The root tree nodes
 * @param expandedGroups - Set of expanded group IDs
 * @returns Flattened array of nodes in display order
 */
export function flattenConfigTree(
  nodes: ConfigTreeNode[],
  expandedGroups: Set<string>,
): FlattenedConfigNode[] {
  const result: FlattenedConfigNode[] = []

  for (const node of nodes) {
    // Add the node itself
    result.push({
      node,
      parentGroup: null,
      visible: true,
    })

    // If it's an expanded group, add children
    if (node.type === 'group' && expandedGroups.has(node.id)) {
      for (const child of node.children) {
        result.push({
          node: child,
          parentGroup: node.label,
          visible: true,
        })
      }
    }
  }

  return result
}

/**
 * Get the total count of URLs in the config (including grouped).
 */
export function countConfigUrls(config: TuiConfig): number {
  let count = 0
  for (const entry of config.urls) {
    if (isConfigGroup(entry)) {
      count += entry.urls.length
    } else {
      count += 1
    }
  }
  return count
}

/**
 * Get all URLs from the config as a flat array.
 */
export function getAllConfigUrls(
  config: TuiConfig,
): Array<{ url: string; title?: string }> {
  const urls: Array<{ url: string; title?: string }> = []
  for (const entry of config.urls) {
    if (isConfigGroup(entry)) {
      for (const url of entry.urls) {
        urls.push(url)
      }
    } else {
      urls.push(entry)
    }
  }
  return urls
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Extract a display-friendly version of a URL.
 * Shows the path portion without protocol/domain for brevity.
 */
function extractDisplayUrl(url: string): string {
  try {
    const parsed = new URL(url)
    // Show path, or just the hostname if path is empty or /
    const path = parsed.pathname === '/' ? '' : parsed.pathname
    return path || parsed.host
  } catch {
    return url
  }
}
