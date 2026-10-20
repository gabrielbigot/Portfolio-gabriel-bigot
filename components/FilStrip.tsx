"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { FIL_KIND, type FilItem, type FilLocale } from "@/lib/fil"

const STEP = 40 // px between two staples: even spacing keeps a dense period readable

const COPY = {
  fr: { nav: "Le fil de mon parcours", prev: "Précédent sur le fil", next: "Suivant sur le fil", here: "Vous êtes ici" },
  en: { nav: "The thread of my journey", prev: "Previous on the thread", next: "Next on the thread", here: "You are here" },
}

type Tip = { item: FilItem; x: number }

/**
 * Compact chronological navigation: one line of staples, each one a real link.
 * Meant for detail pages (project, experience, essay): shows where the page sits in the story
 * and lets the reader move to the previous / next item.
 */
export default function FilStrip({ items, currentId, locale = "fr" }: { items: FilItem[]; currentId?: string; locale?: FilLocale }) {
  const copy = COPY[locale]
  const navRef = useRef<HTMLElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<Tip | null>(null)

  const index = items.findIndex((i) => i.id === currentId)
  const prev = index > 0 ? items[index - 1] : null
  const next = index >= 0 && index < items.length - 1 ? items[index + 1] : null

  // Keep the current staple centred in the strip.
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || index < 0) return
    scroller.scrollLeft = Math.max(0, index * STEP + STEP / 2 - scroller.clientWidth / 2)
  }, [index])

  const show = (item: FilItem, el: HTMLElement) => {
    const nav = navRef.current
    if (!nav) return
    const r = el.getBoundingClientRect()
    const n = nav.getBoundingClientRect()
    const half = 130
    const x = Math.min(Math.max(r.left + r.width / 2 - n.left, half), n.width - half)
    setTip({ item, x })
  }

  return (
    <nav ref={navRef} aria-label={copy.nav} className="relative border-b border-border bg-background/60" onMouseLeave={() => setTip(null)}>
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 sm:px-8 py-2">
        {prev ? (
          <Link href={prev.href} aria-label={`${copy.prev} : ${prev.label}`} className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span className="w-6 shrink-0" aria-hidden />
        )}

        <div ref={scrollerRef} className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ol className="relative flex" style={{ width: items.length * STEP }}>
            {/* the thread */}
            <li aria-hidden className="pointer-events-none absolute left-0 right-0 top-[15px] h-px bg-border" />
            {items.map((item, i) => {
              const meta = FIL_KIND[item.kind]
              const isCurrent = item.id === currentId
              const newYear = i === 0 || items[i - 1].year !== item.year
              return (
                <li key={item.id} className="relative flex flex-col items-center" style={{ width: STEP }}>
                  <Link
                    href={item.href}
                    aria-label={`${item.label} (${meta.label[locale]}, ${item.when})`}
                    aria-current={isCurrent ? "page" : undefined}
                    onMouseEnter={(e) => show(item, e.currentTarget)}
                    onFocus={(e) => show(item, e.currentTarget)}
                    onBlur={() => setTip(null)}
                    className="group flex h-[30px] w-full items-center justify-center outline-none"
                  >
                    <svg viewBox="0 0 30 14" className={`transition-transform duration-200 group-hover:scale-125 group-focus-visible:scale-125 ${isCurrent ? "scale-125" : ""}`} width="26" height="12" aria-hidden>
                      {isCurrent && <circle cx="15" cy="7" r="9" fill="none" stroke={meta.color} strokeWidth="1" opacity="0.5" />}
                      <line x1="5" y1="7" x2="25" y2="7" stroke={meta.color} strokeWidth={isCurrent ? 3 : 2.2} strokeLinecap="round" opacity={isCurrent ? 1 : 0.75} />
                      <circle cx="5" cy="7" r="2.2" className="fill-background" stroke={meta.color} strokeWidth="1.1" />
                      <circle cx="25" cy="7" r="2.2" className="fill-background" stroke={meta.color} strokeWidth="1.1" />
                    </svg>
                  </Link>
                  <span aria-hidden className="h-3 select-none font-mono text-[9px] leading-3 text-muted-foreground/70">
                    {newYear ? item.year : ""}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>

        {next ? (
          <Link href={next.href} aria-label={`${copy.next} : ${next.label}`} className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="w-6 shrink-0" aria-hidden />
        )}
      </div>

      {tip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute top-full z-40 mt-1 w-[260px] -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-background shadow-lg"
          style={{ left: tip.x }}
        >
          {tip.item.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tip.item.image} alt="" loading="lazy" className="h-24 w-full object-cover object-top" />
          )}
          <div className="space-y-1 p-3">
            <div className="flex items-center justify-between gap-3 font-mono text-[10px] tracking-wider" style={{ color: FIL_KIND[tip.item.kind].color }}>
              <span>{FIL_KIND[tip.item.kind].label[locale].toUpperCase()}</span>
              <span className="text-muted-foreground">{tip.item.when}</span>
            </div>
            <div className="text-sm leading-snug">{tip.item.label}</div>
            {tip.item.sub && <div className="text-xs text-muted-foreground">{tip.item.sub}</div>}
            {tip.item.id === currentId && <div className="text-xs text-accent">{copy.here}</div>}
          </div>
        </div>
      )}
    </nav>
  )
}
