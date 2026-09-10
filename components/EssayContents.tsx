"use client"

import { useEffect, useState } from "react"

type Heading = { id: string; text: string }

export default function EssayContents({ headings }: { headings: Heading[] }) {
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
    <aside className="hidden lg:block sticky top-28 self-start" aria-label="Sommaire de l'essai">
      <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-muted-foreground mb-5">Sommaire</div>
      <nav className="border-l border-border">
        {headings.map((heading, index) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`relative block py-2 pl-4 pr-2 text-xs leading-relaxed transition-colors duration-300 ${activeId === heading.id ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}
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
