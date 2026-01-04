import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/auth.middleware';
import { SharingService } from '../services/sharing.service';
import { successResponse, errorResponse } from '../utils/response';

const sharingService = new SharingService();

export const sharingController = new Elysia({ prefix: '/sharing' })
  .use(authMiddleware)
  .post(
    '/notes/:noteId/share',
    async ({ params, body, user, set }) => {
      try {
        const share = await sharingService.shareNote(
          params.noteId,
          user.userId,
          body
        );
        set.status = 201;
        return successResponse(share, 'Note shared successfully');
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to share note'
        );
      }
    },
    {
      params: t.Object({
        noteId: t.String(),
      }),
      body: t.Object({
        user_id: t.String(),
        permission: t.Union([t.Literal('read'), t.Literal('edit')]),
      }),
    }
  )
  .delete(
    '/notes/:noteId/share/:userId',
    async ({ params, user, set }) => {
      try {
        await sharingService.unshareNote(
          params.noteId,
          user.userId,
          params.userId
        );
        return successResponse(null, 'Note unshared successfully');
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to unshare note'
        );
      }
    },
    {
      params: t.Object({
        noteId: t.String(),
        userId: t.String(),
      }),
    }
  )
  .get('/shared-with-me', async ({ user, set }) => {
    try {
      const shares = await sharingService.getSharedWithMe(user.userId);
      return successResponse(shares);
    } catch (error) {
      set.status = 500;
      return errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch shared notes'
      );
    }
  })
  .get('/shared-by-me', async ({ user, set }) => {
    try {
      const shares = await sharingService.getSharedByMe(user.userId);
      return successResponse(shares);
    } catch (error) {
      set.status = 500;
      return errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch shared notes'
      );
    }
  })
  .get(
    '/notes/:noteId/shares',
    async ({ params, user, set }) => {
      try {
        const shares = await sharingService.getNoteShares(
          params.noteId,
          user.userId
        );
        return successResponse(shares);
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to fetch note shares'
        );
      }
    },
    {
      params: t.Object({
        noteId: t.String(),
      }),
    }
  );
