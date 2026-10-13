import type { StyleSpecification } from 'maplibre-gl'

const mapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY?.trim()

const fallbackLightStyle: StyleSpecification = {
  version: 8,
  sources: {
    'carto-voyager': {
      type: 'raster',
      tiles: ['https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
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
}

const fallbackDarkStyle: StyleSpecification = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: ['https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
}

export function getMapStyle(isDark: boolean = false): string | StyleSpecification {
  if (mapTilerKey) {
    const styleId = isDark ? 'streets-v4-dark' : 'streets-v4'
    return `https://api.maptiler.com/maps/${styleId}/style.json?key=${encodeURIComponent(mapTilerKey)}`
  }
  return isDark ? fallbackDarkStyle : fallbackLightStyle
}
