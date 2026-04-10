import Link from "next/link"
import { ArrowLeft, ArrowRight, Calendar, FileText, Download } from "lucide-react"
// Note: newsletter cards link directly to static .html files (no embedded viewer)
import { getNewsletters, formatNewsletterDate } from "@/lib/newsletters-data"

export const metadata = {
  title: "Actualités IA — Gabriel Bigot",
  description: "Ma veille hebdomadaire sur l'intelligence artificielle, publiée chaque samedi.",
}

export default function NewslettersPage() {
  const sorted = getNewsletters()

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
            ACTUALITÉS IA / {new Date().getFullYear()}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
            Tribune IA hebdomadaire
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Chaque samedi, je génère automatiquement un journal de veille sur l'intelligence
            artificielle — modèles, outils, recherche, régulation. Format Wall Street Journal,
            produit avec n8n et GPT-4.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Publié chaque samedi
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              {sorted.length} édition{sorted.length > 1 ? "s" : ""}
            </span>
          </div>
        </header>

        {/* Newsletter list */}
        {sorted.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p>Aucune édition disponible pour le moment.</p>
          </div>
        ) : (
          <div className="py-12 sm:py-16 space-y-4">
            {/* Latest edition highlight */}
            {sorted[0] && (
              <div className="mb-10">
                <div className="text-xs font-mono text-muted-foreground tracking-wider mb-4">
                  DERNIÈRE ÉDITION
                </div>
                <a
                  href={`/newsletters/${sorted[0].slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-7 sm:p-8 border border-border rounded-xl hover:border-muted-foreground/50 hover:shadow-lg transition-all duration-300 bg-foreground/[0.02]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="px-2.5 py-0.5 text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                          Dernière édition
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatNewsletterDate(sorted[0].date)}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-light group-hover:text-muted-foreground transition-colors duration-300">
                        {sorted[0].title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {sorted[0].description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {sorted[0].hasPdf && (
                        <a
                          href={`/newsletters/${sorted[0].slug}.pdf`}
                          download
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 border border-border rounded-lg px-3 py-2"
                          title="Télécharger le PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                        <span>Lire</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            )}

            {/* Past editions */}
            {sorted.length > 1 && (
              <>
                <div className="text-xs font-mono text-muted-foreground tracking-wider mb-4">
                  ÉDITIONS PRÉCÉDENTES
                </div>
                {sorted.slice(1).map((newsletter) => (
                  <a
                    key={newsletter.slug}
                    href={`/newsletters/${newsletter.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 p-5 sm:p-6 border border-border rounded-xl hover:border-muted-foreground/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-light group-hover:text-muted-foreground transition-colors duration-300">
                          {newsletter.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatNewsletterDate(newsletter.date)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {newsletter.hasPdf && (
                        <a
                          href={`/newsletters/${newsletter.slug}.pdf`}
                          download
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                          title="Télécharger le PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground transform group-hover:translate-x-1 group-hover:text-foreground transition-all duration-300" />
                    </div>
                  </a>
                ))}
              </>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-12">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Gabriel Bigot • Développeur d'Automatisations IA
          </div>
        </div>
      </footer>
    </div>
  )
}
