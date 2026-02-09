Todos

- [ ] Fix axe.run issue - upgrade deps or patch eslint rules
- [ ] Better CLI output
  - [ ] 2 CLI modes - stream / TTY
  - [ ] Brand output - errors messages
- [ ] Add good example data
  - Find some authoritative markup from W3C or something
  - Create an example server with some clear testing routes

- [ ] Create easy to understand command -> rules documentation, (JS, no js, schema… etc)

- [ ] Improve commands
  - ai
    - [ ] header UI, separate meta/derivative data from metadata
      - Derivative
        - isProbablyReaderable
        - content length
        - Word length
        - URL
      - Meta
        - Title
        - Excerpt / Description
        - Author…
    - [ ] (check) use an appropriate user agent, provide docs on user agent arguments
    - [ ] What about navigation…??
  - google
  - a11y / screen reader

I would like to make some changes to the URL bar and URL list in the TUI. The UI interaction I would like to offer is the idea of a browser URL bar with a
drop-down panel. Right now, the URL list appears as a modal, but I would rather it be anchored to the URL bar as if it is a drop-down. These are some
changes off the top of my head that I would like to see:

- A downward triangle at the end of the URL bar which acts as a button With focusable state as well as an active state for when the URL list is shown.
- Users can press down while focusing the URL input To reveal the URL list drop-down and to focus its first control.
- Users can press Esc when focused in the URL dropdown to Close it and return focus to the URL input.
- There is a drop shadow effect on the URL dropdown
- The content underneath the URL drop-down fades when the URL drop-down is open.
- This code is constructed by creating primitive components, such as toolbar and toolbar drop-down, which the URL components use.

Investigate the codebase and think about the changes. Then, ask me any clarifying questions before proposing a plan.
