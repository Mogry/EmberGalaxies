# Pi Agent — Quick Start Guide

## Connection
```
BASE_URL = http://localhost:3000/api
```

## Identity
```
playerId = pi-agent-001
homePlanetId = cmnmvbe1w000613rok8erpaey
```

---

## Your Planet
```
GET /api/game/planets/pi-agent-001
```

Returns your planets with buildings, resources, and ships.

---

## Resources

You have:
- `iron`, `silver`, `ember`, `h2`, `energy`

Resource production comes from buildings (iron_mine, silver_mine, fusion_plant, etc.). Check `GET /api/game/planets/pi-agent-001` to see current amounts.

---

## Buildings

### Check buildings
```
GET /api/building/planet/{planetId}
```

### Build a new building
```
POST /api/building/construct
Body: { "planetId": "...", "buildingType": "shipyard" }
```

Available building types:
- `iron_mine`, `silver_mine`, `uderon_raffinery`, `h2_refinery`, `fusion_plant`
- `research_center`, `shipyard`, `space_station`, `anti_spy`, `planetary_shield`

### Upgrade a building
```
POST /api/building/upgrade
Body: { "planetId": "...", "buildingType": "iron_mine" }
```

Multiple upgrades can run at the same time.

### Cancel upgrade
```
POST /api/building/cancel
Body: { "planetId": "...", "queueId": "..." }
```

---

## Ships

### Build ships (need shipyard first)
```
POST /api/shipyard/build
Body: { "planetId": "...", "shipType": "fly", "count": 100 }
```

Available ship types:
- `fly` — cheapest fighter
- `bumblebee`, `corvette`, `light_cruiser`, `heavy_cruiser`
- `battleship`, `battleship_nexus`, `battleship_phoenix`
- `carrier_titan` — huge cargo
- `colonizer` — colonize new planets
- `invasion_unit` — attack enemy planets
- `ember_bomb` — planet destroyer

### Check queue and stock
```
GET /api/shipyard/planet/{planetId}
```

---

## Research

### Start research
```
POST /api/research/start
Body: { "playerId": "pi-agent-001", "researchType": "combustion_drive" }
```

Drive research types (for faster fleets):
- `combustion_drive`, `ion_drive`, `hyper_drive`, `nexus_drive`, `interdimensional_drive`

Other useful research:
- `iron_mining`, `silver_mining`, `h2_refining` — resource production
- `laser_technology`, `weapons_technology` — combat
- `astrophysics` — colony expansion

---

## Fleets (Advanced)

### Simulate a fleet mission
```
POST /api/fleet/simulate
Body: {
  "originPlanetId": "...",
  "targetPlanetId": "...",
  "ships": [{ "type": "fly", "count": 100 }]
}
```

Returns distance, flight time, and H2 cost for each drive type.

### Launch fleet
```
POST /api/fleet/launch
Body: {
  "playerId": "pi-agent-001",
  "originPlanetId": "...",
  "targetPlanetId": "...",
  "ships": [{ "type": "fly", "count": 100 }],
  "mission": "attack",
  "resources": { "iron": 1000 }
}
```

Missions: `attack`, `transport`, `deployment`, `colonize`, `harvest`, `espionage`

### Check your fleets
```
GET /api/fleet/player/pi-agent-001
```

### Recall fleet
```
POST /api/fleet/{fleetId}/recall
Body: { "playerId": "pi-agent-001" }
```

---

## Finding Planets

### Check a galaxy/system
```
GET /api/game/galaxy/1/system/1
```

Shows all planets in a system — who owns them, if they're free.

### Colonize (need colonizer ship + fleet mission)
Use `POST /api/fleet/launch` with `mission: "colonize"` and a `colonizer` ship.

---

## State Refresh

After any action, refetch planet state:
```
GET /api/game/planets/pi-agent-001
```

Buildings and ships complete in real-time. Open games typically run at 10x speed (1 minute = 6 seconds).
