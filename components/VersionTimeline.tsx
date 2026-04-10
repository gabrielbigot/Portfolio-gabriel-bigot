'use client'

/**
 * VersionTimeline Component
 * Displays a timeline of all article versions with navigation
 */

import React from 'react'
import Link from 'next/link'
import type { ArticleVersion } from '@/lib/types/article-version'
import { Calendar, CheckCircle2, Eye, GitCompare } from 'lucide-react'

interface VersionTimelineProps {
  versions: ArticleVersion[]
  currentVersionNumber?: number
  articleSlug: string
}

export default function VersionTimeline({
  versions,
  currentVersionNumber,
  articleSlug,
}: VersionTimelineProps) {
  // Sort versions by version number (descending - newest first)
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber)

  return (
    <div className="space-y-1">
      {sortedVersions.map((version, index) => {
        const isCurrentVersion = version.isCurrentVersion || version.versionNumber === currentVersionNumber
        const isLatest = index === 0
        const isOriginal = index === sortedVersions.length - 1

        return (
          <VersionItem
            key={version.id}
            version={version}
            articleSlug={articleSlug}
            isCurrentVersion={isCurrentVersion}
            isLatest={isLatest}
            isOriginal={isOriginal}
            canCompare={index < sortedVersions.length - 1}
            compareWithVersion={sortedVersions[index + 1]?.versionNumber}
          />
        )
      })}
    </div>
  )
}

/**
 * Single version item in timeline
 */
function VersionItem({
  version,
  articleSlug,
  isCurrentVersion,
  isLatest,
  isOriginal,
  canCompare,
  compareWithVersion,
}: {
  version: ArticleVersion
  articleSlug: string
  isCurrentVersion: boolean
  isLatest: boolean
  isOriginal: boolean
  canCompare: boolean
  compareWithVersion?: number
}) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div
      className={`
        relative pl-8 pb-6 border-l-2
        ${isCurrentVersion ? 'border-primary' : 'border-border'}
      `}
    >
      {/* Timeline dot */}
      <div
        className={`
          absolute left-0 top-0 -translate-x-[9px] w-4 h-4 rounded-full border-2
          ${isCurrentVersion
            ? 'bg-primary border-primary'
            : 'bg-background border-border'
          }
        `}
      />

      {/* Version card */}
      <div
        className={`
          rounded-lg p-4 border transition-all
          ${isCurrentVersion
            ? 'bg-primary/5 border-primary/20'
            : 'bg-card border-border hover:border-primary/40'
          }
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">
                {version.versionLabel}
              </h3>
              {isCurrentVersion && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  Actuelle
                </span>
              )}
              {isLatest && !isCurrentVersion && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                  Plus récente
                </span>
              )}
              {isOriginal && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                  Version originale
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={version.publishedDate}>
                {formatDate(version.publishedDate)}
              </time>
            </div>
          </div>
        </div>

        {/* Change summary */}
        {version.changeSummary && (
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {version.changeSummary}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/blog/${articleSlug}/versions/${version.versionNumber}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-background hover:bg-accent border border-border rounded-md transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            Voir cette version
          </Link>

          {canCompare && compareWithVersion && (
            <Link
              href={`/blog/${articleSlug}/versions/compare?from=${compareWithVersion}&to=${version.versionNumber}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-background hover:bg-accent border border-border rounded-md transition-colors"
            >
              <GitCompare className="h-3.5 w-3.5" />
              Comparer avec v{compareWithVersion}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
