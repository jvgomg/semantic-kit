/**
 * semantic-kit TUI Theme System
 *
 * This is the main entry point for the theme system.
 * Based on OpenCode's ANSI-first theming approach.
 *
 * @module
 */

// =============================================================================
// Core Types
// =============================================================================

export type {
  // Color value types
  HexColor,
  AnsiIndex,
  ColorReference,
  DarkLightVariant,
  ColorValue,
  // Theme structure
  ThemeColors,
  ThemeJson,
  ThemeVariant,
  ModePreference,
  ThemeDefinition,
  // Resolved colors
  ResolvedColors,
  AnsiPalette,
  ColorMode,
  SeverityLevel,
  // Color key type
  ThemeColorKey,
} from './types.js'

export { THEME_COLOR_KEYS } from './types.js'

// =============================================================================
// React Hooks
// =============================================================================

export {
  useSemanticColors,
  useTheme,
  useColors,
  useColorMode,
  type UseThemeResult,
} from './hooks.js'

// =============================================================================
// Jotai Atoms
// =============================================================================

export {
  themeIdAtom,
  modePreferenceAtom,
  detectedModeAtom,
  ansiPaletteAtom,
  availableThemesAtom,
  currentThemeAtom,
  effectiveModeAtom,
  resolvedColorsAtom,
  dimmedColorsAtom,
  setThemeAtom,
  setModePreferenceAtom,
  setDetectedModeAtom,
  setAnsiPaletteAtom,
} from './atoms.js'

// =============================================================================
// Color Mode Context
// =============================================================================

export {
  ColorModeContext,
  ColorModeProvider,
  useColorModeContext,
  type ColorModeProviderProps,
} from './provider.js'

// =============================================================================
// Color Resolution
// =============================================================================

export {
  ANSI,
  DEFAULT_ANSI_PALETTE,
  resolveColor,
  resolveThemeColors,
  buildDimmedColors,
  getSeverityColor,
} from './colors.js'

// =============================================================================
// Theme Registry
// =============================================================================

export {
  BUILTIN_THEMES,
  DEFAULT_THEME_ID,
  getTheme,
  getAllThemes,
  getDefaultTheme,
  SYSTEM_THEME,
  DRACULA_THEME,
  NORD_THEME,
  TOKYO_NIGHT_THEME,
} from './themes/index.js'
