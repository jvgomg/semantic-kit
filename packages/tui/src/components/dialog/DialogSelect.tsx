/**
 * DialogSelect - A select component with category headers and footer display.
 *
 * Extends the SelectWithClick pattern with support for:
 * - Category headers (non-selectable, grouped by category field)
 * - Footer text (right-aligned keybind hints)
 * - Full-row highlighting
 * - Keyboard and mouse navigation
 *
 * Based on OpenCode's DialogSelect approach.
 */
import { useKeyboard } from '@opentui/react'
import { boxChars } from '../view-display/priorities.js'
import { useSemanticColors } from '../../theme.js'

// =============================================================================
// Types
// =============================================================================

/**
 * Option configuration for DialogSelect.
 */
export interface DialogSelectOption<T = string> {
  /** Display text */
  label: string
  /** Return value on selection */
  value: T
  /** Secondary text below label (optional) */
  description?: string
  /** Category name - renders as non-selectable header (optional) */
  category?: string
  /** Right-aligned text, typically keybind hint (optional) */
  footer?: string
  /** If true, skip this item during keyboard navigation */
  disabled?: boolean
}

/**
 * Props for DialogSelect component.
 */
export interface DialogSelectProps<T = string> {
  /** List of selectable options */
  options: DialogSelectOption<T>[]
  /** Currently selected option index */
  selectedIndex: number
  /** Whether the component is focused for keyboard input */
  focused?: boolean
  /** Fixed height for the select container */
  height?: number
  /** Fixed width for the select container */
  width?: number

  /** Show description below label */
  showDescription?: boolean
  /** Wrap selection at boundaries (top/bottom) */
  wrapSelection?: boolean

  /** Called when highlight changes (keyboard nav or hover) */
  onChange?: (index: number, option: DialogSelectOption<T>) => void
  /** Called when item is selected (Enter or click) */
  onSelect?: (index: number, option: DialogSelectOption<T>) => void
}

// =============================================================================
// Internal Types
// =============================================================================

/**
 * Rendered row type - either a category header or an option.
 */
interface CategoryRow {
  type: 'category'
  label: string
}

interface OptionRow<T> {
  type: 'option'
  option: DialogSelectOption<T>
  originalIndex: number
}

type RenderRow<T> = CategoryRow | OptionRow<T>

// =============================================================================
// Helpers
// =============================================================================

/**
 * Build the list of rows to render, inserting category headers as needed.
 */
function buildRenderRows<T>(options: DialogSelectOption<T>[]): RenderRow<T>[] {
  const rows: RenderRow<T>[] = []
  let currentCategory: string | undefined

  options.forEach((option, index) => {
    // Insert category header if category changed
    if (option.category && option.category !== currentCategory) {
      rows.push({ type: 'category', label: option.category })
      currentCategory = option.category
    }

    rows.push({ type: 'option', option, originalIndex: index })
  })

  return rows
}

/**
 * Find the next valid index for navigation (skipping disabled items).
 */
function findNextValidIndex<T>(
  options: DialogSelectOption<T>[],
  currentIndex: number,
  direction: 'up' | 'down',
  wrapSelection: boolean
): number {
  const len = options.length
  if (len === 0) return currentIndex

  let nextIndex = currentIndex
  let attempts = 0

  while (attempts < len) {
    if (direction === 'down') {
      if (wrapSelection) {
        nextIndex = nextIndex >= len - 1 ? 0 : nextIndex + 1
      } else {
        nextIndex = Math.min(len - 1, nextIndex + 1)
      }
    } else {
      if (wrapSelection) {
        nextIndex = nextIndex <= 0 ? len - 1 : nextIndex - 1
      } else {
        nextIndex = Math.max(0, nextIndex - 1)
      }
    }

    // Found a valid, non-disabled option
    if (!options[nextIndex]?.disabled) {
      return nextIndex
    }

    // If we're back to where we started and it's valid, return it
    if (nextIndex === currentIndex && !options[currentIndex]?.disabled) {
      return currentIndex
    }

    attempts++
  }

  // All items are disabled, return current
  return currentIndex
}

// =============================================================================
// Component
// =============================================================================

export function DialogSelect<T = string>({
  options = [],
  selectedIndex = 0,
  focused = false,
  height,
  width,
  showDescription = true,
  wrapSelection = false,
  onChange,
  onSelect,
}: DialogSelectProps<T>) {
  const colors = useSemanticColors()

  // Keyboard navigation when focused
  useKeyboard((key) => {
    if (!focused) return
    if (options.length === 0) return

    switch (key.name) {
      case 'up':
      case 'k': {
        const newIndex = findNextValidIndex(
          options,
          selectedIndex,
          'up',
          wrapSelection
        )
        if (newIndex !== selectedIndex) {
          onChange?.(newIndex, options[newIndex]!)
        }
        break
      }
      case 'down':
      case 'j': {
        const newIndex = findNextValidIndex(
          options,
          selectedIndex,
          'down',
          wrapSelection
        )
        if (newIndex !== selectedIndex) {
          onChange?.(newIndex, options[newIndex]!)
        }
        break
      }
      case 'enter':
      case 'return': {
        const option = options[selectedIndex]
        if (option && !option.disabled) {
          onSelect?.(selectedIndex, option)
        }
        break
      }
    }
  })

  // Handle clicking on an option row
  const handleItemClick = (index: number) => {
    const option = options[index]
    if (!option || option.disabled) return

    onChange?.(index, option)
    onSelect?.(index, option)
  }

  // Build render rows with category headers
  const renderRows = buildRenderRows(options)

  return (
    <box flexDirection="column" height={height} width={width}>
      {renderRows.map((row, rowIndex) => {
        if (row.type === 'category') {
          // Render category header
          return (
            <box key={`cat-${rowIndex}-${row.label}`} flexDirection="row">
              <text fg={colors.textMuted}>
                {'  '}
                <strong>{row.label.toUpperCase()}</strong>
              </text>
            </box>
          )
        }

        // Render option row
        const { option, originalIndex } = row
        const isSelected = originalIndex === selectedIndex
        const isDisabled = option.disabled

        const bgColor = isSelected ? colors.backgroundSelected : undefined
        const fgColor = isDisabled
          ? colors.textMuted
          : isSelected
            ? colors.text
            : colors.text
        const footerColor = colors.textMuted

        const key = `opt-${originalIndex}-${option.label}`
        const indicator = isSelected ? `${boxChars.collapsed} ` : '  '

        return (
          <box
            key={key}
            onMouseDown={() => handleItemClick(originalIndex)}
            backgroundColor={bgColor}
            flexDirection="column"
          >
            {/* Main row: indicator + label + spacer + footer */}
            <box flexDirection="row" justifyContent="space-between">
              <box flexDirection="row">
                <text fg={fgColor}>{indicator}</text>
                <text fg={fgColor}>{option.label}</text>
              </box>
              {option.footer && <text fg={footerColor}>{option.footer}</text>}
            </box>

            {/* Description row (optional) */}
            {showDescription && option.description && (
              <box flexDirection="row">
                <text fg={colors.textMuted}>{'    '}</text>
                <text fg={colors.textMuted}>{option.description}</text>
              </box>
            )}
          </box>
        )
      })}
    </box>
  )
}
