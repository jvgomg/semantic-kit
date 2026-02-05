import { Suspense } from 'react'

/**
 * Simulated slow data fetch
 */
async function getSlowData(): Promise<string[]> {
  // In a real app, this would fetch from a database or API
  await new Promise((resolve) => setTimeout(resolve, 100))
  return [
    'This content was streamed after the initial HTML response.',
    'AI crawlers that only fetch static HTML will not see this content.',
    'This demonstrates why streaming SSR can hide content from bots.',
    'The semantic-kit tool helps identify these issues.',
  ]
}

/**
 * Component that fetches slow data (triggers streaming)
 */
async function StreamedContent() {
  const data = await getSlowData()
  return (
    <section>
      <h2>Streamed Content</h2>
      <p>This entire section was streamed to the browser:</p>
      <ul>
        {data.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p>
        If you view the source of this page, you will see a loading placeholder
        where this content should be. The actual content arrives via streaming
        after the initial HTML document.
      </p>
    </section>
  )
}

/**
 * Loading fallback shown in initial HTML
 */
function LoadingFallback() {
  return (
    <section>
      <h2>Loading...</h2>
      <p>Content is being loaded...</p>
    </section>
  )
}

/**
 * Full streaming page - high severity
 *
 * This page uses Suspense to stream its main content, meaning the
 * initial HTML contains only loading placeholders. AI crawlers
 * will see minimal content.
 */
export default function StreamingPage() {
  return (
    <main>
      <h1>Streaming SSR Page</h1>
      <p>This page header is in the initial HTML.</p>
      <Suspense fallback={<LoadingFallback />}>
        <StreamedContent />
      </Suspense>
    </main>
  )
}
