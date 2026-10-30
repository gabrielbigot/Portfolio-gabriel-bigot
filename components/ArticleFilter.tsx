"use client"

import { useEffect, useState } from "react"

type Kind = "all" | "essai" | "article"

/**
 * Filtre « Tout · Essais · Articles » de la liste. La page est rendue en entier côté serveur (sections `data-kind`) ;
 * le filtre ne fait que masquer l'autre type. Il n'apparaît que si les deux types existent. Un lien `#essais` ou `#articles` présélectionne.
 */
export default function ArticleFilter({ essais, articles, labels, children }: { essais: number; articles: number; labels: { all: string; essai: string; article: string }; children: React.ReactNode }) {
  const [filter, setFilter] = useState<Kind>("all")

  useEffect(() => {
    if (window.location.hash === "#essais") setFilter("essai")
    if (window.location.hash === "#articles") setFilter("article")
  }, [])

  const both = essais > 0 && articles > 0
  const items: { key: Kind; label: string; count: number }[] = [
    { key: "all", label: labels.all, count: essais + articles },
    { key: "essai", label: labels.essai, count: essais },
    { key: "article", label: labels.article, count: articles },
  ]

  return (
    <div data-filter={filter} className="[&[data-filter=essai]_section[data-kind=article]]:hidden [&[data-filter=article]_section[data-kind=essai]]:hidden">
      {both && (
        <div role="group" aria-label="Type" className="mb-10 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
          {items.map((it) => (
            <button
              key={it.key}
              type="button"
              aria-pressed={filter === it.key}
              onClick={() => setFilter(it.key)}
              className={`underline underline-offset-[6px] transition-colors duration-300 ${filter === it.key ? "decoration-foreground" : "decoration-transparent text-muted-foreground hover:decoration-border"}`}
            >
              {it.label} <span className="font-mono text-xs text-muted-foreground">{it.count}</span>
            </button>
          ))}
        </div>
      )}
      {children}
    </div>
  )
}
