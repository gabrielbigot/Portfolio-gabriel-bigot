"use client"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const InlineEditor = dynamic(() => import("@/components/studio/InlineEditor"), { ssr: false })

/** Éditeur direct : seulement sur la copie privée (STUDIO_MODE), jamais dans /studio ni dans son aperçu intégré. */
export default function InlineEditorLoader() {
  const path = usePathname(); const [ok, setOk] = useState(false)
  useEffect(() => { setOk(window.self === window.top) }, [])
  if (!ok || path.startsWith("/studio")) return null
  return <InlineEditor />
}
