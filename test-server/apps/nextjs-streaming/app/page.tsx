/**
 * Index page - links to all streaming test examples
 *
 * This page serves as a navigation hub for all streaming test fixtures.
 * It is fully static with no Suspense boundaries.
 */
export default function IndexPage() {
  return (
    <main>
      <h1>Next.js Streaming Test Fixtures</h1>
      <p>
        Test fixtures demonstrating various streaming patterns and their impact
        on content visibility for AI crawlers and search engines.
      </p>

      <section>
        <h2>Article Fixtures</h2>
        <p>Compare content visibility with different streaming patterns:</p>
        <ul>
          <li>
            <a href="/article-static">Static Article</a> - Full article with no
            streaming (severity: none)
          </li>
          <li>
            <a href="/article-streaming">Streaming Article</a> - Article body
            wrapped in Suspense (severity: high)
          </li>
          <li>
            <a href="/article-mixed">Mixed Article</a> - First half static,
            second half streamed (severity: low)
          </li>
        </ul>
      </section>

      <section>
        <h2>Navigation Fixtures</h2>
        <p>Demonstrate partial streaming patterns for navigation:</p>
        <ul>
          <li>
            <a href="/nav-static">Static Navigation</a> - All components static
            (severity: none)
          </li>
          <li>
            <a href="/nav-streaming">Streaming Navigation</a> - Both nav links
            and user menu streamed
          </li>
          <li>
            <a href="/nav-mixed">Mixed Navigation</a> - Nav links static, user
            menu streamed
          </li>
        </ul>
      </section>
    </main>
  )
}
