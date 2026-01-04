import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { UserService } from '../services/user.service';
import { successResponse, errorResponse } from '../utils/response';
import { config } from '../config/env';
import type { JWTPayload } from '../types';

const userService = new UserService();

export const authController = new Elysia({ prefix: '/auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: config.jwt.secret,
    })
  )
  .post(
    '/register',
    async ({ body, set, jwt }) => {
      try {
        const user = await userService.createUser(body);

        const token = await jwt.sign({
          userId: user.id,
          email: user.email,
          username: user.username,
        } as JWTPayload);

        return successResponse(
          {
            user,
            token,
          },
          'User registered successfully'
        );
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Registration failed'
        );
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        username: t.String({ minLength: 3, maxLength: 100 }),
        password: t.String({ minLength: 8 }),
      }),
    }
  )
  .post(
    '/login',
    async ({ body, set, jwt }) => {
      try {
        const user = await userService.authenticateUser(
          body.email,
          body.password
        );

        const token = await jwt.sign({
          userId: user.id,
          email: user.email,
          username: user.username,
        } as JWTPayload);

        return successResponse(
          {
            user,
            token,
          },
          'Login successful'
        );
      } catch (error) {
        set.status = 401;
        return errorResponse(
          error instanceof Error ? error.message : 'Login failed'
        );
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
      }),
    }
  );
