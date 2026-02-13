/**
 * TUI Entry Point - OpenTUI Migration
 *
 * This is the OpenTUI version of the entry point.
 * See index.ink.tsx for the original React Ink implementation.
 */
import { createCliRenderer, type CliRenderer, type ThemeMode } from '@opentui/core'
import { createRoot } from '@opentui/react'
import { Provider } from 'jotai'
import { App } from './App.js'
import { createPersistedStore, flushPersistedState } from './state/index.js'
import { setDetectedVariantAtom } from './theme/index.js'
import type { TuiConfig } from '../lib/tui-config/index.js'

// Mouse handling is built into OpenTUI via component props:
// - onMouseDown, onMouseUp, onMouseScroll, etc.
// No need for manual stdin patching like with Ink.

export interface TuiOptions {
  initialUrl?: string
  /** Loaded config data (if --config was provided) */
  configData?: { path: string; config: TuiConfig }
}

/**
 * Initialize theme detection from terminal.
 * Uses OpenTUI's built-in theme mode detection (DEC mode 2031).
 */
function initializeThemeDetection(
  renderer: CliRenderer,
  store: Awaited<ReturnType<typeof createPersistedStore>>,
): void {
  // Set initial theme mode if already detected
  if (renderer.themeMode) {
    store.set(setDetectedVariantAtom, renderer.themeMode)
  }

  // Subscribe to theme mode changes
  renderer.on('theme_mode', (mode: ThemeMode) => {
    store.set(setDetectedVariantAtom, mode)
  })
}

export async function startTui(options: TuiOptions = {}): Promise<void> {
  const { initialUrl, configData } = options

  // Create store with persisted state loaded from disk
  // This happens before React mounts, so state is immediately available
  const store = await createPersistedStore({ initialUrl, configData })

  return new Promise<void>((resolve) => {
    createCliRenderer({
      exitOnCtrlC: true,
      useAlternateScreen: true,
      useMouse: true,
      enableMouseMovement: false, // Only track clicks and scrolls, not hover
      onDestroy: () => {
        // Flush any pending persisted state before exit (sync)
        flushPersistedState()
        resolve()
      },
    }).then((renderer) => {
      // Initialize theme detection
      initializeThemeDetection(renderer, store)

      const root = createRoot(renderer)
      root.render(
        <Provider store={store}>
          <App initialUrl={initialUrl} hasConfig={!!configData} />
        </Provider>,
      )
    })
  })
}
