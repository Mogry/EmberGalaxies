# Lazy Evaluation

Ember Galaxies has **no game loop**. Instead, everything is calculated on demand using timestamps.

## How It Works

When you perform an action (build, research, launch fleet), the server records a **completion timestamp**:

```
buildFinishAt: 2026-04-10T14:30:00Z
```

When anyone queries that planet later, the server checks:

1. Is `buildFinishAt` in the past? → Building is complete.
2. How much time has passed since last resource tick? → Calculate production.
3. Has a fleet arrived? → Update fleet status.

## Why This Works

| Traditional MMO | Ember Galaxies |
|-----------------|----------------|
| Game loop runs every tick | No loop, idle when unused |
| Server calculates every player every tick | Only calculates when queried |
| Offline players miss ticks | Offline production works naturally |
| CPU scales with player count | CPU scales with query volume |

## Offline Production

Since time is the only variable, **offline production works automatically**:

- You log out at 10:00 with a mine producing 10 iron/hour
- You log in at 14:00 → Server calculates 4 hours × 10 = 40 iron produced
- No catch-up mechanics needed — time IS the mechanic

## Timer-Based Events

The server uses WebSocket to broadcast events when completions are detected:

- `building_complete` — A building finished
- `ship_complete` — A ship was produced
- `fleet_arrival` — A fleet reached its destination
- `research_complete` — Research finished

These events fire when a connected client queries state and a timer is found to be past due.