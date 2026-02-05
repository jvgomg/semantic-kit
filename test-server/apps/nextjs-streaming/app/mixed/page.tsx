import { Suspense } from 'react'

/**
 * Simulated slow sidebar data
 */
async function getSidebarData(): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return ['Related Article 1', 'Related Article 2', 'Related Article 3']
}

/**
 * Sidebar component that streams
 */
async function StreamedSidebar() {
  const items = await getSidebarData()
  return (
    <aside>
      <h3>Related Content</h3>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </aside>
  )
}

/**
 * Sidebar loading placeholder
 */
function SidebarLoading() {
  return (
    <aside>
      <h3>Loading sidebar...</h3>
    </aside>
  )
}

/**
 * Mixed page - low severity
 *
 * This page has most content statically rendered, with only a small
 * sidebar streamed. This represents a common pattern where the main
 * content is immediately available but supplementary content streams in.
 */
export default function MixedPage() {
  return (
    <main>
      <article>
        <h1>Mixed Content Page</h1>
        <p>
          This page demonstrates a mixed rendering approach. The main article
          content is statically rendered and immediately available, while a
          sidebar with related content is streamed in.
        </p>
        <section>
          <h2>Main Article Content</h2>
          <p>
            This is the primary content of the page. It is fully rendered in the
            initial HTML response and will be visible to all crawlers, including
            AI bots that do not execute JavaScript.
          </p>
          <p>
            The main article contains multiple paragraphs of important content
            that search engines and AI systems need to index. This content
            discusses the benefits of progressive enhancement and how to
            structure pages for optimal discoverability.
          </p>
          <p>
            When analyzing this page, semantic-kit should detect that most
            content is immediately available, but a small portion (the sidebar)
            is streamed. This should result in a low severity rating.
          </p>
        </section>
        <section>
          <h2>Technical Details</h2>
          <p>
            This page uses Next.js App Router with a Suspense boundary around
            only the sidebar component. The article content is rendered
            synchronously, ensuring it appears in the initial HTML.
          </p>
          <ul>
            <li>Main content: Static rendering</li>
            <li>Sidebar: Streaming SSR</li>
            <li>Expected severity: Low</li>
          </ul>
        </section>
      </article>
      <Suspense fallback={<SidebarLoading />}>
        <StreamedSidebar />
      </Suspense>
    </main>
  )
}
