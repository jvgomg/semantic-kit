/**
 * Semantic Color Mappings
 *
 * Maps Base16 palette colors to semantic UI roles.
 * This provides a stable API for components while allowing
 * the underlying colors to change based on theme.
 */

import { atom, useAtomValue } from 'jotai'
import { currentPaletteAtom } from './atoms.js'

/**
 * Semantic color roles for the TUI.
 */
export interface SemanticColors {
  // ---------------------------------------------------------------------------
  // Text Hierarchy
  // ---------------------------------------------------------------------------

  /** Primary text color for main content */
  text: string
  /** Secondary text for less prominent but still readable content */
  textSecondary: string
  /** Muted text for comments, timestamps, low-priority info */
  textMuted: string
  /** Disabled text for inactive elements */
  textDisabled: string

  // ---------------------------------------------------------------------------
  // Text - Interactive
  // ---------------------------------------------------------------------------

  /** Link text color */
  textLink: string
  /** Muted link text (links in muted context) */
  textLinkMuted: string
  /** Selected item text color */
  textSelected: string
  /** Keyboard shortcut text */
  textShortcut: string
  /** Text color for hint/help text */
  textHint: string

  // ---------------------------------------------------------------------------
  // Text - Status
  // ---------------------------------------------------------------------------

  /** Success status text */
  textSuccess: string
  /** Error status text */
  textError: string
  /** Warning status text */
  textWarning: string
  /** Info status text */
  textInfo: string

  // ---------------------------------------------------------------------------
  // Backgrounds
  // ---------------------------------------------------------------------------

  /** Base background color */
  background: string
  /** Elevated/raised background (cards, modals) */
  backgroundElevated: string
  /** Selected item background */
  backgroundSelected: string
  /** Hover state background */
  backgroundHover: string

  // ---------------------------------------------------------------------------
  // Borders
  // ---------------------------------------------------------------------------

  /** Border color when a region has keyboard focus */
  borderFocused: string
  /** Border color when a region does not have focus */
  borderUnfocused: string
  /** Border color for selected/active items */
  borderSelected: string
  /** Subtle border for structural elements */
  borderSubtle: string

  // ---------------------------------------------------------------------------
  // Decorative (low contrast intentional)
  // ---------------------------------------------------------------------------

  /** Divider lines between sections */
  divider: string
  /** Tree view guide lines */
  treeGuide: string
  /** Indentation guides */
  indent: string

  // ---------------------------------------------------------------------------
  // Accents
  // ---------------------------------------------------------------------------

  /** Primary accent color - used for focus indicators and active elements */
  accent: string
  /** Highlight color for keyboard shortcuts and important callouts */
  highlight: string
  /** @deprecated Use textMuted instead */
  muted: string

  // ---------------------------------------------------------------------------
  // Severity Colors
  // ---------------------------------------------------------------------------

  /** Critical severity (highest) */
  severityCritical: string
  /** Error severity */
  severityError: string
  /** Warning severity */
  severityWarning: string
  /** Info severity */
  severityInfo: string
  /** Success severity */
  severitySuccess: string
  /** Muted/low severity */
  severityMuted: string

  // ---------------------------------------------------------------------------
  // Data Visualization / Status (legacy, prefer severity* or text*)
  // ---------------------------------------------------------------------------

  /** Success state color */
  success: string
  /** Error state color */
  error: string
  /** Warning state color */
  warning: string
  /** Info state color */
  info: string

  // ---------------------------------------------------------------------------
  // Markdown/Content
  // ---------------------------------------------------------------------------

  /** Markdown heading color */
  markdownHeading: string
  /** Markdown heading 1 color (for special treatment) */
  markdownHeading1: string
  /** Markdown code/raw text color */
  markdownCode: string
  /** Markdown list marker color */
  markdownList: string
  /** Markdown quote color */
  markdownQuote: string
  /** Markdown link color */
  markdownLink: string

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
    // Text hierarchy
    text: p.base05, // Primary content
    textSecondary: p.base04, // Less prominent, readable
    textMuted: p.base03, // Comments, timestamps
    textDisabled: p.base03, // Inactive elements

    // Text - interactive
    textLink: p.base0D, // Clickable references
    textLinkMuted: p.base03, // Links in muted context
    textSelected: p.base0D, // Selected item text
    textShortcut: p.base0A, // Keyboard shortcuts
    textHint: p.base03, // Hint/help text

    // Text - status
    textSuccess: p.base0B, // Success
    textError: p.base08, // Error
    textWarning: p.base0A, // Warning
    textInfo: p.base0C, // Info

    // Backgrounds
    background: p.base00, // Base background
    backgroundElevated: p.base01, // Cards, modals
    backgroundSelected: p.base02, // Selection
    backgroundHover: p.base01, // Hover state

    // Borders
    borderFocused: p.base0D, // Focused
    borderUnfocused: p.base03, // Unfocused
    borderSelected: p.base0A, // Selected/active
    borderSubtle: p.base02, // Structural

    // Decorative (low contrast intentional)
    divider: p.base02, // Section dividers
    treeGuide: p.base02, // Tree view lines
    indent: p.base02, // Indentation guides

    // Accents
    accent: p.base0D, // Primary accent
    highlight: p.base0A, // Highlight/attention
    muted: p.base03, // @deprecated: use textMuted

    // Severity colors
    severityCritical: p.base08, // Red
    severityError: p.base08, // Red
    severityWarning: p.base0A, // Yellow
    severityInfo: p.base0D, // Blue
    severitySuccess: p.base0B, // Green
    severityMuted: p.base03, // Gray

    // Data visualization / status (legacy)
    success: p.base0B, // Green
    error: p.base08, // Red
    warning: p.base0A, // Yellow
    info: p.base0C, // Cyan

    // Markdown/content
    markdownHeading: p.base0D, // Headings
    markdownHeading1: p.base0C, // H1 special treatment
    markdownCode: p.base0B, // Code/raw
    markdownList: p.base0A, // List markers
    markdownQuote: p.base03, // Block quotes
    markdownLink: p.base0D, // Links

    // Modal
    modalBackground: p.base00, // Background
    modalBackgroundSelected: p.base02, // Selected
    modalBorder: p.base0D, // Border
    modalTitle: p.base0D, // Title
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

/**
 * Severity level type for color mapping.
 */
export type SeverityLevel =
  | 'critical'
  | 'error'
  | 'warning'
  | 'info'
  | 'success'
  | 'muted'

/**
 * Get severity color for a given severity level.
 *
 * @example
 * const colors = useSemanticColors()
 * const color = getSeverityColor(colors, 'error')
 */
export function getSeverityColor(
  colors: SemanticColors,
  severity?: SeverityLevel,
): string {
  switch (severity) {
    case 'critical':
      return colors.severityCritical
    case 'error':
      return colors.severityError
    case 'warning':
      return colors.severityWarning
    case 'info':
      return colors.severityInfo
    case 'success':
      return colors.severitySuccess
    case 'muted':
      return colors.severityMuted
    default:
      return colors.text
  }
}
