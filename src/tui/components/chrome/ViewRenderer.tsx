/**
 * ViewRenderer - handles content rendering decisions.
 * Manages scroll state, sub-tabs, loading/error/success states.
 * Uses Ink's focus system for focus management.
 *
 * Supports two rendering modes:
 * 1. String-based: view.render() returns string[] (legacy, scrollable)
 * 2. Component-based: view.Component renders React nodes (rich UI, uses ink-scroll-view)
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Text, useInput } from 'ink'
import { ScrollView, type ScrollViewRef } from 'ink-scroll-view'
import type { ViewDefinition } from '../../views/types.js'
import { useTrackedFocus, type ViewState } from '../../state/index.js'
import { ScrollArea, ScrollBar, TabBar } from '../ui/index.js'
import { useMouseScroll } from '../../hooks/useMouse.js'
import { useViewContent, ViewContentLines } from './ViewContent.js'
import { borderColor, colors } from '../../theme.js'

export interface ViewRendererProps {
  view: ViewDefinition | undefined
  viewState: ViewState
  url: string
  activeSubTab: string | null
  height: number
  onSubTabChange: (subTabId: string) => void
}

export function ViewRenderer({
  view,
  viewState,
  url,
  activeSubTab,
  height,
  onSubTabChange,
}: ViewRendererProps) {
  const { isFocused, isActive } = useTrackedFocus('main')
  const [scrollOffset, setScrollOffset] = useState(0)
  const scrollViewRef = useRef<ScrollViewRef>(null)

  // Component scroll state for scrollbar
  const [componentScrollOffset, setComponentScrollOffset] = useState(0)
  const [componentContentHeight, setComponentContentHeight] = useState(0)
  const [componentViewportHeight, setComponentViewportHeight] = useState(0)

  // Calculate max scroll for component-based views
  const componentMaxScroll = Math.max(
    0,
    componentContentHeight - componentViewportHeight,
  )

  // Check if view uses component-based rendering
  const hasComponent = view?.Component !== undefined
  const shouldUseComponent =
    hasComponent && viewState.status === 'success' && viewState.data !== null

  // Sub-tab configuration
  const subTabs = view?.subTabs ?? []
  const hasSubTabs = subTabs.length > 0
  const effectiveSubTab = hasSubTabs
    ? (activeSubTab ?? subTabs[0]?.id ?? null)
    : null

  // Generate content based on view state (only used for string-based rendering)
  const content = useViewContent({
    viewId: view?.id ?? '',
    viewState,
    url,
    activeSubTab: effectiveSubTab,
  })

  // Layout calculations
  const tabBarHeight = hasSubTabs ? 1 : 0
  const headerHeight = 2 // border + title
  const viewportHeight = Math.max(1, height - headerHeight - tabBarHeight - 2) // -2 for ScrollArea borders
  const contentHeight = content.length
  const maxScroll = Math.max(0, contentHeight - viewportHeight)

  // Reset scroll when view or URL changes
  useEffect(() => {
    setScrollOffset(0)
    setComponentScrollOffset(0)
    scrollViewRef.current?.scrollToTop()
  }, [view?.id, url])

  // Tab switching
  const handleTabSwitch = useCallback(
    (direction: 'left' | 'right') => {
      if (!hasSubTabs || !effectiveSubTab) return

      const currentIndex = subTabs.findIndex((t) => t.id === effectiveSubTab)
      if (currentIndex === -1) return

      let newIndex: number
      if (direction === 'left') {
        newIndex = currentIndex === 0 ? subTabs.length - 1 : currentIndex - 1
      } else {
        newIndex = currentIndex === subTabs.length - 1 ? 0 : currentIndex + 1
      }

      const newTab = subTabs[newIndex]
      if (newTab) {
        onSubTabChange(newTab.id)
        setScrollOffset(0)
        setComponentScrollOffset(0)
        scrollViewRef.current?.scrollToTop()
      }
    },
    [hasSubTabs, effectiveSubTab, subTabs, onSubTabChange],
  )

  // Keyboard navigation
  useInput(
    (_input, key) => {
      // Tab navigation with left/right arrows
      if (hasSubTabs) {
        if (key.leftArrow) {
          handleTabSwitch('left')
          return
        } else if (key.rightArrow) {
          handleTabSwitch('right')
          return
        }
      }

      // Scroll navigation for component-based views
      if (shouldUseComponent) {
        const currentOffset = scrollViewRef.current?.getScrollOffset() ?? 0
        if (key.upArrow) {
          const newOffset = Math.max(0, currentOffset - 1)
          scrollViewRef.current?.scrollTo(newOffset)
        } else if (key.downArrow) {
          const newOffset = Math.min(componentMaxScroll, currentOffset + 1)
          scrollViewRef.current?.scrollTo(newOffset)
        } else if (key.pageUp) {
          const newOffset = Math.max(0, currentOffset - componentViewportHeight)
          scrollViewRef.current?.scrollTo(newOffset)
        } else if (key.pageDown) {
          const newOffset = Math.min(
            componentMaxScroll,
            currentOffset + componentViewportHeight,
          )
          scrollViewRef.current?.scrollTo(newOffset)
        }
        return
      }

      // Scroll navigation for string-based views
      if (key.upArrow) {
        setScrollOffset((prev) => Math.max(0, prev - 1))
      } else if (key.downArrow) {
        setScrollOffset((prev) => Math.min(maxScroll, prev + 1))
      } else if (key.pageUp) {
        setScrollOffset((prev) => Math.max(0, prev - viewportHeight))
      } else if (key.pageDown) {
        setScrollOffset((prev) => Math.min(maxScroll, prev + viewportHeight))
      }
    },
    { isActive },
  )

  // Mouse scroll navigation
  useMouseScroll({
    scrollAnywhere: true,
    onScroll: ({ direction }) => {
      const delta = direction === 'up' ? -1 : 1

      if (shouldUseComponent) {
        const currentOffset = scrollViewRef.current?.getScrollOffset() ?? 0
        const newOffset = Math.max(
          0,
          Math.min(componentMaxScroll, currentOffset + delta),
        )
        scrollViewRef.current?.scrollTo(newOffset)
      } else {
        setScrollOffset((prev) =>
          Math.max(0, Math.min(maxScroll, prev + delta)),
        )
      }
    },
  })

  const visibleContent = content.slice(
    scrollOffset,
    scrollOffset + viewportHeight,
  )
  const viewLabel = view?.label ?? 'No Selection'

  // Calculate content area height for component-based views
  const componentHeight = height - headerHeight - tabBarHeight - 2 // -2 for border

  // Clamped scroll handler for component views
  const handleComponentScroll = useCallback(
    (offset: number) => {
      const clampedOffset = Math.max(0, Math.min(offset, componentMaxScroll))
      setComponentScrollOffset(clampedOffset)
    },
    [componentMaxScroll],
  )

  return (
    <Box flexDirection="column" flexGrow={1} height={height}>
      {/* Header */}
      <Box
        paddingX={1}
        borderStyle="round"
        borderColor={borderColor(isFocused)}
        borderBottom={false}
      >
        <Text bold color={colors.text}>
          {viewLabel}
        </Text>
        {url && <Text color={colors.muted}> - {url}</Text>}
      </Box>

      {/* Tab bar (if view has sub-tabs) */}
      {hasSubTabs && effectiveSubTab && (
        <TabBar
          tabs={subTabs}
          activeTab={effectiveSubTab}
          onSelect={(tabId) => {
            onSubTabChange(tabId)
            setScrollOffset(0)
            setComponentScrollOffset(0)
            scrollViewRef.current?.scrollToTop()
          }}
        />
      )}

      {/* Content area - either component-based or string-based */}
      {shouldUseComponent && view?.Component ? (
        <Box
          height={componentHeight + 2}
          borderStyle="round"
          borderColor={borderColor(isFocused)}
          flexDirection="row"
        >
          <Box flexGrow={1} flexDirection="column">
            <ScrollView
              ref={scrollViewRef}
              onScroll={handleComponentScroll}
              onContentHeightChange={(h) => setComponentContentHeight(h)}
              onViewportSizeChange={(size) =>
                setComponentViewportHeight(size.height)
              }
            >
              {view.Component({
                data: viewState.data,
                height: componentHeight,
                isFocused,
                isActive,
              })}
            </ScrollView>
          </Box>
          <ScrollBar
            placement="inset"
            style="line"
            contentHeight={componentContentHeight}
            viewportHeight={componentViewportHeight}
            scrollOffset={componentScrollOffset}
            color={borderColor(isFocused)}
            autoHide
          />
        </Box>
      ) : (
        <ScrollArea
          height={height - headerHeight - tabBarHeight}
          contentHeight={contentHeight}
          scrollOffset={scrollOffset}
          isFocused={isFocused}
        >
          <ViewContentLines
            lines={visibleContent}
            scrollOffset={scrollOffset}
          />
        </ScrollArea>
      )}
    </Box>
  )
}
