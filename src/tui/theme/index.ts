/**
 * semantic-kit TUI Theme System
 *
 * Uses Base16 color schemes from the tinted-theming project.
 * https://github.com/tinted-theming/schemes
 *
 * ## Quick Start
 *
 * ```typescript
 * // In a component - reactive to theme changes
 * const { palette, variant } = useTheme()
 * const colors = useSemanticColors()
 *
 * // For semantic color roles (recommended)
 * <text fg={colors.accent}>Accented text</text>
 *
 * // For direct palette access (when semantic doesn't fit)
 * <text fg={palette.base0B}>Success color</text>
 * ```
 *
 * ## Architecture
 *
 * - `base16.ts` - Type definitions and hardcoded theme data
 * - `registry.ts` - Theme family grouping and resolution logic
 * - `atoms.ts` - Jotai state atoms for theme settings
 * - `hooks.ts` - React hooks for component access
 * - `semantic.ts` - Maps Base16 to semantic UI roles
 *
 * @module
 */

// Base16 types and definitions
export {
  type Base16Palette,
  type ThemeDefinition,
  type ThemeVariant,
  THEME_DEFINITIONS,
} from './base16.js'

// Registry and resolution
export {
  type ThemeFamily,
  type ThemeRegistry,
  type VariantPreference,
  type ResolvedTheme,
  THEME_REGISTRY,
  getThemeFamily,
  getDefaultThemeFamily,
  getAllThemeFamilies,
  resolveTheme,
} from './registry.js'

// Jotai atoms
export {
  themeFamilyIdAtom,
  variantPreferenceAtom,
  detectedVariantAtom,
  resolvedThemeAtom,
  currentPaletteAtom,
  setThemeFamilyAtom,
  setVariantPreferenceAtom,
  setDetectedVariantAtom,
} from './atoms.js'

// React hooks
export { useTheme, usePalette, type UseThemeResult } from './hooks.js'

// Semantic colors
export {
  type SemanticColors,
  semanticColorsAtom,
  useSemanticColors,
} from './semantic.js'
