/**
 * Layout constants and shared types for chrome components.
 *
 * For color/styling constants, see src/tui/theme.ts
 */

// Layout dimensions
export const MENU_PADDING_X = 1
export const MENU_BORDER_WIDTH = 2 // left + right border
export const MENU_INDICATOR_WIDTH = 2 // "▸ " prefix
export const INFO_PANEL_WIDTH = 36
export const URL_BAR_HEIGHT = 3
export const STATUS_BAR_HEIGHT = 1

// Modal dimensions
export const URL_LIST_WIDTH = 48
export const HELP_MODAL_WIDTH = 52
export const HELP_MODAL_HEIGHT = 14

// Types
export type ModalType = 'help' | 'url-list' | null
