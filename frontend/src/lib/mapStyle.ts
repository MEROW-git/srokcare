import { setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

// Vite needs an explicit MapLibre worker URL for vector map styles.
setWorkerUrl(workerUrl)

const OPENFREEMAP_BASE_URL = 'https://tiles.openfreemap.org/styles'

export function getMapStyle(isDark = false): string {
  return `${OPENFREEMAP_BASE_URL}/${isDark ? 'dark' : 'liberty'}`
}
