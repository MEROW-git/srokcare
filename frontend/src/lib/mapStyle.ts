import { setWorkerUrl } from 'maplibre-gl'
import type { Map, StyleSpecification } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

// Vite needs an explicit MapLibre worker URL for vector map styles.
setWorkerUrl(workerUrl)

const OPENFREEMAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'
const mapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY?.trim()

export type MapMode = 'road' | 'satellite'
export const satelliteMapAvailable = Boolean(mapTilerKey)

const satelliteStyle: StyleSpecification | null = mapTilerKey ? {
  version: 8,
  sources: {
    'maptiler-satellite': {
      type: 'raster',
      url: `https://api.maptiler.com/tiles/satellite-v2/tiles.json?key=${encodeURIComponent(mapTilerKey)}`,
      tileSize: 256,
    },
  },
  layers: [{ id: 'satellite', type: 'raster', source: 'maptiler-satellite' }],
} : null

export function getMapStyle(mode: MapMode = 'road'): string | StyleSpecification {
  return mode === 'satellite' && satelliteStyle ? satelliteStyle : OPENFREEMAP_STYLE_URL
}

export function attachSatelliteFallback(map: Map, onFailure: () => void): void {
  map.on('error', (event) => {
    if (!map.getSource('maptiler-satellite')) return
    console.warn('Satellite imagery failed; switching to the road map.', event.error)
    map.setStyle(OPENFREEMAP_STYLE_URL)
    onFailure()
  })
}
