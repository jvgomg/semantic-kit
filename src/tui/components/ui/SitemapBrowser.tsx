/**
 * SitemapBrowser - A virtualized, tree-based sitemap browser component.
 *
 * Displays sitemap URLs in a hierarchical tree structure with:
 * - Virtualized rendering for performance with large sitemaps
 * - Expandable/collapsible folders
 * - Child count badges
 * - Keyboard navigation (up/down, left/right for fold/unfold)
 */
import React, { useMemo } from 'react'
import { Box, Text } from 'ink'
import type { SitemapFetchResult, SitemapTreeNode } from '../../../lib/sitemap.js'
import { buildSitemapTree, flattenSitemapTree } from '../../../lib/sitemap.js'
import { colors } from '../../theme.js'

// ============================================================================
// Types
// ============================================================================

export interface SitemapBrowserProps {
  /** URL of the sitemap (for display/context) */
  sitemapUrl: string
  /** Fetched sitemap data, or null if not yet loaded */
  sitemapData: SitemapFetchResult | null
  /** Whether the sitemap is currently being loaded */
  isLoading: boolean
  /** Currently selected item index in the flattened list */
  selectedIndex: number
  /** Set of expanded folder paths */
  expandedPaths: Set<string>
  /** Callback when a URL is selected */
  onSelect: (url: string) => void
  /** Callback for navigation */
  onNavigate: (direction: 'up' | 'down') => void
  /** Callback to toggle folder expansion */
  onToggleExpand: (path: string) => void
  /** Available height for rendering (for virtualization) */
  height: number
  /** Available width for rendering */
  width: number
  /** Background color (for consistent modal rendering) */
  backgroundColor?: string
}

/** Flattened tree node with display path */
type FlattenedNode = SitemapTreeNode & { displayPath: string }

// ============================================================================
// Component
// ============================================================================

export function SitemapBrowser({
  sitemapData,
  isLoading,
  selectedIndex,
  expandedPaths,
  height,
  width,
  backgroundColor = colors.modalBackground,
}: SitemapBrowserProps) {
  // Build and flatten the tree
  const { flatNodes } = useMemo(() => {
    if (!sitemapData || sitemapData.type === 'error') {
      return { flatNodes: [], tree: [] }
    }

    // Build tree from URLs
    const builtTree = buildSitemapTree(sitemapData.urls)
    // Flatten for display
    const flattened = flattenSitemapTree(builtTree, expandedPaths)

    return { flatNodes: flattened }
  }, [sitemapData, expandedPaths])

  // Calculate virtualization bounds
  const visibleRows = height
  const scrollOffset = useMemo(() => {
    // Keep selected item in view
    if (flatNodes.length === 0) return 0
    if (selectedIndex < visibleRows / 2) return 0
    if (selectedIndex > flatNodes.length - visibleRows / 2) {
      return Math.max(0, flatNodes.length - visibleRows)
    }
    return Math.max(0, selectedIndex - Math.floor(visibleRows / 2))
  }, [selectedIndex, flatNodes.length, visibleRows])

  // Get visible slice
  const visibleNodes = useMemo(() => {
    return flatNodes.slice(scrollOffset, scrollOffset + visibleRows)
  }, [flatNodes, scrollOffset, visibleRows])

  // Render loading state
  if (isLoading) {
    return (
      <Box flexDirection="column">
        <Text color={colors.textHint} backgroundColor={backgroundColor}>
          {' Loading sitemap...'.padEnd(width)}
        </Text>
      </Box>
    )
  }

  // Render error state
  if (sitemapData && sitemapData.type === 'error') {
    return (
      <Box flexDirection="column">
        <Text color="red" backgroundColor={backgroundColor}>
          {(' Error: ' + sitemapData.message).slice(0, width).padEnd(width)}
        </Text>
      </Box>
    )
  }

  // Render empty state (no sitemap loaded yet)
  if (!sitemapData || flatNodes.length === 0) {
    if (sitemapData && sitemapData.type === 'sitemap-index') {
      // Sitemap index - show child sitemaps
      return (
        <Box flexDirection="column">
          <Text color={colors.textHint} backgroundColor={backgroundColor}>
            {' Sitemap index with child sitemaps:'.padEnd(width)}
          </Text>
          {sitemapData.sitemaps.slice(0, height - 1).map((sm) => (
            <Text key={sm.loc} color={colors.text} backgroundColor={backgroundColor}>
              {('   ' + sm.loc).slice(0, width).padEnd(width)}
            </Text>
          ))}
        </Box>
      )
    }
    return (
      <Box flexDirection="column">
        <Text color={colors.textHint} backgroundColor={backgroundColor}>
          {' Enter a sitemap URL and press Enter'.padEnd(width)}
        </Text>
      </Box>
    )
  }

  // Render tree
  return (
    <Box flexDirection="column">
      {visibleNodes.map((node, visibleIndex) => {
        const actualIndex = scrollOffset + visibleIndex
        const isSelected = actualIndex === selectedIndex
        const hasChildren = node.children.length > 0
        const isExpanded = expandedPaths.has(node.displayPath)

        // Build display string
        const indent = '  '.repeat(node.depth)
        const expandIndicator = hasChildren ? (isExpanded ? '▾ ' : '▸ ') : '  '
        const selectionPrefix = isSelected ? ' ' : ' '
        const pathDisplay = node.path
        const countBadge = hasChildren && node.urlCount > 0 ? ` (${node.urlCount})` : ''

        const lineContent = selectionPrefix + indent + expandIndicator + pathDisplay + countBadge
        const truncated = lineContent.slice(0, width)
        const padded = truncated.padEnd(width)

        const itemBg = isSelected ? colors.modalBackgroundSelected : backgroundColor
        const textColor = isSelected ? colors.textSelected : colors.text

        return (
          <Text key={node.displayPath} color={textColor} backgroundColor={itemBg}>
            {padded}
          </Text>
        )
      })}
    </Box>
  )
}

