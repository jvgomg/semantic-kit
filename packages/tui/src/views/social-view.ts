/**
 * Social View - Shows how social platforms see your page.
 */
import { fetchSocial } from '@webspecs/core'
import type { SocialResult } from '@webspecs/core'
import { SocialViewContent } from './components/SocialViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

export const socialView: ViewDefinition<SocialResult> = {
  id: 'social-view',
  label: 'Social',
  description:
    'Shows how social platforms see your page for link previews (Open Graph, Twitter Cards).',
  category: 'lens',
  fetch: fetchSocial,
  Component: SocialViewContent,
}

// Self-register
registerView(socialView)
