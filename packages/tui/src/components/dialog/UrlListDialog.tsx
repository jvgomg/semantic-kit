/**
 * UrlListDialog - Dialog wrapper for URL list panel.
 *
 * Wraps UrlList in DialogPanel, deriving props from atoms where possible.
 * Initialization props (autoFetchSitemapUrl, startOnConfig) are passed via dialog props.
 */
import { useCallback, useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { getDefaultSitemapUrl } from '@webspecs/core'
import { DialogPanel } from './DialogPanel.js'
import { useDialog } from './DialogContext.js'
import { DIALOG_GUTTER, DIALOG_WIDTH, DIALOG_MAX_HEIGHT } from './constants.js'
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

  // Content width for UrlList (dialog width minus gutters)
  const contentWidth = DIALOG_WIDTH - DIALOG_GUTTER * 2

  return (
    <DialogPanel
      title={title}
      headerHint={headerHint}
      footer="Tab: switch  ↑↓: navigate  Enter: select"
      onClose={handleClose}
    >
      <UrlList
        onSelect={handleSelect}
        onClose={handleClose}
        columns={contentWidth}
        rows={DIALOG_MAX_HEIGHT}
        defaultSitemapUrl={defaultSitemapUrl}
        autoFetchSitemapUrl={dialogProps.autoFetchSitemapUrl}
        startOnConfig={dialogProps.startOnConfig}
        embedded={true}
      />
    </DialogPanel>
  )
}
