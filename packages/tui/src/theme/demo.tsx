/**
 * Theme System Demo Component
 *
 * A demonstration component showing all semantic colors and theme switching.
 * Import this into App.tsx temporarily to verify the theme system works.
 *
 * @example
 * // In App.tsx
 * import { ThemeDemo } from './theme/demo.js'
 *
 * function App() {
 *   return <ThemeDemo />
 * }
 */

import type { ReactNode } from 'react'
import { useTheme, useSemanticColors, useColorMode } from './hooks.js'
import { ColorModeProvider } from './provider.js'
import type { ResolvedColors } from './types.js'

/**
 * Demo component showing all theme colors.
 */
export function ThemeDemo() {
  const { theme, mode, availableThemes } = useTheme()
  const colors = useSemanticColors()
  const colorMode = useColorMode()

  return (
    <box flexDirection="column" padding={1} gap={1}>
      {/* Header */}
      <box flexDirection="column">
        <text fg={colors.primary}>Theme System Demo</text>
        <text fg={colors.textMuted}>
          Current: {theme.name} ({mode} mode, {colorMode} context)
        </text>
      </box>

      {/* Theme Selector */}
      <box flexDirection="column" gap={0}>
        <text fg={colors.textMuted}>Available themes:</text>
        <box flexDirection="row" gap={2}>
          {availableThemes.map((t) => (
            <text
              key={t.id}
              fg={t.id === theme.id ? colors.primary : colors.text}
            >
              {t.id === theme.id ? `[${t.name}]` : t.name}
            </text>
          ))}
        </box>
      </box>

      {/* Color Categories */}
      <box flexDirection="column" gap={1}>
        {/* UI Core */}
        <ColorSection title="UI Core" colors={colors}>
          <ColorSwatch label="primary" color={colors.primary} />
          <ColorSwatch label="secondary" color={colors.secondary} />
          <ColorSwatch label="accent" color={colors.accent} />
        </ColorSection>

        {/* Text */}
        <ColorSection title="Text" colors={colors}>
          <ColorSwatch label="text" color={colors.text} />
          <ColorSwatch label="textMuted" color={colors.textMuted} />
        </ColorSection>

        {/* Backgrounds */}
        <ColorSection title="Backgrounds" colors={colors}>
          <ColorSwatch
            label="background"
            color={colors.background}
            showBg
            fg={colors.text}
          />
          <ColorSwatch
            label="backgroundPanel"
            color={colors.backgroundPanel}
            showBg
            fg={colors.text}
          />
          <ColorSwatch
            label="backgroundSelected"
            color={colors.backgroundSelected}
            showBg
            fg={colors.text}
          />
        </ColorSection>

        {/* Borders */}
        <ColorSection title="Borders" colors={colors}>
          <ColorSwatch label="border" color={colors.border} />
          <ColorSwatch label="borderActive" color={colors.borderActive} />
          <ColorSwatch label="borderSubtle" color={colors.borderSubtle} />
          <ColorSwatch label="borderSelected" color={colors.borderSelected} />
        </ColorSection>

        {/* Status */}
        <ColorSection title="Status" colors={colors}>
          <ColorSwatch label="error" color={colors.error} />
          <ColorSwatch label="warning" color={colors.warning} />
          <ColorSwatch label="success" color={colors.success} />
          <ColorSwatch label="info" color={colors.info} />
        </ColorSection>

        {/* Diff */}
        <ColorSection title="Diff" colors={colors}>
          <ColorSwatch label="added" color={colors.diffAdded} />
          <ColorSwatch label="removed" color={colors.diffRemoved} />
          <ColorSwatch label="context" color={colors.diffContext} />
          <ColorSwatch label="hunkHeader" color={colors.diffHunkHeader} />
        </ColorSection>

        {/* Markdown */}
        <ColorSection title="Markdown" colors={colors}>
          <ColorSwatch label="heading" color={colors.markdownHeading} />
          <ColorSwatch label="link" color={colors.markdownLink} />
          <ColorSwatch label="code" color={colors.markdownCode} />
          <ColorSwatch label="list" color={colors.markdownList} />
        </ColorSection>

        {/* Syntax */}
        <ColorSection title="Syntax" colors={colors}>
          <ColorSwatch label="comment" color={colors.syntaxComment} />
          <ColorSwatch label="keyword" color={colors.syntaxKeyword} />
          <ColorSwatch label="function" color={colors.syntaxFunction} />
          <ColorSwatch label="string" color={colors.syntaxString} />
          <ColorSwatch label="number" color={colors.syntaxNumber} />
          <ColorSwatch label="type" color={colors.syntaxType} />
        </ColorSection>
      </box>

      {/* Dimmed Context Demo */}
      <box flexDirection="column" gap={0} marginTop={1}>
        <text fg={colors.textMuted}>Dimmed context demo:</text>
        <ColorModeProvider mode="dimmed">
          <DimmedDemo />
        </ColorModeProvider>
      </box>
    </box>
  )
}

/**
 * Section header for color categories.
 */
function ColorSection({
  title,
  colors,
  children,
}: {
  title: string
  colors: ResolvedColors
  children: ReactNode
}) {
  return (
    <box flexDirection="column">
      <text fg={colors.textMuted}>{title}:</text>
      <box flexDirection="row" gap={2} flexWrap="wrap">
        {children}
      </box>
    </box>
  )
}

/**
 * Individual color swatch.
 */
function ColorSwatch({
  label,
  color,
  showBg = false,
  fg,
}: {
  label: string
  color: string
  showBg?: boolean
  fg?: string
}) {
  if (showBg) {
    return (
      <text bg={color} fg={fg ?? color}>
        {' '}
        {label}{' '}
      </text>
    )
  }
  return <text fg={color}>{label}</text>
}

/**
 * Demo content shown in dimmed context.
 */
function DimmedDemo() {
  const colors = useSemanticColors()
  const colorMode = useColorMode()

  return (
    <box
      flexDirection="row"
      gap={2}
      borderStyle="rounded"
      borderColor={colors.border}
      padding={1}
    >
      <text fg={colors.text}>text ({colorMode})</text>
      <text fg={colors.primary}>primary</text>
      <text fg={colors.accent}>accent</text>
      <text fg={colors.error}>error</text>
    </box>
  )
}

export default ThemeDemo
