import Link from "next/link"
import { ArrowLeft, Award, Heart, Zap, TrendingUp, Target, Medal } from "lucide-react"
import { getPersonalInfo, getTimeline, getAchievements, getInterests } from "@/lib/portfolio-data"

export default async function AboutPage() {
  // Fetch data from Notion with fallback to local data
  const personalInfo = await getPersonalInfo()
  const timeline = await getTimeline()
  const achievements = await getAchievements()
  const interests = await getInterests()
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
        {/* Hero Section */}
        <header className="space-y-8 sm:space-y-12 pb-16 sm:pb-24">
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground font-mono tracking-wider">À PROPOS</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight max-w-4xl">
              De la résilience sportive à l'innovation technologique
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
              Mon parcours est marqué par la persévérance, l'adaptation et la capacité à transformer
              les obstacles en opportunités.
            </p>
          </div>
        </header>

        {/* Story Section */}
        <section className="pb-16 sm:pb-24 space-y-12">
          <h2 className="text-3xl sm:text-4xl font-light">Mon histoire</h2>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-medium">Une passion précoce pour le hockey</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Depuis l'âge de 3-4 ans, le hockey sur gazon a été bien plus qu'un sport pour moi :
                  une école de vie. Au TAC Hockey (Le Touquet Paris-Plage), j'ai appris la discipline,
                  le travail d'équipe et la persévérance.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Le point culminant de ma carrière junior : <strong>capitaine et vice-champion de
                  France en salle avec l'équipe départementale en 2016</strong>, le meilleur résultat
                  de l'histoire du département. Une fierté qui porte encore aujourd'hui mes ambitions.
                </p>
              </div>

              <div className="p-6 border border-border rounded-lg bg-foreground/[0.02]">
                <div className="flex items-start gap-4">
                  <Medal className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <div className="font-medium">Vice-Champion de France 2016</div>
                    <div className="text-sm text-muted-foreground">
                      Hockey en salle • Équipe départementale • Capitaine
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-medium">L'épreuve qui forge</h3>
                <p className="text-muted-foreground leading-relaxed">
                  En classe de 3e, une première luxation de rotule a changé ma trajectoire. La cause :
                  une gorge trochléenne peu creusée rendant ma rotule instable. S'en sont suivies des
                  récidives, de la kinésithérapie intensive et le port permanent d'une genouillère.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Le coup le plus dur est venu en Terminale : opération au genou, puis infection
                  post-opératoire nécessitant une <strong>ré-opération d'urgence à Berck-sur-Mer</strong>.
                  2-3 semaines d'hospitalisation, traitements lourds, rééducation renforcée.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Résultat : deux vis restées sous le genou, une appréhension des impacts, un jeu à
                  réinventer. Mais surtout : <strong>une résilience à toute épreuve</strong> et la
                  certitude qu'aucun obstacle n'est insurmontable.
                </p>
              </div>

              <div className="p-6 border border-amber-500/20 rounded-lg bg-amber-500/5">
                <div className="flex items-start gap-4">
                  <Heart className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <div className="font-medium text-amber-500">Résilience</div>
                    <div className="text-sm text-muted-foreground">
                      "Ce qui ne me tue pas me rend plus fort" - Chaque épreuve médicale a renforcé
                      ma détermination à atteindre mes objectifs.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="pb-16 sm:pb-24">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-light">Parcours chronologique</h2>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Des premiers pas au hockey jusqu'à la passion pour l'IA : un voyage de croissance continue.
              </p>
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[15px] top-8 bottom-8 w-px bg-border hidden sm:block"></div>

              <div className="space-y-0">
                {timeline.map((item, index) => (
                  <div key={index} className="relative pb-12 last:pb-0">
                    {/* Dot */}
                    <div
                      className={`absolute left-0 top-2 w-8 h-8 rounded-full border-2 flex items-center justify-center hidden sm:flex ${
                        item.type === "achievement"
                          ? "border-amber-500 bg-amber-500/10"
                          : item.type === "work"
                            ? "border-blue-500 bg-blue-500/10"
                            : item.type === "education"
                              ? "border-green-500 bg-green-500/10"
                              : item.type === "life"
                                ? "border-purple-500 bg-purple-500/10"
                                : "border-border bg-background"
                      }`}
                    >
                      {item.type === "achievement" && <Award className="w-4 h-4 text-amber-500" />}
                      {item.type === "work" && <Zap className="w-4 h-4 text-blue-500" />}
                      {item.type === "education" && <Target className="w-4 h-4 text-green-500" />}
                      {item.type === "life" && <Heart className="w-4 h-4 text-purple-500" />}
                      {item.type === "milestone" && <TrendingUp className="w-4 h-4 text-foreground" />}
                    </div>

                    {/* Content */}
                    <div className="sm:pl-16 grid grid-cols-12 gap-4 sm:gap-8">
                      <div className="col-span-12 sm:col-span-2">
                        <div className="text-lg sm:text-xl font-light text-muted-foreground">
                          {item.year}
                        </div>
                      </div>

                      <div className="col-span-12 sm:col-span-10">
                        <div className="space-y-2 p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-colors duration-300">
                          <h3 className="text-lg font-medium">{item.title}</h3>
                          <p className="text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="pb-16 sm:pb-24">
          <div className="space-y-12">
            <h2 className="text-3xl sm:text-4xl font-light">Réalisations marquantes</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center">
                        <Award className="w-6 h-6 text-foreground" />
                      </div>
                      <div className="text-sm text-muted-foreground">{achievement.date}</div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.organization}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interests Section */}
        <section className="pb-16 sm:pb-24">
          <div className="space-y-12">
            <h2 className="text-3xl sm:text-4xl font-light">Centres d'intérêt</h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {interests.map((interest, index) => (
                <div
                  key={index}
                  className="p-8 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="text-4xl">{interest.icon}</div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-medium">{interest.name}</h3>
                      <p className="text-muted-foreground leading-relaxed">{interest.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="pb-16 sm:pb-24">
          <div className="space-y-12">
            <h2 className="text-3xl sm:text-4xl font-light">Mes valeurs</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium">Résilience</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Transformer chaque obstacle en opportunité de croissance. Les épreuves médicales
                    m'ont appris à ne jamais abandonner.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center">
                  <Award className="w-6 h-6 text-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium">Excellence</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Viser l'excellence dans tout ce que j'entreprends, du sport de haut niveau à
                    l'automatisation IA.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium">Innovation</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Chercher constamment de nouvelles façons d'optimiser et d'automatiser les processus
                    pour créer de la valeur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pt-16 sm:pt-24 border-t border-border">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-light">Travaillons ensemble</h2>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Mon parcours m'a appris que rien n'est impossible avec de la détermination et du travail.
              Discutons de votre projet d'automatisation IA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#connect"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all duration-300"
              >
                <span>Me contacter</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
              >
                <span>Voir mes projets</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 mt-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 Gabriel Bigot • Développeur d'Automatisations IA
          </div>
        </div>
      </footer>
    </div>
  )
}
