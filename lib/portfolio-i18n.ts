import {
  getProject,
  getPersonalInfo,
  getProjects,
  getSkills,
  getSocialLinks,
  getWorkExperience,
} from "@/lib/portfolio-data"
import { getContent } from "@/lib/site-content"

export type PortfolioLocale = "fr" | "en"

type ProjectTranslation = { title?: string; shortDescription?: string; category?: string; categories?: string[]; tags?: string[]; company?: string; [k: string]: unknown }

export async function getLocalizedProjects(locale: PortfolioLocale = "fr") {
  const projects = await getProjects()
  if (locale === "fr") {
    return projects
  }

  const [translations, profile] = await Promise.all([getContent("projectsEn"), getContent("enProfile")])
  const all = translations as Record<string, ProjectTranslation>
  const curated = profile.curatedProjectLabels as Record<string, ProjectTranslation>

  return projects.map((project) => {
    const translatedProject = all[project.slug]
    const curatedLabels = curated[project.slug]

    return {
      ...project,
      ...(translatedProject ?? {}),
      categories: curatedLabels?.categories ?? (project as any).categories,
      category: translatedProject?.category ?? curatedLabels?.category ?? project.category,
      tags: translatedProject?.tags ?? curatedLabels?.tags ?? project.tags,
      company: translatedProject?.company ?? curatedLabels?.company ?? project.company,
    }
  })
}

export async function getLocalizedProject(slug: string, locale: PortfolioLocale = "fr") {
  if (locale === "fr") {
    return getProject(slug)
  }

  return (await getLocalizedProjects("en")).find((item) => item.slug === slug) ?? null
}

export async function getPortfolioPageData(locale: PortfolioLocale = "fr") {
  const [personalInfo, socialLinks, workExperience, skills, localized] = await Promise.all([
    getPersonalInfo(),
    getSocialLinks(),
    getWorkExperience(),
    getSkills(),
    getLocalizedProjects(locale),
  ])
  const projects = localized.filter((p) => p.featured)

  if (locale === "fr") {
    return { personalInfo, socialLinks, workExperience, skills, projects }
  }

  const [profile, translations] = await Promise.all([getContent("enProfile"), getContent("projectsEn")])
  const all = translations as Record<string, ProjectTranslation>
  const curated = profile.curatedProjectLabels as Record<string, ProjectTranslation>

  return {
    personalInfo: {
      ...personalInfo,
      ...profile.personalInfoOverrides,
      currentRole: {
        ...personalInfo.currentRole,
        ...profile.personalInfoOverrides.currentRole,
      },
    },
    socialLinks,
    workExperience: workExperience.map((job, index) => ({
      ...job,
      ...profile.workExperience[index],
    })),
    skills: {
      ...skills,
      technical: profile.technicalSkills,
      soft: profile.softSkills,
      languages: profile.languages,
    },
    projects: projects.map((project) => ({
      ...project,
      ...(all[project.slug] ?? {}),
      categories: curated[project.slug]?.categories ?? (project as any).categories,
    })),
  }
}
