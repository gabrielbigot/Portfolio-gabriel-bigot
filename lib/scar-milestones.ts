export type ScarKind = "origin" | "rise" | "peak" | "rupture" | "rebuild" | "build"
export type ScarLocale = "fr" | "en"

export type ScarMilestone = { year: string; kind: ScarKind; title: string; text: string }

// Short teasers distilled from /about. The full account stays on the page, in the visitor's own words.
// Kept deliberately discreet: no medical detail, only the rhythm (fall, return, rebuild).
export const SCAR_MILESTONES: Record<ScarLocale, ScarMilestone[]> = {
  fr: [
    { year: "2008", kind: "origin", title: "Un stick dans les mains", text: "Premières crosses au TAC Hockey, Le Touquet. Le début de tout." },
    { year: "Collège", kind: "rise", title: "Le talent, puis le brassard", text: "Mauvais perdant au départ, puis le talent, puis le brassard de capitaine." },
    { year: "U16", kind: "peak", title: "Intouchable", text: "L'impression de pouvoir faire ce que je voulais sur le terrain." },
    { year: "2019", kind: "rupture", title: "La première chute", text: "Un entraînement banal, sans choc ni duel. Et soudain, le genou lâche." },
    { year: "2019 — 2020", kind: "rebuild", title: "Premier retour", text: "Une rééducation prise au sérieux, jusqu'au retour sur le terrain." },
    { year: "2020 — 2022", kind: "rupture", title: "Les années dures", text: "Le lycée, la distance avec le hockey et une période qui s'assombrit." },
    { year: "Oct. 2022", kind: "rupture", title: "La cicatrice", text: "Une opération, une complication, et une marque qui reste. C'est de là que vient ce récit." },
    { year: "2023", kind: "rebuild", title: "Reconstruire, encore", text: "Le bac, l'ESDHEM à Lille, et une reprise progressive, étape par étape." },
    { year: "2026", kind: "peak", title: "Le TAC retrouve l'Élite", text: "1ère place de Nationale 1, 16 victoires en 18 matchs, 100 buts inscrits." },
    { year: "Aujourd'hui", kind: "build", title: "Construire", text: "Ce réflexe (prévoir la chute, reprendre proprement, tenir dans la durée) je le retrouve dans mes projets : gestion d'erreurs, reprises, documentation." },
  ],
  en: [
    { year: "2008", kind: "origin", title: "A stick in my hands", text: "First hockey sticks at TAC Hockey, Le Touquet. Where it all began." },
    { year: "Middle school", kind: "rise", title: "Talent, then the armband", text: "A bad loser at first, then the talent, then the captain's armband." },
    { year: "U16", kind: "peak", title: "Unstoppable", text: "The feeling that I could do anything on the field." },
    { year: "2019", kind: "rupture", title: "The first fall", text: "An ordinary training session, no contact, no duel. And suddenly, the knee gives way." },
    { year: "2019 — 2020", kind: "rebuild", title: "A first comeback", text: "A rehab taken seriously, all the way back onto the field." },
    { year: "2020 — 2022", kind: "rupture", title: "The hard years", text: "High school, distance from hockey, and a period that turns dark." },
    { year: "Oct. 2022", kind: "rupture", title: "The scar", text: "A surgery, a complication, and a mark that stays. This story starts here." },
    { year: "2023", kind: "rebuild", title: "Rebuilding, again", text: "The baccalaureate, ESDHEM in Lille, and a gradual return, one step at a time." },
    { year: "2026", kind: "peak", title: "TAC is back in the Elite", text: "First place in Nationale 1, 16 wins in 18 games, 100 goals scored." },
    { year: "Today", kind: "build", title: "Building", text: "That reflex (plan for the fall, restart cleanly, last over time) is what I bring to my projects: error handling, recovery, documentation." },
  ],
}

export const SCAR_UI: Record<
  ScarLocale,
  {
    kicker: string
    heading: string
    hint: string
    svgLabel: string
    tabsLabel: string
    projects: string
    fullStory: string
    projectsHref: string
  }
> = {
  fr: {
    kicker: "MON HISTOIRE, AGRAFE PAR AGRAFE",
    heading: "Une cicatrice, un fil",
    hint: "Faites défiler pour avancer le long de la cicatrice.",
    svgLabel: "Une cicatrice fermée par des agrafes, chacune marquant un moment de mon parcours",
    tabsLabel: "Jalons",
    projects: "Voir mes projets",
    fullStory: "Lire le récit complet",
    projectsHref: "/projects",
  },
  en: {
    kicker: "MY STORY, STAPLE BY STAPLE",
    heading: "One scar, one thread",
    hint: "Scroll to move along the scar.",
    svgLabel: "A scar closed by staples, each one marking a moment of my journey",
    tabsLabel: "Milestones",
    projects: "See my projects",
    fullStory: "Read the full story",
    projectsHref: "/en/projects",
  },
}
