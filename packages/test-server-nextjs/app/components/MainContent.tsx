/**
 * Static main content component for navigation test pages
 * Contains article content that is always rendered statically
 */
export function MainContent() {
  return (
    <main>
      <article>
        <h1>Welcome to Our Website</h1>
        <p>
          This is the main content area of the page. This content is always
          rendered statically and will be visible to all crawlers regardless of
          streaming behavior.
        </p>
        <section>
          <h2>About Our Services</h2>
          <p>
            We provide excellent services to our customers. Our team is
            dedicated to delivering high-quality solutions that meet your needs.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </section>
        <section>
          <h2>Why Choose Us</h2>
          <p>
            Our commitment to excellence sets us apart. We focus on delivering
            value through innovative approaches and customer-centric solutions.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
        </section>
      </article>
    </main>
  )
}
