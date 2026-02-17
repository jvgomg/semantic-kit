/**
 * Reader View - Shows how browser reader modes see the page content.
 */
import { fetchReader } from '@webspecs/core'
import type { ReaderResult } from '@webspecs/core'
import { ReaderViewContent } from './components/ReaderViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

export const readerView: ViewDefinition<ReaderResult> = {
  id: 'reader-view',
  label: 'Reader',
  description:
    'Shows how browser reader modes see your page content (Safari Reader, Pocket, etc.).',
  category: 'lens',
  fetch: fetchReader,
  Component: ReaderViewContent,
}

// Self-register
registerView(readerView)
