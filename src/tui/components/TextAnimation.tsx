import React, { useEffect, useMemo, useState } from 'react'
import { Box, Text } from 'ink'

export type AnimationState = 'start' | 'play' | 'end'

export interface TextAnimationProps {
  /** Multi-line string where each line is an animation frame */
  animation: string
  /** Animation state: 'start' shows first frame, 'play' cycles, 'end' shows last frame, or a number for a specific frame index */
  state: AnimationState | number
  /** Milliseconds between frames (default: 500) */
  speed?: number
  /** Optional color for the text */
  color?: string
}

/**
 * Displays a text-based animation by cycling through lines of a string.
 * Each line in the animation string represents one frame.
 */
export function TextAnimation({
  animation,
  state,
  speed = 500,
  color,
}: TextAnimationProps) {
  const frames = useMemo(
    () => animation.split('\n').filter((line) => line.length > 0),
    [animation],
  )
  const frameCount = frames.length

  // Calculate the widest frame to set consistent width
  const width = useMemo(
    () => Math.max(...frames.map((frame) => frame.length)),
    [frames],
  )

  const [frameIndex, setFrameIndex] = useState(0)

  // Handle animation state changes
  useEffect(() => {
    if (typeof state === 'number') {
      setFrameIndex(Math.max(0, Math.min(state, frameCount - 1)))
    } else if (state === 'start') {
      setFrameIndex(0)
    } else if (state === 'end') {
      setFrameIndex(frameCount - 1)
    }
  }, [state, frameCount])

  // Animation timer (only runs when state is 'play')
  useEffect(() => {
    if (typeof state === 'number' || state !== 'play' || frameCount <= 1) {
      return
    }

    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frameCount)
    }, speed)

    return () => clearInterval(interval)
  }, [state, speed, frameCount])

  const currentFrame = frames[frameIndex] ?? ''

  return (
    <Box width={width}>
      <Text color={color}>{currentFrame.padEnd(width)}</Text>
    </Box>
  )
}
