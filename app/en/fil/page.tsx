import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import FilExplorer from "@/components/FilExplorer"
import { buildFil, FIL_KIND } from "@/lib/fil"

// Test page: compare with the current home before deciding. Not indexed, not linked.
export const metadata: Metadata = {
  title: "The thread | Gabriel Bigot",
  robots: { index: false, follow: false },
}

export default function FilPage() {
  const items = buildFil("en")
  const years = Array.from(new Set(items.map((i) => i.year))).reverse()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto max-w-6xl px-6 py-4 sm:px-8">
          <Link href="/en" className="inline-flex items-center gap-2 text-muted-foreground transition-colors duration-300 hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to portfolio</span>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl space-y-16 px-6 py-12 sm:px-8 sm:py-20">
        <header className="space-y-5">
          <div className="font-mono text-sm tracking-wider text-muted-foreground">THE THREAD</div>
          <h1 className="font-editorial text-4xl leading-[1.02] sm:text-5xl lg:text-6xl">My whole journey, staple by staple</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">Career, projects and essays, in the order they happened. Each staple opens the matching item; the classic list is right below.</p>
        </header>

        <FilExplorer items={items} locale="en" />

        <section className="space-y-8 border-t border-border pt-12" aria-label="List view">
          <h2 className="text-2xl font-light sm:text-3xl">List view</h2>
          {years.map((year) => (
            <div key={year} className="grid gap-3 sm:grid-cols-[6rem_1fr]">
              <div className="font-mono text-sm text-muted-foreground">{year}</div>
              <ul className="space-y-2">
                {items
                  .filter((i) => i.year === year)
                  .reverse()
                  .map((i) => (
                    <li key={i.id} className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-mono text-[11px]" style={{ color: FIL_KIND[i.kind].color }}>
                        {FIL_KIND[i.kind].label["en"].toUpperCase()}
                      </span>
                      <Link href={i.href} className="hover:underline underline-offset-4">
                        {i.label}
                      </Link>
                      <span className="text-sm text-muted-foreground">{i.when}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
