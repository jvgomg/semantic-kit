/**
 * Theme System Types
 *
 * This theme system is based on OpenCode's theming approach.
 * Reference: https://github.com/anomalyco/opencode
 *
 * Key concepts:
 * - ColorValue: Can be hex, ANSI index (0-15), reference string, or dark/light variant
 * - ThemeJson: JSON structure with defs (color definitions) and theme (semantic mappings)
 * - ResolvedColors: Final resolved hex strings for use in components
 */

// =============================================================================
// Color Value Types
// =============================================================================

/**
 * Hex color string (e.g., "#FF0000" or "#f00")
 */
export type HexColor = `#${string}`

/**
 * ANSI color index (0-15) from the terminal palette.
 * 0-7: Standard colors (black, red, green, yellow, blue, magenta, cyan, white)
 * 8-15: Bright variants
 */
export type AnsiIndex = number

/**
 * Reference to a color defined in the `defs` section or another theme property.
 */
export type ColorReference = string

/**
 * Color value that varies by dark/light mode.
 */
export interface DarkLightVariant {
  dark: HexColor | ColorReference | AnsiIndex
  light: HexColor | ColorReference | AnsiIndex
}

/**
 * A color value in the theme JSON.
 * Can be:
 * - "none" for transparent
 * - A hex color like "#FF0000"
 * - An ANSI index (0-15) to use terminal palette color
 * - A reference string to look up in defs or theme properties
 * - An object with dark/light variants
 */
export type ColorValue =
  | 'none'
  | HexColor
  | AnsiIndex
  | ColorReference
  | DarkLightVariant

// =============================================================================
// Theme Color Keys - The Source of Truth
// =============================================================================

/**
 * All theme color property names.
 *
 * This is the single source of truth for color names.
 * ResolvedColors and ThemeColors are derived from this.
 *
 * Based on OpenCode's color scheme with minimal extensions for TUI needs.
 *
 * Core colors: 28 total
 * - UI Core: primary, secondary, accent
 * - Text: text, textMuted
 * - Backgrounds: background, backgroundPanel, backgroundSelected
 * - Borders: border, borderActive, borderSubtle, borderSelected
 * - Status: error, warning, success, info
 * - Diff: diffAdded, diffRemoved, diffContext, diffHunkHeader
 * - Markdown: markdownHeading, markdownLink, markdownCode, markdownBlockQuote, markdownList
 * - Syntax: syntaxComment, syntaxKeyword, syntaxFunction, syntaxString, syntaxNumber, syntaxType
 */
export const THEME_COLOR_KEYS = [
  // UI Core (OpenCode)
  'primary',
  'secondary',
  'accent',

  // Text (OpenCode)
  'text',
  'textMuted',

  // Backgrounds (OpenCode + backgroundSelected for TUI selection)
  'background',
  'backgroundPanel',
  'backgroundSelected',

  // Borders (OpenCode + borderSelected for TUI focus states)
  'border',
  'borderActive',
  'borderSubtle',
  'borderSelected',

  // Status (OpenCode)
  'error',
  'warning',
  'success',
  'info',

  // Diff (OpenCode)
  'diffAdded',
  'diffRemoved',
  'diffContext',
  'diffHunkHeader',

  // Markdown (OpenCode subset)
  'markdownHeading',
  'markdownLink',
  'markdownCode',
  'markdownBlockQuote',
  'markdownList',

  // Syntax Highlighting (OpenCode subset)
  'syntaxComment',
  'syntaxKeyword',
  'syntaxFunction',
  'syntaxString',
  'syntaxNumber',
  'syntaxType',
] as const

/**
 * Type for valid theme color key names.
 */
export type ThemeColorKey = (typeof THEME_COLOR_KEYS)[number]

// =============================================================================
// Theme JSON Structure
// =============================================================================

/**
 * Theme definition colors - all semantic color properties.
 * Themes can define any subset of these; missing properties use defaults.
 */
export type ThemeColors = {
  [K in ThemeColorKey]?: ColorValue
}

/**
 * JSON theme file structure.
 *
 * @example
 * ```json
 * {
 *   "defs": {
 *     "bg": "#1a1b26",
 *     "fg": "#c0caf5",
 *     "blue": "#7aa2f7"
 *   },
 *   "theme": {
 *     "primary": "blue",
 *     "text": "fg",
 *     "background": "bg"
 *   }
 * }
 * ```
 */
export interface ThemeJson {
  /** Optional schema reference */
  $schema?: string
  /** Color definitions - variables that can be referenced in theme */
  defs?: Record<string, HexColor | ColorReference | AnsiIndex>
  /** Semantic color mappings */
  theme: ThemeColors
}

// =============================================================================
// Theme Definition
// =============================================================================

/**
 * Theme variant (dark or light mode).
 */
export type ThemeVariant = 'dark' | 'light'

/**
 * User's preference for which variant to use.
 */
export type ModePreference = 'auto' | 'dark' | 'light'

/**
 * Complete theme definition with metadata.
 */
export interface ThemeDefinition {
  /** Unique identifier for the theme */
  id: string
  /** Display name */
  name: string
  /** Theme variant (dark or light) */
  variant: ThemeVariant
  /** Whether this theme supports both dark and light modes */
  supportsBothModes?: boolean
  /** Original author or source */
  author?: string
  /** Theme JSON data */
  json: ThemeJson
}

// =============================================================================
// Resolved Colors
// =============================================================================

/**
 * Resolved colors with all values as hex strings or "transparent".
 * This is what components receive from useSemanticColors().
 */
export type ResolvedColors = {
  [K in ThemeColorKey]: string
}

/**
 * ANSI color palette - the 16 standard terminal colors.
 * Can be queried from the terminal or use fallback defaults.
 */
export interface AnsiPalette {
  0: string
  1: string
  2: string
  3: string
  4: string
  5: string
  6: string
  7: string
  8: string
  9: string
  10: string
  11: string
  12: string
  13: string
  14: string
  15: string
}

/**
 * Color mode for components (normal or dimmed behind modals).
 */
export type ColorMode = 'normal' | 'dimmed'

/**
 * Severity level for color mapping.
 */
export type SeverityLevel =
  | 'critical'
  | 'error'
  | 'warning'
  | 'info'
  | 'success'
  | 'muted'
