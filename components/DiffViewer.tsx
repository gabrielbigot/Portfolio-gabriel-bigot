'use client'

/**
 * DiffViewer Component
 * Displays visual differences between two article versions
 */

import React from 'react'
import type { BlockDiff, WordDiff, VersionDiff } from '@/lib/types/article-version'
import { Plus, Minus, Edit3 } from 'lucide-react'

interface DiffViewerProps {
  diff: VersionDiff
  showUnchanged?: boolean
}

export default function DiffViewer({ diff, showUnchanged = false }: DiffViewerProps) {
  const filteredChanges = showUnchanged
    ? diff.changes
    : diff.changes.filter(change => change.type !== 'unchanged')

  if (filteredChanges.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Aucune modification entre ces versions</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-4 text-sm border-b pb-4">
        {diff.summary.added > 0 && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Plus className="h-4 w-4" />
            <span>{diff.summary.added} ajouté{diff.summary.added > 1 ? 's' : ''}</span>
          </div>
        )}
        {diff.summary.removed > 0 && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Minus className="h-4 w-4" />
            <span>{diff.summary.removed} supprimé{diff.summary.removed > 1 ? 's' : ''}</span>
          </div>
        )}
        {diff.summary.modified > 0 && (
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <Edit3 className="h-4 w-4" />
            <span>{diff.summary.modified} modifié{diff.summary.modified > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Changes */}
      <div className="space-y-3">
        {filteredChanges.map((change, index) => (
          <DiffBlock key={index} change={change} />
        ))}
      </div>
    </div>
  )
}

/**
 * Single diff block component
 */
function DiffBlock({ change }: { change: BlockDiff }) {
  const getBlockStyles = () => {
    switch (change.type) {
      case 'added':
        return 'bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500'
      case 'removed':
        return 'bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500'
      case 'modified':
        return 'bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-500'
      default:
        return 'bg-muted/30 border-l-4 border-border'
    }
  }

  const getIcon = () => {
    switch (change.type) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'removed':
        return <Minus className="h-4 w-4 text-red-600 dark:text-red-400" />
      case 'modified':
        return <Edit3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      default:
        return null
    }
  }

  const getLabel = () => {
    switch (change.type) {
      case 'added':
        return 'Ajouté'
      case 'removed':
        return 'Supprimé'
      case 'modified':
        return 'Modifié'
      default:
        return 'Inchangé'
    }
  }

  return (
    <div className={`p-4 rounded-lg ${getBlockStyles()}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 text-sm font-medium">
        {getIcon()}
        <span className="capitalize">
          {getBlockTypeLabel(change.blockType)} - {getLabel()}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-2">
        {change.type === 'removed' && change.oldContent && (
          <BlockContent block={change.oldContent} isRemoved />
        )}

        {change.type === 'added' && change.newContent && (
          <BlockContent block={change.newContent} isAdded />
        )}

        {change.type === 'modified' && (
          <>
            {change.wordDiffs ? (
              <WordDiffView words={change.wordDiffs} />
            ) : (
              <>
                {change.oldContent && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">Avant:</div>
                    <BlockContent block={change.oldContent} isRemoved />
                  </div>
                )}
                {change.newContent && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">Après:</div>
                    <BlockContent block={change.newContent} isAdded />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {change.type === 'unchanged' && change.newContent && (
          <BlockContent block={change.newContent} />
        )}
      </div>
    </div>
  )
}

/**
 * Render block content
 */
function BlockContent({ block, isAdded = false, isRemoved = false }: {
  block: any
  isAdded?: boolean
  isRemoved?: boolean
}) {
  const textStyles = isRemoved
    ? 'line-through text-red-700 dark:text-red-300'
    : isAdded
    ? 'text-green-700 dark:text-green-300'
    : ''

  if (block.type === 'paragraph') {
    return <p className={`text-sm ${textStyles}`}>{block.text}</p>
  }

  if (block.type === 'heading_1') {
    return <h1 className={`text-2xl font-bold ${textStyles}`}>{block.text}</h1>
  }

  if (block.type === 'heading_2') {
    return <h2 className={`text-xl font-bold ${textStyles}`}>{block.text}</h2>
  }

  if (block.type === 'heading_3') {
    return <h3 className={`text-lg font-bold ${textStyles}`}>{block.text}</h3>
  }

  if (block.type === 'bulleted_list' || block.type === 'numbered_list') {
    const ListTag = block.type === 'numbered_list' ? 'ol' : 'ul'
    const listClass = block.type === 'numbered_list' ? 'list-decimal' : 'list-disc'
    return (
      <ListTag className={`${listClass} pl-6 space-y-1 text-sm ${textStyles}`}>
        {(block.items as string[]).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ListTag>
    )
  }

  if (block.type === 'quote') {
    return (
      <blockquote className={`border-l-4 border-muted-foreground/20 pl-4 italic text-sm ${textStyles}`}>
        {block.text}
      </blockquote>
    )
  }

  if (block.type === 'code') {
    return (
      <pre className="bg-muted p-3 rounded-md overflow-x-auto">
        <code className={`text-sm ${textStyles}`}>{block.text}</code>
      </pre>
    )
  }

  return <div className={`text-sm ${textStyles}`}>{block.text || '[Contenu complexe]'}</div>
}

/**
 * Word-level diff view
 */
function WordDiffView({ words }: { words: WordDiff[] }) {
  return (
    <div className="text-sm leading-relaxed">
      {words.map((word, index) => {
        const spacing = index < words.length - 1 ? ' ' : ''

        if (word.type === 'added') {
          return (
            <span
              key={index}
              className="bg-green-200 dark:bg-green-900/50 text-green-900 dark:text-green-100 px-0.5 rounded"
            >
              {word.text}{spacing}
            </span>
          )
        }

        if (word.type === 'removed') {
          return (
            <span
              key={index}
              className="bg-red-200 dark:bg-red-900/50 text-red-900 dark:text-red-100 line-through px-0.5 rounded"
            >
              {word.text}{spacing}
            </span>
          )
        }

        return (
          <span key={index}>
            {word.text}{spacing}
          </span>
        )
      })}
    </div>
  )
}

/**
 * Get human-readable block type label
 */
function getBlockTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    heading_1: 'Titre 1',
    heading_2: 'Titre 2',
    heading_3: 'Titre 3',
    paragraph: 'Paragraphe',
    bulleted_list: 'Liste à puces',
    numbered_list: 'Liste numérotée',
    todo_list: 'Liste de tâches',
    quote: 'Citation',
    callout: 'Encadré',
    code: 'Code',
    divider: 'Séparateur',
    image: 'Image',
    video: 'Vidéo',
    embed: 'Contenu embarqué',
    toggle: 'Section dépliable',
    table: 'Tableau',
    column_list: 'Colonnes',
  }

  return labels[type] || type
}
