/**
 * Theme State Atoms
 *
 * Jotai atoms for the OpenCode-style theme system.
 * These atoms manage theme selection, mode preference, and color resolution.
 */

import { atom } from 'jotai'
import { resolveThemeColors, DEFAULT_ANSI_PALETTE } from './colors.js'
import {
  BUILTIN_THEMES,
  DEFAULT_THEME_ID,
  getTheme,
  getAllThemes,
} from './themes/index.js'
import type {
  ThemeDefinition,
  ThemeVariant,
  ModePreference,
  AnsiPalette,
  ResolvedColors,
} from './types.js'

// =============================================================================
// Primitive Atoms
// =============================================================================

/**
 * The currently selected theme ID.
 * Defaults to "system" for terminal-native colors.
 */
export const themeIdAtom = atom<string>(DEFAULT_THEME_ID)

/**
 * User's mode preference: 'auto', 'dark', or 'light'.
 * 'auto' uses terminal detection when available.
 */
export const modePreferenceAtom = atom<ModePreference>('auto')

/**
 * The terminal's detected mode (dark or light).
 * null when detection hasn't run or isn't available.
 */
export const detectedModeAtom = atom<ThemeVariant | null>(null)

/**
 * The terminal's ANSI color palette.
 * Used by the system theme to render terminal-native colors.
 * Falls back to DEFAULT_ANSI_PALETTE when not detected.
 */
export const ansiPaletteAtom = atom<AnsiPalette>(DEFAULT_ANSI_PALETTE)

// =============================================================================
// Derived Atoms
// =============================================================================

/**
 * All available themes for the theme picker.
 */
export const availableThemesAtom = atom<ThemeDefinition[]>(() => {
  return getAllThemes()
})

/**
 * The current theme definition.
 * Falls back to default theme if selected theme ID is not found.
 */
export const currentThemeAtom = atom<ThemeDefinition>((get) => {
  const themeId = get(themeIdAtom)
  return getTheme(themeId) ?? BUILTIN_THEMES[DEFAULT_THEME_ID]
})

/**
 * The effective mode (dark or light) based on preference and detection.
 */
export const effectiveModeAtom = atom<ThemeVariant>((get) => {
  const preference = get(modePreferenceAtom)

  if (preference === 'dark' || preference === 'light') {
    return preference
  }

  // 'auto' - use detection or fall back to theme's default variant
  const detected = get(detectedModeAtom)
  if (detected !== null) {
    return detected
  }

  // No detection - use theme's default variant
  const theme = get(currentThemeAtom)
  return theme.variant
})

/**
 * Fully resolved colors for the current theme and mode.
 * All values are hex strings ready for use in components.
 */
export const resolvedColorsAtom = atom<ResolvedColors>((get) => {
  const theme = get(currentThemeAtom)
  const mode = get(effectiveModeAtom)
  const palette = get(ansiPaletteAtom)

  return resolveThemeColors(theme.json, mode, palette)
})

// =============================================================================
// Action Atoms
// =============================================================================

/**
 * Action atom to change the theme.
 */
export const setThemeAtom = atom(null, (_get, set, themeId: string) => {
  if (getTheme(themeId)) {
    set(themeIdAtom, themeId)
  } else {
    console.warn(`Unknown theme ID: "${themeId}", using default`)
    set(themeIdAtom, DEFAULT_THEME_ID)
  }
})

/**
 * Action atom to change the mode preference.
 */
export const setModePreferenceAtom = atom(
  null,
  (_get, set, preference: ModePreference) => {
    set(modePreferenceAtom, preference)
  },
)

/**
 * Action atom to update the detected mode from terminal detection.
 */
export const setDetectedModeAtom = atom(
  null,
  (_get, set, mode: ThemeVariant | null) => {
    set(detectedModeAtom, mode)
  },
)

/**
 * Action atom to update the ANSI palette from terminal detection.
 */
export const setAnsiPaletteAtom = atom(
  null,
  (_get, set, palette: AnsiPalette) => {
    set(ansiPaletteAtom, palette)
  },
)
