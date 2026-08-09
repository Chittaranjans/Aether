from typing import Any

from pydantic import BaseModel, Field


class StoreWeatherRequest(BaseModel):
    latitude: float = Field(..., description="Latitude in degrees")
    longitude: float = Field(..., description="Longitude in degrees")
    start_date: str = Field(..., description="Start date YYYY-MM-DD")
    end_date: str = Field(..., description="End date YYYY-MM-DD")


class StoreWeatherResponse(BaseModel):
    status: str
    file: str


class WeatherFileMeta(BaseModel):
    name: str
    size: int
    created_at: str


class ListWeatherFilesResponse(BaseModel):
    files: list[WeatherFileMeta]


class ErrorResponse(BaseModel):
    status: str = "error"
    message: str


class HealthResponse(BaseModel):
    status: str
    storage_backend: str
