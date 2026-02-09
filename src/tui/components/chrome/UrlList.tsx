/**
 * URL list panel - combines Recent URLs and Sitemap browsing via tabs.
 * Shown inline below the URL bar (replaces main content when open).
 *
 * Two tabs:
 * 1. Recent URLs - quick selection from history (using native <select>)
 * 2. Sitemap - load and browse site structure
 *
 * Tab key cycles focus, left/right arrows switch tabs when tab bar is focused.
 *
 * Focus state is managed via Jotai atoms for consistency across the app.
 */
import { useEffect } from 'react'
import { useKeyboard } from '@opentui/react'
import { useAtomValue, useAtom, useSetAtom } from 'jotai'
import { colors } from '../../theme.js'
import { TabBar } from '../ui/TabBar.js'
import { SitemapBrowser } from '../ui/SitemapBrowser.js'
import {
  recentUrlsAtom,
  sitemapLoadingAtom,
  activeSitemapDataAtom,
  sitemapSelectedIndexAtom,
  sitemapExpandedPathsAtom,
  fetchSitemapAtom,
  resetSitemapSelectionAtom,
  // UrlList focus atoms
  urlListActiveTabAtom,
  urlListFocusAtom,
  urlListSitemapInputAtom,
  urlListHasTreeDataAtom,
  setUrlListTabAtom,
  urlListFocusNextAtom,
  urlListFocusPrevAtom,
  urlListFocusTreeIfAvailableAtom,
  resetUrlListStateAtom,
  initUrlListSitemapInputAtom,
} from '../../state/index.js'
import type { TabItem } from '../ui/TabBar.js'
import type { UrlListTab } from '../../state/types.js'

// ============================================================================
// Types
// ============================================================================

export interface UrlListProps {
  /** Callback when a URL is selected */
  onSelect: (url: string) => void
  /** Callback to close the panel */
  onClose: () => void
  /** Terminal columns */
  columns: number
  /** Available height for the URL list panel */
  rows: number
  /** Default sitemap URL (computed from current URL) */
  defaultSitemapUrl: string
  /** If provided, start on sitemap tab and auto-fetch this URL */
  autoFetchSitemapUrl?: string
}

// ============================================================================
// Tab Definitions
// ============================================================================

const TAB_DEFINITIONS: TabItem[] = [
  { id: 'recent', label: 'Recent URLs' },
  { id: 'sitemap', label: 'Sitemap' },
]

// ============================================================================
// Component
// ============================================================================

