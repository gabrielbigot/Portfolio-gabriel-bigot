import ExtraBlocks from "@/components/blocks/ExtraBlocks"
import { stripDeep } from "@/lib/studio/stega"
import { getT } from "@/lib/strings"
import { getPersonalInfo } from "@/lib/portfolio-data"
import { getLocalizedProjects } from "@/lib/portfolio-i18n"
import { getContent } from "@/lib/site-content"
import ProjectsPageClient from "@/components/ProjectsPageClient"

export async function generateMetadata() {
  const t = await getT("page.en-projects")
  return stripDeep({
    title: t("projects-gabriel-bigot"),
    description: t("automation-ai-and-full-stack-projects"),
  })
}

export default async function EnglishProjectsPage() {
  const personalInfo = await getPersonalInfo()
  const projects = await getLocalizedProjects("en")

  return <ProjectsPageClient projects={projects as any} cvUrl={(personalInfo as any).cvUrl} locale="en" ui={await getContent("uiProjects")} extra={<ExtraBlocks page="/en/projects" />} />
}
