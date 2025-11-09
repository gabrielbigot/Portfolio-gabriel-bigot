import { getProjectsFromNotion } from "@/lib/notion-simple"
import { projects as localProjects } from "@/lib/data"
import ProjectsPageClient from "@/components/ProjectsPageClient"

// Revalidate every hour
export const revalidate = 3600

export default async function ProjectsPage() {
  // Try to fetch from Notion, fallback to local data
  let projects = localProjects

  try {
    const notionProjects = await getProjectsFromNotion()
    if (notionProjects && notionProjects.length > 0) {
      projects = notionProjects as any
      console.log(`✅ Loaded ${notionProjects.length} projects from Notion`)
    } else {
      console.log("⚠️ No projects in Notion, using local data")
    }
  } catch (error) {
    console.warn("Failed to fetch from Notion, using local data:", error)
  }

  return <ProjectsPageClient projects={projects} />
}