export function UrlList({
  onSelect,
  onClose,
  columns: _columns,
  rows,
  defaultSitemapUrl,
  autoFetchSitemapUrl,
}: UrlListProps) {
  // Atoms - Recent URLs
  const urls = useAtomValue(recentUrlsAtom)

  // Atoms - Sitemap data
  const sitemapLoading = useAtomValue(sitemapLoadingAtom)
  const sitemapData = useAtomValue(activeSitemapDataAtom)
  const [selectedIndex, setSelectedIndex] = useAtom(sitemapSelectedIndexAtom)
  const [expandedPaths, setExpandedPaths] = useAtom(sitemapExpandedPathsAtom)
  const fetchSitemap = useSetAtom(fetchSitemapAtom)
  const resetSitemapSelection = useSetAtom(resetSitemapSelectionAtom)

  // Atoms - UrlList focus state
  const activeTab = useAtomValue(urlListActiveTabAtom)
  const [focusedElement, setFocusedElement] = useAtom(urlListFocusAtom)
  const [sitemapInputValue, setSitemapInputValue] = useAtom(
    urlListSitemapInputAtom,
  )
  const hasTreeData = useAtomValue(urlListHasTreeDataAtom)

  // Action atoms
  const setUrlListTab = useSetAtom(setUrlListTabAtom)
  const focusNext = useSetAtom(urlListFocusNextAtom)
  const focusPrev = useSetAtom(urlListFocusPrevAtom)
  const focusTreeIfAvailable = useSetAtom(urlListFocusTreeIfAvailableAtom)
  const resetUrlListState = useSetAtom(resetUrlListStateAtom)
  const initSitemapInput = useSetAtom(initUrlListSitemapInputAtom)
  const setFocus = useSetAtom(urlListFocusAtom)

  // Initialize state on mount
  useEffect(() => {
    const startOnSitemap = !!autoFetchSitemapUrl
    resetUrlListState(startOnSitemap)
    initSitemapInput(autoFetchSitemapUrl || defaultSitemapUrl)

    if (autoFetchSitemapUrl) {
      resetSitemapSelection()
      fetchSitemap(autoFetchSitemapUrl)
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-focus tree when sitemap data loads
  useEffect(() => {
    focusTreeIfAvailable()
  }, [hasTreeData, focusTreeIfAvailable])

  // Handle tab change
  const handleTabChange = (newTab: UrlListTab) => {
    setUrlListTab(newTab)
  }

  // Handle sitemap fetch
  const handleFetchSitemap = () => {
    if (sitemapInputValue.trim()) {
      resetSitemapSelection()
      fetchSitemap(sitemapInputValue.trim())
    }
  }

  // Keyboard handling for global shortcuts and focus navigation
  useKeyboard((event) => {
    const { name, shift } = event

    // Global: close panel
    if (name === 'escape' || (name === 'q' && focusedElement !== 'input')) {
      onClose()
      return
    }

    // Tab: cycle focus
    if (name === 'tab') {
      if (shift) {
        focusPrev()
      } else {
        focusNext()
      }
      return
    }

    // Arrow navigation between focus regions
    if (focusedElement === 'tabs') {
      if (name === 'down') {
        focusNext()
        return
      }
    }

    // Sitemap input focused
    if (focusedElement === 'input' && activeTab === 'sitemap') {
      if (name === 'return') {
        handleFetchSitemap()
        return
      } else if (name === 'up') {
        setFocus('tabs')
        return
      } else if (name === 'down' && hasTreeData) {
        setFocus('tree')
        return
      }
    }

    // Tree focused - up from tree can go to input
    if (focusedElement === 'tree' && activeTab === 'sitemap') {
      if (name === 'up' && selectedIndex === 0) {
        setFocus('input')
      }
      // Other tree navigation handled by SitemapBrowser component
    }
  })

  // Calculate content height - select needs explicit height
  const listHeight = Math.max(urls.length, 1)

  // Convert URLs to select options
  const urlOptions = urls.map((url) => ({
    name: url,
    description: '',
    value: url,
  }))

  // Render sitemap URL input
  const inputFocused = focusedElement === 'input'

  const sitemapInput = (
    <box
      paddingLeft={1}
      flexDirection="row"
      borderStyle="single"
      borderColor={inputFocused ? colors.borderFocused : colors.borderUnfocused}
      onMouseDown={() => setFocusedElement('input')}
    >
      <text fg={colors.textHint}>URL: </text>
      <input
        value={sitemapInputValue}
        onChange={setSitemapInputValue}
        focused={inputFocused}
        placeholder="Enter sitemap URL..."
        textColor={colors.text}
        placeholderColor={colors.textHint}
        cursorColor={colors.accent}
      />
    </box>
  )

  // Calculate available height for list/tree content
  // rows is total height available, subtract: title(1) + tabs(1) + footer(2) + padding(2) = 6
  const contentAreaHeight = Math.max(1, rows - 6)

  return (
    <box
      flexDirection="column"
      height={rows}
      borderStyle="rounded"
      borderColor={colors.borderUnfocused}
      paddingLeft={1}
      paddingRight={1}
    >
      <text marginBottom={1}>
        <strong>Go to</strong>
      </text>

      {/* Tab Bar - handles its own keyboard navigation */}
      <box>
        <TabBar
          tabs={TAB_DEFINITIONS}
          activeTab={activeTab}
          onSelect={(id) => handleTabChange(id as UrlListTab)}
          isFocused={focusedElement === 'tabs'}
        />
      </box>

      {/* Tab Content */}
      {activeTab === 'recent' ? (
        // Recent URLs content - using native <select>
        <box flexGrow={1}>
          {urls.length === 0 ? (
            <text fg={colors.textHint}>No recent URLs</text>
          ) : (
            <select
              options={urlOptions}
              focused={focusedElement === 'list'}
              height={Math.min(listHeight + 2, contentAreaHeight)}
              showDescription={false}
              onSelect={(_index, option) => {
                if (option?.value) {
                  onSelect(option.value as string)
                }
              }}
            />
          )}
        </box>
      ) : (
        // Sitemap content
        <box flexDirection="column" flexGrow={1}>
          {sitemapInput}
          <text />
          <SitemapBrowser
            sitemapData={sitemapData}
            isLoading={sitemapLoading}
            selectedIndex={selectedIndex}
            expandedPaths={expandedPaths}
            onSelectedIndexChange={setSelectedIndex}
            onExpandedPathsChange={setExpandedPaths}
            onSelect={onSelect}
            height={Math.max(1, contentAreaHeight - 2)}
            isFocused={focusedElement === 'tree'}
          />
        </box>
      )}

      {/* Footer hints */}
      <text />
      <text fg={colors.textHint}>Tab: switch | Enter: select | Esc: close</text>
    </box>
  )
}
