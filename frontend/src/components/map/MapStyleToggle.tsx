import type { MapMode } from '@/lib/mapStyle'
import { satelliteMapAvailable } from '@/lib/mapStyle'

interface MapStyleToggleProps {
  mode: MapMode
  onChange: (mode: MapMode) => void
}

export function MapStyleToggle({ mode, onChange }: MapStyleToggleProps) {
  if (!satelliteMapAvailable) return null

  return (
    <div role="group" aria-label="Map view" className="absolute top-2.5 left-2.5 z-20 flex gap-0.5 rounded-sm border border-slate-300 bg-white p-0.5 shadow-md">
      {(['road', 'satellite'] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={mode === option}
          onClick={() => onChange(option)}
          className={`rounded-xs px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
            mode === option
              ? 'bg-blue-800 text-white'
              : 'bg-white text-slate-800 hover:bg-slate-100'
          }`}
        >
          {option === 'road' ? 'Road' : 'Satellite'}
        </button>
      ))}
    </div>
  )
}
