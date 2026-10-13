import type { MapMode } from '@/lib/mapStyle'

interface SatelliteAttributionProps {
  mode: MapMode
  className?: string
}

export function SatelliteAttribution({ mode, className = 'bottom-2.5 left-2.5' }: SatelliteAttributionProps) {
  if (mode !== 'satellite') return null

  // MapTiler Free requires its linked logo in addition to the TileJSON attribution.
  return (
    <a
      href="https://www.maptiler.com/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="MapTiler"
      className={`absolute z-20 rounded-xs border border-slate-300 bg-white/95 px-1.5 py-1 shadow-xs ${className}`}
    >
      <img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo" className="h-4 w-auto" />
    </a>
  )
}
