"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, ArrowRight, Calendar, Building2, Code2 } from "lucide-react"

interface Project {
  id: string
  title: string
  slug: string
  shortDescription: string
  category: string
  tags: string[]
  date: string
  company: string
  technologies: string[]
  featured: boolean
}

interface ProjectsPageClientProps {
  projects: Project[]
}

export default function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  const [filter, setFilter] = useState<string>("all")

  const categories = ["all", ...Array.from(new Set(projects.map((p) => p.category)))]

  const filteredProjects = filter === "all"
    ? projects
    : projects.filter((p) => p.category === filter)

  const featuredProjects = projects.filter((p) => p.featured)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au portfolio</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-12 sm:py-20">
        {/* Header */}
        <header className="space-y-8 sm:space-y-12 pb-12 sm:pb-20">
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground font-mono tracking-wider">
              PROJETS & AUTOMATISATIONS
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight max-w-3xl">
              Transformer les processus métier avec l'IA
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
              Une sélection de mes projets d'automatisation et d'intelligence artificielle appliqués
              à des problématiques concrètes en PME.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-light">{projects.length}</div>
              <div className="text-sm text-muted-foreground">Projets réalisés</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-light">{featuredProjects.length}</div>
              <div className="text-sm text-muted-foreground">Projets phares</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-light">80%</div>
              <div className="text-sm text-muted-foreground">Gain de temps moyen</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-light">1</div>
              <div className="text-sm text-muted-foreground">PME transformée</div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="pb-12 space-y-4">
          <div className="text-sm text-muted-foreground font-mono">FILTRER PAR CATÉGORIE</div>
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
                {category === "all" ? "Tous les projets" : category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Projects */}
        {filter === "all" && featuredProjects.length > 0 && (
          <section className="pb-16 sm:pb-24">
            <div className="space-y-8 sm:space-y-12">
              <div className="flex items-end justify-between">
                <h2 className="text-2xl sm:text-3xl font-light">Projets phares</h2>
                <div className="flex items-center gap-2 text-amber-500">
                  <span className="text-2xl">⭐</span>
                  <span className="text-sm font-mono">FEATURED</span>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
                {featuredProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.slug}`}
                    className="group relative p-8 sm:p-10 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 hover:shadow-2xl overflow-hidden"
                  >
                    <div className="absolute top-4 right-4">
                      <span className="text-2xl">⭐</span>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <span className="text-xs px-2 py-1 bg-foreground/5 border border-border rounded">
                          {project.category}
                        </span>

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
                            <span>{project.technologies.join(", ")}</span>
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
                        <span>Voir le projet</span>
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
              {filter === "all" ? "Tous les projets" : `${filter}`}
            </h2>
            <div className="text-sm text-muted-foreground font-mono">
              {filteredProjects.length} {filteredProjects.length > 1 ? "PROJETS" : "PROJET"}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-foreground/5 border border-border rounded">
                      {project.category}
                    </span>
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
                        <span className="line-clamp-2">{project.technologies.join(", ")}</span>
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
                    <span>Découvrir</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                Aucun projet trouvé dans cette catégorie.
              </p>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="pt-16 sm:pt-24 border-t border-border mt-16 sm:mt-24">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-light">Intéressé par une collaboration ?</h2>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Je suis toujours ouvert à discuter de nouveaux projets d'automatisation et d'IA,
              en particulier dans le contexte des PME et de la transformation digitale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#connect"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all duration-300"
              >
                <span>Me contacter</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/cv-gabriel-bigot.pdf"
                download
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
              >
                <span>Télécharger mon CV</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 Gabriel Bigot • Développeur d'Automatisations IA
          </div>
        </div>
      </footer>
    </div>
  )
}
