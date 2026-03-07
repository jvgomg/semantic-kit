/**
 * Dialog state atoms.
 * Manages a stack of dialogs with push/pop/clear operations.
 */
import { atom } from 'jotai'
import type { DialogEntry, DialogStack, DialogType } from './types.js'

// Generate unique IDs for dialog instances
let dialogIdCounter = 0
const generateDialogId = (): string => `dialog-${++dialogIdCounter}`

/**
 * The dialog stack. Empty array means no dialogs open.
 * Top of stack (last element) is the active dialog.
 */
export const dialogStackAtom = atom<DialogStack>([])

/**
 * Derived: whether any dialog is open
 */
export const isDialogOpenAtom = atom((get) => get(dialogStackAtom).length > 0)

/**
 * Derived: the top (active) dialog, or null if none
 */
export const activeDialogAtom = atom((get) => {
  const stack = get(dialogStackAtom)
  return stack.length > 0 ? stack[stack.length - 1] : null
})

/**
 * Action: push a new dialog onto the stack
 */
export const pushDialogAtom = atom(
  null,
  (
    get,
    set,
    payload: { type: DialogType; props?: Record<string, unknown> },
  ) => {
    const entry: DialogEntry = {
      id: generateDialogId(),
      type: payload.type,
      props: payload.props,
    }
    set(dialogStackAtom, [...get(dialogStackAtom), entry])
  },
)

/**
 * Action: pop the top dialog from the stack (close current dialog)
 */
export const popDialogAtom = atom(null, (get, set) => {
  const stack = get(dialogStackAtom)
  if (stack.length > 0) {
    set(dialogStackAtom, stack.slice(0, -1))
  }
})

/**
 * Action: clear all dialogs (close everything)
 */
export const clearDialogsAtom = atom(null, (_get, set) => {
  set(dialogStackAtom, [])
})

/**
 * Action: replace the top dialog with a new one (for navigation within dialogs)
 */
export const replaceDialogAtom = atom(
  null,
  (
    get,
    set,
    payload: { type: DialogType; props?: Record<string, unknown> },
  ) => {
    const stack = get(dialogStackAtom)
    const entry: DialogEntry = {
      id: generateDialogId(),
      type: payload.type,
      props: payload.props,
    }
    if (stack.length > 0) {
      // Replace top dialog
      set(dialogStackAtom, [...stack.slice(0, -1), entry])
    } else {
      // No dialog to replace, just push
      set(dialogStackAtom, [entry])
    }
  },
)
