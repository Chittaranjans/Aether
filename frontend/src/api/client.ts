import type {
  ApiError,
  ListWeatherFilesResponse,
  StoreWeatherRequest,
  StoreWeatherResponse,
  StoredWeatherFile,
} from '../types/weather'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

async function parseError(response: Response): Promise<never> {
  let message = `Request failed (${response.status})`
  try {
    const data = (await response.json()) as ApiError | { detail?: unknown }
    if ('message' in data && typeof data.message === 'string') {
      message = data.message
    } else if ('detail' in data) {
      message = typeof data.detail === 'string' ? data.detail : message
    }
  } catch {
    // keep default message
  }
  throw new Error(message)
}

export async function storeWeatherData(
  body: StoreWeatherRequest,
): Promise<StoreWeatherResponse> {
  const response = await fetch(`${API_BASE}/store-weather-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) await parseError(response)
  return response.json() as Promise<StoreWeatherResponse>
}

export async function listWeatherFiles(): Promise<ListWeatherFilesResponse> {
  const response = await fetch(`${API_BASE}/list-weather-files`)
  if (!response.ok) await parseError(response)
  return response.json() as Promise<ListWeatherFilesResponse>
}

export async function getWeatherFileContent(
  fileName: string,
): Promise<StoredWeatherFile> {
  const response = await fetch(
    `${API_BASE}/weather-file-content/${encodeURIComponent(fileName)}`,
  )
  if (!response.ok) await parseError(response)
  return response.json() as Promise<StoredWeatherFile>
}
