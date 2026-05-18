/**
 * Diff Engine for comparing article versions
 * Implements a sophisticated comparison algorithm for content blocks
 */

import type {
  ArticleVersion,
  ContentBlock,
  BlockDiff,
  VersionDiff,
  WordDiff,
  DiffOptions,
  ChangeType
} from './types/article-version'

/**
 * Default diff options
 */
const DEFAULT_DIFF_OPTIONS: DiffOptions = {
  compareWords: true,
  ignoreWhitespace: false,
}

/**
 * Compare two versions and generate a diff
 */
export function compareVersions(
  fromVersion: ArticleVersion,
  toVersion: ArticleVersion,
  options: Partial<DiffOptions> = {}
): VersionDiff {
  const opts = { ...DEFAULT_DIFF_OPTIONS, ...options }

  const changes = compareContentBlocks(fromVersion.content, toVersion.content, opts)

  // Calculate summary statistics
  const summary = {
    added: changes.filter(c => c.type === 'added').length,
    removed: changes.filter(c => c.type === 'removed').length,
    modified: changes.filter(c => c.type === 'modified').length,
  }

  return {
    fromVersion,
    toVersion,
    changes,
    summary,
  }
}

/**
 * Compare two arrays of content blocks
 */
function compareContentBlocks(
  oldBlocks: ContentBlock[],
  newBlocks: ContentBlock[],
  options: DiffOptions
): BlockDiff[] {
  const diffs: BlockDiff[] = []

  // Use Longest Common Subsequence (LCS) algorithm to find matching blocks
  const lcs = findLCS(oldBlocks, newBlocks)

  let oldIndex = 0
  let newIndex = 0
  let diffIndex = 0

  while (oldIndex < oldBlocks.length || newIndex < newBlocks.length) {
    const oldBlock = oldBlocks[oldIndex]
    const newBlock = newBlocks[newIndex]

    // Check if both blocks are in LCS (unchanged or modified)
    if (oldBlock && newBlock && isInLCS(oldBlock, newBlock, lcs)) {
      // Blocks match - check if content is identical or modified
      const isIdentical = blocksAreEqual(oldBlock, newBlock)

      if (isIdentical) {
        diffs.push({
          type: 'unchanged',
          blockType: newBlock.type,
          newContent: newBlock,
          index: diffIndex,
        })
      } else {
        // Blocks are similar but modified
        const wordDiffs = options.compareWords && (oldBlock.type === 'paragraph' || oldBlock.type === 'heading_1' || oldBlock.type === 'heading_2' || oldBlock.type === 'heading_3')
          ? compareWords(oldBlock.text || '', newBlock.text || '', options)
          : undefined

        diffs.push({
          type: 'modified',
          blockType: newBlock.type,
          oldContent: oldBlock,
          newContent: newBlock,
          wordDiffs,
          index: diffIndex,
        })
      }

      oldIndex++
      newIndex++
    } else if (!newBlock || (oldBlock && !isBlockInList(oldBlock, newBlocks.slice(newIndex)))) {
      // Block was removed
      diffs.push({
        type: 'removed',
        blockType: oldBlock.type,
        oldContent: oldBlock,
        index: diffIndex,
      })
      oldIndex++
    } else {
      // Block was added
      diffs.push({
        type: 'added',
        blockType: newBlock.type,
        newContent: newBlock,
        index: diffIndex,
      })
      newIndex++
    }

    diffIndex++
  }

  return diffs
}

/**
 * Find Longest Common Subsequence of blocks
 */
