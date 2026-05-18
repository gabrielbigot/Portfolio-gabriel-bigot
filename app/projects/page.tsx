import { getPersonalInfo, getProjects } from "@/lib/portfolio-data"
import ProjectsPageClient from "@/components/ProjectsPageClient"

export default function ProjectsPage() {
  const personalInfo = getPersonalInfo()
  const projects = getProjects()
  return <ProjectsPageClient projects={projects as any} cvUrl={(personalInfo as any).cvUrl} />
}
