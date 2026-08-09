export interface KnownPlace {
  label: string
  latitude: number
  longitude: number
  region: string
}

export const KNOWN_PLACES: KnownPlace[] = [
  { label: 'Mumbai', latitude: 19.076, longitude: 72.8777, region: 'South Asia' },
  { label: 'London', latitude: 51.5074, longitude: -0.1278, region: 'Europe' },
  { label: 'New York', latitude: 40.7128, longitude: -74.006, region: 'North America' },
  { label: 'Tokyo', latitude: 35.6762, longitude: 139.6503, region: 'East Asia' },
  { label: 'Singapore', latitude: 1.3521, longitude: 103.8198, region: 'Southeast Asia' },
  { label: 'Sydney', latitude: -33.8688, longitude: 151.2093, region: 'Oceania' },
  { label: 'São Paulo', latitude: -23.5505, longitude: -46.6333, region: 'South America' },
  { label: 'Cairo', latitude: 30.0444, longitude: 31.2357, region: 'Africa' },
  { label: 'Berlin', latitude: 52.52, longitude: 13.405, region: 'Europe' },
  { label: 'Dubai', latitude: 25.2048, longitude: 55.2708, region: 'Middle East' },
]

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function resolvePlaceLabel(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): { label: string; region: string } {
  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {
    return { label: 'Unknown', region: '—' }
  }

  let best: KnownPlace | null = null
  let bestDistance = Number.POSITIVE_INFINITY
  for (const place of KNOWN_PLACES) {
    const distance = haversineKm(latitude, longitude, place.latitude, place.longitude)
    if (distance < bestDistance) {
      bestDistance = distance
      best = place
    }
  }

  if (best && bestDistance <= 120) {
    return { label: best.label, region: best.region }
  }

  return {
    label: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
    region: 'Custom',
  }
}

export const LOCATION_PALETTE = [
  '#3aa7b3',
  '#e0a33a',
  '#6b8afd',
  '#e06a5c',
  '#4caf7a',
  '#c77dff',
  '#f4a261',
  '#2a9d8f',
  '#e9c46a',
  '#8ab6d6',
]
