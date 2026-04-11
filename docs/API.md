# Ember Galaxies — API Documentation

> **Base URL:** `http://localhost:3000/api`
> **Auth:** Alle `/api/*` Routen (außer `/api/health`) erfordern einen API-Key im `Authorization` Header.

Alle Endpunkte geben JSON zurück. Fehler haben die Form `{ "error": "message" }` mit passendem HTTP Status.

---

## Auth & Rate Limiting

### API-Key Auth
Jeder Request (außer `/api/health`) muss einen gültigen API-Key im `Authorization` Header senden:
```
Authorization: Bearer <api-key>
```

### Rate Limiting
- **Global:** 60 Requests/Min pro API-Key
- **Heavy Actions:** 5 Requests/Min (flotten-spezifische Aktionen)

### `GET /api/health`
Health Check (kein API-Key nötig).

**Response:**
```json
{ "status": "ok", "timestamp": "2026-04-09T12:00:00.000Z" }
```

---

## Game

### `GET /api/game/state/:playerId`
Holt den vollständigen Spielstand eines Spielers inklusive Planeten, Flotten und Forschung. Verarbeitet automatisch alle abgelaufenen Timer (Lazy Evaluation).

**Response:** `Player` Object mit:
- `planets[]` — Planeten mit `buildings`, `shipyards`, `planetShips`
- `fleets[]` — Flotten mit `ships`
- `research[]` — Forschungsstände

---

### `GET /api/game/galaxy/:galaxy/system/:system`
Holt alle Planeten in einem System.

**Parameter:**
- `galaxy` — Galaxie-Index (1–100)
- `system` — System-Index (0–299)

**Response:**
```json
{
  "galaxy": { "id": "...", "index": 1, "name": "Andromeda" },
  "system": { "id": "...", "index": 5, "star": { "temperature": 5778 } },
  "planets": [
    { "id": "...", "slot": 1, "owner": { "id": "...", "name": "Tobi" } }
  ]
}
```

---

### `GET /api/game/planet/:planetId`
Holt einen einzelnen Planeten mit allen Details.

**Response:** `Planet` mit `buildings`, `planetShips`, `system`, `star`.

---

### `GET /api/game/planets/:playerId`
Holt alle Planeten eines Spielers.

---

### `GET /api/game/player/:playerId`
Holt einen Spieler.

---

### `POST /api/game/player`
Erstellt einen neuen Spieler oder gibt existierenden zurück (Single-Player Modus).

**Body:**
```json
{ "name": "Tobi" }
```

**Response:** `Player` Object mit initialem Planeten.

---

### `POST /api/game/planet/starter/:playerId`
Erstellt einen neuen Kolonie-Planeten für einen Spieler (DEV-Modus).

---

### `POST /api/game/planet/:planetId/colonize`
Besiedelt einen unbesetzten Planeten (DEV-Modus).

---

### `POST /api/game/dev/resources/:planetId`
**DEV MODE ONLY.** Gibt 5000 von jeder Ressource auf einem Planeten.

---

## Buildings

### `GET /api/building/planet/:planetId`
Holt alle Gebäude auf einem Planeten inklusive `constructionQueue`.

**Response:** Array von `Building` Objekten mit verschachtelter `constructionQueue`.

---

### `POST /api/building/construct`
Baut ein neues Gebäude (level 0 → 1).

**Body:**
```json
{ "planetId": "...", "buildingType": "iron_mine" }
```

**BuildingType Enum:** `zentrale`, `iron_mine`, `silver_mine`, `uderon_raffinery`, `h2_refinery`, `fusion_plant`, `research_center`, `shipyard`, `space_station`, `anti_spy`, `planetary_shield`, `dummy_building`

**Hinweis:** Max 1 Upgrade pro Planet gleichzeitig. Ressourcen werden sofort abgezogen.

**Response:** Aktualisierter `Planet` mit allen Relationen.

---

### `POST /api/building/upgrade`
Upgradet ein existierendes Gebäude (level N → N+1).

**Body:**
```json
{ "planetId": "...", "buildingType": "iron_mine" }
```

**Response:** Aktualisierter `Planet`.

---

### `POST /api/building/cancel`
Bricht einen Bauauftrag ab und erstattet Ressourcen.

**Body:**
```json
{ "planetId": "...", "queueId": "..." }
```

**Hinweis:** Ressourcen werden vollständig erstattet.

---

## Shipyard

### `GET /api/shipyard/planet/:planetId`
Holt die Schiffbau-Queue und den Lagerbestand eines Planeten.

**Response:**
```json
{
  "queue": [
    { "id": "...", "shipType": "fly", "count": 100, "buildFinishAt": "2026-04-06T12:00:00Z" }
  ],
  "stock": [
    { "planetId": "...", "shipType": "fly", "count": 50 }
  ]
}
```

