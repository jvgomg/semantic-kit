/**
 * Tokyo Night Theme
 *
 * A modern dark theme with blue accents inspired by Tokyo's night lights.
 * https://github.com/enkia/tokyo-night-vscode-theme
 *
 * Adapted from OpenCode's Tokyo Night theme (Moon variant).
 * Supports both dark and light variants.
 * Only defines core colors - extended aliases are derived automatically.
 */

import type { ThemeDefinition, ThemeJson } from '../types.js'

export const TOKYO_NIGHT_THEME_JSON: ThemeJson = {
  defs: {
    // Dark mode colors (Moon variant - from OpenCode)
    // Step system for background shades
    darkStep1: '#1a1b26', // background
    darkStep2: '#1e2030', // backgroundPanel
    darkStep3: '#222436', // backgroundElement
    darkStep6: '#545c7e', // borderSubtle
    darkStep7: '#737aa2', // border
    darkStep8: '#9099b2', // borderActive
    darkStep9: '#82aaff', // primary (blue)
    darkStep11: '#828bb8', // textMuted
    darkStep12: '#c8d3f5', // text

    // Dark accent colors (OpenCode Moon variant)
    darkRed: '#ff757f',
    darkOrange: '#ff966c',
    darkYellow: '#ffc777',
    darkGreen: '#c3e88d',
    darkCyan: '#86e1fc',
    darkPurple: '#c099ff',

    // Light mode colors (Day variant - from OpenCode)
    lightStep1: '#e1e2e7', // background
    lightStep2: '#d5d6db', // backgroundPanel
    lightStep3: '#c8c9ce', // backgroundElement
    lightStep6: '#9699a8', // borderSubtle
    lightStep7: '#737a8c', // border
    lightStep8: '#5a607d', // borderActive
    lightStep9: '#2e7de9', // primary (blue)
    lightStep11: '#8990a3', // textMuted
    lightStep12: '#3760bf', // text

    // Light accent colors (Day variant)
    lightRed: '#f52a65',
    lightOrange: '#b15c00',
    lightYellow: '#8c6c3e',
    lightGreen: '#587539',
    lightCyan: '#007197',
    lightPurple: '#9854f1',
  },

  theme: {
    // UI Core (OpenCode: primary=step9, secondary=purple, accent=orange)
    primary: { dark: 'darkStep9', light: 'lightStep9' },
    secondary: { dark: 'darkPurple', light: 'lightPurple' },
    accent: { dark: 'darkOrange', light: 'lightOrange' },

    // Text (OpenCode: text=step12, textMuted=step11)
    text: { dark: 'darkStep12', light: 'lightStep12' },
    textMuted: { dark: 'darkStep11', light: 'lightStep11' },

    // Backgrounds (OpenCode: step1, step2, step3)
    background: { dark: 'darkStep1', light: 'lightStep1' },
    backgroundPanel: { dark: 'darkStep2', light: 'lightStep2' },
    backgroundSelected: { dark: 'darkStep3', light: 'lightStep3' },

    // Borders (OpenCode: border=step7, borderActive=step8, borderSubtle=step6)
    border: { dark: 'darkStep7', light: 'lightStep7' },
    borderActive: { dark: 'darkStep8', light: 'lightStep8' },
    borderSubtle: { dark: 'darkStep6', light: 'lightStep6' },
    borderSelected: { dark: 'darkYellow', light: 'lightYellow' },

    // Status (OpenCode: info=step9)
    error: { dark: 'darkRed', light: 'lightRed' },
    warning: { dark: 'darkOrange', light: 'lightOrange' },
    success: { dark: 'darkGreen', light: 'lightGreen' },
    info: { dark: 'darkStep9', light: 'lightStep9' },

    // Diff (OpenCode has specific diff colors)
    diffAdded: { dark: '#4fd6be', light: '#1e725c' },
    diffRemoved: { dark: '#c53b53', light: '#c53b53' },
    diffContext: { dark: 'darkStep11', light: '#7086b5' },
    diffHunkHeader: { dark: 'darkStep11', light: '#7086b5' },

    // Markdown (OpenCode: heading=purple, link=step9, blockQuote=yellow, listItem=step9)
    markdownHeading: { dark: 'darkPurple', light: 'lightPurple' },
    markdownLink: { dark: 'darkStep9', light: 'lightStep9' },
    markdownCode: { dark: 'darkGreen', light: 'lightGreen' },
    markdownBlockQuote: { dark: 'darkYellow', light: 'lightYellow' },
    markdownList: { dark: 'darkStep9', light: 'lightStep9' },

    // Syntax Highlighting (OpenCode: comment=step11, type=yellow)
    syntaxComment: { dark: 'darkStep11', light: 'lightStep11' },
    syntaxKeyword: { dark: 'darkPurple', light: 'lightPurple' },
    syntaxFunction: { dark: 'darkStep9', light: 'lightStep9' },
    syntaxString: { dark: 'darkGreen', light: 'lightGreen' },
    syntaxNumber: { dark: 'darkOrange', light: 'lightOrange' },
    syntaxType: { dark: 'darkYellow', light: 'lightYellow' },
  },
}

export const TOKYO_NIGHT_THEME: ThemeDefinition = {
  id: 'tokyo-night',
  name: 'Tokyo Night',
  variant: 'dark',
  supportsBothModes: true,
  author: 'enkia',
  json: TOKYO_NIGHT_THEME_JSON,
}
