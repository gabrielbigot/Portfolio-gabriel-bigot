/**
 * Single Article Version Page
 * Displays a specific version of an article
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Calendar, History } from 'lucide-react'
import { getArticleVersion, getArticleVersions } from '@/lib/notion-versions'
import { getBlogPostBySlug } from '@/lib/notion-simple'
import { blogPosts } from '@/lib/data'
import NotionBlockRenderer from '@/components/NotionBlockRenderer'
import VersionBadge from '@/components/VersionBadge'

interface PageProps {
  params: Promise<{ slug: string; versionNumber: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, versionNumber } = await params

  const version = await getArticleVersion(slug, parseInt(versionNumber))
  let post = await getBlogPostBySlug(slug)

  if (!post) {
    post = blogPosts.find(p => p.slug === slug)
  }

  const title = version && post
    ? `${post.title} - ${version.versionLabel}`
    : 'Version de l\'article'

  const description = version
    ? `Version ${version.versionLabel} publiée le ${new Date(version.publishedDate).toLocaleDateString('fr-FR')}`
    : 'Version de l\'article'

  return {
    title,
    description,
  }
}

export default async function VersionPage({ params }: PageProps) {
  const { slug, versionNumber } = await params

  // Get version data
  const version = await getArticleVersion(slug, parseInt(versionNumber))

  // Get article data for title
  let post = await getBlogPostBySlug(slug)
  if (!post) {
    post = blogPosts.find(p => p.slug === slug)
  }

  if (!version || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Version non trouvée</h1>
          <p className="text-muted-foreground mb-4">
            Cette version n'existe pas ou a été supprimée.
          </p>
          <Link
            href={`/blog/${slug}/versions`}
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Voir toutes les versions
          </Link>
        </div>
      </div>
    )
  }

  // Get all versions for navigation
  const allVersions = await getArticleVersions(slug)
  const currentVersionIndex = allVersions.findIndex(v => v.versionNumber === version.versionNumber)
  const newerVersion = currentVersionIndex > 0 ? allVersions[currentVersionIndex - 1] : null
  const olderVersion = currentVersionIndex < allVersions.length - 1 ? allVersions[currentVersionIndex + 1] : null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/blog/${slug}/versions`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Toutes les versions
          </Link>

          <Link
            href={`/blog/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            Voir la version actuelle
          </Link>
        </div>

        {/* Version info banner */}
        <div className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <History className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Vous consultez une version archivée</h2>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <VersionBadge versionLabel={version.versionLabel} />
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <time dateTime={version.publishedDate}>
                    Publiée le {formatDate(version.publishedDate)}
                  </time>
                </div>
              </div>
              {version.changeSummary && (
                <p className="mt-3 text-sm leading-relaxed">
                  <strong>Modifications :</strong> {version.changeSummary}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Version navigation */}
        {(newerVersion || olderVersion) && (
          <div className="flex gap-3 mb-8">
            {olderVersion && (
              <Link
                href={`/blog/${slug}/versions/${olderVersion.versionNumber}`}
                className="flex-1 p-4 text-left border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="text-xs text-muted-foreground mb-1">← Version précédente</div>
                <div className="font-medium">{olderVersion.versionLabel}</div>
              </Link>
            )}
            {newerVersion && (
              <Link
                href={`/blog/${slug}/versions/${newerVersion.versionNumber}`}
                className="flex-1 p-4 text-right border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="text-xs text-muted-foreground mb-1">Version suivante →</div>
                <div className="font-medium">{newerVersion.versionLabel}</div>
              </Link>
            )}
          </div>
        )}

        {/* Article header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          {post.excerpt && (
            <p className="text-xl text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Article content */}
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <NotionBlockRenderer content={version.content} />
        </article>

        {/* Bottom navigation */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex items-center justify-between">
            <Link
              href={`/blog/${slug}/versions`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voir toutes les versions
            </Link>

            {newerVersion && (
              <Link
                href={`/blog/${slug}/versions/compare?from=${version.versionNumber}&to=${newerVersion.versionNumber}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Comparer avec {newerVersion.versionLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600
