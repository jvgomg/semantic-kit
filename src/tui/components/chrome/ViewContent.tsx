import React from 'react'
import { Text } from 'ink'
import type { ViewState } from '../../state/index.js'
import { getView } from '../../views/index.js'

interface ViewContentProps {
  viewId: string
  viewState: ViewState
  url: string
  activeSubTab?: string | null
}

/**
 * Generate loading content
 */
function generateLoadingContent(url: string): string[] {
  return ['', '  Loading...', '', `  Fetching: ${url}`, '']
}

/**
 * Generate error content
 */
function generateErrorContent(error: string): string[] {
  return [
    '',
    '  ⚠ Error',
    '',
    `  ${error}`,
    '',
    '  Try a different URL or check your connection.',
    '',
  ]
}

/**
 * Generate prompt to enter URL
 */
function generateEnterUrlPrompt(label: string): string[] {
  return [
    '═══════════════════════════════════════════════',
    `  ${label}`,
    '═══════════════════════════════════════════════',
    '',
    'Enter a URL above and press Enter to analyze.',
    '',
  ]
}

/**
 * Generic view content renderer.
 * Handles loading, error, and success states.
 */
export function useViewContent({
  viewId,
  viewState,
  url,
  activeSubTab,
}: ViewContentProps): string[] {
  const view = getView(viewId)
  const label = view?.label ?? 'Unknown'

  // No URL entered
  if (!url) {
    return generateEnterUrlPrompt(label)
  }

  // Loading state
  if (viewState.status === 'loading') {
    return generateLoadingContent(url)
  }

  // Error state
  if (viewState.status === 'error') {
    return generateErrorContent(viewState.error ?? 'Unknown error')
  }

  // Success state - use view's render function (or sub-tab render if applicable)
  if (viewState.status === 'success' && viewState.data && view) {
    // Check if view has sub-tabs and an active sub-tab is specified
    if (view.subTabs && activeSubTab) {
      const subTab = view.subTabs.find((t) => t.id === activeSubTab)
      if (subTab) {
        return subTab.render(viewState.data)
      }
    }
    // Fall back to default render
    return view.render(viewState.data)
  }

  // Idle or stale - show loading
  return generateLoadingContent(url)
}

/**
 * Render content lines as Text elements
 */
export function ViewContentLines({
  lines,
  scrollOffset,
}: {
  lines: string[]
  scrollOffset: number
}) {
  return (
    <>
      {lines.map((line, index) => (
        <Text key={scrollOffset + index}>{line || ' '}</Text>
      ))}
    </>
  )
}
