/**
 * Semantic-Kit TUI - OpenTUI Implementation
 *
 * Main application component managing layout, focus, and navigation.
 * See UI_GLOSSARY.md for terminology definitions.
 */
import { useEffect } from 'react'
import { useKeyboard, useRenderer, useTerminalDimensions } from '@opentui/react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  urlAtom,
  groupedMenuItemsAtom,
  menuWidthAtom,
  activeMenuIndexAtom,
  focusedRegionAtom,
  invalidateAllViewDataAtom,
  initializeMenuIndexAtom,
  useFocusManager,
} from './state/index.js'
import {
  MainContent,
  Menu,
  StatusBar,
  UrlBar,
  INFO_PANEL_WIDTH,
  STATUS_BAR_HEIGHT,
  URL_BAR_HEIGHT,
} from './components/chrome/index.js'
import { DialogProvider } from './components/dialog/index.js'
import {
  pushDialogAtom,
  isDialogOpenAtom,
} from './state/dialog/index.js'
import { useSemanticColors } from './theme.js'
import { isSitemapUrl } from '@webspecs/core'
// Import views to trigger registration
import './views/index.js'

// ============================================================================
// Types
// ============================================================================

export interface AppProps {
  initialUrl?: string
  /** Whether a config file was loaded */
  hasConfig?: boolean
}

// ============================================================================
// Main App Component
// ============================================================================

