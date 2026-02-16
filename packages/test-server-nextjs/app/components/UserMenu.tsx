/**
 * Simulated slow auth check
 * Always resolves to signed-out state in test server
 */
async function checkAuth(): Promise<{ isSignedIn: false }> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return { isSignedIn: false }
}

/**
 * User menu component - auth-aware
 * Shows sign-in link when signed out, profile link when signed in
 * In test server, always resolves to signed-out state
 */
export async function UserMenu() {
  const auth = await checkAuth()
  return (
    <div>
      {auth.isSignedIn ? (
        <a href="/profile">Profile</a>
      ) : (
        <a href="/sign-in">Sign In</a>
      )}
    </div>
  )
}
