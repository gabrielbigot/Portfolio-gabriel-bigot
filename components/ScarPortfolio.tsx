"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import Link from "next/link"
import { ArrowRight, ArrowDown, Download, Moon, Sun } from "lucide-react"
import { FIL_KIND, type FilItem, type FilKind } from "@/lib/fil"
import { STORY_KIND, STORY_MILESTONES, type StoryCopy, type StoryLocale } from "@/lib/scar-story"

type SkillGroup = { category: string; skills: string[] }
type Props = {
  locale: StoryLocale
  copy: StoryCopy
  items: FilItem[]
  skills: SkillGroup[]
  languages: { name: string; level: string }[]
  cvUrl: string
  linkedin?: string
}

type Filter = "all" | "career" | "project" | "essay"
const FILTER_OF: Record<FilKind, Exclude<Filter, "all">> = { origin: "career", experience: "career", project: "project", essay: "essay" }

type Node = { id: string; x: number; y: number; color: string; major: boolean }
type Geo = {
  w: number
  h: number
  d: string
  hairs: string
  total: number
  pts: { x: number; y: number; len: number }[]
  nodes: Node[]
  band: number
}

const rand = (seed: number) => {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return v - Math.floor(v)
}
const r1 = (v: number) => Math.round(v * 10) / 10

// Uniform Catmull-Rom through the anchor points, sampled roughly every 10px.
function spline(anchors: { x: number; y: number }[]) {
  const out: { x: number; y: number }[] = []
  for (let i = 0; i < anchors.length - 1; i++) {
    const p0 = anchors[Math.max(0, i - 1)]
    const p1 = anchors[i]
    const p2 = anchors[i + 1]
    const p3 = anchors[Math.min(anchors.length - 1, i + 2)]
    const n = Math.max(4, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / 10))
    for (let k = 0; k < n; k++) {
      const t = k / n
      const t2 = t * t
      const t3 = t2 * t
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      })
    }
  }
  out.push(anchors[anchors.length - 1])
  return out
}

