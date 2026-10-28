"use client"

import { stripMarks } from "@/lib/studio/stega"
import { useT } from "@/components/strings-provider"
import { useState } from "react"

export default function ShareButtons({ title }: { title: string }) {
  const t = useT("component.ShareButtons")
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
      <div className="text-sm text-muted-foreground font-mono">{t("partager-cet-article")}</div>
      <div className="flex gap-3">
        <button
          onClick={handleCopyLink}
          className="px-4 py-2 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 text-sm"
        >
          {copied ? t("copie") : t("copier-le-lien")}
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(stripMarks(title))}&url=${encodeURIComponent(currentUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 text-sm"
        >{t("twitter")}</a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 text-sm"
        >{t("linkedin")}</a>
      </div>
    </div>
  )
}
