"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, ArrowRight, Calendar, Building2, Code2 } from "lucide-react"
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
  image?: string
}

interface ProjectsPageClientProps {
  projects: Project[]
  cvUrl?: string
  locale?: "fr" | "en"
}

const projectsCopy = {
  fr: {
    back: "Retour au portfolio",
    eyebrow: "PROJETS & AUTOMATISATIONS",
    title: "Transformer les processus métier avec l'IA",
    intro: "Une sélection de mes projets d'automatisation et d'intelligence artificielle appliqués à des problématiques concrètes en PME.",
    projectsDone: "Projets réalisés",
    featured: "Projets phares",
    timeSaved: "Gain de temps moyen",
    smeTransformed: "PME transformée",
    type: "TYPE",
    all: "Tous",
    personal: "Personnel",
    professional: "Professionnel",
    filterByCategory: "FILTRER PAR CATÉGORIE",
    allProjects: "Tous les projets",
    featuredLabel: "FEATURED",
    viewProject: "Voir le projet",
    allProjectsTitle: "Tous les projets",
    personalProjects: "Projets personnels",
    professionalProjects: "Projets professionnels",
    projectSingular: "PROJET",
    projectPlural: "PROJETS",
    discover: "Découvrir",
    empty: "Aucun projet trouvé dans cette catégorie.",
    ctaTitle: "Intéressé par une collaboration ?",
    ctaText: "Je suis toujours ouvert à discuter de nouveaux projets d'automatisation et d'IA, en particulier dans le contexte des PME et de la transformation digitale.",
    contact: "Me contacter",
    downloadCv: "Télécharger mon CV",
    footer: "Développeur d'Automatisations IA",
  },
  en: {
    back: "Back to portfolio",
    eyebrow: "PROJECTS & AUTOMATIONS",
    title: "Transforming business processes with AI",
    intro: "A selection of my automation and artificial intelligence projects applied to concrete SME business problems.",
    projectsDone: "Projects delivered",
    featured: "Featured projects",
    timeSaved: "Average time saved",
    smeTransformed: "SME transformed",
    type: "TYPE",
    all: "All",
    personal: "Personal",
    professional: "Professional",
    filterByCategory: "FILTER BY CATEGORY",
    allProjects: "All projects",
    featuredLabel: "FEATURED",
    viewProject: "View project",
    allProjectsTitle: "All projects",
    personalProjects: "Personal projects",
    professionalProjects: "Professional projects",
    projectSingular: "PROJECT",
    projectPlural: "PROJECTS",
    discover: "Discover",
    empty: "No project found in this category.",
    ctaTitle: "Interested in working together?",
    ctaText: "I am always open to discussing new automation and AI projects, especially in SME and digital transformation contexts.",
    contact: "Contact me",
    downloadCv: "Download my CV",
    footer: "AI Automation Developer",
  },
}

