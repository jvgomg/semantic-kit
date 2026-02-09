/**
 * Article metadata - tags and related links
 * Always rendered statically at the end of articles
 */
export function ArticleMeta() {
  return (
    <footer>
      <h3>Tags</h3>
      <ul>
        <li>Web Development</li>
        <li>SSR</li>
        <li>Performance</li>
        <li>SEO</li>
      </ul>
      <h3>Related Articles</h3>
      <ul>
        <li>Introduction to React Server Components</li>
        <li>Optimizing Core Web Vitals</li>
        <li>The Future of JavaScript Frameworks</li>
      </ul>
    </footer>
  )
}
