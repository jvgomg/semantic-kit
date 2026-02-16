/**
 * URL list panel - combines Recent URLs, Config, and Sitemap browsing via tabs.
 * Shown inline below the URL bar (replaces main content when open).
 *
 * Three tabs:
 * 1. Recent URLs - quick selection from history (using native <select>)
 * 2. Config - browse URLs from config file (disabled if no config loaded)
 * 3. Sitemap - load and browse site structure
 *
 * Tab key cycles focus, left/right arrows switch tabs when tab bar is focused.
 *
 * Focus state is managed via Jotai atoms for consistency across the app.
 */
import { useEffect, useMemo } from 'react'
import { useKeyboard } from '@opentui/react'
import { useAtomValue, useAtom, useSetAtom } from 'jotai'
import { useSemanticColors } from '../../theme.js'
import { TabBar } from '../ui/TabBar.js'
import { SitemapBrowser } from '../ui/SitemapBrowser.js'
import { ConfigBrowser } from '../ui/ConfigBrowser.js'
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
  urlListHasConfigDataAtom,
  setUrlListTabAtom,
  urlListFocusNextAtom,
  urlListFocusPrevAtom,
  urlListFocusTreeIfAvailableAtom,
  resetUrlListStateAtom,
  initUrlListSitemapInputAtom,
  // Config atoms
  hasConfigAtom,
  flattenedConfigTreeAtom,
  configSelectedIndexAtom,
  configExpandedGroupsAtom,
} from '../../state/index.js'
import type { TabItem } from '../ui/TabBar.js'
import type { UrlListTab } from '../../state/types.js'
import type { SitemapFetchResult } from '@webspecs/core'
import type { FlattenedConfigNode } from '../../lib/tui-config/index.js'

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
  /** If true, start on config tab (when config is loaded) */
  startOnConfig?: boolean
}

// ============================================================================
// Tab Content Components
// ============================================================================

interface RecentTabContentProps {
  urls: string[]
  isFocused: boolean
  contentHeight: number
  onSelect: (url: string) => void
}

function RecentTabContent({
  urls,
  isFocused,
  contentHeight,
  onSelect,
}: RecentTabContentProps) {
  const colors = useSemanticColors()
  const listHeight = Math.max(urls.length, 1)
  const urlOptions = urls.map((url) => ({
    name: url,
    description: '',
    value: url,
  }))

  if (urls.length === 0) {
    return <text fg={colors.textHint}>No recent URLs</text>
  }

  return (
    <select
      options={urlOptions}
      focused={isFocused}
      height={Math.min(listHeight + 2, contentHeight)}
      showDescription={false}
      onSelect={(_index, option) => {
        if (option?.value) {
          onSelect(option.value as string)
        }
      }}
    />
  )
}

interface ConfigTabContentProps {
  hasConfigData: boolean
  flattenedNodes: FlattenedConfigNode[]
  selectedIndex: number
  expandedGroups: Set<string>
  isFocused: boolean
  contentHeight: number
  onSelectedIndexChange: (index: number) => void
  onExpandedGroupsChange: (groups: Set<string>) => void
  onSelect: (url: string) => void
}

function ConfigTabContent({
  hasConfigData,
  flattenedNodes,
  selectedIndex,
  expandedGroups,
  isFocused,
  contentHeight,
  onSelectedIndexChange,
  onExpandedGroupsChange,
  onSelect,
}: ConfigTabContentProps) {
  const colors = useSemanticColors()

  if (!hasConfigData) {
    return (
      <box flexDirection="column">
        <text fg={colors.textHint}>No config loaded.</text>
        <text fg={colors.textHint}>
          Use --config flag to load a YAML config file.
        </text>
      </box>
    )
  }

  return (
    <ConfigBrowser
      flattenedNodes={flattenedNodes}
      selectedIndex={selectedIndex}
      expandedGroups={expandedGroups}
      onSelectedIndexChange={onSelectedIndexChange}
      onExpandedGroupsChange={onExpandedGroupsChange}
      onSelect={onSelect}
      height={Math.max(1, contentHeight)}
      isFocused={isFocused}
    />
  )
}

interface SitemapTabContentProps {
  sitemapData: SitemapFetchResult | null
  isLoading: boolean
  selectedIndex: number
  expandedPaths: Set<string>
  inputValue: string
  inputFocused: boolean
  treeFocused: boolean
  contentHeight: number
  onInputChange: (value: string) => void
  onInputFocus: () => void
  onSelectedIndexChange: (index: number) => void
  onExpandedPathsChange: (paths: Set<string>) => void
  onSelect: (url: string) => void
}

