/**
 * DialogSelect - A select component with category headers and footer display.
 *
 * Extends the SelectWithClick pattern with support for:
 * - Category headers (non-selectable, grouped by category field)
 * - Footer text (right-aligned keybind hints)
 * - Full-row highlighting
 * - Keyboard and mouse navigation
 * - Scrollable list with centered selection
 *
 * Uses the dialog gutter context for consistent alignment:
 * - Category headers align to gutter margin
 * - Option indicators occupy gutter space (don't add to it)
 * - Descriptions are indented to match option labels
 *
 * Based on OpenCode's DialogSelect approach.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useKeyboard, useTerminalDimensions } from '@opentui/react'
import type { ScrollBoxRenderable } from '@opentui/core'
import { useSemanticColors } from '../../theme.js'
import { useDialogGutter } from './DialogGutterContext.js'

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
  /** Maximum height for the scrollable list */
  maxHeight?: number
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
  maxHeight: maxHeightProp,
  width,
  showDescription = true,
  wrapSelection = false,
  onChange,
  onSelect,
}: DialogSelectProps<T>) {
  const colors = useSemanticColors()
  const { gutter, indicatorWidth } = useDialogGutter()
  const { height: termHeight } = useTerminalDimensions()

  // Track input mode to avoid synthetic mouse events during keyboard nav
  const [inputMode, setInputMode] = useState<'keyboard' | 'mouse'>('keyboard')

  // Scrollbox ref for programmatic scrolling
  const scrollRef = useRef<ScrollBoxRenderable | null>(null)

  // Calculate actual row count (options + category headers with spacing)
  const renderRows = useMemo(() => buildRenderRows(options), [options])
  const totalRows = useMemo(() => {
    let count = 0
    renderRows.forEach((row, index) => {
      if (row.type === 'category') {
        // Category headers add spacing above (except first)
        count += index > 0 ? 2 : 1
      } else {
        count += 1
      }
    })
    return count
  }, [renderRows])

  // Calculate maxHeight like OpenCode: min(rows, half terminal height - overhead)
  // Overhead accounts for dialog header, footer, input, padding
  const computedMaxHeight = useMemo(() => {
    const maxFromTerminal = Math.floor(termHeight / 2) - 6
    if (maxHeightProp !== undefined) {
      return Math.min(maxHeightProp, maxFromTerminal, totalRows)
    }
    return Math.min(maxFromTerminal, totalRows)
  }, [termHeight, maxHeightProp, totalRows])

  /**
   * Scroll to center the selected item in the viewport.
   * Uses setTimeout to ensure it runs after layout.
   */
  const scrollToSelected = useCallback((index: number, center = false) => {
    // Use setTimeout to ensure this runs after the render cycle
    setTimeout(() => {
      const scroll = scrollRef.current
      if (!scroll) return

      // Find the target element by its id
      const targetId = `option-${index}`
      const target = scroll.getChildren().find((child) => child.id === targetId)
      if (!target) return

      const y = target.y - scroll.y

      if (center) {
        // Center the item in the viewport
        const centerOffset = Math.floor(scroll.height / 2)
        scroll.scrollBy(y - centerOffset)
      } else {
        // Just ensure it's visible
        if (y >= scroll.height) {
          scroll.scrollBy(y - scroll.height + 1)
        }
        if (y < 0) {
          scroll.scrollBy(y)
          // If at the first item, scroll to top
          if (index === 0) {
            scroll.scrollTo(0)
          }
        }
      }
    }, 0)
  }, [])

  // Scroll to selected item when selection changes via keyboard
  useEffect(() => {
    if (inputMode === 'keyboard') {
      scrollToSelected(selectedIndex, true)
    }
  }, [selectedIndex, inputMode, scrollToSelected])

  // Keyboard navigation when focused
  useKeyboard((key) => {
    if (!focused) return
    if (options.length === 0) return

    setInputMode('keyboard')

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
      case 'pageup': {
        // Move up by ~10 items
        let newIndex = selectedIndex
        for (let i = 0; i < 10; i++) {
          const next = findNextValidIndex(options, newIndex, 'up', false)
          if (next === newIndex) break
          newIndex = next
        }
        if (newIndex !== selectedIndex) {
          onChange?.(newIndex, options[newIndex]!)
        }
        break
      }
      case 'pagedown': {
        // Move down by ~10 items
        let newIndex = selectedIndex
        for (let i = 0; i < 10; i++) {
          const next = findNextValidIndex(options, newIndex, 'down', false)
          if (next === newIndex) break
          newIndex = next
        }
        if (newIndex !== selectedIndex) {
          onChange?.(newIndex, options[newIndex]!)
        }
        break
      }
      case 'home': {
        const newIndex = findNextValidIndex(options, -1, 'down', false)
        if (newIndex !== selectedIndex) {
          onChange?.(newIndex, options[newIndex]!)
        }
        break
      }
      case 'end': {
        const newIndex = findNextValidIndex(
          options,
          options.length,
          'up',
          false
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
  const handleItemClick = useCallback(
    (index: number) => {
      const option = options[index]
      if (!option || option.disabled) return

      onChange?.(index, option)
      onSelect?.(index, option)
    },
    [options, onChange, onSelect]
  )

  // Handle mouse hover on an option row
  const handleItemHover = useCallback(
    (index: number) => {
      if (inputMode !== 'mouse') return
      const option = options[index]
      if (!option || option.disabled) return
      if (index === selectedIndex) return

      onChange?.(index, option)
    },
    [options, selectedIndex, inputMode, onChange]
  )

  // Handle mouse move - switch to mouse mode
  const handleMouseMove = useCallback(() => {
    setInputMode('mouse')
  }, [])

  return (
    <scrollbox
      ref={(r: ScrollBoxRenderable) => {
        scrollRef.current = r
      }}
      flexDirection="column"
      maxHeight={computedMaxHeight}
      width={width}
      scrollbarOptions={{ visible: false }}
    >
      {renderRows.map((row, rowIndex) => {
          if (row.type === 'category') {
            // Render category header - aligned to gutter margin
            // Add spacing above if not the first element
            return (
              <box
                key={`cat-${rowIndex}-${row.label}`}
                paddingLeft={gutter}
                marginTop={rowIndex > 0 ? 1 : 0}
              >
                <text fg={colors.textMuted}>
                  <strong>{row.label}</strong>
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

          // Indicator character (▶ when selected, space otherwise)
          const indicatorChar = isSelected ? '▶' : ' '

          return (
            <box
              key={`opt-${originalIndex}-${option.label}`}
              id={`option-${originalIndex}`}
              onMouseDown={() => handleItemClick(originalIndex)}
              onMouseMove={handleMouseMove}
              onMouseOver={() => handleItemHover(originalIndex)}
              backgroundColor={bgColor}
              flexDirection="column"
            >
              {/* Main row: indicator + label + spacer + footer */}
              {/* Indicator is positioned so label starts at gutter margin */}
              <box flexDirection="row" justifyContent="space-between">
                <box flexDirection="row" paddingLeft={gutter - indicatorWidth}>
                  <text fg={fgColor} width={indicatorWidth}>
                    {indicatorChar}
                  </text>
                  <text fg={fgColor}>{option.label}</text>
                </box>
                {option.footer && (
                  <text fg={footerColor} paddingRight={gutter}>
                    {option.footer}
                  </text>
                )}
              </box>

              {/* Description row - indented to align with option labels */}
              {showDescription && option.description && (
                <box paddingLeft={gutter}>
                  <text fg={colors.textMuted}>{option.description}</text>
                </box>
              )}
            </box>
          )
        })}
    </scrollbox>
  )
}
