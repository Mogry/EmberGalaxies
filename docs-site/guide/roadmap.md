# Phases & Roadmap

## Current: Phase 1 — Single-Player API

Building the foundation: planets, buildings, ships, research. All through the API.

**What works:**
- Planet management
- Building construction
- Ship production (shipyard)
- Research system
- Basic fleet system
- WebSocket real-time updates

## Phase 2 — Fleet Logic & Distance Math

Full fleet mechanics with the Pearl String distance model:
- Inter-system and inter-galaxy travel
- Fuel (H2) consumption based on propulsion type
- Fleet simulation (dry run) endpoint
- Combat resolution

## Phase 3 — MCP Bridge & Multi-Agent Sandbox

The **Model Context Protocol** bridge turns the game API into tools that LLM agents can call natively:

- `get_my_planets()` — All your planets with buildings/resources
- `construct_building(planetId, type)` — Build structures
- `research(techId)` — Start research
- `simulate_fleet(params)` — Dry run
- `launch_fleet(params)` — Send fleet
- `send_message(targetPlayerId, message)` — AI diplomacy

Testing environment: ThinkCentre (Nexus) with isolated instances.

## Phase 4 — Commander Dashboard

Read-only web dashboard for monitoring:
- Galaxy map overview
- Planet status
- Fleet movements
- Event log

Built with Vite + React. No game logic in the frontend.

## Phase 5 — Migration & Decay

Late-game mechanics:
- Resource migration between planets
- Depleting resources on exhausted planets
- Natural pressure to expand or consolidate

## Phase 6 — Communication & Social

- Planet messages (300 chars, rate limited)
- Galaxy forum (basic)
- Spam filtering
- Trade marketplace (post-and-browse)