"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  date: string
  readingTime: string
  category: string
  published: boolean
}

export default function BlogPageClient({ blogPosts }: { blogPosts: BlogPost[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const categories = useMemo(() => Array.from(new Set(blogPosts.map((post) => post.category))), [blogPosts])
  const visiblePosts = selectedCategory ? blogPosts.filter((post) => post.category === selectedCategory) : blogPosts
  const featured = visiblePosts.find((post) => post.published) ?? visiblePosts[0]
  const remaining = visiblePosts.filter((post) => post.id !== featured?.id)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 py-8 sm:py-12">
        <nav className="flex items-center justify-between border-b border-border pb-6">
          <Link href="/portfolio" className="text-sm text-muted-foreground hover:text-accent transition-colors">← Portfolio</Link>
          <span className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">Gabriel Bigot / Journal</span>
        </nav>

        <header className="max-w-4xl pt-16 sm:pt-24 pb-14 sm:pb-20">
          <div className="font-mono text-xs tracking-[0.18em] text-accent uppercase mb-6">Essais / IA, travail, apprentissage</div>
          <h1 className="font-editorial text-5xl sm:text-7xl lg:text-8xl leading-[0.92]">Essais</h1>
          <p className="mt-8 max-w-2xl text-xl sm:text-2xl leading-relaxed text-muted-foreground">
            Des idées en cours de construction sur l&apos;intelligence artificielle, le travail et la manière de rester pleinement humain dans un monde qui s&apos;automatise.
          </p>
        </header>

        <div className="flex flex-wrap gap-x-6 gap-y-3 border-y border-border py-4 text-sm">
          <button onClick={() => setSelectedCategory(null)} className={`transition-colors ${selectedCategory === null ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}>Tous <span className="font-mono text-xs">({blogPosts.length})</span></button>
          {categories.map((category) => (
            <button key={category} onClick={() => setSelectedCategory(category)} className={`transition-colors ${selectedCategory === category ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}>{category}</button>
          ))}
        </div>

        {featured && (
          <section className="grid lg:grid-cols-12 gap-8 lg:gap-16 py-14 sm:py-20 border-b border-border">
            <div className="lg:col-span-3 font-mono text-xs tracking-[0.16em] uppercase text-muted-foreground">À la une<br /><span className="text-accent">{featured.date}</span></div>
            <article className="lg:col-span-9 max-w-3xl">
              <div className="mb-5 text-xs font-mono tracking-[0.14em] text-muted-foreground uppercase">{featured.category} / {featured.readingTime}</div>
              <h2 className="font-editorial text-4xl sm:text-6xl leading-[1.02]">{featured.title}</h2>
              <p className="mt-7 text-xl leading-relaxed text-muted-foreground">{featured.excerpt}</p>
              {featured.published ? <Link href={`/blog/${featured.slug}`} className="inline-flex mt-8 items-center gap-3 border-b border-accent pb-1 text-sm hover:text-accent transition-colors">Lire l&apos;essai <span aria-hidden="true">→</span></Link> : <span className="inline-block mt-8 text-sm text-muted-foreground">En cours d&apos;écriture</span>}
            </article>
          </section>
        )}

        <section className="divide-y divide-border pb-20">
          {remaining.map((post, index) => (
            <article key={post.id} className="grid md:grid-cols-12 gap-4 md:gap-8 py-8 sm:py-10 group">
              <div className="md:col-span-2 flex md:block justify-between font-mono text-xs text-muted-foreground"><span>{String(index + 2).padStart(2, "0")}</span><span>{post.date}</span></div>
              <div className="md:col-span-7">
                <div className="font-mono text-xs tracking-[0.14em] text-accent uppercase mb-3">{post.category} / {post.readingTime}</div>
                {post.published ? <Link href={`/blog/${post.slug}`}><h2 className="font-editorial text-3xl sm:text-4xl leading-tight group-hover:text-accent transition-colors">{post.title}</h2></Link> : <h2 className="font-editorial text-3xl sm:text-4xl leading-tight text-muted-foreground">{post.title}</h2>}
                <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">{post.excerpt}</p>
              </div>
              <div className="md:col-span-3 md:text-right self-start">{post.published ? <Link href={`/blog/${post.slug}`} className="text-sm text-muted-foreground hover:text-accent transition-colors">Lire →</Link> : <span className="text-sm text-muted-foreground">À venir</span>}</div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
