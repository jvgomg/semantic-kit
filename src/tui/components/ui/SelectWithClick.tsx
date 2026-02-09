/**
 * A select component with mouse click support.
 *
 * Extends the OpenTUI <select> API and adds onMouseDown handlers
 * to each item for click-to-select functionality.
 *
 * Keyboard navigation: up/down/j/k to move, enter to select
 * Mouse: click any item to select it
 */
import { useKeyboard, type SelectProps } from '@opentui/react'
import type { SelectOption } from '@opentui/core'
import { boxChars } from '../view-display/priorities.js'

export type { SelectOption }

export interface SelectWithClickProps extends SelectProps {}

export function SelectWithClick({
  options = [],
  selectedIndex = 0,
  focused = false,
  height,
  showDescription = true,
  wrapSelection = false,
  backgroundColor = 'transparent',
  textColor,
  selectedBackgroundColor,
  selectedTextColor,
  descriptionColor,
  selectedDescriptionColor,
  focusedBackgroundColor,
  focusedTextColor,
  onChange,
  onSelect,
}: SelectWithClickProps) {
  // Keyboard navigation when focused
  useKeyboard((key) => {
    if (!focused) return

    const len = options.length
    if (len === 0) return

    switch (key.name) {
      case 'up':
      case 'k': {
        const newIndex = wrapSelection
          ? selectedIndex <= 0
            ? len - 1
            : selectedIndex - 1
          : Math.max(0, selectedIndex - 1)
        onChange?.(newIndex, options[newIndex] ?? null)
        break
      }
      case 'down':
      case 'j': {
        const newIndex = wrapSelection
          ? selectedIndex >= len - 1
            ? 0
            : selectedIndex + 1
          : Math.min(len - 1, selectedIndex + 1)
        onChange?.(newIndex, options[newIndex] ?? null)
        break
      }
      case 'enter':
      case 'return':
        onSelect?.(selectedIndex, options[selectedIndex] ?? null)
        break
    }
  })

  // Handle clicking on an item
  const handleItemClick = (index: number) => {
    onChange?.(index, options[index] ?? null)
    onSelect?.(index, options[index] ?? null)
  }

  return (
    <box
      flexDirection="column"
      height={height}
      backgroundColor={backgroundColor}
    >
      {options.map((option, index) => {
        const isSelected = index === selectedIndex
        const bgColor = isSelected
          ? selectedBackgroundColor
          : focused
            ? focusedBackgroundColor
            : backgroundColor
        const fgColor = isSelected
          ? selectedTextColor
          : focused
            ? focusedTextColor
            : textColor
        const descColor = isSelected
          ? selectedDescriptionColor
          : descriptionColor

        const key = `${index}-${option.name}`

        return (
          <box
            key={key}
            onMouseDown={() => handleItemClick(index)}
            backgroundColor={bgColor}
            flexDirection="row"
          >
            <text fg={fgColor}>
              {isSelected ? `${boxChars.collapsed} ` : '  '}
            </text>
            <box flexDirection="column">
              <text fg={fgColor}>{option.name}</text>
              {showDescription && option.description && (
                <text fg={descColor}>{option.description}</text>
              )}
            </box>
          </box>
        )
      })}
    </box>
  )
}
