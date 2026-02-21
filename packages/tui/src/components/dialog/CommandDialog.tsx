/**
 * CommandDialog - The main command palette for the TUI.
 *
 * Shows a searchable list of commands. Selecting a command either:
 * - Executes an action (quit, reload, etc.)
 * - Pushes another dialog onto the stack (theme, help)
 */
import { useState, useMemo, useEffect } from 'react'
import { useRenderer } from '@opentui/react'
import { useSetAtom } from 'jotai'
import {
  pushDialogAtom,
  clearDialogsAtom,
  useFocusManager,
  invalidateAllViewDataAtom,
} from '../../state/index.js'
import { DialogPanel } from './DialogPanel.js'
import { DialogInput } from './DialogInput.js'
import { DialogSelect, type DialogSelectOption } from './DialogSelect.js'
import { useDialog } from './DialogContext.js'

// =============================================================================
// Types
// =============================================================================

export interface CommandDialogProps {}

interface Command {
  id: string
  label: string
  category: 'Navigation' | 'Settings' | 'Help'
  keybind: string
  action: 'jump-url' | 'url-list' | 'reload' | 'theme' | 'help' | 'quit'
}

// =============================================================================
// Command Definitions
// =============================================================================

const COMMANDS: Command[] = [
  {
    id: 'jump-url',
    label: 'Jump to URL bar',
    category: 'Navigation',
    keybind: 'g',
    action: 'jump-url',
  },
  {
    id: 'url-list',
    label: 'Open URL list',
    category: 'Navigation',
    keybind: 'G',
    action: 'url-list',
  },
  {
    id: 'reload',
    label: 'Reload current view',
    category: 'Navigation',
    keybind: 'r',
    action: 'reload',
  },
  {
    id: 'theme',
    label: 'Change theme',
    category: 'Settings',
    keybind: 't',
    action: 'theme',
  },
  {
    id: 'help',
    label: 'Keyboard shortcuts',
    category: 'Help',
    keybind: '?',
    action: 'help',
  },
  {
    id: 'quit',
    label: 'Quit application',
    category: 'Help',
    keybind: 'q',
    action: 'quit',
  },
]

// =============================================================================
// Component
// =============================================================================

/**
 * CommandDialog component - Main command palette with search.
 *
 * Commands can trigger actions or push other dialogs onto the stack.
 */
export function CommandDialog(_props: CommandDialogProps) {
  const renderer = useRenderer()
  const pushDialog = useSetAtom(pushDialogAtom)
  const clearDialogs = useSetAtom(clearDialogsAtom)
  const invalidateAllViewData = useSetAtom(invalidateAllViewDataAtom)
  const { focus, enableFocus } = useFocusManager()
  const { title, headerHint, handleClose } = useDialog('Commands')

  // State
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter commands by search string (case-insensitive match on label)
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return COMMANDS
    const query = search.toLowerCase()
    return COMMANDS.filter((cmd) => cmd.label.toLowerCase().includes(query))
  }, [search])

  // Reset selectedIndex when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  // Convert filtered commands to DialogSelectOption format
  const options: DialogSelectOption<string>[] = useMemo(() => {
    return filteredCommands.map((cmd) => ({
      label: cmd.label,
      value: cmd.id,
      category: cmd.category,
      footer: cmd.keybind,
    }))
  }, [filteredCommands])

  // Execute a command by its action
  const executeCommand = (commandId: string) => {
    const command = COMMANDS.find((cmd) => cmd.id === commandId)
    if (!command) return

    switch (command.action) {
      case 'theme':
        pushDialog({ type: 'theme' })
        break
      case 'help':
        pushDialog({ type: 'help' })
        break
      case 'url-list':
        pushDialog({ type: 'url-list' })
        break
      case 'quit':
        renderer.destroy()
        break
      case 'jump-url':
        clearDialogs()
        enableFocus()
        focus('url')
        break
      case 'reload':
        clearDialogs()
        enableFocus()
        invalidateAllViewData()
        break
    }
  }

  return (
    <DialogPanel
      title={title}
      headerHint={headerHint}
      footer="↑↓ Navigate  Enter Select  Esc Close"
      width={50}
      onClose={handleClose}
    >
      <DialogInput
        value={search}
        onChange={setSearch}
        placeholder="Search commands..."
        focused={true}
      />
      <DialogSelect
        options={options}
        selectedIndex={selectedIndex}
        focused={true}
        onChange={(idx) => setSelectedIndex(idx)}
        onSelect={(_idx, opt) => executeCommand(opt.value)}
        height={10}
      />
    </DialogPanel>
  )
}
