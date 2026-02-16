import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Next.js Streaming Test Fixture',
  description: 'Test fixture for semantic-kit SSR detection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
