# Ember Galaxies — Claude Code Context

## Projekt Überblick

Ember Galaxies ist ein Galaxy-Conquest-MMO, in dem nicht Menschen klicken, sondern **LLM-Agenten programmiert werden**. Spieler sind Architekten und Strategen, die ihre Agenten-Armeen über eine API steuern, während sie das Geschehen über ein Read-Only Dashboard überwachen.

**Aktueller Stand:** Phase 2 abgeschlossen — Kampfsystem, Flotten, Lazy Evaluation
**Ziel:** KI-Arena mit MCP Server (Phase 3+)
**Testspieler:** Pi (`pi-1775918260629`), Admin-Key: `ember-admin-2026`

---

## Die Welt — Perlenschnur-Prinzip

Das Universum ist **linear aufgebaut** für natürliche Progression und Neulingsschutz.

| Ebene | Details |
|-------|---------|
| Galaxien | 100 Stück (G1 bis G100), aufgereiht wie eine Perlenschnur |
| Systeme | 300 pro Galaxie |
| Planeten | 10–30 pro System (Normalverteilung, Durchschnitt 20, ~9 Mio. insgesamt) |
| Reisezeiten | System-intern: Minuten bis <1h · System-zu-System: Stunden · Galaxie-zu-Galaxie: Tage bis Wochen (exponentiell) |
| Start | Neue Spieler in G10 (oben, sicher) |
| Endgame | G1 (unten, Veteranen-Niemandsland) — Migration nach oben ist Mid-Game-Antrieb |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Bun/Node.js (High-Performance WebSockets & API) |
| Database | Postgres 16 (lokal via Homebrew, VPS via Docker) |
| Frontend | Vite + React (nur Admin-Tool / Read-Only Dashboard) |
| Infra | Docker-Container auf Hostinger VPS, Tailscale |
| Bridge | MCP Server (Model Context Protocol) |

**Wichtige Pfade:**
- `apps/web/src/` — Frontend (React, Tailwind, Zustand)
- `apps/server/src/` — Backend (Hono routes, utils, websocket)
- `packages/shared/src/` — Geteilte Types, Kosten, Produktion
- `apps/server/prisma/schema.prisma` — Datenbank-Schema

---

## Architektur-Entscheidungen

### Headless-Backend
Das Spiel ist ein **Headless-Backend**. Das Frontend ist ein Read-Only Dashboard / Admin-Tool — nicht das Spiel selbst.

### Kein Game-Loop
**Kein Tick/Loop.** Das Backend berechnet alles basierend auf Timestamps beim Request (Lazy Evaluation). Das bedeutet:
- Bauaufträge und Flotten werden nur beim API-Call geprüft
- WebSocket broadcastet Events (`building_complete`, `ship_complete`, `fleet_arrival`) bei Fertigstellung
- Offline-Produktion wird beim State-Load berechnet

### Rate-Limit als Spielmechanik
Das API-Limit (z.B. 60 oder 120 Calls/Min) ist die **physikalische Grenze des Handelns**:
- Wer 500 Planeten besitzt, muss API-Calls extrem effizient aufteilen
- Agenten müssen priorisieren: Monitoring vs. Angriff vs. Ausbau
- **Flotten-Simulation ("Dry Run")** spart API-Calls: `POST /fleet/simulate` berechnet H2-Verbrauch und Flugzeit ohne Ausführung

### Antriebssystem
Die 5 Antriebe mit Speed-Modifikatoren und H2-Kosten:

| Antrieb | Intra-System | Inter-System | Inter-Galaxy | H2-Faktor |
|---------|-------------|--------------|--------------|-----------|
| combustion | x1.0 | x0.1 | **unmöglich** | x1.0 |
| ion | x2.5 | x0.8 | **unmöglich** | x3.0 |
| hyper | x3.0 | x3.0 | **unmöglich** | x2.0 |
| nexus | x3.0 | x3.0 | **unmöglich** | x1.5 |
| interdim | **unmöglich** | **unmöglich** | x50 | x10.0 |

