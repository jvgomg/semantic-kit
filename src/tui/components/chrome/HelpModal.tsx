/**
 * Help modal showing keyboard shortcuts.
 */
import React from 'react'
import { Box, Text, useInput } from 'ink'
import { HELP_MODAL_HEIGHT, HELP_MODAL_WIDTH } from './constants.js'
import { colors } from '../../theme.js'

export interface HelpModalProps {
  onClose: () => void
  columns: number
  rows: number
}

export function HelpModal({ onClose, columns, rows }: HelpModalProps) {
  useInput((input, key) => {
    if (key.escape || input === '?' || input === 'q') {
      onClose()
    }
  })

  const shortcuts = [
    { key: 'Tab / Shift+Tab', desc: 'Cycle focus between regions' },
    { key: 'g', desc: 'Jump to URL bar' },
    { key: 'G (Shift+g)', desc: 'Open URL list' },
    { key: 'r', desc: 'Reload current view' },
    { key: '?', desc: 'Toggle this help' },
    { key: '↑/↓', desc: 'Navigate menu or scroll content' },
    { key: 'PgUp/PgDn', desc: 'Page scroll in content' },
    { key: 'q / Ctrl+C', desc: 'Quit application' },
  ]

  // Center the modal
  const marginLeft = Math.max(0, Math.floor((columns - HELP_MODAL_WIDTH) / 2))
  const marginTop = Math.max(0, Math.floor((rows - HELP_MODAL_HEIGHT) / 2))

  // Inner dimensions (width inside border, minus 2 for border chars)
  const innerWidth = HELP_MODAL_WIDTH - 2

  // Helper to render a full-width line with background
  // Uses ANSI 'black' which adapts to user's terminal theme
  const bg = colors.modalBackground
  const row = (content: string, color?: string, bold?: boolean) => (
    <Text color={color} bold={bold} backgroundColor={bg}>
      {('  ' + content).padEnd(innerWidth)}
    </Text>
  )
  const blank = () => <Text backgroundColor={bg}>{' '.repeat(innerWidth)}</Text>

  return (
    <Box position="absolute" marginLeft={marginLeft} marginTop={marginTop}>
      <Box borderStyle="double" borderColor={colors.modalBorder} flexDirection="column">
        {blank()}
        {row('Keyboard Shortcuts', colors.modalTitle, true)}
        {blank()}
        {shortcuts.map(({ key, desc }) => (
          <Text key={key} backgroundColor={bg}>
            {'  '}
            <Text color={colors.textShortcut}>{key.padEnd(18)}</Text>
            {desc.padEnd(innerWidth - 22)}
          </Text>
        ))}
        {blank()}
        {row('Press ? or Esc to close', colors.textHint)}
        {blank()}
      </Box>
    </Box>
  )
}
