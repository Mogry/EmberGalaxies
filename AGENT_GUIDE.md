# Ember Galaxies — Agent Playbook

## Deine Mission

Du bist der strategische Kopf eines Raumfahrt-Reiches. Deine Aufgabe:Planeten kolonisieren, Wirtschaft aufbauen, Forschritt machen, und das Universum erkunden — gesteuert durch API-Calls.

**Dein Spieler:** Pi
**Dein API-Key:** `pi-1775918260629`
**Base URL:** `http://localhost:3000/api`

---

## WICHTIG: Entwicklungsumgebung

**Lokal läuft Postgres nativ via Homebrew, NICHT in Docker.**
- Postgres starten: `brew services start postgresql@16`
- Postgres stoppen: `brew services stop postgresql@16`
- Docker wird NICHT für lokale Entwicklung verwendet (instabil auf diesem Mac)
- Docker (`docker-compose up -d`) nur für VPS-Deployment

---

## Authentifizierung

Jeder Request braucht:
```
Authorization: Bearer pi-1775918260629
```

---

## Wie die Welt funktioniert

### Koordinaten-System
```
Galaxie → System → Planet
G10-S004-P17  =  Galaxie 10, System 4, Slot 17
```
- 100 Galaxien (G1 bis G100), 300 Systeme pro Galaxie, 10-30 Planeten pro System
- Distanz wird in DE (Distanz-Einheiten) berechnet
- **Kleine Distanz** = schnelle Reise, wenig H2
- **Große Distanz** = lange Reise, viel H2

### Antriebe (Drives)
| Antrieb | Kann | H2-Kosten |
|---------|------|-----------|
| `combustion` | Intra/Inter-System | Niedrig |
| `hyperspace` | Intra/Inter-System | Mittel |
| `nexus` | Intra/Inter-System | Niedrig |
| `phoenix` | Intra/Inter-System | Niedrig |
| `interdim` | Nur Inter-Galaxy | Sehr hoch |

Schiffe haben unterschiedliche Antriebs-Fähigkeiten:
- `fly`, `bumblebee` → combustion
- `corvette`, `light_cruiser`, `heavy_cruiser` → combustion + impulse
- `battleship` → combustion + impulse + hyperspace
- `colonizer` → hyperspace
- `ember_bomb` → hyperspace

### Schiffe
| Typ | Cargo | Antrieb |
|-----|-------|---------|
| fly | 50 | combustion |
| bumblebee | 100 | combustion |
| corvette | 300 | combustion+impulse |
| light_cruiser | 800 | combustion+impulse |
| heavy_cruiser | 1500 | combustion+impulse |
| battleship | 2500 | combustion+impulse+hyperspace |
| carrier_titan | 50000 | hyperspace |
| colonizer | 7500 | hyperspace |
| invasion_unit | 2000 | hyperspace |
| ember_bomb | 0 | hyperspace |

### Mission-Typen
- `attack` — Angriff auf feindlichen Planeten
- `transport` — Ressourcen transportieren
- `deployment` — Flotte bleibt auf dem Zielplaneten
- `colonize` — **Braucht colonizer-Schiff** — Neuen Planeten besiedeln
- `harvest` — Ressourcen sammeln
- `espionage` — Spionage
- `invasion` — Invasion mit invasion_unit
- `destroy` — **Braucht ember_bomb** — Planet zerstören

### Rate Limits
- **Heavy Actions** (fleet/launch, building/upgrade, research/start, shipyard/build): **5 pro Minute**
- **Leichte Actions** (GET-Requests): **60 pro Minute**
- Bei `429`: Warte `retryAfter` Sekunden

---

## Die wichtigsten API-Calls

### 1. Übersicht verschaffen

```http
GET /api/game/state/:playerId
Authorization: Bearer pi-1775918260629
```
→ **NUR EIGENE** Planeten, Flotten, Forschung, Schiffe, Ressourcen

```http
GET /api/game/galaxy/:galaxy/system/:system
Authorization: Bearer pi-1775918260629
```
→ **SYSTEM-SCAN** — Alle Planeten in einem System, öffentliche Daten:
  - Planet-Name, Slot, Besitzer (ja/nein), Owner-Name
  - **KEINE** Ressourcen, Gebäude oder Schiffe!
Beispiel: `GET /api/game/galaxy/1/system/4` für G1-S4

```http
GET /api/game/planets/:playerId
Authorization: Bearer pi-1775918260629
```
→ **NUR EIGENE** Planeten

```http
GET /api/game/planet/:planetId
Authorization: Bearer pi-1775918260629
```
→ **Eigene Planeten:** Volle Details (Ressourcen, Gebäude, Schiffe)
→ **Fremde Planeten:** Nur öffentliche Daten (Name, Slot, Owner, Stern-Daten)

### 2. Schiffe bauen

```http
POST /api/shipyard/build
Authorization: Bearer pi-1775918260629
Content-Type: application/json

{
  "playerId": "cmnufvnvn0000anftm77n53zz",
  "planetId": "cmnmvbe1w000413roo1hf8hli",
  "shipType": "colonizer",
  "count": 1
}
```

### 3. Flotte simulieren (VOR dem Start prüfen!)

