"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SCAR_MILESTONES, SCAR_UI, type ScarKind, type ScarLocale } from "@/lib/scar-milestones"

const KIND: Record<ScarKind, { label: Record<ScarLocale, string>; color: string }> = {
  origin: { label: { fr: "Origine", en: "Origin" }, color: "var(--muted-foreground)" },
  rise: { label: { fr: "Progression", en: "Growth" }, color: "#f59e0b" },
  peak: { label: { fr: "Sommet", en: "Peak" }, color: "#f59e0b" },
  rupture: { label: { fr: "Épreuve", en: "Setback" }, color: "#f87171" },
  rebuild: { label: { fr: "Retour", en: "Comeback" }, color: "#10b981" },
  build: { label: { fr: "Aujourd'hui", en: "Today" }, color: "var(--foreground)" },
}

// ---- geometry (SVG user units, viewBox 1200 x 600) ----
const VB_W = 1200
const VB_H = 600
const X0 = 170
const X1 = 1030
const STAPLES_PER_GAP = 4

const scarY = (x: number) => {
  const t = (x - X0) / (X1 - X0)
  return 300 + 34 * Math.sin(t * Math.PI) - 14 * t + 3.5 * Math.sin(x / 37)
}

const rand = (seed: number) => {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return v - Math.floor(v)
}

// Server and browser disagree after ~10 decimals on Math.sin/cos: round everything that is rendered.
const r2 = (v: number) => Math.round(v * 100) / 100

// Camera tuning
const INTRO = 0.07
const OUTRO = 0.93
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (t: number) => t * t * (3 - 2 * t)

type Props = {
  locale?: ScarLocale
  /** Height in px of a sticky bar above the scene (the page navigation). */
  offset?: number
  /** Where the "read the full story" link points. */
  storyHref?: string
}

