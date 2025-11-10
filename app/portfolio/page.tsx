import { getBlogPostsFromNotion, getProjectsFromNotion } from "@/lib/notion-simple"
import { getPersonalInfo, getSocialLinks, getWorkExperience, getSkills } from "@/lib/portfolio-data"
import PortfolioClient from "@/components/PortfolioClient"

// Revalidate every hour
export const revalidate = parseInt(process.env.REVALIDATE_INTERVAL || "3600")

export default async function PortfolioPage() {
  // Fetch personal data from Notion with fallback
  const [personalInfo, socialLinks, workExperience, skills] = await Promise.all([
    getPersonalInfo(),
    getSocialLinks(),
    getWorkExperience(),
    getSkills(),
  ])

  // Fetch blog posts from Notion
  let blogPosts = []

  try {
    const notionPosts = await getBlogPostsFromNotion()
    if (notionPosts && notionPosts.length > 0) {
      blogPosts = notionPosts as any
      console.log(`✅ Loaded ${notionPosts.length} blog posts from Notion for portfolio`)
    } else {
      console.log("⚠️ No blog posts in Notion for portfolio")
    }
  } catch (error) {
    console.warn("Failed to fetch blog posts from Notion for portfolio:", error)
  }

  // Fetch projects from Notion
  let projects = []

  try {
    const notionProjects = await getProjectsFromNotion()
    if (notionProjects && notionProjects.length > 0) {
      // Filter featured projects
      projects = notionProjects.filter((p: any) => p.featured) as any
      console.log(`✅ Loaded ${projects.length} featured projects from Notion for portfolio`)
    } else {
      console.log("⚠️ No projects in Notion for portfolio")
    }
  } catch (error) {
    console.warn("Failed to fetch projects from Notion for portfolio:", error)
  }

  console.log(`🎯 Passing ${blogPosts.length} blog posts and ${projects.length} projects to PortfolioClient`)

  return (
    <PortfolioClient
      personalInfo={personalInfo}
      socialLinks={socialLinks}
      workExperience={workExperience}
      skills={skills}
      blogPosts={blogPosts}
      projects={projects}
    />
  )
}
