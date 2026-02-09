/**
 * ViewRenderer - handles content rendering decisions.
 *
 * Renders view Components directly. Each view manages its own layout.
 * Reads view from atoms - only receives layout dimensions as props.
 */
import type { ReactNode } from 'react'
import { useAtomValue } from 'jotai'
import { urlAtom, useFocus, activeViewAtom } from '../../state/index.js'
import { colors } from '../../theme.js'
import { ViewEmpty } from './ViewEmpty.js'
import { ViewError } from './ViewError.js'

export interface ViewRendererProps {
  height: number
  width: number
}

function ViewLoading({ url }: { url: string }): ReactNode {
  return (
    <box flexDirection="column" paddingTop={1} paddingLeft={2}>
      <text fg={colors.text}>Loading...</text>
      <text />
      <text fg={colors.textHint}>Fetching: {url}</text>
    </box>
  )
}

export function ViewRenderer({ height, width }: ViewRendererProps) {
  const { focus } = useFocus('main')

  // Read view with data from atom
  const view = useAtomValue(activeViewAtom)
  const url = useAtomValue(urlAtom)

  // Layout calculations
  const headerHeight = 2 // border + title
  const contentHeight = Math.max(1, height - headerHeight)

  // Determine what to render
  let content: ReactNode

  if (!url) {
    // No URL entered
    content = <ViewEmpty label={view?.label ?? 'Unknown'} />
  } else if (view?.data.status === 'loading' || view?.data.status === 'idle') {
    // Loading or about to load
    content = <ViewLoading url={url} />
  } else if (view?.data.status === 'error') {
    // Error occurred
    content = <ViewError error={view.data.error ?? 'Unknown error'} />
  } else if (
    view?.data.status === 'success' &&
    view.data.data !== null &&
    view.Component
  ) {
    // Success - render the view's component
    content = view.Component({ data: view.data.data, height: contentHeight })
  } else {
    // Fallback to loading
    content = <ViewLoading url={url} />
  }

  return (
    <box
      flexDirection="column"
      width={width}
      height={height}
      onMouseDown={() => focus()}
    >
      <box key={`view-${view?.id}`} flexGrow={1} height="100%">
        {content}
      </box>
    </box>
  )
}
