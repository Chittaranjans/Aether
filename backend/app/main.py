from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.models.schemas import HealthResponse
from app.routes.weather import router as weather_router

settings = get_settings()

app = FastAPI(
    title="InRisk Weather Explorer API",
    description=(
        "Minimal climate-risk style weather explorer: fetch Open-Meteo "
        "historical daily weather, store raw JSON in object storage, and serve it."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(
    _request: Request,
    exc: HTTPException,
) -> JSONResponse:
    detail = exc.detail
    if isinstance(detail, dict) and "status" in detail and "message" in detail:
        content = detail
    elif isinstance(detail, dict) and "message" in detail:
        content = {"status": "error", "message": detail["message"]}
    else:
        content = {"status": "error", "message": str(detail)}
    return JSONResponse(status_code=exc.status_code, content=content)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    _request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    errors = exc.errors()
    message = "Invalid request body"
    if errors:
        first = errors[0]
        loc = ".".join(str(part) for part in first.get("loc", []) if part != "body")
        msg = first.get("msg", message)
        message = f"{loc}: {msg}" if loc else str(msg)
    return JSONResponse(
        status_code=400,
        content={"status": "error", "message": message},
    )


@app.get("/", include_in_schema=False)
async def root() -> dict[str, str]:
    return {
        "service": "InRisk Weather Explorer API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", storage_backend=settings.storage_backend)


app.include_router(weather_router)
