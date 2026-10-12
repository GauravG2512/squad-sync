<div align="center">

# SquadSync 🎮

**AI-powered squad matchmaking for competitive gamers**

*Built with FastAPI · React · SQLite/PostgreSQL · WebSockets*

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)](https://vite.dev)

</div>

---

## What is SquadSync?

SquadSync is an AI-powered matchmaking and team-building platform for competitive gamers. It goes beyond rank-based pairing by profiling each player's **Gamer DNA™** — a behavioral fingerprint capturing communication style, tactical role, aggression level, tilt resistance, and leadership tendencies — then uses ML clustering to assemble squads with genuine synergy.

Supports **VALORANT, CS2, Apex Legends, Rainbow Six Siege, Dota 2**, and **Call of Duty** with native Riot Games and Steam/OpenDota API integrations.

> Built per IEEE 830 Software Requirements Specification by **Gaurav Ghude, Yash Patil, Atharv Ghorpade, and Ankur Kesarkar** at Vidyalankar Institute of Technology, Mumbai.

---

## Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Gamer DNA™ Profiling** | 10-point behavioral questionnaire scoring aggression, tactical sense, tilt resistance, leadership, and communication style |
| 2 | **AI Role Classification** | ML clustering predicting primary & secondary in-game roles (Duelist, Controller, Sentinel, etc.) |
| 3 | **Compatibility Engine** | Pairwise synergy scoring (0–100%) with explainable matching justifications |
| 4 | **Squad Hub & Smart Formation** | Create Duo / Trio / 5-Stack squads, invite teammates, missing role detection, and manage rosters |
| 5 | **Friends Network** | Global player discovery, friend request flow, online status grid |
| 6 | **Esports News Portal** | Real-time news feed via NewsAPI.org with TTL DB caching, game & category filters, and admin publishing |
| 7 | **Real-Time Chat** | Low-latency (<1 s) WebSocket tactical chat — DMs, squad channels, typing indicators |
| 8 | **Admin Console** | Platform KPI telemetry, account moderation, 48-hour SLA conduct reports |
| 9 | **Game Integrations** | Steam OpenID / Dota 2 stats via OpenDota, Riot RSO for VALORANT / LoL accounts |
| 10 | **Password Recovery & Reset** | Two-stage cryptographic token recovery with live security strength compliance checks |
| 11 | **Profile Picture / Media Upload** | Multipart avatar image uploads (PNG, JPG, WEBP, GIF, max 5MB) with local static mounts |
| 12 | **In-App Activity & Notification Center** | Real-time notification bell dropdown with 1-click friend accept/decline and system status alerts |

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | FastAPI 0.111+ |
| Runtime | Python 3.12+ |
| ORM | SQLAlchemy 2.0 (async) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Migrations | Alembic |
| Auth | JWT (PyJWT) + bcrypt (passlib) |
| Real-Time | WebSockets (native FastAPI) |
| Validation | Pydantic v2 |
| Testing | pytest + pytest-asyncio + httpx |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build Tool | Vite 8 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Styling | Vanilla CSS (glassmorphism dark theme) |

---

## Project Structure

```
squad-sync/
├── backend/                        # FastAPI REST API & WebSocket backend
│   ├── app/
│   │   ├── api/                    # Canonical routing layer (router aggregators)
│   │   │   └── v1/
│   │   │       ├── router.py       # Mounts all v1 endpoint routers
│   │   │       └── endpoints/
│   │   │           └── health.py
│   │   ├── routers/                # Endpoint handler modules (imported by api/)
│   │   │   └── api_v1/
│   │   │       └── endpoints/      # auth, chat, matchmaking, admin, profile, news, ... (20 files)
│   │   ├── core/                   # Config, database, security, DI, exceptions
│   │   │   ├── compatibility/      # AI compatibility engine
│   │   │   ├── matchmaking/        # AI matchmaking engine
│   │   │   ├── role_classifier/    # Role classification engine
│   │   │   ├── skill_profile/      # Skill profile generator
│   │   │   ├── squad_recommendation/
│   │   │   └── explanation/        # Explainability engine
│   │   ├── models/                 # SQLAlchemy ORM models (13 tables)
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── services/               # Business logic layer (23 services)
│   │   ├── repositories/           # Database access layer (CRUD)
│   │   ├── providers/              # External API providers (Riot, Steam, OpenDota)
│   │   ├── middleware/             # CORS, request logging, correlation IDs
│   │   └── main.py                 # App factory & lifespan manager
│   ├── static/                     # User uploads and avatar assets
│   │   └── avatars/                # Uploaded profile pictures
│   ├── alembic/                    # Database migration scripts
│   ├── tests/                      # Pytest suite (268+ tests across 31 modules)
│   ├── setup_database.py           # Automated PostgreSQL migration & demo seeder
│   ├── seed_data.py                # Rich test account, roster, and news data
│   ├── .env.example                # Environment variable template
│   └── requirements.txt
│
├── frontend-react/                 # React 19 + Vite SPA
│   └── src/
│       ├── api/                    # Axios API client modules
│       ├── components/
│       │   ├── admin/              # KPI telemetry & moderation console
│       │   ├── auth/               # Login, Register & Password Recovery modals
│       │   ├── chat/               # WebSocket chat drawer
│       │   ├── common/             # Navbar, NotificationDropdown, report modals
│       │   ├── friends/            # Friends network hub & request management
│       │   ├── landing/            # Landing page
│       │   ├── matchmaker/         # 4-step AI matchmaker (DNA survey → AI draft)
│       │   ├── news/               # Esports news portal & admin publishing modal
│       │   ├── profile/            # Gamer Profile, Avatar file upload & DNA Card
│       │   └── squads/             # Squad creation & roster management
│       ├── context/                # AuthContext provider
│       ├── hooks/                  # Custom React hooks
│       └── utils/                  # Utility functions
│
├── docs/                           # IEEE 830 SRS & design documentation
├── docker-compose.yml              # Pre-configured PostgreSQL 16 container (port 5431)
├── run.py                          # Unified dev server launcher
├── setup_db.bat                    # Automated PostgreSQL setup script (CMD)
├── setup_db.ps1                    # Automated PostgreSQL setup script (PowerShell)
├── start.bat                       # Windows one-click launcher
└── start.ps1                       # PowerShell launcher
```

---

## Quick Start

### Prerequisites

| Tool | Min Version | Purpose |
|------|-------------|---------|
| Python | 3.12 | Backend runtime |
| Node.js | 18 | Frontend build / dev server |
| npm | 9 | Frontend package manager |

---

### Database Initialization (PostgreSQL)

SquadSync runs on PostgreSQL. To verify connection, create `squadsync_db`, run Alembic migrations, and seed demo records in one step:

```bash
# Windows Command Prompt / Double-click
setup_db.bat

# PowerShell
./setup_db.ps1

# Or via Python directly
python backend/setup_database.py
```

> **Using Docker?** Run `docker compose up -d` to spin up a pre-configured PostgreSQL 16 container on port `5431`.

---

### Option 1 — One-Command Launcher (Recommended)

Starts both servers simultaneously:

```bash
python run.py
```

Or use the platform shortcuts:

```bash
# Windows (double-click, or from cmd)
start.bat

# PowerShell
./start.ps1
```

**Services started:**

| Service | URL |
|---------|-----|
| Frontend (React) | http://localhost:5173 |
| Backend API | http://127.0.0.1:8000 |
| Swagger UI | http://127.0.0.1:8000/docs |
| Health Check | http://127.0.0.1:8000/health |
| WebSocket Chat | ws://127.0.0.1:8000/api/v1/chat/ws |

---

### Option 2 — Run Services Individually

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate
# Activate (macOS / Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment config
cp .env.example .env   # Then edit .env with your keys

# Run development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### Frontend

```bash
cd frontend-react

npm install
npm run dev
```

---

## Environment Configuration

Copy `backend/.env.example` to `backend/.env` and set:

```env
# Required for production — generate with: openssl rand -hex 32
SECRET_KEY=your-cryptographically-secure-secret-key

# Database (defaults to SQLite for local dev)
DATABASE_URL=sqlite+aiosqlite:///./squadsync.db
# For PostgreSQL:
# DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/squadsync_db

# Optional — External API Integrations
STEAM_API_KEY=               # Steam Web API key (for Dota 2 stats)
RIOT_API_KEY=                # Riot Games API key (for VALORANT/LoL accounts)
RIOT_CLIENT_ID=              # Riot RSO OAuth client ID
RIOT_CLIENT_SECRET=          # Riot RSO OAuth client secret
```

> For local development with SQLite, the app works **out of the box with no external keys required**.

---

## Database Migrations

```bash
cd backend

# Run all pending migrations
alembic upgrade head

# Create a new migration after model changes
alembic revision --autogenerate -m "describe your change"

# Roll back one migration
alembic downgrade -1
```

---

## Testing

Run the full backend test suite:

```bash
cd backend
.venv\Scripts\pytest                     # Windows
# source .venv/bin/activate && pytest    # macOS/Linux
```

Run with coverage report:

```bash
pytest --cov=app --cov-report=term-missing
```

Run a specific test module:

```bash
pytest tests/test_matchmaking.py -v
```

The test suite covers **268+ test cases** across 31 modules including:
- Auth flows, JWT validation, bcrypt hashing, and password recovery
- AI matchmaking, compatibility, and role classification engines
- Game integrations (Riot, Steam, OpenDota) — verified and mocked
- WebSocket chat, squad management, friendship flows, and presence
- Multipart profile avatar uploads and file validation
- Repository CRUD, service edge cases, and exception handlers

---

## API Reference

Full interactive documentation is available at **http://127.0.0.1:8000/docs** when the backend is running.

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Obtain JWT access token |
| `POST` | `/api/v1/auth/forgot-password` | Request password recovery verification token |
| `POST` | `/api/v1/auth/reset-password` | Complete password reset using signed token |
| `GET` | `/api/v1/profile/me` | Get authenticated user profile |
| `PUT` | `/api/v1/profile/me` | Update gamer profile details |
| `POST` | `/api/v1/profile/avatar` | Upload avatar image (JPG, PNG, WEBP, GIF, max 5MB) |
| `POST` | `/api/v1/survey/submit` | Submit Gamer DNA™ survey |
| `GET` | `/api/v1/dna/my-card` | Get Gamer DNA™ card and psychometric radar |
| `POST` | `/api/v1/matchmaking/find` | Trigger AI squad matchmaking |
| `GET` | `/api/v1/compatibility/{user_id}` | Get pairwise compatibility score & explainability |
| `GET` | `/api/v1/squads/recommendations` | Get optimal 5-player squad recommendations |
| `POST` | `/api/v1/teams/` | Create a competitive squad |
| `GET` | `/api/v1/friends/` | List confirmed friends |
| `GET` | `/api/v1/friends/requests` | List pending friend invitations |
| `GET` | `/api/v1/news` | Get esports news & patch notes (NewsAPI + DB cache) |
| `POST` | `/api/v1/news` | Publish news article (Admin only) |
| `GET` | `/api/v1/admin/analytics` | Get platform KPI metrics and moderation queue |
| `WS` | `/api/v1/chat/ws` | Real-time WebSocket tactical chat connection |
| `GET` | `/api/v1/games/steam/link` | Initiate Steam OpenID flow |
| `GET` | `/api/v1/games/riot/link` | Initiate Riot RSO OAuth flow |
| `GET` | `/health` | Health check |

---

## Architecture Overview

```
Browser
  │
  ▼
React SPA (Vite, port 5173)
  │  Axios HTTP + WebSocket
  ▼
FastAPI (Uvicorn, port 8000)
  ├── CORS Middleware
  ├── Request Logging Middleware
  ├── JWT Auth (PyJWT + bcrypt)
  │
  ├── /api/v1/*  ──► Router aggregator (app/api/v1/router.py)
  │                       │
  │                       ├── Endpoint handlers (app/routers/api_v1/endpoints/)
  │                       │       │
  │                       │       ├── Services (app/services/)
  │                       │       │       │
  │                       │       │       └── Repositories (app/repositories/)
  │                       │       │               │
  │                       │       │               └── SQLAlchemy async ORM
  │                       │       │                       │
  │                       │       │                       └── SQLite / PostgreSQL
  │                       │       │
  │                       │       └── AI Engines (app/core/)
  │                       │               ├── Compatibility Engine
  │                       │               ├── Role Classifier
  │                       │               ├── Matchmaking Engine
  │                       │               ├── Skill Profile Generator
  │                       │               ├── Squad Recommender
  │                       │               └── Explanation Engine
  │                       │
  │                       └── Providers (app/providers/)
  │                               ├── Riot Games API
  │                               ├── Steam Web API
  │                               └── OpenDota API
  │
  └── /api/v1/chat/ws  ──► WebSocket Manager (broadcast, rooms)
```

---

## Contributors

| Name | Role |
|------|------|
| Gaurav Ghude | Backend architecture, AI engines, game integrations |
| Yash Patil | Frontend (React), UI/UX, system integration |
| Atharv Ghorpade | Backend services, database design, testing |
| Ankur Kesarkar | API design, authentication, documentation |

*Vidyalankar Institute of Technology, Mumbai — Software Engineering Project (2026)*

---

## License

This project is an academic deliverable. All rights reserved by the contributors.
