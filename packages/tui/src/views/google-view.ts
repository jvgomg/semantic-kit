/**
 * Google View - Shows how Googlebot sees your page.
 */
import { fetchGoogle } from '@webspecs/core'
import type { GoogleResult } from '@webspecs/core'
import { GoogleViewContent } from './components/GoogleViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

export const googleView: ViewDefinition<GoogleResult> = {
  id: 'google-view',
  label: 'Google',
  description:
    'Shows how Googlebot sees your page (metadata, structured data, heading structure).',
  category: 'lens',
  fetch: fetchGoogle,
  Component: GoogleViewContent,
}

// Self-register
registerView(googleView)
