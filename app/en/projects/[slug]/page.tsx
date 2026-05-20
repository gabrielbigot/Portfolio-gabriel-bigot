import Link from "next/link"
import { getLocalizedProject, getLocalizedProjects } from "@/lib/portfolio-i18n"
import { ArrowLeft, Calendar, Building2, Zap, Code2 } from "lucide-react"
import ProjectMediaCarousel from "@/components/ProjectMediaCarousel"
import TechnologyGroups from "@/components/TechnologyGroups"
import { getTechnologyName } from "@/lib/technology-categories"

export function generateStaticParams() {
  return getLocalizedProjects("en").map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getLocalizedProject(slug, "en")

  if (!project) return { title: "Project not found" }

  return {
    title: `${project.title} — Gabriel Bigot`,
    description: project.shortDescription,
  }
}

export default async function EnglishProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getLocalizedProject(slug, "en") as any

  if (!project) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-light">Project not found</h1>
          <Link href="/en/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4">
          <Link href="/en/portfolio" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to portfolio</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 sm:px-8 py-12 sm:py-20">
        <header className="space-y-8 sm:space-y-12 pb-12 sm:pb-20 border-b border-border">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 text-xs bg-foreground/5 border border-border rounded-full">
                {project.category}
              </span>
              {project.featured && (
                <span className="px-3 py-1 text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                  Featured project
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
                ORGANIZATION
              </div>
              <div className="text-foreground">{project.company || "Personal"}</div>
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
                  <span key={getTechnologyName(tech)} className="text-sm text-foreground">
                    {getTechnologyName(tech)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 py-12 sm:py-20">
          <div className="lg:col-span-2">
            <div className="space-y-12 sm:space-y-16">
              {project.fullDescription && (
                <section className="space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-light">Overview</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {project.fullDescription}
                  </p>
                </section>
              )}

              {project.problem && (
                <section className="space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-light">Problem</h2>
                  <div className="p-6 sm:p-8 bg-foreground/[0.02] border border-border rounded-lg">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {project.problem}
                    </p>
                  </div>
                </section>
              )}

              {project.solution && (
                <section className="space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-light">Solution</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {project.solution}
                  </p>
                </section>
              )}

              {project.impact && project.impact.length > 0 && (
                <section className="space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-light">Impact & Results</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {project.impact.map((item: string, index: number) => (
                      <div key={index} className="p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-colors duration-300">
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

              {project.technologies && project.technologies.length > 0 && (
                <section className="space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-light">Technical Stack</h2>
                  <TechnologyGroups technologies={project.technologies} locale="en" />
                </section>
              )}

              {project.challenges && project.challenges.length > 0 && (
                <section className="space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-light">Technical Challenges</h2>
                  <ul className="space-y-3">
                    {project.challenges.map((challenge: string, index: number) => (
                      <li key={index} className="flex gap-3 text-muted-foreground leading-relaxed">
                        <span className="text-foreground/50 mt-1.5">•</span>
                        <span>{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {project.learnings && project.learnings.length > 0 && (
                <section className="space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-light">Key Learnings</h2>
                  <div className="space-y-4">
                    {project.learnings.map((learning: string, index: number) => (
                      <div key={index} className="p-6 bg-foreground/[0.02] border border-border rounded-lg">
                        <p className="text-muted-foreground leading-relaxed">{learning}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(project as any).media && (project as any).media.length > 0 && (
                <ProjectMediaCarousel media={(project as any).media} />
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {project.technologies && project.technologies.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm text-muted-foreground font-mono">TECHNOLOGIES</h3>
                  <TechnologyGroups technologies={project.technologies} locale="en" />
                </div>
              ) : project.tags && project.tags.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm text-muted-foreground font-mono">TAGS</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1.5 text-sm border border-border rounded-lg hover:border-muted-foreground/50 transition-colors duration-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="pt-8 border-t border-border space-y-4">
                <h3 className="text-sm text-muted-foreground font-mono">NAVIGATION</h3>
                <div className="space-y-2">
                  <Link href="/en/projects" className="block p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">All projects</span>
                      <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                    </div>
                  </Link>

                  <Link href="/en/work" className="block p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Experience</span>
                      <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                    </div>
                  </Link>

                  <Link href="/en/portfolio#connect" className="block p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Contact me</span>
                      <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <OtherProjectsSection currentProjectId={project.id} />
      </main>

      <footer className="border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 Gabriel Bigot • AI Automation Developer
          </div>
        </div>
      </footer>
    </div>
  )
}

function OtherProjectsSection({ currentProjectId }: { currentProjectId: string }) {
  const otherProjects = getLocalizedProjects("en")
    .filter((p) => p.id !== currentProjectId)
    .slice(0, 3)

  return (
    <section className="pt-12 sm:pt-20 border-t border-border">
      <div className="space-y-8 sm:space-y-12">
        <h2 className="text-2xl sm:text-3xl font-light">Other projects</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherProjects.map((otherProject) => (
            <Link key={otherProject.id} href={`/en/projects/${otherProject.slug}`} className="group p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-foreground/5 border border-border rounded">
                    {otherProject.category}
                  </span>
                  {otherProject.featured && <span className="text-amber-500">Featured</span>}
                </div>

                <h3 className="text-lg font-medium group-hover:text-muted-foreground transition-colors duration-300">
                  {otherProject.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {otherProject.shortDescription}
                </p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <span>View project</span>
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