export default function ProjectsPageClient({ projects, cvUrl, locale = "fr" }: ProjectsPageClientProps) {
  const copy = projectsCopy[locale]
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

  const featuredProjects = projects.filter((p) => p.featured)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
          <Link
            href={`${routePrefix}/portfolio`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{copy.back}</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-12 sm:py-20">
        {/* Header */}
        <header className="space-y-8 sm:space-y-12 pb-12 sm:pb-20">
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground font-mono tracking-wider">
              {copy.eyebrow}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight max-w-3xl">
              {copy.title}
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
              {copy.intro}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-light">{projects.length}</div>
              <div className="text-sm text-muted-foreground">{copy.projectsDone}</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-light">{featuredProjects.length}</div>
              <div className="text-sm text-muted-foreground">{copy.featured}</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-light">80%</div>
              <div className="text-sm text-muted-foreground">{copy.timeSaved}</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-light">1</div>
              <div className="text-sm text-muted-foreground">{copy.smeTransformed}</div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="pb-12 space-y-6">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground font-mono">{copy.type}</div>
            <div className="flex flex-wrap gap-3">
              {(["all", "perso", "pro"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-4 py-2 text-sm border rounded-lg transition-all duration-300 ${
                    typeFilter === t
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  {t === "all" ? copy.all : t === "perso" ? copy.personal : copy.professional}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground font-mono">{copy.filterByCategory}</div>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-4 py-2 text-sm border rounded-lg transition-all duration-300 ${
                    filter === category
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  {category === "all" ? copy.allProjects : category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Projects */}
        {filter === "all" && typeFilter === "all" && featuredProjects.length > 0 && (
          <section className="pb-16 sm:pb-24">
            <div className="space-y-8 sm:space-y-12">
              <div className="flex items-end justify-between">
                <h2 className="text-2xl sm:text-3xl font-light">{copy.featured}</h2>
                <div className="flex items-center gap-2 text-amber-500">
                  <span className="text-2xl">⭐</span>
                  <span className="text-sm font-mono">{copy.featuredLabel}</span>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
                {featuredProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.slug}`}
                    className="group relative border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 hover:shadow-2xl overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative w-full aspect-video bg-foreground/[0.03]">
                      {project.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-foreground/[0.03] to-foreground/[0.07]">
                          <span className="text-xs font-mono text-muted-foreground/30 tracking-widest uppercase">{project.category}</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="text-xl">⭐</span>
                      </div>
                    </div>

                    <div className="p-8 sm:p-10 space-y-6">
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {project.categories && project.categories.length > 0 ? (
                            project.categories.map((cat) => (
                              <span
                                key={cat}
                                className="text-xs px-2 py-1 bg-foreground/5 border border-border rounded"
                              >
                                {cat}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs px-2 py-1 bg-foreground/5 border border-border rounded">
                              {project.category}
                            </span>
                          )}
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-light group-hover:text-muted-foreground transition-colors duration-300 pr-8">
                          {project.title}
                        </h3>

                        <p className="text-muted-foreground leading-relaxed">
                          {project.shortDescription}
                        </p>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{project.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="w-4 h-4" />
                          <span>{project.company}</span>
                        </div>
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Code2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{formatTechnologyGroups(project.technologies, 10)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {project.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 border border-border rounded text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-foreground group-hover:text-muted-foreground transition-colors duration-300 pt-4">
                        <span>{copy.viewProject}</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Projects Grid */}
        <section className="space-y-8 sm:space-y-12">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl sm:text-3xl font-light">
              {typeFilter === "perso" ? copy.personalProjects : typeFilter === "pro" ? copy.professionalProjects : filter === "all" ? copy.allProjectsTitle : filter}
            </h2>
            <div className="text-sm text-muted-foreground font-mono">
              {filteredProjects.length} {filteredProjects.length > 1 ? copy.projectPlural : copy.projectSingular}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-lg overflow-hidden"
              >
                {/* Image */}
                <div className="relative w-full aspect-video bg-foreground/[0.03]">
                  {project.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-foreground/[0.03] to-foreground/[0.07]">
                      <span className="text-xs font-mono text-muted-foreground/30 tracking-widest uppercase">{project.category}</span>
                    </div>
                  )}
                </div>

                <div className="p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {project.categories && project.categories.length > 0 ? (
                        project.categories.slice(0, 2).map((cat) => (
                          <span
                            key={cat}
                            className="text-xs px-2 py-1 bg-foreground/5 border border-border rounded"
                          >
                            {cat}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs px-2 py-1 bg-foreground/5 border border-border rounded">
                          {project.category}
                        </span>
                      )}
                    </div>
                    {project.featured && (
                      <span className="text-lg">⭐</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-medium group-hover:text-muted-foreground transition-colors duration-300">
                      {project.title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {project.shortDescription}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>{project.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3 h-3" />
                      <span>{project.company}</span>
                    </div>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Code2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-3">{formatTechnologyGroups(project.technologies, 6)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 border border-border rounded text-muted-foreground/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 pt-2">
                    <span>{copy.discover}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                {copy.empty}
              </p>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="pt-16 sm:pt-24 border-t border-border mt-16 sm:mt-24">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-light">{copy.ctaTitle}</h2>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {copy.ctaText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`${routePrefix}/portfolio#connect`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all duration-300"
              >
                <span>{copy.contact}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={cvUrl || "/cv-gabriel-bigot.pdf"}
                download={!cvUrl?.startsWith("http")}
                target={cvUrl?.startsWith("http") ? "_blank" : undefined}
                rel={cvUrl?.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
              >
                <span>{copy.downloadCv}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 Gabriel Bigot • {copy.footer}
          </div>
        </div>
      </footer>
    </div>
  )
}
