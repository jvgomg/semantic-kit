/**
 * Sidebar Menu component with arrow key navigation.
 * Uses Ink's focus system for focus management.
 */
import React from 'react'
import { Box, Text, useInput } from 'ink'
import { useTrackedFocus } from '../../state/index.js'
import { MENU_PADDING_X } from './constants.js'
import { borderColor, itemStyleWithBackground } from '../../theme.js'

export interface MenuItem {
  id: string
  label: string
}

export interface MenuProps {
  items: MenuItem[]
  activeIndex: number
  onNavigate: (direction: 'up' | 'down') => void
  width: number
}

export function Menu({ items, activeIndex, onNavigate, width }: MenuProps) {
  const { isFocused, isActive } = useTrackedFocus('menu')

  useInput(
    (_input, key) => {
      if (key.upArrow) {
        onNavigate('up')
      } else if (key.downArrow) {
        onNavigate('down')
      }
    },
    { isActive },
  )

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={borderColor(isFocused)}
      paddingX={MENU_PADDING_X}
      width={width}
      flexShrink={0}
    >
      {items.map((item, index) => {
        const isActiveItem = index === activeIndex
        return (
          <Text key={item.id} {...itemStyleWithBackground(isActiveItem)}>
            {isActiveItem ? '▸ ' : '  '}
            {item.label}
          </Text>
        )
      })}
    </Box>
  )
}
