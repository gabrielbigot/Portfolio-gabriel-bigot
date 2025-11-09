import Link from "next/link"
import { getProjectBySlug, getProjectsFromNotion } from "@/lib/notion-simple"
import { projects as localProjects } from "@/lib/data"
import { ArrowLeft, ExternalLink, Github, Calendar, Building2, Zap, Code2 } from "lucide-react"
import { notFound } from "next/navigation"
import NotionBlockRenderer from "@/components/NotionBlockRenderer"

// Revalidate every hour
export const revalidate = 3600

// Generate static params for all projects
export async function generateStaticParams() {
  try {
    const notionProjects = await getProjectsFromNotion()
    if (notionProjects && notionProjects.length > 0) {
      return notionProjects.map((project) => ({
        slug: project.slug,
      }))
    }
  } catch (error) {
    console.error("Error generating static params:", error)
  }

  // Fallback to local projects
  return localProjects.map((project) => ({
    slug: project.slug,
  }))
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Try to fetch from Notion first
  let project = null

  try {
    console.log(`🔍 Looking for project with slug: "${slug}"`)
    const allProjects = await getProjectsFromNotion()
    console.log(`📦 Available projects from Notion:`, allProjects.map(p => ({ slug: p.slug, title: p.title })))

    project = allProjects.find((p) => p.slug === slug)

    if (project) {
      console.log(`✅ Loaded project "${project.title}" from Notion`)
    } else {
      console.warn(`❌ No project found with slug "${slug}" in Notion`)
    }
  } catch (error) {
    console.warn("Failed to fetch project from Notion:", error)
  }

  // Fallback to local data if Notion fails
  if (!project) {
    project = localProjects.find((p) => p.slug === slug)
    if (project) {
      console.log(`⚠️ Using local data for project "${project.title}"`)
    } else {
      console.error(`❌ No project found with slug "${slug}" in local data either`)
    }
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-light">Projet introuvable</h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au portfolio</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 sm:px-8 py-12 sm:py-20">
        {/* Hero Section */}
        <header className="space-y-8 sm:space-y-12 pb-12 sm:pb-20 border-b border-border">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 text-xs bg-foreground/5 border border-border rounded-full">
                {project.category}
              </span>
              {project.featured && (
                <span className="px-3 py-1 text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                  ⭐ Projet phare
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
              {project.title}
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
              {project.shortDescription}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                <Calendar className="w-4 h-4" />
                DATE
              </div>
              <div className="text-foreground">{project.date}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                <Building2 className="w-4 h-4" />
                ENTREPRISE
              </div>
              <div className="text-foreground">{project.company}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                <Code2 className="w-4 h-4" />
                TECHNOLOGIES
              </div>
              <div className="flex flex-wrap gap-2">
                {(project.technologies && project.technologies.length > 0
                  ? project.technologies.slice(0, 3)
                  : project.tags.slice(0, 3)
                ).map((tech: any) => (
                  <span key={typeof tech === 'string' ? tech : tech.name} className="text-sm text-foreground">
                    {typeof tech === 'string' ? tech : tech.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 py-12 sm:py-20">
          {/* Left Column - Main Content from Notion */}
          <div className="lg:col-span-2">
            {project.content && project.content.length > 0 ? (
              <NotionBlockRenderer content={project.content} />
            ) : (
              // Fallback to legacy structure if no content blocks
              <div className="space-y-12 sm:space-y-16">
                {/* Overview */}
                {project.fullDescription && (
                  <section className="space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-light">Vue d'ensemble</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {project.fullDescription}
                    </p>
                  </section>
                )}

                {/* Problem */}
                {project.problem && (
                  <section className="space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-light">Problématique</h2>
                    <div className="p-6 sm:p-8 bg-foreground/[0.02] border border-border rounded-lg">
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {project.problem}
                      </p>
                    </div>
                  </section>
                )}

                {/* Solution */}
                {project.solution && (
                  <section className="space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-light">Solution apportée</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {project.solution}
                    </p>
                  </section>
                )}

                {/* Impact */}
                {project.impact && project.impact.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-light">Impact & Résultats</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {project.impact.map((item: string, index: number) => (
                        <div
                          key={index}
                          className="p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-colors duration-300"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center flex-shrink-0 mt-1">
                              <Zap className="w-4 h-4 text-foreground/70" />
                            </div>
                            <p className="text-muted-foreground leading-relaxed">{item}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Technologies */}
                {project.technologies && project.technologies.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-light">Stack Technique</h2>
                    <div className="flex flex-wrap gap-3">
                      {project.technologies.map((tech: any, index: number) => (
                        <div
                          key={index}
                          className="px-4 py-3 border border-border rounded-lg hover:border-muted-foreground/50 transition-colors duration-300"
                        >
                          <div className="flex items-center gap-2">
                            <Code2 className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{typeof tech === 'string' ? tech : tech.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Challenges */}
                {project.challenges && project.challenges.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-light">Défis techniques</h2>
                    <ul className="space-y-3">
                      {project.challenges.map((challenge: string, index: number) => (
                        <li
                          key={index}
                          className="flex gap-3 text-muted-foreground leading-relaxed"
                        >
                          <span className="text-foreground/50 mt-1.5">•</span>
                          <span>{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Learnings */}
                {project.learnings && project.learnings.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-light">Apprentissages clés</h2>
                    <div className="space-y-4">
                      {project.learnings.map((learning: string, index: number) => (
                        <div
                          key={index}
                          className="p-6 bg-foreground/[0.02] border border-border rounded-lg"
                        >
                          <p className="text-muted-foreground leading-relaxed">{learning}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm text-muted-foreground font-mono">TECHNOLOGIES</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech: any) => (
                      <span
                        key={typeof tech === 'string' ? tech : tech.name}
                        className="px-3 py-1.5 text-sm border border-border rounded-lg hover:border-muted-foreground/50 transition-colors duration-300"
                      >
                        {typeof tech === 'string' ? tech : tech.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : project.tags && project.tags.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm text-muted-foreground font-mono">TAGS</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 text-sm border border-border rounded-lg hover:border-muted-foreground/50 transition-colors duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Navigation */}
              <div className="pt-8 border-t border-border space-y-4">
                <h3 className="text-sm text-muted-foreground font-mono">NAVIGATION</h3>
                <div className="space-y-2">
                  <Link
                    href="/projects"
                    className="block p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Tous les projets</span>
                      <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                    </div>
                  </Link>

                  <Link
                    href="/#work"
                    className="block p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Expériences</span>
                      <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                    </div>
                  </Link>

                  <Link
                    href="/#connect"
                    className="block p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Me contacter</span>
                      <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Projects */}
        <OtherProjectsSection currentProjectId={project.id} />
      </main>

      <footer className="border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 Gabriel Bigot • Développeur d'Automatisations IA
          </div>
        </div>
      </footer>
    </div>
  )
}

async function OtherProjectsSection({ currentProjectId }: { currentProjectId: string }) {
  // Try to fetch from Notion first
  let allProjects = localProjects

  try {
    const notionProjects = await getProjectsFromNotion()
    if (notionProjects && notionProjects.length > 0) {
      allProjects = notionProjects as any
    }
  } catch (error) {
    console.warn("Failed to fetch projects for 'Other Projects' section:", error)
  }

  const otherProjects = allProjects
    .filter((p) => p.id !== currentProjectId)
    .slice(0, 3)

  return (
    <section className="pt-12 sm:pt-20 border-t border-border">
      <div className="space-y-8 sm:space-y-12">
        <h2 className="text-2xl sm:text-3xl font-light">Autres projets</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherProjects.map((otherProject) => (
            <Link
              key={otherProject.id}
              href={`/projects/${otherProject.slug}`}
              className="group p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-foreground/5 border border-border rounded">
                    {otherProject.category}
                  </span>
                  {otherProject.featured && <span className="text-amber-500">⭐</span>}
                </div>

                <h3 className="text-lg font-medium group-hover:text-muted-foreground transition-colors duration-300">
                  {otherProject.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {otherProject.shortDescription}
                </p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <span>Voir le projet</span>
                  <ArrowLeft className="w-4 h-4 rotate-180 transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
