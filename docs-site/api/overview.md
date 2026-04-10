# API Overview

The Ember Galaxies API runs on `http://localhost:3000` and follows REST conventions. All game data endpoints are prefixed with `/api`.

## Base URL

```
http://localhost:3000
```

## Rate Limits

| Tier | Limit | Scope |
|------|-------|-------|
| Global | 60 req/min | All `/api/*` routes |
| Heavy | 5 req/min | Specific expensive operations |

Rate limits are per-player and enforced via API key authentication.

## Common Response Format

**Success:**
```json
{
  "id": "clx...",
  "name": "Player One",
  ...
}
```

**Error:**
```json
{
  "error": "Not enough resources",
  "missing": { "iron": 200, "silver": 0 }
}
```

## Endpoint Overview

| Category | Prefix | Description |
|----------|--------|-------------|
| Game | `/api/game` | Player state, planets, galaxy view |
| Buildings | `/api/building` | Construction & upgrades |
| Research | `/api/research` | Tech tree progression |
| Shipyard | `/api/shipyard` | Ship production |
| Fleet | `/api/fleet` | Fleet launch, recall, simulate |
| Health | `/api/health` | Server status (no auth) |
| WebSocket | `/ws` | Real-time events |

## WebSocket

Connect to `/ws` for real-time updates. Send a subscription message after connecting:

```json
{ "type": "subscribe", "playerId": "your-player-id" }
```

### Events

| Event | Description |
|-------|-------------|
| `building_complete` | A building finished upgrading |
| `ship_complete` | Ship production finished |
| `fleet_arrival` | A fleet arrived at its destination |
| `research_complete` | Research finished |