/**
 * Portfolio Data — accès au contenu du site (content/site/*.json) via le chargeur lib/site-content.ts.
 * Le contenu se modifie dans le studio (/studio) ou directement dans les JSON ; voir ARTICLES.md / STUDIO.md.
 */
import { getContent } from "@/lib/site-content"

export const getPersonalInfo = () => getContent("personalInfo")
export const getSocialLinks = () => getContent("socialLinks")
export const getWorkExperience = () => getContent("workExperience")
export const getEducation = () => getContent("education")
export const getSkills = () => getContent("skills")
export const getTimeline = () => getContent("timeline")
export const getAchievements = () => getContent("achievements")
export const getInterests = () => getContent("interests")
export const getCompanies = () => getContent("companies")
export const getSiteMetadata = () => getContent("metadata")

export async function getCompany(slug: string) {
  return (await getCompanies()).find((c) => c.slug === slug) ?? null
}

export async function getCompanyProjects(companySlug: string, companyName?: string) {
  const company = (await getCompanies()).find((c) => c.slug === companySlug)
  const name = companyName ?? company?.company
  if (!name) return []
  return (await getProjects()).filter((p) => p.company === name)
}

export const getProjects = () => getContent("projects")

export async function getProject(slug: string) {
  return (await getProjects()).find((p) => p.slug === slug) ?? null
}

export const getBlogPosts = () => getContent("blogPosts")

export async function getBlogPost(slug: string) {
  return (await getBlogPosts()).find((p) => p.slug === slug) ?? null
}

export async function getAllPortfolioData() {
  const [personalInfo, socialLinks, workExperience, education, skills, timeline, achievements, interests] = await Promise.all([
    getPersonalInfo(), getSocialLinks(), getWorkExperience(), getEducation(), getSkills(), getTimeline(), getAchievements(), getInterests(),
  ])
  return { personalInfo, socialLinks, workExperience, education, skills, timeline, achievements, interests }
}