---

### `POST /api/shipyard/build`
Startet einen Schiffbau-Auftrag. Benötigt `shipyard` Gebäude auf dem Planeten.

**Body:**
```json
{ "planetId": "...", "shipType": "fly", "count": 100 }
```

**ShipType Enum:**
`fly`, `bumblebee`, `corvette`, `light_cruiser`, `heavy_cruiser`, `battleship`, `battleship_nexus`, `battleship_phoenix`, `carrier_titan`, `colonizer`, `invasion_unit`, `ember_bomb`

**Hinweis:** Pro Schiffstyp nur ein Auftrag gleichzeitig. Bauzeit = `baseTime × count × 0.9^(shipyardLevel-1)`.

**Response:** Das erstellte `Shipyard` Queue-Objekt.

---

### `POST /api/shipyard/cancel`
Bricht einen Schiffbau-Auftrag ab. Keine Rückerstattung.

**Body:**
```json
{ "planetId": "...", "shipType": "fly" }
```

---

## Fleet

### `POST /api/fleet/launch`
Startet eine Flotte vom Ursprungs- zum Zielplaneten.

**Body:**
```json
{
  "playerId": "...",
  "originPlanetId": "...",
  "targetPlanetId": "...",
  "ships": [
    { "type": "fly", "count": 100 },
    { "type": "corvette", "count": 20 }
  ],
  "mission": "attack",
  "resources": {
    "iron": 1000,
    "silver": 500
  }
}
```

**FleetMission Enum:** `attack`, `transport`, `deployment`, `colonize`, `harvest`, `espionage`, `invasion`, `destroy`

**Mission-spezifische Anforderungen:**
- `colonize` — Mindestens 1 `colonizer` Schiff erforderlich
- `destroy` — Mindestens 1 `ember_bomb` Schiff erforderlich
- `attack`, `invasion`, `destroy` — Lösen Kampfsystem bei Ankunft aus

**Was passiert:**
1. Schiffe werden vom Ursprungsplaneten abgezogen
2. H2-Kosten (Hinflug) werden vom Ursprungsplaneten abgezogen
3. Cargo-Kapazität wird geprüft: `totalCargo >= roundTripFuelCost + resources`
4. Flotte wird erstellt mit `arrivesAt` und `returnsAt`

**Response:**
```json
{
  "fleet": { "id": "...", "mission": "attack", "arrivesAt": "...", "returnsAt": "..." },
  "distance": 135515,
  "drive": "nexus",
  "flightSeconds": 452,
  "h2Cost": 677
}
```

---

### `GET /api/fleet/player/:playerId`
Holt alle Flotten eines Spielers mit Schiffen und Planeten-Relationen.

---

### `POST /api/fleet/:fleetId/recall`
Ruft eine fliegende Flotte zurück. Rückflugzeit = bereits verflogene Zeit.

**Body:**
```json
{ "playerId": "..." }
```

**Hinweis:** Funktioniert nur wenn Flotte noch nicht angekommen ist (`arrivesAt > now`).

---

### `POST /api/fleet/simulate`
Trockener Lauf — berechnet Flugzeit und H2-Kosten für alle verfügbaren Antriebe, ohne eine Flotte zu starten.

**Body:**
```json
{
  "originPlanetId": "...",
  "targetPlanetId": "...",
  "ships": [
    { "type": "fly", "count": 100 }
  ]
}
```

**Response:**
```json
{
  "distance": 135515,
  "flightType": "interSystem",
  "results": [
    { "drive": "combustion", "flightSeconds": 1355150, "h2Cost": 13551, "possible": true },
    { "drive": "ion", "flightSeconds": 542060, "h2Cost": 40653, "possible": true },
    { "drive": "nexus", "flightSeconds": 45171, "h2Cost": 2032, "possible": true }
  ]
}
```

---

## Research

### `GET /api/research/player/:playerId`
Holt alle Forschungsstände eines Spielers.

---

### `POST /api/research/start`
Startet eine Forschung. Pro Forschungstyp nur eine gleichzeitig aktiv.

**Body:**
```json
{ "playerId": "...", "researchType": "combustion_drive" }
```

**ResearchType Enum:**
```
iron_mining, silver_mining, ember_extraction, h2_refining, energy_efficiency,
laser_technology, ion_technology, hyperspace_technology, plasma_technology,
combustion_drive, ion_drive, hyper_drive, nexus_drive, interdimensional_drive,
espionage_technology, computer_technology, astrophysics,
intergalactic_research_network, graviton_technology,
shield_technology, armour_technology, weapons_technology
```

**Forschungszeit:** `(level + 1)² × 120` Sekunden. Bonus: +5% pro Level.

---

