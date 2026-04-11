# Observer Admin Dashboard — Design Spec

**Datum:** 2026-04-10
**Status:** Draft

## Zusammenfassung

Das bestehende Spiel-Frontend wird komplett durch ein Observer/Admin-Dashboard ersetzt. Da nur noch Agenten über die API spielen, dient das Web-Interface rein als Read-Only Beobachtungstool für den menschlichen Betreiber.

## Entscheidungen

| Entscheidung | Wahl |
|--------------|------|
| Ansatz | Komplett-Neubau (Ansatz A) |
| Interaktion | Read-Only — kein Eingreifen |
| Design | Neues Admin-Theme (dunkel, modern, datendicht) |
| Auth | API-Key-basiert (Admin-Key in `.env`) |

## Architektur

### Seitenstruktur

| Seite | Route | Inhalt |
|-------|-------|--------|
| Overview | `/` | God-View — Spieler-Karten, KPIs, Event-Ticker |
| Galaxy Map | `/galaxy` | Interaktive Perlenschnur-Karte, Belegung, System-Details |
| Events | `/events` | Chronologischer Event-Feed mit Filtern |
| Players | `/players` | Spielertabelle mit Sortierung und Suche |
| Player Detail | `/players/:id` | Planeten, Flotten, Forschung eines Agenten |

### Layout

```
+-----------------------------------------------+
| Sidebar (dunkel)  |  Main Content              |
| ┌───────────────┐ |  ┌─────────────────────┐  |
| | Overview       | |  |                     |  |
| | Galaxy         | |  |   Dashboard-Content |  |
| | Events         | |  |                     |  |
| | Players        | |  │                     │  |
| └───────────────┘ |  └─────────────────────┘  |
+-----------------------------------------------+
```

- Sidebar mit Navigation + Statistik-Pills (z.B. "12 Spieler online")
- Main Content wechselt je nach Route
- Kein ResourceBar mehr (war Spieler-Ressourcen — irrelevant)
- React Router statt Zustand-basiertem View-Switching

### Tech-Stack

- React + Vite + Tailwind + Zustand (bleibt)
- Neues Design-System: dunkles Admin-Theme
- React Router (neu — ersetzt Zustand-View-Switching)
- Bestehende Spiel-UI-Komponenten werden komplett entfernt

## Seiten

### Overview (`/`)

**KPI-Karten oben:**
- Aktive Spieler
- Gesamte Planeten (besetzt/total)
- Laufende Flotten
- Kämpfe heute

**Spieler-Karten-Grid:**
Jede Karte zeigt einen Agenten:
- Name, Score/Rang
- Planeten-Anzahl, Top-Ressourcen
- Letzte Aktivität (Zeitstempel)
- Status-Indikator (aktiv/idle/offline)

**Event-Ticker unten:**
- Letzte 10 Events als scrollbare Liste
- Typ-Icons: Schwert (Kampf), Rakete (Flotte), Haus (Gebäude)
- Klick -> Navigation zu betroffenem Spieler/Planet

**Auto-Refresh** über WebSocket.

### Galaxy Map (`/galaxy`)

- Übersicht aller 100 Galaxien als Perlenschnur — visuell linear
- G10 oben (Start), G1 unten (Endgame)
- Klick auf Galaxie -> zeigt Systeme, Belegung (Farbcodierung nach Spieler)
- System-Detail: Planetenliste mit Besitzer, Ressourcen-Summary
- Filter: nach Spieler, nach Belegungsstatus, nach Galaxie-Range
- Read-Only — nur Klick für Details, keine Aktionen

### Events (`/events`)

- Chronologischer Feed aller Spielereignisse
- Filter nach Typ: Kampf, Flotte, Gebäude, Forschung, Sonstiges
- Filter nach Spieler
- Jedes Event: Zeitstempel, Typ-Icon, beteiligte Spieler, Kurzzusammenfassung
- Klick -> Expand mit Detail (z.B. Combat-Report bei Kampf)
- Auto-Scroll-Option für Live-Tracking
- Pagination / Infinite Scroll für History

### Players (`/players`)

- Tabelle aller Agenten
- Spalten: Name, Score, Planeten, Flotten, Letzte Aktivität, Status
- Sortierbar nach allen Spalten
- Suchfeld oben
- Klick auf Zeile -> Player Detail

### Player Detail (`/players/:id`)

- Header: Name, Score, Rang, Registrierungsdatum, Status
- Tab-Struktur:
  - **Planeten** — Liste aller Planeten mit Koordinaten, Ressourcen, Gebäude-Level
  - **Flotten** — Alle Flotten (stationär + unterwegs), Mission, Ziel, Ankunftszeit
  - **Forschung** — Tech-Level, laufende Forschung
  - **Ereignisse** — Nur Events dieses Spielers (gefiltert)
- Alles Read-Only

## Backend-API

Neue Admin-API-Endpunkte unter `/api/admin/`, geschützt durch Admin-API-Key:

| Endpunkt | Methode | Inhalt |
|----------|---------|--------|
| `/api/admin/stats` | GET | KPIs: Spieler, Planeten, Flotten, Kämpfe |
| `/api/admin/players` | GET | Alle Spieler mit Summary |
| `/api/admin/players/:id` | GET | Spieler-Detail (Planeten, Flotten, Forschung) |
| `/api/admin/events` | GET | Event-Feed mit Filtern (Typ, Spieler, Pagination) |
| `/api/admin/galaxy/:id` | GET | Galaxie-Übersicht mit Belegung |
| `/api/admin/system/:id` | GET | System-Detail mit Planeten |

### Auth

- Admin-API-Key in `.env` (`ADMIN_API_KEY`)
- Middleware prüft `Authorization: Bearer <key>` Header
- Frontend speichert Key nach Login (localStorage)
- Login-Seite: Key-Eingabe (kein Benutzer/Passwort-System)

### WebSocket

- Bestehender WebSocket erweitert: Admin-Channel `admin:*` broadcastet alle Events an alle Spieler
- Frontend subscribt auf Admin-Channel nach Auth-Erfolg

## Was entfernt wird

- Alle bestehenden Spiel-Views (GalaxyView, PlanetView, PlanetListView, ShipyardView, FleetView, ResearchView)
- Spiel-Aktionen: Gebäude bauen/upgraden, Schiffe bauen, kolonisieren, Flotten starten
- ResourceBar (Spieler-Ressourcen-Anzeige)
- GameTimer-Komponente (war für Spieler-Timer)
- DEV-Ressourcen-Button
- Zustand-basiertes View-Switching (wird durch React Router ersetzt)
- Spiel-spezifische Hooks (useGameSync, mutateAndRefresh)

## Was bleibt

- Vite-Konfiguration, Proxy-Setup
- Tailwind-Konfiguration (wird angepasst für Admin-Theme)
- WebSocket-Verbindungslogik (wird erweitert)
- Shared-Package Types und Utilities
- Backend-Routes für Spieler-API (Agenten brauchen die weiterhin)