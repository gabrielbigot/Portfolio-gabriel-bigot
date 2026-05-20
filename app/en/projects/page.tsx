import { getPersonalInfo } from "@/lib/portfolio-data"
import { getLocalizedProjects } from "@/lib/portfolio-i18n"
import ProjectsPageClient from "@/components/ProjectsPageClient"

export const metadata = {
  title: "Projects — Gabriel Bigot",
  description: "Automation, AI, and full-stack projects by Gabriel Bigot.",
}

export default function EnglishProjectsPage() {
  const personalInfo = getPersonalInfo()
  const projects = getLocalizedProjects("en")

  return <ProjectsPageClient projects={projects as any} cvUrl={(personalInfo as any).cvUrl} locale="en" />
}
