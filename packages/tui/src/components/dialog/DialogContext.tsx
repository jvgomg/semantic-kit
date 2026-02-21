/**
 * Dialog Context and Hooks
 *
 * Provides stack-aware navigation and keyboard handling for dialogs.
 */
import { createContext, useContext, useCallback } from 'react'
import { useKeyboard } from '@opentui/react'

// =============================================================================
// Context
// =============================================================================

export interface DialogContextValue {
  /** Whether there's a previous dialog to go back to */
  canGoBack: boolean
  /** Go back to previous dialog (pops stack) */
  onBack: () => void
  /** Close all dialogs (clears stack) */
  onClose: () => void
  /** Current stack depth (1 = single dialog, 2+ = has history) */
  stackDepth: number
}

const DialogContext = createContext<DialogContextValue | null>(null)

export const DialogContextProvider = DialogContext.Provider

/**
 * Low-level hook to access dialog navigation context.
 * Prefer `useDialog` for most use cases.
 */
export function useDialogContext(): DialogContextValue {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useDialogContext must be used within a DialogProvider')
  }
  return context
}

// =============================================================================
// useDialog Hook
// =============================================================================

export interface UseDialogOptions {
  /** Additional keys that trigger close/back (e.g., 'q') */
  closeKeys?: string[]
}

export interface UseDialogResult {
  /** Title with back arrow prefix when applicable */
  title: string
  /** Header hint text ("Esc to close" or "Esc to go back") */
  headerHint: string
  /** Handler for close/back - pass to DialogPanel onClose */
  handleClose: () => void
  /** Whether there's a previous dialog to go back to */
  canGoBack: boolean
}

/**
 * Unified hook for dialog components.
 *
 * Handles:
 * - Stack-aware title (with/without back arrow)
 * - Header hint text
 * - Keyboard binding for Escape (and optional additional keys)
 * - Close/back handler
 *
 * @example
 * ```tsx
 * function MyDialog() {
 *   const { title, headerHint, handleClose } = useDialog('Settings')
 *
 *   return (
 *     <DialogPanel title={title} headerHint={headerHint} onClose={handleClose}>
 *       <Content />
 *     </DialogPanel>
 *   )
 * }
 * ```
 */
export function useDialog(
  dialogTitle: string,
  options: UseDialogOptions = {},
): UseDialogResult {
  const { closeKeys = [] } = options
  const { canGoBack, onBack, onClose } = useDialogContext()

  const handleClose = useCallback(() => {
    if (canGoBack) {
      onBack()
    } else {
      onClose()
    }
  }, [canGoBack, onBack, onClose])

  // Handle keyboard - Escape and any additional close keys
  useKeyboard((event) => {
    if (event.name === 'escape' || closeKeys.includes(event.name)) {
      handleClose()
    }
  })

  return {
    title: canGoBack ? `← ${dialogTitle}` : dialogTitle,
    headerHint: canGoBack ? 'Esc to go back' : 'Esc to close',
    handleClose,
    canGoBack,
  }
}

