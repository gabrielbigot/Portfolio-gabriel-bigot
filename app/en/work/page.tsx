import ExtraBlocks from "@/components/blocks/ExtraBlocks"
import { stripDeep } from "@/lib/studio/stega"
import { getT } from "@/lib/strings"
import { getContent } from "@/lib/site-content"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export async function generateMetadata() {
  const t = await getT("page.en-work")
  return stripDeep({
    title: t("professional-experience-gabriel-bigot"),
    description: t("companies-missions-and-projects-led-by"),
  })
}

export default async function EnglishWorkPage() {
  const t = await getT("page.en-work")
  const companies = await getContent("companiesEn")
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-4">
          <Link href="/en/portfolio" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
            <ArrowLeft className="w-4 h-4" />
            <span>{t("back-to-portfolio")}</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 sm:px-8 py-12 sm:py-20">
        <header className="space-y-6 pb-10 sm:pb-14">
          <div className="text-sm text-muted-foreground font-mono tracking-wider">{t("experience")}{" "}{new Date().getFullYear()}
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl leading-[1.02]">{t("where-i-have-worked")}</h1>
          <p className="font-editorial text-xl sm:text-2xl text-muted-foreground leading-[1.55]">{t("the-organizations-that-trusted-me-the")}</p>
        </header>

        <div className="divide-y divide-border border-y border-border">
          {companies.map((company) => (
            <Link key={company.slug} href="/en/projects" className="group grid gap-2 py-7 sm:grid-cols-[1fr_auto] sm:gap-8">
              <div className="space-y-2">
                <div className="font-mono text-xs text-muted-foreground">
                  {company.startDate} — {company.endDate}
                  {company.location ? ` · ${company.location}` : ""}
                </div>
                <h2 className="font-editorial text-2xl transition-colors duration-300 group-hover:text-muted-foreground">
                  {company.company}
                  {company.position && <span className="text-muted-foreground"> · {company.position}</span>}
                </h2>
                <p className="font-editorial max-w-xl text-lg leading-[1.65] text-muted-foreground">{company.shortDescription}</p>
              </div>
              <span aria-hidden="true" className="text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground">→</span>
            </Link>
          ))}
        </div>
      <ExtraBlocks page="/en/work" />
        </main>

      <footer className="border-t border-border py-12">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">{t("2025-gabriel-bigot-ai-automation-developer")}</div>
        </div>
      </footer>
    </div>
  )
}
