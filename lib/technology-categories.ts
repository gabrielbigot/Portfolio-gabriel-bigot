export type TechnologyItem = string | {
  name: string
  usage?: string
}

export type TechnologyGroup = {
  category: string
  technologies: TechnologyItem[]
}

const categoryOrder = [
  "IA",
  "CLI",
  "IDE",
  "No-code",
  "Productivité",
  "Database",
  "Déploiement",
  "Framework",
  "Langage",
  "Auth",
  "ORM",
  "Backend",
  "API",
  "Data & documents",
  "Automatisation",
  "Outils métier",
  "Autres",
]

const categoryMatchers: Array<[string, RegExp[]]> = [
  ["IA", [/openai/, /anthropic/, /claude(?! code)/, /perplexity/, /gemini/, /dall[- ]?e/, /gpt/, /grok/, /llm/, /\bai\b/, /\bia\b/]],
  ["CLI", [/claude code/, /cursor cli/, /vercel cli/, /github cli/, /\bcli\b/]],
  ["IDE", [/antigravity/, /cursor/, /vs code/, /visual studio code/]],
  ["No-code", [/n8n/, /zapier/, /make\.com/, /\bmake\b/, /greminders/]],
  ["Productivité", [/notion/, /google sheets/, /gmail/, /suite microsoft/, /excel avance/, /outlook/, /word/, /powerpoint/]],
  ["Database", [/supabase/, /neon/, /postgres/, /postgresql/, /\bsql\b/]],
  ["Déploiement", [/vercel/, /netlify/, /railway/, /render/, /cloudflare/]],
  ["Framework", [/next\.js/, /react/, /flask/, /tailwind/, /three\.js/]],
  ["Langage", [/typescript/, /javascript/, /python/, /\bvba\b/]],
  ["Auth", [/oauth/, /jwt/, /bcrypt/, /auth/]],
  ["ORM", [/drizzle/, /prisma/]],
  ["Backend", [/server components/, /api routes/]],
  ["API", [/api/, /apify/, /pappers/, /linkedin/, /instagram graph/, /google calendar/]],
  ["Data & documents", [/ocr/, /pdf/, /parsing/, /pandas/, /excel\/vba/]],
  ["Automatisation", [/automatisation/, /ui automation/, /webhook/]],
  ["Outils métier", [/logiciels comptables/, /as400/]],
]

export function getTechnologyName(technology: TechnologyItem) {
  return typeof technology === "string" ? technology : technology.name
}

export function getTechnologyCategory(technology: TechnologyItem) {
  const name = getTechnologyName(technology).toLowerCase()
  const match = categoryMatchers.find(([, matchers]) => matchers.some((matcher) => matcher.test(name)))

  return match ? match[0] : "Autres"
}

export function groupTechnologies(technologies: TechnologyItem[] = []) {
  const groups = technologies.reduce<Record<string, TechnologyItem[]>>((acc, technology) => {
    const category = getTechnologyCategory(technology)
    acc[category] = acc[category] || []
    acc[category].push(technology)
    return acc
  }, {})

  return categoryOrder
    .filter((category) => groups[category]?.length)
    .map((category) => ({
      category,
      technologies: groups[category],
    }))
}

export function formatTechnologyGroups(technologies: TechnologyItem[] = [], maxItems = 8) {
  const groups = groupTechnologies(technologies)
  let remaining = maxItems
  const parts: string[] = []

  for (const group of groups) {
    if (remaining <= 0) break

    const names = group.technologies.slice(0, remaining).map(getTechnologyName)
    remaining -= names.length

    if (names.length > 0) {
      parts.push(`${group.category}: ${names.join(", ")}`)
    }
  }

  const hiddenCount = Math.max(technologies.length - maxItems, 0)
  return `${parts.join(" · ")}${hiddenCount > 0 ? ` · +${hiddenCount}` : ""}`
}
