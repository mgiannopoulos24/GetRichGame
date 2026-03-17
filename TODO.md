# GetRich — TODO & Roadmap

Progress tracker for building a Richup.io clone. Tasks are grouped by milestone and priority.

**Legend:** `[ ]` = not started · `[~]` = in progress · `[x]` = done

---

## Milestone 0 — Foundation (Current)

### Backend
- [x] Project scaffolding (FastAPI → migrating to Django)
- [x] Room creation endpoint (`POST /api/v1/rooms/create/`)
- [x] Basic WebSocket echo server
- [x] Pydantic models for messages
- [ ] **Migrate backend from FastAPI → Django + Django Channels**
  - [ ] Set up Django project with `config/settings/` split (base, dev, prod)
  - [ ] Install and configure Django Channels 4 + Daphne
  - [ ] Configure Redis channel layer (`channels_redis`)
  - [ ] Write `asgi.py` with `ProtocolTypeRouter`
  - [ ] Re-implement room creation as a DRF `APIView` or `ViewSet`
  - [ ] Re-implement WebSocket consumer as a `JsonWebsocketConsumer`
  - [ ] Set up PostgreSQL with `django-environ` for DB URL parsing
  - [ ] Initial Django migrations
  - [ ] Health check endpoint

### Frontend
- [x] Vite + React + TypeScript scaffolding
- [x] React Router v6 setup
- [x] Landing page with Play Now button
- [x] Room page with WebSocket connection and loading state
- [x] Tailwind CSS + shadcn/ui setup
- [x] Framer Motion animations
- [ ] Move hardcoded rules to a config/constants file
- [ ] Remove unused `Room` import in `Landing.tsx`
- [ ] Add `.env.example` file

### Infrastructure
- [ ] Docker Compose for local dev (frontend, backend, redis, postgres)
- [ ] Write `Dockerfile` for Django backend
- [ ] Write `Dockerfile` for React frontend (multi-stage)
- [ ] Add `.env.example` to repo root
- [ ] Add `.gitignore` entries for `.env`, `__pycache__`, `node_modules`, `.venv`

---

## Milestone 1 — Lobby & Room Management

### Backend
- [ ] `Room` Django model (id, code, status, max_players, created_at, host)
- [ ] Room status enum: `waiting`, `in_progress`, `finished`
- [ ] `GET /api/v1/rooms/` — list open rooms (paginated)
- [ ] `GET /api/v1/rooms/<room_id>/` — get single room info
- [ ] `POST /api/v1/rooms/create/` — create room (persist to DB)
- [ ] `POST /api/v1/rooms/<room_id>/join/` — join room
- [ ] Room capacity enforcement (max 6 players)
- [ ] Room expiry / cleanup (rooms idle > 30 min)
- [ ] WebSocket consumer: broadcast player join/leave events to room group
- [ ] WebSocket consumer: send current room state on connect

### Frontend
- [ ] "All Rooms" page — fetches and lists open rooms
- [ ] "Private Room" flow — creates invite-only room, generates shareable URL
- [ ] Lobby page (inside `/room/:roomId` before game starts)
  - [ ] Player list with avatars/colors
  - [ ] Ready up button
  - [ ] Host "Start Game" button (active only when all ready)
  - [ ] Copy room link button
  - [ ] Live player count via WebSocket
- [ ] `useWebSocket` custom hook (encapsulate WS lifecycle, auto-reconnect)
- [ ] Connection status indicator component (green dot / spinner)
- [ ] Toast notifications for join/leave events

---

## Milestone 2 — Core Game Board

### Backend
- [ ] `GameState` model / in-memory structure:
  - Board tiles (40 tiles, typed: property, railroad, utility, tax, chance, community chest, go, jail, free parking, go-to-jail)
  - Player list with position, balance, owned properties, jail status
  - Current player index
  - Dice values
  - Game phase (waiting, rolling, buying, paying, etc.)
- [ ] `POST /api/v1/game/<room_id>/start/` — initialize game state, broadcast to room
- [ ] Game engine actions (server-authoritative):
  - [ ] `roll_dice` — generate random 2d6, move player, detect doubles
  - [ ] `buy_property` — validate ownership, deduct balance
  - [ ] `pay_rent` — calculate rent, transfer funds
  - [ ] `pass_turn` — advance current player index
  - [ ] `go_to_jail` — move player to jail tile, set jail status
  - [ ] `pay_jail_fine` — deduct $50, clear jail status
  - [ ] `use_jail_card` — consume get-out-of-jail-free card
  - [ ] `collect_go` — award $200 when passing Go
- [ ] Broadcast full `game_state` delta after every action
- [ ] Turn timer (60s per turn, auto-pass on timeout)

### Frontend
- [ ] Game board component (SVG or CSS grid, 40 tiles in a square)
  - [ ] Tile component (name, price, color group, owner indicator)
  - [ ] Player token component (colored circle, smooth move animation)
  - [ ] Property color groups displayed correctly
- [ ] Dice component (animated roll, show result)
- [ ] Player info panel (balance, owned properties, current turn indicator)
- [ ] Action panel (context-sensitive buttons: Roll / Buy / Pass / Pay Rent)
- [ ] Game log / event feed (scrollable list of recent events)
- [ ] Turn timer UI (countdown bar)

