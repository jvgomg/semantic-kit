/**
 * DialogPanel - A reusable dialog container with optional header and footer.
 *
 * Provides:
 * - Semi-transparent backdrop overlay
 * - Centered content panel with rounded borders
 * - Optional header with title and hint text
 * - Optional footer for keybind hints
 * - Backdrop click handling for dismissal
 *
 * Layout:
 * ┌─────────────────────────────────────────┐
 * │  Title                     headerHint   │  <- Header (only if title provided)
 * ├─────────────────────────────────────────┤
 * │                                         │
 * │  {children}                             │  <- Content area
 * │                                         │
 * ├─────────────────────────────────────────┤
 * │  footer text                            │  <- Footer (only if footer provided)
 * └─────────────────────────────────────────┘
 */
import { useTerminalDimensions } from '@opentui/react'
import { RGBA } from '@opentui/core'
import { useSemanticColors } from '../../theme.js'

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
  /** Width of the dialog (default: 50) */
  width?: number
  /** Height of the dialog - 'auto' or number (default: 'auto') */
  height?: number | 'auto'
  /** Called when clicking the backdrop */
  onClose?: () => void
}

/**
 * Generate a horizontal line separator.
 * Width accounts for border (2 chars) and padding (4 chars).
 */
function makeSeparator(dialogWidth: number): string {
  // Inner width = total width - 2 (border) - 4 (padding left/right)
  const innerWidth = Math.max(0, dialogWidth - 2)
  return BOX_HORIZONTAL.repeat(innerWidth)
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
  width = 50,
  height = 'auto',
  onClose,
}: DialogPanelProps) {
  const colors = useSemanticColors()
  const { width: termWidth, height: termHeight } = useTerminalDimensions()

  const hasHeader = Boolean(title)
  const hasFooter = Boolean(footer)
  const separator = makeSeparator(width)

  return (
    <box
      position="absolute"
      width={termWidth}
      height={termHeight}
      left={0}
      top={0}
      justifyContent="center"
      alignItems="center"
      backgroundColor={RGBA.fromInts(0, 0, 0, 150)}
      onMouseUp={() => onClose?.()}
    >
      <box
        borderStyle="rounded"
        flexDirection="column"
        borderColor={colors.borderActive}
        backgroundColor={colors.backgroundPanel}
        width={width}
        height={height === 'auto' ? undefined : height}
        onMouseUp={(e) => e.stopPropagation()}
      >
        {/* Header row */}
        {hasHeader && (
          <>
            <box
              flexDirection="row"
              justifyContent="space-between"
              paddingLeft={2}
              paddingRight={2}
              paddingTop={1}
              paddingBottom={1}
            >
              <text fg={colors.text}>
                <strong>{title}</strong>
              </text>
              {headerHint && <text fg={colors.textMuted}>{headerHint}</text>}
            </box>
            <text fg={colors.borderSubtle}>{separator}</text>
          </>
        )}

        {/* Content area */}
        <box
          flexDirection="column"
          paddingLeft={2}
          paddingRight={2}
          paddingTop={1}
          paddingBottom={1}
          flexGrow={1}
        >
          {children}
        </box>

        {/* Footer row */}
        {hasFooter && (
          <>
            <text fg={colors.borderSubtle}>{separator}</text>
            <box
              flexDirection="row"
              paddingLeft={2}
              paddingRight={2}
              paddingTop={1}
              paddingBottom={1}
            >
              <text fg={colors.textMuted}>{footer}</text>
            </box>
          </>
        )}
      </box>
    </box>
  )
}
