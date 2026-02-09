import { Suspense } from 'react'
import { ArticleHeader } from '../components/ArticleHeader'
import { ArticleBodyPart1Static } from '../components/ArticleBodyPart1Static'
import { ArticleBodyPart2 } from '../components/ArticleBodyPart2'
import { ArticleMeta } from '../components/ArticleMeta'
import { ArticleBodyPart2Skeleton } from '../components/skeletons'

/**
 * Mixed article page - low severity
 *
 * The first half of the article is rendered statically (synchronous component),
 * while the second half (ArticleBodyPart2) is streamed via Suspense.
 * This represents a pattern where critical content is immediately available
 * but supplementary content streams in.
 *
 * Note: ArticleBodyPart1Static is synchronous to ensure it's in the initial HTML.
 * The page is NOT async so the initial shell can be sent immediately.
 */
export default function ArticleMixedPage() {
  return (
    <main>
      <article>
        <ArticleHeader />
        <ArticleBodyPart1Static />
        <Suspense fallback={<ArticleBodyPart2Skeleton />}>
          <ArticleBodyPart2 />
        </Suspense>
        <ArticleMeta />
      </article>
    </main>
  )
}
