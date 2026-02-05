/**
 * Custom hook that wraps Ink's useFocus and reports focus changes to our tracking atoms.
 * This allows us to use Ink's Tab navigation while still knowing which region is focused.
 */
import { useFocus, useFocusManager } from 'ink'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { focusedRegionAtom } from '../atoms/focus.js'
import { isModalOpenAtom } from '../atoms/modal.js'
import type { FocusRegion } from '../types.js'

export function useTrackedFocus(id: FocusRegion) {
  const { isFocused } = useFocus({ id })
  const setFocusedRegion = useSetAtom(focusedRegionAtom)
  const isModalOpen = useAtomValue(isModalOpenAtom)
  const { focus } = useFocusManager()

  // Report focus changes to tracking atom
  useEffect(() => {
    if (isFocused) {
      setFocusedRegion(id)
    }
  }, [isFocused, id, setFocusedRegion])

  return {
    isFocused,
    isInputActive: !isModalOpen,
    // Combined check for useInput isActive option
    isActive: isFocused && !isModalOpen,
    // Function to programmatically focus this region
    focusSelf: () => focus(id),
  }
}
