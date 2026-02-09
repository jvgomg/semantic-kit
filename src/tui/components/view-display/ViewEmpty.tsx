/**
 * ViewEmpty - Shown when no URL has been entered.
 */
import type { ReactNode } from 'react'
import { colors } from '../../theme.js'

export interface ViewEmptyProps {
  /** View label to display */
  label: string
}

export function ViewEmpty({ label }: ViewEmptyProps): ReactNode {
  return (
    <box flexDirection="column" paddingTop={1} paddingLeft={2}>
      <text fg={colors.muted}>{'═'.repeat(47)}</text>
      <text fg={colors.text}>  {label}</text>
      <text fg={colors.muted}>{'═'.repeat(47)}</text>
      <text />
      <text fg={colors.textHint}>Enter a URL above and press Enter to analyze.</text>
    </box>
  )
}
