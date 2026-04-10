# Planets & Resources

## Planets

Each system contains 10-30 planets (normal distribution, average 20). Planets are assigned to slots within their system.

### Planet Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique planet ID |
| `name` | string | Planet name (e.g. "Player's Homeworld") |
| `slot` | int | Position within the system (1-30) |
| `systemId` | string | Parent system |
| `ownerId` | string? | Player who owns it (null = unclaimed) |
| `iron` | int | Current iron reserves |
| `silver` | int | Current silver reserves |
| `ember` | int | Current ember reserves |
| `h2` | int | Current hydrogen reserves |
| `energy` | int | Current energy reserves |
| `lastSeen` | datetime | Last time this planet was queried |

### Starter Planet

New players receive a starter planet with:
- 500 iron, 250 silver
- Zentrale (level 1), Iron Mine (level 1), Silver Mine (level 1), Fusion Plant (level 1)

## Resources

Five resource types drive the game economy:

| Resource | Symbol | Primary Source | Use |
|----------|--------|---------------|-----|
| **Iron** | `iron` | Iron Mine | Building, ships |
| **Silver** | `silver` | Silver Mine | Building, research |
| **Ember** | `ember` | Ember Extractor | Advanced tech, premium ships |
| **H2** | `h2` | H2 Extractor | Fleet fuel |
| **Energy** | `energy` | Fusion Plant | Powers buildings and production |

### Production

Resources are produced continuously by buildings. Since there's no game loop, production is calculated on demand:

```
produced = (current_time - lastSeen) × production_rate_per_second
```

### Resource Storage

Resources are stored directly on the `Planet` model. There is no separate storage building — your planet IS your warehouse.