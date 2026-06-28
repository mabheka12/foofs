// components/directory/StaticMap.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

interface StaticMapProps {
  latitude: number
  longitude: number
  name: string
  zoom?: number
  width?: number
  height?: number
  className?: string
}

export default function StaticMap({ 
  latitude, 
  longitude, 
  name,
  zoom = 14,
  width = 300,
  height = 200,
  className = ''
}: StaticMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Simple map rendering using OpenStreetMap tiles (free)
    // We'll use a canvas-based approach with OSM tiles
    
    const renderMap = async () => {
      try {
        // Use OSM static map tile (free, no API key)
        const tileSize = 256
        const x = Math.floor((longitude + 180) / 360 * Math.pow(2, zoom))
        const y = Math.floor((1 - Math.log(Math.tan(latitude * Math.PI / 180) + 1 / Math.cos(latitude * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))
        
        // Load tile from OpenStreetMap (free)
        const tileUrl = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`
        
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = tileUrl
        
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = () => {
            // Fallback to a simpler tile
            img.src = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`
          }
          img.onload = resolve
          setTimeout(reject, 5000)
        })
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // Draw marker
        const markerX = canvas.width / 2
        const markerY = canvas.height / 2 - 15
        
        // Draw circle
        ctx.beginPath()
        ctx.arc(markerX, markerY, 10, 0, Math.PI * 2)
        ctx.fillStyle = '#ef4444'
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.stroke()
        
        // Draw inner circle
        ctx.beginPath()
        ctx.arc(markerX, markerY, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        
        // Draw label
        ctx.fillStyle = '#000000'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(name, markerX, markerY - 20)
        
        setIsLoaded(true)
      } catch (error) {
        // If map fails, draw a simple placeholder
        ctx.fillStyle = '#e5e7eb'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#9ca3af'
        ctx.font = '14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('📍 Location', canvas.width / 2, canvas.height / 2 - 10)
        ctx.fillText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, canvas.width / 2, canvas.height / 2 + 20)
        setIsLoaded(true)
      }
    }

    renderMap()
  }, [latitude, longitude, zoom, name])

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg shadow-md"
        style={{ backgroundColor: '#f3f4f6' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm text-gray-500">Loading map...</span>
          </div>
        </div>
      )}
    </div>
  )
}