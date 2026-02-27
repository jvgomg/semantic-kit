/**
 * RecentUrlsDialog - Dialog for selecting from recent URLs.
 *
 * Uses DialogSelect for the URL list with keyboard navigation.
 * On selection: sets URL, clears dialogs. Focus is auto-restored by scope system.
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
  useFocusScope,
} from '../../state/index.js'
import { clearDialogsAtom } from '../../state/dialog/index.js'

export function RecentUrlsDialog() {
  // Register focus scope - auto-restores previous focus on unmount
  useFocusScope({
    id: 'recent-urls-dialog',
    regions: ['list'],
    initialRegion: 'list',
  })

  const colors = useSemanticColors()
  const { gutter } = useDialogGutter()
  const { title, headerHint, handleClose } = useDialog('Recent URLs')

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

  // Handle URL selection - focus is auto-restored when dialog unmounts
  const handleSelect = useCallback(
    (_index: number, option: DialogSelectOption<string>) => {
      setUrl(option.value)
      clearDialogs()
      // Focus automatically restored when scope pops!
    },
    [setUrl, clearDialogs],
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
