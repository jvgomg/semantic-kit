# @webspecs/cli

## Unreleased

### Added

- **social**: ASCII art preview of og:image directly in the terminal (TTY mode only)
  - Renders og:image as colored half-block characters within the card mockup
  - Shows `[IMG ERR]` indicator when image fetch fails (404, timeout, unsupported format)
  - Non-TTY mode shows URL placeholder without fetching for performance
  - Research: [[open-graph-validation]] (research-v0.6.0) - image dimension requirements

This package has not yet been published to npm.

---

**Historical Note**: Development history prior to the monorepo restructure can be found in `/CHANGELOG-pre-monorepo.md` at the repository root.
