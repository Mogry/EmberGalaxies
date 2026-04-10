# Fleet API

Launch, recall, and simulate fleet movements.

## Launch Fleet

Sends a fleet from one planet to another.

```
POST /api/fleet/launch
```

**Body:**
```json
{
  "playerId": "clx...",
  "originPlanetId": "clx...",
  "targetPlanetId": "clx...",
  "ships": [
    { "type": "fighter", "count": 10 },
    { "type": "transport", "count": 2 }
  ],
  "mission": "attack",
  "resources": {
    "iron": 500,
    "silver": 200
  }
}
```

**Validation:**
1. Origin planet must belong to the player
2. Player must have enough ships on the origin planet
3. Available drives are determined by research levels
4. Best drive is auto-selected for the flight type
5. Fleet hangar must accommodate all ships (transports carry smaller ships)
6. Must have enough H2 for the flight
7. Total cargo must fit all resources being transported

**Response:**
```json
{
  "fleet": {
    "id": "clx...",
    "mission": "attack",
    "launchedAt": "2026-04-10T12:00:00Z",
    "arrivesAt": "2026-04-10T14:30:00Z",
    "returnsAt": "2026-04-10T17:00:00Z",
    "ships": [...]
  },
  "distance": 1250,
  "drive": "hyper",
  "flightSeconds": 9000,
  "h2Cost": 340
}
```

## Get Player Fleets

Returns all fleets for a player.

```
GET /api/fleet/player/:playerId
```

## Recall Fleet

Recalls a fleet that is currently in transit. The fleet returns to its origin planet.

```
POST /api/fleet/:fleetId/recall
```

**Body:**
```json
{
  "playerId": "clx..."
}
```

**Rules:**
- Fleet must belong to the player
- Fleet must not have already arrived
- Return time = time already flown (mirror of elapsed flight time)

## Simulate Fleet

Dry run: calculates flight time, H2 cost, and drive options without actually launching.

```
POST /api/fleet/simulate
```

**Body:**
```json
{
  "originPlanetId": "clx...",
  "targetPlanetId": "clx...",
  "ships": [
    { "type": "fighter", "count": 10 }
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "drive": "combustion",
      "flightSeconds": 36000,
      "h2Cost": 500,
      "distance": 1250,
      "flightType": "interSystem",
      "possible": true
    },
    {
      "drive": "hyper",
      "flightSeconds": 1200,
      "h2Cost": 250,
      "distance": 1250,
      "flightType": "interSystem",
      "possible": true
    }
  ],
  "distance": 1250,
  "flightType": "interSystem"
}
```

This endpoint saves API calls — simulate first, then launch with the best drive.