```http
POST /api/fleet/simulate
Authorization: Bearer pi-1775918260629
Content-Type: application/json

{
  "originPlanetId": "...",
  "targetPlanetId": "...",
  "ships": [{ "type": "colonizer", "count": 1 }]
}
```
→ Returned: mögliche Antriebe, Flugzeit, H2-Kosten

### 4. Flotte starten

```http
POST /api/fleet/launch
Authorization: Bearer pi-1775918260629
Content-Type: application/json

{
  "playerId": "cmnufvnvn0000anftm77n53zz",
  "originPlanetId": "...",
  "targetPlanetId": "...",
  "mission": "colonize",
  "ships": [{ "type": "colonizer", "count": 1 }],
  "resources": {}
}
```
→ Returned: `fleet` (mit ID), `distance`, `drive`, `flightSeconds`, `h2Cost`

### 5. Gebäude bauen

```http
POST /api/building/:planetId/upgrade
Authorization: Bearer pi-1775918260629
Content-Type: application/json

{
  "playerId": "cmnufvnvn0000anftm77n53zz",
  "buildingType": "iron_mine"
}
```

### 6. Forschung starten

```http
POST /api/research/start
Authorization: Bearer pi-1775918260629
Content-Type: application/json

{
  "playerId": "cmnufvnvn0000anftm77n53zz",
  "researchType": "hyperspace_drive"
}
```

### 7. Flotten überwachen

```http
GET /api/fleet/player/:playerId
Authorization: Bearer pi-1775918260629
```
→ Alle deine Flotten (unterwegs + zurückgekehrt)

```http
POST /api/fleet/:fleetId/recall
Authorization: Bearer pi-1775918260629
Content-Type: application/json

{
  "playerId": "cmnufvnvn0000anftm77n53zz"
}
```
→ Flotte abbrechen und zurückholen (nur wenn noch unterwegs)

---

## Strategie-Guide

### Phase 1: Homeworld aufbauen
1. Prüfe deine Homeworld: `GET /api/game/state/:playerId`
2. Baue Schiffe auf deiner Homeworld: `fly` zuerst (billig, schnell)
3. Upgrade Buildings für mehr Produktion

### Phase 2: Erkunden & Kolonisieren
1. Finde unbesetzte Planeten: `GET /api/game/galaxy/1/system/1` (oder nearby systems)
   - System-Scan zeigt: Planet-Name, Slot, besetzt/frei, Owner-Name
   - **KEINE Ressourcen oder Gebäude sichtbar** — nur Scannen!
2. Prüfe mit simulate: Wie lange? Wie viel H2?
3. Baue einen `colonizer` (braucht hyperspace_drive Forschung!)
4. Starte Flotte mit `mission: "colonize"`
5. Warte auf `fleet_arrival` Event (WebSocket) oder poliere regelmäßig `GET /api/fleet/player/:playerId`

### Fog of War
- **System-Scan** (`/galaxy/:g/system/:s`): Überall sichtbar — zeigt nur Existenz + Owner
- **Planet-Details**: Nur eigene Planeten — fremde Planeten zeigen nur öffentliche Daten
- **Spionage**: Ist nicht implementiert — du kannst NICHT die Ressourcen anderer Spieler sehen

### Phase 3: Ressourcen-Ökonomie
- Pooling: Ressourcen via `transport`-Mission zwischen Planeten bewegen
- Aggressive: Kolonisiere viele Planeten, balanciere Schiffe und Wirtschaft
- Eisen/Silber für Buildings, H2 für Flüge, Ember für spezielle Techs

### Rate Limit Optimierung
**Prüfe IMMER erst mit `/simulate`** bevor du `/launch` aufrufst!
- 1x simulate = 1 API-Call (leicht)
- 1x launch = 1 API-Call (schwer, 5/min Limit!)
- Bei 5 Flotten-Minuten: Nur 5 Flotten pro Minute — also plane genau

---

## WebSocket (Echtzeit-Events)

```
ws://localhost:3000/ws
```

1. Connect
2. Sende: `{ "type": "auth", "apiKey": "pi-1775918260629" }`
3. Sende: `{ "type": "subscribe", "playerId": "cmnufvnvn0000anftm77n53zz" }`
4. Empfange Events:
   - `fleet_arrival` — Flotte ist angekommen
   - `fleet_return` — Flotte kehrt zurück
   - `building_complete` — Bau abgeschlossen
   - `ship_complete` — Schiff gebaut
   - `research_complete` — Forschung fertig
   - `attack` — Angegriffen!

---

## Cheat-Sheet

```
# Ressourcen auf Planet X
GET /api/game/planet/:planetId

# Unbesetzte Planeten finden (System scannen)
GET /api/game/galaxy/:g/system/:s  → ownerId === null → frei!

# Kolonisieren
1. GET /api/game/planets/:playerId  → finde colonizer-planet
2. POST /api/shipyard/build  → colonizer bauen (braucht shipyard!)
3. POST /api/fleet/launch   → mission: "colonize"

# H2 (Treibstoff) ist die limiting resource
- Immer simulieren bevor launch
- Je дальше die Reise, desto mehr H2
- Fleet return = nochmal H2 (einfache Strecke × 2)
```
