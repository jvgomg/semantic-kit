/**
 * Nord Theme
 *
 * A cool blue/cyan theme inspired by the arctic.
 * https://www.nordtheme.com/
 *
 * Adapted from OpenCode's Nord theme.
 * Supports both dark and light variants.
 * Only defines core colors - extended aliases are derived automatically.
 */

import type { ThemeDefinition, ThemeJson } from '../types.js'

export const NORD_THEME_JSON: ThemeJson = {
  defs: {
    // Nord Polar Night (dark backgrounds)
    nord0: '#2E3440',
    nord1: '#3B4252',
    nord2: '#434C5E',
    nord3: '#4C566A',

    // Nord Snow Storm (light backgrounds/text)
    nord4: '#D8DEE9',
    nord5: '#E5E9F0',
    nord6: '#ECEFF4',

    // Nord Frost (blue accents)
    nord7: '#8FBCBB', // Teal
    nord8: '#88C0D0', // Light blue
    nord9: '#81A1C1', // Blue
    nord10: '#5E81AC', // Dark blue

    // Nord Aurora (accent colors)
    nord11: '#BF616A', // Red
    nord12: '#D08770', // Orange
    nord13: '#EBCB8B', // Yellow
    nord14: '#A3BE8C', // Green
    nord15: '#B48EAD', // Purple

    // Custom muted color (OpenCode uses this for textMuted/comments)
    muted: '#8B95A7',
  },

  theme: {
    // UI Core (OpenCode: primary=nord8/nord10, secondary=nord9, accent=nord7)
    primary: { dark: 'nord8', light: 'nord10' },
    secondary: 'nord9',
    accent: 'nord7',

    // Text (OpenCode: text=nord6/nord0, textMuted=muted/nord1)
    text: { dark: 'nord6', light: 'nord0' },
    textMuted: { dark: 'muted', light: 'nord1' },

    // Backgrounds
    background: { dark: 'nord0', light: 'nord6' },
    backgroundPanel: { dark: 'nord1', light: 'nord5' },
    backgroundSelected: { dark: 'nord2', light: 'nord4' },

    // Borders (OpenCode: border=nord2/nord3, borderActive=nord3/nord2, borderSubtle=nord2/nord3)
    border: { dark: 'nord2', light: 'nord3' },
    borderActive: { dark: 'nord3', light: 'nord2' },
    borderSubtle: { dark: 'nord2', light: 'nord3' },
    borderSelected: 'nord13',

    // Status (OpenCode: warning=nord12)
    error: 'nord11',
    warning: 'nord12',
    success: 'nord14',
    info: { dark: 'nord8', light: 'nord10' },

    // Diff (OpenCode: diffHunkHeader=muted/nord3)
    diffAdded: 'nord14',
    diffRemoved: 'nord11',
    diffContext: { dark: 'muted', light: 'nord3' },
    diffHunkHeader: { dark: 'muted', light: 'nord3' },

    // Markdown (OpenCode: markdownHeading=nord8/nord10, markdownLink=nord9, markdownListItem=nord8/nord10)
    markdownHeading: { dark: 'nord8', light: 'nord10' },
    markdownLink: 'nord9',
    markdownCode: 'nord14',
    markdownBlockQuote: { dark: 'muted', light: 'nord3' },
    markdownList: { dark: 'nord8', light: 'nord10' },

    // Syntax Highlighting (OpenCode: syntaxComment=muted/nord3)
    syntaxComment: { dark: 'muted', light: 'nord3' },
    syntaxKeyword: 'nord9',
    syntaxFunction: 'nord8',
    syntaxString: 'nord14',
    syntaxNumber: 'nord15',
    syntaxType: 'nord7',
  },
}

export const NORD_THEME: ThemeDefinition = {
  id: 'nord',
  name: 'Nord',
  variant: 'dark',
  supportsBothModes: true,
  author: 'arcticicestudio',
  json: NORD_THEME_JSON,
}