function findLCS(oldBlocks: ContentBlock[], newBlocks: ContentBlock[]): Set<string> {
  const lcsSet = new Set<string>()

  // Simple LCS implementation using dynamic programming
  const m = oldBlocks.length
  const n = newBlocks.length
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0))

  // Build LCS table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (blocksSimilar(oldBlocks[i - 1], newBlocks[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to find LCS blocks
  let i = m
  let j = n
  while (i > 0 && j > 0) {
    if (blocksSimilar(oldBlocks[i - 1], newBlocks[j - 1])) {
      lcsSet.add(getBlockKey(oldBlocks[i - 1]) + '::' + getBlockKey(newBlocks[j - 1]))
      i--
      j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  return lcsSet
}

/**
 * Check if two blocks are in the LCS
 */
function isInLCS(oldBlock: ContentBlock, newBlock: ContentBlock, lcs: Set<string>): boolean {
  return lcs.has(getBlockKey(oldBlock) + '::' + getBlockKey(newBlock))
}

/**
 * Check if a block exists in a list of blocks
 */
function isBlockInList(block: ContentBlock, blockList: ContentBlock[]): boolean {
  return blockList.some(b => blocksSimilar(block, b))
}

/**
 * Check if two blocks are similar (same type and similar content)
 */
function blocksSimilar(block1: ContentBlock, block2: ContentBlock): boolean {
  if (block1.type !== block2.type) return false

  // For text-based blocks, check if content is similar (at least 50% match)
  if (block1.text && block2.text) {
    const similarity = calculateSimilarity(block1.text, block2.text)
    return similarity > 0.5
  }

  // For lists, check if they have similar items
  if (block1.items && block2.items) {
    return true // Same type of list is considered similar
  }

  return true
}

/**
 * Check if two blocks are exactly equal
 */
function blocksAreEqual(block1: ContentBlock, block2: ContentBlock): boolean {
  // Deep equality check
  return JSON.stringify(block1) === JSON.stringify(block2)
}

/**
 * Calculate text similarity using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length)
  if (maxLen === 0) return 1.0

  const distance = levenshteinDistance(str1, str2)
  return 1 - distance / maxLen
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        )
      }
    }
  }

  return dp[m][n]
}

/**
 * Generate a unique key for a block
 */
function getBlockKey(block: ContentBlock): string {
  return `${block.type}:${block.text?.substring(0, 50) || ''}`
}

/**
 * Compare two strings at word level
 */
export function compareWords(
  oldText: string,
  newText: string,
  options: DiffOptions
): WordDiff[] {
  let text1 = oldText
  let text2 = newText

  if (options.ignoreWhitespace) {
    text1 = text1.trim()
    text2 = text2.trim()
  }

  const words1 = text1.split(/\s+/)
  const words2 = text2.split(/\s+/)

  const wordDiffs: WordDiff[] = []

  // Use LCS for words
  const lcs = findWordLCS(words1, words2)

  let i = 0
  let j = 0

  while (i < words1.length || j < words2.length) {
    const word1 = words1[i]
    const word2 = words2[j]

    if (word1 && word2 && lcs.has(`${i}::${j}`) && word1 === word2) {
      // Unchanged word
      wordDiffs.push({
        text: word2,
        type: 'unchanged',
      })
      i++
      j++
    } else if (!word2 || (word1 && !words2.slice(j).includes(word1))) {
      // Removed word
      wordDiffs.push({
        text: word1,
        type: 'removed',
      })
      i++
    } else {
      // Added word
      wordDiffs.push({
        text: word2,
        type: 'added',
      })
      j++
    }
  }

  return wordDiffs
}

/**
 * Find LCS of words
 */
function findWordLCS(words1: string[], words2: string[]): Set<string> {
  const lcsSet = new Set<string>()

  const m = words1.length
  const n = words2.length
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0))

  // Build LCS table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (words1[i - 1] === words2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack
  let i = m
  let j = n
  while (i > 0 && j > 0) {
    if (words1[i - 1] === words2[j - 1]) {
      lcsSet.add(`${i - 1}::${j - 1}`)
      i--
      j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  return lcsSet
}

/**
 * Get a human-readable summary of changes
 */
export function getChangeSummary(diff: VersionDiff): string {
  const { added, removed, modified } = diff.summary

  const parts: string[] = []

  if (added > 0) {
    parts.push(`${added} bloc${added > 1 ? 's' : ''} ajouté${added > 1 ? 's' : ''}`)
  }

  if (removed > 0) {
    parts.push(`${removed} bloc${removed > 1 ? 's' : ''} supprimé${removed > 1 ? 's' : ''}`)
  }

  if (modified > 0) {
    parts.push(`${modified} bloc${modified > 1 ? 's' : ''} modifié${modified > 1 ? 's' : ''}`)
  }

  return parts.length > 0 ? parts.join(', ') : 'Aucune modification'
}
