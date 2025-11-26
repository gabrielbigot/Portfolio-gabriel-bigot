/**
 * Notion API integration for Article Versioning
 */

import type { ArticleVersion, ContentBlock } from './types/article-version'

const NOTION_API_VERSION = "2022-06-28"
const NOTION_API_KEY = process.env.NOTION_API_KEY
const VERSIONS_DATABASE_ID = process.env.NOTION_VERSIONS_DATABASE_ID || ""

/**
 * Make a request to Notion API
 */
async function notionRequest(endpoint: string, options: RequestInit = {}) {
  const url = `https://api.notion.com/v1${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": NOTION_API_VERSION,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(`Notion API error: ${response.status} - ${error}`)
    throw new Error(`Notion API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Extract plain text from Notion rich text
 */
function extractPlainText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return ""
  return richText.map((t) => t.plain_text || "").join("")
}

/**
 * Fetch children of a block recursively
 */
async function fetchBlockChildren(blockId: string): Promise<any[]> {
  try {
    const blocksData = await notionRequest(`/blocks/${blockId}/children`)
    const children = blocksData.results || []

    // Recursively fetch children for nested blocks
    const childrenWithNestedContent = await Promise.all(
      children.map(async (child: any) => {
        if (child.has_children) {
          const nestedChildren = await fetchBlockChildren(child.id)
          return { ...child, children: nestedChildren }
        }
        return child
      })
    )

    return childrenWithNestedContent
  } catch (error) {
    console.error(`Error fetching children for block ${blockId}:`, error)
    return []
  }
}

/**
 * Parse Notion blocks to content sections
 */
async function parseBlocksToContent(blocks: any[]): Promise<ContentBlock[]> {
  const content: ContentBlock[] = []

  for (const block of blocks) {
    const type = block.type

    if (type === "heading_1") {
      content.push({
        type: "heading_1",
        text: extractPlainText(block.heading_1?.rich_text),
      })
    } else if (type === "heading_2") {
      content.push({
        type: "heading_2",
        text: extractPlainText(block.heading_2?.rich_text),
      })
    } else if (type === "heading_3") {
      const text = extractPlainText(block.heading_3?.rich_text)

      // If heading_3 has children, treat it as a toggle
      if (block.has_children && block.children) {
        const children = await parseBlocksToContent(block.children)
        content.push({
          type: "toggle",
          text,
          children,
        })
      } else {
        content.push({
          type: "heading_3",
          text,
        })
      }
    } else if (type === "paragraph") {
      const text = extractPlainText(block.paragraph?.rich_text)
      if (text) {
        content.push({
          type: "paragraph",
          text,
        })
      }
    } else if (type === "bulleted_list_item") {
      const text = extractPlainText(block.bulleted_list_item?.rich_text)
      if (text) {
        // Group consecutive list items
        const lastItem = content[content.length - 1]
        if (lastItem && lastItem.type === "bulleted_list") {
          (lastItem.items as string[]).push(text)
        } else {
          content.push({
            type: "bulleted_list",
            items: [text],
          })
        }
      }
    } else if (type === "numbered_list_item") {
      const text = extractPlainText(block.numbered_list_item?.rich_text)
      if (text) {
        // Group consecutive numbered list items
        const lastItem = content[content.length - 1]
        if (lastItem && lastItem.type === "numbered_list") {
          (lastItem.items as string[]).push(text)
        } else {
          content.push({
            type: "numbered_list",
            items: [text],
          })
        }
      }
    } else if (type === "to_do") {
      const text = extractPlainText(block.to_do?.rich_text)
      const checked = block.to_do?.checked || false
      if (text) {
        const lastItem = content[content.length - 1]
        if (lastItem && lastItem.type === "todo_list") {
          (lastItem.items as { text: string; checked: boolean }[]).push({ text, checked })
        } else {
          content.push({
            type: "todo_list",
            items: [{ text, checked }],
          })
        }
      }
    } else if (type === "quote") {
      content.push({
        type: "quote",
        text: extractPlainText(block.quote?.rich_text),
      })
    } else if (type === "callout") {
      content.push({
        type: "callout",
        text: extractPlainText(block.callout?.rich_text),
        icon: block.callout?.icon?.emoji || "💡",
      })
    } else if (type === "code") {
      content.push({
        type: "code",
        text: extractPlainText(block.code?.rich_text),
        language: block.code?.language || "plaintext",
      })
    } else if (type === "divider") {
      content.push({
        type: "divider",
      })
    } else if (type === "image") {
      const imageUrl = block.image?.file?.url || block.image?.external?.url
      if (imageUrl) {
        content.push({
          type: "image",
          url: imageUrl,
          caption: extractPlainText(block.image?.caption),
        })
      }
    } else if (type === "toggle") {
      const text = extractPlainText(block.toggle?.rich_text)
      let children: ContentBlock[] = []

      if (block.children) {
        children = await parseBlocksToContent(block.children)
      }

      content.push({
        type: "toggle",
        text,
        children,
      })
    } else if (type === "table") {
      const tableData: ContentBlock = {
        type: "table",
        has_column_header: block.table?.has_column_header || false,
        has_row_header: block.table?.has_row_header || false,
        rows: [],
      }

      if (block.children) {
        for (const row of block.children) {
          if (row.type === "table_row") {
            const cells = row.table_row?.cells?.map((cell: any[]) =>
              extractPlainText(cell)
            ) || []
            tableData.rows!.push(cells)
          }
        }
      }

      content.push(tableData)
    } else if (type === "column_list") {
      const columns: ContentBlock[][] = []

      if (block.children) {
        for (const columnBlock of block.children) {
          if (columnBlock.type === "column") {
            let columnContent: ContentBlock[] = []
            if (columnBlock.children) {
              columnContent = await parseBlocksToContent(columnBlock.children)
            }
            columns.push(columnContent)
          }
        }
      }

      content.push({
        type: "column_list",
        columns,
      })
    } else if (type === "video") {
      const videoUrl = block.video?.file?.url || block.video?.external?.url
      if (videoUrl) {
        content.push({
          type: "video",
          url: videoUrl,
          caption: extractPlainText(block.video?.caption),
        })
      }
    } else if (type === "embed") {
      const embedUrl = block.embed?.url
      if (embedUrl) {
        content.push({
          type: "embed",
          url: embedUrl,
          caption: extractPlainText(block.embed?.caption),
        })
      }
    }
  }

  return content
}

