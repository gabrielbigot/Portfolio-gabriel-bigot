"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

/**
 * Bascule clair / sombre de tout le site. Le choix est mémorisé (localStorage « theme ») et partagé avec les pages d'essai
 * (qui lisent la même clé) ; sans choix, on suit le réglage du système (script de app/layout.tsx, avant l'affichage).
 */
export default function ThemeToggle() {
  const pathname = usePathname()
  const [dark, setDark] = useState<boolean | null>(null)

  useEffect(() => {
    const read = () => {
      // même règle que le script de app/layout.tsx ; « vra-theme » est l'ancienne clé des pages d'essai
      try {
        const t = localStorage.getItem("theme") || localStorage.getItem("vra-theme")
        const next = t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches
        document.documentElement.classList.toggle("dark", next)
      } catch {
        /* stockage indisponible */
      }
      setDark(document.documentElement.classList.contains("dark"))
    }
    read()
    const onShow = (e: PageTransitionEvent) => e.persisted && read() // retour depuis le cache : le choix a pu changer sur une autre page
    window.addEventListener("pageshow", onShow)
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "theme") return
      const next = e.newValue === "dark"
      document.documentElement.classList.toggle("dark", next)
      setDark(next)
    }
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("pageshow", onShow)
    }
  }, [])

  if (dark === null || pathname.startsWith("/studio")) return null

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark")
    document.documentElement.classList.toggle("dark", next)
    try {
      localStorage.setItem("theme", next ? "dark" : "light")
      localStorage.setItem("vra-theme", next ? "dark" : "light") // même choix pour les pages d'essai
    } catch {
      /* stockage indisponible : le choix vaut pour cette page seulement */
    }
    setDark(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      className="fixed right-4 top-3 z-[60] rounded-md bg-background/90 px-2 py-1 text-xs text-muted-foreground underline decoration-border underline-offset-4 backdrop-blur transition-colors hover:text-foreground hover:decoration-foreground"
    >
      Thème clair / sombre
    </button>
  )
}
