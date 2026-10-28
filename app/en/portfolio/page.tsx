import ExtraBlocks from "@/components/blocks/ExtraBlocks"
import { stripDeep } from "@/lib/studio/stega"
import { getT } from "@/lib/strings"
import PortfolioClient from "@/components/PortfolioClient"
import { getPortfolioPageData } from "@/lib/portfolio-i18n"
import { getContent } from "@/lib/site-content"

export async function generateMetadata() {
  const t = await getT("page.en-portfolio")
  return stripDeep({
    title: t("gabriel-bigot-ai-automation-developer"),
    description: t("english-portfolio-of-gabriel-bigot-focused"),
  })
}

export default async function EnglishPortfolioPage() {
  const { personalInfo, socialLinks, workExperience, skills, projects } = await getPortfolioPageData("en")

  return (
    <PortfolioClient
      personalInfo={personalInfo}
      socialLinks={socialLinks}
      workExperience={workExperience}
      skills={skills}
      projects={projects as any}
      locale="en"
      ui={await getContent("uiPortfolio")}
      extra={<ExtraBlocks page="/en/portfolio" />}
    />
  )
}
