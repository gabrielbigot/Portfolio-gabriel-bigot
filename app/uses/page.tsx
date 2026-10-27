import ExtraBlocks from "@/components/blocks/ExtraBlocks"
import { stripDeep } from "@/lib/studio/stega"
import { getT } from "@/lib/strings"
import { getContent } from "@/lib/site-content"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"

export async function generateMetadata() {
  const t = await getT("page.uses")
  return stripDeep({
    title: t("uses-gabriel-bigot"),
    description: t("les-outils-technologies-et-equipements-que"),
  })
}

type UsesItem = {
  name: string
  description: string
  url?: string
  tag?: string
}

type UsesCategory = {
  title: string
  subtitle: string
  items: UsesItem[]
}

export default async function UsesPage() {
  const t = await getT("page.uses")
  const usesData = (await getContent("usesFr")) as UsesCategory[]
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("retour-au-portfolio")}</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 sm:px-8 py-12 sm:py-20">
        {/* Header */}
        <header className="space-y-6 pb-16 border-b border-border">
          <div className="text-sm text-muted-foreground font-mono tracking-wider">{t("uses")}{" "}{new Date().getFullYear()}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">{t("ce-que-j-utilise")}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">{t("les-outils-technologies-et-equipements-qui")}</p>
        </header>

        {/* Categories */}
        <div className="py-12 sm:py-16 space-y-20">
          {usesData.map((category) => (
            <section key={category.title} className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-light">{category.title}</h2>
                <p className="text-muted-foreground">{category.subtitle}</p>
              </div>

              <div className="space-y-3">
                {category.items.map((item) => (
                  <div
                    key={item.name}
                    className="group p-5 sm:p-6 border border-border rounded-xl hover:border-muted-foreground/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-medium">{item.name}</h3>
                          {item.tag && (
                            <span className="px-2 py-0.5 text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                          aria-label={`Visiter ${item.name}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">{t("inspire-par")}{" "}
            <a
              href="https://uses.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground transition-colors duration-200"
            >{t("uses-tech")}</a>{t("un-repertoire-de-pages-uses-de")}</p>
        </div>
      <ExtraBlocks page="/uses" />
        </main>

      <footer className="border-t border-border py-12 mt-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()}{" "}{t("gabriel-bigot-developpeur-d-automatisations-ia")}</div>
        </div>
      </footer>
    </div>
  )
}
