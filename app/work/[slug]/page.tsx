import Link from "next/link"
import { getCompany, getCompanyProjects, getCompanies } from "@/lib/portfolio-data"
import { ArrowLeft, ArrowRight, Building2, MapPin, Calendar, Briefcase, ExternalLink, Code2 } from "lucide-react"
import { notFound } from "next/navigation"
import NotionBlockRenderer from "@/components/NotionBlockRenderer"

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const companies = await getCompanies()
    return companies.map((c) => ({ slug: c.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const company = await getCompany(slug)
  if (!company) return { title: "Entreprise introuvable" }
  return {
    title: `${company.company} — Gabriel Bigot`,
    description: company.shortDescription || `Expérience chez ${company.company}`,
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
  } catch {
    return dateString
  }
}

function getDuration(startDate: string, endDate: string, current: boolean): string {
  if (!startDate) return ""
  try {
    const start = new Date(startDate)
    const end = current ? new Date() : new Date(endDate)
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth())
    if (months < 1) return "Moins d'un mois"
    if (months < 12) return `${months} mois`
    const years = Math.floor(months / 12)
    const rem = months % 12
    if (rem === 0) return `${years} an${years > 1 ? "s" : ""}`
    return `${years} an${years > 1 ? "s" : ""} ${rem} mois`
  } catch {
    return ""
  }
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [company, projects] = await Promise.all([
    getCompany(slug),
    getCompanyProjects(slug),
  ])

  // Try company name fallback for project matching
  const linkedProjects =
    projects.length === 0 && company?.company
      ? await getCompanyProjects(slug, company.company)
      : projects

  if (!company) {
    return notFound()
  }

  const duration = getDuration(company.startDate, company.endDate, company.current)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-4">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Toutes mes expériences</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 sm:px-8 py-12 sm:py-20">
        {/* Hero */}
        <header className="space-y-8 pb-12 sm:pb-16 border-b border-border">
          <div className="space-y-5">
            {/* Logo + badges row */}
            <div className="flex items-start gap-5">
              {/* Logo */}
              {company.logo ? (
                <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-border overflow-hidden flex items-center justify-center flex-shrink-0"
                    style={company.logoBackground ? { backgroundColor: company.logoBackground } : { backgroundColor: "white" }}
                  >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={company.logo}
                    alt={`Logo ${company.company}`}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-border bg-foreground/[0.03] flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl sm:text-3xl font-light text-muted-foreground select-none">
                    {company.company.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {company.type && (
                  <span className="px-3 py-1 text-xs bg-foreground/5 border border-border rounded-full">
                    {company.type}
                  </span>
                )}
                {company.current && (
                  <span className="px-3 py-1 text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                    Poste actuel
                  </span>
                )}
              </div>
            </div>

            {/* Company name */}
            <div className="flex items-start gap-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
                {company.company}
              </h1>
              {company.companyUrl && (
                <a
                  href={company.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Site de ${company.company}`}
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Position */}
            {company.position && (
              <p className="text-xl sm:text-2xl text-muted-foreground">
                {company.position}
              </p>
            )}
          </div>

          {/* Meta grid */}
          <div className="grid sm:grid-cols-3 gap-6">
            {company.location && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                  <MapPin className="w-4 h-4" />
                  LIEU
                </div>
                <div className="text-foreground">{company.location}</div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                <Calendar className="w-4 h-4" />
                PÉRIODE
              </div>
              <div className="text-foreground">
                {formatDate(company.startDate)}
                {" — "}
                {company.current ? "Aujourd'hui" : formatDate(company.endDate)}
              </div>
              {duration && (
                <div className="text-sm text-muted-foreground">{duration}</div>
              )}
            </div>

            {company.technologies && company.technologies.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                  <Code2 className="w-4 h-4" />
                  STACK
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {company.technologies.slice(0, 4).map((tech: string) => (
                    <span key={tech} className="text-sm text-foreground">
                      {tech}
                    </span>
                  ))}
                  {company.technologies.length > 4 && (
                    <span className="text-sm text-muted-foreground">
                      +{company.technologies.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main layout: content + sidebar */}
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 py-12 sm:py-16">
          {/* Left: rich content from Notion */}
          <div className="lg:col-span-2">
            {company.content && company.content.length > 0 ? (
              <NotionBlockRenderer content={company.content} />
            ) : company.description ? (
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {company.description}
                </p>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <Building2 className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground">
                  Le contenu de cette expérience n'a pas encore été rédigé.
                </p>
                <p className="text-sm text-muted-foreground/60">
                  Écrivez librement dans le corps de la page Notion correspondante.
                </p>
              </div>
            )}

            {/* Achievements if any */}
            {company.achievements && company.achievements.length > 0 && (
              <section className="mt-12 space-y-4">
                <h2 className="text-2xl font-light">Réalisations clés</h2>
                <ul className="space-y-3">
                  {company.achievements.map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-muted-foreground leading-relaxed">
                      <span className="text-foreground/50 mt-1.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Right: sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Full tech stack */}
              {company.technologies && company.technologies.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm text-muted-foreground font-mono">TECHNOLOGIES</h3>
                  <div className="flex flex-wrap gap-2">
                    {company.technologies.map((tech: string) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 text-sm border border-border rounded-lg hover:border-muted-foreground/50 transition-colors duration-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked projects */}
              {linkedProjects.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm text-muted-foreground font-mono">PROJETS LIÉS</h3>
                  <div className="space-y-2">
                    {linkedProjects.map((project: any) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.slug}`}
                        className="group flex items-center justify-between p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {project.title}
                          </div>
                          {project.shortDescription && (
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {project.shortDescription}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-3 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="pt-4 border-t border-border space-y-4">
                <h3 className="text-sm text-muted-foreground font-mono">NAVIGATION</h3>
                <div className="space-y-2">
                  <Link
                    href="/work"
                    className="block p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Toutes mes expériences</span>
                      <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                    </div>
                  </Link>
                  <Link
                    href="/projects"
                    className="block p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Tous mes projets</span>
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

        {/* Other companies */}
        <OtherCompaniesSection currentSlug={slug} />
      </main>

      <footer className="border-t border-border py-12">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 Gabriel Bigot • Développeur d'Automatisations IA
          </div>
        </div>
      </footer>
    </div>
  )
}

async function OtherCompaniesSection({ currentSlug }: { currentSlug: string }) {
  const companies = await getCompanies()
  const others = companies.filter((c) => c.slug !== currentSlug).slice(0, 3)

  if (others.length === 0) return null

  return (
    <section className="pt-12 sm:pt-20 border-t border-border">
      <div className="space-y-8">
        <h2 className="text-2xl sm:text-3xl font-light">Autres expériences</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {others.map((company) => (
            <Link
              key={company.id}
              href={`/work/${company.slug}`}
              className="group p-5 border border-border rounded-xl hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-lg space-y-3"
            >
              {/* Logo + name row */}
              <div className="flex items-center gap-3">
                {company.logo ? (
                  <div
                      className="w-9 h-9 rounded-lg border border-border overflow-hidden flex items-center justify-center flex-shrink-0"
                      style={company.logoBackground ? { backgroundColor: company.logoBackground } : { backgroundColor: "white" }}
                    >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={company.logo}
                      alt={`Logo ${company.company}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-lg border border-border bg-foreground/[0.03] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-light text-muted-foreground select-none">
                      {company.company.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h3 className="text-base font-medium group-hover:text-muted-foreground transition-colors duration-300 truncate">
                    {company.company}
                  </h3>
                  {company.current && (
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0 animate-pulse" />
                  )}
                </div>
              </div>

              {company.position && (
                <p className="text-sm text-muted-foreground">{company.position}</p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {formatDate(company.startDate)}
                  {" — "}
                  {company.current ? "Aujourd'hui" : formatDate(company.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                <span>Voir le détail</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
