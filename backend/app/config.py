from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    storage_backend: str = "local"
    local_storage_dir: str = "./data/weather"
    gcs_bucket_name: str = ""
    supabase_url: str = ""
    supabase_secret_key: str = ""
    supabase_publishable_key: str = ""
    supabase_bucket: str = "weather-archives"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    open_meteo_base_url: str = "https://archive-api.open-meteo.com/v1/archive"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
