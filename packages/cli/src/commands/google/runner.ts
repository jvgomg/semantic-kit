/**
 * Google lens runner - fetches and analyzes a page from Google's perspective.
 * Thin wrapper around core analyzeForGoogle function.
 */

import { analyzeForGoogle } from '@webspecs/core'
import type { GoogleResult } from './types.js'

/**
 * Fetch and analyze a page from Google's perspective.
 * Returns metadata, schemas, and heading structure.
 */
export async function fetchGoogle(target: string): Promise<GoogleResult> {
  return analyzeForGoogle(target)
}
