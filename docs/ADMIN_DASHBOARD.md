# Observer Admin Dashboard

## Zugriff

**URL:** http://localhost:5177 (oder welcher Port Vite zuweist)  
**Login:** API-Key `ember-admin-2026` (konfigurierbar in `apps/server/.env` als `ADMIN_API_KEY`)

## Starten

```bash
# 1. Docker/Postgres starten
docker compose up -d

# 2. Backend (aus apps/server/)
cd apps/server
bun run src/index.ts

# 3. Frontend (aus apps/web/)
cd apps/web
npm run dev
```

## Seiten

| Seite | Route | Inhalt |
|-------|-------|--------|
| Overview | `/` | KPIs, Spieler-Karten, Event-Ticker |
| Galaxy Map | `/galaxy` | 100 Galaxien als Perlenschnur, System-Details |
| Events | `/events` | Chronologischer Feed mit Filtern, Load-More, Auto-Scroll |
| Players | `/players` | Spielertabelle (sortierbar, durchsuchbar) |
| Player Detail | `/players/:id` | Planeten, Flotten, Forschung, Events pro Spieler |

## Backend API

Alle Endpunkte unter `/api/admin/`, erfordern `Authorization: Bearer <ADMIN_API_KEY>` Header.

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/admin/stats` | GET | KPIs (Spieler, Planeten, Flotten, Kämpfe) |
| `/api/admin/players` | GET | Alle Spieler mit Summary |
| `/api/admin/players/:id` | GET | Spieler-Detail |
| `/api/admin/events` | GET | Event-Feed (Filter: type, playerId, limit, cursor) |
| `/api/admin/galaxies` | GET | Alle Galaxien als Bulk-Request |
| `/api/admin/galaxy/:id` | GET | Einzelne Galaxie mit Systemen |
| `/api/admin/system/:id` | GET | System-Detail |

## WebSocket

Nach Auth mit Spieler-API-Key: `{ type: "auth", apiKey: "..." }`  
Admin-Subscription: `{ type: "admin_subscribe", apiKey: "ember-admin-2026" }`  
Events: alle Spiel-Events in Echtzeit.

## Architektur

- **Frontend:** React + Vite + Tailwind v4 + Zustand + React Router 7
- **Backend:** Hono + Prisma + Bun
- **Auth:** Admin-API-Key (`.env`), Spieler-API-Key (DB)
- **Event-Logging:** `GameEvent`-Tabelle in DB, `logEvent()` Utility
- **Design:** Dunkles Admin-Theme, Sidebar-Navigation, Read-Only

## Bekannte Probleme (Stand 2026-04-10)

- Docker/Postgres manchmal instabil — Server startet nicht wenn DB nicht erreichbar
- Frontend-Dev-Server wechselt Port wenn 5173 belegt ist (CORS ggf. anpassen in `index.ts`)
- `PlayerDetailPage` Events-Tab zeigt aktuell alle Events, nicht nur die des Spielers (Backend filtert korrekt via `?playerId=`)
