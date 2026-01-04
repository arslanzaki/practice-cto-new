import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/auth.middleware';
import { TagService } from '../services/tag.service';
import { successResponse, errorResponse } from '../utils/response';
import type { JWTPayload } from '../types';

const tagService = new TagService();

export const tagController = new Elysia({ prefix: '/tags' })
  .use(authMiddleware)
  .get('/', async ({ set, ...context }) => {
    try {
      const user = (context as any).user as JWTPayload;
      const tags = await tagService.getUserTags(user.userId);
      return successResponse(tags);
    } catch (error) {
      set.status = 500;
      return errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch tags'
      );
    }
  })
  .post(
    '/',
    async ({ body, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
        const tag = await tagService.createTag(user.userId, body.name);
        set.status = 201;
        return successResponse(tag, 'Tag created successfully');
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to create tag'
        );
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 100 }),
      }),
    }
  )
  .get(
    '/:id',
    async ({ params, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
        const tag = await tagService.getTagById(user.userId, params.id);

        if (!tag) {
          set.status = 404;
          return errorResponse('Tag not found');
        }

        return successResponse(tag);
      } catch (error) {
        set.status = 500;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to fetch tag'
        );
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .put(
    '/:id',
    async ({ params, body, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
        const tag = await tagService.updateTag(
          user.userId,
          params.id,
          body.name
        );

        if (!tag) {
          set.status = 404;
          return errorResponse('Tag not found');
        }

        return successResponse(tag, 'Tag updated successfully');
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to update tag'
        );
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 100 }),
      }),
    }
  )
  .delete(
    '/:id',
    async ({ params, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
        const success = await tagService.deleteTag(user.userId, params.id);

        if (!success) {
          set.status = 404;
          return errorResponse('Tag not found');
        }

        return successResponse(null, 'Tag deleted successfully');
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to delete tag'
        );
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );