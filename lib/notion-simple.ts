/**
 * Simplified Notion Integration using fetch API
 * No external dependencies needed
 */

const NOTION_API_VERSION = "2022-06-28"
const NOTION_API_KEY = process.env.NOTION_API_KEY
const PROJECTS_DATABASE_ID = process.env.NOTION_PROJECTS_DATABASE_ID || ""
const BLOG_DATABASE_ID = process.env.NOTION_BLOG_DATABASE_ID || ""

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
 * Fetch all projects from Notion database
 */
export async function getProjectsFromNotion() {
  try {
    if (!PROJECTS_DATABASE_ID || !NOTION_API_KEY) {
      console.warn("Notion not configured, returning empty array")
      return []
    }

    // Query without filters to be more flexible
    const data = await notionRequest(`/databases/${PROJECTS_DATABASE_ID}/query`, {
      method: "POST",
      body: JSON.stringify({}),
    })

    const projects = await Promise.all(
      data.results.map(async (page: any) => {
        const props = page.properties

        // Fetch page blocks (content) for detail page
        let blocks: any[] = []
        try {
          const blocksData = await notionRequest(`/blocks/${page.id}/children`)
          const rawBlocks = blocksData.results || []

          // Fetch children for blocks that have them (tables, toggles, columns)
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
          console.error(`Error fetching blocks for page ${page.id}:`, error)
        }

        const content = await parseBlocksToContent(blocks)

        return {
          id: page.id,
          title: extractPlainText(props.Title?.title),
          slug: extractPlainText(props.Slug?.rich_text),
          shortDescription: extractPlainText(props.ShortDescription?.rich_text),
          fullDescription: extractPlainText(props.FullDescription?.rich_text),
          category: props.Category?.select?.name || "",
          tags: props.Tags?.multi_select?.map((tag: any) => tag.name) || [],
          date: props.Date?.date?.start || "",
          company: extractPlainText(props.Company?.rich_text),
          featured: props.Featured?.checkbox || false,
          image: props.Image?.url || "",
          problem: extractPlainText(props.Problem?.rich_text),
          solution: extractPlainText(props.Solution?.rich_text),
          impact: extractPlainText(props.Impact?.rich_text)
            .split("\n")
            .filter(Boolean),
          technologies: props.Technologies?.multi_select?.map((tech: any) => tech.name) || [],
          challenges: extractPlainText(props.Challenges?.rich_text)
            .split("\n")
            .filter(Boolean),
          learnings: extractPlainText(props.Learnings?.rich_text)
            .split("\n")
            .filter(Boolean),
          status: props.Status?.select?.name || "Published",
          content, // Add parsed content from Notion blocks
        }
      })
    )

    // Filter for Published status only if Status property exists
    const publishedProjects = projects.filter((project: any) => !project.status || project.status === "Published")

    return publishedProjects
  } catch (error) {
    console.error("Error fetching projects from Notion:", error)
    return []
  }
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
async function parseBlocksToContent(blocks: any[]): Promise<any[]> {
  const content: any[] = []

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
          lastItem.items.push(text)
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
          lastItem.items.push(text)
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
          lastItem.items.push({ text, checked })
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
      let children: any[] = []

      if (block.children) {
        children = await parseBlocksToContent(block.children)
      }

      content.push({
        type: "toggle",
        text,
        children,
      })
    } else if (type === "table") {
      const tableData: any = {
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
            tableData.rows.push(cells)
          }
        }
      }

      content.push(tableData)
    } else if (type === "column_list") {
      const columns: any[] = []

      if (block.children) {
        for (const columnBlock of block.children) {
          if (columnBlock.type === "column") {
            let columnContent: any[] = []
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
 * Fetch all blog posts from Notion database
 */
export async function getBlogPostsFromNotion() {
  try {
    if (!BLOG_DATABASE_ID || !NOTION_API_KEY) {
      console.warn("Notion not configured, returning empty array")
      return []
    }

    // Query without filters to be more flexible
    const data = await notionRequest(`/databases/${BLOG_DATABASE_ID}/query`, {
      method: "POST",
      body: JSON.stringify({}),
    })

    const blogPosts = await Promise.all(
      data.results.map(async (page: any) => {
        const props = page.properties

        // Fetch page blocks (content)
        let blocks: any[] = []
        try {
          const blocksData = await notionRequest(`/blocks/${page.id}/children`)
          const rawBlocks = blocksData.results || []

          // Fetch children for blocks that have them (tables, toggles, columns)
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
          console.error(`Error fetching blocks for page ${page.id}:`, error)
        }

        const content = await parseBlocksToContent(blocks)

        const status = props.Status?.select?.name || "Published"

        return {
          id: page.id,
          title: extractPlainText(props.Title?.title),
          slug: extractPlainText(props.Slug?.rich_text),
          excerpt: extractPlainText(props.Excerpt?.rich_text),
          date: props.Date?.date?.start || "",
          readingTime: extractPlainText(props.ReadingTime?.rich_text) || "5 min",
          category: props.Category?.select?.name || "",
          featured: props.Featured?.checkbox || false,
          published: status === "Published",
          content,
        }
      })
    )

    // Filter for Published posts only
    const publishedPosts = blogPosts.filter((post) => post.published)

    return publishedPosts
  } catch (error) {
    console.error("Error fetching blog posts from Notion:", error)
    return []
  }
}

/**
 * Fetch a single project by slug
 */
export async function getProjectBySlug(slug: string) {
  try {
    const projects = await getProjectsFromNotion()
    return projects.find((project) => project.slug === slug)
  } catch (error) {
    console.error("Error fetching project by slug:", error)
    return null
  }
}

/**
 * Fetch a single blog post by slug
 */
export async function getBlogPostBySlug(slug: string) {
  try {
    const posts = await getBlogPostsFromNotion()
    return posts.find((post) => post.slug === slug)
  } catch (error) {
    console.error("Error fetching blog post by slug:", error)
    return null
  }
}
