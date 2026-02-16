/**
 * Settings modal for theme switching.
 * Allows selection of theme family (Nord, Twilight, Sakura) and
 * variant preference (Auto, Dark, Light).
 */
import { useState } from 'react'
import { useKeyboard } from '@opentui/react'
import { useAtomValue } from 'jotai'
import { SETTINGS_MODAL_WIDTH } from './constants.js'
import {
  useSemanticColors,
  useTheme,
  getAllThemeFamilies,
  variantPreferenceAtom,
} from '../../theme.js'
import type { VariantPreference } from '../../theme.js'
import { Modal } from '../ui/Modal.js'

export interface SettingsModalProps {
  onClose: () => void
}

type Section = 'family' | 'variant'

const VARIANT_OPTIONS: { value: VariantPreference; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
]

export function SettingsModal({ onClose }: SettingsModalProps) {
  const colors = useSemanticColors()
  const { family, setFamily, setVariantPreference } = useTheme()
  const variantPreference = useAtomValue(variantPreferenceAtom)

  const families = getAllThemeFamilies()
  const [activeSection, setActiveSection] = useState<Section>('family')
  const [familyIndex, setFamilyIndex] = useState(() =>
    Math.max(
      0,
      families.findIndex((f) => f.id === family.id),
    ),
  )
  const [variantIndex, setVariantIndex] = useState(() =>
    Math.max(
      0,
      VARIANT_OPTIONS.findIndex((v) => v.value === variantPreference),
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
      setActiveSection((s) => (s === 'family' ? 'variant' : 'family'))
      return
    }

    // Navigation within section
    if (activeSection === 'family') {
      if (event.name === 'up' || event.name === 'k') {
        setFamilyIndex((i) => Math.max(0, i - 1))
      } else if (event.name === 'down' || event.name === 'j') {
        setFamilyIndex((i) => Math.min(families.length - 1, i + 1))
      } else if (event.name === 'return' || event.name === 'space') {
        const selected = families[familyIndex]
        if (selected) {
          setFamily(selected.id)
        }
      }
    } else {
      // variant section - horizontal navigation
      if (event.name === 'left' || event.name === 'h') {
        setVariantIndex((i) => Math.max(0, i - 1))
      } else if (event.name === 'right' || event.name === 'l') {
        setVariantIndex((i) => Math.min(VARIANT_OPTIONS.length - 1, i + 1))
      } else if (event.name === 'return' || event.name === 'space') {
        const selected = VARIANT_OPTIONS[variantIndex]
        if (selected) {
          setVariantPreference(selected.value)
        }
      }
    }
  })

  const innerWidth = SETTINGS_MODAL_WIDTH - 4 // padding
  const bg = colors.modalBackground

  const blank = () => <text bg={bg}>{' '.repeat(innerWidth)}</text>

  // Helper to get variant availability description
  const getVariantDesc = (f: (typeof families)[0]): string => {
    if (f.dark && f.light) return 'dark + light'
    if (f.dark) return 'dark only'
    return 'light only'
  }

  return (
    <Modal>
      <text>
        <strong>Settings</strong>
      </text>
      {blank()}

      {/* Theme Family Section */}
      <text
        fg={activeSection === 'family' ? colors.text : colors.textHint}
        bg={bg}
      >
        <strong>Theme</strong>
      </text>
      {families.map((f, idx) => {
        const isSelected = f.id === family.id
        const isHighlighted = activeSection === 'family' && idx === familyIndex
        const prefix = isSelected ? '●' : '○'
        const indicator = isHighlighted ? '▸' : ' '

        return (
          <text
            key={f.id}
            fg={isHighlighted ? colors.text : colors.textHint}
            bg={bg}
          >
            {`${indicator} ${prefix} ${f.name.padEnd(12)} ${getVariantDesc(f)}`.padEnd(
              innerWidth,
            )}
          </text>
        )
      })}
      {blank()}

      {/* Variant Section */}
      <text
        fg={activeSection === 'variant' ? colors.text : colors.textHint}
        bg={bg}
      >
        <strong>Variant</strong>
      </text>
      <box flexDirection="row" backgroundColor={bg}>
        <text bg={bg}>{'  '}</text>
        {VARIANT_OPTIONS.map((opt, idx) => {
          const isSelected = opt.value === variantPreference
          const isHighlighted =
            activeSection === 'variant' && idx === variantIndex
          const prefix = isSelected ? '●' : '○'

          return (
            <text
              key={opt.value}
              fg={isHighlighted ? colors.text : colors.textHint}
              bg={bg}
            >
              {`${prefix} ${opt.label}  `}
            </text>
          )
        })}
      </box>
      {blank()}

      <text fg={colors.textHint}>
        <strong>↑↓ navigate Tab section Esc close</strong>
      </text>
    </Modal>
  )
}
