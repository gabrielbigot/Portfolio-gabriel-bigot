import { Code2 } from "lucide-react"
import { getTechnologyName, groupTechnologies, type TechnologyItem } from "@/lib/technology-categories"

interface TechnologyGroupsProps {
  technologies: TechnologyItem[]
  compact?: boolean
  maxItems?: number
  locale?: "fr" | "en"
}

const categoryLabels: Record<"fr" | "en", Record<string, string>> = {
  fr: {},
  en: {
    IA: "AI",
    "Déploiement": "Deployment",
    Langage: "Language",
    Productivité: "Productivity",
    Automatisation: "Automation",
    "Outils métier": "Business tools",
    Autres: "Other",
  },
}

const technologyLabels: Record<"fr" | "en", Record<string, string>> = {
  fr: {},
  en: {
    "Automatisation UI": "UI Automation",
    "Logiciels comptables": "Accounting software",
  },
}

function getCategoryLabel(category: string, locale: "fr" | "en") {
  return categoryLabels[locale][category] ?? category
}

function getTechnologyLabel(name: string, locale: "fr" | "en") {
  return technologyLabels[locale][name] ?? name
}

export default function TechnologyGroups({ technologies, compact = false, maxItems, locale = "fr" }: TechnologyGroupsProps) {
  const visibleTechnologies = maxItems ? technologies.slice(0, maxItems) : technologies
  const hiddenCount = maxItems ? Math.max(technologies.length - maxItems, 0) : 0
  const groups = groupTechnologies(visibleTechnologies)

  if (groups.length === 0) return null

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5 lg:justify-end">
        {groups.flatMap((group) =>
          group.technologies.map((technology) => {
            const name = getTechnologyName(technology)
            const label = getTechnologyLabel(name, locale)

            return (
              <span
                key={`${group.category}-${name}`}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs border border-border text-muted-foreground rounded-md leading-tight"
              >
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">
                  {getCategoryLabel(group.category, locale)}
                </span>
                <span>{label}</span>
              </span>
            )
          })
        )}
        {hiddenCount > 0 && (
          <span className="px-2 py-0.5 text-xs text-muted-foreground/70">
            +{hiddenCount}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.category} className="space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
            {getCategoryLabel(group.category, locale)}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {group.technologies.map((technology) => {
              const name = getTechnologyName(technology)
              const label = getTechnologyLabel(name, locale)

              return (
                <span
                  key={name}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:border-muted-foreground/50 transition-colors duration-300"
                >
                  <Code2 className="w-4 h-4 text-muted-foreground" />
                  <span>{label}</span>
                </span>
              )
            })}
          </div>
        </div>
      ))}
      {hiddenCount > 0 && (
        <div className="text-xs text-muted-foreground">
          +{hiddenCount} technologie{hiddenCount > 1 ? "s" : ""}
        </div>
      )}
    </div>
  )
}
