from __future__ import annotations

import json
import os
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import HTTPException

from app.config import Settings, get_settings
from app.models.schemas import WeatherFileMeta


class StorageClient(ABC):
    @abstractmethod
    def store_json(self, file_name: str, payload: dict[str, Any]) -> str:
        raise NotImplementedError

    @abstractmethod
    def list_files(self) -> list[WeatherFileMeta]:
        raise NotImplementedError

    @abstractmethod
    def get_json(self, file_name: str) -> dict[str, Any]:
        raise NotImplementedError


class LocalStorageClient(StorageClient):
    """Filesystem-backed storage for local development / demos."""

    def __init__(self, root_dir: str) -> None:
        self.root = Path(root_dir).resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def store_json(self, file_name: str, payload: dict[str, Any]) -> str:
        path = self.root / file_name
        try:
            path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        except OSError as exc:
            raise HTTPException(
                status_code=500,
                detail={
                    "status": "error",
                    "message": f"Failed to write local weather file: {exc}",
                },
            ) from exc
        return file_name

    def list_files(self) -> list[WeatherFileMeta]:
        files: list[WeatherFileMeta] = []
        try:
            for path in self.root.glob("weather_*.json"):
                if not path.is_file():
                    continue
                stat = path.stat()
                created = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc)
                files.append(
                    WeatherFileMeta(
                        name=path.name,
                        size=stat.st_size,
                        created_at=created.isoformat().replace("+00:00", "Z"),
                    )
                )
        except OSError as exc:
            raise HTTPException(
                status_code=500,
                detail={
                    "status": "error",
                    "message": f"Failed to list local weather files: {exc}",
                },
            ) from exc

        files.sort(key=lambda item: item.created_at, reverse=True)
        return files

    def get_json(self, file_name: str) -> dict[str, Any]:
        path = self.root / file_name
        if not path.is_file():
            raise HTTPException(
                status_code=404,
                detail={"status": "error", "message": "not found"},
            )
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise HTTPException(
                status_code=500,
                detail={
                    "status": "error",
                    "message": f"Failed to read weather file: {exc}",
                },
            ) from exc


class GCSStorageClient(StorageClient):
    """Google Cloud Storage client (free-tier friendly)."""

    def __init__(self, bucket_name: str) -> None:
        if not bucket_name:
            raise HTTPException(
                status_code=500,
                detail={
                    "status": "error",
                    "message": "GCS_BUCKET_NAME is not configured",
                },
            )
        try:
            from google.cloud import storage  # type: ignore
        except ImportError as exc:
            raise HTTPException(
                status_code=500,
                detail={
                    "status": "error",
                    "message": "google-cloud-storage is not installed",
                },
            ) from exc

        try:
            self.client = storage.Client()
            self.bucket = self.client.bucket(bucket_name)
            # Verify bucket access early with a cheap metadata call.
            if not self.bucket.exists():
                raise HTTPException(
                    status_code=500,
                    detail={
                        "status": "error",
                        "message": f"GCS bucket '{bucket_name}' does not exist or is inaccessible",
                    },
                )
        except HTTPException:
            raise
        except Exception as exc:  # noqa: BLE001 - surface SDK/auth errors cleanly
            raise HTTPException(
                status_code=500,
                detail={
                    "status": "error",
                    "message": f"Failed to initialize GCS client: {exc}",
                },
            ) from exc

    def store_json(self, file_name: str, payload: dict[str, Any]) -> str:
        try:
            blob = self.bucket.blob(file_name)
            blob.upload_from_string(
                json.dumps(payload, indent=2),
                content_type="application/json",
            )
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(
                status_code=500,
                detail={
                    "status": "error",
                    "message": f"Failed to upload weather file to GCS: {exc}",
                },
            ) from exc
        return file_name

    def list_files(self) -> list[WeatherFileMeta]:
        files: list[WeatherFileMeta] = []
        try:
            # Efficient prefix listing via SDK — no brute-force full scans.
            for blob in self.client.list_blobs(self.bucket, prefix="weather_"):
                if not blob.name.endswith(".json"):
                    continue
                created = blob.time_created or blob.updated
                if created is None:
                    created_at = datetime.now(timezone.utc).isoformat().replace(
                        "+00:00", "Z"
                    )
                else:
                    if created.tzinfo is None:
                        created = created.replace(tzinfo=timezone.utc)
                    created_at = created.astimezone(timezone.utc).isoformat().replace(
                        "+00:00", "Z"
                    )
                files.append(
                    WeatherFileMeta(
                        name=blob.name,
                        size=int(blob.size or 0),
                        created_at=created_at,
                    )
                )
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(
                status_code=500,
                detail={
                    "status": "error",
                    "message": f"Failed to list GCS objects: {exc}",
                },
            ) from exc

        files.sort(key=lambda item: item.created_at, reverse=True)
        return files

    def get_json(self, file_name: str) -> dict[str, Any]:
        try:
            blob = self.bucket.blob(file_name)
            if not blob.exists():
                raise HTTPException(
                    status_code=404,
                    detail={"status": "error", "message": "not found"},
                )
            raw = blob.download_as_text(encoding="utf-8")
            return json.loads(raw)
        except HTTPException:
            raise
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(
                status_code=500,
                detail={
                    "status": "error",
                    "message": f"Failed to read weather file from GCS: {exc}",
                },
            ) from exc


_storage_client: StorageClient | None = None


def build_storage_client(settings: Settings | None = None) -> StorageClient:
    settings = settings or get_settings()
    backend = settings.storage_backend.strip().lower()

    if backend == "local":
        return LocalStorageClient(settings.local_storage_dir)
    if backend == "gcs":
        return GCSStorageClient(settings.gcs_bucket_name)

    raise HTTPException(
        status_code=500,
        detail={
            "status": "error",
            "message": f"Unsupported STORAGE_BACKEND '{settings.storage_backend}'. Use 'local' or 'gcs'.",
        },
    )


def get_storage_client() -> StorageClient:
    global _storage_client
    if _storage_client is None:
        _storage_client = build_storage_client()
    return _storage_client


def reset_storage_client() -> None:
    """Test helper to clear the singleton."""
    global _storage_client
    _storage_client = None


def build_weather_file_name(
    latitude: float,
    longitude: float,
    start_date: str,
    end_date: str,
) -> str:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    lat = f"{latitude:.4f}".replace("-", "m")
    lon = f"{longitude:.4f}".replace("-", "m")
    return f"weather_{lat}_{lon}_{start_date}_{end_date}_{timestamp}.json"
