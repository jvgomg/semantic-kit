/**
 * Bottom status bar with contextual hints.
 * Uses focus atoms to show appropriate hints based on focus scope.
 */
import { useAtomValue } from 'jotai'
import {
  focusedRegionAtom,
  isAppScopeActiveAtom,
  type AppFocusRegion,
} from '../../state/index.js'
import { useSemanticColors } from '../../theme.js'

export function StatusBar() {
  const colors = useSemanticColors()
  const focusedRegion = useAtomValue(focusedRegionAtom)
  const isAppScopeActive = useAtomValue(isAppScopeActiveAtom)

  // Hints for app-level focus regions
  const appHints: Record<AppFocusRegion, string[]> = {
    url: ['Enter: confirm URL', 'Tab: next region'],
    menu: ['↑↓: navigate', 'Tab: next region'],
    main: ['↑↓/PgUp/PgDn: scroll', 'Tab: next region'],
  }

  const persistent: string[] = ['?: help', 'q: quit']

  // When a dialog is open, show generic hints
  // (dialog-specific hints are shown in dialog footer)
  if (!isAppScopeActive) {
    return (
      <box
        paddingLeft={1}
        paddingRight={1}
        justifyContent="center"
        flexDirection="row"
        gap={3}
      >
        {persistent.map((txt) => (
          <text key={txt} fg={colors.textMuted}>
            {txt}
          </text>
        ))}
      </box>
    )
  }

  // Get hints for the current app focus region
  const regionHints = appHints[focusedRegion as AppFocusRegion] ?? []

  return (
    <box
      paddingLeft={1}
      paddingRight={1}
      justifyContent="center"
      flexDirection="row"
      gap={3}
    >
      {[...regionHints, ...persistent].map((txt) => (
        <text key={txt} fg={colors.textMuted}>
          {txt}
        </text>
      ))}
    </box>
  )
}
