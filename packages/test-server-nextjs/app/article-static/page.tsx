import { ArticleHeader } from '../components/ArticleHeader'
import { ArticleBodyPart1 } from '../components/ArticleBodyPart1'
import { ArticleBodyPart2 } from '../components/ArticleBodyPart2'
import { ArticleMeta } from '../components/ArticleMeta'

/**
 * Static article page - no streaming, no Suspense
 *
 * This page should show severity: 'none' in hidden content analysis
 * because all content is immediately available in the static HTML.
 * Even though components use async functions, without Suspense
 * boundaries they are awaited before the initial HTML is sent.
 */
export default async function ArticleStaticPage() {
  return (
    <main>
      <article>
        <ArticleHeader />
        <ArticleBodyPart1 />
        <ArticleBodyPart2 />
        <ArticleMeta />
      </article>
    </main>
  )
}
