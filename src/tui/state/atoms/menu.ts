/**
 * Menu-related atoms for sidebar navigation state.
 */
import { atom } from 'jotai'
import {
  MENU_PADDING_X,
  MENU_BORDER_WIDTH,
  MENU_INDICATOR_WIDTH,
} from '../../components/chrome/constants.js'
import { getMenuItems } from '../../views/registry.js'
import type { MenuItem } from '../types.js'

/**
 * Menu items atom.
 * This will be populated by the view registry once views are set up.
 * For now, provides a writable atom that can be set externally.
 */
export const menuItemsAtom = atom<MenuItem[]>(() => getMenuItems())

/** Currently selected menu index */
export const activeMenuIndexAtom = atom(0)

/** Computed menu width based on longest label */
export const menuWidthAtom = atom((get) => {
  const items = get(menuItemsAtom)
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
  const items = get(menuItemsAtom)
  const index = get(activeMenuIndexAtom)
  return items[index]?.id ?? ''
})

/** Navigation action - move up or down in menu */
export const navigateMenuAtom = atom(
  null,
  (get, set, direction: 'up' | 'down') => {
    const items = get(menuItemsAtom)
    if (items.length === 0) return

    set(activeMenuIndexAtom, (current) => {
      if (direction === 'up') {
        return current === 0 ? items.length - 1 : current - 1
      }
      return current === items.length - 1 ? 0 : current + 1
    })
  },
)
