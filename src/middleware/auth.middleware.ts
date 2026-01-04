import { Elysia } from 'elysia';
import { bearer } from '@elysiajs/bearer';
import { supabase } from '../config/supabase';
import type { JWTPayload, SupabaseUser } from '../types';

export const authMiddleware = new Elysia()
  .use(bearer())
  .derive(async ({ bearer, set }) => {
    if (!bearer) {
      set.status = 401;
      throw new Error('Unauthorized - No token provided');
    }

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(bearer);

    if (error || !user) {
      set.status = 401;
      throw new Error('Unauthorized - Invalid token');
    }

    const jwtPayload: JWTPayload = {
      userId: user.id,
      email: user.email!,
      username: user.user_metadata?.username || user.email!.split('@')[0],
      sub: user.id,
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      iat: Math.floor(Date.now() / 1000),
    };

    return {
      user: jwtPayload,
      supabaseUser: user,
    };
  });
