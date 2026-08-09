export interface StoreWeatherRequest {
  latitude: number
  longitude: number
  start_date: string
  end_date: string
}

export interface StoreWeatherResponse {
  status: string
  file: string
}

export interface WeatherFileMeta {
  name: string
  size: number
  created_at: string
}

export interface ListWeatherFilesResponse {
  files: WeatherFileMeta[]
}

export interface ApiError {
  status: string
  message: string
}

export interface OpenMeteoDaily {
  time: string[]
  temperature_2m_max?: Array<number | null>
  temperature_2m_min?: Array<number | null>
  apparent_temperature_max?: Array<number | null>
  apparent_temperature_min?: Array<number | null>
}

export interface OpenMeteoPayload {
  latitude?: number
  longitude?: number
  timezone?: string
  elevation?: number
  daily?: OpenMeteoDaily
  daily_units?: Record<string, string>
}

export interface StoredWeatherFile {
  request?: StoreWeatherRequest
  source?: string
  data?: OpenMeteoPayload
  // Fallback if raw Open-Meteo JSON was stored directly
  daily?: OpenMeteoDaily
  latitude?: number
  longitude?: number
  timezone?: string
}

export interface DailyRow {
  date: string
  temperature_2m_max: number | null
  temperature_2m_min: number | null
  apparent_temperature_max: number | null
  apparent_temperature_min: number | null
}
