import ExtraBlocks from "@/components/blocks/ExtraBlocks"
import PortfolioClient from "@/components/PortfolioClient"
import { getPortfolioPageData } from "@/lib/portfolio-i18n"
import { getContent } from "@/lib/site-content"
import { loadArticles, isEssay } from "@/lib/articles/list"

async function getLatest() {
  const list = (await loadArticles()).filter((a) => a.status === "public").sort((a, b) => String(b.published).localeCompare(String(a.published)))
  const pick = (a?: (typeof list)[number]) => (a ? { slug: a.slug, title: a.title, summary: a.subtitle || a.summary || "", published: a.published || "" } : undefined)
  return { essay: pick(list.find(isEssay) ?? list[0]), article: pick(list.find((a) => !isEssay(a))) }
}

export default async function PortfolioPage() {
  const { personalInfo, socialLinks, workExperience, skills, projects } = await getPortfolioPageData("fr")

  const latest = await getLatest()

  return (
    <PortfolioClient
      personalInfo={personalInfo}
      socialLinks={socialLinks}
      workExperience={workExperience}
      skills={skills}
      projects={projects as any}
      locale="fr"
      ui={await getContent("uiPortfolio")}
      latestEssay={latest.essay}
      latestArticle={latest.article}
      extra={<ExtraBlocks page="/portfolio" />}
    />
  )
}
