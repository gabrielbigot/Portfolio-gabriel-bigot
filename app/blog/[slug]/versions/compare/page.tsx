/**
 * Version Comparison Page
 * Compare two versions of an article side by side with diff highlighting
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, GitCompare } from 'lucide-react'
import { getArticleVersion, getArticleVersions } from '@/lib/notion-versions'
import { getBlogPostBySlug } from '@/lib/notion-simple'
import { blogPosts } from '@/lib/data'
import { compareVersions, getChangeSummary } from '@/lib/diff-engine'
import DiffViewer from '@/components/DiffViewer'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ from?: string; to?: string }>
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { from, to } = await searchParams

  let post = await getBlogPostBySlug(slug)
  if (!post) {
    post = blogPosts.find(p => p.slug === slug)
  }

  const title = post
    ? `Comparaison des versions - ${post.title}`
    : 'Comparaison des versions'

  const description = from && to
    ? `Comparez les versions ${from} et ${to} de l'article`
    : 'Comparaison des versions de l\'article'

  return {
    title,
    description,
  }
}

export default async function CompareVersionsPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { from, to } = await searchParams

  // Get article data
  let post = await getBlogPostBySlug(slug)
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

  // Validate version numbers
  if (!from || !to) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Paramètres manquants</h1>
          <p className="text-muted-foreground mb-4">
            Veuillez spécifier les versions à comparer.
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

  // Get versions
  const fromVersion = await getArticleVersion(slug, parseInt(from))
  const toVersion = await getArticleVersion(slug, parseInt(to))

  if (!fromVersion || !toVersion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Versions non trouvées</h1>
          <p className="text-muted-foreground mb-4">
            Une ou plusieurs versions spécifiées n'existent pas.
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

  // Compare versions
  const diff = compareVersions(fromVersion, toVersion, {
    compareWords: true,
    ignoreWhitespace: false,
  })

  // Get all versions for selector
  const allVersions = await getArticleVersions(slug)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/blog/${slug}/versions`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Toutes les versions
          </Link>

          <div className="flex items-start gap-4">
            <GitCompare className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                Comparaison des versions
              </h1>
              <p className="text-lg text-muted-foreground">
                {post.title}
              </p>
            </div>
          </div>
        </div>

        {/* Version selector */}
        <div className="mb-6 p-6 bg-muted/50 rounded-lg border">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">Version de base</div>
              <div className="text-lg font-semibold">{fromVersion.versionLabel}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(fromVersion.publishedDate).toLocaleDateString('fr-FR')}
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="px-4 py-2 bg-background border rounded-full text-sm font-medium">
                →
              </div>
            </div>

            <div className="flex-1 text-right">
              <div className="text-sm text-muted-foreground mb-1">Version comparée</div>
              <div className="text-lg font-semibold">{toVersion.versionLabel}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(toVersion.publishedDate).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>

          {/* Quick links to switch comparison */}
          <div className="mt-4 pt-4 border-t flex gap-2 text-sm">
            <span className="text-muted-foreground">Comparer avec :</span>
            {allVersions
              .filter(v => v.versionNumber !== fromVersion.versionNumber && v.versionNumber !== toVersion.versionNumber)
              .slice(0, 3)
              .map(v => (
                <Link
                  key={v.versionNumber}
                  href={`/blog/${slug}/versions/compare?from=${fromVersion.versionNumber}&to=${v.versionNumber}`}
                  className="text-primary hover:underline"
                >
                  {v.versionLabel}
                </Link>
              ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm">
            <strong>Résumé :</strong> {getChangeSummary(diff)}
          </p>
        </div>

        {/* Diff viewer */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Modifications détaillées</h2>
          <DiffViewer diff={diff} showUnchanged={false} />
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Link
            href={`/blog/${slug}/versions/${fromVersion.versionNumber}`}
            className="flex-1 p-4 text-center border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="font-medium">Voir {fromVersion.versionLabel}</div>
            <div className="text-xs text-muted-foreground mt-1">Version de base</div>
          </Link>

          <Link
            href={`/blog/${slug}/versions/${toVersion.versionNumber}`}
            className="flex-1 p-4 text-center border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="font-medium">Voir {toVersion.versionLabel}</div>
            <div className="text-xs text-muted-foreground mt-1">Version comparée</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600
