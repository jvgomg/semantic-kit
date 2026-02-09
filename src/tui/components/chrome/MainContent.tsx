/**
 * Main content area - thin wrapper around ViewRenderer.
 * ViewRenderer reads its own state from atoms.
 */
import { ViewRenderer } from '../view-display/index.js'

export interface MainContentProps {
  height: number
  width: number
}

export function MainContent({ height, width }: MainContentProps) {
  return <ViewRenderer height={height} width={width} />
}
