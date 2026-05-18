import { getPersonalInfo, getSocialLinks, getWorkExperience, getSkills, getProjects, getBlogPosts } from "@/lib/portfolio-data"
import PortfolioClient from "@/components/PortfolioClient"

export default function PortfolioPage() {
  const personalInfo = getPersonalInfo()
  const socialLinks = getSocialLinks()
  const workExperience = getWorkExperience()
  const skills = getSkills()
  const blogPosts = getBlogPosts()
  const featuredProjects = getProjects().filter((p) => p.featured)

  return (
    <PortfolioClient
      personalInfo={personalInfo}
      socialLinks={socialLinks}
      workExperience={workExperience}
      skills={skills}
      blogPosts={blogPosts as any}
      projects={featuredProjects as any}
    />
  )
}
