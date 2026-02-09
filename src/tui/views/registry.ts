/**
 * View registry for the TUI.
 *
 * Manages registration and lookup of views.
 * Views self-register by calling registerView() when their module is imported.
 */
import type { ViewCategory, ViewDefinition } from './types.js'

// Internal registry storage
const viewRegistry = new Map<string, ViewDefinition>()

// Order in which views should appear in menu (within their category)
const viewOrder: string[] = []

/**
 * Register a view in the registry.
 * Views are displayed in the order they are registered within their category.
 */
export function registerView<T>(view: ViewDefinition<T>): void {
  viewRegistry.set(view.id, view as ViewDefinition)
  if (!viewOrder.includes(view.id)) {
    viewOrder.push(view.id)
  }
}

/**
 * Get a view definition by ID.
 * Returns the static view definition (id, label, description, category, fetch, Component).
 * For the full view with data, use viewAtomFamily from state/view-atoms.ts.
 */
export function getViewDefinition(id: string): ViewDefinition | undefined {
  return viewRegistry.get(id)
}

/**
 * Get all registered views in registration order
 */
export function getAllViews(): ViewDefinition[] {
  return viewOrder.map((id) => viewRegistry.get(id)!).filter(Boolean)
}

/**
 * Get views filtered by category, in registration order
 */
export function getViewsByCategory(category: ViewCategory): ViewDefinition[] {
  return getAllViews().filter((view) => view.category === category)
}

/**
 * Grouped menu item - either a section header or a selectable view.
 * This type matches GroupedMenuItem in state/types.ts.
 */
type GroupedMenuItem =
  | { type: 'header'; label: string }
  | { type: 'view'; id: string; label: string }

/**
 * Get menu items grouped by category.
 * Returns items with headers for each non-empty category.
 *
 * Order: Lenses first, then Tools
 */
export function getGroupedMenuItems(): GroupedMenuItem[] {
  const items: GroupedMenuItem[] = []

  const lenses = getViewsByCategory('lens')
  if (lenses.length > 0) {
    items.push({ type: 'header', label: 'LENSES' })
    for (const view of lenses) {
      items.push({ type: 'view', id: view.id, label: view.label })
    }
  }

  const tools = getViewsByCategory('tool')
  if (tools.length > 0) {
    items.push({ type: 'header', label: 'TOOLS' })
    for (const view of tools) {
      items.push({ type: 'view', id: view.id, label: view.label })
    }
  }

  return items
}
