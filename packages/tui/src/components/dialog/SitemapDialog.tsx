/**
 * SitemapDialog - Dialog for loading and browsing sitemaps.
 *
 * Two-part layout: DialogInput for URL + SitemapBrowser for tree.
 * Internal focus state cycles between input and tree.
 * Enter on input triggers fetch, Enter on tree selects URL.
 * Accepts autoFetchSitemapUrl prop for auto-loading.
 */
import { useState, useCallback, useMemo, useEffect } from 'react'
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
  useFocusManager,
} from '../../state/index.js'
import { clearDialogsAtom, activeDialogAtom } from '../../state/dialog/index.js'

export interface SitemapDialogProps {
  /** If provided, auto-fetch this sitemap URL on open */
  autoFetchSitemapUrl?: string
}

type FocusRegion = 'input' | 'tree'

export function SitemapDialog() {
  const colors = useSemanticColors()
  const { gutter } = useDialogGutter()
  const { title, headerHint, handleClose } = useDialog('Load Sitemap')
  const { focus, enableFocus } = useFocusManager()

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

  // Local state
  const [inputValue, setInputValue] = useState(
    dialogProps.autoFetchSitemapUrl || defaultSitemapUrl,
  )
  const [focusRegion, setFocusRegion] = useState<FocusRegion>('input')

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
    if (hasTreeData && focusRegion === 'input') {
      setFocusRegion('tree')
    }
  }, [hasTreeData, focusRegion])

  // Handle sitemap fetch
  const handleFetchSitemap = useCallback(() => {
    if (inputValue.trim()) {
      resetSitemapSelection()
      fetchSitemap(inputValue.trim())
    }
  }, [inputValue, resetSitemapSelection, fetchSitemap])

  // Handle URL selection from tree
  const handleSelect = useCallback(
    (selectedUrl: string) => {
      setUrl(selectedUrl)
      clearDialogs()
      enableFocus()
      focus('menu')
    },
    [setUrl, clearDialogs, enableFocus, focus],
  )

  // Keyboard handling for focus navigation
  useKeyboard((event) => {
    const { name } = event

    // Tab: cycle focus
    if (name === 'tab') {
      if (hasTreeData) {
        setFocusRegion((prev) => (prev === 'input' ? 'tree' : 'input'))
      }
      return
    }

    // Input focused
    if (focusRegion === 'input') {
      if (name === 'return') {
        handleFetchSitemap()
        return
      }
      if (name === 'down' && hasTreeData) {
        setFocusRegion('tree')
        return
      }
    }

    // Tree focused
    if (focusRegion === 'tree') {
      if (name === 'up' && sitemapSelectedIndex === 0) {
        setFocusRegion('input')
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
            focusRegion === 'input' ? colors.borderActive : colors.borderSubtle
          }
          marginBottom={1}
        >
          <text fg={colors.textMuted}>URL: </text>
          <input
            value={inputValue}
            onChange={setInputValue}
            focused={focusRegion === 'input'}
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
            isFocused={focusRegion === 'tree'}
          />
        </box>
      </box>
    </DialogPanel>
  )
}
