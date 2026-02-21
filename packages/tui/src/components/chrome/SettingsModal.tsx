/**
 * Settings modal for theme switching.
 * Allows selection of theme and mode preference (Auto, Dark, Light).
 */
import { useState } from 'react'
import { useKeyboard } from '@opentui/react'
import { useAtomValue } from 'jotai'
import { SETTINGS_MODAL_WIDTH } from './constants.js'
import {
  useSemanticColors,
  useTheme,
  modePreferenceAtom,
  type ModePreference,
  type ThemeDefinition,
} from '../../theme.js'
import { Modal } from '../ui/Modal.js'

export interface SettingsModalProps {
  onClose: () => void
}

type Section = 'theme' | 'mode'

const MODE_OPTIONS: { value: ModePreference; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
]

export function SettingsModal({ onClose }: SettingsModalProps) {
  const colors = useSemanticColors()
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
    // Close modal
    if (event.name === 'escape' || event.name === 'q') {
      onClose()
      return
    }

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
      if (event.name === 'left' || event.name === 'h') {
        setModeIndex((i) => Math.max(0, i - 1))
      } else if (event.name === 'right' || event.name === 'l') {
        setModeIndex((i) => Math.min(MODE_OPTIONS.length - 1, i + 1))
      } else if (event.name === 'return' || event.name === 'space') {
        const selected = MODE_OPTIONS[modeIndex]
        if (selected) {
          setModePreference(selected.value)
        }
      }
    }
  })

  const innerWidth = SETTINGS_MODAL_WIDTH - 4 // padding
  const bg = colors.backgroundPanel

  const blank = () => <text bg={bg}>{' '.repeat(innerWidth)}</text>

  // Helper to get mode description for a theme
  const getModeDesc = (t: ThemeDefinition): string => {
    if (t.supportsBothModes) return 'dark + light'
    return `${t.variant} only`
  }

  return (
    <Modal onClose={onClose}>
      <text>
        <strong>Settings</strong>
      </text>
      {blank()}

      {/* Theme Section */}
      <text
        fg={activeSection === 'theme' ? colors.text : colors.textMuted}
        bg={bg}
      >
        <strong>Theme</strong>
      </text>
      {availableThemes.map((t, idx) => {
        const isSelected = t.id === theme.id
        const isHighlighted = activeSection === 'theme' && idx === themeIndex
        const prefix = isSelected ? '●' : '○'
        const indicator = isHighlighted ? '▸' : ' '

        return (
          <text
            key={t.id}
            fg={isHighlighted ? colors.text : colors.textMuted}
            bg={bg}
          >
            {`${indicator} ${prefix} ${t.name.padEnd(12)} ${getModeDesc(t)}`.padEnd(
              innerWidth,
            )}
          </text>
        )
      })}
      {blank()}

      {/* Mode Section */}
      <text
        fg={activeSection === 'mode' ? colors.text : colors.textMuted}
        bg={bg}
      >
        <strong>Mode</strong>
      </text>
      <box flexDirection="row" backgroundColor={bg}>
        <text bg={bg}>{'  '}</text>
        {MODE_OPTIONS.map((opt, idx) => {
          const isSelected = opt.value === modePreference
          const isHighlighted = activeSection === 'mode' && idx === modeIndex
          const prefix = isSelected ? '●' : '○'

          return (
            <text
              key={opt.value}
              fg={isHighlighted ? colors.text : colors.textMuted}
              bg={bg}
            >
              {`${prefix} ${opt.label}  `}
            </text>
          )
        })}
      </box>
      {blank()}

      <text fg={colors.textMuted}>
        <strong>↑↓ navigate Tab section Esc close</strong>
      </text>
    </Modal>
  )
}
