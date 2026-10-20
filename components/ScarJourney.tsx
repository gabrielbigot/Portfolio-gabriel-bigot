"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { SC, SCAR_PTS, spline } from "@/lib/scar-geometry"

// Camera tuning
const INTRO = 0.05
const OUTRO = 0.96
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (t: number) => t * t * (3 - 2 * t)

export type JourneyStop = {
  id: string
  group: "life" | "experience" | "project"
  /** Year, or a date range for experiences. */
  when: string
  kindLabel: string
  color: string
  title: string
  text: string
  sub?: string
  image?: string
  href?: string
  star?: string
  /** Optional extra link under the text (e.g. "read the full story"). */
  extra?: { href: string; label: string }
}

export type JourneyFilter = { key: string; label: string; count: number }

type Props = {
  photo: string
  stops: JourneyStop[]
  filters: JourneyFilter[]
  filter: string
  onFilter: (key: string) => void
  kicker: string
  title: string
  intro: string
  hint: string
  openLabel: string
  /** Height in px of the fixed bar above the scene. */
  offset: number
  theme: "dark" | "light"
  softLabel: string
  sharpLabel: string
  tabsLabel: string
}

const ringColor = (c: string) => (c.startsWith("var(") ? "#d6d3d1" : c)

/**
 * Chapter 1: the camera travels along the real scar, staple by staple. Each stop is a moment of the story,
 * then an experience or a project, in the order they happened. The photo is the inverted version,
 * desaturated, and softened by default (a button shows it sharp).
 */
