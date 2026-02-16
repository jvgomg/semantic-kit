/**
 * Simulated slow fetch for navigation data
 */
async function getNavLinks(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100))
}

/**
 * Navigation links component
 * Contains main site navigation links
 */
export async function NavLinks() {
  await getNavLinks()
  return (
    <nav>
      <ul>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/products">Products</a>
        </li>
        <li>
          <a href="/about">About</a>
        </li>
        <li>
          <a href="/contact">Contact</a>
        </li>
        <li>
          <a href="/blog">Blog</a>
        </li>
      </ul>
    </nav>
  )
}
