"use client"

import { useT } from "@/components/strings-provider"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { formatTechnologyGroups } from "@/lib/technology-categories"

interface Project {
  id: string
  title: string
  slug: string
  shortDescription: string
  category: string
  categories: string[]
  tags: string[]
  date: string
  company: string
  technologies: string[]
  featured: boolean
  status?: "actif" | "archive"
  image?: string
}

interface ProjectsPageClientProps {
  projects: Project[]
  cvUrl?: string
  locale?: "fr" | "en"
  /** textes d'interface (content/site/ui-projects.json) */
  ui: Record<"fr" | "en", any>
  /** sections ajoutées (content/site/pages.json) */
  extra?: React.ReactNode
}

export default function ProjectsPageClient({ projects, cvUrl, locale = "fr", ui, extra }: ProjectsPageClientProps) {
  const tr = useT("component.ProjectsPageClient")
  const techT = useT("component.TechnologyGroups")
  const catLabel = (c: string) => { const k = `${locale === "en" ? "" : "fr-"}category-${c}`; return techT.has(k) ? techT(k) : c }
  const copy = ui[locale]
  const routePrefix = locale === "en" ? "/en" : ""
  const [filter, setFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<"all" | "perso" | "pro">("all")

  // Extract all unique categories from all projects
  const allCategories = projects.flatMap((p) => p.categories || [])
  const categories = ["all", ...Array.from(new Set(allCategories))]

  const filteredProjects = projects
    .filter((p) => filter === "all" || p.categories?.includes(filter))
    .filter((p) => {
      if (typeFilter === "perso") return !p.company || p.company === ""
      if (typeFilter === "pro") return p.company && p.company !== ""
      return true
    })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-4">
          <Link
            href={`${routePrefix}/portfolio`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{copy.back}</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 sm:px-8 py-12 sm:py-20">
        <header className="space-y-6 pb-10 sm:pb-14">
          <div className="text-sm text-muted-foreground font-mono tracking-wider">{copy.eyebrow}</div>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl leading-[1.02]">{copy.title}</h1>
          <p className="font-editorial text-xl sm:text-2xl text-muted-foreground leading-[1.55]">{copy.intro}</p>
        </header>

        <div className="space-y-3 pb-10 text-sm">
          {[
            { label: copy.type, value: typeFilter, set: (v: string) => setTypeFilter(v as "all" | "perso" | "pro"), items: (["all", "perso", "pro"] as const).map((t) => ({ key: t, text: t === "all" ? copy.all : t === "perso" ? copy.personal : copy.professional })) },
            { label: copy.filterByCategory, value: filter, set: setFilter, items: categories.map((c) => ({ key: c, text: c === "all" ? copy.allProjects : c })) },
          ].map((group, i) => (
            <div key={i} className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <span className="font-mono text-muted-foreground">{group.label}</span>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => group.set(item.key)}
                  className={`underline underline-offset-[6px] transition-colors duration-300 ${
                    group.value === item.key ? "decoration-foreground" : "decoration-transparent text-muted-foreground hover:decoration-border"
                  }`}
                >
                  {item.text}
                </button>
              ))}
            </div>
          ))}
        </div>

        <section>
          <div className="divide-y divide-border border-y border-border">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`${routePrefix}/projects/${project.slug}`}
                className="group grid gap-2 py-7 sm:grid-cols-[1fr_auto] sm:gap-8"
              >
                <div className="space-y-2">
                  <div className="font-mono text-xs text-muted-foreground">
                    {[project.date, project.company, project.status === "actif" ? copy.statusActive : project.status === "archive" ? copy.statusArchived : ""].filter(Boolean).join(" · ")}
                  </div>
                  <h3 className="font-editorial text-2xl transition-colors duration-300 group-hover:text-muted-foreground">{project.title}</h3>
                  <p className="font-editorial text-lg leading-[1.65] text-muted-foreground">{project.shortDescription}</p>
                  {project.technologies && project.technologies.length > 0 && (
                    <p className="text-sm text-muted-foreground/80">{formatTechnologyGroups(project.technologies, 4, catLabel)}</p>
                  )}
                </div>
                <span aria-hidden="true" className="text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground">→</span>
              </Link>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <p className="py-20 text-center font-editorial text-xl text-muted-foreground">{copy.empty}</p>
          )}
        </section>

        <section className="mt-16 sm:mt-24 space-y-5 border-t border-border pt-12">
          <h2 className="font-editorial text-3xl">{copy.ctaTitle}</h2>
          <p className="font-editorial text-xl leading-[1.6] text-muted-foreground">{copy.ctaText}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            <Link href={`${routePrefix}/portfolio#connect`} className="underline decoration-border underline-offset-[6px] transition-colors hover:decoration-foreground">
              {copy.contact}
            </Link>
            <Link
              href={cvUrl || "/cv-gabriel-bigot.pdf"}
              download={!cvUrl?.startsWith("http")}
              target={cvUrl?.startsWith("http") ? "_blank" : undefined}
              rel={cvUrl?.startsWith("http") ? tr("noopener-noreferrer") : undefined}
              className="underline decoration-border underline-offset-[6px] transition-colors hover:decoration-foreground"
            >
              {copy.downloadCv}
            </Link>
          </div>
        </section>
        {extra}
      </main>

      <footer className="border-t border-border py-12 mt-20">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">{tr("2025-gabriel-bigot")}{" "}{copy.footer}
          </div>
        </div>
      </footer>
    </div>
  )
}
