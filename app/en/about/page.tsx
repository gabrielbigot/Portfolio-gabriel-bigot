import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

const milestones = [
  {
    year: "2008",
    label: "Origin",
    title: "A hockey stick in my hands",
    text: "My father had played since childhood, my mother started around her twenties, and when I was three they naturally put a stick in my hands. I did not really choose the sport. It was part of my life before I even understood what that meant.",
  },
  {
    year: "Middle school",
    label: "Growth",
    title: "Talent, then responsibility",
    text: "At first I was a very bad loser. Over time, a natural ability started to show. My teammates chose me as captain unanimously, and I began training outside regular sessions. Work had joined talent.",
  },
  {
    year: "U16",
    label: "Peak",
    title: "Feeling unstoppable",
    text: "During that period I felt I could do almost anything on the field. I had started training with the first team, the dream I had carried since watching them from the sideline as a child.",
  },
  {
    year: "2019",
    label: "Setback",
    title: "The first dislocation",
    text: "A completely ordinary training session changed everything. My knee dislocated while running. The diagnosis came later: hereditary trochlear dysplasia, making my kneecap far less stable than it should be.",
  },
  {
    year: "2022",
    label: "Setback",
    title: "Surgery, infection, and recovery",
    text: "I had surgery during my final year of high school. Three weeks later, an infection led to emergency surgery and three weeks in hospital. I returned to school with treatment, rehab, and classes to catch up at the same time.",
  },
  {
    year: "2023",
    label: "Rebuild",
    title: "Rebuilding again",
    text: "I graduated, joined ESDHEM on SKEMA Business School's Lille campus, and returned to hockey. At the same time, I started building concrete automation and AI projects.",
  },
  {
    year: "2026",
    label: "Peak",
    title: "TAC returns to the Elite league",
    text: "With TAC's first team, the season ended with first place in Nationale 1 and promotion to the highest level of French hockey. Since 2019, the path had been a succession of trials. I needed it to mean something. I did not give up.",
  },
]

export const metadata = {
  title: "My story — Gabriel Bigot",
  description: "The personal story behind Gabriel Bigot's path: field hockey, injuries, resilience, and AI automation.",
}

export default function EnglishAboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-4">
          <Link href="/en/portfolio" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to portfolio</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 sm:px-8 py-12 sm:py-20">
        <header className="pb-20 sm:pb-28 border-b border-border">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-end">
            <div className="space-y-7">
              <div className="text-sm text-muted-foreground font-mono tracking-wider">MY STORY</div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
                Hold on, come back, build
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">
                My path is built around three threads: field hockey, injuries, and creating concrete solutions.
                Sport taught me teamwork. Setbacks taught me resilience. AI and development gave me a way to act.
              </p>
            </div>

            <figure className="space-y-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-foreground/[0.02]">
                <Image
                  src="/about/story/nationale-1-trophy.jpg"
                  alt="TAC team lifting the Nationale 1 trophy"
                  fill
                  priority
                  sizes="(min-width: 1024px) 520px, calc(100vw - 48px)"
                  className="object-cover"
                />
              </div>
              <figcaption className="text-sm text-muted-foreground">
                TAC Hockey, 2026. First place in Nationale 1 and promotion to the Elite league.
              </figcaption>
            </figure>
          </div>
        </header>

        <section className="py-20 sm:py-28 space-y-14">
          <div className="space-y-5">
            <h2 className="text-3xl sm:text-4xl font-light">Timeline</h2>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Not linear, not simple. A series of setbacks and returns, each one followed by rebuilding.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-[7px] top-6 bottom-6 w-px bg-border hidden sm:block" />
            <div className="space-y-0">
              {milestones.map((item) => (
                <div key={`${item.year}-${item.title}`} className="relative pb-10 last:pb-0 group">
                  <div className="absolute left-0 top-[22px] w-[15px] h-[15px] rounded-full border-2 border-background bg-amber-500/70 hidden sm:block z-10" />
                  <div className="sm:pl-10 grid lg:grid-cols-12 gap-3 sm:gap-6">
                    <div className="lg:col-span-2 pt-1">
                      <div className="text-base sm:text-lg font-light text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                        {item.year}
                      </div>
                      <div className="text-xs font-mono mt-0.5 text-amber-500/80">{item.label.toUpperCase()}</div>
                    </div>
                    <div className="lg:col-span-10">
                      <div className="p-6 sm:p-7 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300">
                        <h3 className="text-lg sm:text-xl font-medium mb-3">{item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/en/projects" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all duration-300">
              <span>View my projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/en/portfolio#connect" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300">
              <span>Contact me</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 Gabriel Bigot • AI Automation Developer
          </div>
        </div>
      </footer>
    </div>
  )
}