/**
 * Fetch all versions for a specific article slug
 */
export async function getArticleVersions(articleSlug: string): Promise<ArticleVersion[]> {
  try {
    if (!VERSIONS_DATABASE_ID || !NOTION_API_KEY) {
      console.warn("Versions database not configured")
      return []
    }

    // Query the versions database filtering by article slug
    const data = await notionRequest(`/databases/${VERSIONS_DATABASE_ID}/query`, {
      method: "POST",
      body: JSON.stringify({
        filter: {
          property: "Slug",
          rich_text: {
            equals: articleSlug
          }
        },
        sorts: [
          {
            property: "Version Number",
            direction: "descending"
          }
        ]
      }),
    })

    const versions = await Promise.all(
      data.results.map(async (page: any) => {
        const props = page.properties

        // Fetch page blocks (content)
        let blocks: any[] = []
        try {
          const blocksData = await notionRequest(`/blocks/${page.id}/children`)
          const rawBlocks = blocksData.results || []

          // Fetch children for blocks that have them
          blocks = await Promise.all(
            rawBlocks.map(async (block: any) => {
              if (block.has_children) {
                const children = await fetchBlockChildren(block.id)
                return { ...block, children }
              }
              return block
            })
          )
        } catch (error) {
          console.error(`Error fetching blocks for version ${page.id}:`, error)
        }

        const content = await parseBlocksToContent(blocks)

        return {
          id: page.id,
          articleSlug: extractPlainText(props.Slug?.rich_text),
          versionNumber: props["Version Number"]?.number || 1,
          versionLabel: extractPlainText(props["Version Label"]?.rich_text) || `v${props["Version Number"]?.number || 1}.0`,
          publishedDate: props["Published Date"]?.date?.start || "",
          isCurrentVersion: props["Is Current Version"]?.checkbox || false,
          changeSummary: extractPlainText(props["Change Summary"]?.rich_text),
          content,
          status: (props.Status?.select?.name as 'Published' | 'Draft' | 'Archived') || "Published",
        } as ArticleVersion
      })
    )

    // Filter for published versions only
    const publishedVersions = versions.filter((v) => v.status === "Published")

    return publishedVersions
  } catch (error) {
    console.error(`Error fetching versions for article ${articleSlug}:`, error)
    return []
  }
}

/**
 * Get a specific version by article slug and version number
 */
export async function getArticleVersion(articleSlug: string, versionNumber: number): Promise<ArticleVersion | null> {
  try {
    const versions = await getArticleVersions(articleSlug)
    return versions.find((v) => v.versionNumber === versionNumber) || null
  } catch (error) {
    console.error(`Error fetching version ${versionNumber} for article ${articleSlug}:`, error)
    return null
  }
}

/**
 * Get the current version of an article
 */
export async function getCurrentArticleVersion(articleSlug: string): Promise<ArticleVersion | null> {
  try {
    const versions = await getArticleVersions(articleSlug)
    const currentVersion = versions.find((v) => v.isCurrentVersion)

    // If no version is marked as current, return the latest one
    if (!currentVersion && versions.length > 0) {
      return versions[0] // Already sorted by version number descending
    }

    return currentVersion || null
  } catch (error) {
    console.error(`Error fetching current version for article ${articleSlug}:`, error)
    return null
  }
}

/**
 * Check if an article has multiple versions
 */
export async function articleHasVersions(articleSlug: string): Promise<boolean> {
  try {
    const versions = await getArticleVersions(articleSlug)
    return versions.length > 1
  } catch (error) {
    console.error(`Error checking versions for article ${articleSlug}:`, error)
    return false
  }
}
