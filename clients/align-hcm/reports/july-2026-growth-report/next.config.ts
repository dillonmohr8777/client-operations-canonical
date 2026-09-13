import type { NextConfig } from 'next'

/** Static export: Netlify publishes `out/` as plain files, same deploy
 *  model as the previous hand-written version. */
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: true,
  trailingSlash: true,
}

export default nextConfig
