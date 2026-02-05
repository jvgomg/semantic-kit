/**
 * Go to modal - combines Recent URLs and Sitemap browsing via tabs.
 *
 * Two tabs:
 * 1. Recent URLs - quick selection from history
 * 2. Sitemap - load and browse site structure
 *
 * Tab key cycles focus, left/right arrows switch tabs when tab bar is focused.
 */
import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { URL_LIST_WIDTH } from './constants.js'
import { colors } from '../../theme.js'
import { TabBar } from '../ui/TabBar.js'
import { Input } from '../ui/Input.js'
import { SitemapBrowser, useSitemapBrowserHandlers } from '../ui/SitemapBrowser.js'
import {
  recentUrlsAtom,
  urlListIndexAtom,
  urlListActiveTabAtom,
  sitemapCacheAtom,
  sitemapLoadingAtom,
  fetchSitemapAtom,
} from '../../state/index.js'
import type { SubTabDefinition } from '../../views/types.js'

// ============================================================================
// Types
// ============================================================================

type ActiveTab = 'recent' | 'sitemap'
type FocusedElement = 'tabs' | 'list' | 'input' | 'tree'

export interface UrlListProps {
  /** Callback when a URL is selected */
  onSelect: (url: string) => void
  /** Callback to close the modal */
  onClose: () => void
  /** Terminal columns */
  columns: number
  /** Terminal rows */
  rows: number
  /** Default sitemap URL (computed from current URL) */
  defaultSitemapUrl: string
}

// ============================================================================
// Tab Definitions
// ============================================================================

const TAB_DEFINITIONS: SubTabDefinition[] = [
  { id: 'recent', label: 'Recent URLs', render: () => [] },
  { id: 'sitemap', label: 'Sitemap', render: () => [] },
]

// ============================================================================
// Component
// ============================================================================

