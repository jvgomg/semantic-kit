/**
 * TUI Entry Point - OpenTUI Migration
 *
 * This is the OpenTUI version of the entry point.
 * See index.ink.tsx for the original React Ink implementation.
 */
import { createCliRenderer } from '@opentui/core'
import { createRoot } from '@opentui/react'
import { Provider } from 'jotai'
import { App } from './App.js'
import { createPersistedStore, flushPersistedState } from './state/index.js'

// Mouse handling is built into OpenTUI via component props:
// - onMouseDown, onMouseUp, onMouseScroll, etc.
// No need for manual stdin patching like with Ink.

export interface TuiOptions {
  initialUrl?: string
}

export async function startTui(options: TuiOptions = {}): Promise<void> {
  // Create store with persisted state loaded from disk
  // This happens before React mounts, so state is immediately available
  const store = await createPersistedStore(options.initialUrl)

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
      const root = createRoot(renderer)
      root.render(
        <Provider store={store}>
          <App initialUrl={options.initialUrl} />
        </Provider>,
      )
    })
  })
}
