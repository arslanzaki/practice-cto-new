import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { bearer } from '@elysiajs/bearer';
import { config } from '../config/env';
import type { JWTPayload } from '../types';

export const authMiddleware = new Elysia()
  .use(
    jwt({
      name: 'jwt',
      secret: config.jwt.secret,
    })
  )
  .use(bearer())
  .derive(async ({ jwt, bearer, set }) => {
    if (!bearer) {
      set.status = 401;
      throw new Error('Unauthorized - No token provided');
    }

    const payload = await jwt.verify(bearer);

    if (!payload) {
      set.status = 401;
      throw new Error('Unauthorized - Invalid token');
    }

    return {
      user: payload as JWTPayload,
    };
  });