export function UrlList({
  onSelect,
  onClose,
  columns,
  rows,
  defaultSitemapUrl,
}: UrlListProps) {
  // Atoms
  const urls = useAtomValue(recentUrlsAtom)
  const [selectedIndex, setSelectedIndex] = useAtom(urlListIndexAtom)
  const [activeTab, setActiveTab] = useAtom(urlListActiveTabAtom)
  const sitemapCache = useAtomValue(sitemapCacheAtom)
  const sitemapLoading = useAtomValue(sitemapLoadingAtom)
  const fetchSitemapAction = useSetAtom(fetchSitemapAtom)

  // Focus state (tab state is controlled by atoms)
  const [focusedElement, setFocusedElement] = useState<FocusedElement>(
    activeTab === 'recent' ? 'list' : 'input'
  )

  // Sitemap input state
  const [sitemapInputValue, setSitemapInputValue] = useState(defaultSitemapUrl)
  const [sitemapInputCursor, setSitemapInputCursor] = useState(defaultSitemapUrl.length)

  // Sitemap browser state
  const [sitemapSelectedIndex, setSitemapSelectedIndex] = useState(0)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())

  // Get current sitemap data from cache
  const currentSitemapData = sitemapCache.get(sitemapInputValue) ?? null

  // Sitemap browser handlers
  const {
    flatNodes,
    handleNavigate: handleSitemapNavigate,
    handleSelect: handleSitemapSelect,
    handleExpandCurrent,
    handleCollapseCurrent,
  } = useSitemapBrowserHandlers({
    sitemapData: currentSitemapData,
    expandedPaths,
    selectedIndex: sitemapSelectedIndex,
    onExpandedPathsChange: setExpandedPaths,
    onSelectedIndexChange: setSitemapSelectedIndex,
    onSelect,
  })

  // Navigate recent URLs list
  const handleNavigateRecent = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      setSelectedIndex((prev) => Math.max(0, prev - 1))
    } else {
      setSelectedIndex((prev) => Math.min(urls.length - 1, prev + 1))
    }
  }

  // Determine what focus elements are available in each tab
  const getNextFocus = (current: FocusedElement, direction: 'next' | 'prev'): FocusedElement => {
    if (activeTab === 'recent') {
      // Recent tab: tabs <-> list
      if (current === 'tabs') return direction === 'next' ? 'list' : 'list'
      return 'tabs'
    } else {
      // Sitemap tab: tabs <-> input <-> tree (if data loaded)
      const hasTree = currentSitemapData && currentSitemapData.type !== 'error' && flatNodes.length > 0
      const elements: FocusedElement[] = hasTree ? ['tabs', 'input', 'tree'] : ['tabs', 'input']
      const idx = elements.indexOf(current)
      if (direction === 'next') {
        return elements[(idx + 1) % elements.length]
      } else {
        return elements[(idx - 1 + elements.length) % elements.length]
      }
    }
  }

  // Handle tab change - reset focus to appropriate element
  const handleTabChange = (newTab: ActiveTab) => {
    setActiveTab(newTab)
    if (newTab === 'recent') {
      setFocusedElement('list')
    } else {
      setFocusedElement('input')
    }
  }

  // Input handling
  useInput((input, key) => {
    // Global: close modal
    if (key.escape || (input === 'q' && focusedElement !== 'input')) {
      onClose()
      return
    }

    // Tab: cycle focus
    if (key.tab) {
      setFocusedElement(getNextFocus(focusedElement, key.shift ? 'prev' : 'next'))
      return
    }

    // Tab bar focused: left/right to switch tabs
    if (focusedElement === 'tabs') {
      if (key.leftArrow || key.rightArrow) {
        handleTabChange(activeTab === 'recent' ? 'sitemap' : 'recent')
        return
      }
      if (key.downArrow) {
        setFocusedElement(getNextFocus('tabs', 'next'))
        return
      }
    }

    // Recent URLs list focused
    if (focusedElement === 'list' && activeTab === 'recent') {
      if (key.upArrow) {
        handleNavigateRecent('up')
      } else if (key.downArrow) {
        handleNavigateRecent('down')
      } else if (key.return && urls[selectedIndex]) {
        onSelect(urls[selectedIndex])
      }
      return
    }

    // Sitemap input focused
    if (focusedElement === 'input' && activeTab === 'sitemap') {
      if (key.return) {
        // Fetch sitemap
        fetchSitemapAction(sitemapInputValue)
        // Reset sitemap browser state for new URL
        setSitemapSelectedIndex(0)
        setExpandedPaths(new Set())
      } else if (key.backspace || key.delete) {
        if (sitemapInputCursor > 0) {
          const newValue =
            sitemapInputValue.slice(0, sitemapInputCursor - 1) +
            sitemapInputValue.slice(sitemapInputCursor)
          setSitemapInputValue(newValue)
          setSitemapInputCursor(sitemapInputCursor - 1)
        }
      } else if (key.leftArrow) {
        setSitemapInputCursor(Math.max(0, sitemapInputCursor - 1))
      } else if (key.rightArrow) {
        setSitemapInputCursor(Math.min(sitemapInputValue.length, sitemapInputCursor + 1))
      } else if (key.upArrow) {
        setFocusedElement('tabs')
      } else if (key.downArrow && flatNodes.length > 0) {
        setFocusedElement('tree')
      } else if (input && !key.ctrl && !key.meta) {
        const newValue =
          sitemapInputValue.slice(0, sitemapInputCursor) +
          input +
          sitemapInputValue.slice(sitemapInputCursor)
        setSitemapInputValue(newValue)
        setSitemapInputCursor(sitemapInputCursor + input.length)
      }
      return
    }

    // Sitemap tree focused
    if (focusedElement === 'tree' && activeTab === 'sitemap') {
      if (key.upArrow) {
        if (sitemapSelectedIndex === 0) {
          setFocusedElement('input')
        } else {
          handleSitemapNavigate('up')
        }
      } else if (key.downArrow) {
        handleSitemapNavigate('down')
      } else if (key.rightArrow) {
        handleExpandCurrent()
      } else if (key.leftArrow) {
        handleCollapseCurrent()
      } else if (key.return) {
        handleSitemapSelect()
      }
      return
    }
  })

  // Layout calculations
  const innerWidth = URL_LIST_WIDTH - 2
  const bg = colors.modalBackground

  // Calculate content height
  const contentHeight = activeTab === 'recent'
    ? Math.max(urls.length, 1) + 2
    : 12 // input + tree area

  const headerFooterHeight = 6 // Title, tab bar, hint row, padding
  const totalHeight = contentHeight + headerFooterHeight
  const marginLeft = Math.max(0, Math.floor((columns - URL_LIST_WIDTH) / 2))
  const marginTop = Math.max(0, Math.floor((rows - totalHeight) / 2))

  // Helpers
  const blank = () => <Text backgroundColor={bg}>{' '.repeat(innerWidth)}</Text>

  const row = (content: string, color?: string, bold?: boolean) => (
    <Text color={color} bold={bold} backgroundColor={bg}>
      {(' ' + content).padEnd(innerWidth)}
    </Text>
  )

  // Calculate tree height (content area minus input)
  const treeHeight = 8

  return (
    <Box position="absolute" marginLeft={marginLeft} marginTop={marginTop}>
      <Box borderStyle="round" borderColor={colors.modalBorder} flexDirection="column">
        {/* Title */}
        {blank()}
        {row('Go to', colors.modalTitle, true)}
        {blank()}

        {/* Tab Bar */}
        <Box backgroundColor={bg} paddingLeft={1}>
          <TabBar
            tabs={TAB_DEFINITIONS}
            activeTab={activeTab}
            onSelect={(id) => handleTabChange(id as ActiveTab)}
            isFocused={focusedElement === 'tabs'}
          />
        </Box>
        {blank()}

        {/* Tab Content */}
        {activeTab === 'recent' ? (
          // Recent URLs content
          <>
            {urls.length === 0 ? (
              row('No recent URLs', colors.textHint)
            ) : (
              urls.map((urlItem, index) => {
                const isSelected = index === selectedIndex && focusedElement === 'list'
                const prefix = isSelected ? '▸ ' : '  '
                const content = (prefix + urlItem).slice(0, innerWidth - 2)
                const itemBg = isSelected ? colors.modalBackgroundSelected : bg
                return (
                  <Text
                    key={urlItem}
                    color={isSelected ? colors.textSelected : colors.text}
                    backgroundColor={itemBg}
                  >
                    {(' ' + content).padEnd(innerWidth)}
                  </Text>
                )
              })
            )}
          </>
        ) : (
          // Sitemap content
          <>
            <Input
              label="URL"
              labelPosition="inline"
              value={sitemapInputValue}
              cursorPosition={sitemapInputCursor}
              isFocused={focusedElement === 'input'}
              width={innerWidth}
              backgroundColor={bg}
            />
            {blank()}
            <SitemapBrowser
              sitemapUrl={sitemapInputValue}
              sitemapData={currentSitemapData}
              isLoading={sitemapLoading}
              selectedIndex={focusedElement === 'tree' ? sitemapSelectedIndex : -1}
              expandedPaths={expandedPaths}
              onSelect={onSelect}
              onNavigate={handleSitemapNavigate}
              onToggleExpand={(path) => {
                const newPaths = new Set(expandedPaths)
                if (newPaths.has(path)) {
                  newPaths.delete(path)
                } else {
                  newPaths.add(path)
                }
                setExpandedPaths(newPaths)
              }}
              height={treeHeight}
              width={innerWidth}
              backgroundColor={bg}
            />
          </>
        )}

        {/* Footer hints */}
        {blank()}
        {row('Tab: switch | Enter: select | Esc: close', colors.textHint)}
        {blank()}
      </Box>
    </Box>
  )
}