## Combat System

### Kampfablauf (deterministisch, 6 Runden)

Wenn eine Flotte mit Mission `attack`, `invasion` oder `destroy` ankommt, wird der Kampf automatisch aufgelöst.

**Algorithmus:**
1. Beide Seiten feuern gleichzeitig mit aktueller Angriffsstärke
2. Schaden wird proportional auf die gegnerischen HP-Pools verteilt
3. Jede Runde werden Schiffsverluste berechnet (`remainingHP / maxHP`, aufgerundet)
4. Maximal 6 Runden, oder bis eine Seite keine Schiffe mehr hat
5. Kein Zufall — identische Eingaben liefern identische Ergebnisse

**Tech-Boni (5% pro Level):**
- `weapons_technology` → Angriffsstärke
- `shield_technology` → Verteidigung (HP)
- `armour_technology` → Verteidigung (HP)

### Beuteberechnung (Loot)

Nur bei Angreifer-Sieg (`winner === 'ATTACKER'`):

```
availableLootSpace = totalCargoCapacity - returnFuelCost
lootableResource = planetResource × 0.5  (lootFactor)
```

Wenn `availableLootSpace >= totalLootable`: Alles nehmen.
Wenn `availableLootSpace < totalLootable`: Proportional verteilen (`fillRatio = availableLootSpace / totalLootable`).

**Return-Fuel-Berechnung:** Exakt basierend auf überlebenden Schiffen, Perlenschnur-Distanz und bestmöglichem Antrieb. Keine Heuristik.

### Missions-spezifische Effekte

| Mission | Sieg-Bedingung | Effekt bei Sieg |
|---------|----------------|-----------------|
| `attack` | Angreifer hat Schiffe | Beute + Rückflug |
| `invasion` | Angreifer hat Schiffe UND ≥1 `invasion_unit` überlebt | Beute + Planeten-Übernahme |
| `destroy` | Angreifer hat Schiffe UND ≥1 `ember_bomb` überlebt | Planet wird zerstört (Ressourcen=0, Besitzer=null) |

### CombatReport

Jeder Kampf erzeugt einen `CombatReport` in der Datenbank:

```typescript
{
  attackerId: string,
  defenderId: string,
  planetId: string,
  mission: FleetMission,
  winner: 'ATTACKER' | 'DEFENDER' | 'DRAW',
  attackerShips: { sent: [...], lost: [...], remaining: [...] },
  defenderShips: { sent: [...], lost: [...], remaining: [...] },
  loot: { iron, silver, ember, h2, energy } | null,
  fuelCost: number  // Hin- + Rückflug H2-Kosten (exakt berechnet)
}
```

---

## WebSocket Events

Verbindung über `ws://localhost:3000/ws`. Authentifizierung erforderlich:

```json
{ "type": "auth", "apiKey": "..." }
```

Danach Abonnieren:
```json
{ "type": "subscribe", "playerId": "..." }
```

| Event | Auslöser |
|-------|----------|
| `building_complete` | Gebäude-Upgrade abgeschlossen |
| `ship_complete` | Schiffbau abgeschlossen |
| `research_complete` | Forschung abgeschlossen |
| `fleet_arrival` | Flotte kommt an |
| `fleet_return` | Flotte kehrt zurück |
| `fleet_launch` | Flotte gestartet |
| `combat_report` | Kampfbericht (Angreifer + Verteidiger) |

**`combat_report` Event-Daten:**
```json
{
  "planetId": "...",
  "mission": "attack",
  "winner": "ATTACKER",
  "attackerLost": [...],
  "defenderLost": [...],
  "loot": { "iron": 100, "silver": 50, ... },
  "role": "attacker"  // oder "defender"
}
```

---

## Shared Types (Referenz)

### BuildingType
```typescript
'zentrale' | 'iron_mine' | 'silver_mine' | 'uderon_raffinery'
| 'h2_refinery' | 'fusion_plant' | 'research_center' | 'shipyard'
| 'space_station' | 'anti_spy' | 'planetary_shield' | 'dummy_building'
```

### ShipType
```typescript
'fly' | 'bumblebee' | 'corvette' | 'light_cruiser' | 'heavy_cruiser'
| 'battleship' | 'battleship_nexus' | 'battleship_phoenix'
| 'carrier_titan' | 'colonizer' | 'invasion_unit' | 'ember_bomb'
```

### FleetMission
```typescript
'attack' | 'transport' | 'deployment' | 'colonize' | 'harvest' | 'espionage' | 'invasion' | 'destroy'
```

### DriveType
```typescript
'combustion' | 'impulse' | 'hyperspace' | 'nexus' | 'phoenix'
```

**Antriebs-Effektivität (code-conform):**

