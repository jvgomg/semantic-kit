import type { OutputModeOptions } from '../../lib/output-mode.js'
import type { OutputFormat } from '../../lib/validation.js'

export const VALID_FORMATS: readonly OutputFormat[] = ['full', 'compact', 'json']

export interface SchemaOptions extends OutputModeOptions {
  format?: string
}

export interface StructuredData {
  metatags: Record<string, string[]>
  jsonld: Record<string, unknown[]>
  microdata: Record<string, unknown[]>
  rdfa: Record<string, unknown[]>
}

export interface MetatagGroup {
  name: string
  prefix: string
  tags: Array<{ name: string; value: string }>
  missingRequired: string[]
  missingRecommended: string[]
  isComplete: boolean
}

/**
 * Required and recommended tags for Open Graph
 */
export const OPEN_GRAPH_TAGS = {
  required: ['og:title', 'og:type', 'og:image', 'og:url'],
  recommended: ['og:description', 'og:site_name', 'og:locale'],
}

/**
 * Required and recommended tags for Twitter Cards
 */
export const TWITTER_CARD_TAGS = {
  required: ['twitter:card', 'twitter:title', 'twitter:description'],
  recommended: ['twitter:image', 'twitter:site', 'twitter:creator'],
}
