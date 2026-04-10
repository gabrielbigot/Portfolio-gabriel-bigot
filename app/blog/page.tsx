import { getBlogPosts } from "@/lib/portfolio-data"
import BlogPageClient from "@/components/BlogPageClient"

export default function BlogPage() {
  const blogPosts = getBlogPosts()
  return <BlogPageClient blogPosts={blogPosts} />
}
