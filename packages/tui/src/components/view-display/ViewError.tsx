/**
 * ViewError - Shown when a fetch or processing error occurs.
 */
import type { ReactNode } from 'react'
import { useSemanticColors } from '../../theme.js'

export interface ViewErrorProps {
  /** Error message to display */
  error: string
}

export function ViewError({ error }: ViewErrorProps): ReactNode {
  const colors = useSemanticColors()

  return (
    <box flexDirection="column" paddingTop={1} paddingLeft={2}>
      <text fg={colors.textError}>Error</text>
      <text />
      <text fg={colors.text}>{error}</text>
      <text />
      <text fg={colors.textHint}>
        Try a different URL or check your connection.
      </text>
    </box>
  )
}
