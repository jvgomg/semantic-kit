/**
 * Semantic-Kit TUI Prototype
 *
 * This is a prototype focused on layout and navigation.
 * See UI_GLOSSARY.md for terminology definitions.
 */
import React, { useCallback, useEffect, useMemo } from 'react'
import { Box, Text, useApp, useInput, useFocusManager } from 'ink'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useMouseClick } from './hooks/useMouse.js'
import { useTerminalSize } from './hooks/useTerminalSize.js'
import {
  urlAtom,
  setUrlAtom,
  menuItemsAtom,
  menuWidthAtom,
  activeMenuIndexAtom,
  navigateMenuAtom,
  activeModalAtom,
  focusedRegionAtom,
  invalidateAllViewsAtom,
  urlListIndexAtom,
  recentUrlsAtom,
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
import { colors } from './theme.js'
import { getDefaultSitemapUrl } from '../lib/sitemap.js'

// ============================================================================
// Types
// ============================================================================

interface AppProps {
  initialUrl?: string
}

// ============================================================================
// Main App Component
// ============================================================================

export function App({ initialUrl }: AppProps) {
  const { exit } = useApp()
  const { focus, disableFocus, enableFocus } = useFocusManager()
  const { columns, rows } = useTerminalSize()

  // Atoms
  const [url, setUrlState] = useAtom(urlAtom)
  const setUrl = useSetAtom(setUrlAtom)
  const menuItems = useAtomValue(menuItemsAtom)
  const menuWidth = useAtomValue(menuWidthAtom)
  const [activeMenuIndex, setActiveMenuIndex] = useAtom(activeMenuIndexAtom)
  const navigateMenu = useSetAtom(navigateMenuAtom)
  const [activeModal, setActiveModal] = useAtom(activeModalAtom)
  const focusedRegion = useAtomValue(focusedRegionAtom)
  const invalidateAllViews = useSetAtom(invalidateAllViewsAtom)
  const setUrlListIndex = useSetAtom(urlListIndexAtom)
  const recentUrls = useAtomValue(recentUrlsAtom)

  // Set initial URL and focus on mount
  useEffect(() => {
    if (initialUrl) {
      setUrlState(initialUrl)
      focus('main')
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
  useInput(
    (input, key) => {
      // Quit
      if (input === 'q' || (key.ctrl && input === 'c')) {
        exit()
        return
      }

      // Handle Escape - Ink clears focus on Escape by design, so we re-focus
      // the current region to maintain focus state
      if (key.escape) {
        setTimeout(() => focus(focusedRegion), 0)
        return
      }

      // Help modal
      if (input === '?') {
        openModal('help')
        return
      }

      // Jump to URL bar
      if (input === 'g' && !key.shift) {
        focus('url')
        return
      }

      // Open URL list (Shift+G)
      if (input === 'G' || (input === 'g' && key.shift)) {
        openModal('url-list')
        setUrlListIndex(0)
        return
      }

      // Reload
      if (input === 'r') {
        invalidateAllViews()
        return
      }
    },
    { isActive: activeModal === null },
  )

  // Handlers
  const handleUrlSubmit = useCallback(() => {
    focus('menu')
  }, [focus])

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
  const contentHeight = Math.max(1, rows - URL_BAR_HEIGHT - STATUS_BAR_HEIGHT)
  const activeItem = menuItems[activeMenuIndex]

  // Mouse click handling - focus regions based on click position
  useMouseClick({
    isActive: activeModal === null,
    onClick: useCallback(
      ({ x, y }) => {
        // URL Bar region: rows 1-3 (1-indexed from terminal)
        if (y >= 1 && y <= URL_BAR_HEIGHT) {
          focus('url')
          return
        }

        // Menu region: below URL bar, within menu width
        const menuStartY = URL_BAR_HEIGHT + 1
        const menuEndY = menuStartY + contentHeight
        const menuStartX = 1
        const menuEndX = menuWidth

        if (
          y >= menuStartY &&
          y < menuEndY &&
          x >= menuStartX &&
          x <= menuEndX
        ) {
          // Calculate which menu item was clicked
          const clickedIndex = y - menuStartY - 1 // -1 for border
          if (clickedIndex >= 0 && clickedIndex < menuItems.length) {
            setActiveMenuIndex(clickedIndex)
            focus('menu')
          }
          return
        }

        // Main content region: to the right of menu
        if (y >= menuStartY && x > menuEndX) {
          focus('main')
          return
        }
      },
      [menuWidth, contentHeight, menuItems.length, focus, setActiveMenuIndex],
    ),
  })

  // Info panel position: after URL bar (3 rows), relative to menu
  const infoPanelMenuOffset = 0 // Menu starts at top of content area

  return (
    <Box flexDirection="column" width={columns} height={rows}>
      {/* URL Bar */}
      <UrlBar
        url={url}
        onUrlChange={setUrl}
        onSubmit={handleUrlSubmit}
        width={columns}
      />

      {/* Main layout: Menu + Content + Info Panel overlay */}
      <Box flexDirection="row" height={contentHeight} position="relative">
        {/* Menu (Sidebar) */}
        <Menu
          items={menuItems}
          activeIndex={activeMenuIndex}
          onNavigate={navigateMenu}
          width={menuWidth}
        />

        {/* Main Content */}
        <MainContent viewId={activeItem?.id ?? ''} height={contentHeight} />

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

            const blank = () => (
              <Text backgroundColor={bg}>{' '.repeat(innerWidth)}</Text>
            )
            const row = (content: string, color?: string, bold?: boolean) => (
              <Text color={color} bold={bold} backgroundColor={bg}>
                {(' ' + content).padEnd(innerWidth)}
              </Text>
            )

            return (
              <Box
                position="absolute"
                marginLeft={menuWidth}
                marginTop={infoPanelMenuOffset + activeMenuIndex}
              >
                <Box flexDirection="row" alignItems="flex-start">
                  <Text color={colors.muted}>─</Text>
                  <Box
                    borderStyle="round"
                    borderColor={colors.muted}
                    flexDirection="column"
                  >
                    {blank()}
                    {row(title, colors.text, true)}
                    {blank()}
                    {descLines.map((line, idx) => (
                      <Text
                        key={idx}
                        color={colors.textHint}
                        backgroundColor={bg}
                      >
                        {(' ' + line).padEnd(innerWidth)}
                      </Text>
                    ))}
                    {blank()}
                  </Box>
                </Box>
              </Box>
            )
          })()}
      </Box>

      {/* Status Bar */}
      <StatusBar />

      {/* Modals */}
      {activeModal === 'help' && (
        <HelpModal onClose={closeModal} columns={columns} rows={rows} />
      )}
      {activeModal === 'url-list' && (
        <UrlList
          onSelect={handleUrlListSelect}
          onClose={closeModal}
          columns={columns}
          rows={rows}
          defaultSitemapUrl={defaultSitemapUrl}
        />
      )}
    </Box>
  )
}
