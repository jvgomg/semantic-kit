/**
 * SitemapDialog - Dialog for loading and browsing sitemaps.
 *
 * Two-part layout: DialogInput for URL + SitemapBrowser for tree.
 * Focus scope with 'input' and 'tree' regions.
 * Enter on input triggers fetch, Enter on tree selects URL.
 * Accepts autoFetchSitemapUrl prop for auto-loading.
 */
import { useCallback, useMemo, useEffect, useState } from 'react'
import { useKeyboard } from '@opentui/react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { getDefaultSitemapUrl } from '@webspecs/core'
import { DialogPanel } from './DialogPanel.js'
import { useDialog } from './DialogContext.js'
import { useDialogGutter } from './DialogGutterContext.js'
import { useSemanticColors } from '../../theme.js'
import { SitemapBrowser } from '../ui/SitemapBrowser.js'
import { DIALOG_MAX_HEIGHT } from './constants.js'
import {
  urlAtom,
  recentUrlsAtom,
  setUrlAtom,
  sitemapLoadingAtom,
  activeSitemapDataAtom,
  sitemapSelectedIndexAtom,
  sitemapExpandedPathsAtom,
  fetchSitemapAtom,
  resetSitemapSelectionAtom,
  useFocusScope,
  useFocusRegion,
  useFocusNavigation,
  setFocusInScopeAtom,
} from '../../state/index.js'
import { clearDialogsAtom, activeDialogAtom } from '../../state/dialog/index.js'

export interface SitemapDialogProps {
  /** If provided, auto-fetch this sitemap URL on open */
  autoFetchSitemapUrl?: string
}

// Scope ID for this dialog
const SCOPE_ID = 'sitemap-dialog'

export function SitemapDialog() {
  // Register focus scope with input and tree regions
  useFocusScope({
    id: SCOPE_ID,
    regions: ['input', 'tree'],
    initialRegion: 'input',
  })

  // Get focus state for regions
  const { isFocused: inputFocused } = useFocusRegion({ id: SCOPE_ID, region: 'input' })
  const { isFocused: treeFocused } = useFocusRegion({ id: SCOPE_ID, region: 'tree' })
  const { focusNext } = useFocusNavigation()
  const setFocusInScope = useSetAtom(setFocusInScopeAtom)

  const colors = useSemanticColors()
  const { gutter } = useDialogGutter()
  const { title, headerHint, handleClose } = useDialog('Load Sitemap')

  // Get props from dialog stack
  const activeDialog = useAtomValue(activeDialogAtom)
  const dialogProps = (activeDialog?.props ?? {}) as SitemapDialogProps

  // Atoms
  const url = useAtomValue(urlAtom)
  const recentUrls = useAtomValue(recentUrlsAtom)
  const setUrl = useSetAtom(setUrlAtom)
  const clearDialogs = useSetAtom(clearDialogsAtom)
  const sitemapLoading = useAtomValue(sitemapLoadingAtom)
  const sitemapData = useAtomValue(activeSitemapDataAtom)
  const [sitemapSelectedIndex, setSitemapSelectedIndex] = useAtom(
    sitemapSelectedIndexAtom,
  )
  const [expandedPaths, setExpandedPaths] = useAtom(sitemapExpandedPathsAtom)
  const fetchSitemap = useSetAtom(fetchSitemapAtom)
  const resetSitemapSelection = useSetAtom(resetSitemapSelectionAtom)

  // Derive default sitemap URL from current URL or recent URLs
  const defaultSitemapUrl = useMemo(() => {
    if (url) {
      return getDefaultSitemapUrl(url)
    }
    if (recentUrls.length > 0) {
      return getDefaultSitemapUrl(recentUrls[0])
    }
    return ''
  }, [url, recentUrls])

  // Local state for input value
  const [inputValue, setInputValue] = useState(
    dialogProps.autoFetchSitemapUrl || defaultSitemapUrl,
  )

  // Check if tree has data
  const hasTreeData =
    sitemapData !== null &&
    sitemapData.type !== 'error' &&
    sitemapData.urls.length > 0

  // Auto-fetch sitemap if autoFetchSitemapUrl is provided
  useEffect(() => {
    if (dialogProps.autoFetchSitemapUrl) {
      resetSitemapSelection()
      fetchSitemap(dialogProps.autoFetchSitemapUrl)
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-focus tree when data loads
  useEffect(() => {
    if (hasTreeData && inputFocused) {
      setFocusInScope({ scopeId: SCOPE_ID, region: 'tree' })
    }
  }, [hasTreeData, inputFocused, setFocusInScope])

  // Handle sitemap fetch
  const handleFetchSitemap = useCallback(() => {
    if (inputValue.trim()) {
      resetSitemapSelection()
      fetchSitemap(inputValue.trim())
    }
  }, [inputValue, resetSitemapSelection, fetchSitemap])

  // Handle URL selection from tree - focus auto-restored when dialog closes
  const handleSelect = useCallback(
    (selectedUrl: string) => {
      setUrl(selectedUrl)
      clearDialogs()
      // Focus automatically restored when scope pops!
    },
    [setUrl, clearDialogs],
  )

  // Keyboard handling for focus navigation
  useKeyboard((event) => {
    const { name } = event

    // Tab: cycle focus between input and tree
    if (name === 'tab') {
      if (hasTreeData) {
        focusNext() // Cycles between 'input' and 'tree'
      }
      return
    }

    // Input focused
    if (inputFocused) {
      if (name === 'return') {
        handleFetchSitemap()
        return
      }
      if (name === 'down' && hasTreeData) {
        setFocusInScope({ scopeId: SCOPE_ID, region: 'tree' })
        return
      }
    }

    // Tree focused
    if (treeFocused) {
      if (name === 'up' && sitemapSelectedIndex === 0) {
        setFocusInScope({ scopeId: SCOPE_ID, region: 'input' })
      }
    }
  })

  // Calculate available height for tree content
  // Account for header, input box, spacing, and footer
  const contentHeight = Math.max(1, DIALOG_MAX_HEIGHT - 6)

  return (
    <DialogPanel
      title={title}
      headerHint={headerHint}
      footer="Tab: switch  ↑↓: navigate  Enter: fetch/select"
      onClose={handleClose}
    >
      <box flexDirection="column">
        {/* Sitemap URL Input */}
        <box
          paddingLeft={gutter}
          paddingRight={gutter}
          flexDirection="row"
          borderStyle="single"
          borderColor={
            inputFocused ? colors.borderActive : colors.borderSubtle
          }
          marginBottom={1}
        >
          <text fg={colors.textMuted}>URL: </text>
          <input
            value={inputValue}
            onChange={setInputValue}
            focused={inputFocused}
            placeholder="Enter sitemap URL..."
            textColor={colors.text}
            placeholderColor={colors.textMuted}
            cursorColor={colors.accent}
          />
        </box>

        {/* Sitemap Tree Browser */}
        <box paddingLeft={gutter} paddingRight={gutter}>
          <SitemapBrowser
            sitemapData={sitemapData}
            isLoading={sitemapLoading}
            selectedIndex={sitemapSelectedIndex}
            expandedPaths={expandedPaths}
            onSelectedIndexChange={setSitemapSelectedIndex}
            onExpandedPathsChange={setExpandedPaths}
            onSelect={handleSelect}
            height={contentHeight}
            isFocused={treeFocused}
          />
        </box>
      </box>
    </DialogPanel>
  )
}