// ============================================================================
// Helper Hooks
// ============================================================================

/**
 * Hook to manage sitemap browser state.
 * Returns state and handlers for the SitemapBrowser component.
 */
export interface UseSitemapBrowserOptions {
  sitemapData: SitemapFetchResult | null
  expandedPaths: Set<string>
  selectedIndex: number
  onExpandedPathsChange: (paths: Set<string>) => void
  onSelectedIndexChange: (index: number) => void
  onSelect: (url: string) => void
}

export function useSitemapBrowserHandlers(options: UseSitemapBrowserOptions) {
  const {
    sitemapData,
    expandedPaths,
    selectedIndex,
    onExpandedPathsChange,
    onSelectedIndexChange,
    onSelect,
  } = options

  // Build flattened nodes for navigation
  const flatNodes = useMemo<FlattenedNode[]>(() => {
    if (!sitemapData || sitemapData.type === 'error') {
      return []
    }
    const tree = buildSitemapTree(sitemapData.urls)
    return flattenSitemapTree(tree, expandedPaths)
  }, [sitemapData, expandedPaths])

  const handleNavigate = (direction: 'up' | 'down') => {
    if (flatNodes.length === 0) return

    if (direction === 'up') {
      onSelectedIndexChange(Math.max(0, selectedIndex - 1))
    } else {
      onSelectedIndexChange(Math.min(flatNodes.length - 1, selectedIndex + 1))
    }
  }

  const handleToggleExpand = (path: string) => {
    const newPaths = new Set(expandedPaths)
    if (newPaths.has(path)) {
      newPaths.delete(path)
    } else {
      newPaths.add(path)
    }
    onExpandedPathsChange(newPaths)
  }

  const handleSelect = () => {
    const node = flatNodes[selectedIndex]
    if (node && node.fullUrl) {
      onSelect(node.fullUrl)
    }
  }

  const handleExpandCurrent = () => {
    const node = flatNodes[selectedIndex]
    if (node && node.children.length > 0 && !expandedPaths.has(node.displayPath)) {
      handleToggleExpand(node.displayPath)
    }
  }

  const handleCollapseCurrent = () => {
    const node = flatNodes[selectedIndex]
    if (node && expandedPaths.has(node.displayPath)) {
      handleToggleExpand(node.displayPath)
    }
  }

  return {
    flatNodes,
    handleNavigate,
    handleToggleExpand,
    handleSelect,
    handleExpandCurrent,
    handleCollapseCurrent,
  }
}
