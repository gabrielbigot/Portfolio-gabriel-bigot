import Link from "next/link"
import { notFound } from "next/navigation"
import { getBlogPosts, getBlogPost } from "@/lib/portfolio-data"
import ShareButtons from "@/components/ShareButtons"
import BlogContentRenderer from "@/components/BlogContentRenderer"

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }))
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  if (!post.published) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-6 text-center space-y-6">
          <div className="text-6xl">📝</div>
          <h1 className="text-3xl font-light">Article en préparation</h1>
          <p className="text-muted-foreground">
            Cet article sera bientôt disponible. Revenez prochainement !
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour aux articles</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <article className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-20">
        {/* Back Link */}
        <div className="mb-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour aux articles</span>
          </Link>
        </div>

        {/* Header */}
        <header className="mb-12 space-y-6">
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
            <span className="px-2 py-1 bg-background border border-border rounded">
              {post.category}
            </span>
            <span>{post.date}</span>
            <span>{post.readingTime}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>

          <div className="pt-6 border-t border-border" />
        </header>

        {/* Content */}
        <div className="max-w-none">
          {post.content && post.content.length > 0 ? (
            <BlogContentRenderer content={post.content as any} />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>Le contenu de cet article est en cours de rédaction...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <ShareButtons title={post.title} />

            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all duration-300"
            >
              <span>Voir tous les articles</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </footer>
      </article>

      {/* Related Articles */}
      <RelatedArticlesSection currentPostId={post.id} />
    </div>
  )
}

function RelatedArticlesSection({ currentPostId }: { currentPostId: string }) {
  const relatedPosts = getBlogPosts()
    .filter((p) => p.id !== currentPostId && p.published)
    .slice(0, 2)

  return (
    <section className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-16 border-t border-border">
      <h2 className="text-2xl sm:text-3xl font-light mb-8">Autres articles</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {relatedPosts.map((relatedPost) => (
          <Link
            key={relatedPost.id}
            href={`/blog/${relatedPost.slug}`}
            className="group p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
          >
            <div className="space-y-3">
              <span className="text-xs px-2 py-1 bg-background border border-border rounded">
                {relatedPost.category}
              </span>
              <h3 className="text-lg font-medium group-hover:text-muted-foreground transition-colors duration-300">
                {relatedPost.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{relatedPost.excerpt}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{relatedPost.date}</span>
                <span>•</span>
                <span>{relatedPost.readingTime}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
