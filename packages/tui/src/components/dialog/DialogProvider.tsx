/**
 * DialogProvider - Manages and renders the dialog stack.
 *
 * Renders children plus any active dialogs from the stack.
 * Only the top dialog is rendered (not stacked visually - each dialog has its own backdrop).
 * Provides DialogContext so dialogs know whether to show "back" or "close".
 */
import { useMemo, useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  dialogStackAtom,
  popDialogAtom,
  clearDialogsAtom,
  type DialogEntry,
} from '../../state/dialog/index.js'
import {
  DialogContextProvider,
  type DialogContextValue,
} from './DialogContext.js'
import { CommandDialog } from './CommandDialog.js'
import { HelpDialog } from './HelpDialog.js'
import { ThemeDialog } from './ThemeDialog.js'
import { RecentUrlsDialog } from './RecentUrlsDialog.js'
import { PresetUrlsDialog } from './PresetUrlsDialog.js'
import { SitemapDialog } from './SitemapDialog.js'

export interface DialogProviderProps {
  children: React.ReactNode
  /** Handler for actions that need to be executed in App context */
  onAction?: (action: string, payload?: unknown) => void
}

export function DialogProvider({
  children,
  onAction: _onAction,
}: DialogProviderProps) {
  const stack = useAtomValue(dialogStackAtom)
  const popDialog = useSetAtom(popDialogAtom)
  const clearDialogs = useSetAtom(clearDialogsAtom)

  // Context value for dialogs
  const onBack = useCallback(() => {
    popDialog()
  }, [popDialog])

  const onClose = useCallback(() => {
    clearDialogs()
  }, [clearDialogs])

  const contextValue: DialogContextValue = useMemo(
    () => ({
      canGoBack: stack.length > 1,
      onBack,
      onClose,
      stackDepth: stack.length,
    }),
    [stack.length, onBack, onClose],
  )

  // Render dialog based on type
  const renderDialog = (entry: DialogEntry) => {
    switch (entry.type) {
      case 'command':
        return <CommandDialog key={entry.id} />
      case 'help':
        return <HelpDialog key={entry.id} />
      case 'theme':
        return <ThemeDialog key={entry.id} />
      case 'recent-urls':
        return <RecentUrlsDialog key={entry.id} />
      case 'preset-urls':
        return <PresetUrlsDialog key={entry.id} />
      case 'sitemap':
        return <SitemapDialog key={entry.id} />
      default:
        return null
    }
  }

  return (
    <>
      {children}
      {/* Render dialog stack with context */}
      {stack.length > 0 && (
        <DialogContextProvider value={contextValue}>
          {renderDialog(stack[stack.length - 1])}
        </DialogContextProvider>
      )}
    </>
  )
}
