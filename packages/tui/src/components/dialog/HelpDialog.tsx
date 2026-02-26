/**
 * Help Dialog
 *
 * Displays keyboard shortcuts in a dialog.
 */
import { useSemanticColors } from '../../theme.js'
import { DialogPanel } from './DialogPanel.js'
import { useDialog } from './DialogContext.js'
import { useDialogGutter } from './DialogGutterContext.js'

// =============================================================================
// HelpPanel - Content Component
// =============================================================================

interface HelpPanelProps {
  width?: number
}

const shortcuts = [
  { key: 'Tab / Shift+Tab', desc: 'Cycle focus between regions' },
  { key: 'g', desc: 'Jump to URL bar' },
  { key: 'G (Shift+g)', desc: 'Recent URLs' },
  { key: 't', desc: 'Open settings (theme)' },
  { key: 'r', desc: 'Reload current view' },
  { key: '?', desc: 'Toggle this help' },
  { key: 'Up/Down', desc: 'Navigate menu or scroll content' },
  { key: 'PgUp/PgDn', desc: 'Page scroll in content' },
  { key: 'q / Ctrl+C', desc: 'Quit application' },
]

function HelpPanel({ width: _width = 46 }: HelpPanelProps) {
  const colors = useSemanticColors()
  const { gutter } = useDialogGutter()
  const keyWidth = 18

  return (
    <box flexDirection="column" paddingLeft={gutter} paddingRight={gutter}>
      {shortcuts.map(({ key, desc }) => (
        <text key={key}>
          <span fg={colors.warning}>{key.padEnd(keyWidth)}</span>
          <span fg={colors.text}>{desc}</span>
        </text>
      ))}
    </box>
  )
}

// =============================================================================
// HelpDialog - Main Export
// =============================================================================

export function HelpDialog() {
  const { title, headerHint, handleClose } = useDialog('Help', {
    closeKeys: ['q'],
  })

  return (
    <DialogPanel
      title={title}
      headerHint={headerHint}
      width={50}
      onClose={handleClose}
    >
      <HelpPanel />
    </DialogPanel>
  )
}
