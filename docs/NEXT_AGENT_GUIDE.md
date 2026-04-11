# Docker/Postgres Stabilitätsproblem

## Symptom
`PrismaClientInitializationError: Can't reach database server at localhost:5432`

## Root Cause
Docker Desktop auf dieser Maschine (macOS) stirbt/stoppt regelmäßig. Der `ember-galaxies-db` Container läuft nicht stabil und wird nach einer Weile `Exited (255)`.

## Lösung

### Vor jedem Test/Entwicklung:
```bash
# 1. Prüfe ob postgres läuft
docker ps | grep ember-galaxies-db

# 2. Falls nicht: Container starten
docker start ember-galaxies-db

# 3. Warten bis healthy (5-10 Sekunden)
docker ps | grep postgres  # sollte "healthy" zeigen

# 4. Server starten
bun run dev:server

# 5. Tests starten
cd apps/server && bun test src/routes/fleet.test.ts
```

### Prüfen ob postgres wirklich erreichbar ist:
```bash
nc -zv localhost 5432
# Erwartet: "Connection successful" oder ähnlich
# Falls "Connection refused": Docker postgres läuft nicht
```

### Alternative: Docker Compose komplett neu starten
```bash
docker-compose down
docker-compose up -d
sleep 10
docker ps  # Verifizieren dass postgres healthy ist
```

---

# Fleet Launch Cargo+Fuel Validierung

## Implementierte Änderungen

### 1. `packages/shared/src/ships.ts`
- `fly.hangarCapacity` auf `100` gesetzt (war `0`)

### 2. `packages/shared/src/distance.ts`
- Bugfix: `GALAXY_STEP_COST` → `GALAXY_STEP_DIST` (Tippfehler)
- `hyperspace.interGalaxy = true` (war `false`)
- `nexus.interGalaxy = true` (war `false`)
- `phoenix.interGalaxy = true` (war `false`)

### 3. `apps/server/prisma/schema.prisma`
- `Galaxy` model: `index Int @default(0)` hinzugefügt
- **Ohne dieses Feld haben alle Galaxien `index: null`** → Distanz-Berechnung kaputt

### 4. `apps/server/src/routes/fleet.ts`
Neue Hard Rule (nach H2-Balance-Check):
```typescript
const isRoundTripMission = ['attack','transport','espionage','invasion','destroy'].includes(mission);
const totalFuelCost = isRoundTripMission ? h2Cost * 2 : h2Cost;
const totalCapacity = ships.reduce((sum, s) => sum + stats.cargo * s.count, 0);

if (totalCapacity < totalFuelCost + totalResources) {
  return c.json({ error: "Not enough cargo capacity for H2 fuel..." }, 400);
}
```

Außerdem: Drive-Selection Fallback auf alle Spieler-Antriebe wenn keine gemeinsamen.

### 5. Test: `apps/server/src/routes/fleet.test.ts`
Zwei Tests:
- **Test 1**: fly (cargo=50) über 50 Galaxien → 400 `cargo` + `fuel` error
- **Test 2**: carrier_titan (cargo=50000) → 201 success

### Math:
- Distanz G1→G51 = 27,100 DE
- H2 Kosten (fly, hyperspace): `1 × 27100 × 0.001 × 2.0 = 54.2` pro Leg
- Round Trip: ~108 H2
- fly cargo: 50 → **50 < 108 → 400 error**
