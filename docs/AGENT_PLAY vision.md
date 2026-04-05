# Ember Galaxies – Agent Play Vision

> **TL;DR:** Ein Galaxy-Conquest-Spiel, bei dem menschliche Spieler nicht selbst spielen, sondern ihre LLM-Agenten programmatisch gegen andere Agenten antreten lassen. Die Spieler designen Strategien, Prompten Persönlichkeiten, und scripten Verhaltensweisen – ihre Agenten führen aus.

---

## Die Vision

Ember Galaxies wird zu einer **KI-Arena**, in der Agenten um galactische Vorherrschaft kämpfen.

Menschliche Spieler sind **Architekten und Strategen**, nicht Krieger. Sie:
- Designen die Persönlichkeit und Regeln ihrer Agenten
- Programmieren taktische Scripte
- Überwachen und optimieren kontinuierlich
- Lassen ihre Agenten autonom oder mit Input handeln

Das Spiel selbst existiert als API – die Agenten interagieren direkt damit.

---

## Warum das geil ist

### Meta-Game-Ebene
- **Agent-Designer vs Agent-Designer** statt Spieler gegen Spieler
- Strategie = Prompt-Engineering + Scripting, nicht Reaktionszeit
- Verschiedene "Archetypen": defensive Builder, aggressive Raider, Diplomat, Spy-Master

### LLM-Hierarchien
```
Mensch (Strategie/Prompting)
  └── Großer LLM (Opus/Sonnet) – Langsam, teuer, schlau
        └── Kleine lokale LLMs – Schnelle Mikrosekunden-Entscheidungen
              └── Scripts – Regelbasierte Logik
```

Beispiel: Opus entscheidet "Wir führen Krieg gegen Spieler X", lokale Llama3 führt die Flotten-Bewegungen aus.

### Skalierbarkeit
- **1 Spieler = 1 Agent = 1 DB-Identity**
- Postgres kann 10.000+ aktive Agenten mit Leichtigkeit bedienen
- Infrastruktur: ein einzelner Server reicht für hunderte concurrent Agenten
- Kosten: nur DB + Server (~20€/Monat für 1000+ Agenten)

### Community-Effekte
- Spieler teilen Agent-Prompts und Strategien
- Script-Bibliotheken entstehen
- Turniere werden organisiert
- Leaderboards basierend auf Winrate, kolonisierten Planeten, raidierter Beute

---

## Architektur

### Aktueller Stand (Single-Player)
```
Browser → React Frontend → REST API → Postgres
```

### Zukunft (Agent-fähig)
```
Agent (Remote LLM) ──┐
Agent (Lokale LLM) ──┼── MCP Server ──→ REST API ──→ Postgres
Bot Script ──────────┘
                    ↑
              Optionaler Human-Override
```

### Authentifizierung
- **Phase 1:** Stateless `playerId` (wie aktuell)
- **Phase 2:** JWT-basierte Auth, jeder Spieler bekommt API-Key
- Agenten können nur auf ihren eigenen Account zugreifen
- Rate Limiting pro Spieler/Agent

---

## MCP Server (Model Context Protocol)

### Tools die exponiert werden

```typescript
// State lesen
get_my_planets()           // Alle eigenen Planeten mit Gebäuden/Ressourcen
get_planet(planetId)       // Einzelner Planet
get_galaxy(system)         // Galaxie-Ansicht mit besetzten/unbesetzten Planeten
get_state()                // Vollständiger Game-State

// Aktionen
colonize(planetId)          // Planet besiedeln
upgrade_building(planetId, buildingType)
construct_building(planetId, buildingType)
cancel_construction(planetId, buildingType)
launch_fleet(origin, target, ships, mission, resources)
recall_fleet(fleetId)

// Research
start_research(researchType)

// Shipyard
build_ship(planetId, shipType)
```

### MCP Manifest (Beispiel)

```json
{
  "name": "ember-galaxies",
  "version": "1.0",
  "description": "Play Ember Galaxies via your AI agent",
  "tools": [
    {
      "name": "get_my_planets",
      "description": "Get all planets owned by the authenticated player",
      "inputSchema": { "type": "object", "properties": {} }
    },
    {
      "name": "upgrade_building",
      "description": "Start upgrading a building on one of your planets",
      "inputSchema": {
        "type": "object",
        "properties": {
          "planetId": { "type": "string" },
          "buildingType": { "type": "string", "enum": ["iron_mine", "silver_mine", ...] }
        },
        "required": ["planetId", "buildingType"]
      }
    }
  ]
}
```

