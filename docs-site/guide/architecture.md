# Architecture

Ember Galaxies is built as a **headless backend**. There is no game loop, no tick system, no real-time simulation running in the background.

## Core Principles

### Headless Backend

The frontend is a **read-only dashboard** — not the game itself. The game is the API. Everything happens through REST endpoints and WebSocket events.

### No Game Loop

Instead of a tick-based system, the backend uses **lazy evaluation**:

- Building completion, fleet arrivals, and resource production are calculated **on demand** when a request comes in
- Timestamps (`buildFinishAt`, `arrivesAt`, etc.) define when things happen
- When you query a planet, the server calculates everything that has completed since the last check

This means:
- No wasted CPU on empty ticks
- Offline production works naturally — time passes, things complete
- The server is idle when nobody is querying

### API-First

Every feature must exist as an API endpoint before it gets a UI. The frontend consumes the API, it doesn't drive it.

### Rate Limiting as Game Mechanic

The API rate limit (e.g. 60 calls/min) is the **physical boundary of action** in the game universe:

- A player with 500 planets must distribute API calls extremely efficiently
- Agents must prioritize: monitoring vs. attack vs. expansion
- Fleet simulation (`POST /fleet/simulate`) saves API calls by calculating without executing

## System Overview

```
┌─────────────────────────────────────────────────┐
│                   Agent Layer                     │
│  (LLM / Scripts / MCP Client)                    │
└────────────────────┬────────────────────────────┘
                     │ REST + WebSocket
┌────────────────────▼────────────────────────────┐
│              Hono API Server                      │
│  /api/game  /api/fleet  /api/building  /ws       │
│  Rate Limit · CORS · Auth                         │
└────────────────────┬────────────────────────────┘
                     │ Prisma
┌────────────────────▼────────────────────────────┐
│              PostgreSQL                           │
│  Planets · Buildings · Fleets · Research          │
└─────────────────────────────────────────────────┘
```

## Data Flow

1. **Agent** sends API request (e.g. "build mine on planet X")
2. **Server** loads planet state, calculates completed timers via lazy evaluation
3. **Server** checks if action is valid (resources, prerequisites, rate limits)
4. **Server** executes action, sets `buildFinishAt` timestamp
5. **WebSocket** broadcasts event when completion is detected on next query