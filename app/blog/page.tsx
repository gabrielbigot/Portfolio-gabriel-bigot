import { blogPosts } from "@/lib/data"
import BlogPageClient from "@/components/BlogPageClient"

export default function BlogPage() {
  return <BlogPageClient blogPosts={blogPosts} />
}
