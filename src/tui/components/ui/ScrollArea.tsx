import React from 'react'
import { Box, Text } from 'ink'
import { borderColor } from '../../theme.js'

interface ScrollAreaProps {
  children: React.ReactNode
  height: number
  contentHeight: number
  scrollOffset: number
  isFocused?: boolean
}

/**
 * A scrollable area with a visual scroll indicator on the right side.
 */
export function ScrollArea({
  children,
  height,
  contentHeight,
  scrollOffset,
  isFocused = false,
}: ScrollAreaProps) {
  const viewportHeight = height - 2 // Account for border
  const trackHeight = Math.max(1, viewportHeight)

  // Calculate thumb size and position
  const ratio = viewportHeight / contentHeight
  const thumbHeight = Math.max(1, Math.floor(trackHeight * ratio))
  const maxOffset = contentHeight - viewportHeight
  const thumbPosition =
    maxOffset > 0
      ? Math.floor((scrollOffset / maxOffset) * (trackHeight - thumbHeight))
      : 0

  // Build the scrollbar track
  const scrollbar: string[] = []
  for (let i = 0; i < trackHeight; i++) {
    if (i >= thumbPosition && i < thumbPosition + thumbHeight) {
      scrollbar.push('█')
    } else {
      scrollbar.push('░')
    }
  }

  const showScrollbar = contentHeight > viewportHeight
  const scrollbarColor = borderColor(isFocused)

  return (
    <Box
      flexDirection="row"
      height={height}
      borderStyle="round"
      borderColor={scrollbarColor}
    >
      {/* Content area */}
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {children}
      </Box>

      {/* Scrollbar */}
      {showScrollbar && (
        <Box flexDirection="column" width={1}>
          {scrollbar.map((char, i) => (
            <Text key={i} color={scrollbarColor}>
              {char}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  )
}
