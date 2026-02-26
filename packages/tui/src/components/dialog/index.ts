/**
 * Dialog components for OpenTUI.
 *
 * These components are designed for use in modal dialogs and overlay panels.
 */

// Layout constants
export {
  DIALOG_WIDTH,
  DIALOG_MAX_HEIGHT,
  DIALOG_GUTTER,
  DIALOG_INDICATOR_WIDTH,
} from './constants.js'

// Gutter context for consistent alignment
export { DialogGutterProvider, useDialogGutter } from './DialogGutterContext.js'
export type { DialogGutterContextValue } from './DialogGutterContext.js'

// Core dialog components
export { DialogSelect } from './DialogSelect.js'
export type { DialogSelectOption, DialogSelectProps } from './DialogSelect.js'

export { DialogPanel } from './DialogPanel.js'
export type { DialogPanelProps } from './DialogPanel.js'

export { DialogInput } from './DialogInput.js'
export type { DialogInputProps } from './DialogInput.js'

// Specific dialogs
export { HelpDialog } from './HelpDialog.js'

export { ThemeDialog } from './ThemeDialog.js'

export { CommandDialog } from './CommandDialog.js'
export type { CommandDialogProps } from './CommandDialog.js'

export { UrlListDialog } from './UrlListDialog.js'
export type { UrlListDialogProps } from './UrlListDialog.js'

// Dialog stack management
export { DialogProvider } from './DialogProvider.js'
export type { DialogProviderProps } from './DialogProvider.js'

export * from './DialogContext.js'
