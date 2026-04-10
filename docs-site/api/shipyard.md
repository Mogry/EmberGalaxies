# Shipyard API

Build and manage ships on planets.

## Get Shipyard Status

Returns current build queue and ship stock for a planet.

```
GET /api/shipyard/planet/:planetId
```

**Response:**
```json
{
  "queue": [
    {
      "shipType": "scout",
      "count": 5,
      "isBuilding": true,
      "buildFinishAt": "2026-04-10T15:00:00Z"
    }
  ],
  "stock": [
    {
      "shipType": "fighter",
      "count": 10
    }
  ]
}
```

## Build Ships

Starts production of ships on a planet.

```
POST /api/shipyard/build
```

**Body:**
```json
{
  "planetId": "clx...",
  "shipType": "fighter",
  "count": 5
}
```

**Rules:**
- Planet must have a shipyard building (level ≥ 1)
- Can only build one ship type at a time per planet
- Must have enough resources
- Build time: `baseTime × count × 0.9^(shipyardLevel - 1)`

**Response:** Queue entry with completion timestamp (201).

## Cancel Ship Production

Cancels active ship production. **No refund.**

```
POST /api/shipyard/cancel
```

**Body:**
```json
{
  "planetId": "clx...",
  "shipType": "scout"
}
```

**Response:**
```json
{ "success": true }
```