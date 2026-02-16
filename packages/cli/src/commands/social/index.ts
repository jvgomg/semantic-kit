// Public API
export { socialCommand } from './command.js'
export { fetchSocial } from './runner.js'
export { formatSocialOutput, buildIssues } from './formatters.js'

// Types
export type {
  SocialOptions,
  SocialResult,
  SocialTagGroup,
  SocialPreview,
} from './types.js'
export { VALID_FORMATS } from './types.js'

// Re-export tag requirements from shared library
export {
  OPEN_GRAPH_REQUIREMENTS,
  TWITTER_CARD_REQUIREMENTS,
} from '@webspecs/core'
