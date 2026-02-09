/**
 * Sitemap-related atoms for caching and loading sitemap data.
 */
import { atom } from 'jotai'
import { fetchSitemap, type SitemapFetchResult } from '../../../lib/sitemap.js'

/** Cache of fetched sitemaps keyed by URL */
export const sitemapCacheAtom = atom<Map<string, SitemapFetchResult>>(new Map())

/** Whether a sitemap fetch is in progress */
export const sitemapLoadingAtom = atom(false)

/** Currently active sitemap URL being viewed */
export const activeSitemapUrlAtom = atom<string>('')

/** Selected index in the flattened sitemap tree */
export const sitemapSelectedIndexAtom = atom(0)

/** Set of expanded folder paths in the sitemap tree */
export const sitemapExpandedPathsAtom = atom<Set<string>>(new Set<string>())

/** Async action to fetch sitemap (checks cache first) */
export const fetchSitemapAtom = atom(
  null,
  async (get, set, sitemapUrl: string) => {
    const cache = get(sitemapCacheAtom)
    if (cache.has(sitemapUrl)) {
      set(activeSitemapUrlAtom, sitemapUrl)
      return
    }

    set(sitemapLoadingAtom, true)
    set(activeSitemapUrlAtom, sitemapUrl)
    try {
      const result = await fetchSitemap(sitemapUrl)
      set(sitemapCacheAtom, (prev) => {
        const newCache = new Map(prev)
        newCache.set(sitemapUrl, result)
        return newCache
      })
    } finally {
      set(sitemapLoadingAtom, false)
    }
  },
)

/** Derived atom to get the current sitemap data */
export const activeSitemapDataAtom = atom((get) => {
  const url = get(activeSitemapUrlAtom)
  const cache = get(sitemapCacheAtom)
  return url ? cache.get(url) ?? null : null
})

/** Reset sitemap selection state (when switching sitemaps) */
export const resetSitemapSelectionAtom = atom(null, (_get, set) => {
  set(sitemapSelectedIndexAtom, 0)
  set(sitemapExpandedPathsAtom, new Set())
})
