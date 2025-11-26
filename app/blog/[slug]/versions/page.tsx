/**
 * Article Versions History Page
 * Shows timeline of all versions for an article
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getArticleVersions } from '@/lib/notion-versions'
import { getBlogPostBySlug } from '@/lib/notion-simple'
import { blogPosts } from '@/lib/data'
import VersionTimeline from '@/components/VersionTimeline'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  // Try to get post from Notion first
  let post = await getBlogPostBySlug(slug)

  // Fallback to local data
  if (!post) {
    post = blogPosts.find(p => p.slug === slug)
  }

  const title = post ? `Historique des versions - ${post.title}` : 'Historique des versions'
  const description = post
    ? `Consultez l'historique complet des versions de l'article "${post.title}"`
    : 'Historique des versions de l\'article'

  return {
    title,
    description,
  }
}

export default async function VersionsPage({ params }: PageProps) {
  const { slug } = await params

  // Get article data
  let post = await getBlogPostBySlug(slug)

  // Fallback to local data
  if (!post) {
    post = blogPosts.find(p => p.slug === slug)
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Article non trouvé</h1>
          <p className="text-muted-foreground mb-4">
            Cet article n'existe pas ou a été supprimé.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au blog
          </Link>
        </div>
      </div>
    )
  }

  // Get all versions for this article
  const versions = await getArticleVersions(slug)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/blog/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'article
          </Link>

          <h1 className="text-3xl font-bold mb-2">
            Historique des versions
          </h1>
          <p className="text-lg text-muted-foreground">
            {post.title}
          </p>
        </div>

        {/* Versions count */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
          <p className="text-sm">
            Cet article a été publié en <strong>{versions.length}</strong> version{versions.length > 1 ? 's' : ''}.
            {versions.length > 1 && (
              <> Vous pouvez consulter chaque version et comparer les modifications entre elles.</>
            )}
          </p>
        </div>

        {/* Timeline */}
        {versions.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Timeline des versions</h2>
            <VersionTimeline
              versions={versions}
              articleSlug={slug}
            />
          </div>
        ) : (
          <div className="py-12 text-center border rounded-lg">
            <p className="text-muted-foreground mb-2">
              Aucune version disponible pour cet article.
            </p>
            <p className="text-sm text-muted-foreground">
              Les versions seront affichées ici une fois qu'elles seront créées dans Notion.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600
