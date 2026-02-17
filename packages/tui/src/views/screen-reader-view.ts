/**
 * Screen Reader View - Shows how screen readers interpret the page.
 */
import { fetchScreenReader } from '@webspecs/core'
import type { ScreenReaderResult } from '@webspecs/core'
import { ScreenReaderViewContent } from './components/ScreenReaderViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

export const screenReaderView: ViewDefinition<ScreenReaderResult> = {
  id: 'screen-reader-view',
  label: 'Screen Reader',
  description:
    'Shows how screen readers interpret your page (accessibility tree analysis).',
  category: 'lens',
  fetch: fetchScreenReader,
  Component: ScreenReaderViewContent,
}

// Self-register
registerView(screenReaderView)
