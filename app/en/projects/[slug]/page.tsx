import Link from "next/link"
import { getLocalizedProject, getLocalizedProjects, getEnglishProjectDetails } from "@/lib/portfolio-i18n"
import { ArrowLeft, Calendar, Building2, Code2, Zap } from "lucide-react"
import TechnologyGroups from "@/components/TechnologyGroups"

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

  const details = getEnglishProjectDetails(project)
  const otherProjects = getLocalizedProjects("en").filter((p) => p.id !== project.id).slice(0, 3)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4">
          <Link href="/en/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to projects</span>
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
                STACK
              </div>
              <div className="flex flex-wrap gap-2">
                {(project.tags || []).slice(0, 4).map((tag: string) => (
                  <span key={tag} className="text-sm text-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 py-12 sm:py-20">
          <div className="lg:col-span-2 space-y-12 sm:space-y-16">
            <section className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-light">Overview</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">{details.overview}</p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-light">Challenge</h2>
              <div className="p-6 sm:p-8 bg-foreground/[0.02] border border-border rounded-lg">
                <p className="text-lg text-muted-foreground leading-relaxed">{details.challenge}</p>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-light">Solution</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">{details.solution}</p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-light">Outcomes</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {details.outcomes.map((item: string) => (
                  <div key={item} className="p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-colors duration-300">
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

            {project.technologies && project.technologies.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-light">Technical stack</h2>
                <TechnologyGroups technologies={project.technologies} locale="en" />
              </section>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm text-muted-foreground font-mono">TAGS</h3>
                <div className="flex flex-wrap gap-2">
                  {(project.tags || []).map((tag: string) => (
                    <span key={tag} className="px-3 py-1.5 text-sm border border-border rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-border space-y-4">
                <h3 className="text-sm text-muted-foreground font-mono">NAVIGATION</h3>
                <div className="space-y-2">
                  <Link href="/en/projects" className="block p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">All projects</span>
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

        <section className="pt-12 sm:pt-20 border-t border-border">
          <div className="space-y-8 sm:space-y-12">
            <h2 className="text-2xl sm:text-3xl font-light">Other projects</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherProjects.map((otherProject) => (
                <Link key={otherProject.id} href={`/en/projects/${otherProject.slug}`} className="group p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-lg">
                  <div className="space-y-4">
                    <span className="text-xs px-2 py-1 bg-foreground/5 border border-border rounded">
                      {otherProject.category}
                    </span>
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
