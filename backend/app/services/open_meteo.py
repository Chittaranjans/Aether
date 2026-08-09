from typing import Any

import httpx
from fastapi import HTTPException

from app.config import get_settings

DAILY_VARIABLES = [
    "temperature_2m_max",
    "temperature_2m_min",
    "apparent_temperature_max",
    "apparent_temperature_min",
]


async def fetch_historical_weather(
    latitude: float,
    longitude: float,
    start_date: str,
    end_date: str,
) -> dict[str, Any]:
    settings = get_settings()
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": start_date,
        "end_date": end_date,
        "daily": ",".join(DAILY_VARIABLES),
        "timezone": "auto",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(settings.open_meteo_base_url, params=params)
    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=504,
            detail={
                "status": "error",
                "message": "Open-Meteo request timed out",
            },
        ) from exc
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "status": "error",
                "message": f"Failed to reach Open-Meteo: {exc}",
            },
        ) from exc

    if response.status_code != 200:
        message = "Open-Meteo returned an error"
        try:
            payload = response.json()
            message = payload.get("reason") or payload.get("error") or message
        except ValueError:
            message = response.text or message
        raise HTTPException(
            status_code=502,
            detail={"status": "error", "message": message},
        )

    try:
        data = response.json()
    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "status": "error",
                "message": "Open-Meteo returned invalid JSON",
            },
        ) from exc

    daily = data.get("daily") or {}
    if not daily.get("time"):
        raise HTTPException(
            status_code=502,
            detail={
                "status": "error",
                "message": "Open-Meteo returned no daily weather data for this range",
            },
        )

    return data
