// lib/services/seasonal-content.ts
export function getSeasonalContent(city: string, state: string, month: number): string {
  const seasons = {
    winter: [12, 1, 2],
    spring: [3, 4, 5],
    summer: [6, 7, 8],
    fall: [9, 10, 11],
  }

  let season = 'spring'
  if (seasons.winter.includes(month)) season = 'winter'
  else if (seasons.spring.includes(month)) season = 'spring'
  else if (seasons.summer.includes(month)) season = 'summer'
  else if (seasons.fall.includes(month)) season = 'fall'

  const content = {
    winter: `Winter in ${city} brings cold temperatures and potential snow. ${city} residents should ensure their roofs are properly insulated to prevent ice dams. Regular snow removal from roofs is essential to prevent structural damage.`,
    spring: `Spring is an ideal time for roof inspections in ${city}. The mild weather makes it perfect for identifying winter damage and preparing for the rainy season ahead.`,
    summer: `Summer in ${city} means intense sun and heat. Consider cool roofing options or reflective coatings to reduce energy costs. Ensure proper attic ventilation to extend your roof's lifespan.`,
    fall: `Fall is the perfect time for roof maintenance in ${city}. Clear gutters of fallen leaves and debris. Schedule a professional inspection before winter weather arrives.`,
  }

  return content[season as keyof typeof content] || ''
}