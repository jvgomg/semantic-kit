/**
 * Dracula Theme
 *
 * A dark theme with purple/pink accents inspired by Dracula.
 * https://draculatheme.com/
 *
 * Adapted from OpenCode's Dracula theme.
 * Only defines core colors - extended aliases are derived automatically.
 */

import type { ThemeDefinition, ThemeJson } from '../types.js'

export const DRACULA_THEME_JSON: ThemeJson = {
  defs: {
    // Dracula palette (from OpenCode)
    background: '#282a36',
    currentLine: '#44475a',
    foreground: '#f8f8f2',
    comment: '#6272a4',
    cyan: '#8be9fd',
    green: '#50fa7b',
    orange: '#ffb86c',
    pink: '#ff79c6',
    purple: '#bd93f9',
    red: '#ff5555',
    yellow: '#f1fa8c',

    // Additional definitions needed
    bgPanel: '#21222c',
    borderSubtleDark: '#191a21',
  },

  theme: {
    // UI Core
    primary: 'purple',
    secondary: 'pink',
    accent: 'cyan',

    // Text
    text: { dark: 'foreground', light: '#282a36' },
    textMuted: { dark: 'comment', light: '#6272a4' },

    // Backgrounds
    background: { dark: 'background', light: '#f8f8f2' },
    backgroundPanel: { dark: 'bgPanel', light: '#e8e8e2' },
    backgroundSelected: { dark: 'currentLine', light: '#d8d8d2' },

    // Borders (OpenCode uses currentLine for border)
    border: { dark: 'currentLine', light: '#c8c8c2' },
    borderActive: 'purple',
    borderSubtle: { dark: 'borderSubtleDark', light: '#e0e0e0' },
    borderSelected: 'pink',

    // Status (OpenCode uses orange for info)
    error: 'red',
    warning: 'yellow',
    success: 'green',
    info: 'orange',

    // Diff (OpenCode uses comment for diffHunkHeader)
    diffAdded: 'green',
    diffRemoved: 'red',
    diffContext: { dark: 'comment', light: '#6272a4' },
    diffHunkHeader: { dark: 'comment', light: '#6272a4' },

    // Markdown (OpenCode uses purple for markdownListItem)
    markdownHeading: 'purple',
    markdownLink: 'cyan',
    markdownCode: 'green',
    markdownBlockQuote: { dark: 'comment', light: '#6272a4' },
    markdownList: 'purple',

    // Syntax Highlighting
    syntaxComment: { dark: 'comment', light: '#6272a4' },
    syntaxKeyword: 'pink',
    syntaxFunction: 'green',
    syntaxString: 'yellow',
    syntaxNumber: 'purple',
    syntaxType: 'cyan',
  },
}

export const DRACULA_THEME: ThemeDefinition = {
  id: 'dracula',
  name: 'Dracula',
  variant: 'dark',
  supportsBothModes: true,
  author: 'Zeno Rocha',
  json: DRACULA_THEME_JSON,
}