---

## Strategie-Layer

### Persönlichkeits-Prompts
```markdown
You are playing Ember Galaxies as {player.name}.
Your personality: Aggressive expansionist. Prioritize speed over defense.
Rules:
- Always maintain at least 500 iron reserves
- If a planet has < 3 buildings, colonize it immediately
- Attack weak targets (low shield) before building up

Current objective: Expand to 10 planets within 2 hours.
```

### Scripting (Optional)
```python
# player_scripts/raider.py
class RaiderStrategy:
    def __init__(self, game_api):
        self.api = game_api

    def evaluate_targets(self):
        """Find weakest nearby planets for raiding."""
        my_planets = self.api.get_my_planets()
        # Find systems with uncolonized planets
        # Evaluate defense levels
        return ranked_targets

    def should_raid(self, target):
        """Decide if raiding is worth it."""
        return target.defense_score < 50 and target.resources > 1000
```

### LLM-Hierarchie in der Praxis
```
Opus (Entscheider – "Soll ich Krieg führen?")
  └── Sonet 4o-mini (Taktiker – "Welche Flotte wohin?")
        └── Llama 3.2 (Ausführer – "Flotte gestartet, 30s bis Ankunft")
              └── Regel-Script (Schadensberechnung)
```

---

## Spiel-Mechaniken die Agenten brauchen

### Kolonisierung
- Unbesetzte Planeten finden → Kolonie dorthin senden
- Strategische Positionen: Systeme mit hoher Energie, viele Felder

### Ressourcen-Management
- Produktion maximieren
- Reserven halten für: Ausbauten, Flottenbau, Notfall
- Handelsflotten zwischen eigenen Planeten

### Flotten & Kampf
- Angriff, Transport, Deployment, Spionage
- Kampf: Stärke = Schiffe + Forschungsboni + Gebäudeboni
- Retreat wenn Verluste zu hoch

### Spionage
- Sonden zu gegnerischen Planeten senden
- gegnerische Ressourcen/Gebäude/Stärkeverhältnisse herausfinden

### Diplomatie (Zukunft)
- Agenten könnten kommunizieren (in-game Chat)
- Nicht-Angriffs-Pakte
- Handelsbeziehungen

---

## Monetarisierung

### Infrastruktur-Modell
- **Infrastruktur-Gebühr:** 5-10€/Monat pro aktivem Agenten
- Spieler zahlen für ihre eigene Rechenzeit + DB + Server
- Die API/World运营 ist marginal – Postgres & Bun sind billig

### Value Proposition für Spieler
- Zugang zu einem asynchronous Strategie-Game ohne Zeitaufwand
- Community: Agenten tauschen Strategien aus
- Competitive: Leaderboards, Turniere
- Kreativ: Prompts und Scripts als "Content"

---

## Technische Notizen

### Postgres ist das Bottleneck – und das ist gut so
- Write-Lastigkeit: ca. 100 Writes/Minute pro aktivem Agenten
- Read-Lastigkeit: Agent liest State, cached (WebSocket-Updates)
- Bei 1000 Agenten: 100k Writes/min → eine Postgres-Instanz reicht

### WebSocket für Echtzeit-Updates
- Agent kann auf `building_complete`, `fleet_arrival` etc. reagieren
- State wird nur bei Bedarf gelesen

### Rate Limiting
- Max X Aktionen pro Minute pro Spieler
- Verhindert: Spam, unbeabsichtigte DoS
- Fairness: Alle Agenten haben gleiche "Reaktionszeit"

---

## Offene Fragen

1. **Human Override?** – Kann der Mensch eingreifen während ein Angriff läuft?
2. **Anonymität** – Sind Agenten oder Spieler identifizierbar?
3. **Turnier-Modus** – Sollen Agenten in isolierten Instanzen gegeneinander antreten?
4. **Start-Bedingungen** – Alle Agenten starten mit gleichen Ressourcen?
5. **Anti-Cheat** – Wie verhindern wir, dass ein Agent Real-Time-Stats ausliest?

---

## Nächste Schritte

1. [ ] MCP Server implementieren (separate Route, `/mcp` Endpoint)
2. [ ] Auth-System: API-Keys pro Spieler
3. [ ] Rate Limiting
4. [ ] Dokumentation für Agent-Entwickler
5. [ ] Leaderboard-System
6. [ ] Turnier-Feature

---

*Letztes Update: 2026-04-05*
