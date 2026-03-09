import Link from "next/link"
import { getCompanies } from "@/lib/portfolio-data"
import { ArrowLeft, ArrowRight, Building2, MapPin, Calendar, Briefcase } from "lucide-react"

export const revalidate = 3600

export const metadata = {
  title: "Expériences professionnelles — Gabriel Bigot",
  description: "Découvrez les entreprises où j'ai travaillé, les projets réalisés et ce que j'y ai appris.",
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

export default async function WorkPage() {
  const companies = await getCompanies()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au portfolio</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 sm:px-8 py-12 sm:py-20">
        {/* Header */}
        <header className="space-y-6 pb-16 border-b border-border">
          <div className="text-sm text-muted-foreground font-mono tracking-wider">
            EXPÉRIENCES / {new Date().getFullYear()}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
            Où j'ai travaillé
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Les entreprises qui m'ont accueilli, les projets que j'y ai menés,
            et ce que chaque expérience m'a apporté.
          </p>
        </header>

        {/* Companies list */}
        {companies.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">
              Aucune expérience configurée pour le moment.
            </p>
            <p className="text-sm text-muted-foreground/60">
              Ajoutez des entrées dans votre base Notion Work Experience avec un Slug pour les voir apparaître ici.
            </p>
          </div>
        ) : (
          <div className="py-12 sm:py-16 space-y-6">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/work/${company.slug}`}
                className="group block p-6 sm:p-8 border border-border rounded-xl hover:border-muted-foreground/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex gap-5 sm:gap-6">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    {company.logo ? (
                      <div
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-border overflow-hidden flex items-center justify-center"
                          style={company.logoBackground ? { backgroundColor: company.logoBackground } : { backgroundColor: "white" }}
                        >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={company.logo}
                          alt={`Logo ${company.company}`}
                          className="w-full h-full object-contain p-1.5"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-border bg-foreground/[0.03] flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-light text-muted-foreground select-none">
                          {company.company.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 flex-1 min-w-0">
                    <div className="space-y-2.5 flex-1 min-w-0">
                      {/* Company + badges */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-xl sm:text-2xl font-light group-hover:text-muted-foreground transition-colors duration-300">
                          {company.company}
                        </h2>
                        {company.type && (
                          <span className="px-2.5 py-0.5 text-xs bg-foreground/5 border border-border rounded-full">
                            {company.type}
                          </span>
                        )}
                        {company.current && (
                          <span className="px-2.5 py-0.5 text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                            Poste actuel
                          </span>
                        )}
                      </div>

                      {/* Position */}
                      {company.position && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{company.position}</span>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {company.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{company.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {formatDate(company.startDate)}
                            {" — "}
                            {company.current ? "Aujourd'hui" : formatDate(company.endDate)}
                          </span>
                        </div>
                      </div>

                      {/* Short description */}
                      {company.shortDescription && (
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                          {company.shortDescription}
                        </p>
                      )}

                      {/* Technologies */}
                      {company.technologies && company.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {company.technologies.slice(0, 6).map((tech: string) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 text-xs border border-border rounded-md"
                            >
                              {tech}
                            </span>
                          ))}
                          {company.technologies.length > 6 && (
                            <span className="px-2 py-0.5 text-xs text-muted-foreground">
                              +{company.technologies.length - 6}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 self-end sm:self-center flex-shrink-0">
                      <span>Voir le détail</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
