/**
 * Base16 Color Scheme Definitions
 *
 * This theme system uses color schemes from the tinted-theming project,
 * a community-maintained collection of Base16 color schemes.
 *
 * Upstream repository: https://github.com/tinted-theming/schemes
 * Base16 specification: https://github.com/tinted-theming/home
 *
 * ## Adding New Themes
 *
 * 1. Browse available schemes:
 *    https://github.com/tinted-theming/schemes/tree/spec-0.11/base16
 *
 * 2. Copy the YAML content for your chosen theme
 *
 * 3. Convert to ThemeDefinition format:
 *    - id: lowercase-kebab-case identifier
 *    - name: Display name from YAML "name" field
 *    - author: From YAML "author" field
 *    - variant: From YAML "variant" field ("dark" or "light")
 *    - palette: Map base00-base0F to hex strings (include # prefix)
 *
 * 4. Add to THEME_DEFINITIONS in this file
 *
 * 5. Create or update ThemeFamily in registry.ts
 *
 * ## License
 *
 * Individual color schemes retain their original authors' licenses.
 * The tinted-theming project is MIT licensed.
 */

/**
 * Base16 palette structure.
 *
 * Base16 defines 16 colors with specific semantic meanings:
 * - base00-base07: Background/foreground shades (grayscale-ish)
 * - base08-base0F: Accent colors for syntax/UI elements
 */
export interface Base16Palette {
  /** Default Background */
  base00: string
  /** Lighter Background (status bars, line numbers) */
  base01: string
  /** Selection Background */
  base02: string
  /** Comments, Invisibles, Line Highlighting */
  base03: string
  /** Dark Foreground (status bars) */
  base04: string
  /** Default Foreground */
  base05: string
  /** Light Foreground */
  base06: string
  /** Lightest Foreground */
  base07: string
  /** Variables, XML Tags, Markup Link Text, Lists, Diff Deleted */
  base08: string
  /** Integers, Boolean, Constants, Markup Link URL */
  base09: string
  /** Classes, Markup Bold, Search Background */
  base0A: string
  /** Strings, Inherited Class, Markup Code, Diff Inserted */
  base0B: string
  /** Support, Regular Expressions, Escape Characters */
  base0C: string
  /** Functions, Methods, Headings */
  base0D: string
  /** Keywords, Storage, Selector */
  base0E: string
  /** Deprecated, Embedded Language Tags */
  base0F: string
}

export type ThemeVariant = 'dark' | 'light'

export interface ThemeDefinition {
  /** Unique identifier (lowercase-kebab-case) */
  id: string
  /** Display name */
  name: string
  /** Original author */
  author: string
  /** Whether this is a dark or light theme */
  variant: ThemeVariant
  /** Base16 color palette */
  palette: Base16Palette
}

// =============================================================================
// Theme Definitions from tinted-theming/schemes
// =============================================================================

/**
 * Nord (Dark)
 * Source: https://github.com/tinted-theming/schemes/blob/spec-0.11/base16/nord.yaml
 */
const nordDark: ThemeDefinition = {
  id: 'nord-dark',
  name: 'Nord',
  author: 'arcticicestudio',
  variant: 'dark',
  palette: {
    base00: '#2E3440',
    base01: '#3B4252',
    base02: '#434C5E',
    base03: '#4C566A',
    base04: '#D8DEE9',
    base05: '#E5E9F0',
    base06: '#ECEFF4',
    base07: '#8FBCBB',
    base08: '#BF616A',
    base09: '#D08770',
    base0A: '#EBCB8B',
    base0B: '#A3BE8C',
    base0C: '#88C0D0',
    base0D: '#81A1C1',
    base0E: '#B48EAD',
    base0F: '#5E81AC',
  },
}

/**
 * Nord Light
 * Source: https://github.com/tinted-theming/schemes/blob/spec-0.11/base16/nord-light.yaml
 */
const nordLight: ThemeDefinition = {
  id: 'nord-light',
  name: 'Nord Light',
  author: "threddast, based on fuxialexander's doom-nord-light-theme (Doom Emacs)",
  variant: 'light',
  palette: {
    base00: '#e5e9f0',
    base01: '#c2d0e7',
    base02: '#b8c5db',
    base03: '#aebacf',
    base04: '#60728c',
    base05: '#2e3440',
    base06: '#3b4252',
    base07: '#29838d',
    base08: '#99324b',
    base09: '#ac4426',
    base0A: '#9a7500',
    base0B: '#4f894c',
    base0C: '#398eac',
    base0D: '#3b6ea8',
    base0E: '#97365b',
    base0F: '#5272af',
  },
}

/**
 * Twilight
 * Source: https://github.com/tinted-theming/schemes/blob/spec-0.11/base16/twilight.yaml
 */
const twilight: ThemeDefinition = {
  id: 'twilight',
  name: 'Twilight',
  author: 'David Hart (https://github.com/hartbit)',
  variant: 'dark',
  palette: {
    base00: '#1e1e1e',
    base01: '#323537',
    base02: '#464b50',
    base03: '#5f5a60',
    base04: '#838184',
    base05: '#a7a7a7',
    base06: '#c3c3c3',
    base07: '#ffffff',
    base08: '#cf6a4c',
    base09: '#cda869',
    base0A: '#f9ee98',
    base0B: '#8f9d6a',
    base0C: '#afc4db',
    base0D: '#7587a6',
    base0E: '#9b859d',
    base0F: '#9b703f',
  },
}

/**
 * Sakura
 * Source: https://github.com/tinted-theming/schemes/blob/spec-0.11/base16/sakura.yaml
 */
const sakura: ThemeDefinition = {
  id: 'sakura',
  name: 'Sakura',
  author: 'Misterio77 (http://github.com/Misterio77)',
  variant: 'light',
  palette: {
    base00: '#feedf3',
    base01: '#f8e2e7',
    base02: '#e0ccd1',
    base03: '#755f64',
    base04: '#665055',
    base05: '#564448',
    base06: '#42383a',
    base07: '#33292b',
    base08: '#df2d52',
    base09: '#f6661e',
    base0A: '#c29461',
    base0B: '#2e916d',
    base0C: '#1d8991',
    base0D: '#006e93',
    base0E: '#5e2180',
    base0F: '#ba0d35',
  },
}

/**
 * All theme definitions indexed by ID.
 */
export const THEME_DEFINITIONS: Record<string, ThemeDefinition> = {
  'nord-dark': nordDark,
  'nord-light': nordLight,
  twilight: twilight,
  sakura: sakura,
}
