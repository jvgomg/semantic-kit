/**
 * Static page - no streaming, no Suspense
 *
 * This page should show severity: 'none' in hidden content analysis
 * because all content is immediately available in the static HTML.
 */
export default function HomePage() {
  return (
    <main>
      <h1>Static Home Page</h1>
      <p>
        This is a completely static page with no streaming or Suspense boundaries.
        All content is rendered synchronously and available immediately in the
        initial HTML response.
      </p>
      <section>
        <h2>About This Page</h2>
        <p>
          This page serves as a baseline for testing Next.js SSR detection.
          When semantic-kit analyzes this page, it should detect Next.js as
          the framework but report no hidden content issues because everything
          is statically rendered.
        </p>
      </section>
      <section>
        <h2>Features</h2>
        <ul>
          <li>No Suspense boundaries</li>
          <li>No streaming SSR</li>
          <li>All content immediately available</li>
          <li>AI crawlers see complete content</li>
        </ul>
      </section>
    </main>
  )
}
