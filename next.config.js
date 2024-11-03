const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });

    return config;
  },
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"]
  },
  // Status at https://github.com/vercel/next.js/issues/71638
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  }
}

module.exports = withBundleAnalyzer(nextConfig)
