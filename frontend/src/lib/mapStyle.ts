import { setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

// Vite needs an explicit MapLibre worker URL for vector map styles.
setWorkerUrl(workerUrl)

export function getMapStyle(): string {
  return 'https://tiles.openfreemap.org/styles/liberty'
}
