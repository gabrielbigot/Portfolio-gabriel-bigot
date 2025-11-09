import Link from "next/link"
import { notFound } from "next/navigation"
import { getBlogPostBySlug, getBlogPostsFromNotion } from "@/lib/notion-simple"
import { blogPosts as localBlogPosts } from "@/lib/data"
import NotionBlockRenderer from "@/components/NotionBlockRenderer"
import ShareButtons from "@/components/ShareButtons"

// Revalidate every hour
export const revalidate = 3600

// Generate static params for all blog posts
export async function generateStaticParams() {
  try {
    const notionPosts = await getBlogPostsFromNotion()
    if (notionPosts && notionPosts.length > 0) {
      return notionPosts.map((post) => ({
        slug: post.slug,
      }))
    }
  } catch (error) {
    console.error("Error generating static params for blog:", error)
  }

  // Fallback to local blog posts
  return localBlogPosts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Try to fetch from Notion first
  let post = null

  try {
    console.log(`🔍 Looking for blog post with slug: "${slug}"`)
    post = await getBlogPostBySlug(slug)

    if (post) {
      console.log(`✅ Loaded blog post "${post.title}" from Notion`)
    } else {
      console.warn(`❌ No blog post found with slug "${slug}" in Notion`)
    }
  } catch (error) {
    console.warn("Failed to fetch blog post from Notion:", error)
  }

  // Fallback to local data if Notion fails
  if (!post) {
    post = localBlogPosts.find((p) => p.slug === slug)
    if (post) {
      console.log(`⚠️ Using local data for blog post "${post.title}"`)
    }
  }

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
            <NotionBlockRenderer content={post.content} />
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

async function RelatedArticlesSection({ currentPostId }: { currentPostId: string }) {
  // Try to fetch from Notion first
  let allPosts = localBlogPosts

  try {
    const notionPosts = await getBlogPostsFromNotion()
    if (notionPosts && notionPosts.length > 0) {
      allPosts = notionPosts as any
    }
  } catch (error) {
    console.warn("Failed to fetch blog posts for 'Related Articles' section:", error)
  }

  const relatedPosts = allPosts
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
