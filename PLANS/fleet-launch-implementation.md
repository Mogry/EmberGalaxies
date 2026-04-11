# Plan: `POST /api/fleets/launch` — Fleet Launch Endpoint

## Context

The route already exists at `POST /api/fleet/launch` (mounted via `app.route('/api/fleet', fleetRoutes)`). The handler exists but has critical gaps:
- No `invasion` or `destroy` mission support
- `FleetMission` missing from TypeScript shared types
- Fleet creation happens **outside** the transaction (data loss risk)
- `SHIP_STATS` lacks `speed` and `h2Factor` fields needed by `calculateFlightTime` / `calculateH2Cost`
- Mission-specific ship requirements (colonizer for `colonize`, ember_bomb for `destroy`) not validated

---

## Step 1 — Add missing `FleetMission` values

**Files:**
- `apps/server/prisma/schema.prisma` — add `invasion`, `destroy` to `FleetMission` enum
- `packages/shared/src/types.ts` — add `invasion`, `destroy` to `FleetMission` type union
- `packages/shared/src/index.ts` — ensure `FleetMission` is re-exported

**Action:** `prisma db push` after schema change

---

## Step 2 — Add missing ship stats (`speed`, `h2Factor`)

**File:** `packages/shared/src/ships.ts`

Add to each ship entry:
```typescript
speed: number;    // ly per distance unit — determines flight time
h2Factor: number; // multiplied by distance * totalWeight for H2 cost
```

Estimated values based on ship class tier:
- `fly`: speed 1.0, h2Factor 0.001
- `bumblebee`: speed 1.2, h2Factor 0.0012
- `corvette`: speed 1.5, h2Factor 0.0015
- `light_cruiser`: speed 1.8, h2Factor 0.002
- `heavy_cruiser`: speed 2.0, h2Factor 0.0025
- `battleship`: speed 2.5, h2Factor 0.003
- `battleship_nexus`: speed 3.0, h2Factor 0.0035
- `battleship_phoenix`: speed 4.0, h2Factor 0.004
- `carrier_titan`: speed 1.5, h2Factor 0.005
- `colonizer`: speed 2.0, h2Factor 0.003
- `invasion_unit`: speed 2.0, h2Factor 0.003
- `ember_bomb`: speed 1.0, h2Factor 0.001

---

## Step 3 — Fix fleet creation transaction

**File:** `apps/server/src/routes/fleet.ts`

Move fleet + FleetShip creation **inside** the `$transaction` block. Current structure (broken):

```typescript
await prisma.$transaction([ /* ship decrements */ ]);
// ← fleet creation HERE = outside transaction
const fleet = await prisma.fleet.create({ ... });
```

Fixed structure:

```typescript
const [_, __, fleet] = await prisma.$transaction([
  ...ships.map(s => prisma.planetShip.update(...)),
  prisma.planet.update(...),           // deduct H2
  prisma.fleet.create({               // fleet creation inside transaction
    data: {
      ...fleetData,
      ships: { create: ships.map(s => ({ type: s.type, count: s.count })) }
    },
    include: { ships: true }
  }),
]);
```

---

## Step 4 — Add mission-specific validation

In the `POST /launch` handler, before mutation:

| Mission | Required ship | Validation |
|---------|--------------|------------|
| `colonize` | `colonizer` | Must have ≥1 `colonizer` in `ships` |
| `destroy` | `ember_bomb` | Must have ≥1 `ember_bomb` in `ships` |
| `attack`, `invasion` | none special | standard ship check |

---

## Step 5 — Update `calculateH2Cost` and `calculateFlightTime`

**File:** `packages/shared/src/distance.ts`

The functions already exist but reference `SHIP_STATS[type].speed` and `h2Factor` — once Step 2 is done, they should work.

**Flight time calculation:**
```
slowestSpeed = min(ships.map(s => SHIP_STATS[s.type].speed))
flightSeconds = distance * (1 / slowestSpeed) * BASE_TIME_FACTOR
```

**H2 cost calculation:**
```
totalWeight = ships.reduce((sum, s) => sum + s.count, 0)
h2Cost = Math.ceil(totalWeight * distance * DRIVE_H2_FACTOR)
```

---

## Step 6 — Add `fleet_launch` event type

**File:** `packages/shared/src/types.ts`

Add `fleet_launch` to `GameEventType`.

**Broadcast** in the route after successful fleet creation:
```typescript
broadcastToPlayer(playerId, {
  type: 'fleet_launch',
  data: { fleetId: fleet.id, arrivesAt: fleet.arrivesAt },
  timestamp: new Date().toISOString(),
});
```

---

## Step 7 — Verify

1. `prisma db push` succeeds
2. `npm run dev:server` starts without errors
3. Manually test via curl/Postman:
   - Valid launch (attack with normal ships)
   - `colonize` without colonizer → 400 error
   - `destroy` without ember_bomb → 400 error
   - Insufficient ships → 400 error
   - Insufficient H2 → 400 error
   - Successful launch → fleet created, ships/resources deducted

---

## Files to Modify

| File | Change |
|------|--------|
| `apps/server/prisma/schema.prisma` | Add `invasion`, `destroy` to enum |
| `packages/shared/src/types.ts` | Add to `FleetMission` type + add `fleet_launch` to `GameEventType` |
| `packages/shared/src/ships.ts` | Add `speed` and `h2Factor` per ship |
| `packages/shared/src/index.ts` | Ensure re-exports are complete |
| `apps/server/src/routes/fleet.ts` | Transaction fix + mission-specific validation + broadcast |
| `packages/shared/src/distance.ts` | Verify functions work with new stats (likely no change needed) |
