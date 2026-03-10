"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

type Props = {
  styles: string
  body: string
  title: string
}

// Targeted CSS overrides for dark mode — much better than filter:invert
// Uses !important to override both the newsletter's class-based and inline styles
const DARK_MODE_OVERRIDES = `
  .nwl-dark, .nwl-dark body, .nwl-dark div, .nwl-dark table,
  .nwl-dark section, .nwl-dark article, .nwl-dark header,
  .nwl-dark footer, .nwl-dark main, .nwl-dark aside,
  .nwl-dark td, .nwl-dark th, .nwl-dark tr {
    background-color: #09090b !important;
    color: #d4d4d8 !important;
  }
  .nwl-dark h1, .nwl-dark h2, .nwl-dark h3,
  .nwl-dark h4, .nwl-dark h5, .nwl-dark h6 {
    color: #ffffff !important;
  }
  .nwl-dark p, .nwl-dark li, .nwl-dark blockquote {
    color: #d4d4d8 !important;
  }
  .nwl-dark span {
    color: inherit !important;
  }
  .nwl-dark hr, .nwl-dark [style*="border"],
  .nwl-dark td, .nwl-dark th {
    border-color: #27272a !important;
  }
  .nwl-dark a {
    color: #a78bfa !important;
  }
  .nwl-dark img {
    opacity: 0.9;
  }
`

export function NewsletterViewer({ styles, body, title }: Props) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <>
      {/* Newsletter's own styles first */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {/* Dark mode overrides injected after, so they win the cascade */}
      {isDark && <style dangerouslySetInnerHTML={{ __html: DARK_MODE_OVERRIDES }} />}
      <div
        className={isDark ? "nwl-dark" : ""}
        aria-label={title}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </>
  )
}
