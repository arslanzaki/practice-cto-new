import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/auth.middleware';
import { SharingService } from '../services/sharing.service';
import { successResponse, errorResponse } from '../utils/response';
import type { JWTPayload } from '../types';

const sharingService = new SharingService();

export const sharingController = new Elysia({ prefix: '/sharing' })
  .use(authMiddleware)
  .post(
    '/notes/:noteId/share',
    async ({ params, body, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
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
    '/notes/:noteId/users/:userId',
    async ({ params, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
        await sharingService.revokeAccess(
          params.noteId,
          user.userId,
          params.userId
        );
        return successResponse(null, 'Access revoked successfully');
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to revoke access'
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
  .get('/shared-with-me', async ({ set, ...context }) => {
    try {
      const user = (context as any).user as JWTPayload;
      const shares = await sharingService.getNotesSharedWithMe(user.userId);
      return successResponse(shares);
    } catch (error) {
      set.status = 500;
      return errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch shared notes'
      );
    }
  })
  .get('/shared-by-me', async ({ set, ...context }) => {
    try {
      const user = (context as any).user as JWTPayload;
      const shares = await sharingService.getNotesSharedByMe(user.userId);
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
    async ({ params, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
        const shares = await sharingService.getNoteShares(
          params.noteId,
          user.userId
        );
        return successResponse(shares);
      } catch (error) {
        set.status = 500;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to fetch shares'
        );
      }
    },
    {
      params: t.Object({
        noteId: t.String(),
      }),
    }
  );