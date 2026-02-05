/**
 * ScrollBar and ScrollBarBox components for Ink CLI applications.
 * Based on ink-scroll-bar by ByteLandTechnology, vendored for npm availability.
 *
 * Provides a vertical scroll bar indicator that can be used in terminal user interfaces.
 * Supports two rendering modes:
 * - Border mode: Integrates with container borders, showing corner characters
 * - Inset mode: Renders inside the content area without corners
 */

import React, { useMemo } from 'react'
import { Box, type BoxProps, Text } from 'ink'

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Placement mode for the scroll bar.
 */
export type ScrollBarPlacement = 'left' | 'right' | 'inset'

/**
 * Visual style for the scroll bar.
 */
export type ScrollBarStyle =
  | BoxProps['borderStyle']
  | 'block'
  | 'line'
  | 'thick'
  | 'dots'

/**
 * Props for the ScrollBar component.
 */
export interface ScrollBarProps {
  /** Total height of the scrollable content in lines */
  contentHeight: number
  /** Height of the visible viewport in lines */
  viewportHeight: number
  /** Current scroll position (offset from top) in lines */
  scrollOffset: number
  /** Placement mode for the scroll bar */
  placement?: ScrollBarPlacement
  /** Visual style for the scroll bar */
  style?: ScrollBarStyle
  /** Custom character for the thumb indicator in inset mode */
  thumbChar?: string
  /** Custom character for the track background in inset mode */
  trackChar?: string
  /** Whether to hide the scroll bar when scrolling is not needed */
  autoHide?: boolean
  /** Color for the scroll bar characters */
  color?: string
  /** Whether to render the scroll bar with dimmed styling */
  dimColor?: boolean
}

// ============================================================================
// Character Definitions
// ============================================================================

interface StyleCharacters {
  track: string
  thumb: string
  upperThumb?: string
  lowerThumb?: string
}

interface CornerCharacters {
  topLeft: string
  topRight: string
  bottomLeft: string
  bottomRight: string
}

const STYLE_CHARS: Record<string, StyleCharacters> = {
  // Border mode styles
  single: { track: '│', thumb: '┃', upperThumb: '╿', lowerThumb: '╽' },
  double: { track: '║', thumb: '┃' },
  round: { track: '│', thumb: '┃', upperThumb: '╿', lowerThumb: '╽' },
  bold: { track: '┃', thumb: '│', upperThumb: '╽', lowerThumb: '╿' },
  singleDouble: { track: '║', thumb: '┃' },
  doubleSingle: { track: '│', thumb: '┃', upperThumb: '╿', lowerThumb: '╽' },
  classic: { track: '|', thumb: '┃' },
  arrow: { track: '|', thumb: '┃', upperThumb: '╿', lowerThumb: '╽' },
  // Inset mode styles
  block: { track: '░', thumb: '█' },
  line: { track: ' ', thumb: '│' },
  thick: { track: '╏', thumb: '┃' },
  dots: { track: '·', thumb: '●' },
}

