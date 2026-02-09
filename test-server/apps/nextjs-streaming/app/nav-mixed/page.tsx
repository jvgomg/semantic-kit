import { Suspense } from 'react'
import { GlobalHeader } from '../components/GlobalHeader'
import { NavLinksStatic } from '../components/NavLinksStatic'
import { UserMenu } from '../components/UserMenu'
import { MainContent } from '../components/MainContent'
import { UserMenuSkeleton } from '../components/skeletons'

/**
 * Mixed navigation page - low severity
 *
 * NavLinks is rendered statically (synchronous component),
 * while UserMenu is wrapped in Suspense (streamed after initial HTML).
 * This represents a common pattern where navigation structure is static
 * but user-specific content like auth state is streamed.
 *
 * Note: NavLinksStatic is synchronous to ensure it's in the initial HTML.
 * The page is NOT async so the initial shell can be sent immediately.
 */
export default function NavMixedPage() {
  return (
    <>
      <GlobalHeader
        navigation={<NavLinksStatic />}
        userMenu={
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenu />
          </Suspense>
        }
      />
      <MainContent />
    </>
  )
}
