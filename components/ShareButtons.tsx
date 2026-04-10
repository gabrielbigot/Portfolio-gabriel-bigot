"use client"

import { useState } from "react"

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const currentUrl = typeof window !== "undefined" ? window.location.href : ""

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground font-mono">PARTAGER CET ARTICLE</div>
      <div className="flex gap-3">
        <button
          onClick={handleCopyLink}
          className="px-4 py-2 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 text-sm"
        >
          {copied ? "✓ Copié !" : "Copier le lien"}
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 text-sm"
        >
          Twitter
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 text-sm"
        >
          LinkedIn
        </a>
      </div>
    </div>
  )
}
