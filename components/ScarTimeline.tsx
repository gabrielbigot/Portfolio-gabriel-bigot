"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

type Kind = "origin" | "rise" | "peak" | "rupture" | "rebuild"

const KIND: Record<Kind, { label: string; color: string }> = {
  origin: { label: "Origine", color: "var(--muted-foreground)" },
  rise: { label: "Progression", color: "#f59e0b" },
  peak: { label: "Sommet", color: "#f59e0b" },
  rupture: { label: "Épreuve", color: "#f87171" },
  rebuild: { label: "Retour", color: "#10b981" },
}

// Prototype copy: short teasers distilled from /about. One staple = one milestone.
const MILESTONES: { year: string; kind: Kind; title: string; text: string }[] = [
  { year: "2008", kind: "origin", title: "Un stick dans les mains", text: "Premières crosses au TAC Hockey, Le Touquet. Le début de tout." },
  { year: "Collège", kind: "rise", title: "Le talent, puis le brassard", text: "Mauvais perdant au départ, puis le talent, puis le brassard de capitaine." },
  { year: "U16", kind: "peak", title: "Intouchable", text: "L'impression de pouvoir faire ce que je voulais sur le terrain." },
  { year: "2019", kind: "rupture", title: "La première luxation", text: "Un entraînement banal, sans choc ni duel. En courant, le genou se dérobe." },
  { year: "2019 — 2020", kind: "rebuild", title: "Première rééducation, premier retour", text: "Reprendre pas à pas, jusqu'au retour sur le terrain." },
  { year: "2020 — 2022", kind: "rupture", title: "Les dislocations continuent", text: "Le lycée La Malassise, le bac, et des complications médicales qui assombrissent la période." },
  { year: "Oct. 2022", kind: "rupture", title: "L'opération, l'infection", text: "L'opération, puis deux staphylocoques. C'est de là que vient la cicatrice." },
  { year: "2023", kind: "rebuild", title: "Reconstruire, encore une fois", text: "Rééducation, reprise progressive et reconstruction de la confiance." },
  { year: "2026", kind: "peak", title: "Le TAC retrouve l'Élite", text: "1ère place de Nationale 1, 16 victoires en 18 matchs et 100 buts inscrits." },
]

// ---- geometry (SVG user units, viewBox 1200 x 600) ----
const VB_W = 1200
const VB_H = 600
const X0 = 170
const X1 = 1030
const STAPLES_PER_GAP = 4
const N = MILESTONES.length
const TOTAL_STAPLES = (N - 1) * STAPLES_PER_GAP + 1

const scarY = (x: number) => {
  const t = (x - X0) / (X1 - X0)
  return 300 + 34 * Math.sin(t * Math.PI) - 14 * t + 3.5 * Math.sin(x / 37)
}

const rand = (seed: number) => {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return v - Math.floor(v)
}

// Camera tuning
const INTRO = 0.07
const OUTRO = 0.93
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (t: number) => t * t * (3 - 2 * t)

