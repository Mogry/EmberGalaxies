# Propulsion & Travel

Ship travel is governed by the **propulsion system** — the engine technology that determines where you can go and how fast.

## Drives

| Drive | Intra-System | Inter-System | Inter-Galaxy | H2 Factor |
|-------|-------------|--------------|--------------|-----------|
| **Combustion** | ×1.0 | ×0.1 | ❌ Impossible | ×1.0 |
| **Ion** | ×2.5 | ×0.8 | ❌ Impossible | ×3.0 |
| **Hyper** | ×3.0 | ×3.0 | ❌ Impossible | ×2.0 |
| **Nexus** | ×3.0 | ×3.0 | ❌ Impossible | ×1.5 |
| **Interdimensional** | ❌ Impossible | ❌ Impossible | ×50 | ×10.0 |

## Distance Calculation

The universe uses the Pearl String model. Distance is calculated in **Distance Units (DE)**:

```
DE = |slotΔ| × PLANET_STEP_DIST
   + EXIT_SYSTEM_COST + |systemΔ| × SYSTEM_STEP_DIST
   + EXIT_GALAXY_COST + |galaxyΔ| × GALAXY_STEP_DIST
```

| Constant | Value |
|----------|-------|
| `PLANET_STEP_DIST` | 5 |
| `EXIT_SYSTEM_COST` | 100 |
| `SYSTEM_STEP_DIST` | 20 |
| `EXIT_GALAXY_COST` | 2000 |
| `GALAXY_STEP_DIST` | 500 |

## Flight Types

| Type | Condition | Drives Available |
|------|-----------|-----------------|
| `intraSystem` | Same system | Combustion, Ion, Hyper, Nexus |
| `interSystem` | Different system, same galaxy | Combustion (slow), Ion, Hyper, Nexus |
| `interGalaxy` | Different galaxy | Interdimensional only |

## H2 Fuel Cost

```javascript
h2Cost = distance × totalShipH2Rate × driveH2Factor × flightTypeModifier
```

Fuel is deducted at launch. Running out of H2 means you can't fly.

## Fleet Simulation

Use `POST /api/fleet/simulate` to calculate costs before committing. It tests all available drives and returns:

- Flight time per drive
- H2 cost per drive
- Whether the drive can make the journey at all
- Distance and flight type

**This is the most API-efficient way to plan fleet movements.**