| Antrieb | Speed | Inter-Galaxy | H2-Faktor |
|---------|-------|---------------|-----------|
| combustion | 1.0 | nein | 1.0 |
| impulse | 2.5 | nein | 3.0 |
| hyperspace | 3.0 | nein | 2.0 |
| nexus | 3.0 | ja | 1.5 |
| phoenix | 4.0 | ja | 1.5 |

### ResearchType
```typescript
iron_mining, silver_mining, ember_extraction, h2_refining, energy_efficiency,
laser_technology, ion_technology, hyperspace_technology, plasma_technology,
combustion_drive, impulse_drive, hyperspace_drive, nexus_drive, interdimensional_drive,
espionage_technology, computer_technology, astrophysics,
intergalactic_research_network, graviton_technology,
shield_technology, armour_technology, weapons_technology
```

---

## Distanz & Flugzeit

### Distanz-Berechnung (Perlenschnur-Modell)

```
Distanz = |slotΔ| × PLANET_STEP_DIST
        + EXIT_SYSTEM_COST + |systemΔ| × SYSTEM_STEP_DIST
        + EXIT_GALAXY_COST + |galaxyΔ| × GALAXY_STEP_DIST
```

Konstanten:
| Konstante | Wert | Beschreibung |
|-----------|------|-------------|
| `PLANET_STEP_DIST` | 5 | DE pro Planeten-Slot |
| `EXIT_SYSTEM_COST` | 100 | DE Pauschal für System-Verlassen |
| `SYSTEM_STEP_DIST` | 20 | DE pro System-Abstand |
| `EXIT_GALAXY_COST` | 2000 | DE Pauschal für Galaxy-Verlassen |
| `GALAXY_STEP_DIST` | 500 | DE pro Galaxy-Abstand |

### Flugzeit

```
Flugzeit = Distanz / (langsamstes_Schiff.speed × Antriebs_Speed)
```

### H2-Kosten

```
H2 = totalShips × Distanz × Antriebs_H2Factor × 0.001
```

### Schiffs-Stats

| Schiff | Attack | Defense | Cargo | Drives | Speed | h2Factor | Hangar |
|--------|--------|---------|-------|--------|-------|----------|--------|
| fly | 5 | 10 | 50 | combustion | 1.0 | 0.001 | 100 |
| bumblebee | 20 | 25 | 100 | combustion | 1.2 | 0.0012 | 0 |
| corvette | 50 | 60 | 300 | combustion, impulse | 1.5 | 0.0015 | 0 |
| light_cruiser | 150 | 130 | 800 | combustion, impulse | 1.8 | 0.002 | 0 |
| heavy_cruiser | 300 | 250 | 1500 | combustion, impulse | 2.0 | 0.0025 | 0 |
| battleship | 600 | 500 | 2500 | combustion, impulse, hyperspace | 2.5 | 0.003 | 0 |
| battleship_nexus | 1500 | 1200 | 5000 | combustion, impulse, hyperspace, nexus | 3.0 | 0.0035 | 0 |
| battleship_phoenix | 4000 | 3000 | 10000 | combustion, impulse, hyperspace, nexus, phoenix | 4.0 | 0.004 | 0 |
| carrier_titan | 200 | 800 | 50000 | hyperspace | 1.5 | 0.005 | 200 |
| colonizer | 0 | 100 | 7500 | hyperspace | 2.0 | 0.003 | 0 |
| invasion_unit | 800 | 600 | 2000 | hyperspace | 2.0 | 0.003 | 0 |
| ember_bomb | 0 | 0 | 0 | hyperspace | 1.0 | 0.001 | 0 |

---

## Combat Math — Technische Details

### `simulateCombat(attackerFleet, defenderForces, maxRounds = 6)`

**Input:** Zwei `FleetComposition` Objekte mit `ships`, `weaponsTech?`, `shieldTech?`, `armourTech?`.

**Pro Runde:**
1. Angriffsstärke beider Seiten als Snapshot (pre-round)
2. Schaden proportional nach HP-Pool-Größe verteilt
3. `remainingHP → shipCount = ceil(remainingHP / maxHP)`
4. Abbruch wenn eine Seite keine Schiffe mehr hat

**Tech-Boni:** `maxHP = defense × (1 + shieldTech×0.05 + armourTech×0.05)`, `attackPower = count × baseAttack × (1 + weaponsTech×0.05)`

### `calculateLoot(remainingShips, returnFuelCost, planetResources, lootFactor = 0.5)`

- `returnFuelCost` = exakte H2-Kosten für den Rückflug (berechnet aus überlebender Flotte + Perlenschnur-Distanz)
- `availableLootSpace = max(0, totalCargoCapacity - returnFuelCost)`
- Proportionale Verteilung über alle Ressourcen wenn Platz nicht ausreicht