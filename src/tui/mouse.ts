/**
 * Mouse event handling for terminal applications.
 *
 * This module provides low-level mouse event parsing and a stdin filter that
 * prevents mouse escape sequences from appearing as garbled text in Ink components.
 *
 * ## How Terminal Mouse Events Work
 *
 * When mouse tracking is enabled, terminals send escape sequences for mouse actions:
 *
 * - **SGR format** (modern): `\x1b[<button;x;yM` (press) or `\x1b[<button;x;ym` (release)
 *   - Button 0 = left click
 *   - Button 64 = scroll up
 *   - Button 65 = scroll down
 *
 * - **Legacy format**: `\x1b[Mbxy` where b, x, y are encoded as characters
 *   - Button 32 = left click
 *   - Button 96/97 = scroll up/down
 *
 * ## The Problem
 *
 * Ink's input system (and components like TextInput) read from stdin. Without
 * filtering, mouse escape sequences appear as garbled text when users click
 * or scroll.
 *
 * ## The Solution
 *
 * `patchStdinForMouseFiltering()` intercepts stdin data events to:
 * 1. Parse and dispatch mouse events to registered handlers
 * 2. Strip mouse sequences from the data before Ink sees it
 *
 * This allows mouse events to work while keeping text input clean.
 *
 * ## Usage
 *
 * ```typescript
 * // In your TUI entry point:
 * import { patchStdinForMouseFiltering, registerClickHandler } from './mouse.js'
 *
 * // Patch stdin before rendering
 * const unpatch = patchStdinForMouseFiltering()
 *
 * // Register handlers
 * const unregister = registerClickHandler((x, y) => {
 *   console.log(`Clicked at ${x}, ${y}`)
 * })
 *
 * // Cleanup on exit
 * unpatch()
 * unregister()
 * ```
 */

// =============================================================================
// Mouse Escape Sequence Patterns
// =============================================================================

/**
 * SGR (Select Graphic Rendition) mouse event format.
 * Modern terminals use this format when `\x1b[?1006h` is enabled.
 *
 * Format: `\x1b[<button;x;yM` (press) or `\x1b[<button;x;ym` (release)
 *
 * Button values:
 * - 0: Left click
 * - 1: Middle click
 * - 2: Right click
 * - 64: Scroll up
 * - 65: Scroll down
 */
