# WebSocket API

Real-time event stream for game state changes.

## Connect

```
ws://localhost:3000/ws
```

## Subscribe

After connecting, send a subscription message to receive events for a specific player:

```json
{
  "type": "subscribe",
  "playerId": "your-player-id"
}
```

**Response:**
```json
{
  "type": "subscribed",
  "playerId": "clx...",
  "timestamp": "2026-04-10T12:00:00.000Z"
}
```

## Events

### `connected`
Sent immediately upon WebSocket connection.

```json
{
  "type": "connected",
  "timestamp": "2026-04-10T12:00:00.000Z"
}
```

### `building_complete`
A building finished upgrading.

```json
{
  "type": "building_complete",
  "planetId": "clx...",
  "buildingType": "iron_mine",
  "newLevel": 3
}
```

### `ship_complete`
Ship production finished.

```json
{
  "type": "ship_complete",
  "planetId": "clx...",
  "shipType": "fighter",
  "count": 5
}
```

### `fleet_arrival`
A fleet arrived at its destination.

```json
{
  "type": "fleet_arrival",
  "fleetId": "clx...",
  "targetPlanetId": "clx...",
  "mission": "attack"
}
```

### `research_complete`
Research finished.

```json
{
  "type": "research_complete",
  "researchType": "drive_ion",
  "newLevel": 2
}
```

## Important Notes

- Events fire when a connected client queries state and expired timers are detected
- If no client is connected, events are processed on the next query (lazy evaluation)
- The WebSocket connection itself is not rate-limited (only `/api/*` routes are)
- If the connection drops, reconnect and re-subscribe