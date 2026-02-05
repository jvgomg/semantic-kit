/**
 * Centralized Theme Configuration for Semantic-Kit TUI
 *
 * ## Color Philosophy: ANSI Colors Over Hex Values
 *
 * This theme uses ANSI color names (e.g., 'cyan', 'gray', 'black') rather than
 * hardcoded hex values (e.g., '#1a1a1a'). This approach has several benefits:
 *
 * ### Why ANSI Colors?
 *
 * 1. **Respects User Preferences**: Terminal emulators map ANSI color names to
 *    user-configured values. When we use `color="cyan"`, the terminal displays
 *    whatever cyan the user has chosen in their theme. This means our TUI
 *    automatically adapts to light themes, dark themes, and custom palettes.
 *
 * 2. **Consistent Contrast**: Users configure their terminal colors to work well
 *    together. By using semantic color names, we inherit their contrast choices
 *    rather than imposing our own that may clash.
 *
 * 3. **Accessibility**: Users with visual impairments often customize terminal
 *    colors for better visibility. Hardcoded hex values override these settings.
 *
 * ### The 16 Standard ANSI Colors
 *
 * | Normal    | Bright        |
 * |-----------|---------------|
 * | black     | blackBright   |
 * | red       | redBright     |
 * | green     | greenBright   |
 * | yellow    | yellowBright  |
 * | blue      | blueBright    |
 * | magenta   | magentaBright |
 * | cyan      | cyanBright    |
 * | white     | whiteBright   |
 *
 * These names are supported by Ink (via chalk) and map to the user's terminal
 * configuration. The actual RGB values are determined by the terminal emulator.
 *
 * ### When Hex Colors Might Be Acceptable
 *
 * - Brand colors that must be exact (use sparingly)
 * - Gradients or data visualizations requiring precise color control
 * - When the terminal's color profile is known (rare)
 *
 * Even in these cases, consider providing fallbacks for terminals with limited
 * color support (16-color, 256-color, vs true color).
 *
 * ### Modal Background Strategy
 *
 * Modals use `backgroundColor="black"` to create a distinct overlay layer.
 * The terminal's configured "black" provides appropriate contrast regardless
 * of whether the user has a light or dark theme. This works because:
 *
 * - Dark themes: black bg blends naturally, content stands out
 * - Light themes: black bg creates strong contrast, clearly modal
 *
 * We must set a background because terminal rendering has no z-index or
 * clipping - absolutely positioned elements overlay but don't occlude.
 * Filling with a background color prevents underlying content from showing.
 *
 * ### References
 *
 * - ANSI escape codes: https://en.wikipedia.org/wiki/ANSI_escape_code
 * - Terminal colors explained: https://jvns.ca/blog/2024/10/01/terminal-colours/
 * - Chalk color support: https://github.com/chalk/chalk
 */

import type { TextProps, BoxProps } from 'ink'

// =============================================================================
// Color Definitions
// =============================================================================

/**
 * ANSI color names supported by Ink/chalk.
 * These map to user's terminal theme configuration.
 */
export type AnsiColor =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'blackBright'
  | 'redBright'
  | 'greenBright'
  | 'yellowBright'
  | 'blueBright'
  | 'magentaBright'
  | 'cyanBright'
  | 'whiteBright'
  | 'gray' // Alias for blackBright
  | 'grey' // Alias for blackBright

/**
 * Semantic color roles used throughout the TUI.
 * Maps UI intent to ANSI colors.
 */
export const colors = {
  // ---------------------------------------------------------------------------
  // Semantic Roles
  // ---------------------------------------------------------------------------

  /** Primary accent color - used for focus indicators and active elements */
  accent: 'cyan' as AnsiColor,

  /** Muted/secondary color - used for inactive elements and hints */
  muted: 'gray' as AnsiColor,

  /** Primary text color */
  text: 'white' as AnsiColor,

  /** Highlight color for keyboard shortcuts and important callouts */
  highlight: 'yellow' as AnsiColor,

  // ---------------------------------------------------------------------------
  // Component-Specific
  // ---------------------------------------------------------------------------

  /** Border color when a region has keyboard focus */
  borderFocused: 'cyan' as AnsiColor,

  /** Border color when a region does not have focus */
  borderUnfocused: 'gray' as AnsiColor,

  /** Text color for the currently selected item */
  textSelected: 'cyan' as AnsiColor,

  /** Background color for the currently selected item */
  backgroundSelected: 'gray' as AnsiColor,

  /** Text color for hint/help text */
  textHint: 'gray' as AnsiColor,

  /** Text color for keyboard shortcut indicators */
  textShortcut: 'yellow' as AnsiColor,

  // ---------------------------------------------------------------------------
  // Modal/Overlay
  // ---------------------------------------------------------------------------

  /**
   * Background color for modal overlays.
   *
   * Uses ANSI 'black' which maps to the user's configured black.
   * This provides appropriate contrast on both light and dark themes.
   */
  modalBackground: 'black' as AnsiColor,

  /**
   * Background color for selected items within modals.
   * Uses 'gray' to provide subtle differentiation from modal background.
   */
  modalBackgroundSelected: 'gray' as AnsiColor,

  /** Border color for modal dialogs */
  modalBorder: 'cyan' as AnsiColor,

  /** Title text color in modals */
  modalTitle: 'cyan' as AnsiColor,
} as const

// =============================================================================
// Style Helpers
// =============================================================================

/**
 * Returns border color based on focus state.
 * Use this for consistent focus indication across all bordered components.
 *
 * @example
 * <Box borderColor={borderColor(isFocused)}>
 */
export function borderColor(isFocused: boolean): AnsiColor {
  return isFocused ? colors.borderFocused : colors.borderUnfocused
}

/**
 * Returns text props for a selected/unselected item.
 *
 * @example
 * <Text {...itemStyle(isSelected)}>Item text</Text>
 */
export function itemStyle(isSelected: boolean): Pick<TextProps, 'color'> {
  return {
    color: isSelected ? colors.textSelected : colors.text,
  }
}

/**
 * Returns text props for a selected item with background.
 * Use in lists where selection needs strong visual distinction.
 *
 * @example
 * <Text {...itemStyleWithBackground(isSelected)}>Item text</Text>
 */
export function itemStyleWithBackground(
  isSelected: boolean,
): Pick<TextProps, 'color' | 'backgroundColor'> {
  return {
    color: isSelected ? colors.textSelected : colors.text,
    backgroundColor: isSelected ? colors.backgroundSelected : undefined,
  }
}

/**
 * Returns style props for modal content areas.
 * Ensures consistent modal appearance across the application.
 *
 * @example
 * <Box {...modalContainerStyle()}>
 *   <Text {...modalTextStyle()}>Content</Text>
 * </Box>
 */
export function modalContainerStyle(): Pick<BoxProps, 'borderColor'> {
  return {
    borderColor: colors.modalBorder,
  }
}

export function modalTextStyle(): Pick<TextProps, 'backgroundColor'> {
  return {
    backgroundColor: colors.modalBackground,
  }
}

/**
 * Returns style props for selected items within modals.
 */
export function modalSelectedStyle(
  isSelected: boolean,
): Pick<TextProps, 'color' | 'backgroundColor'> {
  return {
    color: isSelected ? colors.textSelected : colors.text,
    backgroundColor: isSelected ? colors.modalBackgroundSelected : colors.modalBackground,
  }
}

// =============================================================================
// Type Exports
// =============================================================================

export type ThemeColors = typeof colors
