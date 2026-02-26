/**
 * Theme Dialog
 *
 * Displays theme and mode selection with consistent gutter alignment.
 */
import { useState } from 'react'
import { useKeyboard } from '@opentui/react'
import { useAtomValue } from 'jotai'
import {
  useSemanticColors,
  useTheme,
  modePreferenceAtom,
  type ModePreference,
  type ThemeDefinition,
} from '../../theme.js'
import { DialogPanel } from './DialogPanel.js'
import { useDialog } from './DialogContext.js'
import { useDialogGutter } from './DialogGutterContext.js'

// =============================================================================
// ThemePanel - Content Component
// =============================================================================

interface ThemePanelProps {
  focused?: boolean
  width?: number
}

type Section = 'theme' | 'mode'

const MODE_OPTIONS: { value: ModePreference; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
]

function ThemePanel({ focused = true, width = 40 }: ThemePanelProps) {
  const colors = useSemanticColors()
  const { gutter, indicatorWidth } = useDialogGutter()
  const { theme, availableThemes, setTheme, setModePreference } = useTheme()
  const modePreference = useAtomValue(modePreferenceAtom)

  const [activeSection, setActiveSection] = useState<Section>('theme')
  const [themeIndex, setThemeIndex] = useState(() =>
    Math.max(
      0,
      availableThemes.findIndex((t) => t.id === theme.id),
    ),
  )
  const [modeIndex, setModeIndex] = useState(() =>
    Math.max(
      0,
      MODE_OPTIONS.findIndex((m) => m.value === modePreference),
    ),
  )

  useKeyboard((event) => {
    if (!focused) return

    // Switch sections with Tab
    if (event.name === 'tab') {
      setActiveSection((s) => (s === 'theme' ? 'mode' : 'theme'))
      return
    }

    // Navigation within section
    if (activeSection === 'theme') {
      if (event.name === 'up' || event.name === 'k') {
        setThemeIndex((i) => Math.max(0, i - 1))
      } else if (event.name === 'down' || event.name === 'j') {
        setThemeIndex((i) => Math.min(availableThemes.length - 1, i + 1))
      } else if (event.name === 'return' || event.name === 'space') {
        const selected = availableThemes[themeIndex]
        if (selected) {
          setTheme(selected.id)
        }
      }
    } else {
      // mode section - horizontal navigation
      if (
        event.name === 'left' ||
        event.name === 'h' ||
        event.name === 'up' ||
        event.name === 'k'
      ) {
        setModeIndex((i) => Math.max(0, i - 1))
      } else if (
        event.name === 'right' ||
        event.name === 'l' ||
        event.name === 'down' ||
        event.name === 'j'
      ) {
        setModeIndex((i) => Math.min(MODE_OPTIONS.length - 1, i + 1))
      } else if (event.name === 'return' || event.name === 'space') {
        const selected = MODE_OPTIONS[modeIndex]
        if (selected) {
          setModePreference(selected.value)
        }
      }
    }
  })

  const getModeDesc = (t: ThemeDefinition): string => {
    if (t.supportsBothModes) return 'dark + light'
    return `${t.variant} only`
  }

  const maxNameLength = Math.max(...availableThemes.map((t) => t.name.length))

  return (
    <box flexDirection="column">
      {/* Theme section header */}
      <box paddingLeft={gutter}>
        <text fg={activeSection === 'theme' ? colors.text : colors.textMuted}>
          <strong>Theme</strong>
        </text>
      </box>

      {/* Theme options - indicator in gutter, content aligned */}
      {availableThemes.map((t, idx) => {
        const isSelected = t.id === theme.id
        const isHighlighted = activeSection === 'theme' && idx === themeIndex
        const prefix = isSelected ? '\u25cf' : '\u25cb'
        const indicator = isHighlighted ? '\u25b8' : ' '
        const modeDesc = getModeDesc(t)

        return (
          <box key={t.id} flexDirection="row">
            <text
              fg={isHighlighted ? colors.text : colors.textMuted}
              width={indicatorWidth}
            >
              {indicator}
            </text>
            <text fg={isHighlighted ? colors.text : colors.textMuted}>
              {`${prefix} ${t.name.padEnd(maxNameLength + 2)}${modeDesc}`.padEnd(
                width - indicatorWidth,
              )}
            </text>
          </box>
        )
      })}

      <text>{' '}</text>

      {/* Mode section header */}
      <box paddingLeft={gutter}>
        <text fg={activeSection === 'mode' ? colors.text : colors.textMuted}>
          <strong>Mode</strong>
        </text>
      </box>

      {/* Mode options - inline, gutter-aligned */}
      <box flexDirection="row" paddingLeft={gutter}>
        {MODE_OPTIONS.map((opt, idx) => {
          const isSelected = opt.value === modePreference
          const isHighlighted = activeSection === 'mode' && idx === modeIndex
          const prefix = isSelected ? '\u25cf' : '\u25cb'

          return (
            <text key={opt.value} fg={isHighlighted ? colors.text : colors.textMuted}>
              {`${prefix} ${opt.label}  `}
            </text>
          )
        })}
      </box>
    </box>
  )
}

// =============================================================================
// ThemeDialog - Main Export
// =============================================================================

export function ThemeDialog() {
  const { title, headerHint, handleClose } = useDialog('Theme')

  return (
    <DialogPanel
      title={title}
      headerHint={headerHint}
      footer="Tab section  ↑↓ navigate  Enter select"
      width={50}
      onClose={handleClose}
    >
      <ThemePanel focused={true} />
    </DialogPanel>
  )
}
