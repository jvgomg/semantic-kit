/**
 * Sidebar Menu component with keyboard and mouse support.
 *
 * Uses SelectWithClick for navigation with click support.
 * Wraps with custom focus system built on Jotai atoms.
 */
import { useAtom, useAtomValue } from 'jotai'
import {
  activeMenuIndexAtom,
  menuItemsAtom,
  useFocus,
} from '../../state/index.js'
import { colors } from '../../theme.js'
import { SelectWithClick } from '../ui/index.js'

export interface MenuItem {
  id: string
  label: string
}

export interface MenuProps {
  width: number
}

export function Menu({ width }: MenuProps) {
  const { isFocused, isInputActive, focus } = useFocus('menu')
  const [activeMenuIndex, setActiveMenuIndex] = useAtom(activeMenuIndexAtom)
  const items = useAtomValue(menuItemsAtom)

  // Convert MenuItem[] to select options format
  const options = items.map((item) => ({
    name: item.label,
    description: '',
    value: item.id,
  }))

  return (
    <box
      flexDirection="column"
      width={width}
      borderStyle="rounded"
      borderColor={colors.borderUnfocused}
      focusedBorderColor={colors.borderFocused}
      focusable
      focused={isFocused}
      onMouseDown={() => focus()}
    >
      <SelectWithClick
        options={options}
        selectedIndex={activeMenuIndex}
        focused={isInputActive}
        height="100%"
        selectedBackgroundColor={colors.backgroundSelected}
        selectedTextColor={colors.textSelected}
        textColor={colors.text}
        showDescription={false}
        wrapSelection
        onChange={setActiveMenuIndex}
        onSelect={setActiveMenuIndex}
      />
    </box>
  )
}
