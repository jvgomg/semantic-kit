/**
 * Bottom status bar with contextual hints.
 * Uses focus atom to show appropriate hints.
 */
import React from 'react'
import { Box, Text } from 'ink'
import { useAtomValue } from 'jotai'
import { focusedRegionAtom, type FocusRegion } from '../../state/index.js'
import { colors } from '../../theme.js'

export function StatusBar() {
  const focusedRegion = useAtomValue(focusedRegionAtom)

  const hints: Record<FocusRegion, string> = {
    url: 'Enter: confirm URL | Tab: next region',
    menu: '↑↓: navigate | Tab: next region',
    main: '↑↓/PgUp/PgDn: scroll | Tab: next region',
  }

  return (
    <Box paddingX={1} justifyContent="space-between">
      <Text color={colors.textHint}>{hints[focusedRegion]}</Text>
      <Text color={colors.textHint}>?: help | q: quit</Text>
    </Box>
  )
}
