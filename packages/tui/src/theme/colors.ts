/**
 * Color Resolution Logic
 *
 * This module handles resolving ColorValue types to final hex strings.
 * Supports ANSI indices, hex colors, references, and dark/light variants.
 *
 * Based on OpenCode's theming approach.
 * Reference: https://github.com/anomalyco/opencode
 */

import {
  THEME_COLOR_KEYS,
  type ColorValue,
  type ThemeJson,
  type ThemeVariant,
  type AnsiPalette,
  type ResolvedColors,
  type HexColor,
  type DarkLightVariant,
  type ThemeColorKey,
} from './types.js'

// =============================================================================
// ANSI Color Constants
// =============================================================================

/**
 * Named constants for ANSI color indices.
 */
export const ANSI = {
  BLACK: 0,
  RED: 1,
  GREEN: 2,
  YELLOW: 3,
  BLUE: 4,
  MAGENTA: 5,
  CYAN: 6,
  WHITE: 7,
  BRIGHT_BLACK: 8,
  BRIGHT_RED: 9,
  BRIGHT_GREEN: 10,
  BRIGHT_YELLOW: 11,
  BRIGHT_BLUE: 12,
  BRIGHT_MAGENTA: 13,
  BRIGHT_CYAN: 14,
  BRIGHT_WHITE: 15,
} as const

/**
 * Default ANSI palette colors (fallback when terminal palette isn't available).
 * These are typical dark terminal colors.
 */
export const DEFAULT_ANSI_PALETTE: AnsiPalette = {
  0: '#000000', // Black
  1: '#cc0000', // Red
  2: '#4e9a06', // Green
  3: '#c4a000', // Yellow
  4: '#3465a4', // Blue
  5: '#75507b', // Magenta
  6: '#06989a', // Cyan
  7: '#d3d7cf', // White
  8: '#555753', // Bright Black (Gray)
  9: '#ef2929', // Bright Red
  10: '#8ae234', // Bright Green
  11: '#fce94f', // Bright Yellow
  12: '#729fcf', // Bright Blue
  13: '#ad7fa8', // Bright Magenta
  14: '#34e2e2', // Bright Cyan
  15: '#eeeeec', // Bright White
}

// =============================================================================
// Color Resolution
// =============================================================================

/**
 * Context for resolving color values.
 */
interface ResolutionContext {
  /** Color definitions from theme JSON */
  defs: Record<string, HexColor | string | number>
  /** Already resolved theme properties (for self-references) */
  resolved: Record<string, string>
  /** Current mode (dark or light) */
  mode: ThemeVariant
  /** ANSI palette for resolving ANSI indices */
  palette: AnsiPalette
  /** Recursion depth to prevent infinite loops */
  depth: number
}

const MAX_RESOLUTION_DEPTH = 10

/**
 * Check if a value is a hex color string.
 */
function isHexColor(value: unknown): value is HexColor {
  return (
    typeof value === 'string' &&
    value.startsWith('#') &&
    (value.length === 4 || value.length === 7)
  )
}

/**
 * Check if a value is an ANSI index (0-15).
 */
function isAnsiIndex(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && value <= 15
}

/**
 * Check if a value is a dark/light variant object.
 */
function isDarkLightVariant(value: unknown): value is DarkLightVariant {
  return (
    typeof value === 'object' &&
    value !== null &&
    'dark' in value &&
    'light' in value
  )
}

/**
 * Resolve a single color value to a hex string.
 *
 * Resolution rules:
 * 1. "none" → "transparent"
 * 2. Number (0-15) → lookup in ANSI palette
 * 3. { dark: X, light: Y } → resolve based on mode
 * 4. "#RRGGBB" or "#RGB" → return as-is
 * 5. String reference → lookup in defs, then resolved properties
 */
