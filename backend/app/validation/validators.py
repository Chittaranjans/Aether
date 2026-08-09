from datetime import date, datetime, timedelta

from fastapi import HTTPException


def parse_iso_date(value: str, field_name: str) -> date:
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "message": f"{field_name} must be a valid date in YYYY-MM-DD format",
            },
        ) from exc


def validate_store_weather_inputs(
    latitude: float,
    longitude: float,
    start_date: str,
    end_date: str,
) -> tuple[date, date]:
    if not isinstance(latitude, (int, float)) or latitude != latitude:
        raise HTTPException(
            status_code=400,
            detail={"status": "error", "message": "latitude must be a valid number"},
        )
    if not isinstance(longitude, (int, float)) or longitude != longitude:
        raise HTTPException(
            status_code=400,
            detail={"status": "error", "message": "longitude must be a valid number"},
        )

    if latitude < -90 or latitude > 90:
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "message": "latitude must be between -90 and 90",
            },
        )

    if longitude < -180 or longitude > 180:
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "message": "longitude must be between -180 and 180",
            },
        )

    start = parse_iso_date(start_date, "start_date")
    end = parse_iso_date(end_date, "end_date")

    if start > end:
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "message": "start_date must be less than or equal to end_date",
            },
        )

    span_days = (end - start).days + 1
    if span_days > 31:
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "message": "date range must be at most 31 days",
            },
        )

    # Open-Meteo archive data is typically available with a short lag.
    # Reject future-dated ranges so the product fails clearly instead of
    # returning empty series.
    today = date.today()
    if start > today:
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "message": "start_date cannot be in the future",
            },
        )
    if end > today:
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "message": "end_date cannot be in the future",
            },
        )

    # Keep archive requests within a reasonable historical window.
    earliest = today - timedelta(days=365 * 80)
    if start < earliest:
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "message": "start_date is too far in the past for archive lookup",
            },
        )

    return start, end


def validate_file_name(file_name: str) -> str:
    if not file_name or file_name.strip() != file_name:
        raise HTTPException(
            status_code=404,
            detail={"status": "error", "message": "not found"},
        )

    # Prevent path traversal / nested keys.
    if (
        "/" in file_name
        or "\\" in file_name
        or ".." in file_name
        or not file_name.endswith(".json")
        or not file_name.startswith("weather_")
    ):
        raise HTTPException(
            status_code=404,
            detail={"status": "error", "message": "not found"},
        )

    return file_name
