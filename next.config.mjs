/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // studio en ligne : le moteur d'édition des articles est lu sur disque par la route /api/studio/view (fonction serverless) : l'inclure dans son paquet
  outputFileTracingIncludes: { "/api/studio/view/**": ["./lib/articles/annotate.js", "./lib/articles/edit.js"] },
  // essais et dossiers sont fusionnés en un seul type : « articles » (les anciennes adresses continuent de fonctionner)
  async redirects() {
    return [
      { source: "/blog", destination: "/articles", permanent: true },
      { source: "/blog/:slug", destination: "/articles/:slug", permanent: true },
    ]
  },
  async rewrites() {
    const studio = process.env.STUDIO_MODE === "1"
    const afterFiles = [
      // articles publics : pages HTML statiques générées au build dans public/articles/<slug>/ (scripts/articles.mjs build-public)
      { source: "/articles/:slug", destination: "/articles/:slug/index.html" },
      // sous-articles (approfondissements)
      { source: "/articles/:slug/s/:rest*", destination: "/articles/:slug/s/:rest*/index.html" },
      {
        source: "/newsletters/:slug",
        destination: "/newsletters/:slug.html",
      },
    ]
    // copie privée (studio) : les images statiques passent par le brouillon pour refléter les remplacements (avant les fichiers de public/)
    const beforeFiles = studio ? [
      { source: "/:dir(about|projects|companies|portfolio)/:path*.:ext(png|jpg|jpeg|webp|gif|avif)", destination: "/api/studio/asset/:dir/:path*.:ext" },
      // articles : lus dans le brouillon, avec le moteur de notes en mode auteur
      { source: "/articles/:slug", destination: "/api/studio/view/:slug" },
      { source: "/articles/:slug/:path*", destination: "/api/studio/view/:slug/:path*" },
    ] : []
    return { beforeFiles, afterFiles, fallback: [] }
  },
}

export default nextConfig
