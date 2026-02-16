/**
 * Theme Hooks
 *
 * React hooks for accessing and modifying theme state.
 */

import { useAtomValue, useSetAtom } from 'jotai'
import {
  currentPaletteAtom,
  resolvedThemeAtom,
  setThemeFamilyAtom,
  setVariantPreferenceAtom,
} from './atoms.js'
import type { Base16Palette, ThemeVariant } from './base16.js'
import type { ThemeFamily, VariantPreference } from './registry.js'

/**
 * Return type for the useTheme hook.
 */
export interface UseThemeResult {
  /** Current theme family */
  family: ThemeFamily
  /** Current resolved variant (what's actually being used) */
  variant: ThemeVariant
  /** Current Base16 color palette */
  palette: Base16Palette
  /** Change the theme family */
  setFamily: (familyId: string) => void
  /** Change the variant preference */
  setVariantPreference: (preference: VariantPreference) => void
}

/**
 * Hook for accessing and modifying the current theme.
 *
 * @example
 * function MyComponent() {
 *   const { palette, variant, setFamily } = useTheme()
 *
 *   return (
 *     <text fg={palette.base0D}>
 *       Current variant: {variant}
 *     </text>
 *   )
 * }
 */
export function useTheme(): UseThemeResult {
  const resolved = useAtomValue(resolvedThemeAtom)
  const palette = useAtomValue(currentPaletteAtom)
  const setFamily = useSetAtom(setThemeFamilyAtom)
  const setVariantPreference = useSetAtom(setVariantPreferenceAtom)

  return {
    family: resolved.family,
    variant: resolved.variant,
    palette,
    setFamily,
    setVariantPreference,
  }
}

/**
 * Hook for read-only access to the current palette.
 * Use this when you only need colors and don't need to modify the theme.
 *
 * @example
 * function MyComponent() {
 *   const palette = usePalette()
 *   return <text fg={palette.base0B}>Success!</text>
 * }
 */
export function usePalette(): Base16Palette {
  return useAtomValue(currentPaletteAtom)
}