export function App({ initialUrl, hasConfig }: AppProps) {
  const renderer = useRenderer()
  const { focus, focusNext, focusPrevious, disableFocus } = useFocusManager()
  const { width, height } = useTerminalDimensions()
  const colors = useSemanticColors()

  // Atoms
  const [url, setUrlState] = useAtom(urlAtom)
  const groupedMenuItems = useAtomValue(groupedMenuItemsAtom)
  const menuWidth = useAtomValue(menuWidthAtom)
  const activeMenuIndex = useAtomValue(activeMenuIndexAtom)
  const focusedRegion = useAtomValue(focusedRegionAtom)
  const invalidateAllViewData = useSetAtom(invalidateAllViewDataAtom)
  const initializeMenuIndex = useSetAtom(initializeMenuIndexAtom)
  const pushDialog = useSetAtom(pushDialogAtom)
  const isDialogOpen = useAtomValue(isDialogOpenAtom)

  // Set initial URL and focus on mount
  useEffect(() => {
    // Initialize menu selection to first selectable item
    initializeMenuIndex()

    // If state was restored from persistence
    if (url) {
      // If a dialog was open, keep focus disabled
      if (isDialogOpen) {
        disableFocus()
      } else {
        focus('main')
      }
      return
    }

    if (initialUrl) {
      // If it's a sitemap URL, open URL list dialog on sitemap tab
      if (isSitemapUrl(initialUrl)) {
        pushDialog({
          type: 'url-list',
          props: { autoFetchSitemapUrl: initialUrl },
        })
        disableFocus()
      } else {
        setUrlState(initialUrl)
        focus('main')
      }
    } else if (hasConfig) {
      // Config loaded without URL - auto-open URL list on Config tab
      pushDialog({
        type: 'url-list',
        props: { startOnConfig: true },
      })
      disableFocus()
    } else {
      focus('url')
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Global key bindings (these work when no dialog is open)
  useKeyboard((event) => {
    // Skip if dialog is open
    if (isDialogOpen) return

    // When URL bar is focused, handle global shortcuts then let input handle the rest
    const urlBarFocused = focusedRegion === 'url'
    if (urlBarFocused) {
      // Tab navigation still works
      if (event.name === 'tab') {
        if (event.shift) {
          focusPrevious()
        } else {
          focusNext()
        }
        return
      }
      // Ctrl+C still quits
      if (event.ctrl && event.name === 'c') {
        renderer.destroy()
        return
      }
      // Command palette (Ctrl+P) works even when URL bar is focused
      if (event.ctrl && event.name === 'p') {
        pushDialog({ type: 'command' })
        return
      }
      // All other keys go to the input
      return
    }

    // Quit
    if (event.name === 'q' || (event.ctrl && event.name === 'c')) {
      renderer.destroy()
      return
    }

    // Command palette (?)
    if (event.name === '?') {
      pushDialog({ type: 'command' })  // Opens command dialog (user can navigate to help)
      return
    }

    // Jump to URL bar
    if (event.name === 'g' && !event.shift) {
      focus('url')
      return
    }

    // Open URL list (Shift+G)
    if (event.name === 'G' || (event.name === 'g' && event.shift)) {
      pushDialog({ type: 'url-list' })
      disableFocus()
      return
    }

    // Reload
    if (event.name === 'r') {
      invalidateAllViewData()
      return
    }

    // Theme dialog
    if (event.name === 't') {
      pushDialog({ type: 'theme' })  // Opens command dialog at theme view
      return
    }

    // Command palette (Ctrl+P)
    if (event.ctrl && event.name === 'p') {
      pushDialog({ type: 'command' })
      return
    }

    // Tab navigation
    if (event.name === 'tab') {
      if (event.shift) {
        focusPrevious()
      } else {
        focusNext()
      }
      return
    }
  })

  // Layout calculations
  const contentHeight = Math.max(1, height - URL_BAR_HEIGHT - STATUS_BAR_HEIGHT)
  const contentWidth = Math.max(1, width - menuWidth)
  // Get the active menu item (should always be a 'view' type due to navigation logic)
  const activeGroupedItem = groupedMenuItems[activeMenuIndex]
  const activeItem =
    activeGroupedItem?.type === 'view'
      ? { id: activeGroupedItem.id, label: activeGroupedItem.label }
      : null

  // Info panel position: after URL bar (3 rows), relative to menu
  const infoPanelMenuOffset = 0 // Menu starts at top of content area

  return (
    <DialogProvider>
      <box
        flexDirection="column"
        width={width}
        height={height}
        backgroundColor={colors.background}
      >
        {/* URL Bar */}
        <UrlBar width={width} />

        {/* Main layout: Menu + Content + Info Panel overlay */}
        <box flexDirection="row" height={contentHeight} position="relative">
          {/* Menu (Sidebar) - uses <select> for built-in keyboard navigation */}
          <Menu width={menuWidth} />

          {/* Main Content */}
          <MainContent height={contentHeight} width={contentWidth} />

          {/* Info Panel (Overlay) - only shown when menu is focused */}
          {focusedRegion === 'menu' &&
            (() => {
              const innerWidth = INFO_PANEL_WIDTH - 2
              const bg = colors.backgroundPanel
              const title = activeItem?.label ?? 'No Selection'
              const desc = `Description for ${activeItem?.label ?? 'the selected view'}. This panel follows the currently selected menu item.`

              // Word wrap helper
              const wrapText = (text: string, width: number): string[] => {
                const words = text.split(' ')
                const lines: string[] = []
                let line = ''
                for (const word of words) {
                  if (line.length + word.length + 1 <= width) {
                    line += (line ? ' ' : '') + word
                  } else {
                    if (line) lines.push(line)
                    line = word
                  }
                }
                if (line) lines.push(line)
                return lines
              }
              const descLines = wrapText(desc, innerWidth - 2)

              const blank = () => (
                <text bg={bg}>{' '.repeat(innerWidth)}</text>
              )
              const row = (
                content: string,
                color?: string,
                bold?: boolean,
              ) => (
                <text fg={color} bg={bg}>
                  {bold ? (
                    <strong>{(' ' + content).padEnd(innerWidth)}</strong>
                  ) : (
                    (' ' + content).padEnd(innerWidth)
                  )}
                </text>
              )

              return (
                <box
                  position="absolute"
                  left={menuWidth}
                  top={infoPanelMenuOffset + activeMenuIndex}
                >
                  <box flexDirection="row" alignItems="flex-start">
                    <text fg={colors.textMuted}>─</text>
                    <box
                      borderStyle="rounded"
                      borderColor={colors.textMuted}
                      flexDirection="column"
                    >
                      {blank()}
                      {row(title, colors.text, true)}
                      {blank()}
                      {descLines.map((line, idx) => (
                        <text key={idx} fg={colors.textMuted} bg={bg}>
                          {(' ' + line).padEnd(innerWidth)}
                        </text>
                      ))}
                      {blank()}
                    </box>
                  </box>
                </box>
              )
            })()}
        </box>

        {/* Status Bar */}
        <StatusBar />
      </box>
    </DialogProvider>
  )
}
