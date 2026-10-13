import type { Map, StyleSpecification } from 'maplibre-gl'

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

export function getMapStyle(isDark: boolean = false): StyleSpecification {
  if (mapTilerKey) {
    const styleId = isDark ? 'streets-v4-dark' : 'streets-v4'
    return {
      version: 8,
      sources: {
        'maptiler-streets': {
          type: 'raster',
          tiles: [`https://api.maptiler.com/maps/${styleId}/256/{z}/{x}/{y}.png?key=${encodeURIComponent(mapTilerKey)}`],
          tileSize: 256,
          attribution:
            '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      },
      layers: [
        {
          id: 'maptiler-streets-layer',
          type: 'raster',
          source: 'maptiler-streets',
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    }
  }
  return getFallbackMapStyle(isDark)
}

export function getFallbackMapStyle(isDark: boolean): StyleSpecification {
  return isDark ? fallbackDarkStyle : fallbackLightStyle
}

export function attachMapTileFallback(map: Map, isDark: () => boolean): void {
  map.on('error', (event) => {
    if (!map.getSource('maptiler-streets')) return
    console.warn('MapTiler tiles failed; loading the backup map.', event.error)
    map.setStyle(getFallbackMapStyle(isDark()))
  })
}