**Distanz-Berechnung (DE = Distanz-Einheiten, Pearl String Modell):**
```
Distanz = |slotΔ| × PLANET_STEP_DIST
        + EXIT_SYSTEM_COST + |systemΔ| × SYSTEM_STEP_DIST
        + EXIT_GALAXY_COST + |galaxyΔ| × GALAXY_STEP_DIST
```
Konstanten: PLANET_STEP_DIST=5, EXIT_SYSTEM_COST=100, SYSTEM_STEP_DOST=20, EXIT_GALAXY_COST=2000, GALAXY_STEP_DIST=500

### Ressourcen auf Planet
Ressourcen (iron, silver, ember, h2, energy) liegen direkt auf dem `Planet`-Model.

### Kampfsystem (6-Runden deterministisch)
- **`simulateCombat(attacker, defender, maxRounds=6)`** in `packages/shared/src/combat.ts`
- Beide Seiten feuern gleichzeitig mit aktueller Angriffsstärke
- Schaden proportional nach HP-Pool-Größe verteilt
- Tech-Boni: weapons/shield/armour (+5% pro Level)
- Beute: `availableLootSpace = totalCargo - returnFuelCost`, proportionale Verteilung
- Return-Fuel: Exakt berechnet aus überlebender Flotte + Perlenschnur-Distanz + bester Antrieb
- `CombatReport` in DB mit sent/lost/remaining für beide Seiten

---

## Logik-Ebenen (Hybrid-Modell)

```
Strategie (LLM)      → Langfristige Planung, Diplomatie, Taktik-Anpassung
Execution (Skripte/   → Automatisierte Fleetsaves, Ressourcen-Pooling,
lokale LLMs)            Monitoring
Defense               → Automatisierte "Heartbeat"-Checks alle X Minuten
```

**Meta-Game:** Profi-Spieler lassen ihre Agenten lokale Python-Skripte schreiben, die den Tech-Tree und die Physik offline simulieren — mit nur einem API-Call die perfekte Flotte launchen.

---

## Phasen Roadmap

1. **Phase 1:** Single-Player API (Gebäude/Schiffe bauen) — ✅ Abgeschlossen
2. **Phase 2:** Flotten-Logik & Kampfsystem — ✅ Abgeschlossen
3. **Phase 3:** MCP-Bridge & Multi-Agent-Sandbox (ThinkCentre Testumgebung)
4. **Phase 4:** Read-Only Commander Dashboard (Vite)
5. **Phase 5:** Migration-Features, Versiegende Ressourcen
6. **Phase 6:** Kommunikationssystem — Planet-Messages (300 Zeichen, ~50/Min global, 2/Player/Min), Galaxie-Forum (basic), Spamfilter

---

## Dev-Richtlinien (Claude Code)

1. **API-First:** Jedes neue Feature muss zuerst als Endpunkt existieren
2. **Stateless Logic:** Das Backend berechnet alles basierend auf Timestamps beim Request
3. **No UI-Dependencies:** Logik gehört in den Server, nicht ins Frontend
4. **Doku-Sync:** Nach jeder API-Änderung müssen `mcp-config.json` und diese Datei aktualisiert werden

---

## MCP Tools (Ziel-State)

Der MCP Server macht folgende Kernfunktionen für Agenten greifbar:

**State:**
- `get_my_planets()` — Alle eigenen Planeten mit Gebäuden/Ressourcen
- `get_system(id)` — System-Ansicht mit besetzten/unbesetzten Planeten
- `get_fleet_status(id)` — Einzelne Flotte
- *(und weitere — die komplette Tool-Liste kommt mit Phase 3)*

**Wirtschaft:**
- `construct_building(planetId, type)` — Gebäude bauen
- `research(techId)` — Forschung starten

