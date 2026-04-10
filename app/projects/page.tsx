import { projects } from "@/lib/data"
import { getPersonalInfo } from "@/lib/portfolio-data"
import ProjectsPageClient from "@/components/ProjectsPageClient"

export default function ProjectsPage() {
  const personalInfo = getPersonalInfo()
  return <ProjectsPageClient projects={projects} cvUrl={(personalInfo as any).cvUrl} />
}