export default function ScarJourney({ photo, stops, filters, filter, onFilter, kicker, title, intro, hint, openLabel, offset, theme, softLabel, sharpLabel, tabsLabel }: Props) {
  const N = stops.length
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<{ vw: number; vh: number } | null>(null)
  const [active, setActive] = useState(-1)
  const [soft, setSoft] = useState(true)

  useEffect(() => {
    try {
      if (localStorage.getItem("scar-soft") === "0") setSoft(false)
    } catch {}
  }, [])
  const toggleSoft = () => {
    const next = !soft
    setSoft(next)
    try {
      localStorage.setItem("scar-soft", next ? "1" : "0")
    } catch {}
  }

  // size of the pinned viewport
  useEffect(() => {
    const el = stickyRef.current
    if (!el) return
    const update = () => setBox({ vw: el.clientWidth, vh: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const desktop = box ? box.vw >= 1024 : true
  const sw = box ? (desktop ? box.vw : box.vw * 1.6) : 0
  const sh = sw * 0.75

  // one stop per step, evenly spread along the real scar
  const spots = useMemo(() => {
    const dense = spline(SCAR_PTS)
    let total = 0
    const cum = dense.map((p, i) => {
      if (i > 0) total += Math.hypot(p.x - dense[i - 1].x, p.y - dense[i - 1].y)
      return total
    })
    return Array.from({ length: N }, (_, k) => {
      const target = total * (0.02 + (0.96 * k) / Math.max(1, N - 1))
      let i = 1
      while (i < dense.length - 1 && cum[i] < target) i++
      return { x: Math.round(dense[i].x * 10) / 10, y: Math.round(dense[i].y * 10) / 10 }
    })
  }, [N])

  // ---- the camera ----
  useEffect(() => {
    const section = sectionRef.current
    if (!section || !box || !sw || N < 2) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const cam = { px: SC.cx * sw, py: SC.cy * sh, fx: box.vw / 2, fy: box.vh / 2, s: 1 }
    let raf = 0
    let running = false
    let last = -2

    const tick = () => {
      const stage = stageRef.current
      const sticky = stickyRef.current
      if (!stage || !sticky) return
      const rect = section.getBoundingClientRect()
      const total = rect.height - sticky.offsetHeight
      const p = clamp((offset - rect.top) / total)
      const zoom = desktop ? 3.4 : 3.0

      const f = clamp((p - INTRO) / (OUTRO - INTRO)) * (N - 1)
      const i0 = Math.floor(f)
      const i1 = Math.min(N - 1, i0 + 1)
      const k = smooth(f - i0)
      const wp = (q: { x: number; y: number }) => ({ x: (q.x / 900) * sw, y: (q.y / 675) * sh })
      const a = wp(spots[i0])
      const b = wp(spots[i1])
      const px = lerp(a.x, b.x, k)
      const py = lerp(a.y, b.y, k)

      let s = zoom
      if (p < INTRO) s = lerp(1, zoom, smooth(p / INTRO))
      else if (p > OUTRO) s = lerp(zoom, 1, smooth((p - OUTRO) / (1 - OUTRO)))
      const w = clamp((s - 1) / (zoom - 1))

      const target = {
        px: lerp(SC.cx * sw, px, w),
        py: lerp(SC.cy * sh, py, w),
        fx: lerp(box.vw / 2, desktop ? box.vw * 0.34 : box.vw / 2, w),
        fy: lerp(box.vh / 2, desktop ? box.vh / 2 : box.vh * 0.34, w),
        s,
      }
      const e = reduce ? 1 : 0.14
      ;(Object.keys(target) as (keyof typeof target)[]).forEach((key) => {
        cam[key] = lerp(cam[key], target[key], e)
      })
      stage.style.transform = `translate(${cam.fx}px, ${cam.fy}px) scale(${cam.s}) translate(${-cam.px}px, ${-cam.py}px)`

      const next = p < INTRO * 0.5 ? -1 : Math.round(f)
      if (next !== last) {
        last = next
        setActive(next)
      }
    }
    const loop = () => {
      tick()
      raf = requestAnimationFrame(loop)
    }
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
  }, [box, sw, sh, spots, N, offset, desktop])

  const goTo = (index: number) => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    if (!section || !sticky) return
    const total = section.offsetHeight - sticky.offsetHeight
    const p = INTRO + (index / Math.max(1, N - 1)) * (OUTRO - INTRO)
    const top = window.scrollY + section.getBoundingClientRect().top - offset + p * total
    window.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
  }

  const current = active >= 0 ? stops[Math.min(active, N - 1)] : null
  const imgFilter = `grayscale(1) ${theme === "dark" ? "brightness(.72) contrast(1.12)" : "contrast(1.05)"} ${soft ? "blur(1.15px)" : ""}`

  return (
    <section id="origine" ref={sectionRef} className="relative" style={{ height: `${(N + 2) * 62}vh` }}>
      {/* everything as real text and links, for screen readers and search engines */}
      <ol className="sr-only">
        {stops.map((s) => (
          <li key={s.id}>
            {s.when} — {s.kindLabel} : {s.href ? <Link href={s.href}>{s.title}</Link> : s.title}. {s.sub ? `${s.sub}. ` : ""}
            {s.text}
          </li>
        ))}
      </ol>

      <div ref={stickyRef} className="sticky overflow-hidden bg-background [contain:paint]" style={{ top: offset, height: `calc(100svh - ${offset}px)` }}>
        {/* the real scar */}
        <div ref={stageRef} aria-hidden="true" className="absolute left-0 top-0" style={{ width: sw, height: sh, transformOrigin: "0 0" }}>
          {sw > 0 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" loading="lazy" decoding="async" draggable={false} className="absolute inset-0 h-full w-full select-none" style={{ filter: imgFilter, opacity: theme === "dark" ? 0.92 : 0.88, transition: "filter .5s" }} />
          )}
          {/* a ring on the staple that carries each step */}
          <svg viewBox="0 0 900 675" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }}>
            {spots.map((st, i) => {
              const c = ringColor(stops[i].color)
              const on = i === active
              return (
                <g key={stops[i].id} transform={`translate(${st.x} ${st.y})`}>
                  <circle r={on ? 9 : 4.5} fill="none" stroke={c} strokeWidth={on ? 1.5 : 0.9} opacity={on ? 0.95 : 0.5} style={{ transition: "all .4s" }} />
                  {on && (
                    <circle r="9" fill="none" stroke={c} strokeWidth="0.8" opacity="0.7">
                      <animate attributeName="r" values="9;17;9" dur="2.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0;0.7" dur="2.6s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* blend the photo into the page */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 35%, var(--background) 100%)" }} />
        {desktop ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[58%]" style={{ background: "linear-gradient(to left, var(--background) 30%, color-mix(in srgb, var(--background) 70%, transparent) 62%, transparent)" }} />
        ) : (
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[64%]" style={{ background: "linear-gradient(to top, var(--background) 36%, color-mix(in srgb, var(--background) 75%, transparent) 68%, transparent)" }} />
        )}

        {/* filters: which steps does the camera visit */}
        <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-2" role="group" aria-label={tabsLabel}>
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => onFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`rounded-full border px-3 py-1 font-mono text-[11px] backdrop-blur transition-colors ${filter === f.key ? "border-foreground bg-foreground text-background" : "border-border bg-background/60 text-muted-foreground hover:text-foreground"}`}
            >
              {f.label} <span className="opacity-60">{f.count}</span>
            </button>
          ))}
        </div>

        {/* soften / show */}
        <button
          type="button"
          onClick={toggleSoft}
          aria-pressed={!soft}
          aria-label={soft ? sharpLabel : softLabel}
          className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 font-mono text-[11px] text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
        >
          {soft ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{soft ? sharpLabel : softLabel}</span>
        </button>

        {/* intro */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[13%] z-10 px-6 text-center transition-all duration-700"
          style={{ opacity: active === -1 ? 1 : 0, transform: active === -1 ? "none" : "translateY(-14px)" }}
          aria-hidden={active !== -1}
        >
          <div className="font-mono text-xs tracking-[0.2em] text-muted-foreground sm:text-sm">{kicker}</div>
          <h2 className="font-editorial mx-auto mt-4 max-w-4xl text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">{title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{intro}</p>
          <p className="mt-6 font-mono text-xs tracking-[0.2em] text-muted-foreground">{hint.toUpperCase()}</p>
        </div>

        {/* the step, written on the scene (no box) */}
        {current && (
          <>
            {desktop && <div aria-hidden="true" className="pointer-events-none absolute z-10 h-px" style={{ left: "calc(34% + 40px)", top: "50%", width: "21%", background: `linear-gradient(to right, ${ringColor(current.color)}, transparent)` }} />}
            <div
              key={current.id}
              className="animate-fade-in-up absolute z-10 inset-x-6 bottom-9 lg:inset-x-auto lg:bottom-auto lg:right-[5vw] lg:top-[54%] lg:w-[min(30rem,36vw)] lg:-translate-y-1/2"
            >
              {current.image && desktop && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.image} alt="" loading="lazy" className="mb-5 h-32 w-full rounded-md border border-border object-cover object-top" />
              )}
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-xs tracking-wider">
                <span className="text-base font-light tracking-normal text-muted-foreground">{current.when}</span>
                <span style={{ color: ringColor(current.color) }}>{current.kindLabel.toUpperCase()}</span>
                {current.star && <span className="text-amber-500">★ {current.star.toUpperCase()}</span>}
              </div>
              <h3 className="font-editorial mt-3 text-3xl leading-[1.05] sm:text-4xl lg:text-5xl">{current.title}</h3>
              {current.sub && <p className="mt-2 text-sm text-muted-foreground">{current.sub}</p>}
              {current.text && <p className="mt-3 line-clamp-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg lg:line-clamp-5">{current.text}</p>}
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {current.href && (
                  <Link href={current.href} className="inline-flex items-center gap-2 transition-all duration-300 hover:gap-3">
                    {openLabel} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                {current.extra && (
                  <Link href={current.extra.href} className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    {current.extra.label}
                  </Link>
                )}
              </div>
            </div>
          </>
        )}

        {/* the stops, clickable */}
        <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center px-6" role="tablist" aria-label={tabsLabel}>
          <div className="flex w-full max-w-xl items-center gap-[3px]">
            {stops.map((s, i) => (
              <button key={s.id} type="button" onClick={() => goTo(i)} aria-label={`${s.when} — ${s.title}`} aria-current={i === active} className="group flex h-4 flex-1 items-center">
                <span
                  className="block h-px w-full transition-all duration-300 group-hover:h-[3px]"
                  style={{ background: i === active ? ringColor(s.color) : i < active ? "var(--muted-foreground)" : "var(--border)", height: i === active ? 3 : undefined }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
