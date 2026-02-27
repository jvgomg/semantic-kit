/**
 * CommandDialog - The main command palette for the TUI.
 *
 * Shows a searchable list of commands including:
 * - Lenses and Tools (view switching)
 * - Navigation commands (URL, reload, etc.)
 * - Settings and Help
 */
import { useState, useMemo, useEffect } from 'react'
import { useRenderer } from '@opentui/react'
import { useSetAtom } from 'jotai'
import {
  pushDialogAtom,
  clearDialogsAtom,
  useFocusScope,
  useFocusNavigation,
  invalidateAllViewDataAtom,
  switchToViewAtom,
} from '../../state/index.js'
import { getAllCommands } from '../../commands.js'
import { DialogPanel } from './DialogPanel.js'
import { DialogInput } from './DialogInput.js'
import { DialogSelect, type DialogSelectOption } from './DialogSelect.js'
import { useDialog } from './DialogContext.js'

// =============================================================================
// Types
// =============================================================================

export interface CommandDialogProps {}

// =============================================================================
// Component
// =============================================================================

/**
 * CommandDialog component - Main command palette with search.
 *
 * Commands can trigger actions or push other dialogs onto the stack.
 */
export function CommandDialog(_props: CommandDialogProps) {
  // Register focus scope - auto-restores previous focus on unmount
  useFocusScope({
    id: 'command-dialog',
    regions: ['search', 'list'],
    initialRegion: 'search',
  })

  const renderer = useRenderer()
  const pushDialog = useSetAtom(pushDialogAtom)
  const clearDialogs = useSetAtom(clearDialogsAtom)
  const invalidateAllViewData = useSetAtom(invalidateAllViewDataAtom)
  const switchToView = useSetAtom(switchToViewAtom)
  const { focus } = useFocusNavigation()
  const { title, headerHint, handleClose } = useDialog('Commands')

  // Get all commands from central registry
  const allCommands = useMemo(() => getAllCommands(), [])

  // State
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter commands by search string (case-insensitive match on label)
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return allCommands
    const query = search.toLowerCase()
    return allCommands.filter((cmd) => cmd.label.toLowerCase().includes(query))
  }, [search, allCommands])

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
  // Focus is auto-restored when dialog closes via scope system
  const executeCommand = (commandId: string) => {
    const command = allCommands.find((cmd) => cmd.id === commandId)
    if (!command) return

    const action = command.action

    switch (action.type) {
      case 'switch-view':
        clearDialogs()
        switchToView(action.viewId)
        break
      case 'push-dialog':
        pushDialog({ type: action.dialog })
        break
      case 'clear-dialogs-and-focus':
        clearDialogs()
        // Focus will be restored to previous scope, then we override to target
        // Use a small delay to ensure scope cleanup happens first
        setTimeout(() => focus(action.target), 0)
        break
      case 'reload':
        clearDialogs()
        invalidateAllViewData()
        // Focus automatically restored when scope pops!
        break
      case 'quit':
        renderer.destroy()
        break
    }
  }

  return (
    <DialogPanel
      title={title}
      headerHint={headerHint}
      // footer="↑↓ Navigate  Enter Select  Esc Close"
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
        maxHeight={10}
      />
    </DialogPanel>
  )
}
