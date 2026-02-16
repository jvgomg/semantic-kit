import type { OutputModeOptions } from '../../lib/output-mode.js'

export interface FetchOptions extends OutputModeOptions {
  out?: string
  stream?: boolean
}

export interface FetchResult {
  prettyHtml: string
  wasMalformed: boolean
}