export function resolveColor(
  value: ColorValue | undefined,
  ctx: ResolutionContext,
): string {
  // Prevent infinite recursion
  if (ctx.depth > MAX_RESOLUTION_DEPTH) {
    console.warn('Theme color resolution exceeded max depth, using fallback')
    return '#ff00ff' // Magenta to make issues obvious
  }

  // Handle undefined/null
  if (value === undefined || value === null) {
    return 'transparent'
  }

  // Handle "none" → transparent
  if (value === 'none') {
    return 'transparent'
  }

  // Handle ANSI index
  if (isAnsiIndex(value)) {
    return ctx.palette[value as keyof AnsiPalette] ?? '#ff00ff'
  }

  // Handle dark/light variant
  if (isDarkLightVariant(value)) {
    const variantValue = ctx.mode === 'dark' ? value.dark : value.light
    return resolveColor(variantValue, { ...ctx, depth: ctx.depth + 1 })
  }

  // Handle hex color
  if (isHexColor(value)) {
    return value
  }

  // Handle string reference
  if (typeof value === 'string') {
    // First check defs
    if (ctx.defs[value] !== undefined) {
      const defValue = ctx.defs[value]
      // Recursively resolve the def value
      return resolveColor(defValue as ColorValue, {
        ...ctx,
        depth: ctx.depth + 1,
      })
    }

    // Then check already resolved properties
    if (ctx.resolved[value] !== undefined) {
      return ctx.resolved[value]
    }

    // Unknown reference - return magenta to make it obvious
    console.warn(`Unknown color reference: "${value}"`)
    return '#ff00ff'
  }

  // Unknown type - return magenta
  console.warn(`Unknown color value type:`, value)
  return '#ff00ff'
}

// =============================================================================
// Default Theme Colors
// =============================================================================

/**
 * Default theme colors for all 28 core properties.
 * Uses ANSI indices for terminal-native colors.
 */
const DEFAULT_CORE_COLORS: Record<ThemeColorKey, ColorValue> = {
  // UI Core
  primary: ANSI.BLUE,
  secondary: ANSI.MAGENTA,
  accent: ANSI.CYAN,

  // Text
  text: ANSI.BRIGHT_WHITE,
  textMuted: ANSI.WHITE,

  // Backgrounds
  background: 'none',
  backgroundPanel: ANSI.BLACK,
  backgroundSelected: ANSI.BRIGHT_BLACK,

  // Borders
  border: ANSI.WHITE,
  borderActive: ANSI.BLUE,
  borderSubtle: ANSI.BRIGHT_BLACK,
  borderSelected: ANSI.YELLOW,

  // Status
  error: ANSI.RED,
  warning: ANSI.YELLOW,
  success: ANSI.GREEN,
  info: ANSI.CYAN,

  // Diff
  diffAdded: ANSI.GREEN,
  diffRemoved: ANSI.RED,
  diffContext: ANSI.WHITE,
  diffHunkHeader: ANSI.CYAN,

  // Markdown
  markdownHeading: ANSI.BLUE,
  markdownLink: ANSI.BLUE,
  markdownCode: ANSI.GREEN,
  markdownBlockQuote: ANSI.BRIGHT_BLACK,
  markdownList: ANSI.YELLOW,

  // Syntax
  syntaxComment: ANSI.BRIGHT_BLACK,
  syntaxKeyword: ANSI.MAGENTA,
  syntaxFunction: ANSI.BLUE,
  syntaxString: ANSI.GREEN,
  syntaxNumber: ANSI.YELLOW,
  syntaxType: ANSI.CYAN,
}

// =============================================================================
// Theme Resolution
// =============================================================================

/**
 * Resolve an entire theme JSON to final hex colors.
 * Type-safe: derives color keys from THEME_COLOR_KEYS.
 */
export function resolveThemeColors(
  json: ThemeJson,
  mode: ThemeVariant,
  palette: AnsiPalette = DEFAULT_ANSI_PALETTE,
): ResolvedColors {
  const ctx: ResolutionContext = {
    defs: json.defs ?? {},
    resolved: {},
    mode,
    palette,
    depth: 0,
  }

  // Resolve all core colors
  for (const key of THEME_COLOR_KEYS) {
    const value = json.theme[key]
    const defaultValue = DEFAULT_CORE_COLORS[key]
    ctx.resolved[key] = resolveColor(value ?? defaultValue, {
      ...ctx,
      depth: 0,
    })
  }

  // Type assertion is safe because we've populated all keys from THEME_COLOR_KEYS
  return ctx.resolved as ResolvedColors
}

/**
 * Get severity color for a given severity level.
 */
export function getSeverityColor(
  colors: ResolvedColors,
  severity?: string,
): string {
  switch (severity) {
    case 'critical':
    case 'error':
      return colors.error
    case 'warning':
      return colors.warning
    case 'info':
      return colors.info
    case 'success':
      return colors.success
    case 'muted':
      return colors.textMuted
    default:
      return colors.text
  }
}
