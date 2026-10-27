import ExtraBlocks from "@/components/blocks/ExtraBlocks"
import { getT } from "@/lib/strings"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { getContent } from "@/lib/site-content"

type MilestoneType = "origin" | "rise" | "peak" | "rupture" | "rebuild"

type Milestone = { year: string; type: MilestoneType; title: string; text: string }

const typeConfig: Record<MilestoneType, { dot: string; border: string; tag: string; label: string }> = {
  origin:  { dot: "bg-muted-foreground/40",  border: "border-border",                  tag: "text-muted-foreground/60",  label: "origin" },
  rise:    { dot: "bg-amber-500/60",          border: "border-amber-500/20",            tag: "text-amber-500/70",         label: "rise" },
  peak:    { dot: "bg-amber-500",             border: "border-amber-500/40",            tag: "text-amber-500",            label: "peak" },
  rupture: { dot: "bg-red-400/70",            border: "border-red-400/25",              tag: "text-red-400/80",           label: "rupture" },
  rebuild: { dot: "bg-emerald-500/70",        border: "border-emerald-500/20",          tag: "text-emerald-500/80",       label: "rebuild" },
}

export default async function AboutPage() {
  const t = await getT("page.about")
  const milestones = (await getContent("aboutFr")) as Milestone[]
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

        {/* ── HEADER ── */}
        <header className="pb-20 sm:pb-28 border-b border-border">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-end">
            <div className="space-y-7">
              <div className="text-sm text-muted-foreground font-mono tracking-wider">{t("mon-histoire")}</div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">{t("tenir-revenir-construire")}</h1>
              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">{t("mon-parcours-tient-en-trois-fils")}</p>
            </div>

            <figure className="space-y-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-foreground/[0.02]">
                <Image
                  src="/about/story/nationale-1-trophy.jpg"
                  alt={t("l-equipe-du-tac-soulevant-le")}
                  fill
                  priority
                  sizes="(min-width: 1024px) 520px, calc(100vw - 48px)"
                  className="object-cover"
                />
              </div>
              <figcaption className="text-sm text-muted-foreground">{t("tac-hockey-2026-1ere-place-de")}</figcaption>
            </figure>
          </div>
        </header>

        {/* ── TIMELINE ── */}
        <section className="py-20 sm:py-28">
          <div className="space-y-14 sm:space-y-16">
            <div className="space-y-5">
              <h2 className="text-3xl sm:text-4xl font-light">{t("la-chronologie")}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{t("ni-lineaire-ni-simple-une-suite")}</p>

              {/* Légende */}
              <div className="flex flex-wrap gap-4 pt-1">
                {(Object.entries(typeConfig) as [MilestoneType, typeof typeConfig[MilestoneType]][]).map(([, cfg]) => (
                  <div key={cfg.label} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`text-xs font-mono ${cfg.tag}`}>{t(`type-${cfg.label}`).toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Ligne verticale */}
              <div className="absolute left-[7px] top-6 bottom-6 w-px bg-border hidden sm:block" />

              <div className="space-y-0">
                {milestones.map((item, i) => {
                  const cfg = typeConfig[item.type]
                  return (
                    <div key={i} className="relative pb-10 last:pb-0 group">
                      {/* Dot */}
                      <div
                        className={`absolute left-0 top-[22px] w-[15px] h-[15px] rounded-full border-2 border-background hidden sm:block z-10 transition-transform duration-300 group-hover:scale-125 ${cfg.dot}`}
                      />

                      <div className="sm:pl-10 grid lg:grid-cols-12 gap-3 sm:gap-6">
                        {/* Année */}
                        <div className="lg:col-span-2 pt-1">
                          <div className="text-base sm:text-lg font-light text-muted-foreground group-hover:text-foreground transition-colors duration-400">
                            {item.year}
                          </div>
                          <div className={`text-xs font-mono mt-0.5 ${cfg.tag}`}>
                            {t(`type-${typeConfig[item.type].label}`).toUpperCase()}
                          </div>
                        </div>

                        {/* Contenu */}
                        <div className="lg:col-span-10">
                          <div
                            className={`p-6 sm:p-7 border rounded-lg transition-all duration-300 hover:shadow-md ${cfg.border} hover:border-opacity-60`}
                          >
                            <h3 className="text-lg sm:text-xl font-medium mb-3 group-hover:text-foreground transition-colors duration-300">
                              {item.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed text-[0.95rem] sm:text-base">
                              {item.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 sm:py-20 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all duration-300"
            >
              <span>{t("voir-mes-projets")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/#connect"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
            >
              <span>{t("me-contacter")}</span>
            </Link>
          </div>
        </section>
      <ExtraBlocks page="/about" />
        </main>

      <footer className="border-t border-border py-12">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">{t("2025-gabriel-bigot-developpeur-d-automatisations")}</div>
        </div>
      </footer>
    </div>
  )
}
