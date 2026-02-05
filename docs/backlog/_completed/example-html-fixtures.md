```yaml
# Metadata
researchVersion: research-v0.4.0
toolVersion: null
status: complete
created: 2026-02-04
completed: 2026-02-04
```

# Add Example HTML Fixtures for Tool Demonstrations

## Research Context

**Source:** [[example-markup-sources]]

**Finding:**
Research into authoritative sources (W3C WAI, MDN, WebAIM) and notable accessibility blogs (Adrian Roselli, Scott O'Hara, Heydon Pickering) reveals consistent patterns for demonstrating good semantic HTML, common mistakes, and accessibility issues. These sources provide concrete examples that can be adapted into test fixtures for demonstrating semantic-kit's `structure`, `validate:html`, and `validate:a11y` commands.

**Citations:**

- [^wai-apg]: W3C ARIA Authoring Practices Guide - component patterns with working examples
- [^webaim-cheatsheet]: WebAIM HTML Semantics Cheat Sheet - good/bad markup examples
- [^html5doctor]: HTML5 Doctor Sectioning Flowchart - element selection guidance
- [^24ways]: 24 ways accessibility article - semantic HTML benefits

---

## Proposed Change

**Affected command(s):** `structure`, `validate:html`, `validate:a11y` (demonstration/documentation)

**What should change:**
Create a set of example HTML fixture files that demonstrate:

1. **Good semantic markup** - Shows clean tool output, validates successfully
2. **Common mistakes** - Shows warnings and errors from validation commands
3. **Edge cases** - Tests tool capabilities with complex but valid patterns

These fixtures serve as:
- Demo files for documentation
- Test cases for tool development
- Learning resources for users

**File structure:**
```
examples/
  good/
    semantic-blog-post.html      # Full page with proper structure
    accessible-form.html         # Form with labels, fieldsets, errors
    navigation-landmarks.html    # Landmarks, skip links, multiple navs
  bad/
    div-soup.html               # Non-semantic markup
    heading-chaos.html          # Skipped levels, misused headings
    form-no-labels.html         # Missing accessibility
    button-anti-patterns.html   # DIVs as buttons
  edge-cases/
    nested-landmarks.html       # Complex valid landmark nesting
    multiple-mains.html         # Hidden mains (SPA pattern)
```

---

## Implementation Approach

**Key files to create:**

### 1. `examples/good/semantic-blog-post.html`

A complete blog post page demonstrating proper semantic structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Understanding Semantic HTML - My Blog</title>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header>
    <nav aria-label="Main">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>

    <form role="search" action="/search">
      <label for="search">Search</label>
      <input type="search" id="search" name="q">
      <button type="submit">Search</button>
    </form>
  </header>

  <main id="main-content">
    <article>
      <header>
        <h1>Understanding Semantic HTML</h1>
        <p>Published on <time datetime="2026-02-04">February 4, 2026</time>
           by <a href="/authors/jane">Jane Smith</a></p>
      </header>

      <p>Semantic HTML uses elements that convey meaning about the content
         they contain, rather than just how it should look.</p>

      <h2>Why It Matters</h2>

      <p>Using semantic elements provides benefits for:</p>

      <ul>
        <li>Screen reader users who navigate by landmarks and headings</li>
        <li>Search engines that understand content structure</li>
        <li>Content extraction tools that identify main content</li>
      </ul>

      <h3>For Accessibility</h3>

      <p>Screen readers announce element roles. A <code>&lt;nav&gt;</code> is
         announced as "navigation" while a <code>&lt;div class="nav"&gt;</code>
         is just "group" or nothing at all.</p>

      <figure>
        <img src="/images/semantic-comparison.png"
             alt="Side-by-side comparison showing semantic elements on the left
                  with clear structure labels, and div-based markup on the right
                  with no visible structure">
        <figcaption>Semantic elements communicate structure; divs do not.</figcaption>
      </figure>

      <h3>For SEO</h3>

      <p>Search engines use heading hierarchy and landmarks to understand
         content importance and page organization.</p>

      <h2>Key Elements to Know</h2>

      <p>The most important semantic elements include:</p>

      <dl>
        <dt><code>&lt;header&gt;</code></dt>
        <dd>Introductory content, typically containing navigation</dd>

        <dt><code>&lt;main&gt;</code></dt>
        <dd>The dominant content of the document body</dd>

        <dt><code>&lt;article&gt;</code></dt>
        <dd>Self-contained composition that could be distributed independently</dd>

        <dt><code>&lt;section&gt;</code></dt>
        <dd>Thematic grouping of content, typically with a heading</dd>

        <dt><code>&lt;aside&gt;</code></dt>
        <dd>Content tangentially related to the surrounding content</dd>

        <dt><code>&lt;footer&gt;</code></dt>
        <dd>Footer for its nearest sectioning content or root</dd>
      </dl>

      <h2>Conclusion</h2>

      <p>Semantic HTML is the foundation of accessible, SEO-friendly, and
         maintainable web pages. Start with semantics; add ARIA only when needed.</p>

      <footer>
        <p>Tags: <a href="/tags/html" rel="tag">HTML</a>,
           <a href="/tags/accessibility" rel="tag">Accessibility</a>,
           <a href="/tags/seo" rel="tag">SEO</a></p>
      </footer>
    </article>

    <aside aria-labelledby="related-heading">
      <h2 id="related-heading">Related Posts</h2>
      <ul>
        <li><a href="/blog/aria-basics">ARIA Basics</a></li>
        <li><a href="/blog/heading-hierarchy">Heading Hierarchy</a></li>
        <li><a href="/blog/landmarks">Understanding Landmarks</a></li>
      </ul>
    </aside>
  </main>

  <footer>
    <nav aria-label="Footer">
      <ul>
        <li><a href="/privacy">Privacy Policy</a></li>
        <li><a href="/terms">Terms of Service</a></li>
      </ul>
    </nav>
    <p><small>&copy; 2026 My Blog. All rights reserved.</small></p>
  </footer>
</body>
</html>
```

**What this demonstrates:**
- Proper document outline with h1-h3
- Banner, main, contentinfo landmarks
- Multiple nav elements with aria-labels
- Search landmark with role="search"
- Skip link to main content
- Article with nested header/footer
- Aside with accessible name
- Figure with figcaption
- Time element with datetime
- Description list for definitions
- Proper link text (no "click here")

---

### 2. `examples/good/accessible-form.html`

A form demonstrating all accessibility requirements:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Us</title>
</head>
<body>
  <main>
    <h1>Contact Us</h1>

    <form action="/contact" method="post" novalidate>
      <fieldset>
        <legend>Your Information</legend>

        <div class="form-group">
          <label for="name">
            Full Name
            <span aria-hidden="true">*</span>
          </label>
          <input type="text" id="name" name="name"
                 required aria-required="true"
                 autocomplete="name">
        </div>

        <div class="form-group">
          <label for="email">
            Email Address
            <span aria-hidden="true">*</span>
          </label>
          <input type="email" id="email" name="email"
                 required aria-required="true"
                 autocomplete="email"
                 aria-describedby="email-hint">
          <p id="email-hint" class="hint">We'll never share your email.</p>
        </div>

        <div class="form-group">
          <label for="phone">Phone Number (optional)</label>
          <input type="tel" id="phone" name="phone"
                 autocomplete="tel">
        </div>
      </fieldset>

      <fieldset>
        <legend>How can we help?</legend>

        <div class="form-group">
          <label for="subject">Subject</label>
          <select id="subject" name="subject" required aria-required="true">
            <option value="">Please select...</option>
            <option value="general">General Inquiry</option>
            <option value="support">Technical Support</option>
            <option value="billing">Billing Question</option>
            <option value="feedback">Feedback</option>
          </select>
        </div>

        <div class="form-group">
          <label for="message">
            Message
            <span aria-hidden="true">*</span>
          </label>
          <textarea id="message" name="message" rows="5"
                    required aria-required="true"
                    aria-describedby="message-hint"></textarea>
          <p id="message-hint" class="hint">Maximum 500 characters.</p>
        </div>
      </fieldset>

      <fieldset>
        <legend>Contact Preferences</legend>

        <div class="form-group">
          <p id="contact-method-label">Preferred contact method:</p>
          <div role="group" aria-labelledby="contact-method-label">
            <label>
              <input type="radio" name="contact-method" value="email" checked>
              Email
            </label>
            <label>
              <input type="radio" name="contact-method" value="phone">
              Phone
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" name="newsletter">
            Subscribe to our newsletter
          </label>
        </div>
      </fieldset>

      <button type="submit">Send Message</button>
    </form>
  </main>
</body>
</html>
```

**What this demonstrates:**
- All inputs have associated labels
- Fieldsets group related controls with legends
- aria-describedby links hints to inputs
- aria-required indicates required fields
- Radio buttons grouped with role="group"
- Autocomplete attributes for user convenience
- Native button element for submit

---

### 3. `examples/good/navigation-landmarks.html`

Demonstrates complex but correct landmark usage:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landmarks Demo</title>
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <a href="#footer-nav" class="skip-link">Skip to footer navigation</a>

  <header>
    <a href="/" aria-label="Home - Company Name">
      <img src="/logo.svg" alt="" role="presentation">
      <span>Company Name</span>
    </a>

    <nav aria-label="Main">
      <ul>
        <li><a href="/products">Products</a></li>
        <li><a href="/services">Services</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>

    <form role="search" action="/search" method="get">
      <label for="site-search" class="visually-hidden">Search</label>
      <input type="search" id="site-search" name="q" placeholder="Search...">
      <button type="submit">
        <span class="visually-hidden">Submit search</span>
        <svg aria-hidden="true" focusable="false"><!-- icon --></svg>
      </button>
    </form>
  </header>

  <nav aria-label="Breadcrumb">
    <ol>
      <li><a href="/">Home</a></li>
      <li><a href="/products">Products</a></li>
      <li><a href="/products/widgets" aria-current="page">Widgets</a></li>
    </ol>
  </nav>

  <main id="main">
    <h1>Widgets</h1>

    <section aria-labelledby="overview-heading">
      <h2 id="overview-heading">Overview</h2>
      <p>Our widgets are the best widgets.</p>
    </section>

    <section aria-labelledby="features-heading">
      <h2 id="features-heading">Features</h2>
      <ul>
        <li>Feature one</li>
        <li>Feature two</li>
        <li>Feature three</li>
      </ul>
    </section>

    <aside aria-labelledby="support-heading">
      <h2 id="support-heading">Need Help?</h2>
      <p>Contact our <a href="/support">support team</a>.</p>
    </aside>
  </main>

  <footer>
    <nav id="footer-nav" aria-label="Footer">
      <h2 class="visually-hidden">Footer Navigation</h2>

      <section aria-labelledby="company-nav">
        <h3 id="company-nav">Company</h3>
        <ul>
          <li><a href="/about">About Us</a></li>
          <li><a href="/careers">Careers</a></li>
          <li><a href="/press">Press</a></li>
        </ul>
      </section>

      <section aria-labelledby="support-nav">
        <h3 id="support-nav">Support</h3>
        <ul>
          <li><a href="/help">Help Center</a></li>
          <li><a href="/contact">Contact Us</a></li>
          <li><a href="/status">System Status</a></li>
        </ul>
      </section>

      <section aria-labelledby="legal-nav">
        <h3 id="legal-nav">Legal</h3>
        <ul>
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/cookies">Cookie Policy</a></li>
        </ul>
      </section>
    </nav>

    <p><small>&copy; 2026 Company Name</small></p>
  </footer>
</body>
</html>
```

**What this demonstrates:**
- Multiple skip links for keyboard users
- Three nav elements, each with unique aria-label
- Search landmark with visually hidden label
- Breadcrumb nav with aria-current="page"
- Sections with accessible names (aria-labelledby)
- Aside within main (valid placement)
- Icon with aria-hidden and fallback text
- Visually hidden content for screen readers

---

### 4. `examples/bad/div-soup.html`

Non-semantic markup that validates structure command output:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Website</title>
</head>
<body>
  <div class="header">
    <div class="logo">My Website</div>
    <div class="nav">
      <div class="nav-item"><a href="/">Home</a></div>
      <div class="nav-item"><a href="/about">About</a></div>
      <div class="nav-item"><a href="/contact">Contact</a></div>
    </div>
  </div>

  <div class="main">
    <div class="title">Welcome to My Website</div>

    <div class="content">
      <div class="paragraph">
        This is a paragraph of text. It should be using a p element
        but instead uses a div with a class.
      </div>

      <div class="paragraph">
        Here is another paragraph. Screen readers won't know these
        are paragraphs without proper markup.
      </div>

      <div class="list">
        <div class="list-item">- First item</div>
        <div class="list-item">- Second item</div>
        <div class="list-item">- Third item</div>
      </div>
    </div>

    <div class="sidebar">
      <div class="sidebar-title">Related Links</div>
      <div class="link"><a href="/page1">Page One</a></div>
      <div class="link"><a href="/page2">Page Two</a></div>
    </div>
  </div>

  <div class="footer">
    <div class="copyright">Copyright 2026</div>
  </div>
</body>
</html>
```

**Problems demonstrated:**
- No landmarks (header, main, footer, nav, aside)
- No heading hierarchy (using div.title instead of h1)
- No semantic list (ul/li)
- No paragraph elements (p)
- Screen readers cannot navigate by structure

**Expected `structure` output:**
```
Landmarks: none detected
Headings: none detected
Issues:
  - No main landmark found
  - No headings found
  - Consider using semantic HTML elements
```

---

### 5. `examples/bad/heading-chaos.html`

Demonstrates heading hierarchy violations:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Heading Problems</title>
</head>
<body>
  <header>
    <h3>My Website</h3>  <!-- Should be h1 in header, or no heading here -->
  </header>

  <main>
    <h4>Welcome</h4>  <!-- Skipped h1, h2, h3 -->

    <p>Some content here.</p>

    <h2>About Us</h2>  <!-- Goes backwards from h4 -->

    <p>More content.</p>

    <h1>Our Services</h1>  <!-- Multiple h1s, not the main heading -->

    <p>Even more content.</p>

    <h6>Contact</h6>  <!-- Skipped h3, h4, h5 -->

    <h2 style="font-size: 14px;">Fine Print</h2>  <!-- Using h2 for small text -->

    <h3></h3>  <!-- Empty heading -->

    <h4>   </h4>  <!-- Whitespace-only heading -->
  </main>
</body>
</html>
```

**Problems demonstrated:**
- No h1 for the main page title
- Skipped heading levels (h3 to h4, h4 to h2, h2 to h6)
- Multiple h1 elements
- Empty headings
- Headings used for styling (small h2)

**Expected `structure` output:**
```
Headings:
  h3 "My Website"
  h4 "Welcome"        [!] Skipped levels: h1, h2
  h2 "About Us"       [!] Level decreased unexpectedly
  h1 "Our Services"   [!] Multiple h1 elements
  h6 "Contact"        [!] Skipped levels: h3, h4, h5
  h2 "Fine Print"
  h3 ""               [!] Empty heading
  h4 ""               [!] Empty heading

Issues:
  - 5 heading hierarchy violations
  - 2 empty headings
  - Multiple h1 elements (should have exactly one)
```

---

### 6. `examples/bad/form-no-labels.html`

Form accessibility violations:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contact Form</title>
</head>
<body>
  <main>
    <h1>Contact Us</h1>

    <form action="/contact" method="post">
      <div>
        Name:
        <input type="text" name="name">  <!-- No label association -->
      </div>

      <div>
        <label>Email</label>  <!-- Label not associated (missing for) -->
        <input type="email" name="email">
      </div>

      <div>
        <input type="text" placeholder="Phone Number">  <!-- Placeholder as label -->
      </div>

      <div>
        Subject:
        <select name="subject">  <!-- No label -->
          <option>General</option>
          <option>Support</option>
          <option>Billing</option>
        </select>
      </div>

      <div>
        <textarea placeholder="Your message"></textarea>  <!-- No label, no name -->
      </div>

      <div>
        <input type="checkbox" name="newsletter">  <!-- Checkbox without label -->
        Subscribe to newsletter
      </div>

      <div>
        Preferred contact method:  <!-- Radio group without fieldset/legend -->
        <input type="radio" name="method" value="email"> Email
        <input type="radio" name="method" value="phone"> Phone
      </div>

      <div onclick="submitForm()">Submit</div>  <!-- Div as button -->
    </form>
  </main>
</body>
</html>
```

**Problems demonstrated:**
- Inputs without associated labels
- Label element without `for` attribute
- Placeholder used as label (insufficient)
- Checkbox without label
- Radio buttons not in fieldset with legend
- Div used as submit button (not keyboard accessible)
- Missing autocomplete attributes

**Expected `validate:a11y` output:**
```
Violations:
  [critical] form-field-multiple-labels (1)
  [serious] label (4) - Form elements must have labels
  [serious] button-name (1) - Buttons must have discernible text
  [moderate] select-name (1) - Select must have accessible name
  [moderate] autocomplete-valid - Input missing autocomplete

Total: 7 violations
```

---

### 7. `examples/bad/button-anti-patterns.html`

Interactive element anti-patterns:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Button Problems</title>
  <style>
    .btn { padding: 10px 20px; background: blue; color: white; cursor: pointer; }
    .link { color: blue; text-decoration: underline; cursor: pointer; }
  </style>
</head>
<body>
  <main>
    <h1>Interactive Elements</h1>

    <!-- Div as button -->
    <div class="btn" onclick="doSomething()">Click Me</div>

    <!-- Span as button -->
    <span class="btn" onclick="doSomethingElse()">Press Here</span>

    <!-- Link without href -->
    <a onclick="navigate()">Go to page</a>

    <!-- Link with href="#" -->
    <a href="#" onclick="handleClick()">Do action</a>

    <!-- Link with javascript: protocol -->
    <a href="javascript:void(0)" onclick="action()">Another action</a>

    <!-- Div as link -->
    <div class="link" onclick="goSomewhere()">Visit our site</div>

    <!-- Button with only icon -->
    <button onclick="search()">
      <svg viewBox="0 0 24 24"><path d="..."/></svg>
    </button>

    <!-- Image as button without alt -->
    <img src="submit.png" onclick="submit()">

    <!-- Generic click handlers -->
    <div onclick="expand()">
      <span>Show more</span>
    </div>

    <!-- Misleading link text -->
    <p>For more information, <a href="/details">click here</a>.</p>
    <p><a href="/read-more">Read more</a></p>
    <p><a href="/info">Learn more</a></p>
  </main>
</body>
</html>
```

**Problems demonstrated:**
- Divs/spans as buttons (no keyboard access)
- Links without href (removed from tab order)
- Links with href="#" (causes scroll jump)
- Links with javascript: protocol
- Icon-only button without accessible name
- Image as button without alt text
- Non-descriptive link text ("click here", "read more")

---

### 8. `examples/edge-cases/nested-landmarks.html`

Complex but valid landmark nesting:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Complex Landmarks</title>
</head>
<body>
  <header>
    <!-- Banner landmark: header at top level -->
    <nav aria-label="Primary">
      <!-- Navigation can be inside banner -->
    </nav>
  </header>

  <main>
    <article>
      <!-- Article inside main: valid -->
      <header>
        <!-- This header is NOT a banner (inside article) -->
        <h1>Article Title</h1>
      </header>

      <section aria-labelledby="intro">
        <!-- Section with accessible name: becomes region -->
        <h2 id="intro">Introduction</h2>
        <p>Content...</p>
      </section>

      <section>
        <!-- Section without accessible name: no landmark role -->
        <h2>Details</h2>
        <p>Content...</p>
      </section>

      <aside>
        <!-- Complementary inside article: valid -->
        <h2>Author Bio</h2>
      </aside>

      <footer>
        <!-- This footer is NOT contentinfo (inside article) -->
        <p>Posted: 2026-02-04</p>
      </footer>
    </article>

    <aside aria-labelledby="sidebar-heading">
      <!-- Complementary at main level -->
      <h2 id="sidebar-heading">Sidebar</h2>

      <nav aria-label="Related posts">
        <!-- Navigation inside complementary: valid -->
      </nav>
    </aside>
  </main>

  <footer>
    <!-- Contentinfo landmark: footer at top level -->
    <nav aria-label="Legal">
      <!-- Navigation inside contentinfo: valid -->
    </nav>
  </footer>
</body>
</html>
```

**What this tests:**
- Header/footer inside article (not landmarks)
- Section with/without accessible name
- Aside inside article vs. main level
- Nav inside other landmarks
- Proper banner/contentinfo at top level only

---

### 9. `examples/edge-cases/multiple-mains.html`

SPA pattern with hidden mains:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SPA with Multiple Views</title>
</head>
<body>
  <header>
    <nav aria-label="Main">
      <button aria-current="page" data-view="home">Home</button>
      <button data-view="products">Products</button>
      <button data-view="contact">Contact</button>
    </nav>
  </header>

  <!-- Only one main visible at a time -->
  <main id="home-view" aria-labelledby="home-title">
    <h1 id="home-title">Welcome Home</h1>
    <p>Home page content...</p>
  </main>

  <main id="products-view" aria-labelledby="products-title" hidden>
    <h1 id="products-title">Our Products</h1>
    <p>Products content...</p>
  </main>

  <main id="contact-view" aria-labelledby="contact-title" hidden>
    <h1 id="contact-title">Contact Us</h1>
    <p>Contact content...</p>
  </main>

  <footer>
    <p>&copy; 2026</p>
  </footer>
</body>
</html>
```

**What this tests:**
- Multiple main elements (valid if only one visible)
- Hidden attribute for view switching
- Each main has accessible name
- Navigation with aria-current

---

## Directory Structure

```
examples/
  README.md                           # Overview and usage instructions
  good/
    semantic-blog-post.html           # Full semantic page
    accessible-form.html              # Properly labeled form
    navigation-landmarks.html         # Complex landmark structure
  bad/
    div-soup.html                     # Non-semantic markup
    heading-chaos.html                # Heading violations
    form-no-labels.html               # Form accessibility issues
    button-anti-patterns.html         # Interactive element mistakes
  edge-cases/
    nested-landmarks.html             # Valid complex nesting
    multiple-mains.html               # SPA pattern
```

---

## Considerations

- **Real-world patterns**: Examples based on common mistakes from WebAIM Million analysis and accessibility audits
- **Tool demonstration**: Each bad example should produce meaningful tool output
- **Progressive complexity**: Start simple (div soup), progress to subtle issues (heading hierarchy)
- **Framework-agnostic**: Pure HTML, no framework-specific patterns
- **Linkable**: Document URL sources in comments for patterns borrowed from authoritative sources

---

## Acceptance Criteria

- [ ] Directory structure created at `examples/`
- [ ] README.md documents the fixtures and their purposes
- [ ] 3 "good" examples demonstrating proper semantic HTML
- [ ] 4 "bad" examples demonstrating common mistakes
- [ ] 2 "edge case" examples for testing complex patterns
- [ ] Each file includes comments noting source/inspiration
- [ ] `structure` command produces expected output for each file
- [ ] `validate:a11y` command identifies issues in "bad" examples
- [ ] Research page [[example-markup-sources]] updated:
  - [ ] `toolCoverage` entry added to frontmatter
  - [ ] Note that examples were implemented
- [ ] CHANGELOG entry references [[example-markup-sources]], research-v0.4.0

---

## Notes

**Source attribution:** Many patterns are adapted from or inspired by:
- W3C WAI Tutorials (https://www.w3.org/WAI/tutorials/)
- WebAIM cheat sheet examples
- Adrian Roselli's anti-pattern documentation
- Scott O'Hara's accessible components
- Heydon Pickering's Inclusive Components

**Future extensions:**
- Add table examples (data tables, layout table anti-pattern)
- Add image examples (alt text, decorative images, complex images)
- Add ARIA live region examples
- Add focus management examples
