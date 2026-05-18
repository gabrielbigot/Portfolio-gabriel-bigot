import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ExternalLink, Medal, Target, Trophy, Users } from "lucide-react"

const storyPhotos = [
  {
    src: "/about/story/hockey-child-match.jpg",
    title: "Les premiers matchs",
    text: "Le hockey est entré très tôt dans ma vie. Ce n'était pas une activité à côté du reste, c'était le cadre dans lequel j'ai appris à écouter, répéter, progresser et trouver ma place dans un collectif.",
  },
  {
    src: "/about/story/coach-talk.jpg",
    title: "Écouter avant d'agir",
    text: "Cette photo résume bien une chose que le sport m'a donnée jeune : l'attention. Comprendre une consigne, accepter un rôle, se concentrer sur le détail qui change une action.",
  },
  {
    src: "/about/story/cross-podium.jpg",
    title: "Représenter son collège",
    text: "Le cross m'a appris une autre forme d'effort : plus solitaire, plus brut. Représenter mon collège en compétition départementale m'a donné le goût des échéances où il faut répondre présent.",
  },
  {
    src: "/about/story/hockey-young-player.jpg",
    title: "Grandir sur le terrain",
    text: "Les années de formation au TAC ont construit mon rapport au travail : répéter les gestes, accepter la concurrence, revenir à l'entraînement même quand la progression paraît lente.",
  },
  {
    src: "/about/story/coaching-with-brace.jpg",
    title: "Transmettre malgré tout",
    text: "Même quand je ne pouvais pas jouer normalement, je restais au bord du terrain. Coacher des plus jeunes m'a appris à expliquer simplement, à guider, à transformer une contrainte en responsabilité.",
  },
  {
    src: "/about/story/nationale-1-trophy.jpg",
    title: "Nationale 1, puis l'Élite",
    text: "En 2026, le TAC termine 1er de Nationale 1 et retrouve l'Élite, le plus haut niveau français. Une saison dominée de bout en bout, et un trophée qui raconte autant le collectif que le résultat.",
  },
]

