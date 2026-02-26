/**
 * RecentUrlsDialog - Dialog for selecting from recent URLs.
 *
 * Uses DialogSelect for the URL list with keyboard navigation.
 * On selection: sets URL, clears dialogs, restores focus.
 */
import { useCallback, useMemo, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { DialogPanel } from './DialogPanel.js'
import { DialogSelect, type DialogSelectOption } from './DialogSelect.js'
import { useDialog } from './DialogContext.js'
import { useDialogGutter } from './DialogGutterContext.js'
import { useSemanticColors } from '../../theme.js'
import {
  recentUrlsAtom,
  setUrlAtom,
  useFocusManager,
} from '../../state/index.js'
import { clearDialogsAtom } from '../../state/dialog/index.js'

export function RecentUrlsDialog() {
  const colors = useSemanticColors()
  const { gutter } = useDialogGutter()
  const { title, headerHint, handleClose } = useDialog('Recent URLs')
  const { focus, enableFocus } = useFocusManager()

  // Atoms
  const recentUrls = useAtomValue(recentUrlsAtom)
  const setUrl = useSetAtom(setUrlAtom)
  const clearDialogs = useSetAtom(clearDialogsAtom)

  // Local state
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Convert URLs to DialogSelectOption format
  const options: DialogSelectOption<string>[] = useMemo(() => {
    return recentUrls.map((url) => ({
      label: url,
      value: url,
    }))
  }, [recentUrls])

  // Handle URL selection
  const handleSelect = useCallback(
    (_index: number, option: DialogSelectOption<string>) => {
      setUrl(option.value)
      clearDialogs()
      enableFocus()
      focus('menu')
    },
    [setUrl, clearDialogs, enableFocus, focus],
  )

  // Empty state
  if (recentUrls.length === 0) {
    return (
      <DialogPanel
        title={title}
        headerHint={headerHint}
        width={50}
        onClose={handleClose}
      >
        <box paddingLeft={gutter} paddingRight={gutter}>
          <text fg={colors.textMuted}>No recent URLs</text>
        </box>
      </DialogPanel>
    )
  }

  return (
    <DialogPanel
      title={title}
      headerHint={headerHint}
      footer="↑↓: navigate  Enter: select"
      width={60}
      onClose={handleClose}
    >
      <DialogSelect
        options={options}
        selectedIndex={selectedIndex}
        focused={true}
        onChange={(idx) => setSelectedIndex(idx)}
        onSelect={handleSelect}
        showDescription={false}
      />
    </DialogPanel>
  )
}
