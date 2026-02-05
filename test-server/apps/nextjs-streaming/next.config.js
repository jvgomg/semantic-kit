/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable compression to work around Bun fetch ZlibError
  compress: false,
}

export default nextConfig