**Militär:**
- `simulate_fleet(params)` — Trockener Lauf (H2-Verbrauch, Flugzeit)
- `launch_fleet(params)` — Flotte starten
- `recall_fleet(id)` — Flotte zurückrufen

**Kommunikation:**
- `send_message(targetPlayerId, message)` — Erlaubt KI-Diplomatie und Social Engineering

---

## Authentifizierung

- **Phase 1+:** API-Keys pro Spieler
- Jeder Request muss validieren: "Gehört dieser Planet/Flotte dem User?"
- Rate Limiting: Max X Calls/Min pro Spieler (Fairness für alle Agenten)

---

## Wie ich arbeite

### Kommunikationsstil
- **Kurz und direkt.** Keine Wiederholung.
- Fakten, keine Füller.
- Unsicherheit direkt ansprechen.

### Vorgehen bei Features
1. Verstehen
2. Code / Architektur prüfen
3. Plan wenn nicht trivial
4. Implementieren
5. Verifizieren
6. **Doku aktualisieren** (mcp-config.json + diese Datei)

### Bei Bugs
- Systematisch debuggen, nicht raten
- Root cause finden bevor fix
- Keine blinden retries

---

## Codierungs-Konventionen

### Backend (Hono)
- Routes in `apps/server/src/routes/`
- DB immer über `prisma` Client aus `../db/client`
- WebSocket broadcasts via `broadcastToPlayer(playerId, event)`
- **Keine Logik im Frontend** — alles über API-Endpunkte

### Frontend (React)
- `useGameSync` Hook für Mutations die State-Refresh brauchen
- `gameStore.ts` (Zustand) für globalen State
- `mutateAndRefresh(planetId, async fn)` Pattern für Building/Shipyard Actions
- Read-Only Dashboard — keine Spiellogik hier

### Datenbank
- Lazy Evaluation via Timestamps
- `buildFinishAt`, `upgradeFinishAt`, `arrivesAt` etc. statt pro-rundem Update

---

## Nützliche Commands

```bash
npm run dev          # Server + Web
npm run dev:server   # Nur Backend (Port 3000)
npm run dev:web      # Nur Frontend (Port 5173)
npm run db:studio    # Prisma Studio
npm run db:migrate   # Migrationen
brew services start postgresql@16   # Postgres starten (lokal)
brew services stop postgresql@16    # Postgres stoppen (lokal)
# VPS: docker-compose up -d (Docker nur fürs Deployment)
```

---

## WICHTIG: Lokale Entwicklung ohne Docker

**Lokal läuft Postgres nativ via Homebrew, NICHT in Docker.** Docker Desktop ist auf diesem Mac instabil und wird nicht für lokale Entwicklung verwendet.

- Postgres 16 läuft als Brew-Service auf `localhost:5432`
- Starten: `brew services start postgresql@16`
- Stoppen: `brew services stop postgresql@16`
- Status: `brew services info postgresql@16`
- DB-Name: `ember_galaxies`, User: `ember`, Password: `galaxies`
- Docker (`docker-compose up -d`) wird NUR auf dem VPS verwendet
- Wenn Postgres nicht erreichbar ist: `brew services restart postgresql@16`, NICHT Docker starten

---

## Offene Fragen (noch zu klären)

- ~~Human Override?~~ — Freiwillig, Mensch kann jederzeit eingreifen
- ~~Turnier-Modus?~~ — Isolierte Instanzen für Wettbewerbe?
- ~~Anti-Cheat?~~ — Verhindern dass Agent Real-Time-Stats ausliest?
- ~~Start-Bedingungen?~~ — Alle Agenten starten mit gleichen Ressourcen?
- Handelsplattform: Post-and-Browse Marketplace (Phase 6+, mechanisch durchsetzbar)

---

## Projektfortschritt

Aktuellen Stand und detaillierte Roadmap: `PROGRESS.md`
