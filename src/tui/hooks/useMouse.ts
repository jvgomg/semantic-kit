import { useEffect, useRef } from 'react'
import { registerScrollHandler, registerClickHandler } from '../index.js'

export interface MouseScrollEvent {
  direction: 'up' | 'down'
  x: number
  y: number
}

export interface MouseClickEvent {
  x: number
  y: number
}

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

// Legacy alias
export type ScrollBounds = Bounds

interface UseMouseScrollOptions {
  /** Scroll anywhere regardless of cursor position */
  scrollAnywhere?: boolean
  /** Bounds of the scrollable area (used when scrollAnywhere is false) */
  bounds?: Bounds
  onScroll: (event: MouseScrollEvent) => void
}

interface UseMouseClickOptions {
  /** Only trigger if click is within these bounds */
  bounds?: Bounds
  /** Called when a click occurs (within bounds if specified) */
  onClick: (event: MouseClickEvent) => void
  /** Whether click handling is active */
  isActive?: boolean
}

function isWithinBounds(
  x: number,
  y: number,
  bounds: Bounds | undefined,
): boolean {
  if (!bounds) return true
  return (
    x >= bounds.x &&
    x < bounds.x + bounds.width &&
    y >= bounds.y &&
    y < bounds.y + bounds.height
  )
}

/**
 * Hook to handle mouse scroll wheel events in the terminal.
 * Uses the global scroll handler registry from index.tsx.
 */
export function useMouseScroll({
  scrollAnywhere = false,
  bounds,
  onScroll,
}: UseMouseScrollOptions): void {
  const onScrollRef = useRef(onScroll)
  const boundsRef = useRef(bounds)
  const scrollAnywhereRef = useRef(scrollAnywhere)

  onScrollRef.current = onScroll
  boundsRef.current = bounds
  scrollAnywhereRef.current = scrollAnywhere

  useEffect(() => {
    const handler = (direction: 'up' | 'down', x: number, y: number) => {
      // Check bounds unless scrollAnywhere is true
      if (
        !scrollAnywhereRef.current &&
        !isWithinBounds(x, y, boundsRef.current)
      ) {
        return
      }

      onScrollRef.current({ direction, x, y })
    }

    const unregister = registerScrollHandler(handler)
    return unregister
  }, [])
}

/**
 * Hook to handle mouse click events in the terminal.
 * Uses the global click handler registry from index.tsx.
 */
export function useMouseClick({
  bounds,
  onClick,
  isActive = true,
}: UseMouseClickOptions): void {
  const onClickRef = useRef(onClick)
  const boundsRef = useRef(bounds)
  const isActiveRef = useRef(isActive)

  onClickRef.current = onClick
  boundsRef.current = bounds
  isActiveRef.current = isActive

  useEffect(() => {
    const handler = (x: number, y: number) => {
      if (!isActiveRef.current) return
      if (!isWithinBounds(x, y, boundsRef.current)) return

      onClickRef.current({ x, y })
    }

    const unregister = registerClickHandler(handler)
    return unregister
  }, [])
}
