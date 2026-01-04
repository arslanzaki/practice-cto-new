import { Elysia, t } from 'elysia';
import { supabase } from '../config/supabase';
import { UserService } from '../services/user.service';
import { successResponse, errorResponse } from '../utils/response';
import type { SupabaseAuthResponse } from '../types';

const userService = new UserService();

export const authController = new Elysia({ prefix: '/auth' })
  .post(
    '/register',
    async ({ body, set }) => {
      try {
        const { email, username, password } = body;

        // Register user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });

        if (error) {
          set.status = 400;
          return errorResponse(
            error.message || 'Registration failed'
          );
        }

        if (!data.user || !data.session) {
          set.status = 400;
          return errorResponse('Registration failed - no user data returned');
        }

        // Create user profile in our database
        await userService.createUserProfile({
          id: data.user.id,
          email: data.user.email!,
          username: username,
        });

        return successResponse(
          {
            user: {
              id: data.user.id,
              email: data.user.email!,
              username: username,
              created_at: new Date(data.user.created_at),
              updated_at: new Date(),
            },
            token: data.session.access_token,
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
    async ({ body, set }) => {
      try {
        const { email, password } = body;

        // Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          set.status = 401;
          return errorResponse(
            error.message || 'Invalid email or password'
          );
        }

        if (!data.user || !data.session) {
          set.status = 401;
          return errorResponse('Login failed - no user data returned');
        }

        // Get or create user profile
        const user = await userService.getUserById(data.user.id);
        
        if (!user) {
          // Create profile if it doesn't exist
          await userService.createUserProfile({
            id: data.user.id,
            email: data.user.email!,
            username: data.user.user_metadata?.username || data.user.email!.split('@')[0],
          });
        }

        return successResponse(
          {
            user: {
              id: data.user.id,
              email: data.user.email!,
              username: data.user.user_metadata?.username || data.user.email!.split('@')[0],
              created_at: new Date(data.user.created_at),
              updated_at: new Date(),
            },
            token: data.session.access_token,
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
  )
  .post(
    '/logout',
    async ({ set }) => {
      try {
        const { error } = await supabase.auth.signOut();

        if (error) {
          set.status = 400;
          return errorResponse(error.message);
        }

        return successResponse(null, 'Logout successful');
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Logout failed'
        );
      }
    }
  );
