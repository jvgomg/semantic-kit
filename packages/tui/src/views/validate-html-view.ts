/**
 * Validate HTML View - Shows HTML validation results.
 */
import { fetchValidateHtml } from '@webspecs/core'
import type { HtmlValidateReport } from '@webspecs/core'

import { ValidateHtmlViewContent } from './components/ValidateHtmlViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

export const validateHtmlView: ViewDefinition<HtmlValidateReport> = {
  id: 'validate-html',
  label: 'HTML Validate',
  description:
    'Validates HTML markup against W3C standards and best practices.',
  category: 'tool',
  fetch: fetchValidateHtml,
  Component: ValidateHtmlViewContent,
}

// Self-register
registerView(validateHtmlView)
