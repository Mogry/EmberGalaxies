import { Hono } from 'hono';
import { prisma } from '../db/client';

export const adminRoutes = new Hono();

// GET /api/admin/stats — Dashboard KPIs
adminRoutes.get('/stats', async (c) => {
  const [
    totalPlayers,
    totalPlanets,
    occupiedPlanets,
    activeFleets,
    combatsToday,
  ] = await Promise.all([
    prisma.player.count(),
    prisma.planet.count(),
    prisma.planet.count({ where: { ownerId: { not: null } } }),
    prisma.fleet.count({ where: { returnsAt: { gt: new Date() } } }),
    prisma.gameEvent.count({
      where: {
        type: 'combat_report',
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  return c.json({
    totalPlayers,
    totalPlanets,
    occupiedPlanets,
    activeFleets,
    combatsToday,
  });
});

// GET /api/admin/players — All players with summary
adminRoutes.get('/players', async (c) => {
  const players = await prisma.player.findMany({
    select: {
      id: true,
      name: true,
      isBot: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { planets: true, fleets: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const result = players.map((p) => ({
    id: p.id,
    name: p.name,
    isBot: p.isBot,
    createdAt: p.createdAt,
    lastActive: p.updatedAt,
    planetCount: p._count.planets,
    fleetCount: p._count.fleets,
  }));

  return c.json(result);
});

// GET /api/admin/players/:id — Player detail
adminRoutes.get('/players/:id', async (c) => {
  const { id } = c.req.param();

  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      planets: {
        include: {
          system: { include: { star: true } },
          buildings: true,
          planetShips: true,
        },
      },
      fleets: {
        include: { ships: true, originPlanet: true, targetPlanet: true },
      },
      research: true,
    },
  });

  if (!player) {
    return c.json({ error: 'Player not found' }, 404);
  }

  // Attach galaxyIndex to each planet
  const galaxyIds = [...new Set(player.planets.map((p) => p.system.galaxyId))];
  const galaxyMap = new Map(
    (await prisma.galaxy.findMany({ where: { id: { in: galaxyIds } }, select: { id: true, index: true } }))
      .map((g) => [g.id, g.index]),
  );
  const planetsWithGalaxy = player.planets.map((p) => {
    const galaxyIndex = galaxyMap.get(p.system.galaxyId) ?? 0;
    return { ...p, system: { ...p.system, galaxyIndex } };
  });

  return c.json({ ...player, planets: planetsWithGalaxy });
});

// GET /api/admin/events — Event feed with filters
adminRoutes.get('/events', async (c) => {
  const type = c.req.query('type') as string | undefined;
  const playerId = c.req.query('playerId') as string | undefined;
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50'), 200);
  const cursor = c.req.query('cursor') as string | undefined;

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (playerId) where.playerId = playerId;
  if (cursor) where.id = { lt: cursor };

  const events = await prisma.gameEvent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { player: { select: { id: true, name: true } } },
  });

  const nextCursor = events.length === limit ? events[events.length - 1].id : null;

  return c.json({ events, nextCursor });
});

// GET /api/admin/galaxies — All galaxies overview (bulk, for map page)
adminRoutes.get('/galaxies', async (c) => {
  // Single raw query — galaxies with system + planet counts
  const rows = await prisma.$queryRaw<
    { id: string; index: number; name: string; systemCount: bigint; totalPlanets: bigint; occupiedPlanets: bigint }[]
  >`
    SELECT g.id, g.index, g.name,
           COUNT(DISTINCT s.id) AS "systemCount",
           COUNT(p.id) AS "totalPlanets",
           COUNT(p."ownerId") AS "occupiedPlanets"
    FROM "Galaxy" g
    JOIN "System" s ON s."galaxyId" = g.id
    JOIN "Planet" p ON p."systemId" = s.id
    GROUP BY g.id, g.index, g.name
    ORDER BY g.index
  `;

  // Owners per galaxy (only occupied — tiny set)
  const ownerRows = await prisma.$queryRaw<
    { galaxyId: string; ownerId: string }[]
  >`
    SELECT DISTINCT s."galaxyId", p."ownerId"
    FROM "System" s
    JOIN "Planet" p ON p."systemId" = s.id AND p."ownerId" IS NOT NULL
  `;
  const ownersByGalaxy = new Map<string, string[]>();
  for (const row of ownerRows) {
    const arr = ownersByGalaxy.get(row.galaxyId) ?? [];
    arr.push(row.ownerId);
    ownersByGalaxy.set(row.galaxyId, arr);
  }

  const allOwnerIds = [...new Set(ownerRows.map((r) => r.ownerId))].filter(Boolean) as string[];
  const ownerRecords = allOwnerIds.length > 0
    ? await prisma.player.findMany({
        where: { id: { in: allOwnerIds } },
        select: { id: true, name: true },
      })
    : [];
  const ownerMap = new Map(ownerRecords.map((o) => [o.id, o]));

  const result = rows.map((g) => {
    const galaxyKey = String(g.id);
    const galaxyOwnerIds = ownersByGalaxy.get(galaxyKey) ?? [];
    const uniqueOwners = galaxyOwnerIds
      .map((id) => ownerMap.get(id))
      .filter((o): o is { id: string; name: string } => o !== undefined && o !== null);

    return {
      index: g.index,
      name: g.name,
      systemCount: Number(g.systemCount),
      totalPlanets: Number(g.totalPlanets),
      occupiedPlanets: Number(g.occupiedPlanets),
      owners: uniqueOwners,
    };
  });

  return c.json(result);
});

// GET /api/admin/galaxy/:id — Galaxy overview with occupancy
adminRoutes.get('/galaxy/:id', async (c) => {
  const galaxyIndex = parseInt(c.req.param('id'));

  const galaxy = await prisma.galaxy.findFirst({
    where: { index: galaxyIndex },
  });

  if (!galaxy) {
    return c.json({ error: 'Galaxy not found' }, 404);
  }

  // Aggregate planet stats per system via raw SQL
  const systemStats = await prisma.$queryRaw<
    { systemId: string; systemIndex: number; planetCount: bigint; occupiedCount: bigint; ownerIds: string[] }[]
  >`
    SELECT
      s.id AS "systemId",
      s.index AS "systemIndex",
      COUNT(p.id) AS "planetCount",
      COUNT(p."ownerId") AS "occupiedCount",
      array_agg(DISTINCT p."ownerId") FILTER (WHERE p."ownerId" IS NOT NULL) AS "ownerIds"
    FROM "System" s
    JOIN "Planet" p ON p."systemId" = s.id
    WHERE s."galaxyId" = ${galaxy.id}
    GROUP BY s.id, s.index
    ORDER BY s.index
  `;

  const totalPlanets = systemStats.reduce((sum, s) => sum + Number(s.planetCount), 0);
  const occupiedPlanets = systemStats.reduce((sum, s) => sum + Number(s.occupiedCount), 0);

  // Fetch owner names
  const allOwnerIds = [...new Set(systemStats.flatMap((s) => s.ownerIds ?? []))];
  const owners = allOwnerIds.length > 0
    ? await prisma.player.findMany({
        where: { id: { in: allOwnerIds } },
        select: { id: true, name: true },
      })
    : [];
  const ownerMap = new Map(owners.map((o) => [o.id, o]));

  return c.json({
    index: galaxyIndex,
    name: galaxy.name,
    systemCount: systemStats.length,
    totalPlanets,
    occupiedPlanets,
    systems: systemStats.map((s) => {
      const sysOwners = (s.ownerIds ?? [])
        .filter(Boolean)
        .map((id) => ownerMap.get(id))
        .filter(Boolean) as { id: string; name: string }[];
      return {
        id: s.systemId,
        index: s.systemIndex,
        planetCount: Number(s.planetCount),
        occupiedCount: Number(s.occupiedCount),
        owners: [...new Map(sysOwners.map((o) => [o.id, o])).values()],
      };
    }),
  });
});

// GET /api/admin/system/:id — System detail
adminRoutes.get('/system/:id', async (c) => {
  const { id } = c.req.param();

  const system = await prisma.system.findUnique({
    where: { id },
    include: {
      star: true,
      planets: {
        include: { owner: { select: { id: true, name: true } } },
        orderBy: { slot: 'asc' },
      },
      galaxy: true,
    },
  });

  if (!system) {
    return c.json({ error: 'System not found' }, 404);
  }

  const galaxy = await prisma.galaxy.findUnique({ where: { id: system.galaxyId }, select: { index: true } });
  const galaxyIndex = galaxy?.index ?? 0;

  return c.json({ ...system, galaxyIndex });
});