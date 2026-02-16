/**
 * URL Bar component using OpenTUI input with local dirty state management.
 *
 * Behavior:
 * - Typing updates local state only, not app state
 * - Shows indicator when input is dirty (uncommitted changes)
 * - Enter commits the change to app state
 * - Escape clears dirty state (reverts to app state)
 * - When unfocused: shows app state URL
 */
import { useKeyboard } from '@opentui/react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import {
  setUrlAtom,
  urlAtom,
  useFocus,
  useFocusManager,
} from '../../state/index.js'
import { useSemanticColors } from '../../theme.js'

export interface UrlBarProps {
  width: number
}

export function UrlBar({ width }: UrlBarProps) {
  const colors = useSemanticColors()
  const url = useAtomValue(urlAtom)
  const setUrl = useSetAtom(setUrlAtom)
  const { focus: focusManager } = useFocusManager()
  const { isFocused, isInputActive, focus } = useFocus('url')

  // Local input state - what's shown in the input
  const [inputValue, setInputValue] = useState(url)

  // Track the last URL we synced from, to detect external changes
  const lastSyncedUrlRef = useRef(url)

  // Sync with app state when URL changes externally (e.g., from URL list selection)
  // Always sync when unfocused, or when URL changed externally while focused
  useEffect(() => {
    const urlChangedExternally = url !== lastSyncedUrlRef.current

    if (!isFocused || urlChangedExternally) {
      setInputValue(url)
      lastSyncedUrlRef.current = url
    }
  }, [url, isFocused])

  // Track if we have uncommitted changes (for visual indicator)
  const isDirty = inputValue !== url

  // Handle user typing via input onChange
  const handleInputChange = (value: string) => {
    setInputValue(value)
  }

  // Handle keyboard input for escape and enter keys
  useKeyboard((event) => {
    if (!isInputActive) return

    if (event.name === 'escape') {
      // Reset to app state
      setInputValue(url)
    } else if (event.name === 'return') {
      // Submit the form
      handleSubmit()
    }
  })

  // Handle submit - commit dirty state to app
  const handleSubmit = () => {
    if (inputValue !== url) {
      setUrl(inputValue)
      lastSyncedUrlRef.current = inputValue
    }
    focusManager('menu')
  }

  return (
    <box
      flexDirection="row"
      borderStyle="rounded"
      borderColor={isFocused ? colors.borderFocused : colors.borderUnfocused}
      focusedBorderColor={colors.borderFocused}
      paddingLeft={1}
      paddingRight={1}
      width={width}
      onMouseDown={() => focus()}
      gap={2}
    >
      <text fg={colors.muted}>URL: </text>
      <>
        <box>
          <input
            width={width - 20}
            value={inputValue}
            onInput={handleInputChange}
            focused={isFocused}
            placeholder="Enter URL..."
            textColor={colors.text}
            placeholderColor={colors.muted}
            cursorColor={colors.accent}
          />
        </box>
        {isDirty && (
          <box>
            <text fg={colors.highlight}>[Enter]</text>
          </box>
        )}
      </>
    </box>
  )
}