export default function ScarTimeline() {
  const sectionRef = useRef<HTMLElement>(null)
  const cameraRef = useRef<SVGGElement>(null)
  const [active, setActive] = useState(-1)

  const { staples, scarPath, hairs } = useMemo(() => {
    const staples = Array.from({ length: TOTAL_STAPLES }, (_, i) => {
      const x = X0 + 40 + ((X1 - X0 - 80) * i) / (TOTAL_STAPLES - 1)
      const y = scarY(x)
      const slope = (scarY(x + 1) - scarY(x - 1)) / 2
      const normal = (Math.atan2(slope, 1) * 180) / Math.PI + 90
      const tilt = (rand(i + 1) - 0.5) * 16
      const milestone = i % STAPLES_PER_GAP === 0 ? i / STAPLES_PER_GAP : -1
      return { x, y, angle: normal + tilt, milestone }
    })
    const pts = Array.from({ length: 90 }, (_, i) => {
      const x = X0 + ((X1 - X0) * i) / 89
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${(scarY(x) + (rand(i + 50) - 0.5) * 1.4).toFixed(1)}`
    }).join(" ")
    const hairs = Array.from({ length: 220 }, (_, i) => {
      const x = rand(i * 3 + 1) * 1500 - 150
      const y = 175 + rand(i * 3 + 2) * 250
      const len = 6 + rand(i * 3 + 3) * 9
      const a = (-35 + (rand(i + 900) - 0.5) * 40) * (Math.PI / 180)
      return { x, y, dx: Math.cos(a) * len, dy: Math.sin(a) * len }
    })
    return { staples, scarPath: pts, hairs }
  }, [])

  const milestoneStaples = useMemo(() => staples.filter((s) => s.milestone >= 0), [staples])

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const cam = { px: 600, py: 300, fx: 600, fy: 300, s: 1 }
    let raf = 0
    let lastActive = -2

    const tick = () => {
      const section = sectionRef.current
      const group = cameraRef.current
      if (section && group) {
        const rect = section.getBoundingClientRect()
        const total = rect.height - window.innerHeight
        const p = clamp(-rect.top / total)
        const desktop = window.innerWidth >= 1024
        const zoom = desktop ? 3.4 : 4

        const f = clamp((p - INTRO) / (OUTRO - INTRO)) * (N - 1)
        const i0 = Math.floor(f)
        const i1 = Math.min(N - 1, i0 + 1)
        const k = smooth(f - i0)
        const px = lerp(milestoneStaples[i0].x, milestoneStaples[i1].x, k)
        const py = lerp(milestoneStaples[i0].y, milestoneStaples[i1].y, k)

        let s = zoom
        if (p < INTRO) s = lerp(1, zoom, smooth(p / INTRO))
        else if (p > OUTRO) s = lerp(zoom, 1, smooth((p - OUTRO) / (1 - OUTRO)))
        const w = (s - 1) / (zoom - 1)

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
        group.setAttribute(
          "transform",
          `translate(${cam.fx} ${cam.fy}) scale(${cam.s}) translate(${-cam.px} ${-cam.py})`,
        )

        const next = p < INTRO * 0.6 ? -1 : Math.round(f)
        if (next !== lastActive) {
          lastActive = next
          setActive(next)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [milestoneStaples])

  const goTo = (index: number) => {
    const section = sectionRef.current
    if (!section) return
    const total = section.offsetHeight - window.innerHeight
    const p = INTRO + (index / (N - 1)) * (OUTRO - INTRO)
    const top = section.getBoundingClientRect().top + window.scrollY + p * total
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" })
  }

  const current = active >= 0 ? MILESTONES[active] : null
  const currentKind = current ? KIND[current.kind] : null

  return (
    <div className="bg-background text-foreground">
      <section ref={sectionRef} style={{ height: `${(N + 2) * 85}vh` }} className="relative">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {/* Back link */}
          <Link
            href="/"
            className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au portfolio</span>
          </Link>
          <div className="absolute right-5 top-5 z-20 text-[10px] font-mono tracking-[0.18em] uppercase text-muted-foreground">
            Prototype · la cicatrice
          </div>

          {/* The scar */}
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
            style={{ overflow: "visible" }}
            role="img"
            aria-label="Une cicatrice fermée par des agrafes, chacune marquant un moment de mon parcours"
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
                  x2={h.x + h.dx}
                  y2={h.y + h.dy}
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
                const color = isMilestone ? KIND[MILESTONES[s.milestone].kind].color : "var(--muted-foreground)"
                return (
                  <g
                    key={i}
                    transform={`translate(${s.x} ${s.y}) rotate(${s.angle - 90})`}
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
                  y={s.y + 42}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize="7.5"
                  letterSpacing="0.8"
                  style={{ fill: "var(--muted-foreground)", transition: "opacity .4s" }}
                  opacity={active === -1 || active === i ? 1 : 0.35}
                >
                  {MILESTONES[i].year.toUpperCase()}
                </text>
              ))}
            </g>
          </svg>

          {/* Intro overlay */}
          <div
            className="pointer-events-none absolute inset-x-0 top-[12%] z-10 px-6 text-center transition-all duration-700"
            style={{ opacity: active === -1 ? 1 : 0, transform: active === -1 ? "none" : "translateY(-12px)" }}
          >
            <div className="text-sm text-muted-foreground font-mono tracking-wider">MON HISTOIRE, AGRAFE PAR AGRAFE</div>
            <h1 className="font-editorial mt-4 text-4xl sm:text-5xl lg:text-6xl leading-[1.02]">Une cicatrice, neuf repères</h1>
            <p className="mt-4 text-muted-foreground">Scrolle pour avancer le long de la cicatrice.</p>
          </div>

          {/* Milestone panel */}
          {current && currentKind && (
            <div
              key={active}
              className="animate-fade-in-up absolute z-10 inset-x-4 bottom-6 lg:inset-x-auto lg:right-[6vw] lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:w-[26rem]"
            >
              <div className="rounded-lg border bg-background/75 backdrop-blur-md p-6 sm:p-7" style={{ borderColor: `color-mix(in srgb, ${currentKind.color} 35%, var(--border))` }}>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-base text-muted-foreground">{current.year}</div>
                  <div className="text-xs font-mono" style={{ color: currentKind.color }}>
                    {currentKind.label.toUpperCase()}
                  </div>
                </div>
                <h2 className="font-editorial mt-3 text-2xl sm:text-3xl leading-tight">{current.title}</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">{current.text}</p>

                {active === N - 1 && (
                  <Link href="/about" className="mt-5 inline-flex items-center gap-2 text-sm hover:gap-3 transition-all duration-300">
                    Lire l&apos;histoire complète <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                <div className="mt-6 flex items-center gap-1.5" role="tablist" aria-label="Jalons">
                  {MILESTONES.map((m, i) => (
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
