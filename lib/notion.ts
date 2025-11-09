import { Client } from "@notionhq/client"
import { NotionToMarkdown } from "notion-to-md"

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Initialize notion-to-markdown
const n2m = new NotionToMarkdown({ notionClient: notion })

// Database IDs from environment variables
const PROJECTS_DATABASE_ID = process.env.NOTION_PROJECTS_DATABASE_ID || ""
const BLOG_DATABASE_ID = process.env.NOTION_BLOG_DATABASE_ID || ""

/**
 * Fetch all projects from Notion database
 */
export async function getProjectsFromNotion() {
  try {
    if (!PROJECTS_DATABASE_ID) {
      console.warn("NOTION_PROJECTS_DATABASE_ID not configured, returning empty array")
      return []
    }

    const response = await notion.databases.query({
      database_id: PROJECTS_DATABASE_ID,
      filter: {
        property: "Status",
        select: {
          equals: "Published",
        },
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    })

    const projects = await Promise.all(
      response.results.map(async (page: any) => {
        const pageContent = await notion.blocks.children.list({
          block_id: page.id,
        })

        return {
          id: page.id,
          title: page.properties.Title?.title[0]?.plain_text || "",
          slug: page.properties.Slug?.rich_text[0]?.plain_text || "",
          shortDescription: page.properties.ShortDescription?.rich_text[0]?.plain_text || "",
          fullDescription: page.properties.FullDescription?.rich_text[0]?.plain_text || "",
          category: page.properties.Category?.select?.name || "",
          tags: page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
          date: page.properties.Date?.date?.start || "",
          company: page.properties.Company?.rich_text[0]?.plain_text || "",
          featured: page.properties.Featured?.checkbox || false,
          image: page.properties.Image?.url || "",
          problem: page.properties.Problem?.rich_text[0]?.plain_text || "",
          solution: page.properties.Solution?.rich_text[0]?.plain_text || "",
          impact: page.properties.Impact?.rich_text?.map((item: any) => item.plain_text) || [],
          technologies: page.properties.Technologies?.multi_select?.map((tech: any) => tech.name) || [],
          challenges: page.properties.Challenges?.rich_text?.map((item: any) => item.plain_text) || [],
          learnings: page.properties.Learnings?.rich_text?.map((item: any) => item.plain_text) || [],
        }
      })
    )

    return projects
  } catch (error) {
    console.error("Error fetching projects from Notion:", error)
    return []
  }
}

/**
 * Fetch all blog posts from Notion database
 */
export async function getBlogPostsFromNotion() {
  try {
    if (!BLOG_DATABASE_ID) {
      console.warn("NOTION_BLOG_DATABASE_ID not configured, returning empty array")
      return []
    }

    const response = await notion.databases.query({
      database_id: BLOG_DATABASE_ID,
      filter: {
        property: "Status",
        select: {
          equals: "Published",
        },
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    })

    const blogPosts = await Promise.all(
      response.results.map(async (page: any) => {
        // Get page content and convert to markdown blocks
        const mdblocks = await n2m.pageToMarkdown(page.id)

        // Parse content into structured sections
        const content = mdblocks.map((block: any) => {
          if (block.type === "heading_1" || block.type === "heading_2") {
            return {
              type: "heading",
              text: block.parent,
            }
          } else if (block.type === "paragraph") {
            return {
              type: "paragraph",
              text: block.parent,
            }
          } else if (block.type === "bulleted_list_item") {
            return {
              type: "list",
              items: [block.parent],
            }
          } else if (block.type === "quote") {
            return {
              type: "quote",
              text: block.parent,
            }
          } else if (block.type === "code") {
            return {
              type: "code",
              text: block.parent,
            }
          }
          return null
        }).filter(Boolean)

        return {
          id: page.id,
          title: page.properties.Title?.title[0]?.plain_text || "",
          slug: page.properties.Slug?.rich_text[0]?.plain_text || "",
          excerpt: page.properties.Excerpt?.rich_text[0]?.plain_text || "",
          date: page.properties.Date?.date?.start || "",
          readingTime: page.properties.ReadingTime?.rich_text[0]?.plain_text || "5 min",
          category: page.properties.Category?.select?.name || "",
          featured: page.properties.Featured?.checkbox || false,
          published: page.properties.Status?.select?.name === "Published",
          content,
        }
      })
    )

    return blogPosts
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
