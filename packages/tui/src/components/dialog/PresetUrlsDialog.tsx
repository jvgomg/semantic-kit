/**
 * PresetUrlsDialog - Dialog for browsing config preset URLs.
 *
 * Reuses the ConfigBrowser component for tree navigation.
 * Shows "No config loaded" message when hasConfigAtom is false.
 * On selection: sets URL, clears dialogs, restores focus.
 */
import { useCallback } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { DialogPanel } from './DialogPanel.js'
import { useDialog } from './DialogContext.js'
import { useDialogGutter } from './DialogGutterContext.js'
import { useSemanticColors } from '../../theme.js'
import { ConfigBrowser } from '../ui/ConfigBrowser.js'
import { DIALOG_MAX_HEIGHT } from './constants.js'
import {
  hasConfigAtom,
  flattenedConfigTreeAtom,
  configSelectedIndexAtom,
  configExpandedGroupsAtom,
  setUrlAtom,
  useFocusManager,
} from '../../state/index.js'
import { clearDialogsAtom } from '../../state/dialog/index.js'

export function PresetUrlsDialog() {
  const colors = useSemanticColors()
  const { gutter } = useDialogGutter()
  const { title, headerHint, handleClose } = useDialog('Preset URLs')
  const { focus, enableFocus } = useFocusManager()

  // Atoms
  const hasConfig = useAtomValue(hasConfigAtom)
  const flattenedNodes = useAtomValue(flattenedConfigTreeAtom)
  const [selectedIndex, setSelectedIndex] = useAtom(configSelectedIndexAtom)
  const [expandedGroups, setExpandedGroups] = useAtom(configExpandedGroupsAtom)
  const setUrl = useSetAtom(setUrlAtom)
  const clearDialogs = useSetAtom(clearDialogsAtom)

  // Handle URL selection
  const handleSelect = useCallback(
    (url: string) => {
      setUrl(url)
      clearDialogs()
      enableFocus()
      focus('menu')
    },
    [setUrl, clearDialogs, enableFocus, focus],
  )

  // No config loaded state
  if (!hasConfig) {
    return (
      <DialogPanel
        title={title}
        headerHint={headerHint}
        width={50}
        onClose={handleClose}
      >
        <box flexDirection="column" paddingLeft={gutter} paddingRight={gutter}>
          <text fg={colors.textMuted}>No config loaded.</text>
          <text fg={colors.textMuted}>
            Use --config flag to load a YAML config file.
          </text>
        </box>
      </DialogPanel>
    )
  }

  // Calculate available height for tree content
  // DIALOG_MAX_HEIGHT minus header/footer chrome
  const contentHeight = Math.max(1, DIALOG_MAX_HEIGHT - 4)

  return (
    <DialogPanel
      title={title}
      headerHint={headerHint}
      footer="↑↓: navigate  ←→: fold/unfold  Enter: select"
      onClose={handleClose}
    >
      <box paddingLeft={gutter} paddingRight={gutter}>
        <ConfigBrowser
          flattenedNodes={flattenedNodes}
          selectedIndex={selectedIndex}
          expandedGroups={expandedGroups}
          onSelectedIndexChange={setSelectedIndex}
          onExpandedGroupsChange={setExpandedGroups}
          onSelect={handleSelect}
          height={contentHeight}
          isFocused={true}
        />
      </box>
    </DialogPanel>
  )
}
