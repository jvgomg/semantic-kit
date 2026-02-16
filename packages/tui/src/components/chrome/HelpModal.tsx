/**
 * Help modal showing keyboard shortcuts.
 * Uses flexbox centering for modal positioning.
 */
import { useKeyboard } from '@opentui/react'
import { HELP_MODAL_WIDTH } from './constants.js'
import { useSemanticColors } from '../../theme.js'
import { Modal } from '../ui/Modal.js'

export interface HelpModalProps {
  onClose: () => void
}

export function HelpModal({ onClose }: HelpModalProps) {
  const colors = useSemanticColors()
  useKeyboard((event) => {
    if (event.name === 'escape' || event.name === '?' || event.name === 'q') {
      onClose()
    }
  })

  const shortcuts = [
    { key: 'Tab / Shift+Tab', desc: 'Cycle focus between regions' },
    { key: 'g', desc: 'Jump to URL bar' },
    { key: 'G (Shift+g)', desc: 'Open URL list' },
    { key: 't', desc: 'Open settings (theme)' },
    { key: 'r', desc: 'Reload current view' },
    { key: '?', desc: 'Toggle this help' },
    { key: 'Up/Down', desc: 'Navigate menu or scroll content' },
    { key: 'PgUp/PgDn', desc: 'Page scroll in content' },
    { key: 'q / Ctrl+C', desc: 'Quit application' },
  ]

  // Inner dimensions (width inside border, minus 2 for border chars)
  const innerWidth = HELP_MODAL_WIDTH - 2

  // Helper to render a full-width line with background
  const bg = colors.modalBackground

  const blank = () => <text bg={bg}>{' '.repeat(innerWidth)}</text>

  return (
    <Modal>
      <text>
        <strong>Keyboard Shortcuts</strong>
      </text>
      {blank()}
      {shortcuts.map(({ key, desc }) => (
        <text key={key} bg={bg}>
          <span fg={colors.textShortcut}>{key.padEnd(18)}</span>
          {desc.padEnd(innerWidth - 22)}
        </text>
      ))}
      {blank()}

      <text fg={colors.textHint}>
        <strong>Press ? or Esc to close</strong>
      </text>
    </Modal>
  )
}
