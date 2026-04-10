# Game API

Game endpoints provide read access to the universe structure and player state.

## Get Full Player State

Returns the complete game state for a player: planets, buildings, fleets, research.

```
GET /api/game/state/:playerId
```

**Response:**
```json
{
  "id": "clx...",
  "name": "Player One",
  "isBot": false,
  "planets": [...],
  "fleets": [...],
  "research": [...]
}
```

## Get Galaxy System View

Returns all planets in a specific system within a galaxy.

```
GET /api/game/galaxy/:galaxy/system/:system
```

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `galaxy` | int | Galaxy number (1-100) |
| `system` | int | System index within galaxy |

**Response:**
```json
{
  "galaxy": { "id": "...", "index": 1 },
  "system": { "id": "...", "index": 5, "star": {...} },
  "planets": [...]
}
```

## Get Planet Details

Returns a single planet with buildings, ships, and owner info.

```
GET /api/game/planet/:planetId
```

**Response:**
```json
{
  "id": "clx...",
  "name": "Player One's Homeworld",
  "slot": 3,
  "iron": 500,
  "silver": 250,
  "ember": 0,
  "h2": 0,
  "energy": 0,
  "system": { "galaxyIndex": 1, "index": 5 },
  "buildings": [...],
  "planetShips": [...],
  "owner": {...}
}
```

## Get All Player Planets

Returns all planets owned by a player with full details.

```
GET /api/game/planets/:playerId
```

## Create Player

Creates the single human player (or returns existing one) with a starter planet.

```
POST /api/game/player
```

**Body:**
```json
{
  "name": "Player One"
}
```

**Response:** Full player object with starter planet and buildings (201 on creation, 200 if existing).

## Colonize Planet

Colonize an unoccupied planet (dev mode — bypasses fleet system).

```
POST /api/game/planet/:planetId/colonize
```

## Create Starter Planet

Creates a second starter planet for a player.

```
POST /api/game/planet/starter/:playerId
```