export default function ScarPortfolio({ locale, copy, items, skills, languages, cvUrl, linkedin }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<SVGPathElement>(null)
  const tipRef = useRef<SVGCircleElement>(null)
  const [geo, setGeo] = useState<Geo | null>(null)
  const [reached, setReached] = useState(0)
  const [filter, setFilter] = useState<Filter>("all")
  const [introDone, setIntroDone] = useState(false)
  // Night is the default. The choice is remembered, and read after mount so server and client agree.
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const reduce = useRef(false)

  const milestones = STORY_MILESTONES[locale]

  const threadItems = useMemo(
    () => items.filter((i) => i.kind !== "origin").filter((i) => filter === "all" || FILTER_OF[i.kind] === filter),
    [items, filter],
  )
  const years = useMemo(() => Array.from(new Set(threadItems.map((i) => i.year))), [threadItems])
  // alternate sides over the whole list, not per year, so the page stays balanced
  const sideOf = useMemo(() => new Map(threadItems.map((i, n) => [i.id, n % 2 === 1] as const)), [threadItems])
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: 0, career: 0, project: 0, essay: 0 }
    items.forEach((i) => {
      if (i.kind === "origin") return
      c.all += 1
      c[FILTER_OF[i.kind]] += 1
    })
    return c
  }, [items])

  // ---- measure the page and build the thread ----
  const measure = useCallback(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const wr = wrap.getBoundingClientRect()
    const w = wr.width
    const h = wrap.offsetHeight
    const desktop = w >= 768
    const hero = wrap.querySelector<HTMLElement>("[data-hero]")
    const hh = hero ? hero.offsetHeight : 700

    const nodes: Node[] = Array.from(wrap.querySelectorAll<HTMLElement>("[data-node]")).map((el) => {
      const r = el.getBoundingClientRect()
      return { id: el.dataset.node || "", x: r1(r.left + r.width / 2 - wr.left), y: r1(r.top + r.height / 2 - wr.top), color: el.dataset.color || "#999", major: el.dataset.major === "1" }
    })
    if (!nodes.length) return

    // The scar enters the hero as a big sweeping diagonal, then drops into the page and runs down it.
    const first = nodes[0]
    const anchors: { x: number; y: number }[] = [
      { x: w * 1.04, y: hh * 0.06 },
      { x: w * (desktop ? 0.7 : 0.8), y: hh * 0.26 },
      { x: w * (desktop ? 0.3 : 0.35), y: hh * 0.5 },
      { x: w * (desktop ? 0.62 : 0.55), y: hh * 0.78 },
    ]
    anchors.push({ x: (anchors[3].x + first.x) / 2, y: (anchors[3].y + first.y) / 2 })
    // organic wander between two distant nodes
    const amp = desktop ? 13 : 7
    nodes.forEach((n, i) => {
      if (i > 0) {
        const prev = nodes[i - 1]
        const gap = n.y - prev.y
        if (gap > 140) {
          const steps = Math.floor(gap / 110)
          for (let s = 1; s <= steps; s++) {
            const y = prev.y + (gap * s) / (steps + 1)
            anchors.push({ x: r1(prev.x + (n.x - prev.x) * (s / (steps + 1)) + amp * Math.sin(y / 53 + i)), y: r1(y) })
          }
        }
      }
      anchors.push({ x: n.x, y: n.y })
    })
    // the thread stops on the last node

    const dense = spline(anchors)
    const pts: Geo["pts"] = []
    let total = 0
    dense.forEach((p, i) => {
      if (i > 0) total += Math.hypot(p.x - dense[i - 1].x, p.y - dense[i - 1].y)
      pts.push({ x: r1(p.x), y: r1(p.y), len: total })
    })
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ")

    // hairs of the skin, around the thread
    let hairs = ""
    let seed = 1
    for (let i = 4; i < pts.length - 4; i += 7) {
      const a = pts[i - 3]
      const b = pts[i + 3]
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
      const nx = -(b.y - a.y) / len
      const ny = (b.x - a.x) / len
      for (const side of [-1, 1]) {
        seed += 1
        const off = (desktop ? 34 : 20) + rand(seed) * (desktop ? 90 : 46)
        const x = pts[i].x + nx * off * side
        const y = pts[i].y + ny * off * side
        const l = 6 + rand(seed + 77) * 9
        const ang = (-35 + (rand(seed + 9) - 0.5) * 40) * (Math.PI / 180)
        hairs += `M${r1(x)} ${r1(y)}l${r1(Math.cos(ang) * l)} ${r1(Math.sin(ang) * l)}`
      }
    }
    setGeo({ w, h, d, hairs, total, pts, nodes, band: desktop ? 190 : 90 })
  }, [])

  useLayoutEffect(() => {
    measure()
  }, [measure, filter])

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const wrap = wrapRef.current
    if (!wrap) return
    const ro = new ResizeObserver(() => measure())
    ro.observe(wrap)
    window.addEventListener("load", measure)
    document.fonts?.ready.then(measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("load", measure)
    }
  }, [measure])

  // ---- reading position along the thread ----
  useEffect(() => {
    if (!geo) return
    let raf = 0
    const update = () => {
      raf = 0
      const wrap = wrapRef.current
      if (!wrap) return
      const top = wrap.getBoundingClientRect().top
      const readingY = window.innerHeight * 0.6 - top
      // reached nodes
      let count = 0
      while (count < geo.nodes.length && geo.nodes[count].y <= readingY) count++
      setReached((c) => (c === count ? c : count))
      // progress along the path
      const { pts, total } = geo
      let lo = 0
      let hi = pts.length - 1
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (pts[mid].y < readingY) lo = mid + 1
        else hi = mid
      }
      const p = readingY <= pts[0].y ? pts[0] : pts[lo]
      const len = readingY <= pts[0].y ? 0 : Math.min(total, p.len)
      progressRef.current?.setAttribute("stroke-dasharray", `${len} ${total + 10}`)
      const tip = tipRef.current
      if (tip) {
        tip.setAttribute("cx", String(p.x))
        tip.setAttribute("cy", String(p.y))
        tip.style.opacity = len > 0 && len < total ? "1" : "0"
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [geo])

  useEffect(() => {
    try {
      if (localStorage.getItem("scar-theme") === "light") setTheme("light")
    } catch {}
  }, [])

  // keep the page edges (overscroll, rubber-banding) in the same tone as the page
  useEffect(() => {
    const body = document.body
    const prev = body.style.backgroundColor
    body.style.backgroundColor = theme === "dark" ? "#121214" : ""
    document.documentElement.style.colorScheme = theme
    return () => {
      body.style.backgroundColor = prev
      document.documentElement.style.colorScheme = ""
    }
  }, [theme])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    try {
      localStorage.setItem("scar-theme", next)
    } catch {}
  }

  // one-time intro: the thread draws itself
  useEffect(() => {
    if (!geo || introDone) return
    const t = window.setTimeout(() => setIntroDone(true), reduce.current ? 0 : 2800)
    return () => window.clearTimeout(t)
  }, [geo, introDone])

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce.current ? "auto" : "smooth", block: "start" })
  const showProjects = () => {
    setFilter("project")
    window.setTimeout(() => go("fil"), 60)
  }

  // gradient stops follow the colour of each node: the thread remembers what it went through
  const stops = useMemo(() => {
    if (!geo) return []
    const s = [{ o: 0, c: "#f87171" }]
    geo.nodes.forEach((n) => s.push({ o: Math.min(1, Math.max(0, n.y / geo.h)), c: n.color.startsWith("var(") ? "#a8a29e" : n.color }))
    return s.sort((a, b) => a.o - b.o)
  }, [geo])

  return (
    <div className={`relative bg-background text-foreground ${theme === "dark" ? "scar-night" : ""}`}>
      <style>{`
        .scar-night { --background: #121214; --foreground: #f2eee5; --card: #18181b; --border: #2c2c31; --muted-foreground: #a6a29a; --accent: #b9d4c0; color-scheme: dark; }
        @keyframes scarDraw { from { stroke-dashoffset: var(--len) } to { stroke-dashoffset: 0 } }
        @keyframes scarRise { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: none } }
        @keyframes scarPulse { 0%,100% { r: 5; opacity: .9 } 50% { r: 9; opacity: .35 } }
        .scar-rise { animation: scarRise .9s cubic-bezier(.2,.7,.2,1) both }
        @media (prefers-reduced-motion: reduce) { .scar-rise { animation: none } }
      `}</style>

      {/* ───────── top bar ───────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/70 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3.5 sm:px-8">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: reduce.current ? "auto" : "smooth" })} className="font-editorial text-lg tracking-tight">
            {copy.brand}
          </button>
          <nav className="flex items-center gap-1 text-sm sm:gap-5" aria-label="Chapitres">
            {(
              [
                ["origine", copy.nav.origin],
                ["fil", copy.nav.thread],
                ["competences", copy.nav.skills],
                ["contact", copy.nav.contact],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className="hidden rounded px-2 py-1 text-muted-foreground transition-colors hover:text-foreground sm:block">
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? copy.lightLabel : copy.darkLabel}
              className="rounded border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
            <Link href={copy.langHref} className="rounded border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground">
              {copy.langLabel}
            </Link>
          </nav>
        </div>
      </header>

      {/* ───────── the scar: one SVG under the whole page ───────── */}
      {geo && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-0"
          width={geo.w}
          height={geo.h}
          viewBox={`0 0 ${geo.w} ${geo.h}`}
          style={{ overflow: "visible" }}
        >
          <defs>
            <linearGradient id="scarGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={geo.h}>
              {stops.map((s, i) => (
                <stop key={i} offset={s.o} stopColor={s.c} />
              ))}
            </linearGradient>
          </defs>

          {/* skin */}
          <path d={geo.d} fill="none" style={{ stroke: "var(--foreground)" }} strokeOpacity="0.035" strokeWidth={geo.band} strokeLinecap="round" strokeLinejoin="round" />
          <path d={geo.d} fill="none" style={{ stroke: "var(--foreground)" }} strokeOpacity="0.04" strokeWidth={geo.band * 0.55} strokeLinecap="round" strokeLinejoin="round" />
          <path d={geo.hairs} fill="none" style={{ stroke: "var(--foreground)" }} strokeOpacity="0.15" strokeWidth="0.7" strokeLinecap="round" />

          {/* the scar, not yet travelled */}
          <path
            d={geo.d}
            fill="none"
            stroke="url(#scarGrad)"
            strokeOpacity="0.28"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={introDone || reduce.current ? undefined : ({ strokeDasharray: geo.total, strokeDashoffset: geo.total, animation: "scarDraw 2.6s cubic-bezier(.4,0,.2,1) .2s forwards", ["--len" as string]: geo.total } as CSSProperties)}
          />
          <path d={geo.d} fill="none" style={{ stroke: "var(--background)" }} strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

          {/* the scar already travelled by the reader */}
          <path ref={progressRef} d={geo.d} fill="none" stroke="url(#scarGrad)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`0 ${geo.total + 10}`} />
          <circle ref={tipRef} r="5" cx="-20" cy="-20" fill="var(--background)" style={{ stroke: "var(--foreground)", opacity: 0, animation: reduce.current ? undefined : "scarPulse 2.4s ease-in-out infinite" }} strokeWidth="1.4" />

          {/* staples: they close as the reader reaches them */}
          {geo.nodes.map((n, i) => {
            const done = i < reached
            const leg = n.major ? 17 : 12
            return (
              <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
                <g style={{ transform: `scaleX(${done ? 1 : 1.5})`, transformOrigin: "0 0", transition: reduce.current ? "none" : "transform .7s cubic-bezier(.3,1.7,.5,1)" }}>
                  {done && n.major && <circle r={leg + 8} fill="none" stroke={n.color} strokeWidth="0.8" opacity="0.35" />}
                  <line x1={-leg} y1="0" x2={leg} y2="0" stroke={done ? n.color : "var(--muted-foreground)"} strokeWidth={n.major ? 3 : 2.3} strokeLinecap="round" opacity={done ? 1 : 0.5} style={{ transition: "stroke .5s" }} />
                  <circle cx={-leg} cy="0" r={n.major ? 3.2 : 2.6} style={{ fill: "var(--background)", stroke: done ? n.color : "var(--muted-foreground)", transition: "stroke .5s" }} strokeWidth="1.3" />
                  <circle cx={leg} cy="0" r={n.major ? 3.2 : 2.6} style={{ fill: "var(--background)", stroke: done ? n.color : "var(--muted-foreground)", transition: "stroke .5s" }} strokeWidth="1.3" />
                </g>
              </g>
            )
          })}
        </svg>
      )}

      <div ref={wrapRef} className="relative z-10">
        {/* ───────── hero ───────── */}
        <section data-hero className="relative flex min-h-[100svh] flex-col justify-end px-6 pb-20 pt-32 sm:px-8 sm:pb-28">
          <div className="mx-auto w-full max-w-6xl">
            <div className="scar-rise font-mono text-xs tracking-[0.22em] text-muted-foreground sm:text-sm" style={{ animationDelay: ".1s" }}>
              {copy.kicker}
            </div>
            <h1 className="font-editorial mt-5 text-[22vw] leading-[0.86] tracking-tight sm:text-[17vw] lg:text-[14rem]">
              <span className="scar-rise block" style={{ animationDelay: ".25s" }}>
                {copy.heroLine1}
              </span>
              <span className="scar-rise block text-muted-foreground" style={{ animationDelay: ".4s" }}>
                {copy.heroLine2}
              </span>
            </h1>
            <p className="scar-rise mt-8 max-w-xl text-xl leading-relaxed text-muted-foreground sm:text-2xl" style={{ animationDelay: ".6s" }}>
              {copy.tagline}
            </p>
            <div className="scar-rise mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: ".75s" }}>
              <button type="button" onClick={showProjects} className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-background transition-colors hover:bg-foreground/90">
                {copy.ctaProjects} <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => go("origine")} className="rounded-lg border border-border px-6 py-3 transition-colors hover:border-muted-foreground/60">
                {copy.ctaStory}
              </button>
              <button type="button" onClick={() => go("contact")} className="rounded-lg border border-border px-6 py-3 transition-colors hover:border-muted-foreground/60">
                {copy.ctaContact}
              </button>
              <span className="ml-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> {copy.availability}
              </span>
            </div>
            <div className="scar-rise mt-10 flex flex-wrap gap-2" style={{ animationDelay: ".9s" }}>
              {copy.expertise.map((e) => (
                <span key={e} className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
                  {e}
                </span>
              ))}
            </div>
            <div className="mt-14 inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-muted-foreground">
              <ArrowDown className="h-3.5 w-3.5" /> {copy.scrollHint.toUpperCase()}
            </div>
          </div>
        </section>

        {/* ───────── chapter 1: origin ───────── */}
        <section id="origine" className="scroll-mt-16 px-6 pb-8 pt-24 sm:px-8 sm:pt-32">
          <div className="mx-auto max-w-6xl">
            <header className="max-w-3xl space-y-5 pl-12 md:pl-0 md:text-center md:mx-auto">
              <div className="font-mono text-xs tracking-[0.2em] text-muted-foreground sm:text-sm">{copy.originKicker}</div>
              <h2 className="font-editorial text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">{copy.originTitle}</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">{copy.originIntro}</p>
            </header>

            <ol className="mt-16 sm:mt-24">
              {milestones.map((m, i) => {
                const kind = STORY_KIND[m.kind]
                const left = i % 2 === 0
                return (
                  <li key={m.year + m.title} className="grid grid-cols-[40px_1fr] gap-x-4 pb-14 md:grid-cols-[1fr_72px_1fr] md:gap-x-8 md:pb-20">
                    <div className="col-start-1 row-start-1 flex justify-center md:col-start-2">
                      <div data-node={`o${i}`} data-color={kind.color} data-major={m.kind === "rupture" || m.kind === "peak" ? "1" : "0"} className="mt-2 h-6 w-6" />
                    </div>
                    <div className={`col-start-2 row-start-1 space-y-2 ${left ? "md:col-start-1 md:text-right" : "md:col-start-3"}`}>
                      <div className={`flex items-baseline gap-3 font-mono text-xs tracking-wider ${left ? "md:justify-end" : ""}`}>
                        <span className="text-base font-light tracking-normal text-muted-foreground">{m.year}</span>
                        <span style={{ color: kind.color }}>{kind.label[locale].toUpperCase()}</span>
                      </div>
                      <h3 className="font-editorial text-3xl leading-tight sm:text-4xl">{m.title}</h3>
                      <p className={`max-w-md leading-relaxed text-muted-foreground ${left ? "md:ml-auto" : ""}`}>{m.text}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
            <div className="pl-12 md:pl-0 md:text-center">
              <Link href={copy.storyHref} className="inline-flex items-center gap-2 text-sm transition-all duration-300 hover:gap-3">
                {copy.originMore} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ───────── chapter 2: the thread ───────── */}
        <section id="fil" className="scroll-mt-16 px-6 pb-8 pt-28 sm:px-8 sm:pt-40">
          <div className="mx-auto max-w-6xl">
            <header className="max-w-3xl space-y-5 pl-12 md:mx-auto md:pl-0 md:text-center">
              <div className="font-mono text-xs tracking-[0.2em] text-muted-foreground sm:text-sm">{copy.threadKicker}</div>
              <h2 className="font-editorial text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">{copy.threadTitle}</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">{copy.threadIntro}</p>
            </header>

            <div className="sticky top-[57px] z-30 -mx-6 mt-10 border-y border-border bg-background/80 px-6 py-3 backdrop-blur-lg sm:-mx-8 sm:px-8">
              <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 md:justify-center" role="group" aria-label={copy.threadTitle}>
                {(
                  [
                    ["all", copy.filterAll],
                    ["career", copy.filterCareer],
                    ["project", copy.filterProject],
                    ["essay", copy.filterEssay],
                  ] as [Filter, string][]
                ).map(([f, label]) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    aria-pressed={filter === f}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${filter === f ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground"}`}
                  >
                    {label} <span className="ml-1 font-mono text-[11px] opacity-60">{counts[f]}</span>
                  </button>
                ))}
              </div>
            </div>

            <ol className="mt-16 sm:mt-24">
              {years.map((year) => {
                const group = threadItems.filter((i) => i.year === year)
                return (
                  <li key={year} className="pb-6">
                    <div className="grid grid-cols-[40px_1fr] items-center gap-x-4 pb-10 md:grid-cols-[1fr_72px_1fr] md:gap-x-8">
                      <div className="col-start-1 row-start-1 flex justify-center md:col-start-2">
                        <div data-node={`y${year}`} data-color="var(--muted-foreground)" data-major="1" className="h-6 w-6" />
                      </div>
                      <div className="col-start-2 row-start-1 md:col-start-3">
                        <span className="font-editorial text-6xl leading-none text-foreground/25 sm:text-8xl">{year}</span>
                      </div>
                    </div>
                    <ol>
                      {group.map((it) => {
                        const meta = FIL_KIND[it.kind]
                        const left = sideOf.get(it.id) ?? false
                        const big = it.kind === "experience" || it.featured
                        return (
                          <li key={it.id} className="grid grid-cols-[40px_1fr] gap-x-4 pb-12 md:grid-cols-[1fr_72px_1fr] md:gap-x-8 md:pb-16">
                            <div className="col-start-1 row-start-1 flex justify-center md:col-start-2">
                              <div data-node={it.id} data-color={meta.color} data-major={big ? "1" : "0"} className="mt-3 h-6 w-6" />
                            </div>
                            <article
                              className={`group relative col-start-2 row-start-1 overflow-hidden rounded-lg border bg-background/80 backdrop-blur-[2px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${left ? "md:col-start-1" : "md:col-start-3"}`}
                              style={{ borderColor: `color-mix(in srgb, ${meta.color} 30%, var(--border))` }}
                            >
                              {it.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={it.image} alt="" loading="lazy" className={`w-full border-b border-border object-cover object-top ${big ? "h-52 sm:h-64" : "h-36"}`} />
                              )}
                              <div className="space-y-2.5 p-5 sm:p-6">
                                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-[11px] tracking-wider" style={{ color: meta.color }}>
                                  <span>
                                    {meta.label[locale].toUpperCase()}
                                    {it.featured && <span className="ml-2 text-amber-500">★ {copy.featured.toUpperCase()}</span>}
                                  </span>
                                  <span className="text-muted-foreground">{it.range ?? it.when}</span>
                                </div>
                                <h3 className="font-editorial text-2xl leading-tight sm:text-3xl">
                                  <Link href={it.href} className="after:absolute after:inset-0 focus-visible:outline-none">
                                    {it.label}
                                  </Link>
                                </h3>
                                {it.sub && <p className="text-sm text-muted-foreground">{it.sub}</p>}
                                {it.blurb && <p className="line-clamp-3 text-[0.95rem] leading-relaxed text-muted-foreground">{it.blurb}</p>}
                                <span className="inline-flex items-center gap-2 pt-1 text-sm transition-all duration-300 group-hover:gap-3">
                                  {copy.open} <ArrowRight className="h-4 w-4" />
                                </span>
                              </div>
                            </article>
                          </li>
                        )
                      })}
                    </ol>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        {/* ───────── chapter 3: toolkit ───────── */}
        <section id="competences" className="scroll-mt-16 px-6 pb-8 pt-28 sm:px-8 sm:pt-40">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-[40px_1fr] gap-x-4 md:grid-cols-[1fr_72px_1fr] md:gap-x-8">
              <div className="col-start-1 row-start-1 flex justify-center md:col-start-2">
                <div data-node="skills" data-color="#10b981" data-major="1" className="mt-3 h-6 w-6" />
              </div>
              <div className="col-start-2 row-start-1 space-y-6 md:col-start-3">
                <div className="space-y-4">
                  <div className="font-mono text-xs tracking-[0.2em] text-muted-foreground sm:text-sm">{copy.skillsKicker}</div>
                  <h2 className="font-editorial text-4xl leading-[0.98] sm:text-5xl">{copy.skillsTitle}</h2>
                </div>
                <div className="space-y-5">
                  {skills.map((g) => (
                    <div key={g.category} className="space-y-2">
                      <div className="font-mono text-[11px] tracking-wider text-muted-foreground">{g.category.toUpperCase()}</div>
                      <div className="flex flex-wrap gap-2">
                        {g.skills.map((s) => (
                          <span key={s} className="rounded-full border border-border px-3 py-1 text-sm">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {languages.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-mono text-[11px] tracking-wider text-muted-foreground">{copy.languages.toUpperCase()}</div>
                      <div className="flex flex-wrap gap-2">
                        {languages.map((l) => (
                          <span key={l.name} className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
                            {l.name} · {l.level}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── chapter 4: closing ───────── */}
        <section id="contact" className="scroll-mt-16 px-6 pb-32 pt-28 sm:px-8 sm:pb-44 sm:pt-40">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-[40px_1fr] gap-x-4 md:grid-cols-[1fr_72px_1fr] md:gap-x-8">
              <div className="col-start-1 row-start-1 flex justify-center md:col-start-2">
                <div data-node="close" data-color="#10b981" data-major="1" className="mt-3 h-6 w-6" />
              </div>
              <div className="col-start-2 row-start-1 space-y-6 md:col-start-1 md:text-right">
                <div className="font-mono text-xs tracking-[0.2em] text-muted-foreground sm:text-sm">{copy.closeKicker}</div>
                <h2 className="font-editorial text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">{copy.closeTitle}</h2>
                <p className="max-w-md text-lg leading-relaxed text-muted-foreground md:ml-auto">{copy.closeText}</p>
                <div className="flex flex-wrap gap-3 md:justify-end">
                  <Link href={copy.contactHref} className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-background transition-colors hover:bg-foreground/90">
                    {copy.contact} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href={cvUrl} className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 transition-colors hover:border-muted-foreground/60">
                    <Download className="h-4 w-4" /> {copy.cv}
                  </a>
                  {linkedin && (
                    <a href={linkedin} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-6 py-3 transition-colors hover:border-muted-foreground/60">
                      LinkedIn
                    </a>
                  )}
                </div>
                <div className="pt-6 text-sm text-muted-foreground">
                  <Link href={copy.classicHref} className="underline-offset-4 hover:text-foreground hover:underline">
                    {copy.classic}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-border px-6 py-10 sm:px-8">
          <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">{copy.footer}</div>
        </footer>
      </div>
    </div>
  )
}
