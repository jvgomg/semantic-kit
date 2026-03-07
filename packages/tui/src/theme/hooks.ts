/**
 * Theme Hooks
 *
 * React hooks for accessing and modifying theme state.
 */

import { useAtomValue, useSetAtom } from 'jotai'
import {
  themeIdAtom,
  effectiveModeAtom,
  currentThemeAtom,
  availableThemesAtom,
  resolvedColorsAtom,
  setThemeAtom,
  setModePreferenceAtom,
} from './atoms.js'
import type {
  ThemeDefinition,
  ThemeVariant,
  ModePreference,
  ResolvedColors,
} from './types.js'

// =============================================================================
// Primary Hooks
// =============================================================================

/**
 * Hook for accessing semantic colors in components.
 *
 * This is the primary hook for getting colors - use this in most components.
 *
 * @example
 * function MyComponent() {
 *   const colors = useSemanticColors()
 *   return (
 *     <text fg={colors.accent}>Accented text</text>
 *   )
 * }
 */
export function useSemanticColors(): ResolvedColors {
  return useAtomValue(resolvedColorsAtom)
}

/**
 * Return type for the useTheme hook.
 */
export interface UseThemeResult {
  /** Current theme definition */
  theme: ThemeDefinition
  /** Current theme ID */
  themeId: string
  /** Current effective mode (dark or light) */
  mode: ThemeVariant
  /** All available themes */
  availableThemes: ThemeDefinition[]
  /** Change the current theme */
  setTheme: (themeId: string) => void
  /** Change the mode preference */
  setModePreference: (preference: ModePreference) => void
}

/**
 * Hook for accessing and modifying the current theme.
 *
 * @example
 * function ThemePicker() {
 *   const { theme, availableThemes, setTheme, mode, setModePreference } = useTheme()
 *
 *   return (
 *     <box>
 *       <text>Current theme: {theme.name}</text>
 *       <text>Mode: {mode}</text>
 *     </box>
 *   )
 * }
 */
export function useTheme(): UseThemeResult {
  const theme = useAtomValue(currentThemeAtom)
  const themeId = useAtomValue(themeIdAtom)
  const mode = useAtomValue(effectiveModeAtom)
  const availableThemes = useAtomValue(availableThemesAtom)
  const setTheme = useSetAtom(setThemeAtom)
  const setModePreference = useSetAtom(setModePreferenceAtom)

  return {
    theme,
    themeId,
    mode,
    availableThemes,
    setTheme,
    setModePreference,
  }
}

/**
 * Hook for read-only access to the current resolved colors.
 * Use this when you need all colors but don't need theme switching controls.
 *
 * Note: This returns the same colors regardless of dimmed context.
 * For context-aware colors, use useSemanticColors() instead.
 *
 * @example
 * function MyComponent() {
 *   const colors = useColors()
 *   return <text fg={colors.primary}>Primary colored text</text>
 * }
 */
export function useColors(): ResolvedColors {
  return useAtomValue(resolvedColorsAtom)
}
