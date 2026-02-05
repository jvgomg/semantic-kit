/**
 * Main content area - minimal orchestration component.
 * Gets view state and delegates rendering to ViewRenderer.
 */
import React, { useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { urlAtom, setActiveSubTabAtom, useViewData } from '../../state/index.js'
import { getView } from '../../views/index.js'
import { ViewRenderer } from './ViewRenderer.js'

export interface MainContentProps {
  viewId: string
  height: number
}

export function MainContent({ viewId, height }: MainContentProps) {
  const url = useAtomValue(urlAtom)
  const setActiveSubTabAction = useSetAtom(setActiveSubTabAtom)
  const viewState = useViewData(viewId)
  const view = getView(viewId)

  const handleSubTabChange = useCallback(
    (subTabId: string) => {
      setActiveSubTabAction({ viewId, subTabId })
    },
    [viewId, setActiveSubTabAction],
  )

  return (
    <ViewRenderer
      view={view}
      viewState={viewState}
      url={url}
      activeSubTab={viewState.activeSubTab}
      height={height}
      onSubTabChange={handleSubTabChange}
    />
  )
}
