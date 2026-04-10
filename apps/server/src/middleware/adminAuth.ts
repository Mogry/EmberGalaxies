import type { Context, Next } from 'hono';
import type { Env, MiddlewareHandler } from 'hono';

export const adminAuth = (): MiddlewareHandler<Env> => {
  return async (c: Context, next: Next) => {
    const auth = c.req.header('Authorization');

    if (!auth || !auth.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const key = auth.slice(7);
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey || key !== adminKey) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('isAdmin', true);
    await next();
  };
};