const milestones = [
  {
    year: "2008",
    title: "Un stick dans les mains",
    text: "Mes parents m'ont transmis le hockey très tôt. J'ai grandi au bord du terrain du Touquet, dans un club où l'on apprend vite que le sport est une affaire de fidélité, de gestes répétés et d'équipe.",
  },
  {
    year: "Collège",
    title: "Hockey, cross et premières responsabilités",
    text: "Le hockey me structure, le cross me révèle un goût de l'effort individuel, et les compétitions scolaires m'apprennent à représenter quelque chose de plus grand que moi.",
  },
  {
    year: "Lycée",
    title: "Continuer quand les conditions changent",
    text: "L'internat, les études et quelques blessures m'obligent à adapter mon rythme. Je parle peu du médical ici : ce qui compte, c'est ce que cette période m'a appris sur la discipline et la constance.",
  },
  {
    year: "2023",
    title: "ESDHEM, Lille et l'IA",
    text: "J'arrive à Lille en économie-gestion et je commence à construire des projets concrets autour de l'automatisation, de l'IA et des outils métier.",
  },
  {
    year: "2026",
    title: "Le TAC retrouve l'Élite",
    text: "L'équipe première termine 1ère de Nationale 1, obtient la montée en Élite et signe une saison historique : 18 matchs, 16 victoires, 100 buts inscrits et la meilleure défense du championnat.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au portfolio</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 sm:px-8 py-12 sm:py-20">
        <header className="pb-16 sm:pb-24 border-b border-border">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-end">
            <div className="space-y-7">
              <div className="text-sm text-muted-foreground font-mono tracking-wider">MON HISTOIRE</div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight max-w-4xl">
                Grandir par le sport, construire par la technologie
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
                Mon parcours tient en trois fils : le hockey, l'effort et la construction de solutions concrètes.
                Le terrain m'a appris le collectif. L'IA et le développement m'ont donné un moyen d'agir.
              </p>
            </div>

            <figure className="space-y-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-foreground/[0.02]">
                <Image
                  src="/about/story/nationale-1-trophy.jpg"
                  alt="L'équipe du TAC soulevant le trophée de Nationale 1"
                  fill
                  priority
                  sizes="(min-width: 1024px) 520px, calc(100vw - 48px)"
                  className="object-cover"
                />
              </div>
              <figcaption className="text-sm text-muted-foreground">
                TAC Hockey, 2026. 1ère place de Nationale 1 et retour en Élite.
              </figcaption>
            </figure>
          </div>
        </header>

        <section className="py-16 sm:py-24 border-b border-border">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Trophy className="w-7 h-7 text-amber-500" />
              <h2 className="text-2xl font-light">Une saison historique</h2>
              <p className="text-muted-foreground leading-relaxed">
                En 2026, le TAC domine la Nationale 1 de bout en bout et retrouve l'Élite du hockey français,
                presque dix ans après sa dernière présence à ce niveau.
              </p>
            </div>

            <div className="space-y-4">
              <Medal className="w-7 h-7 text-amber-500" />
              <h2 className="text-2xl font-light">Des chiffres qui parlent</h2>
              <p className="text-muted-foreground leading-relaxed">
                18 matchs, 16 victoires, 100 buts marqués, 21 encaissés, meilleure défense et une différence
                de buts très largement supérieure à celle du poursuivant.
              </p>
            </div>

            <div className="space-y-4">
              <Users className="w-7 h-7 text-amber-500" />
              <h2 className="text-2xl font-light">Le collectif avant tout</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cette montée raconte un groupe, un club et une culture. C'est ce même réflexe collectif que je
                retrouve aujourd'hui dans mes projets : comprendre les besoins, livrer utile, rendre autonome.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <a
              href="https://www.nordlittoral.fr/284893/article/2026-05-07/hockey-sur-gazon-le-tac-retrouve-l-elite-et-s-offre-une-saison-historique"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Article Nord Littoral sur la montée du TAC</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        <section className="py-16 sm:py-24 border-b border-border">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16">
            <div className="space-y-5">
              <h2 className="text-3xl sm:text-4xl font-light">Ce que le terrain m'a appris</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Je ne veux pas raconter une histoire héroïque ni dramatiser les obstacles. Ce qui m'intéresse,
                c'est la trace concrète que le sport laisse dans une façon de travailler.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Être sérieux à l'entraînement, écouter un coach, revenir après une période compliquée,
                transmettre à des plus jeunes, accepter un rôle dans une équipe : ce sont des habitudes.
                Aujourd'hui, je les retrouve dans mes projets d'automatisation et d'IA.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {storyPhotos.slice(0, 4).map((photo) => (
                <figure key={photo.src} className="space-y-3">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-foreground/[0.02]">
                    <Image
                      src={photo.src}
                      alt={photo.title}
                      fill
                      sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, calc(100vw - 48px)"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="space-y-1">
                    <div className="text-sm font-medium">{photo.title}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{photo.text}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 border-b border-border">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-light">Quelques repères</h2>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Une chronologie volontairement simple : assez de contexte pour comprendre le parcours,
                sans transformer cette page en récit médical.
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-[15px] top-8 bottom-8 w-px bg-border hidden sm:block" />
              <div className="space-y-0">
                {milestones.map((item) => (
                  <div key={`${item.year}-${item.title}`} className="relative pb-12 last:pb-0">
                    <div className="absolute left-0 top-2 w-8 h-8 rounded-full border-2 border-foreground/20 bg-background hidden sm:flex items-center justify-center">
                      <Target className="w-4 h-4 text-foreground/70" />
                    </div>
                    <div className="sm:pl-16 grid grid-cols-12 gap-4 sm:gap-8">
                      <div className="col-span-12 sm:col-span-2">
                        <div className="text-lg sm:text-xl font-light text-muted-foreground">{item.year}</div>
                      </div>
                      <div className="col-span-12 sm:col-span-10">
                        <div className="space-y-2 p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-colors duration-300">
                          <h3 className="text-lg font-medium">{item.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 border-b border-border">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <figure className="space-y-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-foreground/[0.02]">
                <Image
                  src="/about/story/coaching-with-brace.jpg"
                  alt="Gabriel Bigot coachant des enfants au hockey"
                  fill
                  sizes="(min-width: 1024px) 520px, calc(100vw - 48px)"
                  className="object-cover"
                />
              </div>
              <figcaption className="text-sm text-muted-foreground">
                Coacher, c'est apprendre à formuler clairement une idée pour qu'elle devienne actionnable.
              </figcaption>
            </figure>

            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-light">De la transmission au produit</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Coacher des enfants m'a marqué plus que je ne l'imaginais. Pour aider quelqu'un à progresser,
                il ne suffit pas de savoir faire. Il faut décomposer, expliquer, observer, corriger sans décourager.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                C'est exactement ce que j'essaie de faire dans mes livrables : construire des outils efficaces,
                mais aussi les rendre compréhensibles. Une automatisation utile est une automatisation que le client
                sait utiliser, maintenir et s'approprier.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 border border-border rounded-lg">
                  <div className="text-sm text-muted-foreground font-mono mb-2">SPORT</div>
                  <div className="text-lg font-medium">Écouter, répéter, progresser</div>
                </div>
                <div className="p-5 border border-border rounded-lg">
                  <div className="text-sm text-muted-foreground font-mono mb-2">TECH</div>
                  <div className="text-lg font-medium">Comprendre, construire, documenter</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-light">La suite</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Aujourd'hui, mon énergie va vers les projets qui relient business et technologie :
                automatisations métier, applications IA, outils de productivité, documentation claire.
                Le point commun reste le même : créer de la valeur mesurable, pas seulement du code.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Le hockey m'a appris à tenir dans la durée. L'IA m'a donné un terrain d'expression.
                Mon portfolio est le lieu où ces deux trajectoires se rejoignent.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all duration-300"
                >
                  <span>Voir mes projets</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/#connect"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
                >
                  <span>Me contacter</span>
                </Link>
              </div>
            </div>

            <figure className="space-y-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-foreground/[0.02]">
                <Image
                  src="/about/story/hockey-young-player.jpg"
                  alt="Gabriel Bigot jeune sur un terrain de hockey"
                  fill
                  sizes="(min-width: 1024px) 540px, calc(100vw - 48px)"
                  className="object-cover"
                />
              </div>
              <figcaption className="text-sm text-muted-foreground">
                Le terrain comme point de départ, la construction comme trajectoire.
              </figcaption>
            </figure>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 Gabriel Bigot • Développeur d'Automatisations IA
          </div>
        </div>
      </footer>
    </div>
  )
}
