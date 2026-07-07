// components/directory/WeatherWidget.tsx
'use client'

import { useState, useEffect } from 'react'
import { Cloud, Droplets, Wind, Sun, CloudRain, Snowflake, Thermometer } from 'lucide-react'

interface WeatherWidgetProps {
  city: string
  state: string
  weatherData: {
    temperature: number
    conditions: string
    humidity: number
    windSpeed: number
    precipitation: number
    sunrise: string
    sunset: string
    forecast: {
      day: string
      high: number
      low: number
      conditions: string
    }[]
  } | null
  climateData: {
    annualRainfall: number
    annualSnowfall: number
    averageHighTemp: number
    averageLowTemp: number
    rainyDays: number
    snowyDays: number
    humidityAverage: number
    bestMonths: string[]
    worstMonths: string[]
  } | null
}

export function WeatherWidget({ city, state, weatherData, climateData }: WeatherWidgetProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-20 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!weatherData || !climateData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          <Cloud className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Weather data for {city}, {state} is currently unavailable.</p>
          <p className="text-sm mt-2">Check back later for local conditions.</p>
        </div>
      </div>
    )
  }

  const getWeatherIcon = (conditions: string) => {
    const lower = conditions.toLowerCase()
    if (lower.includes('rain') || lower.includes('drizzle')) return <CloudRain className="w-6 h-6 text-blue-500" />
    if (lower.includes('snow')) return <Snowflake className="w-6 h-6 text-blue-300" />
    if (lower.includes('cloud')) return <Cloud className="w-6 h-6 text-gray-500" />
    if (lower.includes('sun') || lower.includes('clear')) return <Sun className="w-6 h-6 text-yellow-500" />
    return <Cloud className="w-6 h-6 text-gray-500" />
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Current Weather */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Current Weather</h3>
            <p className="text-sm opacity-90">{city}, {state}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{weatherData.temperature}°F</div>
            <div className="text-sm opacity-90 capitalize">{weatherData.conditions}</div>
          </div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <Droplets className="w-5 h-5 mx-auto text-blue-500 mb-1" />
            <div className="text-sm font-medium">{weatherData.humidity}%</div>
            <div className="text-xs text-gray-500">Humidity</div>
          </div>
          <div className="text-center">
            <Wind className="w-5 h-5 mx-auto text-blue-500 mb-1" />
            <div className="text-sm font-medium">{weatherData.windSpeed} mph</div>
            <div className="text-xs text-gray-500">Wind</div>
          </div>
          <div className="text-center">
            <CloudRain className="w-5 h-5 mx-auto text-blue-500 mb-1" />
            <div className="text-sm font-medium">{weatherData.precipitation} in</div>
            <div className="text-xs text-gray-500">Precipitation</div>
          </div>
        </div>

        {/* Sun Times */}
        <div className="flex justify-between text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
          <div>
            <span className="text-gray-400">Sunrise</span>
            <span className="ml-2 font-medium">{weatherData.sunrise}</span>
          </div>
          <div>
            <span className="text-gray-400">Sunset</span>
            <span className="ml-2 font-medium">{weatherData.sunset}</span>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">5-Day Forecast</h4>
          <div className="grid grid-cols-5 gap-2">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-xs font-medium text-gray-600">{day.day}</div>
                <div className="my-1">{getWeatherIcon(day.conditions)}</div>
                <div className="text-xs font-bold">{day.high}°</div>
                <div className="text-xs text-gray-500">{day.low}°</div>
              </div>
            ))}
          </div>
        </div>

        {/* Climate Data */}
        <div className="border-t border-gray-100 pt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Climate Overview</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Annual Rainfall</div>
              <div className="text-lg font-bold text-blue-600">{climateData.annualRainfall} in</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Annual Snowfall</div>
              <div className="text-lg font-bold text-blue-300">{climateData.annualSnowfall} in</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Average High</div>
              <div className="text-lg font-bold text-orange-500">{climateData.averageHighTemp}°F</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Average Low</div>
              <div className="text-lg font-bold text-blue-400">{climateData.averageLowTemp}°F</div>
            </div>
          </div>
        </div>

        {/* Roofing Advice */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Roofing Tips for {city}</h4>
          <ul className="space-y-2">
            {climateData.bestMonths.length > 0 && (
              <li className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Best months for roof work: <span className="font-medium">{climateData.bestMonths.join(', ')}</span></span>
              </li>
            )}
            {climateData.annualSnowfall > 10 && (
              <li className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-blue-500">❄️</span>
                <span>Heavy snowfall area - consider snow guards and proper insulation</span>
              </li>
            )}
            {climateData.annualRainfall > 45 && (
              <li className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-blue-500">☔</span>
                <span>High rainfall - ensure proper drainage and waterproofing</span>
              </li>
            )}
            {climateData.averageHighTemp > 80 && (
              <li className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-orange-500">☀️</span>
                <span>Hot climate - consider reflective or cool roofing materials</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}