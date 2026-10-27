"use client"

import { useT } from "@/components/strings-provider"
import { useEffect, useState } from "react"

type Heading = { id: string; text: string }

export default function EssayContents({ headings: initial }: { headings: Heading[] }) {
  // studio : l'éditeur d'écriture publie les titres en direct (événement « essay-headings ») ; sinon ceux du serveur
  const [live, setLive] = useState<Heading[] | null>(null)
  useEffect(() => { const f = (e: Event) => setLive((e as CustomEvent<Heading[]>).detail); window.addEventListener("essay-headings", f); return () => window.removeEventListener("essay-headings", f) }, [])
  const headings = live ?? initial
  const t = useT("component.EssayContents")
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "")

  useEffect(() => {
    const elements = headings.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: 0 },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [headings])

  if (!headings.length) return null

  return (
    <aside className="hidden lg:block lg:col-span-3 sticky top-28 self-start min-w-0" aria-label={t("sommaire-de-l-essai")}>
      <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-muted-foreground mb-5">{t("sommaire")}</div>
      <nav className="border-l border-border">
        {headings.map((heading, index) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`relative block max-w-[16rem] py-2 pl-4 pr-2 text-sm leading-snug transition-colors duration-300 ${activeId === heading.id ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}
          >
            {activeId === heading.id && <span className="absolute -left-px top-0 bottom-0 w-px bg-accent" />}
            <span className="mr-2 font-mono text-[10px] opacity-50">{String(index + 1).padStart(2, "0")}</span>
            {heading.text}
          </a>
        ))}
      </nav>
    </aside>
  )
}
