/**
 * Simulated slow fetch for second part of article
 */
async function getMoreContent(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100))
}

/**
 * Second part of article body - small supplementary content (~50 words)
 * Designed to result in "low" severity when hidden (<=10% of total)
 */
export async function ArticleBodyPart2() {
  await getMoreContent()
  return (
    <section>
      <h2>Further Reading</h2>
      <p>
        For more information on these topics, explore our comprehensive guides
        and tutorials on modern web development best practices.
      </p>
    </section>
  )
}
