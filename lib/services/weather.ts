// lib/services/weather.ts
interface WeatherData {
  city: string
  state: string
  temperature: number
  conditions: string
  humidity: number
  windSpeed: number
  precipitation: number
  uvIndex: number
  sunrise: string
  sunset: string
  forecast: {
    day: string
    high: number
    low: number
    conditions: string
  }[]
}

interface ClimateData {
  city: string
  state: string
  annualRainfall: number
  annualSnowfall: number
  averageHighTemp: number
  averageLowTemp: number
  rainyDays: number
  snowyDays: number
  humidityAverage: number
  bestMonths: string[]
  worstMonths: string[]
}

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5'


export async function getCurrentWeather(city: string, state: string): Promise<WeatherData | null> {
  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeather API key not configured')
    return null
  }

  try {
    // First, get coordinates for the city
    const geoResponse = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&limit=1&appid=${OPENWEATHER_API_KEY}`
    )
    
    if (!geoResponse.ok) {
      throw new Error('Failed to get coordinates')
    }

    const geoData = await geoResponse.json()
    if (!geoData || geoData.length === 0) {
      return null
    }

    const { lat, lon } = geoData[0]

    // Get current weather
    const weatherResponse = await fetch(
      `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${OPENWEATHER_API_KEY}`
    )

    if (!weatherResponse.ok) {
      throw new Error('Failed to get weather')
    }

    const weatherData = await weatherResponse.json()

    // Get 5-day forecast
    const forecastResponse = await fetch(
      `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${OPENWEATHER_API_KEY}`
    )

    let forecast = []
    if (forecastResponse.ok) {
      const forecastData = await forecastResponse.json()
      // Get one forecast per day (every 8th item = 24 hours)
      forecast = forecastData.list
        .filter((_: any, i: number) => i % 8 === 0)
        .slice(0, 5)
        .map((item: any) => ({
          day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          conditions: item.weather[0].description,
        }))
    }

    return {
      city,
      state,
      temperature: Math.round(weatherData.main.temp),
      conditions: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind.speed * 0.868976), // Convert to mph
      precipitation: weatherData.rain ? weatherData.rain['1h'] || 0 : 0,
      uvIndex: 0, // Not available in free tier
      sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      forecast,
    }
  } catch (error) {
    console.error('Error fetching weather:', error)
    return null
  }
}

// Climate data fallback (static data for major cities)
export function getClimateData(city: string, state: string): ClimateData | null {
  // This is static fallback data - you can expand this with real data from NOAA
  const climateData: Record<string, ClimateData> = {
    'houston-texas': {
      city: 'Houston',
      state: 'Texas',
      annualRainfall: 49.8,
      annualSnowfall: 0.3,
      averageHighTemp: 78.6,
      averageLowTemp: 59.8,
      rainyDays: 104,
      snowyDays: 1,
      humidityAverage: 75,
      bestMonths: ['March', 'April', 'May', 'October', 'November'],
      worstMonths: ['July', 'August', 'September'],
    },
    'austin-texas': {
      city: 'Austin',
      state: 'Texas',
      annualRainfall: 34.3,
      annualSnowfall: 0.5,
      averageHighTemp: 79.8,
      averageLowTemp: 57.6,
      rainyDays: 82,
      snowyDays: 1,
      humidityAverage: 68,
      bestMonths: ['April', 'May', 'October', 'November'],
      worstMonths: ['July', 'August'],
    },
    'miami-florida': {
      city: 'Miami',
      state: 'Florida',
      annualRainfall: 61.9,
      annualSnowfall: 0,
      averageHighTemp: 83.0,
      averageLowTemp: 69.0,
      rainyDays: 135,
      snowyDays: 0,
      humidityAverage: 76,
      bestMonths: ['January', 'February', 'March', 'December'],
      worstMonths: ['June', 'July', 'August', 'September'],
    },
    'orlando-florida': {
      city: 'Orlando',
      state: 'Florida',
      annualRainfall: 51.3,
      annualSnowfall: 0,
      averageHighTemp: 82.8,
      averageLowTemp: 62.6,
      rainyDays: 117,
      snowyDays: 0,
      humidityAverage: 73,
      bestMonths: ['January', 'February', 'March', 'November', 'December'],
      worstMonths: ['June', 'July', 'August'],
    },
    'tampa-florida': {
      city: 'Tampa',
      state: 'Florida',
      annualRainfall: 46.3,
      annualSnowfall: 0,
      averageHighTemp: 82.4,
      averageLowTemp: 63.7,
      rainyDays: 105,
      snowyDays: 0,
      humidityAverage: 73,
      bestMonths: ['January', 'February', 'March', 'April', 'November', 'December'],
      worstMonths: ['June', 'July', 'August', 'September'],
    },
    'jacksonville-florida': {
      city: 'Jacksonville',
      state: 'Florida',
      annualRainfall: 50.0,
      annualSnowfall: 0.1,
      averageHighTemp: 79.8,
      averageLowTemp: 58.8,
      rainyDays: 115,
      snowyDays: 1,
      humidityAverage: 73,
      bestMonths: ['March', 'April', 'May', 'October', 'November'],
      worstMonths: ['July', 'August'],
    },
    'los-angeles-california': {
      city: 'Los Angeles',
      state: 'California',
      annualRainfall: 14.9,
      annualSnowfall: 0,
      averageHighTemp: 73.4,
      averageLowTemp: 57.2,
      rainyDays: 35,
      snowyDays: 0,
      humidityAverage: 65,
      bestMonths: ['May', 'June', 'September', 'October'],
      worstMonths: ['January', 'February'],
    },
    'san-francisco-california': {
      city: 'San Francisco',
      state: 'California',
      annualRainfall: 23.5,
      annualSnowfall: 0,
      averageHighTemp: 64.8,
      averageLowTemp: 52.4,
      rainyDays: 67,
      snowyDays: 0,
      humidityAverage: 73,
      bestMonths: ['September', 'October'],
      worstMonths: ['January', 'December'],
    },
    'chicago-illinois': {
      city: 'Chicago',
      state: 'Illinois',
      annualRainfall: 39.1,
      annualSnowfall: 36.2,
      averageHighTemp: 58.8,
      averageLowTemp: 41.8,
      rainyDays: 124,
      snowyDays: 28,
      humidityAverage: 70,
      bestMonths: ['June', 'July', 'August', 'September'],
      worstMonths: ['January', 'February', 'December'],
    },
    'new-york-new-york': {
      city: 'New York',
      state: 'New York',
      annualRainfall: 49.9,
      annualSnowfall: 29.8,
      averageHighTemp: 62.6,
      averageLowTemp: 47.6,
      rainyDays: 120,
      snowyDays: 22,
      humidityAverage: 65,
      bestMonths: ['May', 'June', 'September', 'October'],
      worstMonths: ['January', 'February'],
    },
  }

  const key = `${city.toLowerCase()}-${state.toLowerCase()}`
  return climateData[key] || null
}

// Get seasonal roofing advice based on climate
export function getRoofingAdvice(climateData: ClimateData | null): string[] {
  if (!climateData) {
    return [
      'Regular roof inspections can help prevent costly repairs.',
      'Consider professional maintenance at least twice a year.',
      'Keep gutters clean to prevent water damage.',
    ]
  }

  const advice: string[] = []

  // Snow advice
  if (climateData.annualSnowfall > 20) {
    advice.push('❄️ Heavy snowfall expected - ensure your roof can handle snow load.')
    advice.push('🏔️ Consider snow guards to prevent sudden snow slides.')
  }

  // Rain advice
  if (climateData.annualRainfall > 50) {
    advice.push('☔ High rainfall area - ensure proper drainage and waterproofing.')
    advice.push('💧 Regular gutter cleaning is essential in this climate.')
  }

  // Heat advice
  if (climateData.averageHighTemp > 80) {
    advice.push('☀️ Hot climate - consider reflective or cool roofing materials.')
    advice.push('🌡️ Ensure proper attic ventilation to prevent heat damage.')
  }

  // Humidity advice
  if (climateData.humidityAverage > 70) {
    advice.push('💨 High humidity - look for moisture-resistant roofing materials.')
    advice.push('🛡️ Consider mold and mildew resistant underlayment.')
  }

  // Best months advice
  if (climateData.bestMonths.length > 0) {
    advice.push(`📅 Best months for roof work: ${climateData.bestMonths.join(', ')}.`)
  }

  return advice
}