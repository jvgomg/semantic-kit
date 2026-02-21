/**
 * Dialog system types.
 * Stack-based dialog management inspired by OpenCode's DialogProvider.
 */

/** Dialog types supported by the system */
export type DialogType = 'command' | 'help' | 'theme' | 'url-list'

/** Entry in the dialog stack */
export interface DialogEntry {
  /** Unique instance ID */
  id: string
  /** Type of dialog to render */
  type: DialogType
  /** Optional props passed to the dialog component */
  props?: Record<string, unknown>
}

/** Dialog stack state */
export type DialogStack = DialogEntry[]
