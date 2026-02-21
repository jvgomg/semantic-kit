/**
 * Theme System Re-exports
 *
 * All theme functionality is implemented in the theme/ directory.
 * This file provides convenient re-exports for component imports.
 */

// Re-export everything from the theme module
export {
  // Types
  type HexColor,
  type AnsiIndex,
  type ColorReference,
  type DarkLightVariant,
  type ColorValue,
  type ThemeColors,
  type ThemeJson,
  type ThemeVariant,
  type ModePreference,
  type ThemeDefinition,
  type ResolvedColors,
  type AnsiPalette,
  type SeverityLevel,
  // Hooks
  useSemanticColors,
  useTheme,
  useColors,
  type UseThemeResult,
  // Atoms
  themeIdAtom,
  modePreferenceAtom,
  detectedModeAtom,
  ansiPaletteAtom,
  availableThemesAtom,
  currentThemeAtom,
  effectiveModeAtom,
  resolvedColorsAtom,
  setThemeAtom,
  setModePreferenceAtom,
  setDetectedModeAtom,
  setAnsiPaletteAtom,
  // Color utilities
  ANSI,
  DEFAULT_ANSI_PALETTE,
  resolveColor,
  resolveThemeColors,
  getSeverityColor,
  // Theme registry
  BUILTIN_THEMES,
  DEFAULT_THEME_ID,
  getTheme,
  getAllThemes,
  getDefaultTheme,
  SYSTEM_THEME,
  DRACULA_THEME,
  NORD_THEME,
  TOKYO_NIGHT_THEME,
} from './theme/index.js'
