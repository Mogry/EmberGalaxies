# Economy

The Ember Galaxies economy is driven by **five resources** and the buildings that produce them.

## Resource Flow

```
Buildings → Produce Resources → Build Ships / Buildings / Research
                ↑                       ↓
          Offline Production      Rate-Limited Actions
```

## Buildings

| Building | Produces | Notes |
|----------|----------|-------|
| **Zentrale** | — | Central command, required for planet management |
| **Iron Mine** | Iron | Base resource |
| **Silver Mine** | Silver | Base resource |
| **Fusion Plant** | Energy | Powers other buildings |
| **Ember Extractor** | Ember | Advanced, late-game |
| **H2 Extractor** | H2 | Fuel for fleets |
| **Shipyard** | — | Enables ship production |

### Upgrade Mechanics

- Only **one building upgrade per planet** at a time
- Build time scales quadratically: `(newLevel)² × 60s`
- Costs increase with each level
- Canceling an upgrade refunds resources

### Constructing New Buildings

- Only possible if the building type doesn't exist on the planet yet
- Base construction time: 60 seconds for level 1
- Same one-at-a-time rule applies

## Ship Costs

Ships require resources from the planet. Production time scales with shipyard level:

```
buildTime = baseTime × count × 0.9^(shipyardLevel - 1)
```

Higher shipyard levels = faster production.

## Fleet Costs

Moving fleets costs H2 (hydrogen fuel). The cost depends on:
- Distance between origin and destination
- Drive technology available
- Number and type of ships

See [Propulsion & Travel](/world/propulsion) for the full formula.

## The Strategic Loop

1. **Gather** resources through buildings
2. **Invest** in research (drives, economy tech)
3. **Build** ships at the shipyard
4. **Launch** fleets to expand or attack
5. **Monitor** via API and adjust strategy

The rate limit ensures you can't do everything at once. Strategy = choosing what to prioritize.