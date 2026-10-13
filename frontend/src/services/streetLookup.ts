interface GeocodingFeature {
  place_type?: string[]
  text?: string
}

interface GeocodingResponse {
  features?: GeocodingFeature[]
}

const mapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY?.trim()

export const streetLookupAvailable = Boolean(mapTilerKey)

export async function findStreetAtPin(
  latitude: number,
  longitude: number,
  language: string,
  signal: AbortSignal,
): Promise<string | null> {
  if (!mapTilerKey) return null

  const url = new URL(`https://api.maptiler.com/geocoding/${longitude},${latitude}.json`)
  url.searchParams.set('key', mapTilerKey)
  url.searchParams.set('language', language)

  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Street lookup failed (${response.status})`)

  const data = (await response.json()) as GeocodingResponse
  const street = data.features?.find((feature) =>
    feature.place_type?.some((type) => type === 'address' || type === 'street') && feature.text?.trim()
  )

  return street?.text?.trim() || null
}
