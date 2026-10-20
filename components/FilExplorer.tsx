"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { FIL_KIND, type FilItem, type FilKind, type FilLocale } from "@/lib/fil"

type Group = "all" | "career" | "project" | "essay"
const GROUP_OF: Record<FilKind, Exclude<Group, "all">> = { origin: "career", experience: "career", project: "project", essay: "essay" }

const COPY = {
  fr: {
    label: "Le fil, chronologiquement",
    all: "Tout",
    career: "Parcours",
    project: "Projets",
    essay: "Essais",
    open: "Ouvrir",
    prev: "Précédent",
    next: "Suivant",
    hint: "Cliquez une agrafe, ou utilisez les flèches ← →.",
    svg: "Ligne d'agrafes : chaque agrafe est un élément de mon parcours, du plus ancien au plus récent",
    empty: "Aucun élément dans cette catégorie.",
  },
  en: {
    label: "The thread, in order",
    all: "All",
    career: "Career",
    project: "Projects",
    essay: "Essays",
    open: "Open",
    prev: "Previous",
    next: "Next",
    hint: "Click a staple, or use the ← → arrow keys.",
    svg: "A line of staples: each staple is an item of my journey, oldest to newest",
    empty: "Nothing in this category.",
  },
}

// ---- geometry ----
const STEP = 78
const PAD = 70
const H = 160
const r2 = (v: number) => Math.round(v * 100) / 100
const scarY = (x: number) => 66 + 14 * Math.sin(x / 150) + 4 * Math.sin(x / 37)

