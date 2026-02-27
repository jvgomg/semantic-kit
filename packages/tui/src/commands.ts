/**
 * Central command definitions for the TUI.
 *
 * Commands are used by both the CommandDialog and the side Menu.
 * This module provides a unified source of truth for all navigable items.
 */
import { getAllViews, type ViewDefinition } from './views/index.js'

// =============================================================================
// Types
// =============================================================================

export type CommandCategory = 'Lenses' | 'Tools' | 'Navigation' | 'Settings' | 'Help'

export type CommandAction =
  | { type: 'switch-view'; viewId: string }
  | { type: 'push-dialog'; dialog: 'theme' | 'help' | 'recent-urls' | 'preset-urls' | 'sitemap' }
  | { type: 'clear-dialogs-and-focus'; target: 'url' }
  | { type: 'reload' }
  | { type: 'quit' }

export interface CommandDefinition {
  id: string
  label: string
  category: CommandCategory
  keybind?: string
  action: CommandAction
}

// =============================================================================
// Static Commands
// =============================================================================

const STATIC_COMMANDS: CommandDefinition[] = [
  {
    id: 'jump-url',
    label: 'Jump to URL bar',
    category: 'Navigation',
    keybind: 'g',
    action: { type: 'clear-dialogs-and-focus', target: 'url' },
  },
  {
    id: 'recent-urls',
    label: 'Recent URLs',
    category: 'Navigation',
    keybind: 'G',
    action: { type: 'push-dialog', dialog: 'recent-urls' },
  },
  {
    id: 'preset-urls',
    label: 'Preset URLs (config)',
    category: 'Navigation',
    action: { type: 'push-dialog', dialog: 'preset-urls' },
  },
  {
    id: 'sitemap',
    label: 'Load Sitemap',
    category: 'Navigation',
    action: { type: 'push-dialog', dialog: 'sitemap' },
  },
  {
    id: 'reload',
    label: 'Reload current view',
    category: 'Navigation',
    keybind: 'r',
    action: { type: 'reload' },
  },
  {
    id: 'theme',
    label: 'Change theme',
    category: 'Settings',
    keybind: 't',
    action: { type: 'push-dialog', dialog: 'theme' },
  },
  {
    id: 'help',
    label: 'Keyboard shortcuts',
    category: 'Help',
    keybind: '?',
    action: { type: 'push-dialog', dialog: 'help' },
  },
  {
    id: 'quit',
    label: 'Quit application',
    category: 'Help',
    keybind: 'q',
    action: { type: 'quit' },
  },
]

// =============================================================================
// Command Generation
// =============================================================================

/**
 * Convert a view definition to a command definition.
 */
function viewToCommand(view: ViewDefinition): CommandDefinition {
  return {
    id: `view:${view.id}`,
    label: view.label,
    category: view.category === 'lens' ? 'Lenses' : 'Tools',
    action: { type: 'switch-view', viewId: view.id },
  }
}

/**
 * Get all commands including lenses and tools from the view registry.
 *
 * Order: Lenses, Tools, Navigation, Settings, Help
 */
export function getAllCommands(): CommandDefinition[] {
  const views = getAllViews()

  const lensCommands = views.filter((v) => v.category === 'lens').map(viewToCommand)
  const toolCommands = views.filter((v) => v.category === 'tool').map(viewToCommand)

  return [...lensCommands, ...toolCommands, ...STATIC_COMMANDS]
}

/**
 * Get commands filtered by category.
 */
export function getCommandsByCategory(category: CommandCategory): CommandDefinition[] {
  return getAllCommands().filter((cmd) => cmd.category === category)
}

/**
 * Find a command by its ID.
 */
export function getCommandById(id: string): CommandDefinition | undefined {
  return getAllCommands().find((cmd) => cmd.id === id)
}

// =============================================================================
// Menu Items (for backward compatibility with Menu component)
// =============================================================================

export type GroupedCommandItem =
  | { type: 'header'; label: string }
  | { type: 'command'; id: string; label: string; viewId?: string }

/**
 * Get commands grouped by category for menu display.
 * Returns items with headers for each non-empty category.
 *
 * Order: Lenses first, then Tools
 */
export function getGroupedMenuCommands(): GroupedCommandItem[] {
  const items: GroupedCommandItem[] = []

  const lenses = getCommandsByCategory('Lenses')
  if (lenses.length > 0) {
    items.push({ type: 'header', label: 'LENSES' })
    for (const cmd of lenses) {
      const viewId = cmd.action.type === 'switch-view' ? cmd.action.viewId : undefined
      items.push({ type: 'command', id: cmd.id, label: cmd.label, viewId })
    }
  }

  const tools = getCommandsByCategory('Tools')
  if (tools.length > 0) {
    items.push({ type: 'header', label: 'TOOLS' })
    for (const cmd of tools) {
      const viewId = cmd.action.type === 'switch-view' ? cmd.action.viewId : undefined
      items.push({ type: 'command', id: cmd.id, label: cmd.label, viewId })
    }
  }

  return items
}
