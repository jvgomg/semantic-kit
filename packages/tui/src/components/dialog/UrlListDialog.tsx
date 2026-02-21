/**
 * UrlListDialog - Dialog wrapper for URL list panel.
 *
 * Wraps UrlList in DialogPanel, deriving props from atoms where possible.
 * Initialization props (autoFetchSitemapUrl, startOnConfig) are passed via dialog props.
 */
import { useCallback, useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useTerminalDimensions } from '@opentui/react'
import { getDefaultSitemapUrl } from '@webspecs/core'
import { DialogPanel } from './DialogPanel.js'
import { useDialog } from './DialogContext.js'
import { UrlList } from '../chrome/UrlList.js'
import {
  urlAtom,
  setUrlAtom,
  recentUrlsAtom,
  useFocusManager,
} from '../../state/index.js'
import { clearDialogsAtom, activeDialogAtom } from '../../state/dialog/index.js'

export interface UrlListDialogProps {
  /** If provided, start on sitemap tab and auto-fetch this URL */
  autoFetchSitemapUrl?: string
  /** If true, start on config tab (when config is loaded) */
  startOnConfig?: boolean
}

export function UrlListDialog() {
  const { width: termWidth, height: termHeight } = useTerminalDimensions()
  const { title, headerHint, handleClose } = useDialog('Go to')
  const { focus, enableFocus } = useFocusManager()

  // Get props from dialog stack
  const activeDialog = useAtomValue(activeDialogAtom)
  const dialogProps = (activeDialog?.props ?? {}) as UrlListDialogProps

  // Atoms for URL and navigation
  const url = useAtomValue(urlAtom)
  const recentUrls = useAtomValue(recentUrlsAtom)
  const setUrl = useSetAtom(setUrlAtom)
  const clearDialogs = useSetAtom(clearDialogsAtom)

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

  // Handle URL selection: set URL, close all dialogs, restore focus
  const handleSelect = useCallback(
    (selectedUrl: string) => {
      setUrl(selectedUrl)
      clearDialogs()
      enableFocus()
      focus('menu')
    },
    [setUrl, clearDialogs, enableFocus, focus],
  )

  // Calculate dialog dimensions
  const dialogWidth = Math.min(70, termWidth - 4)
  const dialogHeight = Math.min(20, termHeight - 4)
  // Content height for UrlList (subtract DialogPanel header/footer/padding)
  const contentHeight = Math.max(1, dialogHeight - 8)

  return (
    <DialogPanel
      title={title}
      headerHint={headerHint}
      footer="Tab: switch  ↑↓: navigate  Enter: select"
      width={dialogWidth}
      height={dialogHeight}
      onClose={handleClose}
    >
      <UrlList
        onSelect={handleSelect}
        onClose={handleClose}
        columns={dialogWidth - 4}
        rows={contentHeight}
        defaultSitemapUrl={defaultSitemapUrl}
        autoFetchSitemapUrl={dialogProps.autoFetchSitemapUrl}
        startOnConfig={dialogProps.startOnConfig}
        embedded={true}
      />
    </DialogPanel>
  )
}