// eslint-disable-next-line no-control-regex
const SGR_MOUSE_REGEX = /\x1b\[<(\d+);(\d+);(\d+)([Mm])/g

/**
 * Fallback pattern for SGR mouse events when the escape character has been
 * stripped by another layer (e.g., Ink's input processing).
 * Matches: `[<button;x;yM` or `[<button;x;ym`
 */
const SGR_MOUSE_STRIPPED_REGEX = /\[<(\d+);(\d+);(\d+)([Mm])/g

/**
 * Legacy X10/normal mouse event format.
 * Older terminals or fallback mode uses this format.
 *
 * Format: `\x1b[Mbxy` where b, x, y are single characters with values offset by 32.
 *
 * Button values (after subtracting 32 from char code):
 * - 0: Left click
 * - 64: Scroll up
 * - 65: Scroll down
 */
// eslint-disable-next-line no-control-regex
const LEGACY_MOUSE_REGEX = /\x1b\[M[\s\S][\s\S][\s\S]/g

// =============================================================================
// Handler Registries
// =============================================================================

/**
 * Handler function for scroll events.
 * @param direction - 'up' or 'down'
 * @param x - Column position (1-indexed)
 * @param y - Row position (1-indexed)
 */
export type ScrollHandler = (
  direction: 'up' | 'down',
  x: number,
  y: number,
) => void

/**
 * Handler function for click events.
 * @param x - Column position (1-indexed)
 * @param y - Row position (1-indexed)
 */
export type ClickHandler = (x: number, y: number) => void

/** Registry of scroll event handlers */
const scrollHandlers = new Set<ScrollHandler>()

/** Registry of click event handlers */
const clickHandlers = new Set<ClickHandler>()

/**
 * Register a handler for mouse scroll events.
 *
 * @param handler - Function to call when scroll occurs
 * @returns Cleanup function to unregister the handler
 *
 * @example
 * ```typescript
 * const unregister = registerScrollHandler((direction, x, y) => {
 *   if (direction === 'up') scrollUp()
 *   else scrollDown()
 * })
 *
 * // Later: unregister()
 * ```
 */
export function registerScrollHandler(handler: ScrollHandler): () => void {
  scrollHandlers.add(handler)
  return () => scrollHandlers.delete(handler)
}

/**
 * Register a handler for mouse click events.
 *
 * @param handler - Function to call when click occurs
 * @returns Cleanup function to unregister the handler
 *
 * @example
 * ```typescript
 * const unregister = registerClickHandler((x, y) => {
 *   focusElementAt(x, y)
 * })
 *
 * // Later: unregister()
 * ```
 */
export function registerClickHandler(handler: ClickHandler): () => void {
  clickHandlers.add(handler)
  return () => clickHandlers.delete(handler)
}

// =============================================================================
// Event Processing
// =============================================================================

/**
 * Parse mouse events from raw terminal input and dispatch to handlers.
 *
 * This function:
 * 1. Finds all mouse escape sequences in the input string
 * 2. Dispatches events to registered scroll/click handlers
 * 3. Returns the input with mouse sequences removed
 *
 * @param str - Raw terminal input string
 * @returns Input string with mouse escape sequences stripped
 */
function processMouseEvents(str: string): string {
  // Parse SGR format: \x1b[<button;x;yM or \x1b[<button;x;ym
  const sgrMatches = str.matchAll(SGR_MOUSE_REGEX)
  for (const match of sgrMatches) {
    const button = parseInt(match[1] ?? '0', 10)
    const x = parseInt(match[2] ?? '0', 10)
    const y = parseInt(match[3] ?? '0', 10)
    const isPress = match[4] === 'M'

    // Scroll events (button 64 = up, 65 = down)
    if (button === 64 || button === 65) {
      const direction = button === 64 ? 'up' : 'down'
      for (const handler of scrollHandlers) {
        handler(direction, x, y)
      }
    }

    // Left click press only (ignore release)
    if (button === 0 && isPress) {
      for (const handler of clickHandlers) {
        handler(x, y)
      }
    }
  }

  // Parse legacy format: \x1b[Mbxy
  // eslint-disable-next-line no-control-regex
  const legacyMatches = str.matchAll(/\x1b\[M([\s\S])([\s\S])([\s\S])/g)
  for (const match of legacyMatches) {
    const button = match[1]?.charCodeAt(0) ?? 0
    const x = (match[2]?.charCodeAt(0) ?? 32) - 32
    const y = (match[3]?.charCodeAt(0) ?? 32) - 32

    // Scroll events (button 96 = up, 97 = down in legacy encoding)
    if (button === 96 || button === 97) {
      const direction = button === 96 ? 'up' : 'down'
      for (const handler of scrollHandlers) {
        handler(direction, x, y)
      }
    }

    // Left click (button 32 in legacy encoding)
    if (button === 32) {
      for (const handler of clickHandlers) {
        handler(x, y)
      }
    }
  }

  // Strip all mouse sequences from the string
  // Include the stripped regex for cases where \x1b was consumed elsewhere
  return str
    .replace(SGR_MOUSE_REGEX, '')
    .replace(SGR_MOUSE_STRIPPED_REGEX, '')
    .replace(LEGACY_MOUSE_REGEX, '')
}

// =============================================================================
// Stdin Filtering
// =============================================================================

/**
 * Patch `process.stdin` to filter mouse escape sequences from all input paths.
 *
 * This intercepts both `emit('data')` and `read()` on stdin, processes mouse
 * events, and forwards only non-mouse content to Ink's input system.
 *
 * **Why this is necessary:**
 * Ink reads from stdin using both the EventEmitter interface (`emit`) and the
 * Readable stream interface (`read`). Without filtering both paths, mouse
 * escape sequences appear as garbled characters in TextInput components.
 *
 * **How it works:**
 * 1. Patches `stdin.emit` to filter 'data' events
 * 2. Patches `stdin.read` to filter returned data
 * 3. Mouse events are dispatched to registered handlers
 * 4. Mouse sequences are stripped before Ink sees the data
 *
 * @returns Cleanup function that restores the original stdin methods
 *
 * @example
 * ```typescript
 * // Before rendering your Ink app:
 * const unpatch = patchStdinForMouseFiltering()
 *
 * render(<App />)
 *
 * // On cleanup:
 * unpatch()
 * ```
 */
export function patchStdinForMouseFiltering(): () => void {
  // Store original methods
  const originalEmit = process.stdin.emit.bind(process.stdin) as (
    event: string | symbol,
    ...args: unknown[]
  ) => boolean
  const originalRead = process.stdin.read.bind(process.stdin) as (
    size?: number,
  ) => Buffer | string | null

  let isProcessing = false

  // Override emit to filter mouse sequences from data events
  const patchedEmit = (event: string | symbol, ...args: unknown[]): boolean => {
    // Prevent recursion when we call originalEmit
    if (isProcessing) {
      return originalEmit(event, ...args)
    }

    if (event === 'data') {
      const data = args[0]
      const str = data instanceof Buffer ? data.toString() : String(data)
      const filtered = processMouseEvents(str)

      // Only forward if there's non-mouse content remaining
      if (filtered.length > 0) {
        isProcessing = true
        const result = originalEmit('data', filtered)
        isProcessing = false
        return result
      }
      // Consumed entirely by mouse processing
      return true
    }

    return originalEmit(event, ...args)
  }

  // Override read to filter mouse sequences from read data
  // Ink uses the readable stream interface, so we must filter here too
  const patchedRead = (size?: number): Buffer | string | null => {
    const data = originalRead(size)
    if (data === null) return null

    const str = data instanceof Buffer ? data.toString() : String(data)
    const filtered = processMouseEvents(str)

    if (filtered.length === 0) return null
    return filtered
  }

  // Replace methods on the stdin object
  process.stdin.emit = patchedEmit as typeof process.stdin.emit
  process.stdin.read = patchedRead as typeof process.stdin.read

  return () => {
    process.stdin.emit = originalEmit as typeof process.stdin.emit
    process.stdin.read = originalRead as typeof process.stdin.read
  }
}

// =============================================================================
// Terminal Escape Codes
// =============================================================================

/**
 * ANSI escape codes for enabling/disabling mouse tracking.
 *
 * These sequences tell the terminal to send mouse events:
 * - `\x1b[?1000h` - Enable basic mouse tracking (clicks)
 * - `\x1b[?1002h` - Enable button-event tracking (drag)
 * - `\x1b[?1006h` - Enable SGR extended mode (better coordinate encoding)
 */
export const ENABLE_MOUSE = '\x1b[?1000h\x1b[?1002h\x1b[?1006h'
export const DISABLE_MOUSE = '\x1b[?1000l\x1b[?1002l\x1b[?1006l'
