import React, { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import { MapPin, Navigation } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/contexts/LanguageContext'

interface LocationPickerMapProps {
  latitude: number
  longitude: number
  onLocationChange: (lat: number, lng: number) => void
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  onLocationChange,
}) => {
  const { t } = useTranslation()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'carto-voyager': {
            type: 'raster',
            tiles: [
              'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap &copy; CARTO',
          },
        },
        layers: [
          {
            id: 'carto-voyager-layer',
            type: 'raster',
            source: 'carto-voyager',
            minzoom: 0,
            maxzoom: 20,
          },
        ],
      },
      center: [longitude || 104.9282, latitude || 11.5564],
      zoom: 13,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    // Initial marker
    const markerEl = document.createElement('div')
    markerEl.innerHTML = `
      <div class="w-9 h-9 rounded-full bg-blue-600 border-3 border-white text-white flex items-center justify-center shadow-xl animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `

    const marker = new maplibregl.Marker({ element: markerEl, draggable: true })
      .setLngLat([longitude || 104.9282, latitude || 11.5564])
      .addTo(map)

    marker.on('dragend', () => {
      const lngLat = marker.getLngLat()
      onLocationChange(Number(lngLat.lat.toFixed(6)), Number(lngLat.lng.toFixed(6)))
    })

    // Click anywhere on map to reposition pin
    map.on('click', (e: maplibregl.MapMouseEvent) => {
      marker.setLngLat(e.lngLat)
      onLocationChange(Number(e.lngLat.lat.toFixed(6)), Number(e.lngLat.lng.toFixed(6)))
    })

    mapRef.current = map
    markerRef.current = marker

    return () => {
      map.remove()
    }
  }, [])

  // Sync external coordinates
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLngLat([longitude, latitude])
    }
  }, [latitude, longitude])

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false)
        const lat = Number(pos.coords.latitude.toFixed(6))
        const lng = Number(pos.coords.longitude.toFixed(6))
        onLocationChange(lat, lng)

        if (mapRef.current) {
          mapRef.current.flyTo({ center: [lng, lat], zoom: 15, essential: true })
        }
        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat])
        }
        toast.success('Location detected! Pin updated.')
      },
      (err) => {
        setIsLocating(false)
        console.warn('Geolocation error:', err)
        toast.error('Could not retrieve current location. Please click on the map to set the pin.')
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-700">{t('locationHelp')}</span>
        </div>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/60"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : t('useMyLocation')}</span>
        </button>
      </div>

      {/* Map container */}
      <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Selected Coords Overlay */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-md text-xs font-mono text-slate-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Lat: {latitude.toFixed(5)}</span>
          <span className="text-slate-300">|</span>
          <span>Lng: {longitude.toFixed(5)}</span>
        </div>
      </div>
    </div>
  )
}
