import ExtraBlocks from "@/components/blocks/ExtraBlocks"
import { stripDeep } from "@/lib/studio/stega"
import { getT } from "@/lib/strings"
import { loadArticles, type ArticleEntry } from "@/lib/articles/list"
import Link from "next/link"
import { isStudioMode } from "@/lib/site-content"
import ArticleDeleteButton from "@/components/studio/ArticleDeleteButton"
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
  const articles: Entry[] = (await loadArticles()).sort((a, b) => String(b.published).localeCompare(String(a.published)))
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
        <div className="divide-y divide-border border-y border-border">
          {articles.length === 0 && <p className="py-10 text-muted-foreground">{tr("aucun-article-publie-pour-l-instant")}</p>}
          {articles.map(a => (
            <a key={a.slug} href={"/articles/" + a.slug} className="group relative block py-7">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-mono tracking-wide">
                <span>{fmt(a.published)}</span>
                {a.readingMinutes ? <span>· {a.readingMinutes}{" "}{tr("min")}</span> : null}
                {a.sourceCount ? <span>· {a.sourceCount}{" "}{tr("sources")}</span> : null}
                {a.notes ? <span>· {a.notes}{" "}{tr("note")}{a.notes > 1 ? "s" : ""}{" "}{tr("de-l-auteur")}</span> : null}
                {a.series && <span>· {a.series}</span>}
                {a.status === "draft" && <span className="text-amber-600">· Brouillon, visible dans le studio seulement</span>}
              </div>
              <h2 style={{ viewTransitionName: `essay-${a.slug}` }} className="font-editorial mt-3 text-2xl sm:text-3xl leading-tight transition-colors duration-300 group-hover:text-muted-foreground">{a.title}</h2>
              {a.subtitle && <p className="font-editorial mt-1 text-lg italic text-muted-foreground">{a.subtitle}</p>}
              {a.summary && a.summary !== a.subtitle && <p className="font-editorial mt-3 max-w-2xl text-lg leading-[1.65] text-muted-foreground">{a.summary}</p>}
              {isStudioMode() && <ArticleDeleteButton slug={a.slug} title={a.title} />}
            </a>
          ))}
        </div>
      <ExtraBlocks page={"/articles"} />
      </main>
    </div>
  )
}
