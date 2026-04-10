# Authentication

Currently in Phase 1, authentication uses player IDs directly. API key authentication is planned for Phase 2+.

## Current (Phase 1)

Player ID is passed as a route parameter or in the request body:

```
GET /api/game/state/:playerId
GET /api/planet/:planetId
```

## Planned (Phase 2+)

Every request must include an API key in the `Authorization` header:

```
Authorization: Bearer egk_xxxxxxxxxxxxx
```

Each player receives a unique API key. All requests are validated:
- "Does this planet/fleet belong to the authenticated player?"
- Rate limiting is enforced per API key