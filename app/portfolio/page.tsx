import ExtraBlocks from "@/components/blocks/ExtraBlocks"
import PortfolioClient from "@/components/PortfolioClient"
import { getPortfolioPageData } from "@/lib/portfolio-i18n"
import { getContent } from "@/lib/site-content"
import { loadArticles } from "@/lib/articles/list"

async function getLatestEssay() {
  const list = (await loadArticles()).filter((a) => a.status === "public").sort((a, b) => String(b.published).localeCompare(String(a.published)))
  const a = list.find((x) => x.series === "Essais") ?? list[0]
  return a ? { slug: a.slug, title: a.title, summary: a.subtitle || a.summary || "", published: a.published || "" } : undefined
}

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
      latestEssay={await getLatestEssay()}
      extra={<ExtraBlocks page="/portfolio" />}
    />
  )
}
