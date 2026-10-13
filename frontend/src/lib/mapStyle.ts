import type { StyleSpecification } from 'maplibre-gl'

const mapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY?.trim()

const fallbackStyle: StyleSpecification = {
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

export const mapStyle: string | StyleSpecification = mapTilerKey
  ? `https://api.maptiler.com/maps/streets-v4/style.json?key=${encodeURIComponent(mapTilerKey)}`
  : fallbackStyle
