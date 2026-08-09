from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.models.schemas import (
    ListWeatherFilesResponse,
    StoreWeatherRequest,
    StoreWeatherResponse,
)
from app.services.open_meteo import fetch_historical_weather
from app.services.storage import build_weather_file_name, get_storage_client
from app.validation.validators import validate_file_name, validate_store_weather_inputs

router = APIRouter(tags=["weather"])


@router.post(
    "/store-weather-data",
    response_model=StoreWeatherResponse,
    responses={
        400: {"description": "Validation error"},
        502: {"description": "Upstream Open-Meteo error"},
        504: {"description": "Upstream timeout"},
    },
)
async def store_weather_data(body: StoreWeatherRequest) -> StoreWeatherResponse:
    start, end = validate_store_weather_inputs(
        latitude=body.latitude,
        longitude=body.longitude,
        start_date=body.start_date,
        end_date=body.end_date,
    )

    weather_json = await fetch_historical_weather(
        latitude=body.latitude,
        longitude=body.longitude,
        start_date=start.isoformat(),
        end_date=end.isoformat(),
    )

    # Enrich stored payload with request metadata for the dashboard.
    stored_payload: dict[str, Any] = {
        "request": {
            "latitude": body.latitude,
            "longitude": body.longitude,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
        },
        "source": "open-meteo",
        "data": weather_json,
    }

    file_name = build_weather_file_name(
        latitude=body.latitude,
        longitude=body.longitude,
        start_date=start.isoformat(),
        end_date=end.isoformat(),
    )

    storage = get_storage_client()
    stored_name = storage.store_json(file_name, stored_payload)
    return StoreWeatherResponse(status="ok", file=stored_name)


@router.get(
    "/list-weather-files",
    response_model=ListWeatherFilesResponse,
)
async def list_weather_files() -> ListWeatherFilesResponse:
    storage = get_storage_client()
    return ListWeatherFilesResponse(files=storage.list_files())


@router.get(
    "/weather-file-content/{file_name}",
    responses={
        404: {"description": "File not found"},
    },
)
async def weather_file_content(file_name: str) -> JSONResponse:
    safe_name = validate_file_name(file_name)
    storage = get_storage_client()
    try:
        payload = storage.get_json(safe_name)
    except HTTPException as exc:
        # Normalize missing/invalid lookups to the required error shape.
        if exc.status_code == 404:
            return JSONResponse(
                status_code=404,
                content={"status": "error", "message": "not found"},
            )
        raise

    return JSONResponse(content=payload)
