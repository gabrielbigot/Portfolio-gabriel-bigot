import { getBlogPostsFromNotion } from "@/lib/notion-simple"
import { blogPosts as localBlogPosts } from "@/lib/data"
import BlogPageClient from "@/components/BlogPageClient"

// Revalidate every hour
export const revalidate = 3600

export default async function BlogPage() {
  // Try to fetch from Notion, fallback to local data
  let blogPosts = localBlogPosts

  try {
    const notionPosts = await getBlogPostsFromNotion()
    if (notionPosts && notionPosts.length > 0) {
      blogPosts = notionPosts as any
      console.log(`✅ Loaded ${notionPosts.length} blog posts from Notion`)
      console.log(`📋 First post sample:`, blogPosts[0])
    } else {
      console.log("⚠️ No blog posts in Notion, using local data")
    }
  } catch (error) {
    console.warn("Failed to fetch blog posts from Notion, using local data:", error)
  }

  console.log(`🎯 Passing ${blogPosts.length} blog posts to client component`)

  return <BlogPageClient blogPosts={blogPosts} />
}
