import ExtraBlocks from "@/components/blocks/ExtraBlocks"
import PortfolioClient from "@/components/PortfolioClient"
import { getPortfolioPageData } from "@/lib/portfolio-i18n"
import { getContent } from "@/lib/site-content"

export default async function PortfolioPage() {
  const { personalInfo, socialLinks, workExperience, skills, projects } = await getPortfolioPageData("fr")

  return (
    <PortfolioClient
      personalInfo={personalInfo}
      socialLinks={socialLinks}
      workExperience={workExperience}
      skills={skills}
      projects={projects as any}
      locale="fr"
      ui={await getContent("uiPortfolio")}
      extra={<ExtraBlocks page="/portfolio" />}
    />
  )
}
