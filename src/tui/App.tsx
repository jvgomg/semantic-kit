/**
 * Semantic-Kit TUI - OpenTUI Implementation
 *
 * Main application component managing layout, focus, and navigation.
 * See UI_GLOSSARY.md for terminology definitions.
 */
import { useCallback, useEffect, useMemo } from 'react'
import { useKeyboard, useRenderer, useTerminalDimensions } from '@opentui/react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  urlAtom,
  setUrlAtom,
  groupedMenuItemsAtom,
  menuWidthAtom,
  activeMenuIndexAtom,
  activeModalAtom,
  focusedRegionAtom,
  invalidateAllViewDataAtom,
  recentUrlsAtom,
  initializeMenuIndexAtom,
  useFocusManager,
  type ModalType,
} from './state/index.js'
import {
  HelpModal,
  MainContent,
  Menu,
  StatusBar,
  UrlBar,
  UrlList,
  INFO_PANEL_WIDTH,
  STATUS_BAR_HEIGHT,
  URL_BAR_HEIGHT,
} from './components/chrome/index.js'
import { useSemanticColors } from './theme.js'
import { getDefaultSitemapUrl, isSitemapUrl } from '../lib/sitemap.js'
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
  const { focus, focusNext, focusPrevious, disableFocus, enableFocus } =
    useFocusManager()
  const { width, height } = useTerminalDimensions()
  const colors = useSemanticColors()

  // Atoms
  const [url, setUrlState] = useAtom(urlAtom)
  const setUrl = useSetAtom(setUrlAtom)
  const groupedMenuItems = useAtomValue(groupedMenuItemsAtom)
  const menuWidth = useAtomValue(menuWidthAtom)
  const activeMenuIndex = useAtomValue(activeMenuIndexAtom)
  const [activeModal, setActiveModal] = useAtom(activeModalAtom)
  const focusedRegion = useAtomValue(focusedRegionAtom)
  const invalidateAllViewData = useSetAtom(invalidateAllViewDataAtom)
  const recentUrls = useAtomValue(recentUrlsAtom)
  const initializeMenuIndex = useSetAtom(initializeMenuIndexAtom)

  // Set initial URL and focus on mount
  useEffect(() => {
    // Initialize menu selection to first selectable item
    initializeMenuIndex()

    // If state was restored from persistence
    if (url) {
      // If a modal was open, keep focus disabled
      if (activeModal) {
        disableFocus()
      } else {
        focus('main')
      }
      return
    }

    if (initialUrl) {
      // If it's a sitemap URL, open URL list modal on sitemap tab
      if (isSitemapUrl(initialUrl)) {
        setActiveModal('url-list')
        disableFocus()
      } else {
        setUrlState(initialUrl)
        focus('main')
      }
    } else if (hasConfig) {
      // Config loaded without URL - auto-open URL list on Config tab
      setActiveModal('url-list')
      disableFocus()
    } else {
      focus('url')
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Modal control
  const openModal = useCallback(
    (modal: ModalType) => {
      setActiveModal(modal)
      disableFocus()
    },
    [setActiveModal, disableFocus],
  )

  const closeModal = useCallback(() => {
    setActiveModal(null)
    enableFocus()
  }, [setActiveModal, enableFocus])

  // Global key bindings (these work when no modal is open)
  useKeyboard((event) => {
    // Skip if modal is open
    if (activeModal !== null) return

    // When URL bar is focused, only handle Tab and Ctrl+C (let input handle the rest)
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
      // All other keys go to the input
      return
    }

    // Quit
    if (event.name === 'q' || (event.ctrl && event.name === 'c')) {
      renderer.destroy()
      return
    }

    // Help modal
    if (event.name === '?') {
      openModal('help')
      return
    }

    // Jump to URL bar
    if (event.name === 'g' && !event.shift) {
      focus('url')
      return
    }

    // Open URL list (Shift+G)
    if (event.name === 'G' || (event.name === 'g' && event.shift)) {
      openModal('url-list')
      return
    }

    // Reload
    if (event.name === 'r') {
      invalidateAllViewData()
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

  const handleUrlListSelect = useCallback(
    (selectedUrl: string) => {
      setUrl(selectedUrl)
      closeModal()
      focus('menu')
    },
    [setUrl, closeModal, focus],
  )

  // Default sitemap URL based on current URL
  const defaultSitemapUrl = useMemo(() => {
    if (url) {
      return getDefaultSitemapUrl(url)
    }
    // If no URL, use first recent URL or empty string
    if (recentUrls.length > 0) {
      return getDefaultSitemapUrl(recentUrls[0])
    }
    return ''
  }, [url, recentUrls])

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
    <box flexDirection="column" width={width} height={height}>
      {/* URL Bar */}
      <UrlBar width={width} />

      {/* URL List (inline, replaces main content when shown) */}
      {activeModal === 'url-list' ? (
        <UrlList
          onSelect={handleUrlListSelect}
          onClose={closeModal}
          columns={width}
          rows={contentHeight}
          defaultSitemapUrl={defaultSitemapUrl}
          autoFetchSitemapUrl={
            initialUrl && isSitemapUrl(initialUrl) ? initialUrl : undefined
          }
          startOnConfig={hasConfig && !initialUrl}
        />
      ) : (
        /* Main layout: Menu + Content + Info Panel overlay */
        <box flexDirection="row" height={contentHeight} position="relative">
          {/* Menu (Sidebar) - uses <select> for built-in keyboard navigation */}
          <Menu width={menuWidth} />

          {/* Main Content */}
          <MainContent height={contentHeight} width={contentWidth} />

          {/* Info Panel (Overlay) - only shown when menu is focused */}
          {focusedRegion === 'menu' &&
            (() => {
              const innerWidth = INFO_PANEL_WIDTH - 2
              const bg = colors.modalBackground
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

              const blank = () => <text bg={bg}>{' '.repeat(innerWidth)}</text>
              const row = (content: string, color?: string, bold?: boolean) => (
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
                    <text fg={colors.muted}>─</text>
                    <box
                      borderStyle="rounded"
                      borderColor={colors.muted}
                      flexDirection="column"
                    >
                      {blank()}
                      {row(title, colors.text, true)}
                      {blank()}
                      {descLines.map((line, idx) => (
                        <text key={idx} fg={colors.textHint} bg={bg}>
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
      )}

      {/* Status Bar */}
      <StatusBar />

      {/* Modals */}
      {activeModal === 'help' && <HelpModal onClose={closeModal} />}
    </box>
  )
}
