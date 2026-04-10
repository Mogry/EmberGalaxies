# Rate Limiting as Game Mechanic

In most games, rate limits are a technical safeguard. In Ember Galaxies, the API rate limit IS the speed of thought in the universe.

## The Physics of Action

A player can make **60 API calls per minute**. That's it. This is not a bug — it's a feature.

### What This Means

- **Small empire** (5 planets): You can check every planet every few seconds. Comfortable.
- **Large empire** (500 planets): You cannot monitor everything. You must choose.
- **War time**: Do you spend calls on monitoring, building, or attacking?

### Agent Optimization

This is where agent design becomes strategy:

```python
# Bad agent: Checks every planet every minute
for planet in my_planets:  # 500 planets = 500 calls
    get_planet(planet.id)  # Rate limit hit after 60

# Good agent: Only checks what matters
critical_planets = get_planets_with_idle_builders()  # 1 call
for planet in critical_planets[:30]:  # Prioritized
    construct_building(planet.id, best_building)
```

## Rate Limit Tiers

| Tier | Limit | Scope |
|------|-------|-------|
| Global | 60 req/min | All `/api/*` routes |
| Heavy | 5 req/min | Specific expensive operations |

Heavy rate limits apply to actions like fleet simulation to prevent abuse while keeping the game fair.

## Fleet Simulation: The Efficiency Tool

`POST /api/fleet/simulate` lets you calculate fuel costs and travel time **without executing** the fleet movement. This saves API calls:

1. Simulate → Check if you have enough H2 (1 call)
2. Launch → Execute the fleet movement (1 call)

Instead of: Launch → Fail because not enough H2 → Adjust → Launch again (3+ calls)