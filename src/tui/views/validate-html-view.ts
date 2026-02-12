/**
 * Validate HTML View - Shows HTML validation results.
 */
import type { Report } from 'html-validate'

import { fetchValidateHtml } from '../../commands/validate-html/index.js'
import { ValidateHtmlViewContent } from './components/ValidateHtmlViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

export const validateHtmlView: ViewDefinition<Report> = {
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
