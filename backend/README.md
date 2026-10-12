# SquadSync Backend

Production-ready FastAPI backend skeleton for **SquadSync**.

## Tech Stack
- **Python**: 3.12+
- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.0 (Async with `asyncpg`)
- **Database**: PostgreSQL
- **Migrations**: Alembic
- **Validation & Settings**: Pydantic v2 & `pydantic-settings`
- **Security**: JWT (`pyjwt`) & bcrypt password hashing (`passlib`)

---

## Project Structure

```text
backend/
├── .env.example
├── .gitignore
├── alembic.ini
├── requirements.txt
├── README.md
├── STRUCTURE.md
├── setup_database.py    # Automated DB creation, migrations & demo seeder
├── seed_data.py         # Standalone test data seeder
├── static/              # Static file storage
│   └── avatars/         # Uploaded gamer avatars
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
└── app/
    ├── main.py          # Application factory, lifespan, CORS, and router registration
    ├── config.py        # Settings using Pydantic Settings v2
    ├── database.py      # Async engine, sessionmaker, and get_db dependency
    ├── constants.py         # Application enums and constants
    ├── models/
    │   ├── __init__.py      # Models export registry for Alembic discovery
    │   └── base.py          # SQLAlchemy 2.0 DeclarativeBase and TimestampMixin
    ├── schemas/
    │   ├── __init__.py
    │   ├── common.py        # Generic responses and pagination models
    │   └── health.py        # Health check schemas
    ├── routers/
    │   ├── __init__.py
    │   └── api_v1/
    │       ├── __init__.py
    │       ├── api.py       # API v1 router aggregator
    │       └── endpoints/
    │           ├── __init__.py
    │           ├── health.py# Health check endpoint (/health and /api/v1/health)
    │           └── auth.py  # Auth endpoints skeleton
    ├── services/
    │   ├── __init__.py
    │   └── base.py          # BaseService generic abstraction
    ├── core/
    │   ├── __init__.py
    │   ├── security.py      # Password hashing & JWT token handling
    │   └── dependencies.py  # Dependency injection definitions
    └── utils/
        ├── __init__.py
        └── logger.py        # Centralized logging configuration
```

---

## Getting Started

### 1. Environment Setup

Create and activate a virtual environment:

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 2. Configuration

Copy the sample environment file and configure values for your PostgreSQL database:

```bash
cp .env.example .env
```

### 3. Database Setup & Migrations (PostgreSQL)

You can verify, migrate, and seed the entire database automatically with one command:

```bash
# Automated setup (checks connection, applies migrations, seeds demo data if empty)
python setup_database.py

# Optional flags:
python setup_database.py --check    # Check table inventory without modifying data
python setup_database.py --seed     # Force seed demo rosters, DNA, and stats
python setup_database.py --reset    # Wipe tables, re-migrate and re-seed from scratch
```

Or apply Alembic migrations manually:

```bash
# Upgrade database to head
alembic upgrade head
```

### 4. Running the Development Server

Start the application with hot reload:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Interactive API Docs (Swagger UI)**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **ReDoc**: [http://localhost:8000/api/v1/redoc](http://localhost:8000/api/v1/redoc)
- **Root Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
- **Versioned Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
