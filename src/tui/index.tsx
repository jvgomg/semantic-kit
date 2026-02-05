import React from 'react'
import { render } from 'ink'
import { App } from './App.js'
import {
  patchStdinForMouseFiltering,
  ENABLE_MOUSE,
  DISABLE_MOUSE,
} from './mouse.js'

// Re-export mouse utilities for use by hooks
export { registerScrollHandler, registerClickHandler } from './mouse.js'

// ANSI escape codes for alternate screen buffer
const ENTER_ALT_SCREEN = '\x1b[?1049h'
const EXIT_ALT_SCREEN = '\x1b[?1049l'
const HIDE_CURSOR = '\x1b[?25l'
const SHOW_CURSOR = '\x1b[?25h'
const CLEAR_SCREEN = '\x1b[2J\x1b[H'

export interface TuiOptions {
  initialUrl?: string
}

export function startTui(options: TuiOptions = {}): void {
  // Enter alternate screen buffer, hide cursor, enable mouse tracking
  process.stdout.write(
    ENTER_ALT_SCREEN + HIDE_CURSOR + CLEAR_SCREEN + ENABLE_MOUSE,
  )

  // Patch stdin to filter mouse escape sequences before Ink sees them
  const unpatchStdin = patchStdinForMouseFiltering()

  const { unmount, waitUntilExit } = render(
    <App initialUrl={options.initialUrl} />,
    {
      exitOnCtrlC: true,
    },
  )

  // Restore terminal on exit
  const cleanup = () => {
    unmount()
    unpatchStdin()
    process.stdout.write(DISABLE_MOUSE + SHOW_CURSOR + EXIT_ALT_SCREEN)
  }

  // Handle various exit signals
  process.on('exit', cleanup)
  process.on('SIGINT', () => {
    cleanup()
    process.exit(0)
  })
  process.on('SIGTERM', () => {
    cleanup()
    process.exit(0)
  })

  // Wait for the app to exit
  waitUntilExit().then(() => {
    cleanup()
    process.exit(0)
  })
}
