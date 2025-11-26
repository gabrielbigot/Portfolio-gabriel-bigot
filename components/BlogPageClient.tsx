"use client"

import Link from "next/link"
import { useState } from "react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  date: string
  readingTime: string
  category: string
  featured: boolean
  published: boolean
}

interface BlogPageClientProps {
  blogPosts: BlogPost[]
}

export default function BlogPageClient({ blogPosts }: BlogPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  console.log(`🖥️ BlogPageClient received ${blogPosts.length} posts`)
  console.log(`📌 First post:`, blogPosts[0])

  // Get unique categories
  const categories = Array.from(new Set(blogPosts.map((post) => post.category).filter(Boolean)))

  // Filter posts by category
  const filteredPosts = selectedCategory
    ? blogPosts.filter((post) => post.category === selectedCategory)
    : blogPosts

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 py-20">
        {/* Header */}
        <div className="mb-16 space-y-8">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Retour au portfolio</span>
            </Link>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
              Réflexions & Articles
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Mes réflexions sur l'IA, l'automatisation, le business et le développement personnel.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                selectedCategory === null
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              Tous les articles ({blogPosts.length})
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-foreground text-background border-foreground"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                {category} ({blogPosts.filter((p) => p.category === category).length})
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={post.published ? `/blog/${post.slug}` : "#"}
              className={`group relative p-8 border border-border rounded-lg transition-all duration-500 hover:shadow-lg ${
                post.published
                  ? "hover:border-muted-foreground/50 cursor-pointer"
                  : "cursor-not-allowed opacity-75"
              }`}
            >
              {!post.published && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 text-xs bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">
                    À venir
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span>{post.date}</span>
                  <span>{post.readingTime}</span>
                </div>

                <div className="space-y-3">
                  <span className="inline-block px-2 py-1 text-xs bg-background border border-border rounded">
                    {post.category}
                  </span>

                  <h2 className="text-xl sm:text-2xl font-medium group-hover:text-muted-foreground transition-colors duration-300">
                    {post.title}
                  </h2>

                  <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>
                </div>

                {post.published && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 pt-2">
                    <span>Lire l'article</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Aucun article trouvé dans cette catégorie.</p>
          </div>
        )}
      </main>
    </div>
  )
}