const CORNER_CHARS: Record<string, CornerCharacters> = {
  single: { topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘' },
  double: { topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝' },
  round: { topLeft: '╭', topRight: '╮', bottomLeft: '╰', bottomRight: '╯' },
  bold: { topLeft: '┏', topRight: '┓', bottomLeft: '┗', bottomRight: '┛' },
  singleDouble: {
    topLeft: '╓',
    topRight: '╖',
    bottomLeft: '╙',
    bottomRight: '╜',
  },
  doubleSingle: {
    topLeft: '╒',
    topRight: '╕',
    bottomLeft: '╘',
    bottomRight: '╛',
  },
  classic: { topLeft: '+', topRight: '+', bottomLeft: '+', bottomRight: '+' },
  arrow: { topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘' },
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStyleChars(
  style: ScrollBarStyle | undefined,
  isInset: boolean,
): Required<StyleCharacters> {
  const defaultStyle = isInset ? 'block' : 'single'
  const chars = style
    ? (STYLE_CHARS[style as string] ?? STYLE_CHARS[defaultStyle]!)
    : STYLE_CHARS[defaultStyle]!

  return {
    track: chars.track,
    thumb: chars.thumb,
    upperThumb: chars.upperThumb ?? chars.thumb,
    lowerThumb: chars.lowerThumb ?? chars.thumb,
  }
}

function getCornerChars(style: ScrollBarStyle | undefined): CornerCharacters {
  const defaultCorners: CornerCharacters = {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
  }
  if (!style) return defaultCorners
  return CORNER_CHARS[style as string] ?? defaultCorners
}

// ============================================================================
// Component
// ============================================================================

/**
 * A vertical scroll bar indicator for Ink CLI applications.
 *
 * Uses half-line precision with special Unicode characters for smoother
 * visual feedback.
 */
export function ScrollBar({
  contentHeight,
  viewportHeight,
  scrollOffset,
  placement = 'right',
  style,
  thumbChar,
  trackChar,
  autoHide = false,
  color,
  dimColor,
}: ScrollBarProps) {
  const isInset = placement === 'inset'
  const isLeft = placement === 'left'
  const needsScrolling = contentHeight > viewportHeight

  const shouldHide = isInset && autoHide && !needsScrolling

  const scrollBarChars = useMemo(() => {
    if (shouldHide || viewportHeight <= 0) {
      return []
    }

    const styleChars = getStyleChars(style, isInset)
    const chars = isInset
      ? {
          track: trackChar ?? styleChars.track,
          thumb: thumbChar ?? styleChars.thumb,
          upperThumb: thumbChar ?? styleChars.upperThumb,
          lowerThumb: thumbChar ?? styleChars.lowerThumb,
        }
      : styleChars

    const result: { char: string; isThumb: boolean }[] = []

    if (!needsScrolling) {
      for (let i = 0; i < viewportHeight; i++) {
        result.push({ char: chars.track, isThumb: false })
      }
      return result
    }

    const hasHalfLinePrecision =
      chars.upperThumb !== chars.thumb || chars.lowerThumb !== chars.thumb

    const totalHalfSteps = viewportHeight * 2
    const effectiveContentHeight = Math.max(contentHeight, viewportHeight, 1)
    const viewportRatio = Math.min(viewportHeight / effectiveContentHeight, 1)

    let thumbLengthHalf = Math.max(
      2,
      Math.round(totalHalfSteps * viewportRatio),
    )

    if (!hasHalfLinePrecision) {
      thumbLengthHalf = Math.max(2, Math.round(thumbLengthHalf / 2) * 2)
    }

    const maxScrollOffset = Math.max(contentHeight - viewportHeight, 1)
    const scrollProgress = Math.min(
      Math.max(scrollOffset / maxScrollOffset, 0),
      1,
    )
    const maxThumbStartHalf = totalHalfSteps - thumbLengthHalf
    let thumbStartHalf = Math.round(scrollProgress * maxThumbStartHalf)

    if (!hasHalfLinePrecision) {
      thumbStartHalf = Math.round(thumbStartHalf / 2) * 2
    }

    const thumbEndHalf = thumbStartHalf + thumbLengthHalf

    for (let row = 0; row < viewportHeight; row++) {
      const rowUpperHalf = row * 2
      const rowLowerHalf = row * 2 + 1

      const hasThumbInUpper =
        thumbStartHalf <= rowUpperHalf && rowUpperHalf < thumbEndHalf
      const hasThumbInLower =
        thumbStartHalf <= rowLowerHalf && rowLowerHalf < thumbEndHalf

      if (hasThumbInUpper && hasThumbInLower) {
        result.push({ char: chars.thumb, isThumb: true })
      } else if (!hasThumbInUpper && !hasThumbInLower) {
        result.push({ char: chars.track, isThumb: false })
      } else if (hasThumbInLower && !hasThumbInUpper) {
        result.push({ char: chars.lowerThumb, isThumb: true })
      } else {
        result.push({ char: chars.upperThumb, isThumb: true })
      }
    }

    return result
  }, [
    shouldHide,
    viewportHeight,
    contentHeight,
    scrollOffset,
    style,
    thumbChar,
    trackChar,
    isInset,
    needsScrolling,
  ])

  if (shouldHide || viewportHeight <= 0) {
    return null
  }

  // Render inset mode (no corners)
  if (isInset) {
    return (
      <Box flexDirection="column" width={1} flexShrink={0}>
        {scrollBarChars.map((item, index) => (
          <Text key={index} color={color} dimColor={dimColor}>
            {item.char}
          </Text>
        ))}
      </Box>
    )
  }

  // Render border mode (with corners)
  const corners = getCornerChars(style)
  const topCorner = isLeft ? corners.topLeft : corners.topRight
  const bottomCorner = isLeft ? corners.bottomLeft : corners.bottomRight

  return (
    <Box flexDirection="column" width={1} flexShrink={0}>
      <Text color={color} dimColor={dimColor}>
        {topCorner}
      </Text>
      {scrollBarChars.map((item, index) => (
        <Text key={index} color={color} dimColor={dimColor}>
          {item.char}
        </Text>
      ))}
      <Text color={color} dimColor={dimColor}>
        {bottomCorner}
      </Text>
    </Box>
  )
}

// ============================================================================
// ScrollBarBox Component
// ============================================================================

/**
 * Props for the ScrollBarBox component.
 */
export interface ScrollBarBoxProps extends BoxProps {
  /** Total height of the scrollable content in lines */
  contentHeight: number
  /** Height of the visible viewport in lines */
  viewportHeight: number
  /** Current scroll position (offset from top) in lines */
  scrollOffset: number
  /** Which side of the box to display the scroll bar */
  scrollBarPosition?: 'left' | 'right'
  /** Whether to hide thumb indicator when content fits in viewport */
  scrollBarAutoHide?: boolean
  /** The content to display inside the box */
  children?: React.ReactNode
}

/**
 * A Box component with an integrated scroll bar on one border.
 *
 * The scroll bar replaces one side of the border and displays the current
 * scroll position relative to the total content height.
 */
export function ScrollBarBox({
  contentHeight,
  viewportHeight,
  scrollOffset,
  scrollBarPosition = 'right',
  scrollBarAutoHide = false,
  borderStyle = 'single',
  borderColor,
  borderDimColor,
  borderLeftColor,
  borderRightColor,
  borderLeftDimColor,
  borderRightDimColor,
  height,
  children,
  ...boxProps
}: ScrollBarBoxProps) {
  const isLeft = scrollBarPosition === 'left'
  const scrollBarPlacement: ScrollBarPlacement = isLeft ? 'left' : 'right'

  // Determine scroll bar colors based on position and inherited border colors
  const scrollBarColor = isLeft
    ? (borderLeftColor ?? borderColor)
    : (borderRightColor ?? borderColor)

  const scrollBarDimColor = isLeft
    ? (borderLeftDimColor ?? borderDimColor)
    : (borderRightDimColor ?? borderDimColor)

  return (
    <Box flexDirection="row" height={height} {...boxProps}>
      {/* Left scroll bar (replaces left border) */}
      {isLeft && (
        <ScrollBar
          placement={scrollBarPlacement}
          style={borderStyle}
          color={scrollBarColor}
          dimColor={scrollBarDimColor}
          contentHeight={contentHeight}
          viewportHeight={viewportHeight}
          scrollOffset={scrollOffset}
        />
      )}

      {/* Content container with remaining borders */}
      <Box
        flexGrow={1}
        overflow="hidden"
        borderStyle={borderStyle}
        borderColor={borderColor}
        borderDimColor={borderDimColor}
        borderLeft={!isLeft}
        borderRight={isLeft}
      >
        {children}
      </Box>

      {/* Right scroll bar (replaces right border) */}
      {!isLeft && (
        <ScrollBar
          placement={scrollBarPlacement}
          style={borderStyle}
          color={scrollBarColor}
          dimColor={scrollBarDimColor}
          contentHeight={contentHeight}
          viewportHeight={viewportHeight}
          scrollOffset={scrollOffset}
        />
      )}
    </Box>
  )
}