function SitemapTabContent({
  sitemapData,
  isLoading,
  selectedIndex,
  expandedPaths,
  inputValue,
  inputFocused,
  treeFocused,
  contentHeight,
  onInputChange,
  onInputFocus,
  onSelectedIndexChange,
  onExpandedPathsChange,
  onSelect,
}: SitemapTabContentProps) {
  const colors = useSemanticColors()

  return (
    <box flexDirection="column" flexGrow={1}>
      <box
        paddingLeft={1}
        flexDirection="row"
        borderStyle="single"
        borderColor={
          inputFocused ? colors.borderFocused : colors.borderUnfocused
        }
        onMouseDown={onInputFocus}
      >
        <text fg={colors.textHint}>URL: </text>
        <input
          value={inputValue}
          onChange={onInputChange}
          focused={inputFocused}
          placeholder="Enter sitemap URL..."
          textColor={colors.text}
          placeholderColor={colors.textHint}
          cursorColor={colors.accent}
        />
      </box>
      <text />
      <SitemapBrowser
        sitemapData={sitemapData}
        isLoading={isLoading}
        selectedIndex={selectedIndex}
        expandedPaths={expandedPaths}
        onSelectedIndexChange={onSelectedIndexChange}
        onExpandedPathsChange={onExpandedPathsChange}
        onSelect={onSelect}
        height={Math.max(1, contentHeight - 2)}
        isFocused={treeFocused}
      />
    </box>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function UrlList({
  onSelect,
  onClose,
  columns: _columns,
  rows,
  defaultSitemapUrl,
  autoFetchSitemapUrl,
  startOnConfig,
}: UrlListProps) {
  const colors = useSemanticColors()

  // Atoms - Recent URLs
  const urls = useAtomValue(recentUrlsAtom)

  // Atoms - Sitemap data
  const sitemapLoading = useAtomValue(sitemapLoadingAtom)
  const sitemapData = useAtomValue(activeSitemapDataAtom)
  const [sitemapSelectedIndex, setSitemapSelectedIndex] = useAtom(
    sitemapSelectedIndexAtom,
  )
  const [expandedPaths, setExpandedPaths] = useAtom(sitemapExpandedPathsAtom)
  const fetchSitemap = useSetAtom(fetchSitemapAtom)
  const resetSitemapSelection = useSetAtom(resetSitemapSelectionAtom)

  // Atoms - Config data
  const hasConfig = useAtomValue(hasConfigAtom)
  const flattenedConfigTree = useAtomValue(flattenedConfigTreeAtom)
  const [configSelectedIndex, setConfigSelectedIndex] = useAtom(
    configSelectedIndexAtom,
  )
  const [configExpandedGroups, setConfigExpandedGroups] = useAtom(
    configExpandedGroupsAtom,
  )
  const hasConfigData = useAtomValue(urlListHasConfigDataAtom)

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

  // Tab definitions - Config tab is disabled when no config loaded
  const tabDefinitions: TabItem[] = useMemo(
    () => [
      { id: 'recent', label: 'Recent URLs' },
      { id: 'config', label: 'Config', disabled: !hasConfig },
      { id: 'sitemap', label: 'Sitemap' },
    ],
    [hasConfig],
  )

  // Initialize state on mount
  useEffect(() => {
    const startOnSitemap = !!autoFetchSitemapUrl
    resetUrlListState({
      startOnSitemap,
      startOnConfig: startOnConfig && hasConfig,
    })
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

  // Handle tab change (skip disabled tabs)
  const handleTabChange = (newTab: UrlListTab) => {
    if (newTab === 'config' && !hasConfig) {
      return
    }
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
        setFocusedElement('tabs')
        return
      } else if (name === 'down' && hasTreeData) {
        setFocusedElement('tree')
        return
      }
    }

    // Tree focused - up from tree can go to input
    if (focusedElement === 'tree' && activeTab === 'sitemap') {
      if (name === 'up' && sitemapSelectedIndex === 0) {
        setFocusedElement('input')
      }
    }

    // Config tree focused - up from first item goes to tabs
    if (focusedElement === 'configTree' && activeTab === 'config') {
      if (name === 'up' && configSelectedIndex === 0) {
        setFocusedElement('tabs')
      }
    }
  })

  // Calculate available height for list/tree content
  // rows is total height available, subtract: title(1) + tabs(1) + footer(2) + padding(2) = 6
  const contentAreaHeight = Math.max(1, rows - 6)

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'recent':
        return (
          <box flexGrow={1}>
            <RecentTabContent
              urls={urls}
              isFocused={focusedElement === 'list'}
              contentHeight={contentAreaHeight}
              onSelect={onSelect}
            />
          </box>
        )

      case 'config':
        return (
          <box flexDirection="column" flexGrow={1}>
            <ConfigTabContent
              hasConfigData={hasConfigData}
              flattenedNodes={flattenedConfigTree}
              selectedIndex={configSelectedIndex}
              expandedGroups={configExpandedGroups}
              isFocused={focusedElement === 'configTree'}
              contentHeight={contentAreaHeight}
              onSelectedIndexChange={setConfigSelectedIndex}
              onExpandedGroupsChange={setConfigExpandedGroups}
              onSelect={onSelect}
            />
          </box>
        )

      case 'sitemap':
        return (
          <SitemapTabContent
            sitemapData={sitemapData}
            isLoading={sitemapLoading}
            selectedIndex={sitemapSelectedIndex}
            expandedPaths={expandedPaths}
            inputValue={sitemapInputValue}
            inputFocused={focusedElement === 'input'}
            treeFocused={focusedElement === 'tree'}
            contentHeight={contentAreaHeight}
            onInputChange={setSitemapInputValue}
            onInputFocus={() => setFocusedElement('input')}
            onSelectedIndexChange={setSitemapSelectedIndex}
            onExpandedPathsChange={setExpandedPaths}
            onSelect={onSelect}
          />
        )
    }
  }

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

      {/* Tab Bar */}
      <box>
        <TabBar
          tabs={tabDefinitions}
          activeTab={activeTab}
          onSelect={(id) => handleTabChange(id as UrlListTab)}
          isFocused={focusedElement === 'tabs'}
        />
      </box>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Footer hints */}
      <text />
      <text fg={colors.textHint}>Tab: switch | Enter: select | Esc: close</text>
    </box>
  )
}
