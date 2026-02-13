/**
 * ConfigBrowser - A tree-based config URL browser component for OpenTUI.
 *
 * Displays config URLs in a hierarchical structure with:
 * - Virtualized rendering for performance with large configs
 * - Expandable/collapsible groups
 * - Child count badges for groups
 * - Keyboard navigation (up/down, left/right for fold/unfold)
 */
import { useMemo, useCallback, type ReactNode } from 'react'
import { useKeyboard } from '@opentui/react'
import type { FlattenedConfigNode } from '../../../lib/tui-config/index.js'
import { colors, palette } from '../../theme.js'
import { boxChars } from '../view-display/priorities.js'

// ============================================================================
// Types
// ============================================================================

export interface ConfigBrowserProps {
  /** Flattened config tree nodes */
  flattenedNodes: FlattenedConfigNode[]
  /** Currently selected item index in the flattened list */
  selectedIndex: number
  /** Set of expanded group IDs */
  expandedGroups: Set<string>
  /** Callback when selection changes */
  onSelectedIndexChange: (index: number) => void
  /** Callback when expanded groups change */
  onExpandedGroupsChange: (groups: Set<string>) => void
  /** Callback when a URL is selected (Enter pressed on URL node) */
  onSelect: (url: string) => void
  /** Available height for rendering (for virtualization) */
  height: number
  /** Whether the browser is focused and should handle keyboard input */
  isFocused: boolean
}

// ============================================================================
// Component
// ============================================================================

export function ConfigBrowser({
  flattenedNodes,
  selectedIndex,
  expandedGroups,
  onSelectedIndexChange,
  onExpandedGroupsChange,
  onSelect,
  height,
  isFocused,
}: ConfigBrowserProps): ReactNode {
  // Calculate virtualization bounds
  const visibleRows = height
  const scrollOffset = useMemo(() => {
    // Keep selected item in view
    if (flattenedNodes.length === 0) return 0
    if (selectedIndex < visibleRows / 2) return 0
    if (selectedIndex > flattenedNodes.length - visibleRows / 2) {
      return Math.max(0, flattenedNodes.length - visibleRows)
    }
    return Math.max(0, selectedIndex - Math.floor(visibleRows / 2))
  }, [selectedIndex, flattenedNodes.length, visibleRows])

  // Get visible slice
  const visibleNodes = useMemo(() => {
    return flattenedNodes.slice(scrollOffset, scrollOffset + visibleRows)
  }, [flattenedNodes, scrollOffset, visibleRows])

  // Navigation handlers
  const handleNavigate = useCallback(
    (direction: 'up' | 'down') => {
      if (flattenedNodes.length === 0) return

      if (direction === 'up') {
        onSelectedIndexChange(Math.max(0, selectedIndex - 1))
      } else {
        onSelectedIndexChange(Math.min(flattenedNodes.length - 1, selectedIndex + 1))
      }
    },
    [flattenedNodes.length, selectedIndex, onSelectedIndexChange],
  )

  const handleToggleExpand = useCallback(
    (groupId: string) => {
      const newExpanded = new Set(expandedGroups)
      if (newExpanded.has(groupId)) {
        newExpanded.delete(groupId)
      } else {
        newExpanded.add(groupId)
      }
      onExpandedGroupsChange(newExpanded)
    },
    [expandedGroups, onExpandedGroupsChange],
  )

  const handleSelectCurrent = useCallback(() => {
    const entry = flattenedNodes[selectedIndex]
    if (entry && entry.node.type === 'url') {
      onSelect(entry.node.url)
    }
  }, [flattenedNodes, selectedIndex, onSelect])

  const handleExpandCurrent = useCallback(() => {
    const entry = flattenedNodes[selectedIndex]
    if (entry && entry.node.type === 'group' && !expandedGroups.has(entry.node.id)) {
      handleToggleExpand(entry.node.id)
    }
  }, [flattenedNodes, selectedIndex, expandedGroups, handleToggleExpand])

  const handleCollapseCurrent = useCallback(() => {
    const entry = flattenedNodes[selectedIndex]
    if (!entry) return

    // If current node is an expanded group, collapse it
    if (entry.node.type === 'group' && expandedGroups.has(entry.node.id)) {
      handleToggleExpand(entry.node.id)
      return
    }

    // If inside a group, navigate to parent group
    if (entry.parentGroup !== null) {
      // Find the parent group index
      for (let i = 0; i < flattenedNodes.length; i++) {
        const candidate = flattenedNodes[i]
        if (candidate.node.type === 'group' && candidate.node.label === entry.parentGroup) {
          onSelectedIndexChange(i)
          return
        }
      }
    }
  }, [flattenedNodes, selectedIndex, expandedGroups, handleToggleExpand, onSelectedIndexChange])

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

  // Render empty state
  if (flattenedNodes.length === 0) {
    return (
      <box flexDirection="column">
        <text fg={colors.textHint}>No URLs in config</text>
      </box>
    )
  }

  // Render scrollbar indicator if needed
  const showScrollIndicator = flattenedNodes.length > visibleRows
  const scrollPercentage =
    flattenedNodes.length > 0
      ? Math.round((selectedIndex / flattenedNodes.length) * 100)
      : 0

  // Get the selected node's id for ancestor checking
  const selectedEntry = flattenedNodes[selectedIndex]
  const selectedParentGroup = selectedEntry?.parentGroup

  // Render tree
  return (
    <box flexDirection="column">
      {visibleNodes.map((entry, visibleIndex) => {
        const actualIndex = scrollOffset + visibleIndex
        const isSelected = actualIndex === selectedIndex
        const { node, parentGroup } = entry
        const isGroup = node.type === 'group'
        const isExpanded = isGroup && expandedGroups.has(node.id)
        const depth = node.depth

        // Check if this group is the parent of the selected node
        const isAncestorOfSelected =
          isGroup && selectedParentGroup === node.label

        // Build display string
        const indent = '  '.repeat(depth)
        const expandIndicator = isGroup
          ? isExpanded
            ? `${boxChars.expanded} `
            : `${boxChars.collapsed} `
          : '  '
        const countBadge =
          isGroup && node.urlCount > 0 ? (
            <text fg={palette.gray}> ({node.urlCount})</text>
          ) : null

        // Style differs based on focus state
        const style = {
          fg: isSelected
            ? isFocused
              ? colors.textSelected
              : colors.text
            : colors.text,
          bg: isSelected && isFocused ? colors.modalBackgroundSelected : undefined,
        }

        // Expand indicator color
        const expandColor =
          isGroup && isFocused && (isSelected || isAncestorOfSelected)
            ? palette.cyan
            : palette.darkGray

        return (
          <box key={node.id} flexDirection="row">
            <text fg={palette.darkGray}>{indent}</text>
            {isGroup && <text fg={expandColor}>{expandIndicator}</text>}
            {!isGroup && parentGroup && <text fg={palette.darkGray}>  </text>}
            <text {...style}>{node.label}</text>
            {countBadge}
          </box>
        )
      })}
      {showScrollIndicator && (
        <text fg={colors.textHint}>
          {' '}
          [{scrollPercentage}%] {flattenedNodes.length} items
        </text>
      )}
    </box>
  )
}
