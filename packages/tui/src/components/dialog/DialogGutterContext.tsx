/**
 * Dialog Gutter Context
 *
 * Provides consistent gutter (margin) values to dialog child components.
 * DialogPanel provides this context, and child components like DialogSelect
 * and DialogInput consume it for consistent alignment.
 */
import { createContext, useContext } from 'react'
import { DIALOG_GUTTER, DIALOG_INDICATOR_WIDTH } from './constants.js'

export interface DialogGutterContextValue {
  /** Left/right margin for content alignment */
  gutter: number
  /** Width of selection indicator column */
  indicatorWidth: number
}

const DialogGutterContext = createContext<DialogGutterContextValue>({
  gutter: DIALOG_GUTTER,
  indicatorWidth: DIALOG_INDICATOR_WIDTH,
})

export const DialogGutterProvider = DialogGutterContext.Provider

/**
 * Hook to access dialog gutter values.
 *
 * Returns the current gutter and indicator width settings,
 * either from context (when inside a DialogPanel) or defaults.
 */
export function useDialogGutter(): DialogGutterContextValue {
  return useContext(DialogGutterContext)
}
