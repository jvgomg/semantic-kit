/**
 * Bottom status bar with contextual hints.
 * Uses focus atom to show appropriate hints.
 */
import { useAtomValue } from 'jotai'
import { focusedRegionAtom, type FocusRegion } from '../../state/index.js'
import { useSemanticColors } from '../../theme.js'

export function StatusBar() {
  const colors = useSemanticColors()
  const focusedRegion = useAtomValue(focusedRegionAtom)

  const hints: Record<FocusRegion, string[]> = {
    url: ['Enter: confirm URL', 'Tab: next region'],
    menu: ['↑↓: navigate', 'Tab: next region'],
    main: ['↑↓/PgUp/PgDn: scroll', 'Tab: next region'],
  }

  const persistent: string[] = ['?: help', 'q: quit']

  return (
    <box
      paddingLeft={1}
      paddingRight={1}
      justifyContent="center"
      flexDirection="row"
      gap={3}
    >
      {[...hints[focusedRegion], ...persistent].map((txt) => (
        <text key={txt} fg={colors.textHint}>
          {txt}
        </text>
      ))}
    </box>
  )
}
