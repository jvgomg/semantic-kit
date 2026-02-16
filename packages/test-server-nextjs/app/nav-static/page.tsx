import { GlobalHeader } from '../components/GlobalHeader'
import { NavLinks } from '../components/NavLinks'
import { UserMenu } from '../components/UserMenu'
import { MainContent } from '../components/MainContent'

/**
 * Static navigation page - no streaming, no Suspense
 *
 * This page should show severity: 'none' in hidden content analysis
 * because all content (navigation, user menu, and main content) is
 * immediately available in the static HTML.
 */
export default async function NavStaticPage() {
  return (
    <>
      <GlobalHeader navigation={<NavLinks />} userMenu={<UserMenu />} />
      <MainContent />
    </>
  )
}
