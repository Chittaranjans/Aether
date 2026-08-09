# Aether — Climate Weather Intelligence

Aether is a full-stack weather explorer MVP that simulates a climate-risk style workflow:

1. Fetch historical daily weather for a chosen location and date range (Open-Meteo)
2. Store the raw JSON in object storage (local filesystem or Google Cloud Storage)
3. Explore archives through a multi-page product dashboard with charts and tables

Built for a Full Stack Engineer technical assessment, structured as a product-ready MVP rather than a single demo screen.

---

## Tech stack

### Backend
| Library | Role |
|---------|------|
| **Python 3.12+** | Runtime |
| **FastAPI** | REST API framework |
| **Uvicorn** | ASGI server |
| **httpx** | Async HTTP client for Open-Meteo |
| **Pydantic / pydantic-settings** | Request models + env config |
| **google-cloud-storage** | GCS object storage (optional) |
| **python-dotenv** | Local `.env` loading |

### Frontend
| Library | Role |
|---------|------|
| **React 19 + TypeScript** | UI |
| **Vite** | Dev server + bundler |
| **Tailwind CSS v4** | Styling |
| **React Router** | Multi-page navigation |
| **Recharts** | Charts / visualizations |
| **Motion** | Page transitions + micro-interactions |
| **date-fns** | Date formatting helpers |
| **Bun** | Package manager / scripts (npm also fine) |

### External / cloud
| Service | Role |
|---------|------|
| **Open-Meteo Archive API** | Historical daily weather |
| **Local filesystem** | Default free local object store |
| **Google Cloud Storage** | Optional free-tier cloud storage |
| **Cloud Run** | Optional container deployment path (`backend/Dockerfile`) |

---

## Design approach

### Product structure
The UI is a multi-page product shell, not one long assessment form:

| Route | Purpose |
|-------|---------|
| `/` | Product landing |
| `/dashboard` | Multi-location climate portfolio |
| `/explore` | Fetch & store ingest form |
| `/files` | Browse stored archives |
| `/insights/:file?` | Deep-dive charts + paginated table |
| `/about` | Product / architecture overview |

### UX principles
- **Work from stored files** after ingest — avoid repeated Open-Meteo calls for exploration
- **Clear loading and error states** on every async path
- **Light + dark themes** via CSS variables (`data-theme`)
- **Responsive layout** for desktop / tablet / mobile
- **Motion for hierarchy** (route transitions, staggered cards, scroll reveals) without noisy effects

### Backend modularity
```text
routes/       → HTTP endpoints
validation/   → input rules + error messages
services/     → Open-Meteo client + storage backends
models/       → Pydantic schemas
config.py     → environment settings
```

Storage is abstracted:

- `STORAGE_BACKEND=local` → `./data/weather` (default, zero cloud cost)
- `STORAGE_BACKEND=gcs` → Google Cloud Storage bucket

### Visualization strategy
- **Dashboard:** compare all stored locations (avg max/min, daily overlay, heat-risk, regional rollup)
- **Insights:** keep the core daily temperature series, then add diurnal range, apparent gap, distribution, and band/midpoint views
- City presets are shortcuts only — **any valid lat/lon** can be ingested; unknown places label as coordinates unless near a known city

---

## Project structure

```text
weather-app/
├── README.md
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── validation/
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── pages/
        ├── components/
        ├── api/
        ├── hooks/
        ├── utils/
        └── layouts/
```

---

## API contract

### `POST /store-weather-data`
Request:
```json
{
  "latitude": 19.076,
  "longitude": 72.8777,
  "start_date": "2024-01-01",
  "end_date": "2024-01-14"
}
```

Validation:
- latitude ∈ [-90, 90], longitude ∈ [-180, 180]
- dates `YYYY-MM-DD`, `start_date ≤ end_date`, range ≤ 31 days

Behavior:
- Calls Open-Meteo daily history (`temperature_2m_max/min`, `apparent_temperature_max/min`)
- Stores full JSON as  
  `weather_<lat>_<lon>_<start>_<end>_<timestamp>.json`
- Returns `{ "status": "ok", "file": "<stored_file_name>" }`

### `GET /list-weather-files`
```json
{
  "files": [
    { "name": "...", "size": 1234, "created_at": "2026-08-08T18:16:22Z" }
  ]
}
```

### `GET /weather-file-content/{file}`
- Returns stored JSON
- Missing/invalid → `404` `{ "status": "error", "message": "not found" }`

Errors use clear JSON (`400` / `404` / `5xx`) and CORS is enabled for the frontend origin.

---

## Local setup

### Prerequisites
- Python 3.12+ (3.14 works with current pinned deps)
- Bun (or Node.js 20+)
- Git

### 1) Backend

```bash
cd backend
python -m pip install -r requirements.txt
copy .env.example .env          # Windows
# cp .env.example .env          # macOS / Linux
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API: http://127.0.0.1:8000  
Docs: http://127.0.0.1:8000/docs  

### 2) Frontend

```bash
cd frontend
bun install
bun run dev
```

App: http://127.0.0.1:5173  

Vite proxies `/api/*` → FastAPI on port `8000`.

### Quick demo flow
1. Open **Explore**
2. Pick a city preset (or enter custom lat/lon)
3. Click **Fetch & Store Data**
4. Open **Dashboard** (or **Seed sample cities** for multi-city charts)
5. Open **Insights** for a single-archive deep dive

---

## Cloud storage (optional, free-tier)

Default is local storage (`backend/data/weather`) — no cloud account required.

To use GCS:

```env
STORAGE_BACKEND=gcs
GCS_BUCKET_NAME=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

Then restart the API. Prefer attaching a service account on Cloud Run instead of shipping key files in production.

---

## Deployment notes

`backend/Dockerfile` is Cloud Run ready. Example env:

```env
STORAGE_BACKEND=gcs
GCS_BUCKET_NAME=your-bucket
CORS_ORIGINS=https://your-frontend-domain
```

Frontend can be deployed to any static host (Cloud Storage + CDN, Vercel, Netlify, etc.) with:

```env
VITE_API_BASE_URL=https://your-api-domain
```

---

## Assessment checklist coverage

- [x] Open-Meteo historical daily fetch
- [x] Object storage of raw JSON (local + GCS-ready)
- [x] `POST /store-weather-data`
- [x] `GET /list-weather-files`
- [x] `GET /weather-file-content/{file}`
- [x] Input validation + clear HTTP errors
- [x] CORS for frontend
- [x] React + Tailwind dashboard
- [x] Fetch/store UI with loading/error states
- [x] File list + file viewer
- [x] Temperature chart + paginated table (10/20/50)
- [x] Responsive multi-page product UX
