/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable compression to work around Bun fetch ZlibError
  compress: false,
  // Allow custom build directory via env var (enables multiple dev instances)
  ...(process.env.NEXT_DIST_DIR && { distDir: process.env.NEXT_DIST_DIR }),
}

export default nextConfig