---

## Milestone 3 — Full Game Rules

### Backend
- [ ] Property upgrade system (houses 1–4, then hotel)
  - [ ] `buy_house` action — validate full color set owned, deduct cost
  - [ ] `sell_house` action
  - [ ] Rent multipliers per house/hotel level
- [ ] Mortgage system
  - [ ] `mortgage_property` — receive 50% of property value
  - [ ] `unmortgage_property` — pay back 110%
- [ ] Trading system
  - [ ] `propose_trade` — offer properties + cash
  - [ ] `accept_trade` / `reject_trade`
- [ ] Chance & Community Chest cards
  - [ ] Card deck model (shuffled, cycled)
  - [ ] Card effects: move to tile, collect/pay money, get-out-of-jail, repairs
- [ ] Bankruptcy detection & elimination
- [ ] Win condition detection (last player solvent)
- [ ] Auction system (when player declines to buy)

### Frontend
- [ ] Property card modal (details, upgrade controls, mortgage button)
- [ ] Trade proposal UI (drag-and-drop or form)
- [ ] Chance / Community Chest card reveal animation
- [ ] Bankruptcy / elimination animation
- [ ] Win screen / game over overlay
- [ ] House and hotel indicators on board tiles

---

## Milestone 4 — User Accounts & Persistence

### Backend
- [ ] Django `AbstractUser` extension (username, avatar color, stats)
- [ ] JWT authentication (via `djangorestframework-simplejwt`)
- [ ] `POST /api/v1/auth/register/`
- [ ] `POST /api/v1/auth/login/`
- [ ] `POST /api/v1/auth/refresh/`
- [ ] `GET /api/v1/users/me/`
- [ ] Guest / anonymous play (session-based, no account required)
- [ ] Game history model (store completed games)
- [ ] Player stats (games played, wins, avg wealth)

### Frontend
- [ ] Login / Register modal (or page)
- [ ] Guest play option ("Play as Guest" button)
- [ ] Auth context / store (persisted JWT in localStorage)
- [ ] Protected routes (profile page)
- [ ] Profile page (stats, game history)
- [ ] Avatar color picker

---

## Milestone 5 — Polish & UX

### Frontend
- [ ] Sound effects (dice roll, buy property, pay rent, win/lose)
- [ ] Background music toggle
- [ ] Responsive design / mobile-friendly layout
- [ ] Dark mode (already partially there)
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Chat box in-game (send messages to room)
- [ ] Emoji reactions
- [ ] Player ready animations
- [ ] Smooth token movement (path-based animation between tiles)
- [ ] Confetti / celebration effect on win

### Backend
- [ ] Rate limiting on room creation and WS messages
- [ ] Input sanitization on chat messages
- [ ] Logging with structured JSON output
- [ ] Sentry integration for error tracking

---

## Milestone 6 — Production Readiness

### Infrastructure
- [ ] Nginx reverse proxy config (HTTP + WS upgrade)
- [ ] Let's Encrypt SSL (Certbot)
- [ ] `docker-compose.prod.yml` with production settings
- [ ] Static file serving (Whitenoise or S3)
- [ ] Django `ALLOWED_HOSTS`, `DEBUG=False`, `SECRET_KEY` from env
- [ ] PostgreSQL backups (automated, e.g. pg_dump to S3)
- [ ] Redis persistence config
- [ ] Horizontal scaling for Channels (Redis channel layer supports this natively)

### CI/CD
- [ ] GitHub Actions workflow:
  - [ ] Lint frontend (ESLint, TypeScript check)
  - [ ] Lint backend (flake8, black, isort)
  - [ ] Run backend tests (`pytest`)
  - [ ] Run frontend tests (Vitest)
  - [ ] Build Docker images
  - [ ] Deploy to server on merge to `main`

### Testing
- [ ] Backend unit tests for game engine actions
- [ ] Backend integration tests for WebSocket consumers (using `channels.testing`)
- [ ] Backend API tests for REST endpoints
- [ ] Frontend unit tests for game logic utilities
- [ ] Frontend component tests (React Testing Library)
- [ ] E2E tests (Playwright) for critical paths: create room → join → start game → win

---

## Bugs & Known Issues

- [ ] `Landing.tsx` has an unused `import { Room }` — remove it
- [ ] WebSocket URL construction assumes `window.location.origin` which fails in some proxy setups — needs env-var-only approach
- [ ] Room IDs are not persisted to any database yet — restart loses all rooms
- [ ] No reconnect logic if WebSocket drops mid-game
- [ ] No error boundary around the `Room` component

---

## Nice to Have (Post-v1)

- [ ] Spectator mode
- [ ] Replay system (record all game events, play back)
- [ ] Custom board themes / skins
- [ ] Tournament bracket system
- [ ] Friends list & private invites
- [ ] Leaderboard (global ELO-style ranking)
- [ ] Mobile app (React Native or PWA)
- [ ] Internationalization (i18n) — multiple languages
- [ ] AI bot players (for solo practice or filling empty slots)
