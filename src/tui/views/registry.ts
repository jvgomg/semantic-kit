import type { ViewDefinition } from './types.js'

// Internal registry storage
const viewRegistry = new Map<string, ViewDefinition>()

// Order in which views should appear in menu
const viewOrder: string[] = []

/**
 * Register a view in the registry.
 * Views are displayed in the order they are registered.
 */
export function registerView<T>(view: ViewDefinition<T>): void {
  viewRegistry.set(view.id, view as ViewDefinition)
  if (!viewOrder.includes(view.id)) {
    viewOrder.push(view.id)
  }
}

/**
 * Get a view by ID
 */
export function getView(id: string): ViewDefinition | undefined {
  return viewRegistry.get(id)
}

/**
 * Get all registered views in registration order
 */
export function getAllViews(): ViewDefinition[] {
  return viewOrder.map((id) => viewRegistry.get(id)!).filter(Boolean)
}

/**
 * Get menu items derived from registry
 */
export function getMenuItems(): Array<{ id: string; label: string }> {
  return getAllViews().map((view) => ({
    id: view.id,
    label: view.label,
  }))
}
