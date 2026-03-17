# GetRich — A Richup.io Clone

A full-stack, real-time multiplayer board game built with **React + TypeScript** on the frontend and **Django + Django Channels** on the backend. Inspired by [Richup.io](https://richup.io).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Running with Docker](#running-with-docker)
- [Environment Variables](#environment-variables)
- [Architecture Overview](#architecture-overview)
- [WebSocket Protocol](#websocket-protocol)
- [Game Mechanics (Target)](#game-mechanics-target)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

GetRich is a browser-based, real-time multiplayer game where 2–6 players compete to accumulate wealth by buying properties, collecting rent, and bankrupting opponents. The game loop runs entirely over WebSockets, with the backend acting as the authoritative game state manager.

**Current Status:** Early development — room creation, WebSocket handshake, and echo server are functional.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations |
| shadcn/ui | Component library |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Django 5.x | Web framework |
| Django Channels 4.x | WebSocket / async support |
| Django REST Framework | REST API layer |
| Daphne | ASGI server |
| Redis | Channel layer (pub/sub for WebSockets) |
| PostgreSQL | Primary database |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Local development & deployment |
| Nginx | Reverse proxy (production) |
| GitHub Actions | CI/CD |

> **Note:** The current backend uses FastAPI. The plan is to migrate to Django + Django Channels for a richer ORM, admin panel, auth, and ecosystem.

---

## Project Structure

```
getrich/
├── frontend/                   # React + TypeScript app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx     # Home / lobby page
│   │   │   └── Room.tsx        # Game room page
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui primitives
│   │   │   ├── game/           # Game-specific components (board, player, etc.)
│   │   │   └── lobby/          # Lobby & room components
│   │   ├── hooks/              # Custom React hooks (useWebSocket, useGame, etc.)
│   │   ├── store/              # Global state (Zustand recommended)
│   │   ├── types/              # Shared TypeScript interfaces
│   │   ├── lib/                # Utility functions
│   │   ├── routes/
│   │   │   └── routes.tsx
│   │   └── App.tsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                    # Django application
│   ├── config/                 # Django project settings
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   ├── asgi.py             # ASGI entrypoint (required for Channels)
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── rooms/              # Room creation, listing, joining
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   ├── consumers.py    # WebSocket consumers
│   │   │   ├── routing.py      # WS URL routing
│   │   │   └── urls.py
│   │   ├── game/               # Core game logic
│   │   │   ├── engine.py       # Game state machine
│   │   │   ├── models.py
│   │   │   └── actions.py
│   │   └── accounts/           # User auth (future)
│   ├── manage.py
│   └── requirements/
│       ├── base.txt
│       ├── development.txt
│       └── production.txt
│
├── docker/
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── nginx/
│       └── nginx.conf
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── README.md
└── TODO.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- Python >= 3.11
- Redis (for Django Channels layer)
- PostgreSQL >= 14
- Docker & Docker Compose (optional but recommended)

---

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate        # macOS/Linux
.venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements/development.txt

# 4. Copy environment file
cp ../.env.example ../.env
# Edit .env with your local values

# 5. Apply migrations
python manage.py migrate

# 6. Create a superuser (optional)
python manage.py createsuperuser

# 7. Run the development server (Daphne for WebSocket support)
daphne -p 8000 config.asgi:application

# Or for HTTP only during early dev:
python manage.py runserver
```

---

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:8000

# 4. Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

### Running with Docker

```bash
# Start all services (backend, frontend, redis, postgres)
docker-compose up --build

# Run migrations inside container
docker-compose exec backend python manage.py migrate

# Stop services
docker-compose down
```

---

## Environment Variables

### Frontend (`.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (`.env`)

```env
# Django
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/getrich

# Redis (Channel Layer)
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## Architecture Overview

```
Browser (React)
     │
     │  HTTP REST  ──────────────────────────►  Django REST API
     │                                           (rooms, auth)
     │
     │  WebSocket  ──────────────────────────►  Django Channels Consumer
     │                                           │
     │                                           ▼
     │                                        Channel Layer (Redis)
     │                                           │
     │                                           ▼
     │                                        Game Room Group
     │◄──────────────────────────────────────  Broadcast to all players
```

**Key design decisions:**
- The **backend is the single source of truth** for all game state. The frontend only renders what the server sends.
- All game actions (roll dice, buy property, pay rent) are **messages sent over WebSocket**, validated server-side.
- Redis channel groups allow **broadcasting** to all players in a room simultaneously.

---

## WebSocket Protocol

All messages are JSON. Every message has a `type` field.

### Client → Server

```json
{ "type": "roll_dice" }
{ "type": "buy_property", "property_id": 12 }
{ "type": "pass_turn" }
{ "type": "chat", "message": "good luck!" }
```

### Server → Client

```json
{ "type": "game_state", "state": { ... } }
{ "type": "player_moved", "player_id": "abc", "position": 7 }
{ "type": "error", "code": "NOT_YOUR_TURN", "message": "Wait for your turn." }
{ "type": "chat", "player": "Alice", "message": "good luck!" }
```

---

## Game Mechanics (Target)

- 2–6 players per room
- Classic Monopoly-like board with 40 tiles: properties, chance, tax, go, jail, etc.
- Players roll two dice each turn and move their token
- Unowned properties can be purchased; owned properties charge rent to landing players
- Property sets can be upgraded for higher rent
- Players eliminated when they cannot pay debts
- Last player solvent wins

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit with conventional commits: `git commit -m "feat: add dice roll animation"`
4. Push and open a PR

Please read the Cursor rules (`.cursor/rules/`) for code style and conventions before contributing.

---

## License
TBD
