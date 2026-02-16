/**
 * Tool navigation state for the TUI sidebar menu.
 *
 * The menu displays views grouped by category (Lenses, Tools) with
 * non-selectable section headers. Navigation skips headers and only
 * moves between selectable view items.
 */
import { atom } from 'jotai'
import {
  MENU_PADDING_X,
  MENU_BORDER_WIDTH,
  MENU_INDICATOR_WIDTH,
} from '../components/chrome/constants.js'
import { getGroupedMenuItems } from '../views/registry.js'
import type { GroupedMenuItem } from './types.js'

/**
 * Grouped menu items atom.
 * Returns items with section headers (LENSES, TOOLS) and view items.
 */
export const groupedMenuItemsAtom = atom<GroupedMenuItem[]>(() =>
  getGroupedMenuItems(),
)

/**
 * Currently selected menu index (index within the grouped items array).
 * This index points to a 'view' item, never a 'header'.
 */
export const activeMenuIndexAtom = atom(0)

/**
 * Helper: Get indices of all selectable (view) items
 */
function getSelectableIndices(items: GroupedMenuItem[]): number[] {
  return items
    .map((item, index) => (item.type === 'view' ? index : -1))
    .filter((i) => i >= 0)
}

/**
 * Initialize the active index to the first selectable item
 */
export const initializeMenuIndexAtom = atom(null, (get, set) => {
  const items = get(groupedMenuItemsAtom)
  const selectableIndices = getSelectableIndices(items)
  if (selectableIndices.length > 0 && selectableIndices[0] !== undefined) {
    set(activeMenuIndexAtom, selectableIndices[0])
  }
})

/** Computed menu width based on longest label */
export const menuWidthAtom = atom((get) => {
  const items = get(groupedMenuItemsAtom)
  if (items.length === 0) {
    return MENU_PADDING_X * 2 + MENU_BORDER_WIDTH + MENU_INDICATOR_WIDTH
  }
  const maxLabelLength = Math.max(...items.map((item) => item.label.length))
  return (
    maxLabelLength +
    MENU_PADDING_X * 2 +
    MENU_BORDER_WIDTH +
    MENU_INDICATOR_WIDTH
  )
})

/** The ID of the currently active view */
export const activeViewIdAtom = atom((get) => {
  const items = get(groupedMenuItemsAtom)
  const index = get(activeMenuIndexAtom)
  const item = items[index]
  if (item?.type === 'view') {
    return item.id
  }
  return ''
})

/**
 * Navigation action - move up or down in menu, skipping headers.
 * Wraps around at the ends.
 */
export const navigateMenuAtom = atom(
  null,
  (get, set, direction: 'up' | 'down') => {
    const items = get(groupedMenuItemsAtom)
    const selectableIndices = getSelectableIndices(items)
    if (selectableIndices.length === 0) return

    const currentIndex = get(activeMenuIndexAtom)
    const currentPosition = selectableIndices.indexOf(currentIndex)

    let newPosition: number
    if (direction === 'up') {
      newPosition =
        currentPosition <= 0
          ? selectableIndices.length - 1
          : currentPosition - 1
    } else {
      newPosition =
        currentPosition >= selectableIndices.length - 1
          ? 0
          : currentPosition + 1
    }

    const newIndex = selectableIndices[newPosition]
    if (newIndex !== undefined) {
      set(activeMenuIndexAtom, newIndex)
    }
  },
)
