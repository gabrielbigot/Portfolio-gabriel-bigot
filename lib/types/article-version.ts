/**
 * Types for Article Versioning System
 */

/**
 * Represents a content block in an article
 */
export type ContentBlock = {
  type: 'heading_1' | 'heading_2' | 'heading_3' | 'paragraph' | 'bulleted_list' | 'numbered_list' | 'todo_list' | 'quote' | 'callout' | 'code' | 'divider' | 'image' | 'video' | 'embed' | 'toggle' | 'table' | 'column_list';
  text?: string;
  items?: string[] | { text: string; checked: boolean }[];
  icon?: string;
  language?: string;
  url?: string;
  caption?: string;
  children?: ContentBlock[];
  has_column_header?: boolean;
  has_row_header?: boolean;
  rows?: string[][];
  columns?: ContentBlock[][];
}

/**
 * Represents a single version of an article
 */
export interface ArticleVersion {
  id: string;
  articleSlug: string;
  versionNumber: number;
  versionLabel: string; // e.g., "v1.0", "v2.0"
  publishedDate: string;
  isCurrentVersion: boolean;
  changeSummary: string;
  content: ContentBlock[];
  status: 'Published' | 'Draft' | 'Archived';
}

/**
 * Represents a blog post with versioning information
 */
export interface VersionedBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readingTime: string;
  category: string;
  featured: boolean;
  published: boolean;
  content: ContentBlock[];
  // Versioning fields
  currentVersion?: number;
  lastUpdated?: string;
  hasVersions: boolean;
  versions?: ArticleVersion[];
}

/**
 * Represents a change type in the diff
 */
export type ChangeType = 'added' | 'removed' | 'modified' | 'unchanged';

/**
 * Represents a word-level change in a text
 */
export interface WordDiff {
  text: string;
  type: ChangeType;
}

/**
 * Represents a block-level diff
 */
export interface BlockDiff {
  type: ChangeType;
  blockType: ContentBlock['type'];
  oldContent?: ContentBlock;
  newContent?: ContentBlock;
  wordDiffs?: WordDiff[]; // For modified paragraphs
  index: number;
}

/**
 * Represents a complete diff between two versions
 */
export interface VersionDiff {
  fromVersion: ArticleVersion;
  toVersion: ArticleVersion;
  changes: BlockDiff[];
  summary: {
    added: number;
    removed: number;
    modified: number;
  };
}

/**
 * Options for comparing versions
 */
export interface DiffOptions {
  compareWords: boolean; // Whether to do word-level diff for paragraphs
  ignoreWhitespace: boolean; // Whether to ignore whitespace changes
}
