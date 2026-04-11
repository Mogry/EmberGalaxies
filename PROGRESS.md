# Ember Galaxies — Projektfortschritt

## Phasen

### Phase 1 — Single-Player API ✅ ABGESCHLOSSEN
- [x] Planeten generieren
- [x] Gebäude bauen & upgraden (unbegrenzte Concurrent-Queues)
- [x] Schiffe bauen (unbegrenzte Concurrent-Queues)
- [x] Ressourcen-Produktion
- [x] Offline-Production

### Phase 2 — Flotten-Logik & Distanz-Mathematik ✅ ABGESCHLOSSEN
- [x] Antriebssysteme (Drives) — combustion, impulse, hyperspace, nexus, phoenix, interdim
- [x] Distanz-Berechnung — DE (Distanz-Einheiten) mit Perlenschnur-Konstanten
- [x] Flugzeit-Formel — Master-Formel mit Antriebs-Effektivitäts-Matrix
- [x] H2-Kosten — `totalShips × distance × h2Factor × 0.001`
- [x] Flotten erstellen & launchen — `POST /fleet/launch`
- [x] `FleetMission` — attack, transport, deployment, colonize, harvest, espionage, invasion, destroy
- [x] `arrivesAt`, `returnsAt` auf Flotten
- [x] `recall_fleet` — `POST /fleet/:id/recall`
- [x] Lazy Evaluation bei Flotten-Ankunft — `syncPlanet` mit Event-Queue
- [x] Kampfsystem (6-Runden deterministisch, proportionaler Schaden, Tech-Boni)
- [x] Beuteberechnung (exakter Return-Fuel, proportionale Verteilung)
- [x] CombatReport in der Datenbank
- [x] Invasion (Planeten-Übernahme) und Destroy (Planeten-Zerstörung)
- [x] Flotten-Rückkehr mit Ressourcen-Übertragung auf Ursprungsplaneten
- [x] Trockener Lauf (`POST /fleet/simulate`)
- [x] API-Key Auth & Rate Limiting

### Phase 3 — MCP-Bridge & Multi-Agent-Sandbox
- [ ] MCP Server implementieren
- [ ] Auth-System: API-Keys pro Spieler
- [ ] Rate Limiting (erledigt, aber für MCP noch anpassen)
- [ ] mcp-config.json pflegen

### Phase 4 — Read-Only Commander Dashboard
- [ ] Vite Dashboard (Read-Only, Admin-Tool)

### Phase 5 — Migration & Versiegende Ressourcen
- [ ] Migration nach obere Galaxien
- [ ] Ressourcen-Versiegelung
- [ ] Galaxie-Zugangs-Hürden

### Phase 6 — Kommunikation & Handel
- [ ] Planet-Messages (300 Zeichen, Rate-Limit)
- [ ] Galaxie-Forum (basic)
- [ ] Spamfilter
- [ ] Handelsplattform (Post-and-Browse)

---

## Abgeschlossene Entscheidungen

| Thema | Entscheidung |
|-------|-------------|
| Weltgröße | 100 Galaxien × 300 Systeme × 10-30 Planeten (Bell Curve, Ø20) |
| Spielprinzip | Freiwillig, keine mechanische Durchsetzung von Deals |
| Datenbank-Skalierung | 9 Mio. Planeten — kein Problem bei indexed Queries |
| Antriebe | combustion, impulse, hyperspace, nexus, phoenix, interdim |
| Distanz-Formel | `|slotΔ|×5 + 100 + |systemΔ|×20 + 2000 + |galaxyΔ|×500` |
| H2-Kosten | `totalShips × distance × h2Factor × 0.001` |
| Kampfsystem | Deterministisch, 6 Runden, proportionaler Schaden, kein Zufall |
| Beuteberechnung | Exakter Return-Fuel (Perlenschnur-Distanz + bester Antrieb), proportionale Verteilung |
| CombatReport | In DB gespeichert, enthält sent/lost/remaining für beide Seiten + loot + fuelCost |

---

## Offene Entscheidungen

| Thema | Entscheidung |
|-------|-------------|
| H2-Kosten Feintuning | Playtesting-Werte |
| Reputation | Freiwillig, kein mechanisches Enforcement |
| Handelsplattform | Post-and-Browse, kein direkter Tausch |
| Turnier-Modus | Offen |
| Anti-Cheat | Offen |