export default function ScarTimeline({ locale = "fr", offset = 0, storyHref = "#recit" }: Props) {
  const milestones = SCAR_MILESTONES[locale]
  const ui = SCAR_UI[locale]
  const N = milestones.length
  const totalStaples = (N - 1) * STAPLES_PER_GAP + 1

  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<SVGGElement>(null)
  const [active, setActive] = useState(-1)

  const { staples, scarPath, hairs } = useMemo(() => {
    const staples = Array.from({ length: totalStaples }, (_, i) => {
      const x = X0 + 40 + ((X1 - X0 - 80) * i) / (totalStaples - 1)
      const y = scarY(x)
      const slope = (scarY(x + 1) - scarY(x - 1)) / 2
      const normal = (Math.atan2(slope, 1) * 180) / Math.PI + 90
      const tilt = (rand(i + 1) - 0.5) * 16
      const milestone = i % STAPLES_PER_GAP === 0 ? i / STAPLES_PER_GAP : -1
      return { x: r2(x), y: r2(y), angle: r2(normal + tilt), milestone }
    })
    const scarPath = Array.from({ length: 90 }, (_, i) => {
      const x = X0 + ((X1 - X0) * i) / 89
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${(scarY(x) + (rand(i + 50) - 0.5) * 1.4).toFixed(1)}`
    }).join(" ")
    const hairs = Array.from({ length: 220 }, (_, i) => {
      const x = rand(i * 3 + 1) * 1500 - 150
      const y = 175 + rand(i * 3 + 2) * 250
      const len = 6 + rand(i * 3 + 3) * 9
      const a = (-35 + (rand(i + 900) - 0.5) * 40) * (Math.PI / 180)
      return { x: r2(x), y: r2(y), x2: r2(x + Math.cos(a) * len), y2: r2(y + Math.sin(a) * len) }
    })
    return { staples, scarPath, hairs }
  }, [totalStaples])

  const milestoneStaples = useMemo(() => staples.filter((s) => s.milestone >= 0), [staples])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const cam = { px: 600, py: 300, fx: 600, fy: 300, s: 1 }
    let raf = 0
    let running = false
    let lastActive = -2

    const tick = () => {
      const group = cameraRef.current
      const sticky = stickyRef.current
      if (!group || !sticky) return
      const rect = section.getBoundingClientRect()
      const total = rect.height - sticky.offsetHeight
      const p = clamp((offset - rect.top) / total)
      const desktop = window.innerWidth >= 1024
      const zoom = desktop ? 3.4 : 4
      const base = desktop ? 1 : 1.35

      const f = clamp((p - INTRO) / (OUTRO - INTRO)) * (N - 1)
      const i0 = Math.floor(f)
      const i1 = Math.min(N - 1, i0 + 1)
      const k = smooth(f - i0)
      const px = lerp(milestoneStaples[i0].x, milestoneStaples[i1].x, k)
      const py = lerp(milestoneStaples[i0].y, milestoneStaples[i1].y, k)

      let s = zoom
      if (p < INTRO) s = lerp(base, zoom, smooth(p / INTRO))
      else if (p > OUTRO) s = lerp(zoom, base, smooth((p - OUTRO) / (1 - OUTRO)))
      const w = clamp((s - base) / (zoom - base))

      const target = {
        px: lerp(VB_W / 2, px, w),
        py: lerp(VB_H / 2, py, w),
        fx: lerp(VB_W / 2, desktop ? VB_W * 0.36 : VB_W / 2, w),
        fy: lerp(VB_H / 2, desktop ? VB_H / 2 : 215, w),
        s,
      }
      const a = reduce ? 1 : 0.14
      ;(Object.keys(target) as (keyof typeof target)[]).forEach((key) => {
        cam[key] = lerp(cam[key], target[key], a)
      })
      group.setAttribute("transform", `translate(${cam.fx} ${cam.fy}) scale(${cam.s}) translate(${-cam.px} ${-cam.py})`)

      const next = p < INTRO * 0.6 ? -1 : Math.round(f)
      if (next !== lastActive) {
        lastActive = next
        setActive(next)
      }
    }

    const loop = () => {
      tick()
      raf = requestAnimationFrame(loop)
    }

    // Only animate while the scene is on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true
          raf = requestAnimationFrame(loop)
        } else if (!entry.isIntersecting && running) {
          running = false
          cancelAnimationFrame(raf)
        }
      },
      { rootMargin: "200px 0px" },
    )
    io.observe(section)
    tick()
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [milestoneStaples, N, offset])

  const goTo = (index: number) => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    if (!section || !sticky) return
    const total = section.offsetHeight - sticky.offsetHeight
    const p = INTRO + (index / (N - 1)) * (OUTRO - INTRO)
    // progress p is reached when section.top === offset - p * total
    const top = window.scrollY + section.getBoundingClientRect().top - offset + p * total
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" })
  }

  const current = active >= 0 ? milestones[active] : null
  const currentKind = current ? KIND[current.kind] : null

  return (
    <div className="bg-background text-foreground">
      {/* Full text for screen readers and search engines: the visible panel shows one milestone at a time. */}
      <ol className="sr-only">
        {milestones.map((m) => (
          <li key={m.year + m.title}>
            {m.year} — {m.title}. {m.text}
          </li>
        ))}
      </ol>

      <section ref={sectionRef} style={{ height: `${(N + 1) * 70}vh` }} className="relative">
        <div ref={stickyRef} className="sticky overflow-hidden" style={{ top: offset, height: `calc(100svh - ${offset}px)` }}>
          {/* The scar */}
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
            style={{ overflow: "visible" }}
            role="img"
            aria-label={ui.svgLabel}
          >
            <g ref={cameraRef}>
              {/* skin */}
              <path
                d="M-400 140 C 200 110, 700 175, 1600 130 L 1600 470 C 900 505, 300 440, -400 480 Z"
                style={{ fill: "color-mix(in srgb, var(--foreground) 4%, transparent)", stroke: "var(--border)" }}
                strokeWidth="1.2"
              />
              {hairs.map((h, i) => (
                <line
                  key={i}
                  x1={h.x}
                  y1={h.y}
                  x2={h.x2}
                  y2={h.y2}
                  style={{ stroke: "var(--foreground)" }}
                  strokeOpacity="0.14"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                />
              ))}

              {/* scar ridge */}
              <path d={scarPath} fill="none" style={{ stroke: "var(--foreground)" }} strokeOpacity="0.28" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <path d={scarPath} fill="none" style={{ stroke: "#f87171" }} strokeOpacity="0.16" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
              <path d={scarPath} fill="none" style={{ stroke: "var(--background)" }} strokeOpacity="0.7" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />

              {/* staples */}
              {staples.map((s, i) => {
                const isMilestone = s.milestone >= 0
                const isActive = s.milestone === active
                const color = isMilestone ? KIND[milestones[s.milestone].kind].color : "var(--muted-foreground)"
                return (
                  <g
                    key={i}
                    transform={`translate(${s.x} ${s.y}) rotate(${r2(s.angle - 90)})`}
                    onClick={isMilestone ? () => goTo(s.milestone) : undefined}
                    style={{ cursor: isMilestone ? "pointer" : "default" }}
                    opacity={isMilestone ? 1 : 0.55}
                  >
                    {isMilestone && <circle r="22" fill="transparent" />}
                    {isActive && (
                      <circle r="16" fill="none" stroke={color} strokeWidth="0.9" opacity="0.8">
                        <animate attributeName="r" values="13;19;13" dur="2.6s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.85;0.2;0.85" dur="2.6s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <line x1="-13" y1="0" x2="13" y2="0" style={{ stroke: isMilestone ? color : "var(--foreground)" }} strokeWidth={isMilestone ? 2.6 : 2.1} strokeLinecap="round" strokeOpacity={isMilestone ? 0.95 : 0.6} />
                    <circle cx="-13" cy="0" r="2.4" style={{ fill: "var(--background)", stroke: isMilestone ? color : "var(--foreground)" }} strokeWidth="1.1" />
                    <circle cx="13" cy="0" r="2.4" style={{ fill: "var(--background)", stroke: isMilestone ? color : "var(--foreground)" }} strokeWidth="1.1" />
                  </g>
                )
              })}

              {/* year labels */}
              {milestoneStaples.map((s, i) => (
                <text
                  key={i}
                  x={s.x}
                  y={r2(s.y + 42)}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize="7.5"
                  letterSpacing="0.8"
                  style={{ fill: "var(--muted-foreground)", transition: "opacity .4s" }}
                  opacity={active === -1 || active === i ? 1 : 0.35}
                >
                  {milestones[i].year.toUpperCase()}
                </text>
              ))}
            </g>
          </svg>

          {/* Intro overlay */}
          <div
            className="pointer-events-none absolute inset-x-0 top-[10%] z-10 px-6 text-center transition-all duration-700"
            style={{ opacity: active === -1 ? 1 : 0, transform: active === -1 ? "none" : "translateY(-12px)" }}
            aria-hidden={active !== -1}
          >
            <div className="text-sm text-muted-foreground font-mono tracking-wider">{ui.kicker}</div>
            <h2 className="font-editorial mt-4 text-4xl sm:text-5xl lg:text-6xl leading-[1.02]">{ui.heading}</h2>
            <p className="mt-4 text-muted-foreground">{ui.hint}</p>
          </div>

          {/* Milestone panel */}
          {current && currentKind && (
            <div
              key={active}
              className="animate-fade-in-up absolute z-10 inset-x-4 bottom-6 lg:inset-x-auto lg:right-[6vw] lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:w-[26rem]"
            >
              <div className="rounded-lg border bg-background/80 backdrop-blur-md p-6 sm:p-7" style={{ borderColor: `color-mix(in srgb, ${currentKind.color} 35%, var(--border))` }}>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-base text-muted-foreground">{current.year}</div>
                  <div className="text-xs font-mono" style={{ color: currentKind.color }}>
                    {currentKind.label[locale].toUpperCase()}
                  </div>
                </div>
                <h3 className="font-editorial mt-3 text-2xl sm:text-3xl leading-tight">{current.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{current.text}</p>

                {active === N - 1 && (
                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <Link href={ui.projectsHref} className="inline-flex items-center gap-2 hover:gap-3 transition-all duration-300">
                      {ui.projects} <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a href={storyHref} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
                      {ui.fullStory}
                    </a>
                  </div>
                )}

                <div className="mt-6 flex items-center gap-1.5" role="tablist" aria-label={ui.tabsLabel}>
                  {milestones.map((m, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`${m.year} — ${m.title}`}
                      aria-current={i === active}
                      className="h-4 flex-1 flex items-center group"
                    >
                      <span
                        className="block h-px w-full transition-all duration-300 group-hover:h-[3px]"
                        style={{ background: i === active ? currentKind.color : "var(--border)", height: i === active ? 3 : undefined }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
