/**
 * Sitemap-related atoms for caching and loading sitemap data.
 */
import { atom } from 'jotai'
import { fetchSitemap, type SitemapFetchResult } from '../../../lib/sitemap.js'

/** Cache of fetched sitemaps keyed by URL */
export const sitemapCacheAtom = atom<Map<string, SitemapFetchResult>>(new Map())

/** Whether a sitemap fetch is in progress */
export const sitemapLoadingAtom = atom(false)

/** Async action to fetch sitemap (checks cache first) */
export const fetchSitemapAtom = atom(
  null,
  async (get, set, sitemapUrl: string) => {
    const cache = get(sitemapCacheAtom)
    if (cache.has(sitemapUrl)) return

    set(sitemapLoadingAtom, true)
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
