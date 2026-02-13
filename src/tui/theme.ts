/**
 * Theme System Re-exports
 *
 * All theme functionality is implemented in the theme/ directory.
 * This file provides convenient re-exports for component imports.
 */

// Types
export type {
  Base16Palette,
  ThemeDefinition,
  ThemeVariant,
} from './theme/base16.js'

export type {
  ThemeFamily,
  VariantPreference,
  ResolvedTheme,
} from './theme/registry.js'

export type { SemanticColors } from './theme/semantic.js'

export type { UseThemeResult } from './theme/hooks.js'

// Hooks (primary API for components)
export { useTheme, usePalette } from './theme/hooks.js'
export { useSemanticColors } from './theme/semantic.js'

// Atoms (for advanced usage)
export {
  themeFamilyIdAtom,
  variantPreferenceAtom,
  detectedVariantAtom,
  resolvedThemeAtom,
  currentPaletteAtom,
  setThemeFamilyAtom,
  setVariantPreferenceAtom,
  setDetectedVariantAtom,
} from './theme/atoms.js'

export { semanticColorsAtom } from './theme/semantic.js'

// Registry (for theme switching UI)
export {
  THEME_REGISTRY,
  getAllThemeFamilies,
  getThemeFamily,
} from './theme/registry.js'
