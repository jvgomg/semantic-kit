/**
 * URL Bar component using ink-text-input with local dirty state management.
 *
 * Behavior:
 * - Typing updates local state only, not app state
 * - Shows ↵ indicator when input is dirty (uncommitted changes)
 * - Enter commits the change to app state
 * - Escape clears dirty state (reverts to app state)
 * - When unfocused: shows app state URL
 * - When refocused: restores dirty state if it exists
 */
import React, { useEffect, useState } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import { useTrackedFocus } from '../../state/index.js'
import { SpecsAnimation, type InputState } from '../SpecsAnimation.jsx'
import { borderColor, colors } from '../../theme.js'

export interface UrlBarProps {
  url: string
  onUrlChange: (url: string) => void
  onSubmit: () => void
  width?: number
}

export function UrlBar({ url, onUrlChange, onSubmit, width }: UrlBarProps) {
  const { isFocused, isActive } = useTrackedFocus('url')

  // Local input state (dirty state) - persists even when unfocused
  const [inputValue, setInputValue] = useState(url)

  // Track if user has actually typed (to distinguish from external URL changes)
  const [userHasEdited, setUserHasEdited] = useState(false)

  // Track if we have uncommitted changes (for visual indicator)
  const isDirty = inputValue !== url

  // Sync with app state when URL changes externally (e.g., from URL list selection)
  // Only sync if we're not focused AND user hasn't manually edited
  useEffect(() => {
    if (!isFocused && !userHasEdited) {
      setInputValue(url)
    }
  }, [url, isFocused, userHasEdited])

  // Handle user typing
  const handleInputChange = (value: string) => {
    setInputValue(value)
    setUserHasEdited(true)
  }

  // Handle Escape to clear dirty state
  useInput(
    (_input, key) => {
      if (key.escape) {
        setInputValue(url) // Reset to app state
        setUserHasEdited(false)
      }
    },
    { isActive },
  )

  // Handle submit - commit dirty state to app
  const handleSubmit = () => {
    if (inputValue !== url) {
      onUrlChange(inputValue)
    }
    setUserHasEdited(false)
    onSubmit()
  }

  // Determine animation state based on input state
  const hasResult = Boolean(url)
  const animationState: InputState = isFocused
    ? isDirty
      ? hasResult
        ? 'dirty'
        : 'dirty-fresh'
      : hasResult
        ? 'focused'
        : 'focused-fresh'
    : hasResult
      ? 'complete'
      : 'idle'

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={borderColor(isFocused)}
      paddingX={1}
      width={width}
    >
      <Box gap={2}>
        <SpecsAnimation state={animationState} />
        <Box>
          <Text color={colors.muted}>URL: </Text>
          {isFocused ? (
            <>
              <TextInput
                value={inputValue}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                focus={isActive}
                placeholder="Enter URL..."
              />
              {isDirty && <Text color={colors.highlight}> ↵</Text>}
            </>
          ) : (
            <Text color={url ? colors.text : colors.muted}>
              {url || 'Press g to enter URL'}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  )
}
