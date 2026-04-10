# Buildings API

Manage building construction and upgrades on planets.

## Get Planet Buildings

Returns all buildings on a planet with their construction queue status.

```
GET /api/building/planet/:planetId
```

**Response:**
```json
[
  {
    "id": "clx...",
    "type": "iron_mine",
    "level": 2,
    "constructionQueue": []
  },
  {
    "id": "clx...",
    "type": "zentrale",
    "level": 1,
    "constructionQueue": [
      {
        "targetLevel": 2,
        "upgradeFinishAt": "2026-04-10T15:30:00Z"
      }
    ]
  }
]
```

## Construct New Building

Starts construction of a new building on a planet.

```
POST /api/building/construct
```

**Body:**
```json
{
  "planetId": "clx...",
  "buildingType": "iron_mine"
}
```

**Rules:**
- Only one building can be upgrading per planet at a time
- Building type must not already exist on the planet
- Planet must have sufficient resources

**Response:** Full planet object with updated buildings and resources.

## Upgrade Building

Upgrades an existing building to the next level.

```
POST /api/building/upgrade
```

**Body:**
```json
{
  "planetId": "clx...",
  "buildingType": "iron_mine"
}
```

**Rules:**
- Only one upgrade per planet at a time
- Must have enough resources
- Build time scales quadratically: `(level + 1)² × 60s`

**Response:** Full planet object with construction queue.

## Cancel Building

Cancels an active building upgrade and refunds resources.

```
POST /api/building/cancel
```

**Body:**
```json
{
  "planetId": "clx...",
  "queueId": "clx..."
}
```

**Response:** Full planet object with refunded resources.