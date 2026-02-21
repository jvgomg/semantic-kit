/**
 * System Theme
 *
 * An ANSI-first theme that uses terminal palette colors (indices 0-15).
 * This theme adapts to whatever color scheme the user has configured in their terminal.
 *
 * Based on OpenCode's system theme approach.
 * Reference: https://github.com/anomalyco/opencode
 */

import { ANSI } from './colors.js'
import type { ThemeDefinition, ThemeJson } from './types.js'

/**
 * System theme JSON definition using ANSI color indices.
 *
 * This theme uses the terminal's native 16-color palette, allowing it to
 * automatically adapt to whatever color scheme the user has configured.
 *
 * Only defines core colors - extended aliases are derived automatically.
 */
export const SYSTEM_THEME_JSON: ThemeJson = {
  defs: {
    // Background shades
    bg: 'none', // Transparent - use terminal background
    bgPanel: ANSI.BLACK,
    bgSelected: ANSI.BRIGHT_BLACK,

    // Foreground shades
    fg: ANSI.BRIGHT_WHITE,
    fgMuted: ANSI.WHITE,
    fgDim: ANSI.BRIGHT_BLACK,

    // Accent colors
    blue: ANSI.BLUE,
    red: ANSI.RED,
    green: ANSI.GREEN,
    yellow: ANSI.YELLOW,
    cyan: ANSI.CYAN,
    magenta: ANSI.MAGENTA,
  },

  theme: {
    // UI Core
    primary: 'blue',
    secondary: 'magenta',
    accent: 'cyan',

    // Text
    text: 'fg',
    textMuted: 'fgMuted',

    // Backgrounds
    background: 'bg',
    backgroundPanel: 'bgPanel',
    backgroundSelected: 'bgSelected',

    // Borders
    border: 'fgMuted',
    borderActive: 'blue',
    borderSubtle: 'fgDim',
    borderSelected: 'yellow',

    // Status
    error: 'red',
    warning: 'yellow',
    success: 'green',
    info: 'cyan',

    // Diff
    diffAdded: 'green',
    diffRemoved: 'red',
    diffContext: 'fgMuted',
    diffHunkHeader: 'cyan',

    // Markdown
    markdownHeading: 'blue',
    markdownLink: 'blue',
    markdownCode: 'green',
    markdownBlockQuote: 'fgDim',
    markdownList: 'yellow',

    // Syntax Highlighting
    syntaxComment: 'fgDim',
    syntaxKeyword: 'magenta',
    syntaxFunction: 'blue',
    syntaxString: 'green',
    syntaxNumber: 'yellow',
    syntaxType: 'cyan',
  },
}

/**
 * System theme definition.
 */
export const SYSTEM_THEME: ThemeDefinition = {
  id: 'system',
  name: 'System',
  variant: 'dark', // Adapts based on terminal
  supportsBothModes: true,
  author: 'semantic-kit',
  json: SYSTEM_THEME_JSON,
}
