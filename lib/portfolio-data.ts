/**
 * Portfolio Data — static local data, no external backend
 */

import {
  personalInfo,
  socialLinks,
  workExperience,
  education,
  skills,
  timeline,
  achievements,
  interests,
  companies,
  projects,
} from "./data"

export function getPersonalInfo() {
  return personalInfo
}

export function getSocialLinks() {
  return socialLinks
}

export function getWorkExperience() {
  return workExperience
}

export function getEducation() {
  return education
}

export function getSkills() {
  return skills
}

export function getTimeline() {
  return timeline
}

export function getAchievements() {
  return achievements
}

export function getInterests() {
  return interests
}

export function getCompanies() {
  return companies
}

export function getCompany(slug: string) {
  return companies.find((c) => c.slug === slug) ?? null
}

export function getCompanyProjects(companySlug: string, companyName?: string) {
  const company = companies.find((c) => c.slug === companySlug)
  const name = companyName ?? company?.company
  if (!name) return []
  return projects.filter((p) => p.company === name)
}

export function getAllPortfolioData() {
  return {
    personalInfo,
    socialLinks,
    workExperience,
    education,
    skills,
    timeline,
    achievements,
    interests,
  }
}
