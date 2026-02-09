/**
 * Centralized Theme Configuration for Semantic-Kit TUI (OpenTUI)
 *
 * ## Color Philosophy
 *
 * OpenTUI requires explicit hex colors rather than ANSI color names.
 * We define a palette that works well in both light and dark terminals,
 * using colors that have good contrast in common themes.
 *
 * ## OpenTUI Color Props
 *
 * Unlike Ink which uses `color` and `backgroundColor` on Text:
 * - OpenTUI uses `fg` (foreground) and `bg` (background) for text
 * - Box components use `backgroundColor` and `borderColor`
 *
 * ## Text Attributes
 *
 * OpenTUI uses numeric attributes instead of boolean props:
 * - Instead of `<Text bold>`, use `<text attributes={TextAttributes.BOLD}>`
 * - Import TextAttributes from @opentui/core
 */

// =============================================================================
// Color Definitions
// =============================================================================

/**
 * Color palette using hex values.
 * These are chosen to work well in common terminal themes.
 */
export const palette = {
  // Primary colors
  cyan: '#00CED1', // Dark cyan - good visibility
  yellow: '#FFD700', // Gold/yellow for highlights
  green: '#32CD32', // Lime green for success
  red: '#FF6B6B', // Soft red for errors
  blue: '#4169E1', // Royal blue

  // Grays
  white: '#FFFFFF',
  gray: '#808080',
  darkGray: '#4A4A4A',
  black: '#000000',

  // Alternate/bright variants
  cyanBright: '#00FFFF',
  yellowBright: '#FFFF00',
} as const

/**
 * Semantic color roles used throughout the TUI.
 * Maps UI intent to palette colors.
 */
export const colors = {
  // ---------------------------------------------------------------------------
  // Semantic Roles
  // ---------------------------------------------------------------------------

  /** Primary accent color - used for focus indicators and active elements */
  accent: palette.cyan,

  /** Muted/secondary color - used for inactive elements and hints */
  muted: palette.gray,

  /** Primary text color */
  text: palette.white,

  /** Highlight color for keyboard shortcuts and important callouts */
  highlight: palette.yellow,

  // ---------------------------------------------------------------------------
  // Component-Specific
  // ---------------------------------------------------------------------------

  /** Border color when a region has keyboard focus */
  borderFocused: palette.cyan,

  /** Border color when a region does not have focus */
  borderUnfocused: palette.gray,

  /** Text color for the currently selected item */
  textSelected: palette.cyan,

  /** Background color for the currently selected item */
  backgroundSelected: palette.darkGray,

  /** Text color for hint/help text */
  textHint: palette.gray,

  /** Text color for keyboard shortcut indicators */
  textShortcut: palette.yellow,

  // ---------------------------------------------------------------------------
  // Modal/Overlay
  // ---------------------------------------------------------------------------

  /** Background color for modal overlays */
  modalBackground: palette.black,

  /** Background color for selected items within modals */
  modalBackgroundSelected: palette.darkGray,

  /** Border color for modal dialogs */
  modalBorder: palette.cyan,

  /** Title text color in modals */
  modalTitle: palette.cyan,
} as const

// =============================================================================
// Style Helpers
// =============================================================================

/**
 * OpenTUI text style props.
 */
export interface TextStyle {
  fg?: string
  bg?: string
}

/**
 * OpenTUI box style props.
 */
export interface BoxStyle {
  borderColor?: string
  backgroundColor?: string
}

/**
 * Returns text props for a selected/unselected item.
 *
 * @example
 * <text {...itemStyle(isSelected)}>Item text</text>
 */
export function itemStyle(isSelected: boolean): TextStyle {
  return {
    fg: isSelected ? colors.textSelected : colors.text,
  }
}

/**
 * Returns text props for a selected item with background.
 * Use in lists where selection needs strong visual distinction.
 *
 * @example
 * <text {...itemStyleWithBackground(isSelected)}>Item text</text>
 */
export function itemStyleWithBackground(isSelected: boolean): TextStyle {
  return {
    fg: isSelected ? colors.textSelected : colors.text,
    bg: isSelected ? colors.backgroundSelected : undefined,
  }
}

/**
 * Returns style props for modal container.
 *
 * @example
 * <box {...modalContainerStyle()}>
 */
export function modalContainerStyle(): BoxStyle {
  return {
    borderColor: colors.modalBorder,
  }
}

/**
 * Returns style props for modal text with background.
 *
 * @example
 * <text {...modalTextStyle()}>Content</text>
 */
export function modalTextStyle(): TextStyle {
  return {
    bg: colors.modalBackground,
  }
}

/**
 * Returns style props for selected items within modals.
 */
export function modalSelectedStyle(isSelected: boolean): TextStyle {
  return {
    fg: isSelected ? colors.textSelected : colors.text,
    bg: isSelected ? colors.modalBackgroundSelected : colors.modalBackground,
  }
}

// =============================================================================
// Type Exports
// =============================================================================

export type ThemeColors = typeof colors
export type ThemePalette = typeof palette
