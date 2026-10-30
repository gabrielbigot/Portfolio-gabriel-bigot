import ExtraBlocks from "@/components/blocks/ExtraBlocks"
import { stripDeep } from "@/lib/studio/stega"
import { getT } from "@/lib/strings"
import { loadArticles, isEssay, type ArticleEntry } from "@/lib/articles/list"
import Link from "next/link"
import { isStudioMode } from "@/lib/site-content"
import ArticleDeleteButton from "@/components/studio/ArticleDeleteButton"
import ArticleFilter from "@/components/ArticleFilter"
import { ArrowLeft } from "lucide-react"

export async function generateMetadata() {
  const tr = await getT("page.articles")
  return stripDeep({
    title: tr("articles-gabriel-bigot"),
    description: tr("dossiers-longs-sources-et-interactifs-ia"),
  })
}

type Entry = ArticleEntry & { notes?: number }

const fmt = (d: string = "") => { try { return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) } catch { return d } }

export default async function ArticlesPage() {
  const tr = await getT("page.articles")
  const all: Entry[] = (await loadArticles()).sort((a, b) => String(b.published).localeCompare(String(a.published)))
  const essays = all.filter(isEssay)
  const pieces = all.filter((a) => !isEssay(a))
  const draft = (a: Entry) => a.status === "draft" && <span className="text-amber-600">· Brouillon, visible dans le studio seulement</span>

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
            <ArrowLeft className="w-4 h-4" />
            <span>{tr("retour")}</span>
          </Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 sm:px-8 py-12 sm:py-20">
        <header className="space-y-6 pb-10 sm:pb-14">
          <div className="text-sm text-muted-foreground font-mono tracking-wider">{tr("articles")}</div>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl leading-[1.02]">{tr("dossiers-sources")}</h1>
          <p className="font-editorial text-xl sm:text-2xl text-muted-foreground leading-[1.55]">{tr("des-dossiers-longs-ou-chaque-chiffre")}</p>
        </header>

        {all.length === 0 && <p className="border-y border-border py-10 text-muted-foreground">{tr("aucun-article-publie-pour-l-instant")}</p>}

        <ArticleFilter essais={essays.length} articles={pieces.length} labels={{ all: tr("tout"), essai: tr("essais"), article: tr("articles-section") }}>
          {essays.length > 0 && (
            <section data-kind="essai" id="essais" className="mb-16 scroll-mt-24">
              <div className="mb-2 flex items-baseline justify-between gap-4">
                <h2 className="font-editorial text-3xl sm:text-4xl">{tr("essais")}</h2>
                <span className="font-mono text-xs text-muted-foreground">{essays.length}</span>
              </div>
              <p className="font-editorial mb-6 max-w-2xl text-lg leading-[1.6] text-muted-foreground">{tr("essais-intro")}</p>
              <div className="divide-y divide-border border-y border-border">
                {essays.map((a) => (
                  <a key={a.slug} href={"/articles/" + a.slug} className="group relative block py-7">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-mono tracking-wide">
                      <span>{tr("essai")}</span>
                      <span>· {fmt(a.published)}</span>
                      {a.readingMinutes ? <span>· {a.readingMinutes}{" "}{tr("min")}</span> : null}
                      {a.notes ? <span>· {a.notes}{" "}{tr("note")}{a.notes > 1 ? "s" : ""}{" "}{tr("de-l-auteur")}</span> : null}
                      {draft(a)}
                    </div>
                    <h3 style={{ viewTransitionName: `essay-${a.slug}` }} className="font-editorial mt-3 text-2xl sm:text-3xl leading-tight transition-colors duration-300 group-hover:text-muted-foreground">{a.title}</h3>
                    {a.subtitle && <p className="font-editorial mt-1 text-lg italic text-muted-foreground">{a.subtitle}</p>}
                    {a.summary && a.summary !== a.subtitle && <p className="font-editorial mt-3 max-w-2xl text-lg leading-[1.65] text-muted-foreground">{a.summary}</p>}
                    {isStudioMode() && <ArticleDeleteButton slug={a.slug} title={a.title} />}
                  </a>
                ))}
              </div>
            </section>
          )}

          {pieces.length > 0 && (
            <section data-kind="article" id="articles" className="mb-16 scroll-mt-24">
              <div className="mb-2 flex items-baseline justify-between gap-4">
                <h2 className="font-editorial text-3xl sm:text-4xl">{tr("articles-section")}</h2>
                <span className="font-mono text-xs text-muted-foreground">{pieces.length}</span>
              </div>
              <p className="font-editorial mb-6 max-w-2xl text-lg leading-[1.6] text-muted-foreground">{tr("articles-intro")}</p>
              <div className="border-t-2 border-foreground">
                {pieces.map((a) => (
                  <a key={a.slug} href={"/articles/" + a.slug} className="group relative grid gap-x-8 gap-y-2 border-b border-border py-6 sm:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-mono tracking-wide">
                        <span>{tr("article")}</span>
                        <span>· {fmt(a.published)}</span>
                        {a.readingMinutes ? <span>· {a.readingMinutes}{" "}{tr("min")}</span> : null}
                        {a.notes ? <span>· {a.notes}{" "}{tr("note")}{a.notes > 1 ? "s" : ""}{" "}{tr("de-l-auteur")}</span> : null}
                        {draft(a)}
                      </div>
                      <h3 style={{ viewTransitionName: `essay-${a.slug}` }} className="font-editorial mt-2 text-2xl leading-tight transition-colors duration-300 group-hover:text-muted-foreground">{a.title}</h3>
                      {a.subtitle && <p className="font-editorial mt-1 text-base leading-snug text-muted-foreground">{a.subtitle}</p>}
                      {a.tags && a.tags.length > 0 && <p className="mt-3 text-xs text-muted-foreground">{a.tags.slice(0, 5).join(" · ")}</p>}
                    </div>
                    {a.sourceCount ? (
                      <div className="sm:text-right">
                        <div className="font-mono text-3xl leading-none">{a.sourceCount}</div>
                        <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{tr("sources")}</div>
                      </div>
                    ) : null}
                    {isStudioMode() && <ArticleDeleteButton slug={a.slug} title={a.title} />}
                  </a>
                ))}
              </div>
            </section>
          )}
        </ArticleFilter>
        <ExtraBlocks page={"/articles"} />
      </main>
    </div>
  )
}
