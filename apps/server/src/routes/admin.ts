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
  const galaxies = await prisma.galaxy.findMany({ orderBy: { createdAt: 'asc' } });
  const planetsWithGalaxy = player.planets.map((p) => {
    const galaxyIndex = galaxies.findIndex((g) => g.id === p.system.galaxyId) + 1;
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
  const galaxies = await prisma.galaxy.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      systems: {
        include: {
          planets: {
            include: { owner: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });

  const result = galaxies.map((g, i) => {
    const totalPlanets = g.systems.reduce((sum, s) => sum + s.planets.length, 0);
    const occupiedPlanets = g.systems.reduce((sum, s) => sum + s.planets.filter((p) => p.ownerId).length, 0);
    const allOwners = g.systems.flatMap((s) => s.planets.filter((p) => p.owner).map((p) => p.owner!));
    const uniqueOwners = [...new Map(allOwners.map((o) => [o.id, o])).values()];

    return {
      index: i + 1,
      name: g.name,
      systemCount: g.systems.length,
      totalPlanets,
      occupiedPlanets,
      owners: uniqueOwners,
    };
  });

  return c.json(result);
});

// GET /api/admin/galaxy/:id — Galaxy overview with occupancy
adminRoutes.get('/galaxy/:id', async (c) => {
  const galaxyIndex = parseInt(c.req.param('id'));

  const galaxies = await prisma.galaxy.findMany({ orderBy: { createdAt: 'asc' } });
  const galaxy = galaxies[galaxyIndex - 1];

  if (!galaxy) {
    return c.json({ error: 'Galaxy not found' }, 404);
  }

  const systems = await prisma.system.findMany({
    where: { galaxyId: galaxy.id },
    include: {
      planets: {
        include: { owner: { select: { id: true, name: true } } },
      },
    },
    orderBy: { index: 'asc' },
  });

  const totalPlanets = systems.reduce((sum, s) => sum + s.planets.length, 0);
  const occupiedPlanets = systems.reduce(
    (sum, s) => sum + s.planets.filter((p) => p.ownerId).length,
    0
  );

  return c.json({
    index: galaxyIndex,
    name: galaxy.name,
    systemCount: systems.length,
    totalPlanets,
    occupiedPlanets,
    systems: systems.map((s) => ({
      id: s.id,
      index: s.index,
      planetCount: s.planets.length,
      occupiedCount: s.planets.filter((p) => p.ownerId).length,
      owners: [...new Set(s.planets.filter((p) => p.owner).map((p) => p.owner!))],
    })),
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

  const galaxies = await prisma.galaxy.findMany({ orderBy: { createdAt: 'asc' } });
  const galaxyIndex = galaxies.findIndex((g) => g.id === system.galaxyId) + 1;

  return c.json({ ...system, galaxyIndex });
});