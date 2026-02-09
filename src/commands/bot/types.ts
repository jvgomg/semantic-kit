import type { OutputModeOptions } from '../../lib/output-mode.js'
import type { OutputFormat } from '../../lib/validation.js'

export const VALID_FORMATS: readonly OutputFormat[] = ['full', 'compact', 'json']

export interface BotOptions extends OutputModeOptions {
  content?: boolean
  timeout?: string
  format?: string
}

export interface FetchBotOptions {
  timeoutMs?: number
}

export interface BotFormatOptions {
  format: OutputFormat
  showContent?: boolean
}
