/**
 * Portfolio Data Fetcher
 * Fetches data from Notion with fallback to local data
 */

import {
  getPersonalInfoFromNotion,
  getSocialLinksFromNotion,
  getWorkExperienceFromNotion,
  getEducationFromNotion,
  getSkillsFromNotion,
  getTimelineFromNotion,
  getAchievementsFromNotion,
  getInterestsFromNotion,
} from "./notion-simple"

import {
  personalInfo as localPersonalInfo,
  socialLinks as localSocialLinks,
  workExperience as localWorkExperience,
  education as localEducation,
  skills as localSkills,
  timeline as localTimeline,
  achievements as localAchievements,
  interests as localInterests,
} from "./data"

/**
 * Get personal information
 * Tries Notion first, falls back to local data
 */
export async function getPersonalInfo() {
  try {
    const notionData = await getPersonalInfoFromNotion()
    if (notionData && notionData.name) {
      return notionData
    }
  } catch (error) {
    console.warn("Failed to fetch personal info from Notion, using local data")
  }
  return localPersonalInfo
}

/**
 * Get social links
 * Tries Notion first, falls back to local data
 */
export async function getSocialLinks() {
  try {
    const notionData = await getSocialLinksFromNotion()
    if (notionData && notionData.length > 0) {
      return notionData
    }
  } catch (error) {
    console.warn("Failed to fetch social links from Notion, using local data")
  }
  return localSocialLinks
}

/**
 * Get work experience
 * Tries Notion first, falls back to local data
 */
export async function getWorkExperience() {
  try {
    const notionData = await getWorkExperienceFromNotion()
    if (notionData && notionData.length > 0) {
      return notionData
    }
  } catch (error) {
    console.warn("Failed to fetch work experience from Notion, using local data")
  }
  return localWorkExperience
}

/**
 * Get education
 * Tries Notion first, falls back to local data
 */
export async function getEducation() {
  try {
    const notionData = await getEducationFromNotion()
    if (notionData && notionData.length > 0) {
      return notionData
    }
  } catch (error) {
    console.warn("Failed to fetch education from Notion, using local data")
  }
  return localEducation
}

/**
 * Get skills
 * Tries Notion first, falls back to local data
 */
export async function getSkills() {
  try {
    const notionData = await getSkillsFromNotion()
    if (
      notionData &&
      (notionData.technical.length > 0 ||
        notionData.soft.length > 0 ||
        notionData.languages.length > 0)
    ) {
      return notionData
    }
  } catch (error) {
    console.warn("Failed to fetch skills from Notion, using local data")
  }
  return localSkills
}

/**
 * Get timeline
 * Tries Notion first, falls back to local data
 */
export async function getTimeline() {
  try {
    const notionData = await getTimelineFromNotion()
    if (notionData && notionData.length > 0) {
      return notionData
    }
  } catch (error) {
    console.warn("Failed to fetch timeline from Notion, using local data")
  }
  return localTimeline
}

/**
 * Get achievements
 * Tries Notion first, falls back to local data
 */
export async function getAchievements() {
  try {
    const notionData = await getAchievementsFromNotion()
    if (notionData && notionData.length > 0) {
      return notionData
    }
  } catch (error) {
    console.warn("Failed to fetch achievements from Notion, using local data")
  }
  return localAchievements
}

/**
 * Get interests
 * Tries Notion first, falls back to local data
 */
export async function getInterests() {
  try {
    const notionData = await getInterestsFromNotion()
    if (notionData && notionData.length > 0) {
      return notionData
    }
  } catch (error) {
    console.warn("Failed to fetch interests from Notion, using local data")
  }
  return localInterests
}

/**
 * Get all portfolio data at once
 * Useful for pages that need multiple data sources
 */
export async function getAllPortfolioData() {
  const [
    personalInfo,
    socialLinks,
    workExperience,
    education,
    skills,
    timeline,
    achievements,
    interests,
  ] = await Promise.all([
    getPersonalInfo(),
    getSocialLinks(),
    getWorkExperience(),
    getEducation(),
    getSkills(),
    getTimeline(),
    getAchievements(),
    getInterests(),
  ])

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
