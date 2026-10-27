import ExtraBlocks from "@/components/blocks/ExtraBlocks"
import { getPersonalInfo, getProjects } from "@/lib/portfolio-data"
import { getContent } from "@/lib/site-content"
import ProjectsPageClient from "@/components/ProjectsPageClient"

export default async function ProjectsPage() {
  const personalInfo = await getPersonalInfo()
  const projects = await getProjects()
  return <ProjectsPageClient projects={projects as any} cvUrl={(personalInfo as any).cvUrl} locale="fr" ui={await getContent("uiProjects")} extra={<ExtraBlocks page="/projects" />} />
}
