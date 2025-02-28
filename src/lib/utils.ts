export const formatSkills = (skills: string): string[] => {
  return skills
    .split(',')
    .map(skill => skill.trim())
    .filter(Boolean)
}

export const validateSkills = (skills: string): boolean => {
  const skillsArray = formatSkills(skills)
  return skillsArray.length > 0 && skillsArray.length <= 10
}