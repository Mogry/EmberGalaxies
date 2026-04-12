import { Hono } from 'hono';
import { prisma } from '../db/client';

export const researchRoutes = new Hono();

// Get research for a player (PRIVATE — only owner can access)
researchRoutes.get('/player/:playerId', async (c) => {
  const { playerId } = c.req.param();
  const authPlayerId = c.get('playerId');

  if (authPlayerId !== playerId) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const research = await prisma.research.findMany({
    where: { playerId },
  });

  return c.json(research);
});

// Start research
researchRoutes.post('/start', async (c) => {
  const authPlayerId = c.get('playerId');
  const body = await c.req.json();
  const { researchType } = body;
  const playerId = authPlayerId;

  const existing = await prisma.research.findUnique({
    where: { playerId_type: { playerId, type: researchType } },
  });

  if (existing?.isResearching) {
    return c.json({ error: 'Research already in progress' }, 400);
  }

  const currentLevel = existing?.level || 0;
  const researchTimeSeconds = Math.pow(currentLevel + 1, 2) * 120; // 2x building time
  const finishAt = new Date(Date.now() + researchTimeSeconds * 1000);

  if (existing) {
    const updated = await prisma.research.update({
      where: { id: existing.id },
      data: {
        isResearching: true,
        researchFinishAt: finishAt,
      },
    });
    return c.json(updated);
  }

  const research = await prisma.research.create({
    data: {
      playerId,
      type: researchType,
      level: 0,
      isResearching: true,
      researchFinishAt: finishAt,
    },
  });

  return c.json(research, 201);
});