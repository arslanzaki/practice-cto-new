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

        if (!data.user) {
          set.status = 400;
          return errorResponse('Registration failed - no user data returned');
        }

        // Check if email confirmation is required
        if (!data.session) {
          // Email confirmation required
          return successResponse(
            {
              user: {
                id: data.user.id,
                email: data.user.email!,
                username: username,
                created_at: new Date(data.user.created_at),
                updated_at: new Date(),
              },
              requiresEmailConfirmation: true,
              message: 'Registration successful. Please check your email to verify your account.',
            },
            'Registration successful. Please check your email to verify your account.'
          );
        }

        // If we have a session, user is immediately authenticated
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
          // Handle specific error cases
          if (error.message.includes('Email not confirmed')) {
            set.status = 401;
            return errorResponse('Please verify your email address before logging in.');
          }
          
          set.status = 401;
          return errorResponse(
            error.message || 'Invalid email or password'
          );
        }

        if (!data.user || !data.session) {
          set.status = 401;
          return errorResponse('Login failed - no user data returned');
        }

        // Check if email is confirmed
        if (!data.user.email_confirmed_at) {
          set.status = 401;
          return errorResponse('Please verify your email address before logging in.');
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
  )
  .get(
    '/verify-email',
    async ({ query, set, request }) => {
      try {
        // Try to get access_token from query params first
        let { access_token } = query;

        // If not in query params, try to get it from URL fragment
        if (!access_token) {
          const url = new URL(request.url);
          const hash = url.hash.substring(1); // Remove the # character
          const hashParams = new URLSearchParams(hash);
          access_token = hashParams.get('access_token');
        }

        if (!access_token) {
          set.status = 400;
          return errorResponse('No verification token found');
        }

        // Validate the token and get user info
        const { data: { user }, error } = await supabase.auth.getUser(access_token as string);

        if (error || !user) {
          set.status = 400;
          return errorResponse('Invalid or expired verification token');
        }

        // Check if this user has email verification
        if (!user.email_confirmed_at) {
          set.status = 400;
          return errorResponse('Email not verified yet');
        }

        // Create user profile in our database
        const username = user.user_metadata?.username || user.email!.split('@')[0];
        await userService.createUserProfile({
          id: user.id,
          email: user.email!,
          username: username,
        });

        return successResponse(
          {
            user: {
              id: user.id,
              email: user.email!,
              username: username,
              created_at: new Date(user.created_at),
              updated_at: new Date(),
            },
            token: access_token,
            verified: true,
          },
          'Email verified successfully'
        );
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Email verification failed'
        );
      }
    }
  )
  .post(
    '/resend-confirmation',
    async ({ body, set }) => {
      try {
        const { email } = body;

        if (!email) {
          set.status = 400;
          return errorResponse('Email is required');
        }

        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email,
        });

        if (error) {
          set.status = 400;
          return errorResponse(error.message);
        }

        return successResponse(
          null,
          'Confirmation email sent. Please check your inbox.'
        );
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to resend confirmation'
        );
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
      }),
    }
  );