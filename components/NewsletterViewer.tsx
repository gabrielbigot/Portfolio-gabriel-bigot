"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

type Props = {
  styles: string
  body: string
  title: string
}

// Portfolio color tokens
// Dark  : bg #09090b | foreground #fafafa | muted #a1a1aa | border #27272a
// Light : bg #ffffff | foreground #09090b | muted #71717a | border #e4e4e7

// Triple-class trick (.nwl-dark.nwl-dark.nwl-dark) gives specificity (0,3,0)
// which beats most newsletter class rules (0,1,0)–(0,2,0), combined with
// !important it overrides inline styles too.
const DARK_OVERRIDES = `
  .nwl-dark.nwl-dark.nwl-dark,
  .nwl-dark.nwl-dark.nwl-dark * {
    background-color: #09090b !important;
    background-image: none !important;
    color: #d4d4d8 !important;
    border-color: #27272a !important;
  }
  .nwl-dark.nwl-dark.nwl-dark h1,
  .nwl-dark.nwl-dark.nwl-dark h2,
  .nwl-dark.nwl-dark.nwl-dark h3,
  .nwl-dark.nwl-dark.nwl-dark h4,
  .nwl-dark.nwl-dark.nwl-dark h5,
  .nwl-dark.nwl-dark.nwl-dark h6 {
    color: #fafafa !important;
  }
  .nwl-dark.nwl-dark.nwl-dark a {
    color: #a78bfa !important;
  }
  .nwl-dark.nwl-dark.nwl-dark img {
    opacity: 0.85;
    filter: brightness(0.9);
  }
`

export function NewsletterViewer({ styles, body, title }: Props) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <>
      {/* Newsletter structural styles (body/html rules already stripped server-side) */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {/* Dark mode color overrides injected after — wins the cascade */}
      {isDark && <style dangerouslySetInnerHTML={{ __html: DARK_OVERRIDES }} />}
      <div
        className={isDark ? "nwl-dark" : ""}
        aria-label={title}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </>
  )
}
