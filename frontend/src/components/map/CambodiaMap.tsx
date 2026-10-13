import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import type { Report, ReportCategory } from '@/types/report'
import { useTranslation } from '@/contexts/LanguageContext'
import { ReportStatusBadge } from '@/components/reports/ReportStatusBadge'
import { ReportCategoryBadge } from '@/components/reports/ReportCategoryBadge'
import { ThumbsUp, MapPin, ExternalLink } from 'lucide-react'
import { mapStyle } from '@/lib/mapStyle'

interface CambodiaMapProps {
  reports: Report[]
  selectedReport?: Report | null
  onSelectReport?: (report: Report | null) => void
  center?: [number, number]
  zoom?: number
  className?: string
}

// Marker color coding based on issue category
const CATEGORY_COLORS: Record<ReportCategory, string> = {
  ROAD_DAMAGE: '#F97316', // Orange
  STREETLIGHT: '#EAB308', // Amber/Yellow
  GARBAGE: '#10B981', // Emerald
  FLOODING: '#3B82F6', // Blue
  DRAINAGE: '#06B6D4', // Cyan
  TRAFFIC_SAFETY: '#EF4444', // Red
  PUBLIC_FACILITY: '#8B5CF6', // Purple
  OTHER: '#64748B', // Slate
}

export const CambodiaMap: React.FC<CambodiaMapProps> = ({
  reports,
  selectedReport,
  onSelectReport,
  center = [104.9282, 11.5564], // Phnom Penh
  zoom = 12,
  className = 'w-full h-full min-h-[500px]',
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const [activePreviewReport, setActivePreviewReport] = useState<Report | null>(selectedReport || null)
  const [mapError, setMapError] = useState(false)

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: mapStyle,
        center,
        zoom,
      })

      // Add zoom and navigation controls
      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

      map.on('error', (e: maplibregl.ErrorEvent) => {
        console.warn('MapLibre notice:', e)
      })

      mapRef.current = map

      return () => {
        map.remove()
      }
    } catch (err) {
      console.error('Failed to initialize map:', err)
      setMapError(true)
    }
  }, [])

  // Sync selectedReport prop
  useEffect(() => {
    if (selectedReport) {
      setActivePreviewReport(selectedReport)
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [selectedReport.longitude, selectedReport.latitude],
          zoom: Math.max(14, mapRef.current.getZoom()),
          essential: true,
        })
      }
    }
  }, [selectedReport])

  // Update markers when reports change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    reports.forEach((report) => {
      // Create custom HTML element for marker
      const el = document.createElement('div')
      el.className = 'group relative cursor-pointer'
      const color = CATEGORY_COLORS[report.category] || '#2563EB'

      el.innerHTML = `
        <div style="background-color: ${color};" class="w-7 h-7 rounded-xs flex items-center justify-center text-white shadow-md border-2 border-white transition-transform group-hover:scale-115 duration-150">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `

      el.addEventListener('click', () => {
        setActivePreviewReport(report)
        if (onSelectReport) onSelectReport(report)
        map.flyTo({
          center: [report.longitude, report.latitude],
          zoom: 14,
          speed: 1.2,
        })
      })

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([report.longitude, report.latitude])
        .addTo(map)

      markersRef.current.push(marker)
    })
  }, [reports])

  return (
    <div className={`relative rounded-md overflow-hidden border border-slate-300 shadow-2xs ${className}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />

      {/* Fallback error notice if tiles fail */}
      {mapError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 p-6 text-center z-20">
          <MapPin className="w-12 h-12 text-slate-400 mb-2" />
          <h4 className="text-base font-bold text-slate-800">Map unavailable offline</h4>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            Unable to load map tiles at this moment. You can still browse all community reports in the feed.
          </p>
        </div>
      )}

      {/* Floating Report Preview Card */}
      {activePreviewReport && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-sm z-30 bg-white rounded-md p-4 shadow-md border border-slate-300 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between gap-2 mb-2">
            <ReportCategoryBadge category={activePreviewReport.category} size="sm" />
            <div className="flex items-center gap-1.5">
              <ReportStatusBadge status={activePreviewReport.status} />
              <button
                onClick={() => setActivePreviewReport(null)}
                className="w-5 h-5 rounded-xs bg-slate-100 border border-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center text-xs"
                aria-label="Close preview"
              >
                ✕
              </button>
            </div>
          </div>

          <h4 className="text-sm font-bold text-slate-900 tracking-tight line-clamp-1 mb-1">
            {activePreviewReport.title}
          </h4>

          <div className="flex items-center gap-1 text-xs text-slate-600 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {activePreviewReport.district}, {activePreviewReport.province}
            </span>
          </div>

          {activePreviewReport.images && activePreviewReport.images.length > 0 && (
            <div className="w-full h-28 rounded-xs overflow-hidden bg-slate-100 border border-slate-200 mb-3">
              <img
                src={activePreviewReport.images[0]}
                alt={activePreviewReport.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div className="flex items-center gap-1 text-xs text-slate-700 font-bold font-mono">
              <ThumbsUp className="w-3.5 h-3.5 text-blue-800" />
              <span>{activePreviewReport.supportCount} supports</span>
            </div>

            <button
              onClick={() => navigate(`/reports/${activePreviewReport.id}`)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider bg-blue-800 text-white hover:bg-blue-900 border border-blue-950 transition-colors shadow-2xs"
            >
              <span>{t('viewDetails')}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="hidden lg:flex absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-sm border border-slate-300 shadow-2xs flex-col gap-1 text-[11px] text-slate-800">
        <span className="font-bold uppercase tracking-wider text-slate-900 mb-0.5 text-[10px]">Civic Category Legend</span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-orange-500" /> Road Damage
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-blue-500" /> Flooding
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-amber-500" /> Streetlights
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-emerald-500" /> Garbage
          </span>
        </div>
      </div>
    </div>
  )
}
