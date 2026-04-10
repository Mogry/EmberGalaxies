# Research API

Manage technology research for a player.

## Get Player Research

Returns all research entries for a player.

```
GET /api/research/player/:playerId
```

**Response:**
```json
[
  {
    "id": "clx...",
    "type": "drive_ion",
    "level": 2,
    "isResearching": false,
    "researchFinishAt": null
  },
  {
    "id": "clx...",
    "type": "drive_hyper",
    "level": 0,
    "isResearching": true,
    "researchFinishAt": "2026-04-10T16:00:00Z"
  }
]
```

## Start Research

Begins researching a technology.

```
POST /api/research/start
```

**Body:**
```json
{
  "playerId": "clx...",
  "researchType": "drive_ion"
}
```

**Rules:**
- Only one research can be active at a time
- Research time scales quadratically: `(level + 1)² × 120s` (2x building time)
- If the research type doesn't exist yet, it's created at level 0 and upgraded to 1

**Research Types:**
| Type | Unlocks |
|------|---------|
| `drive_ion` | Ion drive (2.5x intra-system speed) |
| `drive_hyper` | Hyper drive (3x system speed) |
| `drive_nexus` | Nexus drive (3x system speed, lower H2) |
| `drive_interdim` | Interdimensional drive (inter-galaxy travel) |

**Response:** Updated research entry.