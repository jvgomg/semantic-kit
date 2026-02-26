/**
 * DialogPanel - A reusable dialog container with optional header and footer.
 *
 * Provides:
 * - Semi-transparent backdrop overlay
 * - Centered content panel
 * - Optional header with title and hint text
 * - Optional footer for keybind hints
 * - Backdrop click handling for dismissal
 * - Gutter context for consistent child alignment
 *
 * Layout:
 *   Title                     headerHint     <- Header (only if title provided)
 * ─────────────────────────────────────────
 *
 *   {children}                               <- Content area (no padding, children use gutter)
 *
 * ─────────────────────────────────────────
 *   footer text                              <- Footer (only if footer provided)
 */
import { useMemo } from 'react'
import { useTerminalDimensions } from '@opentui/react'
import { RGBA } from '@opentui/core'
import { useSemanticColors } from '../../theme.js'
import {
  DIALOG_WIDTH,
  DIALOG_GUTTER,
  DIALOG_INDICATOR_WIDTH,
} from './constants.js'
import { DialogGutterProvider } from './DialogGutterContext.js'

// Box-drawing characters for separators
const BOX_HORIZONTAL = '─'

export interface DialogPanelProps {
  children: React.ReactNode
  /** Title shown in header (optional) */
  title?: string
  /** Right-aligned header text, e.g., "Esc to close" (optional) */
  headerHint?: string
  /** Footer text, e.g., "↑↓ Navigate  Enter Select" (optional) */
  footer?: string
  /** Width of the dialog (default: DIALOG_WIDTH) */
  width?: number
  /** Gutter (left/right margin) for content alignment (default: DIALOG_GUTTER) */
  gutter?: number
  /** Called when clicking the backdrop */
  onClose?: () => void
}

/**
 * Generate a horizontal line separator.
 */
function makeSeparator(dialogWidth: number): string {
  return BOX_HORIZONTAL.repeat(Math.max(0, dialogWidth))
}

/**
 * DialogPanel component - A styled dialog container with backdrop.
 *
 * Uses RGBA opacity overlay to dim background content.
 * Content is centered both horizontally and vertically.
 */
export function DialogPanel({
  children,
  title,
  headerHint,
  footer,
  width = DIALOG_WIDTH,
  gutter = DIALOG_GUTTER,
  onClose,
}: DialogPanelProps) {
  const colors = useSemanticColors()
  const { width: termWidth, height: termHeight } = useTerminalDimensions()

  const hasHeader = Boolean(title)
  const hasFooter = Boolean(footer)
  const separator = makeSeparator(width)

  // Position dialog near top of screen (like OpenCode)
  const topPadding = Math.floor(termHeight / 4)

  // Memoize gutter context value to avoid unnecessary re-renders
  const gutterContextValue = useMemo(
    () => ({
      gutter,
      indicatorWidth: DIALOG_INDICATOR_WIDTH,
    }),
    [gutter],
  )

  return (
    <box
      position="absolute"
      width={termWidth}
      height={termHeight}
      left={0}
      top={0}
      alignItems="center"
      paddingTop={topPadding}
      backgroundColor={RGBA.fromInts(0, 0, 0, 150)}
      onMouseUp={() => onClose?.()}
    >
      <box
        flexDirection="column"
        backgroundColor={colors.backgroundPanel}
        width={width}
        maxWidth={termWidth - 2}
        paddingTop={1}
        onMouseUp={(e) => e.stopPropagation()}
      >
        {/* Header row */}
        {hasHeader && (
          <box flexDirection="column">
            <box
              flexDirection="row"
              justifyContent="space-between"
              paddingLeft={gutter}
              paddingRight={gutter}
              paddingBottom={1}
            >
              <text fg={colors.text}>
                <strong>{title}</strong>
              </text>
              {headerHint && <text fg={colors.textMuted}>{headerHint}</text>}
            </box>
            <text fg={colors.borderSubtle}>{separator}</text>
          </box>
        )}

        {/* Content area */}
        <DialogGutterProvider value={gutterContextValue}>
          <box flexDirection="column" paddingTop={1} paddingBottom={1}>
            {children}
          </box>
        </DialogGutterProvider>

        {/* Footer row */}
        {hasFooter && (
          <box flexDirection="column">
            <text fg={colors.borderSubtle}>{separator}</text>
            <box
              flexDirection="row"
              paddingLeft={gutter}
              paddingRight={gutter}
              paddingTop={1}
              paddingBottom={1}
            >
              <text fg={colors.textMuted}>{footer}</text>
            </box>
          </box>
        )}
      </box>
    </box>
  )
}
