import React from 'react'
import {
  TextAnimation,
  type TextAnimationProps,
  type AnimationState,
} from './TextAnimation.js'

export type InputState =
  | 'idle'
  | 'focused-fresh'
  | 'focused'
  | 'dirty-fresh'
  | 'dirty'
  | 'complete'

const INPUT_STATE_TO_FRAME: Record<InputState, number> = {
  idle: 0,
  'focused-fresh': 1,
  focused: 2,
  'dirty-fresh': 2,
  dirty: 2,
  complete: 3,
}

type SpecsAnimationProps = Omit<TextAnimationProps, 'animation' | 'state'> & {
  state: AnimationState | InputState
}

const SPECS_ANIMATION = `
(•_•)
( •_•)
( •_•)>⌐■-■
(⌐■_■)
`

/**
 * The classic "deal with it" specs animation.
 *
 * Supports both animation states ('start', 'play', 'end') and
 * input states ('idle', 'focused', 'dirty', 'complete') which map to specific frames.
 */
export function SpecsAnimation({
  state,
  speed = 500,
  color,
}: SpecsAnimationProps) {
  const resolvedState =
    state in INPUT_STATE_TO_FRAME
      ? INPUT_STATE_TO_FRAME[state as InputState]
      : (state as AnimationState)

  return (
    <TextAnimation
      animation={SPECS_ANIMATION}
      state={resolvedState}
      speed={speed}
      color={color}
    />
  )
}
