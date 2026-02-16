/**
 * Google View - Shows how Googlebot sees your page.
 */
import { fetchGoogle } from '@webspecs/cli/commands/google/index.js'
import type { GoogleResult } from '@webspecs/cli/commands/google/types.js'
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
