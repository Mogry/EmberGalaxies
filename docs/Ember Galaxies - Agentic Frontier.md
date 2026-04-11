Ember Galaxies – The Agentic Frontier
Vision: Ein Galaxy-Conquest-MMO, in dem nicht Menschen klicken, sondern LLM-Agenten programmieren. Spieler sind Architekten und Strategen, die ihre Agenten-Armeen über eine API steuern, während sie das Geschehen über ein Read-Only Dashboard überwachen.

1. Die Welt-Architektur ("Perlenschnur-Prinzip")
Das Universum ist linear aufgebaut, um eine natürliche Progression und Schutz für Neulinge zu gewährleisten.

Struktur: 100 Galaxien (G1 bis G100), aufgereiht wie eine Perlenschnur.

Dimensionen: 300 Sonnensysteme pro Galaxie, 10-30 Planeten pro System 

Reisezeiten: - Innerhalb eines Systems: Minuten bis < 1 Std.

System zu System: Stunden.

Galaxie zu Galaxie: Tage bis Wochen (exponentieller Anstieg).

Dynamik: Neue Spieler starten in den "oberen" Galaxien (z. B. G40). Die "unteren" Galaxien (G1) sind das hart umkämpfte Niemandsland der Veteranen. Migration nach "oben" ist der primäre Mid-Game-Antrieb.

2. Technischer Stack & API-First
Das Spiel ist ein Headless-Backend. Das Frontend ist lediglich ein Admin-Tool.

Backend: Bun/Node.js (High-Performance WebSockets & API).

Datenbank: Postgres (Lazy Evaluation via Timestamps für alle Timer).

Infrastruktur: Docker-Container auf Hostinger VPS, abgesichert via Tailscale.

Schnittstelle: MCP Server (Model Context Protocol) als Bridge zwischen Spieler-LLMs und der Game-API.

Authentifizierung: API-Keys pro Spieler. Jeder Request muss validieren: "Gehört dieser Planet/Flotte dem User?"

3. Core Mechanics & Agenten-Strategie
Das API-Limit als Spielmechanik
Das Rate-Limit (z. B. 60 oder 120 Calls/Min) ist die physikalische Grenze des Handelns.

Skalierungs-Dilemma: Wer 500 Planeten besitzt, muss seine API-Calls extrem effizient aufteilen.

Strategie: Agenten müssen priorisieren (Monitoring vs. Angriff vs. Ausbau).

Flotten-Simulation ("Dry Run")
Um das API-Limit zu schonen, bietet das System Simulations-Endpunkte.

POST /fleet/simulate: Berechnet H2-Verbrauch und Flugzeit ohne Ausführung.

Meta-Game: Profi-Spieler lassen ihre Agenten lokale Python-Skripte schreiben, die den Tech-Tree und die Physik offline simulieren, um mit nur einem API-Call die perfekte Flotte zu launchen.

Logik-Ebenen (Hybrid-Modell)
Strategie (LLM): Langfristige Planung, Diplomatie, Taktik-Anpassung.

Execution (Skripte/Lokale LLMs): Automatisierte Fleetsaves, Ressourcen-Pooling, Monitoring.

Defense: Automatisierte "Heartbeat"-Checks alle X Minuten auf Angriffe.

4. MCP Tools (Exponierte Funktionen)
Der MCP Server macht beispielsweise folgende Kernfunktionen für Agenten greifbar (Liste ist im Aufbau und wächst stück für stück):

State: get_my_planets(), get_system(id), get_fleet_status(id).

Wirtschaft: construct_building(planetId, type), research(techId).

Militär: simulate_fleet(params), launch_fleet(params), recall_fleet(id).

Kommunikation: send_message(targetPlayerId, message) -> Erlaubt KI-Diplomatie und Social Engineering.

5. Roadmap & Testing
Phase 1: Single-Player API (Gebäude/Schiffe bauen) – Aktueller Stand.

Phase 2: Flotten-Logik & Distanz-Mathematik (Lazy Evaluation via Timestamps).

Phase 3: MCP-Bridge & Multi-Agent-Sandbox (ThinkCentre Testumgebung).

Phase 4: Read-Only Commander Dashboard (Vite).

Phase 5: Migration-Features & Versiegende Ressourcen.

6. Dev-Richtlinien für Claude Code
API-First: Jedes neue Feature muss zuerst als Endpunkt existieren.

Stateless Logic: Das Backend berechnet alles basierend auf Timestamps beim Request.

No UI-Dependencies: Logik gehört in den Server, nicht ins Frontend.

Doku-Sync: Nach jeder API-Änderung muss die mcp-config.json und diese Doku aktualisiert werden.