# Theme System

This theme system is based on [OpenCode's theming approach](https://github.com/anomalyco/opencode).

## Overview

The theme system provides:

- **ANSI-first System Theme**: Uses terminal palette colors (indices 0-15) for seamless integration with any terminal color scheme
- **Built-in Themes**: Dracula, Nord, and Tokyo Night with full semantic color support
- **Dark/Light Mode Support**: Themes can support both modes with automatic switching
- **Minimal Core Colors**: 28 semantic colors derived from OpenCode's design

## Quick Start

```typescript
import { useSemanticColors, useTheme } from './theme/hooks.js'

function MyComponent() {
  const colors = useSemanticColors()

  return (
    <text fg={colors.primary}>Primary colored text</text>
    <text fg={colors.textMuted}>Muted text</text>
    <text fg={colors.error}>Error message</text>
  )
}

function ThemeSwitcher() {
  const { theme, availableThemes, setTheme, mode, setModePreference } = useTheme()

  return (
    <box>
      <text>Current: {theme.name} ({mode})</text>
      {/* Theme switching UI */}
    </box>
  )
}
```

## File Structure

```
theme/
  types.ts              # TypeScript interfaces, color keys
  colors.ts             # Color resolution logic (ANSI → hex)
  system-theme.ts       # ANSI-first default theme
  themes/               # Built-in themes
    index.ts            # Theme registry
    dracula.ts          # Dracula theme
    nord.ts             # Nord theme
    tokyo-night.ts      # Tokyo Night theme
  atoms.ts              # Jotai atoms
  hooks.ts              # React hooks
  demo.tsx              # Demo component
  index.ts              # Main exports
  README.md             # This file
```

## Color Value Types

Theme colors can be specified as:

| Type | Example | Description |
|------|---------|-------------|
| `"none"` | `"none"` | Transparent |
| Hex | `"#FF0000"` | Direct hex color |
| ANSI Index | `4` | Terminal palette color (0-15) |
| Reference | `"blue"` | Reference to a def or theme property |
| Variant | `{ dark: "#fff", light: "#000" }` | Mode-specific colors |

## Core Semantic Colors (28)

These are all the color properties available. There are no aliases - components use these names directly.

### UI Core
`primary`, `secondary`, `accent`

### Text
`text`, `textMuted`

### Backgrounds
`background`, `backgroundPanel`, `backgroundSelected`

### Borders
`border`, `borderActive`, `borderSubtle`, `borderSelected`

### Status
`error`, `warning`, `success`, `info`

### Diff
`diffAdded`, `diffRemoved`, `diffContext`, `diffHunkHeader`

### Markdown
`markdownHeading`, `markdownLink`, `markdownCode`, `markdownBlockQuote`, `markdownList`

### Syntax Highlighting
`syntaxComment`, `syntaxKeyword`, `syntaxFunction`, `syntaxString`, `syntaxNumber`, `syntaxType`

## Adding a New Built-in Theme

1. Create a new file in `themes/` (e.g., `themes/my-theme.ts`)
2. Define all 28 core colors in the theme JSON
3. Export a `ThemeDefinition` object
4. Register it in `themes/index.ts`

Example theme structure:

```typescript
import type { ThemeDefinition, ThemeJson } from '../types.js'

export const MY_THEME_JSON: ThemeJson = {
  defs: {
    bg: '#1a1a1a',
    fg: '#ffffff',
    blue: '#0066cc',
    // ... more color definitions
  },
  theme: {
    primary: 'blue',
    text: 'fg',
    background: 'bg',
    // ... map all 28 core colors
  },
}

export const MY_THEME: ThemeDefinition = {
  id: 'my-theme',
  name: 'My Theme',
  variant: 'dark',
  supportsBothModes: false,
  author: 'Your Name',
  json: MY_THEME_JSON,
}
```

## Modal Overlay

Modals use RGBA opacity overlays (following OpenCode's approach) rather than semantic color dimming:

```typescript
import { RGBA } from '@opentui/core'
import { useSemanticColors } from './theme/hooks.js'

function Modal({ children, onClose }) {
  const colors = useSemanticColors()

  return (
    <box
      position="absolute"
      backgroundColor={RGBA.fromInts(0, 0, 0, 150)} // ~59% opacity black overlay
      onMouseUp={() => onClose?.()}
    >
      <box
        backgroundColor={colors.backgroundPanel}
        onMouseUp={(e) => e.stopPropagation()}
      >
        {children}
      </box>
    </box>
  )
}
```

This approach:
- Works naturally with any theme (overlay is always semi-transparent black)
- Supports click-to-dismiss on the overlay
- Integrates seamlessly with system theme detection

## Hook API Reference

### `useSemanticColors()`

Returns all resolved colors as hex strings.

```typescript
const colors = useSemanticColors()
// colors.primary, colors.text, colors.error, etc.
```

### `useTheme()`

Returns theme state and controls for theme switching UI.

```typescript
const {
  theme,           // Current ThemeDefinition
  themeId,         // Current theme ID string
  mode,            // Effective mode ('dark' | 'light')
  availableThemes, // All ThemeDefinition[]
  setTheme,        // (themeId: string) => void
  setModePreference, // (pref: 'auto' | 'dark' | 'light') => void
} = useTheme()
```

## Attribution

This theme system is based on [OpenCode's theming approach](https://github.com/anomalyco/opencode).

Key reference files from OpenCode:
- Theme types: `packages/opencode/src/cli/cmd/tui/context/theme.tsx`
- Built-in themes: `packages/opencode/src/cli/cmd/tui/context/theme/*.json`