export default function FilExplorer({ items, locale = "fr" }: { items: FilItem[]; locale?: FilLocale }) {
  const copy = COPY[locale]
  const [group, setGroup] = useState<Group>("all")
  const [activeId, setActiveId] = useState<string>(items[items.length - 1]?.id ?? "")
  const scrollerRef = useRef<HTMLDivElement>(null)

  const counts = useMemo(() => {
    const c: Record<Group, number> = { all: items.length, career: 0, project: 0, essay: 0 }
    items.forEach((i) => (c[GROUP_OF[i.kind]] += 1))
    return c
  }, [items])

  const filtered = useMemo(() => (group === "all" ? items : items.filter((i) => GROUP_OF[i.kind] === group)), [items, group])
  const width = PAD * 2 + Math.max(0, filtered.length - 1) * STEP

  const geometry = useMemo(() => {
    const staples = filtered.map((item, i) => {
      const x = PAD + i * STEP
      const y = scarY(x)
      const slope = (scarY(x + 1) - scarY(x - 1)) / 2
      return { item, x: r2(x), y: r2(y), angle: r2((Math.atan2(slope, 1) * 180) / Math.PI) }
    })
    const path = Array.from({ length: Math.max(2, Math.floor(width / 10)) }, (_, i) => {
      const x = (i * width) / Math.max(1, Math.floor(width / 10) - 1)
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${scarY(x).toFixed(1)}`
    }).join(" ")
    return { staples, path }
  }, [filtered, width])

  const active = filtered.find((i) => i.id === activeId) ?? filtered[filtered.length - 1] ?? null
  const activeIndex = active ? filtered.findIndex((i) => i.id === active.id) : -1

  // If the active item is filtered out, fall back to the latest visible one.
  useEffect(() => {
    if (active && active.id !== activeId) setActiveId(active.id)
  }, [active, activeId])

  // Keep the active staple in view.
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || activeIndex < 0) return
    const x = PAD + activeIndex * STEP
    scroller.scrollTo({ left: Math.max(0, x - scroller.clientWidth / 2), behavior: "smooth" })
  }, [activeIndex, group])

  const move = (delta: number) => {
    const next = filtered[activeIndex + delta]
    if (next) setActiveId(next.id)
  }

  return (
    <section aria-label={copy.label} className="space-y-6">
      {/* filters */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={copy.label}>
        {(["all", "career", "project", "essay"] as Group[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroup(g)}
            aria-pressed={group === g}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              group === g ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground"
            }`}
          >
            {copy[g]} <span className="ml-1 font-mono text-[11px] opacity-60">{counts[g]}</span>
          </button>
        ))}
      </div>

      {/* the thread */}
      <div
        ref={scrollerRef}
        className="overflow-x-auto rounded-lg border border-border bg-foreground/[0.02] [scrollbar-width:thin]"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault()
            move(1)
          } else if (e.key === "ArrowLeft") {
            e.preventDefault()
            move(-1)
          }
        }}
      >
        <svg viewBox={`0 0 ${width} ${H}`} width={width} height={H} role="group" aria-label={copy.svg} className="block">
          <path d={geometry.path} fill="none" style={{ stroke: "var(--foreground)" }} strokeOpacity="0.22" strokeWidth="5" strokeLinecap="round" />
          <path d={geometry.path} fill="none" style={{ stroke: "#f87171" }} strokeOpacity="0.14" strokeWidth="10" strokeLinecap="round" />
          <path d={geometry.path} fill="none" style={{ stroke: "var(--background)" }} strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" />

          {geometry.staples.map(({ item, x, y, angle }, i) => {
            const meta = FIL_KIND[item.kind]
            const isActive = item.id === active?.id
            const newYear = i === 0 || geometry.staples[i - 1].item.year !== item.year
            return (
              <g key={item.id}>
                {newYear && (
                  <text x={x} y={H - 18} textAnchor="middle" className="font-mono" fontSize="11" style={{ fill: "var(--muted-foreground)" }}>
                    {item.year}
                  </text>
                )}
                <g
                  transform={`translate(${x} ${y}) rotate(${r2(angle + 90)})`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={`${item.label} (${meta.label[locale]}, ${item.when})`}
                  onClick={() => setActiveId(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setActiveId(item.id)
                    }
                  }}
                  style={{ cursor: "pointer", outline: "none" }}
                  className="focus-visible:[&>circle:first-child]:stroke-foreground"
                >
                  <circle r="26" fill="transparent" stroke="transparent" />
                  {isActive && (
                    <circle r="19" fill="none" stroke={meta.color} strokeWidth="1" opacity="0.8">
                      <animate attributeName="r" values="16;22;16" dur="2.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.85;0.2;0.85" dur="2.6s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <line x1="-12" y1="0" x2="12" y2="0" stroke={meta.color} strokeWidth={isActive ? 3.6 : 2.6} strokeLinecap="round" opacity={isActive ? 1 : 0.8} />
                  <circle cx="-12" cy="0" r="2.8" className="fill-background" stroke={meta.color} strokeWidth="1.3" />
                  <circle cx="12" cy="0" r="2.8" className="fill-background" stroke={meta.color} strokeWidth="1.3" />
                </g>
              </g>
            )
          })}
        </svg>
      </div>
      <p className="text-xs text-muted-foreground">{copy.hint}</p>

      {/* the open staple */}
      {active ? (
        <article className="grid gap-5 rounded-lg border border-border p-5 sm:grid-cols-[minmax(0,260px)_1fr] sm:p-6" style={{ borderColor: `color-mix(in srgb, ${FIL_KIND[active.kind].color} 35%, var(--border))` }}>
          {active.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={active.image} alt="" loading="lazy" className="h-40 w-full rounded-md border border-border object-cover object-top sm:h-56" />
          ) : (
            <div className="hidden rounded-md border border-dashed border-border sm:block" aria-hidden />
          )}
          <div className="flex flex-col justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-4 font-mono text-[11px] tracking-wider" style={{ color: FIL_KIND[active.kind].color }}>
                <span>{FIL_KIND[active.kind].label[locale].toUpperCase()}</span>
                <span className="text-muted-foreground">{active.when}</span>
              </div>
              <h3 className="font-editorial text-2xl leading-tight sm:text-3xl">{active.label}</h3>
              {active.sub && <p className="text-muted-foreground">{active.sub}</p>}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href={active.href} className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-colors hover:bg-foreground/90">
                {copy.open} <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(-1)} disabled={activeIndex <= 0} aria-label={copy.prev} className="rounded p-2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="font-mono text-xs text-muted-foreground">
                  {activeIndex + 1} / {filtered.length}
                </span>
                <button type="button" onClick={() => move(1)} disabled={activeIndex >= filtered.length - 1} aria-label={copy.next} className="rounded p-2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </article>
      ) : (
        <p className="text-muted-foreground">{copy.empty}</p>
      )}
    </section>
  )
}
