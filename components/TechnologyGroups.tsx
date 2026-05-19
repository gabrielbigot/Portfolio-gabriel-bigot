import { Code2 } from "lucide-react"
import { getTechnologyName, groupTechnologies, type TechnologyItem } from "@/lib/technology-categories"

interface TechnologyGroupsProps {
  technologies: TechnologyItem[]
  compact?: boolean
  maxItems?: number
}

export default function TechnologyGroups({ technologies, compact = false, maxItems }: TechnologyGroupsProps) {
  const visibleTechnologies = maxItems ? technologies.slice(0, maxItems) : technologies
  const hiddenCount = maxItems ? Math.max(technologies.length - maxItems, 0) : 0
  const groups = groupTechnologies(visibleTechnologies)

  if (groups.length === 0) return null

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      {groups.map((group) => (
        <div key={group.category} className={compact ? "space-y-1.5" : "space-y-2"}>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
            {group.category}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {group.technologies.map((technology) => {
              const name = getTechnologyName(technology)

              return (
                <span
                  key={name}
                  className={
                    compact
                      ? "px-2 py-0.5 text-xs border border-border text-muted-foreground rounded-md leading-tight"
                      : "inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:border-muted-foreground/50 transition-colors duration-300"
                  }
                >
                  {!compact && <Code2 className="w-4 h-4 text-muted-foreground" />}
                  <span>{name}</span>
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
