/**
 * Semantic Color Mappings
 *
 * Maps Base16 palette colors to semantic UI roles.
 * This provides a stable API for components while allowing
 * the underlying colors to change based on theme.
 */

import { atom, useAtomValue  } from 'jotai'
import { currentPaletteAtom } from './atoms.js'

/**
 * Semantic color roles for the TUI.
 */
export interface SemanticColors {
  // ---------------------------------------------------------------------------
  // Primary Roles
  // ---------------------------------------------------------------------------

  /** Primary accent color - used for focus indicators and active elements */
  accent: string
  /** Muted/secondary color - used for inactive elements and hints */
  muted: string
  /** Primary text color */
  text: string
  /** Highlight color for keyboard shortcuts and important callouts */
  highlight: string

  // ---------------------------------------------------------------------------
  // Component-Specific
  // ---------------------------------------------------------------------------

  /** Border color when a region has keyboard focus */
  borderFocused: string
  /** Border color when a region does not have focus */
  borderUnfocused: string
  /** Text color for the currently selected item */
  textSelected: string
  /** Background color for the currently selected item */
  backgroundSelected: string
  /** Text color for hint/help text */
  textHint: string
  /** Text color for keyboard shortcut indicators */
  textShortcut: string

  // ---------------------------------------------------------------------------
  // Modal/Overlay
  // ---------------------------------------------------------------------------

  /** Background color for modal overlays */
  modalBackground: string
  /** Background color for selected items within modals */
  modalBackgroundSelected: string
  /** Border color for modal dialogs */
  modalBorder: string
  /** Title text color in modals */
  modalTitle: string

  // ---------------------------------------------------------------------------
  // Data Visualization / Status
  // ---------------------------------------------------------------------------

  /** Success state color */
  success: string
  /** Error state color */
  error: string
  /** Warning state color */
  warning: string
  /** Info state color */
  info: string
}

/**
 * Derived atom that maps the current Base16 palette to semantic colors.
 *
 * Mapping strategy:
 * - base00: Default background
 * - base02: Selection background
 * - base03: Muted text (comments)
 * - base05: Default foreground
 * - base08: Errors/deleted (variables in Base16)
 * - base09: Constants → not commonly used
 * - base0A: Classes/bold → highlight/warning
 * - base0B: Strings/inserted → success
 * - base0C: Support → info/cyan
 * - base0D: Functions → accent/primary
 * - base0E: Keywords → secondary accent
 * - base0F: Deprecated → not commonly used
 */
export const semanticColorsAtom = atom<SemanticColors>((get) => {
  const p = get(currentPaletteAtom)

  return {
    // Primary roles
    accent: p.base0D, // Functions/methods → primary accent
    muted: p.base03, // Comments → muted text
    text: p.base05, // Default foreground
    highlight: p.base0A, // Classes/bold → highlight

    // Borders
    borderFocused: p.base0D, // Accent for focused
    borderUnfocused: p.base03, // Muted for unfocused

    // Selection
    textSelected: p.base0D, // Accent color for selected text
    backgroundSelected: p.base02, // Selection background

    // Hints/shortcuts
    textHint: p.base03, // Muted for hints
    textShortcut: p.base0A, // Highlight for shortcuts

    // Modal
    modalBackground: p.base00, // Default background
    modalBackgroundSelected: p.base02, // Selection background
    modalBorder: p.base0D, // Accent for modal borders
    modalTitle: p.base0D, // Accent for modal titles

    // Data visualization / status
    success: p.base0B, // Strings/inserted → green
    error: p.base08, // Variables/deleted → red
    warning: p.base0A, // Classes/bold → yellow
    info: p.base0C, // Support → cyan
  }
})

/**
 * Hook for accessing semantic colors in components.
 *
 * @example
 * function MyComponent() {
 *   const colors = useSemanticColors()
 *   return (
 *     <text fg={colors.accent}>Accented text</text>
 *   )
 * }
 */
export function useSemanticColors(): SemanticColors {
  return useAtomValue(semanticColorsAtom)
}
