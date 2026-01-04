import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/auth.middleware';
import { TagService } from '../services/tag.service';
import { successResponse, errorResponse } from '../utils/response';

const tagService = new TagService();

export const tagController = new Elysia({ prefix: '/tags' })
  .use(authMiddleware)
  .get('/', async ({ user, set }) => {
    try {
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
    async ({ body, user, set }) => {
      try {
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
    async ({ params, user, set }) => {
      try {
        const tag = await tagService.getTagById(params.id, user.userId);

        if (!tag) {
          set.status = 404;
          return errorResponse('Tag not found');
        }

        const noteCount = await tagService.getTagNoteCount(
          params.id,
          user.userId
        );

        return successResponse({
          ...tag,
          noteCount,
        });
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
  .delete(
    '/:id',
    async ({ params, user, set }) => {
      try {
        await tagService.deleteTag(params.id, user.userId);
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
