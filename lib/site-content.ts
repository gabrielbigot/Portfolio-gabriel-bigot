// Chargeur du contenu du site.
//  - Production : les JSON de content/site/ sont embarqués au build (site statique, aucun appel réseau).
//  - Studio (STUDIO_MODE=1) : le contenu « brouillon » est lu à la volée (branche GitHub ou fichiers locaux) → la copie privée
//    reflète vos modifications immédiatement, sans rebuild.
import { unstable_noStore as noStore } from "next/cache"
import { CONTENT_BY_KEY } from "@/lib/site-content-registry"
import personalInfo from "@/content/site/personal-info.json"
import socialLinks from "@/content/site/social-links.json"
import skills from "@/content/site/skills.json"
import education from "@/content/site/education.json"
import interests from "@/content/site/interests.json"
import achievements from "@/content/site/achievements.json"
import timeline from "@/content/site/timeline.json"
import workExperience from "@/content/site/work-experience.json"
import companies from "@/content/site/companies.json"
import projects from "@/content/site/projects.json"
import blogPosts from "@/content/site/blog-posts.json"
import aboutFr from "@/content/site/about-fr.json"
import aboutEn from "@/content/site/about-en.json"
import usesFr from "@/content/site/uses-fr.json"
import usesEn from "@/content/site/uses-en.json"
import uiPortfolio from "@/content/site/ui-portfolio.json"
import uiProjects from "@/content/site/ui-projects.json"
import metadata from "@/content/site/metadata.json"
import companiesEn from "@/content/site/companies-en.json"
import pages from "@/content/site/pages.json"
import layout from "@/content/site/layout.json"
import theme from "@/content/site/theme.json"
import strings from "@/content/site/strings.json"
import enProfile from "@/content/site/en-profile.json"
import projectsEn from "@/content/site/projects-en.json"

const BUNDLED = { personalInfo, socialLinks, skills, education, interests, achievements, timeline, workExperience, companies, projects, blogPosts, aboutFr, aboutEn, usesFr, usesEn, uiPortfolio, uiProjects, metadata, enProfile, projectsEn, companiesEn, theme, pages, layout, strings }
export type SiteContent = typeof BUNDLED
export type ContentKey = keyof SiteContent
const NO_MARK = new Set(["theme", "layout"])
export const isStudioMode = () => process.env.STUDIO_MODE === "1"

export async function getContent<K extends ContentKey>(key: K): Promise<SiteContent[K]> {
  if (isStudioMode()) {
    noStore()
    const { readDraftJson } = await import("@/lib/studio/store")
    const def = CONTENT_BY_KEY[key as string]
    const { markContent } = await import("@/lib/studio/stega")
    const draft = await readDraftJson(def.file)
    const data = (draft !== undefined ? draft : BUNDLED[key]) as SiteContent[K]
    return NO_MARK.has(key as string) ? data : markContent(key as string, data) // textes signés : l'éditeur direct retrouve leur origine (pas pour le thème et la mise en page : ce ne sont pas des textes)
  }
  return BUNDLED[key]
}
