import { Suspense } from 'react'
import { GlobalHeader } from '../components/GlobalHeader'
import { NavLinks } from '../components/NavLinks'
import { UserMenu } from '../components/UserMenu'
import { MainContent } from '../components/MainContent'
import { NavLinksSkeleton, UserMenuSkeleton } from '../components/skeletons'

/**
 * Streaming navigation page
 *
 * Both NavLinks and UserMenu are wrapped in Suspense boundaries,
 * meaning the initial HTML shows loading skeletons for both.
 * The main content is still static, but navigation elements are hidden
 * from AI crawlers.
 */
export default function NavStreamingPage() {
  return (
    <>
      <GlobalHeader
        navigation={
          <Suspense fallback={<NavLinksSkeleton />}>
            <NavLinks />
          </Suspense>
        }
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
