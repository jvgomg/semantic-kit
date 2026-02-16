/**
 * SitemapBrowser - A tree-based sitemap browser component for OpenTUI.
 *
 * Displays sitemap URLs in a hierarchical tree structure with:
 * - Virtualized rendering for performance with large sitemaps
 * - Expandable/collapsible folders
 * - Child count badges
 * - Keyboard navigation (up/down, left/right for fold/unfold)
 */
import { useMemo, useCallback, type ReactNode } from 'react'
import { useKeyboard } from '@opentui/react'
import type {
  SitemapFetchResult,
  SitemapTreeNode,
} from '@webspecs/core'
import { buildSitemapTree, flattenSitemapTree } from '@webspecs/core'
import { useSemanticColors, usePalette } from '../../theme.js'
import { boxChars } from '../view-display/priorities.js'

// ============================================================================
// Types
// ============================================================================

export interface SitemapBrowserProps {
  /** Fetched sitemap data, or null if not yet loaded */
  sitemapData: SitemapFetchResult | null
  /** Whether the sitemap is currently being loaded */
  isLoading: boolean
  /** Currently selected item index in the flattened list */
  selectedIndex: number
  /** Set of expanded folder paths */
  expandedPaths: Set<string>
  /** Callback when selection changes */
  onSelectedIndexChange: (index: number) => void
  /** Callback when expanded paths change */
  onExpandedPathsChange: (paths: Set<string>) => void
  /** Callback when a URL is selected (Enter pressed on leaf node) */
  onSelect: (url: string) => void
  /** Available height for rendering (for virtualization) */
  height: number
  /** Whether the browser is focused and should handle keyboard input */
  isFocused: boolean
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
  onSelectedIndexChange,
  onExpandedPathsChange,
  onSelect,
  height,
  isFocused,
}: SitemapBrowserProps): ReactNode {
  const colors = useSemanticColors()
  const palette = usePalette()

  // Build and flatten the tree
  const flatNodes = useMemo<FlattenedNode[]>(() => {
    if (!sitemapData || sitemapData.type === 'error') {
      return []
    }

    // Build tree from URLs
    const builtTree = buildSitemapTree(sitemapData.urls)
    // Flatten for display
    return flattenSitemapTree(builtTree, expandedPaths)
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

  // Navigation handlers
  const handleNavigate = useCallback(
    (direction: 'up' | 'down') => {
      if (flatNodes.length === 0) return

      if (direction === 'up') {
        onSelectedIndexChange(Math.max(0, selectedIndex - 1))
      } else {
        onSelectedIndexChange(Math.min(flatNodes.length - 1, selectedIndex + 1))
      }
    },
    [flatNodes.length, selectedIndex, onSelectedIndexChange],
  )

  const handleToggleExpand = useCallback(
    (path: string) => {
      const newPaths = new Set(expandedPaths)
      if (newPaths.has(path)) {
        newPaths.delete(path)
      } else {
        newPaths.add(path)
      }
      onExpandedPathsChange(newPaths)
    },
    [expandedPaths, onExpandedPathsChange],
  )

  const handleSelectCurrent = useCallback(() => {
    const node = flatNodes[selectedIndex]
    if (node && node.fullUrl) {
      onSelect(node.fullUrl)
    }
  }, [flatNodes, selectedIndex, onSelect])

  const handleExpandCurrent = useCallback(() => {
    const node = flatNodes[selectedIndex]
    if (
      node &&
      node.children.length > 0 &&
      !expandedPaths.has(node.displayPath)
    ) {
      handleToggleExpand(node.displayPath)
    }
  }, [flatNodes, selectedIndex, expandedPaths, handleToggleExpand])

  const handleCollapseCurrent = useCallback(() => {
    const node = flatNodes[selectedIndex]
    if (!node) return

    // If current node is expanded, collapse it
    if (expandedPaths.has(node.displayPath)) {
      handleToggleExpand(node.displayPath)
      return
    }

    // Otherwise, navigate to parent node
    // Find the parent by looking for the longest displayPath that is a prefix of current
    const currentPath = node.displayPath
    let parentIndex = -1

    for (let i = 0; i < flatNodes.length; i++) {
      const candidate = flatNodes[i]
      // Must be a prefix of current path (but not equal to it)
      if (
        currentPath.startsWith(candidate.displayPath) &&
        candidate.displayPath !== currentPath &&
        candidate.displayPath.length > (flatNodes[parentIndex]?.displayPath.length ?? 0)
      ) {
        parentIndex = i
      }
    }

    if (parentIndex >= 0) {
      onSelectedIndexChange(parentIndex)
    }
  }, [flatNodes, selectedIndex, expandedPaths, handleToggleExpand, onSelectedIndexChange])

  // Keyboard handling
  useKeyboard((event) => {
    if (!isFocused) return

    const { name } = event

    switch (name) {
      case 'up':
        handleNavigate('up')
        break
      case 'down':
        handleNavigate('down')
        break
      case 'right':
        handleExpandCurrent()
        break
      case 'left':
        handleCollapseCurrent()
        break
      case 'return':
        handleSelectCurrent()
        break
    }
  })

  // Render loading state
  if (isLoading) {
    return (
      <box flexDirection="column">
        <text fg={colors.textHint}>Loading sitemap...</text>
      </box>
    )
  }

  // Render error state
  if (sitemapData && sitemapData.type === 'error') {
    return (
      <box flexDirection="column">
        <text fg={palette.base08}>Error: {sitemapData.message}</text>
      </box>
    )
  }

  // Render empty state (no sitemap loaded yet)
  if (!sitemapData || flatNodes.length === 0) {
    if (sitemapData && sitemapData.type === 'sitemap-index') {
      // Sitemap index - show child sitemaps
      return (
        <box flexDirection="column">
          <text fg={colors.textHint}>Sitemap index with child sitemaps:</text>
          {sitemapData.sitemaps.slice(0, height - 1).map((sm) => (
            <text key={sm.loc} fg={colors.text}>
              {'   '}
              {sm.loc}
            </text>
          ))}
        </box>
      )
    }
    return (
      <box flexDirection="column">
        <text fg={colors.textHint}>Enter a sitemap URL and press Enter</text>
      </box>
    )
  }

  // Render scrollbar indicator if needed
  const showScrollIndicator = flatNodes.length > visibleRows
  const scrollPercentage =
    flatNodes.length > 0
      ? Math.round((selectedIndex / flatNodes.length) * 100)
      : 0

  // Get the selected node's displayPath for ancestor checking
  const selectedDisplayPath = flatNodes[selectedIndex]?.displayPath ?? ''

  // Render tree
  return (
    <box flexDirection="column">
      {visibleNodes.map((node, visibleIndex) => {
        const actualIndex = scrollOffset + visibleIndex
        const isSelected = actualIndex === selectedIndex
        const hasChildren = node.children.length > 0
        const isExpanded = expandedPaths.has(node.displayPath)

        // Check if this node is an ancestor of the selected node
        const isAncestorOfSelected =
          hasChildren &&
          selectedDisplayPath.startsWith(node.displayPath) &&
          selectedDisplayPath !== node.displayPath

        // Build display string
        const indent = '  '.repeat(node.depth)
        const expandIndicator = hasChildren
          ? isExpanded
            ? `${boxChars.expanded} `
            : `${boxChars.collapsed} `
          : '  '
        const pathDisplay = node.path
        const countBadge =
          hasChildren && node.urlCount > 0 ? (
            <text fg={palette.base03}> ({node.urlCount})</text>
          ) : null

        // Style differs based on focus state:
        // - Focused + selected: bright highlight with background
        // - Unfocused + selected: subtle highlight, no background
        const style = {
          fg: isSelected
            ? isFocused
              ? colors.textSelected
              : colors.text
            : colors.text,
          bg: isSelected && isFocused ? colors.modalBackgroundSelected : undefined,
        }

        // Expand indicator color: cyan for selected item or ancestors of selected (when focused)
        const expandColor =
          hasChildren && isFocused && (isSelected || isAncestorOfSelected)
            ? palette.base0D
            : palette.base02

        return (
          <box key={node.displayPath} flexDirection="row">
            <text fg={palette.base02}>{indent}</text>
            <text fg={expandColor}>{expandIndicator}</text>
            <text {...style}>{pathDisplay}</text>
            {countBadge}
          </box>
        )
      })}
      {showScrollIndicator && (
        <text fg={colors.textHint}>
          {' '}
          [{scrollPercentage}%] {flatNodes.length} items
        </text>
      )}
    </box>
  )
}

// ============================================================================
// Hook for external state management
// ============================================================================

export interface UseSitemapBrowserOptions {
  sitemapData: SitemapFetchResult | null
  expandedPaths: Set<string>
  selectedIndex: number
  onExpandedPathsChange: (paths: Set<string>) => void
  onSelectedIndexChange: (index: number) => void
}

/**
 * Hook to get computed values from sitemap browser state.
 * Returns the flattened nodes for external use (e.g., determining if selection is valid).
 */
export function useSitemapBrowserState(options: UseSitemapBrowserOptions) {
  const { sitemapData, expandedPaths } = options

  // Build flattened nodes for external access
  const flatNodes = useMemo<FlattenedNode[]>(() => {
    if (!sitemapData || sitemapData.type === 'error') {
      return []
    }
    const tree = buildSitemapTree(sitemapData.urls)
    return flattenSitemapTree(tree, expandedPaths)
  }, [sitemapData, expandedPaths])

  return { flatNodes }
}
