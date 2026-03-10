"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

type Props = {
  lightStyles: string
  darkStyles: string
  lightBody: string
  darkBody: string
  title: string
}

// Portfolio dark mode color tokens
const DARK_COLORS = `
  .nwl {
    background-color: #09090b;
    color: #d4d4d8;
  }
  .nwl * {
    background-color: #09090b;
    color: #d4d4d8;
    border-color: #27272a;
  }
  .nwl h1, .nwl h2, .nwl h3,
  .nwl h4, .nwl h5, .nwl h6 {
    color: #fafafa;
  }
  .nwl a {
    color: #a78bfa;
  }
  .nwl img {
    opacity: 0.85;
  }
`

export function NewsletterViewer({ lightStyles, darkStyles, lightBody, darkBody, title }: Props) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Before mount, default to light to avoid flash
  const isDark = mounted && resolvedTheme === "dark"

  const styles = isDark ? darkStyles : lightStyles
  const body = isDark ? darkBody : lightBody

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {isDark && <style dangerouslySetInnerHTML={{ __html: DARK_COLORS }} />}
      <div
        className={isDark ? "nwl" : ""}
        aria-label={title}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </>
  )
}
