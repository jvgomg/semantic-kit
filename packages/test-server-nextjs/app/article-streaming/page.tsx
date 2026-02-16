import { Suspense } from 'react'
import { ArticleHeader } from '../components/ArticleHeader'
import { ArticleBodyPart1 } from '../components/ArticleBodyPart1'
import { ArticleBodyPart2 } from '../components/ArticleBodyPart2'
import { ArticleMeta } from '../components/ArticleMeta'
import { ArticleBodySkeleton } from '../components/skeletons'

/**
 * Streaming article page - high severity
 *
 * The entire article body is wrapped in a single Suspense boundary,
 * meaning the initial HTML contains only the header and loading skeleton.
 * AI crawlers will see minimal content.
 */
export default function ArticleStreamingPage() {
  return (
    <main>
      <article>
        <ArticleHeader />
        <Suspense fallback={<ArticleBodySkeleton />}>
          <ArticleBody />
        </Suspense>
        <ArticleMeta />
      </article>
    </main>
  )
}

/**
 * Combined article body that streams both parts together
 */
async function ArticleBody() {
  return (
    <>
      <ArticleBodyPart1 />
      <ArticleBodyPart2 />
    </>
  )
}
