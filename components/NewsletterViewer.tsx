"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

type Props = {
  styles: string
  body: string
  title: string
}

export function NewsletterViewer({ styles, body, title }: Props) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <div
      style={{
        filter: isDark ? "invert(1) hue-rotate(180deg)" : "none",
        transition: "filter 0.3s ease",
      }}
    >
      {/* Inject the newsletter's own styles, scoped to this render */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {/* Render the newsletter body */}
      <div
        aria-label={title}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  )
}
