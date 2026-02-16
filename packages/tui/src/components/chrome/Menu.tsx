/**
 * Sidebar Menu component with grouped navigation.
 *
 * Displays views organized into sections (LENSES, TOOLS) with
 * non-selectable section headers. Uses keyboard (up/down/j/k) and
 * mouse navigation with focus management via Jotai atoms.
 */
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useKeyboard } from '@opentui/react'
import {
  activeMenuIndexAtom,
  groupedMenuItemsAtom,
  navigateMenuAtom,
  useFocus,
  type GroupedMenuItem,
} from '../../state/index.js'
import { useSemanticColors } from '../../theme.js'
import { boxChars } from '../view-display/priorities.js'

export interface MenuProps {
  width: number
}

/**
 * Menu component with grouped sections (LENSES, TOOLS)
 */
export function Menu({ width }: MenuProps) {
  const colors = useSemanticColors()
  const { isFocused, isInputActive, focus } = useFocus('menu')
  const [activeMenuIndex, setActiveMenuIndex] = useAtom(activeMenuIndexAtom)
  const items = useAtomValue(groupedMenuItemsAtom)
  const navigate = useSetAtom(navigateMenuAtom)

  // Keyboard navigation when focused
  useKeyboard((key) => {
    if (!isInputActive) return

    switch (key.name) {
      case 'up':
      case 'k':
        navigate('up')
        break
      case 'down':
      case 'j':
        navigate('down')
        break
    }
  })

  // Handle clicking on a view item
  const handleItemClick = (index: number, item: GroupedMenuItem) => {
    if (item.type === 'view') {
      setActiveMenuIndex(index)
    }
  }

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
      <box flexDirection="column" height="100%">
        {items.map((item, index) => {
          if (item.type === 'header') {
            return (
              <MenuHeader key={`header-${item.label}`} label={item.label} />
            )
          }

          const isSelected = index === activeMenuIndex
          return (
            <MenuViewItem
              key={`view-${item.id}`}
              label={item.label}
              isSelected={isSelected}
              isFocused={isInputActive}
              onClick={() => handleItemClick(index, item)}
            />
          )
        })}
      </box>
    </box>
  )
}

/**
 * Section header (LENSES, TOOLS)
 */
function MenuHeader({ label }: { label: string }) {
  const colors = useSemanticColors()

  return (
    <box paddingLeft={1} paddingTop={1}>
      <text fg={colors.muted}>
        <strong>{label}</strong>
      </text>
    </box>
  )
}

/**
 * Selectable view item in the menu
 */
function MenuViewItem({
  label,
  isSelected,
  isFocused,
  onClick,
}: {
  label: string
  isSelected: boolean
  isFocused: boolean
  onClick: () => void
}) {
  const colors = useSemanticColors()
  const bgColor = isSelected ? colors.backgroundSelected : 'transparent'
  const fgColor = isSelected
    ? colors.textSelected
    : isFocused
      ? colors.text
      : colors.text

  return (
    <box onMouseDown={onClick} backgroundColor={bgColor} flexDirection="row">
      <text fg={fgColor}>{isSelected ? `${boxChars.collapsed} ` : '  '}</text>
      <text fg={fgColor}>{label}</text>
    </box>
  )
}
